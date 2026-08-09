// Shop Page Product Catalog (Search, Filter, Sort)
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  // Read category parameter from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam) {
    currentCategory = catParam;
  }

  loadShopCategories();
  loadProducts();
  setupFilterListeners();
});

async function loadShopCategories() {
  const select = document.getElementById('category-filter');
  if (!select) return;

  try {
    const data = await apiFetch('/categories');
    if (data.success) {
      select.innerHTML = '<option value="all">All Categories</option>' + 
        data.categories.map(c => `<option value="${c.id}" ${currentCategory == c.id ? 'selected' : ''}>${c.category_name}</option>`).join('');
    }
  } catch (error) {
    console.error('Failed to load shop categories:', error);
  }
}

async function loadProducts() {
  const container = document.getElementById('shop-products-container');
  const countEl = document.getElementById('products-count');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  const searchInput = document.getElementById('search-input')?.value || '';
  const categoryVal = document.getElementById('category-filter')?.value || currentCategory;
  const maxPriceVal = document.getElementById('price-range')?.value || '';
  const sortVal = document.getElementById('sort-filter')?.value || 'newest';

  let query = `?sort=${sortVal}`;
  if (searchInput.trim()) query += `&q=${encodeURIComponent(searchInput.trim())}`;
  if (categoryVal && categoryVal !== 'all') query += `&category=${categoryVal}`;
  if (maxPriceVal) query += `&maxPrice=${maxPriceVal}`;

  try {
    const data = await apiFetch(`/products${query}`);
    if (data.success && data.products.length > 0) {
      if (countEl) countEl.textContent = `${data.products.length} Products Found`;
      container.innerHTML = data.products.map(prod => renderProductCard(prod)).join('');
    } else {
      if (countEl) countEl.textContent = '0 Products Found';
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search criteria or price filters.</p>
          <button class="btn btn-primary" onclick="resetFilters()">Reset All Filters</button>
        </div>
      `;
    }
  } catch (error) {
    container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><p>Failed to load products.</p></div>';
  }
}

function setupFilterListeners() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const priceRange = document.getElementById('price-range');
  const priceDisplay = document.getElementById('price-range-val');
  const sortFilter = document.getElementById('sort-filter');

  let debounceTimer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadProducts, 300);
  });

  categoryFilter?.addEventListener('change', () => {
    currentCategory = categoryFilter.value;
    loadProducts();
  });

  priceRange?.addEventListener('input', () => {
    if (priceDisplay) priceDisplay.textContent = `$${priceRange.value}`;
  });

  priceRange?.addEventListener('change', loadProducts);
  sortFilter?.addEventListener('change', loadProducts);
}

function resetFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('category-filter').value = 'all';
  document.getElementById('sort-filter').value = 'newest';
  const priceRange = document.getElementById('price-range');
  if (priceRange) {
    priceRange.value = priceRange.max;
    document.getElementById('price-range-val').textContent = `$${priceRange.max}`;
  }
  currentCategory = 'all';
  loadProducts();
}
