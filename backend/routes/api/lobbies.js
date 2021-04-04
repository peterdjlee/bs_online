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
        Type: POST
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
________________________________________________________________________________________________
    /api/lobbies/exists - Check if a lobby with given code exists
        Type: POST
        Req: lobby code to check
            ex. {
                    "lobby_code": "AAAA"
                }
        Ret: bool exists to represent result
            ex. {
                    "exists": false
                }
________________________________________________________________________________________________
    /api/lobbies/started - Check if a lobby with given code started
        Type: POST
        Req: lobby code to check
            ex. {
                    "lobby_code": "AAAA"
                }
        Ret: bool exists to represent result
            ex. {
                    "started": false
                }
_________________________________________________________________________________________________
*/

const express = require("express");
const router = express.Router();
const lobbies = require("../../models/Lobbies");

router.post("/create", (req, res) => {
    return retHTTP(lobbies.create(), res);
});

router.post("/info", (req, res) => {
    // "Returning all lobbies" operation of /info has priority
    if (req.body.all === true) {
        return retHTTP(lobbies.getAll(), res);
    }

    const code = req.body.lobby_code;
    if (!code) {
        return res.status(400).json({msg: "lobby_code required or *all* key set to true"});
    }

    return retHTTP(lobbies.get(code), res);
});

router.post("/exists", (req, res) => {
    const code = req.body.lobby_code;
    
    if (!code)
        return res.status(400).json({msg: "lobby_code required"});
    
    return lobbies.exists(code) ?
        res.status(200).json({exists: true}):
        res.status(200).json({exists: false});
})

router.post("/started", (req, res) => {
    const code = req.body.lobby_code;
    
    if (!code)
        return res.status(400).json({msg: "lobby_code required"});
    
    return lobbies.isStarted(code) ?
        res.status(200).json({started: true}):
        res.status(200).json({started: false});
});

router.post("/entry", (req, res) => {
    const code = req.body.lobby_code;

    if (!code)
        return res.status(400).json({msg: "lobby_code required"});
    
    return lobbies.allowEntry(code) ?
        res.status(200).json({allowed: true}):
        res.status(200).json({allowed: false});
});

// Helps return the appropriate HTTP status code based on requested function returns
function retHTTP(function_result, res) {
    if (function_result.passed == true) {
        return res.status(200).json(function_result.data);
    }
    else {
        return res.status(400).json({msg: "Server error. Check server console for more info."});
    }
}

module.exports = router;