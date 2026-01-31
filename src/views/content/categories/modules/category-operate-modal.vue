<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useBoolean } from '@sa/hooks';
import { fetchAddArticleCategory, fetchUpdateArticleCategory } from '@/service/api/content';
import { $t } from '@/locales';

export type OperateType = 'add' | 'edit';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the row data */
  rowData?: Api.Content.ArticleCategory | null;
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
    add: $t('page.manage.content.category.addCategory'),
    edit: $t('page.manage.content.category.editCategory')
  };
  return titles[props.operateType];
});

const model: Api.Content.ArticleCategory = reactive(createDefaultModel());

function createDefaultModel(): Api.Content.ArticleCategory {
  return {
    id: 0,
    name: '',
    sortOrder: 0,
    status: 1
  };
}

const rules = {
  name: [{ required: true, message: $t('page.manage.content.category.form.name') }],
  sortOrder: [{ required: true, message: $t('page.manage.content.category.form.weigh') }],
  status: [{ required: true, message: $t('page.manage.content.category.form.status') }]
};

const statusOptions = [
  { label: $t('page.manage.content.category.show'), value: 1 },
  { label: $t('page.manage.content.category.hide'), value: 0 }
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
    const api = props.operateType === 'add' ? fetchAddArticleCategory : fetchUpdateArticleCategory;
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
  <ElDialog v-model="visible" :title="title" width="500px">
    <ElForm :model="model" :rules="rules" label-width="100px">
      <ElFormItem :label="$t('page.manage.content.category.name')" prop="name">
        <ElInput v-model="model.name" :placeholder="$t('page.manage.content.category.form.name')" />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.content.category.weigh')" prop="sortOrder">
        <ElInputNumber
          v-model="model.sortOrder"
          :min="0"
          :placeholder="$t('page.manage.content.category.form.weigh')"
        />
      </ElFormItem>
      <ElFormItem :label="$t('page.manage.content.category.status')" prop="status">
        <ElRadioGroup v-model="model.status">
          <ElRadio v-for="item in statusOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </ElRadio>
        </ElRadioGroup>
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
