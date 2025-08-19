<template>
  <FaModal
    v-model="visible"
    title="编辑备注"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      label-width="80px"
    >
      <el-form-item label="备注内容" prop="remark">
        <FaInput
          v-model="form.remark"
          type="textarea"
          placeholder="请输入备注内容"
        />
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

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { saveHostRemark } from '@/api/modules/host'

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
  remark: '',
})

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

watch(
  () => props.item,
  (val) => {
    if (val) {
      form.value = { id: val.id, remark: val.remark || '' }
    } else {
      form.value = { id: '', remark: '' }
    }
  },
  { immediate: true, deep: true },
)

function handleClose() {
  visible.value = false
}

async function handleSubmit() {
  try {
    await saveHostRemark(form.value)
    ElMessage.success('更新成功')
    emit('success')
    handleClose()
  } catch (error) {
    // Handle error
  }
}
</script>
