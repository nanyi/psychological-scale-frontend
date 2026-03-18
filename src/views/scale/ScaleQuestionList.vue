<template>
  <div class="question-list">
    <div class="page-header">
      <div class="page-title-row">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">{{ scaleName }} - 题目管理</h2>
      </div>
    </div>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <div class="table-toolbar">
        <el-button type="primary" @click="handleAddDimension">新增维度</el-button>
        <el-button type="primary" @click="handleAddQuestion">新增题目</el-button>
      </div>

      <el-table
        :data="tableData"
        stripe
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        class="mt-md"
      >
        <el-table-column prop="name" label="名称" min-width="200">
          <template #default="{ row }">
            <span v-if="row.type === 'dimension'" class="dimension-name">
              <el-icon><Folder /></el-icon>
              {{ row.dimensionName }}
            </span>
            <span v-else class="question-name">
              <span class="question-no">{{ row.questionNo }}</span>
              {{ row.questionText }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="questionTypeName" label="类型" width="100">
          <template #default="{ row }">
            <span v-if="row.type === 'question'" :class="['tag', getTypeTagClass(row.questionType)]">
              {{ row.questionTypeName }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="isRequired" label="必填" width="60">
          <template #default="{ row }">
            <span v-if="row.type === 'question'">
              {{ row.isRequired === 1 ? '是' : '否' }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <template v-if="row.type === 'dimension'">
              <el-button type="primary" link @click="handleEditDimension(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteDimension(row)">删除</el-button>
            </template>
            <template v-else>
              <el-button type="primary" link @click="handleEditQuestion(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteQuestion(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 维度对话框 -->
    <el-dialog
      v-model="dimensionDialogVisible"
      :title="dimensionDialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form ref="dimensionFormRef" :model="dimensionForm" :rules="dimensionRules" label-width="80px">
        <el-form-item label="维度名称" prop="dimensionName">
          <el-input v-model="dimensionForm.dimensionName" placeholder="请输入维度名称" />
        </el-form-item>
        <el-form-item label="维度编码" prop="dimensionCode">
          <el-input v-model="dimensionForm.dimensionCode" placeholder="请输入维度编码" :disabled="dimensionEdit" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dimensionForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="dimensionForm.sortOrder" :min="0" :max="9999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dimensionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDimensionSubmit" :loading="dimensionLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 题目对话框 -->
    <el-dialog
      v-model="questionDialogVisible"
      :title="questionDialogTitle"
      width="700px"
      destroy-on-close
    >
      <el-form ref="questionFormRef" :model="questionForm" :rules="questionRules" label-width="80px">
        <el-form-item label="所属维度" prop="dimensionId">
          <el-select v-model="questionForm.dimensionId" placeholder="请选择维度" clearable>
            <el-option
              v-for="dim in dimensions"
              :key="dim.id"
              :label="dim.dimensionName"
              :value="dim.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题目编号" prop="questionNo">
          <el-input v-model="questionForm.questionNo" placeholder="请输入题目编号，如 Q1" />
        </el-form-item>
        <el-form-item label="题目内容" prop="questionText">
          <el-input v-model="questionForm.questionText" type="textarea" :rows="3" placeholder="请输入题目内容" />
        </el-form-item>
        <el-form-item label="题目类型" prop="questionType">
          <el-select v-model="questionForm.questionType" placeholder="请选择题目类型">
            <el-option
              v-for="type in questionTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="必填" prop="isRequired">
          <el-radio-group v-model="questionForm.isRequired">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="匿名" prop="isAnonymous">
          <el-radio-group v-model="questionForm.isAnonymous">
            <el-radio :value="1">允许</el-radio>
            <el-radio :value="0">不允许</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="questionForm.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        
        <!-- 选项管理（单选题、多选题、量表题） -->
        <el-form-item v-if="showOptions" label="选项">
          <div class="options-container">
            <div class="options-list">
              <div v-for="(option, index) in questionForm.options" :key="index" class="option-item">
                <el-input v-model="option.optionText" placeholder="选项内容" class="option-text" />
                <el-input-number v-model="option.optionValue" :min="0" :max="100" placeholder="分值" class="option-value" />
                <el-input-number v-model="option.score" :min="0" :max="100" placeholder="分数" class="option-score" />
                <el-button text type="danger" @click="removeOption(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <el-button type="primary" text @click="addOption">
              <el-icon><Plus /></el-icon>
              添加选项
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="questionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleQuestionSubmit" :loading="questionLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { ArrowLeft, Folder, Delete, Plus } from '@element-plus/icons-vue'
import {
  getQuestionsByScale,
  getQuestionDetail,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getDimensionsByScale,
  createDimension,
  updateDimension,
  deleteDimension,
  questionTypeOptions,
  type ScaleQuestion,
  type ScaleDimension,
  type QuestionOption
} from '@/api/scaleQuestion'
import { getScaleDetail } from '@/api/scale'

interface TreeNode {
  id: number
  type: 'dimension' | 'question'
  dimensionId?: number
  dimensionName?: string
  questionNo?: string
  questionText?: string
  questionType?: number
  questionTypeName?: string
  isRequired?: number
  isAnonymous?: number
  sortOrder: number
  createTime?: string
  children?: TreeNode[]
}

const route = useRoute()
const router = useRouter()

const scaleId = computed(() => Number(route.params.id))
const scaleName = ref('')

const loading = ref(false)
const tableData = ref<TreeNode[]>([])
const dimensions = ref<ScaleDimension[]>([])

const dimensionDialogVisible = ref(false)
const dimensionDialogTitle = ref('')
const dimensionEdit = ref(false)
const dimensionEditId = ref<number>()
const dimensionFormRef = ref<FormInstance>()
const dimensionLoading = ref(false)

const dimensionForm = reactive({
  dimensionName: '',
  dimensionCode: '',
  description: '',
  sortOrder: 0
})

const dimensionRules = {
  dimensionName: [{ required: true, message: '请输入维度名称', trigger: 'blur' }],
  dimensionCode: [{ required: true, message: '请输入维度编码', trigger: 'blur' }]
}

const questionDialogVisible = ref(false)
const questionDialogTitle = ref('')
const questionEdit = ref(false)
const questionEditId = ref<number>()
const questionFormRef = ref<FormInstance>()
const questionLoading = ref(false)

const questionForm = reactive<{
  dimensionId: number | undefined
  questionNo: string
  questionText: string
  questionType: number
  isRequired: number
  isAnonymous: number
  sortOrder: number
  options: QuestionOption[]
}>({
  dimensionId: undefined,
  questionNo: '',
  questionText: '',
  questionType: 1,
  isRequired: 1,
  isAnonymous: 0,
  sortOrder: 0,
  options: []
})

const questionRules = {
  questionNo: [{ required: true, message: '请输入题目编号', trigger: 'blur' }],
  questionText: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  questionType: [{ required: true, message: '请选择题目类型', trigger: 'change' }]
}

const showOptions = computed(() => {
  return [1, 2, 4].includes(questionForm.questionType)
})

const loadScaleInfo = async () => {
  try {
    const data = await getScaleDetail(scaleId.value)
    scaleName.value = data.scaleName
  } catch (error) {
    console.error('加载量表信息失败:', error)
  }
}

const loadDimensions = async () => {
  try {
    const data = await getDimensionsByScale(scaleId.value)
    dimensions.value = data || []
  } catch (error) {
    console.error('加载维度数据失败:', error)
  }
}

const loadQuestions = async () => {
  loading.value = true
  try {
    const questions = await getQuestionsByScale(scaleId.value)
    const dims = await getDimensionsByScale(scaleId.value)
    dimensions.value = dims || []

    const tree: TreeNode[] = []

    dims.forEach((dim) => {
      const dimNode: TreeNode = {
        id: dim.id,
        type: 'dimension',
        dimensionName: dim.dimensionName,
        sortOrder: dim.sortOrder,
        createTime: dim.createTime,
        children: []
      }

      const dimQuestions = (questions || []).filter((q) => q.dimensionId === dim.id)
      dimQuestions.forEach((q) => {
        dimNode.children!.push({
          id: q.id,
          type: 'question',
          dimensionId: q.dimensionId,
          questionNo: q.questionNo,
          questionText: q.questionText,
          questionType: q.questionType,
          questionTypeName: q.questionTypeName,
          isRequired: q.isRequired,
          isAnonymous: q.isAnonymous,
          sortOrder: q.sortOrder,
          createTime: q.createTime
        })
      })

      tree.push(dimNode)
    })

    const noDimQuestions = (questions || []).filter((q) => !q.dimensionId)
    if (noDimQuestions.length > 0) {
      const noDimNode: TreeNode = {
        id: -1,
        type: 'dimension',
        dimensionName: '未分类',
        sortOrder: 9999,
        children: []
      }
      noDimQuestions.forEach((q) => {
        noDimNode.children!.push({
          id: q.id,
          type: 'question',
          dimensionId: q.dimensionId,
          questionNo: q.questionNo,
          questionText: q.questionText,
          questionType: q.questionType,
          questionTypeName: q.questionTypeName,
          isRequired: q.isRequired,
          isAnonymous: q.isAnonymous,
          sortOrder: q.sortOrder,
          createTime: q.createTime
        })
      })
      tree.push(noDimNode)
    }

    tableData.value = tree
  } catch (error) {
    console.error('加载题目数据失败:', error)
  } finally {
    loading.value = false
  }
}

const getTypeTagClass = (type: number) => {
  const map: Record<number, string> = {
    1: 'tag-primary',
    2: 'tag-success',
    3: 'tag-warning',
    4: 'tag-info'
  }
  return map[type] || 'tag-info'
}

const goBack = () => {
  router.push('/scale')
}

const handleAddDimension = () => {
  dimensionDialogTitle.value = '新增维度'
  dimensionEdit.value = false
  dimensionEditId.value = undefined
  dimensionForm.dimensionName = ''
  dimensionForm.dimensionCode = ''
  dimensionForm.description = ''
  dimensionForm.sortOrder = 0
  dimensionDialogVisible.value = true
}

const handleEditDimension = (row: TreeNode) => {
  dimensionDialogTitle.value = '编辑维度'
  dimensionEdit.value = true
  dimensionEditId.value = row.id
  const dim = dimensions.value.find((d) => d.id === row.id)
  if (dim) {
    dimensionForm.dimensionName = dim.dimensionName
    dimensionForm.dimensionCode = dim.dimensionCode
    dimensionForm.description = dim.description || ''
    dimensionForm.sortOrder = dim.sortOrder
  }
  dimensionDialogVisible.value = true
}

const handleDimensionSubmit = async () => {
  await dimensionFormRef.value?.validate()
  dimensionLoading.value = true
  try {
    const data = {
      ...dimensionForm,
      scaleId: scaleId.value
    }
    if (dimensionEdit.value && dimensionEditId.value) {
      await updateDimension(dimensionEditId.value, data)
      ElMessage.success('更新成功')
    } else {
      await createDimension(data)
      ElMessage.success('创建成功')
    }
    dimensionDialogVisible.value = false
    loadQuestions()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    dimensionLoading.value = false
  }
}

const handleDeleteDimension = async (row: TreeNode) => {
  try {
    await ElMessageBox.confirm(`确定要删除维度「${row.dimensionName}」吗？该维度下的题目将变为未分类状态。`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteDimension(row.id)
    ElMessage.success('删除成功')
    loadQuestions()
  } catch {
    // 用户取消
  }
}

const handleAddQuestion = () => {
  questionDialogTitle.value = '新增题目'
  questionEdit.value = false
  questionEditId.value = undefined
  questionForm.dimensionId = dimensions.value[0]?.id
  questionForm.questionNo = ''
  questionForm.questionText = ''
  questionForm.questionType = 1
  questionForm.isRequired = 1
  questionForm.isAnonymous = 0
  questionForm.sortOrder = 0
  questionForm.options = []
  questionDialogVisible.value = true
}

const handleEditQuestion = async (row: TreeNode) => {
  questionDialogTitle.value = '编辑题目'
  questionEdit.value = true
  questionEditId.value = row.id
  questionLoading.value = true
  try {
    const data = await getQuestionDetail(row.id)
    questionForm.dimensionId = data.dimensionId
    questionForm.questionNo = data.questionNo
    questionForm.questionText = data.questionText
    questionForm.questionType = data.questionType
    questionForm.isRequired = data.isRequired
    questionForm.isAnonymous = data.isAnonymous
    questionForm.sortOrder = data.sortOrder
    questionForm.options = data.options || []
    questionDialogVisible.value = true
  } catch (error) {
    console.error('加载题目详情失败:', error)
  } finally {
    questionLoading.value = false
  }
}

const handleQuestionSubmit = async () => {
  await questionFormRef.value?.validate()
  questionLoading.value = true
  try {
    const data = {
      ...questionForm,
      scaleId: scaleId.value
    }
    if (questionEdit.value && questionEditId.value) {
      await updateQuestion(questionEditId.value, data)
      ElMessage.success('更新成功')
    } else {
      await createQuestion(data)
      ElMessage.success('创建成功')
    }
    questionDialogVisible.value = false
    loadQuestions()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    questionLoading.value = false
  }
}

const handleDeleteQuestion = async (row: TreeNode) => {
  try {
    await ElMessageBox.confirm(`确定要删除题目「${row.questionText}」吗？`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteQuestion(row.id)
    ElMessage.success('删除成功')
    loadQuestions()
  } catch {
    // 用户取消
  }
}

const addOption = () => {
  const optionNo = String.fromCharCode(65 + questionForm.options.length)
  questionForm.options.push({
    id: 0,
    questionId: 0,
    optionNo,
    optionText: '',
    optionValue: questionForm.options.length,
    score: 0,
    sortOrder: questionForm.options.length
  })
}

const removeOption = (index: number) => {
  questionForm.options.splice(index, 1)
}

onMounted(() => {
  loadScaleInfo()
  loadQuestions()
})
</script>

<style scoped>
.question-list {
  padding: 0;
}

.page-header {
  margin-bottom: var(--spacing-md);
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.page-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
}

.search-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-sm);
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.el-card {
  border-radius: var(--border-radius-lg);
  border: none;
}

.mt-md {
  margin-top: var(--spacing-md);
}

.dimension-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-600);
}

.question-name {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.question-no {
  flex-shrink: 0;
  display: inline-block;
  padding: 2px 6px;
  background-color: var(--color-gray-200);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
}

.options-container {
  width: 100%;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.option-text {
  flex: 1;
}

.option-value,
.option-score {
  width: 80px;
}
</style>
