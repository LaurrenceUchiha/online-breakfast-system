import { checkAuth, logout } from '../utils/auth.js';
import { fetchMenuItems, createOrder, fetchOrders, updateOrderStatus, fetchSalesReport, fetchStaff, createStaffAccount } from '../utils/api.js';
import { formatPrice, formatDate, calculateOrderTotal, showNotification, handleApiError, getStatusColor, getStatusTextColor } from '../utils/helpers.js';

// Global state
let currentUser = null;
let currentRole = 'customer'; // 'customer', 'staff', 'admin'
let cart = [];
let currentView = 'home';
let menuItems = [];
let customerOrders = [];
let allOrders = [];
let salesData = null;
let staffMembers = [];

export async function initApp() {
    // Check if user is logged in
    currentUser = await checkAuth();
    if (currentUser) {
        currentRole = currentUser.role;
    }
    
    // Check URL for role-specific pages
    const path = window.location.pathname;
    if (path.includes('/staff')) {
        currentRole = 'staff';
        currentView = 'staff-login';
    } else if (path.includes('/admin')) {
        currentRole = 'admin';
        currentView = 'admin-login';
    }
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('breakfast-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    render();
    setupEventListeners();
    
    // Load initial data based on current view
    if (currentView === 'menu') {
        await loadMenuItems();
    }
}

function render() {
    const app = document.getElementById('app');
    if (!app) return;

    let content = '';
    
    switch(currentRole) {
        case 'customer':
            content = renderCustomerApp();
            break;
        case 'staff':
            content = renderStaffApp();
            break;
        case 'admin':
            content = renderAdminApp();
            break;
    }
    
    app.innerHTML = content;
    setupEventListeners();
}

function renderCustomerApp() {
    return `
        ${renderCustomerHeader()}
        <main>
            ${currentView === 'home' ? renderCustomerHome() : ''}
            ${currentView === 'menu' ? renderCustomerMenu() : ''}
            ${currentView === 'cart' ? renderCustomerCart() : ''}
            ${currentView === 'login' ? renderCustomerLogin() : ''}
            ${currentView === 'order-tracking' ? renderOrderTracking() : ''}
            ${currentView === 'checkout' ? renderCheckout() : ''}
        </main>
        ${currentView !== 'login' && currentView !== 'checkout' ? renderFooter() : ''}
    `;
}

function renderStaffApp() {
    return `
        ${currentView === 'staff-login' ? renderStaffLogin() : ''}
        ${currentView === 'staff-dashboard' ? renderStaffDashboard() : ''}
    `;
}

function renderAdminApp() {
    return `
        ${currentView === 'admin-login' ? renderAdminLogin() : ''}
        ${currentView === 'admin-dashboard' ? renderAdminDashboard() : ''}
    `;
}

// Customer Components
function renderCustomerHeader() {
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    return `
        <header class="header">
            <div class="container header-content">
                <div class="logo">Classic American Breakfast</div>
                <nav class="nav">
                    <ul>
                        <li><a href="#" id="home-link">Home</a></li>
                        <li><a href="#" id="menu-link">Menu</a></li>
                        <li><a href="#" id="cart-link">Cart (${cartItemCount})</a></li>
                        ${!currentUser ? 
                            '<li><a href="#" id="login-link">Login</a></li>' : 
                            `<li><a href="#" id="order-tracking-link">My Orders</a></li>
                             <li><a href="#" id="logout-link">Logout (${currentUser.username})</a></li>`
                        }
                    </ul>
                </nav>
            </div>
        </header>
    `;
}

function renderCustomerHome() {
    return `
        <section class="hero">
            <div class="container">
                <h1>Start Your Day with Classic American Breakfast</h1>
                <p>Freshly prepared breakfast classics delivered to your doorstep in Metro Manila</p>
                <button class="btn btn-primary" id="order-now-btn">Order Now</button>
            </div>
        </section>

        <section class="mission-vision">
            <div class="container">
                <div class="mission-vision-grid">
                    <div class="mission">
                        <h2>Our Mission</h2>
                        <p>"To deliver authentic American breakfast experiences straight to your doorstep, using the freshest ingredients with traditional recipes that bring the taste of America to the Philippines."</p>
                    </div>
                    <div class="vision">
                        <h2>Our Vision</h2>
                        <p>"To become Metro Manila's most loved breakfast delivery service, making every morning special with our classic American breakfast offerings."</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="location-section">
            <div class="container">
                <h2>Find Us</h2>
                <div class="map-container">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.788274285836!2d120.9360257759982!3d14.750039785940158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1e0!2f0!3f0!4f0!5e0!3m2!1sen!2sph!4v1698765432107!5m2!1sen!2sph" 
                        width="100%" 
                        height="100%" 
                        style="border:0;" 
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
            </div>
        </section>

        <section class="features container">
            <div class="feature">
                <h3>🍳 Freshly Made</h3>
                <p>All our breakfast items are made fresh daily with quality ingredients</p>
            </div>
            <div class="feature">
                <h3>🚚 Fast Delivery</h3>
                <p>Quick delivery to your doorstep within Metro Manila</p>
            </div>
            <div class="feature">
                <h3>💰 Best Prices</h3>
                <p>Quality breakfast at affordable Philippine Peso prices</p>
            </div>
        </section>
    `;
}

function renderCustomerMenu() {
    return `
        <section class="container">
            <h2 class="section-title">Our Breakfast Menu</h2>
            <p class="menu-notice">Browse our menu freely! Sign in to add items to cart and place orders.</p>
            <div class="menu-grid" id="menu-items">
                ${menuItems.length === 0 ? 
                    '<div class="loading">Loading menu...</div>' : 
                    menuItems.map(item => `
                        <div class="menu-item">
                            <img src="${item.image_url}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'">
                            <div class="menu-item-content">
                                <h3 class="menu-item-title">${item.name}</h3>
                                <p class="menu-item-description">${item.description}</p>
                                <div class="menu-item-price">₱${parseFloat(item.price).toFixed(2)}</div>
                                <button class="add-to-cart" data-id="${item.id}">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </section>
    `;
}

function renderCustomerCart() {
    if (!currentUser) {
        return `
            <section class="container">
                <div class="login-container">
                    <h2>Sign In Required</h2>
                    <p>Please sign in to view your cart and place orders.</p>
                    <button class="btn btn-primary" id="go-to-login">Sign In Now</button>
                </div>
            </section>
        `;
    }

    const total = calculateOrderTotal(cart);
    
    return `
        <section class="container">
            <h2 class="section-title">Your Cart</h2>
            <div class="cart-container">
                ${cart.length === 0 ? 
                    '<div class="empty-cart">' +
                        '<p>Your cart is empty</p>' +
                        '<button class="btn btn-primary" id="browse-menu-btn">Browse Menu</button>' +
                    '</div>' : 
                    cart.map(item => `
                        <div class="cart-item">
                            <div class="cart-item-info">
                                <div class="cart-item-title">${item.name}</div>
                                <div class="cart-item-price">₱${item.price.toFixed(2)} each</div>
                            </div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                                <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                                <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                                <span class="remove-item" data-id="${item.id}">Remove</span>
                            </div>
                        </div>
                    `).join('')
                }
                ${cart.length > 0 ? `
                    <div class="cart-total">
                        Total: ₱${total.toFixed(2)}
                    </div>
                    <button class="btn btn-primary checkout-btn" id="checkout-btn">
                        Proceed to Checkout
                    </button>
                ` : ''}
            </div>
        </section>
    `;
}

function renderCheckout() {
    const total = calculateOrderTotal(cart);
    
    return `
        <section class="container">
            <h2 class="section-title">Checkout</h2>
            <div class="cart-container">
                <h3>Order Summary</h3>
                ${cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">₱${item.price.toFixed(2)} x ${item.quantity}</div>
                        </div>
                        <div class="cart-item-price">
                            ₱${(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                `).join('')}
                
                <div class="cart-total">
                    Total: ₱${total.toFixed(2)}
                </div>
                
                <div class="form-group">
                    <label for="customer-name">Full Name</label>
                    <input type="text" id="customer-name" placeholder="Enter your full name" required>
                </div>
                
                <div class="form-group">
                    <label for="customer-address">Delivery Address</label>
                    <textarea id="customer-address" placeholder="Enter your complete delivery address" required rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="customer-phone">Phone Number</label>
                    <input type="tel" id="customer-phone" placeholder="09XXXXXXXXX" required>
                </div>
                
                <button class="btn btn-primary" id="place-order-btn">Place Order</button>
                <button class="btn btn-outline" id="back-to-cart">Back to Cart</button>
            </div>
        </section>
    `;
}

function renderCustomerLogin() {
    return `
        <section class="container">
            <div class="login-container">
                <h2>Welcome to Classic American Breakfast</h2>
                <p class="login-subtitle">Sign in to place orders and manage your cart</p>
                
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" placeholder="Enter your username">
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" placeholder="Enter your password">
                </div>
                
                <button class="btn btn-primary" id="customer-login-btn">Sign In</button>
                
                <div class="login-divider">
                    <span>or</span>
                </div>
                
                <button class="btn btn-secondary" id="customer-register-btn">Create New Account</button>
            </div>
        </section>
    `;
}

function renderOrderTracking() {
    return `
        <section class="container">
            <h2 class="section-title">My Orders</h2>
            <div class="order-tracking" id="orders-container">
                ${customerOrders.length === 0 ? 
                    '<div class="empty-cart">' +
                        '<p>No orders found</p>' +
                        '<button class="btn btn-primary" id="browse-menu-from-orders">Browse Menu</button>' +
                    '</div>' :
                    customerOrders.map(order => renderOrderCard(order)).join('')
                }
            </div>
        </section>
    `;
}

function renderOrderCard(order) {
    const status = order.status || 'pending';
    const statusStyle = `background: ${getStatusColor(status)}; color: ${getStatusTextColor(status)};`;
    
    return `
        <div class="order-card">
            <div class="order-header">
                <div class="order-number">Order #${order.order_number}</div>
                <div class="order-status" style="${statusStyle}">${status}</div>
            </div>
            
            <div class="order-date">Placed on: ${formatDate(order.created_at)}</div>
            
            <div class="order-items">
                ${order.items ? order.items.map(item => `
                    <div class="order-item">
                        <span>${item.menu_item_name} x ${item.quantity}</span>
                        <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('') : ''}
            </div>
            
            <div class="order-total">Total: ₱${parseFloat(order.total_amount).toFixed(2)}</div>
            
            ${renderOrderTrackingSteps(order.status)}
        </div>
    `;
}

function renderOrderTrackingSteps(status) {
    const steps = [
        { id: 'pending', label: 'Order Placed' },
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'preparing', label: 'Preparing' },
        { id: 'ready', label: 'Ready' },
        { id: 'delivered', label: 'Delivered' }
    ];
    
    const currentIndex = steps.findIndex(step => step.id === status);
    
    return `
        <div class="tracking-steps">
            ${steps.map((step, index) => {
                let stepClass = '';
                if (index < currentIndex) stepClass = 'step-completed';
                else if (index === currentIndex) stepClass = 'step-active';
                
                return `
                    <div class="tracking-step ${stepClass}">
                        <div class="step-indicator">${index + 1}</div>
                        <div class="step-label">${step.label}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Staff Components
function renderStaffLogin() {
    return `
        <div class="login-page">
            <div class="login-container">
                <div class="logo">🍳 Staff Portal</div>
                <h2>Staff Login</h2>
                <p>Access the order management system</p>
                
                <div class="form-group">
                    <label for="staff-username">Username</label>
                    <input type="text" id="staff-username" placeholder="Enter staff username">
                </div>
                
                <div class="form-group">
                    <label for="staff-password">Password</label>
                    <input type="password" id="staff-password" placeholder="Enter staff password">
                </div>
                
                <button class="btn btn-primary" id="staff-login-btn">Sign In as Staff</button>
                <p class="login-note">
                    <a href="/">← Back to Customer Site</a>
                </p>
            </div>
        </div>
    `;
}

function renderStaffDashboard() {
    const pendingOrders = allOrders.filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status));
    const readyOrders = allOrders.filter(order => order.status === 'ready');
    
    return `
        <div class="staff-dashboard">
            <header class="header">
                <div class="container header-content">
                    <div class="logo">Staff Dashboard</div>
                    <nav class="nav">
                        <ul>
                            <li><a href="#" id="staff-orders-link">Orders (${allOrders.length})</a></li>
                            <li><a href="#" id="staff-logout-link">Logout (${currentUser?.username})</a></li>
                        </ul>
                    </nav>
                </div>
            </header>
            
            <main class="container">
                <h2 class="section-title">Order Management</h2>
                
                ${pendingOrders.length > 0 ? `
                    <h3>Active Orders (${pendingOrders.length})</h3>
                    <div class="orders-list">
                        ${pendingOrders.map(order => renderStaffOrderCard(order)).join('')}
                    </div>
                ` : ''}
                
                ${readyOrders.length > 0 ? `
                    <h3>Ready for Pickup (${readyOrders.length})</h3>
                    <div class="orders-list">
                        ${readyOrders.map(order => renderStaffOrderCard(order)).join('')}
                    </div>
                ` : ''}
                
                ${allOrders.length === 0 ? '<div class="loading">No orders to display</div>' : ''}
            </main>
        </div>
    `;
}

function renderStaffOrderCard(order) {
    const status = order.status || 'pending';
    const statusStyle = `background: ${getStatusColor(status)}; color: ${getStatusTextColor(status)};`;
    const nextStatus = getNextStatus(status);
    
    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-number">Order #${order.order_number}</div>
                    <div class="order-customer">Customer: ${order.customer_name || 'N/A'}</div>
                </div>
                <div class="order-status" style="${statusStyle}">${status}</div>
            </div>
            
            <div class="order-items">
                ${order.items ? order.items.map(item => `
                    <div class="order-item">
                        <span>${item.menu_item_name} x ${item.quantity}</span>
                        <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('') : ''}
            </div>
            
            <div class="order-total">Total: ₱${parseFloat(order.total_amount).toFixed(2)}</div>
            
            ${nextStatus ? `
                <div class="order-actions">
                    <button class="btn btn-primary update-status-btn" data-order-id="${order.id}" data-new-status="${nextStatus}">
                        Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// Admin Components
function renderAdminLogin() {
    return `
        <div class="login-page">
            <div class="login-container">
                <div class="logo">🍳 Admin Portal</div>
                <h2>Admin Login</h2>
                <p>Access the administration dashboard</p>
                
                <div class="form-group">
                    <label for="admin-username">Username</label>
                    <input type="text" id="admin-username" placeholder="Enter admin username">
                </div>
                
                <div class="form-group">
                    <label for="admin-password">Password</label>
                    <input type="password" id="admin-password" placeholder="Enter admin password">
                </div>
                
                <button class="btn btn-primary" id="admin-login-btn">Sign In as Admin</button>
                <p class="login-note">
                    <a href="/">← Back to Customer Site</a>
                </p>
            </div>
        </div>
    `;
}

function renderAdminDashboard() {
    return `
        <div class="admin-dashboard">
            <header class="header">
                <div class="container header-content">
                    <div class="logo">Admin Dashboard</div>
                    <nav class="nav">
                        <ul>
                            <li><a href="#" id="admin-overview-link" class="${currentView === 'admin-overview' ? 'active' : ''}">Overview</a></li>
                            <li><a href="#" id="admin-menu-link" class="${currentView === 'admin-menu' ? 'active' : ''}">Menu</a></li>
                            <li><a href="#" id="admin-sales-link" class="${currentView === 'admin-sales' ? 'active' : ''}">Sales</a></li>
                            <li><a href="#" id="admin-staff-link" class="${currentView === 'admin-staff' ? 'active' : ''}">Staff</a></li>
                            <li><a href="#" id="admin-logout-link">Logout (${currentUser?.username})</a></li>
                        </ul>
                    </nav>
                </div>
            </header>
            
            <main class="container">
                <div id="admin-content">
                    ${currentView === 'admin-overview' ? renderAdminOverview() : ''}
                    ${currentView === 'admin-menu' ? renderAdminMenuManagement() : ''}
                    ${currentView === 'admin-sales' ? renderAdminSales() : ''}
                    ${currentView === 'admin-staff' ? renderAdminStaff() : ''}
                </div>
            </main>
        </div>
    `;
}

function renderAdminOverview() {
    const totalRevenue = salesData?.summary?.totalRevenue || 0;
    const totalOrders = salesData?.summary?.totalOrders || 0;
    const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
    
    return `
        <h2 class="section-title">Dashboard Overview</h2>
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <h3>Today's Revenue</h3>
                <div class="number">₱${totalRevenue.toFixed(2)}</div>
            </div>
            <div class="dashboard-card">
                <h3>Total Orders</h3>
                <div class="number">${totalOrders}</div>
            </div>
            <div class="dashboard-card">
                <h3>Pending Orders</h3>
                <div class="number">${pendingOrders}</div>
            </div>
        </div>
        
        <h3>Recent Orders</h3>
        <div class="orders-list">
            ${allOrders.slice(0, 5).map(order => renderStaffOrderCard(order)).join('')}
            ${allOrders.length === 0 ? '<div class="loading">No recent orders</div>' : ''}
        </div>
    `;
}

function renderAdminMenuManagement() {
    return `
        <h2 class="section-title">Menu Management</h2>
        <button class="btn btn-primary" id="add-menu-item-btn">Add New Menu Item</button>
        
        <div class="menu-grid">
            ${menuItems.map(item => `
                <div class="menu-item">
                    <img src="${item.image_url}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'">
                    <div class="menu-item-content">
                        <h3 class="menu-item-title">${item.name}</h3>
                        <p class="menu-item-description">${item.description}</p>
                        <div class="menu-item-price">₱${parseFloat(item.price).toFixed(2)}</div>
                        <button class="btn btn-outline edit-menu-item" data-id="${item.id}">Edit</button>
                        <button class="btn btn-secondary toggle-availability" data-id="${item.id}" data-available="${item.is_available}">
                            ${item.is_available ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAdminSales() {
    return `
        <h2 class="section-title">Sales Report</h2>
        
        <div class="sales-filters">
            <div class="filter-row">
                <div class="form-group">
                    <label for="start-date">Start Date</label>
                    <input type="date" id="start-date">
                </div>
                <div class="form-group">
                    <label for="end-date">End Date</label>
                    <input type="date" id="end-date">
                </div>
                <button class="btn btn-primary" id="generate-report-btn">Generate Report</button>
            </div>
        </div>
        
        ${salesData ? `
            <div class="sales-summary">
                <div class="summary-card">
                    <h4>Total Revenue</h4>
                    <div class="value">₱${salesData.summary.totalRevenue.toFixed(2)}</div>
                </div>
                <div class="summary-card">
                    <h4>Total Orders</h4>
                    <div class="value">${salesData.summary.totalOrders}</div>
                </div>
                <div class="summary-card">
                    <h4>Items Sold</h4>
                    <div class="value">${salesData.summary.totalItems}</div>
                </div>
            </div>
            
            <h3>Product Sales</h3>
            <div class="orders-list">
                ${salesData.productSales.map(product => `
                    <div class="order-card">
                        <h4>${product.product_name}</h4>
                        <p>Quantity Sold: ${product.quantity_sold}</p>
                        <p>Revenue: ₱${parseFloat(product.revenue).toFixed(2)}</p>
                        <p>Orders: ${product.order_count}</p>
                    </div>
                `).join('')}
            </div>
        ` : '<div class="loading">Select date range to generate report</div>'}
    `;
}

function renderAdminStaff() {
    return `
        <h2 class="section-title">Staff Management</h2>
        
        <div class="add-staff-form">
            <h3>Add New Staff</h3>
            <div class="form-group">
                <label for="new-staff-username">Username</label>
                <input type="text" id="new-staff-username" placeholder="Enter username for new staff">
            </div>
            <div class="form-group">
                <label for="new-staff-password">Password</label>
                <input type="password" id="new-staff-password" placeholder="Enter password">
            </div>
            <button class="btn btn-primary" id="create-staff-btn">Create Staff Account</button>
        </div>
        
        <h3>Current Staff</h3>
        <div class="staff-list">
            ${staffMembers.map(staff => `
                <div class="staff-card">
                    <div class="staff-info">
                        <h4>${staff.username}</h4>
                        <p>Role: ${staff.role} | Created: ${formatDate(staff.created_at)}</p>
                    </div>
                </div>
            `).join('')}
            ${staffMembers.length === 0 ? '<div class="loading">No staff accounts</div>' : ''}
        </div>
    `;
}

function renderFooter() {
    return `
        <footer class="footer">
            <div class="container footer-content">
                <div class="footer-section">
                    <h3>Classic American Breakfast</h3>
                    <p>Your favorite breakfast classics, delivered fresh to your door.</p>
                </div>
                <div class="footer-section">
                    <h3>Contact Us</h3>
                    <p>Phone: (02) 1234-5678</p>
                    <p>Email: info@classicbreakfast.ph</p>
                    <p>Address: 123 Breakfast St, Manila, Philippines</p>
                </div>
                <div class="footer-section">
                    <h3>Opening Hours</h3>
                    <p>Monday - Friday: 6:00 AM - 2:00 PM</p>
                    <p>Saturday - Sunday: 7:00 AM - 12:00 PM</p>
                </div>
            </div>
            <div class="container copyright">
                <p>&copy; 2023 Classic American Breakfast. All rights reserved.</p>
            </div>
        </footer>
    `;
}

// Event Listeners
function setupEventListeners() {
    // Customer Navigation
    document.getElementById('home-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'home';
        render();
    });

    document.getElementById('menu-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'menu';
        render();
        loadMenuItems();
    });

    document.getElementById('cart-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) {
            showAuthModal('access your cart');
        } else {
            currentView = 'cart';
            render();
        }
    });

    document.getElementById('login-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'login';
        render();
    });

    document.getElementById('order-tracking-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'order-tracking';
        render();
        loadCustomerOrders();
    });

    document.getElementById('logout-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // Customer Actions
    document.getElementById('order-now-btn')?.addEventListener('click', () => {
        currentView = 'menu';
        render();
        loadMenuItems();
    });

    document.getElementById('go-to-login')?.addEventListener('click', () => {
        currentView = 'login';
        render();
    });

    document.getElementById('browse-menu-btn')?.addEventListener('click', () => {
        currentView = 'menu';
        render();
        loadMenuItems();
    });

    document.getElementById('browse-menu-from-orders')?.addEventListener('click', () => {
        currentView = 'menu';
        render();
        loadMenuItems();
    });

    document.getElementById('customer-login-btn')?.addEventListener('click', handleCustomerLogin);
    document.getElementById('customer-register-btn')?.addEventListener('click', handleCustomerRegister);
    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        currentView = 'checkout';
        render();
    });
    document.getElementById('back-to-cart')?.addEventListener('click', () => {
        currentView = 'cart';
        render();
    });
    document.getElementById('place-order-btn')?.addEventListener('click', handlePlaceOrder);

    // Staff Actions
    document.getElementById('staff-login-btn')?.addEventListener('click', handleStaffLogin);
    document.getElementById('staff-logout-link')?.addEventListener('click', handleLogout);

    // Admin Actions
    document.getElementById('admin-login-btn')?.addEventListener('click', handleAdminLogin);
    document.getElementById('admin-logout-link')?.addEventListener('click', handleLogout);
    document.getElementById('admin-overview-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'admin-overview';
        render();
        loadAdminData();
    });
    document.getElementById('admin-menu-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'admin-menu';
        render();
        loadMenuItems();
    });
    document.getElementById('admin-sales-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'admin-sales';
        render();
    });
    document.getElementById('admin-staff-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'admin-staff';
        render();
        loadStaffMembers();
    });
    document.getElementById('generate-report-btn')?.addEventListener('click', handleGenerateReport);
    document.getElementById('create-staff-btn')?.addEventListener('click', handleCreateStaff);

    // Cart actions
    setTimeout(() => {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.dataset.id);
                handleAddToCart(itemId);
            });
        });

        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.dataset.id);
                const action = e.target.dataset.action;
                handleQuantityChange(itemId, action);
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.dataset.id);
                handleRemoveFromCart(itemId);
            });
        });

        document.querySelectorAll('.update-status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.target.dataset.orderId);
                const newStatus = e.target.dataset.newStatus;
                handleUpdateOrderStatus(orderId, newStatus);
            });
        });
    }, 100);
}

// Data Loading Functions
async function loadMenuItems() {
    try {
        menuItems = await fetchMenuItems();
        render();
    } catch (error) {
        handleApiError(error);
    }
}

async function loadCustomerOrders() {
    if (!currentUser) return;
    
    try {
        customerOrders = await fetchOrders();
        render();
    } catch (error) {
        handleApiError(error);
    }
}

async function loadAllOrders() {
    try {
        allOrders = await fetchOrders();
        render();
    } catch (error) {
        handleApiError(error);
    }
}

async function loadAdminData() {
    await Promise.all([
        loadAllOrders(),
        loadSalesData()
    ]);
}

async function loadSalesData() {
    try {
        // Load sales data for the last 7 days by default
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        salesData = await fetchSalesReport(startDate, endDate);
        render();
    } catch (error) {
        handleApiError(error);
    }
}

async function loadStaffMembers() {
    try {
        staffMembers = await fetchStaff();
        render();
    } catch (error) {
        handleApiError(error);
    }
}

// Authentication handlers
async function handleCustomerLogin() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error);
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        showNotification('Login successful!');
        currentView = 'menu';
        render();
        loadMenuItems();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleCustomerRegister() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error);
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        showNotification('Registration successful! Welcome!');
        currentView = 'menu';
        render();
        loadMenuItems();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleStaffLogin() {
    const username = document.getElementById('staff-username')?.value;
    const password = document.getElementById('staff-password')?.value;
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error);
        }
        
        if (data.user.role !== 'staff' && data.user.role !== 'admin') {
            throw new Error('Staff access required');
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        currentView = 'staff-dashboard';
        render();
        loadAllOrders();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleAdminLogin() {
    const username = document.getElementById('admin-username')?.value;
    const password = document.getElementById('admin-password')?.value;
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    try {
        const response = await fetch('/.netlify/functions/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error);
        }
        
        if (data.user.role !== 'admin') {
            throw new Error('Admin access required');
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        currentView = 'admin-dashboard';
        render();
        loadAdminData();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('breakfast-cart');
    currentUser = null;
    cart = [];
    currentView = 'home';
    currentRole = 'customer';
    window.location.href = '/';
}

// Cart functionality
function handleAddToCart(itemId) {
    if (!currentUser) {
        showAuthModal('add items to cart');
        return;
    }
    
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: 1
        });
    }
    
    saveCart();
    showNotification(`${item.name} added to cart!`);
    render();
}

function handleQuantityChange(itemId, action) {
    const itemIndex = cart.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    if (action === 'increase') {
        cart[itemIndex].quantity += 1;
    } else if (action === 'decrease') {
        cart[itemIndex].quantity -= 1;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    
    saveCart();
    render();
}

function handleRemoveFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    render();
}

async function handlePlaceOrder() {
    const name = document.getElementById('customer-name')?.value;
    const address = document.getElementById('customer-address')?.value;
    const phone = document.getElementById('customer-phone')?.value;
    
    if (!name || !address || !phone) {
        showNotification('Please fill in all customer information', 'error');
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    try {
        const totalAmount = calculateOrderTotal(cart);
        const orderData = {
            items: cart,
            totalAmount,
            customerInfo: { name, address, phone }
        };
        
        await createOrder(orderData);
        showNotification('Order placed successfully!');
        
        // Clear cart
        cart = [];
        saveCart();
        
        currentView = 'order-tracking';
        render();
        loadCustomerOrders();
    } catch (error) {
        showNotification('Error placing order. Please try again.', 'error');
    }
}

async function handleUpdateOrderStatus(orderId, newStatus) {
    try {
        await updateOrderStatus(orderId, newStatus);
        showNotification(`Order status updated to ${newStatus}`);
        await loadAllOrders();
    } catch (error) {
        showNotification('Error updating order status', 'error');
    }
}

async function handleGenerateReport() {
    const startDate = document.getElementById('start-date')?.value;
    const endDate = document.getElementById('end-date')?.value;
    
    try {
        salesData = await fetchSalesReport(startDate, endDate);
        render();
        showNotification('Sales report generated');
    } catch (error) {
        showNotification('Error generating sales report', 'error');
    }
}

async function handleCreateStaff() {
    const username = document.getElementById('new-staff-username')?.value;
    const password = document.getElementById('new-staff-password')?.value;
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        await createStaffAccount(username, password);
        showNotification('Staff account created successfully');
        document.getElementById('new-staff-username').value = '';
        document.getElementById('new-staff-password').value = '';
        await loadStaffMembers();
    } catch (error) {
        showNotification('Error creating staff account', 'error');
    }
}

// Utility functions
function saveCart() {
    localStorage.setItem('breakfast-cart', JSON.stringify(cart));
}

function showAuthModal(action) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <h3>Sign In Required</h3>
            <p>You need to sign in to ${action}.</p>
            <div class="modal-buttons">
                <button class="btn btn-secondary" id="cancel-action">Maybe Later</button>
                <button class="btn btn-primary" id="auth-and-continue">Sign In & Continue</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('cancel-action').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('auth-and-continue').addEventListener('click', () => {
        document.body.removeChild(modal);
        currentView = 'login';
        render();
    });
}

function getNextStatus(currentStatus) {
    const statusFlow = {
        'pending': 'confirmed',
        'confirmed': 'preparing',
        'preparing': 'ready',
        'ready': 'delivered'
    };
    return statusFlow[currentStatus];
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);