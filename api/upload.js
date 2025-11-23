import axios from "axios";
import { randomUUID } from "crypto";
import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function createSecuritySignature(name, token, secret = process.env.SECURITY_SECRET || "default-secret") {
  return crypto
    .createHmac("sha256", secret)
    .update(`${name}:${token}`)
    .digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, name } = req.body || {};

  if (!text) {
    return res.status(400).json({ error: "❌ Mã code không được để trống" });
  }

  if (!name) {
    return res.status(400).json({ error: "❌ Vui lòng nhập tên script" });
  }

  if (!/^[a-zA-Z0-9\-]{1,50}$/.test(name)) {
    return res.status(400).json({ error: "❌ Tên script chỉ được chứa chữ cái, số, và dấu gạch ngang (-)" });
  }

  if (text.length > 100 * 1024 * 1024) {
    return res.status(400).json({ error: "❌ Code quá lớn (tối đa 100MB)" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "❌ Server chưa được cấu hình GitHub token" });
  }

  try {
    const id = randomUUID();
    const response = await axios.post(
      "https://api.github.com/gists",
      {
        files: { [`${id}.lua`]: { content: text } },
        public: false,
        description: `MonLuaProtector Gist - ${name}`
      },
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "MonLuaProtector/2.1"
        }
      }
    );

    const gistId = response.data.id;
    const accessToken = generateToken();
    const signature = createSecuritySignature(name, accessToken);
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const rawLink = `${protocol}://${host}/api/raw?name=${name}&gist=${gistId}&token=${accessToken}&sig=${signature}`;

    console.log(`✅ Script uploaded: ${name}`);

    res.json({
      id: gistId,
      name: name,
      token: accessToken,
      signature: signature,
      raw: rawLink
    });
  } catch (err) {
    console.error("Gist upload failed:", err.message);
    res.status(500).json({ error: "❌ Lỗi khi tải lên Gist. Vui lòng thử lại" });
  }
}

