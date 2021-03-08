exports = module.exports = (io) => {

    /*
        Emits:
            "UpdatePlayerList"
            "UpdateLobbyState"
    */
    
    const lobbies = require("../models/Lobbies");

    // Quickly find what lobby a player is in
    const player_to_lobby = new Map();

    io.on("connection", socket => {

        socket.on("AddPlayer", info => {
            const code = info.lobby_code;
            const id = socket.id;
            const nickname = info.nickname ? info.nickname: "Player";

            /*
            if (!code) 
                socket.emit("ret/lobbies/addPlayer", {players: []});
            */

            const data = lobbies.addPlayer(code, id, nickname).data;
            socket.join(code);
            player_to_lobby.set(id, code);

            // Broadcast emits to everyone in room but player -> emit again to player
            socket.emit("UpdatePlayerList", {players: data.players});
            socket.broadcast.to(code).emit("UpdatePlayerList", {players: data.players});
        });


        socket.on("ChangePlayerName", info => {
            const code = info.lobby_code;
            const id = socket.id;
            const nickname = info.nickname;

            const data = lobbies.changeNickname(code, id, nickname).data;
            socket.emit("UpdatePlayerList", {players: data.players});
            socket.broadcast.to(code).emit("UpdatePlayerList", {players: data.players});
        })


        socket.on("SetLobbyState", info => {
            const code = info.lobby_code;
            const new_state = info.started;

            if (lobbies.lobbyStarted(code) != new_state) {
                if (new_state)
                    lobbies.startLobby(code);
                else
                    lobbies.stopLobby(code);
                socket.emit("UpdateLobbyState", {started: new_state});
                socket.broadcast.to(code).emit("UpdateLobbyState", {started: new_state});
            }
        });


        socket.on("disconnect", () => {
            const id = socket.id;

            if (player_to_lobby.has(id)) {
                const code = player_to_lobby.get(id);
                player_to_lobby.delete(id);

                const data = lobbies.removePlayer(code, id).data;
                if(data.players.length == 0)
                    lobbies.deleteLobby(code);
                else
                    socket.broadcast.to(code).emit("UpdatePlayerList", {players: data.players});
            }
        });

    });
}