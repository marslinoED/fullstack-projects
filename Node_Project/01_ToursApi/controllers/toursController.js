const Tour = require("../models/tourModel");

const catchAsync = require("../utils/catchAsync");

const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");
const upload = require("../utils/multerConfig");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const sharp = require("sharp");
// Aggregation Middleware to get tour statistics
// Alias middleware for top 5 cheap tours
exports.aliasTopCheapTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sortBy = "price,ratingsAverage";
  next();
};

// Aggregation Middleware to get tour statistics for monthly plan
exports.monthlyPlanByYear = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const result = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        month: "$_id",
        numTours: 1,
        tours: 1,
        _id: 0,
      },
    },
    {
      $group: {
        _id: null,
        totalToursInYear: { $sum: "$numTours" },
        plan: { $push: "$$ROOT" },
      },
    },
    {
      $addFields: {
        year: year,
      },
    },
    {
      $project: {
        _id: 0,
        totalToursInYear: 1,
        year: 1,
        plan: 1,
      },
    },
  ]);

  if (!result[0]) {
    return next(new AppError("No tours found for the given year", 404));
  }
  res.status(200).json({
    status: "success",
    result,
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");
  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400
      )
    );
  }
  const radius = distance / 6378.1;

  const tours = await Tour.find({
    locations: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getToursDistances = catchAsync(async (req, res, next) => {
  const { latlng } = req.params;

  const [lat, lng] = latlng.split(",");
  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400
      )
    );
  }
  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: "distance",
        spherical: true,
        distanceMultiplier: 0.001, // Convert to kilometers
      },
    },
    {
      $sort: { distance: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.checkTourExists = catchAsync(async (req, res, next) => {
  const tourId = req.body.tourRef || req.params.tourId;

  const tour = await Tour.findById(tourId);
  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  next();
});
// Functions:
// Get all tours with filtering, sorting, field limiting, and pagination
exports.getAllTours = factory.getAll(Tour, ["-description", "-images"]);

// Get a specific tour by ID
exports.getTourById = factory.getOneById(Tour, {
  path: "guides reviews",
  select: "_id name email role createdAt updatedAt review rating userRef",
});

// Create a new tour
exports.createTour = factory.createOne(Tour);

// Middleware for uploading and resizing user images
exports.uploadTourImage = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeTourImage = catchAsync(async (req, res, next) => {
  if (!req.files) return next();
  const folderPath = `tours/TOURID`;
  // Process cover image
  if (req.files.imageCover) {
    const processedBufferImageCover = await sharp(
      req.files.imageCover[0].buffer
    )
      .resize(400, 266)
      .toFormat("jpeg")
      .jpeg({ quality: 1 })
      .toBuffer();
    req.processedBufferImageCover = processedBufferImageCover;
    req.body.imageCover = "Buffered";
  }
  // Process other images
  if (req.files.images) {
    req.processedBufferImages = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-TOURID-${Date.now()}-${i + 1}.jpeg`;
        const processedBufferImage = await sharp(file.buffer)
          .resize(400, 266)
          .toFormat("jpeg")
          .jpeg({ quality: 1 })
          .toBuffer();
        req.processedBufferImages.push(processedBufferImage);
      })
    );
    req.body.images = "Buffered";
  }
  next();
});

// Update an existing tour by ID
exports.updateTourById = factory.updateOneById(Tour);

exports.addTourImage = catchAsync(async (req, res, next) => {
  const currentTourId = req.params.id || req.tourDocument?._id?.toString();
  if (!currentTourId) {
    return next(
      new AppError("Tour identifier missing for image processing", 400)
    );
  }

  const imageUpdates = {};

  if (req.processedBufferImageCover) {
    const uploadedCover = await uploadToCloudinary(
      req.processedBufferImageCover,
      {
        folder: `ToursApp/tours/${currentTourId}`,
        public_id: `tour_${currentTourId}_cover_${Date.now()}`,
      }
    );
    imageUpdates.imageCover = uploadedCover.secure_url;
  }

  if (req.processedBufferImages && req.processedBufferImages.length > 0) {
    imageUpdates.images = [];
    for (const image of req.processedBufferImages) {
      const uploadedImage = await uploadToCloudinary(image, {
        folder: `ToursApp/tours/${currentTourId}`,
        public_id: `tour_${currentTourId}_image_${Date.now()}`,
      });
      imageUpdates.images.push(uploadedImage.secure_url);
    }
  }

  if (Object.keys(imageUpdates).length > 0) {
    req.tourDocument = await Tour.findByIdAndUpdate(
      currentTourId,
      imageUpdates,
      {
        new: true,
        runValidators: false,
      }
    );
  }

  next();
});

exports.sendTourResponse = (req, res) => {
  if (!req.tourDocument) {
    return res.status(500).json({
      status: "error",
      message: "Tour data unavailable after processing",
    });
  }

  const statusCode = req.method === "POST" ? 201 : 200;
  res.status(statusCode).json({
    status: "success",
    data: {
      tour: req.tourDocument,
    },
  });
};

// Delete a tour by ID
exports.deleteTourById = factory.deleteOne(Tour);
