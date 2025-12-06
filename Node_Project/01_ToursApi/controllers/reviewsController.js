const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

// Middlewares
// setTourUserIds middleware
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tourRef) req.body.tourRef = req.params.tourId;
  if (!req.body.userRef) req.body.userRef = req.user._id;
  next();
};
const buildReviewFilter = (req) => {
  const filter = {};
  if (req.params.tourId) filter.tourRef = req.params.tourId;
  if (req.user && req.user._id) filter.userRef = req.user._id;

  return filter;
};

// Functions
// Get all Reviews
exports.getAllReviews = factory.getAll(Review, [], (req) =>
  buildReviewFilter(req)
);

// Get Review by ID
exports.getReviewById = factory.getOneById(Review, {
  path: "userRef tourRef",
  select: "name email summary",
});

// Create a new review
exports.createReview = factory.createOne(Review);

// Update a review by ID
exports.updateReviewById = factory.updateOneById(Review);

// Delete a review by ID (soft delete)
exports.deleteReviewById = factory.deleteOne(Review);
