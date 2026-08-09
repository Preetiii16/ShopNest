// Home Page Logic
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadFeaturedProducts();
});

async function loadCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  try {
    const data = await apiFetch('/categories');
    if (data.success && data.categories.length > 0) {
      container.innerHTML = data.categories.map(cat => `
        <a href="/shop.html?category=${cat.id}" class="category-card">
          <div class="category-icon">🏷️</div>
          <h4 style="font-size: 1.05rem; font-weight: 700;">${cat.category_name}</h4>
          <span style="font-size: 0.8rem; color: var(--gray-500);">Explore Collection &rarr;</span>
        </a>
      `).join('');
    } else {
      container.innerHTML = '<p class="text-muted text-center">No categories found.</p>';
    }
  } catch (error) {
    container.innerHTML = '<p class="text-muted text-center">Failed to load categories.</p>';
  }
}

async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products-container');
  if (!container) return;

  try {
    const data = await apiFetch('/products?sort=newest');
    if (data.success && data.products.length > 0) {
      // Display top 8 products as featured
      const featured = data.products.slice(0, 8);
      container.innerHTML = featured.map(prod => renderProductCard(prod)).join('');
    } else {
      container.innerHTML = '<div class="empty-state"><h3>No products available</h3></div>';
    }
  } catch (error) {
    container.innerHTML = '<p class="text-muted text-center">Failed to load featured products.</p>';
  }
}

function renderProductCard(product) {
  const stockClass = product.stock > 5 ? 'stock-in' : product.stock > 0 ? 'stock-low' : 'stock-out';
  const stockLabel = product.stock > 5 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} Left` : 'Out of Stock';

  return `
    <div class="product-card">
      <div class="product-image-container">
        <img src="${getImageUrl(product.image)}" alt="${product.product_name}" class="product-image" onerror="this.src='/uploads/products/default-product.jpg'">
        <span class="product-category-tag">${product.category_name}</span>
        <span class="product-stock-tag ${stockClass}">${stockLabel}</span>
      </div>
      <div class="product-content">
        <h3 class="product-title">${product.product_name}</h3>
        <p class="product-description">${product.description || 'No description available.'}</p>
        <div class="product-footer">
          <span class="product-price">$${parseFloat(product.price).toFixed(2)}</span>
          <div style="display: flex; gap: 0.4rem;">
            <a href="/product-detail.html?id=${product.id}" class="btn btn-outline btn-sm">View</a>
            <button class="btn btn-primary btn-sm" onclick="quickAddToCart(${product.id}, ${product.stock})" ${product.stock <= 0 ? 'disabled' : ''}>
              🛒 Add
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function quickAddToCart(productId, stock) {
  if (stock <= 0) {
    showToast('Sorry, this product is out of stock.', 'error');
    return;
  }

  if (!Auth.requireAuth()) return;

  try {
    const data = await apiFetch('/cart', {
      method: 'POST',
      body: { productId, quantity: 1 }
    });

    if (data.success) {
      showToast(data.message, 'success');
      updateCartBadge();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}
