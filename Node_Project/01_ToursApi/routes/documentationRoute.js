const express = require("express");
const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Tours API 👋",
    hint: "Use /api/v1/tours to access tours resources",
    docs: "https://documenter.getpostman.com/view/XXXXXXX"
  });
});

module.exports = router;
