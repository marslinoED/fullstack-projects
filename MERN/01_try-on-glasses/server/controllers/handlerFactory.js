const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");
const cloudinary = require("../utils/cloudinaryConfig");

const toObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const getIdFilter = (req, options = {}) => {
  const { idParam = "id", queryFilter } = options;

  if (typeof queryFilter === "function") {
    return toObject(queryFilter(req));
  }

  return {
    _id: req.params[idParam],
  };
};

const shouldUseGetAllOptions = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const optionKeys = [
    "defaultLimits",
    "baseFilter",
    "sortBy",
    "excludeFields",
    "notFoundMessage",
    "emptyAsSuccess",
  ];

  return optionKeys.some((key) => key in value);
};

exports.getAll = (Model, defaultLimitsOrOptions = [], baseFilter = {}) =>
  catchAsync(async (req, res, next) => {
    const options = shouldUseGetAllOptions(defaultLimitsOrOptions)
      ? defaultLimitsOrOptions
      : {
          defaultLimits: defaultLimitsOrOptions,
          baseFilter,
        };

    const {
      defaultLimits = [],
      baseFilter: optionsBaseFilter = {},
      sortBy = "-createdAt",
      excludeFields = ["-__v"],
      notFoundMessage = "No documents found",
      emptyAsSuccess = false,
    } = options;

    const resolvedFilter =
      typeof optionsBaseFilter === "function"
        ? optionsBaseFilter(req, res)
        : { ...optionsBaseFilter };

    const features = new APIFeatures(
      Model.find(resolvedFilter || {}),
      req.query,
    )
      .filter()
      .sort(sortBy)
      .fieldLimit([...excludeFields, ...defaultLimits])
      .paginate();

    const documents = await features.query;
    if (!emptyAsSuccess && documents.length === 0) {
      return next(new AppError(notFoundMessage, 404));
    }

    res.status(200).json({
      status: "success",
      results: documents.length,
      data: documents,
    });
  });

exports.getOneById = (Model, popOptionsOrOptions) =>
  catchAsync(async (req, res, next) => {
    const options =
      popOptionsOrOptions &&
      typeof popOptionsOrOptions === "object" &&
      !Array.isArray(popOptionsOrOptions) &&
      (Object.prototype.hasOwnProperty.call(popOptionsOrOptions, "populate") ||
        Object.prototype.hasOwnProperty.call(popOptionsOrOptions, "idParam") ||
        Object.prototype.hasOwnProperty.call(
          popOptionsOrOptions,
          "queryFilter",
        ) ||
        Object.prototype.hasOwnProperty.call(
          popOptionsOrOptions,
          "notFoundMessage",
        ))
        ? popOptionsOrOptions
        : { populate: popOptionsOrOptions };

    const { populate, notFoundMessage = "Document not found" } = options;

    let query = Model.findOne(getIdFilter(req, options));
    if (populate) {
      query = query.populate(populate);
    }

    const document = await query;

    if (!document) {
      return next(new AppError(notFoundMessage, 404));
    }

    res.status(200).json({
      status: "success",
      data: document,
    });
  });

exports.createOne = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError("No data provided", 400));
    }

    const {
      transformBody,
      responseKey = Model.modelName.toLowerCase(),
      afterCreate,
      statusCode = 201,
    } = options;

    const payload =
      typeof transformBody === "function"
        ? transformBody(req.body, req)
        : req.body;

    if (!payload || Object.keys(payload).length === 0) {
      return next(new AppError("No data provided", 400));
    }

    const newModel = await Model.create(payload);

    if (typeof afterCreate === "function") {
      await afterCreate(newModel, req, res, next);
    }

    res.status(statusCode).json({
      status: "success",
      data: {
        [responseKey]: newModel,
      },
    });
  });

exports.updateOneById = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError("No data provided", 400));
    }

    const {
      transformBody,
      notFoundMessage = "Document not found",
      afterUpdate,
      queryOptions = {},
    } = options;

    const payload =
      typeof transformBody === "function"
        ? transformBody(req.body, req)
        : req.body;

    const updatedDocument = await Model.findOneAndUpdate(
      getIdFilter(req, options),
      { ...payload },
      {
        new: true,
        runValidators: true,
        ...queryOptions,
      },
    );

    if (!updatedDocument) {
      return next(new AppError(notFoundMessage, 404));
    }

    if (typeof afterUpdate === "function") {
      await afterUpdate(updatedDocument, req, res, next);
    }

    res.status(200).json({
      status: "success",
      data: updatedDocument,
    });
  });

exports.deleteOne = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    const { notFoundMessage = "Document not found" } = options;

    const deleteDocument = await Model.findOneAndDelete(
      getIdFilter(req, options),
    );
    if (!deleteDocument) {
      return next(new AppError(notFoundMessage, 404));
    }

    res.sendStatus(204); // success, no content
  });

exports.deleteCloudinaryFolder = async (folderPath) => {
  try {
    // 1. Delete all images in the folder
    await cloudinary.api.delete_resources_by_prefix(folderPath);

    // 2. Delete the actual empty folder
    // Note: Cloudinary will error if you try to delete a folder that isn't empty,
    // which is why step 1 is mandatory.
    const result = await cloudinary.api.delete_folder(folderPath);

    return result;
  } catch (error) {
    // Skip
    console.error(
      `Error deleting Cloudinary folder ${folderPath}:`,
      error.error.message,
    );
  }
};
