const express = require("express");
const {
  sendSignal,
} = require("../controllers/signalController");
const router = express.Router({ mergeParams: true });

router.route("/").post(sendSignal);


module.exports = router;
