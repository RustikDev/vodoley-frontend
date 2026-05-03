import { boot } from 'quasar/wrappers';
import { createApiClient } from 'src/api/client';
import { createVodoleyApi } from 'src/api/vodoley';
import { useAuthStore } from 'src/stores/auth';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: ReturnType<typeof createVodoleyApi>;
  }
}

export default boot(({ app }) => {
  const auth = useAuthStore();
  const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const axios = createApiClient({
    baseURL: baseURL ?? 'http://localhost:3000',
    getToken: () => auth.token,
  });

  const api = createVodoleyApi(axios);
  app.config.globalProperties.$api = api;
  app.provide('api', api);
});
