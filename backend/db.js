const { Pool } = require('pg');

console.log('[DB INIT] Connecting to DB with:');
console.log({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  env: process.env.NODE_ENV
});

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASS || 'admin123',
  host: process.env.DB_HOST || 'database-svc',
  database: process.env.DB_NAME || (process.env.NODE_ENV === 'production' ? 'socialapp_prod' : 'socialapp'),
  port: 5432,
});

module.exports = pool;
