const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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
