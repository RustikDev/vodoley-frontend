<template>
  <q-page class="vds-home-page">
    <HomeHero />
    <HomeServiceStrip />
    <HomeCategoryGrid />
    <HomeBestsellers
      title="Хиты продаж"
      :query="{ isHit: true, sort: 'newest' }"
      to="/catalog?isHit=true"
    />
    <HomeSmeta />
    <HomeBrandStrip />
    <HomeRecentlyViewed />
  </q-page>
</template>

<script setup lang="ts">
import HomeHero from 'src/components/home/HomeHero.vue';
import HomeServiceStrip from 'src/components/home/HomeServiceStrip.vue';
import HomeCategoryGrid from 'src/components/home/HomeCategoryGrid.vue';
import HomeBestsellers from 'src/components/home/HomeBestsellers.vue';
import HomeSmeta from 'src/components/home/HomeSmeta.vue';
import HomeBrandStrip from 'src/components/home/HomeBrandStrip.vue';
import HomeRecentlyViewed from 'src/components/home/HomeRecentlyViewed.vue';
</script>
