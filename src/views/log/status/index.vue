<script setup lang="ts">
import type { HostLogStatus } from '@/api/modules/logMon'
import { onMounted, ref } from 'vue'
import { getLogMonStatusByHost } from '@/api/modules/logMon'

const loading = ref(false)
const statusData = ref<HostLogStatus[]>([])

async function fetchStatusData() {
  loading.value = true
  try {
    const res = await getLogMonStatusByHost()
    statusData.value = res.data
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

function getStatusTagType(status: string) {
  if (!status) {
    return 'info'
  }
  switch (status.toUpperCase()) {
    case 'ERROR':
    case 'FILE_NOT_FOUND':
      return 'danger'
    case 'WARN':
      return 'warning'
    case 'OK':
    case 'NORMAL':
      return 'success'
    default:
      return 'info'
  }
}

onMounted(() => {
  fetchStatusData()
})
</script>

<template>
  <div>
    <FaPageHeader title="日志监控归档" />
    <FaPageMain>
      <el-table
        v-loading="loading"
        :data="statusData"
        style="width: 100%"
        border
        row-key="hostname"
      >
        <!-- Expandable Content -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expanded-content">
              <h4>{{ row.hostname }} - 监控任务详情</h4>
              <el-table :data="row.monTasks" border size="small">
                <el-table-column prop="taskName" label="任务名称" />
                <el-table-column prop="filePath" label="日志路径" />
                <el-table-column prop="status" label="任务状态">
                  <template #default="{ row: taskRow }">
                    <el-tag :type="getStatusTagType(taskRow.status)">
                      {{ taskRow.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="lastAlertTime" label="最后告警时间" />
                <el-table-column prop="todayAlerts" label="今日告警数" />
              </el-table>
            </div>
          </template>
        </el-table-column>

        <!-- Main Table Columns -->
        <el-table-column prop="hostname" label="主机名" width="250" />
        <el-table-column prop="ip" label="IP地址" width="180" />
        <el-table-column prop="tags" label="标签">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags" :key="tag" style="margin-right: 4px;">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="overallStatus" label="整体状态" width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.overallStatus)">
              {{ row.overallStatus }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </FaPageMain>
  </div>
</template>

<style scoped>
.expanded-content {
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
}

.expanded-content h4 {
  margin-top: 0;
  margin-bottom: 12px;
}
</style>
