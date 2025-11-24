import { getScript } from "./storage.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const pathParts = req.url.split('/');
    const name = pathParts[pathParts.length - 1];

    if (!name || name === "" || name === "raw") {
      return res.status(400).send("Error: No script name");
    }

    const script = await getScript(name);
    
    if (!script) {
      console.warn(`❌ Script not found: ${name}`);
      return res.status(404).send("Not found");
    }

    console.log(`✅ Served: ${name} (${script.content.length} bytes)`);
    res.status(200).send(script.content);
  } catch (err) {
    console.error("❌ Raw endpoint error:", err.message);
    res.status(500).send("Error");
  }
}
