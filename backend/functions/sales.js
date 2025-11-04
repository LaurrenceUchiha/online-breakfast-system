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

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return json({ error: 'Method not allowed' }, { status: 405, headers });
  }

  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    const user = authenticate(token);

    if (!user || user.role !== 'admin') {
      return json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    const { startDate, endDate, productId } = event.queryStringParameters || {};

    let salesQuery = `
      SELECT 
        DATE(o.created_at) as date,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_revenue,
        SUM(oi.quantity) as total_items_sold,
        u.username as staff_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN order_status_history osh ON o.id = osh.order_id 
        AND osh.id = (
          SELECT id FROM order_status_history 
          WHERE order_id = o.id AND status = 'delivered' 
          ORDER BY created_at DESC LIMIT 1
        )
      LEFT JOIN users u ON osh.updated_by = u.id
      WHERE o.status = 'delivered'
    `;

    let productQuery = `
      SELECT 
        mi.name as product_name,
        SUM(oi.quantity) as quantity_sold,
        SUM(oi.quantity * oi.price) as revenue,
        COUNT(DISTINCT o.id) as order_count
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'delivered'
    `;

    const queryParams = [];
    const productParams = [];

    if (startDate) {
      queryParams.push(startDate);
      salesQuery += ` AND DATE(o.created_at) >= $${queryParams.length}`;
      
      productParams.push(startDate);
      productQuery += ` AND DATE(o.created_at) >= $${productParams.length}`;
    }

    if (endDate) {
      queryParams.push(endDate);
      salesQuery += ` AND DATE(o.created_at) <= $${queryParams.length}`;
      
      productParams.push(endDate);
      productQuery += ` AND DATE(o.created_at) <= $${productParams.length}`;
    }

    if (productId) {
      productParams.push(productId);
      productQuery += ` AND mi.id = $${productParams.length}`;
    }

    salesQuery += ` GROUP BY DATE(o.created_at), u.username ORDER BY date DESC`;
    productQuery += ` GROUP BY mi.id, mi.name ORDER BY revenue DESC`;

    const salesResult = await pool.query(salesQuery, queryParams);
    const productResult = await pool.query(productQuery, productParams);

    return json({
      salesByDate: salesResult.rows,
      productSales: productResult.rows,
      summary: {
        totalRevenue: salesResult.rows.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0),
        totalOrders: salesResult.rows.reduce((sum, row) => sum + parseInt(row.total_orders || 0), 0),
        totalItems: salesResult.rows.reduce((sum, row) => sum + parseInt(row.total_items_sold || 0), 0)
      }
    }, { headers });
  } catch (error) {
    console.error('Sales error:', error);
    return json({ error: 'Internal server error' }, { status: 500, headers });
  }
}