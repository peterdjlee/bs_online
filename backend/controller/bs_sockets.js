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

            const result = games.playCards(code, id, cards);
            if (result.passed) {
                socket.emit("UpdatePlayerHand", games.getPlayerHand(code, id));
                io.in(code).emit("UpdateOtherHands", games.getAllHandSize(code));
                io.in(code).emit("UpdateCenterPile", {change: games.cPileSize(code)});
                io.in(code).emit("UpdateTurnInfo", games.getCurrentTurn(code));
            }
            
            else {
                socket.emit("PlayCardsError", {msg: result.msg});
            }
        })

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
    });
}