const { JSDOM } = require("jsdom");
const lobbies = require("./models/Lobbies");
const { window } = new JSDOM();
const CPile = require("./utils/gameCPile");
const PQueue = require("./utils/gamePQueue");
const {newShuffledDeck, shuffleAndDeal, getCardStats} = require("./utils/genCards");


// Sample player hand
const hand = [
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 3]
];

const hand_int = [
    50,
    50,
    50,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    2
]

var card_set = [];
for (let i = 1; i < 14; i+=1) {
    for(let j = 0; j < 4; j+=1) {
        card_set.push({
            val: [i, j],
            id: -1
        });
    }
}


const test = new Map();
for (let i = 0; i < 500; i+=1) {
    test.set(`${i}`, "aaaaa");
}

players_name = ["Psyduck", "Bapoi", "BigDuck", "asdsd", "asdds", "dsgs"];
players_LID = [0, 1, 2, 4, 5, 6];
players_SID = ["ASDASD", "SAEFAD", "GWGWRGWRG", "AWGWGWGV", "ASVFEQWG", "AGWGVWG"];  

const new_obj = players_name.map( (name, index) => {
    return {player_name: name, LID: players_LID[index]}
});


const p_queue = new PQueue(10);
p_queue.remove(1);
p_queue.remove(2);

var arr_queue = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
var dced_players = [1, 2];
var counter = 0;

const temp_val = 38;
console.log(getCardStats(38));

var start = window.performance.now();
/*
for (let i = 0; i < 10; i += 1) {
    const rank = (temp_val % 52) % 12;
    const val = (temp_val % 52) / 4;
    console.log({rank: rank, val: val});
    //const rank = card_set[temp_val].val;
}
*/

/*
for (let i = 0; i < 100000; i += 1) {
    var player = arr_queue[counter];
    while(dced_players.includes(player)) {
        counter += 1;
        counter %= 10;
        player = arr_queue[counter];
    }
    counter += 1;
    counter %= 10;
}
*/

var end = window.performance.now();
console.log(end-start);