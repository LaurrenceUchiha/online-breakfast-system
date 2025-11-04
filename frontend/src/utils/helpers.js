// Utility functions
export function formatPrice(price) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(price);
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random.toString().padStart(3, '0')}`;
}

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePhone(phone) {
    const re = /^09\d{9}$/;
    return re.test(phone);
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function getStatusColor(status) {
    const statusColors = {
        pending: '#fff3cd',
        confirmed: '#cce5ff',
        preparing: '#d4edda',
        ready: '#d1ecf1',
        delivered: '#d4edda',
        cancelled: '#f8d7da'
    };
    return statusColors[status] || '#f8f9fa';
}

export function getStatusTextColor(status) {
    const statusTextColors = {
        pending: '#856404',
        confirmed: '#004085',
        preparing: '#155724',
        ready: '#0c5460',
        delivered: '#155724',
        cancelled: '#721c24'
    };
    return statusTextColors[status] || '#6c757d';
}

export function calculateOrderTotal(items) {
    return items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

export function groupOrdersByStatus(orders) {
    return orders.reduce((groups, order) => {
        const status = order.status;
        if (!groups[status]) {
            groups[status] = [];
        }
        groups[status].push(order);
        return groups;
    }, {});
}

export function sortOrdersByDate(orders, ascending = false) {
    return orders.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return ascending ? dateA - dateB : dateB - dateA;
    });
}

export function filterOrdersByDate(orders, startDate, endDate) {
    return orders.filter(order => {
        const orderDate = new Date(order.created_at);
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        
        return orderDate >= start && orderDate <= end;
    });
}

export function exportToCSV(data, filename) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const cell = row[header];
            return typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.click();
    window.URL.revokeObjectURL(url);
}

export function showNotification(message, type = 'success') {
    // This would be implemented with a proper notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
}

export function handleApiError(error) {
    console.error('API Error:', error);
    showNotification(error.message || 'An error occurred', 'error');
}

// Local storage helpers
export const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch {
            return false;
        }
    }
};

// Form validation
export const validators = {
    required: (value) => {
        if (!value || value.toString().trim() === '') {
            return 'This field is required';
        }
        return null;
    },
    
    email: (value) => {
        if (value && !validateEmail(value)) {
            return 'Please enter a valid email address';
        }
        return null;
    },
    
    phone: (value) => {
        if (value && !validatePhone(value)) {
            return 'Please enter a valid Philippine phone number (09XXXXXXXXX)';
        }
        return null;
    },
    
    minLength: (min) => (value) => {
        if (value && value.length < min) {
            return `Must be at least ${min} characters long`;
        }
        return null;
    },
    
    number: (value) => {
        if (value && isNaN(value)) {
            return 'Must be a valid number';
        }
        return null;
    },
    
    positive: (value) => {
        if (value && parseFloat(value) <= 0) {
            return 'Must be a positive number';
        }
        return null;
    }
};

export function validateForm(formData, rules) {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
        const value = formData[field];
        const fieldRules = rules[field];
        
        for (const rule of fieldRules) {
            const error = rule(value);
            if (error) {
                errors[field] = error;
                break;
            }
        }
    });
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}