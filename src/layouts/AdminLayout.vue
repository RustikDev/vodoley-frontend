<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="vds-header">
      <q-toolbar class="q-px-md">
        <q-toolbar-title class="text-weight-bold">Админка</q-toolbar-title>

        <q-space />

        <q-btn flat no-caps icon="logout" label="Выйти" @click="onLogout" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above bordered>
      <q-list>
        <q-item clickable to="/admin" exact>
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Дашборд</q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item clickable to="/admin/units">
          <q-item-section avatar><q-icon name="straighten" /></q-item-section>
          <q-item-section>Ед. изм.</q-item-section>
        </q-item>
        <q-item clickable to="/admin/categories">
          <q-item-section avatar><q-icon name="account_tree" /></q-item-section>
          <q-item-section>Категории</q-item-section>
        </q-item>
        <q-item clickable to="/admin/products">
          <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
          <q-item-section>Товары</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const auth = useAuthStore();

function onLogout() {
  auth.logout();
  void router.push('/admin/login');
}
</script>

