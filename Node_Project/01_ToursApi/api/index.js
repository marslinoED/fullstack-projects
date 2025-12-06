const path = require("path");
const dotenv = require("dotenv");
const app = require("../index");
const { connectDB, isConnected } = require("../utils/connectDB");

dotenv.config({ path: path.join(__dirname, "../config.env"), quiet: true });

let dbPromise;
const ensureDBConnection = async () => {
  if (isConnected()) {
    return;
  }
  if (!dbPromise) {
    dbPromise = connectDB();
  }
  await dbPromise;
};

module.exports = async (req, res) => {
  await ensureDBConnection();
  return app(req, res);
};
