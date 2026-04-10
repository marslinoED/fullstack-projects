const express = require("express");
const {
  checkout,
  getCustomerOrders,
  getStoreOrders,
  getAllOrders,
  getProductOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/ordersController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(protect);
router.post("/checkout", checkout);
router.get("/my-orders", getCustomerOrders);
router.get("/store-orders/:storeId", restrictTo("merchant"), getStoreOrders);
router.get("/product-orders/:productId", restrictTo("merchant"), getProductOrders);
router.patch("/:id/status", restrictTo("merchant"), updateOrderStatus);
router.patch("/:id/cancel", cancelOrder);
router.get("/", restrictTo("admin"), getAllOrders);

// Usage example:
// const ordersRoute = require("./routes/ordersRoute");
// app.use("/api/v1/orders", ordersRoute);

module.exports = router;
