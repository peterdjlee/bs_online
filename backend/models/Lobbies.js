// Util for generating random strings
const str_generator = require("../utils/genRdmStr");

/**
 * Return structure of this class' methods
 * @typedef {object} returns
 * @property {boolean}  passed  describes if function is successful
 * @property {object}   data    if passed, the relevant data is passed through this
 * @property {string}   msg     if failed, msg provides info on why
 */

class Lobbies {

    constructor() {
        // Primary storage for this object (all lobbies)
        this.lobbies = new Map();

        // Quickly locate a player's lobby (For socket disconnects)
        this.all_players = new Map();
    };


    /**
     * Creates a new lobby, stores it, and returns an identifier (aka lobby code) to it
     * @param {int}     max_players Maximum number of players this lobby can hold
     * @param {boolean} dup_names   Whether players can have the same nickname
     * @param {int}     code_len    Length of the identifier string (Lobby code)
     * @returns {returns}           returns lobby code as "lobby_code"
     */
    create(max_players=6, dup_names=false, code_len=4) {

        // Genereate a unique lobby code (TODO: Requires better logic)
        var new_lobby_code = str_generator.genCode(code_len);
        let new_gen = 0;
        while (this.exists(new_lobby_code)) {
            if (new_gen % 10 == 0)
                code_len += 1;
            new_lobby_code = str_generator.genCode(code_len);
            new_gen += 1;
        }

        // Store lobby in map in this format
        this.lobbies.set(new_lobby_code, 
        {
            lobby_code: new_lobby_code,
            game_started: false,
            max_players: max_players,
            duplicate_names: dup_names,
            players: []
        });

        return this.retSuccess({lobby_code: new_lobby_code});
    }


    /**
     * Returns information about the requested lobby
     * @param {string} lobby_code   code of lobby to get info for
     * @returns {returns}           lobby info           
     */
    get(lobby_code) {
        return (this.exists(lobby_code) ? 
            this.retSuccess(this.lobbies.get(lobby_code)):
            this.retError(`Cannot get info of lobby "${lobby_code}" (Doesn't exist)`));
    }


    /**
     * Returns information for all existing lobbies
     * @returns {returns} all lobby info
     */
    getAll() {
        // Create a new object literal and copy all elements from storage
        var all_lobbies = {};
        this.lobbies.forEach((value, key) => {
            all_lobbies[key] = this.lobbies.get(key)
        });
        return this.retSuccess(all_lobbies);
    }


    /**
     * Deletes the specified lobby
     * @param {string} lobby_code   code of lobby to be deleted
     * @returns {returns}           No data will be returned
     */
    delete(lobby_code) {
        return this.lobbies.delete(lobby_code) ? 
            this.retSuccess({}):
            this.retError(`Cannot delete lobby "${lobby_code}" (Doesn't exist)`);
    }


    // TODO CONNECT WITH GAME LOGIC
    /**
     * Sets a lobby's game_started var to true
     * @param {string} lobby_code   code of lobby to start
     * @returns {returns}           No data will be returned
     */
    start(lobby_code) {
        if (!this.exists(lobby_code))
            return this.retError(`Cannot start lobby "${lobby_code}" (Doesn't exist)`);
        else if (!this.started(lobby_code)) {
            this.lobbies.get(lobby_code).game_started = true;
            return this.retSuccess({});
        }
        else
            return this.retError(`Cannot start lobby "${lobby_code}" (Already started)`);
    }


    // TODO CONNECT WITH GAME LOGIC
    /**
     * Sets a lobby's game_started var to false
     * @param {string} lobby_code   code of lobby to stop
     * @returns {returns}           No data will be returned
     */
    stop(lobby_code) {
        if (!this.exists(lobby_code))
            return this.retError(`Cannot stop lobby "${lobby_code}" (Doesn't exist)`);
        else if (this.started(lobby_code)) {
            this.lobbies.get(lobby_code).game_started = false;
            return this.retSuccess({});
        }
        else
            return this.retError(`Cannot stop lobby "${lobby_code}" (Not started)`);
    }


    /**
     * Adds a player to the specified lobby
     * @param {string} lobby_code   Lobby to add player to
     * @param {string} socket_id    ID of the player's socket connection
     * @param {string} nickname     Nickname for the player (Optional)
     * @returns {returns}           List of players in the lobby (For convenience in updating player list)
     */
    addPlayer(lobby_code, socket_id, nickname="Player") {

        // Make sure lobby will accept new players
        const check = this.allowEntry(lobby_code);
        if (!check.passed)
            return this.retError(check.msg);

        // Complies with lobby policies (Duplicate names)
        if (this.lobbies.get(lobby_code).duplicate_names == false) {
            if (this.hasName(lobby_code, nickname)) {
                return this.retError(`Lobby "${lobby_code}" does not allow duplicate names`);
            }
        }

        // Add player to list
        this.lobbies.get(lobby_code).players.push({
            socket_id: socket_id, 
            nickname: nickname
        });

        // If the number of players exceed the max allowed, remove them, and return error
        if (this.lobbies.get(lobby_code).players.length > this.lobbies.get(lobby_code).max_players) {
            this.lobbies.get(lobby_code).players = this.lobbies.get(lobby_code).players.filter(obj => obj.socket_id != socket_id);
            return this.retError(`Lobby "${lobby_code}" has reached the maximum number of players`);
        };
        
        this.all_players.set(socket_id, lobby_code);
        return this.retSuccess({players: this.lobbies.get(lobby_code).players});
    }


    /**
     * Removes a player from the specified lobby
     * @param {string} lobby_code   Lobby to remove player from
     * @param {string} socket_id    ID of the player's socket connection
     * @returns {returns}           List of players in the lobby (For convenience in updating player list)
     */
    removePlayer(lobby_code, socket_id) {
        if (!this.exists(lobby_code)) 
            return this.retError(`Cannot find lobby "${lobby_code}"`);

        const lobby = this.lobbies.get(lobby_code);
        const prev_player_num = lobby.players.length;

        // Reassigns player list to a new filtered list
        lobby.players = lobby.players.filter(obj => obj.socket_id != socket_id);
        
        if (lobby.players.length < prev_player_num) {
            this.all_players.delete(socket_id);
            return this.retSuccess({players: this.lobbies.get(lobby_code).players});
        }
        else
            return this.retError("Player cannot be found");
    }


    /**
     * Sets a player's name
     * @param {string} lobby_code Lobby which player exists in
     * @param {string} socket_id  ID of the player's socket connection
     * @param {string} nickname   New nickname to set for the player
     * @returns {returns}         List of players in the lobby (For convenience in updating player list)
     */
     setPlayerName(lobby_code, socket_id, nickname) {
        if (!this.exists(lobby_code))
            return this.retError(`Cannot find lobby "${lobby_code}"`);
        
        // Iterate through all players in lobby
        const lobby = this.lobbies.get(lobby_code);
        for (let i = 0; i < lobby.players.length; i += 1) {
            if (lobby.players[i].socket_id == socket_id) {

                // Check if old name is the same
                if (lobby.players[i].nickname == nickname)
                    return this.retError("Nickname requested is the same as current");
                
                // Comply with lobby policies (Duplicate names)
                else if (!lobby.duplicate_names && this.hasName(lobby_code, nickname))
                    return this.retError("This lobby does not allow duplicate names");

                else {
                    lobby.players[i].nickname = nickname;
                    return this.retSuccess({players: lobby.players});
                }
            }
        }
        return this.retError(`Lobby ${lobby_code} | Player ${socket_id} doesn't exist`);
    }


    /**
     * Clears all lobbies
     */
    clearAll() {
        this.lobbies.clear();
        this.all_players.clear();
    }

    
    /**
     * @returns {int} total number of existing lobbies
     */
    total() {
        return this.lobbies.size;
    }


    /**
     * Checks if the lobby allows players to be added
     * @param {string} lobby_code  Lobby to check
     * @returns {returns}          data is true if lobby is not full and not started
     */
    allowEntry(lobby_code) {
        if (!this.exists(lobby_code))
            return this.retError(`Cannot find lobby "${lobby_code}"`);
        else if (this.isFull(lobby_code))
            return this.retError(`Lobby "${lobby_code}" has reached the maximum number of players`);
        else if (this.started(lobby_code))
            return this.retError(`Lobby "${lobby_code}"'s game has started`);
        else
            return this.retSuccess();
    }


    // ------------------------------ Helper Functions for this class' methods ------------------------------


    /**
     * @param {string} code Lobby to check for
     * @returns {boolean}   true if this lobby has reached capacity
     */
    isFull(code) {
        return (this.lobbies.get(code).players.length >= this.lobbies.get(code).max_players);
    }


    /**
     * @param {string} code Lobby to check for
     * @returns {boolean}   true if a lobby with this code exists
     */
    exists(code) {
        return (this.lobbies.has(code));
    }
    

    /**
     * @param {string} code Lobby to check for
     * @returns {boolean}   true if this lobby's game has been set to started
     */
    started(code) {
        return this.lobbies.get(code).game_started;
    }


    /**
     * Checks if a lobby already has a player with the given name
     * @param {string} code Lobby to check for
     * @param {string} name Nickname to check for
     * @returns {boolean}   true if a lobby already has a player with @name    
     */
    hasName(code, name) {
        var exists = false;
        this.lobbies.get(code).players.forEach(obj => {
            if (obj.nickname == name)
                exists = true;
        });
        return exists;
    }

    /**
     * Returns the lobby a player is currently in
     * @param {string} socket_id 
     * @returns 
     */
    getLobbyOf(socket_id) {
        if (this.all_players.has(socket_id))
            return this.retSuccess({lobby_code: this.all_players.get(socket_id)});
        else
            return this.retError("Player doesn't exist");
    }

    // Return total number of players currently in a lobby
    totalPlayers() {
        return this.retSuccess({size: this.all_players.size});
    }


    /**
     * Helps return failed operations in the correct manner
     * @param   {string} error_desc message describing what happened
     * @returns {returns}
     */
    retError(error_desc) {
        //console.log(error_desc);
        return {passed: false, msg: error_desc, data: {}};
    }

    /**
     * Helps return successful operations in the correct manner
     * @param   {object}  data the expected returns of a function
     * @param   {string}  msg  misc. message
     * @returns {returns}
     */
    retSuccess(data={}, msg = "") {
        return {passed: true, data: data, msg: msg};
    }
}

const lobbies = new Lobbies();
module.exports = lobbies;