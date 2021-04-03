const { JSDOM } = require("jsdom");
const lobbies = require("./models/Lobbies");
const { window } = new JSDOM();
const CPile = require("./utils/gameCPile");
const PQueue = require("./utils/gamePQueue");
const {newShuffledDeck, shuffleAndDeal, getCardStats} = require("./utils/genCards");
const BS = require("./models/BS")

// --- Testing data ---
const test_player_names = ["A", "B", "C", "D", "E", "F", "G"]
const test_player_SIDs = [
    "V3s16dlBjOuC0DDTAAAB",
    "iAI66nXJFweOjbDNAAAD",
    "S-H4vQyZelOILhn1AAAF",
    "INrZQ5htWmZPgouZAAAH",
    "CTv1_mm6-Ot4htwuAAAJ",
    "OcREIckjLKn7VH3PAAAL",
    "gQqmY3geL3wdmDHiAAAN",
    "gQqmY3geL3wdmDHiAAAb",
    "gQqmY3geL3wdmDHiAAAc",
    "gQqmY3geL3wdmDHiAAAd",
    "gQqmY3geL3wdmDHiAAAe",
    "gQqmY3geL3wdmDHiAAAf",
    "gQqmY3geL3wdmDHiAAAg",
    "gQqmY3geL3wdmDHiAAAh",
    "gQqmY3geL3wdmDHiAAAj",
    "gQqmY3geL3wdmDHiAAAo",
    "gQqmY3geL3wdmDHiAAAq",
    "gQqmY3geL3wdmDHiAAAr"
    
]

const test_player_SIDs_map = new Map();
var counter = 0;
test_player_SIDs.forEach(SID => {
    test_player_SIDs_map.set(SID, counter);
    counter += 1;
});

const test_object = {
    asd: "asdd",
    esd: "wff",
    qef: "asdasd",
    qqer: 123
}

var test_deck = [];
for (let i = 0; i < 52; i+=1) test_deck.push(i);
var test_rm_deck = [];
for (let i = 26; i < 52; i+=1) test_rm_deck.push(i);

const test_BS = new BS("AAAA", test_player_SIDs, test_player_names, 1);

// --------------------
var start = window.performance.now();


for (let i = 0; i < 1; i += 1) {

    const new_deck = test_deck.filter(card => !test_rm_deck.includes(card));
    
    /*
    var new_deck = [];
    for (const card in test_deck) {
        if (!test_rm_deck.includes(card))
            new_deck.push(card);
    }
    */
    /*
    test_rm_deck.forEach(card => {
        test_deck.splice(test_deck.indexOf(card), 1);
    });
    */

}

var end = window.performance.now();
console.log(end-start);