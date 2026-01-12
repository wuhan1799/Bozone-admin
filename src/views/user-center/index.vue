<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import ProfileDrawer from './modules/profile-drawer.vue';
import PasswordDrawer from './modules/password-drawer.vue';

defineOptions({ name: 'UserCenter' });

const authStore = useAuthStore();
const themeStore = useThemeStore();
const profileDrawerVisible = ref(false);
const passwordDrawerVisible = ref(false);

function openProfileEdit() {
  profileDrawerVisible.value = true;
}

function openPasswordEdit() {
  passwordDrawerVisible.value = true;
}

function getGenderLabel() {
  if (authStore.userInfo.userGender === 1) return '男';
  if (authStore.userInfo.userGender === 2) return '女';
  return '未设置';
}
</script>

<template>
  <div class="user-center-container min-h-screen p-24px" :class="{ 'dark-theme': themeStore.darkMode }">
    <ElRow :gutter="24">
      <!-- 左侧用户信息卡片 -->
      <ElCol :xs="24" :sm="24" :md="8" :lg="6" class="mb-24px">
        <ElCard class="user-card" shadow="hover">
          <div class="user-card-bg">
            <div class="bg-linear-to-r h-150px from-primary to-primary/80"></div>
          </div>
          <div class="user-card-content">
            <div class="avatar-container">
              <div class="avatar-wrapper">
                <img v-if="authStore.userInfo.avatar" :src="authStore.userInfo.avatar" class="avatar" />
                <div v-else class="avatar-placeholder">
                  <SvgIcon icon="ph:user" class="text-48px text-white" />
                </div>
              </div>
              <ElButton class="avatar-edit" type="primary" size="small" circle>
                <SvgIcon icon="ph:camera" />
              </ElButton>
            </div>
            <div class="user-info">
              <div class="user-name text-20px text-color-primary font-bold">
                {{ authStore.userInfo.realName || authStore.userInfo.nickName || authStore.userInfo.userName }}
              </div>
              <div class="user-bio text-color-secondary mt-8px text-14px">
                {{ $t('page.user.center.subtitle') }}
              </div>
            </div>
            <div class="user-stats mt-20px">
              <div class="stats-item">
                <div class="stats-value text-24px text-primary font-bold">128</div>
                <div class="stats-label text-color-secondary text-12px">登录天数</div>
              </div>
              <div class="stats-divider"></div>
              <div class="stats-item">
                <div class="stats-value text-24px text-primary/80 font-bold">56</div>
                <div class="stats-label text-color-secondary text-12px">操作次数</div>
              </div>
            </div>
          </div>
        </ElCard>
      </ElCol>

      <!-- 右侧内容区 -->
      <ElCol :xs="24" :sm="24" :md="16" :lg="18">
        <div class="content-wrapper">
          <!-- 基本信息卡片 -->
          <ElCard class="info-card mb-24px" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-left flex items-center gap-12px">
                  <SvgIcon icon="ph:id-card" class="text-20px text-primary" />
                  <span class="text-18px text-color-primary font-semibold">
                    {{ $t('page.user.center.profile') }}
                  </span>
                </div>
                <ElButton type="primary" link @click="openProfileEdit">
                  <SvgIcon icon="ph:pencil-simple" class="mr-4px" />
                  {{ $t('common.edit') }}
                </ElButton>
              </div>
            </template>
            <div class="info-content">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label text-color-secondary mb-8px text-14px">
                    <SvgIcon icon="ph:user" class="mr-6px" />
                    {{ $t('page.user.center.username') }}
                  </div>
                  <div class="info-value text-16px text-color-primary font-medium">
                    {{ authStore.userInfo.userName }}
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label text-color-secondary mb-8px text-14px">
                    <SvgIcon icon="ph:user-gear" class="mr-6px" />
                    {{ $t('page.user.center.nickname') }}
                  </div>
                  <div class="info-value text-16px text-color-primary font-medium">
                    {{ authStore.userInfo.nickName || '-' }}
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label text-color-secondary mb-8px text-14px">
                    <SvgIcon icon="ph:gender-intersex" class="mr-6px" />
                    {{ $t('page.user.center.gender') }}
                  </div>
                  <div class="info-value text-16px text-color-primary font-medium">
                    {{ getGenderLabel() }}
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label text-color-secondary mb-8px text-14px">
                    <SvgIcon icon="ph:phone" class="mr-6px" />
                    {{ $t('page.user.center.phone') }}
                  </div>
                  <div class="info-value text-16px text-color-primary font-medium">
                    {{ authStore.userInfo.userPhone || '-' }}
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label text-color-secondary mb-8px text-14px">
                    <SvgIcon icon="ph:envelope" class="mr-6px" />
                    {{ $t('page.user.center.email') }}
                  </div>
                  <div class="info-value text-16px text-color-primary font-medium">
                    {{ authStore.userInfo.userEmail || '-' }}
                  </div>
                </div>
              </div>
            </div>
          </ElCard>

          <!-- 账号安全卡片 -->
          <ElCard class="security-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-left flex items-center gap-12px">
                  <SvgIcon icon="ph:shield-check" class="text-20px text-green-600" />
                  <span class="text-18px text-color-primary font-semibold">
                    {{ $t('page.user.center.security') }}
                  </span>
                </div>
                <ElButton type="primary" link @click="openPasswordEdit">
                  <SvgIcon icon="ph:pencil-simple" class="mr-4px" />
                  {{ $t('common.edit') }}
                </ElButton>
              </div>
            </template>
            <div class="security-content">
              <div class="security-list">
                <div class="security-item">
                  <div class="security-left">
                    <SvgIcon icon="ph:lock-key" class="mr-12px text-24px text-primary" />
                    <div>
                      <div class="security-title text-16px text-color-primary font-medium">登录密码</div>
                      <div class="security-desc text-color-secondary mt-4px text-12px">
                        定期修改密码可以保护账号安全
                      </div>
                    </div>
                  </div>
                  <ElTag type="success" effect="dark">已设置</ElTag>
                </div>
              </div>
            </div>
          </ElCard>
        </div>
      </ElCol>
    </ElRow>

    <!-- 编辑个人信息抽屉 -->
    <ProfileDrawer v-model:visible="profileDrawerVisible" />

    <!-- 修改密码抽屉 -->
    <PasswordDrawer v-model:visible="passwordDrawerVisible" />
  </div>
</template>

<style scoped lang="scss">
.user-center-container {
  background-color: var(--el-bg-color-page);

  // 主题颜色工具类
  .text-color-primary {
    color: var(--el-text-color-primary);
  }

  .text-color-secondary {
    color: var(--el-text-color-secondary);
  }

  &.dark-theme {
    .info-item,
    .security-item {
      background-color: var(--el-fill-color-light);

      &:hover {
        background-color: var(--el-fill-color);
      }
    }

    .user-stats {
      border-top: 1px solid var(--el-border-color-darker);
    }

    .stats-divider {
      background: var(--el-border-color-darker);
    }
  }

  .user-card {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    background-color: var(--el-bg-color);

    .user-card-bg {
      position: relative;
      border-radius: 12px 12px 0 0;
      overflow: hidden;

      .bg-linear-to-r {
        position: relative;
        background: linear-gradient(135deg, #00b08d 0%, #00b08d 80%);

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      }
    }

    .user-card-content {
      padding: 20px;
      text-align: center;
    }

    .avatar-container {
      position: relative;
      display: inline-block;
      margin-top: -50px;
      margin-bottom: 12px;

      .avatar-wrapper {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        overflow: hidden;
        border: 4px solid var(--el-bg-color);
        box-shadow: var(--el-box-shadow-light);
        background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary) 100%);

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
        }
      }

      .avatar-edit {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .user-info {
      margin-bottom: 20px;
    }

    .user-stats {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--el-border-color-lighter);

      .stats-item {
        flex: 1;
        text-align: center;
      }

      .stats-divider {
        width: 1px;
        height: 40px;
        background: var(--el-border-color-lighter);
      }
    }
  }

  .content-wrapper {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-card,
    .security-card {
      border-radius: 12px;
      transition: all 0.3s ease;
      background-color: var(--el-bg-color);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }
    }

    .info-content {
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 24px;
      }

      .info-item {
        padding: 16px;
        border-radius: 8px;
        background: var(--el-fill-color-lighter);
        transition: all 0.3s ease;

        &:hover {
          background: var(--el-fill-color-light);
        }
      }
    }

    .security-content {
      .security-list {
        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-radius: 8px;
          background: var(--el-fill-color-lighter);
          transition: all 0.3s ease;

          &:hover {
            background: var(--el-fill-color-light);
          }

          .security-left {
            display: flex;
            align-items: flex-start;
          }
        }
      }
    }
  }
}
</style>
