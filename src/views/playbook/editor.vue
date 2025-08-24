<script setup lang="ts">
import { Minus, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCommandList } from '@/api/modules/command'
import { getPlaybookDetail, savePlaybook } from '@/api/modules/playbook'
import { getTagList } from '@/api/modules/tag'

const route = useRoute()
const router = useRouter()

const playbookId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!playbookId.value)
const isSaving = ref(false)

const playbookFormRef = ref<any>(null)
const playbookForm = ref({
  playbookName: '',
  description: '',
  cronExpression: '',
  isEnabled: 1,
})
const playbookRules = {
  playbookName: [
    { required: true, message: '请输入预案名称', trigger: 'blur' },
  ],
  cronExpression: [
    { required: true, message: '请输入 Cron 表达式', trigger: 'blur' },
  ],
  isEnabled: [{ required: true, message: '请选择是否启用', trigger: 'change' }],
}

const taskStepList = ref<any[]>([{ commandId: null, targets: [] }])
const allCommands = ref<any[]>([])
const allTags = ref<any[]>([])

async function loadPrerequisites() {
  try {
    // 加载指令列表
    const commandsRes: any = await getCommandList({ page: 1, pageSize: 999 })
    allCommands.value = commandsRes.data.list

    // 加载标签列表
    const tagsRes: any = await getTagList({ page: 1, pageSize: 999 })
    allTags.value = tagsRes.data.list
  }
  catch (error) {
    ElMessage.error('加载数据失败')
    console.error('Failed to load prerequisites', error)
  }
}

async function loadPlaybookData() {
  if (!isEdit.value) { return }
  try {
    const res: any = await getPlaybookDetail(playbookId.value!)
    const {
      playbookName,
      playbookDesc,
      cronExpression,
      isEnabled,
      taskStepList: stepsFromApi,
    } = res.data.playbook
    playbookForm.value = {
      playbookName,
      description: playbookDesc,
      cronExpression,
      isEnabled,
    }
    if (stepsFromApi && stepsFromApi.length > 0) {
      taskStepList.value = stepsFromApi.map((step: any) => ({
        ...step,
        targets: step.targets || [],
      }))
    }
    else {
      taskStepList.value = [{ commandId: null, targets: [] }]
    }
  }
  catch (error) {
    ElMessage.error('加载预案详情失败')
    console.error('Failed to load playbook detail', error)
  }
}

function addRow(index: number) {
  taskStepList.value.splice(index + 1, 0, { commandId: null, targets: [] })
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

    const hasEmptyStep = taskStepList.value.some(
      step => !step.commandId || !step.targets || step.targets.length === 0,
    )
    if (hasEmptyStep) {
      ElMessage.warning('所有步骤都必须选择指令和至少一个标签')
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
  }
  catch (error) {
    console.error('Save failed', error)
  }
  finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadPrerequisites()
  loadPlaybookData()
})
</script>

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
            <FaInput
              v-model="playbookForm.playbookName"
              placeholder="请输入预案名称"
            />
          </el-form-item>
          <el-form-item label="预案描述" prop="description">
            <FaInput
              v-model="playbookForm.description"
              type="textarea"
              placeholder="请输入预案描述"
            />
          </el-form-item>
          <el-form-item label="Cron 表达式" prop="cronExpression">
            <FaInput
              v-model="playbookForm.cronExpression"
              placeholder="例如: 0 0/5 * * * ?"
            />
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

        <h3 class="mb-4 text-lg font-semibold">
          预案步骤
        </h3>
        <div
          v-for="(step, index) in taskStepList"
          :key="index"
          class="step-row"
        >
          <div class="step-content">
            <el-form-item label="选择指令" class="flex-1">
              <el-select
                v-model="step.commandId"
                placeholder="请选择要执行的指令"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="cmd in allCommands"
                  :key="cmd.id"
                  :label="cmd.cmdName"
                  :value="cmd.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="选择标签" class="flex-1">
              <el-select
                v-model="step.targets"
                placeholder="请选择标签"
                multiple
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="tag in allTags"
                  :key="tag.id"
                  :label="tag.tagName"
                  :value="tag.id"
                />
              </el-select>
            </el-form-item>
          </div>
          <div class="step-actions">
            <FaButton type="primary" circle @click="addRow(index)">
              <template #icon>
                <el-icon><Plus /></el-icon>
              </template>
            </FaButton>
            <FaButton
              v-if="taskStepList.length > 1"
              type="danger"
              circle
              @click="removeRow(index)"
            >
              <template #icon>
                <el-icon><Minus /></el-icon>
              </template>
            </FaButton>
          </div>
        </div>
      </div>
    </FaPageMain>
    <FaFixedActionBar>
      <FaButton @click="handleCancel">
        取消
      </FaButton>
      <FaButton type="primary" :loading="isSaving" @click="handleSave">
        保存
      </FaButton>
    </FaFixedActionBar>
  </div>
</template>

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
