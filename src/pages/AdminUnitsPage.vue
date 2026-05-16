<template>
  <q-page class="q-pa-md vds-container">
    <div class="row wrap items-center justify-between q-mb-md" style="gap:8px">
      <div class="text-h6">Единицы измерения</div>
      <div class="row q-gutter-sm">
        <q-btn outline icon="refresh" label="Обновить" :loading="loading" @click="reload" />
        <q-btn color="primary" icon="add" label="Создать" @click="openCreate" />
      </div>
    </div>

    <div class="row wrap q-gutter-sm q-mb-md items-center">
      <q-input v-model.trim="search" dense outlined clearable placeholder="Поиск по названию" class="filter-search" />
      <q-toggle v-model="filterActive" label="Только активные" />
      <div class="text-caption text-grey-6">Найдено: {{ filteredRows.length }}</div>
    </div>

    <VdsErrorState
      v-if="error"
      title="Ошибка"
      :description="error"
      :on-retry="reload"
    />
    <q-table
      flat
      bordered
      row-key="id"
      :rows="filteredRows"
      :columns="columns"
      :loading="loading"
      :pagination="{ rowsPerPage: 20 }"
    >
      <template #body-cell-isActive="p">
        <q-td :props="p" class="text-center">
          <q-toggle
            :model-value="p.row.isActive"
            color="primary"
            :loading="togglingActive === p.row.id"
            @update:model-value="toggleActive(p.row)"
          />
        </q-td>
      </template>

      <template #body-cell-actions="p">
        <q-td :props="p" class="text-right">
          <q-btn flat dense icon="edit" @click="openEdit(p.row)" />
          <q-btn flat dense icon="delete" color="negative" @click="confirmDelete(p.row)" />
        </q-td>
      </template>
      <template #no-data>
        <VdsEmptyState icon="inbox" title="Нет данных" description="Попробуй обновить или создать запись" />
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen">
      <q-card style="width: 560px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Редактирование' : 'Создание' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model.trim="form.name" outlined label="Название" />
          <q-input v-model.trim="form.shortName" outlined label="Короткое" />
          <q-toggle v-model="form.isActive" label="Активна" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" v-close-popup />
          <q-btn color="primary" label="Сохранить" :loading="saving" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import VdsEmptyState from 'src/components/VdsEmptyState.vue';
import VdsErrorState from 'src/components/VdsErrorState.vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { Dialog, Notify } from 'quasar';
import { useApi } from 'src/api/useApi';
import type { QTableColumn } from 'quasar';
import type { Unit } from 'src/types/api';

const api = useApi();

const loading = ref(false);
const error = ref<string | null>(null);
const saving = ref(false);
const rows = ref<Unit[]>([]);
const search = ref('');
const filterActive = ref(false);

const filteredRows = computed(() => {
  const q = search.value.toLowerCase();
  return rows.value.filter((u) => {
    if (q && !u.name.toLowerCase().includes(q) && !u.shortName.toLowerCase().includes(q)) return false;
    if (filterActive.value && !u.isActive) return false;
    return true;
  });
});

const togglingActive = ref<number | null>(null);

async function toggleActive(u: Unit) {
  if (togglingActive.value === u.id) return;
  togglingActive.value = u.id;
  const newVal = !u.isActive;
  const row = rows.value.find((r) => r.id === u.id);
  if (row) row.isActive = newVal;
  try {
    await api.adminUpdateUnit(u.id, { isActive: newVal });
  } catch (e) {
    if (row) row.isActive = !newVal;
    Notify.create({ type: 'negative', message: e instanceof Error ? e.message : 'Ошибка' });
  } finally {
    togglingActive.value = null;
  }
}

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Название', field: 'name', align: 'left', sortable: true },
  { name: 'shortName', label: 'Короткое', field: 'shortName', align: 'left' },
  { name: 'isActive', label: 'Активна', field: 'isActive', align: 'left' },
  { name: 'sortOrder', label: 'Порядок', field: 'sortOrder', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
];

const dialogOpen = ref(false);
const form = reactive({
  id: null as number | null,
  name: '',
  shortName: '',
  isActive: true,
});

async function reload() {
  error.value = null;
  loading.value = true;
  try {
    rows.value = await api.adminUnitsList();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
    throw e;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.id = null;
  form.name = '';
  form.shortName = '';
  form.isActive = true;
  dialogOpen.value = true;
}

function openEdit(u: Unit) {
  form.id = u.id;
  form.name = u.name;
  form.shortName = u.shortName;
  form.isActive = u.isActive;
  dialogOpen.value = true;
}

async function save() {
  if (!form.name.trim() || !form.shortName.trim()) {
    Notify.create({ type: 'warning', message: 'Заполни название и короткое имя' });
    return;
  }

  saving.value = true;
  try {
    if (form.id) {
      await api.adminUpdateUnit(form.id, {
        name: form.name,
        shortName: form.shortName,
        isActive: form.isActive,
      });
    } else {
      await api.adminCreateUnit({
        name: form.name,
        shortName: form.shortName,
        isActive: form.isActive,
      });
    }

    dialogOpen.value = false;
    await reload();
    Notify.create({ type: 'positive', message: 'Сохранено' });
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
    throw e;
  } finally {
    saving.value = false;
  }
}

function confirmDelete(u: Unit) {
  Dialog.create({
    title: 'Удалить?',
    message: `Удалить «${u.name}»?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await api.adminDeleteUnit(u.id);
        await reload();
        Notify.create({ type: 'positive', message: 'Удалено' });
      } catch (e) {
        Notify.create({ type: 'negative', message: e instanceof Error ? e.message : 'Ошибка удаления' });
      }
    })();
  });
}

onMounted(() => {
  void reload();
});
</script>

<style scoped>
.filter-search { width: 280px; }
@media (max-width: 599px) { .filter-search { width: 100%; } }
</style>











