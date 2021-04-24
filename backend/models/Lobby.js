/*
    Lobby.js

    Class object for simulating a lobby that players can join/leave
*/

/**
 * Common return values
 * @returns {passed: boolean, msg: string, data: ChangeList} - 
 *          *passed provides info on whether operation was successful
 *          *msg provides info on what happened if operation was not successful
 *          *data generally provides an object made up of 3 arrays 
 *              that instruct whether to add/remove/edit a player
 *              The instruction type depends on the operation
 */

class Lobby {

    /**
     * Create a lobby object with given parameters
     * @param {int} max_players     maximum number of players allowed
     * @param {boolean} dup_names   if duplicate names are allowed
     */
    constructor(max_players=6, dup_names=false) {

        // Lobby settings
        this.max_players = max_players;
        this.dup_names = dup_names;

        // Lobby Variables
        this.auto_inc = 0;
        this.game_started = false;

        // Arrays with primitive values have really fast native functions. idk why.
        this.p_name = [];
        this.p_lid = [];
        this.p_sid = [];      
        this.p_active = [];
        this.p_tags = [];
    }


    // Give enough info to display list of players
    toDisplay() {
        return {
            player_names: this.p_name,
            player_LIDs: this.p_lid,
            player_active: this.p_active
        };
    };


    // For returning the old name of a player in case of change name error
    getCurrentName(socket_id) {
        return this.p_name[this.p_sid.indexOf(socket_id)];
    }


    // Give enough info to create a game object using existing player list
    toGame() {
        return {
            player_names: this.p_name,
            player_SIDs: this.p_sid,
        }
    }


    isStarted() {
        return this.game_started;
    };


    full() {
        return this.max_players <= this.p_active.length;
    }

    count() {
        return this.p_active.length;
    }


    /**
     * Adds a player to the specified lobby
     * @param {string} socket_id    ID of the player's socket connection
     * @param {string} nickname     Nickname for the player (Optional)
     * @returns {passed: boolean, msg: string, data: ChangeList}
     */
    addPlayer(socket_id, nickname) {
        
        // Check if lobby full
        if (this.p_name.length >= this.max_players)
            return this.retError("Lobby has reached maximum capacity");
        
        // Check if duplicate names are allowed
        if (!this.dup_names && this.p_name.includes(nickname))
            return this.retError("Lobby contains a player with the same name");

        // Check if game has already started
        if (this.game_started)
            return this.retError("Lobby game has already started")

        // Add player with a unique local ID
        this.p_name.push(nickname);
        this.p_lid.push(this.auto_inc);
        this.p_sid.push(socket_id);
        this.p_active.push(true);
        this.p_tags.push([]);
        this.auto_inc += 1;

        return this.retSuccess({
            add: [
                {
                    local_id: this.auto_inc - 1,
                    nickname: nickname,
                    active: true
                }
            ],
            remove: [],
            edit: []
        });
    };


    /**
     * Removes a player from the specified lobby
     * @param {string} socket_id    ID of the player's socket connection
     * @returns {passed: boolean, msg: string, data: ChangeList}
     */
    removePlayerDC(local_id) {
        const index = this.p_lid.indexOf(local_id);
        if (index === -1)
            return this.retError();

        this.p_name.splice(index, 1);
        this.p_lid.splice(index, 1);   
        this.p_sid.splice(index, 1);
        this.p_active.splice(index, 1);
        this.p_tags.splice(index, 1);

        return this.retSuccess({
            add: [],
            remove: [local_id],
            edit: []
        });
    }


    /**
     * Disables a player when they DC during the middle of a game
     * @param {string} socket_id    ID of the player's socket connection
     * @returns {passed: boolean, msg: string, data: ChangeList}
     */
    disablePlayer(local_id) {
        const index = this.p_lid.indexOf(local_id);
        if (index === -1)
            return this.retError();
        
        this.p_active[index] = false;

        return this.retSuccess({
            add: [],
            remove: [],
            edit: [
                {
                    local_id: local_id, 
                    nickname: this.p_name[index], 
                    active: this.p_active[index]
                }
            ]
        });
    }


    /**
     * Sets the specified player's nickname
     * @param {string} socket_id   socket id of player
     * @param {string} nickname    new nickname to set player to
     * @returns {passed: boolean, msg: string, data: ChangeList}
     */
    setPlayerName(socket_id, nickname) {

        // Check if duplicate names are allowed
        if (!this.dup_names && this.p_name.includes(nickname))
            return this.retError("Lobby contains a player with the same name", {old_name: this.getCurrentName(socket_id)});

        // Get and check if player exists
        const index = this.p_sid.indexOf(socket_id);
        if (index == -1)
            return this.retError("Player does not exist / Permission error (edbs)");

        this.p_name[index] = nickname;
        return this.retSuccess({
            add: [],
            remove: [],
            edit: [
                {
                    local_id: this.p_lid[index], 
                    nickname: nickname, 
                    active: this.p_active[index]
                }
            ]
        });
    };


    // Game ends and all DCed players must be removed
    purge() {
        const purged_ids = [];

        for (let i = this.p_active.length - 1; i >= 0; i-=1) {
            if (!this.p_active[i]) {
                purged_ids.push(this.p_lid[i]);
                this.p_name.splice(i, 1);
                this.p_lid.splice(i, 1);   
                this.p_sid.splice(i, 1);
                this.p_active.splice(i, 1);
                this.p_tags.splice(i, 1);
            }
        }

        return purged_ids;
    }


    /**
     * Sets the game state of the lobby to started
     * @param {string} source_SID   the socket_id of the player that requested for lobby to start
     * @returns {passed: bool, data: n/a, msg: string} whether the operation was 
     *                                                 successful (passed), and 
     *                                                 the error message (msg) if not                    
     */
    start(source_SID) {
        // Started lobbies cannot be started again
        if (this.game_started)
            return this.retError("Game already started");

        // Security check (MODIFY IF )
        if (!this.p_sid.includes(source_SID))
            return this.retError("Permission error");

        this.game_started = true;
        return this.retSuccess();
    };


    /**
     * Resets the lobby's game state to not started
     * @param {string} source_SID   the socket_id of the player that requested for lobby to start
     * @returns {passed: bool, data: n/a, msg: string} whether the operation was 
     *                                                 successful (passed), and 
     *                                                 the error message (msg) if not                    
     */
    stop(source_SID) {
        // Started lobbies cannot be started again
        if (!this.game_started)
            return this.retError("Game hasn't started");

        // Security check
        if (!this.p_sid.includes(source_SID))
            return this.retError("Permission error");

        // Remove all disabled players and reset lobby state
        this.game_started = false;

        return this.retSuccess({
            add: [],
            remove: this.purge(),
            edit: []
        });
    };


    // ------------------------------ Return Helpers ------------------------------

    retSuccess(data={}, msg='') {
        return {passed: true, data: data, msg: msg}
    };


    retError(error_desc, data={}) {
        return {passed: false, msg: error_desc, data: data};
    };


    // Testing return function
    get() {
        return {
            lobby_code: this.code,
            auto_inc: this.auto_inc = 0,
            max_players:this.max_players,
            dup_names: this.dup_names,
            LIDs: this.p_lid
        };
    }
}

module.exports = Lobby;