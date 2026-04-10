const express = require("express");
const {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  promoteCustomerToMerchant,
  demoteStoreOwnerToCustomer,
} = require("../controllers/storesController");
const { restrictTo, protect } = require("../controllers/authController");

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed."));
    }
    cb(null, true);
  },
});

// 1. Define the upload for a single 'logo' field
const uploadLogo = upload.single("logo");

// 2. Updated Routes
const router = express.Router({ mergeParams: true });

router.route("/").get(getStores).post(
  protect,
  restrictTo("customer", "admin"), // Only customers or admins can open a store
  uploadLogo, // Handle the image buffer
  promoteCustomerToMerchant, // Update User Role
  createStore, // Create Store & Upload to Cloudinary
);

router
  .route("/:id")
  .get(getStoreById)
  .patch(protect, restrictTo("merchant", "admin"), uploadLogo, updateStore)
  .delete(
    protect,
    restrictTo("merchant", "admin"),
    demoteStoreOwnerToCustomer, // Revert User Role back to 'customer'
    deleteStore, // Delete Store (Triggers Cloudinary & Product hooks)
  );
module.exports = router;
