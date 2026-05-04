<template>
  <q-page class="vds-auth-page">
    <div class="vds-container">
      <div class="vds-auth-wrap">
                      <div class="col-auto text-center">
                <q-avatar class="vds-logo">
                  <q-img :src="vodoleyLogo" fit="contain" />
                </q-avatar>
              </div>
        <q-card class="vds-auth-card" flat bordered>
          <q-card-section class="vds-auth-head">
            <div class="row items-center q-col-gutter-md no-wrap">

              <div class="col text-center">
                <div class="text-h6 text-weight-bold">Админ-панель</div>
                <div class="text-body2 text-grey-7">Войдите, чтобы управлять каталогом</div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="vds-auth-body">
            <q-form @submit.prevent="onSubmit" class="q-gutter-md">
              <q-input
                v-model.trim="email"
                outlined
                label="Email"
                type="email"
                autocomplete="username"
                :disable="loading"
              />
              <q-input
                v-model="password"
                outlined
                label="Пароль"
                type="password"
                autocomplete="current-password"
                :disable="loading"
              />

              <div class="vds-auth-actions">
                <q-btn
                  class="full-width"
                  color="primary"
                  unelevated
                  type="submit"
                  label="Войти"
                  :loading="loading"
                />

                <q-btn
                  class="full-width"
                  color="primary"
                  outline
                  no-caps
                  to="/catalog"
                  label="Перейти в каталог"
                />
              </div>

              <q-banner class="vds-auth-note" rounded>
                <div class="text-caption text-center">
                  Доступ только для сотрудников. Если вы покупатель — вернитесь в каталог.
                </div>
              </q-banner>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from 'src/api/useApi';
import { useAuthStore } from 'src/stores/auth';
import vodoleyLogo from 'src/assets/vodoley-logo.svg';

const api = useApi();
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const loading = ref(false);

async function onSubmit() {
  loading.value = true;
  try {
    await auth.login({ email: email.value, password: password.value }, api);
    Notify.create({ type: 'positive', message: 'Успешный вход' });

    const next = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin';
    await router.replace(next);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Ошибка входа';
    Notify.create({ type: 'negative', message: msg });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.vds-auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 24px 0;
  background:
    radial-gradient(1000px 500px at 20% 10%, rgba(47, 128, 237, 0.18), transparent 60%),
    radial-gradient(900px 500px at 80% 90%, rgba(27, 102, 214, 0.14), transparent 60%),
    linear-gradient(180deg, rgba(11, 43, 91, 0.06), rgba(11, 43, 91, 0));
}

.vds-auth-wrap {
  max-width: 460px;
  margin: 0 auto;
  width: 100%;
}

.vds-auth-card {
  border-radius: 18px;
  border-color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 60px rgba(11, 43, 91, 0.14);
}

.vds-auth-head {
  padding: 18px 18px 14px;
}

.vds-auth-body {
  padding: 18px;
}

.vds-auth-actions {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.vds-auth-note {
  margin-top: 10px;
  background: rgba(47, 128, 237, 0.08);
  color: #0b2b5b;
}

.vds-logo{
  width: 256px;
  height: 80px;
  border-radius: 0;
  margin: 0 auto;
  margin-bottom: 24px;
}
</style>
