<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable/index.vue'
import { getThreadList, deleteThread } from '@/api/modules/thread'
import { getHostList } from '@/api/modules/host'

const router = useRouter()

const search = reactive({
  taskName: '',
  hostId: '',
})

const table = reactive({
  loading: false,
  list: [],
  options: [
    { label: '任务名称', prop: 'taskName' },
    { label: '进程关键字', prop: 'processKeyword' },
    { label: '所属主机', prop: 'hostName' },
    {
      label: '状态',
      prop: 'active',
      formatter: (value: string) => {
        return value === '1'
          ? '<span class="text-green-500">启用</span>'
          : '<span class="text-red-500">停用</span>'
      },
    },
    { label: '创建时间', prop: 'createTime' },
    { label: '操作', prop: 'action', width: '200px' },
  ],
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const hostOptions = ref([])

async function fetchData() {
  table.loading = true
  try {
    const res = await getThreadList({
      ...search,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    })
    table.list = res.data.list
    pagination.total = res.data.total
  }
  finally {
    table.loading = false
  }
}

async function fetchHosts() {
  const res = await getHostList({})
  hostOptions.value = res.data.list
}

function handleSearch() {
  pagination.pageNum = 1
  fetchData()
}

function handleReset() {
  search.taskName = ''
  search.hostId = ''
  pagination.pageNum = 1
  fetchData()
}

function handleSizeChange(size: number) {
  pagination.pageSize = size
  fetchData()
}

function handleCurrentChange(page: number) {
  pagination.pageNum = page
  fetchData()
}

function handleAdd() {
  router.push('/thread/add')
}

function handleEdit(row: any) {
  router.push(`/thread/edit/${row.id}`)
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`您确定要删除任务【${row.taskName}】吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteThread(row.id)
    ElMessage.success('删除成功')
    await fetchData()
  }
  catch (error) {
    // catch cancel
  }
}

onMounted(() => {
  fetchData()
  fetchHosts()
})
</script>

<template>
  <div>
    <FaPageHeader>
      <ElForm :model="search" inline>
        <ElFormItem label="任务名称">
          <ElInput v-model="search.taskName" placeholder="请输入任务名称" clearable @keyup.enter="handleSearch" />
        </ElFormItem>
        <ElFormItem label="选择主机">
          <ElSelect v-model="search.hostId" placeholder="请选择主机" clearable>
            <ElOption v-for="host in hostOptions" :key="host.id" :label="host.hostname" :value="host.id" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">
            搜索
          </ElButton>
          <ElButton @click="handleReset">
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
      <template #extra>
        <ElButton type="primary" @click="handleAdd">
          新建任务
        </ElButton>
      </template>
    </FaPageHeader>
    <FaPageMain>
      <CommonTable
        v-loading="table.loading"
        :list="table.list"
        :options="table.options"
        :total="pagination.total"
        :page-num="pagination.pageNum"
        :page-size="pagination.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
        <template #action="{ row }">
          <ElButton type="primary" link size="small">
            查看图表
          </ElButton>
          <ElButton type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </ElButton>
          <ElButton type="danger" link size="small" @click="handleDelete(row)">
            删除
          </ElButton>
        </template>
      </CommonTable>
    </FaPageMain>
  </div>
</template>
