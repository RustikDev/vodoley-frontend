<template>
  <q-btn
    v-bind="computedProps"
    :label="label"
    :icon="icon"
    :icon-right="iconRight"
    :loading="loading"
    :disable="disable"
    :to="to"
    :href="href"
    :type="type"
    no-caps
    class="vds-btn"
    :class="`vds-btn--${variant}`"
  ><slot /></q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
type BtnSize = 'sm' | 'md' | 'lg';

const props = withDefaults(defineProps<{
  variant?: Variant;
  size?: BtnSize;
  icon?: string;
  iconRight?: string;
  label?: string;
  loading?: boolean;
  disable?: boolean;
  round?: boolean;
  to?: RouteLocationRaw;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  color?: string;
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
});

const VARIANT_PROPS: Record<Variant, Record<string, unknown>> = {
  'primary':      { unelevated: true,  color: 'primary'  },
  'secondary':    { outline: true,     color: 'primary'  },
  'ghost':        { flat: true                           },
  'danger':       { unelevated: true,  color: 'negative' },
  'danger-ghost': { flat: true,        color: 'negative' },
};

const SIZE_PROPS: Record<BtnSize, Record<string, unknown>> = {
  sm: { size: 'sm', dense: true },
  md: {},
  lg: { size: 'lg' },
};

const computedProps = computed(() => {
  const base = { ...VARIANT_PROPS[props.variant], ...SIZE_PROPS[props.size] };
  if (props.color) base.color = props.color;
  const iconOnly = !!props.icon && !props.label;
  base.round = props.round ?? iconOnly;
  return base;
});
</script>

<style scoped>
.vds-btn {
  font-weight: 600;
  border-radius: 10px;
  letter-spacing: 0;
}
.vds-btn--secondary {
  border-width: 1.5px !important;
}
.vds-btn--ghost {
  color: #344066;
}
</style>
