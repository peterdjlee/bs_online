const PQueue = require("./../utils/gamePQueue");


test("Create object successfully", () => {
    expect(new PQueue(5)).not.toBeNull();
});


// getCount(), constructor()
test("Return number of players in queue", () => {
    const pq = new PQueue(10);
    expect(pq.getCount()).toBe(10);
});


// getCurrent(), constructor(), next()
test("Get current player's position value", () => {
    const pq = new PQueue(5);
    pq.next(); // Yes you have to call next to get first player. I dont wanna go back and fix it. I dont care.
    
    // First player is always pos = 0
    expect(pq.getCurrent()).toBe(0);
});


// next(), getCurrent(), constructor()
test("Can get the next player's pos", () => {
    const pq = new PQueue(5);
    pq.next();

    // Player following 0 is 1
    pq.next();
    expect(pq.getCurrent()).toBe(1);
});


// next(), getCurrent(), constructor()
test("Can cycle back to first player after calling enough nexts", () => {
    const pq = new PQueue(5);
    pq.next();

    for (let i = 0; i < 5; i += 1) pq.next();
    expect(pq.getCurrent()).toBe(0);
});


// remove(), next(), getCurrent(), constructor()
test("Remove a player from the queue and order is still maintained", () => {
    const pq = new PQueue(5);
    pq.next();
    
    // Imagine player pos 3 leaves
    pq.remove(3);

    // Calling next 3 times should give pos 4, not pos 3
    for (let i = 0; i < 3; i += 1) pq.next();
    expect(pq.getCurrent()).toBe(4);

    // Since only 4 players left, on 4th next the current player should be 0
    pq.next();
    expect(pq.getCurrent()).toBe(0);
});
