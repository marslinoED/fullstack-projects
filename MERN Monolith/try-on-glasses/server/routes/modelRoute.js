const express = require("express");
const multer = require("multer");
const {
  generateGlbFromImage,
  getModel
} = require("../controllers/modelController");
const router = express.Router({ mergeParams: true });

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


router
  .route("/generate-glb")
  .post(upload.single("image"), generateGlbFromImage)
router
  .route("/get-model/:modelName")
  .get(getModel);
  


module.exports = router;
