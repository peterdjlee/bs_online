/*
    BS.js
    Class for storing/modifying data and emulating a game of BS
*/

const {newShuffledDeck, shuffleAndDeal, getCardStats} = require("../utils/genCards");
const CPile = require("../utils/gameCPile");
const PQueue = require("../utils/gamePQueue")

class BS {

    /**
     * Create a game of BS with given parameters
     * @param {string} lobby_code           Code of the lobby that requested a BS game
     * @param {array[string]} player_SIDs   Array of socket ids of each player
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


    getPlayerHand(SID) {
        return this.player_hands[this.SID_to_position.get(SID)];
    }


    getAllHandSize() {
        var HandSizes = [];

        for(let i = 0; i < this.player_hands.length; i++){
            HandSizes.push({
                nickname: this.player_names[i],
                position: i,
                count: this.player_hands[i].length
            });
        }

        return HandSizes;
    }


    getHandSize(SID) {
        const pos = this.SID_to_position.get(SID);

        return {
            nickname: this.player_names[pos],
            position: i,
            count: this.player_hands[pos].length
        };
    }


    addPlayerHand(SID, cards) {
        const pos = this.SID_to_positions.get(SID);
        cards.forEach(card => {
            this.player_hands[pos].push(card);
        });
    }

    removePlayer(SID) {
        const pos = this.SID_to_position.get(SID);
        if (this.cur_turn_pos == pos)
            this.nextTurn();
        this.p_queue.remove(pos);
    }

    // Play card function
    playCards(SID, cards) {
        const pos = this.SID_to_position.get(SID);

        // Security Check (Make sure player is allowed to play card)
        if (!this.cur_turn_pos === pos)
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

        return this.retSuccess({change: cards.length * -1, pos: pos, nickname: this.player_names[pos]});
    }


    // Next turn
    getTurn() {
        return {pos: this.cur_turn_pos, 
                exp_rank: this.cur_turn_exp_rank, 
                exp_name: this.player_names[this.cur_turn_pos],
                turn: this.turn_count
        };
    }


    nextTurn() {
        this.turn_count += 1;
        this.cur_turn_player = this.p_queue.next();
        this.cur_turn_exp_rank = (this.cur_turn_exp_rank + 1) % 13;
    }
    
    // Central pile functions
    cPileSize() {
        return this.center.size();
    }

    cPileAdd(SID, cards) {
        const pos = this.SID_to_position.get(SID);
        this.center.push(pos, cards);
    }

    cPileGetPrev() {
        return this.center.top();
    }

    cPileCollect() {
        return this.center.popAll();
    }


    // Return helpers to format function return statuses and provide info if error
    retSuccess(data={}, msg='') {
        return {passed: true, data: data, msg: msg}
    };

    retError(error_desc) {
        return {passed: false, msg: error_desc, data: {}};
    };

};

module.exports = BS;