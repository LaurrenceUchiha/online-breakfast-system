const { json } = require('@netlify/functions');
import { pool } from './utils/database.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'breakfast-secret-2024';

// Enhanced CORS headers for production
const getCorsHeaders = (origin = '*') => ({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
});

// Enhanced authentication with role checking
function authenticate(token, requiredRole = null) {
    try {
        if (!token) {
            return { success: false, error: 'No token provided' };
        }
        
        const user = jwt.verify(token, JWT_SECRET);
        
        if (requiredRole && user.role !== requiredRole) {
            return { 
                success: false, 
                error: `Insufficient permissions. Required: ${requiredRole}` 
            };
        }
        
        return { success: true, user };
    } catch (error) {
        console.error('Authentication error:', error.message);
        return { 
            success: false, 
            error: 'Invalid or expired token' 
        };
    }
}

// Input validation
function validateMenuItem(item) {
    const errors = [];
    
    if (!item.name || item.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (!item.description || item.description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
    }
    
    if (!item.price || isNaN(item.price) || parseFloat(item.price) <= 0) {
        errors.push('Price must be a positive number');
    }
    
    if (item.price > 10000) {
        errors.push('Price seems too high. Please verify.');
    }
    
    return errors;
}

// Fallback menu data for when database is unavailable
const fallbackMenu = [
    {
        id: 1,
        name: "Classic Pancakes",
        description: "Fluffy buttermilk pancakes served with maple syrup and butter",
        price: 180.00,
        image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "breakfast",
        is_available: true,
        preparation_time: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        name: "Bacon and Eggs",
        description: "Crispy bacon with two sunny-side-up eggs and toast",
        price: 220.00,
        image_url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "breakfast",
        is_available: true,
        preparation_time: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        name: "French Toast",
        description: "Thick slices of bread dipped in egg batter, served with fresh berries",
        price: 190.00,
        image_url: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "breakfast",
        is_available: true,
        preparation_time: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export async function handler(event) {
    const origin = event.headers.origin || event.headers.Origin || '*';
    const headers = getCorsHeaders(origin);
    
    console.log('🍽️ Menu API called:', {
        method: event.httpMethod,
        path: event.path,
        query: event.queryStringParameters,
        hasBody: !!event.body
    });

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { 
            statusCode: 200, 
            headers, 
            body: '' 
        };
    }

    try {
        // GET - Public endpoint (anyone can view menu)
        if (event.httpMethod === 'GET') {
            console.log('📋 Fetching menu items from database...');
            
            try {
                const result = await pool.query(`
                    SELECT 
                        id, name, description, price, image_url, 
                        category, is_available, preparation_time,
                        created_at, updated_at
                    FROM menu_items 
                    WHERE is_available = true 
                    ORDER BY category, name
                `);
                
                console.log(`✅ Found ${result.rows.length} menu items`);
                
                return json({
                    success: true,
                    data: result.rows,
                    count: result.rows.length,
                    timestamp: new Date().toISOString()
                }, { headers });
                
            } catch (dbError) {
                console.error('❌ Database error, using fallback menu:', dbError);
                
                // Return fallback data if database is unavailable
                return json({
                    success: true,
                    data: fallbackMenu,
                    count: fallbackMenu.length,
                    fallback: true,
                    message: 'Using fallback menu data',
                    timestamp: new Date().toISOString()
                }, { headers });
            }
        }

        // POST - Create new menu item (Admin only)
        if (event.httpMethod === 'POST') {
            console.log('🆕 Creating new menu item...');
            
            const auth = authenticate(event.headers.authorization?.replace('Bearer ', ''), 'admin');
            if (!auth.success) {
                return json({
                    success: false,
                    error: 'Authentication required',
                    details: auth.error
                }, { statusCode: 401, headers });
            }

            let menuData;
            try {
                menuData = JSON.parse(event.body);
            } catch (parseError) {
                return json({
                    success: false,
                    error: 'Invalid JSON in request body'
                }, { statusCode: 400, headers });
            }

            // Validate input
            const validationErrors = validateMenuItem(menuData);
            if (validationErrors.length > 0) {
                return json({
                    success: false,
                    error: 'Validation failed',
                    details: validationErrors
                }, { statusCode: 400, headers });
            }

            try {
                const { name, description, price, image_url, category, preparation_time } = menuData;
                
                const result = await pool.query(
                    `INSERT INTO menu_items 
                     (name, description, price, image_url, category, preparation_time) 
                     VALUES ($1, $2, $3, $4, $5, $6) 
                     RETURNING *`,
                    [
                        name.trim(),
                        description.trim(),
                        parseFloat(price),
                        image_url || `https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60`,
                        category || 'breakfast',
                        preparation_time || 15
                    ]
                );

                console.log('✅ Menu item created successfully:', result.rows[0].name);
                
                return json({
                    success: true,
                    data: result.rows[0],
                    message: 'Menu item created successfully'
                }, { headers });

            } catch (dbError) {
                console.error('❌ Database error creating menu item:', dbError);
                
                return json({
                    success: false,
                    error: 'Failed to create menu item',
                    details: dbError.message
                }, { statusCode: 500, headers });
            }
        }

        // PUT - Update menu item (Admin only)
        if (event.httpMethod === 'PUT') {
            console.log('✏️ Updating menu item...');
            
            const auth = authenticate(event.headers.authorization?.replace('Bearer ', ''), 'admin');
            if (!auth.success) {
                return json({
                    success: false,
                    error: 'Authentication required',
                    details: auth.error
                }, { statusCode: 401, headers });
            }

            let updateData;
            try {
                updateData = JSON.parse(event.body);
            } catch (parseError) {
                return json({
                    success: false,
                    error: 'Invalid JSON in request body'
                }, { statusCode: 400, headers });
            }

            const { id, ...updates } = updateData;

            if (!id) {
                return json({
                    success: false,
                    error: 'Menu item ID is required'
                }, { statusCode: 400, headers });
            }

            // Validate updates if provided
            if (updates.name || updates.description || updates.price) {
                const validationErrors = validateMenuItem({
                    name: updates.name || 'test',
                    description: updates.description || 'test description',
                    price: updates.price || 1
                });
                if (validationErrors.length > 0) {
                    return json({
                        success: false,
                        error: 'Validation failed',
                        details: validationErrors
                    }, { statusCode: 400, headers });
                }
            }

            try {
                // Build dynamic update query
                const allowedFields = ['name', 'description', 'price', 'image_url', 'category', 'is_available', 'preparation_time'];
                const setFields = [];
                const values = [id];
                let paramCount = 1;

                Object.keys(updates).forEach(key => {
                    if (allowedFields.includes(key)) {
                        paramCount++;
                        setFields.push(`${key} = $${paramCount}`);
                        values.push(updates[key]);
                    }
                });

                if (setFields.length === 0) {
                    return json({
                        success: false,
                        error: 'No valid fields to update'
                    }, { statusCode: 400, headers });
                }

                setFields.push('updated_at = CURRENT_TIMESTAMP');

                const query = `
                    UPDATE menu_items 
                    SET ${setFields.join(', ')} 
                    WHERE id = $1 
                    RETURNING *
                `;

                const result = await pool.query(query, values);
                
                if (result.rows.length === 0) {
                    return json({
                        success: false,
                        error: 'Menu item not found'
                    }, { statusCode: 404, headers });
                }

                console.log('✅ Menu item updated successfully:', result.rows[0].name);
                
                return json({
                    success: true,
                    data: result.rows[0],
                    message: 'Menu item updated successfully'
                }, { headers });

            } catch (dbError) {
                console.error('❌ Database error updating menu item:', dbError);
                
                return json({
                    success: false,
                    error: 'Failed to update menu item',
                    details: dbError.message
                }, { statusCode: 500, headers });
            }
        }

        // Method not allowed
        return json({
            success: false,
            error: 'Method not allowed',
            allowedMethods: ['GET', 'POST', 'PUT', 'OPTIONS']
        }, { statusCode: 405, headers });

    } catch (error) {
        console.error('💥 Unexpected error in menu API:', error);
        
        return json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred',
            timestamp: new Date().toISOString()
        }, { statusCode: 500, headers });
    }
}

// Health check endpoint (optional)
export async function healthCheck() {
    try {
        await pool.query('SELECT 1');
        return { healthy: true, database: 'connected' };
    } catch (error) {
        return { healthy: false, database: 'disconnected', error: error.message };
    }
}