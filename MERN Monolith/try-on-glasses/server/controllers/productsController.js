const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const mongoose = require("mongoose");
const cloudinary = require("../utils/cloudinaryConfig");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const AppError = require("../utils/AppError");
const Store = require("../models/storeModel");
const User = require("../models/userModel");
const axios = require("axios");

exports.getProducts = factory.getAll(Product, ["-updatedAt"]);
exports.getProductById = factory.getOneById(Product);

exports.createProduct = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.thumbnail) {
    return next(new AppError("Thumbnail is required", 400));
  }

  if (!req.body.ownerId) {
    req.body.ownerId = req.user.id; // Set ownerId from authenticated user if not provided
  }
  if (!req.body.storeId) {
    const user = await User.findById(req.body.ownerId);
    if (!user) {
      return next(new AppError("Owner user not found", 404));
    }
    if (user.role !== "merchant") {
      return next(new AppError("Only merchants can create products", 403));
    }
    const store = await Store.findOne({ ownerId: user._id });
    if (!store) {
      return next(new AppError("Store not found for this merchant", 404));
    }
    req.body.storeId = store._id; // Set storeId based on the merchant's store
  }
  // 2. Ownership Check (Directly using the Model)
  const store = await Store.findById(req.body.storeId);
  if (!store) {
    return next(new AppError("Store not found", 404));
  }

  // Ensure the person creating the product actually owns the store
  if (store.ownerId.toString() !== req.body.ownerId) {
    return next(new AppError("You do not own this store", 403));
  }

  // 2. PRE-GENERATE the Product ID
  const productId = new mongoose.Types.ObjectId();
  const storeId = req.body.storeId;

  // Define the PERMANENT folder path using the ID
  const productFolder = `try-on-glasses/stores/${storeId}/products/${productId}`;

  let cleanupIds = [];

  try {
    const uploadTasks = [];

    // Thumbnail
    uploadTasks.push(
      uploadToCloudinary(req.files.thumbnail[0].buffer, {
        folder: productFolder,
        public_id: "thumbnail",
      }),
    );

    // images Images
    if (req.files.images) {
      req.files.images.forEach((file, i) => {
        uploadTasks.push(
          uploadToCloudinary(file.buffer, {
            folder: `${productFolder}/images`,
            public_id: `img-${i}`,
          }),
        );
      });
    }

    // 3. Upload everything
    const results = await Promise.all(uploadTasks);
    cleanupIds = results.map((r) => r.public_id);

    // 4. Save to DB using the PRE-GENERATED ID
    const newProduct = await Product.create({
      _id: productId, // <--- Assign the ID manually here
      ...req.body,
      ownerId: req.body.ownerId,
      assets: {
        thumbnailUrl: results[0].secure_url,
        thumbnailPublicId: results[0].public_id,
        imageUrls: results
          .filter((r) => r.public_id.includes("img-"))
          .map((r) => r.secure_url),
      },
    });

    res.status(201).json({ status: "success", data: { product: newProduct } });
  } catch (err) {
    // 5. Cleanup on failure
    if (cleanupIds.length > 0) {
      await Promise.all(
        cleanupIds.map((id) => cloudinary.uploader.destroy(id)),
      );
      await factory.deleteCloudinaryFolder(productFolder);
    }
    return next(err);
  }
});
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("storeId");
  if (!product) return next(new AppError("Product not found", 404));

  // 1. Identity Logic: Admin can override ownerId, otherwise use req.user.id
  const targetOwnerId =
    req.user.role === "admin" && req.body.ownerId
      ? req.body.ownerId
      : req.user.id;

  // 2. Ownership Check: Ensure the target owner actually owns the product's store
  if (product.storeId.ownerId.toString() !== targetOwnerId.toString()) {
    return next(
      new AppError(
        "Ownership mismatch: Target user does not own this store",
        403,
      ),
    );
  }

  const folder = `try-on-glasses/stores/${product.storeId._id}/products/${product._id}`;
  let assets = { ...product.assets };

  // 3. File Upload & Overwrite Logic
  if (req.files && Object.keys(req.files).length > 0) {
    try {
      const tasks = [];

      if (req.files.thumbnail) {
        tasks.push(
          uploadToCloudinary(req.files.thumbnail[0].buffer, {
            folder,
            public_id: "thumbnail",
            overwrite: true,
          }),
        );
      }

      if (req.files.images) {
        // Wipe old gallery folder for "Overwrite" behavior
        await cloudinary.api.delete_resources_by_prefix(`${folder}/images`);
        req.files.images.forEach((f, i) =>
          tasks.push(
            uploadToCloudinary(f.buffer, {
              folder: `${folder}/images`,
              public_id: `img-${Date.now()}-${i}`,
            }),
          ),
        );
      }

      const results = await Promise.all(tasks);
      const thumb = results.find((r) => r.public_id.includes("thumbnail"));
      const gallery = results.filter((r) => r.public_id.includes("img-"));

      if (thumb) assets.thumbnailUrl = thumb.secure_url;
      if (gallery.length > 0)
        assets.imageUrls = gallery.map((r) => r.secure_url);
    } catch (err) {
      return next(new AppError("Cloudinary sync failed", 500));
    }
  }

  // 4. Update Database
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body, ownerId: targetOwnerId, assets },
    { new: true, runValidators: true },
  );

  res
    .status(200)
    .json({ status: "success", data: { product: updatedProduct } });
});
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("storeId");
  if (!product) return next(new AppError("Product not found", 404));

  // 1. Identity Logic: Admin can delete anything, Merchant only their own
  const isAdmin = req.user.role === "admin";
  const isOwner = product.ownerId.toString() === req.user.id;

  if (!isAdmin && !isOwner) {
    return next(
      new AppError("You do not have permission to delete this product", 403),
    );
  }

  // 2. Define the Folder Path
  const productFolder = `try-on-glasses/stores/${product.storeId._id}/products/${product._id}`;

  try {
    // 3. WIPE CLOUDINARY (All images, gallery, and .glb models)
    // Delete standard images
    await cloudinary.api.delete_resources_by_prefix(productFolder);

    // Delete "raw" files (3D models)
    await cloudinary.api.delete_resources_by_prefix(productFolder, {
      resource_type: "raw",
    });

    // Delete the empty folder itself
    await cloudinary.api.delete_folder(productFolder);
  } catch (err) {
    // If folder doesn't exist, we log it and continue (don't block DB deletion)
    console.warn("Cloudinary folder already gone or not found:", productFolder);
  }

  // 4. DELETE FROM DATABASE
  await Product.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.generateProductModel = catchAsync(async (req, res, next) => {
  if (!req.file || !req.body.productId) {
    return next(new AppError("Image and Product ID are required.", 400));
  }

  const product = await Product.findById(req.body.productId).populate(
    "storeId",
  );
  if (!product) return next(new AppError("Product not found", 404));

  const { Client } = await import("@gradio/client");
  const client = await Client.connect("tencent/Hunyuan3D-2", {
    hf_token: process.env.HF_TOKEN?.trim(),
  });

  const imageBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

  // ─── STAGE 1: Shape generation ─────────────────────────────────────────────
  // Keep the prompt focused on geometry only — texture comes from the image in stage 2
  const shapeResult = await client.predict("/shape_generation", [
    "eyeglass frames, open hollow lens sockets, wire frame rims, no fill, no glass, high detail",
    imageBlob,
    null, // front view
    null, // side view
    null, // back view
    null, // seed image
    30, // steps
    2.0, // guidance scale
    0, // seed (0 = random)
    256, // octree resolution
    true, // remove background
    1, // target face count multiplier
    true, // save memory
  ]);

  if (!shapeResult.data?.[0]) {
    return next(new AppError("Shape generation failed", 500));
  }

  const shapeMeshData = shapeResult.data[0];
  const shapeMeshUrl =
    shapeMeshData?.value?.url ||
    shapeMeshData?.url ||
    (typeof shapeMeshData === "string" ? shapeMeshData : null);

  if (!shapeMeshUrl) {
    return next(new AppError("Could not extract shape mesh URL", 500));
  }

  // ─── STAGE 2: Texture generation ───────────────────────────────────────────
  // This is the step your current code is MISSING — it projects your product
  // image colours onto the mesh surface
  let textureResult;
  try {
    textureResult = await client.predict("/texture_generation", [
      imageBlob, // the original product image — colour source
      shapeMeshUrl, // the .obj/.glb from stage 1
      null, // front view (optional extra angle)
      null, // back view (optional extra angle)
      30, // steps
      2.0, // guidance scale
      0, // seed
    ]);
  } catch (err) {
    // Texture generation can time-out on the free tier — fall back to untextured
    console.warn(
      "Texture generation failed, falling back to shape-only:",
      err.message,
    );
    textureResult = shapeResult;
  }

  const finalMeshData = textureResult.data?.[0] ?? shapeMeshData;
  const glbUrl =
    finalMeshData?.value?.url ||
    finalMeshData?.url ||
    (typeof finalMeshData === "string" ? finalMeshData : null);

  if (!glbUrl) return next(new AppError("Could not find final model URL", 500));

  // ─── STAGE 3: Download + upload to Cloudinary ──────────────────────────────
  try {
    const response = await axios.get(glbUrl, {
      responseType: "arraybuffer",
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN?.trim()}` },
      timeout: 60_000,
    });

    const buffer = Buffer.from(response.data);
    const storeId = product.storeId._id ?? product.storeId;
    const folder = `try-on-glasses/stores/${storeId}/products/${product._id}`;

    const cloudStorage = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${product._id}_Model`,
          resource_type: "raw",
          format: "glb",
          overwrite: true,
        },
        (error, result) => (error ? reject(error) : resolve(result)),
      );
      uploadStream.end(buffer);
    });

    await Product.findByIdAndUpdate(
      product._id,
      { $set: { "assets.modelUrl": cloudStorage.secure_url } },
      { new: true },
    );

    res.status(200).json({
      status: "success",
      data: { modelUrl: cloudStorage.secure_url },
    });
  } catch (err) {
    return next(new AppError(`File transfer failed: ${err.message}`, 500));
  }
});
