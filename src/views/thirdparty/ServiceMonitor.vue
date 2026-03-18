<template>
  <div class="service-monitor">
    <h2 class="page-title">服务监控</h2>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mb-md">
      <div class="statistics-cards">
        <div class="stat-item">
          <div class="stat-icon stat-icon-primary">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalCalls }}</div>
            <div class="stat-label">总调用次数</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon stat-icon-success">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.successCalls }}</div>
            <div class="stat-label">成功调用</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon stat-icon-danger">
            <el-icon><CircleClose /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.failCalls }}</div>
            <div class="stat-label">失败调用</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon stat-icon-warning">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.avgResponseTime }}ms</div>
            <div class="stat-label">平均响应时间</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon stat-icon-info">
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.availabilityRate }}%</div>
            <div class="stat-label">可用率</div>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="varSpacingMd" class="mb-md">
      <el-col :span="16">
        <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
          <template #header>
            <div class="card-header">
              <span>服务状态</span>
              <el-button type="primary" link @click="loadServices">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <el-table :data="serviceList" stripe v-loading="serviceLoading">
            <el-table-column prop="serviceName" label="服务名称" min-width="120" />
            <el-table-column prop="serviceCode" label="服务编码" width="120" />
            <el-table-column prop="apiBaseUrl" label="API地址" min-width="200" show-overflow-tooltip />
            <el-table-column prop="statusName" label="状态" width="100">
              <template #default="{ row }">
                <span :class="['status-tag', getStatusClass(row.status)]">
                  {{ row.statusName }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="responseTime" label="响应时间" width="100">
              <template #default="{ row }">
                <span :class="getResponseTimeClass(row.responseTime)">
                  {{ row.responseTime ? `${row.responseTime}ms` : '-' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="lastCallTime" label="最后调用" width="180" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  :loading="row.testing"
                  @click="handleTestService(row)"
                >
                  测试
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
          <template #header>
            <span>服务健康度</span>
          </template>
          <div class="health-chart">
            <el-progress
              type="dashboard"
              :percentage="statistics.availabilityRate"
              :color="healthColors"
              :stroke-width="12"
              :width="160"
            >
              <template #default="{ percentage }">
                <div class="progress-content">
                  <div class="progress-value">{{ percentage }}%</div>
                  <div class="progress-label">健康度</div>
                </div>
              </template>
            </el-progress>
          </div>
          <div class="health-summary">
            <div class="health-item">
              <span class="dot dot-success"></span>
              <span>正常: {{ normalCount }}</span>
            </div>
            <div class="health-item">
              <span class="dot dot-warning"></span>
              <span>异常: {{ warningCount }}</span>
            </div>
            <div class="health-item">
              <span class="dot dot-danger"></span>
              <span>离线: {{ dangerCount }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <template #header>
        <div class="card-header">
          <span>最近调用记录</span>
        </div>
      </template>
      <el-table :data="logList" stripe v-loading="logLoading">
        <el-table-column prop="callTime" label="调用时间" width="180" />
        <el-table-column prop="serviceName" label="服务名称" min-width="120" />
        <el-table-column prop="apiPath" label="API路径" min-width="200" show-overflow-tooltip />
        <el-table-column prop="method" label="方法" width="80">
          <template #default="{ row }">
            <span :class="['method-tag', `method-${row.method.toLowerCase()}`]">
              {{ row.method }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', getStatusClass(row.status)]">
              {{ row.statusName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="responseTime" label="响应时间" width="100">
          <template #default="{ row }">
            <span :class="getResponseTimeClass(row.responseTime)">
              {{ row.responseTime ? `${row.responseTime}ms` : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="errorMsg" label="错误信息" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.errorMsg" class="error-msg">{{ row.errorMsg }}</span>
            <span v-else class="no-error">-</span>
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
import { reactive, ref, computed, onMounted } from 'vue'
import { Connection, CircleCheck, CircleClose, Timer, DataLine, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ServiceInfo, ApiCallLog, MonitorStatistics } from '@/api/monitor'

const varSpacingMd = 'var(--spacing-md)'

const statistics = ref<MonitorStatistics>({
  totalCalls: 0,
  successCalls: 0,
  failCalls: 0,
  avgResponseTime: 0,
  availabilityRate: 100
})

const serviceList = ref<ServiceInfo[]>([])
const serviceLoading = ref(false)

const logList = ref<ApiCallLog[]>([])
const logLoading = ref(false)

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const healthColors = [
  { color: '#67C23A', percentage: 100 },
  { color: '#E6A23C', percentage: 80 },
  { color: '#F56C6C', percentage: 60 }
]

const normalCount = computed(() => serviceList.value.filter(s => s.status === 1).length)
const warningCount = computed(() => serviceList.value.filter(s => s.status === 2).length)
const dangerCount = computed(() => serviceList.value.filter(s => s.status === 0).length)

const mockServices: ServiceInfo[] = [
  {
    id: 1,
    serviceName: '启航心理量表',
    serviceCode: 'qihang_scale',
    apiBaseUrl: 'https://api.qihang.com/scale',
    status: 1,
    statusName: '正常',
    lastCallTime: '2026-03-18 10:30:25',
    responseTime: 125
  },
  {
    id: 2,
    serviceName: '启航题目服务',
    serviceCode: 'qihang_question',
    apiBaseUrl: 'https://api.qihang.com/question',
    status: 1,
    statusName: '正常',
    lastCallTime: '2026-03-18 10:28:15',
    responseTime: 89
  },
  {
    id: 3,
    serviceName: '启航报告服务',
    serviceCode: 'qihang_report',
    apiBaseUrl: 'https://api.qihang.com/report',
    status: 2,
    statusName: '异常',
    lastCallTime: '2026-03-18 09:45:30',
    responseTime: 2500
  },
  {
    id: 4,
    serviceName: '心灵探索API',
    serviceCode: 'xinling_api',
    apiBaseUrl: 'https://api.xinling.com/v2',
    status: 1,
    statusName: '正常',
    lastCallTime: '2026-03-18 10:29:50',
    responseTime: 156
  },
  {
    id: 5,
    serviceName: '心智测评服务',
    serviceCode: 'xinzhi_scale',
    apiBaseUrl: 'https://api.xinzhi.com/eval',
    status: 0,
    statusName: '离线',
    lastCallTime: '2026-03-17 18:20:10',
    responseTime: 0
  }
]

const mockLogs: ApiCallLog[] = [
  {
    id: 1,
    serviceName: '启航心理量表',
    apiPath: '/api/v1/scales',
    method: 'GET',
    status: 1,
    statusName: '成功',
    responseTime: 125,
    errorMsg: '',
    callTime: '2026-03-18 10:30:25'
  },
  {
    id: 2,
    serviceName: '启航题目服务',
    apiPath: '/api/v1/questions/batch',
    method: 'POST',
    status: 1,
    statusName: '成功',
    responseTime: 89,
    errorMsg: '',
    callTime: '2026-03-18 10:28:15'
  },
  {
    id: 3,
    serviceName: '启航报告服务',
    apiPath: '/api/v1/report/generate',
    method: 'POST',
    status: 2,
    statusName: '失败',
    responseTime: 2500,
    errorMsg: 'Request timeout after 2500ms',
    callTime: '2026-03-18 09:45:30'
  },
  {
    id: 4,
    serviceName: '心灵探索API',
    apiPath: '/api/v2/scale/info',
    method: 'GET',
    status: 1,
    statusName: '成功',
    responseTime: 156,
    errorMsg: '',
    callTime: '2026-03-18 10:29:50'
  },
  {
    id: 5,
    serviceName: '启航心理量表',
    apiPath: '/api/v1/scales/123',
    method: 'GET',
    status: 1,
    statusName: '成功',
    responseTime: 98,
    errorMsg: '',
    callTime: '2026-03-18 10:25:10'
  }
]

const loadStatistics = async () => {
  try {
    const totalCalls = mockLogs.length * 12
    const successCalls = mockLogs.filter(l => l.status === 1).length * 12
    const failCalls = totalCalls - successCalls
    const avgResponseTime = Math.round(mockLogs.reduce((sum, l) => sum + l.responseTime, 0) / mockLogs.length)
    const availabilityRate = Math.round((normalCount.value / serviceList.value.length) * 100)

    statistics.value = {
      totalCalls,
      successCalls,
      failCalls,
      avgResponseTime,
      availabilityRate
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadServices = async () => {
  serviceLoading.value = true
  try {
    serviceList.value = mockServices.map(s => ({ ...s, testing: false }))
    await loadStatistics()
  } catch (error) {
    console.error('加载服务列表失败:', error)
  } finally {
    serviceLoading.value = false
  }
}

const loadLogs = async () => {
  logLoading.value = true
  try {
    logList.value = mockLogs
    pagination.total = mockLogs.length
  } catch (error) {
    console.error('加载调用日志失败:', error)
  } finally {
    logLoading.value = false
  }
}

const getStatusClass = (status: number) => {
  switch (status) {
    case 1:
      return 'status-success'
    case 2:
      return 'status-warning'
    case 0:
      return 'status-danger'
    default:
      return 'status-info'
  }
}

const getResponseTimeClass = (time: number) => {
  if (time === 0) return 'response-none'
  if (time < 200) return 'response-fast'
  if (time < 500) return 'response-normal'
  return 'response-slow'
}

const handleTestService = async (service: ServiceInfo) => {
  service.testing = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`${service.serviceName} 测试成功`)
  } catch (error) {
    ElMessage.error(`${service.serviceName} 测试失败`)
  } finally {
    service.testing = false
  }
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadLogs()
}

onMounted(() => {
  loadServices()
  loadLogs()
})
</script>

<style scoped>
.service-monitor {
  padding: 0;
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
  margin: 0 0 var(--spacing-lg) 0;
}

.mb-md {
  margin-bottom: var(--spacing-md);
}

.el-card {
  border-radius: var(--border-radius-lg);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-weight-semibold);
}

.statistics-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--border-radius-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
  font-size: 24px;
}

.stat-icon-primary {
  background: rgba(22, 120, 212, 0.1);
  color: var(--color-primary-500);
}

.stat-icon-success {
  background: rgba(103, 194, 58, 0.1);
  color: var(--color-success);
}

.stat-icon-danger {
  background: rgba(245, 108, 108, 0.1);
  color: var(--color-danger);
}

.stat-icon-warning {
  background: rgba(230, 162, 60, 0.1);
  color: var(--color-warning);
}

.stat-icon-info {
  background: rgba(144, 147, 153, 0.1);
  color: var(--color-gray-500);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-800);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  margin-top: var(--spacing-xs);
}

.health-chart {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.progress-content {
  text-align: center;
}

.progress-value {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-500);
}

.progress-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
}

.health-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-gray-200);
}

.health-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-success {
  background: var(--color-success);
}

.dot-warning {
  background: var(--color-warning);
}

.dot-danger {
  background: var(--color-danger);
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.status-success {
  background: rgba(103, 194, 58, 0.1);
  color: var(--color-success);
}

.status-warning {
  background: rgba(230, 162, 60, 0.1);
  color: var(--color-warning);
}

.status-danger {
  background: rgba(245, 108, 108, 0.1);
  color: var(--color-danger);
}

.status-info {
  background: rgba(144, 147, 153, 0.1);
  color: var(--color-gray-500);
}

.response-fast {
  color: var(--color-success);
}

.response-normal {
  color: var(--color-warning);
}

.response-slow {
  color: var(--color-danger);
}

.response-none {
  color: var(--color-gray-400);
}

.method-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.method-get {
  background: rgba(103, 194, 58, 0.1);
  color: var(--color-success);
}

.method-post {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.method-put {
  background: rgba(230, 162, 60, 0.1);
  color: var(--color-warning);
}

.method-delete {
  background: rgba(245, 108, 108, 0.1);
  color: var(--color-danger);
}

.error-msg {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.no-error {
  color: var(--color-gray-400);
}

.mt-md {
  margin-top: var(--spacing-md);
}
</style>
