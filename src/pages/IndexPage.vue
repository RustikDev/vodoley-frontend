<template>
  <q-page class="q-pa-md vds-container">
    <div class="q-gutter-md">
      <HomeHero />

      <HomeCategoryTiles />

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-7">
          <HomeProductRail
            title="Хиты продаж"
            :query="{ inStock: true, sort: 'newest' }"
            to="/catalog?inStock=true&sort=newest"
          />
        </div>
        <div class="col-12 col-md-5">
          <HomePromoBanner
            title="Покупайте как профи"
            subtitle="Добавляйте в смету и выгружайте в Excel"
            cta="Открыть смету"
            to="/estimate"
            badge="Excel"
          />
        </div>
      </div>

      <HomeProductRail
        title="Новинки"
        :query="{ sort: 'newest' }"
        to="/catalog?sort=newest"
      />

      <HomeBrandStrip />

      <HomeProductRail
        title="С выгодой"
        :query="{ sort: 'price_asc' }"
        to="/catalog?sort=price_asc"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import HomeHero from 'src/components/home/HomeHero.vue';
import HomeCategoryTiles from 'src/components/home/HomeCategoryTiles.vue';
import HomeProductRail from 'src/components/home/HomeProductRail.vue';
import HomePromoBanner from 'src/components/home/HomePromoBanner.vue';
import HomeBrandStrip from 'src/components/home/HomeBrandStrip.vue';
</script>
