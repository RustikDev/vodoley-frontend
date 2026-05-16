<template>
  <div class="cat-node">
    <!-- With children: expandable -->
    <template v-if="hasChildren">
      <button
        class="cat-item cat-item--group"
        :class="{ 'cat-item--active': isActive }"
        @click="expanded = !expanded"
      >
        <span class="cat-item__label">{{ node.name }}</span>
        <q-icon
          name="expand_more"
          size="16px"
          class="cat-item__arrow"
          :class="{ 'cat-item__arrow--open': expanded }"
        />
      </button>

      <div v-if="expanded" class="cat-children">
        <button
          class="cat-item cat-item--all"
          :class="{ 'cat-item--active': isActive }"
          @click="emit('select', node.id)"
        >
          Все в «{{ node.name }}»
        </button>
        <CategoryNodeItem
          v-for="c in node.children"
          :key="c.id"
          :node="c"
          :active-id="activeId"
          @select="emit('select', $event)"
        />
      </div>
    </template>

    <!-- Leaf -->
    <button
      v-else
      class="cat-item"
      :class="{ 'cat-item--active': isActive }"
      @click="emit('select', node.id)"
    >
      <span class="cat-item__label">{{ node.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { CategoryNode } from 'src/types/api';
import CategoryNodeItem from './CategoryTreeNodeItem.vue';

const props = defineProps<{ node: CategoryNode; activeId: number | null }>();
const emit = defineEmits<{ (e: 'select', categoryId: number | null): void }>();

const hasChildren = computed(() => (props.node.children?.length ?? 0) > 0);
const isActive = computed(() => props.activeId === props.node.id);

const isChildActive = computed(() =>
  props.node.children?.some((c) => c.id === props.activeId) ?? false,
);

const expanded = ref(isChildActive.value);

watch(
  () => props.activeId,
  () => { if (isChildActive.value) expanded.value = true; },
);
</script>

<style scoped lang="scss">
.cat-node {
  display: flex;
  flex-direction: column;
}

.cat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 7px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 13.5px;
  font-weight: 500;
  color: #344066;
  transition: background 0.13s, color 0.13s;
  line-height: 1.3;

  &:hover {
    background: #f0f4ff;
    color: #2557e6;
  }

  &--active {
    background: #2557e6 !important;
    color: #fff !important;
    font-weight: 600;
  }

  &--group {
    justify-content: space-between;
    font-weight: 600;
    color: #0e1430;

    &:hover { background: #f0f4ff; color: #2557e6; }
    &.cat-item--active { color: #fff; }
  }

  &--all {
    font-size: 12.5px;
    color: #5a6284;
    padding-left: 14px;
    font-style: italic;
  }

  &__label { flex: 1; }

  &__arrow {
    color: #8c94b3;
    flex-shrink: 0;
    transition: transform 0.2s;

    &--open { transform: rotate(180deg); }
  }
}

.cat-children {
  padding-left: 10px;
  border-left: 2px solid #e8edf8;
  margin: 2px 0 2px 14px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
</style>
