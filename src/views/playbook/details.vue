<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { groupBy } from 'lodash-es'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlaybookHistoryDetails } from '@/api/modules/playbook'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => route.query.taskId as string)
const startTime = computed(() => route.query.startTime as string)

const detailsList = ref<any[]>([])
const dataLoading = ref(true)

const groupedDetails = computed(() => {
  if (!detailsList.value) {
    return {}
  }
  return groupBy(detailsList.value, 'hostname')
})

function statusTagType(status: string) {
  switch (status) {
    case 'SUCCESS':
      return 'success'
    case 'FAILED':
      return 'danger'
    case 'RUNNING':
      return 'primary'
    case 'TIMEOUT':
      return 'warning'
    default:
      return 'info'
  }
}

async function loadDetails() {
  if (!taskId.value || !startTime.value) {
    ElMessage.error('缺少必要的查询参数')
    return
  }
  dataLoading.value = true
  try {
    const res: any = await getPlaybookHistoryDetails({ taskId: taskId.value, startTime: startTime.value })
    detailsList.value = res.data
  }
  catch (error) {
    console.error('Failed to load playbook history details', error)
    ElMessage.error('加载执行详情失败')
  }
  finally {
    dataLoading.value = false
  }
}

function goBack() {
  router.go(-1)
}

onMounted(() => {
  loadDetails()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader :title="`执行详情: ${startTime}`" @back="goBack" />
    <FaPageMain class="flex-1 overflow-auto">
      <div v-if="dataLoading" class="p-10 text-center">
        <el-icon class="is-loading" size="24">
          <Loading />
        </el-icon>
        <p>加载中...</p>
      </div>
      <div v-else-if="!detailsList || detailsList.length === 0" class="p-10 text-center">
        <p>未能加载执行数据或该次执行没有步骤。</p>
      </div>
      <div v-else class="page-main">
        <div class="results-card">
          <div v-for="(steps, hostname) in groupedDetails" :key="hostname" class="host-result-group">
            <h4 class="text-md rounded bg-gray-100 p-2 font-bold dark:bg-gray-800">
              主机: {{ hostname }}
            </h4>
            <div v-for="(step, stepIndex) in steps" :key="step.id || stepIndex" class="step-item">
              <div class="step-header">
                <strong>{{ step.commandName }}</strong>
                <el-tag :type="statusTagType(step.status)" size="small">
                  {{ step.status }}
                </el-tag>
              </div>
              <div v-if="step.stdout" class="output-block">
                <strong class="output-title">stdout:</strong>
                <pre>{{ step.stdout }}</pre>
              </div>
              <div v-if="step.stderr" class="output-block stderr">
                <strong class="output-title">stderr:</strong>
                <pre>{{ step.stderr }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FaPageMain>
  </div>
</template>

<style lang="scss" scoped>
.page-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.results-card {
  padding: 16px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
}
.host-result-group {
  margin-bottom: 16px;
}
.step-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
}
.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--el-fill-color-light);
}
.output-block {
  padding: 8px 12px;
  background-color: #fdfdfd;
  dark:bg-gray-900;

  .output-title {
    font-weight: bold;
    margin-bottom: 4px;
    display: block;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
    font-family: var(--el-font-family-mono);
    font-size: 14px;
    color: var(--el-text-color-regular);
  }

  &.stderr pre {
    color: var(--el-color-danger);
  }
}
</style>
