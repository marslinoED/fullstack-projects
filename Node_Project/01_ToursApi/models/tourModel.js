const mongoose = require("mongoose");
const Review = require("./reviewModel");
// const { validate } = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
    },
    duration: Number,
    maxGroupSize: {
      type: Number,
      // validate: {
      //   validator: function (value) {
      //     // 'this' refers to the current document on create/save
      //     if (this.difficulty === "difficult") {
      //       // for difficult tours, group size must be between 1 and 5
      //       return value > 0 && value <= 5;
      //     }
      //     // for other difficulties, just ensure it's positive
      //     return value > 0;
      //   },
      //   message: "Max group size for difficult tours must be between 1 and 5",
      // },
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    startDates: [Date],
    locations: {
      type: [
        {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: {
            type: [Number],
            maxlength: [2, "Coordinates must have longitude and latitude"],
            minlength: [2, "Coordinates must have longitude and latitude"],
          },
          address: String,
          description: String,
          day: Number,
        },
      ],
      // validate: {
      //   validator: function (val) {
      //     return val.length >= 1; // Must have at least one location
      //   },
      //   message: "A tour must have at least one location",
      // },
    },
    startLocation: {
      type: {
        type: "String",
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        maxlength: [2, "Coordinates must have longitude and latitude"],
        minlength: [2, "Coordinates must have longitude and latitude"],
      },
      address: String,
      description: String,
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.index({ startLocation: "2dsphere" });
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tourRef",
  localField: "_id",
});

// tourSchema.virtual("test").get(function () {
//   return this.reviews + " virtual field";
// });

tourSchema.pre("save", function (next) {
  this.startLocation = this.locations[0];
  next();
});
tourSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
