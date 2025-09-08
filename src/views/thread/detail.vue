<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getThreadDetailList } from '@/api/modules/thread'
import { getTagList } from '@/api/modules/tag'
import CommonTable from '@/components/CommonTable/index.vue'

const search = reactive({
  hostname: '',
  status: '',
  tagId: '',
})

const table = reactive({
  loading: false,
  list: [],
  options: [
    { label: '主机名', prop: 'hostname' },
    { label: '进程关键字', prop: 'processKeyword' },
    {
      label: '状态',
      prop: 'status',
      formatter: (value: string) => {
        return value === '1'
          ? '<span class="text-green-500">正常</span>'
          : '<span class="text-red-500">异常</span>'
      },
    },
    { label: '最后心跳', prop: 'lastHeartbeat' },
    { label: '创建时间', prop: 'createTime' },
  ],
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const tagOptions = ref([])
const statusOptions = ref([
  { label: '正常', value: '1' },
  { label: '异常', value: '0' },
])

async function fetchData() {
  table.loading = true
  try {
    const params = {
      ...search,
      page: pagination.pageNum,
      pageSize: pagination.pageSize,
    }
    const res = await getThreadDetailList(params)
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
  search.hostname = ''
  search.status = ''
  search.tagId = ''
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

onMounted(() => {
  fetchData()
  fetchTags()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <FaPageHeader title="线程监控详情" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <div class="search-card">
          <ElForm :model="search" inline>
            <ElFormItem label="主机名">
              <ElInput v-model="search.hostname" placeholder="请输入主机名" clearable @keyup.enter="handleSearch" />
            </ElFormItem>
            <ElFormItem label="状态">
              <ElSelect v-model="search.status" placeholder="请选择状态" clearable>
                <ElOption v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="选择标签">
              <ElSelect v-model="search.tagId" placeholder="请选择标签" clearable>
                <ElOption v-for="tag in tagOptions" :key="tag.id" :label="tag.tagName" :value="tag.id" />
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
          <CommonTable
            v-loading="table.loading"
            :list="table.list"
            :options="table.options"
          />
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
</style>
