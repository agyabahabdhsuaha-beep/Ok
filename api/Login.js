import { initDb } from "./db.js";

let users = [
  { username: 'user', password: '123456' },
  { username: 'mcjthebest', password: 'therealMcj2' }
];

await initDb();

export default async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "❌ Vui lòng nhập username và password" });
  }

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "❌ Username hoặc password sai" });
  }

  res.json({ username: user.username });
};
