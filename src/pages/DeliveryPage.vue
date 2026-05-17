<template>
  <q-page class="q-py-lg">
    <div class="vds-container">

      <!-- Hero -->
      <div class="dlv-hero vds-card">
        <div class="dlv-hero__icon">
          <q-icon name="local_shipping" size="40px" color="white" />
        </div>
        <div>
          <div class="dlv-hero__title">Доставка и самовывоз</div>
          <div class="dlv-hero__sub">Доставляем по Бахчисараю и Крыму. Самовывоз из 3 магазинов бесплатно.</div>
        </div>
      </div>

      <!-- Methods -->
      <div class="row q-col-gutter-md q-mt-md">

        <div class="col-12 col-md-4">
          <div class="vds-card dlv-method-card">
            <div class="dlv-method-card__icon dlv-method-card__icon--green">
              <q-icon name="store" size="26px" />
            </div>
            <div class="dlv-method-card__title">Самовывоз</div>
            <div class="dlv-method-card__price">Бесплатно</div>
            <div class="dlv-method-card__desc">
              Забирайте заказ из любого из 3 наших магазинов в Бахчисарае. Товар будет готов к выдаче в день заказа при наличии на складе.
            </div>
            <div class="dlv-method-card__tags">
              <span class="dlv-tag dlv-tag--green">0 ₽</span>
              <span class="dlv-tag">В день заказа</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="vds-card dlv-method-card">
            <div class="dlv-method-card__icon dlv-method-card__icon--blue">
              <q-icon name="local_shipping" size="26px" />
            </div>
            <div class="dlv-method-card__title">Курьерская доставка</div>
            <div class="dlv-method-card__price">от 300 ₽</div>
            <div class="dlv-method-card__desc">
              Доставляем по Бахчисараю и ближайшим сёлам. Товар привезёт наш курьер в удобное для вас время.
            </div>
            <div class="dlv-method-card__tags">
              <span class="dlv-tag dlv-tag--blue">от 300 ₽</span>
              <span class="dlv-tag">1–2 часа</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="vds-card dlv-method-card">
            <div class="dlv-method-card__icon dlv-method-card__icon--orange">
              <q-icon name="conveyor_belt" size="26px" />
            </div>
            <div class="dlv-method-card__title">Транспортная компания</div>
            <div class="dlv-method-card__price">По тарифу ТК</div>
            <div class="dlv-method-card__desc">
              Отправляем грузы по всему Крыму через транспортные компании. Стоимость рассчитывается по весу и габаритам.
            </div>
            <div class="dlv-method-card__tags">
              <span class="dlv-tag dlv-tag--orange">По тарифу</span>
              <span class="dlv-tag">1–3 дня</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Details grid -->
      <div class="row q-col-gutter-md q-mt-md">

        <!-- Zones -->
        <div class="col-12 col-md-7">
          <div class="vds-card q-pa-md">
            <div class="dlv-section-head">
              <q-icon name="map" size="20px" color="primary" />
              <span>Зоны доставки</span>
            </div>

            <q-list separator>
              <q-item v-for="zone in zones" :key="zone.name" class="q-px-none">
                <q-item-section avatar>
                  <div class="dlv-zone-dot" :style="{ background: zone.color }" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ zone.name }}</q-item-label>
                  <q-item-label caption>{{ zone.desc }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <span class="dlv-zone-price">{{ zone.price }}</span>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- FAQ -->
        <div class="col-12 col-md-5">
          <div class="vds-card q-pa-md">
            <div class="dlv-section-head">
              <q-icon name="help_outline" size="20px" color="primary" />
              <span>Частые вопросы</span>
            </div>

            <q-expansion-item
              v-for="faq in faqs"
              :key="faq.q"
              :label="faq.q"
              dense
              class="dlv-faq-item"
              expand-icon-class="text-primary"
            >
              <div class="dlv-faq-answer">{{ faq.a }}</div>
            </q-expansion-item>
          </div>
        </div>

      </div>

      <!-- Pickup points -->
      <div class="vds-card q-pa-md q-mt-md">
        <div class="dlv-section-head">
          <q-icon name="place" size="20px" color="primary" />
          <span>Пункты самовывоза</span>
        </div>

        <div class="row q-col-gutter-md q-mt-sm">
          <div v-for="point in pickupPoints" :key="point.name" class="col-12 col-md-4">
            <div class="dlv-pickup">
              <div class="dlv-pickup__name">{{ point.name }}</div>
              <div class="dlv-pickup__address">
                <q-icon name="place" size="14px" class="q-mr-xs" />{{ point.address }}
              </div>
              <div class="dlv-pickup__hours">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />{{ point.hours }}
              </div>
              <a :href="`tel:${point.phone}`" class="dlv-pickup__phone vds-link">
                <q-icon name="call" size="14px" class="q-mr-xs" />{{ point.phoneDisplay }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="dlv-cta vds-card q-mt-md">
        <div class="dlv-cta__text">
          <div class="dlv-cta__title">Не знаете, как оформить доставку?</div>
          <div class="dlv-cta__sub">Позвоните нам — поможем выбрать удобный способ и рассчитаем стоимость.</div>
        </div>
        <a href="tel:+79781000000" class="dlv-cta__btn">
          <q-icon name="call" size="18px" />
          +7 (978) 100-00-00
        </a>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
const zones = [
  { name: 'Бахчисарай (город)',   desc: 'Доставка в пределах города',             price: 'от 300 ₽', color: '#2557e6' },
  { name: 'Пригород (до 10 км)',  desc: 'Сёла и посёлки в радиусе 10 км',         price: 'от 500 ₽', color: '#16a34a' },
  { name: 'Район (10–30 км)',     desc: 'Населённые пункты Бахчисарайского р-на',  price: 'от 800 ₽', color: '#f59e0b' },
  { name: 'Весь Крым (от 30 км)', desc: 'Доставка через транспортную компанию',    price: 'по тарифу', color: '#dc2626' },
];

const faqs = [
  {
    q: 'Можно ли получить товар в день заказа?',
    a: 'Да, при самовывозе и наличии товара на складе заказ готов к выдаче в течение 1–2 часов после оформления.',
  },
  {
    q: 'Как оплатить доставку?',
    a: 'Оплата при получении — наличными или картой.',
  },
  {
    q: 'Доставляете крупногабаритный товар?',
    a: 'Да, для крупногабаритных и тяжёлых грузов (трубы, листовые материалы, паллеты) используем грузовой транспорт. Уточняйте по телефону.',
  },
  {
    q: 'Что делать, если товар повреждён при доставке?',
    a: 'Зафиксируйте повреждение при курьере и свяжитесь с нами — обменяем или вернём деньги.',
  },
];

const pickupPoints = [
  {
    name: 'Магазин №1',
    address: 'ул. Музыкальный переулок, д. 2',
    hours: 'Пн–Вс 08:00–18:00',
    phone: '+79781000000',
    phoneDisplay: '+7 (978) 100-00-00',
  },
  {
    name: 'Магазин №2',
    address: 'ул. Новогородская, д. 1',
    hours: 'Пн–Вс 08:00–18:00',
    phone: '+79781000000',
    phoneDisplay: '+7 (978) 100-00-00',
  },
  {
    name: 'Магазин №3',
    address: 'ул. Фрунзе, д. 26',
    hours: 'Пн–Вс 08:00–18:00',
    phone: '+79781000000',
    phoneDisplay: '+7 (978) 100-00-00',
  },
];
</script>

<style scoped lang="scss">
/* Hero */
.dlv-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #2557e6 0%, #1a45c9 100%);
  border: none;

  &__icon {
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.3px;
  }

  &__sub {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 4px;
  }
}

/* Method cards */
.dlv-method-card {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;

    &--green  { background: #dcfce7; color: #16a34a; }
    &--blue   { background: #dce6ff; color: #2557e6; }
    &--orange { background: #fef3c7; color: #d97706; }
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--vds-color-ink);
  }

  &__price {
    font-size: 20px;
    font-weight: 800;
    color: var(--vds-color-primary);
  }

  &__desc {
    font-size: 13.5px;
    color: var(--vds-color-ink-3);
    line-height: 1.6;
    flex: 1;
  }

  &__tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
}

/* Tags */
.dlv-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: var(--vds-color-bg);
  color: var(--vds-color-ink-3);
  border: 1px solid var(--vds-color-border);

  &--green  { background: #dcfce7; color: #16a34a; border-color: #bbf7d0; }
  &--blue   { background: #dce6ff; color: #2557e6; border-color: #bfcfff; }
  &--orange { background: #fef3c7; color: #d97706; border-color: #fde68a; }
}

/* Section head */
.dlv-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--vds-color-ink);
  margin-bottom: 12px;
}

/* Zone dot */
.dlv-zone-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dlv-zone-price {
  font-size: 13px;
  font-weight: 700;
  color: var(--vds-color-ink-2);
  white-space: nowrap;
}

/* FAQ */
.dlv-faq-item {
  border-bottom: 1px solid var(--vds-color-border);

  &:last-child { border-bottom: none; }
}

.dlv-faq-answer {
  padding: 0 16px 12px;
  font-size: 13.5px;
  color: var(--vds-color-ink-3);
  line-height: 1.6;
}

/* Pickup points */
.dlv-pickup {
  padding: 16px;
  border: 1px solid var(--vds-color-border);
  border-radius: var(--vds-radius-md);
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__name {
    font-size: 15px;
    font-weight: 700;
    color: var(--vds-color-ink);
  }

  &__address,
  &__hours,
  &__phone {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: var(--vds-color-ink-3);
  }

  &__phone { color: var(--vds-color-primary); }
}

/* CTA */
.dlv-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  background: var(--vds-color-primary-light);
  border-color: var(--vds-color-primary-100);

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--vds-color-ink);
  }

  &__sub {
    font-size: 13.5px;
    color: var(--vds-color-ink-3);
    margin-top: 4px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--vds-color-primary);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    border-radius: var(--vds-radius-sm);
    white-space: nowrap;
    text-decoration: none;
    transition: background 0.15s;
    flex-shrink: 0;

    &:hover { background: var(--vds-color-primary-dark); }
  }
}

@media (max-width: 767px) {
  .dlv-hero { flex-direction: column; align-items: flex-start; padding: 20px; }
  .dlv-cta  { flex-direction: column; align-items: flex-start; padding: 20px; }
  .dlv-cta__btn { width: 100%; justify-content: center; }
}
</style>
