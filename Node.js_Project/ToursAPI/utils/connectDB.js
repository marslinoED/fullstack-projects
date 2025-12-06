const mongoose = require("mongoose");

let isDBConnected = false;

const connectDB = async () => {
  try {
    await mongoose.connect(
      // process.env.DB_CNNSTR_LOCAL

      process.env.DB_CNNSTR.replace(
        "<USERNAME>",
        process.env.DB_USERNAME
      ).replace("<PASSWORD>", process.env.DB_PASSWORD)
    );

    console.log("DB connected!");
  } catch (err) {
    console.error("DB connection error:", err.message);
    isDBConnected = false;
  }
};

mongoose.connection.on("connected", () => {
  isDBConnected = true;
});

mongoose.connection.on("disconnected", () => {
  isDBConnected = false;
});

mongoose.connection.on("error", (err) => {
  isDBConnected = false;
});

const isConnected = () => isDBConnected;
module.exports = { connectDB, isConnected };
