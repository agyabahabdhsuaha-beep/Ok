let storage = {};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Get name from path or query
  const name = req.query.name || (req.url ? req.url.split('/').pop() : null);
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  if (!name) {
    return res.status(400).json({ error: "❌ Tên script không được để trống" });
  }

  if (!userAgent.includes("roblox")) {
    res.status(403).send(" ");
    return;
  }

  try {
    if (!storage[name]) {
      console.warn(`Script not found: ${name}. Available: ${Object.keys(storage).join(', ')}`);
      return res.status(404).send("❌ Không tìm thấy script này");
    }

    const script = storage[name];
    const cleanCode = script.content.replace(/\u200D/g, '');
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(cleanCode);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("❌ Lỗi lấy script");
  }
}
