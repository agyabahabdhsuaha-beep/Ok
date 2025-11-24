import { getScript } from "./storage.js";

export default async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const name = req.url?.split("/").pop();
    if (!name) return res.status(400).send("Error");

    const script = await getScript(name);
    if (!script) return res.status(404).send("Not found");

    res.status(200).send(script.content);
  } catch (err) {
    console.error("Raw error:", err);
    res.status(500).send("Error");
  }
};
