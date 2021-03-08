const express = require("express");
const router = express.Router();
const path = require("path");

const views = path.join(__dirname, "../", "public")

router.get('/', (req, res) => {
    res.sendFile(path.join(views, 'index.html'));
});

router.get("/join/:id", (req, res) => {
    res.sendFile(path.join(views, "lobbies.html"));
});

module.exports = router;