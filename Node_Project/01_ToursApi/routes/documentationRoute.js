const express = require("express");
const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Tours API",
    try: "Use /api/v1/tours to access tours resources",
    go_to: "Use /api-docs for API documentation",
    docs: "https://documenter.getpostman.com/view/XXXXXXX",
  });
});

router.get("/api-docs", (req, res) => {
  res.redirect("https://documenter.getpostman.com/view/XXXXXXX");
});

module.exports = router;
