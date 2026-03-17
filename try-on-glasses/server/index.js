const express = require("express");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");
const path = require("path");
const app = express();
const tempRoute = require("./routes/tempRoute");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");

app.set("trust proxy", 1);
app.set("query parser", "extended");
app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

app.use("/api/v1/temp", tempRoute);


const clientBuildPath = path.join(__dirname, "../client/build");
app.use(express.static(clientBuildPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
