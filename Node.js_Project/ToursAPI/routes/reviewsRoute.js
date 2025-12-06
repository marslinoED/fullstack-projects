const express = require("express");
const {
  getAllReviews,
  getReviewById,
  createReview,
  deleteReviewById,
  setTourUserIds,
  updateReviewById,
} = require("../controllers/reviewsController");

const {
  protect,
  restrictTo,
  checkOwnership,
} = require("../controllers/authController");

const { checkTourExists } = require("../controllers/toursController");
const Review = require("../models/reviewModel");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllReviews)
  .post(
    protect,
    restrictTo("user", "admin"),
    checkTourExists,
    setTourUserIds,
    createReview
  );
router
  .route("/:id")
  .get(protect, getReviewById)
  .delete(
    protect,
    restrictTo("user", "admin"),
    checkOwnership(Review),
    deleteReviewById
  )
  .patch(
    protect,
    restrictTo("user", "admin"),
    checkOwnership(Review),
    updateReviewById
  );

module.exports = router;
