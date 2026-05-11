<template>
  <q-page class="q-pa-md vds-container">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Категории</div>
      <div class="row q-gutter-sm">
        <q-btn outline icon="refresh" label="Обновить" :loading="loading" @click="reload" />
        <q-btn color="primary" icon="add" label="Создать" @click="openCreate" />
      </div>
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
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :pagination="{ rowsPerPage: 20 }"
    >
      <template #body-cell-parent="p">
        <q-td :props="p">
          {{ parentName(p.row.parentId) }}
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
      <q-card style="width: 720px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Редактирование' : 'Создание' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model.trim="form.name" outlined label="Название" />
          <q-input v-model.trim="form.slug" outlined label="Slug" hint="латиница/дефисы" />
          <q-select
            v-model="form.parentId"
            outlined
            clearable
            emit-value
            map-options
            label="Родитель"
            :options="parentOptions"
          />
          <q-toggle v-model="form.isActive" label="Активна" />
          <q-input v-model.number="form.sortOrder" outlined type="number" label="Порядок" />
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
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from 'src/types/api';

const api = useApi();

const loading = ref(false);
const error = ref<string | null>(null);
const saving = ref(false);
const rows = ref<Category[]>([]);

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Название', field: 'name', align: 'left', sortable: true },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left' },
  { name: 'parent', label: 'Родитель', field: 'parentId', align: 'left' },
  { name: 'isActive', label: 'Активна', field: 'isActive', align: 'left' },
  { name: 'sortOrder', label: 'Порядок', field: 'sortOrder', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
];

const byId = computed(() => new Map(rows.value.map((c) => [c.id, c])));

function parentName(parentId: number | null) {
  if (!parentId) return '—';
  return byId.value.get(parentId)?.name ?? String(parentId);
}

const parentOptions = computed(() =>
  rows.value
    .map((c) => ({ label: c.name, value: c.id }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ru')),
);

const dialogOpen = ref(false);
const form = reactive({
  id: null as number | null,
  name: '',
  slug: '',
  parentId: null as number | null,
  isActive: true,
  sortOrder: 0,
});

async function reload() {
  error.value = null;
  loading.value = true;
  try {
    rows.value = await api.adminCategoriesList();
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
  form.slug = '';
  form.parentId = null;
  form.isActive = true;
  form.sortOrder = 0;
  dialogOpen.value = true;
}

function openEdit(c: Category) {
  form.id = c.id;
  form.name = c.name;
  form.slug = c.slug;
  form.parentId = c.parentId;
  form.isActive = c.isActive;
  form.sortOrder = c.sortOrder;
  dialogOpen.value = true;
}

async function save() {
  if (!form.name.trim() || !form.slug.trim()) {
    Notify.create({ type: 'warning', message: 'Заполни название и slug' });
    return;
  }

  saving.value = true;
  try {
    if (form.id) {
      const payload: UpdateCategoryRequest = {
        name: form.name,
        slug: form.slug,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      };

      if (form.parentId != null) payload.parentId = form.parentId;

      await api.adminUpdateCategory(form.id, payload);
    } else {
      const payload: CreateCategoryRequest = {
        name: form.name,
        slug: form.slug,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      };

      if (form.parentId != null) payload.parentId = form.parentId;

      await api.adminCreateCategory(payload);
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

function confirmDelete(c: Category) {
  Dialog.create({
    title: 'Удалить?',
    message: `Удалить «${c.name}»?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await api.adminDeleteCategory(c.id);
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












