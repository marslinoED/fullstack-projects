const express = require("express");
const { doSomething, doSomethingWithId } = require("../controllers/tempController");
const router = express.Router({ mergeParams: true });
router.route("/").get(doSomething);
router.route("/:id").get(doSomethingWithId);
module.exports = router;
