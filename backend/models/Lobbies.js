/*
    Lobbies.js
    
    stores data using model exported from Lobby.js.
    manages all lobby instances and calls corresponding functions from Lobby models
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


const Lobby = require("../models/Lobby");
const str_generator = require("../utils/genRdmStr");

class Lobbies {

    constructor() {
        // Primary storage for all lobbies
        this.lobbies = new Map();
  
        // When disconnecting, client cannot provide lobby code
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
        this.lobbies.set(new_lobby_code, new Lobby(max_players, dup_names));
        return this.retSuccess({lobby_code: new_lobby_code});
    }


    // Returns 3 arrays: player_names, player_LIDs (local ids), player_active
    // Just enough info to display all players in a lobby to a single player
    getPlayersDisplay(lobby_code) {
        return this.lobbies.get(lobby_code).toDisplay();
    }


    // Retuns 2 arrays: player_names, player_SIDs (socket ids)
    // Just enough info to create a game with a snapshot of the current player list
    getPlayersGame(lobby_code) {
        return this.lobbies.get(lobby_code).toGame();
    }


    getPlayerCount(lobby_code) {
        return this.lobbies.get(lobby_code).count();
    }


    isStarted(lobby_code) {
        return this.lobbies.get(lobby_code).isStarted();
    }


    delete(lobby_code) {
        this.lobbies.delete(lobby_code);
    }


    /**
     * Sets a lobby's game_started var to true
     * @param {string} socket_id                id of a player that exists in lobby
     * @returns {passed: boolean, msg: string}  
     */
    start(socket_id, lobby_code) {
        return this.lobbies.has(lobby_code) ?
            this.lobbies.get(lobby_code).start(socket_id):
            this.retError("Invalid lobby information");
    }


    /**
     * Sets a lobby's game_started var to false so that no players can join during the middle
     * @param {string} socket_id                id of a player that exists in lobby
     * @returns {passed: boolean, msg: string} 
     */
    stop(socket_id, lobby_code) {
        return this.lobbies.has(lobby_code) ?
            this.lobbies.get(lobby_code).stop(socket_id):
            this.retError("Invalid lobby code");
    }


    /**
     * Adds a player to the specified lobby
     * @param {string} lobby_code   Lobby to add player to
     * @param {string} socket_id    ID of the player's socket connection
     * @param {string} nickname     Nickname for the player (Optional)
     * @returns {passed: boolean, msg: string, data: ChangeList}
     */
    addPlayer(socket_id, lobby_code, nickname="Player") {
        if (this.lobbies.has(lobby_code)) {
            const result =  this.lobbies.get(lobby_code).addPlayer(socket_id, nickname);
            if (result.passed)
                this.all_players.set(socket_id, {lobby_code: lobby_code, local_id: result.data.add[0].local_id});
            return result;
        }

        return this.retError("Invalid lobby code");
    }


    /**
     * Removes a player from the specified lobby
     * @param {string} socket_id    ID of the player's socket connection
     * @returns {passed: boolean, msg: string, data: ChangeList}
     */
    removePlayerDC(socket_id) {

        // Player without a lobby might trigger dc event under rare conditions
        if (!this.all_players.has(socket_id))
            return [this.retError()];            

        const player_loc = this.all_players.get(socket_id);
        if (this.lobbies.has(player_loc.lobby_code)) {
            const lobby = this.lobbies.get(player_loc.lobby_code);

            // If lobby is started, players should be disabled in game instead of removed
            return lobby.isStarted() ?
                [lobby.disablePlayer(player_loc.local_id), player_loc.lobby_code, lobby.count()]:
                [lobby.removePlayerDC(player_loc.local_id), player_loc.lobby_code, lobby.count()];
        }

        return [this.retError("Invalid lobby code")];
    }


    /**
     * Sets a player's name
     * @param {string} lobby_code Lobby which player exists in
     * @param {string} socket_id  ID of the player's socket connection
     * @param {string} nickname   New nickname to set for the player
     * @returns {passed: boolean, msg: string, data: ChangeList}
     */
    setPlayerName(socket_id, lobby_code, nickname) {
        return this.lobbies.has(lobby_code) ?
            this.lobbies.get(lobby_code).setPlayerName(socket_id, nickname):
            this.retError("Invalid lobby code", {old_name: this.lobbies.get(lobby_code).getCurrentName(socket_id)});
    }


    // ------------------------ Testing Functions ----------------------------------------

    clearAll() {
        this.lobbies.clear();
        this.all_players.clear();
    }

    total() {
        return this.lobbies.size;
    }

    // ------------------------- Used by non socket communications -------------------------------------
    
    
    /**
     * Checks if the lobby allows players to be added
     * @param {string} lobby_code               Lobby to check
     * @returns {passed: boolean, msg: string}  passed is true if found and msg provides info if not
     */
    allowEntry(code) {
        if (!this.exists(code))
            return this.retError(`Cannot find lobby "${code}"`);
        else if (this.lobbies.get(code).full())
            return this.retError(`Lobby "${code}" has reached the maximum number of players`);
        else if (this.lobbies.get(code).isStarted())
            return this.retError(`Lobby "${code}"'s game has started`);
        else
            return this.retSuccess();
    }


    exists(code) {
        return this.lobbies.has(code);
    }


    // ------------------------------ Return Helpers ------------------------------


    /**
     * Helps return failed operations in the correct manner
     * @param   {string} error_desc message describing what caused error
     * @returns {returns}
     */
    retError(error_desc="", data={}) {
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