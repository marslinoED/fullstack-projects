const express = require("express");
const {
  signUp,
  login,
} = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.post("/signup", signUp);
router.post("/login", login);

// TODO: Implement logout functionality 
// router.post("/forgotPassword", forgotPassword);
// router.patch("/resetPassword/:token", resetPassword);


module.exports = router;
