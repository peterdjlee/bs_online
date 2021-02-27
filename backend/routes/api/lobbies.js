/*
    Methods List:

    - Must make the correct request type and supply JSON file with specific data
        - Check below for JSON requirements 
    - requests should be made to "/api/lobbies/"
        - ex. localhost:5000/api/lobbies/create, make post request and supply JSON file

    POST    /create             - Creates a new lobby with a single player
    GET     /info               - Displays all or specified lobby information
    DELETE  /delete             - Deletes a lobby
    PUT     /start              - Sets a lobby's game_started state to true
    PUT     /changeNickname     - Change a specified player's name in a specified lobby
    POST    /addPlayer          - Adds a player to the specified lobby
    DELETE  /removePlayer       - Removes a player from the specified lobby
*/

const express = require("express");
const { addPlayer } = require("../../models/LobbiesMap");
const router = express.Router();

const lobbies_map = require("../../models/LobbiesMap");


// Creates a new lobby with a single player
//   Required: {"socket_id": *INSERT*, "nickname" = *INSERT*}
//   Returns: Lobby code of the newly created lobby
router.post("/create", (req, res) => {
    const id = req.body.socket_id;
    const nickname = req.body.nickname;

    if(!id || !nickname) {
        return res.status(400).json({msg: "socket_id and nickname required"});
    }
    return return_helper(lobbies_map.createLobby(nickname, id), res);
});


// Displays all or specified lobby information
//   Requires: {"all": true} for displaying all lobbies
//   Requires: {"lobby_code": *INSERT*} for displaying specified lobby
//   Returns: Info of the lobby
router.get("/info", (req, res) => {
    if (req.body.all === true) {
        return return_helper(lobbies_map.getLobbyAll(), res);
    }

    const code = req.body.lobby_code;
    if (!code) {
        return res.status(400).json({msg: "lobby_code required or *all* key set to true"});
    }

    return return_helper(lobbies_map.getLobby(code), res);
});


// Delete a lobby
//  Required: {"lobby_code": *INSERT*} for deleting the specified lobby
//  Return: Nothing
router.delete("/delete", (req, res) => {
    const code = req.body.lobby_code;
    if (!code) return res.status(400).json({msg: "lobby_code required"});
    
    return return_helper(lobbies_map.deleteLobby(code), res);
});


// Sets a lobby's game_started state to true
//  Required: {"lobby_code": *INSERT*}
//  Return: Nothing
router.put("/start", (req, res) => {
    const code = req.body.lobby_code;
    if (!code) return res.status(400).json({msg: "lobby_code required"});

    return return_helper(lobbies_map.startLobby(code), res);
});


// Change a specified player's name in a specified lobby
//   Required: {"lobby_code": *INSERT*, "socket_id": *INSERT*, "nickname": *INSERT*}
//     Changes a player with the @socket_id inside lobby with @lobby_code 's name to @nickname
//   Returns: List of players in the lobby with @lobby_code
router.put("/changeNickname", (req, res) => {
    const code = req.body.lobby_code;
    const id = req.body.socket_id;
    const nickname = req.body.nickname;

    if (!id || !nickname || !code) 
        return res.status(400).json({msg: "lobby_code, nickname, socket_id required"});
    
    return return_helper(lobbies_map.changeNickname(code, id, nickname), res);
});


// Adds a player to the specified lobby (Will not go past maximum lobby size)
//   Required: {"lobby_code": *INSERT*, "socket_id": *INSERT*}
//   Optional: {"nickname": *INSERT*}, default is "Player"
//   Returns: List of players in the lobby with @lobby_code
router.post("/addPlayer", (req, res) => {
    const code = req.body.lobby_code;
    const id = req.body.socket_id;
    const nickname = req.body.nickname ? req.body.nickname: "Player";

    if (!id || !code) 
        return res.status(400).json({msg: "lobby_code, socket_id required"});

    return return_helper(lobbies_map.addPlayer(code, id, nickname), res);
});


// Removes a player from the specified lobby
//   Required: {"lobby_code": *INSERT*, "socket_id": *INSERT*}
//   Returns: List of players in the lobby with @lobby_code
router.delete("/removePlayer", (req, res) => {
    const code = req.body.lobby_code;
    const id = req.body.socket_id;

    if (!id || !code) 
        return res.status(400).json({msg: "lobby_code, socket_id required"});

    return return_helper(lobbies_map.removePlayer(code, id), res);
});


function return_helper(function_result, res) {
    if (function_result.passed == true) {
        return res.status(200).json(function_result.data);
    }
    else {
        return res.status(400).json({msg: function_result.msg});
    }
}


router.get('/', (req, res) => {
    res.end("Hello");
});
module.exports = router;