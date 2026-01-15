<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
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

// 根据当前时间动态计算问候语
const greeting = computed(() => {
  const hour = new Date().getHours();
  const userName = authStore.userInfo.realName;

  if (hour >= 5 && hour < 12) {
    return $t('page.home.greetingMorning', { userName });
  }
  if (hour >= 12 && hour < 14) {
    return $t('page.home.greetingNoon', { userName });
  }
  if (hour >= 14 && hour < 18) {
    return $t('page.home.greetingAfternoon', { userName });
  }
  if (hour >= 18 && hour < 23) {
    return $t('page.home.greetingEvening', { userName });
  }
  return $t('page.home.greetingNight', { userName });
});

// 当前日期和时间
const currentDateTime = ref('');
const timeUpdateTimer = ref<number | null>(null);

// 更新日期时间
const updateDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const day = days[now.getDay()];

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  currentDateTime.value = `${year}年${month}月${date}日 ${day} ${hours}:${minutes}:${seconds}`;
};

// 组件挂载时启动定时器
onMounted(() => {
  updateDateTime();
  timeUpdateTimer.value = window.setInterval(updateDateTime, 1000); // 每秒更新一次
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timeUpdateTimer.value) {
    clearInterval(timeUpdateTimer.value);
  }
});
</script>

<template>
  <ElCard class="card-wrapper">
    <ElRow :gutter="gap" class="px-8px">
      <ElCol :md="18" :sm="24">
        <div class="flex-y-center">
          <div class="size-72px shrink-0 overflow-hidden rd-1/2">
            <img v-if="avatarUrl" :src="avatarUrl" class="size-full" alt="用户头像" />
          </div>
          <div class="pl-12px">
            <h3 class="text-18px font-semibold">
              {{ greeting }}
            </h3>
            <p class="text-#999 leading-30px">{{ currentDateTime }}</p>
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
