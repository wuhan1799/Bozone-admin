<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useBoolean } from '@sa/hooks';
import { fetchAddArticle, fetchUpdateArticle } from '@/service/api/content';
import RichTextEditor from '@/components/common/rich-text-editor.vue';
import { $t } from '@/locales';

export type OperateType = 'add' | 'edit';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the row data */
  rowData?: Api.Content.Article | null;
  /** category options */
  categoryOptions: Api.Content.ArticleCategory[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { bool: submitLoading, setTrue: setSubmitLoadingTrue, setFalse: setSubmitLoadingFalse } = useBoolean();

const title = computed(() => {
  const titles: Record<OperateType, string> = {
    add: $t('page.manage.content.article.addArticle'),
    edit: $t('page.manage.content.article.editArticle')
  };
  return titles[props.operateType];
});

const model: Api.Content.Article = reactive(createDefaultModel());

function createDefaultModel(): Api.Content.Article {
  return {
    id: 0,
    title: '',
    content: '',
    catName: '',
    images: '',
    weigh: 0,
    status: 1
  };
}

// 图片列表（用于上传组件）
const imageList = computed<string[]>({
  get: () => {
    if (!model.images) return [];
    try {
      const parsed = JSON.parse(model.images);
      if (!Array.isArray(parsed)) return [];
      // 将完整URL转换为代理路径
      return parsed.map((url: string) => {
        if (url && url.includes('/uploads/')) {
          return `/proxy-default${url.substring(url.indexOf('/uploads/'))}`;
        }
        return url;
      });
    } catch {
      return [];
    }
  },
  set: (val: string[]) => {
    model.images = JSON.stringify(val);
  }
});

// 处理图片上传成功
function handleImageSuccess(url: string) {
  // 将完整URL转换为代理路径
  let proxyUrl = url;
  if (url && url.includes('/uploads/')) {
    proxyUrl = `/proxy-default${url.substring(url.indexOf('/uploads/'))}`;
  }
  const current = imageList.value;
  current.push(proxyUrl);
  imageList.value = current;
}

// 删除图片
function handleRemoveImage(index: number) {
  const current = imageList.value;
  current.splice(index, 1);
  imageList.value = current;
}

const rules = {
  title: [{ required: true, message: $t('page.manage.content.article.form.title') }],
  categoryId: [{ required: true, message: $t('page.manage.content.article.form.category') }],
  content: [{ required: true, message: $t('page.manage.content.article.form.content') }],
  sortOrder: [{ required: true, message: $t('page.manage.content.article.form.sortOrder') }],
  status: [{ required: true, message: $t('page.manage.content.article.form.status') }]
};

const statusOptions = [
  { label: $t('page.manage.content.article.show'), value: 1 },
  { label: $t('page.manage.content.article.hide'), value: 0 }
];

function handleUpdateModel() {
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
  } else {
    Object.assign(model, createDefaultModel());
  }
}

async function handleSubmit() {
  setSubmitLoadingTrue();
  try {
    const api = props.operateType === 'add' ? fetchAddArticle : fetchUpdateArticle;
    const { error } = await api(model);
    if (!error) {
      window.$message?.success($t('common.operationSuccess'));
      emit('submitted');
      visible.value = false;
    }
  } finally {
    setSubmitLoadingFalse();
  }
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModel();
  }
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" width="900px" top="5vh">
    <ElForm :model="model" :rules="rules" label-width="100px">
      <ElRow :gutter="16">
        <ElCol :span="16">
          <ElFormItem :label="$t('page.manage.content.article.title')" prop="title">
            <ElInput v-model="model.title" :placeholder="$t('page.manage.content.article.form.title')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem :label="$t('page.manage.content.article.category')" prop="categoryId" label-width="80px">
            <ElSelect
              v-model="model.categoryId"
              :placeholder="$t('page.manage.content.article.form.category')"
              class="w-full"
            >
              <ElOption v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="16">
        <ElCol :span="16">
          <ElFormItem :label="$t('page.manage.content.article.coverImage')" prop="images">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(url, index) in imageList"
                :key="index"
                class="relative h-24 w-24 overflow-hidden border rounded"
              >
                <ElImage :src="url" class="h-full w-full object-cover" />
                <div
                  class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                  @click="handleRemoveImage(index)"
                >
                  <span class="text-xs text-white">{{ $t('common.delete') }}</span>
                </div>
              </div>
              <ElUpload
                action="/proxy-default/content/uploadArticleImage"
                name="file"
                :show-file-list="false"
                :on-success="(res: any) => handleImageSuccess(res.data?.url || res.url)"
                class="upload-trigger"
              >
                <div
                  class="h-24 w-24 flex flex-col cursor-pointer items-center justify-center border border-gray-300 rounded border-dashed hover:border-primary"
                >
                  <ElIcon :size="20" class="text-gray-400">
                    <i class="iconify mdi--plus" />
                  </ElIcon>
                  <span class="mt-1 text-xs text-gray-400">{{ $t('common.upload') }}</span>
                </div>
              </ElUpload>
            </div>
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElRow>
            <ElCol :span="24">
              <ElFormItem :label="$t('page.manage.content.article.sortOrder')" prop="weigh" label-width="80px">
                <ElInputNumber v-model="model.weigh" :min="0" class="w-full" />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow>
            <ElCol :span="24">
              <ElFormItem :label="$t('page.manage.content.article.status')" prop="status" label-width="80px">
                <ElRadioGroup v-model="model.status">
                  <ElRadio v-for="item in statusOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </ElRadio>
                </ElRadioGroup>
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElCol>
      </ElRow>
      <ElFormItem :label="$t('page.manage.content.article.content')" prop="content">
        <RichTextEditor
          v-model="model.content"
          :placeholder="$t('page.manage.content.article.form.content')"
          :height="350"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace>
        <ElButton @click="visible = false">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>
