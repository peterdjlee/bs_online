exports = module.exports = (io) => {
    
    const lobbies = require("../models/Lobbies");
    const player_to_lobby = new Map();

    io.on("connection", socket => {

        socket.on("api/lobbies/addPlayer", (json) => {
            const code = json.lobby_code;
            const id = socket.id;
            const nickname = json.nickname ? json.nickname: "Player";

            if (!code) 
                socket.emit("ret/lobbies/addPlayer", {players: []});

            const data = lobbies.addPlayer(code, id, nickname).data;
            socket.join(code);
            player_to_lobby.set(id, code);

            socket.emit("ret/lobbies/addPlayer", {players: data.players});
            socket.broadcast.to(code).emit("ret/lobbies/addPlayer", {players: data.players});
        });


        socket.on("api/lobbies/changeNickname", (json) => {
            const code = json.lobby_code;
            const id = socket.id;
            const nickname = json.nickname;

            const data = lobbies.changeNickname(code, id, nickname).data;
            socket.emit("ret/lobbies/addPlayer", {players: data.players});
            socket.broadcast.to(code).emit("ret/lobbies/addPlayer", {players: data.players});
        })


        socket.on("api/lobbies/start", json => {
            const code = json.lobby_code;

            if (lobbies.lobbyStarted(code)) {
                lobbies.stopLobby(code);
            }
            else {
                lobbies.startLobby(code);
            }
            socket.emit("ret/lobbies/start", {started: lobbies.lobbyStarted(code)});
            socket.broadcast.to(code).emit("ret/lobbies/start", {started: lobbies.lobbyStarted(code)});
        });


        socket.on("disconnect", () => {
            const id = socket.id;
            const code = player_to_lobby.get(id);
            player_to_lobby.delete(id);

            if (!lobbies.lobbyExists(code))
                return;

            const data = lobbies.removePlayer(code, id).data;

            if(data.players.length == 0) {
                lobbies.deleteLobby(code);
            }
            else {
                socket.broadcast.to(code).emit("ret/lobbies/addPlayer", {players: data.players});
            }
        });

    });
}