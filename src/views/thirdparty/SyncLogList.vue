<template>
  <div class="sync-log-list">
    <h2 class="page-title">同步日志</h2>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="平台名称">
          <el-select
            v-model="searchForm.configId"
            placeholder="请选择平台"
            clearable
            style="min-width: 180px"
            @change="handleConfigChange"
          >
            <el-option
              v-for="config in configList"
              :key="config.id"
              :label="config.platformName"
              :value="config.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="同步类型">
          <el-select v-model="searchForm.syncType" placeholder="请选择" clearable style="min-width: 120px">
            <el-option label="量表同步" value="scale" />
            <el-option label="题目同步" value="question" />
            <el-option label="报告同步" value="report" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button
            v-if="searchForm.configId"
            type="success"
            :loading="syncLoading"
            @click="handleSync"
          >
            立即同步
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="statistics-cards" v-if="statistics">
      <el-card shadow="never" class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalCount }}</div>
          <div class="stat-label">总同步次数</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-content">
          <div class="stat-value stat-success">{{ statistics.successCount }}</div>
          <div class="stat-label">成功次数</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-content">
          <div class="stat-value stat-danger">{{ statistics.failCount }}</div>
          <div class="stat-label">失败次数</div>
        </div>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ statistics.successRate }}%</div>
          <div class="stat-label">成功率</div>
        </div>
      </el-card>
    </div>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <el-table :data="tableData" stripe class="mt-md" v-loading="loading">
        <el-table-column prop="startTime" label="同步时间" width="180" />
        <el-table-column prop="platformName" label="平台名称" min-width="120" />
        <el-table-column prop="syncTypeName" label="同步类型" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span :class="['tag', getStatusClass(row.status)]">
              {{ row.statusName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="successCount" label="成功数" width="80">
          <template #default="{ row }">
            <span class="success-count">{{ row.successCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="failCount" label="失败数" width="80">
          <template #default="{ row }">
            <span class="fail-count">{{ row.failCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="errorMsg" label="错误信息" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.errorMsg" class="error-msg">{{ row.errorMsg }}</span>
            <span v-else class="no-error">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时" width="80">
          <template #default="{ row }">
            {{ row.duration ? `${row.duration}ms` : '-' }}
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
import { reactive, ref, onMounted, watch } from 'vue'
import {
  getThirdPartyActiveList,
  getSyncLogs,
  getSyncStatistics,
  triggerSync,
  type SyncLog,
  type SyncStatistics,
  type ThirdPartyConfig
} from '@/api/thirdParty'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  configId: undefined as number | undefined,
  syncType: undefined as string | undefined
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref<SyncLog[]>([])
const loading = ref(false)
const syncLoading = ref(false)
const configList = ref<ThirdPartyConfig[]>([])
const statistics = ref<SyncStatistics | null>(null)

const SYNC_TYPE_MAP: Record<string, string> = {
  scale: '量表同步',
  question: '题目同步',
  report: '报告同步'
}

const loadConfigList = async () => {
  try {
    const data = await getThirdPartyActiveList()
    configList.value = data || []
  } catch (error) {
    console.error('加载平台列表失败:', error)
  }
}

const loadStatistics = async () => {
  if (!searchForm.configId) {
    statistics.value = null
    return
  }
  try {
    const data = await getSyncStatistics(searchForm.configId)
    statistics.value = data
  } catch (error) {
    console.error('加载统计信息失败:', error)
    statistics.value = null
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getSyncLogs({
      configId: searchForm.configId,
      syncType: searchForm.syncType,
      current: pagination.current,
      size: pagination.size
    })
    tableData.value = (data.records || []).map(item => ({
      ...item,
      syncTypeName: SYNC_TYPE_MAP[item.syncType] || item.syncType,
      statusName: getStatusText(item.status)
    }))
    pagination.total = data.total
  } catch (error) {
    console.error('加载同步日志失败:', error)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status: number) => {
  switch (status) {
    case 1:
      return 'tag-success'
    case 2:
      return 'tag-danger'
    case 0:
      return 'tag-warning'
    default:
      return 'tag-info'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '成功'
    case 2:
      return '失败'
    case 0:
      return '进行中'
    default:
      return '未知'
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
  loadStatistics()
}

const handleReset = () => {
  searchForm.configId = undefined
  searchForm.syncType = undefined
  pagination.current = 1
  statistics.value = null
  loadData()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleConfigChange = () => {
  pagination.current = 1
  if (searchForm.configId) {
    loadStatistics()
  } else {
    statistics.value = null
  }
  loadData()
}

const handleSync = async () => {
  if (!searchForm.configId) return
  syncLoading.value = true
  try {
    await triggerSync(searchForm.configId)
    ElMessage.success('同步任务已触发')
    loadData()
    loadStatistics()
  } catch (error) {
    console.error('触发同步失败:', error)
  } finally {
    syncLoading.value = false
  }
}

onMounted(() => {
  loadConfigList()
  loadData()
})
</script>

<style scoped>
.sync-log-list {
  padding: 0;
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
  margin: 0 0 var(--spacing-lg) 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-sm);
}

.statistics-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.stat-card {
  border-radius: var(--border-radius-lg);
  border: none;
}

.stat-card :deep(.el-card__body) {
  padding: var(--spacing-md);
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-500);
}

.stat-value.stat-success {
  color: var(--color-success);
}

.stat-value.stat-danger {
  color: var(--color-danger);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  margin-top: var(--spacing-xs);
}

.el-card {
  border-radius: var(--border-radius-lg);
  border: none;
}

.mt-md {
  margin-top: var(--spacing-md);
}

.success-count {
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
}

.fail-count {
  color: var(--color-danger);
  font-weight: var(--font-weight-semibold);
}

.error-msg {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.no-error {
  color: var(--color-gray-400);
}
</style>
