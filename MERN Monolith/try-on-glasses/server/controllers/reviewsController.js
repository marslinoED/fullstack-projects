const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.doSomething = catchAsync(async (req, res, next) => {
  // Your implementation here
  res.status(200).json({ status: "success", data: {} });
});

exports.doSomethingWithId = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
  return next(new AppError("ID parameter is missing", 400));
  }

  // Your implementation here
  res.status(200).json({ status: "success", data: { id } });
});
