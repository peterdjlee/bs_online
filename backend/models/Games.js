const cards_generator = require("../utils/genCards");

class Games{

    constructor(){
        this.games_map = new Map();


    }

    createGame(lobbyCode, playerList){

        this.games_map.set(lobbyCode, 
        {
            centralPile: [],
            playerHands: new Map(),
            currentPlayerTurn: 0,
            playerPositions: new Map(),
            handNums: []
        });
        
        this.fillParameters(lobbyCode, playerList);

    }

    //maps playerHands by socket id to hands
    //maps playerPositions by position to id
    //fills in handNums array
    fillParameters(lobbyCode, playerList){
        const arr_hands = cards_generator.shuffleAndDeal(num_hands = playerList.length);
        const numCards = arr_hands[0].length;

        for(let i = 0; i < playerList.length; i++){

            this.games_map.get(lobbyCode).playerHands.set(playerList[i].socket_id, arr_hands[i]);

            this.games_map.get(lobbyCode).playerPositions.set(i, playerList[i].socket_id);

            this.games_map.get(lobbyCode).handNums.push({
                nickname: playerList[i].nickname,
                position: i,
                numCards: numCards
            });
        }


    }


    getPlayerHand(gameCode, playerID){
        return this.games_map.get(gameCode).playerHands.get(playerID);
    }

    getHandNums(gameCode){
        return this.games_map.get(gameCode).handNums;
    }

    getPile(gameCode){
        return this.games_map.get(gameCode).centralPile;
    }

    updatePile(gameCode, card){
        this.games_map.get(gameCode).centralPile.push(card);
    }

    updatePlayerHand(playerID){


    }

    updateOpponentHand(){

    }



    

}

const games = new Games();
module.exports = games;