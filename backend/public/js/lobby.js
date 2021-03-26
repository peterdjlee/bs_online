const lobby_code = String(window.location).substring(String(window.location).lastIndexOf('/') + 1);


// Boot player if trying to join non-existent lobby
const xhr = new XMLHttpRequest();
xhr.open("POST", "http://localhost:5000/api/lobbies/entry");
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.send(JSON.stringify({lobby_code: lobby_code}));
xhr.onreadystatechange=function(){
    if(xhr.readyState == 4) {
        const json = JSON.parse(xhr.responseText);

        // Check if lobby allows new players
        if (json.allowed == false) {
            window.location.href = "../../";
        }

        else {
            // Lobby joine allowed -> begin socket stuff
            const socket = io();
            socket.emit("AddPlayer", 
                {lobby_code: lobby_code});

            const display_lobby_code = document.getElementById('lobby-banner');
            const display_players = document.getElementById('players');
            const nickname_form = document.getElementById('name-form');
            const start_form = document.getElementById('start-form');
            const start_button = document.getElementById('start-button');

            display_lobby_code.innerText = lobby_code;
            
            socket.on("UpdatePlayerList", (json) => {
                var player_list = "";
                (json.player_names).forEach(player => {
                    player_list += `<li class="no-bullet-list">`;
                    if(player.socket_id == socket.id)
                        player_list += `> `
                    player_list += `${player}</li>`
                });
                display_players.innerHTML = player_list;
            });

            // detecting change nickname requests from players
            nickname_form.addEventListener("submit", (e) => {
                e.preventDefault();

                const nickname = e.target.elements.nickname.value;
                e.target.elements.nickname.value = '';

                socket.emit("ChangePlayerName", 
                    {lobby_code: lobby_code,
                     nickname: nickname
                });
            });

            // When start/stop button clicked send socket
            start_form.addEventListener("submit", (e) => {
                e.preventDefault();

                if (start_button.innerText == "Start Game") {
                    socket.emit("SetLobbyState", {lobby_code: lobby_code, started: true});
                }
                else {
                    socket.emit("SetLobbyState", {lobby_code: lobby_code, started: false});
                    socket.emit("PlayCard", {lobby_code: lobby_code, cardPos: 0, pos:0});
                }
            });

            socket.on("StartGame", data => {
                start_button.style.backgroundColor = "red";
                start_button.innerText = "Stop Game";
                socket.emit("RequestGameInfo", {lobby_code: lobby_code});
            });

            socket.on("StopGame", data => {
                start_button.style.backgroundColor = "LightGreen";
                start_button.innerText = "Start Game";
            });

            socket.on("ChangePlayerNameError", data => {
                console.log(`Name change error: ${data.msg}`);
            });

            socket.on("AddPlayerError", data => {
                console.log(`Add player error: ${data.msg}`);
                window.location.href = "../../";
            });

            socket.on("UpdatePlayerHand", data => {
                console.log("Player hand");
                console.log(data);
            });

            socket.on("UpdateOtherHands", data => {
                console.log("Other hand");
                console.log(data);
            });
        }
    }
}