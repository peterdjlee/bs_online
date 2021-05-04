/*
    BS.js
    
    Class for storing/modifying data and emulating a game of BS
*/

const {shuffleAndDeal, getCardRank} = require("../utils/genCards");
const CPile = require("../utils/gameCPile");
const PQueue = require("../utils/gamePQueue");
const WQueue = require("../utils/gameWQueue");

class BS {

    /**
     * Create a BS game with the given parameters
     * @param {array[string]} player_SIDs   socket id of all players in this game       
     * @param {array[string]} player_names  nickname of all players in this game
     * @param {object} settings             key and value of various configs for variants
     */
    constructor(player_SIDs, player_names, settings) {

        // Game Configs
        this.num_winners = settings.num_winners ? settings.num_winners: 1;
        this.num_decks = settings.num_decks ? settings.num_decks: 1;

        // Players Info
        this.player_SIDs = player_SIDs;
        this.player_names = player_names;
        this.player_hands = shuffleAndDeal(this.player_SIDs.length, this.num_decks);
        this.SID_to_position = new Map();

        // Game Data (Data management)
        this.center = new CPile();
        this.p_queue = new PQueue(player_SIDs.length);
        this.win_queue = new WQueue();
        this.game_ended = false;
        this.operation_num = 0;

        // Game Data (Current turn info)
        this.turn_count = 1;
        this.cur_turn_pos = this.p_queue.next();
        this.cur_turn_exp_rank = 0;
        this.cur_turn_bs_called = false;  // Only 1 BS can be called per turn

        // Fill map for quick retrieval of positions
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


    /**
     * Checks if the number of winners are sufficient and return winner data
     * @returns {
     *              passed: boolean
     *              data: [{nickname: string, position: int}]
     *          }
     *              passed is true => game should be stopped and winners declared
     *              data contains an array of all winners in the game
     */
    declareWinner() {

        // If number of winners is sufficient
        const cur_num_winners = this.win_queue.getWinnersCount();
        if (cur_num_winners >= this.num_winners) {
            this.game_ended = true;
            this.cur_turn_pos = -1;
            return this.retSuccess(
                this.win_queue.getWinners().map(pos => { 
                    return {
                        nickname: this.player_names[pos], 
                        position: pos
                    }
                })
            );
        }

        return this.retError();
    }

    /**
     * When players DC check if the number of players left will force game to end
     * @returns same as declareWinners() returns
     */
    declareWinnerDC() {
        
        // Function is called when each player DCs. Prevent multiple declarations of winners.
        if (this.game_ended)
            return this.retError();

        // If number of players left combined with winners is enough to end game
        const cur_num_winners = this.win_queue.getWinnersCount();
        const cur_num_players = this.p_queue.getCount();
        if (cur_num_players + cur_num_winners === this.num_winners) {

            this.cur_turn_pos = -1;
            this.game_ended = true;

            // Fast track all players through winning process
            for (let i = 0, new_pos = -1; i < cur_num_players; i+=1) {
                new_pos = this.p_queue.next();
                this.win_queue.push(new_pos);
                const pos_winner = this.win_queue.pop();
                this.p_queue.remove(pos_winner);
            }

            // Return list of winners with new fast tracked winners
            return this.retSuccess(
                this.win_queue.getWinners().map(pos => { 
                    return {
                        nickname: this.player_names[pos], 
                        position: pos
                    }
                })
            );
        }

        return this.retError();
    }

    // ------------------ Player Functions ---------------------
    //  The following functions are all used by players to perform certain actions
    //  Security checks will be performed before allowing modification

    /**
     * Player plays card(s) from their hand
     * @param {string} SID          socket id of player that's playing the card
     * @param {array[int]} cards    array of cards to play
     * @returns {
     *              passed: boolean,
     *              data: {
     *                  count: int, 
     *                  pos: int, 
     *                  nickname: string, 
     *              }
     *          }
     *          passed gives status of operation
     *          data provides context of player and cards played
     */
    playCards(SID, cards, op_num) {

        // Security Checks
        const pos = this.SID_to_position.get(SID);
        if (this.cur_turn_pos !== pos)
            return this.retError("Cards played during another player's turn");
        
        for (let i = 0; i < cards.length; i+=1) {
            if (!this.player_hands[pos].includes(cards[i]))
                return this.retError("A card not owned by the player is played (1r2q)");
        }

        if (op_num !== this.operation_num)
            return this.retError("Local information is outdated and action cannot be processed (qefw)");
        this.operation_num += 1;

        // Apply logic for when a player plays a card
        this.playerRemoveCards(pos, cards);
        this.center.push(pos, cards, this.cur_turn_exp_rank);
        this.nextTurn();

        // Player is set up for victory
        if (this.player_hands[pos].length === 0)
            this.win_queue.push(pos);

        return this.retSuccess({
            count: this.player_hands[pos].length, 
            pos: pos, 
            nickname: this.player_names[pos]
        });
    }


    /**
     * Player calls BS
     * @param {string} source_SID   socket id of player that called BS
     * @param {int} op_num          op_num to prevent call made with outdated info 
     * @returns {passed: boolean, data: (check below)}        
     *                              passed tells whether BS call was successful
     *                              data returns extra info on the context of the call             
     */
    callBS(source_SID, op_num) {

        // Security checks
        if (this.cur_turn_bs_called)
            return this.retError("BS has already been called this turn");
        this.cur_turn_bs_called = true;

        const pos = this.player_SIDs.indexOf(source_SID);
        if (pos === -1)
            return this.retError("Permission error (S3R5)");

        if (op_num !== this.operation_num)
            return this.retError("Local information is outdated and action cannot be processed (qefw)");
        this.operation_num += 1;

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

    // If any of the cards played doesn't match expected rank
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


    // -------------- Game Management Functions --------------

    nextTurn() {
        this.turn_count += 1;
        this.cur_turn_pos = this.p_queue.next();
        this.cur_turn_exp_rank = (this.cur_turn_exp_rank + 1) % 13;
        this.cur_turn_bs_called = false;

        const pos_winner = this.win_queue.pop();
        if (pos_winner !== -1)
            this.p_queue.remove(pos_winner);
    }

    // Remove the player from the game and its logic
    //  Returns name for server messaging purposes
    removePlayer(SID) {
        const pos = this.SID_to_position.get(SID);
        if (pos === -1)
            return this.retError();
        if (this.cur_turn_pos == pos)
            this.nextTurn();
        this.p_queue.remove(pos);

        return this.retSuccess(this.player_names[pos]);
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