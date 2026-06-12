// api/message.js
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "2165931",
  key: "b050d69af6d988f13fa8",
  secret: "5530b2772aa92be481c4",
  cluster: "eu",
  useTLS: true,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { text } = req.body;

    // بث الرسالة إلى قناة اسمها "chat-room" تحت حدث اسمه "new-message"
    await pusher.trigger("chat-room", "new-message", { message: text });

    return res.status(200).json({ success: true });
  }
  
  res.status(405).send("Method Not Allowed");
}