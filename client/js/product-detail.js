// Product Detail Page Logic
let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = '/shop.html';
    return;
  }

  loadProductDetail(productId);
});

async function loadProductDetail(id) {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  try {
    const data = await apiFetch(`/products/${id}`);
    if (data.success && data.product) {
      currentProduct = data.product;
      renderProductDetail(data.product);
    } else {
      container.innerHTML = '<div class="empty-state"><h3>Product Not Found</h3></div>';
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

function renderProductDetail(product) {
  const container = document.getElementById('product-detail-container');
  const isOutOfStock = product.stock <= 0;

  const stockBadge = isOutOfStock
    ? '<span class="badge badge-cancelled" style="font-size: 0.9rem;">Out of Stock</span>'
    : product.stock <= 5
    ? `<span class="badge badge-pending" style="font-size: 0.9rem;">Only ${product.stock} left in stock</span>`
    : `<span class="badge badge-delivered" style="font-size: 0.9rem;">In Stock (${product.stock} available)</span>`;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 3rem; align-items: start;">
      <!-- Image Gallery -->
      <div style="background-color: var(--white); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm);">
        <img src="${getImageUrl(product.image)}" alt="${product.product_name}" style="width: 100%; border-radius: var(--radius-md); max-height: 450px; object-fit: contain;" onerror="this.src='/uploads/products/default-product.jpg'">
      </div>

      <!-- Details & Actions -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <span class="badge badge-shipped" style="margin-bottom: 0.75rem;">${product.category_name}</span>
          <h1 style="font-size: 2rem; margin-bottom: 0.75rem;">${product.product_name}</h1>
          <div style="margin-bottom: 1rem;">${stockBadge}</div>
          <div style="font-family: var(--font-display); font-size: 2.25rem; font-weight: 800; color: var(--primary-600);">
            $${parseFloat(product.price).toFixed(2)}
          </div>
        </div>

        <div style="border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200); padding: 1.25rem 0;">
          <h4 style="margin-bottom: 0.5rem; color: var(--dark-700);">Description</h4>
          <p style="color: var(--gray-600); line-height: 1.7;">${product.description || 'No description provided.'}</p>
        </div>

        ${!isOutOfStock ? `
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <label class="form-label" style="margin-bottom: 0;">Quantity:</label>
              <div style="display: flex; align-items: center; border: 1px solid var(--gray-300); border-radius: var(--radius-md); overflow: hidden;">
                <button class="btn btn-secondary btn-sm" onclick="changeQty(-1)" style="border-radius: 0; padding: 0.6rem 1rem;">-</button>
                <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" style="width: 60px; text-align: center; border: none; font-weight: 700;" readonly>
                <button class="btn btn-secondary btn-sm" onclick="changeQty(1)" style="border-radius: 0; padding: 0.6rem 1rem;">+</button>
              </div>
            </div>

            <button class="btn btn-primary btn-lg" onclick="addToCartFromDetail()" style="max-width: 300px;">
              🛒 Add to Cart
            </button>
          </div>
        ` : `
          <div>
            <button class="btn btn-secondary btn-lg" disabled style="width: 100%; max-width: 300px;">
              Out of Stock
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

function changeQty(delta) {
  if (!currentProduct) return;
  const qtyInput = document.getElementById('qty-input');
  if (!qtyInput) return;

  let currentQty = parseInt(qtyInput.value, 10) || 1;
  let newQty = currentQty + delta;

  if (newQty < 1) newQty = 1;
  if (newQty > currentProduct.stock) {
    showToast(`Maximum stock limit reached (${currentProduct.stock} available).`, 'warning');
    newQty = currentProduct.stock;
  }

  qtyInput.value = newQty;
}

async function addToCartFromDetail() {
  if (!currentProduct) return;
  if (!Auth.requireAuth()) return;

  const qtyInput = document.getElementById('qty-input');
  const qty = parseInt(qtyInput?.value || 1, 10);

  try {
    const data = await apiFetch('/cart', {
      method: 'POST',
      body: { productId: currentProduct.id, quantity: qty }
    });

    if (data.success) {
      showToast(data.message, 'success');
      updateCartBadge();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}
