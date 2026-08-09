// Customer Profile Management Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  loadUserProfile();
  setupProfileForm();
});

async function loadUserProfile() {
  try {
    const data = await apiFetch('/auth/profile');
    if (data.success && data.user) {
      const user = data.user;
      Auth.setUser(user);

      document.getElementById('profile-name').value = user.name || '';
      document.getElementById('profile-email').value = user.email || '';
      document.getElementById('profile-phone').value = user.phone || '';
      document.getElementById('profile-address').value = user.address || '';
    }
  } catch (error) {
    showToast('Failed to load user profile.', 'error');
  }
}

function setupProfileForm() {
  const form = document.getElementById('profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('profile-name').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const address = document.getElementById('profile-address').value.trim();
    const currentPassword = document.getElementById('profile-current-password').value;
    const newPassword = document.getElementById('profile-new-password').value;

    if (!name) {
      showToast('Name is required.', 'error');
      return;
    }

    const payload = { name, phone, address };

    if (newPassword) {
      if (!currentPassword) {
        showToast('Current password is required to set a new password.', 'error');
        return;
      }
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    try {
      const data = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: payload
      });

      if (data.success) {
        showToast('Profile updated successfully!', 'success');
        Auth.setUser(data.user);
        document.getElementById('profile-current-password').value = '';
        document.getElementById('profile-new-password').value = '';
        
        // Refresh navbar display
        if (typeof initNavbarState === 'function') initNavbarState();
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}
