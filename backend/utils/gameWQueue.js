/*
    gameWQueue.js

    Class to handle declaring winners
 */
class WQueue {

    constructor() {
        this.maybe_winners = [];
        this.winners = [];
    }

    push(pos) {
        this.maybe_winners.push(pos);
    }

    // If a player was not stopped by a bs call, lock them in as winner
    //  Return winner to remove them from play
    pop() {
        if (this.maybe_winners.length === 0)
            return -1;
        const new_winner = this.maybe_winners[0];
        this.winners.push(new_winner);
        this.maybe_winners.splice(0, 1);
        return new_winner;
    }

    // Remove a player if they BSed on their winning turn and got caught
    remove(pos) {
        const pos_in_queue = this.maybe_winners.indexOf(pos);
        if (pos_in_queue !== -1)
            this.maybe_winners.splice(pos_in_queue, 1);
    }

    getWinners() {
        return this.winners;
    }

    getWinnersCount() {
        return this.winners.length;
    }
};

module.exports = WQueue;