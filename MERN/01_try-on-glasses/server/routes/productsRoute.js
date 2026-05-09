const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  generateProductModel,
} = require("../controllers/productsController");

const { protect, restrictTo } = require("../controllers/authController");

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB (3D models are bigger than images)
  fileFilter: (req, file, cb) => {
    // Allow images
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    // Allow .glb files (often seen as model/gltf-binary or application/octet-stream)
    if (file.originalname.endsWith(".glb")) {
      return cb(null, true);
    }
    cb(
      new Error(
        "File type not supported. Please upload images or .glb models.",
      ),
      false,
    );
  },
});

// 1. Define the allowed fields
const uploadProductAssets = upload.fields([
  { name: "thumbnail", maxCount: 1 }, // Single image
  { name: "images", maxCount: 5 }, // Array of images (max 5)
]);
const uploadModelImage = upload.single("modelImage"); // For the image used to generate the 3D model

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getProducts)
  .post(
    protect,

    uploadProductAssets,
    restrictTo("merchant", "admin"),
    createProduct,
  )
  .patch(
    protect,
    uploadModelImage,
    restrictTo("merchant", "admin"),
    generateProductModel,
  );
router
  .route("/:id")
  .get(getProductById)
  .patch(
    protect,
    restrictTo("merchant", "admin"),
    uploadProductAssets,
    updateProduct,
  )
  .delete(protect, restrictTo("merchant", "admin"), deleteProduct);

module.exports = router;
