<template>
  <div class="vds-card q-pa-md">
    <div class="text-subtitle1 text-weight-bold q-mb-sm">Бренды</div>
    <div class="row q-col-gutter-sm">
      <div v-for="b in brands" :key="b" class="col-auto">
        <q-chip dense outline color="primary" text-color="primary">{{ b }}</q-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const brands = [
  'Makita',
  'Bosch',
  'DeWalt',
  'Metabo',
  'AEG',
  'Ryobi',
  'Hilti',
  'Karcher',
  'Fubag',
  'Stihl',
];
</script>
