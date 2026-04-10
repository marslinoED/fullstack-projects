const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A review must belong to a user"],
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "A review must belong to a product"],
    },
    rating: {
      type: Number,
      required: [true, "A review must have a rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      maxlength: [200, "Comment cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
