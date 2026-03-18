<template>
  <div class="exam-list">
    <h2 class="page-title">测评记录</h2>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="记录编号">
          <el-input v-model="searchForm.recordNo" placeholder="请输入记录编号" clearable />
        </el-form-item>
        <el-form-item label="用户名称">
          <el-input v-model="searchForm.userName" placeholder="请输入用户名称" clearable />
        </el-form-item>
        <el-form-item label="量表名称">
          <el-input v-model="searchForm.scaleName" placeholder="请输入量表名称" clearable />
        </el-form-item>
        <el-form-item label="测评状态">
          <el-select v-model="searchForm.status" style="min-width: 120px" placeholder="请选择" clearable>
            <el-option label="待开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已暂停" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <el-table :data="tableData" stripe class="mt-md" v-loading="loading">
        <el-table-column prop="recordNo" label="记录编号" width="180" />
        <el-table-column prop="userName" label="用户名称" width="120" />
        <el-table-column prop="scaleName" label="量表名称" min-width="150" />
        <el-table-column prop="scaleCode" label="量表编码" width="120" />
        <el-table-column prop="statusText" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['tag', getStatusClass(row.status)]">
              {{ row.statusText }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" :show-text="false" />
            <span class="progress-text">{{ row.answeredQuestions }}/{{ row.totalQuestions }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看详情</el-button>
            <el-button v-if="row.status === 0" type="primary" link @click="handleStart(row)">开始</el-button>
            <el-button v-if="row.status === 1" type="warning" link @click="handlePause(row)">暂停</el-button>
            <el-button v-if="row.status === 3" type="success" link @click="handleResume(row)">恢复</el-button>
            <el-button v-if="row.status === 1" type="success" link @click="handleSubmit(row)">提交</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="mt-md"
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="测评记录详情" width="700px">
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="记录编号">{{ currentRecord.recordNo }}</el-descriptions-item>
        <el-descriptions-item label="用户名称">{{ currentRecord.userName }}</el-descriptions-item>
        <el-descriptions-item label="量表名称">{{ currentRecord.scaleName }}</el-descriptions-item>
        <el-descriptions-item label="量表编码">{{ currentRecord.scaleCode }}</el-descriptions-item>
        <el-descriptions-item label="测评状态">
          <span :class="['tag', getStatusClass(currentRecord.status)]">{{ currentRecord.statusText }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="测评进度">
          {{ currentRecord.answeredQuestions }}/{{ currentRecord.totalQuestions }}
          <el-progress :percentage="currentRecord.progress" :stroke-width="6" :show-text="false" style="width: 100px; display: inline-block; vertical-align: middle; margin-left: 8px;" />
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentRecord.startTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentRecord.submitTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="暂停时间">{{ currentRecord.pauseTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="恢复时间">{{ currentRecord.resumeTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentRecord.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ currentRecord.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { getExamRecordList, getExamRecordDetail, startExam, submitExam, pauseExam, resumeExam, type ExamRecord } from '@/api/examRecord'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  recordNo: '',
  userName: '',
  scaleName: '',
  status: undefined as number | undefined
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref<ExamRecord[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const currentRecord = ref<ExamRecord | null>(null)

const getStatusClass = (status: number) => {
  const map: Record<number, string> = {
    0: 'tag-info',
    1: 'tag-warning',
    2: 'tag-success',
    3: 'tag-danger'
  }
  return map[status] || 'tag-info'
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getExamRecordList({
      current: pagination.current,
      size: pagination.size,
      status: searchForm.status
    })
    tableData.value = data.records
    pagination.total = data.total
  } catch (error) {
    console.error('加载测评记录失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.recordNo = ''
  searchForm.userName = ''
  searchForm.scaleName = ''
  searchForm.status = undefined
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadData()
}

const handleView = async (row: ExamRecord) => {
  try {
    const data = await getExamRecordDetail(row.id)
    currentRecord.value = data
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

const handleStart = async (row: ExamRecord) => {
  try {
    await ElMessageBox.confirm(`确定要开始测评「${row.scaleName}」吗？`, '提示', {
      type: 'info',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await startExam({ userId: row.userId, scaleId: row.scaleId, scaleCode: row.scaleCode })
    ElMessage.success('已开始测评')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handlePause = async (row: ExamRecord) => {
  try {
    await ElMessageBox.confirm('确定要暂停测评吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await pauseExam(row.id)
    ElMessage.success('已暂停测评')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleResume = async (row: ExamRecord) => {
  try {
    await ElMessageBox.confirm('确定要恢复测评吗？', '提示', {
      type: 'info',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await resumeExam(row.id)
    ElMessage.success('已恢复测评')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleSubmit = async (row: ExamRecord) => {
  try {
    await ElMessageBox.confirm('确定要提交测评吗？提交后将无法修改。', '提示', {
      type: 'warning',
      confirmButtonText: '确定提交',
      cancelButtonText: '取消'
    })
    await submitExam(row.id)
    ElMessage.success('测评已提交')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.exam-list {
  padding: 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-sm);
}

.el-card {
  border-radius: var(--border-radius-lg);
  border: none;
}

.mt-md {
  margin-top: var(--spacing-md);
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  margin-left: var(--spacing-xs);
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: var(--font-size-xs);
  border-radius: var(--border-radius-sm);
}

.tag-info {
  background-color: var(--color-gray-200);
  color: var(--color-gray-600);
}

.tag-success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.tag-warning {
  background-color: #fff3e0;
  color: #ef6c00;
}

.tag-danger {
  background-color: #ffebee;
  color: #c62828;
}
</style>
