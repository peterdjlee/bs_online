class DeckOCards{
    constructor() {
        // Default card set for this card generator class
        this.card_set = [
            "Ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "Tc", "Jc", "Qc", "Kc",
            "Ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "Td", "Jd", "Qd", "Kd",
            "Ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "Th", "Jh", "Qh", "Kh",
            "As", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "Ts", "Js", "Qs", "Ks"
        ];
    }

    /**
     * Generates a random deck of cards
     * @param {int} num_decks       How many decks to combine and shuffle
     * @returns {array{string}}   Array of strings representing cards
     */
    newShuffledDeck(num_decks=1) {

        // Set up base deck to scramble
        var base_deck = [];
        for (let i = 0; i < num_decks; i+=1) {
            base_deck = base_deck.concat(this.card_set);
        }

        // Fisher-Yates method (https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array)
        var current_index = base_deck.length;
        var temp_val, random_index;
        
        // While there remain elements to shuffle...
        while (0 !== current_index) {

            // Pick a remaining element...
            random_index = Math.floor(Math.random() * current_index);
            current_index -= 1;

            // And swap it with the current element.
            temp_val = base_deck[current_index];
            base_deck[current_index] = base_deck[random_index];
            base_deck[random_index] = temp_val;
        }

        return base_deck;
    }


    /**
     * Generates a random deck and distributes it to each hand
     * @param {*} num_hands             The number of players to distribute to
     * @param {*} num_decks             The number of decks to combine and distribute
     * @returns {array{array{string}}}  Array for all players, array for each hand, string to represent a card
     */
    shuffleAndDeal(num_hands, num_decks=1) {
        const new_deck = this.newShuffledDeck(num_decks);

        var hands = [];
        const avg_num_cards = Math.floor(new_deck.length / num_hands);
        for (let i = 0; i < num_hands; i+=1){
            hands.push(new_deck.slice(i*avg_num_cards, (i+1)*avg_num_cards));
        }
        return hands;
    }
}

const deck_of_cards = new DeckOCards()
module.exports = deck_of_cards;