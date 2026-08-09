// Admin Users Management Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAdmin()) return;
  loadAdminUsers();
});

async function loadAdminUsers() {
  const container = document.getElementById('users-table-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiFetch('/admin/users');
    if (data.success && data.users.length > 0) {
      renderUsersTable(data.users);
    } else {
      container.innerHTML = '<div class="empty-state"><h3>No users found.</h3></div>';
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${error.message}</p></div>`;
  }
}

function renderUsersTable(users) {
  const container = document.getElementById('users-table-container');
  const currentUser = Auth.getUser();

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Role</th>
          <th>Status</th>
          <th>Registered</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(u => {
          const isSelf = currentUser && currentUser.id === u.id;
          return `
            <tr>
              <td>#${u.id}</td>
              <td style="font-weight: 700; color: var(--dark-900);">${u.name}</td>
              <td>${u.email}</td>
              <td>${u.phone || 'N/A'}</td>
              <td><span class="badge ${u.role === 'admin' ? 'badge-shipped' : 'badge-confirmed'}">${u.role.toUpperCase()}</span></td>
              <td><span class="badge badge-${u.status === 'active' ? 'active' : 'inactive'}">${u.status}</span></td>
              <td>${new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                ${isSelf ? `
                  <span class="text-muted" style="font-size: 0.85rem;">(You)</span>
                ` : `
                  <button class="btn ${u.status === 'active' ? 'btn-danger' : 'btn-primary'} btn-sm" onclick="toggleUserStatus(${u.id}, '${u.status}')">
                    ${u.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                `}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

async function toggleUserStatus(id, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'deactivate' : 'activate';
  if (!confirm(`Are you sure you want to ${newStatus} this user account?`)) return;

  try {
    const data = await apiFetch(`/admin/users/${id}/toggle-status`, { method: 'PUT' });
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminUsers();
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}
