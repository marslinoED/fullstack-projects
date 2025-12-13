const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.getAll = (Model, defaultLimits = [], baseFilter = {}) =>
  catchAsync(async (req, res, next) => {
    const resolvedFilter =
      typeof baseFilter === "function"
        ? baseFilter(req, res)
        : { ...baseFilter };

    const features = new APIFeatures(
      Model.find(resolvedFilter || {}),
      req.query
    )
      .filter()
      .sort("-createdAt")
      .fieldLimit(["-__v", ...defaultLimits])
      .paginate();

    const documents = await features.query;
    if (documents.length === 0) {
      return next(new AppError("No documents found", 404));
    }
    res.status(200).json({
      status: "success",
      results: documents.length,
      data: documents,
    });
  });

exports.getOneById = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findOne({
      _id: req.params.id || req.params.reviewId,
    }).populate(popOptions);
    if (!document) {
      return next(new AppError("Document not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: document,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    
    if (!req.body) {
      return next(new AppError("No data provided", 400));
    }
    if (req.body.role) {
      req.body.role = "user";
    }
    
    console.log(req.body);
    const newModel = await Model.create(req.body);
    if (Model.modelName === "Tour") {
      req.params.id = newModel._id;
      req.tourDocument = newModel;
      return next();
    }
    res.status(201).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: newModel,
      },
    });
  });

exports.updateOneById = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError("No data provided", 400));
    }

    const updatedDocument = await Model.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedDocument) {
      return next(new AppError("Document not found", 404));
    }
    if (Model.modelName === "Tour") {
      req.tourDocument = updatedDocument;
      return next();
    }
    res.status(200).json({
      status: "success",
      data: updatedDocument,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const deleteDocument = await Model.findOneAndDelete({ _id: req.params.id });
    if (!deleteDocument) {
      return next(new AppError("Document not found", 404));
    }
    res.sendStatus(204); // success, no content
  });
