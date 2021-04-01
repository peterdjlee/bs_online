/*
    Lobby.js
    class object for storing and modifying lobby objects
*/

class Lobby {

    /**
     * Create a lobby object with given parameters
     * @param {string} code         string identifier for this lobby
     * @param {int} max_players     maximum number of players allowed
     * @param {boolean} dup_names   if duplicate names are allowed
     */
    constructor(code, max_players=6, dup_names=false) {

        // Lobby settings
        this.max_players = max_players;
        this.dup_names = dup_names;

        // Lobby Variables
        this.code = code;
        this.auto_inc = 0;
        this.game_started = false;

        // player list arrays (Kept separate to use with built in functions)
        this.players_name = [];
        this.players_LID = [];
        this.players_SID = [];      
        this.players_active = [];
    }


    /**
     * Get info of current players in lobby
     * @returns object containing a parallel arrays of player nicknames and local ids
     */
    getPlayers() {
        return {
            player_names: this.players_name,
            player_LIDs: this.players_LID,
            player_active: this.players_active
        };
    };


    started() {
        return this.game_started;
    };


    getPlayerCount() {
        return this.players_LID.length;
    };


    /**
     * Get all socket info of players, meant for use by game object
     * @returns array of socket ids of the current players in the lobby
     */
    getPlayerSIDs() {
        return this.players_SID;
    }

    getPlayerNames() {
        return this.players_name;
    }

    maxSize() {
        return this.max_players;
    }


    /**
     * Add a player with the specified socket id and name to the lobby
     * @param {string} socket_id    id of socket connecting player
     * @param {string} nickname     nickname of player
     * @returns {int}               a local id to find player in lobby
     */
    addPlayer(socket_id, nickname) {
        
        // Check if lobby full
        if (this.players_name.length >= this.max_players)
            return this.retError("Lobby has reached maximum capacity");
        
        // Check if duplicate names are allowed
        if (!this.dup_names && this.players_name.includes(nickname))
            return this.retError("Lobby contains a player with the same name");

        // Check if game has already started
        if (this.game_started)
            return this.retError("Lobby game has already started")

        // Add player with a unique local ID
        this.players_name.push(nickname);
        this.players_LID.push(this.auto_inc);
        this.players_SID.push(socket_id);
        this.players_active.push(true);
        this.auto_inc += 1;

        return this.retSuccess({local_id: this.auto_inc - 1});
    };


    /**
     * Remove a player with the given local id
     * @param {int} local_id    id of player to be removed 
     * @returns                 nothing important
     */
    removePlayerDC(local_id) {
        const index = this.players_LID.indexOf(local_id);

        if (index == -1)
            return this.retError("Player does not exist (aivm)");

        if (this.game_started)
            this.players_active[index] = false;
        else {
            this.players_name.splice(index, 1);
            this.players_LID.splice(index, 1);   
            this.players_SID.splice(index, 1);
            this.players_active.splice(index, 1);
        }

        return this.retSuccess();
    };


    /**
     * Sets the specified player's nickname
     * @param {string} socket_id   socket id of player
     * @param {string} nickname    new nickname to set player to
     * @returns {passed: bool, data: n/a, msg: string} whether the operation was 
     *                                                 successful (passed), and 
     *                                                 the error message (msg) if not
     */
    setPlayerName(socket_id, nickname) {

        // Check if duplicate names are allowed
        if (!this.dup_names && this.players_name.includes(nickname))
            return this.retError("Lobby contains a player with the same name");

        // Get and check if player exists
        const index = this.players_SID.indexOf(socket_id);
        if (index == -1)
            return this.retError("Player does not exist / Permission error (edbs)");

        this.players_name[index] = nickname;
        return this.retSuccess({});
    };


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
        if (!this.permissionCheckLow(source_SID))
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
        if (!this.permissionCheckLow(source_SID))
            return this.retError("Permission error");

        this.game_started = false;
        return this.retSuccess();
    };


    /**
     * Check if a given player is allowed to modify lobby (low => if player is in lobby)
     * @param {string} socket_id    socket id of player performing an operation
     * @returns 
     */
    permissionCheckLow(socket_id) {
        return this.players_SID.includes(socket_id);
    }


    // Return helpers to format function return statuses
    retSuccess(data={}, msg='') {
        return {passed: true, data: data, msg: msg}
    };


    retError(error_desc) {
        return {passed: false, msg: error_desc, data: {}};
    };


    // Testing return function
    get() {
        return {
            lobby_code: this.code,
            auto_inc: this.auto_inc = 0,
            max_players:this.max_players,
            dup_names: this.dup_names,
            LIDs: this.players_LID
        };
    }
}

module.exports = Lobby;