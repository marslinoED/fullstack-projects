const express = require("express");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");
const path = require("path");
const app = express();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");

const modelRoute = require("./routes/modelRoute");
const usersRoute = require("./routes/usersRoute");
const authRoute = require("./routes/authRoute");
const storesRoute = require("./routes/storesRoute");
const productsRoute = require("./routes/productsRoute");
const cartsRoute = require("./routes/cartsRoute");
const ordersRoute = require("./routes/ordersRoute");
const reviewsRoute = require("./routes/reviewsRoute");

app.set("trust proxy", 1);
app.set("query parser", "extended");
app.use(
  helmet({
    contentSecurityPolicy: false, // Fixes the script blocking
    hsts: false, // Stops forcing HTTPS (The fix for your current error)
  }),
);
app.use(compression());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

const allowedOrigins = [
  "http://localhost:" + process.env.PORT,
  "http://192.168.1.7:" + process.env.PORT,
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

const { isConnected } = require("./utils/connectDB");
// Test middleware to add request time and check DB connection
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  if (!isConnected()) {
    return next(new AppError("Database not connected", 503));
  }
  next();
});

app.use("/api/v1/model", modelRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/stores", storesRoute);
app.use("/api/v1/products", productsRoute);
app.use("/api/v1/carts", cartsRoute);
app.use("/api/v1/orders", ordersRoute);
app.use("/api/v1/reviews", reviewsRoute);

const clientBuildPath = path.join(__dirname, "../client/build");
app.use(express.static(clientBuildPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
  // res.send("Welcome to the Try-On-Glasses API! Please use the /api/v1/temp endpoint for testing.");
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
