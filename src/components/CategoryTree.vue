<template>
  <div class="cat-tree">
    <CategoryNodeItem
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :active-id="activeId"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { CategoryNode } from 'src/types/api';
import CategoryNodeItem from './CategoryTreeNodeItem.vue';

defineProps<{ nodes: CategoryNode[]; activeId: number | null }>();
defineEmits<{ (e: 'select', categoryId: number | null): void }>();
</script>

<style scoped>
.cat-tree {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
</style>
