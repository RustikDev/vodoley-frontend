<template>
  <router-link :to="to" class="home-section-link">
    {{ label }}
    <span class="home-section-link__arrow">→</span>
  </router-link>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

defineProps<{
  to: RouteLocationRaw;
  label: string;
}>();
</script>

<style scoped>
.home-section-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14.5px;
  font-weight: 700;
  color: #2557e6;
  text-decoration: none;
  white-space: nowrap;
  padding: 8px 16px;
  border: 1.5px solid #c5d5fb;
  border-radius: 20px;
  transition: background 0.15s, border-color 0.15s;
}
.home-section-link:hover {
  background: #eff4ff;
  border-color: #2557e6;
}
.home-section-link__arrow {
  transition: transform 0.15s;
}
.home-section-link:hover .home-section-link__arrow {
  transform: translateX(3px);
}
</style>
