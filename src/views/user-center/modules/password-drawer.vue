<!-- eslint-disable no-console -->
<!-- eslint-disable no-warning-comments -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useOp088c8b1984022f043150763386148f29 } from '@/api/generated/admin/admin';
import type { Op088c8b1984022f043150763386148f29Body } from '@/api/generated/index.schemas';
import { useAuthStore } from '@/store/modules/auth';
import { useThemeStore } from '@/store/modules/theme';
import { useForm, useFormRules } from '@/hooks/common/form';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';

defineOptions({ name: 'PasswordDrawer' });

interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const authStore = useAuthStore();
const themeStore = useThemeStore();
const { toLogin } = useRouterPush();
const { formRef, validate, restoreValidation } = useForm();
const { patternRules, createConfirmPwdRule } = useFormRules();

const drawerVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});

const model = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const rules = computed(() => ({
  oldPassword: [patternRules.pwd],
  newPassword: [patternRules.pwd],
  confirmPassword: createConfirmPwdRule(model.value.newPassword)
}));

// 修改密码 API
const changePasswordMutation = useOp088c8b1984022f043150763386148f29({
  mutation: {
    onSuccess: () => {
      window.$message?.success($t('page.user.center.passwordChangeSuccess'));

      // 清空表单
      restoreValidation();
      drawerVisible.value = false;

      // 重新登录
      setTimeout(async () => {
        await authStore.resetStore(false);
        toLogin();
      }, 1000);
    }
  }
});

async function handleChangePassword() {
  try {
    await validate();

    const passwordData: Op088c8b1984022f043150763386148f29Body = {
      oldPassword: model.value.oldPassword,
      newPassword: model.value.newPassword,
      confirmPassword: model.value.confirmPassword
    };

    await changePasswordMutation.mutateAsync({ data: passwordData });
  } catch (error) {
    // 只在开发环境输出到控制台，生产环境不暴露具体错误信息
    if (import.meta.env.DEV) {
      console.error('Change password failed:', error);
    }
  }
}
</script>

<template>
  <ElDrawer
    v-model="drawerVisible"
    :title="$t('page.user.center.security')"
    size="500px"
    destroy-on-close
    :class="{ 'dark-drawer': themeStore.darkMode }"
  >
    <ElForm ref="formRef" :model="model" :rules="rules" label-width="120px" label-position="right">
      <ElFormItem :label="$t('page.user.center.oldPassword')" prop="oldPassword">
        <ElInput
          v-model="model.oldPassword"
          type="password"
          show-password
          :placeholder="$t('page.user.center.form.oldPassword')"
        />
      </ElFormItem>
      <ElFormItem :label="$t('page.user.center.newPassword')" prop="newPassword">
        <ElInput
          v-model="model.newPassword"
          type="password"
          show-password
          :placeholder="$t('page.user.center.form.newPassword')"
        />
      </ElFormItem>
      <ElFormItem :label="$t('page.user.center.confirmPassword')" prop="confirmPassword">
        <ElInput
          v-model="model.confirmPassword"
          type="password"
          show-password
          :placeholder="$t('page.user.center.form.confirmPassword')"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="flex justify-end gap-12px">
        <ElButton :loading="changePasswordMutation.isPending.value" @click="drawerVisible = false">
          {{ $t('common.cancel') }}
        </ElButton>
        <ElButton type="primary" :loading="changePasswordMutation.isPending.value" @click="handleChangePassword">
          {{ $t('page.user.center.changePassword') }}
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

  .el-input__suffix-inner {
    color: var(--el-text-color-secondary);
  }
}
</style>
