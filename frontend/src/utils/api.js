const API_BASE = '/.netlify/functions';

export async function fetchMenuItems() {
    const response = await fetch(`${API_BASE}/menu`);
    if (!response.ok) throw new Error('Failed to fetch menu');
    return response.json();
}

export async function createOrder(orderData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });
    
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
}

export async function fetchOrders() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/orders`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
}

export async function updateOrderStatus(orderId, status) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/orders`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status })
    });
    
    if (!response.ok) throw new Error('Failed to update order status');
    return response.json();
}

export async function fetchSalesReport(startDate, endDate, productId) {
    const token = localStorage.getItem('token');
    let url = `${API_BASE}/sales`;
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (productId) params.append('productId', productId);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) throw new Error('Failed to fetch sales report');
    return response.json();
}

export async function fetchStaff() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/staff`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) throw new Error('Failed to fetch staff');
    return response.json();
}

export async function createStaffAccount(username, password) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) throw new Error('Failed to create staff account');
    return response.json();
}