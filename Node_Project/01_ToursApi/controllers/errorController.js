const AppError = require("../utils/appError");

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateFieldsDB = (err) =>
  new AppError(
    `Duplicate field value: ${JSON.stringify(
      err.keyValue
    )}. Please use another value!`,
    400
  );

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input data. ${errors.join(". ")}`, 400);
};

const handleJWTError = (err) =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = (err) =>
  new AppError("Your token has expired! Please log in again.", 401);

sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handleMulterError = (err) =>
  new AppError(`Validating file upload failed: ${err.message}`, 400);

sendErrorProd = (err, res) => {
  let error = err;

  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError(error);
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError(error);
  if (error.name === "MulterError") error = handleMulterError(error);

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

sendError = (err, res) => {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "testing") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Internal Server Error";
  
  console.log(
    `\x1b[3${err.statusCode.toString().startsWith("4") ? "3" : "1"}m%s\x1b[0m`,
    `${err.status.toString().toUpperCase()}: ` + err.message
  );
  
  sendError(err, res);
};
