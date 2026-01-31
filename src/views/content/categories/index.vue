<script setup lang="tsx">
import { reactive, ref } from 'vue';
import type { Ref } from 'vue';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { useBoolean } from '@sa/hooks';
import {
  fetchBatchDeleteArticleCategory,
  fetchDeleteArticleCategory,
  fetchGetArticleCategoryList
} from '@/service/api/content';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import CategoryOperateModal, { type OperateType } from './modules/category-operate-modal.vue';

const { bool: visible, setTrue: openModal } = useBoolean();

const searchParams = reactive(getInitSearchParams());

function getInitSearchParams(): Api.Content.ArticleCategorySearchParams {
  return {
    current: 1,
    size: 10,
    name: undefined,
    status: undefined
  };
}

type CategoryRow = Api.Content.ArticleCategory;

const statusRecord: Record<number, string> = {
  0: 'page.manage.content.category.hide',
  1: 'page.manage.content.category.show'
};

const { columns, columnChecks, data, loading, pagination, getData, getDataByPage } = useUIPaginatedTable({
  api: async () => {
    const { data: apiData, error } = await fetchGetArticleCategoryList(searchParams);
    return {
      data: apiData ?? { records: [], current: 1, size: 10, total: 0 },
      error
    };
  },
  transform: response => defaultTransform(response as any),
  onPaginationParamsChange: async params => {
    searchParams.current = params.currentPage ?? 1;
    searchParams.size = params.pageSize ?? 10;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'id', label: 'ID', width: 60 },
    {
      prop: 'name',
      label: $t('page.manage.content.category.name' as App.I18n.I18nKey),
      minWidth: 120
    },
    {
      prop: 'sortOrder',
      label: $t('page.manage.content.category.weigh' as App.I18n.I18nKey),
      width: 80
    },
    {
      prop: 'status',
      label: $t('page.manage.content.category.status' as App.I18n.I18nKey),
      width: 100,
      formatter: (row: CategoryRow) => {
        const tagMap: Record<number, UI.ThemeColor> = {
          0: 'info',
          1: 'success'
        };

        const label = $t(statusRecord[row.status] as App.I18n.I18nKey);

        return <ElTag type={tagMap[row.status]}>{label}</ElTag>;
      }
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      width: 150,
      formatter: (row: CategoryRow) => (
        <div class="flex-center justify-end pr-10px">
          <ElButton type="primary" plain size="small" onClick={() => handleEdit(row)}>
            {$t('common.edit')}
          </ElButton>
          <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row.id)}>
            {{
              reference: () => (
                <ElButton type="danger" plain size="small">
                  {$t('common.delete')}
                </ElButton>
              )
            }}
          </ElPopconfirm>
        </div>
      )
    }
  ]
});

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openModal();
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(id => Number(id));
  const { error } = await fetchBatchDeleteArticleCategory(ids);
  if (!error) {
    onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteArticleCategory(id);
  if (!error) {
    onDeleted();
  }
}

const editingData: Ref<CategoryRow | null> = ref(null);

async function handleEdit(item: CategoryRow) {
  operateType.value = 'edit';
  editingData.value = { ...item };
  openModal();
}

function init() {
  getData();
}

init();
</script>

<template>
  <div class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden" body-class="ht50">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.content.category.title') }}</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @add="handleAdd"
            @delete="handleBatchDelete"
            @refresh="getData"
          />
        </div>
      </template>
      <div class="h-[calc(100%-50px)]">
        <ElTable
          v-loading="loading"
          height="100%"
          border
          class="sm:h-full"
          :data="data"
          row-key="id"
          @selection-change="checkedRowKeys = $event.map((row: CategoryRow) => String(row.id))"
        >
          <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
        </ElTable>
        <div class="mt-20px flex justify-end">
          <ElPagination
            v-if="pagination.total"
            layout="total,prev,pager,next,sizes"
            v-bind="pagination"
            @current-change="pagination['current-change']"
            @size-change="pagination['size-change']"
          />
        </div>
      </div>
      <CategoryOperateModal
        v-model:visible="visible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
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
