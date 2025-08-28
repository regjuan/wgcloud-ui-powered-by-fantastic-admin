<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { LogMon } from '@/api/modules/logMon'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { deleteLogMon, getLogMonList, saveLogMon } from '@/api/modules/logMon'
import { getTagList } from '@/api/modules/tag'
import CommonTable from '@/components/CommonTable/index.vue'

// --- State ---

const searchForm = ref({
  appName: '',
})

const dataList = ref<any[]>([])
const dataLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const formModel = ref<LogMon>({
  appName: '',
  filePath: '',
  matchKeywords: '',
  targetTagsList: [],
  active: '1',
})
const formRules = reactive<FormRules>({
  appName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  filePath: [{ required: true, message: '请输入日志路径', trigger: 'blur' }],
  matchKeywords: [{ required: true, message: '请输入监控关键词', trigger: 'blur' }],
  targetTagsList: [{ required: true, message: '请至少选择一个标签', trigger: 'change' }],
})

const tagOptions = ref<{ id: string, tagName: string, logPath?: string | null }[]>([])

const tableOptions = ref([
  { label: '任务名称', prop: 'appName', width: '200' },
  { label: '日志路径', prop: 'filePath' },
  { label: '关键词', prop: 'matchKeywords', width: '150' },
  { label: '绑定标签', prop: 'targetTagsList', width: '250' },
  { label: '状态', prop: 'active', width: '150' },
  { label: '操作', prop: 'action', width: '180' },
])

// --- Functions ---

async function loadData() {
  dataLoading.value = true
  try {
    const params = {
      ...searchForm.value,
      page: page.value,
      pageSize: pageSize.value,
    }
    const res = await getLogMonList(params)
    dataList.value = res.data.page.list
    total.value = res.data.page.total
  }
  catch (error) {
    console.error('Failed to load log monitor list', error)
  }
  finally {
    dataLoading.value = false
  }
}

async function loadTags() {
  try {
    const res = await getTagList({ page: 1, pageSize: 1000 })
    tagOptions.value = res.data.list
  }
  catch (error) {
    console.error('Failed to load tags', error)
  }
}

function handleSearch() {
  page.value = 1
  loadData()
}

function handleReset() {
  searchForm.value.appName = ''
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
  isEdit.value = false
  formModel.value = {
    appName: '',
    filePath: '',
    matchKeywords: '',
    targetTagsList: [],
    active: '1',

  }
  formRef.value?.resetFields()
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  formModel.value = {
    id: row.id,
    appName: row.appName,
    filePath: row.filePath,
    matchKeywords: row.matchKeywords || '',
    targetTagsList: row.targetTagsList || [],
    active: row.active || '1',
  }
  dialogVisible.value = true
}

function handleDelete(item: LogMon) {
  ElMessageBox.confirm(`确定删除任务 "${item.appName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteLogMon(item.id)
      ElMessage.success('删除成功')
      loadData()
    })
    .catch(() => {})
}

async function submitForm() {
  try {
    await formRef.value?.validate()
    await saveLogMon(formModel.value)
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    dialogVisible.value = false
    loadData()
  }
  catch (error) {
    console.error(error)
    // No need to show error message as form validation will do it
  }
}

function handleTagChange(selectedTagNames: string[]) {
  if (!selectedTagNames || selectedTagNames.length === 0) {
    return
  }
  for (const option of tagOptions.value) {
    if (selectedTagNames.includes(option.tagName)) {
      if (option.logPath) {
        formModel.value.filePath = option.logPath
        return
      }
    }
  }
}

// --- Lifecycle ---

onMounted(() => {
  loadData()
  loadTags()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader title="监控任务管理" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div class="search-card">
          <el-form :model="searchForm" inline>
            <el-form-item label="任务名称">
              <FaInput v-model="searchForm.appName" placeholder="请输入任务名称" clearable />
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
              新增任务
            </FaButton>
          </div>

          <CommonTable v-loading="dataLoading" :list="dataList" :options="tableOptions">
            <template #targetTagsList="{ row }">
              <el-tag v-for="tag in row.targetTagsList" :key="tag" class="mb-1 mr-1">
                {{ tag }}
              </el-tag>
            </template>
            <template #active="{ row }">
              <el-tag :type="row.active === '1' ? 'success' : 'info'">
                {{ row.active === '1' ? '运行中' : '已停止' }}
              </el-tag>
            </template>
            <template #action="{ row }">
              <div class="flex gap-2">
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

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑任务' : '新增任务'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="appName">
          <FaInput v-model="formModel.appName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="日志路径" prop="filePath">
          <FaInput v-model="formModel.filePath" placeholder="请输入绝对路径, 如 /var/log/app.log" />
        </el-form-item>
        <el-form-item label="监控关键词" prop="matchKeywords">
          <FaInput v-model="formModel.matchKeywords" placeholder="请输入需要监控的关键词, 如 ERROR" />
        </el-form-item>
        <el-form-item label="绑定标签" prop="tags">
          <el-select
            v-model="formModel.targetTagsList"
            multiple
            filterable
            placeholder="请选择或输入标签"
            style="width: 100%;"
            @change="handleTagChange"
          >
            <el-option
              v-for="item in tagOptions"
              :key="item.id"
              :label="item.tagName"
              :value="item.tagName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用" prop="active">
          <el-switch
            v-model="formModel.active"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <FaButton @click="dialogVisible = false">
          取 消
        </FaButton>
        <FaButton type="primary" @click="submitForm">
          确 定
        </FaButton>
      </template>
    </el-dialog>
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
