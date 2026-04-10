const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const factory = require("./handlerFactory");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

exports.checkout = catchAsync(async (req, res, next) => {
  const { paymentMethod, shippingAddress } = req.body;

  // 1. Validations (Keep your existing ones)
  // ... (shippingAddress checks)

  const cart = await Cart.findOne({ userId: req.user._id }).populate({
    path: "items.productId",
    select: "name price storeId active quantity", // 👈 Added quantity for stock check
  });

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  const orderItems = [];
  let total = 0;

  for (const cartItem of cart.items) {
    const product = cartItem.productId;

    if (!product || product.active === false) {
      return next(new AppError("One or more products are unavailable", 400));
    }

    // 2. STOCK CHECK
    if (product.quantity < cartItem.quantity) {
       return next(new AppError(`Insufficient stock for ${product.name}`, 400));
    }

    orderItems.push({
      name: product.name,
      productId: product._id,
      quantity: cartItem.quantity,
      price: product.price,
      storeId: product.storeId,
    });

    total += product.price * cartItem.quantity;
  }

  // 3. Create Order
  const order = await Order.create({
    userId: req.user._id,
    paymentMethod,
    total: Math.round(total * 100) / 100, // 👈 Safe rounding
    shippingAddress,
    items: orderItems,
  });

  // 4. Clear Cart
  cart.items = [];
  await cart.save({ validateBeforeSave: false });

  // 5. OPTIONAL: Decrease Product Stock
  // (You should loop through and decrement product.quantity here)

  res.status(201).json({
    status: "success",
    data: { order },
  });
});

exports.getCustomerOrders = catchAsync(async (req, res, next) => {
  const userId = req.body?.user || req.user._id;
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json({ status: "success", data: { orders } });
});

exports.getStoreOrders = catchAsync(async (req, res, next) => {
  // 1. Get storeId (from params or merchant's profile)
  const storeId = req.params?.storeId || req.user.storeId;
  if (
    req.user.storeId != storeId &&
    req.user.role !== "admin" &&
    req.user.role !== "GODMODE"
  ) {
    return next(
      new AppError("You don't have access to this store's orders", 403),
    );
  }

  // 2. Find orders where the 'items' array has at least one matching storeId
  const orders = await Order.find({
    "items.storeId": storeId,
  }).populate("userId", "name email");

  // 3. OPTIONAL: Filter out the items that DON'T belong to this store
  // Use .map() so the merchant doesn't see other stores' products in the order
  const filteredOrders = orders.map((order) => {
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(
      (item) => item.storeId.toString() === storeId.toString(),
    );
    return orderObj;
  });

  res.status(200).json({
    status: "success",
    results: filteredOrders.length,
    data: { orders: filteredOrders },
  });
});
exports.getProductOrders = catchAsync(async (req, res, next) => {
  // 1. Get productId (from params)
  const productId = req.params?.productId;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  // Check if the merchant owns this product or is an admin
  if (
    product.ownerId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "GODMODE"
  ) {
    return next(
      new AppError("You don't have access to this product's orders", 403),
    );
  }
  // 2. Find orders where the 'items' array has at least one matching productId
  const orders = await Order.find({
    "items.productId": productId,
  }).populate("userId", "name email");

  // 3. OPTIONAL: Filter out the items that DON'T belong to this product
  // Use .map() so the merchant doesn't see other products in the order
  const filteredOrders = orders.map((order) => {
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(
      (item) => item.productId.toString() === productId.toString(),
    );
    return orderObj;
  });

  res.status(200).json({
    status: "success",
    results: filteredOrders.length,
    data: { orders: filteredOrders },
  });
});

exports.getAllOrders = factory.getAll(Order);

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new AppError("Please provide status", 400));
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Merchant can only update orders that contain items from their store.
  if (req.user.role === "merchant") {
    const merchantStoreId = req.user.storeId?.toString();
    if (!merchantStoreId) {
      return next(
        new AppError("Merchant store not found on user profile", 403),
      );
    }

    const hasStoreItem = (order.items || []).some(
      (item) => item.storeId && item.storeId.toString() === merchantStoreId,
    );

    if (!hasStoreItem) {
      return next(
        new AppError("You do not have permission to update this order", 403),
      );
    }
  }

  order.status = status;
  await order.save();

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.status !== "pending") {
    return next(new AppError("Only pending orders can be cancelled", 400));
  }

  const ownerId = (order.userId || order.customer)?.toString();
  const requesterId = req.user._id.toString();
  const isPrivileged = req.user.role === "admin" || req.user.role === "GODMODE";

  if (!isPrivileged && ownerId !== requesterId) {
    return next(
      new AppError("You do not have permission to cancel this order", 403),
    );
  }

  order.status = "cancelled";
  await order.save();

  res.status(200).json({
    status: "success",
    data: { order },
  });
});
