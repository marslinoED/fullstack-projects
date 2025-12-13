const express = require("express");

const router = express.Router({ mergeParams: true });

router.post("/webhook/post-pay", express.json(), (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});
router.get("/webhook/redirect", express.json(), (req, res) => {
  res.status(201).json({
    status: "success",
    data: "Paymob webhook is set up successfully",
    body: req.body,
  });
});

module.exports = router;
