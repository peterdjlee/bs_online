const WQueue = require("./../utils/gameWQueue");


test("Create object successfully", () => {
    expect(new WQueue()).not.toBeNull();
});


// push(), pop()
test("Can push and pop a winner candidate", () => {
    const wq = new WQueue();
    wq.push(0);
    expect(wq.pop()).toBe(0);
});


// getWinners(), push(), pop()
test("Winners get stored after popping", () => {
    const wq = new WQueue();
    wq.push(0);
    wq.pop();
    wq.push(1);
    wq.pop()
    expect(wq.getWinners()).toStrictEqual([0, 1]);
})


// getWinnersCount(), push(), pop()
test("Get correct number of winner candidates", () => {
    const wq = new WQueue();

    for (let i = 0; i < 3; i += 1) {
        wq.push(0);
        wq.pop()
    }

    expect(wq.getWinnersCount()).toBe(3);
});


// remove(), getWinnersCount(), push(), pop()
test("Can stop a winner from getting stored by removing them before pop", () => {
    const wq = new WQueue();

    wq.push(0);
    wq.remove(0);
    wq.pop();

    expect(wq.getWinnersCount()).toBe(0);
});
