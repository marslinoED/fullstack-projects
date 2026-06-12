const express = require("express");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");
const app = express();
const messageRoute = require("./routes/messageRoute");
const signalRoute = require("./routes/signalRoute");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");

const path = require("path");

// Importing required middlewares
// Trust proxy for secure cookies behind proxies
app.set("trust proxy", 1);

// Set query parser to 'extended' to support nested objects
app.set("query parser", "extended");

// 1) Middlewares:
// Set Security HTTP headers

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

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Development logging
app.use(morgan("dev"));

// Routes
app.use("/api/v1/messages", messageRoute);
app.use("/api/v1/signal", signalRoute);

const clientBuildPath = path.join(__dirname, "../client/build");
app.use(
  express.static(clientBuildPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    },
  }),
);
app.get("/{*path}", (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) return next();
  res.sendFile(path.join(clientBuildPath, "index.html"));
});


app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
