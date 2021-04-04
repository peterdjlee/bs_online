/**
 * Generates a random deck of cards
 * Card ownership is stored in each card
 * @param {int} num_decks       How many decks to combine and shuffle
 * @returns {array[[int, int]]}   Array of strings representing cards
*/
function newShuffledDeck(num_decks = 1) {

    // Set up base deck to scramble
    var base_deck = [];
    for (let i = 0; i < 52 * num_decks; i+=1) base_deck.push(i);

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
 * Card ownership is decided by individual player arrays
 * @param {*} num_hands             The number of players to distribute to
 * @param {*} num_decks             The number of decks to combine and distribute
 * @returns {array{array{string}}}  Array for all players, array for each hand, string to represent a card
 */
 function shuffleAndDeal(num_hands, num_decks=1) {
    const new_deck = newShuffledDeck(num_decks);

    var hands = [];
    const avg_num_cards = Math.floor(new_deck.length / num_hands);
    for (let i = 0; i < num_hands; i+=1){
        hands.push(new_deck.slice(i*avg_num_cards, (i+1)*avg_num_cards));
    }
    return hands;
}


function getCardStats(id) {
    return {
        rank: (id % 52) % 13,
        suit: Math.floor((id % 52) / 13)
    }
}

function getCardSuit(id) {
    return Math.floor((id % 52) / 13);
}

function getCardRank(id) {
    return (id % 52) % 13;
}

module.exports = {newShuffledDeck, shuffleAndDeal, getCardStats, getCardSuit, getCardRank};