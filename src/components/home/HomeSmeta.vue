<template>
  <section class="smeta-section">
    <div class="vds-container">
      <div class="smeta-wrap">
        <!-- Left -->
        <div class="smeta-left">
          <div class="smeta-pill">
            <q-icon name="receipt_long" size="13px" />
            ДЛЯ ПОДРЯДЧИКОВ И БРИГАД
          </div>

          <h2 class="smeta-title">
            Покупайте как профи&nbsp;—<br />
            собирайте смету сразу<br />
            из каталога
          </h2>

          <p class="smeta-desc">
            Добавляйте товары в смету в один клик, делитесь ей с заказчиком, печатайте или
            выгружайте в Excel/1С. Цены автоматически обновляются.
          </p>

          <div class="smeta-features">
            <div v-for="f in features" :key="f" class="smeta-feature">
              <div class="smeta-check">
                <q-icon name="check" size="12px" />
              </div>
              {{ f }}
            </div>
          </div>

          <div class="smeta-actions">
            <router-link to="/estimate" class="smeta-btn-primary">
              Открыть смету &nbsp;→
            </router-link>
          </div>
        </div>

        <!-- Right: smeta preview card -->
        <div class="smeta-right">
          <div class="smeta-card">
            <!-- Window chrome -->
            <div class="smeta-card__chrome">
              <div class="smeta-card__dots">
                <span class="dot dot--red" />
                <span class="dot dot--yellow" />
                <span class="dot dot--green" />
              </div>
              <div class="smeta-card__chrome-title">
                Смета&nbsp;·&nbsp;Объект&nbsp;«Дача,&nbsp;Истра»
              </div>
              <div class="smeta-card__chrome-count">12 позиций</div>
            </div>

            <!-- Rows -->
            <div class="smeta-card__rows">
              <div v-for="row in rows" :key="row.name" class="smeta-row">
                <div class="smeta-row__thumb" :style="{ background: row.color }" />
                <div class="smeta-row__info">
                  <div class="smeta-row__name">{{ row.name }}</div>
                  <div class="smeta-row__sub">{{ row.sub }}</div>
                </div>
                <div class="smeta-row__calc">
                  <span class="smeta-row__qty">× {{ row.qty }}</span>
                  <span class="smeta-row__unit-price">{{ row.unitPrice }}&nbsp;Р</span>
                  <span class="smeta-row__total">{{ row.total }}&nbsp;<strong>Р</strong></span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="smeta-card__footer">
              <div class="smeta-card__download">
                <q-icon name="description" size="15px" color="primary" />
                <span>Скачать .xlsx</span>
              </div>
              <div class="smeta-card__total">
                Итого со скидкой&nbsp;
                <strong>186&nbsp;420&nbsp;Р</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  'Экспорт в Excel и PDF',
  'Скидка от 5% по объёму',
  'Несколько объектов',
  'Безналичный расчёт',
];

const rows = [
  {
    name: 'Цемент М500 Holcim, 50 кг',
    sub: 'CEM I 42,5 N · мешок',
    qty: 24,
    unitPrice: '461',
    total: '11 864',
    color: '#d8e8f8',
  },
  {
    name: 'Профлист С8 1,1×6 м',
    sub: 'оцинк. 0,5 мм',
    qty: 18,
    unitPrice: '1 280',
    total: '23 848',
    color: '#fde8a0',
  },
  {
    name: 'Перфоратор Makita HR2470',
    sub: 'SDS-Plus · 780 Вт',
    qty: 1,
    unitPrice: '14 990',
    total: '14 998',
    color: '#e0e0e8',
  },
  {
    name: 'Шуруп саморез 4,2×16 (1000 шт)',
    sub: 'с прессшайбой',
    qty: 4,
    unitPrice: '890',
    total: '3 568',
    color: '#d8f0e8',
  },
];
</script>

<style scoped lang="scss">
.smeta-section {
  padding: 48px 0;
  background: var(--vds-color-bg);
}

/* Outer wrap — dark block */
.smeta-wrap {
  background: linear-gradient(120deg, #0e1836 0%, #162050 50%, #1a2a6c 100%);
  border-radius: 20px;
  padding: 52px 56px;
  display: grid;
  grid-template-columns: 1fr 460px;
  gap: 56px;
  align-items: center;
}

/* ── Left ── */
.smeta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
  width: fit-content;
}

.smeta-title {
  font-size: 34px;
  font-weight: 800;
  color: #fff;
  line-height: 1.18;
  letter-spacing: -0.5px;
  margin: 0 0 18px;
}

.smeta-desc {
  font-size: 14.5px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.62);
  margin: 0 0 28px;
  max-width: 400px;
}

.smeta-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 24px;
  margin-bottom: 32px;
}

.smeta-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.smeta-check {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 200, 61, 0.16);
  color: var(--vds-color-yellow);
  display: grid;
  place-items: center;
}

.smeta-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.smeta-btn-primary {
  background: var(--vds-color-yellow);
  color: #0e1430;
  font-weight: 700;
  font-size: 15px;
  padding: 14px 22px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 18px -6px rgba(255, 200, 61, 0.6);
  transition:
    transform 0.12s,
    box-shadow 0.12s;
  &:hover {
    background: #e5a800;
  }
}

.smeta-btn-ghost {
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14.5px;
  font-weight: 600;
  padding: 13px 24px;
  border-radius: 10px;
  border: 1.5px solid rgba(255, 255, 255, 0.28);
  text-decoration: none;
  transition:
    background 0.15s,
    border-color 0.15s;
  white-space: nowrap;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.45);
  }
}

/* ── Right: preview card ── */
.smeta-right {
  perspective: 900px;
}

.smeta-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  transform: rotateY(-3deg) rotateX(1deg);
}

/* Chrome bar */
.smeta-card__chrome {
  background: #f4f5f8;
  border-bottom: 1px solid #e4e8f0;
  padding: 11px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.smeta-card__dots {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  &--red {
    background: #ff5f57;
  }
  &--yellow {
    background: #febc2e;
  }
  &--green {
    background: #28c840;
  }
}

.smeta-card__chrome-title {
  flex: 1;
  font-size: 12.5px;
  font-weight: 600;
  color: #5a6284;
  text-align: center;
}

.smeta-card__chrome-count {
  font-size: 12px;
  color: #8c94b3;
  flex-shrink: 0;
}

/* Rows */
.smeta-card__rows {
  padding: 4px 0;
}

.smeta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f2f8;

  &:last-child {
    border-bottom: none;
  }
}

.smeta-row__thumb {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
}

.smeta-row__info {
  flex: 1;
  min-width: 0;
}

.smeta-row__name {
  font-size: 12.5px;
  font-weight: 700;
  color: #0e1430;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.smeta-row__sub {
  font-size: 11px;
  color: #8c94b3;
  font-weight: 500;
  margin-top: 1px;
}

.smeta-row__calc {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-size: 12px;
}

.smeta-row__qty {
  color: #8c94b3;
}
.smeta-row__unit-price {
  color: #8c94b3;
}
.smeta-row__total {
  font-size: 13px;
  font-weight: 700;
  color: #0e1430;
  white-space: nowrap;
}

/* Footer */
.smeta-card__footer {
  background: #f8f9fc;
  border-top: 1px solid #e4e8f0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.smeta-card__download {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #2557e6;
  cursor: pointer;
  &:hover {
    opacity: 0.75;
  }
}

.smeta-card__total {
  font-size: 13px;
  color: #5a6284;
  strong {
    font-size: 16px;
    font-weight: 800;
    color: #0e1430;
  }
}

@media (max-width: 767px) {
  .smeta-wrap {
    grid-template-columns: 1fr;
    padding: 32px 24px;
    gap: 32px;
  }
  .smeta-right {
    display: none;
  }
  .smeta-title {
    font-size: 24px;
  }
  .smeta-features {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .smeta-wrap {
    grid-template-columns: 1fr;
    padding: 40px 36px;
    gap: 32px;
  }
  .smeta-right {
    display: none;
  }
}
</style>
