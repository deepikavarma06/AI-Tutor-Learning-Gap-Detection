export default function healthCheck(req, res) {
  res.json({
    status: "OK",
    message: "AI Tutor API is healthy"
  });
}