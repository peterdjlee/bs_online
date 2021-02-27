// Util for generating random strings
const str_generator = require("../utils/genRdmStr");

class LobbiesMap {

    constructor(lobby_code_len = 4) {
        // Primary storage for this object
        this.lobbies_map = new Map();
        
        // Configurations for lobby code
        this.lobby_code_len = lobby_code_len;
        this.player_code_len = 6;
    };


    // Create a lobby w/ host as @host_name + return lobby code
    createLobby(host_name, host_socket_id, i_max_players=6) {

        // Genereate a unique lobby code
        let new_lobby_code = str_generator.genCode(this.lobby_code_len);
        while (this.lobbyExists(new_lobby_code)) {
            new_lobby_code = str_generator.genCode(this.lobby_code_len);
        }

        // Store lobby in map
        this.lobbies_map.set(new_lobby_code,
        {
            lobby_code: new_lobby_code,
            game_started: false,
            max_players: i_max_players,
            players: [
                {socket_id: host_socket_id, // every socket has a socket id, seems good to use
                 nickname: host_name
            }]
        });

        return {passed: true, msg: "Lobby Created Successfully", data: {lobby_code: new_lobby_code}};
    }

    // Returns lobby info associated with @code
    getLobby(code) {
        return (this.lobbyExists(code) ? 
            {passed:true, data: this.lobbies_map.get(code)}: 
            {passed:false, msg: "Lobby does not exist"});
    }

    // Return a json file with all lobby infos (MIGHT BE SLOW)
    getLobbyAll() {
        // Store all elements in map into a object literal 
        // JSON doesn't like maps for some reason
        var all_lobbies = {};
        this.lobbies_map.forEach((value, key) => {
            all_lobbies[key] = this.lobbies_map.get(key)
        });
        return {passed: true, data: all_lobbies};
    }

    // Removes a lobby with the associated @code
    deleteLobby(code) {
        const op_success = this.lobbies_map.delete(code);
        return op_success ? 
            {passed: true, msg: "Lobby was deleted", data: {}}:
            {passed: false, msg: "Lobby does not exist"};
    }


    // Modfies the game_started flag
    startLobby(code) {
        if (!this.lobbyExists(code))
            return {passed: false, msg: "Lobby doesn't exist"};
        if (this.lobbies_map.get(code).game_started == false) {
            this.lobbies_map.get(code).game_started = true;
            return {passed: true, msg: "Lobby game started", data: {}};
        }
        return {passed: false, msg: "Lobby game already started"};
    }


    changeNickname(code, id, nickname) {
        if (!this.lobbyExists(code))
            return {passed: false, msg: "Lobby doesn't exist"};
        
        // Locate player in specified lobby, then change nickname
        var name_changed = false;
        this.lobbies_map.get(code).players.forEach(obj => {
            if (obj.socket_id == id) {
                obj.nickname = nickname;
                name_changed = true;
            }
        });
        if (!name_changed) 
            return {passed: false, msg: "Player cannot be found in lobby"};
        else 
            return {passed: true, data:this.lobbies_map.get(code).players};
    }


    addPlayer(code, id, nickname) {
        // Check to make sure lobby exists and isn't full
        if (!this.lobbyExists(code)) 
            return {passed: false, msg: "Lobby doesn't exist"};
        if (this.lobbies_map.get(code).game_started == true) 
            return {passed: false, msg: "Game has started already"};

        // Add player to list then test if over capacity (Seemed like a better idea :I)
        this.lobbies_map.get(code).players.push({socket_id: id, nickname: nickname});
        if (this.getPlayerCount(code) > this.lobbies_map.get(code).max_players) {
            this.lobbies_map.get(code).players = this.lobbies_map.get(code).players.filter(obj => obj.socket_id != id);
            return {passed: false, msg: "Lobby has reached its max capacity"};
        };

        return {passed: true, data:this.lobbies_map.get(code).players};
    }


    removePlayer(code, id, nickname) {
        if (!this.lobbyExists(code)) return {passed: false, msg: "Lobby doesn't exist"};

        //Reassigns player list to a new filtered list
        this.lobbies_map.get(code).players = this.lobbies_map.get(code).players.filter(obj => obj.socket_id != id);
        return {passed: true, data: this.lobbies_map.get(code).players};
    }


    lobbyExists(code) {
        return (this.lobbies_map.has(code));
    }


    getPlayerCount(code) {
        return this.lobbies_map.get(code).players.length;
    }
}

const lobbies_map = new LobbiesMap();
module.exports = lobbies_map;