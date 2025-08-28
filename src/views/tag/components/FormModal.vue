<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { saveTag, updateTag } from '@/api/modules/tag'

const props = defineProps({
  modelValue: Boolean,
  item: {
    type: Object,
    default: () => null,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref<any>(null)
const form = ref<any>({})

const rules = {
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
}

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const isEdit = computed(() => !!form.value.id)

watch(
  () => props.item,
  (val) => {
    if (val) {
      form.value = { ...val }
    }
    else {
      form.value = {
        id: '',
        tagName: '',
        tagDesc: '',
        tagColor: '#409EFF',
        logPath: '',
      }
    }
  },
  { immediate: true, deep: true },
)

function handleClose() {
  visible.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

function handleSubmit() {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateTag(form.value.id, form.value)
        }
        else {
          await saveTag(form.value)
        }
        ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
        emit('success')
        handleClose()
      }
      catch (error) {
        // ElMessage.error('操作失败')
        console.error(error)
      }
    }
  })
}
</script>

<template>
  <FaModal
    v-model="visible"
    :title="isEdit ? '编辑标签' : '新增标签'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="标签名称" prop="tagName">
        <FaInput v-model="form.tagName" placeholder="请输入标签名称" />
      </el-form-item>
      <el-form-item label="标签描述" prop="tagDesc">
        <FaInput
          v-model="form.tagDesc"
          type="textarea"
          placeholder="请输入标签描述"
        />
      </el-form-item>
      <el-form-item label="日志地址" prop="logPath">
        <FaInput v-model="form.logPath" placeholder="请输入日志文件绝对路径" />
      </el-form-item>
      <el-form-item label="标签颜色" prop="tagColor">
        <el-color-picker v-model="form.tagColor" />
      </el-form-item>
    </el-form>
    <template #footer>
      <FaButton @click="handleClose">
        取消
      </FaButton>
      <FaButton type="primary" @click="handleSubmit">
        确定
      </FaButton>
    </template>
  </FaModal>
</template>
