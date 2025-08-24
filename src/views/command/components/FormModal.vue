<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { saveCommand } from '@/api/modules/command'

const props = defineProps({
  modelValue: Boolean,
  item: {
    type: Object,
    default: () => null,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref<any>(null)
const form = ref({
  id: '',
  cmdName: '',
  commandType: 'Shell',
  cmdContent: '',
  timeout: 60,
})

const rules = {
  cmdName: [{ required: true, message: '请输入指令名称', trigger: 'blur' }],
  cmdContent: [{ required: true, message: '请输入脚本内容', trigger: 'blur' }],
  timeout: [{ required: true, message: '请输入超时时间', trigger: 'blur' }],
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
        cmdName: '',
        commandType: 'Shell',
        cmdContent: '',
        timeout: 60,
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
        await saveCommand(form.value)
        ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
        emit('success')
        handleClose()
      }
      catch (error) {
        // ElMessage.error('操作失败')
      }
    }
  })
}
</script>

<template>
  <FaModal
    v-model="visible"
    :title="isEdit ? '编辑指令' : '新增指令'"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="top"
    >
      <el-form-item label="指令名称" prop="cmdName">
        <FaInput v-model="form.cmdName" placeholder="请输入指令名称" />
      </el-form-item>
      <el-form-item label="脚本内容" prop="cmdContent">
        <FaInput
          v-model="form.cmdContent"
          type="textarea"
          :rows="10"
          placeholder="请输入脚本内容，例如 #!/bin/bash\n echo 'hello world'"
          style="width: 500px;"
        />
      </el-form-item>
      <el-form-item label="超时时间 (秒)" prop="timeout">
        <el-input-number v-model="form.timeout" :min="1" />
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
