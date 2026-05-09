const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_xW6moP8efztF@ep-polished-frost-anj12h57-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function checkProducts() {
  try {
    const { rows } = await pool.query('SELECT id, product_name, images FROM products LIMIT 5');
    console.log('Products sample:');
    console.table(rows);
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();
