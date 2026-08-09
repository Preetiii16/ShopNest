// Global Navigation & UI Initialization
document.addEventListener('DOMContentLoaded', () => {
  initNavbarState();
  updateCartBadge();
  setupDropdowns();
  setupMobileNav();
});

// Update Header User Menu State
function initNavbarState() {
  const userContainer = document.getElementById('user-menu-container');
  if (!userContainer) return;

  const user = Auth.getUser();

  if (user) {
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    let adminMenuOption = '';
    if (user.role === 'admin') {
      adminMenuOption = `
        <a href="/admin-dashboard.html" class="dropdown-item">
          ⚡ Admin Dashboard
        </a>
        <div class="dropdown-divider"></div>
      `;
    }

    userContainer.innerHTML = `
      <div class="dropdown">
        <button class="user-menu-btn" id="userMenuToggle">
          <div class="user-avatar">${initials}</div>
          <span>${user.name.split(' ')[0]}</span>
          <small>▼</small>
        </button>
        <div class="dropdown-menu" id="userDropdownMenu">
          ${adminMenuOption}
          <a href="/profile.html" class="dropdown-item">👤 My Profile</a>
          <a href="/orders.html" class="dropdown-item">📦 My Orders</a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item" id="logoutBtn" style="color: var(--danger);">🚪 Logout</a>
        </div>
      </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
    });
  } else {
    userContainer.innerHTML = `
      <div style="display: flex; gap: 0.5rem;">
        <a href="/login.html" class="btn btn-secondary btn-sm">Login</a>
        <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
      </div>
    `;
  }
}

// Update Cart Badge Count from MySQL DB
async function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  if (!Auth.isLoggedIn()) {
    badge.textContent = '0';
    return;
  }

  try {
    const data = await apiFetch('/cart');
    if (data.success) {
      badge.textContent = data.itemCount || 0;
    }
  } catch (error) {
    badge.textContent = '0';
  }
}

// Setup User Dropdown Toggle
function setupDropdowns() {
  document.addEventListener('click', (e) => {
    const toggle = document.getElementById('userMenuToggle');
    const menu = document.getElementById('userDropdownMenu');

    if (toggle && toggle.contains(e.target)) {
      menu.classList.toggle('show');
    } else if (menu && !menu.contains(e.target)) {
      menu.classList.remove('show');
    }
  });
}

// Mobile Navbar Drawer Toggle
function setupMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navbarNav');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }
}
