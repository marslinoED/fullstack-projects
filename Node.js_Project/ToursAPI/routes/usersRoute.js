const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
  setUserRoleToUser,
} = require("../controllers/usersController");
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateLoggedUser,
  deleteLoggedUser,
  protect,
  restrictTo,
  checkOwnership,
  getMe,
  uploadUserImage,
  resizeUserImage,
} = require("../controllers/authController");

const router = express.Router();
// Nested route for reviews
// Mount the review router on the tour router
const reviewRouter = require("./reviewsRoute");
router.use("/reviews", reviewRouter);

// Auth routes
router.post("/signup", signUp);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// Protected routes for logged in users
router.use(protect);

router.get("/me", getMe, getUserById);
router.patch("/updatePassword", updatePassword);
router.patch(
  "/updateLoggedUser",
  uploadUserImage,
  resizeUserImage,
  updateLoggedUser
);
router.delete("/deleteLoggedUser", deleteLoggedUser);

// Admin only routes
router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(setUserRoleToUser, createUser);

router
  .route("/:id")
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

module.exports = router;
