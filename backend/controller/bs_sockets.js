exports = module.exports = (io) => {
    const lobbies = require("../models/Lobbies")
    const games = require("../models/Games");

    io.on("connection", socket => {

        // Add BS game listeners on request
        socket.on("OpenBSSockets", () => {


            /**
             * Player 
             * @param {lobby_code: string, cards: array[int], op_num: int}
             */
            socket.on("PlayCard", info => {
                const code = info.lobby_code;
                const cards = info.cards;
                const op_num = info.op_num;

                const result = games.playCards(code, socket.id, cards, op_num);
                if (result.passed) {
                    socket.emit("UpdatePlayerHand", games.getPlayerHand(code, socket.id));
                    io.in(code).emit("UpdateOtherHands", games.getAllHandSize(code));
                    io.in(code).emit("UpdateOpNum", games.getOpNum(code));
                    io.in(code).emit("PlayCardEvent", {count: cards.length, nickname: result.data.nickname, pos: result.data.pos});
                    io.in(code).emit("UpdateCenterPile", {change: games.cPileSize(code)});
                    io.in(code).emit("UpdateTurnInfo", games.getCurrentTurn(code));

                    const stop_game = games.declareWinner(code);
                    if(stop_game.passed)
                        io.in(code).emit("GameOver", stop_game.data);
                }
                
                else
                    socket.emit("PlayCardsError", {msg: result.msg});
            });


            /**
             * Player requests refresh of card and turn info (Either to start game or refresh current info)
             * @param {"lobby_code": string}
             */
            socket.on("RequestGameInfo", info => {
                const code = info.lobby_code;

                io.to(socket.id).emit("UpdatePlayerHand", games.getPlayerHand(code, socket.id));
                io.to(socket.id).emit("UpdateOtherHands", games.getAllHandSize(code));
                io.to(socket.id).emit("UpdateTurnInfo", games.getCurrentTurn(code));
            });


            /**
             * Player thinks last play is invalid
             * @param {"lobby_code: string, op_num: int"}
             */
            socket.on("CallBS", info => {
                const code = info.lobby_code;
                const op_num = info.op_num;

                const result = games.callBS(code, socket.id, op_num);
                if (result.passed) {
                    io.in(code).emit("BSResult", {
                        was_bs: result.data.was_bs,
                        caller_pos: result.data.caller_pos, 
                        caller_name: result.data.caller_name,
                        callee_pos: result.data.callee_pos,
                        callee_name: result.data.callee_name
                    });
                    result.data.modified_hands.forEach(sid => {
                        io.to(sid).emit("UpdatePlayerHand", games.getPlayerHand(code, sid));
                    });
                    io.in(code).emit("UpdateOtherHands", games.getAllHandSize(code));
                    io.in(code).emit("UpdateOpNum", games.getOpNum(code));
                    io.in(code).emit("UpdateCenterPile", {change: games.cPileSize(code)});
                }
            });


            /**
             * BS game disconnect listener
             * Remove player from game logic
             */
            socket.on("disconnect", () => {
                const code = games.getCodeOfSID(socket.id);

                // Unsure whether game exists or not at this point
                if (!games.has(code))
                    return;

                // Remove player and update turn info in case it was their turn
                const result = games.removePlayer(code, socket.id);
                if (result.passed) {
                    io.in(code).emit("UpdateTurnInfo", games.getCurrentTurn(code));

                    // Chat message to notify player left
                    io.to(code).emit("ChatMessage", {name: "Admin", msg: `${result.data} has left the game`});
                
                    // Stop game if conditions met
                    const stop_game = games.declareWinnerDC(code);
                    if(stop_game.passed)
                    io.in(code).emit("GameOver", stop_game.data);
                }
            });

        });


        // Close BS game listeners on request
        socket.on("CloseBSSockets", () => {
            socket.removeAllListeners("PlayCard");
            socket.removeAllListeners("RequestGameInfo");
            socket.removeAllListeners("CallBS");
            socket.removeAllListeners("disconnect");

            // Note: Idk how to create a disconnect handler function and pass socket id into it
            //       So best solution was to delete all disconnect listeners and add the default one back
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
    });
}