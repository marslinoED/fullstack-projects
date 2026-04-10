const express = require("express");
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem,
} = require("../controllers/cartsController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

// Usage example:
// const cartsRoute = require("./routes/cartsRoute");
// app.use("/api/v1/carts", cartsRoute);

router.use(protect);
router.route("/").get(getCart).post(addToCart).delete(clearCart);
router.route("/:id").delete(removeFromCart).patch(updateCartItem);
module.exports = router;
