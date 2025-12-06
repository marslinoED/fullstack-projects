process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.name, err.message);
  process.exit(1);
});

if (process.env.NODE_ENV === "production") {
  const dotenv = require("dotenv").config();
} else if (process.env.NODE_ENV === "development") {
  const dotenv = require("dotenv");
  dotenv.config({ path: "./config.env", quiet: true });
}

const app = require("./index");
const { connectDB } = require("./utils/connectDB");

// Connect to the database
connectDB();

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT || 3000}`
  );
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown on SIGTERM
process.on("SIGTERM", () => {
  console.error("SIGTERM Recived, Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated!");
  });
});
