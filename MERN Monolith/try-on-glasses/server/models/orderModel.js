const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "An order must belong to a user"],
    },
    // Tracking the payment journey
    paymentMethod: {
      type: String,
      enum: ["card", "cash_on_delivery"],
      required: [true, "Please specify payment method"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: String, // From Stripe/Paymob

    total: {
      type: Number,
      required: [true, "An order must have a total amount"],
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true }, // 👈 Critical for delivery drivers
    },
    items: [
      {
        name: { type: String, required: true },
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        storeId: {
          type: mongoose.Schema.ObjectId,
          ref: "Store",
          required: true,
        },
        // status: { type: String, default: 'pending' } // Optional: for multi-vendor tracking
      },
    ],
  },
  { timestamps: true },
);

// Indexing for performance
orderSchema.index({ userId: 1, createdAt: -1 });
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
