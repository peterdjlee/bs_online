/*
    BS.js
    
    Class for storing/modifying data and emulating a game of BS
*/

const {newShuffledDeck, shuffleAndDeal, getCardStats, getCardRank} = require("../utils/genCards");
const CPile = require("../utils/gameCPile");
const PQueue = require("../utils/gamePQueue");
const WQueue = require("../utils/gameWQueue");

class BS {

    
    /**
     * Create a BS game with the given parameters
     * @param {string} lobby_code           The code of the lobby this game is attached to
     * @param {array[string]} player_SIDs   socket id of all players in this game       
     * @param {array[string]} player_names  nickname of all players in this game
     * @param {int} num_decks               number of deck of cards to distribute
     */
    constructor(lobby_code, player_SIDs, player_names, num_decks, num_winners=1) {
        this.code = lobby_code;

        // Players Info
        this.player_SIDs = player_SIDs;
        this.player_names = player_names;
        this.player_hands = shuffleAndDeal(this.player_SIDs.length, num_decks);
        this.SID_to_position = new Map();

        // Game Info
        this.center = new CPile();
        this.p_queue = new PQueue(player_SIDs.length);
        this.turn_count = 1;
        this.cur_turn_pos = this.p_queue.next();
        this.cur_turn_exp_rank = 0;
        this.operation_num = 0;
        this.bs_called = false;  // Only 1 BS can be called per turn
        this.num_winners = num_winners;
        this.win_queue = new WQueue();

        // Fill data
        for(let i = 0; i < player_SIDs.length; i++) {
            this.SID_to_position.set(player_SIDs[i], i);
        }
    }


    // -------------------- Get ------------------------

    /**
     * @param {string} SID      socket id of the player to get hand for 
     * @returns {array[int]}    an array containing all the cards in the player's hand
     */
    getPlayerHand(SID) {
        return this.player_hands[this.SID_to_position.get(SID)];
    }


    /**
     * @returns {array[]]}     an array containing hands of all players
     */
    getAllHandSize() {
        return this.player_hands.map((hand, i) => {
            return {nickname: this.player_names[i], position: i, count: hand.length}
        });
    }


    /**
     * returns turn information of the current turn
     */
     getTurn() {
        return {
            pos: this.cur_turn_pos,
            nickname:  this.player_names[this.cur_turn_pos],
            exp_rank: this.cur_turn_exp_rank, 
            turn: this.turn_count
        };
    }


    getOpNum() {
        return this.operation_num;
    }


    // ------------------ Player Functions ---------------------
    //  The following functions are all used by players to perform certain actions
    //  Security checks will be performed before allowing modification


    /**
     * Player plays card(s) from their hand
     * @param {string} SID          socket id of player that's playing the card
     * @param {array[int]} cards    array of cards to play
     * @returns {
     *              count: int, 
     *              pos: int, 
     *              nickname: string, 
     *              stop_game: {
     *                  passed: boolean, 
     *                  data = [{
     *                      nickname: string, 
     *                      pos: int
     *                  }]
     *              }
     *          }
     *     returns info for the player that just played the card (count(number of cards on hand), pos, nickname)
     *     stop_game.passed passed determines if there is winner
     *     if stop_game.passed is true, information for winners will be in stop_game.data
     */
    playCards(SID, cards, op_num) {
        const pos = this.SID_to_position.get(SID);

        // Security Checks
        if (this.cur_turn_pos !== pos)
            return this.retError("Cards played during another player's turn");
        for (let i = 0; i < cards.length; i+=1) {
            if (!this.player_hands[pos].includes(cards[i]))
                return this.retError("A card not owned by the player is played (1r2q)");
        }
        if (op_num !== this.operation_num) {
            if(op_num !== -1)
                return this.retError("Local information is outdated and action cannot be processed (qefw)");
        }
        this.operation_num += 1;

        // Apply logic for when a player plays a card
        this.playerRemoveCards(pos, cards);
        this.center.push(pos, cards, this.cur_turn_exp_rank);
        this.nextTurn();

        // See if the game should be stopped and winners declared
        const stop_game = this.declareWinner();

        // Player is set up for victory
        if (this.player_hands[pos].length === 0)
            this.win_queue.push(pos);

        return this.retSuccess({
            count: this.player_hands[pos].length, 
            pos: pos, 
            nickname: this.player_names[pos],
            stop_game: stop_game
        });
    }


    /**
     * Player calls BS
     * @param {string} source_SID   socket id of player that called BS
     * @param {int} op_num          op_num to prevent call made with outdated info 
     * @returns {passed: boolean, data: (check below)}        
     *                              passed gives info on result of BS call
     *                              data returns extra info on context of the call             
     */
    callBS(source_SID, op_num) {

        // Security checks
        if (this.bs_called)
            return this.retError("BS has already been called this turn");
        this.bs_called = true;
        if (op_num !== this.operation_num) {
            if(op_num !== -1)
                return this.retError("Local information is outdated and action cannot be processed (qefw)");
        }
        this.operation_num += 1;
        const pos = this.player_SIDs.indexOf(source_SID);
        if (pos === -1)
            return this.retError("Permission error (S3R5)");

        // Check if last play was BS
        const last_play = this.center.top();
        const was_bs = this.isPlayBS(last_play);

        // Apply the consequences
        const modified_hands = [];
        if (was_bs) {
            this.playerBSed(last_play.pos);
            modified_hands.push(this.player_SIDs[last_play.pos]);
            this.win_queue.remove(last_play.pos);
        }
        else {
            this.playerBSed(pos);
            modified_hands.push(this.player_SIDs[pos]);
        }
        
        // Return values that might be needed to display what happened during BS call
        return this.retSuccess({
            was_bs: was_bs, 
            modified_hands: modified_hands,
            caller_pos: pos, 
            caller_name: this.player_names[pos],
            callee_pos: last_play.pos,
            callee_name: this.player_names[last_play.pos]
        });
    }

    // ------- Central pile functions ------------------

    // Get size of central pile
    cPileSize() {
        return this.center.size();
    }


    /**
     * Get the previous addition to the center pile
     * @returns {pos: int, cards: array[int]}   pos of the player and cards played
     */
    cPileGetPrev() {
        return this.center.top();
    }


    // -------------- Function Helpers -----------------------

    playerAddCards(pos, cards) {
        this.player_hands[pos] = this.player_hands[pos].concat(cards);
    }

    playerRemoveCards(pos, cards) {
        this.player_hands[pos] = this.player_hands[pos].filter(card => !cards.includes(card));
    }

    isPlayBS(play) {
        for (let i = 0; i < play.cards.length; i+=1) {
            const rank = getCardRank(play.cards[i]);
            if (rank != play.exp_rank)
                return true;
        }
        return false;
    }

    // Apply consequences of BS call player @pos
    playerBSed(pos) {
        const cards = this.center.popAll();
        this.playerAddCards(pos, cards);
    }

    /**
     * If conditions for stopping game are met, return true with the relevenat info
     */
    declareWinner() {
        
        // Game is only stopped on turns with a new declared winner
        const new_winner = this.win_queue.popAndGet();
        if (new_winner == -1)
            return this.retError();


        // If number of winners is sufficient
        const cur_num_winners = this.win_queue.getWinnersCount();
        if (cur_num_winners >= this.num_winners) {
            return this.retSuccess(
                this.win_queue.getWinners().map(pos => { 
                    return {
                        nickname: this.player_names[pos], 
                        position: pos
                    }
                })
            );
        }

        // If only 1 player left => time to end game
        if (this.p_queue.getCount() === 1) {

            // No winners, default to last player winning (if all but 1 player DCs)
            if (cur_num_winners === 0) {
                const pos = this.p_queue.getCurrent();
                return this.retSuccess(
                    [{nickname: this.player_names[pos], position: pos}]
                );
            }

            // Last player left is the loser and everyone else won
            else {
                return this.retSuccess(
                    this.win_queue.getWinners().map(pos => { 
                        return {
                            nickname: this.player_names[pos], 
                            position: pos
                        }
                    })
                );
            }
        }

        this.p_queue.remove(new_winner);
        return this.retError();
    }


    // -------------- Game Management Functions --------------

    nextTurn() {
        this.turn_count += 1;
        this.cur_turn_pos = this.p_queue.next();
        this.cur_turn_exp_rank = (this.cur_turn_exp_rank + 1) % 13;
        this.bs_called = false;
    }


    /**
     * @param {string} SID  socket id of player to remove 
     */
    removePlayer(SID) {
        const pos = this.SID_to_position.get(SID);
        if (this.cur_turn_pos == pos)
            this.nextTurn();
        this.p_queue.remove(pos);
    }

    // -------------- Return Helpers -------------------------

    retSuccess(data={}, msg='') {
        return {passed: true, data: data, msg: msg}
    };

    retError(error_desc) {
        return {passed: false, msg: error_desc, data: {}};
    };

};

module.exports = BS;