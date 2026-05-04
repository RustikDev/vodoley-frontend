<template>
  <div class="vds-error q-pa-md vds-card">
    <div class="row items-center q-col-gutter-md">
      <div class="col-auto">
        <q-icon name="error" size="32px" color="negative" />
      </div>
      <div class="col">
        <div class="text-subtitle1 text-weight-medium">{{ title }}</div>
        <div v-if="description" class="text-body2 vds-muted q-mt-xs">{{ description }}</div>
      </div>
      <div v-if="onRetry" class="col-auto">
        <q-btn outline color="primary" icon="refresh" label="Повторить" @click="onRetry" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  onRetry?: () => void;
}>();
</script>
