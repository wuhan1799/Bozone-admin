<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import WangEditor from 'wangeditor';

interface Props {
  /** 编辑器内容 */
  modelValue?: string;
  /** 占位符 */
  placeholder?: string;
  /** 编辑器高度 */
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  height: 300
});

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const emit = defineEmits<Emits>();

const editorRef = ref<WangEditor>();
const domRef = ref<HTMLElement>();
const isReady = ref(false);

function initEditor() {
  if (!domRef.value) return;

  editorRef.value = new WangEditor(domRef.value);

  // 配置编辑器
  editorRef.value.config.placeholder = props.placeholder;
  editorRef.value.config.zIndex = 10;

  // 配置菜单
  editorRef.value.config.menus = [
    'head',
    'bold',
    'fontSize',
    'fontName',
    'italic',
    'underline',
    'strikeThrough',
    'indent',
    'lineHeight',
    'foreColor',
    'backColor',
    'link',
    'list',
    'todo',
    'justify',
    'quote',
    'emoticon',
    'image',
    'video',
    'table',
    'code',
    'splitLine',
    'undo',
    'redo'
  ];

  // 配置图片上传（如果有上传接口）
  editorRef.value.config.uploadImgServer = '/proxy-default/upload/image';
  editorRef.value.config.uploadImgMaxSize = 2 * 1024 * 1024; // 2M
  editorRef.value.config.uploadImgMaxLength = 5;
  editorRef.value.config.uploadFileName = 'file';

  // 内容变化回调
  editorRef.value.config.onchange = (html: string) => {
    emit('update:modelValue', html);
  };

  editorRef.value.create();

  // 设置初始内容
  if (props.modelValue) {
    editorRef.value.txt.html(props.modelValue);
  }

  isReady.value = true;
}

// 监听外部值变化
watch(
  () => props.modelValue,
  val => {
    if (editorRef.value && isReady.value) {
      const currentHtml = editorRef.value.txt.html();
      if (val !== currentHtml) {
        editorRef.value.txt.html(val || '');
      }
    }
  }
);

onMounted(() => {
  initEditor();
});

onUnmounted(() => {
  if (editorRef.value) {
    editorRef.value.destroy();
    editorRef.value = undefined;
  }
});
</script>

<template>
  <div ref="domRef" :style="{ height: `${height}px` }"></div>
</template>

<style scoped>
:deep(.w-e-toolbar) {
  background: inherit !important;
  border-color: var(--el-border-color) !important;
}
:deep(.w-e-text-container) {
  background: inherit;
  border-color: var(--el-border-color) !important;
}
</style>
