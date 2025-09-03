<script setup lang="ts">
import type { HostLogStatus } from '@/api/modules/logMon'
import { onMounted, reactive, ref } from 'vue'
import { getLogMonAlertDetails, getLogMonStatusByHost } from '@/api/modules/logMon'
import dayjs from 'dayjs'

const loading = ref(false)
const statusData = ref<HostLogStatus[]>([])

const searchForm = reactive({
  startTime: '',
  endTime: '',
  hostname: '',
  tag: '',
})

const dialogVisible = ref(false)
const alertDetails = ref({
  list: [],
  total: 0,
})
const alertDetailsLoading = ref(false)
const currentTask = ref<any>(null)
const alertDetailsPagination = reactive({
  page: 1,
  pageSize: 10,
  logMonId: '',
})

async function fetchStatusData() {
  loading.value = true
  try {
    const params = { ...searchForm }
    if (params.startTime === null) {
      params.startTime = ''
    }
    if (params.endTime === null) {
      params.endTime = ''
    }
    const res = await getLogMonStatusByHost({ params })
    statusData.value = res.data
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

function onSearch() {
  fetchStatusData()
}

function onReset() {
  searchForm.startTime = ''
  searchForm.endTime = ''
  searchForm.hostname = ''
  searchForm.tag = ''
  fetchStatusData()
}

async function showAlerkDetails(task: any) {
  currentTask.value = task
  alertDetailsPagination.logMonId = task.taskId
  alertDetailsPagination.page = 1
  dialogVisible.value = true
  await fetchAlertDetails()
}

async function fetchAlertDetails() {
  alertDetailsLoading.value = true
  try {
    const params: any = {
      logMonId: alertDetailsPagination.logMonId,
      page: alertDetailsPagination.page,
      pageSize: alertDetailsPagination.pageSize,
      startTime: searchForm.startTime,
      endTime: searchForm.endTime,
    }

    if (!params.startTime || !params.endTime) {
      const now = new Date()
      if (!params.startTime) {
        params.startTime = dayjs(now).startOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
      if (!params.endTime) {
        params.endTime = dayjs(now).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
    }

    const res = await getLogMonAlertDetails({ params })
    alertDetails.value.list = res.data.list
    alertDetails.value.total = res.data.total
  }
  catch (error) {
    console.error(error)
  }
  finally {
    alertDetailsLoading.value = false
  }
}

function handleAlertPageChange(page: number) {
  alertDetailsPagination.page = page
  fetchAlertDetails()
}

function getStatusTagType(status: string) {
  if (!status) {
    return 'info'
  }
  switch (status.toUpperCase()) {
    case 'ERROR':
    case 'FILE_NOT_FOUND':
    case 'ALERT':
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
      <el-form :model="searchForm" inline>
        <el-form-item label="主机名">
          <el-input v-model="searchForm.hostname" placeholder="输入主机名/IP" clearable />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="searchForm.tag" placeholder="输入标签名称" clearable />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.startTime"
            type="datetime"
            placeholder="开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
          <span style="margin: 0 8px;">-</span>
          <el-date-picker
            v-model="searchForm.endTime"
            type="datetime"
            placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">
            查询
          </el-button>
          <el-button @click="onReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
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
                <el-table-column prop="todayAlerts" label="任务告警数">
                  <template #default="{ row: taskRow }">
                    <el-button
                      v-if="taskRow.todayAlerts > 0"
                      type="danger"
                      link
                      @click="showAlerkDetails(taskRow)"
                    >
                      {{ taskRow.todayAlerts }}
                    </el-button>
                    <span v-else>0</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <!-- Main Table Columns -->
        <el-table-column prop="hostname" label="主机名" width="250" />
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
      <el-dialog
        v-model="dialogVisible"
        :title="`告警明细 - ${currentTask?.taskName}`"
        width="70%"
      >
        <div v-loading="alertDetailsLoading">
          <el-table :data="alertDetails.list" border>
            <el-table-column prop="hostname" label="主机" width="200" />
            <el-table-column prop="infoContent" label="告警内容" show-overflow-tooltip />
            <el-table-column prop="createTime" label="告警时间" width="200" />
          </el-table>
          <el-pagination
            v-if="alertDetails.total > alertDetailsPagination.pageSize"
            layout="prev, pager, next"
            :total="alertDetails.total"
            :current-page="alertDetailsPagination.page"
            :page-size="alertDetailsPagination.pageSize"
            style="margin-top: 16px; text-align: right;"
            @current-change="handleAlertPageChange"
          />
        </div>
      </el-dialog>
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
