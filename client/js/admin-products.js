// Admin Products Management Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAdmin()) return;
  loadAdminProducts();

  document.getElementById('admin-product-search')?.addEventListener('input', (e) => {
    filterProductsTable(e.target.value.toLowerCase());
  });
});

let allAdminProducts = [];

async function loadAdminProducts() {
  const container = document.getElementById('admin-products-table-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiFetch('/products');
    if (data.success && data.products.length > 0) {
      allAdminProducts = data.products;
      renderAdminProductsTable(allAdminProducts);
    } else {
      container.innerHTML = '<div class="empty-state"><h3>No products found in inventory.</h3><a href="/admin-product-form.html" class="btn btn-primary">Add First Product</a></div>';
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

function filterProductsTable(query) {
  if (!query) {
    renderAdminProductsTable(allAdminProducts);
    return;
  }
  const filtered = allAdminProducts.filter(p => 
    p.product_name.toLowerCase().includes(query) || 
    p.category_name.toLowerCase().includes(query)
  );
  renderAdminProductsTable(filtered);
}

function renderAdminProductsTable(products) {
  const container = document.getElementById('admin-products-table-container');
  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Product Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>
              <img src="${getImageUrl(p.image)}" alt="${p.product_name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-sm);" onerror="this.src='/uploads/products/default-product.jpg'">
            </td>
            <td>
              <div style="font-weight: 700; color: var(--dark-900);">${p.product_name}</div>
              <div style="font-size: 0.8rem; color: var(--gray-500);">ID: #${p.id}</div>
            </td>
            <td><span class="badge badge-shipped">${p.category_name}</span></td>
            <td style="font-weight: 700;">$${parseFloat(p.price).toFixed(2)}</td>
            <td>
              <span class="badge badge-${p.stock > 5 ? 'delivered' : p.stock > 0 ? 'pending' : 'cancelled'}">
                ${p.stock} in stock
              </span>
            </td>
            <td>
              <div class="action-btns">
                <a href="/admin-product-form.html?id=${p.id}" class="btn btn-secondary btn-sm">✏️ Edit</a>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id}, '${p.product_name.replace(/'/g, "\\'")}')">🗑️ Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function deleteProduct(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    const data = await apiFetch(`/products/${id}`, { method: 'DELETE' });
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminProducts();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}
