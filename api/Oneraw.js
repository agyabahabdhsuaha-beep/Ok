import axios from "axios";
import crypto from "crypto";

function validateSecuritySignature(name, token, signature, secret = process.env.SECURITY_SECRET || "default-secret") {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${name}:${token}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  const name = req.query.name;
  const gistId = req.query.gist;
  const token = req.query.token;
  const signature = req.query.sig;
  const ua = (req.headers["user-agent"] || "").toLowerCase();

  // Security checks
  if (!name || !gistId || !token || !signature) {
    return res.status(403).json({ error: "❌ Tham số không hợp lệ" });
  }

  if (!ua.includes("roblox")) {
    console.warn(`[SECURITY] Non-Roblox access attempt to ${name}`);
    return res.status(403).json({ error: "❌ Chỉ Roblox client được phép truy cập" });
  }

  if (!validateSecuritySignature(name, token, signature)) {
    console.warn(`[SECURITY] Signature validation failed for ${name}`);
    return res.status(403).json({ error: "❌ Signature không hợp lệ" });
  }

  try {
    const gistUrl = `https://api.github.com/gists/${gistId}`;
    const response = await axios.get(gistUrl);

    if (!response.data.files) {
      return res.status(404).json({ error: "❌ Không tìm thấy file" });
    }

    const files = response.data.files;
    const file = Object.values(files)[0];

    if (!file) {
      return res.status(404).json({ error: "❌ Không tìm thấy nội dung" });
    }

    const code = file.content;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.send(code);
  } catch (err) {
    console.error("Gist fetch failed:", err.message);
    res.status(404).json({ error: "❌ Không tìm thấy hoặc Gist đã bị xóa" });
  }
}

