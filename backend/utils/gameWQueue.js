/*
    gameWQueue.js

    Class to handle declaring winners
 */


/*
    Actually basically a queue
*/
class WQueue {

    constructor() {
        this.win_queue = [];
        this.winners = [];
    }

    push(pos) {
        this.win_queue.push(pos);
    }

    // If a winner exists, record them.
    // Return number of winners for calculating
    popAndGet() {
        if (this.win_queue.length === 0)
            return -1;
        const new_winner = this.win_queue[0];
        this.winners.push(this.win_queue[0]);
        this.win_queue.splice(0, 1);
        return new_winner;
    }

    // Remove a player if they BSed on their winning turn and got caught
    remove(pos) {
        const pos_in_queue = this.win_queue.indexOf(pos);
        if (pos_in_queue === -1)
            return;
        this.win_queue.splice(pos_in_queue, 1);
    }

    getWinners() {
        return this.winners;
    }

    getWinnersCount() {
        return this.winners.length;
    }
};

module.exports = WQueue;