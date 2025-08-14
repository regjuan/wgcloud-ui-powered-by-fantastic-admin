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
            <el-form-item label="标签">
              <el-select
                v-model="searchForm.tags"
                multiple
                placeholder="请选择标签"
                clearable
                style="width: 240px"
              >
                <el-option
                  v-for="item in tagList"
                  :key="item.id"
                  :label="item.tagName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <div class="flex gap-2">
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
              新建指令
            </FaButton>
          </div>
          <CommonTable v-loading="dataLoading" :list="dataList" :options="tableOptions">
            <template #tags="{ row }">
              <div class="flex flex-wrap gap-1">
                <el-tag v-for="tag in row.tags" :key="tag.id" type="primary" size="small">
                  {{ tag.tagName }}
                </el-tag>
              </div>
            </template>
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
    <FormModal v-model="formVisible" :item="currentItem" :tags="tagList" @success="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCommandList, deleteCommand, cloneCommand } from '@/api/modules/command'
import { getTagList } from '@/api/modules/tag'
import CommonTable from '@/components/CommonTable/index.vue'
import FormModal from './components/FormModal.vue'

const searchForm = ref({
  cmdName: '',
  tags: [],
})

const dataList = ref([])
const dataLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const formVisible = ref(false)
const currentItem = ref(null)

const tagList = ref<any[]>([])

const tableOptions = ref([
  { label: '指令名称', prop: 'cmdName', width: '250' },
  { label: '关联标签', prop: 'tags' },
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
    if (searchForm.value.tags.length > 0) {
      params.tags = searchForm.value.tags.join(',')
    }
    const res: any = await getCommandList(params)
    dataList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load commands', error)
  } finally {
    dataLoading.value = false
  }
}

async function loadTags() {
  try {
    const res: any = await getTagList({ page: 1, pageSize: 999 })
    tagList.value = res.data.list
  } catch (error) {
    console.error('Failed to load tags', error)
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  searchForm.value.cmdName = ''
  searchForm.value.tags = []
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
    const clonedItem = { ...res.data, id: undefined, cmdName: `${res.data.cmdName} (Clone)` }
    currentItem.value = clonedItem
    formVisible.value = true
  } catch (error) {
    ElMessage.error('克隆失败')
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
  loadTags()
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
