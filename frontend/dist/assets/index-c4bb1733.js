(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const f of s.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&r(f)}).observe(document,{childList:!0,subtree:!0});function n(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(a){if(a.ep)return;a.ep=!0;const s=n(a);fetch(a.href,s)}})();async function se(){const e=localStorage.getItem("token"),t=localStorage.getItem("user");if(!e||!t)return null;try{return JSON.parse(t)}catch{return null}}const y="/.netlify/functions";async function ie(){const e=await fetch(`${y}/menu`);if(!e.ok)throw new Error("Failed to fetch menu");return e.json()}async function oe(e){const t=localStorage.getItem("token"),n=await fetch(`${y}/orders`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify(e)});if(!n.ok)throw new Error("Failed to create order");return n.json()}async function Q(){const e=localStorage.getItem("token"),t=await fetch(`${y}/orders`,{headers:{Authorization:`Bearer ${e}`}});if(!t.ok)throw new Error("Failed to fetch orders");return t.json()}async function de(e,t){const n=localStorage.getItem("token"),r=await fetch(`${y}/orders`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({orderId:e,status:t})});if(!r.ok)throw new Error("Failed to update order status");return r.json()}async function G(e,t,n){const r=localStorage.getItem("token");let a=`${y}/sales`;const s=new URLSearchParams;e&&s.append("startDate",e),t&&s.append("endDate",t),n&&s.append("productId",n),s.toString()&&(a+=`?${s.toString()}`);const f=await fetch(a,{headers:{Authorization:`Bearer ${r}`}});if(!f.ok)throw new Error("Failed to fetch sales report");return f.json()}async function ce(){const e=localStorage.getItem("token"),t=await fetch(`${y}/staff`,{headers:{Authorization:`Bearer ${e}`}});if(!t.ok)throw new Error("Failed to fetch staff");return t.json()}async function le(e,t){const n=localStorage.getItem("token"),r=await fetch(`${y}/staff`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({username:e,password:t})});if(!r.ok)throw new Error("Failed to create staff account");return r.json()}function V(e){return new Date(e).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function W(e){return{pending:"#fff3cd",confirmed:"#cce5ff",preparing:"#d4edda",ready:"#d1ecf1",delivered:"#d4edda",cancelled:"#f8d7da"}[e]||"#f8f9fa"}function K(e){return{pending:"#856404",confirmed:"#004085",preparing:"#155724",ready:"#0c5460",delivered:"#155724",cancelled:"#721c24"}[e]||"#6c757d"}function C(e){return e.reduce((t,n)=>t+n.price*n.quantity,0)}function c(e,t="success"){console.log(`[${t.toUpperCase()}] ${e}`)}function k(e){console.error("API Error:",e),c(e.message||"An error occurred","error")}let u=null,b="customer",l=[],i="home",w=[],O=[],h=[],m=null,B=[];async function Z(){u=await se(),u&&(b=u.role);const e=window.location.pathname;e.includes("/staff")?(b="staff",i="staff-login"):e.includes("/admin")&&(b="admin",i="admin-login");const t=localStorage.getItem("breakfast-cart");t&&(l=JSON.parse(t)),o(),ee(),i==="menu"&&await v()}function o(){const e=document.getElementById("app");if(!e)return;let t="";switch(b){case"customer":t=ue();break;case"staff":t=me();break;case"admin":t=fe();break}e.innerHTML=t,ee()}function ue(){return`
        ${pe()}
        <main>
            ${i==="home"?ve():""}
            ${i==="menu"?he():""}
            ${i==="cart"?ge():""}
            ${i==="login"?be():""}
            ${i==="order-tracking"?we():""}
            ${i==="checkout"?ye():""}
        </main>
        ${i!=="login"&&i!=="checkout"?Pe():""}
    `}function me(){return`
        ${i==="staff-login"?Ee():""}
        ${i==="staff-dashboard"?Se():""}
    `}function fe(){return`
        ${i==="admin-login"?Ie():""}
        ${i==="admin-dashboard"?Oe():""}
    `}function pe(){return`
        <header class="header">
            <div class="container header-content">
                <div class="logo">Classic American Breakfast</div>
                <nav class="nav">
                    <ul>
                        <li><a href="#" id="home-link">Home</a></li>
                        <li><a href="#" id="menu-link">Menu</a></li>
                        <li><a href="#" id="cart-link">Cart (${l.reduce((t,n)=>t+n.quantity,0)})</a></li>
                        ${u?`<li><a href="#" id="order-tracking-link">My Orders</a></li>
                             <li><a href="#" id="logout-link">Logout (${u.username})</a></li>`:'<li><a href="#" id="login-link">Login</a></li>'}
                    </ul>
                </nav>
            </div>
        </header>
    `}function ve(){return`
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
    `}function he(){return`
        <section class="container">
            <h2 class="section-title">Our Breakfast Menu</h2>
            <p class="menu-notice">Browse our menu freely! Sign in to add items to cart and place orders.</p>
            <div class="menu-grid" id="menu-items">
                ${w.length===0?'<div class="loading">Loading menu...</div>':w.map(e=>`
                        <div class="menu-item">
                            <img src="${e.image_url}" alt="${e.name}" onerror="this.src='https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'">
                            <div class="menu-item-content">
                                <h3 class="menu-item-title">${e.name}</h3>
                                <p class="menu-item-description">${e.description}</p>
                                <div class="menu-item-price">₱${parseFloat(e.price).toFixed(2)}</div>
                                <button class="add-to-cart" data-id="${e.id}">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    `).join("")}
            </div>
        </section>
    `}function ge(){if(!u)return`
            <section class="container">
                <div class="login-container">
                    <h2>Sign In Required</h2>
                    <p>Please sign in to view your cart and place orders.</p>
                    <button class="btn btn-primary" id="go-to-login">Sign In Now</button>
                </div>
            </section>
        `;const e=C(l);return`
        <section class="container">
            <h2 class="section-title">Your Cart</h2>
            <div class="cart-container">
                ${l.length===0?'<div class="empty-cart"><p>Your cart is empty</p><button class="btn btn-primary" id="browse-menu-btn">Browse Menu</button></div>':l.map(t=>`
                        <div class="cart-item">
                            <div class="cart-item-info">
                                <div class="cart-item-title">${t.name}</div>
                                <div class="cart-item-price">₱${t.price.toFixed(2)} each</div>
                            </div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn" data-id="${t.id}" data-action="decrease">-</button>
                                <input type="text" class="quantity-input" value="${t.quantity}" readonly>
                                <button class="quantity-btn" data-id="${t.id}" data-action="increase">+</button>
                                <span class="remove-item" data-id="${t.id}">Remove</span>
                            </div>
                        </div>
                    `).join("")}
                ${l.length>0?`
                    <div class="cart-total">
                        Total: ₱${e.toFixed(2)}
                    </div>
                    <button class="btn btn-primary checkout-btn" id="checkout-btn">
                        Proceed to Checkout
                    </button>
                `:""}
            </div>
        </section>
    `}function ye(){const e=C(l);return`
        <section class="container">
            <h2 class="section-title">Checkout</h2>
            <div class="cart-container">
                <h3>Order Summary</h3>
                ${l.map(t=>`
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-title">${t.name}</div>
                            <div class="cart-item-price">₱${t.price.toFixed(2)} x ${t.quantity}</div>
                        </div>
                        <div class="cart-item-price">
                            ₱${(t.price*t.quantity).toFixed(2)}
                        </div>
                    </div>
                `).join("")}
                
                <div class="cart-total">
                    Total: ₱${e.toFixed(2)}
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
    `}function be(){return`
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
    `}function we(){return`
        <section class="container">
            <h2 class="section-title">My Orders</h2>
            <div class="order-tracking" id="orders-container">
                ${O.length===0?'<div class="empty-cart"><p>No orders found</p><button class="btn btn-primary" id="browse-menu-from-orders">Browse Menu</button></div>':O.map(e=>ke(e)).join("")}
            </div>
        </section>
    `}function ke(e){const t=e.status||"pending",n=`background: ${W(t)}; color: ${K(t)};`;return`
        <div class="order-card">
            <div class="order-header">
                <div class="order-number">Order #${e.order_number}</div>
                <div class="order-status" style="${n}">${t}</div>
            </div>
            
            <div class="order-date">Placed on: ${V(e.created_at)}</div>
            
            <div class="order-items">
                ${e.items?e.items.map(r=>`
                    <div class="order-item">
                        <span>${r.menu_item_name} x ${r.quantity}</span>
                        <span>₱${(r.price*r.quantity).toFixed(2)}</span>
                    </div>
                `).join(""):""}
            </div>
            
            <div class="order-total">Total: ₱${parseFloat(e.total_amount).toFixed(2)}</div>
            
            ${$e(e.status)}
        </div>
    `}function $e(e){const t=[{id:"pending",label:"Order Placed"},{id:"confirmed",label:"Confirmed"},{id:"preparing",label:"Preparing"},{id:"ready",label:"Ready"},{id:"delivered",label:"Delivered"}],n=t.findIndex(r=>r.id===e);return`
        <div class="tracking-steps">
            ${t.map((r,a)=>{let s="";return a<n?s="step-completed":a===n&&(s="step-active"),`
                    <div class="tracking-step ${s}">
                        <div class="step-indicator">${a+1}</div>
                        <div class="step-label">${r.label}</div>
                    </div>
                `}).join("")}
        </div>
    `}function Ee(){return`
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
    `}function Se(){const e=h.filter(n=>["pending","confirmed","preparing"].includes(n.status)),t=h.filter(n=>n.status==="ready");return`
        <div class="staff-dashboard">
            <header class="header">
                <div class="container header-content">
                    <div class="logo">Staff Dashboard</div>
                    <nav class="nav">
                        <ul>
                            <li><a href="#" id="staff-orders-link">Orders (${h.length})</a></li>
                            <li><a href="#" id="staff-logout-link">Logout (${u==null?void 0:u.username})</a></li>
                        </ul>
                    </nav>
                </div>
            </header>
            
            <main class="container">
                <h2 class="section-title">Order Management</h2>
                
                ${e.length>0?`
                    <h3>Active Orders (${e.length})</h3>
                    <div class="orders-list">
                        ${e.map(n=>A(n)).join("")}
                    </div>
                `:""}
                
                ${t.length>0?`
                    <h3>Ready for Pickup (${t.length})</h3>
                    <div class="orders-list">
                        ${t.map(n=>A(n)).join("")}
                    </div>
                `:""}
                
                ${h.length===0?'<div class="loading">No orders to display</div>':""}
            </main>
        </div>
    `}function A(e){const t=e.status||"pending",n=`background: ${W(t)}; color: ${K(t)};`,r=Ue(t);return`
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-number">Order #${e.order_number}</div>
                    <div class="order-customer">Customer: ${e.customer_name||"N/A"}</div>
                </div>
                <div class="order-status" style="${n}">${t}</div>
            </div>
            
            <div class="order-items">
                ${e.items?e.items.map(a=>`
                    <div class="order-item">
                        <span>${a.menu_item_name} x ${a.quantity}</span>
                        <span>₱${(a.price*a.quantity).toFixed(2)}</span>
                    </div>
                `).join(""):""}
            </div>
            
            <div class="order-total">Total: ₱${parseFloat(e.total_amount).toFixed(2)}</div>
            
            ${r?`
                <div class="order-actions">
                    <button class="btn btn-primary update-status-btn" data-order-id="${e.id}" data-new-status="${r}">
                        Mark as ${r.charAt(0).toUpperCase()+r.slice(1)}
                    </button>
                </div>
            `:""}
        </div>
    `}function Ie(){return`
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
    `}function Oe(){return`
        <div class="admin-dashboard">
            <header class="header">
                <div class="container header-content">
                    <div class="logo">Admin Dashboard</div>
                    <nav class="nav">
                        <ul>
                            <li><a href="#" id="admin-overview-link" class="${i==="admin-overview"?"active":""}">Overview</a></li>
                            <li><a href="#" id="admin-menu-link" class="${i==="admin-menu"?"active":""}">Menu</a></li>
                            <li><a href="#" id="admin-sales-link" class="${i==="admin-sales"?"active":""}">Sales</a></li>
                            <li><a href="#" id="admin-staff-link" class="${i==="admin-staff"?"active":""}">Staff</a></li>
                            <li><a href="#" id="admin-logout-link">Logout (${u==null?void 0:u.username})</a></li>
                        </ul>
                    </nav>
                </div>
            </header>
            
            <main class="container">
                <div id="admin-content">
                    ${i==="admin-overview"?Be():""}
                    ${i==="admin-menu"?Ae():""}
                    ${i==="admin-sales"?Ce():""}
                    ${i==="admin-staff"?Le():""}
                </div>
            </main>
        </div>
    `}function Be(){var r,a;const e=((r=m==null?void 0:m.summary)==null?void 0:r.totalRevenue)||0,t=((a=m==null?void 0:m.summary)==null?void 0:a.totalOrders)||0,n=h.filter(s=>s.status==="pending").length;return`
        <h2 class="section-title">Dashboard Overview</h2>
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <h3>Today's Revenue</h3>
                <div class="number">₱${e.toFixed(2)}</div>
            </div>
            <div class="dashboard-card">
                <h3>Total Orders</h3>
                <div class="number">${t}</div>
            </div>
            <div class="dashboard-card">
                <h3>Pending Orders</h3>
                <div class="number">${n}</div>
            </div>
        </div>
        
        <h3>Recent Orders</h3>
        <div class="orders-list">
            ${h.slice(0,5).map(s=>A(s)).join("")}
            ${h.length===0?'<div class="loading">No recent orders</div>':""}
        </div>
    `}function Ae(){return`
        <h2 class="section-title">Menu Management</h2>
        <button class="btn btn-primary" id="add-menu-item-btn">Add New Menu Item</button>
        
        <div class="menu-grid">
            ${w.map(e=>`
                <div class="menu-item">
                    <img src="${e.image_url}" alt="${e.name}" onerror="this.src='https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'">
                    <div class="menu-item-content">
                        <h3 class="menu-item-title">${e.name}</h3>
                        <p class="menu-item-description">${e.description}</p>
                        <div class="menu-item-price">₱${parseFloat(e.price).toFixed(2)}</div>
                        <button class="btn btn-outline edit-menu-item" data-id="${e.id}">Edit</button>
                        <button class="btn btn-secondary toggle-availability" data-id="${e.id}" data-available="${e.is_available}">
                            ${e.is_available?"Disable":"Enable"}
                        </button>
                    </div>
                </div>
            `).join("")}
        </div>
    `}function Ce(){return`
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
        
        ${m?`
            <div class="sales-summary">
                <div class="summary-card">
                    <h4>Total Revenue</h4>
                    <div class="value">₱${m.summary.totalRevenue.toFixed(2)}</div>
                </div>
                <div class="summary-card">
                    <h4>Total Orders</h4>
                    <div class="value">${m.summary.totalOrders}</div>
                </div>
                <div class="summary-card">
                    <h4>Items Sold</h4>
                    <div class="value">${m.summary.totalItems}</div>
                </div>
            </div>
            
            <h3>Product Sales</h3>
            <div class="orders-list">
                ${m.productSales.map(e=>`
                    <div class="order-card">
                        <h4>${e.product_name}</h4>
                        <p>Quantity Sold: ${e.quantity_sold}</p>
                        <p>Revenue: ₱${parseFloat(e.revenue).toFixed(2)}</p>
                        <p>Orders: ${e.order_count}</p>
                    </div>
                `).join("")}
            </div>
        `:'<div class="loading">Select date range to generate report</div>'}
    `}function Le(){return`
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
            ${B.map(e=>`
                <div class="staff-card">
                    <div class="staff-info">
                        <h4>${e.username}</h4>
                        <p>Role: ${e.role} | Created: ${V(e.created_at)}</p>
                    </div>
                </div>
            `).join("")}
            ${B.length===0?'<div class="loading">No staff accounts</div>':""}
        </div>
    `}function Pe(){return`
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
    `}function ee(){var e,t,n,r,a,s,f,E,P,M,F,x,T,q,D,N,j,R,_,J,X,U,z,H,Y;(e=document.getElementById("home-link"))==null||e.addEventListener("click",d=>{d.preventDefault(),i="home",o()}),(t=document.getElementById("menu-link"))==null||t.addEventListener("click",d=>{d.preventDefault(),i="menu",o(),v()}),(n=document.getElementById("cart-link"))==null||n.addEventListener("click",d=>{d.preventDefault(),u?(i="cart",o()):re("access your cart")}),(r=document.getElementById("login-link"))==null||r.addEventListener("click",d=>{d.preventDefault(),i="login",o()}),(a=document.getElementById("order-tracking-link"))==null||a.addEventListener("click",d=>{d.preventDefault(),i="order-tracking",o(),te()}),(s=document.getElementById("logout-link"))==null||s.addEventListener("click",d=>{d.preventDefault(),I()}),(f=document.getElementById("order-now-btn"))==null||f.addEventListener("click",()=>{i="menu",o(),v()}),(E=document.getElementById("go-to-login"))==null||E.addEventListener("click",()=>{i="login",o()}),(P=document.getElementById("browse-menu-btn"))==null||P.addEventListener("click",()=>{i="menu",o(),v()}),(M=document.getElementById("browse-menu-from-orders"))==null||M.addEventListener("click",()=>{i="menu",o(),v()}),(F=document.getElementById("customer-login-btn"))==null||F.addEventListener("click",Fe),(x=document.getElementById("customer-register-btn"))==null||x.addEventListener("click",xe),(T=document.getElementById("checkout-btn"))==null||T.addEventListener("click",()=>{i="checkout",o()}),(q=document.getElementById("back-to-cart"))==null||q.addEventListener("click",()=>{i="cart",o()}),(D=document.getElementById("place-order-btn"))==null||D.addEventListener("click",Re),(N=document.getElementById("staff-login-btn"))==null||N.addEventListener("click",Te),(j=document.getElementById("staff-logout-link"))==null||j.addEventListener("click",I),(R=document.getElementById("admin-login-btn"))==null||R.addEventListener("click",qe),(_=document.getElementById("admin-logout-link"))==null||_.addEventListener("click",I),(J=document.getElementById("admin-overview-link"))==null||J.addEventListener("click",d=>{d.preventDefault(),i="admin-overview",o(),ne()}),(X=document.getElementById("admin-menu-link"))==null||X.addEventListener("click",d=>{d.preventDefault(),i="admin-menu",o(),v()}),(U=document.getElementById("admin-sales-link"))==null||U.addEventListener("click",d=>{d.preventDefault(),i="admin-sales",o()}),(z=document.getElementById("admin-staff-link"))==null||z.addEventListener("click",d=>{d.preventDefault(),i="admin-staff",o(),ae()}),(H=document.getElementById("generate-report-btn"))==null||H.addEventListener("click",Je),(Y=document.getElementById("create-staff-btn"))==null||Y.addEventListener("click",Xe),setTimeout(()=>{document.querySelectorAll(".add-to-cart").forEach(d=>{d.addEventListener("click",p=>{const g=parseInt(p.target.dataset.id);De(g)})}),document.querySelectorAll(".quantity-btn").forEach(d=>{d.addEventListener("click",p=>{const g=parseInt(p.target.dataset.id),S=p.target.dataset.action;Ne(g,S)})}),document.querySelectorAll(".remove-item").forEach(d=>{d.addEventListener("click",p=>{const g=parseInt(p.target.dataset.id);je(g)})}),document.querySelectorAll(".update-status-btn").forEach(d=>{d.addEventListener("click",p=>{const g=parseInt(p.target.dataset.orderId),S=p.target.dataset.newStatus;_e(g,S)})})},100)}async function v(){try{w=await ie(),o()}catch(e){k(e)}}async function te(){if(u)try{O=await Q(),o()}catch(e){k(e)}}async function L(){try{h=await Q(),o()}catch(e){k(e)}}async function ne(){await Promise.all([L(),Me()])}async function Me(){try{const e=new Date().toISOString().split("T")[0],t=new Date(Date.now()-7*24*60*60*1e3).toISOString().split("T")[0];m=await G(t,e),o()}catch(e){k(e)}}async function ae(){try{B=await ce(),o()}catch(e){k(e)}}async function Fe(){var n,r;const e=(n=document.getElementById("username"))==null?void 0:n.value,t=(r=document.getElementById("password"))==null?void 0:r.value;if(!e||!t){c("Please enter both username and password","error");return}try{const a=await fetch("/.netlify/functions/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"login",username:e,password:t})}),s=await a.json();if(!a.ok)throw new Error(s.error);localStorage.setItem("token",s.token),localStorage.setItem("user",JSON.stringify(s.user)),u=s.user,c("Login successful!"),i="menu",o(),v()}catch(a){c(a.message,"error")}}async function xe(){var n,r;const e=(n=document.getElementById("username"))==null?void 0:n.value,t=(r=document.getElementById("password"))==null?void 0:r.value;if(!e||!t){c("Please enter both username and password","error");return}if(t.length<6){c("Password must be at least 6 characters long","error");return}try{const a=await fetch("/.netlify/functions/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"register",username:e,password:t})}),s=await a.json();if(!a.ok)throw new Error(s.error);localStorage.setItem("token",s.token),localStorage.setItem("user",JSON.stringify(s.user)),u=s.user,c("Registration successful! Welcome!"),i="menu",o(),v()}catch(a){c(a.message,"error")}}async function Te(){var n,r;const e=(n=document.getElementById("staff-username"))==null?void 0:n.value,t=(r=document.getElementById("staff-password"))==null?void 0:r.value;if(!e||!t){c("Please enter both username and password","error");return}try{const a=await fetch("/.netlify/functions/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"login",username:e,password:t})}),s=await a.json();if(!a.ok)throw new Error(s.error);if(s.user.role!=="staff"&&s.user.role!=="admin")throw new Error("Staff access required");localStorage.setItem("token",s.token),localStorage.setItem("user",JSON.stringify(s.user)),u=s.user,i="staff-dashboard",o(),L()}catch(a){c(a.message,"error")}}async function qe(){var n,r;const e=(n=document.getElementById("admin-username"))==null?void 0:n.value,t=(r=document.getElementById("admin-password"))==null?void 0:r.value;if(!e||!t){c("Please enter both username and password","error");return}try{const a=await fetch("/.netlify/functions/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"login",username:e,password:t})}),s=await a.json();if(!a.ok)throw new Error(s.error);if(s.user.role!=="admin")throw new Error("Admin access required");localStorage.setItem("token",s.token),localStorage.setItem("user",JSON.stringify(s.user)),u=s.user,i="admin-dashboard",o(),ne()}catch(a){c(a.message,"error")}}function I(){localStorage.removeItem("token"),localStorage.removeItem("user"),localStorage.removeItem("breakfast-cart"),u=null,l=[],i="home",b="customer",window.location.href="/"}function De(e){if(!u){re("add items to cart");return}const t=w.find(r=>r.id===e);if(!t)return;const n=l.find(r=>r.id===e);n?n.quantity+=1:l.push({id:t.id,name:t.name,price:parseFloat(t.price),quantity:1}),$(),c(`${t.name} added to cart!`),o()}function Ne(e,t){const n=l.findIndex(r=>r.id===e);n!==-1&&(t==="increase"?l[n].quantity+=1:t==="decrease"&&(l[n].quantity-=1,l[n].quantity<=0&&l.splice(n,1)),$(),o())}function je(e){l=l.filter(t=>t.id!==e),$(),o()}async function Re(){var r,a,s;const e=(r=document.getElementById("customer-name"))==null?void 0:r.value,t=(a=document.getElementById("customer-address"))==null?void 0:a.value,n=(s=document.getElementById("customer-phone"))==null?void 0:s.value;if(!e||!t||!n){c("Please fill in all customer information","error");return}if(l.length===0){c("Your cart is empty!","error");return}try{const f=C(l);await oe({items:l,totalAmount:f,customerInfo:{name:e,address:t,phone:n}}),c("Order placed successfully!"),l=[],$(),i="order-tracking",o(),te()}catch{c("Error placing order. Please try again.","error")}}async function _e(e,t){try{await de(e,t),c(`Order status updated to ${t}`),await L()}catch{c("Error updating order status","error")}}async function Je(){var n,r;const e=(n=document.getElementById("start-date"))==null?void 0:n.value,t=(r=document.getElementById("end-date"))==null?void 0:r.value;try{m=await G(e,t),o(),c("Sales report generated")}catch{c("Error generating sales report","error")}}async function Xe(){var n,r;const e=(n=document.getElementById("new-staff-username"))==null?void 0:n.value,t=(r=document.getElementById("new-staff-password"))==null?void 0:r.value;if(!e||!t){c("Please enter both username and password","error");return}if(t.length<6){c("Password must be at least 6 characters long","error");return}try{await le(e,t),c("Staff account created successfully"),document.getElementById("new-staff-username").value="",document.getElementById("new-staff-password").value="",await ae()}catch{c("Error creating staff account","error")}}function $(){localStorage.setItem("breakfast-cart",JSON.stringify(l))}function re(e){const t=document.createElement("div");t.className="modal-overlay",t.innerHTML=`
        <div class="modal">
            <h3>Sign In Required</h3>
            <p>You need to sign in to ${e}.</p>
            <div class="modal-buttons">
                <button class="btn btn-secondary" id="cancel-action">Maybe Later</button>
                <button class="btn btn-primary" id="auth-and-continue">Sign In & Continue</button>
            </div>
        </div>
    `,document.body.appendChild(t),document.getElementById("cancel-action").addEventListener("click",()=>{document.body.removeChild(t)}),document.getElementById("auth-and-continue").addEventListener("click",()=>{document.body.removeChild(t),i="login",o()})}function Ue(e){return{pending:"confirmed",confirmed:"preparing",preparing:"ready",ready:"delivered"}[e]}document.addEventListener("DOMContentLoaded",Z);document.addEventListener("DOMContentLoaded",Z);
