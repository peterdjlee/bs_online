/*
    Methods:
        - Find the URL for the operation you want
        - Make the specified HTTP request type
        - Supply JSON with the requirement fields
        - Get JSON back
____________________________________________________________________________________________
    /api/lobbies/create - Creates a new lobby
        Type: POST
        Requirements: Nothing
            ex. {}
        Return: Lobby code
            ex. {
                    "lobby_code": "aRgI"
                }
____________________________________________________________________________________________
    /api/lobbies/info - Displays all or specified lobby information
        Type: GET
        Req: Either lobby code for specific or optionally set "all" to true for all lobbies
            ex. {
                    "lobby_code": "ajeX",
                }
            ex. {
                    "all" : true
                }
        Ret: Lobby information
            ex. (specific)
                {
                    "lobby_code": "ajeX",
                    "game_started": false,
                    "max_players": 6,
                    "players": []
                }
            ex. (all)
                {
                    "ajeX": {
                        "lobby_code": "ajeX",
                        "game_started": false,
                        "max_players": 6,
                        "players": []
                    },
                    "Odpw": {
                        "lobby_code": "Odpw",
                        "game_started": false,
                        "max_players": 6,
                        "players": []
                    },
                    "zgNb": {
                        "lobby_code": "zgNb",
                        "game_started": false,
                        "max_players": 6,
                        "players": []
                    }
                }
____________________________________________________________________________________________
    /api/lobbies/delete - Deletes a lobby
        Type: DELETE
        Req: Lobby code for delete
            ex. {
                    "lobby_code": "aRgI"
                }
        Ret: Empty JSON
____________________________________________________________________________________________
    /api/lobbies/start - Sets a lobby's game_started state to true
        Type: PUT
        Req: Lobby to start
            ex. {
                    "lobby_code": "aRgI"
                }
        Ret: Empty JSON
____________________________________________________________________________________________
    /api/lobbies/addPlayer - Adds a player to the specified lobby
        Type: POST
        Req: lobby to add to, socket id of new player, and optionally an initial name (Default = "Player")
             Will not add if room has reached capactiy (Default = 6 players)
            ex. {
                    "lobby_code": "IIGy",
                    "socket_id": "socket_id c",
                    "nickname": "Newer Player"
                }
        Ret: List of players in the lobby
            ex. {
                    "players": [
                        {
                            "socket_id": "socket_id a",
                            "nickname": "Player"
                        },
                        {
                            "socket_id": "socket_id b",
                            "nickname": "New Player"
                        },
                        {
                            "socket_id": "socket_id c",
                            "nickname": "Newer Player"
                        }
                    ]
                }
____________________________________________________________________________________________
    /api/lobbies/changeNickname - Change a specified player's name in a specified lobby
        Type: PUT
        Req: lobby to add to, socket id of current player, new nickname
            ex. {
                    "lobby_code": "IIGy",
                    "socket_id": "socket_id a",
                    "nickname": "First Player"
                }
        Ret: List of players in the lobby
            ex. {
                    "players": [
                        {
                            "socket_id": "socket_id a",
                            "nickname": "First Player"
                        },
                        {
                            "socket_id": "socket_id b",
                            "nickname": "New Player"
                        },
                        {
                            "socket_id": "socket_id c",
                            "nickname": "Newer Player"
                        }
                    ]
                }
_____________________________________________________________________________________________
    /api/lobbies/removePlayer - Removes a player from the specified lobby
        Type: DELETE
        Req: lobby to remove player from, socket id of that player
            ex. {
                    "lobby_code": "IIGy",
                    "socket_id": "socket_id a"
                }
        Ret: List of players in the lobby
            ex. {
                    "players": [
                        {
                            "socket_id": "socket_id b",
                            "nickname": "New Player"
                        },
                        {
                            "socket_id": "socket_id c",
                            "nickname": "Newer Player"
                        }
                    ]
                }
________________________________________________________________________________________________
*/

const express = require("express");
const router = express.Router();
const lobbies = require("../../models/Lobbies");

/*
    Implementation of methods below follow a specific pattern:
        - Get data from supplied JSON
        - Check to make sure required fields are present
        - Call certain functions from the Lobbies model
        - Have return_helper decide the correct HTTP status code to return
*/

router.post("/create", (req, res) => {
    return return_helper(lobbies.createLobby(), res);
});


router.get("/info", (req, res) => {
    // Returning all lobbies operation of /info has priority
    if (req.body.all === true) {
        return return_helper(lobbies.getLobbyAll(), res);
    }

    const code = req.body.lobby_code;
    if (!code) {
        return res.status(400).json({msg: "lobby_code required or *all* key set to true"});
    }

    return return_helper(lobbies.getLobby(code), res);
});


router.delete("/delete", (req, res) => {
    const code = req.body.lobby_code;
    if (!code) return res.status(400).json({msg: "lobby_code required"});
    
    return return_helper(lobbies.deleteLobby(code), res);
});


router.put("/start", (req, res) => {
    const code = req.body.lobby_code;
    if (!code) return res.status(400).json({msg: "lobby_code required"});

    return return_helper(lobbies.startLobby(code), res);
});


router.put("/stop", (req, res) => {
    const code = req.body.lobby_code;
    if (!code) return res.status(400).json({msg: "lobby_code required"});

    return return_helper(lobbies.stopLobby(code), res);
});


router.put("/changeNickname", (req, res) => {
    const code = req.body.lobby_code;
    const id = req.body.socket_id;
    const nickname = req.body.nickname;

    if (!id || !nickname || !code) 
        return res.status(400).json({msg: "lobby_code, nickname, socket_id required"});
    
    return return_helper(lobbies.changeNickname(code, id, nickname), res);
});


router.post("/addPlayer", (req, res) => {
    const code = req.body.lobby_code;
    const id = req.body.socket_id;
    const nickname = req.body.nickname ? req.body.nickname: "Player";

    if (!id || !code) 
        return res.status(400).json({msg: "lobby_code, socket_id required"});

    return return_helper(lobbies.addPlayer(code, id, nickname), res);
});


router.delete("/removePlayer", (req, res) => {
    const code = req.body.lobby_code;
    const id = req.body.socket_id;

    if (!id || !code) 
        return res.status(400).json({msg: "lobby_code, socket_id required"});

    return return_helper(lobbies.removePlayer(code, id), res);
});


// Default page (Should probably remove)
router.get('/', (req, res) => {
    res.end("Default page");
});


// Helps return the appropriate HTTP status code based on requested function returns
function return_helper(function_result, res) {
    if (function_result.passed == true) {
        return res.status(200).json(function_result.data);
    }
    else {
        return res.status(400).json({msg: "Server error. Check server console for more info."});
    }
}


module.exports = router;