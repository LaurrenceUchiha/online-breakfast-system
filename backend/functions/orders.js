const { json } = ('@netlify/functions');
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

function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    const user = authenticate(token);

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    if (event.httpMethod === 'GET') {
      if (user.role === 'admin' || user.role === 'staff') {
        const result = await pool.query(`
          SELECT o.*, u.username as customer_name,
                 json_agg(
                   json_build_object(
                     'id', oi.id,
                     'menu_item_id', oi.menu_item_id,
                     'menu_item_name', mi.name,
                     'quantity', oi.quantity,
                     'price', oi.price
                   )
                 ) as items
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
          GROUP BY o.id, u.username
          ORDER BY o.created_at DESC
        `);
        return json(result.rows, { headers });
      } else {
        const result = await pool.query(`
          SELECT o.*, 
                 json_agg(
                   json_build_object(
                     'id', oi.id,
                     'menu_item_id', oi.menu_item_id,
                     'menu_item_name', mi.name,
                     'quantity', oi.quantity,
                     'price', oi.price
                   )
                 ) as items
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE o.user_id = $1
          GROUP BY o.id
          ORDER BY o.created_at DESC
        `, [user.id]);
        return json(result.rows, { headers });
      }
    }

    if (event.httpMethod === 'POST') {
      const { items, totalAmount, customerInfo } = JSON.parse(event.body);
      const orderNumber = generateOrderNumber();

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const orderResult = await client.query(
          `INSERT INTO orders (user_id, order_number, total_amount, customer_name, customer_address, customer_phone) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [user.id, orderNumber, totalAmount, customerInfo?.name, customerInfo?.address, customerInfo?.phone]
        );
        
        const order = orderResult.rows[0];
        
        for (const item of items) {
          await client.query(
            'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)',
            [order.id, item.id, item.quantity, item.price]
          );
        }

        await client.query(
          'INSERT INTO order_status_history (order_id, status, updated_by) VALUES ($1, $2, $3)',
          [order.id, 'pending', user.id]
        );
        
        await client.query('COMMIT');
        return json({ 
          message: 'Order created successfully', 
          order: { ...order, items } 
        }, { headers });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    if (event.httpMethod === 'PUT') {
      const { orderId, status } = JSON.parse(event.body);
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        await client.query(
          'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [status, orderId]
        );
        
        await client.query(
          'INSERT INTO order_status_history (order_id, status, updated_by) VALUES ($1, $2, $3)',
          [orderId, status, user.id]
        );
        
        await client.query('COMMIT');
        return json({ message: 'Order status updated successfully' }, { headers });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    return json({ error: 'Method not allowed' }, { status: 405, headers });
  } catch (error) {
    console.error('Orders error:', error);
    return json({ error: 'Internal server error' }, { status: 500, headers });
  }
}