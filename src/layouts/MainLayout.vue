<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar class="q-px-md">
        <q-toolbar-title class="text-weight-bold">
          <router-link class="text-white" style="text-decoration: none" to="/">Водолей</router-link>
        </q-toolbar-title>

        <q-btn flat no-caps to="/categories" label="Категории" />
        <q-btn flat no-caps to="/catalog" label="Каталог" />
        <q-btn flat no-caps to="/estimate" label="Смета" />
        <q-btn flat no-caps to="/admin" label="Админ" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-10 text-grey-4" elevated>
      <div class="row items-center justify-between q-px-md q-py-sm">
        <div class="text-caption">© {{ new Date().getFullYear() }} Водолей</div>
        <div class="text-caption">MVP</div>
      </div>
    </q-footer>
  </q-layout>
</template>

