<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="vds-header">
      <div class="vds-container">
        <q-toolbar class="vds-header__inner q-px-none">
          <q-toolbar-title class="vds-logo">
            <router-link class="text-white" style="text-decoration: none" to="/">Водолей</router-link>
          </q-toolbar-title>

          <q-input
            v-model.trim="search"
            dense
            outlined
            clearable
            class="vds-search q-mx-md"
            placeholder="Поиск по товарам"
            @keyup.enter="applySearch"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
            <template #append>
              <q-btn flat dense icon="arrow_forward" @click="applySearch" />
            </template>
          </q-input>

          <q-btn flat no-caps to="/categories" label="Категории" />
          <q-btn flat no-caps to="/catalog" label="Каталог" />
          <q-btn flat no-caps to="/about" label="О нас" />

          <q-btn flat no-caps to="/estimate" label="Смета">
            <q-badge v-if="estimate.count" color="amber-5" text-color="black" floating>
              {{ estimate.count }}
            </q-badge>
          </q-btn>

          <q-btn v-if="auth.token" flat no-caps to="/admin" label="Админ" />
        </q-toolbar>
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-10 text-grey-4" elevated>
      <div class="row items-center justify-between q-px-md q-py-sm vds-container">
        <div class="text-caption">© {{ new Date().getFullYear() }} Водолей</div>
        <div class="text-caption">Строймаркет</div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEstimateStore } from 'src/stores/estimate';
import { useAuthStore } from 'src/stores/auth';

const route = useRoute();
const router = useRouter();
const estimate = useEstimateStore();
const auth = useAuthStore();

const search = computed({
  get() {
    const q = route.query.q;
    const v = Array.isArray(q) ? q[0] : q;
    return typeof v === 'string' ? v : '';
  },
  set(v: string) {
    // local only (we push on enter/click)
    void v;
  },
});

function applySearch() {
  const q = route.query.q && typeof route.query.q === 'string' ? route.query.q : '';
  const v = (search.value ?? '').trim();
  if (v === q && route.path === '/catalog') return;

  const query: Record<string, string> = {};
  if (v) query.q = v;
  void router.push({ path: '/catalog', query });
}
</script>



