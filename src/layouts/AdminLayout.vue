<template>
  <q-layout view="lHh LpR lff">

    <!-- Sidebar -->
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      :width="240"
      :breakpoint="768"
    >
      <div class="admin-sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="sidebar-logo__icon">В</div>
        <div class="sidebar-logo__text">
          <div class="sidebar-logo__name">Водолей</div>
          <div class="sidebar-logo__sub">Панель управления</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <div class="sidebar-nav__label">Основное</div>

        <router-link to="/admin" custom v-slot="{ isExactActive, navigate }">
          <button class="sidebar-item" :class="{ 'sidebar-item--active': isExactActive }" @click="navigate">
            <span class="sidebar-item__icon">
              <q-icon name="dashboard" size="18px" />
            </span>
            <span class="sidebar-item__label">Дашборд</span>
          </button>
        </router-link>

        <div class="sidebar-nav__label sidebar-nav__label--mt">Каталог</div>

        <router-link to="/admin/categories" custom v-slot="{ isActive, navigate }">
          <button class="sidebar-item" :class="{ 'sidebar-item--active': isActive }" @click="navigate">
            <span class="sidebar-item__icon">
              <q-icon name="account_tree" size="18px" />
            </span>
            <span class="sidebar-item__label">Категории</span>
          </button>
        </router-link>

        <router-link to="/admin/brands" custom v-slot="{ isActive, navigate }">
          <button class="sidebar-item" :class="{ 'sidebar-item--active': isActive }" @click="navigate">
            <span class="sidebar-item__icon">
              <q-icon name="label" size="18px" />
            </span>
            <span class="sidebar-item__label">Бренды</span>
          </button>
        </router-link>

        <router-link to="/admin/products" custom v-slot="{ isActive, navigate }">
          <button class="sidebar-item" :class="{ 'sidebar-item--active': isActive }" @click="navigate">
            <span class="sidebar-item__icon">
              <q-icon name="inventory_2" size="18px" />
            </span>
            <span class="sidebar-item__label">Товары</span>
          </button>
        </router-link>

        <router-link to="/admin/units" custom v-slot="{ isActive, navigate }">
          <button class="sidebar-item" :class="{ 'sidebar-item--active': isActive }" @click="navigate">
            <span class="sidebar-item__icon">
              <q-icon name="straighten" size="18px" />
            </span>
            <span class="sidebar-item__label">Ед. изм.</span>
          </button>
        </router-link>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="sidebar-logout" @click="onLogout">
          <q-icon name="logout" size="16px" />
          <span>Выйти</span>
        </button>
      </div>
      </div>
    </q-drawer>

    <!-- Header -->
    <q-header class="admin-header">
      <q-toolbar class="admin-toolbar">
        <q-btn
          flat round dense
          icon="menu"
          class="admin-header__menu-btn lt-md"
          @click="drawerOpen = !drawerOpen"
        />
        <div class="admin-header__title">{{ pageTitle }}</div>
        <q-space />
        <div class="admin-header__user">
          <div class="admin-header__avatar">
            <q-icon name="person" size="18px" />
          </div>
          <span class="admin-header__username">Администратор</span>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container class="admin-page-container">
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const drawerOpen = ref(false);

const pageTitles: Record<string, string> = {
  '/admin': 'Дашборд',
  '/admin/categories': 'Категории',
  '/admin/brands': 'Бренды',
  '/admin/products': 'Товары',
  '/admin/units': 'Единицы измерения',
};

const pageTitle = computed(() => pageTitles[route.path] ?? 'Панель управления');

function onLogout() {
  auth.logout();
  void router.push('/admin/login');
}
</script>

<style scoped lang="scss">
/* ── Sidebar ─────────────────────────────────────────────── */
.admin-sidebar {
  background: #0e1430;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #2557e6;
    color: #fff;
    font-size: 18px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
  }

  &__sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 2px;
    line-height: 1.2;
  }
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;

  &__label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.3);
    padding: 0 8px;
    margin-bottom: 4px;

    &--mt {
      margin-top: 20px;
    }
  }
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  text-align: left;
  margin-bottom: 2px;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
  }

  &__label {
    font-size: 13.5px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.55);
    transition: color 0.15s;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);

    .sidebar-item__icon {
      background: rgba(37, 87, 230, 0.25);
      color: #7fa8ff;
    }

    .sidebar-item__label {
      color: rgba(255, 255, 255, 0.85);
    }
  }

  &--active {
    background: rgba(37, 87, 230, 0.18) !important;

    .sidebar-item__icon {
      background: #2557e6 !important;
      color: #fff !important;
    }

    .sidebar-item__label {
      color: #fff !important;
      font-weight: 600;
    }
  }
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.sidebar-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.35);
  font-size: 13px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: rgba(220, 38, 38, 0.12);
    color: #f87171;
  }
}

/* ── Header ──────────────────────────────────────────────── */
.admin-header {
  background: #fff !important;
  border-bottom: 1px solid #e2e8f5 !important;
  box-shadow: 0 1px 3px rgba(14, 20, 48, 0.05) !important;
}

.admin-toolbar {
  min-height: 60px;
  padding: 0 24px;
}

.admin-header__menu-btn {
  color: #5a6284;
  margin-right: 8px;
}

.admin-header__title {
  font-size: 16px;
  font-weight: 700;
  color: #0e1430;
}

.admin-header__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  border-radius: 40px;
  background: #f6f8fd;
  border: 1px solid #e2e8f5;
}

.admin-header__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #2557e6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-header__username {
  font-size: 13px;
  font-weight: 600;
  color: #2b3460;
}

/* ── Page container ──────────────────────────────────────── */
.admin-page-container {
  background: #f6f8fd;
}
</style>
