// Checkout Page Logic
document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;

  prefillCustomerDetails();
  await loadCheckoutSummary();
  setupOrderSubmission();
});

function prefillCustomerDetails() {
  const user = Auth.getUser();
  if (user) {
    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    const phoneInput = document.getElementById('checkout-phone');
    const addressInput = document.getElementById('checkout-address');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (addressInput) addressInput.value = user.address || '';
  }
}

async function loadCheckoutSummary() {
  const container = document.getElementById('checkout-items-summary');
  const totalEl = document.getElementById('checkout-total-amount');

  if (!container) return;

  try {
    const data = await apiFetch('/cart');
    if (data.success && data.items.length > 0) {
      container.innerHTML = data.items.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--gray-200);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${getImageUrl(item.image)}" alt="${item.product_name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-sm);" onerror="this.src='/uploads/products/default-product.jpg'">
            <div>
              <div style="font-weight: 600; font-size: 0.9rem;">${item.product_name}</div>
              <div style="font-size: 0.8rem; color: var(--gray-500);">Qty: ${item.quantity} &times; $${parseFloat(item.price).toFixed(2)}</div>
            </div>
          </div>
          <span style="font-weight: 700; color: var(--dark-900);">$${parseFloat(item.subtotal).toFixed(2)}</span>
        </div>
      `).join('');

      if (totalEl) totalEl.textContent = `$${data.totalAmount.toFixed(2)}`;
    } else {
      showToast('Your cart is empty. Redirecting to shop...', 'warning');
      setTimeout(() => {
        window.location.href = '/shop.html';
      }, 1200);
    }
  } catch (error) {
    showToast('Failed to load order summary.', 'error');
  }
}

function setupOrderSubmission() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const address = document.getElementById('checkout-address').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();

    if (!address) {
      showToast('Please enter a delivery address.', 'error');
      return;
    }

    if (!phone) {
      showToast('Please enter a contact phone number.', 'error');
      return;
    }

    const placeBtn = document.getElementById('place-order-btn');
    if (placeBtn) {
      placeBtn.disabled = true;
      placeBtn.textContent = 'Processing Order...';
    }

    try {
      const data = await apiFetch('/orders', {
        method: 'POST',
        body: { address, phone }
      });

      if (data.success) {
        showToast('🎉 Order placed successfully!', 'success');
        updateCartBadge();
        setTimeout(() => {
          window.location.href = `/order-detail.html?id=${data.orderId}`;
        }, 1200);
      }
    } catch (error) {
      showToast(error.message, 'error');
      if (placeBtn) {
        placeBtn.disabled = false;
        placeBtn.textContent = 'Place Order (Cash on Delivery)';
      }
    }
  });
}
