<template>
  <div class="h-full flex flex-col">
    <FaPageHeader title="预案管理" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div class="search-card">
          <el-form :model="searchForm" inline>
            <el-form-item label="预案名称">
              <FaInput v-model="searchForm.playbookName" placeholder="请输入预案名称" clearable />
            </el-form-item>
            <el-form-item>
              <div class="gap-2">
                <FaButton type="primary" @click="handleSearch">
                  查询
                </FaButton>
                <FaButton @click="handleReset">
                  重置
                </FaButton>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="table-card">
          <div class="action-bar">
            <FaButton type="primary" @click="handleCreate">
              <template #icon>
                <el-icon><Plus /></el-icon>
              </template>
              新建预案
            </FaButton>
          </div>
          <CommonTable v-loading="dataLoading" :list="dataList" :options="tableOptions">
            <template #commandCount="{ row }">
              <el-tag>{{ row.taskStepList?.length || 0 }}</el-tag>
            </template>
            <template #action="{ row }">
              <div class="flex flex-wrap gap-2">
                <FaButton type="text" @click="handleExecute(row)">
                  执行
                </FaButton>
                <FaButton type="text" @click="handleEdit(row)">
                  编辑
                </FaButton>
                <FaButton type="text" @click="handleHistory(row)">
                  历史记录
                </FaButton>
                <FaButton type="text" variant="destructive" @click="handleDelete(row)">
                  删除
                </FaButton>
              </div>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getPlaybookList, deletePlaybook } from '@/api/modules/playbook'
import CommonTable from '@/components/CommonTable/index.vue'

const router = useRouter()

const searchForm = ref({
  playbookName: '',
})

const dataList = ref([])
const dataLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const tableOptions = ref([
  { label: '预案名称', prop: 'playbookName', width: '250' },
  { label: '描述', prop: 'playbookDesc' },
  { label: '内含指令数', prop: 'commandCount', width: '100' },
  { label: '操作', prop: 'action', width: '320' },
])

async function loadData() {
  dataLoading.value = true
  try {
    const params = {
      ...searchForm.value,
      page: page.value,
      pageSize: pageSize.value,
    }
    const res: any = await getPlaybookList(params)
    dataList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load playbook list', error)
  } finally {
    dataLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  searchForm.value.playbookName = ''
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

function handleCreate() {
  router.push('/playbook/editor')
}

function handleEdit(item: any) {
  router.push(`/playbook/editor/${item.id}`)
}

function handleExecute(item: any) {
  ElMessage.info(`即将执行预案: ${item.playbookName}`)
}

function handleHistory(item: any) {
  router.push(`/playbook/history?playbookId=${item.id}`)
}

function handleDelete(item: any) {
  ElMessageBox.confirm(`确定删除预案 "${item.playbookName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deletePlaybook(item.id)
      ElMessage.success('删除成功')
      loadData()
    })
    .catch(() => {})
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
.action-bar {
  margin-bottom: 16px;
}
</style>
