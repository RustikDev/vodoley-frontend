import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from 'src/types/api';

export function getApiErrorMessage(err: unknown): string {
  const e = err as AxiosError<ApiErrorResponse>;
  const data = e.response?.data;

  if (data) {
    const msg = data.message;
    if (Array.isArray(msg)) return msg.join('\n');
    if (typeof msg === 'string') return msg;
  }

  if (typeof e.message === 'string' && e.message.length > 0) {
    return e.message;
  }

  return 'Ошибка сети. Попробуйте ещё раз.';
}
