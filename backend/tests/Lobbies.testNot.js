const lobbies = require("../models/Lobbies");
const str_generator = require("../utils/genRdmStr");
const NUM_CASES = 1; // 5000


/**
 * _____________________________________________________________________________
 * create()
 */
test("create() / can create lobbies" , () => {

    // Create 10 lobbies
    const lobby_codes = setUpLobbies(count=NUM_CASES);

    // get all info and lobby exists for each code
    var all_lobbies = lobbies.getAll().data;
    const existing_codes = Object.keys(all_lobbies)
    expect(existing_codes.sort()).toStrictEqual(lobby_codes.sort());
});

test("create() / will not create duplicate lobbies", () => {
    lobbies.clearAll();
    const lobby_codes = [];

    for (let i = 0; i < NUM_CASES; i += 1) {
        const result = lobbies.create(6, false, 1);
        lobby_codes.push(result.data.lobby_code);
    }
    
    const duplicates = new Set(lobby_codes).size != lobby_codes.length
    expect(duplicates).toBe(false);
});


/**
 * _______________________________________________________________________________
 * delete()
 */
test("delete() / can delete a lobby", () => {
    lobby_codes = setUpLobbies(count=NUM_CASES)

    // Delete lobbies by passing codes individually
    for (let i = 0; i < NUM_CASES; i += 1) {
        const result = lobbies.delete(lobby_codes[i]);
        expect(result.passed).toBe(true);
    };

    // Check to make sure no lobbies exist
    expect(lobbies.getAll().data).toStrictEqual({});
});

test("deleteLobby recognizes lobby doesn't exist | deleteLobby", () => {
    lobbies.clearAll();

    // Make 40 delete requests using codes that don't point to lobbies
    for (let i = 0; i < NUM_CASES; i += 1) {
        const result = lobbies.delete(str_generator.genCode());
        properFail(result);
    };

    expect(lobbies.getAll().data).toStrictEqual({});
});

/**
 * ________________________________________________________________________________
 * start()
 */
test("start() / Can set a lobby's game to started", () => {
    // Make lobbies and store
    lobby_codes = setUpLobbies(count=NUM_CASES);

    // Set all lobbies to started
    lobby_codes.forEach(code => {
        lobbies.start(code)
        expect(lobbies.get(code).data.game_started).toBe(true);
    });
});

test("start() / Warns if lobby is already started", () => {
    // Make lobbies and store
    lobby_codes = setUpLobbies(count=NUM_CASES);

    // Set all lobbies to started. Set again and check for fail
    lobby_codes.forEach(code => {
        lobbies.start(code)
        expect(lobbies.start(code).passed).toBe(false);
    });
});

test("start() / Can recognize non-existent lobbies", () => {
    lobbies.clearAll();

    // Make start requests to non-existent lobbies
    for (let i = 0; i < NUM_CASES; i += 1) {
        properFail(lobbies.start(str_generator.genCode()));
    };
});

/**
 * ________________________________________________________________________________
 * delete()
 */
test("stop() / can stop lobbies that are started", () => {
    const lobby_codes = setUpLobbies(count=NUM_CASES);

    // Set all lobbies to started, stop, and check
    lobby_codes.forEach(code => {
        lobbies.start(code);
        expect(lobbies.stop(code).passed).toBe(true);
        expect(lobbies.get(code).data.game_started).toBe(false)
    });
});

test("stop() / Warns if lobby hasn't started", () => {
    const lobby_codes = setUpLobbies(count=NUM_CASES);

    // Set all lobbies to started. Set stop twice and check for fail
    lobby_codes.forEach(code => {
        lobbies.start(code);
        lobbies.stop(code);
        expect(lobbies.stop(code).passed).toBe(false);
    });
});

test("stop() / Can recognize non-existent lobbies", () => {
    lobbies.clearAll();

    // Make start requests to non-existent lobbies
    for (let i = 0; i < NUM_CASES; i += 1) {
        properFail(lobbies.stop(str_generator.genCode()));
    };
});

/**
 * ____________________________________________________________________________
 * addPlayer()
 */
test("addPlayer() / can add players to lobbies", () => {
    const lobby_codes = setUpLobbies(count=NUM_CASES);
    
    // Add 2 players to each lobby
    for (let i = 0; i < NUM_CASES; i += 1) {
        const r1 = lobbies.addPlayer(lobby_codes[i], `a${i}`, str_generator.genCode());
        const r2 = lobbies.addPlayer(lobby_codes[i], `b${i}`, str_generator.genCode());
        expect(r1.passed).toBe(true);
        expect(r2.passed).toBe(true);
    }

    // Check that each lobby contains two players
    lobby_codes.forEach(code => {
        expect(lobbies.get(code).data.players.length).toBe(2);
    });

    expect(lobbies.getLobbyOf("NON EXISTENT").passed).toBe(false);
});

test("addPlayer() / won't add players past max capacity of lobby", () => {

    // Create lobbies with varying capacities
    const lobby_codes = setUpLobbies(count=NUM_CASES, variation=true);

    // Add 10 players to each and check number is correct
    lobby_codes.forEach(code => {
        for (let i = 0; i < 10; i += 1) {
            lobbies.addPlayer(code, `${i}`, `${i}`);
        }
        const lobby_info = lobbies.get(code).data
        expect(lobby_info.players.length).toStrictEqual(lobby_info.max_players);

        const result = lobbies.addPlayer(code, "Won't fit", "Sample Name");
        properFail(result);
    });
});

test("addPlayer() / recognizes lobby doesn't exist | addPlayer", () => {
    // Make start requests to non-existent lobbies
    for (let i = 0; i < NUM_CASES; i += 1) {
        const result = lobbies.addPlayer(str_generator.genCode());
        properFail(result);
    };
});


/**
 * _________________________________________________________________________________
 * removePlayer()
 */
test("removePlayer() / can remove existing player", () => {
    lobby_codes = setUpLobbies(count=NUM_CASES);

    // Add and remove 2 players to each lobby
    for (let i = 0; i < NUM_CASES; i += 1) {
        lobbies.addPlayer(lobby_codes[i], `a${i}`, str_generator.genCode());
        lobbies.addPlayer(lobby_codes[i], `b${i}`, str_generator.genCode());
        const r1 = lobbies.removePlayer(lobby_codes[i], `a${i}`);
        const r2 = lobbies.removePlayer(lobby_codes[i], `b${i}`);
    }

    // Check that each lobby is empty
    lobby_codes.forEach(code => {
        expect(lobbies.get(code).data.players.length).toBe(0);
    });
});

test("removePlayer recognizes player doesn't exist in lobby | createLobby addPlayer", () => {
    lobby_codes = setUpLobbies(count=NUM_CASES);

    // Remove a player that doesn't exist in each lobby
    lobby_codes.forEach(code => {
        const result = lobbies.removePlayer(code, "FAKE SOCKET ID");
        expect(result.passed).toBe(false);
    });
});

test("removePlayer() / recognizes lobby doesn't exist | removePlayer", () => {
    lobbies.clearAll();

    // Make start requests to non-existent lobbies
    for (let i = 0; i < NUM_CASES; i += 1) {
        const result = lobbies.removePlayer(str_generator.genCode());
        properFail(result);
    };
});

/**
 * ________________________________________________________________________________
 * setPlayerName()
 */
test("setPlayerName() / can change a player's name", () => {
    lobby_codes = setUpLobbies(count=NUM_CASES);

    // Add a player to each lobby, change their name, and check afterwards
    lobby_codes.forEach(code => {
        lobbies.addPlayer(code, `socket_id`, `name1`);
        lobbies.setPlayerName(code, `socket_id`, `name2`);
        expect(lobbies.get(code).data.players[0].nickname).toBe("name2");
    });
});

test("changeNickname recognizes player doesn't exist in lobby | createLobby changeNicknames", () => {
    lobby_codes = setUpLobbies(count=NUM_CASES);

    // Add a player to each lobby, change their name, and check afterwards
    lobby_codes.forEach(code => {
        lobbies.addPlayer(code, `socket_id`, `name1`);
        const result = lobbies.setPlayerName(code, `fake socket_id`, `name2`);
        properFail(result);
    });
});

test("changeNickname recognizes lobby doesn't exist | changeNicknames", () => {
    lobbies.clearAll();

    // Make start requests to non-existent lobbies
    for (let i = 0; i < NUM_CASES; i += 1) {
        const result = lobbies.setPlayerName(str_generator.genCode(), "N/A", "N/A");
        properFail(result);
    };
});

/**
 * __________________________________________________________________________
 * Helper functions
 */
test("lobbyExists() / can validate a lobby", () => {
    const lobby_codes = setUpLobbies(count=NUM_CASES);

    // Check to make sure each lobby exists
    lobby_codes.forEach(code => {
        expect(lobbies.exists(code)).toBe(true);
    });
});

test("nameExists() / in lobby works", () => {
    const lobby_codes = setUpLobbies(count=NUM_CASES);

    // Add a player to each lobby
    lobby_codes.forEach(code => {
        lobbies.addPlayer(code, `socket_id`, `name1`);
        expect(lobbies.hasName(code, "name1")).toBe(true);
        expect(lobbies.hasName(code, "name2")).toBe(false);
    });
});

test("isFull() / Detect whether a lobby is full or not", () => {
    const lobby_codes = setUpLobbies(count=NUM_CASES, variation=true);

    // Add 10 players to each lobby
    // Check for full if can't add anymore
    lobby_codes.forEach(code => {
        if (lobbies.get(code).data.max_players > 0)
            expect(lobbies.isFull(code)).toBe(false);
        for (let i = 0; i < 10; i+= 1) {
            const socket_id = `${code}player${i}`;
            const result = lobbies.addPlayer(code, socket_id, `${i}`);
            if (!result.passed)
                expect(lobbies.isFull(code)).toBe(true);
        }
    });
});

test("hasName() / Detects a name exist in a lobby", () => {
    const lobby_codes = setUpLobbies(count=NUM_CASES, variation=true);
    lobby_codes.forEach(code => {
        for (let i = 0; i < 10; i+= 1) {
            const socket_id = `${code}player${i}`;
            const result = lobbies.addPlayer(code, socket_id, `${i}`);
            if (result.passed)
                expect(lobbies.hasName(code, `${i}`)).toBe(true);
            else 
                expect(lobbies.hasName(code, `${i}`)).toBe(false);
            expect(lobbies.hasName(code, `${i+1}`)).toBe(false);
        }
    });

});

/**
 * ___________________________________________________________________________
 * Duplicate names
 */
test("duplicate names / Default lobby catches duplicate names", () => {
    const lobby_codes = setUpLobbies(count=NUM_CASES);

    // Add 2 players to each lobby and add one with an existing name
    lobby_codes.forEach(code => {
        lobbies.addPlayer(code, `socket_id`, `name1`);
        lobbies.addPlayer(code, `new socket_id`, `name2`);
        const result = lobbies.addPlayer(code, `newer socket_id`, `name1`);
        expect(result.passed).toBe(false);
        expect(lobbies.get(code).data.players.length).toBe(2);
    });

    // try to change the name of 1 of them
    lobby_codes.forEach(code => {
        const result = lobbies.setPlayerName(code, `new socket_id`, `name1`);
        expect(result.passed).toBe(false);
        expect(lobbies.get(code).data.players.length).toBe(2);
    });
});

test("duplicate names / Can create lobbies that allow duplicates", () => {

    // Create lobbies that allow duplicates
    lobbies.clearAll();
    const lobby_codes = []
    for (let i = 0; i < NUM_CASES; i += 1) {
        const result = lobbies.create(6, true);
        lobby_codes.push(result.data.lobby_code);
    }

    // Add 2 players to each lobby, then add one with an existing name
    lobby_codes.forEach(code => {
        lobbies.addPlayer(code, `socket_id`, `name1`);
        lobbies.addPlayer(code, `new socket_id`, `name2`);
        const result = lobbies.addPlayer(code, `newer socket_id`, `name1`);
        expect(result.passed).toBe(true);
        expect(lobbies.get(code).data.players.length).toBe(3);
    });

    // Change names such that all 3 players have the same name
    lobby_codes.forEach(code => {
        const result = lobbies.setPlayerName(code, `new socket_id`, `name1`);
        expect(result.passed).toBe(true);
        expect(lobbies.get(code).data.players.length).toBe(3);
    });
});


/**
 * ______________________________________________________________________
 * Player's connection is recorded
 */
test("connection record / records a connection when player added", () => {
    const lobby_codes = setUpLobbies(NUM_CASES);

    lobby_codes.forEach(code => {
        for (let i = 0; i < 10; i+= 1) {
            const socket_id = `${code}player${i}`;

            const result = lobbies.addPlayer(code, socket_id, `${i}`);
            if (result.passed) {
                expect(lobbies.getLobbyOf(socket_id).passed).toBe(true);
                expect(lobbies.getLobbyOf(socket_id).data.lobby_code).toStrictEqual(code);
            }
            else
                expect(lobbies.getLobbyOf(socket_id).passed).toBe(false);
        }
    });
});

test("connection record / removes a connection when player removed", () => {
    const lobby_codes = setUpLobbies(NUM_CASES);

    lobby_codes.forEach(code => {
        for (let i = 0; i < 10; i+= 1) {
            const socket_id = `${code}player${i}`;

            lobbies.addPlayer(code, socket_id, `${i}`);
            lobbies.removePlayer(code, socket_id);
            expect(lobbies.getLobbyOf(socket_id).passed).toBe(false);
        }
    });
});

test("connection record / records the correct number of sockets", () => {

    const lobby_codes = setUpLobbies(count=NUM_CASES, variation=true);

    expect(lobbies.totalPlayers().data.size).toStrictEqual(0);

    let total = 0;
    lobby_codes.forEach(code => {
        for (let i = 0; i < 10; i += 1) {
            if (lobbies.addPlayer(code, `${code}${i}`, `${i}`).passed == true)
                total += 1;
        }
    });

    expect(lobbies.totalPlayers().data.size).toStrictEqual(total);
});



/**
 * Ensures that a failed lobby operation fits the correct format
 * @param {result} result 
 */
function properFail(result) {
    expect(result.passed).toBe(false);
    expect(result.data).toStrictEqual({});
    expect(result.msg).not.toBe("");
}

/**
 * Create a number of lobbies
 * @param {int}     count       Number of lobbies to set up  
 * @param {boolean} variation   Whether lobbies created should have different settings
 * @returns                     Array of codes for all the created lobbies
 */
function setUpLobbies(count=count, variation = false) {
    lobbies.clearAll();
    const lobby_codes = []

    for (let i = 0; i < count; i += 1) {
        const result = !variation ? 
            lobbies.create():
            lobbies.create(max_players=i%10, dup_names=i%2, code_len=i%6);
        lobby_codes.push(result.data.lobby_code);
    }

    return lobby_codes;
}