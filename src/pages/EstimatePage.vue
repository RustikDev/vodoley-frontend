<template>
  <q-page class="q-pa-md vds-container">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Смета</div>
      <div class="text-body2 text-grey-7">Позиций: {{ store.items.length }}, шт: {{ store.count }}</div>
    </div>

    <q-banner v-if="store.items.length === 0" class="bg-grey-2 text-grey-9" rounded>
      Смета пустая. Добавляй товары из каталога или карточки товара.
    </q-banner>

    <q-card v-else flat bordered>
      <q-markup-table dense>
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Название</th>
            <th class="text-left">Ед. изм.</th>
            <th class="text-right">Цена</th>
            <th class="text-right">Количество</th>
            <th class="text-right">Итого</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="it in store.items" :key="it.productId">
            <td class="text-left" style="width: 90px">{{ it.productId }}</td>
            <td class="text-left">
              <div class="text-weight-medium">{{ it.name }}</div>
            </td>
            <td class="text-left" style="width: 120px">{{ it.unit }}</td>
            <td class="text-right" style="width: 140px">{{ formatPriceRub(it.price) }}</td>
            <td class="text-right" style="width: 160px">
              <q-input
                dense
                outlined
                type="number"
                min="1"
                :model-value="it.quantity"
                @update:model-value="(v) => store.setQuantity(it.productId, Number(v))"
              />
            </td>
            <td class="text-right" style="width: 160px">{{ formatPriceRub(it.price * it.quantity) }}</td>
            <td class="text-right" style="width: 56px">
              <q-btn flat dense round icon="delete" color="negative" @click="store.remove(it.productId)" />
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <div class="q-pa-md text-right text-subtitle1 text-weight-bold">
        Общая сумма: {{ formatPriceRub(store.total) }}
      </div>

      <q-separator />

      <q-card-section class="row items-center justify-between">
        <div class="text-caption text-grey-7">Экспорт/импорт</div>
        <div class="row q-gutter-sm">
          <q-btn flat color="negative" icon="delete_sweep" label="Очистить" @click="store.clear" />
          <q-btn color="primary" icon="download" label="Экспорт XLSX" @click="exportXlsx" />
          <q-btn outline color="primary" icon="upload" label="Импорт XLSX" @click="pickFile" />
          <input ref="fileInput" type="file" accept=".xlsx" class="hidden" @change="onFile" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="row justify-end">
        <q-btn
          color="primary"
          icon-right="send"
          label="Сформировать заказ"
          unelevated
          no-caps
          @click="orderDialog = true"
        />
      </q-card-section>
    </q-card>

    <OrderFormDialog v-model="orderDialog" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notify } from 'quasar';
import * as XLSX from 'xlsx';
import { useEstimateStore, type EstimateItem } from 'src/stores/estimate';
import { formatPriceRub } from 'src/utils/format';
import OrderFormDialog from 'src/components/OrderFormDialog.vue';

const store = useEstimateStore();
const fileInput = ref<HTMLInputElement | null>(null);
const orderDialog = ref(false);

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportXlsx() {
  const header = ['ID', 'Название', 'Ед. изм.', 'Цена', 'Количество', 'Итого'];
  const rows = store.items.map((it) => [
    it.productId,
    it.name,
    it.unit,
    it.price,
    it.quantity,
    it.price * it.quantity,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estimate');

  const summary = XLSX.utils.aoa_to_sheet([
    ['exportedAt', new Date().toISOString()],
    ['total', store.total],
  ]);
  XLSX.utils.book_append_sheet(wb, summary, 'Summary');

  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const name = `vodoley-estimate-${new Date().toISOString().slice(0, 10)}.xlsx`;
  downloadBlob(name, blob);
  Notify.create({ type: 'positive', message: 'Файл XLSX скачан' });
}

function pickFile() {
  fileInput.value?.click();
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  input.value = '';
  if (!file) return;

  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const sheetName = wb.SheetNames.find((n) => n.toLowerCase() === 'estimate') ?? wb.SheetNames[0];
    if (!sheetName) throw new Error('В файле нет листов');
    const ws = wb.Sheets[sheetName];
    if (!ws) throw new Error('Лист не найден');

    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

    const items: EstimateItem[] = raw
      .map((r) => ({
        productId: Number(r.ID ?? r.productId),
        name:
          typeof (r['Название'] ?? r.name) === 'string' ? ((r['Название'] ?? r.name) as string) : '',
        unit:
          typeof (r['Ед. изм.'] ?? r.unit) === 'string'
            ? ((r['Ед. изм.'] ?? r.unit) as string)
            : '',
        price: Number(r['Цена'] ?? r.price),
        quantity: Number(r['Количество'] ?? r.quantity),
      }))
      .filter((x) => Number.isFinite(x.productId) && Number.isFinite(x.price) && Number.isFinite(x.quantity))
      .filter((x) => x.productId > 0 && x.quantity > 0);

    store.setItems(items);
    Notify.create({ type: 'positive', message: `Импортировано позиций: ${items.length}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Ошибка импорта XLSX';
    Notify.create({ type: 'negative', message: msg });
  }
}
</script>

