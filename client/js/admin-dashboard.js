// Admin Dashboard Analytics Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAdmin()) return;
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const data = await apiFetch('/admin/dashboard');
    if (data.success) {
      renderStats(data.stats);
      renderLowStockTable(data.lowStockProducts);
      renderRecentOrdersTable(data.recentOrders);
    }
  } catch (error) {
    showToast('Failed to load dashboard data.', 'error');
  }
}

function renderStats(stats) {
  document.getElementById('stat-users').textContent = stats.totalUsers || 0;
  document.getElementById('stat-products').textContent = stats.totalProducts || 0;
  document.getElementById('stat-orders').textContent = stats.totalOrders || 0;
  document.getElementById('stat-sales').textContent = `$${(stats.totalSales || 0).toFixed(2)}`;
}

function renderLowStockTable(products) {
  const container = document.getElementById('low-stock-container');
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = '<p class="text-muted text-center" style="padding: 1.5rem;">✔ No low stock alerts! All products are sufficiently stocked.</p>';
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Product Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>#${p.id}</td>
            <td style="font-weight: 700;">${p.product_name}</td>
            <td>${p.category_name}</td>
            <td>$${parseFloat(p.price).toFixed(2)}</td>
            <td><span class="badge badge-cancelled">${p.stock} units left</span></td>
            <td><a href="/admin-product-form.html?id=${p.id}" class="btn btn-primary btn-sm">Edit Stock</a></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderRecentOrdersTable(orders) {
  const container = document.getElementById('recent-orders-container');
  if (!container) return;

  if (!orders || orders.length === 0) {
    container.innerHTML = '<p class="text-muted text-center" style="padding: 1.5rem;">No recent orders placed yet.</p>';
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td style="font-weight: 700; color: var(--primary-600);">#ORD-${o.id}</td>
            <td>${o.customer_name}</td>
            <td style="font-weight: 700;">$${parseFloat(o.total_amount).toFixed(2)}</td>
            <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td><a href="/admin-order-detail.html?id=${o.id}" class="btn btn-outline btn-sm">View</a></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
