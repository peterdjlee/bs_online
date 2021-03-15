const card_gen = require("../utils/genCards");
const NUM_CASES = 10;

test("generates an array of 52 valid and unique cards", () => {
    const valid_suits = ['c', 'h', 's', 'd'];
    const valid_ranks = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'T', 'J', 'Q', 'K'];

    for (let i = 0; i < NUM_CASES; i += 1) {
        const new_deck = card_gen.newShuffledDeck();

        // Verify each element is a proper card representation
        new_deck.forEach(card => {
            expect(valid_ranks.includes(card[0])).toBe(true);
            expect(valid_suits.includes(card[1])).toBe(true);
        });

        // Verify that the deck does not contain duplicate cards
        const duplicates = new Set(new_deck).size != new_deck.length;
        expect(duplicates).toBe(false);
    }
});

test("decks generated aren't exact copies of eachother", () => {
    for (let i = 0; i < NUM_CASES; i += 1) {
        const deck_1 = card_gen.newShuffledDeck();
        const deck_2 = card_gen.newShuffledDeck();

        // Expect both decks to not have cards in the exact same order
        var mismatch = 0;
        for (let i = 0; i < deck_1.length; i+=1) {
            if (deck_1[i] != deck_2[i])
                mismatch += 1;
        }
        expect(mismatch).toBeGreaterThan(0);
    }
});

test("can generate a deck with n times the base amount of cards", () => {
    const max_n = 5;
    const single_deck_size = card_gen.newShuffledDeck(1).length;

    for (let i = 0; i < max_n; i+=1) {
        const nth_deck_size = card_gen.newShuffledDeck(i).length;
        expect(nth_deck_size).toStrictEqual(i*single_deck_size);
    }
});

test("nth size decks generated have the correct number of duplicates", () => {
    const max_n = 5;
    const single_deck = card_gen.newShuffledDeck(1);

    for (let n = 0; n < max_n; n+=1) {

        // Generate a new sorted deck from n decks of cards
        const nth_deck = card_gen.newShuffledDeck(n).sort();

        // ensure every n cards is the exact same
        for(let i = 0; i < nth_deck.length; i+=n) {
            const card = nth_deck[i]
            for(let j = i + 1; j < i + n; j+=1) {
                expect(nth_deck[j]).toStrictEqual(card);
            }
        }
    }
});


test("shuffleAndDeal / deals expected number of cards to each player", () => {
    // 1 deck + 5 players
    const arr_hands = card_gen.shuffleAndDeal(num_hands=5);

    arr_hands.forEach(hand => {
        // 52 cards -> 5 players, every player should have 5 cards
        expect(hand.length).toStrictEqual(10);
    });
});


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