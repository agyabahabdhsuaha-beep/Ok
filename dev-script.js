import express from "express";
import { randomUUID } from "crypto";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import luamin from "luamin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static("."));

// Storage file
const STORAGE_FILE = path.join(__dirname, "scripts.json");

// Load/save storage
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

let storage = await loadStorage();

// Serve index.html
app.get("/", async (req, res) => {
  const htmlPath = path.join(__dirname, "index.html");
  try {
    const html = await fs.readFile(htmlPath, "utf8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(html);
  } catch (err) {
    res.status(500).send("Cannot load page");
  }
});

// Create raw link
app.post("/api/upload", async (req, res) => {
  const { text, name, username } = req.body || {};

  if (!text) return res.status(400).json({ error: "❌ Mã code không được để trống" });
  if (!name) return res.status(400).json({ error: "❌ Vui lòng nhập tên script" });
  if (!username) return res.status(400).json({ error: "❌ Username không xác định" });

  if (!/^[a-zA-Z0-9\-]{1,50}$/.test(name)) {
    return res.status(400).json({ error: "❌ Tên script chỉ được chứa chữ cái, số, và dấu gạch ngang (-)" });
  }

  if (storage[name]) {
    return res.status(409).json({ error: "❌ Tên này đã được sử dụng. Vui lòng chọn tên khác" });
  }

  if (text.length > 100 * 1024 * 1024) {
    return res.status(400).json({ error: "❌ Code quá lớn (tối đa 100MB)" });
  }

  try {
    // Make code invisible using zero-width characters
    const ZWJ = '\u200D'; // Zero Width Joiner
    const invisibleCode = text.split('').map(char => ZWJ + char).join('');
    console.log(`🛡️  Code protected (invisible - zero-width characters)`);

    const id = randomUUID();
    storage[name] = { 
      id, 
      content: invisibleCode, 
      createdAt: new Date().toISOString(),
      username: username,
      public: true
    };
    await saveStorage(storage);

    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const rawLink = `${protocol}://${host}/api/raw/${name}`;

    console.log(`✅ Script created by ${username}: ${name}`);
    res.json({ id, name, raw: rawLink });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "❌ Lỗi tạo link. Vui lòng thử lại" });
  }
});

// Get all public scripts with preview
app.get("/api/public-scripts", async (req, res) => {
  try {
    const scripts = [];
    for (const [name, data] of Object.entries(storage)) {
      if (data.public) {
        const cleanCode = data.content.replace(/\u200D/g, '');
        const preview = cleanCode.substring(0, 200);
        scripts.push({
          name,
          username: data.username || "Anonymous",
          createdAt: data.createdAt,
          preview: preview
        });
      }
    }
    res.json(scripts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Lỗi lấy danh sách script" });
  }
});

// Get total scripts count
app.get("/api/stats", async (req, res) => {
  try {
    const totalScripts = Object.values(storage).filter(s => s.public).length;
    res.json({ totalScripts });
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy thống kê" });
  }
});

// Get raw script - only allow Roblox client
app.get("/api/raw/:name", async (req, res) => {
  const name = req.params.name;
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  // Check if request is from Roblox client
  if (!userAgent.includes("roblox")) {
    res.status(403).send(" ");
    return;
  }

  if (!storage[name]) {
    return res.status(404).send("❌ Không tìm thấy script này");
  }

  try {
    const script = storage[name];
    // Remove zero-width characters before sending to Roblox
    const cleanCode = script.content.replace(/\u200D/g, '');
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(cleanCode);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("❌ Lỗi lấy script");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🛡️ LuaProtector Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Local storage mode - no GitHub needed`);
});
