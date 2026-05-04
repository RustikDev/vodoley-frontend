<template>
  <q-carousel
    v-model="slide"
    animated
    swipeable
    arrows
    navigation
    infinite
    height="260px"
    class="vds-card overflow-hidden"
  >
    <q-carousel-slide :name="1" class="hero hero--1">
      <div class="hero__content">
        <div class="text-h4 text-weight-bold">Инструменты и материалы</div>
        <div class="text-body1 q-mt-sm">Для стройки, ремонта и производства</div>
        <div class="q-mt-md">
          <q-btn color="amber-5" text-color="black" no-caps label="Перейти в каталог" to="/catalog" />
        </div>
      </div>
    </q-carousel-slide>

    <q-carousel-slide :name="2" class="hero hero--2">
      <div class="hero__content">
        <div class="text-h4 text-weight-bold">Новинки недели</div>
        <div class="text-body1 q-mt-sm">Свежее поступление в каталоге</div>
        <div class="q-mt-md">
          <q-btn color="white" text-color="primary" no-caps label="Смотреть новинки" to="/catalog?sort=newest" />
        </div>
      </div>
    </q-carousel-slide>

    <q-carousel-slide :name="3" class="hero hero--3">
      <div class="hero__content">
        <div class="text-h4 text-weight-bold">Смета за 1 минуту</div>
        <div class="text-body1 q-mt-sm">Добавляй товары и выгружай в Excel</div>
        <div class="q-mt-md">
          <q-btn color="white" text-color="primary" no-caps label="Открыть смету" to="/estimate" />
        </div>
      </div>
    </q-carousel-slide>
  </q-carousel>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const slide = ref(1);
</script>

<style scoped lang="scss">
.hero {
  color: #fff;
}

.hero__content {
  padding: 28px;
  max-width: 640px;
}

.hero--1 {
  background: radial-gradient(900px 260px at 15% 50%, rgba(255, 255, 255, 0.18), transparent),
    linear-gradient(135deg, var(--vds-color-primary), var(--vds-color-primary-2));
}

.hero--2 {
  background: radial-gradient(900px 260px at 15% 50%, rgba(255, 255, 255, 0.18), transparent),
    linear-gradient(135deg, #094ad0, #0b5cff);
}

.hero--3 {
  background: radial-gradient(900px 260px at 15% 50%, rgba(255, 255, 255, 0.18), transparent),
    linear-gradient(135deg, #0b5cff, #0037a8);
}
</style>
