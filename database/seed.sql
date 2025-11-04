-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@breakfast.com', '$2a$10$K9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert staff users (password: staff123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('staff1', 'staff1@breakfast.com', '$2a$10$S9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9', 'staff'),
('staff2', 'staff2@breakfast.com', '$2a$10$S9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9', 'staff'),
('chef1', 'chef1@breakfast.com', '$2a$10$S9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9', 'staff')
ON CONFLICT (username) DO NOTHING;

-- Insert sample customer (password: customer123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('customer1', 'customer1@example.com', '$2a$10$C9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9', 'customer')
ON CONFLICT (username) DO NOTHING;

-- Insert menu items
INSERT INTO menu_items (name, description, price, image_url, category, preparation_time) VALUES
('Classic Pancakes', 'Fluffy buttermilk pancakes served with maple syrup and butter', 180.00, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 10),
('Bacon and Eggs', 'Crispy bacon with two sunny-side-up eggs and toast', 220.00, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 12),
('French Toast', 'Thick slices of bread dipped in egg batter, served with berries', 190.00, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 8),
('Breakfast Burrito', 'Scrambled eggs, cheese, and sausage wrapped in a flour tortilla', 210.00, 'https://images.unsplash.com/photo-1626700051175-6818013e0331?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 15),
('Avocado Toast', 'Smashed avocado on artisan bread with cherry tomatoes', 160.00, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 5),
('Breakfast Sandwich', 'Egg, cheese, and ham on an English muffin', 175.00, 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 7),
('Omelette', 'Three-egg omelette with your choice of fillings', 200.00, 'https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 12),
('Breakfast Platter', 'Eggs, bacon, sausage, hash browns, and toast', 280.00, 'https://images.unsplash.com/photo-1552627963-6d3f2dca2bb4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 18),
('Greek Yogurt Parfait', 'Layers of Greek yogurt, granola, and fresh berries', 140.00, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'healthy', 3),
('Breakfast Quesadilla', 'Flour tortilla filled with eggs, cheese, and vegetables', 195.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 10),
('Hash Brown Bowl', 'Crispy hash browns topped with eggs, cheese, and bacon', 230.00, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 14),
('Breakfast Tacos', 'Soft tortillas filled with scrambled eggs and toppings', 165.00, 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'breakfast', 9)
ON CONFLICT DO NOTHING;

-- Insert sample orders
INSERT INTO orders (user_id, order_number, total_amount, status, customer_name, customer_address, customer_phone, special_instructions) VALUES
(4, 'ORD-231215-001', 560.00, 'delivered', 'John Santos', '123 Main St, Manila', '09171234567', 'Extra maple syrup for pancakes'),
(4, 'ORD-231215-002', 395.00, 'preparing', 'John Santos', '123 Main St, Manila', '09171234567', 'No onions in the burrito'),
(NULL, 'ORD-231215-003', 720.00, 'confirmed', 'Maria Reyes', '456 Oak Ave, Quezon City', '09177654321', 'Please ring doorbell twice'),
(NULL, 'ORD-231215-004', 190.00, 'pending', 'Carlos Lim', '789 Pine St, Makati', '09179876543', 'Contactless delivery please')
ON CONFLICT (order_number) DO NOTHING;

-- Insert order items
INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
(1, 1, 2, 180.00), -- 2x Pancakes
(1, 8, 1, 280.00), -- 1x Breakfast Platter
(2, 4, 1, 210.00), -- 1x Breakfast Burrito
(2, 6, 1, 175.00), -- 1x Breakfast Sandwich
(3, 8, 2, 280.00), -- 2x Breakfast Platter
(3, 2, 1, 220.00), -- 1x Bacon and Eggs
(4, 3, 1, 190.00)  -- 1x French Toast
ON CONFLICT DO NOTHING;

-- Insert order status history
INSERT INTO order_status_history (order_id, status, updated_by, notes) VALUES
(1, 'pending', 1, 'Order received'),
(1, 'confirmed', 2, 'Order confirmed by staff'),
(1, 'preparing', 3, 'Chef started preparation'),
(1, 'ready', 2, 'Order ready for delivery'),
(1, 'delivered', 2, 'Delivered to customer'),
(2, 'pending', 1, 'Order received'),
(2, 'confirmed', 2, 'Order confirmed'),
(2, 'preparing', 3, 'Preparation in progress'),
(3, 'pending', 1, 'Order received'),
(3, 'confirmed', 2, 'Order confirmed'),
(4, 'pending', 1, 'Order received')
ON CONFLICT DO NOTHING;

-- Insert staff shifts
INSERT INTO staff_shifts (staff_id, login_time, logout_time) VALUES
(2, '2023-12-15 06:00:00', '2023-12-15 14:00:00'),
(3, '2023-12-15 06:00:00', '2023-12-15 14:00:00'),
(2, '2023-12-16 06:00:00', NULL) -- Current active shift
ON CONFLICT DO NOTHING;

-- Insert sample payments
INSERT INTO payments (order_id, payment_method, amount, status) VALUES
(1, 'cash', 560.00, 'completed'),
(2, 'cash', 395.00, 'pending'),
(3, 'card', 720.00, 'completed'),
(4, 'cash', 190.00, 'pending')
ON CONFLICT DO NOTHING;

-- Insert sample inventory
INSERT INTO inventory (menu_item_id, quantity, unit, low_stock_threshold) VALUES
(1, 50, 'servings', 10),
(2, 30, 'servings', 5),
(3, 25, 'servings', 5),
(4, 20, 'servings', 5),
(5, 40, 'servings', 8),
(6, 35, 'servings', 7),
(7, 28, 'servings', 6),
(8, 15, 'servings', 3),
(9, 60, 'servings', 12),
(10, 22, 'servings', 5),
(11, 18, 'servings', 4),
(12, 32, 'servings', 7)
ON CONFLICT DO NOTHING;

-- Create a view for order summaries
CREATE OR REPLACE VIEW order_summaries AS
SELECT 
    o.id,
    o.order_number,
    o.total_amount,
    o.status,
    o.customer_name,
    o.customer_phone,
    o.created_at,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_quantity,
    u.username as staff_username
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN order_status_history osh ON o.id = osh.order_id 
    AND osh.id = (
        SELECT id FROM order_status_history 
        WHERE order_id = o.id 
        ORDER BY created_at DESC 
        LIMIT 1
    )
LEFT JOIN users u ON osh.updated_by = u.id
GROUP BY o.id, o.order_number, o.total_amount, o.status, o.customer_name, o.customer_phone, o.created_at, u.username;

-- Create a view for daily sales
CREATE OR REPLACE VIEW daily_sales AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_revenue,
    SUM(oi.quantity) as total_items_sold,
    AVG(o.total_amount) as average_order_value
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'delivered'
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;