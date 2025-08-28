<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { updateHostTags } from '@/api/modules/host'
import { getTagList } from '@/api/modules/tag'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const allTags = ref<any[]>([])
const selectedTagIds = ref<string[]>([])
const loading = ref(false)

async function fetchAllTags() {
  try {
    // Assuming getTagList returns { data: { list: [...] } }
    const res: any = await getTagList({ page: 1, pageSize: 1000 })
    allTags.value = res.data.list || []
  }
  catch (error) {
    console.error('Failed to load tags', error)
    allTags.value = []
  }
}

watch(() => props.item, (newItem) => {
  if (newItem && newItem.id) {
    fetchAllTags().then(() => {
      if (newItem.tagNameList) {
        const currentTagNames = newItem.tagNameList.split(',')
        selectedTagIds.value = allTags.value
          .filter(tag => currentTagNames.includes(tag.tagName))
          .map(tag => tag.id)
      }
      else {
        selectedTagIds.value = []
      }
    })
  }
  else {
    selectedTagIds.value = []
  }
}, { immediate: true, deep: true })

async function handleSave() {
  loading.value = true
  try {
    await updateHostTags({
      id: props.item.id,
      tags: selectedTagIds.value.join(','),
    })
    ElMessage.success('标签更新成功')
    emit('success')
    visible.value = false
  }
  catch (error) {
    console.error('Failed to update tags', error)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="管理标签" width="500px">
    <div v-if="allTags.length > 0">
      <el-checkbox-group v-model="selectedTagIds">
        <el-checkbox v-for="tag in allTags" :key="tag.id" :label="tag.id">
          {{ tag.tagName }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <div v-else>
      暂无可用标签，请先前往标签管理页面创建。
    </div>
    <template #footer>
      <el-button @click="visible = false">
        取消
      </el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>
