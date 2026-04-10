const express = require("express");
const {
  doSomething,
  doSomethingWithId,
} = require("../controllers/reviewsController");

const router = express.Router({ mergeParams: true });

router.route("/").get(doSomething);
router.route("/:id").get(doSomethingWithId);

// Usage example:
// const reviewsRoute = require("./routes/reviewsRoute");
// app.use("/api/v1/reviews", reviewsRoute);

module.exports = router;
