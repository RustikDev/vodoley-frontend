export function formatPriceRub(value: string | number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(typeof value === 'string' ? parseFloat(value) : value);
}
