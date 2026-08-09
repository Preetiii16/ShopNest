// Admin Orders Management Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAdmin()) return;
  loadAdminOrders();

  document.getElementById('status-filter')?.addEventListener('change', loadAdminOrders);
  
  let debounceTimer;
  document.getElementById('order-search-input')?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadAdminOrders, 300);
  });
});

async function loadAdminOrders() {
  const container = document.getElementById('orders-table-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  const statusVal = document.getElementById('status-filter')?.value || 'all';
  const searchVal = document.getElementById('order-search-input')?.value || '';

  let query = `?status=${statusVal}`;
  if (searchVal.trim()) query += `&q=${encodeURIComponent(searchVal.trim())}`;

  try {
    const data = await apiFetch(`/admin/orders${query}`);
    if (data.success && data.orders.length > 0) {
      renderAdminOrdersTable(data.orders);
    } else {
      container.innerHTML = '<div class="empty-state"><h3>No orders found matching criteria.</h3></div>';
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

function renderAdminOrdersTable(orders) {
  const container = document.getElementById('orders-table-container');
  const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Items</th>
          <th>Total</th>
          <th>Date</th>
          <th>Update Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td style="font-weight: 700; color: var(--primary-600);">#ORD-${o.id}</td>
            <td>
              <div style="font-weight: 600;">${o.customer_name}</div>
              <div style="font-size: 0.8rem; color: var(--gray-500);">${o.customer_email}</div>
            </td>
            <td>${o.item_count} items</td>
            <td style="font-weight: 700;">$${parseFloat(o.total_amount).toFixed(2)}</td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td>
              <select class="form-select" style="padding: 0.35rem 0.6rem; font-size: 0.85rem; width: 140px;" onchange="updateOrderStatus(${o.id}, this.value)">
                ${statuses.map(st => `
                  <option value="${st}" ${o.status === st ? 'selected' : ''}>${st}</option>
                `).join('')}
              </select>
            </td>
            <td>
              <a href="/admin-order-detail.html?id=${o.id}" class="btn btn-outline btn-sm">View Details &rarr;</a>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function updateOrderStatus(id, newStatus) {
  try {
    const data = await apiFetch(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: { status: newStatus }
    });

    if (data.success) {
      showToast(data.message, 'success');
    }
  } catch (error) {
    showToast(error.message, 'error');
    loadAdminOrders(); // Reload to reset select value
  }
}
