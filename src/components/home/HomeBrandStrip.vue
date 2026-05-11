<template>
  <section class="brands-section">
    <div class="vds-container">

      <div class="brands-head">
        <div>
          <h2 class="brands-title">Бренды</h2>
          <div class="brands-sub">Только оригинальное оборудование от производителей</div>
        </div>
        <a class="brands-all-link">Все 84 бренда →</a>
      </div>

      <div class="brands-grid">
        <div
          v-for="brand in brands"
          :key="brand.name"
          class="brand-card"
          @click="go(brand.name)"
        >
          <div class="brand-card__count">{{ brand.count }}&thinsp;тов.</div>
          <div class="brand-card__name" :style="brand.color ? { color: brand.color } : {}">
            {{ brand.name }}
          </div>
        </div>

        <!-- Last cell: "Все бренды →" -->
        <div class="brand-card brand-card--all">
          <div class="brand-card__all-link">Все бренды →</div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const brands = [
  { name: 'Makita',    count: '840', color: '' },
  { name: 'Bosch',     count: '720', color: '' },
  { name: 'DeWalt',    count: '460', color: '' },
  { name: 'Metabo',    count: '312', color: '' },
  { name: 'Knauf',     count: '284', color: '' },
  { name: 'Holcim',    count: '96',  color: '' },
  { name: 'Tikkurila', count: '320', color: '' },
  { name: 'Hilti',     count: '410', color: '#d63f00' },
  { name: 'Karcher',   count: '260', color: '' },
  { name: 'Egger',     count: '140', color: '' },
  { name: 'Stihl',     count: '380', color: '' },
];

function go(name: string) {
  void router.push({ path: '/catalog', query: { q: name } });
}
</script>

<style scoped lang="scss">
.brands-section {
  padding: 48px 0 56px;
  background: var(--vds-color-bg);
}

.brands-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
}

.brands-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--vds-color-ink);
  margin: 0 0 4px;
  letter-spacing: -0.4px;
}

.brands-sub {
  font-size: 14px;
  color: var(--vds-color-ink-3);
  font-weight: 500;
}

.brands-all-link {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--vds-color-primary);
  cursor: pointer;
  white-space: nowrap;
  &:hover { opacity: 0.75; }
}

/* Grid — 6 columns */
.brands-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

/* Card */
.brand-card {
  background: #fff;
  border: 1px solid #e8edf8;
  border-radius: 12px;
  padding: 12px 14px 16px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  position: relative;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  &:hover {
    border-color: #c8d4f5;
    box-shadow: 0 4px 16px rgba(37, 87, 230, 0.08);
  }

  &--all {
    cursor: default;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f4ff;
    border-color: #d4dff8;

    &:hover {
      background: #e6ecff;
      border-color: #2557e6;
    }
  }
}

.brand-card__count {
  position: absolute;
  top: 12px;
  right: 14px;
  font-size: 11.5px;
  color: #8c94b3;
  font-weight: 500;
}

.brand-card__name {
  font-size: 20px;
  font-weight: 800;
  color: #0e1430;
  letter-spacing: -0.3px;
  line-height: 1;
}

.brand-card__all-link {
  font-size: 15px;
  font-weight: 700;
  color: #2557e6;
}

@media (max-width: 767px) {
  .brands-section { padding: 32px 0 36px; }
  .brands-grid { grid-template-columns: repeat(3, 1fr); }
  .brand-card { min-height: 68px; }
  .brand-card__name { font-size: 16px; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .brands-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
