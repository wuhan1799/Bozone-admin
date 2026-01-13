<script setup lang="ts">
import { computed } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { useOp1a23e1e7f8a8fb791561ec987c7dc9d6 } from '@/api/generated/admin/admin';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'AvatarUploadDrawer' });

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

const drawerVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});

const uploadAvatarMutation = useOp1a23e1e7f8a8fb791561ec987c7dc9d6({
  mutation: {
    onSuccess: (data: any) => {
      if (data?.url) {
        const resolvedUrl = resolveAvatarUrl(data.url);
        // 更新 authStore 中的头像
        authStore.userInfo.avatar = resolvedUrl;
        window.$message?.success('头像上传成功');
        drawerVisible.value = false;
        emit('success');
      }
    },
    onError: (error: any) => {
      window.$message?.error(error?.message || '上传失败');
    }
  }
});

function resolveAvatarUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_SERVICE_BASE_URL}${url}`;
}

function customHttpRequest(options: any) {
  const { file } = options;
  return uploadAvatarMutation.mutateAsync({ data: { file } as any });
}

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    window.$message?.error('只能上传图片文件！');
    return false;
  }
  if (!isLt2M) {
    window.$message?.error('图片大小不能超过 2MB！');
    return false;
  }
  return true;
}
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="$t('page.user.center.uploadAvatar')" size="400px" destroy-on-close>
    <div class="avatar-upload-container">
      <div class="current-avatar">
        <div class="avatar-wrapper">
          <img v-if="authStore.userInfo.avatar" :src="authStore.userInfo.avatar" class="avatar" />
          <div v-else class="avatar-placeholder">
            <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M512 512m-208 0a208 208 0 1 0 416 0 208 208 0 1 0-416 0Z" fill="#E5E7EB" fill-opacity="0.5" />
              <path
                d="M512 928c-229.76 0-416-186.24-416-416s186.24-416 416-416 416 186.24 416 416-186.24 416-416 416z m0-768c-194.4 0-352 157.6-352 352s157.6 352 352 352 352-157.6 352-352-157.6-352-352-352z"
                fill="#9CA3AF"
              />
              <path
                d="M512 512a128 128 0 1 1 0-256 128 128 0 0 1 0 256z m0-192a64 64 0 1 0 0 128 64 64 0 0 0 0-128z"
                fill="#9CA3AF"
              />
              <path
                d="M724.16 732.16a32 32 0 0 0-45.12-5.76 160 160 0 0 1-167.04 0 32 32 0 0 0-45.12 5.76 224 224 0 0 0 257.28 0z"
                fill="#9CA3AF"
              />
            </svg>
          </div>
        </div>
        <p class="avatar-label">当前头像</p>
      </div>

      <div class="upload-section">
        <p class="upload-tips">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
        <ElUpload
          class="avatar-uploader"
          :show-file-list="false"
          :http-request="customHttpRequest"
          :before-upload="beforeUpload"
          accept="image/jpeg,image/png"
        >
          <ElButton type="primary" :loading="uploadAvatarMutation.isPending.value">
            <Plus />
            上传新头像
          </ElButton>
        </ElUpload>
      </div>
    </div>
  </ElDrawer>
</template>

<style scoped>
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.current-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.avatar-wrapper {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--el-border-color);
  background-color: var(--el-fill-color-light);
  margin-bottom: 16px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
}

.avatar-placeholder .icon {
  width: 64px;
  height: 64px;
}

.avatar-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.upload-section {
  text-align: center;
  width: 100%;
  padding: 0 40px;
}

.upload-tips {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}
</style>
