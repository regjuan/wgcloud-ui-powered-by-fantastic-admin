<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { cloneCommand, deleteCommand, getCommandList } from '@/api/modules/command'
import CommonTable from '@/components/CommonTable/index.vue'
import FormModal from './components/FormModal.vue'

const searchForm = ref({
  cmdName: '',
})

const dataList = ref([])
const dataLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const formVisible = ref(false)
const currentItem = ref(null)

const tableOptions = ref([
  { label: '指令名称', prop: 'cmdName', width: '250' },
  { 'label': '脚本内容', 'prop': 'cmdContent', 'show-overflow-tooltip': true },
  { label: '超时(秒)', prop: 'timeout', width: '100' },
  { label: '操作', prop: 'action', width: '230' },
])

async function loadData() {
  dataLoading.value = true
  try {
    const params: any = {
      cmdName: searchForm.value.cmdName,
      page: page.value,
      pageSize: pageSize.value,
    }
    const res: any = await getCommandList(params)
    dataList.value = res.data.list
    total.value = res.data.total
  }
  catch (error) {
    console.error('Failed to load commands', error)
  }
  finally {
    dataLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  searchForm.value.cmdName = ''
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
  currentItem.value = null
  formVisible.value = true
}

function handleEdit(item: any) {
  currentItem.value = { ...item }
  formVisible.value = true
}

async function handleClone(item: any) {
  try {
    const res: any = await cloneCommand(item.id)
    // The new API returns { command: {}, allTags: [] }
    if (res.data.command) {
      const clonedItem = { ...res.data.command, id: undefined, cmdName: `${res.data.command.cmdName} (Clone)` }
      currentItem.value = clonedItem
      formVisible.value = true
    }
    else {
      ElMessage.error('克隆失败：未找到指令')
    }
  }
  catch (error) {
    ElMessage.error('克隆失败')
    console.error('Failed to clone command', error)
  }
}

function handleDelete(item: any) {
  ElMessageBox.confirm(`确定删除指令 "${item.cmdName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteCommand(item.id)
      ElMessage.success('删除成功')
      loadData()
    })
    .catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader title="指令库管理" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div class="search-card">
          <el-form :model="searchForm" inline>
            <el-form-item label="指令名称">
              <FaInput v-model="searchForm.cmdName" placeholder="请输入指令名称" clearable />
            </el-form-item>
            <el-form-item>
              <div class="flex gap-2">
                <FaButton type="primary" @click.prevent="handleSearch">
                  查询
                </FaButton>
                <FaButton @click.prevent="handleReset">
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
              新建指令
            </FaButton>
          </div>
          <CommonTable v-loading="dataLoading" :list="dataList" :options="tableOptions">
            <template #action="{ row }">
              <div class="flex gap-3">
                <FaButton type="text" @click="handleEdit(row)">
                  编辑
                </FaButton>
                <FaButton type="text" @click="handleClone(row)">
                  克隆
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
    <FormModal v-model="formVisible" :item="currentItem" @success="loadData" />
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
