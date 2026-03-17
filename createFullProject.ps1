param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectName
)

Write-Host "Creating Fullstack Project: $ProjectName"

# 1) Validation
if (Test-Path $ProjectName) {
    Write-Host "Folder '$ProjectName' already exists."
    exit 1
}

if (
    [string]::IsNullOrWhiteSpace($ProjectName) -or
    -not ($ProjectName -match '^[a-zA-Z0-9_-]+$')
) {
    Write-Host "Project name '$ProjectName' is invalid."
    exit 1
}

# 2) Create Root Folder and Init
New-Item -ItemType Directory -Path $ProjectName | Out-Null
Set-Location $ProjectName

Write-Host "Initializing Root npm..."
npm init -y | Out-Null
npm install concurrently --save-dev

# Update Root scripts
$rootPkg = Get-Content package.json | ConvertFrom-Json
$rootPkg.scripts | Add-Member -NotePropertyName "server" -NotePropertyValue "npm run dev --prefix server" -Force
$rootPkg.scripts | Add-Member -NotePropertyName "client" -NotePropertyValue "npm start --prefix client" -Force
$rootPkg.scripts | Add-Member -NotePropertyName "dev" -NotePropertyValue 'concurrently "npm run server" "npm run client"' -Force
$rootPkg | ConvertTo-Json -Depth 20 | Set-Content package.json

# --- .gitignore ---
@'
# dependencies
/node_modules
/server/node_modules
/client/node_modules
'@ | Set-Content ".gitignore"

# 3) Setup Server (Node.js)
Write-Host "Setting up Server folder..."
New-Item -ItemType Directory -Path "server" | Out-Null
Set-Location server

Write-Host "Initializing Server npm..."
npm init -y | Out-Null

Write-Host "Installing Server dependencies..."
$serverPkg = Get-Content package.json | ConvertFrom-Json
$serverPkg.scripts | Add-Member -NotePropertyName "start" -NotePropertyValue "node server.js" -Force
$serverPkg.scripts | Add-Member -NotePropertyName "dev" -NotePropertyValue "nodemon server.js" -Force
$serverPkg | ConvertTo-Json -Depth 20 | Set-Content package.json
npm install `
  express `
  dotenv `
  helmet `
  cors `
  morgan `
  compression `
  express-rate-limit

# Server Folders
$folders = @("api", "controllers", "routes", "utils")
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
}

# --- vercel config ---
@'
{
  "version": 2,
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
'@ | Set-Content "vercel.json"

# --- API Handler for Vercel ---
@'
const path = require("path");
const dotenv = require("dotenv");
const app = require("../index");

dotenv.config({ path: path.join(__dirname, "../config.env"), quiet: true });

module.exports = async (req, res) => {
  return app(req, res);
};
'@ | Set-Content "api\index.js"

# --- Server Files ---
@'
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.name, err.message);
  process.exit(1);
});
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env", quiet: true });
const app = require("./index");
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 5000}`);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.name, err.message);
  server.close(() => { process.exit(1); });
});
'@ | Set-Content "server.js"


@'
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
'@ | Set-Content "index.js"

@'
NODE_ENV=development
# NODE_ENV=testing
# NODE_ENV=production

PORT=5000
'@ | Set-Content "config.env"

@'
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
'@ | Set-Content "utils\AppError.js"

@'
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
'@ | Set-Content "utils\catchAsync.js"

@'
const express = require("express");
const { doSomething, doSomethingWithId } = require("../controllers/tempController");
const router = express.Router({ mergeParams: true });
router.route("/").get(doSomething);
router.route("/:id").get(doSomethingWithId);
module.exports = router;
'@ | Set-Content "routes\tempRoute.js"

@'
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
exports.doSomething = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: "success", data: { message: "Hello from Server!" } });
});
exports.doSomethingWithId = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new AppError("ID missing", 400));
  res.status(200).json({ status: "success", data: { id } });
});
'@ | Set-Content "controllers\tempController.js"

@'
const AppError = require("../utils/AppError");
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ status: err.status, message: err.message });
  }
  res.status(500).json({ status: "error", message: "Something went wrong!" });
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({ status: err.status, error: err, message: err.message, stack: err.stack });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};
'@ | Set-Content "controllers\errorController.js"

# 4) Setup Client (React)
Set-Location ..
Write-Host "Creating React App (client)..."
npx create-react-app client

Set-Location client

# Add Proxy to package.json
Write-Host "Adding Proxy to client package.json..."
$pkg = Get-Content package.json | ConvertFrom-Json
$pkg | Add-Member -NotePropertyName "proxy" -NotePropertyValue "http://localhost:5000"
$pkg | Add-Member -NotePropertyName "homepage" -NotePropertyValue "."
$pkg | ConvertTo-Json -Depth 20 | Set-Content package.json

# Create createRFC.ps1 in client folder
@'
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$names)
if (-not $names) { Write-Host "Usage: .\createRFC.ps1 <Comp1> <Comp2>"; exit }
$basePath = "src\Components"
if (-not (Test-Path $basePath)) { New-Item -ItemType Directory -Path $basePath -Force | Out-Null }
foreach ($n in $names) {
    $name = $n.Substring(0,1).ToUpper() + $n.Substring(1).ToLower()
    $path = Join-Path $basePath $name
    New-Item -ItemType Directory -Path $path -Force | Out-Null
    @"
import React from 'react'
export default function $name() {
  return (
    <div className='$name-Content'>
        <h2>$name Page</h2>
    </div>
  )
}
"@ | Set-Content "$path\$name.jsx"
    Write-Host "RFC '$name' created."
}
'@ | Set-Content "createRFC.ps1"

Write-Host "Running initial client build..."
npm run build

# Remove production build lines from .gitignore
Write-Host "Removing production build lines from .gitignore..."
$gitignore = Get-Content ".gitignore" -Raw
$gitignore = $gitignore -replace "# production\r?\n", "" -replace "/build\r?\n", ""
$gitignore = $gitignore.Trim() | Set-Content ".gitignore"


# Final Output
Set-Location ..
Write-Host "---"
Write-Host "Fullstack Project '$ProjectName' created successfully!"
Write-Host "Run 'cd $ProjectName' then 'npm run dev' to start."