<script setup lang="tsx">
import { reactive, ref } from 'vue';
import type { Ref } from 'vue';
import { ElButton, ElImage, ElPopconfirm, ElTag } from 'element-plus';
import { useBoolean } from '@sa/hooks';
import {
  fetchBatchDeleteArticle,
  fetchDeleteArticle,
  fetchGetArticleCategoryList,
  fetchGetArticleList
} from '@/service/api/content';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import ArticleOperateModal, { type OperateType } from './modules/article-operate-modal.vue';

const { bool: visible, setTrue: openModal } = useBoolean();

const searchParams = reactive(getInitSearchParams());

function getInitSearchParams(): Api.Content.ArticleSearchParams {
  return {
    current: 1,
    size: 10,
    title: undefined,
    categoryId: undefined,
    status: undefined
  };
}

type ArticleRow = Api.Content.Article;

const categoryOptions = ref<Api.Content.ArticleCategory[]>([]);

async function getCategoryOptions() {
  const { data } = await fetchGetArticleCategoryList({ current: 1, size: 100 });
  if (data) {
    categoryOptions.value = data.records;
  }
}

const statusRecord = {
  0: 'page.manage.content.article.hide',
  1: 'page.manage.content.article.show'
} as const;

const { columns, columnChecks, data, loading, pagination, getData, getDataByPage } = useUIPaginatedTable({
  api: async () => {
    const { data: apiData, error } = await fetchGetArticleList(searchParams);
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
      prop: 'images',
      label: $t('page.manage.content.article.coverImage'),
      width: 160,
      align: 'center',
      formatter: (row: ArticleRow) => {
        if (!row.images) return <span class="text-gray">-</span>;
        try {
          const imageList = JSON.parse(row.images);
          const firstImage = Array.isArray(imageList) && imageList.length > 0 ? imageList[0] : '';
          return firstImage ? (
            <ElImage
              src={firstImage}
              style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px;"
              preview-src-list={imageList}
              preview-teleported
              hide-on-click-modal
              fit="cover"
            />
          ) : (
            <span class="text-gray">-</span>
          );
        } catch {
          return <span class="text-gray">-</span>;
        }
      }
    },
    {
      prop: 'title',
      label: $t('page.manage.content.article.title'),
      minWidth: 180,
      showOverflowTooltip: true
    },
    {
      prop: 'catName',
      label: $t('page.manage.content.article.category'),
      width: 120
    },
    {
      prop: 'weigh',
      label: $t('page.manage.content.article.sortOrder'),
      width: 80,
      align: 'center'
    },
    {
      prop: 'status',
      label: $t('page.manage.content.article.status'),
      width: 100,
      formatter: (row: ArticleRow) => {
        const tagMap: Record<number, UI.ThemeColor> = {
          0: 'info',
          1: 'success'
        };

        const label = $t(statusRecord[row.status as keyof typeof statusRecord]);

        return <ElTag type={tagMap[row.status]}>{label}</ElTag>;
      }
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      width: 150,
      formatter: (row: ArticleRow) => (
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
  const { error } = await fetchBatchDeleteArticle(ids);
  if (!error) {
    onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteArticle(id);
  if (!error) {
    onDeleted();
  }
}

const editingData: Ref<ArticleRow | null> = ref(null);

async function handleEdit(item: ArticleRow) {
  operateType.value = 'edit';
  editingData.value = { ...item };
  openModal();
}

function init() {
  getCategoryOptions();
  getData();
}

init();
</script>

<template>
  <div class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden" body-class="ht50">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.content.article.title') }}</p>
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
          @selection-change="checkedRowKeys = $event.map((row: ArticleRow) => String(row.id))"
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
      <ArticleOperateModal
        v-model:visible="visible"
        :operate-type="operateType"
        :row-data="editingData"
        :category-options="categoryOptions"
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
