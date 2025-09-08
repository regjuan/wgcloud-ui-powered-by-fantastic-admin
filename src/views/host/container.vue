<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getContainerList } from '@/api/modules/container'
import CommonTable from '@/components/CommonTable/index.vue'

const route = useRoute()
const hostId = route.params.hostId as string
const hostName = route.query.hostName as string

const dataList = ref([])
const dataLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const tableOptions = ref([
  { label: '容器ID', prop: 'containerId', width: '200' },
  { label: '名称', prop: 'names' },
  { label: '镜像', prop: 'image' },
  { label: '状态', prop: 'state', width: '100' },
  { label: 'CPU %', prop: 'cpuPer', width: '100' },
  { label: '内存 %', prop: 'memPer', width: '100' },
  { label: '内存', prop: 'memCache', width: '200' },
  { label: '运行时间', prop: 'uptime', width: '180' },
  { label: '最后心跳', prop: 'lastHeartbeat', width: '180' },
])

async function loadData() {
  dataLoading.value = true
  try {
    const params = {
      hostId,
      page: page.value,
      pageSize: pageSize.value,
    }
    const res: any = await getContainerList(params)
    dataList.value = res.data.list
    total.value = res.data.total
  }
  catch (error) {
    console.error('Failed to load container list', error)
  }
  finally {
    dataLoading.value = false
  }
}

function handleSizeChange(val: number) {
  pageSize.value = val
  loadData()
}

function handleCurrentChange(val: number) {
  page.value = val
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader :title="`容器列表 - ${hostName}`" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div class="table-card">
          <CommonTable v-loading="dataLoading" :list="dataList" :options="tableOptions">
            <template #state="{ row }">
              <el-tag :type="row.state === 'running' ? 'success' : 'danger'">
                {{ row.state }}
              </el-tag>
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
