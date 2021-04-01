const Lobby = require("../models/Lobby");
const NUM_CASES = 20;

// constructor / creating lobby tests
test("constructor / can create lobby with code", () => {
    const test_lobby = new Lobby("AAAA");
    expect(test_lobby.get().lobby_code).toBe("AAAA");
});

test("constructor / create lobby with varying capacities", () => {
    for (let i = 0; i < NUM_CASES; i+=1) {
        const test_lobby = new Lobby("AAAA", max_players=i);
        expect(test_lobby.get().max_players).toBe(i);
    }
});

test("constructor / create lobbies that allow/disallow duplicate names", () => {
    for (let i = 0; i < NUM_CASES; i+=1) {
        const state = i%2==0 ? true: false;

        const test_lobby = new Lobby("AAAA", max_players=6, dup_names=state);
        expect(test_lobby.get().dup_names).toBe(state);
    }
});

// start lobby tests
test("start / can start lobby", () => {
    const test_lobby = new Lobby("AAAA");
    const status = test_lobby.start();

    // Ensure return values are correct
    expect(status.passed).toBe(true);
    expect(test_lobby.started()).toBe(true);
});

test("start / won't start lobby if lobby already started", () => {
    const test_lobby = new Lobby("AAAA");
    test_lobby.start();
    const status = test_lobby.start();

    // Ensure return values are correct
    expect(status.passed).toBe(false);
});

// stop lobby tests
test("stop / can stop lobby", () => {
    const test_lobby = new Lobby("AAAA");
    test_lobby.start();
    const status = test_lobby.stop();

    // Ensure return values are correct
    expect(status.passed).toBe(true);
    expect(test_lobby.started()).toBe(false);
});

test("stop / won't stop lobby if haven't started", () => {
    const test_lobby = new Lobby("AAAA");
    const status = test_lobby.stop();

    // Ensure return values are correct
    failed(status);
});

// Add player tests
test("addPlayer / can add player to lobby", () => {
    const test_lobby = new Lobby("AAAA");
    const status = test_lobby.addPlayer("New Player");

    // One player in lobby and correct return values
    expect(test_lobby.getPlayerCount()).toBe(1);
    passed(status);
});

test("addPlayer / won't add if past capacity", () => {
    for (let i = 0; i < NUM_CASES; i+=1) {
        const test_lobby = new Lobby("AAAA", max_players=i);

        for (let j = 0; j < NUM_CASES; j+=1) {
            test_lobby.addPlayer(`${j}`);
        }

        expect(test_lobby.getPlayerCount()).toBe(i);
    }
});

test("addPlayer / won't add if game already started", () => {
    const test_lobby = new Lobby("AAAA");
    test_lobby.start();

    const status = test_lobby.addPlayer("New Player");
    failed(status);
});

// Remove player test
test("removePlayer / can remove players from lobby", () => {
    for (let i = 0; i < NUM_CASES; i+=1) {
        const test_lobby = new Lobby("AAAA", max_players=i);

        const local_ids = [];

        for (let j = 0; j < NUM_CASES; j+=1) {
            const status = test_lobby.addPlayer(`${j}`);
            if (status.passed)
                local_ids.push(status.data.local_id);
        }

        local_ids.forEach(id => {
            test_lobby.removePlayer(id);
        });

        expect(test_lobby.getPlayerCount()).toBe(0);
    }
});

test("removePlayer / recognizes player does not exist in lobby", () => {
    const test_lobby = new Lobby("AAAA");
    test_lobby.addPlayer("New Player");

    failed(test_lobby.removePlayer("NONE"));
});

// Add and remove
test("addPlayer / removePlayer / can work in conjunction", () => {
    for (let i = 0; i < NUM_CASES; i+=1) {
        const test_lobby = new Lobby("AAAA", max_players=i);

        const local_ids = [];
        for (let j = 0; j < NUM_CASES; j+=1) {
            const status = test_lobby.addPlayer(`${j}`);
            if (status.passed)
                local_ids.push(status.data.local_id);
        }
        local_ids.forEach(id => test_lobby.removePlayer(id));

        const local_ids2 = [];
        for (let j = 0; j < NUM_CASES; j+=1) {
            const status = test_lobby.addPlayer(`${j}${j}`);
            if (status.passed)
                local_ids2.push(status.data.local_id);
        }
        local_ids2.forEach(id => test_lobby.removePlayer(id));

        expect(test_lobby.getPlayerCount()).toBe(0);
    }
});

// Change player name
test("setPlayerName / can change a player's name", () => {
    const test_lobby = new Lobby("AAAA");
    const local_id = test_lobby.addPlayer("New Player").data.local_id;

    passed(test_lobby.setPlayerName(local_id, "Old player"));
    const players = test_lobby.getPlayers();

    expect(players[0]).toBe("Old player");
});

test("setPlayerName / can recognize player doesn't exist", () => {
    const test_lobby = new Lobby("AAAA");
    const local_id = test_lobby.addPlayer("New Player").data.local_id;

    failed(test_lobby.setPlayerName(local_id + 1, "Old player"));
});

// Can recieve player list from Lobby
test("getPlayers / returns correct player list", () => {
    const test_lobby = new Lobby("AAAA");

    const names = [];
    const local_ids = [];

    // Add players with various names to lobby and expect to get them back
    for (let i = 0; i < NUM_CASES; i += 1) {
        status = test_lobby.addPlayer(`${i}`) 
        if (status.passed) {
            names.push(`${i}`);
            local_ids.push(status.data.local_id);
        }
    }
    test_lobby.getPlayers().forEach(name => {
        expect(names.includes(name)).toBe(true);
    });
    expect(test_lobby.getPlayers()).toStrictEqual(names);

    // Remove all players and expect return list to be empty
    local_ids.forEach(id => {
        test_lobby.removePlayer(id);
    });
    expect(test_lobby.getPlayers.length).toBe(0);
});

function passed(obj) {
    expect(obj.passed).toBe(true);
}

function failed(obj) {
    expect(obj.passed).toBe(false);
}