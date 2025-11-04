import { json } from '@netlify/functions';
import { pool } from './utils/database.js';
import jwt from 'jsonwebtoken';

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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const result = await pool.query(
        'SELECT * FROM menu_items WHERE is_available = true ORDER BY category, name'
      );
      return json(result.rows, { headers });
    }

    // Verify admin for write operations
    const token = event.headers.authorization?.replace('Bearer ', '');
    const user = authenticate(token);

    if (!user || user.role !== 'admin') {
      return json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    if (event.httpMethod === 'POST') {
      const { name, description, price, image_url, category } = JSON.parse(event.body);
      const result = await pool.query(
        'INSERT INTO menu_items (name, description, price, image_url, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, price, image_url, category || 'breakfast']
      );
      return json(result.rows[0], { headers });
    }

    if (event.httpMethod === 'PUT') {
      const { id, ...updates } = JSON.parse(event.body);
      const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = [id, ...Object.values(updates)];
      
      const result = await pool.query(
        `UPDATE menu_items SET ${setClause} WHERE id = $1 RETURNING *`,
        values
      );
      return json(result.rows[0], { headers });
    }

    return json({ error: 'Method not allowed' }, { status: 405, headers });
  } catch (error) {
    console.error('Menu error:', error);
    return json({ error: 'Internal server error' }, { status: 500, headers });
  }
}