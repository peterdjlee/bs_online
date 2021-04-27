const CPile = require("../utils/gameCPile");


test("Create object successfully", () => {
    expect(new CPile()).not.toBeNull();
})


// push(), top()
test("Can push a card group to the top", () => {
    const pile = new CPile();
    pile.push(0, [1, 2], 1);
    expect(pile.top()).toStrictEqual({pos: 0, cards: [1, 2], exp_rank: 1});
});


// size(), push()
test("Can get the current number of cards", () => {
    const pile = new CPile();
    
    // Pushing 3 groups with 3 cards each => 9 total cards
    pile.push(0, [1, 2, 3], 1);
    pile.push(0, [4, 5, 6], 1);
    pile.push(0, [7, 8, 9], 1);

    expect(pile.size()).toBe(9);
});

// popAll(), push()
test("Can get all the values of the cards that were pushed", () => {
    const pile = new CPile();

    // Pushing cards 1, 2,... 9
    pile.push(0, [1, 2, 3], 1);
    pile.push(0, [4, 5, 6], 1);
    pile.push(0, [7, 8, 9], 1);

    expect(pile.popAll()).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
});