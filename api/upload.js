import { randomUUID } from "crypto";

let storage = {};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, name } = req.body || {};

  if (!text) return res.status(400).json({ error: "❌ Mã code không được để trống" });
  if (!name) return res.status(400).json({ error: "❌ Vui lòng nhập tên script" });

  if (!/^[a-zA-Z0-9\-]{1,50}$/.test(name)) {
    return res.status(400).json({ error: "❌ Tên script chỉ được chứa chữ cái, số, và dấu gạch ngang (-)" });
  }

  if (text.length > 100 * 1024 * 1024) {
    return res.status(400).json({ error: "❌ Code quá lớn (tối đa 100MB)" });
  }

  try {
    if (storage[name]) {
      return res.status(409).json({ error: "❌ Tên này đã được sử dụng. Vui lòng chọn tên khác" });
    }

    const ZWJ = '\u200D';
    const invisibleCode = text.split('').map(char => ZWJ + char).join('');
    console.log(`🛡️  Code protected (invisible - zero-width characters)`);

    const id = randomUUID();
    storage[name] = { id, content: invisibleCode, createdAt: new Date().toISOString() };

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const rawLink = `${protocol}://${host}/api/raw/${name}`;

    console.log(`✅ Script created: ${name}`);
    res.status(200).json({ id, name, raw: rawLink });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: `❌ Lỗi tạo link: ${err.message}` });
  }
}
