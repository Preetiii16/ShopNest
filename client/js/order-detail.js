// Order Receipt Detail View Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  if (!orderId) {
    window.location.href = '/orders.html';
    return;
  }

  loadOrderDetail(orderId);
});

async function loadOrderDetail(id) {
  const container = document.getElementById('order-detail-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiFetch(`/orders/${id}`);
    if (data.success && data.order) {
      renderOrderDetail(data.order);
    } else {
      container.innerHTML = '<div class="empty-state"><h3>Order Not Found</h3></div>';
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

function renderOrderDetail(order) {
  const container = document.getElementById('order-detail-container');
  const formattedDate = new Date(order.created_at).toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  container.innerHTML = `
    <div style="background-color: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); padding: 2rem; margin-bottom: 2rem;">
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--gray-200); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.6rem; color: var(--dark-900);">Order #ORD-${order.id}</h2>
          <div style="font-size: 0.875rem; color: var(--gray-500); margin-top: 0.25rem;">Placed on ${formattedDate}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-weight: 600; font-size: 0.9rem;">Status:</span>
          <span class="badge badge-${order.status.toLowerCase()}" style="font-size: 0.9rem; padding: 0.35rem 0.85rem;">${order.status}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
        <div style="background-color: var(--gray-50); padding: 1.25rem; border-radius: var(--radius-md);">
          <h4 style="margin-bottom: 0.5rem; color: var(--dark-800);">Delivery Information</h4>
          <p style="font-weight: 600; margin-bottom: 0.25rem;">${order.customer_name}</p>
          <p style="color: var(--gray-600); font-size: 0.9rem; margin-bottom: 0.25rem;">📍 ${order.address}</p>
          <p style="color: var(--gray-600); font-size: 0.9rem;">📞 ${order.phone}</p>
        </div>

        <div style="background-color: var(--gray-50); padding: 1.25rem; border-radius: var(--radius-md);">
          <h4 style="margin-bottom: 0.5rem; color: var(--dark-800);">Payment Details</h4>
          <p style="color: var(--gray-600); font-size: 0.9rem; margin-bottom: 0.25rem;">Method: <strong>Cash on Delivery</strong></p>
          <p style="color: var(--gray-600); font-size: 0.9rem;">Email: <strong>${order.customer_email}</strong></p>
        </div>
      </div>

      <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">Ordered Items</h3>
      <div class="table-responsive" style="margin-bottom: 1.5rem;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${getImageUrl(item.image)}" alt="${item.product_name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-sm);" onerror="this.src='/uploads/products/default-product.jpg'">
                    <div>
                      <a href="/product-detail.html?id=${item.product_id}" style="font-weight: 700;">${item.product_name}</a>
                      <div style="font-size: 0.8rem; color: var(--gray-500);">${item.category_name}</div>
                    </div>
                  </div>
                </td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td style="font-weight: 700;">${item.quantity}</td>
                <td style="font-weight: 700; color: var(--primary-600);">$${parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 100%; max-width: 320px; background-color: var(--gray-50); padding: 1.25rem; border-radius: var(--radius-md);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-weight: 600;">
            <span>Total Amount Paid:</span>
            <span style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--primary-600);">$${parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 2rem; border-top: 1px solid var(--gray-200); padding-top: 1.25rem; display: flex; gap: 1rem;">
        <a href="/orders.html" class="btn btn-secondary">&larr; Back to Orders</a>
        <button class="btn btn-outline" onclick="window.print()">🖨️ Print Receipt</button>
      </div>
    </div>
  `;
}
