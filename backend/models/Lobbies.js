const Lobby = require("../models/Lobby");

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
  
        // Locate a player's lobby and local id
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

        // Create a Lobby object and store
        this.lobbies.set(new_lobby_code, new Lobby(new_lobby_code, max_players, dup_names));
        return this.retSuccess({lobby_code: new_lobby_code});
    }


    /**
     * Returns an array of nicknames for all existing players in lobby
     * @param {string} lobby_code   Code of lobby to retrieve from
     * @returns {returns}           returns an array of nicknames
     */
    getPlayers(lobby_code) {
        // Make sure lobby exists
        if (!this.exists(lobby_code))
            return this.retError(`Cannot find lobby "${lobby_code}"`);

        return this.retSuccess(this.lobbies.get(lobby_code).getPlayers());
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


    /**
     * Sets a lobby's game_started var to true
     * @param {string} socket_id    id of a player that exists in lobby
     * @returns {returns}           lobby code and a list of socket ids for the game object to use
     */
    start(socket_id, lobby_code) {

        const lobby = this.lobbies.get(lobby_code);

        // Attempt to start lobby and return data if successful
        const result = lobby.start(socket_id)
        return result.passed ? 
            this.retSuccess({lobby_code: lobby_code, player_SIDs: lobby.getPlayerSIDs()}):
            this.retError(result.msg);
    }


    /**
     * Sets a lobby's game_started var to false
     * @param {string} socket_id    id of a player that exists in lobby
     * @returns {returns}           lobby code
     */
    stop(socket_id, lobby_code) {

        const lobby = this.lobbies.get(lobby_code);

        // Attempt to stop lobby and return data if successful
        const result = lobby.stop(socket_id)
        return result.passed ?
            this.retSuccess({lobby_code: lobby_code}):
            this.retError(result.msg);
    }


    /**
     * Adds a player to the specified lobby
     * @param {string} lobby_code   Lobby to add player to
     * @param {string} socket_id    ID of the player's socket connection
     * @param {string} nickname     Nickname for the player (Optional)
     * @returns {returns}           List of players in the lobby (For convenience in updating player list)
     */
    addPlayer(socket_id, lobby_code, nickname="Player") {
        // Prepare lobby info
        if (!this.exists(lobby_code))
            return this.retError(`Cannot find lobby "${lobby_code}"`);
        const lobby = this.lobbies.get(lobby_code);

        // Attempt to add player and return data if successful
        const result = lobby.addPlayer(socket_id, nickname);
        if (result.passed) {
            this.all_players.set(socket_id, {lobby_code: lobby_code, local_id: result.data.local_id});
            return this.retSuccess({players: lobby.getPlayers()});
        }
        else {
            return this.retError(result.msg);
        }
    }


    /**
     * Removes a player from the specified lobby
     * @param {string} lobby_code   Lobby to remove player from
     * @param {string} socket_id    ID of the player's socket connection
     * @returns {returns}           Lobby code and list of players in the lobby (For convenience in updating player list)
     */
    removePlayerDC(socket_id) {

        if (!this.all_players.has(socket_id))
            return this.retError();

        const player_info = this.all_players.get(socket_id);
        const lobby = this.lobbies.get(player_info.lobby_code);

        // Attempt player removal and return data if successful
        const result = lobby.removePlayerDC(player_info.local_id);
        return result.passed ?
            this.retSuccess({lobby_code: player_info.lobby_code, players: lobby.getPlayers()}):
            this.retError(result.msg);    
    }


    /**
     * Sets a player's name
     * @param {string} lobby_code Lobby which player exists in
     * @param {string} socket_id  ID of the player's socket connection
     * @param {string} nickname   New nickname to set for the player
     * @returns {returns}         Lobby code and list of players in the lobby (For convenience in updating player list)
     */
     setPlayerName(socket_id, lobby_code, nickname) {
        
        // Get lobby of player with socket id
        const lobby = this.lobbies.get(lobby_code);

        // Attempt player rename and return data if successful
        const result = lobby.setPlayerName(socket_id, nickname);
        return result.passed ?
            this.retSuccess({players: lobby.getPlayers()}):
            this.retError(result.msg); 
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
    allowEntry(code) {

        if (!this.exists(code))
            return this.retError(`Cannot find lobby "${code}"`);
        else if (this.lobbies.get(code).getPlayerCount() >= this.lobbies.get(code).maxSize())
            return this.retError(`Lobby "${code}" has reached the maximum number of players`);
        else if (this.lobbies.get(code).started())
            return this.retError(`Lobby "${code}"'s game has started`);
        else
            return this.retSuccess();
    }


    // ------------------------------ Helper Functions for this class' methods ------------------------------


    /**
     * @param {string} code Lobby to check for
     * @returns {boolean}   true if a lobby with this code exists
     */
    exists(code) {
        return (this.lobbies.has(code));
    }


    getPlayerLobbyInfo(socket_id) {
        // Prepare player location info
        if (!this.all_players.has(socket_id))
            return this.retError(`Cannot find player`);
        const info = this.all_players.get(socket_id);
        
        // Verify lobby exists
        if (!this.exists(info.lobby_code)) 
            return this.retError(`Cannot find lobby "${lobby_code}"`);

        // Returns the lobby code and a reference to it
        return this.retSuccess({lobby_code: info.lobby_code, local_id: info.local_id});
    }


    /**
     * Helps return failed operations in the correct manner
     * @param   {string} error_desc message describing what happened
     * @returns {returns}
     */
    retError(error_desc="") {
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