<route lang="yaml">
meta:
  title: 线程监控
  icon: i-carbon:thread-schedule
</route>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as echarts from 'echarts'
import type { ThreadMon } from '@/api/modules/thread'
import { getThreadMonList, saveOrUpdateThreadMon, deleteThreadMonById, getThreadStateList } from '@/api/modules/thread'

const tableData = ref<ThreadMon[]>()
const total = ref(0)
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogFormVisible = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<ThreadMon>({
  taskName: '',
  processKeyword: '',
  active: '1',
  targetTags: '',
  alertRules: '',
})

const rules = reactive<FormRules>({
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  processKeyword: [{ required: true, message: '请输入进程关键字', trigger: 'blur' }],
  active: [{ required: true, message: '请选择状态', trigger: 'change' }],
})

async function fetchData() {
  loading.value = true
  const res = await getThreadMonList({ current: currentPage.value, size: pageSize.value })
  tableData.value = res.data.records
  total.value = res.data.total
  loading.value = false
}

function handleSizeChange(val: number) {
  pageSize.value = val
  fetchData()
}

function handleCurrentChange(val: number) {
  currentPage.value = val
  fetchData()
}

function handleAdd() {
  dialogFormVisible.value = true
  formRef.value?.resetFields()
}

function handleEdit(row: ThreadMon) {
  dialogFormVisible.value = true
  Object.assign(form, row)
}

async function handleSubmit() {
  await formRef.value?.validate()
  await saveOrUpdateThreadMon(form)
  ElMessage.success('保存成功')
  dialogFormVisible.value = false
  fetchData()
}

async function handleDelete(id: string) {
  await ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' })
  await deleteThreadMonById(id)
  ElMessage.success('删除成功')
  fetchData()
}

const chartVisible = ref(false)
const chart = ref<echarts.ECharts>()
const chartDom = ref<HTMLElement>()

async function handleView(row: ThreadMon) {
  chartVisible.value = true
  const res = await getThreadStateList(row.id!)
  const data = res.data.map(item => [
    item.createTime,
    item.threadsCount,
  ])

  chart.value = echarts.init(chartDom.value!)
  chart.value.setOption({
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'time',
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data,
        type: 'line',
        smooth: true,
      },
    ],
  })
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <PageHeader>
      <template #default>
        <PageTitle title="线程监控" />
      </template>
      <template #action>
        <ElButton type="primary" @click="handleAdd">
          新增
        </ElButton>
      </template>
    </PageHeader>
    <ElCard>
      <ElTable v-loading="loading" :data="tableData" style="width: 100%">
        <ElTableColumn prop="taskName" label="任务名称" />
        <ElTableColumn prop="processKeyword" label="进程关键字" />
        <ElTableColumn prop="active" label="状态">
          <template #default="{ row }">
            <ElTag :type="row.active === '1' ? 'success' : 'danger'">
              {{ row.active === '1' ? '启用' : '停用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="创建时间" />
        <ElTableColumn label="操作">
          <template #default="{ row }">
            <ElButton type="primary" link @click="handleView(row)">
              查看
            </ElButton>
            <ElButton type="primary" link @click="handleEdit(row)">
              编辑
            </ElButton>
            <ElButton type="danger" link @click="handleDelete(row.id)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </ElCard>
    <ElDialog v-model="dialogFormVisible" title="新增/编辑">
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="任务名称" prop="taskName">
          <ElInput v-model="form.taskName" />
        </ElFormItem>
        <ElFormItem label="进程关键字" prop="processKeyword">
          <ElInput v-model="form.processKeyword" />
        </ElFormItem>
        <ElFormItem label="状态" prop="active">
          <ElRadioGroup v-model="form.active">
            <ElRadioButton label="1">
              启用
            </ElRadioButton>
            <ElRadioButton label="0">
              停用
            </ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="目标标签" prop="targetTags">
          <ElInput v-model="form.targetTags" />
        </ElFormItem>
        <ElFormItem label="告警规则" prop="alertRules">
          <ElInput v-model="form.alertRules" type="textarea" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogFormVisible = false">
          取消
        </ElButton>
        <ElButton type="primary" @click="handleSubmit">
          确定
        </ElButton>
      </template>
    </ElDialog>
    <ElDialog v-model="chartVisible" title="查看图表">
      <div ref="chartDom" style="width: 100%; height: 400px;" />
    </ElDialog>
  </div>
</template>
