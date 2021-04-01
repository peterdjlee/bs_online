/**
 * gamePQueue.js
 * 
 * Meant to use to simulate player turns.
 */

/**
 * Basically a queue that wraps around
 */
class PQueue {

    constructor(num_players) {
        const initial_node = new PQueueNode(0)

        // Create queue of length @num_players
        this.cur_node = initial_node;
        for (let i = 1; i < num_players; i += 1) {
            this.cur_node.setNext(new PQueueNode(i));
            this.cur_node = this.cur_node.getNext();
        }

        // Wrap back (No need to reset due to the class logic)
        this.cur_node.setNext(initial_node);

        // Other info
        this.count = num_players;
    }

    
    /**
     * Pushes next player pos to front and returns their position
     *  Since this.cur_node is initially at end, the first call of this
     *  function will return the first player pos queued
     *  *Error if 0 players, but check costs performance
     * @returns 
     */
    next() {
        this.cur_node = this.cur_node.getNext();
        return this.cur_node.getPos();
    }


    /**
     * Removes a player pos from queue
     * @param {int} pos 
     */
    remove(pos) {
        
        // Cycle through queue and find player
        var rm_cur_node = this.cur_node;
        for (let i = 0; i < this.count; i +=1) {
            const rm_past_node = rm_cur_node;
            rm_cur_node = rm_cur_node.getNext();

            // If node is found, patch the queue up to not reference current node
            if (rm_cur_node.getPos() === pos) {
                rm_past_node.setNext(rm_cur_node.getNext());
                this.count -= 1;

                if (this.count === 0)
                    this.cur_node = null;

                return true;
            }
        }
        
        // node not found
        return false
    }
};



/**
 * Node for PQueue
 */
class PQueueNode {

    constructor(pos, next_node=null) {
        this.pos = pos;
        this.next = next_node;
    }

    getPos() {
        return this.pos;
    }

    setNext(next_node) {
        this.next = next_node;
    }

    getNext() {
        return this.next;
    }
};

module.exports = PQueue;