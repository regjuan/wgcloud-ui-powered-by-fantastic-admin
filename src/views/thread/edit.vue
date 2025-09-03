<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getThreadTask, saveThreadTask } from '@/api/modules/thread'
import { getHostList } from '@/api/modules/host'

const route = useRoute()
const router = useRouter()

const form = reactive({
  id: '',
  taskName: '',
  processKeyword: '',
  hostId: '',
  active: '1',
  alertRules: '{"maxTotalThreads": 500}',
})

const rules = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  processKeyword: [{ required: true, message: '请输入进程关键字', trigger: 'blur' }],
  hostId: [{ required: true, message: '请选择主机', trigger: 'change' }],
}

const formRef = ref()
const pageLoading = ref(false)
const hostOptions = ref([])

const isEdit = !!route.params.id

async function fetchData() {
  pageLoading.value = true
  try {
    if (isEdit) {
      const res = await getThreadTask(route.params.id as string)
      Object.assign(form, res.data)
    }
  }
  finally {
    pageLoading.value = false
  }
}

async function fetchHosts() {
  const res = await getHostList({})
  hostOptions.value = res.data.list
}

async function handleSave() {
  try {
    await formRef.value.validate()
    await saveThreadTask(form)
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
  fetchHosts()
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
        <ElFormItem label="选择主机" prop="hostId">
          <ElSelect v-model="form.hostId" placeholder="请选择主机">
            <ElOption v-for="host in hostOptions" :key="host.id" :label="host.hostname" :value="host.id" />
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
        <ElFormItem label="告警规则" prop="alertRules">
          <ElInput
            v-model="form.alertRules"
            type="textarea"
            :rows="5"
            placeholder='请输入JSON格式的告警规则'
          />
        </ElFormItem>
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
