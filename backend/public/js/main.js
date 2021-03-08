function create_lobby() {
    const http = new XMLHttpRequest();
    const url = "http://localhost:5000/api/lobbies/create";
    http.open("POST", url);
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    http.send(JSON.stringify({}));

    http.onload=function(){
        const json = JSON.parse(http.responseText);
        window.location = "/join/" + json.lobby_code;
        return({});
    }
}