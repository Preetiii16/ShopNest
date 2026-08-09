# ShopNest — Online Shopping & Order Management System

**ShopNest** is a complete, production-grade, full-stack e-commerce web application designed to manage products, categories, database-backed shopping carts, customer orders, inventory stock, and user accounts.

Built with **HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, REST APIs, and MySQL**.

---

## 🌟 Key Features

### 👤 Customer Capabilities
* **User Authentication**: Secure registration and login with bcrypt password hashing and JWT authorization.
* **Product Discovery**: Browse products with live text search, category filters, price range sliders, and multi-option sorting (Newest, Price Low-High, Price High-Low).
* **Product Details**: Detailed view with category badges, stock availability status, quantity counters (+/-), and out-of-stock guards.
* **Database-Backed Shopping Cart**: Add products, adjust quantities, remove items, and calculate subtotals stored directly in MySQL associated with user ID.
* **Cash on Delivery Checkout**: Seamless order placement with server-side price recalculation and transactional inventory updates.
* **Order History & Receipt Tracking**: View list of placed orders, current order status (Pending, Confirmed, Shipped, Delivered, Cancelled), and printable itemized receipts.
* **Profile Management**: Update full name, contact phone, delivery address, and change security password.

### 🛡️ Administrator Capabilities
* **Real-time Analytics Dashboard**: View total revenue, active users, total products, order count, recent order activity, and low-stock inventory alerts.
* **Product Inventory Management**: Full CRUD operations for products including file image uploads using `multer`.
* **Category Management**: Create, rename, and manage categories with relationship protection.
* **Customer User Management**: View registered users directory and toggle active/inactive access status (safeguarding admin access).
* **Order Fulfillment Control**: Filter orders by status or search keyword, and update order statuses (Pending &rarr; Confirmed &rarr; Shipped &rarr; Delivered / Cancelled) with instant customer visibility.

---

## 🛠️ Technology Stack

| Component | Technology Used |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Custom Glassmorphic Design System), Vanilla JavaScript (ES6+ Fetch API) |
| **Backend** | Node.js, Express.js REST APIs |
| **Database** | MySQL (`shopnest_db`) using `mysql2/promise` connection pool |
| **Authentication** | JSON Web Tokens (JWT) & `bcryptjs` password hashing |
| **File Uploads** | `multer` for secure image uploads in `server/uploads/products/` |

---

## 📂 Project Structure

```
ShopNest/
├── client/                     # Frontend Vanilla Web Application
│   ├── index.html              # Homepage (Hero, Featured Products, Categories)
│   ├── shop.html               # Product Catalog (Search, Filter, Sort)
│   ├── product-detail.html     # Product Detail View
│   ├── login.html              # Customer Login
│   ├── register.html           # Customer Registration
│   ├── cart.html               # Database Shopping Cart Page
│   ├── checkout.html           # Cash on Delivery Checkout
│   ├── orders.html             # Customer Order History
│   ├── order-detail.html       # Customer Order Receipt
│   ├── profile.html            # Customer Account Profile
│   ├── admin-login.html        # Admin Portal Login
│   ├── admin-dashboard.html    # Admin Analytics Dashboard
│   ├── admin-products.html     # Admin Product Inventory
│   ├── admin-product-form.html # Admin Add / Edit Product
│   ├── admin-categories.html   # Admin Category CRUD
│   ├── admin-users.html        # Admin User Directory & Status
│   ├── admin-orders.html       # Admin Order Processing & Status Update
│   ├── admin-order-detail.html # Admin Detailed Receipt View
│   ├── css/                    # Modular Stylesheets
│   │   ├── main.css            # Master Design Tokens & Core Layout
│   │   ├── navbar.css          # Header Navigation & Mobile Drawer
│   │   ├── cards.css           # Product & Category Cards
│   │   ├── admin.css           # Admin Layout, KPI Cards & Tables
│   │   └── toast.css           # Notification Toasts & Spinners
│   └── js/                     # Modular JavaScript
│       ├── config.js           # API Base URL Config
│       ├── toast.js            # Toast Notifications
│       ├── auth.js             # Session & Role Helper
│       ├── api.js              # Centralized Fetch API Wrapper
│       ├── main.js             # Navigation Header State
│       └── [page].js           # Dedicated Page Scripts
│
├── server/                     # Express REST API Server
│   ├── config/
│   │   ├── db.js               # MySQL Connection Pool
│   │   └── init-db.js          # Auto Database Table Seeder
│   ├── controllers/            # Controller Business Logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── orderController.js (MySQL Transactions)
│   │   └── adminController.js
│   ├── middleware/             # Express Middleware
│   │   ├── authMiddleware.js   # JWT Verification
│   │   ├── adminMiddleware.js  # Role Verification
│   │   └── uploadMiddleware.js # Multer Image Validation
│   ├── routes/                 # Express API Routes
│   ├── utils/                  # Seed Utilities
│   ├── uploads/products/       # Product Image Uploads
│   ├── app.js                  # Express Application Pipeline
│   └── server.js               # Server Entrypoint
│
├── database/
│   └── shopnest_db.sql         # SQL Schema & Initial Seed Script
│
├── .env.example                # Environment Template
├── package.json
└── README.md
```

---

## 🔑 Default Credentials

### 👑 Administrator Account
- **Email**: `admin@shopnest.com`
- **Password**: `admin123`

### 👤 Sample Customer Account
- **Email**: `john@example.com`
- **Password**: `customer123`

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- Node.js (v16.0 or higher) installed
- MySQL Server (or XAMPP / MariaDB) running on `localhost:3306`

### 2. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=shopnest_db
DB_PORT=3306
JWT_SECRET=shopnest_jwt_super_secret_key_2026_safe_hash
```

### 3. Installation & Server Start
Run the following commands in terminal:

```bash
# Install dependencies
npm install

# Start the server (Auto-initializes database & seeds initial data)
npm start
```

### 4. Accessing the Application
Open your browser and navigate to:
- **Storefront**: [http://localhost:5000](http://localhost:5000)
- **Admin Portal**: [http://localhost:5000/admin-login.html](http://localhost:5000/admin-login.html)

---

## 📡 REST API Summary

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` — Register a customer account
- `POST /api/auth/login` — Authenticate customer or admin
- `GET /api/auth/profile` — Fetch logged-in user profile
- `PUT /api/auth/profile` — Update user details / password

### Products Routes (`/api/products`)
- `GET /api/products` — Search, filter by category/price, and sort products
- `GET /api/products/:id` — Get single product details
- `POST /api/products` — (Admin) Create product with image upload
- `PUT /api/products/:id` — (Admin) Update product details/image
- `DELETE /api/products/:id` — (Admin) Delete product

### Categories Routes (`/api/categories`)
- `GET /api/categories` — Get all categories
- `POST /api/categories` — (Admin) Create category
- `PUT /api/categories/:id` — (Admin) Rename category
- `DELETE /api/categories/:id` — (Admin) Delete category

### Cart Routes (`/api/cart`)
- `GET /api/cart` — Get user shopping cart items
- `POST /api/cart` — Add product to cart with stock check
- `PUT /api/cart/:productId` — Update item quantity
- `DELETE /api/cart/:productId` — Remove item from cart

### Orders Routes (`/api/orders`)
- `POST /api/orders` — Checkout & place order (MySQL Transaction)
- `GET /api/orders` — Get user order history
- `GET /api/orders/:id` — Get order receipt details

### Admin Management Routes (`/api/admin`)
- `GET /api/admin/dashboard` — Overview KPI metrics & alerts
- `GET /api/admin/users` — Directory of registered users
- `PUT /api/admin/users/:id/toggle-status` — Toggle customer active status
- `GET /api/admin/orders` — List & search all orders
- `PUT /api/admin/orders/:id/status` — Update order status

---

## 🛢️ Database Schema (`shopnest_db`)

The database consists of 7 relational tables:
1. `users` (id, name, email, phone, password, address, role, status, created_at)
2. `categories` (id, category_name, created_at)
3. `products` (id, category_id, product_name, description, price, stock, image, created_at, updated_at)
4. `carts` (id, user_id, created_at, updated_at)
5. `cart_items` (id, cart_id, product_id, quantity)
6. `orders` (id, user_id, total_amount, address, phone, status, created_at)
7. `order_items` (id, order_id, product_id, quantity, price)

---

## 📜 License
This project is open-source and intended for academic, college, and portfolio demonstration purposes.
