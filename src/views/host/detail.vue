<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getResourceByHostname } from '@/api/modules/host'

const route = useRoute()
const hostname = route.params.hostname as string

const loading = ref(false)
const hostDetail = ref<any>(null)

const deskStateColumns = [
  { prop: 'fileSystem', label: '文件系统' },
  { prop: 'size', label: '大小' },
  { prop: 'used', label: '已用' },
  { prop: 'avail', label: '可用' },
  { prop: 'usePer', label: '使用率' },
  { prop: 'createTime', label: '更新时间' },
]

async function fetchData() {
  loading.value = true
  try {
    const res: any = await getResourceByHostname(hostname)
    hostDetail.value = res.data
  }
  catch (error) {
    console.error('Failed to load host details', error)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader :title="`主机详情: ${hostname}`" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div v-if="loading">
          <el-skeleton :rows="10" animated />
        </div>
        <div v-if="!loading && hostDetail" class="flex flex-col gap-4">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>CPU状态</span>
              </div>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户空间占比">{{ hostDetail.cpuState.user }}%</el-descriptions-item>
              <el-descriptions-item label="内核空间占比">{{ hostDetail.cpuState.sys }}%</el-descriptions-item>
              <el-descriptions-item label="空闲">{{ hostDetail.cpuState.idle }}%</el-descriptions-item>
              <el-descriptions-item label="IO等待">{{ hostDetail.cpuState.iowait }}%</el-descriptions-item>
              <el-descriptions-item label="硬中断">{{ hostDetail.cpuState.irq }}%</el-descriptions-item>
              <el-descriptions-item label="软中断">{{ hostDetail.cpuState.soft }}%</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ hostDetail.cpuState.createTime }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>内存状态</span>
              </div>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="总内存">{{ hostDetail.memState.total }} MB</el-descriptions-item>
              <el-descriptions-item label="已用内存">{{ hostDetail.memState.used }} MB</el-descriptions-item>
              <el-descriptions-item label="剩余内存">{{ hostDetail.memState.free }} MB</el-descriptions-item>
              <el-descriptions-item label="使用率">{{ hostDetail.memState.usePer }}%</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ hostDetail.memState.createTime }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>网络IO状态</span>
              </div>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="接收速率 (rxpck/s)">{{ hostDetail.netIoState.rxpck }}</el-descriptions-item>
              <el-descriptions-item label="发送速率 (txpck/s)">{{ hostDetail.netIoState.txpck }}</el-descriptions-item>
              <el-descriptions-item label="接收流量 (rxbyt/s)">{{ hostDetail.netIoState.rxbyt }} KB</el-descriptions-item>
              <el-descriptions-item label="发送流量 (txbyt/s)">{{ hostDetail.netIoState.txbyt }} KB</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ hostDetail.netIoState.createTime }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>磁盘状态</span>
              </div>
            </template>
            <el-table :data="hostDetail.deskStateList" stripe border>
              <el-table-column v-for="col in deskStateColumns" :key="col.prop" :prop="col.prop" :label="col.label" />
            </el-table>
          </el-card>
        </div>
        <el-empty v-if="!loading && !hostDetail" description="暂无数据" />
      </div>
    </FaPageMain>
  </div>
</template>

<style lang="scss" scoped>
.page-main {
  padding: 16px;
}
.box-card {
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  border: none;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}
:deep(.el-card__header) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}
</style>