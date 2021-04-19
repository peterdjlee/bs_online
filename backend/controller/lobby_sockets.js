exports = module.exports = (io) => {
    
    const lobbies = require("../models/Lobbies");
    const games = require("../models/Games");
    
    io.on("connection", socket => {

        /**
         * @param {lobby_code: string, nickname: string}
         */
        socket.on("AddPlayer", param => {
            const code = param.lobby_code;
            const id = socket.id;
            const nickname = param.nickname ? param.nickname: "Player";

            // Attempt to add player
            const result = lobbies.addPlayer(id, code, nickname);
            if (result.passed) {

                // join player to socket room and emit paramrmation to players in the same room
                socket.join(code);
                //socket.emit("GetOwnInfo", {local_id: result.data.add[0].local_id});
                io.in(code).emit("UpdatePlayerList", lobbies.getPlayersDisplay(code));
            }
            else {
                socket.emit("AddPlayerError", {msg: result.msg});
            }
        });


        /**
         * @param {lobby_code: {string}, nickname: {string}}
         */
        socket.on("ChangePlayerName", param => {
            const id = socket.id; // Player's id retrieved from socket connection => harder to tamper
            const code = param.lobby_code;
            const nickname = param.nickname;

            // Attempt to change player name and emit events accordingly
            const result = lobbies.setPlayerName(id, code, nickname);
            if (result.passed)
                io.in(code).emit("UpdatePlayerList", lobbies.getPlayersDisplay(code));
            else
                socket.emit("ChangePlayerNameError", {old_name: result.data.old_name, msg: result.msg});
        });
    

        /**
         * When the start game button is clicked in lobby
         * @param {lobby_code: {string}, settings: obj}
         */
        socket.on("CreateGame", param => {
            const lobby_code = param.lobby_code;
            const settings = param.settings ? param.settings: {};

            const result = lobbies.start(socket.id, lobby_code);
            if (result.passed) {
                const cur_player_data = lobbies.getPlayersGame(lobby_code);
                games.createGame(lobby_code, cur_player_data.player_SIDs, cur_player_data.player_names, settings);
                io.in(lobby_code).emit("StartGame", {});
            }
            else
                socket.emit("ErrorMessage", {msg: result.msg});
        });


        /**
         * When the game ends. Game data actually isn't deleted 
         * @param {lobby_code: {string}, settings: obj}
         */
        socket.on("DeleteGame", param => {
            const lobby_code = param.lobby_code;
            const result = lobbies.stop(socket.id, lobby_code);
            if (result.passed) {
                io.in(lobby_code).emit("StopGame", {});
                io.in(lobby_code).emit("UpdatePlayerList", lobbies.getPlayersDisplay(lobby_code));
            }
            else
                socket.emit("ErrorMessage", {msg: result.msg});
        });


        /**
         * Default socket.io disconnect listener
         * Delete player data and lobby data if last player left
         */
        socket.on("disconnect", () => {
            const result = lobbies.removePlayerDC(socket.id);
            if (result[0].passed) {

                // Delete data for lobby if all players have left
                if(result[2] == 0) {
                    lobbies.delete(result[1]);
                    games.delete(result[1]);
                }

                // Update lobby to account for player leaving
                else
                    socket.broadcast.to(result[1]).emit("UpdatePlayerList", lobbies.getPlayersDisplay(result[1]));
            }
        });

    });
}