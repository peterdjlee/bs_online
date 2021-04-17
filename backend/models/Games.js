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

        // Locate a player's lobby
        this.s_id_to_code = new Map();
    }

    // - Intermediate functions that locate a specific lobby and call corresponding functions -

    createGame(code, playerList, playerNames, settings={}){
        this.games_map.set(code, new BS(playerList, playerNames, settings));
        playerList.forEach(s_id => this.s_id_to_code.set(s_id, code));
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
        this.s_id_to_code.delete(SID);
        return this.games_map.get(code).removePlayer(SID);
    }


    callBS(code, SID, op_num) {
        return this.games_map.get(code).callBS(SID, op_num);
    }

    getOpNum(code) {
        return this.games_map.get(code).getOpNum();
    }

    declareWinner(code) {
        return this.games_map.get(code).declareWinner();
    }

    declareWinnerDC(code) {
        return this.games_map.get(code).declareWinnerDC();
    }

    getCodeOfSID(s_id) {
        return this.s_id_to_code.get(s_id);
    }

    has(code) {
        return this.games_map.has(code);
    }

    // --------------------------------------------------------

     delete(lobby_code) {
        return this.games_map.delete(lobby_code);
     }
}

const games = new Games();
module.exports = games;