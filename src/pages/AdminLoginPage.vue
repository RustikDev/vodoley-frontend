<template>
  <q-page class="q-pa-md vds-container" style="max-width: 420px; margin: 0 auto">
    <div class="text-h5 q-mb-md">Вход в админку</div>

    <q-form @submit.prevent="onSubmit" class="q-gutter-md">
      <q-input v-model.trim="email" outlined label="Email" type="email" autocomplete="username" />
      <q-input v-model="password" outlined label="Пароль" type="password" autocomplete="current-password" />

      <q-btn color="primary" type="submit" label="Войти" :loading="loading" />
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from 'src/api/useApi';
import { useAuthStore } from 'src/stores/auth';

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

