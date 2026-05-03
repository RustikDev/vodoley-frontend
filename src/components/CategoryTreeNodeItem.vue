<template>
  <q-expansion-item
    v-if="hasChildren"
    dense
    expand-separator
    :label="node.name"
    :header-class="headerClass"
  >
    <q-item clickable dense :active="isActive" @click="emit('select', node.id)">
      <q-item-section>Все в «{{ node.name }}»</q-item-section>
    </q-item>

    <CategoryNodeItem
      v-for="c in node.children"
      :key="c.id"
      :node="c"
      :active-id="activeId"
      @select="emit('select', $event)"
    />
  </q-expansion-item>

  <q-item v-else clickable dense :active="isActive" @click="emit('select', node.id)">
    <q-item-section>{{ node.name }}</q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CategoryNode } from 'src/types/api';
import CategoryNodeItem from './CategoryTreeNodeItem.vue';

const props = defineProps<{ node: CategoryNode; activeId: number | null }>();
const emit = defineEmits<{ (e: 'select', categoryId: number | null): void }>();

const hasChildren = computed(() => (props.node.children?.length ?? 0) > 0);
const isActive = computed(() => props.activeId === props.node.id);
const headerClass = computed(() => (isActive.value ? 'text-primary text-weight-bold' : ''));
</script>
