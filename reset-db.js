import { createPool } from '@vercel/postgres';
import 'dotenv/config';

async function main() {
  const pool = createPool({ connectionString: process.env.POSTGRES_URL });
  await pool.query(`DROP SCHEMA public CASCADE;`);
  await pool.query(`CREATE SCHEMA public;`);
  console.log('Database dropped and recreated.');
}
main();
