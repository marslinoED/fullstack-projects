const express = require("express");
const morgan = require("morgan");
const tours_route = require("./routes/toursRoute");
const users_route = require("./routes/usersRoute");
const reviews_route = require("./routes/reviewsRoute");
const paymob_route = require("./routes/paymobRoute");
const documentation_route = require("./routes/documentationRoute");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const { isConnected } = require("./utils/connectDB");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const compression = require("compression");

const app = express();
// Trust proxy for secure cookies behind proxies
app.set("trust proxy", 1);

// Set query parser to 'extended' to support nested objects
app.set("query parser", "extended");

// 1) Middlewares:
// Set Security HTTP headers
app.use(helmet());


// Compress all responses
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Enable CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://marslinoed.github.io",
    ],

    credentials: true,
  })
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Development logging
app.use(morgan("dev"));

// Test middleware to add request time and check DB connection
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  if (!isConnected()) {
    return next(new AppError("Database not connected", 503));
  }
  next();
});
app.use("/", documentation_route);
app.use(express.static("public"));

app.get("/reset-password-template/:token?", (req, res) => {
  res.sendFile(`${__dirname}/templates/auth/resetPassword.html`);
});
app.use("/api/v1/tours", tours_route);
app.use("/api/v1/users", users_route);
app.use("/api/v1/reviews", reviews_route);
app.use("/api/v1/paymob", paymob_route);

// Handle unhandled routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
