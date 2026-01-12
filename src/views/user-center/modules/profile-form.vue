<!-- eslint-disable no-console -->
<!-- eslint-disable no-warning-comments -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { userGenderOptions } from '@/constants/business';
import { useAuthStore } from '@/store/modules/auth';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'ProfileForm' });

const authStore = useAuthStore();
const { formRef, validate, restoreValidation } = useForm();
const { patternRules } = useFormRules();

const model = ref({
  nickname: '',
  gender: undefined as number | undefined,
  phone: '',
  email: '',
  avatar: '',
  realName: ''
});

type RuleKey = Extract<keyof typeof model.value, 'phone' | 'email'>;

const rules = computed<Record<RuleKey, App.Global.FormRule>>(() => {
  return {
    phone: patternRules.phone,
    email: patternRules.email
  };
});

function loadUserData() {
  model.value = {
    nickname: authStore.userInfo.nickName || '',
    gender: authStore.userInfo.userGender || undefined,
    phone: authStore.userInfo.userPhone || '',
    email: authStore.userInfo.userEmail || '',
    avatar: authStore.userInfo.avatar || '',
    realName: authStore.userInfo.userName || ''
  };
}

async function handleSave() {
  try {
    await validate();
    // TODO: 调用后端API保存用户信息
    // await fetchUpdateUserInfo(model.value);

    // 更新本地store
    authStore.userInfo.nickName = model.value.nickname;
    authStore.userInfo.userGender = model.value.gender;
    authStore.userInfo.userPhone = model.value.phone;
    authStore.userInfo.userEmail = model.value.email;
    authStore.userInfo.avatar = model.value.avatar;

    window.$message?.success($t('common.updateSuccess'));
  } catch (error) {
    console.error('Save profile failed:', error);
  }
}

function handleAvatarUpload(file: File) {
  // TODO: 实现头像上传
  console.log('Upload avatar:', file);
  model.value.avatar = URL.createObjectURL(file);
}

watch(
  () => authStore.isLogin,
  () => {
    if (authStore.isLogin) {
      loadUserData();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="profile-form">
    <ElForm ref="formRef" :model="model" :rules="rules" label-width="100px" label-position="right">
      <ElRow :gutter="24">
        <ElCol :span="12">
          <ElFormItem :label="$t('page.user.center.username')">
            <ElInput v-model="model.realName" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.user.center.nickname')" prop="nickname">
            <ElInput v-model="model.nickname" :placeholder="$t('page.user.center.form.nickname')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.user.center.gender')" prop="gender">
            <ElSelect v-model="model.gender" clearable :placeholder="$t('page.user.center.form.gender')">
              <ElOption
                v-for="item in userGenderOptions"
                :key="item.value"
                :label="$t(item.label)"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.user.center.phone')" prop="phone">
            <ElInput v-model="model.phone" :placeholder="$t('page.user.center.form.phone')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.user.center.email')" prop="email">
            <ElInput v-model="model.email" :placeholder="$t('page.user.center.form.email')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.user.center.avatar')">
            <ElUpload
              class="avatar-uploader"
              :show-file-list="false"
              :on-change="(file: any) => handleAvatarUpload(file.raw)"
              accept="image/*"
            >
              <img v-if="model.avatar" :src="model.avatar" class="avatar" />
              <ElIcon v-else class="avatar-uploader-icon"><Plus /></ElIcon>
            </ElUpload>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <div class="mt-24px text-center">
        <ElButton type="primary" @click="handleSave">
          {{ $t('common.save') }}
        </ElButton>
        <ElButton @click="restoreValidation">
          {{ $t('common.reset') }}
        </ElButton>
      </div>
    </ElForm>
  </div>
</template>

<style scoped>
.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
