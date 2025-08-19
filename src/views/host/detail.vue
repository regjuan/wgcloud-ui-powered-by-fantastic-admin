<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getHostDetail, getHostChartData } from '@/api/modules/host'
import { Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const route = useRoute()
const hostId = route.params.id as string

const detailsLoading = ref(true)
const chartsLoading = ref(true)
const hostDetails = ref<any>(null)
const chartData = ref<any>(null)

const cpuChartEl = ref<HTMLElement | null>(null)
const memChartEl = ref<HTMLElement | null>(null)
const netChartEl = ref<HTMLElement | null>(null)

async function loadDetails() {
  detailsLoading.value = true
  try {
    const res: any = await getHostDetail(hostId)
    hostDetails.value = res.data
  } catch (error) {
    ElMessage.error('加载主机详情失败')
    console.error('Failed to load host details', error)
  } finally {
    detailsLoading.value = false
  }
}

async function loadChartData() {
  chartsLoading.value = true
  try {
    const res: any = await getHostChartData({ id: hostId })
    chartData.value = res.data
  } catch (error) {
    ElMessage.error('加载图表数据失败')
    console.error('Failed to load chart data', error)
  } finally {
    chartsLoading.value = false
  }
}

function initCharts() {
  if (!chartData.value) return

  // CPU Chart
  if (cpuChartEl.value) {
    const cpuChart = echarts.init(cpuChartEl.value)
    const cpuOption = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['用户', '系统', 'IO等待'] },
      xAxis: { type: 'category', data: chartData.value.cpuStateList.map((d: any) => d.createTime) },
      yAxis: { type: 'value', name: '使用率 (%)' },
      series: [
        { name: '用户', type: 'line', data: chartData.value.cpuStateList.map((d: any) => d.us) },
        { name: '系统', type: 'line', data: chartData.value.cpuStateList.map((d: any) => d.sy) },
        { name: 'IO等待', type: 'line', data: chartData.value.cpuStateList.map((d: any) => d.wa) },
      ],
    }
    cpuChart.setOption(cpuOption)
  }

  // Memory Chart
  if (memChartEl.value) {
    const memChart = echarts.init(memChartEl.value)
    const memOption = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['内存使用率'] },
      xAxis: { type: 'category', data: chartData.value.memStateList.map((d: any) => d.createTime) },
      yAxis: { type: 'value', name: '使用率 (%)' },
      series: [
        { name: '内存使用率', type: 'line', data: chartData.value.memStateList.map((d: any) => d.usePer) },
      ],
    }
    memChart.setOption(memOption)
  }

  // Network I/O Chart
  if (netChartEl.value) {
    const netChart = echarts.init(netChartEl.value)
    const netOption = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['接收', '发送'] },
      xAxis: { type: 'category', data: chartData.value.netIoStateList.map((d: any) => d.createTime) },
      yAxis: { type: 'value', name: 'KB/s' },
      series: [
        { name: '接收', type: 'line', data: chartData.value.netIoStateList.map((d: any) => (d.rxbyt / 1024).toFixed(2)) },
        { name: '发送', type: 'line', data: chartData.value.netIoStateList.map((d: any) => (d.txbyt / 1024).toFixed(2)) },
      ],
    }
    netChart.setOption(netOption)
  }
}

watch(chartData, (newData) => {
  if (newData) {
    nextTick(() => {
      initCharts()
    })
  }
})

onMounted(() => {
  loadDetails()
  loadChartData()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader :title="`主机详情: ${hostDetails?.systemInfo?.hostname || hostId}`" />
    <FaPageMain class="flex-1 overflow-auto">
      <div v-if="detailsLoading" class="p-10 text-center">
        <el-icon class="is-loading" size="24"><Loading /></el-icon>
        <p>加载中...</p>
      </div>
      <div v-else-if="!hostDetails" class="p-10 text-center">
        <p>未能加载主机数据。</p>
      </div>
      <div v-else class="page-main">
        <div class="info-card">
          <h3 class="card-title">基本信息</h3>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="主机名">{{ hostDetails.systemInfo.hostname }}</el-descriptions-item>
            <el-descriptions-item label="操作系统">{{ hostDetails.systemInfo.osName }}</el-descriptions-item>
            <el-descriptions-item label="系统架构">{{ hostDetails.systemInfo.cpuArch }}</el-descriptions-item>
            <el-descriptions-item label="CPU核心数">{{ hostDetails.systemInfo.cpuCore }}</el-descriptions-item>
            <el-descriptions-item label="总内存">{{ hostDetails.systemInfo.totalMem }} GB</el-descriptions-item>
            <el-descriptions-item label="上次更新">{{ hostDetails.systemInfo.createTime }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="info-card">
          <h3 class="card-title">磁盘分区</h3>
          <el-table :data="hostDetails.deskStateList" border stripe>
            <el-table-column prop="fileSystem" label="文件系统" />
            <el-table-column prop="size" label="总大小" />
            <el-table-column prop="used" label="已用" />
            <el-table-column prop="avail" label="可用" />
            <el-table-column prop="use" label="使用率">
              <template #default="{ row }">
                <el-progress :percentage="parseFloat(row.use.replace('%', ''))" />
              </template>
            </el-table-column>
            <el-table-column prop="mountedOn" label="挂载点" />
          </el-table>
        </div>

        <div class="info-card">
          <h3 class="card-title">性能图表</h3>
          <div v-if="chartsLoading" class="p-10 text-center">
            <el-icon class="is-loading" size="24"><Loading /></el-icon>
            <p>图表数据加载中...</p>
          </div>
          <div v-else class="charts-grid">
            <div ref="cpuChartEl" class="chart-container"></div>
            <div ref="memChartEl" class="chart-container"></div>
            <div ref="netChartEl" class="chart-container"></div>
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
.info-card {
  padding: 16px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}
.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.chart-container {
  width: 100%;
  height: 300px;
}
</style>

