/*
    Games.js

    Stores all game data using model exported from BS.js
    Manages all BS games and calls corresponding functions from model
*/

const cards_generator = require("../utils/genCards");
const BS = require("./BS");

class Games{

    constructor() {
        this.games_map = new Map();
    }

    // - Intermediate functions that locate a specific lobby and call corresponding functions -

    createGame(code, playerList, playerNames, numDecks=1){
        this.games_map.set(code, new BS(code, playerList, playerNames, numDecks));
    }


    getPlayerHand(code, socket_id){
        return this.games_map.get(code).getPlayerHand(socket_id);
    }


    getAllHandSize(code){
        return this.games_map.get(code).getAllHandSize();
    }

    
    cPileSize(code) {
        return this.games_map.get(code).cPileSize();
    }


    cPileCollect(code){
        return this.games_map.get(code).cPileCollect();
    }


    getCurrentTurn(code){
        return this.games_map.get(code).getTurn();
    }


    nextTurn(code) {
        this.games_map.get(code).nextTurn();
    }


    playCards(code, SID, cards, op_num){
        return this.games_map.get(code).playCards(SID, cards, op_num);
    }

    
    removePlayer(code, SID){
        this.games_map.get(code).removePlayer(SID);
    }


    callBS(code, SID, op_num) {
        return this.games_map.get(code).callBS(SID, op_num);
    }

    getOpNum(code) {
        return this.games_map.get(code).getOpNum();
    }


    // --------------------------------------------------------

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