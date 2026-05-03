<template>
  <q-list bordered separator class="rounded-borders">
    <CategoryNodeItem
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :active-id="activeId"
      @select="$emit('select', $event)"
    />
  </q-list>
</template>

<script setup lang="ts">
import type { CategoryNode } from 'src/types/api';
import CategoryNodeItem from './CategoryTreeNodeItem.vue';

defineProps<{ nodes: CategoryNode[]; activeId: number | null }>();

defineEmits<{ (e: 'select', categoryId: number | null): void }>();
</script>
