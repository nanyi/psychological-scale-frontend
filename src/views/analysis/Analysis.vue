<template>
  <div class="analysis">
    <h2 class="page-title">数据分析</h2>
    
    <el-row :gutter="24" class="mb-lg">
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: 'var(--spacing-lg)' }">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--color-primary-500)">
              <el-icon :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">+23.5%</div>
              <div class="stat-label">测评量增长</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: 'var(--spacing-lg)' }">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--color-success)">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">+15.2%</div>
              <div class="stat-label">用户增长</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: 'var(--spacing-lg)' }">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--color-warning)">
              <el-icon :size="24"><Coin /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥58,320</div>
              <div class="stat-label">本月收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: 'var(--spacing-lg)' }">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--color-error)">
              <el-icon :size="24"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">8.5%</div>
              <div class="stat-label">异常检出率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
          <h3 class="card-title">量表使用排行</h3>
          <el-table :data="scaleRankData" stripe class="mt-md">
            <el-table-column prop="rank" label="排名" width="60" />
            <el-table-column prop="name" label="量表名称" />
            <el-table-column prop="count" label="使用次数" width="100" />
            <el-table-column prop="percentage" label="占比" width="80" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
          <h3 class="card-title">用户年龄分布</h3>
          <div class="chart-placeholder">
            <el-icon :size="48"><DataAnalysis /></el-icon>
            <p>图表占位区域</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-lg">
      <h3 class="card-title">最近7天测评趋势</h3>
      <div class="chart-placeholder">
        <el-icon :size="48"><TrendCharts /></el-icon>
        <p>趋势图表占位区域</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TrendCharts, User, Coin, Warning, DataAnalysis } from '@element-plus/icons-vue'
import { getDashboardData, type DashboardData } from '@/api/analysis'

const loading = ref(false)
const dashboardData = ref<DashboardData | null>(null)

const scaleRankData = ref<{ rank: number; name: string; count: number; percentage: string }[]>([])

const formatNumber = (num: number) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const formatPercent = (num: number) => {
  if (!num) return '0%'
  return `${(num * 100).toFixed(1)}%`
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getDashboardData()
    dashboardData.value = data
    
    if (data.scaleRankings && data.scaleRankings.length > 0) {
      scaleRankData.value = data.scaleRankings.map((item, index) => ({
        rank: index + 1,
        name: item.scaleName,
        count: item.usageCount,
        percentage: `${(item.ratio * 100).toFixed(0)}%`
      }))
    }
  } catch (error) {
    console.error('加载分析数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.analysis {
  padding: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-800);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  margin-top: 2px;
}

.card-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  margin: 0;
}

.chart-placeholder {
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-400);
  background-color: var(--color-gray-50);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-md);
}

.chart-placeholder p {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.el-card {
  border-radius: var(--border-radius-lg);
  border: none;
}

.mt-md {
  margin-top: var(--spacing-md);
}

.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.mt-lg {
  margin-top: var(--spacing-lg);
}
</style>
