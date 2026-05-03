<template>
  <q-page class="q-pa-md">
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
            <th class="text-left">Товар</th>
            <th class="text-right">Цена</th>
            <th class="text-right">Кол-во</th>
            <th class="text-right">Итого</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="it in store.items" :key="it.productId">
            <td class="text-left">
              <div class="text-weight-medium">{{ it.name }}</div>
              <div class="text-caption text-grey-7">{{ it.unit }}</div>
            </td>
            <td class="text-right">{{ formatPriceRub(it.price) }}</td>
            <td class="text-right" style="width: 140px">
              <q-input
                dense
                outlined
                type="number"
                min="1"
                :model-value="it.quantity"
                @update:model-value="(v) => store.setQuantity(it.productId, Number(v))"
              />
            </td>
            <td class="text-right">{{ formatPriceRub(it.price * it.quantity) }}</td>
            <td class="text-right" style="width: 56px">
              <q-btn flat dense round icon="delete" color="negative" @click="store.remove(it.productId)" />
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-separator />

      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">Итого: {{ formatPriceRub(store.total) }}</div>
        <div class="row q-gutter-sm">
          <q-btn flat color="negative" icon="delete_sweep" label="Очистить" @click="store.clear" />
          <q-btn color="primary" icon="download" label="Экспорт JSON" @click="exportJson" />
          <q-btn outline color="primary" icon="upload" label="Импорт JSON" @click="importDialog = true" />
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="importDialog">
      <q-card style="width: 720px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Импорт сметы (JSON)</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="importText" type="textarea" autogrow outlined placeholder="Вставь JSON" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" v-close-popup />
          <q-btn color="primary" label="Импортировать" @click="doImport" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useEstimateStore } from 'src/stores/estimate';
import { formatPriceRub } from 'src/utils/format';

const store = useEstimateStore();

const importDialog = ref(false);
const importText = ref('');

async function exportJson() {
  const json = store.exportJson();
  await navigator.clipboard.writeText(json);
  Notify.create({ type: 'positive', message: 'JSON сметы скопирован в буфер обмена' });
}

function doImport() {
  try {
    store.importJson(importText.value);
    Notify.create({ type: 'positive', message: 'Смета импортирована' });
    importDialog.value = false;
    importText.value = '';
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Ошибка импорта';
    Notify.create({ type: 'negative', message: msg });
  }
}
</script>
