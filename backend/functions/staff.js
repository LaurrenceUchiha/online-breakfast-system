import { json } from '@netlify/functions';
import { pool } from './utils/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'breakfast-secret-2024';

function authenticate(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    const user = authenticate(token);

    if (!user || user.role !== 'admin') {
      return json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    if (event.httpMethod === 'GET') {
      const result = await pool.query(
        'SELECT id, username, email, role, created_at FROM users WHERE role IN ($1, $2) ORDER BY created_at DESC',
        ['staff', 'admin']
      );
      return json(result.rows, { headers });
    }

    if (event.httpMethod === 'POST') {
      const { username, password } = JSON.parse(event.body);

      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (existingUser.rows.length > 0) {
        return json({ error: 'Username already exists' }, { status: 400, headers });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role, created_at',
        [username, `${username}@breakfast.com`, hashedPassword, 'staff']
      );

      return json({ 
        message: 'Staff account created successfully',
        staff: result.rows[0]
      }, { headers });
    }

    return json({ error: 'Method not allowed' }, { status: 405, headers });
  } catch (error) {
    console.error('Staff error:', error);
    return json({ error: 'Internal server error' }, { status: 500, headers });
  }
}