import { defineStore } from 'pinia';

const TOKEN_KEY = 'vodoley_admin_token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) ?? null,
  }),
  actions: {
    setToken(token: string | null) {
      this.token = token;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    },
    logout() {
      this.setToken(null);
    },
  },
});

