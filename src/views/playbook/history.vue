<template>
  <div class="h-full flex flex-col">
    <FaPageHeader title="执行历史" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div class="search-card">
          <el-form :model="searchForm" inline>
            <el-form-item label="执行状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 200px"
              >
                <el-option label="成功" value="SUCCESS" />
                <el-option label="失败" value="FAILED" />
                <el-option label="运行中" value="RUNNING" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <FaButton type="primary" @click="handleSearch">
                查询
              </FaButton>
              <FaButton @click="handleReset">
                重置
              </FaButton>
            </el-form-item>
          </el-form>
        </div>
        <div class="table-card">
          <CommonTable v-loading="dataLoading" :list="dataList" :options="tableOptions">
            <template #status="{ row }">
              <el-tag
                :type="statusTagType(row.status)"
              >
                {{ row.status }}
              </el-tag>
            </template>
            <template #executionResult="{ row }">
              <span v-if="row.status === 'SUCCESS'" class="text-green-600">全部成功</span>
              <span v-else-if="row.status === 'FAILED'" class="text-red-600">部分失败</span>
              <span v-else>-</span>
            </template>
            <template #action="{ row }">
              <FaButton type="primary" size="small" @click="viewReport(row)">
                查看详情
              </FaButton>
            </template>
          </CommonTable>
          <el-pagination
            class="mt-4 justify-end"
            :current-page="page"
            :page-size="pageSize"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </FaPageMain>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlaybookHistory } from '@/api/modules/playbook'
import CommonTable from '@/components/CommonTable/index.vue'

const route = useRoute()
const router = useRouter()

const searchForm = ref({
  status: '',
  playbookId: route.query.playbookId || null,
})

const dataList = ref([])
const dataLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const tableOptions = ref([
  { label: '执行ID', prop: 'executionId', width: '250' },
  { label: '预案名称', prop: 'playbookName' },
  { label: '状态', prop: 'status', width: '120' },
  { label: '执行结果', prop: 'executionResult', width: '150' },
  { label: '开始时间', prop: 'startTime', width: '200' },
  { label: '耗时', prop: 'duration', width: '100' },
  { label: '操作', prop: 'action', width: '120' },
])

const statusTagType = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return 'success'
    case 'FAILED':
      return 'danger'
    case 'RUNNING':
      return 'primary'
    default:
      return 'info'
  }
}

async function loadData() {
  dataLoading.value = true
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
    }
    if (searchForm.value.status) {
      params.status = searchForm.value.status
    }
    if (searchForm.value.playbookId) {
      params.playbookId = searchForm.value.playbookId
    }
    const res: any = await getPlaybookHistory(params)
    dataList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load playbook history', error)
  } finally {
    dataLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  searchForm.value.status = ''
  page.value = 1
  loadData()
}

function handleSizeChange(val: number) {
  pageSize.value = val
  loadData()
}

function handleCurrentChange(val: number) {
  page.value = val
  loadData()
}

function viewReport(item: any) {
  router.push(`/playbook/execution/${item.executionId}`)
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.page-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.search-card, .table-card {
  padding: 16px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
}
</style>
