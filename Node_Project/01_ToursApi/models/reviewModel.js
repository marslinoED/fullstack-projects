// review, rating, userRef, tourRef, createdAt

const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review text is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    tourRef: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.index({ tourRef: 1, userRef: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tourRef: tourId },
    },
    {
      $group: {
        _id: "$tourRef",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Tour").findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await mongoose.model("Tour").findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};
// Calculate average ratings after save
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRatings(this.tourRef);
});
// Calculate average ratings before remove
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.model.findOne(this.getQuery());
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.review.constructor.calculateAverageRatings(this.review.tourRef);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
