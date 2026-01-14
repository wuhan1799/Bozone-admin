<script setup lang="ts">
import { computed, ref } from 'vue';
import { REG_EMAIL } from '@/constants/reg';
import { Op331d0cc4dbe99449d67d209c0de4264b, Op8c8bacf6f81bff1dcdff8224cab42b0c } from '@/api/generated/email/email';
import { useRouterPush } from '@/hooks/common/router';
import { useForm, useFormRules } from '@/hooks/common/form';
import { useCaptcha } from '@/hooks/business/captcha';
import { $t } from '@/locales';

defineOptions({ name: 'ResetPwd' });

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useForm();
const { label, isCounting, loading } = useCaptcha();

interface FormModel {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

const model = ref<FormModel>({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
});

type RuleRecord = Partial<Record<keyof FormModel, App.Global.FormRule[]>>;

const rules = computed<RuleRecord>(() => {
  const { formRules, createConfirmPwdRule } = useFormRules();

  return {
    email: formRules.email,
    password: formRules.pwd,
    confirmPassword: createConfirmPwdRule(model.value.password)
  };
});

async function handleGetCode() {
  const email = model.value.email;

  if (!email.trim()) {
    window.$message?.error($t('form.email.required'));
    return;
  }

  if (!REG_EMAIL.test(email)) {
    window.$message?.error($t('form.email.invalid'));
    return;
  }

  try {
    const result = await Op331d0cc4dbe99449d67d209c0de4264b({ email });
    window.$message?.success(result.message);
    useCaptcha().start();
  } catch {}
}

async function handleSubmit() {
  await validate();
  try {
    const result = await Op8c8bacf6f81bff1dcdff8224cab42b0c({
      email: model.value.email,
      code: model.value.code,
      newPassword: model.value.password
    });
    window.$message?.success(result.message);
  } catch {}
}
</script>

<template>
  <ElForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <ElFormItem prop="email">
      <ElInput v-model="model.email" :placeholder="$t('page.login.common.emailPlaceholder')" />
    </ElFormItem>
    <ElFormItem prop="code">
      <div class="w-full flex gap-12px">
        <ElInput v-model="model.code" :placeholder="$t('page.login.common.codePlaceholder')" />
        <ElButton :disabled="isCounting" :loading="loading" @click="handleGetCode">
          {{ label }}
        </ElButton>
      </div>
    </ElFormItem>
    <ElFormItem prop="password">
      <ElInput
        v-model="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </ElFormItem>
    <ElFormItem prop="confirmPassword">
      <ElInput
        v-model="model.confirmPassword"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.confirmPasswordPlaceholder')"
      />
    </ElFormItem>
    <ElSpace direction="vertical" fill :size="18" class="w-full">
      <ElButton type="primary" size="large" round @click="handleSubmit">
        {{ $t('common.confirm') }}
      </ElButton>
      <ElButton size="large" round @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </ElButton>
    </ElSpace>
  </ElForm>
</template>

<style scoped></style>
