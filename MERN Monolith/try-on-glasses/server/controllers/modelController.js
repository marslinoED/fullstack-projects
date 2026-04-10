const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const downloadFile = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

exports.generateGlbFromImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(
      new AppError("Please upload an image file in field 'image'.", 400),
    );
  }

  const { Client } = await import("@gradio/client");
  const token = process.env.HF_TOKEN?.trim();

  const client = await Client.connect("tencent/Hunyuan3D-2", {
    token: token || undefined,
  });

  const imageBlob = new Blob([req.file.buffer], {
    type: req.file.mimetype || "image/jpeg",
  });

  const result = await client.predict("/shape_generation", [
    "eyeglass frames only, hollow lens sockets, no glass, no lenses, high quality 3D mesh",
    imageBlob,
    null,
    null,
    null,
    null,
    30,
    2.0,
    0,
    256,
    true,
    1,
    true,
  ]);

  const glbUrl = result?.data?.[0]?.value?.url;

  if (!glbUrl) {
    return next(
      new AppError("Failed to generate GLB link from Gradio response.", 502),
    );
  }

  const requestedName = (req.body?.name || "").toString().trim();
  const fallbackName = path.parse(req.file.originalname || "upload").name;
  const baseName = (requestedName || fallbackName)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  const safeBaseName = baseName || "asset";
  const timestamp = Date.now();

  const imageExt = path.extname(req.file.originalname || "") || ".jpg";
  const imageFilename = `${safeBaseName}-${timestamp}_image${imageExt.toLowerCase()}`;
  const modelFilename = `${safeBaseName}-${timestamp}_model.glb`;

  const imagesDir = path.join(process.cwd(), "public", "assets", "images");
  const modelsDir = path.join(process.cwd(), "public", "assets", "models");
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.mkdirSync(modelsDir, { recursive: true });

  const modelPath = path.join(modelsDir, modelFilename);
  await downloadFile(glbUrl, modelPath);

  const imagePath = path.join(imagesDir, imageFilename);
  fs.writeFileSync(imagePath, req.file.buffer);

  const localImageUrl = `${req.protocol}://${req.get("host")}/public/assets/images/${imageFilename}`;
  const localGlbUrl = `${req.protocol}://${req.get("host")}/public/assets/models/${modelFilename}`;

  res.status(200).json({
    status: "success",
    data: {
      imageUrl: localImageUrl,
      glbUrl: localGlbUrl,
    },
  });
});

exports.getModel = catchAsync(async (req, res, next) => {
  const { modelName } = req.params;
  const modelPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "models",
    modelName,
  );

  if (!fs.existsSync(modelPath)) {
    return next(new AppError("Model not found.", 404));
  }
  res.sendFile(modelPath);
});
