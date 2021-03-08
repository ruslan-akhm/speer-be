var express = require("express");
var router = express.Router();

const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.use(verifyToken);

module.exports = router;
