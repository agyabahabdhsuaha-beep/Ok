import { storage, getScript } from "./storage.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Get name from path parameter
  const pathParts = req.url.split('/');
  const name = pathParts[pathParts.length - 1];
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  console.log(`[RAW] Requested: ${name}, UserAgent: ${userAgent}, Available scripts: ${Object.keys(storage).join(', ')}`);

  if (!name || name === "") {
    return res.status(400).json({ error: "❌ Tên script không được để trống" });
  }

  // Allow Roblox client (check both user-agent patterns)
  if (!userAgent.includes("roblox") && !userAgent.includes("httprequests")) {
    console.warn(`[SECURITY] Non-Roblox access attempt to ${name}, UA: ${userAgent}`);
    res.status(403).send(" ");
    return;
  }

  try {
    const script = getScript(name);
    
    if (!script) {
      console.warn(`[RAW] Script not found: ${name}`);
      return res.status(404).send("❌ Không tìm thấy script này");
    }

    const cleanCode = script.content.replace(/\u200D/g, '');
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    console.log(`[RAW] Successfully served: ${name}`);
    res.send(cleanCode);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("❌ Lỗi lấy script");
  }
}
