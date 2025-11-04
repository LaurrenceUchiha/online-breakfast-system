import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});