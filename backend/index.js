const express = require("express");
const path = require("path");

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// lobbies API Route
app.use('/api/lobbies', require("./routes/api/lobbies"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));