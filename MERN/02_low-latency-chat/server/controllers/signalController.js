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

// إضافة هذا الـ Method بجانب sendMessage في ملف الـ Controllers الخاص بك
exports.sendSignal = catchAsync(async (req, res, next) => {
  if (req.method === "POST") {
    const { signalData, roomCode } =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!signalData || !roomCode) {
      return next(new AppError("Missing roomCode or signalData", 400));
    }

    // بث إشارة الـ WebRTC داخل نفس الـ roomCode بحدث منفصل اسمه webrtc-signal
    await pusher.trigger(`chat-room-${roomCode}`, "webrtc-signal", {
      signal: signalData,
    });

    return res.status(200).json({ success: true });
  }

  return next(new AppError("Invalid request method", 405));
});
