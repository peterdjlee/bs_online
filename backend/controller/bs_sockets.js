exports = module.exports = (io) => {
    const games = require("../models/Games");

    io.on("connection", socket => {

        /**
         * @param {"lobby_code": string, "cards": array[int]}
         */
        socket.on("PlayCard", info => {
            const code = info.lobby_code;
            const id = socket.id;
            const cards = info.cards;
            const op_num = info.op_num ? info.op_num: -1;

            const result = games.playCards(code, id, cards, op_num);
            if (result.passed) {
                socket.emit("UpdatePlayerHand", games.getPlayerHand(code, id));
                io.in(code).emit("UpdateOtherHands", games.getAllHandSize(code));
                //io.in(code).emit("UpdateOpNum", games.getOpNum(code));
                io.in(code).emit("UpdateCenterPile", {change: games.cPileSize(code)});
                io.in(code).emit("UpdateTurnInfo", games.getCurrentTurn(code));

                if(result.data.stop_game.passed) {
                    io.in(code).emit("GameOver", result.data.stop_game.data);
                }
            }
            
            else {
                socket.emit("PlayCardsError", {msg: result.msg});
            }
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


        socket.on("CallBS", info => {
            const code = info.lobby_code;
            const op_num = info.op_num ? info.op_num: -1;

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
                //io.in(code).emit("UpdateOpNum", games.getOpNum(code));
                io.in(code).emit("UpdateCenterPile", {change: games.cPileSize(code)});
            }
        });
    });
}