const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
exports.doSomething = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: "success", data: { message: "Hello from Server!" } });
});
exports.doSomethingWithId = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new AppError("ID missing", 400));
  res.status(200).json({ status: "success", data: { id } });
});
