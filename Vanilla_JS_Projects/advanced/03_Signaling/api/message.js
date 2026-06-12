// api/message.js
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "2165931",
  key: "b050d69af6d988f13fa8",
  secret: "5530b2772aa92be481c4",
  cluster: "eu",
  useTLS: true,
});

// الاعتماد على module.exports بدلاً من export default لتجنب خلط الأنظمة
module.exports = async (req, res) => {
  if (req.method === "POST") {
    // التأكد من عمل Parse للـ body إذا قادم كـ String أو Object
    const { text } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    try {
      // بث الرسالة إلى Pusher
      await pusher.trigger("chat-room", "new-message", { message: text });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).send("Method Not Allowed");
};