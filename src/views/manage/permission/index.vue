<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { ElButton, ElTag } from 'element-plus';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import { fetchGetMenuList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import PermissionAuthModal from './modules/permission-auth-modal.vue';

const searchParams = reactive(getInitSearchParams());

function getInitSearchParams(): Api.SystemManage.MenuSearchParams {
  return {
    current: 1,
    size: 10,
    hideInMenu: false
  };
}

const { columns, columnChecks, data, loading, getData, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.current!,
    pageSize: searchParams.size!
  },
  api: () => fetchGetMenuList({ ...searchParams }),
  transform: response => {
    const transformed = defaultTransform<Api.SystemManage.Menu>(response);
    return transformed;
  },
  onPaginationParamsChange: params => {
    searchParams.current = params.currentPage!;
    searchParams.size = params.pageSize!;
  },
  columns: () => [
    { prop: 'id', label: $t('page.manage.menu.id'), width: 50 },
    {
      prop: 'menuType',
      label: $t('page.manage.menu.menuType'),
      width: 90,
      formatter: row => {
        const tagMap: Record<Api.SystemManage.MenuType, UI.ThemeColor> = {
          '1': 'info',
          '2': 'primary'
        };

        const menuType = row.menuType;
        const i18nKey = menuTypeRecord[menuType] || 'page.manage.menu.type.menu';
        const label = $t(i18nKey);

        return <ElTag type={tagMap[menuType] || 'info'}>{label}</ElTag>;
      }
    },
    {
      prop: 'menuName',
      label: $t('page.manage.menu.menuName'),
      minWidth: 60,
      formatter: row => {
        const { i18nKey, menuName } = row;
        const label = i18nKey ? $t(i18nKey) : menuName;
        return <span>{label}</span>;
      }
    },
    {
      prop: 'icon',
      label: $t('page.manage.menu.icon'),
      width: 50,
      formatter: row => {
        const icon = row.iconType === '1' ? row.icon : undefined;
        const localIcon = row.iconType === '2' ? row.icon : undefined;
        return (
          <div class="flex-center">
            <SvgIcon icon={icon} localIcon={localIcon} class="text-icon" />
          </div>
        );
      }
    },
    { prop: 'routeName', label: $t('page.manage.menu.routeName'), minWidth: 60 },
    { prop: 'routePath', label: $t('page.manage.menu.routePath'), width: 320 },
    {
      prop: 'status',
      label: $t('page.manage.menu.menuStatus'),
      width: 80,
      formatter: row => {
        if (row.status === undefined) {
          return '';
        }
        const tagMap: Record<Api.Common.EnableStatus, UI.ThemeColor> = {
          1: 'success',
          2: 'warning'
        };
        const label = $t(enableStatusRecord[row.status]);
        return <ElTag type={tagMap[row.status]}>{label}</ElTag>;
      }
    },
    {
      prop: 'hideInMenu',
      label: $t('page.manage.menu.hideInMenu'),
      width: 80,
      formatter: row => {
        const hide: CommonType.YesOrNo = row.hideInMenu ? 'Y' : 'N';
        const tagMap: Record<CommonType.YesOrNo, UI.ThemeColor> = {
          Y: 'danger',
          N: 'info'
        };
        const label = $t(yesOrNoRecord[hide]);
        return <ElTag type={tagMap[hide]}>{label}</ElTag>;
      }
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      width: 130,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => handleAssignPermission(row.id)}>
            {$t('page.manage.permission.assignPermission')}
          </ElButton>
        </div>
      )
    }
  ]
});

const currentMenuId = ref<number | null>(null);
const modalVisible = ref(false);

function handleAssignPermission(menuId: number) {
  currentMenuId.value = menuId;
  modalVisible.value = true;
}

function handlePermissionSubmitted() {
  modalVisible.value = false;
  getData();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden" body-class="ht50">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.permission.title') }}</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :loading="loading"
            :show-buttons="false"
            @refresh="getData"
          />
        </div>
      </template>
      <div class="h-[calc(100%-50px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data">
          <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
        </ElTable>
        <div class="mt-20px flex justify-end">
          <ElPagination
            v-if="mobilePagination.total"
            layout="total,prev,pager,next,sizes"
            v-bind="mobilePagination"
            @current-change="mobilePagination['current-change']"
            @size-change="mobilePagination['size-change']"
          />
        </div>
      </div>
      <PermissionAuthModal
        v-model:visible="modalVisible"
        :menu-id="currentMenuId"
        @submitted="handlePermissionSubmitted"
      />
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>
