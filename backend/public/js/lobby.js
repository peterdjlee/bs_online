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
            socket.emit('api/lobbies/addPlayer', 
                {lobby_code: lobby_code});

            const display_lobby_code = document.getElementById('lobby-banner');
            const display_players = document.getElementById('players');
            const nickname_form = document.getElementById('name-form');
            const start_form = document.getElementById('start-form');
            const start_button = document.getElementById('start-button');

            display_lobby_code.innerText = lobby_code;
            
            // More accurately = socket.on("UpdatePlayerLists")
            socket.on("ret/lobbies/addPlayer", (json) => {
                var player_list = "";
                (json.players).forEach(player => {
                    player_list += `<li class="no-bullet-list">`;
                    if(player.socket_id == socket.id)
                        player_list += `> `
                    player_list += `${player.nickname}</li>`
                });
                display_players.innerHTML = player_list;
            });

            // detecting change nickname requests from players
            nickname_form.addEventListener("submit", (e) => {
                e.preventDefault();

                const nickname = e.target.elements.nickname.value;
                e.target.elements.nickname.value = '';

                socket.emit("api/lobbies/changeNickname", 
                    {lobby_code: lobby_code,
                     nickname: nickname
                });
            });

            // When start/stop button clicked send socket
            start_form.addEventListener("submit", (e) => {
                e.preventDefault();

                socket.emit("api/lobbies/start", 
                    {lobby_code: lobby_code}
                )
            });

            // More accurately = socket.on("GameStateChange"), state as in game has started or not
            socket.on("ret/lobbies/start", (json) => {
                if (json.started == true) {
                    start_button.style.backgroundColor = "red";
                    start_button.innerText = "Stop Game";
                }
                else {
                    start_button.style.backgroundColor = "LightGreen";
                    start_button.innerText = "Start Game";
                }
            });
        }
    }
}