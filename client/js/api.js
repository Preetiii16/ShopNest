// Centralized Fetch API Wrapper
async function apiFetch(endpoint, options = {}) {
  const token = Auth.getToken();
  const headers = options.headers || {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle standard JSON requests (skip if body is FormData)
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  options.headers = headers;

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      // If token expired or unauthorized, logout customer automatically
      if (response.status === 401 && Auth.isLoggedIn()) {
        Auth.clearSession();
        showToast('Session expired. Please log in again.', 'warning');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1000);
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}
