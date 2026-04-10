const express = require("express");
const {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
} = require("../controllers/usersController");

const { restrictTo, protect } = require("../controllers/authController");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(protect, restrictTo("admin"), getUsers)
  .post(protect, restrictTo("admin"), createUser);
router
  .route("/:id")
  .get(getUserById)
  .patch(protect, restrictTo("admin"), updateUser)
  .delete(protect, restrictTo("admin"), deleteUser);
module.exports = router;
