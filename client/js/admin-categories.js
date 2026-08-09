// Admin Category Management Logic
let editingCatId = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAdmin()) return;
  loadAdminCategories();
  setupCategoryForm();
});

async function loadAdminCategories() {
  const container = document.getElementById('categories-table-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiFetch('/categories');
    if (data.success && data.categories.length > 0) {
      renderCategoriesTable(data.categories);
    } else {
      container.innerHTML = '<div class="empty-state"><h3>No categories found.</h3></div>';
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

function renderCategoriesTable(categories) {
  const container = document.getElementById('categories-table-container');
  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Category Name</th>
          <th>Created Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${categories.map(c => `
          <tr>
            <td>#${c.id}</td>
            <td style="font-weight: 700; color: var(--dark-900);">${c.category_name}</td>
            <td>${new Date(c.created_at).toLocaleDateString()}</td>
            <td>
              <div class="action-btns">
                <button class="btn btn-secondary btn-sm" onclick="editCategory(${c.id}, '${c.category_name.replace(/'/g, "\\'")}')">✏️ Rename</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id}, '${c.category_name.replace(/'/g, "\\'")}')">🗑️ Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function setupCategoryForm() {
  const form = document.getElementById('category-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const input = document.getElementById('category-name-input');
    const name = input.value.trim();

    if (!name) {
      showToast('Category name is required.', 'error');
      return;
    }

    try {
      const endpoint = editingCatId ? `/categories/${editingCatId}` : '/categories';
      const method = editingCatId ? 'PUT' : 'POST';

      const data = await apiFetch(endpoint, {
        method,
        body: { category_name: name }
      });

      if (data.success) {
        showToast(data.message, 'success');
        resetCategoryForm();
        loadAdminCategories();
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

function editCategory(id, name) {
  editingCatId = id;
  const input = document.getElementById('category-name-input');
  const btn = document.getElementById('cat-submit-btn');
  const cancelBtn = document.getElementById('cat-cancel-btn');

  if (input) input.value = name;
  if (btn) btn.textContent = 'Update Category';
  if (cancelBtn) cancelBtn.style.display = 'inline-flex';
}

function resetCategoryForm() {
  editingCatId = null;
  const input = document.getElementById('category-name-input');
  const btn = document.getElementById('cat-submit-btn');
  const cancelBtn = document.getElementById('cat-cancel-btn');

  if (input) input.value = '';
  if (btn) btn.textContent = 'Add Category';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

async function deleteCategory(id, name) {
  if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

  try {
    const data = await apiFetch(`/categories/${id}`, { method: 'DELETE' });
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminCategories();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}
