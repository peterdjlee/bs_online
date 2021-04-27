/*
    gameCPile.js

    Simulates a stack of cards for the center pile
    and keeps track of groups of card added
    at the same time
*/


class CPile {
    
    constructor() {

        // An initial card group is set in case BS is called on turn 1
        this.card_stack = [{pos: -1, cards: [], exp_rank: -1}];
        this.count = 0;
    }


    /**
     * Adds the cards to the center stack along with player info
     * @param {int} pos             position of the player in the game
     * @param {array[int]} cards    the value of cards to be added to center
     */
    push(pos, cards, exp_rank) {
        this.card_stack.push({pos: pos, cards: cards, exp_rank: exp_rank});
        this.count += cards.length;
    }

    
    /**
     * Removes all groups from the card stack and returns all the values of cards in the pile
     * @returns {array[int]}        value of all cards in the stack
     */
    popAll() {
        const all_cards = [];
        this.card_stack.forEach(group => 
            group.cards.forEach( val =>
                all_cards.push(val)
            )    
        );
        this.card_stack.length = 0;
        this.count = 0;
        return all_cards;
    }

    
    /**
     * @returns {int, array[int]} position of the player that played the last group
     *                             and values of all cards played
     */
    top() {
        return this.card_stack[this.card_stack.length - 1];
    }


    /**
     * @returns {int} card count of the center pile
     */
    size() {
        return this.count;
    }

}

module.exports = CPile;