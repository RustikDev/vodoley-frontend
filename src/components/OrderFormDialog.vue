<template>
  <q-dialog :model-value="modelValue" @update:model-value="onClose" persistent>
    <q-card class="order-dialog">

      <q-card-section class="order-dialog__header">
        <div class="order-dialog__title">
          <q-icon name="receipt_long" size="22px" color="primary" class="q-mr-sm" />
          Оформить заказ
        </div>
        <VdsBtn variant="ghost" icon="close" :disable="loading" @click="onClose(false)" />
      </q-card-section>

      <q-separator />

      <!-- Items -->
      <q-card-section class="q-pb-sm">
        <div class="order-section-label">
          Ваш заказ
          <span class="order-section-label__count">{{ store.items.length }} позиц.</span>
        </div>

        <q-markup-table dense flat class="order-items-table">
          <thead>
            <tr>
              <th class="text-left">Название</th>
              <th class="text-right" style="width:70px">Кол-во</th>
              <th class="text-left" style="width:60px">Ед.</th>
              <th class="text-right" style="width:110px">Сумма</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in store.items" :key="it.productId">
              <td class="text-weight-medium">{{ it.name }}</td>
              <td class="text-right">{{ it.quantity }}</td>
              <td>{{ it.unit }}</td>
              <td class="text-right">{{ formatPriceRub(it.price * it.quantity) }}</td>
            </tr>
          </tbody>
        </q-markup-table>

        <div class="order-total">
          Итого: <strong>{{ formatPriceRub(store.total) }}</strong>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Contact form -->
      <q-card-section class="q-pt-md">
        <div class="order-section-label q-mb-md">Контактные данные</div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.firstName"
              label="Имя"
              outlined
              dense
              :error="!!errors.firstName"
              :error-message="errors.firstName"
              @update:model-value="errors.firstName = ''"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.lastName"
              label="Фамилия"
              outlined
              dense
              :error="!!errors.lastName"
              :error-message="errors.lastName"
              @update:model-value="errors.lastName = ''"
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="form.phone"
              label="Номер телефона"
              outlined
              dense
              type="tel"
              prefix="+7"
              :error="!!errors.phone"
              :error-message="errors.phone"
              @update:model-value="errors.phone = ''"
            />
          </div>
        </div>

        <!-- Delivery toggle -->
        <div class="order-section-label q-mt-md q-mb-sm">Способ получения</div>
        <div class="order-delivery-toggle">
          <button
            class="order-delivery-btn"
            :class="{ 'order-delivery-btn--active': !form.delivery }"
            type="button"
            @click="form.delivery = false; errors.address = ''"
          >
            <q-icon name="store" size="18px" class="q-mr-xs" />
            Самовывоз
          </button>
          <button
            class="order-delivery-btn"
            :class="{ 'order-delivery-btn--active': form.delivery }"
            type="button"
            @click="form.delivery = true"
          >
            <q-icon name="local_shipping" size="18px" class="q-mr-xs" />
            Доставка
          </button>
        </div>

        <q-slide-transition>
          <div v-if="form.delivery" class="q-mt-sm">
            <q-input
              v-model="form.address"
              label="Адрес доставки"
              outlined
              dense
              :error="!!errors.address"
              :error-message="errors.address"
              @update:model-value="errors.address = ''"
            />
          </div>
        </q-slide-transition>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-sm q-pb-xs q-px-md">
        <q-checkbox
          v-model="form.consent"
          @update:model-value="errors.consent = ''"
        >
          <span class="order-consent-label">
            Оформляя заказ, я даю согласие на хранение и обработку персональных данных
          </span>
        </q-checkbox>
        <div v-if="errors.consent" class="order-consent-error">{{ errors.consent }}</div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md q-pt-xs">
        <VdsBtn variant="ghost" label="Отмена" :disable="loading" @click="onClose(false)" />
        <VdsBtn variant="primary" icon-right="send" label="Отправить заказ" :loading="loading" @click="submit" />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Notify } from 'quasar';
import VdsBtn from 'src/components/VdsBtn.vue';
import { useEstimateStore } from 'src/stores/estimate';
import { formatPriceRub } from 'src/utils/format';
import { useApi } from 'src/api/useApi';

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const api = useApi();
const store = useEstimateStore();
const loading = ref(false);

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  delivery: false,
  address: '',
  consent: false,
});

const errors = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  consent: '',
});

function validate(): boolean {
  errors.firstName = form.firstName.trim() ? '' : 'Введите имя';
  errors.lastName  = form.lastName.trim()  ? '' : 'Введите фамилию';
  errors.phone     = form.phone.trim()     ? '' : 'Введите номер телефона';
  errors.address   = (form.delivery && !form.address.trim()) ? 'Введите адрес доставки' : '';
  errors.consent   = form.consent ? '' : 'Необходимо дать согласие на обработку персональных данных';
  return !errors.firstName && !errors.lastName && !errors.phone && !errors.address && !errors.consent;
}

function onClose(v: boolean) {
  if (loading.value) return;
  emit('update:modelValue', v);
}

async function submit() {
  if (!validate()) return;
  loading.value = true;
  try {
    await api.submitOrder({
      firstName:   form.firstName.trim(),
      lastName:    form.lastName.trim(),
      phone:       form.phone.trim(),
      delivery:    form.delivery,
      address:     form.address.trim(),
      items: store.items.map((it) => ({
        productId: it.productId,
        name:     it.name,
        unit:     it.unit,
        quantity: it.quantity,
        price:    it.price,
        total:    it.price * it.quantity,
      })),
      totalAmount: store.total,
    });
    Notify.create({ type: 'positive', message: 'Заказ отправлен! Мы свяжемся с вами в ближайшее время.' });
    emit('update:modelValue', false);
  } catch {
    Notify.create({ type: 'negative', message: 'Не удалось отправить заказ. Позвоните нам по телефону.' });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.order-dialog {
  width: 600px;
  max-width: 100%;
}

.order-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.order-dialog__title {
  display: flex;
  align-items: center;
  font-size: 17px;
  font-weight: 700;
  color: var(--vds-color-ink);
}

.order-section-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--vds-color-ink-3);
  display: flex;
  align-items: center;
  gap: 8px;

  &__count {
    font-weight: 600;
    color: var(--vds-color-primary);
  }
}

.order-items-table {
  margin-top: 8px;
  border: 1px solid var(--vds-color-border);
  border-radius: var(--vds-radius-sm);
  overflow: hidden;
}

.order-total {
  text-align: right;
  margin-top: 10px;
  font-size: 15px;
  color: var(--vds-color-ink-2);

  strong {
    color: var(--vds-color-ink);
    font-size: 17px;
  }
}

.order-consent-label {
  font-size: 13px;
  color: var(--vds-color-ink-2);
  line-height: 1.4;
}

.order-consent-error {
  font-size: 12px;
  color: var(--q-negative);
  margin-top: 4px;
  margin-left: 36px;
}

/* Delivery toggle */
.order-delivery-toggle {
  display: flex;
  gap: 8px;
}

.order-delivery-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  border-radius: var(--vds-radius-sm);
  border: 1.5px solid var(--vds-color-border);
  background: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--vds-color-ink-3);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  &:hover:not(&--active) {
    border-color: var(--vds-color-primary);
    color: var(--vds-color-primary);
  }

  &--active {
    border-color: var(--vds-color-primary);
    background: var(--vds-color-primary-light);
    color: var(--vds-color-primary);
  }
}
</style>
