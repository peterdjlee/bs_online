exports = module.exports = (io) => {
    
    const lobbies = require("../models/Lobbies");
    const games = require("../models/Games");
    
    io.on("connection", socket => {

        /**
         * @param {lobby_code: string, nickname: string}
         */
        socket.on("AddPlayer", info => {
            const code = info.lobby_code;
            const id = socket.id;
            const nickname = info.nickname ? info.nickname: "Player";

            // Attempt to add player
            const result = lobbies.addPlayer(id, code, nickname);
            if (result.passed) {
                // join player to socket room and emit information to players in the same room
                socket.join(code);
                socket.emit("UpdatePlayerList", result.data.players, result.data.own_LID);
                socket.broadcast.to(code).emit("UpdatePlayerList", result.data.players);
            }
            else {
                socket.emit("AddPlayerError", {msg: result.msg});
            }
        });


        /**
         * @param {lobby_code: {string}, nickname: {string}}
         */
        socket.on("ChangePlayerName", info => {
            const id = socket.id; // Player's id retrieved from socket connection => harder to tamper
            const code = info.lobby_code;
            const nickname = info.nickname;

            // Attempt to change player name and emit events accordingly
            const result = lobbies.setPlayerName(id, code, nickname);
            if (result.passed) {
                socket.emit("UpdatePlayerList", result.data.players);
                socket.broadcast.to(code).emit("UpdatePlayerList", result.data.players);
            }
            else
                socket.emit("ChangePlayerNameError", {msg: result.msg});
        });


        /**
         * If lobby state is true => game started
         * @param {lobby_code: string, started: boolean}
         */
        socket.on("SetLobbyState", info => {
            const new_state = info.started;
            const lobby_code = info.lobby_code;
            
            // start or stop lobby if requested game state does not match current state
            if (new_state) {
                const result = lobbies.start(socket.id, lobby_code);
                if (result.passed) {
                    games.createGame(lobby_code, result.data.player_SIDs, result.data.player_names);
                    socket.emit("StartGame" , {});
                    socket.broadcast.to(lobby_code).emit("StartGame", {});
                }
                else
                    socket.emit("SetLobbyStateError", result.msg);
            }
            else {
                const result = lobbies.stop(socket.id, lobby_code);
                if (result.passed) {
                    socket.emit("StopGame" , {});
                    socket.broadcast.to(lobby_code).emit("StopGame", {});
                }
                else
                    socket.emit("SetLobbyStateError", result.msg);
            }
        });


        /**
         * Default socket.io disconnect listener
         */
        socket.on("disconnect", () => {
            const id = socket.id;

            const result = lobbies.removePlayerDC(id);
            if (result.passed) {  
                if(result.data.players.player_names.length == 0) {
                    if (lobbies.started(result.data.lobby_code))
                        games.delete(result.data.lobby_code);
                    lobbies.delete(result.data.lobby_code);
                }
                else
                    socket.broadcast.to(result.data.lobby_code).emit("UpdatePlayerList", result.data.players);
            }
        });

    });
}