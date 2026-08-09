// Authentication & Session Management Helper
const Auth = {
  getToken() {
    return localStorage.getItem('shopnest_token');
  },
  
  setToken(token) {
    localStorage.setItem('shopnest_token', token);
  },
  
  getUser() {
    const user = localStorage.getItem('shopnest_user');
    return user ? JSON.parse(user) : null;
  },
  
  setUser(user) {
    localStorage.setItem('shopnest_user', JSON.stringify(user));
  },
  
  clearSession() {
    localStorage.removeItem('shopnest_token');
    localStorage.removeItem('shopnest_user');
  },
  
  isLoggedIn() {
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  logout() {
    this.clearSession();
    showToast('Logged out successfully.', 'info');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 500);
  },

  requireAuth(redirectUrl = '/login.html') {
    if (!this.isLoggedIn()) {
      showToast('Please log in to access this page.', 'warning');
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!this.isLoggedIn()) {
      window.location.href = '/admin-login.html';
      return false;
    }
    if (!this.isAdmin()) {
      showToast('Access denied. Administrator privileges required.', 'error');
      window.location.href = '/index.html';
      return false;
    }
    return true;
  }
};
