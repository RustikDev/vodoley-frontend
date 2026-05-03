import { defineStore } from 'pinia';
import type { AdminLoginRequest } from 'src/types/api';
import type { VodoleyApi } from 'src/api/vodoley';

const TOKEN_KEY = 'vodoley_admin_token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY),
  }),
  actions: {
    setToken(token: string | null) {
      this.token = token;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    },
    async login(payload: AdminLoginRequest, api: VodoleyApi) {
      const res = await api.adminLogin(payload);
      this.setToken(res.access_token);
      return res;
    },
    logout() {
      this.setToken(null);
    },
  },
});
