<!-- eslint-disable no-console -->
<!-- eslint-disable no-warning-comments -->
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { userGenderOptions } from '@/constants/business';
import { dd96e80426ed79d2d5e742eaeff442f0, useOp6d91d776e12e7eb2a5bd798356f92e8d } from '@/api/generated/admin/admin';
import type { Op6d91d776e12e7eb2a5bd798356f92e8dBody } from '@/api/generated/index.schemas';
import { useAuthStore } from '@/store/modules/auth';
import { useThemeStore } from '@/store/modules/theme';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'ProfileDrawer' });

interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const authStore = useAuthStore();
const themeStore = useThemeStore();
const { formRef, validate, restoreValidation } = useForm();
const { patternRules } = useFormRules();

const drawerVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value)
});

const model = ref({
  nickname: '',
  gender: undefined as string | undefined,
  phone: '',
  email: '',
  realName: ''
});

// 更新个人信息 API
const updateProfileMutation = useOp6d91d776e12e7eb2a5bd798356f92e8d({
  mutation: {
    onSuccess: async () => {
      // 先使用表单数据乐观更新
      authStore.userInfo.nickName = model.value.nickname;
      authStore.userInfo.userGender = model.value.gender !== undefined ? Number(model.value.gender) : undefined;
      authStore.userInfo.userEmail = model.value.email;
      authStore.userInfo.userPhone = model.value.phone;

      // 等待 Vue 更新完成
      await nextTick();

      // 然后从后端获取最新用户信息
      try {
        const response = await dd96e80426ed79d2d5e742eaeff442f0();
        if (response.data) {
          const {
            userId,
            userName,
            nickname,
            realName,
            gender,
            userEmail,
            userPhone,
            avatar,
            deptId,
            deptName,
            status,
            createdAt
          } = response.data;
          // 更新本地store
          let avatarUrl = '';
          if (avatar) {
            avatarUrl = avatar.startsWith('http') ? avatar : `${import.meta.env.VITE_SERVICE_BASE_URL}${avatar}`;
          }
          Object.assign(authStore.userInfo, {
            userId: userId || '',
            userName: userName || '',
            userEmail: userEmail || '',
            userPhone: userPhone || '',
            avatar: avatarUrl,
            deptId: deptId || '',
            deptName: deptName || '',
            status,
            createdAt: createdAt || '',
            nickName: nickname || '',
            realName: realName || '',
            userGender: gender !== undefined && gender !== '' ? Number(gender) : undefined
          });

          // 等待 Vue 更新完成
          await nextTick();
        }
      } catch (error) {
        console.error('获取最新用户信息失败:', error);
        // 获取失败不影响用户体验，因为已经做了乐观更新
      }

      window.$message?.success($t('common.updateSuccess'));

      drawerVisible.value = false;
      emit('success');
    },
    onError: (error: any) => {
      window.$message?.error(error?.message || '更新失败');
    }
  }
});

type RuleKey = Extract<keyof typeof model.value, 'nickname' | 'phone' | 'email'>;

const rules = computed(() => {
  return {
    nickname: [
      {
        required: false,
        trigger: 'blur',
        validator: (_rule: any, value: any, callback: any) => {
          if (value && value.length > 50) {
            callback(new Error('昵称不能超过50个字符'));
          } else {
            callback();
          }
        }
      }
    ] as any,
    phone: patternRules.phone,
    email: patternRules.email
  };
}) as unknown as Record<RuleKey, App.Global.FormRule>;

function loadUserData() {
  model.value = {
    nickname: authStore.userInfo.nickName || '',
    gender: authStore.userInfo.userGender !== undefined ? String(authStore.userInfo.userGender) : undefined,
    phone: authStore.userInfo.userPhone || '',
    email: authStore.userInfo.userEmail || '',
    realName: authStore.userInfo.userName || ''
  };
}

async function handleSave() {
  try {
    await validate();

    // 调用后端API保存用户信息
    const updateData: Op6d91d776e12e7eb2a5bd798356f92e8dBody = {
      nickname: model.value.nickname || undefined,
      gender: model.value.gender,
      userEmail: model.value.email || undefined,
      userPhone: model.value.phone || undefined
    };

    await updateProfileMutation.mutateAsync({ data: updateData });
  } catch (error) {
    console.error('Save profile failed:', error);
  }
}

watch(
  () => props.visible,
  val => {
    if (val) {
      loadUserData();
    } else {
      restoreValidation();
    }
  }
);
</script>

<template>
  <ElDrawer
    v-model="drawerVisible"
    :title="$t('page.user.center.profile')"
    size="500px"
    destroy-on-close
    :class="{ 'dark-drawer': themeStore.darkMode }"
  >
    <ElForm ref="formRef" :model="model" :rules="rules" label-width="100px" label-position="right">
      <ElFormItem :label="$t('page.user.center.username')">
        <ElInput v-model="model.realName" disabled />
      </ElFormItem>
      <ElFormItem :label="$t('page.user.center.nickname')" prop="nickname">
        <ElInput v-model="model.nickname" :placeholder="$t('page.user.center.form.nickname')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.user.center.gender')" prop="gender">
        <ElSelect v-model="model.gender" clearable :placeholder="$t('page.user.center.form.gender')">
          <ElOption v-for="item in userGenderOptions" :key="item.value" :label="$t(item.label)" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('page.user.center.phone')" prop="phone">
        <ElInput v-model="model.phone" :placeholder="$t('page.user.center.form.phone')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.user.center.email')" prop="email">
        <ElInput v-model="model.email" :placeholder="$t('page.user.center.form.email')" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="flex justify-end gap-12px">
        <ElButton :loading="updateProfileMutation.isPending.value" @click="drawerVisible = false">
          {{ $t('common.cancel') }}
        </ElButton>
        <ElButton type="primary" :loading="updateProfileMutation.isPending.value" @click="handleSave">
          {{ $t('common.save') }}
        </ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<style scoped>
/* 暗色模式适配 */
:deep(.dark-drawer) {
  .el-drawer__body {
    background-color: var(--el-bg-color-page);
    color: var(--el-text-color-primary);
  }

  .el-form-item__label {
    color: var(--el-text-color-regular);
  }

  .el-input__wrapper {
    background-color: var(--el-fill-color-blank);
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
  }

  .el-input__inner {
    color: var(--el-text-color-primary);
  }

  .el-select .el-input.is-focus .el-input__wrapper {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }
}
</style>
