const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", "config.env"), quiet: true });

const app = require("../index");
const { connectDB, isConnected } = require("../utils/connectDB");

let dbInitPromise;

const ensureDatabaseConnection = async () => {
  if (isConnected()) return;
  if (!dbInitPromise) {
    dbInitPromise = connectDB();
  }
  await dbInitPromise;
};

module.exports = async (req, res) => {
  await ensureDatabaseConnection();
  return app(req, res);
};
