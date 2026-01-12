<!-- eslint-disable no-console -->
<!-- eslint-disable no-warning-comments -->
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useForm, useFormRules } from '@/hooks/common/form';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';

defineOptions({ name: 'PasswordForm' });

const authStore = useAuthStore();
const { toLogin } = useRouterPush();
const { formRef, validate, restoreValidation } = useForm();
const { patternRules, createConfirmPwdRule } = useFormRules();

const model = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const rules = {
  oldPassword: [patternRules.pwd],
  newPassword: [patternRules.pwd],
  confirmPassword: createConfirmPwdRule(model.value.newPassword)
};

async function handleChangePassword() {
  try {
    await validate();

    // TODO: 调用后端API修改密码
    // await fetchChangePassword(model.value);

    window.$message?.success($t('page.user.center.passwordChangeSuccess'));

    // 清空表单
    restoreValidation();

    // 重新登录
    setTimeout(async () => {
      await authStore.resetStore(false);
      toLogin();
    }, 1000);
  } catch (error) {
    console.error('Change password failed:', error);
  }
}
</script>

<template>
  <div class="password-form mx-auto max-w-600px">
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

      <div class="mt-24px text-center">
        <ElButton type="primary" @click="handleChangePassword">
          {{ $t('page.user.center.changePassword') }}
        </ElButton>
        <ElButton @click="restoreValidation">
          {{ $t('common.reset') }}
        </ElButton>
      </div>
    </ElForm>
  </div>
</template>

<style scoped></style>
