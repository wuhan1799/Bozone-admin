<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useBoolean } from '@sa/hooks';
import { fetchAddGuide, fetchUpdateGuide } from '@/service/api/content';
import { $t } from '@/locales';
import RichTextEditor from '@/components/common/rich-text-editor.vue';

export type OperateType = 'add' | 'edit';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the row data */
  rowData?: Api.Content.Guide | null;
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
    add: $t('page.manage.content.guide.addGuide'),
    edit: $t('page.manage.content.guide.editGuide')
  };
  return titles[props.operateType];
});

const model: Api.Content.Guide = reactive(createDefaultModel());

function createDefaultModel(): Api.Content.Guide {
  return {
    id: 0,
    title: '',
    subtitle: '',
    icon: '',
    releaseDate: '',
    content: '',
    weigh: 0,
    status: '1',
    createtime: 0
  };
}

const rules = {
  title: [{ required: true, message: $t('page.manage.content.guide.form.title') }],
  subtitle: [{ required: true, message: $t('page.manage.content.guide.form.subtitle') }],
  icon: [{ required: true, message: $t('page.manage.content.guide.form.icon') }],
  releaseDate: [{ required: true, message: $t('page.manage.content.guide.form.releaseDate') }],
  weigh: [{ required: true, message: $t('page.manage.content.guide.form.sortOrder') }],
  status: [{ required: true, message: $t('page.manage.content.guide.form.status') }],
  content: [{ required: true, message: $t('page.manage.content.guide.form.content') }]
};

const statusOptions = [
  { label: $t('page.manage.content.guide.show'), value: '1' },
  { label: $t('page.manage.content.guide.hide'), value: '0' }
];

function convertUrlToProxy(url: string): string {
  if (!url) return url;
  // 已经是代理路径格式，无需转换
  if (url.startsWith('/proxy-default')) return url;
  // 将完整URL或纯路径转换为代理路径
  if (url.includes('/uploads/')) {
    const pathIndex = url.indexOf('/uploads/');
    return `/proxy-default${url.substring(pathIndex)}`;
  }
  return url;
}

function handleUpdateModel() {
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
    // 将URL转换为代理路径用于显示
    model.icon = convertUrlToProxy(model.icon);
  } else {
    Object.assign(model, createDefaultModel());
  }
}

// 处理图标上传成功
function handleIconSuccess(res: any) {
  const url = res.data?.url || res.url || '';
  // 将URL转换为代理路径用于显示
  model.icon = convertUrlToProxy(url);
}

function getSubmitData(): Api.Content.Guide {
  const data = { ...model };
  // 将代理路径转换回原始URL格式，便于后端存储
  if (data.icon && data.icon.startsWith('/proxy-default')) {
    data.icon = data.icon.replace('/proxy-default', '');
  }
  return data;
}

async function handleSubmit() {
  setSubmitLoadingTrue();
  try {
    const api = props.operateType === 'add' ? fetchAddGuide : fetchUpdateGuide;
    const { error } = await api(getSubmitData());
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
  <ElDialog v-model="visible" :title="title" width="800px" top="10vh" destroy-on-close>
    <div class="dialog-content">
      <ElForm :model="model" :rules="rules" label-width="100px">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.content.guide.guideTitle')" prop="title">
              <ElInput v-model="model.title" :placeholder="$t('page.manage.content.guide.form.title')" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.content.guide.subtitle')" prop="subtitle">
              <ElInput v-model="model.subtitle" :placeholder="$t('page.manage.content.guide.form.subtitle')" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.content.guide.icon')" prop="icon">
              <div class="flex items-center gap-2">
                <ElImage v-if="model.icon" :src="model.icon" class="h-10 w-10 border rounded object-cover" />
                <ElUpload
                  action="/proxy-default/content/uploadGuideIcon"
                  name="file"
                  :show-file-list="false"
                  :on-success="handleIconSuccess"
                  class="upload-trigger"
                >
                  <ElButton type="primary" plain>
                    <template #icon>
                      <ElIcon><i class="iconify mdi--upload" /></ElIcon>
                    </template>
                    {{ $t('common.upload') }}
                  </ElButton>
                </ElUpload>
                <ElButton v-if="model.icon" type="danger" plain size="small" @click="model.icon = ''">
                  {{ $t('common.delete') }}
                </ElButton>
              </div>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.content.guide.releaseDate')" prop="releaseDate">
              <ElDatePicker
                v-model="model.releaseDate"
                type="date"
                :placeholder="$t('page.manage.content.guide.form.releaseDate')"
                class="w-full"
                value-format="YYYY-MM-DD"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.content.guide.sortOrder')" prop="weigh">
              <ElInputNumber
                v-model="model.weigh"
                :min="0"
                :placeholder="$t('page.manage.content.guide.form.sortOrder')"
                class="w-full"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.content.guide.status')" prop="status">
              <ElRadioGroup v-model="model.status">
                <ElRadio v-for="item in statusOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem :label="$t('page.manage.content.guide.content')" prop="content">
          <RichTextEditor v-model="model.content" :height="300" />
        </ElFormItem>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="visible = false">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.dialog-content {
  max-height: calc(80vh - 120px);
  overflow-y: auto;
  padding-right: 8px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
