<script setup lang="ts">
import { InfoFilled, Loading, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPlaybookDetail, getPlaybookExecution } from '@/api/modules/playbook'

const route = useRoute()

const executionId = route.params.id as string
const executionData = ref<any>(null)
const playbookData = ref<any>(null)
const dataLoading = ref(true)
const isRefreshing = ref(false)

const playbookContentForTooltip = computed(() => {
  if (!playbookData.value || !playbookData.value.commandIds) {
    return '无指令信息'
  }
  return playbookData.value.commandIds.join('\n')
})

function statusTagType(status: string) {
  switch (status) {
    case 'SUCCESS': return 'success'
    case 'FAILED': return 'danger'
    case 'RUNNING': return 'primary'
    default: return 'info'
  }
}

async function loadReport() {
  if (!isRefreshing.value) {
    dataLoading.value = true
  }
  isRefreshing.value = true
  try {
    const res: any = await getPlaybookExecution(executionId)
    executionData.value = res.data

    if (executionData.value && executionData.value.playbookId && !playbookData.value) {
      const playbookRes: any = await getPlaybookDetail(executionData.value.playbookId)
      playbookData.value = playbookRes.data
    }
  }
  catch (error) {
    ElMessage.error('加载执行报告失败')
    console.error('Failed to load execution report', error)
  }
  finally {
    dataLoading.value = false
    isRefreshing.value = false
  }
}

onMounted(() => {
  loadReport()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader :title="`执行报告: ${executionId}`" />
    <FaPageMain class="flex-1 overflow-auto">
      <div v-if="dataLoading" class="p-10 text-center">
        <el-icon class="is-loading" size="24">
          <Loading />
        </el-icon>
        <p>加载中...</p>
      </div>
      <div v-else-if="!executionData" class="p-10 text-center">
        <p>未能加载执行数据。</p>
      </div>
      <div v-else class="page-main">
        <div class="overview-card">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-bold">
              {{ executionData.playbookName }}
            </h2>
            <FaButton type="primary" :loading="isRefreshing" @click="loadReport">
              <template #icon>
                <el-icon><Refresh /></el-icon>
              </template>
              手动刷新
            </FaButton>
          </div>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="执行ID">
              {{ executionData.executionId }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTagType(executionData.status)">
                {{ executionData.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="耗时">
              {{ executionData.elapsedTime }}
            </el-descriptions-item>
            <el-descriptions-item label="目标主机">
              <el-tag v-for="host in executionData.targetHosts" :key="host" class="mr-1">
                {{ host }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="预案内容">
              <el-tooltip
                effect="dark"
                placement="top"
              >
                <template #content>
                  <pre>{{ playbookContentForTooltip }}</pre>
                </template>
                <el-icon class="cursor-pointer">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="results-card">
          <h3 class="mb-4 text-lg font-semibold">
            执行详情
          </h3>
          <div v-for="(hostResult, index) in executionData.results" :key="index" class="host-result-group">
            <h4 class="text-md rounded bg-gray-100 p-2 font-bold dark:bg-gray-800">
              主机: {{ hostResult.host }}
            </h4>
            <div v-for="(step, stepIndex) in hostResult.steps" :key="stepIndex" class="step-item">
              <div class="step-header">
                <strong>{{ step.command }}</strong>
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
.overview-card, .results-card {
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
