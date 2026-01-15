<script setup lang="ts">
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';

defineOptions({ name: 'ConfigOperation' });

const themeStore = useThemeStore();

function handleReset() {
  themeStore.resetStore();

  setTimeout(() => {
    window.$message?.success($t('theme.configOperation.resetSuccessMsg'));
  }, 50);
}
</script>

<template>
  <div class="w-full flex justify-end">
    <ElButton type="danger" plain @click="handleReset">{{ $t('theme.configOperation.resetConfig') }}</ElButton>
  </div>
</template>

<style scoped></style>
