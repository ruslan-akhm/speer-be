const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");

const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken); //protecting routes

router.get("/", messageController.readMessages);
router.post("/", messageController.sendMessage);

module.exports = router;
