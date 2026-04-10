process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.name, err.message);
  process.exit(1);
});
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env", quiet: true });
const app = require("./index");

// Connect to DB before starting the server
const { connectDB } = require("./utils/connectDB");
connectDB();

const server = app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
