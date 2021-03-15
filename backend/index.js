const express = require("express");
const app = express();
const path = require("path");

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Server
const http = require('http');
const server = http.createServer(app);

// Socket.io
const { Server } = require('socket.io');
const io = new Server(server, {
  allowEIO3: true
});

// Router for testing pages COMMENT OUT LATER
app.use('/', require("./controller/test_router"));

// Socket io stuff
app.use(express.static(path.join(__dirname, "public")));
const lobby_socket = require("./controller/lobby_sockets")(io);

// lobbies API Route
app.use('/api/lobbies', require("./routes/api/lobbies"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port: ${PORT}`));