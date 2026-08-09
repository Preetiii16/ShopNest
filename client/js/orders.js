// Customer Order History Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  loadCustomerOrders();
});

async function loadCustomerOrders() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiFetch('/orders');
    if (data.success && data.orders.length > 0) {
      renderOrdersList(data.orders);
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet. Check out our latest collection!</p>
          <a href="/shop.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

function renderOrdersList(orders) {
  const container = document.getElementById('orders-list-container');
  container.innerHTML = `
    <div class="table-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td style="font-weight: 700; color: var(--primary-600);">#ORD-${order.id}</td>
                <td>${new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>${order.item_count} items</td>
                <td style="font-weight: 700;">$${parseFloat(order.total_amount).toFixed(2)}</td>
                <td><span class="badge badge-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>
                  <a href="/order-detail.html?id=${order.id}" class="btn btn-outline btn-sm">View Details &rarr;</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
