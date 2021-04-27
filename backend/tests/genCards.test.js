const card_gen = require("../utils/genCards");


// newShuffledDeck()
test("generates an array of 52 valid and unique cards", () => {
    const new_deck = card_gen.newShuffledDeck();

    // 52 unique card values
    expect(new Set(new_deck).size).toBe(new_deck.length);

    // Verify each element is a proper card representation
    new_deck.forEach(card => {
        expect(card >= 0 && card <= 51).toBe(true);
    });
});


// newShuffledDeck()
test("generated deck is actually shuffled (VERY LOW CHANCE OF FAIL)", () => {
    const deck_1 = card_gen.newShuffledDeck();
    const deck_2 = card_gen.newShuffledDeck();

    // Expect both decks to not have cards in the exact same order
    var mismatch = 0;
    for (let i = 0; i < deck_1.length; i+=1) {
        if (deck_1[i] != deck_2[i])
            mismatch += 1;
    }
    expect(mismatch).toBeGreaterThan(0);
});


// newShuffledDeck()
test("can generate a deck with n times the base amount of cards", () => {
    const max_n = 5;
    const single_deck_size = card_gen.newShuffledDeck(1).length; // 52 cards in 1 deck

    // Check sizes of deck makes sense given a number representing number of decks to use
    for (let i = 0; i < max_n; i+=1) {
        const nth_deck_size = card_gen.newShuffledDeck(i).length;
        expect(nth_deck_size).toStrictEqual(i*single_deck_size);
    }
});


// newShuffledDeck()
test("nth size decks generated have the correct number of duplicates", () => {
    const max_n = 5;

    for (let n = 1; n < max_n; n+=1) {

        const new_deck = card_gen.newShuffledDeck(n);

        // 52 * n unique card values
        expect(new Set(new_deck).size).toBe(new_deck.length);
    }
});


// newShuffledDeck()
test("shuffleAndDeal / deals expected number of cards to each player", () => {
    // 1 deck + 5 players
    const arr_hands = card_gen.shuffleAndDeal(num_hands=5);

    arr_hands.forEach(hand => {
        // 52 cards -> 5 players, every player should have 10 cards
        expect(hand.length).toStrictEqual(10);
    });
});


// shuffleAndDeal()
test("shuffleAndDeal / no two players have the exact same card", () => {
    // 1 deck + 5 players
    const arr_hands = card_gen.shuffleAndDeal(num_hands=5);
    
    const all_cards = [];
    arr_hands.forEach(hand => {
        hand.forEach(card => {
            all_cards.push(card);
        });
    })

    // Verify that the total cards list does not contain duplicate cards
    const duplicates = new Set(all_cards).size != all_cards.length;
    expect(duplicates).toBe(false);
});


// getCardStats()
test("get current stats for a certain card value", () => {

    /*
       card values:
       0 - 12: ace -> king of suit 0
       13 - 25      "         suit 1
       26 - 38      "         suit 2
       39 - 51      "         suit 3
    */
    
    expect(card_gen.getCardStats(27)).toStrictEqual({rank: 1, suit: 2}); 
    expect(card_gen.getCardStats(51)).toStrictEqual({rank: 12, suit: 3});  
    expect(card_gen.getCardStats(19)).toStrictEqual({rank: 6, suit: 1});
}); 


// getCardSuit()
test("get current stats for a certain card value", () => {
    expect(card_gen.getCardSuit(27)).toStrictEqual(2); 
    expect(card_gen.getCardSuit(51)).toStrictEqual(3);  
    expect(card_gen.getCardSuit(19)).toStrictEqual(1);
}); 


// getCardRank()
test("get current stats for a certain card rank", () => {
    expect(card_gen.getCardRank(27)).toStrictEqual(1); 
    expect(card_gen.getCardRank(51)).toStrictEqual(12);  
    expect(card_gen.getCardRank(19)).toStrictEqual(6);
}); 