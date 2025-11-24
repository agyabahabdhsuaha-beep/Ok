import { getScript, getAllScripts } from "./storage.js";

export default async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const name = req.url?.split("/").pop();
    if (!name) return res.status(400).send("Error: Invalid request");

    // If requesting public-scripts list
    if (name === "public-scripts") {
      const scripts = await getAllScripts();
      res.setHeader("Content-Type", "application/json");
      res.status(200).json(scripts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      return;
    }

    const script = await getScript(name);
    if (!script) return res.status(404).send("Script not found");

    // Remove zero-width characters before sending
    const cleanCode = script.content.replace(/\u200D/g, '');
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(cleanCode);
  } catch (err) {
    console.error("Raw error:", err);
    res.status(500).send("Server error");
  }
};
