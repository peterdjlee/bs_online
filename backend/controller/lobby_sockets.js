const cards_generator = require("../utils/genCards");

exports = module.exports = (io) => {

    /*
        Emits:
            "UpdatePlayerList":
                data passed: an array of objects { {string}socket_id, {string}nickname }
                    [
                        { socket_id: 'GZ2XNYoA_eqZIsINAAAF', nickname: 'A' },
                        { socket_id: 'yh8ndG94sCbxo99NAAAL', nickname: 'B' },
                        { socket_id: '5IkQqtS_BwaZDYYHAAAN', nickname: 'Player' }
                    ]
            "UpdateLobbyState"
                data passed: single object { {bool}started }
                    {
                        started: true
                    }
    */
    
    const lobbies = require("../models/Lobbies");
    const games = require("../moodels/Games");
    
    io.on("connection", socket => {

        socket.on("AddPlayer", info => {
            const code = info.lobby_code;
            const id = socket.id;
            const nickname = info.nickname ? info.nickname: "Player";
            
            // Check if lobby entry is allowed
            const check = lobbies.allowEntry(code);
            if (check.passed) {

                // Check if adding player maintains lobby rules (ex. duplicate names)
                const add_status = lobbies.addPlayer(code, id, nickname);
                if (add_status.passed) {

                    socket.join(code);

                    // Broadcast emits to everyone in room but player -> emit again to player
                    socket.emit("UpdatePlayerList", {players: add_status.data.players});
                    socket.broadcast.to(code).emit("UpdatePlayerList", {players: add_status.data.players});
                }
                else
                    socket.emit("AddPlayerError", {msg: add_status.msg});
            }
            else
                socket.emit("AddPlayerError", {msg: check.msg});
        });


        socket.on("ChangePlayerName", info => {
            const code = info.lobby_code;
            const id = socket.id;
            const nickname = info.nickname;

            // Attempt to change player name and emit events accordingly
            const result = lobbies.setPlayerName(code, id, nickname);
            if (result.passed) {
                socket.emit("UpdatePlayerList", {players: result.data.players});
                socket.broadcast.to(code).emit("UpdatePlayerList", {players: result.data.players});
            }
            else
                socket.emit("ChangePlayerNameError", {msg: result.msg});
        })


        socket.on("SetLobbyState", info => {
            const code = info.lobby_code;
            const new_state = info.started;
            
            // start or stop lobby if requested game state does not match current state
            if (lobbies.started(code) != new_state) {
                if (new_state) {
                    lobbies.start(code);
                    games.create(code, lobbies.get(code).players);
                    socket.emit("StartGame" , {});
                    socket.broadcast.to(code).emit("StartGame", {});

                    for(player in lobbies.get(code).players){
                        io.to(player.socket_id).emit("UpdatePlayerHand", games.getPlayerHand(code, player.socket_id));
                        io.to(player.socket_id).emit("UpdateOtherHands", games.getAllHandSize(code);
                    }

                    io.to(code).emit("StartTurn", {position: 0, cardRank: 1});
                }
                else {
                    lobbies.stop(code)
                    socket.emit("StopGame" , {});
                    socket.broadcast.to(code).emit("StopGame", {});
                } 
            }
        });

        socket.on("PlayCard"), info => {
            const code = info.lobby_code;
            const id = socket.id;
            const cardPos = info.cardPos;
            const pos = info.pos;
            
            if(pos == games.getCurrentTurn(code) && id == games.getPlayerList(code)[pos]){
                games.updatePile(code, cards);
                games.playCards(code, pos, cardPos);
                games.nextTurn(code);
                info.centralPileNum = games.getPile(code).length;

                io.to(code).emit("PlayedCard", info);
                io.to(id).emit("UpdatePlayerHand", games.getPlayerHand(code, player.socket_id));
                io.to(code).emit("UpdateOtherHands", games.getHandNums(code));

            }

        }


        socket.on("disconnect", () => {
            const id = socket.id;
            const player_info = lobbies.getLobbyOf(id);

            // Remove a player from lobby and delete lobby if no players left
            if (player_info.passed) {
                const lobby_code = player_info.data.lobby_code;
                const result = lobbies.removePlayer(lobby_code, id).data;
                if(result.players.length == 0)
                    lobbies.delete(lobby_code);
                else
                    socket.broadcast.to(lobby_code).emit("UpdatePlayerList", {players: result.players});
            }
        });

    });
}