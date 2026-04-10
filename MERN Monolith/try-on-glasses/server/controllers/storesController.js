const Store = require("../models/storeModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const factory = require("./handlerFactory");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

exports.getStores = factory.getAll(Store, ["-updatedAt"]);
exports.getStoreById = factory.getOneById(Store);
// controllers/storesController.js
exports.createStore = catchAsync(async (req, res, next) => {
  let newStore = await Store.create({
    name: req.body.name,
    description: req.body.description,
    ownerId: req.body.ownerId || req.user.id,
  });
  if (!newStore) {
    return next(new AppError("Failed to create store", 500));
  }

  // 1. If a logo was uploaded, send buffer to Cloudinary
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `try-on-glasses/stores/${newStore._id}`,
      public_id: `logo-${Date.now()}`,
    });
    newStore = await Store.findByIdAndUpdate(
      newStore._id,
      { $set: { logo: result.secure_url } },
      { new: true, runValidators: true },
    );
  }

  res.status(201).json({
    status: "success",
    data: { store: newStore },
  });
});

exports.promoteCustomerToMerchant = catchAsync(async (req, res, next) => {
  const targetUserId = req.body.ownerId || req.user?._id;

  if (!targetUserId) {
    return next(new AppError("Store owner is required", 400));
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return next(new AppError("Store owner user not found", 404));
  }

  if (targetUser.role === "customer") {
    targetUser.role = "merchant";
    await targetUser.save({ validateBeforeSave: false });
  }

  req.body.ownerId = targetUser._id;
  next();
});

exports.demoteStoreOwnerToCustomer = catchAsync(async (req, res, next) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return next(new AppError("Store not found", 404));
  }

  const owner = await User.findById(store.ownerId);
  if (owner && owner.role === "merchant") {
    owner.role = "customer";
    await owner.save({ validateBeforeSave: false });
  }

  next();
});

exports.updateStore = catchAsync(async (req, res, next) => {
  const storeId = req.params.id;
  let updatedStore = await Store.findById(storeId);
  if (!updatedStore) {
    return next(new AppError("Store not found", 404));
  }

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `try-on-glasses/stores/${storeId}`,
      public_id: `logo-${Date.now()}`,
    });
    req.body.logo = result.secure_url;
  }

  updatedStore = await Store.findByIdAndUpdate(storeId, req.body, {
    new: true,
    runValidators: true,
  }).select("-updatedAt");

  res.status(200).json({
    status: "success",
    data: { store: updatedStore },
  });
});


// Internal helper - NOT exported as a route
const performStoreCleanup = async (storeId) => {
  // 1. Delete Product Docs
  await Product.deleteMany({ storeId });

  // 2. Delete Cloudinary Folder (matches your createStore path)
  await factory.deleteCloudinaryFolder(`try-on-glasses/stores/${storeId}`);

  // 3. Delete Store Doc
  return await Store.findByIdAndDelete(storeId);
};

// Your standard route handler stays clean
exports.deleteStore = catchAsync(async (req, res, next) => {
  const deleted = await performStoreCleanup(req.params.id);
  if (!deleted) return next(new AppError("Store not found", 404));

  res.sendStatus(204);
});

// EXPORT the helper for other controllers (like User)
exports.performStoreCleanup = performStoreCleanup;
