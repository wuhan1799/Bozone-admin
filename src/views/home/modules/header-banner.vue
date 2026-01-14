<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';

defineOptions({ name: 'HeaderBanner' });

const appStore = useAppStore();
const authStore = useAuthStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));

// 头像 URL 计算属性
const avatarUrl = computed(() => {
  const avatar = authStore.userInfo.avatar;
  if (!avatar) return ''; // 为空时返回空，模板显示默认头像
  if (avatar.startsWith('http')) {
    return avatar;
  }
  // 如果是相对路径，拼接后端基础 URL
  return `${import.meta.env.VITE_SERVICE_BASE_URL}${avatar}`;
});

interface StatisticData {
  id: number;
  title: string;
  value: number;
}

const statisticData = computed<StatisticData[]>(() => [
  { id: 0, title: $t('page.home.projectCount'), value: 25 },
  { id: 1, title: $t('page.home.todo'), value: 4, formatter: (val: number) => `${val}/${16}` },
  { id: 2, title: $t('page.home.message'), value: 12 }
]);
</script>

<template>
  <ElCard class="card-wrapper">
    <ElRow :gutter="gap" class="px-8px">
      <ElCol :md="18" :sm="24">
        <div class="flex-y-center">
          <div class="size-72px shrink-0 overflow-hidden rd-1/2">
            <img v-if="avatarUrl" :src="avatarUrl" class="size-full" alt="用户头像" />
            <img v-else src="@/assets/imgs/soybean.jpg" class="size-full" alt="默认头像" />
          </div>
          <div class="pl-12px">
            <h3 class="text-18px font-semibold">
              {{ $t('page.home.greeting', { userName: authStore.userInfo.userName }) }}
            </h3>
            <p class="text-#999 leading-30px">{{ $t('page.home.weatherDesc') }}</p>
          </div>
        </div>
      </ElCol>
      <ElCol :md="6" :sm="24">
        <ElSpace direction="horizontal" class="w-full justify-end" :size="24">
          <ElStatistic v-for="item in statisticData" :key="item.id" class="whitespace-nowrap" v-bind="item" />
        </ElSpace>
      </ElCol>
    </ElRow>
  </ElCard>
</template>

<style scoped></style>
