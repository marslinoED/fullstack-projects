const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A product must belong to a user"],
    },
    storeId: {
      type: mongoose.Schema.ObjectId,
      ref: "Store",
      required: [true, "A product must belong to a store"],
    },
    name: {
      type: String,
      required: [true, "A product must have a name"],
      trim: [true, "Product name cannot have leading or trailing spaces"],
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
      min: [0, "Price cannot be negative"],
    },

    description: {
      type: String,
      required: [true, "A product must have a description"],
    },

    assets: {
      modelUrl: {
        type: String,
      },
      thumbnailUrl: {
        type: String,
        required: [true, "A thumbnail image is required"],
      },
      imageUrls: [String], // Array of strings for additional product photos
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
const product = mongoose.model("product", productSchema);

module.exports = product;
