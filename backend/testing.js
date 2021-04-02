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
    "gQqmY3geL3wdmDHiAAAN"

]


const test_BS = new BS("AAAA", test_player_SIDs, test_player_names, 1);

// --------------------
var start = window.performance.now();

for (let i = 0; i < 100000; i += 1) {
    test_BS.getAllHandSize();
}

var end = window.performance.now();
console.log(end-start);