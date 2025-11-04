const { json } = require('@netlify/functions');
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './utils/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'breakfast-secret-2024';

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405, headers });
  }

  try {
    const { username, password, action, role } = JSON.parse(event.body);

    if (action === 'login') {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return json({ error: 'Invalid credentials' }, { status: 401, headers });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return json({ error: 'Invalid credentials' }, { status: 401, headers });
      }

      // Record staff login
      if (user.role === 'staff') {
        await pool.query(
          'INSERT INTO staff_shifts (staff_id) VALUES ($1)',
          [user.id]
        );
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }, { headers });
    }

    if (action === 'register') {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (existingUser.rows.length > 0) {
        return json({ error: 'Username already exists' }, { status: 400, headers });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || 'customer';

      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
        [username, `${username}@breakfast.com`, hashedPassword, userRole]
      );

      const user = result.rows[0];
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return json({
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }, { headers });
    }

    return json({ error: 'Invalid action' }, { status: 400, headers });
  } catch (error) {
    console.error('Auth error:', error);
    return json({ error: 'Internal server error' }, { status: 500, headers });
  }
}