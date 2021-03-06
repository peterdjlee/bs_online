// Util for generating random strings
const str_generator = require("../utils/genRdmStr");

/*
    * A single object of LobbiesMap will serve as the main lobby logic
    * All data is stored in a single map and method functions will 
      be provided to modify stored data in a specific manner
    * All methods return an object literal with specific format: {
        - passed: bool
            * conveys whether operation ran successfully
            * If false, expect server console to have a log detailing it
        - data: object literal (for JSON format)
            * expected output when running an operation
                * i.e. list of players, lobby information
            * Empty return if either error or operation
              isn't expected to have return data
    }    

    Available methods:
        - *constructor(lobby_code_len = 4)
        - createLobby(max_players = 6)
        - deleteLobby(lobby_code)
        - getLobby(lobby_code)
        - getLobbyAll()
        - startLobby(lobby_code)
        - changeNickname(lobby_code, socket_id, nickname)
        - addPlayer(lobby_code, socket_id, nickname = "Player")
        - removePlayer(lobby_code, socket_id, nickname = "Player")
        
    Data storage format:
        {
            lobby_code: ABCD,
            game_started: false,
            max_players: 6,
            players: [
                {
                    socket_id: SomeString
                    nickname: 1stPlayer
                }
                {
                    socket_id: SomeStringButDifferent
                    nickname: 2ndPlayer
                }
            ]
        });
*/


class Lobbies {

    constructor(lobby_code_len = 4) {
        // Primary storage for this object (all lobbies)
        this.lobbies_map = new Map();
        
        // Global configurations for lobbies
        this.lobby_code_len = lobby_code_len;
    };


    // Create a lobby
    createLobby(max_players=6) {

        // Genereate a unique lobby code (TODO: Requires better logic)
        var new_lobby_code = str_generator.genCode(this.lobby_code_len);
        while (this.lobbyExists(new_lobby_code)) {
            new_lobby_code = str_generator.genCode(this.lobby_code_len);
        }

        // Store lobby in map
        this.lobbies_map.set(new_lobby_code,
        {
            lobby_code: new_lobby_code,
            game_started: false,
            max_players: max_players,
            players: []
        });

        return {passed: true, data: {lobby_code: new_lobby_code}};
    }


    // Returns lobby info associated with @code
    getLobby(lobby_code) {
        return (this.lobbyExists(lobby_code) ? 
            {passed:true, data: this.lobbies_map.get(lobby_code)}: 
            this.logError(`Lobby ${lobby_code} non-existent | Info requested`));
    }


    // Return a json file with all lobby infos (MIGHT BE SLOW)
    getLobbyAll() {
        // Create a new object literal to return and copy all elements from storage
        var all_lobbies = {};
        this.lobbies_map.forEach((value, key) => {
            all_lobbies[key] = this.lobbies_map.get(key)
        });
        return {passed: true, data: all_lobbies};
    }


    // Removes a lobby with the associated @code
    deleteLobby(lobby_code) {
        const delete_success = this.lobbies_map.delete(lobby_code);
        return delete_success ? 
            {passed: true, data: {}}:
            this.logError(`Lobby ${lobby_code} non-existent | Delete requested`);
    }


    // Modfies the game_started to true
    //   To-Do: Connect with starting game process
    startLobby(lobby_code) {
        if (!this.lobbyExists(lobby_code))
            return this.logError(`Lobby ${lobby_code} non-existent | Start requested`);
        else if (this.lobbies_map.get(lobby_code).game_started == false) {
            this.lobbies_map.get(lobby_code).game_started = true;
            return {passed: true, data: {}};
        }
        else
            return this.logError(`Lobby ${lobby_code} | Start requested when already started`);
    }


    // Modifies the game_started to false
    //   To-Do: Connect with ending game process
    stopLobby(lobby_code) {
        if (!this.lobbyExists(lobby_code))
            return this.logError(`Lobby ${lobby_code} non-existent | Stop requested`);
        else if (this.lobbies_map.get(lobby_code).game_started == true) {
            this.lobbies_map.get(lobby_code).game_started = false;
            return {passed: true, data: {}};
        }
        else
            return this.logError(`Lobby ${lobby_code} | Stop requested when haven't started`);
    }


    // Modifies a player's name in a specified lobby
    changeNickname(lobby_code, socket_id, nickname) {
        if (!this.lobbyExists(lobby_code))
            return this.logError(`Lobby ${lobby_code} non-existent | Player name change attempted`);
        
        // Locate player in specified lobby, then change nickname
        var name_changed = false;
        this.lobbies_map.get(lobby_code).players.forEach(obj => {
            if (obj.socket_id == socket_id) {
                obj.nickname = nickname;
                name_changed = true;
            }
        });
        if (!name_changed) 
            return this.logError(`Lobby ${lobby_code} | Player ${socket_id} doesn't exist`);
        else 
            return {passed: true, data: {players: this.lobbies_map.get(lobby_code).players}};
    }


    // Adds a player to a specified lobby
    addPlayer(lobby_code, socket_id, nickname="Player") {
        // Check to make sure lobby exists and isn't full
        if (!this.lobbyExists(lobby_code)) 
            return this.logError(`Lobby ${lobby_code} non-existent | Player add attempted`);
        if (this.lobbies_map.get(lobby_code).game_started == true) 
            return this.logError(`Lobby ${lobby_code} | Player add attempted when lobby already started`);

        // Add player to list
        this.lobbies_map.get(lobby_code).players.push({
            socket_id: socket_id, 
            nickname: nickname
        });

        // Remove the player if player count exceeds max
        if (this.getPlayerCount(lobby_code) > this.lobbies_map.get(lobby_code).max_players) {
            this.lobbies_map.get(lobby_code).players = this.lobbies_map.get(lobby_code).players.filter(obj => obj.socket_id != socket_id);
            return this.logError(`Lobby ${lobby_code} | Player add attempted when lobby full`);
        };

        return {passed: true, data: {players: this.lobbies_map.get(lobby_code).players}};
    }


    // Removes a player from the specified lobby
    removePlayer(lobby_code, socket_id) {
        if (!this.lobbyExists(lobby_code)) 
            return this.logError(`Lobby ${lobby_code} non-existent | Player remove attempted`);

        //Reassigns player list to a new filtered list
        this.lobbies_map.get(lobby_code).players = this.lobbies_map.get(lobby_code).players.filter(obj => obj.socket_id != socket_id);
        return {passed: true, data: {players: this.lobbies_map.get(lobby_code).players}};
    }


    // Helper Functions for this class' methods
    lobbyExists(code) {
        return (this.lobbies_map.has(code));
    }

    lobbyStarted(code) {
        if (this.lobbyExists(code))
            return (this.lobbies_map.get(code).game_started);
        else
            return false;
    }

    getPlayerCount(code) {
        return this.lobbies_map.get(code).players.length;
    }

    logError(error_desc) {
        console.log(error_desc);
        return {passed: false};
    }
}

const lobbies = new Lobbies();
module.exports = lobbies;