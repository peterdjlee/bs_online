exports = module.exports = (io) => {
    const games = require("../models/Games");

    io.on("connection", socket => {

        socket.on("PlayCard", info => {
            const code = info.lobby_code;
            const id = socket.id;
            const cardPos = info.cardPos;
            const pos = info.pos;
            /*
            if(pos == games.getCurrentTurn(code) && id == games.getPlayerList(code)[pos]){
                games.updatePile(code, cards);
                games.playCards(code, pos, cardPos);
                games.nextTurn(code);
                info.centralPileNum = games.getPile(code).length;

                io.to(code).emit("PlayedCard", info);
                io.to(id).emit("UpdatePlayerHand", games.getPlayerHand(code, player.socket_id));
                io.to(code).emit("UpdateOtherHands", games.getHandNums(code));
            }
            */
        })

        socket.on("RequestGameInfo", info => {
            const code = info.lobby_code;

            io.to(socket.id).emit("UpdatePlayerHand", games.getPlayerHand(code, socket.id));
            io.to(socket.id).emit("UpdateOtherHands", games.getAllHandSize(code));
            io.to(socket.id).emit("StartTurn", {position: 0, cardRank: 1});
        });
    });
}