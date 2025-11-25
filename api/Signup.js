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

  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: "❌ Username đã tồn tại" });
  }

  users.push({ username, password });
  console.log(`✅ New user registered: ${username}`);
  res.json({ username, success: true });
};
