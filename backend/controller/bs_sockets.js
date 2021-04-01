const e = require("express");

exports = module.exports = (io) => {
    const games = require("../models/Games");

    io.on("connection", socket => {

        socket.on("PlayCard", info => {
            const code = info.lobby_code;
            const id = socket.id;
            const cards = info.cards;

            const result = games.playCards(code, id, cards);
            if (result.passed) {
                socket.emit("UpdatePlayerHand", games.getPlayerHand(code, id));
                //socket.emit("UpdateOtherHands", result.data);  probably not necessary to update
                socket.broadcast.to(code).emit("UpdateOtherHands", result.data);
                io.in(code).emit("UpdateCenterPile", {change: result.data.change * -1});
                io.in(code).emit("UpdateTurnInfo", games.getCurrentTurn(code));
            }
            
            else {
                socket.emit("PlayCardsError", {msg: result.msg});
            }
        })

        socket.on("RequestGameInfo", info => {
            const code = info.lobby_code;

            io.to(socket.id).emit("UpdatePlayerHand", games.getPlayerHand(code, socket.id));
            io.to(socket.id).emit("UpdateOtherHands", games.getAllHandSize(code));
            io.to(socket.id).emit("UpdateTurnInfo", games.getCurrentTurn(code));
        });
    });
}