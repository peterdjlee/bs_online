const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, "test/", "index.html"));
});

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));