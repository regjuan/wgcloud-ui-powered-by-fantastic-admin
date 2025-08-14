<template>
  <div class="h-full flex flex-col">
    <FaPageHeader :title="isEdit ? '编辑预案' : '新建预案'" />
    <FaPageMain class="flex-1 overflow-auto">
      <div class="page-main">
        <el-form
          ref="playbookFormRef"
          :model="playbookForm"
          :rules="playbookRules"
          label-width="120px"
        >
          <el-form-item label="预案名称" prop="playbookName">
            <FaInput v-model="playbookForm.playbookName" placeholder="请输入预案名称" />
          </el-form-item>
          <el-form-item label="预案描述" prop="playbookDesc">
            <FaInput v-model="playbookForm.playbookDesc" type="textarea" placeholder="请输入预案描述" />
          </el-form-item>
          <el-form-item label="Cron 表达式" prop="cronExpression">
            <FaInput v-model="playbookForm.cronExpression" placeholder="例如: 0 0/5 * * * ?" />
          </el-form-item>
          <el-form-item label="是否启用" prop="isEnabled">
            <el-switch
              v-model="playbookForm.isEnabled"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>
        </el-form>

        <el-divider />

        <h3 class="text-lg font-semibold mb-4">预案步骤</h3>
        <div v-for="(step, index) in taskStepList" :key="index" class="step-row">
          <div class="step-content">
            <el-form-item label="步骤名称" class="flex-1">
              <FaInput v-model="step.stepName" placeholder="请输入步骤名称" />
            </el-form-item>
            <el-form-item label="选择指令" class="flex-1">
              <el-select v-model="step.commandId" placeholder="请选择要执行的指令" filterable style="width: 100%">
                <el-option
                  v-for="cmd in allCommands"
                  :key="cmd.id"
                  :label="cmd.cmdName"
                  :value="cmd.id"
                />
              </el-select>
            </el-form-item>
          </div>
          <div class="step-actions">
            <FaButton type="primary" circle @click="addRow(index)">
              <template #icon><el-icon><Plus /></el-icon></template>
            </FaButton>
            <FaButton v-if="taskStepList.length > 1" type="danger" circle @click="removeRow(index)">
              <template #icon><el-icon><Minus /></el-icon></template>
            </FaButton>
          </div>
        </div>
      </div>
    </FaPageMain>
    <FaFixedActionBar>
      <FaButton @click="handleCancel">取消</FaButton>
      <FaButton type="primary" :loading="isSaving" @click="handleSave">保存</FaButton>
    </FaFixedActionBar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Minus } from '@element-plus/icons-vue'
import { getPlaybookDetail, savePlaybook } from '@/api/modules/playbook'
import { getCommandList } from '@/api/modules/command'

const route = useRoute()
const router = useRouter()

const playbookId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!playbookId.value)
const isSaving = ref(false)

const playbookFormRef = ref<any>(null)
const playbookForm = ref({
  playbookName: '',
  playbookDesc: '',
  cronExpression: '',
  isEnabled: 1,
})
const playbookRules = {
  playbookName: [{ required: true, message: '请输入预案名称', trigger: 'blur' }],
  cronExpression: [{ required: true, message: '请输入 Cron 表达式', trigger: 'blur' }],
  isEnabled: [{ required: true, message: '请选择是否启用', trigger: 'change' }],
}

const taskStepList = ref<any[]>([{ stepName: '', commandId: null }])
const allCommands = ref<any[]>([])

async function loadPrerequisites() {
  try {
    const commandsRes: any = await getCommandList({ page: 1, pageSize: 999 })
    allCommands.value = commandsRes.data.list
  } catch (error) {
    ElMessage.error('加载指令列表失败')
  }
}

async function loadPlaybookData() {
  if (!isEdit.value) return
  try {
    const res: any = await getPlaybookDetail(playbookId.value!)
    const { playbookName, playbookDesc, cronExpression, isEnabled, taskStepList: stepsFromApi } = res.data
    playbookForm.value = { playbookName, playbookDesc, cronExpression, isEnabled }
    if (stepsFromApi && stepsFromApi.length > 0) {
      taskStepList.value = stepsFromApi
    } else {
      taskStepList.value = [{ stepName: '', commandId: null }]
    }
  } catch (error) {
    ElMessage.error('加载预案详情失败')
  }
}

function addRow(index: number) {
  taskStepList.value.splice(index + 1, 0, { stepName: '', commandId: null })
}

function removeRow(index: number) {
  taskStepList.value.splice(index, 1)
}

function handleCancel() {
  router.push('/playbook')
}

async function handleSave() {
  try {
    await playbookFormRef.value.validate()

    const hasEmptyStep = taskStepList.value.some(step => !step.stepName || !step.commandId)
    if (hasEmptyStep) {
      ElMessage.warning('所有步骤都必须填写步骤名称和选择一个指令')
      return
    }

    isSaving.value = true
    const payload = {
      ...playbookForm.value,
      id: playbookId.value,
      taskStepList: taskStepList.value,
    }
    await savePlaybook(payload)
    ElMessage.success(isEdit.value ? '更新成功' : '保存成功')
    router.push('/playbook')
  } catch (error) {
    console.error('Save failed', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadPrerequisites()
  loadPlaybookData()
})
</script>

<style lang="scss" scoped>
.page-main {
  padding: 16px;
}
.step-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}
.step-content {
  flex-grow: 1;
  display: flex;
  gap: 16px;
  align-items: flex-start;

  .el-form-item {
    margin-bottom: 0;
  }
}
.step-actions {
  display: flex;
  gap: 8px;
}
</style>
