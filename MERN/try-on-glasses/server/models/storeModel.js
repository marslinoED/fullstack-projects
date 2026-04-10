const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A store must belong to a user"],
      unique: [true, "A user can only have one store"],
    },
    name: {
      type: String,
      required: [true, "A store must have a name"],
      unique: [true, "This store name is already taken."],
      trim: [true, "Store name cannot have leading or trailing spaces"],
    },
    description: String,
    logo: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
