<template>
  <div class="vds-card promo q-pa-md">
    <div class="row items-center q-col-gutter-md">
      <div class="col">
        <div class="text-h6 text-weight-bold">{{ title }}</div>
        <div class="text-body2 vds-muted q-mt-xs">{{ subtitle }}</div>
        <div class="q-mt-md">
          <q-btn color="primary" no-caps :label="cta" :to="to" />
        </div>
      </div>
      <div class="col-auto gt-xs">
        <div class="badge">{{ badge }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    cta: string;
    to: string;
    badge?: string;
  }>(),
  {
    badge: 'Акция',
  },
);
</script>

<style scoped lang="scss">
.promo {
  background: radial-gradient(900px 240px at 20% 20%, rgba(11, 92, 255, 0.16), transparent),
    linear-gradient(135deg, #ffffff, #f2f6ff);
}

.badge {
  min-width: 140px;
  text-align: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--vds-color-primary), var(--vds-color-primary-2));
  color: #fff;
  font-weight: 800;
  box-shadow: var(--vds-shadow-sm);
}
</style>
