class Lobby {

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
    }


    // Getters
    getPlayers() {
        return {
            player_names: this.players_name,
            player_LIDs: this.players_LID
        };
    };

    started() {
        return this.game_started;
    };

    getPlayerCount() {
        return this.players_LID.length;
    };

    getPlayerSIDs() {
        return this.players_SID;
    }

    maxSize() {
        return this.max_players;
    }


    // Setters
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
        this.auto_inc += 1;

        return this.retSuccess({local_id: this.auto_inc - 1});
    };

    removePlayerDC(local_id) {
        const index = this.players_LID.indexOf(local_id);

        if (index == -1)
            return this.retError("Player does not exist (aivm)");

        this.players_name.splice(index, 1);
        this.players_LID.splice(index, 1);   
        this.players_SID.splice(index, 1);

        return this.retSuccess();
    };

    setPlayerName(socket_id, nickname) {

        // Check if duplicate names are allowed
        if (!this.dup_names && this.players_name.includes(nickname))
            return this.retError("Lobby contains a player with the same name");


        const index = this.players_SID.indexOf(socket_id);
        if (index == -1)
            return this.retError("Player does not exist / Permission error (edbs)");

        this.players_name[index] = nickname;
        return this.retSuccess({});
    };

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

    // Permission checks
    permissionCheckLow(socket_id) {
        return this.players_SID.includes(socket_id);
    }

    // Return helpers
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