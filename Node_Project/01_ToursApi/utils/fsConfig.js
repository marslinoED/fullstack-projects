const fs = require("fs/promises");
const path = require("path");
const AppError = require("./AppError");

const openOrCreateDir = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error("Error creating dir:", err);
  }
};

const createFile = async (folder, filename, buffer) => {
  const filePath = path.join(folder, filename);
  await fs.writeFile(filePath, buffer);
};

module.exports = { openOrCreateDir, createFile };
