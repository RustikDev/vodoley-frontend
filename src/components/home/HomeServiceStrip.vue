<template>
  <section class="service-strip">
    <div class="vds-container">
      <div class="service-grid">
        <div v-for="item in services" :key="item.title" class="service-item">
          <div class="service-icon">
            <q-icon :name="item.icon" size="22px" color="primary" />
          </div>
          <div class="service-text">
            <div class="service-title">{{ item.title }}</div>
            <div class="service-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const services = [
  {
    icon: 'local_shipping',
    title: 'Доставка по Бахчисараю от 800 ₽',
    desc: 'Завтра, если заказать до 18:00',
  },
  {
    icon: 'credit_card',
    title: 'Оплата по счёту для ИП и ООО',
    desc: 'Безналичный расчёт и НДС',
  },
  {
    icon: 'replay',
    title: 'Возврат 14 дней',
    desc: 'Без объяснения причин',
  },
  {
    icon: 'verified_user',
    title: 'Гарантия 24 месяца',
    desc: 'На инструмент и оснастку',
  },
];
</script>

<style scoped lang="scss">
.service-strip {
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 22px;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr 1fr;
  }
}

.service-item {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 14px;
    align-items: center;
    background: #fff;
    border: 1px solid var(--vds-line);
    border-radius: 14px;
    padding: 14px 16px;
    transition: border-color .15s, transform .12s;

  @media (max-width: 1023px) {
    &:nth-child(2n) {
      border-right: none;
    }
    &:nth-child(n + 3) {
      border-top: 1px solid var(--vds-color-border);
    }
  }

  @media (max-width: 767px) {
    padding: 14px 16px;
  }
}

.service-icon {
  width: 44px;
  height: 44px;
  background: var(--vds-color-primary-light);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--vds-color-ink);
  margin-bottom: 3px;
  line-height: 1.3;
}

.service-desc {
  font-size: 12.5px;
  color: var(--vds-color-ink-3);
  font-weight: 500;
}
</style>
