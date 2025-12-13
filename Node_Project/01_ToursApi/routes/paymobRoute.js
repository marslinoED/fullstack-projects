const express = require("express");

const router = express.Router({ mergeParams: true });

router.post("/webhook", express.json(), (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

module.exports = router;
