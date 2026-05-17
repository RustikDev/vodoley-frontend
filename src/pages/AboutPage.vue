<template>
  <q-page class="q-py-md">
    <div class="vds-container">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-7">
          <div class="vds-card q-pa-md">
            <div class="row items-center q-col-gutter-md">
              <div class="col-auto">
                <q-avatar size="128px" square class="bg-white">
                  <q-img :src="vodoleyLogo" fit="contain" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-h5 text-weight-bold">О компании «Водолей»</div>
                <div class="text-body2 text-grey-7">Строительный магазин и поставщик материалов и инструмента</div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="text-body1">
              «Водолей» — магазин для стройки и ремонта: инструмент, крепёж, расходники и сопутствующие товары.
              Поможем подобрать материалы под задачу, собрать смету и быстро отгрузить.
            </div>

            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">Телефон</div>
                <a class="vds-link" :href="`tel:${contacts.phone}`">{{ contacts.phoneDisplay }}</a>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">Email</div>
                <a class="vds-link" :href="`mailto:${contacts.email}`">{{ contacts.email }}</a>
              </div>
              <div class="col-12">
                <div class="text-caption text-grey-7">Режим работы</div>
                <div class="text-body2">{{ contacts.hours }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-5">
          <div class="vds-card q-pa-md">
            <div class="text-subtitle1 text-weight-bold">Наши магазины</div>
            <div class="text-caption text-grey-7">3 адреса</div>

            <q-tabs v-model="selected" dense class="q-mt-sm" indicator-color="primary" align="left" inline-label>
              <q-tab v-for="(s, idx) in stores" :key="s.id" :name="idx" :label="s.short" />
            </q-tabs>
            <q-separator class="q-mt-sm" />

            <div class="q-mt-md">
              <div class="text-body1 text-weight-medium">{{ activeStore.title }}</div>
              <div class="text-body2 text-grey-7">{{ activeStore.address }}</div>
              <div class="row q-col-gutter-sm q-mt-sm">
                <div class="col-12">
                  <a class="vds-link" :href="activeStore.mapLink" target="_blank" rel="noopener">Открыть на карте</a>
                </div>
              </div>

              <div class="q-mt-md vds-map">
                <iframe
                  :src="activeStore.embedUrl"
                  width="100%"
                  height="320"
                  style="border: 0; border-radius: 12px"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                />
              </div>

              <div class="q-mt-md">
                <q-list bordered class="rounded-borders">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="place" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Адрес</q-item-label>
                      <q-item-label caption>{{ activeStore.address }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="schedule" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Время</q-item-label>
                      <q-item-label caption>{{ activeStore.hours }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="call" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Телефон</q-item-label>
                      <q-item-label caption>
                        <a class="vds-link" :href="`tel:${activeStore.phone}`">{{ activeStore.phoneDisplay }}</a>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import vodoleyLogo from 'src/assets/vodoley-logo.svg';

type Store = {
  id: string;
  short: string;
  title: string;
  address: string;
  hours: string;
  phone: string;
  phoneDisplay: string;
  lat: number;
  lon: number;
};

const contacts = {
  phone: '+79780000000',
  phoneDisplay: '+7 (978) 000-00-00',
  email: 'info@vodoley.ru',
  hours: 'Ежедневно 08:00–18:00',
};

const stores = ref<Store[]>([
  {
    id: 'store-1',
    short: 'Магазин 1',
    title: 'Водолей — Магазин №1',
    address: 'г. Бахчисарай, ул. Музыкальный переулок, д. 2',
    hours: 'Пн–Вс 08:00–18:00',
    phone: contacts.phone,
    phoneDisplay: contacts.phoneDisplay,
    lat: 44.742692,
    lon: 33.846526,
  },
  {
    id: 'store-2',
    short: 'Магазин 2',
    title: 'Водолей — Магазин №2',
    address: 'г. Бахчисарай, ул. Новогородская, д. 1',
    hours: 'Пн–Вс 08:00–18:00',
    phone: contacts.phone,
    phoneDisplay: contacts.phoneDisplay,
    lat: 44.757787,
    lon: 33.855140,
  },
  {
    id: 'store-3',
    short: 'Магазин 3',
    title: 'Водолей — Магазин №3',
  address: 'г. Бахчисарай, ул. Фрунзе, д. 26',
    hours: 'Пн–Вс 08:00–18:00',
    phone: contacts.phone,
    phoneDisplay: contacts.phoneDisplay,
    lat: 44.748819,
    lon: 33.851215,
  },
]);

const selected = ref(0);

function osmEmbedUrl(lat: number, lon: number) {
  const delta = 0.01;
  const left = (lon - delta).toFixed(6);
  const right = (lon + delta).toFixed(6);
  const top = (lat + delta).toFixed(6);
  const bottom = (lat - delta).toFixed(6);

  const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`;
  const marker = `${lat.toFixed(6)}%2C${lon.toFixed(6)}`;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

function osmMapLink(lat: number, lon: number) {
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lon.toFixed(6)}#map=16/${lat.toFixed(6)}/${lon.toFixed(6)}`;
}

const activeStore = computed(() => {
  const s = (stores.value[selected.value] ?? stores.value[0]) as Store;
  return {
    ...s,
    embedUrl: osmEmbedUrl(s.lat, s.lon),
    mapLink: osmMapLink(s.lat, s.lon),
  };
});
</script>

<style scoped lang="scss">
.vds-map {
  overflow: hidden;
}
</style>
