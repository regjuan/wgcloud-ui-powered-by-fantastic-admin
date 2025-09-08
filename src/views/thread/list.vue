<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable/index.vue'
import { getThreadList, deleteThread } from '@/api/modules/thread'
import { getTagList } from '@/api/modules/tag'

const router = useRouter()

const search = reactive({
  taskName: '',
  tags: '',
})

const table = reactive({
  loading: false,
  list: [],
  options: [
    { label: '任务名称', prop: 'taskName' },
    { label: '进程关键字', prop: 'processKeyword' },
    { label: '目标标签', prop: 'targetTags' },
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

const tagOptions = ref([])

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

async function fetchTags() {
  const res = await getTagList({ page: 1, pageSize: 1000 })
  tagOptions.value = res.data.list
}

function handleSearch() {
  pagination.pageNum = 1
  fetchData()
}

function handleReset() {
  search.taskName = ''
  search.tags = ''
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
  fetchTags()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader title="线程监控任务管理" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div class="search-card">
          <ElForm :model="search" inline>
            <ElFormItem label="任务名称">
              <ElInput v-model="search.taskName" placeholder="请输入任务名称" clearable @keyup.enter="handleSearch" />
            </ElFormItem>
            <ElFormItem label="选择标签">
              <ElSelect v-model="search.tags" placeholder="请选择标签" clearable>
                <ElOption v-for="tag in tagOptions" :key="tag.id" :label="tag.tagName" :value="tag.tagName" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem>
              <div class="flex gap-2">
                <FaButton type="primary" @click.prevent="handleSearch">
                  查询
                </FaButton>
                <FaButton @click.prevent="handleReset">
                  重置
                </FaButton>
              </div>
            </ElFormItem>
          </ElForm>
        </div>
        <div class="table-card">
          <div class="action-bar">
            <FaButton type="primary" @click="handleAdd">
              <template #icon>
                <el-icon><Plus /></el-icon>
              </template>
              新建任务
            </FaButton>
          </div>
          <CommonTable
            v-loading="table.loading"
            :list="table.list"
            :options="table.options"
          >
            <template #targetTags="{ row }">
              <template v-if="row.targetTags">
                <template v-if="typeof row.targetTags === 'string' && row.targetTags.startsWith('[')">
                  <el-tag v-for="tag in JSON.parse(row.targetTags)" :key="tag" class="mb-1 mr-1">
                    {{ tag }}
                  </el-tag>
                </template>
                <template v-else>
                  <el-tag class="mb-1 mr-1">
                    {{ row.targetTags }}
                  </el-tag>
                </template>
              </template>
            </template>
            <template #action="{ row }">
              <div class="flex gap-2">
                <FaButton type="text"  @click="handleEdit(row)">
                  编辑
                </FaButton>
                <FaButton type="text" variant="destructive"  @click="handleDelete(row)">
                  删除
                </FaButton>
              </div>
            </template>
          </CommonTable>
          <el-pagination
            class="mt-4 justify-end"
            :current-page="pagination.pageNum"
            :page-size="pagination.pageSize"
            :total="pagination.total"
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
.search-card, .table-card {
  padding: 16px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
}
.action-bar {
  margin-bottom: 16px;
}
</style>
