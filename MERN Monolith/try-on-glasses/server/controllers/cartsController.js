const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const fixUserId = (req) => {
  return req.body?.userId || req.user?.id;
};
exports.getCart = catchAsync(async (req, res, next) => {
  const userId = fixUserId(req);

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return next(new AppError("No cart found for this user", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

const createCart = async (req, res, next) => {
  const userId = fixUserId(req);

  if (!userId) {
    return next(
      new AppError(
        "No User ID found in request body or authentication token.",
        400,
      ),
    );
  }
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

exports.addToCart = catchAsync(async (req, res, next) => {
  const cart = await createCart(req, res, next);

  if (!cart) {
    return next(new AppError("Failed to create cart for user", 500));
  }

  if (!req.body.items || req.body.items.length < 1) {
    return next(new AppError("No items provided for cart", 400));
  }

  // Validate that all products exist before modifying the cart
  const productIds = req.body.items.map((i) => i.productId);
  const validProducts = await Product.find({ _id: { $in: productIds } });

  if (validProducts.length !== req.body.items.length) {
    return next(new AppError("One or more products are invalid.", 404));
  }

  req.body.items.forEach((newItem) => {
    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === newItem.productId,
    );

    if (existingItemIndex > -1) {
      // MERGE: Update quantity of existing item
      cart.items[existingItemIndex].quantity += newItem.quantity;
    } else {
      // NEW: Push the new item to the array
      cart.items.push(newItem);
    }
  });

  // 3. Save once (Triggers all middleware and validation)
  await cart.save();

  res.status(200).json({
    status: "success",
    data: { cart },
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const userId = fixUserId(req);

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError("No cart found for this user", 404));
  }
  cart.items = [];
  await cart.save();
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const userId = fixUserId(req);

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError("No cart found for this user", 404));
  }
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === req.params.id,
  );
  if (itemIndex === -1) {
    return next(new AppError("Product not found in cart", 404));
  }
  cart.items.splice(itemIndex, 1);
  const updatedCart = await cart.save();
  res.status(204).json({
    status: "success",
    data: updatedCart,
  });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const userId = fixUserId(req);

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError("No cart found for this user", 404));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === req.params.id,
  );
  if (itemIndex === -1) {
    return next(new AppError("Product not found in cart", 404));
  }

  const newQuantity = req.body.quantity;
  if (newQuantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  cart.items[itemIndex].quantity = newQuantity;
  const updatedCart = await cart.save();

  res.status(200).json({
    status: "success",
    data: updatedCart,
  });
});