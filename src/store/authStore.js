import { create } from 'zustand';

const API_URL = 'http://localhost:5000'; // Change to your backend port

export const useAuth = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  // Fetch current user
  fetchMe: async () => {
    const token = get().token;
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        localStorage.removeItem('token');
        set({ user: null, token: null });
        return;
      }

      const data = await res.json();
      set({ user: data.user });
    } catch (err) {
      console.error('Fetch user error:', err);
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },

  // Register new user (NO auto-login - forces user to login after signup)
  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      console.log('Registering user...', { email, name });
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await res.json();
      console.log('Register response:', { ok: res.ok, data });

      if (!res.ok) {
        set({ loading: false, error: data.message || 'Registration failed' });
        return false;
      }

      // IMPORTANT: Do NOT save token or login user
      // Backend returns token but we ignore it
      // User must login manually after registration
      set({ loading: false, error: null });
      console.log('Registration successful - user must login');
      return true;
    } catch (err) {
      console.error('Register error:', err);
      set({ loading: false, error: 'Network error. Please try again.' });
      return false;
    }
  },

  // Login user
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      console.log('Logging in user...', { email });
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log('Login response:', { ok: res.ok, data });

      if (!res.ok) {
        set({ loading: false, error: data.message || 'Login failed' });
        return false;
      }

      localStorage.setItem('token', data.token);
      set({ 
        user: data.user, 
        token: data.token, 
        loading: false, 
        error: null 
      });
      console.log('Login successful, token saved');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      set({ loading: false, error: 'Network error. Please try again.' });
      return false;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  // Clear error
  clearError: () => set({ error: null })
}));