<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteHost, getHostList } from '@/api/modules/host'
import { getTagList } from '@/api/modules/tag'
import CommonTable from '@/components/CommonTable/index.vue'
import RemarkModal from './components/RemarkModal.vue'
import TagModal from './components/TagModal.vue'

const router = useRouter()

const searchForm = ref({
  hostname: '',
  tags: [],
})

const dataList = ref([])
const dataLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const tagList = ref<any[]>([])

const remarkModalVisible = ref(false)
const tagModalVisible = ref(false)
const currentItem = ref(null)

const tableOptions = ref([
  { label: 'IP地址', prop: 'hostname', width: '200' },
  { label: '内存%', prop: 'memPer', width: '100' },
  { label: 'CPU%', prop: 'cpuPer', width: '100' },
  { label: '磁盘%', prop: 'diskPer', width: '100' },
  { label: '标签', prop: 'tagNameList', width: '200' },
  { label: '更新时间', prop: 'createTime', width: '180' },
  { label: '备注', prop: 'remark' },
  { label: '操作', prop: 'action', width: '320' },
])

// 根据数值返回徽章类型
function getBadgeType(value: number) {
  if (value >= 90) {
    return 'danger'
  }
  if (value >= 70) {
    return 'warning'
  }
  return 'primary'
}

async function fetchTags() {
  try {
    const res: any = await getTagList({ page: 1, pageSize: 1000 })
    tagList.value = res.data.list || []
  }
  catch (error) {
    console.error('Failed to load tags', error)
  }
}

async function loadData() {
  dataLoading.value = true
  try {
    const params = {
      ...searchForm.value,
      tags: searchForm.value.tags.join(','),
      account: '',
      page: page.value,
      pageSize: pageSize.value,
    }
    if (params.hostname) {
      params.account = params.hostname
    }
    const res: any = await getHostList(params)
    dataList.value = res.data.list
    total.value = res.data.total
  }
  catch (error) {
    console.error('Failed to load host list', error)
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
  searchForm.value.hostname = ''
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

function handleOpenRemarkModal(item: any) {
  currentItem.value = { ...item }
  remarkModalVisible.value = true
}

function handleOpenTagModal(item: any) {
  currentItem.value = { ...item }
  tagModalVisible.value = true
}

function handleViewDetails(item: any) {
  router.push(`/host/detail/${item.id}`)
}

function handleViewProcesses(item: any) {
  // 预留功能
  ElMessage.info('进程功能待实现')
}

function handleDelete(item: any) {
  ElMessageBox.confirm(`确定删除主机 "${item.hostname}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteHost(item.id)
      ElMessage.success('删除成功')
      loadData()
    })
    .catch(() => {})
}

onMounted(() => {
  loadData()
  fetchTags()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader title="主机管理" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div class="search-card">
          <el-form :model="searchForm" inline>
            <el-form-item label="IP/主机名">
              <FaInput v-model="searchForm.hostname" placeholder="请输入IP或主机名" clearable />
            </el-form-item>
            <el-form-item label="标签">
              <el-select
                v-model="searchForm.tags"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="按标签筛选"
                clearable
                style="width: 240px"
              >
                <el-option
                  v-for="tag in tagList"
                  :key="tag.id"
                  :label="tag.tagName"
                  :value="tag.id"
                />
              </el-select>
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
          <CommonTable v-loading="dataLoading" :list="dataList" :options="tableOptions">
            <template #hostname="{ row }">
              <span :class="{ 'text-red-500': row.state === '2' }" :title="row.state === '2' ? '可能已下线' : ''">
                {{ row.hostname }}
              </span>
            </template>
            <template #memPer="{ row }">
              <el-tag :type="getBadgeType(row.memPer)">
                {{ row.memPer }}
              </el-tag>
            </template>
            <template #cpuPer="{ row }">
              <el-tag :type="getBadgeType(row.cpuPer)">
                {{ row.cpuPer }}
              </el-tag>
            </template>
            <template #diskPer="{ row }">
              <el-tag :type="getBadgeType(row.diskPer)">
                {{ row.diskPer }}
              </el-tag>
            </template>
            <template #tagNameList="{ row }">
              <el-tag v-for="tag in (row.tagNameList || '').split(',').filter(Boolean)" :key="tag" class="mb-1 mr-1">
                {{ tag }}
              </el-tag>
            </template>
            <template #action="{ row }">
              <div class="flex flex-wrap gap-2">
                <FaButton type="text" @click="handleOpenTagModal(row)">
                  标签
                </FaButton>
                <FaButton type="text" @click="handleOpenRemarkModal(row)">
                  备注
                </FaButton>
                <FaButton type="text" @click="handleViewDetails(row)">
                  详情
                </FaButton>
                <FaButton type="text" @click="handleViewProcesses(row)">
                  进程
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
    <RemarkModal v-model="remarkModalVisible" :item="currentItem" @success="loadData" />
    <TagModal v-model="tagModalVisible" :item="currentItem" @success="loadData" />
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
