import { randomUUID } from "crypto";
import { addScript, scriptExists } from "./storage.js";

export default async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text, name, username } = req.body || {};

  if (!text) return res.status(400).json({ error: "❌ Mã code không được để trống" });
  if (!name) return res.status(400).json({ error: "❌ Vui lòng nhập tên script" });
  if (!username) return res.status(400).json({ error: "❌ Username không xác định" });
  if (!/^[a-zA-Z0-9\-]{1,50}$/.test(name)) {
    return res.status(400).json({ error: "❌ Tên chỉ chứa chữ/số/dấu gạch" });
  }
  if (text.length > 100 * 1024 * 1024) {
    return res.status(400).json({ error: "❌ Code quá lớn" });
  }

  try {
    if (await scriptExists(name)) {
      return res.status(409).json({ error: "❌ Tên đã tồn tại" });
    }

    const ZWJ = '\u200D';
    const invisibleCode = text.split('').map(char => ZWJ + char).join('');
    const id = randomUUID();
    await addScript(name, { id, content: invisibleCode, createdAt: new Date().toISOString(), username, public: true });

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const raw = `${protocol}://${host}/api/raw/${name}`;

    console.log(`✅ Script created by ${username}: ${name}`);
    res.status(200).json({ id, name, raw });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "❌ Lỗi tạo link" });
  }
};
