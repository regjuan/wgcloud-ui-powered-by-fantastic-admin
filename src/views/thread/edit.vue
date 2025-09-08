<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getThreadTask, saveThreadTask } from '@/api/modules/thread'
import { getTagList } from '@/api/modules/tag'

const route = useRoute()
const router = useRouter()

const form = reactive({
  id: '',
  taskName: '',
  processKeyword: '',
  targetTags: [],
  active: '1',
  alertRules: '{"maxTotalThreads": 500}',
})

const rules = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  processKeyword: [{ required: true, message: '请输入进程关键字', trigger: 'blur' }],
  targetTags: [{ required: true, message: '请选择标签', trigger: 'change' }],
}

const formRef = ref()
const pageLoading = ref(false)
const tagOptions = ref([])

const isEdit = !!route.params.id

async function fetchData() {
  pageLoading.value = true
  try {
    if (isEdit) {
      const res = await getThreadTask(route.params.id as string)
      if (res.data.targetTags && typeof res.data.targetTags === 'string') {
        try {
          res.data.targetTags = JSON.parse(res.data.targetTags)
        }
        catch (e) {
          res.data.targetTags = []
        }
      }
      Object.assign(form, res.data)
    }
  }
  finally {
    pageLoading.value = false
  }
}

async function fetchTags() {
  const res = await getTagList({ page: 1, pageSize: 1000 })
  tagOptions.value = res.data.list
}

async function handleSave() {
  try {
    await formRef.value.validate()
    const dataToSave = {
      ...form,
      targetTags: JSON.stringify(form.targetTags),
    }
    await saveThreadTask(dataToSave)
    ElMessage.success('保存成功')
    router.push('/thread/list')
  }
  catch (error) {
    // validation failed
  }
}

function handleCancel() {
  router.push('/thread/list')
}

onMounted(() => {
  fetchTags()
  if (isEdit) {
    fetchData()
  }
})
</script>

<template>
  <div>
    <FaPageHeader :title="isEdit ? '编辑任务' : '新建任务'" />
    <FaPageMain>
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
        <ElFormItem label="任务名称" prop="taskName">
          <ElInput v-model="form.taskName" placeholder="例如：API网关线程监控" />
        </ElFormItem>
        <ElFormItem label="进程关键字" prop="processKeyword">
          <ElInput v-model="form.processKeyword" placeholder="例如：my-app.jar, nginx" />
        </ElFormItem>
        <ElFormItem label="选择标签" prop="targetTags">
          <ElSelect
            v-model="form.targetTags"
            placeholder="请选择标签"
            multiple
            collapse-tags
            style="width: 100%;"
          >
            <ElOption v-for="tag in tagOptions" :key="tag.id" :label="tag.tagName" :value="tag.tagName" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="是否启用">
          <ElRadioGroup v-model="form.active">
            <ElRadioButton label="1">
              是
            </ElRadioButton>
            <ElRadioButton label="0">
              否
            </ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
<!--        <ElFormItem label="告警规则" prop="alertRules">-->
<!--          <ElInput-->
<!--            v-model="form.alertRules"-->
<!--            type="textarea"-->
<!--            :rows="5"-->
<!--            placeholder='请输入JSON格式的告警规则'-->
<!--          />-->
<!--        </ElFormItem>-->
        <ElFormItem>
          <ElButton type="primary" @click="handleSave">
            保存
          </ElButton>
          <ElButton @click="handleCancel">
            返回
          </ElButton>
        </ElFormItem>
      </ElForm>
    </FaPageMain>
  </div>
</template>
