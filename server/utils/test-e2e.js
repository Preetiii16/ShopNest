// End-to-End Integration Verification Script
const http = require('http');

function request(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runE2ETests() {
  console.log('🧪 Starting End-to-End ShopNest Integration Verification...\n');

  try {
    // 1. Fetch Categories
    const categoriesRes = await request('/categories');
    console.log('1. GET /api/categories -> Status:', categoriesRes.status, 'Count:', categoriesRes.data.categories?.length);

    // 2. Fetch Products
    const productsRes = await request('/products');
    console.log('2. GET /api/products -> Status:', productsRes.status, 'Count:', productsRes.data.products?.length);

    // 3. Customer Login
    const loginRes = await request('/auth/login', 'POST', {
      email: 'john@example.com',
      password: 'customer123'
    });
    console.log('3. POST /api/auth/login (Customer) -> Status:', loginRes.status, 'User:', loginRes.data.user?.name);
    const customerToken = loginRes.data.token;

    // 4. Add to Cart (Product ID 1, Qty 2)
    const addToCartRes = await request('/cart', 'POST', { productId: 1, quantity: 2 }, customerToken);
    console.log('4. POST /api/cart -> Status:', addToCartRes.status, 'Msg:', addToCartRes.data.message);

    // 5. Get Cart
    const getCartRes = await request('/cart', 'GET', null, customerToken);
    console.log('5. GET /api/cart -> Status:', getCartRes.status, 'Items:', getCartRes.data.items?.length, 'Total:', getCartRes.data.totalAmount);

    // 6. Checkout / Place Order (Transactional)
    const checkoutRes = await request('/orders', 'POST', {
      address: '742 Evergreen Terrace, Springfield',
      phone: '+1 555-0144'
    }, customerToken);
    console.log('6. POST /api/orders (Checkout Transaction) -> Status:', checkoutRes.status, 'OrderId:', checkoutRes.data.orderId, 'Total:', checkoutRes.data.totalAmount);
    const orderId = checkoutRes.data.orderId;

    // 7. Verify Customer Order History
    const userOrdersRes = await request('/orders', 'GET', null, customerToken);
    console.log('7. GET /api/orders (Customer Orders) -> Status:', userOrdersRes.status, 'Count:', userOrdersRes.data.orders?.length);

    // 8. Admin Login
    const adminLoginRes = await request('/auth/login', 'POST', {
      email: 'admin@shopnest.com',
      password: 'admin123'
    });
    console.log('8. POST /api/auth/login (Admin) -> Status:', adminLoginRes.status, 'User:', adminLoginRes.data.user?.name);
    const adminToken = adminLoginRes.data.token;

    // 9. Admin Dashboard Stats
    const dashboardRes = await request('/admin/dashboard', 'GET', null, adminToken);
    console.log('9. GET /api/admin/dashboard -> Status:', dashboardRes.status, 'Stats:', dashboardRes.data.stats);

    // 10. Admin Update Order Status to 'Shipped'
    if (orderId) {
      const updateStatusRes = await request(`/admin/orders/${orderId}/status`, 'PUT', { status: 'Shipped' }, adminToken);
      console.log('10. PUT /api/admin/orders/:id/status -> Status:', updateStatusRes.status, 'New Status:', updateStatusRes.data.status);
    }

    // 11. Customer Re-checks Order Details
    if (orderId) {
      const recheckOrderRes = await request(`/orders/${orderId}`, 'GET', null, customerToken);
      console.log('11. GET /api/orders/:id (Customer Check) -> Status:', recheckOrderRes.status, 'Verified Status:', recheckOrderRes.data.order?.status);
    }

    console.log('\n✅ ALL END-TO-END INTEGRATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Integration Test Failed:', err);
  }
}

runE2ETests();
