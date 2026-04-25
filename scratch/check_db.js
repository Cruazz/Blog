import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_8ilvOJAMp4jW@ep-quiet-wave-am2rgxn0-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function checkPost() {
  try {
    const { rows } = await pool.query("SELECT title, slug, published FROM posts WHERE slug = 'vibes-coding-how-i-helped-my-junior-actually-enjoy-programming'");
    console.log(JSON.stringify(rows, null, 2));
    
    if (rows.length === 0) {
        console.log("No post found with that slug. Listing all slugs:");
        const all = await pool.query("SELECT slug FROM posts LIMIT 10");
        console.log(JSON.stringify(all.rows, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkPost();
