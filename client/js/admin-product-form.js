// Admin Add/Edit Product Form Handler
let isEditMode = false;
let editProductId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAdmin()) return;

  await loadCategoryOptions();

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (id) {
    isEditMode = true;
    editProductId = id;
    document.getElementById('form-page-title').textContent = 'Edit Product';
    document.getElementById('submit-btn').textContent = 'Update Product';
    await loadProductData(id);
  }

  setupImagePreview();
  setupFormSubmit();
});

async function loadCategoryOptions() {
  const select = document.getElementById('product-category');
  if (!select) return;

  try {
    const data = await apiFetch('/categories');
    if (data.success) {
      select.innerHTML = '<option value="">Select Category</option>' +
        data.categories.map(c => `<option value="${c.id}">${c.category_name}</option>`).join('');
    }
  } catch (error) {
    showToast('Failed to load categories.', 'error');
  }
}

async function loadProductData(id) {
  try {
    const data = await apiFetch(`/products/${id}`);
    if (data.success && data.product) {
      const p = data.product;
      document.getElementById('product-name').value = p.product_name || '';
      document.getElementById('product-category').value = p.category_id || '';
      document.getElementById('product-price').value = p.price || '';
      document.getElementById('product-stock').value = p.stock || 0;
      document.getElementById('product-description').value = p.description || '';

      if (p.image) {
        const preview = document.getElementById('image-preview');
        if (preview) {
          preview.src = getImageUrl(p.image);
          preview.style.display = 'block';
        }
      }
    }
  } catch (error) {
    showToast('Failed to fetch product details.', 'error');
  }
}

function setupImagePreview() {
  const fileInput = document.getElementById('product-image');
  const preview = document.getElementById('image-preview');

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && preview) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        preview.src = evt.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
}

function setupFormSubmit() {
  const form = document.getElementById('product-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('product-name').value.trim();
    const categoryId = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const stock = document.getElementById('product-stock').value;
    const description = document.getElementById('product-description').value.trim();
    const fileInput = document.getElementById('product-image');

    if (!name || !categoryId || price === '' || stock === '') {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (parseFloat(price) < 0 || parseInt(stock, 10) < 0) {
      showToast('Price and stock cannot be negative.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('product_name', name);
    formData.append('category_id', categoryId);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('description', description);

    if (fileInput.files.length > 0) {
      formData.append('image', fileInput.files[0]);
    }

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    try {
      const endpoint = isEditMode ? `/products/${editProductId}` : '/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const data = await apiFetch(endpoint, {
        method,
        body: formData
      });

      if (data.success) {
        showToast(data.message, 'success');
        setTimeout(() => {
          window.location.href = '/admin-products.html';
        }, 1000);
      }
    } catch (error) {
      showToast(error.message, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = isEditMode ? 'Update Product' : 'Create Product';
      }
    }
  });
}
