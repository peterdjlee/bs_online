const cards_generator = require("../utils/genCards");

class Games{

    constructor(){
        this.games_map = new Map();


    }

    createGame(lobbyCode, playerList){

        this.games_map.set(lobbyCode, 
        {
            centralPile: [],
            playerHands: [],
            currentPlayerTurn: 0,
            currentCardRank: 1,
            playerList: playerList,
            numOfLastCardsPlayed: 0
        });

        for(let i = 0; i < playerList.length; i++){

            this.games_map.get(lobbyCode).playerHands = cards_generator.shuffleAndDeal(num_hands = playerList.length);

            this.games_map.get(lobbyCode).playerPositions.set(i, playerList[i].socket_id);
        }

    }


    getPlayerHand(gameCode, pos){
        return this.games_map.get(gameCode).playerHands[pos];
    }

    getAllHandSize(gameCode){
        var HandSizes = []
        const game = this.games_map.get(gameCode);

        for(let i = 0; i < playerList.length; i++){
            HandSizes.push({
                position: i,
                count: game.playerHands[i].length
            });
        }

        return HandSizes;
    }

    getHandSize(gameCode, pos){
        return {position: pos, 
                count: this.games_map.get(gameCode).playerHands[pos].length
        };
    }

    getPlayerList(gameCode){
        return this.games_map.get(gameCode).playerList
    }

    getPile(gameCode){
        return this.games_map.get(gameCode).centralPile;
    }

    getCurrentTurn(gameCode){
        return this.games_map.get(gameCode).currentPlayerTurn;
    }


    updatePile(gameCode, cards){
        for (card in cards){
            this.games_map.get(gameCode).centralPile.push(card);
        }
        
    }

    playCards(gameCode, pos, cardPos){
        let hand = this.games_map.get(gameCode).playerHands[pos];
        this.games_map.get(gameCode)numOfLastCardsPlayed = 0;
        for (position in cardPos){
            this.games_map.get(gameCode).centralPile.push(hand[position]);
            this.games_map.get(gameCode)numOfLastCardsPlayed += 1;
        }

    }

    nextTurn(gameCode){
        this.games_map.get(gameCode).currentPlayerTurn = 
        (this.games_map.get(gameCode).currentPlayerTurn + 1) % this.games_map.get(gameCode).playerList.length;

        this.games_map.get(gameCode).currentCardRank = this.games_map.get(gameCode).currentCardRank % 13 + 1;
    }
    

}

const games = new Games();
module.exports = games;