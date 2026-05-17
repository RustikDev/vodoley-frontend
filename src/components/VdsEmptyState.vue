<template>
  <div class="vds-empty q-pa-md vds-card">
    <div class="row items-center q-col-gutter-md">
      <div class="col-auto">
        <q-icon :name="icon" size="32px" color="grey-7" />
      </div>
      <div class="col">
        <div class="text-subtitle1 text-weight-medium">{{ title }}</div>
        <div v-if="description" class="text-body2 vds-muted q-mt-xs">{{ description }}</div>
      </div>
      <div v-if="$slots.action" class="col-auto">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    // eslint-disable-next-line vue/require-default-prop
    description?: string;
  }>(),
  {
    icon: 'info',
  },
);
</script>
