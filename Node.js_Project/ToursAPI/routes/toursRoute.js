const express = require("express");
const {
  getAllTours,
  getTourById,
  createTour,
  updateTourById,
  deleteTourById,
  aliasTopCheapTours,
  monthlyPlanByYear,
  getToursWithin,
  getToursDistances,
  uploadTourImage,
  resizeTourImage,
  addTourImage,
  sendTourResponse,
} = require("../controllers/toursController");

const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

// Nested route for reviews
// Mount the review router on the tour router
const reviewRouter = require("./reviewsRoute");
router.use("/:tourId/reviews", reviewRouter);

// Aggregation
// Alias to get top 5 cheapest tours
router.get("/top-5-cheapest", aliasTopCheapTours, getAllTours);

// Alias to get top 5 cheapest tours
router.get("/within/:distance/center/:latlng", getToursWithin);

// Alias to get top 5 cheapest tours
router.get("/distances/:latlng", getToursDistances);

// Aggregation to get tour statistics for monthly plan
router.get(
  "/monthly-plan/:year",
  protect,
  restrictTo("guide", "admin"),
  monthlyPlanByYear
);

router
  .route("/")
  .get(getAllTours)
  .post(
    protect,
    restrictTo("guide", "admin"),
    uploadTourImage,
    resizeTourImage,
    createTour,
    addTourImage,
    sendTourResponse
  );

router
  .route("/:id")
  .get(getTourById)
  .patch(
    protect,
    restrictTo("guide", "admin"),
    uploadTourImage,
    resizeTourImage,
    updateTourById,
    addTourImage,
    sendTourResponse
  )
  .delete(protect, restrictTo("guide", "admin"), deleteTourById);

module.exports = router;
