<template>
  <q-page class="q-pa-md vds-container">

    <!-- Header -->
    <div class="row wrap items-center justify-between q-mb-md" style="gap:8px">
      <div class="text-h6">Бренды</div>
      <div class="row q-gutter-sm">
        <q-btn outline icon="refresh" label="Обновить" :loading="loading" @click="reload" />
        <q-btn color="primary" icon="add" label="Создать бренд" @click="openCreate" />
      </div>
    </div>

    <div class="row wrap q-gutter-sm q-mb-md items-center">
      <q-input v-model.trim="search" dense outlined clearable placeholder="Поиск по названию или slug" class="filter-search" />
      <q-toggle v-model="filterActive" label="Только активные" />
      <div class="text-caption text-grey-6">Найдено: {{ filteredRows.length }}</div>
    </div>

    <VdsErrorState v-if="error" title="Ошибка загрузки" :description="error" :on-retry="reload" />

    <q-table
      flat
      bordered
      row-key="id"
      :rows="filteredRows"
      :columns="columns"
      :loading="loading"
      :pagination="{ rowsPerPage: 25 }"
    >
      <!-- Logo cell -->
      <template #body-cell-logo="p">
        <q-td :props="p">
          <div class="logo-cell">
            <div class="logo-thumb">
              <img v-if="p.row.logo" :src="resolveUrl(p.row.logo)" class="logo-thumb-img" :alt="p.row.name" />
              <span v-else class="logo-thumb-letter">{{ p.row.name.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
        </q-td>
      </template>

      <!-- Name cell with description tooltip -->
      <template #body-cell-name="p">
        <q-td :props="p">
          <span class="text-weight-medium">{{ p.row.name }}</span>
          <q-tooltip v-if="p.row.description" max-width="320px" class="text-body2">
            {{ p.row.description }}
          </q-tooltip>
        </q-td>
      </template>

      <!-- Website cell -->
      <template #body-cell-website="p">
        <q-td :props="p">
          <a
            v-if="p.row.website"
            :href="p.row.website"
            target="_blank"
            rel="noopener"
            class="text-primary"
            style="font-size:12px"
          >
            {{ shortenUrl(p.row.website) }}
          </a>
          <span v-else class="text-grey-5">—</span>
        </q-td>
      </template>

      <!-- productCount cell -->
      <template #body-cell-productCount="p">
        <q-td :props="p">
          <q-badge
            v-if="p.row.productCount"
            :label="p.row.productCount"
            color="primary"
            outline
          />
          <span v-else class="text-grey-5">0</span>
        </q-td>
      </template>

      <!-- isActive toggle -->
      <template #body-cell-isActive="p">
        <q-td :props="p">
          <q-toggle
            :model-value="p.row.isActive"
            dense
            color="primary"
            :loading="togglingId === p.row.id"
            @update:model-value="toggleActive(p.row)"
          />
        </q-td>
      </template>

      <!-- Actions -->
      <template #body-cell-actions="p">
        <q-td :props="p" class="text-right">
          <!-- Upload logo -->
          <q-btn flat dense round icon="image" color="grey-7" title="Логотип">
            <q-tooltip>Загрузить / сменить логотип</q-tooltip>
            <q-menu anchor="bottom right" self="top right" style="width:240px">
              <q-list dense padding>
                <q-item>
                  <q-item-section>
                    <q-btn
                      outline
                      size="sm"
                      icon="upload"
                      label="Загрузить логотип"
                      :loading="uploadingId === p.row.id"
                      @click="triggerLogoUpload(p.row)"
                    />
                  </q-item-section>
                </q-item>
                <q-item v-if="p.row.logo">
                  <q-item-section>
                    <q-btn
                      outline
                      size="sm"
                      icon="delete"
                      color="negative"
                      label="Удалить логотип"
                      :loading="deletingLogoId === p.row.id"
                      @click="deleteLogo(p.row)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Edit -->
          <q-btn flat dense round icon="edit" color="grey-7" title="Редактировать" @click="openEdit(p.row)">
            <q-tooltip>Редактировать</q-tooltip>
          </q-btn>

          <!-- Delete -->
          <q-btn flat dense round icon="delete" color="negative" title="Удалить" @click="confirmDelete(p.row)">
            <q-tooltip>Удалить</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template #no-data>
        <VdsEmptyState icon="label" title="Брендов нет" description="Создай первый бренд" />
      </template>
    </q-table>

    <!-- Hidden file input for logo -->
    <input
      ref="fileInputEl"
      type="file"
      accept="image/*"
      style="display:none"
      @change="onLogoFileSelected"
    />

    <!-- Create / Edit dialog -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="width:680px; max-width:95vw; max-height:90vh; display:flex; flex-direction:column; overflow:hidden">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ form.id ? 'Редактировать бренд' : 'Новый бренд' }}</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <div style="overflow-y:auto; flex:1">

        <!-- Logo section -->
        <q-card-section class="q-pt-none">
          <div class="logo-editor">
            <div class="logo-editor-preview">
              <img
                v-if="pendingLogoPreview"
                :src="pendingLogoPreview"
                class="logo-editor-img"
                alt="Логотип"
              />
              <img
                v-else-if="form.logo"
                :src="resolveUrl(form.logo)"
                class="logo-editor-img"
                alt="Логотип"
              />
              <span v-else class="logo-editor-letter">
                {{ form.name.charAt(0).toUpperCase() || '?' }}
              </span>
            </div>

            <div class="logo-editor-actions">
              <div class="text-subtitle2 q-mb-xs">Логотип</div>

              <div class="row q-gutter-sm">
                <q-btn
                  outline
                  size="sm"
                  icon="upload"
                  :label="form.logo || pendingLogoFile ? 'Заменить' : 'Загрузить'"
                  :loading="form.id != null && uploadingId === form.id"
                  @click="triggerLogoUploadDialog"
                />
                <q-btn
                  v-if="form.logo || pendingLogoFile"
                  outline
                  size="sm"
                  icon="delete"
                  color="negative"
                  label="Удалить"
                  :loading="form.id != null && deletingLogoId === form.id"
                  @click="clearLogo"
                />
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ pendingLogoFile ? pendingLogoFile.name : 'PNG, JPG, SVG — до 2 МБ' }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <div class="row q-gutter-sm">
            <q-input
              v-model.trim="form.name"
              outlined
              label="Название *"
              class="col"
              @update:model-value="autoSlug"
            />
            <q-input
              v-model.trim="form.slug"
              outlined
              label="Slug *"
              class="col"
              hint="Латиница, цифры, дефисы"
              :rules="[slugRule]"
            />
          </div>

          <q-input
            v-model.trim="form.description"
            outlined
            label="Описание"
            type="textarea"
            rows="3"
            autogrow
          />

          <q-input
            v-model.trim="form.website"
            outlined
            label="Сайт бренда"
            placeholder="https://example.com"
            clearable
          />

          <div class="row q-gutter-sm items-center">
            <q-toggle v-model="form.isActive" label="Активен" color="primary" />
            <q-input
              v-model.number="form.sortOrder"
              outlined
              dense
              type="number"
              label="Порядок сортировки"
              style="width:160px"
            />
          </div>
        </q-card-section>

        </div>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Отмена" v-close-popup />
          <q-btn
            color="primary"
            :label="form.id ? 'Сохранить' : 'Создать'"
            :loading="saving"
            @click="save"
          />
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
import type { Brand, CreateBrandRequest, UpdateBrandRequest } from 'src/types/api';

const api = useApi();

/* ── Table ── */
const loading = ref(false);
const error = ref<string | null>(null);
const rows = ref<Brand[]>([]);
const search = ref('');
const filterActive = ref(false);

const filteredRows = computed(() => {
  const q = search.value.toLowerCase();
  return rows.value.filter((b) => {
    if (q && !b.name.toLowerCase().includes(q) && !b.slug.toLowerCase().includes(q)) return false;
    if (filterActive.value && !b.isActive) return false;
    return true;
  });
});

const columns: QTableColumn[] = [
  { name: 'logo',         label: 'Лого',       field: 'logo',         align: 'left',  style: 'width:72px' },
  { name: 'id',           label: 'ID',         field: 'id',           align: 'left',  sortable: true, style: 'width:60px' },
  { name: 'name',         label: 'Название',   field: 'name',         align: 'left',  sortable: true },
  { name: 'slug',         label: 'Slug',       field: 'slug',         align: 'left' },
  { name: 'website',      label: 'Сайт',       field: 'website',      align: 'left' },
  { name: 'productCount', label: 'Товаров',    field: 'productCount', align: 'center', sortable: true },
  { name: 'sortOrder',    label: 'Порядок',    field: 'sortOrder',    align: 'center', sortable: true },
  { name: 'isActive',     label: 'Активен',    field: 'isActive',     align: 'center' },
  { name: 'actions',      label: '',           field: 'actions',      align: 'right',  style: 'width:120px' },
];

async function reload() {
  error.value = null;
  loading.value = true;
  try {
    rows.value = await api.adminBrandsList();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
}

/* ── Helpers ── */
function resolveUrl(path: string) {
  return path.startsWith('http') ? path : api.toAbsoluteUploadUrl(path);
}

function shortenUrl(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

/* ── Create / Edit ── */
const dialogOpen = ref(false);
const saving = ref(false);

const form = reactive({
  id: null as number | null,
  name: '',
  slug: '',
  description: '',
  website: '',
  logo: null as string | null,
  isActive: true,
  sortOrder: 0,
});

let slugEdited = false;

function autoSlug(val: string | number | null) {
  if (slugEdited || form.id) return;
  form.slug = String(val ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

function slugRule(v: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) || 'Только строчные латинские буквы, цифры и дефисы';
}

function openCreate() {
  form.id = null;
  form.name = '';
  form.slug = '';
  form.description = '';
  form.website = '';
  form.logo = null;
  form.isActive = true;
  form.sortOrder = 0;
  slugEdited = false;
  pendingLogoFile.value = null;
  if (pendingLogoPreview.value) { URL.revokeObjectURL(pendingLogoPreview.value); pendingLogoPreview.value = null; }
  dialogOpen.value = true;
}

function openEdit(b: Brand) {
  form.id = b.id;
  form.name = b.name;
  form.slug = b.slug;
  form.description = b.description ?? '';
  form.website = b.website ?? '';
  form.logo = b.logo ?? null;
  form.isActive = b.isActive;
  form.sortOrder = b.sortOrder;
  slugEdited = true;
  dialogOpen.value = true;
}

async function save() {
  if (!form.name.trim() || !form.slug.trim()) {
    Notify.create({ type: 'warning', message: 'Заполни название и slug' });
    return;
  }
  if (!slugRule(form.slug)) {
    Notify.create({ type: 'warning', message: 'Некорректный slug' });
    return;
  }

  saving.value = true;
  try {
    if (form.id) {
      const payload: UpdateBrandRequest = {
        name: form.name,
        slug: form.slug,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      };
      if (form.description) payload.description = form.description;
      if (form.website) payload.website = form.website;
      await api.adminUpdateBrand(form.id, payload);
      Notify.create({ type: 'positive', message: 'Бренд обновлён' });
    } else {
      const payload: CreateBrandRequest = {
        name: form.name,
        slug: form.slug,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      };
      if (form.description) payload.description = form.description;
      if (form.website) payload.website = form.website;
      const created = await api.adminCreateBrand(payload);
      // upload pending logo right after creation
      if (pendingLogoFile.value) {
        try {
          await api.adminUploadBrandLogo(created.id, pendingLogoFile.value);
        } catch {
          Notify.create({ type: 'warning', message: 'Бренд создан, но лого не загрузилось — попробуй загрузить вручную' });
        } finally {
          pendingLogoFile.value = null;
          if (pendingLogoPreview.value) { URL.revokeObjectURL(pendingLogoPreview.value); pendingLogoPreview.value = null; }
        }
      }
      Notify.create({ type: 'positive', message: 'Бренд создан' });
    }

    dialogOpen.value = false;
    await reload();
  } catch (e) {
    Notify.create({ type: 'negative', message: e instanceof Error ? e.message : 'Ошибка сохранения' });
  } finally {
    saving.value = false;
  }
}

/* ── Toggle active ── */
const togglingId = ref<number | null>(null);

async function toggleActive(brand: Brand) {
  togglingId.value = brand.id;
  try {
    await api.adminUpdateBrand(brand.id, { isActive: !brand.isActive });
    brand.isActive = !brand.isActive;
    Notify.create({ type: 'positive', message: brand.isActive ? 'Бренд активирован' : 'Бренд скрыт' });
  } catch (e) {
    Notify.create({ type: 'negative', message: e instanceof Error ? e.message : 'Ошибка' });
  } finally {
    togglingId.value = null;
  }
}

/* ── Delete ── */
function confirmDelete(brand: Brand) {
  const hasProducts = brand.productCount && brand.productCount > 0;
  Dialog.create({
    title: 'Удалить бренд?',
    message: hasProducts
      ? `У бренда «${brand.name}» есть ${brand.productCount} товар(ов). Бекенд заблокирует удаление — сначала переназначь или удали товары.`
      : `Удалить бренд «${brand.name}»? Это действие необратимо.`,
    cancel: { label: 'Отмена', flat: true },
    ok: { label: 'Удалить', color: 'negative', flat: hasProducts },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await api.adminDeleteBrand(brand.id);
        await reload();
        Notify.create({ type: 'positive', message: 'Бренд удалён' });
      } catch (e) {
        Notify.create({ type: 'negative', message: e instanceof Error ? e.message : 'Ошибка удаления' });
      }
    })();
  });
}

/* ── Logo upload ── */
const fileInputEl = ref<HTMLInputElement | null>(null);
const uploadingId = ref<number | null>(null);
const deletingLogoId = ref<number | null>(null);
// pending file chosen before brand is saved (create mode)
const pendingLogoFile = ref<File | null>(null);
const pendingLogoPreview = ref<string | null>(null);

let pendingUploadBrand: Brand | null = null;
// true = called from dialog, false = from table action button
let uploadFromDialog = false;

function triggerLogoUpload(brand: Brand) {
  pendingUploadBrand = brand;
  uploadFromDialog = false;
  fileInputEl.value?.click();
}

function triggerLogoUploadDialog() {
  if (form.id) {
    // editing existing brand — upload immediately
    const brand = rows.value.find((b) => b.id === form.id);
    if (brand) {
      pendingUploadBrand = brand;
      uploadFromDialog = true;
      fileInputEl.value?.click();
    }
  } else {
    // creating new brand — just store the file for later
    uploadFromDialog = true;
    fileInputEl.value?.click();
  }
}

function clearLogo() {
  if (form.id) {
    // existing brand — call delete endpoint
    const brand = rows.value.find((b) => b.id === form.id);
    if (brand) deleteLogo(brand);
  } else {
    // just clear the pending file
    pendingLogoFile.value = null;
    if (pendingLogoPreview.value) {
      URL.revokeObjectURL(pendingLogoPreview.value);
      pendingLogoPreview.value = null;
    }
  }
}

async function onLogoFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (fileInputEl.value) fileInputEl.value.value = '';

  // Create mode — just store locally, upload after brand is created
  if (uploadFromDialog && !form.id) {
    if (pendingLogoPreview.value) URL.revokeObjectURL(pendingLogoPreview.value);
    pendingLogoFile.value = file;
    pendingLogoPreview.value = URL.createObjectURL(file);
    return;
  }

  // Edit / table mode — upload right away
  const brand = pendingUploadBrand;
  pendingUploadBrand = null;
  if (!brand) return;

  uploadingId.value = brand.id;
  try {
    const updated = await api.adminUploadBrandLogo(brand.id, file);
    const idx = rows.value.findIndex((b) => b.id === brand.id);
    if (idx !== -1) rows.value[idx] = updated;
    if (form.id === brand.id) form.logo = updated.logo ?? null;
    Notify.create({ type: 'positive', message: 'Логотип загружен' });
  } catch (e) {
    Notify.create({ type: 'negative', message: e instanceof Error ? e.message : 'Ошибка загрузки логотипа' });
  } finally {
    uploadingId.value = null;
  }
}

function deleteLogo(brand: Brand) {
  Dialog.create({
    title: 'Удалить логотип?',
    message: `Удалить логотип бренда «${brand.name}»?`,
    cancel: { label: 'Отмена', flat: true },
    ok: { label: 'Удалить', color: 'negative' },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      deletingLogoId.value = brand.id;
      try {
        const updated = await api.adminDeleteBrandLogo(brand.id);
        const idx = rows.value.findIndex((b) => b.id === brand.id);
        if (idx !== -1) rows.value[idx] = updated;
        if (form.id === brand.id) form.logo = null;
        Notify.create({ type: 'positive', message: 'Логотип удалён' });
      } catch (e) {
        Notify.create({ type: 'negative', message: e instanceof Error ? e.message : 'Ошибка' });
      } finally {
        deletingLogoId.value = null;
      }
    })();
  });
}

onMounted(() => { void reload(); });
</script>

<style scoped>
.filter-search { width: 280px; }
@media (max-width: 599px) { .filter-search { width: 100%; } }

.logo-cell { display: flex; align-items: center; }

.logo-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #eff5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

/* Logo editor in dialog */
.logo-editor {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 16px;
  background: #f8faff;
  border: 1px solid #e6ebf5;
  border-radius: 12px;
}

.logo-editor-preview {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background: #eff5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.logo-editor-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
}

.logo-editor-letter {
  font-size: 30px;
  font-weight: 800;
  color: #2557e6;
  line-height: 1;
}

.logo-editor-actions { flex: 1; }

.logo-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.logo-thumb-letter {
  font-size: 18px;
  font-weight: 800;
  color: #2557e6;
  line-height: 1;
}
</style>
