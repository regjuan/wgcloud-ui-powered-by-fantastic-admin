<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlaybookHistoryList } from '@/api/modules/playbook'
import CommonTable from '@/components/CommonTable/index.vue'

const route = useRoute()
const router = useRouter()

const playbookId = computed(() => route.query.playbookId as string)

const dataList = ref([])
const dataLoading = ref(false)
const playbookName = ref('')

const tableOptions = ref([
  { label: '预案名称', prop: 'playbookName', width: '200' },
  { label: '开始时间', prop: 'startTime', width: '200' },
  { label: '状态', prop: 'overallStatus', width: '120' },
  { label: '总步骤', prop: 'totalSteps', width: '100' },
  { label: '成功', prop: 'successSteps', width: '100' },
  { label: '失败', prop: 'failedSteps', width: '100' },
  { label: '操作', prop: 'action', width: '120' },
])

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

async function loadData() {
  if (!playbookId.value) {
    return
  }
  dataLoading.value = true
  try {
    const res: any = await getPlaybookHistoryList(playbookId.value)
    dataList.value = res.data
    if (res.data && res.data.length > 0) {
      playbookName.value = res.data[0].playbookName
    }
  }
  catch (error) {
    console.error('Failed to load playbook history', error)
  }
  finally {
    dataLoading.value = false
  }
}

function viewDetails(row: any) {
  router.push({
    name: 'PlaybookHistoryDetails', // 将在下一步中创建
    query: {
      taskId: row.playbookId,
      startTime: row.startTime,
    },
  })
}

function goBack() {
  router.push('/playbook')
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader :title="`执行历史: ${playbookName}`" @back="goBack" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div class="table-card">
          <CommonTable v-loading="dataLoading" :list="dataList" :options="tableOptions">
            <template #overallStatus="{ row }">
              <el-tag :type="statusTagType(row.overallStatus)">
                {{ row.overallStatus }}
              </el-tag>
            </template>
            <template #successSteps="{ row }">
              <span class="text-green-500">{{ row.successSteps }}</span>
            </template>
            <template #failedSteps="{ row }">
              <span :class="{ 'text-red-500': row.failedSteps > 0 }">{{ row.failedSteps }}</span>
            </template>
            <template #action="{ row }">
              <FaButton type="text" @click="viewDetails(row)">
                查看详情
              </FaButton>
            </template>
          </CommonTable>
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
.table-card {
  padding: 16px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
}
</style>
