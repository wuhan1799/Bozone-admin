<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { loginModuleRecord } from '@/constants/app';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import { getImageCaptcha } from '@/service-alova/api/auth';

defineOptions({ name: 'PwdLogin' });

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useForm();

interface FormModel {
  userName: string;
  password: string;
  imgCode: string;
}

const model = ref<FormModel>({
  userName: '',
  password: '',
  imgCode: ''
});

const captchaUrl = ref('');
const captchaLoading = ref(false);

async function loadCaptcha() {
  captchaLoading.value = true;
  try {
    const blob = await getImageCaptcha();
    const url = URL.createObjectURL(blob);
    captchaUrl.value = url;
  } catch {
    window.$message?.error?.('加载验证码失败');
  } finally {
    captchaLoading.value = false;
  }
}

function refreshCaptcha() {
  if (captchaUrl.value) {
    URL.revokeObjectURL(captchaUrl.value);
  }
  loadCaptcha();
}

onMounted(() => {
  loadCaptcha();
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();

  return {
    userName: formRules.userName,
    password: formRules.pwd,
    imgCode: [{ required: true, message: $t('page.login.pwdLogin.imgCodePlaceholder') }]
  };
});

async function handleSubmit() {
  await validate();
  await authStore.login(model.value.userName, model.value.password, model.value.imgCode);
}
</script>

<template>
  <ElForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <ElFormItem prop="userName">
      <ElInput v-model="model.userName" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </ElFormItem>
    <ElFormItem prop="password">
      <ElInput
        v-model="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </ElFormItem>
    <ElFormItem prop="imgCode">
      <div class="w-full flex gap-12px">
        <ElInput v-model="model.imgCode" :placeholder="$t('page.login.pwdLogin.imgCodePlaceholder')" />
        <div class="captcha-img-wrapper" @click="refreshCaptcha">
          <ElImage v-if="captchaUrl" :src="captchaUrl" fit="cover" :lazy="false" class="captcha-img">
            <template #error>
              <div class="image-error">
                <span>{{ captchaLoading ? '加载中...' : '点击刷新' }}</span>
              </div>
            </template>
          </ElImage>
          <div v-else class="image-error">
            <span>{{ captchaLoading ? '加载中...' : '点击刷新' }}</span>
          </div>
        </div>
      </div>
    </ElFormItem>
    <ElSpace direction="vertical" :size="24" class="w-full" fill>
      <div class="flex-y-center justify-between">
        <ElCheckbox>{{ $t('page.login.pwdLogin.rememberMe') }}</ElCheckbox>
        <ElButton text @click="toggleLoginModule('reset-pwd')">
          {{ $t('page.login.pwdLogin.forgetPassword') }}
        </ElButton>
      </div>
      <ElButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </ElButton>
      <div class="hidden flex-y-center justify-between gap-12px">
        <ElButton class="flex-1" size="default" @click="toggleLoginModule('code-login')">
          {{ $t(loginModuleRecord['code-login']) }}
        </ElButton>
        <ElButton class="flex-1" size="default" @click="toggleLoginModule('register')">
          {{ $t(loginModuleRecord.register) }}
        </ElButton>
      </div>
    </ElSpace>
  </ElForm>
</template>

<style scoped>
.captcha-img-wrapper {
  width: 100px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.captcha-img {
  width: 100%;
  height: 100%;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
  background-color: #f5f7fa;
}
</style>

<style scoped>
.hidden {
  display: none;
}
</style>
