<template>
  <div class="h-full flex flex-col">
    <FaPageHeader title="标签管理" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div class="search-card">
          <el-form :model="searchForm" inline>
            <el-form-item label="标签名称">
              <FaInput v-model="searchForm.tagName" placeholder="请输入标签名称" clearable />
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
          <div class="action-bar">
            <FaButton type="primary" @click="handleCreate">
              <template #icon>
                <el-icon><Plus /></el-icon>
              </template>
              新增标签
            </FaButton>
          </div>
          <CommonTable v-loading="dataLoading" :list="dataList" :options="tableOptions">
            <template #tagColor="{ row }">
              <div
                class="mx-auto h-5 w-5 rounded-full border"
                :style="{ backgroundColor: row.tagColor }"
              />
            </template>
            <template #action="{ row }">
              <div class="flex gap-3">
                <FaButton type="text" @click="handleEdit(row)">
                  编辑
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

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getTagList, deleteTag } from '@/api/modules/tag'
import CommonTable from '@/components/CommonTable/index.vue'
import FormModal from './components/FormModal.vue'

const searchForm = ref({
  tagName: '',
})

const dataList = ref([])
const dataLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const formVisible = ref(false)
const currentItem = ref(null)

const tableOptions = ref([
  { label: '标签名称', prop: 'tagName' },
  { label: '标签描述', prop: 'tagDesc' },
  { label: '颜色预览', prop: 'tagColor', width: '100' },
  { label: '创建时间', prop: 'createTime', width: '180' },
  { label: '操作', prop: 'action', width: '180' },
])

async function loadData() {
  dataLoading.value = true
  try {
    const res: any = await getTagList({
      ...searchForm.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    dataList.value = res.data.list
    total.value = res.data.total
  } finally {
    dataLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  searchForm.value.tagName = ''
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

function handleDelete(item: any) {
  ElMessageBox.confirm(`确定删除标签 "${item.tagName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteTag(item.id)
      ElMessage.success('删除成功')
      loadData()
    })
    .catch(() => {})
}

loadData()
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
