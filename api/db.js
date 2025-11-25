import pkg from 'pg';
const { Pool } = pkg;

let pool = null;

export function initPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

export async function initDb() {
  const pool = initPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scripts (
        name VARCHAR(50) PRIMARY KEY,
        id UUID,
        content TEXT,
        username VARCHAR(100),
        public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

export async function addScript(name, id, content, username) {
  const pool = initPool();
  try {
    await pool.query(
      'INSERT INTO scripts (name, id, content, username, public, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [name, id, content, username, true]
    );
    return true;
  } catch (err) {
    console.error('Add script error:', err.message);
    return false;
  }
}

export async function getScript(name) {
  const pool = initPool();
  try {
    const result = await pool.query('SELECT * FROM scripts WHERE name = $1', [name]);
    return result.rows[0] || null;
  } catch (err) {
    console.error('Get script error:', err.message);
    return null;
  }
}

export async function scriptExists(name) {
  const pool = initPool();
  try {
    const result = await pool.query('SELECT 1 FROM scripts WHERE name = $1', [name]);
    return result.rows.length > 0;
  } catch (err) {
    console.error('Script exists error:', err.message);
    return false;
  }
}

export async function getAllScripts() {
  const pool = initPool();
  try {
    const result = await pool.query(
      'SELECT name, username, created_at, content FROM scripts WHERE public = true ORDER BY created_at DESC'
    );
    return result.rows.map(row => ({
      name: row.name,
      username: row.username || 'Anonymous',
      createdAt: row.created_at.toISOString(),
      preview: row.content.replace(/\u200D/g, '').substring(0, 200)
    }));
  } catch (err) {
    console.error('Get all scripts error:', err.message);
    return [];
  }
}
