import { boot } from 'quasar/wrappers';
import { createApiClient } from 'src/api/client';
import { createVodoleyApi } from 'src/api/vodoley';
import { useAuthStore } from 'src/stores/auth';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: ReturnType<typeof createVodoleyApi>;
  }
}

export default boot(({ app, router }) => {
  const auth = useAuthStore();
  const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const axios = createApiClient({
    baseURL: baseURL ?? 'http://localhost:3000',
    getToken: () => auth.token,
    onUnauthorized: () => {
      if (auth.token) auth.logout();
      const redirect = router.currentRoute.value.fullPath;
      void router.replace({ path: '/admin/login', query: { redirect } });
    },
  });

  const api = createVodoleyApi(axios);
  app.config.globalProperties.$api = api;
  app.provide('api', api);
});


