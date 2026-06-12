const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.pusher_app_id,
  key: process.env.pusher_key,
  secret: process.env.pusher_secret,
  cluster: process.env.pusher_cluster,
  useTLS: true,
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  if (req.method === "POST") {

    const { text, roomCode, userId } =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!text) {
      return next(new AppError("Message text is required", 400));
    }

    if (!roomCode) {
      return next(new AppError("Room code is required", 400));
    }

    if (!userId) {
      return next(new AppError("User ID is required", 400));
    }

    await pusher.trigger(`chat-room-${roomCode}`, "new-message", {
      message: text,
      author: userId,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  }

  return next(new AppError("Invalid request method", 405));
});
