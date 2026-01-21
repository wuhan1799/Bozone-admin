<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElCheckboxGroup } from 'element-plus';
import { fetchGetAllRoles, fetchGetMenuRoleIds, fetchUpdateMenuRoleAuth } from '@/service/api';
import { $t } from '@/locales';

defineOptions({ name: 'PermissionAuthModal' });

interface Props {
  /** menuId */
  menuId: number | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const emit = defineEmits<{
  (e: 'submitted'): void;
}>();

const loading = ref(false);
const roleList = ref<Api.SystemManage.AllRole[]>([]);
const roleCheckedKeys = ref<number[]>([]);

async function getAllRoles() {
  const { error, data } = await fetchGetAllRoles();
  if (!error && data) {
    roleList.value = data;
  }
}

async function getMenuRoleIds() {
  if (!props.menuId) return;
  const { error, data } = await fetchGetMenuRoleIds({ menuId: props.menuId });
  if (!error && data) {
    roleCheckedKeys.value = data;
  }
}

async function init() {
  loading.value = true;
  try {
    await Promise.all([getAllRoles(), getMenuRoleIds()]);
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!props.menuId) return;
  loading.value = true;
  try {
    const { error } = await fetchUpdateMenuRoleAuth({
      menuId: props.menuId,
      roleIds: roleCheckedKeys.value
    });
    if (!error) {
      window.$message?.success($t('common.modifySuccess'));
      emit('submitted');
    }
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  visible.value = false;
}

watch(visible, val => {
  if (val) {
    init();
  }
});
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="$t('page.manage.permission.assignPermission')"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-loading="loading" class="min-h-[400px] overflow-y-auto">
      <ElCheckboxGroup v-model="roleCheckedKeys">
        <div v-for="role in roleList" :key="role.id" class="mb-12px">
          <ElCheckbox :label="role.id" class="mr-16px">
            {{ role.roleName }}
            <span class="ml-8px text-sm text-gray-400">({{ role.roleCode }})</span>
          </ElCheckbox>
        </div>
      </ElCheckboxGroup>
      <div v-if="roleList.length === 0" class="h-[400px] flex-center text-gray-400">
        {{ $t('common.noData') }}
      </div>
    </div>
    <template #footer>
      <ElSpace>
        <ElButton @click="handleCancel">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
