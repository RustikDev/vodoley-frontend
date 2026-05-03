import { inject } from 'vue';
import type { VodoleyApi } from 'src/api/vodoley';

export function useApi(): VodoleyApi {
  const api = inject<VodoleyApi>('api');
  if (!api) throw new Error('Vodoley API is not provided (boot/api.ts)');
  return api;
}
