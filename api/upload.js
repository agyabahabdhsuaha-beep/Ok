import { randomUUID } from "crypto";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_FILE = path.join(__dirname, "..", "scripts.json");

async function loadStorage() {
  try {
    if (await fs.pathExists(STORAGE_FILE)) {
      return await fs.readJSON(STORAGE_FILE);
    }
  } catch (err) {
    console.error("Load error:", err.message);
  }
  return {};
}

async function saveStorage(data) {
  try {
    await fs.writeJSON(STORAGE_FILE, data, { spaces: 2 });
  } catch (err) {
    console.error("Save error:", err.message);
  }
}

export default async function handler(req, res) {
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
    let storage = await loadStorage();

    if (storage[name]) {
      return res.status(409).json({ error: "❌ Tên này đã được sử dụng. Vui lòng chọn tên khác" });
    }

    const ZWJ = '\u200D';
    const invisibleCode = text.split('').map(char => ZWJ + char).join('');
    console.log(`🛡️  Code protected (invisible - zero-width characters)`);

    const id = randomUUID();
    storage[name] = { id, content: invisibleCode, createdAt: new Date().toISOString() };
    await saveStorage(storage);

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const rawLink = `${protocol}://${host}/api/raw?name=${name}`;

    console.log(`✅ Script created: ${name}`);
    res.status(200).json({ id, name, raw: rawLink });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "❌ Lỗi tạo link. Vui lòng thử lại" });
  }
}
