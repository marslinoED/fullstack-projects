const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");
const factory = require("./handlerFactory");

// middlewares:
exports.setUserRoleToUser = (req, res, next) => {
  req.body.role = "user";
  next();
};
// Functions
exports.getAllUsers = factory.getAll(User, ["+active"]);

// Get user by ID
exports.getUserById = factory.getOneById(User);

// Create a new user
exports.createUser = factory.createOne(User);
// Update a user by ID
exports.updateUserById = factory.updateOneById(User);

// Delete a user by ID
exports.deleteUserById = factory.deleteOne(User);
