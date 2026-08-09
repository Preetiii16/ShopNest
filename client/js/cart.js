// Database-Backed Shopping Cart Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  loadCartItems();
});

async function loadCartItems() {
  const container = document.getElementById('cart-items-container');
  const summaryContainer = document.getElementById('cart-summary-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiFetch('/cart');
    if (data.success && data.items.length > 0) {
      renderCartTable(data.items);
      renderCartSummary(data.totalAmount, data.items.length);
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛒</div>
          <h3>Your shopping cart is empty</h3>
          <p>Explore our catalog and find amazing items to add to your cart!</p>
          <a href="/shop.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      if (summaryContainer) summaryContainer.style.display = 'none';
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Failed to load cart</h3><p>${error.message}</p></div>`;
  }
}

function renderCartTable(items) {
  const container = document.getElementById('cart-items-container');
  container.innerHTML = `
    <div class="table-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${getImageUrl(item.image)}" alt="${item.product_name}" style="width: 56px; height: 56px; object-fit: cover; border-radius: var(--radius-sm);" onerror="this.src='/uploads/products/default-product.jpg'">
                    <div>
                      <a href="/product-detail.html?id=${item.product_id}" style="font-weight: 700; color: var(--dark-900);">${item.product_name}</a>
                      <div style="font-size: 0.8rem; color: var(--gray-500);">${item.category_name}</div>
                    </div>
                  </div>
                </td>
                <td style="font-weight: 600;">$${parseFloat(item.price).toFixed(2)}</td>
                <td>
                  <div style="display: flex; align-items: center; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); width: fit-content; overflow: hidden;">
                    <button class="btn btn-secondary btn-sm" onclick="updateItemQty(${item.product_id}, ${item.quantity - 1})" style="border-radius: 0; padding: 0.25rem 0.6rem;">-</button>
                    <span style="padding: 0 0.6rem; font-weight: 700; font-size: 0.9rem;">${item.quantity}</span>
                    <button class="btn btn-secondary btn-sm" onclick="updateItemQty(${item.product_id}, ${item.quantity + 1})" style="border-radius: 0; padding: 0.25rem 0.6rem;">+</button>
                  </div>
                </td>
                <td style="font-weight: 700; color: var(--primary-600);">$${parseFloat(item.subtotal).toFixed(2)}</td>
                <td>
                  <button class="btn btn-danger btn-sm" onclick="removeCartItem(${item.product_id})">🗑️ Remove</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCartSummary(totalAmount, itemCount) {
  const summaryContainer = document.getElementById('cart-summary-container');
  if (!summaryContainer) return;

  summaryContainer.style.display = 'block';
  summaryContainer.innerHTML = `
    <div style="background-color: var(--white); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm);">
      <h3 style="margin-bottom: 1.25rem; font-size: 1.25rem;">Order Summary</h3>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: var(--gray-600);">
        <span>Subtotal (${itemCount} items)</span>
        <span style="font-weight: 600; color: var(--dark-900);">$${totalAmount.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: var(--gray-600);">
        <span>Shipping Fee</span>
        <span style="font-weight: 600; color: var(--success);">FREE</span>
      </div>
      
      <div style="border-top: 1px dashed var(--gray-300); margin: 1rem 0; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; font-size: 1.1rem;">Total Amount</span>
        <span style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; color: var(--primary-600);">$${totalAmount.toFixed(2)}</span>
      </div>

      <a href="/checkout.html" class="btn btn-primary btn-lg btn-block" style="margin-top: 1rem;">
        Proceed to Checkout &rarr;
      </a>
    </div>
  `;
}

async function updateItemQty(productId, newQty) {
  try {
    const data = await apiFetch(`/cart/${productId}`, {
      method: 'PUT',
      body: { quantity: newQty }
    });

    if (data.success) {
      showToast(data.message, 'success');
      loadCartItems();
      updateCartBadge();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function removeCartItem(productId) {
  try {
    const data = await apiFetch(`/cart/${productId}`, {
      method: 'DELETE'
    });

    if (data.success) {
      showToast('Item removed from cart.', 'info');
      loadCartItems();
      updateCartBadge();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}
