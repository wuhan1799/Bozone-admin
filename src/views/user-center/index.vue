<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';
import ProfileForm from './modules/profile-form.vue';
import PasswordForm from './modules/password-form.vue';

defineOptions({ name: 'UserCenter' });

const authStore = useAuthStore();
const activeTab = ref('profile');
</script>

<template>
  <div class="user-center-container p-24px">
    <ElCard>
      <template #header>
        <div class="flex items-center gap-12px">
          <div class="flex items-center gap-12px">
            <div class="size-48px flex-center overflow-hidden rd-1/2 bg-gray-200">
              <img v-if="authStore.userInfo.avatar" :src="authStore.userInfo.avatar" class="size-full" />
              <SvgIcon v-else icon="ph:user-circle" class="text-40px text-gray-400" />
            </div>
            <div>
              <div class="text-18px font-bold">{{ authStore.userInfo.realName || authStore.userInfo.userName }}</div>
              <div class="text-14px text-gray-500">{{ $t('page.user.center.subtitle') }}</div>
            </div>
          </div>
        </div>
      </template>

      <ElTabs v-model="activeTab">
        <ElTabPane :label="$t('page.user.center.profile')" name="profile">
          <ProfileForm />
        </ElTabPane>
        <ElTabPane :label="$t('page.user.center.security')" name="security">
          <PasswordForm />
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<style scoped></style>
