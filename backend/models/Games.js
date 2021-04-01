const cards_generator = require("../utils/genCards");
const BS = require("./BS");

class Games{

    constructor() {
        this.games_map = new Map();
    }

    createGame(lobbyCode, playerList, playerNames, numDecks=1){
        this.games_map.set(lobbyCode, new BS(lobbyCode, playerList, playerNames, numDecks));
    }

    getPlayerHand(gameCode, socket_id){
        const game = this.games_map.get(gameCode);
        return game.getPlayerHand(socket_id);
    }

    getAllHandSize(gameCode){
        const game = this.games_map.get(gameCode);
        return game.getAllHandSize();
    }

    getHandSize(gameCode, socket_id){
        const game = this.games_map.get(gameCode);
        return game.getHandSize(socket_id)
    }

    cPileCollect(gameCode){
        const game = this.games_map.get(gameCode);
        return game.cPileCollect();
    }

    getCurrentTurn(gameCode){
        return this.games_map.get(gameCode).getTurn();
    }

    nextTurn(gameCode) {
        this.games_map.get(gameCode).nextTurn();
    }

    playCards(gameCode, SID, cards){
        return this.games_map.get(gameCode).playCards(SID, cards);
    }


    removePlayer(gameCode, SID){
        this.games_map.get(gameCode).removePlayer(SID);
    }


    /**
     * Deletes the specified game
     * @param {string} lobby_code   code of lobby that game is attached to
     * @returns {returns}           No data will be returned
     */
     delete(lobby_code) {
        return this.games.delete(lobby_code);
     }
}

const games = new Games();
module.exports = games;