const API_BASE = '/.netlify/functions';

// Enhanced fetch with timeout and retry logic
async function enhancedFetch(url, options = {}) {
    const timeout = 10000; // 10 second timeout
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                // Handle specific HTTP status codes
                if (response.status === 401) {
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    throw new Error('Authentication failed. Please login again.');
                } else if (response.status === 404) {
                    throw new Error('API endpoint not found. Please check deployment.');
                } else if (response.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                }
                
                // Try to get error message from response
                let errorMessage = `Request failed with status ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // If response isn't JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }
            
            return response;
            
        } catch (error) {
            console.error(`API Request attempt ${attempt} failed:`, error);
            
            if (attempt === maxRetries) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout. Please check your connection.');
                }
                throw error;
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

// Get authentication token with validation
function getAuthToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found. Please login.');
    }
    return token;
}

// Menu API
export async function fetchMenuItems() {
    try {
        console.log('📋 Fetching menu items from:', `${API_BASE}/menu`);
        const response = await enhancedFetch(`${API_BASE}/menu`);
        const menuItems = await response.json();
        console.log('✅ Menu items fetched successfully:', menuItems.length, 'items');
        return menuItems;
    } catch (error) {
        console.error('❌ Failed to fetch menu items:', error);
        
        // Return fallback menu if API fails
        if (error.message.includes('endpoint not found') || error.message.includes('timeout')) {
            console.warn('🔄 Using fallback menu data');
            return getFallbackMenu();
        }
        
        throw new Error(`Menu unavailable: ${error.message}`);
    }
}

// Orders API
export async function createOrder(orderData) {
    try {
        const token = getAuthToken();
        console.log('📦 Creating order:', orderData);
        
        const response = await enhancedFetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        console.log('✅ Order created successfully:', result);
        return result;
    } catch (error) {
        console.error('❌ Failed to create order:', error);
        throw new Error(`Order creation failed: ${error.message}`);
    }
}

export async function fetchOrders() {
    try {
        const token = getAuthToken();
        console.log('📋 Fetching orders...');
        
        const response = await enhancedFetch(`${API_BASE}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const orders = await response.json();
        console.log('✅ Orders fetched successfully:', orders.length, 'orders');
        return orders;
    } catch (error) {
        console.error('❌ Failed to fetch orders:', error);
        throw new Error(`Could not load orders: ${error.message}`);
    }
}

export async function updateOrderStatus(orderId, status) {
    try {
        const token = getAuthToken();
        console.log('🔄 Updating order status:', { orderId, status });
        
        const response = await enhancedFetch(`${API_BASE}/orders`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderId, status })
        });
        
        const result = await response.json();
        console.log('✅ Order status updated successfully');
        return result;
    } catch (error) {
        console.error('❌ Failed to update order status:', error);
        throw new Error(`Status update failed: ${error.message}`);
    }
}

// Sales API
export async function fetchSalesReport(startDate, endDate, productId) {
    try {
        const token = getAuthToken();
        
        let url = `${API_BASE}/sales`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (productId) params.append('productId', productId);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        console.log('📊 Fetching sales report:', url);
        
        const response = await enhancedFetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const report = await response.json();
        console.log('✅ Sales report fetched successfully');
        return report;
    } catch (error) {
        console.error('❌ Failed to fetch sales report:', error);
        throw new Error(`Sales report unavailable: ${error.message}`);
    }
}

// Staff Management API
export async function fetchStaff() {
    try {
        const token = getAuthToken();
        console.log('👥 Fetching staff members...');
        
        const response = await enhancedFetch(`${API_BASE}/staff`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const staff = await response.json();
        console.log('✅ Staff members fetched successfully:', staff.length, 'staff');
        return staff;
    } catch (error) {
        console.error('❌ Failed to fetch staff:', error);
        throw new Error(`Staff list unavailable: ${error.message}`);
    }
}

export async function createStaffAccount(username, password) {
    try {
        const token = getAuthToken();
        console.log('👤 Creating staff account:', username);
        
        const response = await enhancedFetch(`${API_BASE}/staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        console.log('✅ Staff account created successfully');
        return result;
    } catch (error) {
        console.error('❌ Failed to create staff account:', error);
        throw new Error(`Staff creation failed: ${error.message}`);
    }
}

// Authentication API
export async function loginUser(username, password) {
    try {
        console.log('🔐 Attempting login for:', username);
        
        const response = await enhancedFetch(`${API_BASE}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'login',
                username,
                password
            })
        });
        
        const result = await response.json();
        console.log('✅ Login successful');
        return result;
    } catch (error) {
        console.error('❌ Login failed:', error);
        throw new Error(`Login failed: ${error.message}`);
    }
}

export async function registerUser(username, password) {
    try {
        console.log('📝 Registering new user:', username);
        
        const response = await enhancedFetch(`${API_BASE}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'register',
                username,
                password
            })
        });
        
        const result = await response.json();
        console.log('✅ Registration successful');
        return result;
    } catch (error) {
        console.error('❌ Registration failed:', error);
        throw new Error(`Registration failed: ${error.message}`);
    }
}

// Health check - test if backend is available
export async function healthCheck() {
    try {
        console.log('🏥 Performing health check...');
        const response = await enhancedFetch(`${API_BASE}/menu`);
        const data = await response.json();
        console.log('✅ Backend health check passed');
        return { healthy: true, data };
    } catch (error) {
        console.error('❌ Backend health check failed:', error);
        return { healthy: false, error: error.message };
    }
}

// Fallback menu data for when API is unavailable
function getFallbackMenu() {
    return [
        {
            id: 1,
            name: "Classic Pancakes",
            description: "Fluffy buttermilk pancakes served with maple syrup and butter",
            price: 180.00,
            image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            category: "breakfast",
            is_available: true
        },
        {
            id: 2,
            name: "Bacon and Eggs",
            description: "Crispy bacon with two sunny-side-up eggs and toast",
            price: 220.00,
            image_url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            category: "breakfast", 
            is_available: true
        }
    ];
}

// Export for debugging
window.BreakfastAPI = {
    fetchMenuItems,
    createOrder,
    fetchOrders,
    updateOrderStatus,
    fetchSalesReport,
    fetchStaff,
    createStaffAccount,
    loginUser,
    registerUser,
    healthCheck,
    API_BASE
};