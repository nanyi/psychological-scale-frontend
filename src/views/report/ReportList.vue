<template>
  <div class="report-list">
    <h2 class="page-title">报告管理</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="报告编号">
          <el-input v-model="searchForm.reportNo" placeholder="请输入报告编号" clearable />
        </el-form-item>
        <el-form-item label="用户姓名">
          <el-input v-model="searchForm.userName" placeholder="请输入用户姓名" clearable />
        </el-form-item>
        <el-form-item label="量表名称">
          <el-input v-model="searchForm.scaleName" placeholder="请输入量表名称" clearable />
        </el-form-item>
        <el-form-item label="报告状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="生成中" :value="0" />
            <el-option label="已完成" :value="1" />
            <el-option label="生成失败" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="reportNo" label="报告编号" width="180" />
        <el-table-column prop="userName" label="用户" width="100" />
        <el-table-column prop="scaleName" label="量表名称" min-width="150" />
        <el-table-column prop="score" label="总分" width="80" />
        <el-table-column prop="level" label="等级" width="80">
          <template #default="{ row }">
            <span :class="['tag', getLevelClass(row.level)]">
              {{ row.level || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['tag', getStatusClass(row.status)]">
              {{ getStatusName(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="测评时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleDownload(row)">下载</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="mt-md"
        v-model:current-page="pagination.current"
        :page-size="pagination.size"
        :total="pagination.total"
        layout="total, prev, pager, next"
        background
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { getReportList, type ReportItem } from '@/api/report'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  reportNo: '',
  userName: '',
  scaleName: '',
  status: undefined as number | undefined
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref<ReportItem[]>([])
const loading = ref(false)

const getStatusName = (status: number) => {
  const map: Record<number, string> = { 0: '生成中', 1: '已完成', 2: '生成失败' }
  return map[status] || '未知'
}

const getStatusClass = (status: number) => {
  const classMap: Record<number, string> = {
    0: 'tag-warning',
    1: 'tag-success',
    2: 'tag-error'
  }
  return classMap[status] || 'tag-info'
}

const getLevelClass = (level: string) => {
  if (!level) return 'tag-info'
  if (level === '正常' || level === 'INTJ') return 'tag-success'
  if (level.includes('抑郁') || level.includes('焦虑')) return 'tag-warning'
  return 'tag-info'
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getReportList({
      current: pagination.current,
      size: pagination.size,
      reportNo: searchForm.reportNo || undefined,
      userName: searchForm.userName || undefined,
      status: searchForm.status
    })
    tableData.value = data.records
    pagination.total = data.total
  } catch (error) {
    console.error('加载报告数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.reportNo = ''
  searchForm.userName = ''
  searchForm.scaleName = ''
  searchForm.status = undefined
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleView = (row: ReportItem) => {
  ElMessage.info(`查看报告：${row.reportNo}`)
}

const handleDownload = async (row: ReportItem) => {
  ElMessage.info(`下载报告：${row.reportNo}`)
  // TODO: 后端API完成后对接
  // await downloadReport(row.id)
}

const handleDelete = async (row: ReportItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除报告「${row.reportNo}」吗？`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    // TODO: 后端API完成后对接
    // await deleteReport(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.report-list {
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
</style>
