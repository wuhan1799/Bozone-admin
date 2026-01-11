<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { loginModuleRecord } from '@/constants/app';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useForm, useFormRules } from '@/hooks/common/form';
import { getServiceBaseURL } from '@/utils/service';
import { localStg } from '@/utils/storage';
import { $t } from '@/locales';

defineOptions({ name: 'PwdLogin' });

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useForm();

interface FormModel {
  userName: string;
  password: string;
  captchaCode: string;
  rememberMe?: boolean;
}

const model = ref<FormModel>({
  userName: '',
  password: '',
  captchaCode: '',
  rememberMe: false
});

const captchaUrl = ref('');
const captchaKey = ref('');
const captchaLoading = ref(false);

async function loadCaptcha() {
  captchaLoading.value = true;
  try {
    const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
    const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

    const response = await fetch(`${baseURL}/auth/captcha`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    captchaKey.value = response.headers.get('X-Captcha-Key') || '';
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    captchaUrl.value = url;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load captcha:', error);
    window.$message?.error?.($t('page.login.pwdLogin.captchaLoadError'));
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
  // 从本地存储读取记住的用户名和记住我状态
  const rememberedUserName = localStg.get('rememberedUserName');
  const rememberMe = localStg.get('rememberMe');
  if (rememberedUserName) {
    model.value.userName = rememberedUserName;
    model.value.rememberMe = rememberMe === 'true';
  }
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();

  return {
    userName: formRules.userName,
    password: formRules.pwd,
    captchaCode: [{ required: true, message: $t('page.login.pwdLogin.imgCodePlaceholder') }],
    rememberMe: []
  };
});

async function handleSubmit() {
  await validate();
  // 根据"记住我"复选框保存或移除用户名和记住我状态
  if (model.value.rememberMe) {
    localStg.set('rememberedUserName', model.value.userName);
    localStg.set('rememberMe', 'true');
  } else {
    localStg.remove('rememberedUserName');
    localStg.remove('rememberMe');
  }
  try {
    await authStore.login(
      model.value.userName,
      model.value.password,
      model.value.captchaCode || '',
      captchaKey.value || '',
      model.value.rememberMe
    );
    // 登录成功，不需要刷新
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // 登录失败，刷新验证码
    refreshCaptcha();
    // 清空验证码输入框
    model.value.captchaCode = '';
  }
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
    <ElFormItem prop="captchaCode">
      <div class="w-full flex gap-12px">
        <ElInput v-model="model.captchaCode" :placeholder="$t('page.login.pwdLogin.imgCodePlaceholder')" />
        <div
          class="captcha-img-wrapper"
          role="button"
          tabindex="0"
          :aria-label="$t('page.login.pwdLogin.refreshCaptcha')"
          @click="refreshCaptcha"
          @keyup.enter="refreshCaptcha"
        >
          <ElImage v-if="captchaUrl" :src="captchaUrl" fit="contain" :lazy="false" class="captcha-img">
            <template #error>
              <div class="image-error">
                <span>{{ captchaLoading ? $t('common.loading') : $t('page.login.pwdLogin.refreshCaptcha') }}</span>
              </div>
            </template>
          </ElImage>
          <div v-else class="image-error">
            <span>{{ captchaLoading ? $t('common.loading') : $t('page.login.pwdLogin.refreshCaptcha') }}</span>
          </div>
        </div>
      </div>
    </ElFormItem>
    <ElSpace direction="vertical" :size="24" class="w-full" fill>
      <div class="flex-y-center justify-between">
        <ElCheckbox v-model="model.rememberMe">{{ $t('page.login.pwdLogin.rememberMe') }}</ElCheckbox>
        <ElButton text type="primary" @click="toggleLoginModule('reset-pwd')">
          {{ $t('page.login.pwdLogin.forgetPassword') }}
        </ElButton>
      </div>
      <ElButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </ElButton>
      <!-- TODO: 临时隐藏，后续需要移除 hidden 类 -->
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
  width: 160px;
  height: 40px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 背景色跟随主题系统自动变化 */
  background-color: rgb(var(--container-bg-color));
  padding: 2px;
  box-sizing: border-box;
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
  /* 错误提示文字和背景都跟随主题 */
  color: rgb(var(--base-text-color));
  background-color: rgb(var(--container-bg-color));
}
</style>

<style scoped>
.hidden {
  display: none;
}
</style>
