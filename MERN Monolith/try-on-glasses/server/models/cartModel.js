const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A cart must belong to a user"],
      unique: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "Cart item must reference a product"],
        },
        quantity: {
          type: Number,
          required: [true, "Cart item must have a quantity"],
          min: [1, "Quantity must be at least 1"],
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for Item Count
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
