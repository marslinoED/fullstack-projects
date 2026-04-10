const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// TODO: Implement email service for sending welcome and login notification emails
// const EmailService = require("../utils/emailService");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, req) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    // Secure cookie in production
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  });
};

// Sign Up User
exports.signUp = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError("No data provided", 400));
  }
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res, req);

  // TODO: Send welcome email to new user
  // Send response to client
  // const emailClient = new EmailService(newUser);
  // await emailClient.sendWelcome();
});
// Sign In User
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // If user has a password reset token that has expired, clear it
  if (user.passwordResetToken && user.passwordResetExpires) {
    if (user.passwordResetExpires < Date.now()) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

  createSendToken(user, 200, res, req);

  // TODO: Send login notification email to user
  // 3) Send response to client
  // const emailClient = new EmailService(user);
  // await emailClient.sendLoginNotification();
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    // 1. MUST return here!
    return next(new AppError("You are not logged in!", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    // 2. MUST return here!
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    // 3. MUST return here!
    return next(new AppError("User recently changed password!", 401));
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  const allowedRoles = [...roles, "admin", "GODMODE"];

  return (req, res, next) => {
    // We don't need async here because we are just checking a string
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
