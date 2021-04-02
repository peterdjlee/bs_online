/*
    BS.js
    
    Class for storing/modifying data and emulating a game of BS
*/

const {newShuffledDeck, shuffleAndDeal, getCardStats} = require("../utils/genCards");
const CPile = require("../utils/gameCPile");
const PQueue = require("../utils/gamePQueue")

class BS {

    
    /**
     * Create a BS game with the given parameters
     * @param {string} lobby_code           The code of the lobby this game is attached to
     * @param {array[string]} player_SIDs   socket id of all players in this game       
     * @param {array[string]} player_names  nickname of all players in this game
     * @param {int} num_decks               number of deck of cards to distribute
     */
    constructor(lobby_code, player_SIDs, player_names, num_decks) {
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
        this.cur_turn_exp_rank = 1;

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


    // ------------------ Modifiers ---------------------

    /**
     * Add cards to a player's hand
     * @param {string} SID          socket id of player to add cards to
     * @param {array[int]} cards    array of cards to add to player
     */
    addPlayerHand(SID, cards) {
        const pos = this.SID_to_positions.get(SID);
        cards.forEach(card => this.player_hands[pos].push(card));
    }


    /**
     * Remove a player from the game logic
     * @param {string} SID  socket id of player to remove 
     */
    removePlayer(SID) {
        const pos = this.SID_to_position.get(SID);
        if (this.cur_turn_pos == pos)
            this.nextTurn();
        this.p_queue.remove(pos);
    }


    /**
     * Player plays card(s) from their hand
     * @param {string} SID          socket id of player that's playing the card
     * @param {array[int]} cards    array of cards to play
     * @returns 
     */
    playCards(SID, cards) {
        const pos = this.SID_to_position.get(SID);

        // Security Check (Make sure player is allowed to play card)
        if (this.cur_turn_pos !== pos)
            return this.retError("Cards played during another player's turn");

        // Security check (Make sure player has cards)
        for (let i = 0; i < cards.length; i+=1) {
            if (!this.player_hands[pos].includes(cards[i]))
                return this.retError("A card not owned by the player is played (1r2q)");
        }

        // Remove cards from player hand
        cards.forEach(card => {
            this.player_hands[pos].splice(this.player_hands[pos].indexOf(card), 1);
        });

        // Add to center pile and advance turn
        this.center.push(pos, cards);
        this.nextTurn();

        return this.retSuccess({
            count: this.player_hands[pos].length, 
            pos: pos, 
            nickname: this.player_names[pos]
        });
    }


    /**
     * Start the next turn
     */
    nextTurn() {
        this.turn_count += 1;
        this.cur_turn_pos = this.p_queue.next();
        this.cur_turn_exp_rank = (this.cur_turn_exp_rank + 1) % 13;
    }
    
    // ------- Central pile functions ------------------

    // Get size of central pile
    cPileSize() {
        return this.center.size();
    }

    /**
     * Add cards to central pile
     * @param {string} SID          socket id of player that's adding the cards
     * @param {array[int]} cards    array of cards to add
     */
    cPileAdd(SID, cards) {
        const pos = this.SID_to_position.get(SID);
        this.center.push(pos, cards);
    }


    /**
     * Get the previous addition to the center pile
     * @returns {pos: int, cards: array[int]}   pos of the player and cards played
     */
    cPileGetPrev() {
        return this.center.top();
    }


    /**
     * Empties the center pile and returns an array of all cards
     */
    cPileCollect() {
        return this.center.popAll();
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