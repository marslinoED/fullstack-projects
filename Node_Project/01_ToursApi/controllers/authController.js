const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const upload = require("../utils/multerConfig");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const sharp = require("sharp");
const EmailService = require("../utils/sendingEmails");

// Functions
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
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) * 24 * 60 * 60 * 1000
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

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
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

  // Send response to client
  const emailClient = new EmailService(newUser);
  await emailClient.sendWelcome();
});
// Sign In User
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Validate shapes
  if (typeof email !== "string" || typeof password !== "string") {
    return next(new AppError("Invalid input format", 400));
  }

  // 2) Basic required fields
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 3) Find user
  const user = await User.findOne({ email })
    .select("+password")
    .select("+active");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (!user.active) {
    await User.findByIdAndUpdate(user._id, {
      active: true,
      updatedAt: Date.now(),
    });
  }
  if (user.passwordResetToken && user.passwordResetExpires) {
    if (user.passwordResetExpires < Date.now()) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

  createSendToken(user, 200, res, req);

  // 5) Send response to client
  const emailClient = new EmailService(user);
  await emailClient.sendLoginNotification();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  if (!req.body.email || !req.body.resetUrl) {
    return next(new AppError("Body must have both email and resetUrl", 400));
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No user found with that email", 400));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  const email = req.body.email;
  const resetURL = `${req.body.resetUrl}/${resetToken}`;
  try {
    const emailClient = new EmailService(user);
    await emailClient.sendPasswordReset(resetURL);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log("Email sending error:", err.message);
    console.log(err);

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
  // 5) Send response to client
  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  if (!req.params.token) {
    return next(new AppError("No token provided", 400));
  }
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  // 2) If token has not expired, and there is user, set the new password
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(
      new AppError("Please provide password and passwordConfirm", 400)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res, req);

  // 5) Send response to client
  const emailClient = new EmailService(user);
  await emailClient.sendYourPasswordHasChanged();
});
// update Password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get User
  if (!req.body.currentPassword || !req.user) {
    return next(new AppError("Please provide current password", 400));
  }
  // 2) Check if password correct
  const user = await User.findOne({ _id: req.user.id }).select("+password");
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError("Your current password is wrong, try again.", 401)
    );
  }
  // 3) update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res, req);

  // 5) Send email notification
  const emailClient = new EmailService(user);
  await emailClient.sendYourPasswordHasChanged();
});

exports.uploadUserImage = upload.single("photo");
exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  const processedBuffer = await sharp(req.file.buffer)
    .resize(256, 256)
    .toFormat("jpeg")
    .jpeg({ quality: 1 })
    .toBuffer();
  req.processedImage = processedBuffer;

  next();
});

exports.updateLoggedUser = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError("No data provided", 400));
  }
  const filteredBody = filteredObj(req.body, "name", "email", "photo");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  let result = null;
  if (req.processedImage) {
    result = await uploadToCloudinary(req.processedImage, {
      folder: `ToursApp/Users/${req.user.id}`,
      public_id: `user_${req.user.id}_${Date.now()}`,
    });
    updatedUser.photo = result.secure_url;
    await updatedUser.save({ validateBeforeSave: false });
  }
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});

exports.deleteLoggedUser = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("No user found", 400));
  }
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  user.active = false;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  res.sendStatus(204);
});
// Middlewares
// Protect Middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError(
        "You are not logged in! Please Add auth to your code, e.g. req.headers.authorization = 'Bearer <token>'.",
        401
      )
    );
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  req.user = currentUser;
  next();
});
// Restrict To Middleware
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (req.user.role === "GODMODE") {
      if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "testing") {
        return next();
      } else {
        req.user.role = "admin";
      }
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.checkOwnership = (Model) => {
  return async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("Document not found", 404));
    }

    if (req.user.role === "admin") {
      return next();
    }

    // check if the logged user owns this document
    if (doc.userRef.toString() !== req.user._id.toString()) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
