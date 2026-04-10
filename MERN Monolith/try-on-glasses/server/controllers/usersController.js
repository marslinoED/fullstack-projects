const User = require("../models/userModel");
const Store = require("../models/storeModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { performStoreCleanup } = require("./storesController");

exports.getUsers = factory.getAll(User, ["-updatedAt"]);
exports.getUserById = factory.getOneById(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOneById(User);

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found", 404));

  // 1. If merchant, find and wipe their store first
  if (user.role === "merchant") {
    const store = await Store.findOne({ ownerId: user._id });
    if (store) {
      // Use the helper, NOT the deleteStore controller
      await performStoreCleanup(store._id);
    }
  }

  // 2. Delete the User
  await User.findByIdAndDelete(user._id);

  // 3. Send the ONLY response
  res.status(204).json({
    status: "success",
    data: null,
  });
});
