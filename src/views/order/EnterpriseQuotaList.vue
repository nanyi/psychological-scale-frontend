<template>
  <div class="enterprise-quota-list">
    <h2 class="page-title">企业配额</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="企业名称">
          <el-input v-model="searchForm.enterpriseName" placeholder="请输入企业名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="enterpriseName" label="企业名称" width="150" />
        <el-table-column prop="scaleName" label="量表名称" min-width="150" />
        <el-table-column label="配额使用" width="180">
          <template #default="{ row }">
            <div class="quota-progress">
              <el-progress 
                :percentage="getUsagePercentage(row)" 
                :color="getProgressColor(row)"
                :stroke-width="8"
              />
              <span class="quota-text">
                {{ row.usedQuota }} / {{ row.totalQuota }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="剩余配额" width="100">
          <template #default="{ row }">
            <span :class="['remaining-quota', getRemainingClass(row)]">
              {{ row.remainingQuota }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['tag', getStatusClass(row.status)]">
              {{ row.statusName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" label="过期时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleRecharge(row)">充值</el-button>
            <el-button v-if="row.status === 1" type="warning" link @click="handleExpire(row)">过期</el-button>
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

    <el-dialog v-model="rechargeDialogVisible" title="配额充值" width="400px">
      <el-form :model="rechargeForm" label-width="80px">
        <el-form-item label="企业">
          <el-input :value="rechargeForm.enterpriseName" disabled />
        </el-form-item>
        <el-form-item label="量表">
          <el-input :value="rechargeForm.scaleName" disabled />
        </el-form-item>
        <el-form-item label="当前配额">
          <el-input :value="rechargeForm.currentQuota" disabled />
        </el-form-item>
        <el-form-item label="充值数量">
          <el-input-number v-model="rechargeForm.addQuota" :min="1" :max="99999" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="rechargeForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRechargeSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { 
  getEnterpriseQuotaList, 
  rechargeEnterpriseQuota, 
  expireEnterpriseQuota,
  type EnterpriseQuota 
} from '@/api/enterpriseQuota'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  enterpriseName: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref<EnterpriseQuota[]>([])
const loading = ref(false)

const rechargeDialogVisible = ref(false)
const rechargeForm = reactive({
  enterpriseId: 0,
  enterpriseName: '',
  scaleId: 0,
  scaleName: '',
  currentQuota: 0,
  addQuota: 1,
  remark: ''
})

const getUsagePercentage = (row: EnterpriseQuota) => {
  if (row.totalQuota === 0) return 0
  return Math.round((row.usedQuota / row.totalQuota) * 100)
}

const getProgressColor = (row: EnterpriseQuota) => {
  const percentage = getUsagePercentage(row)
  if (percentage >= 90) {
    return '#FF6B6B'
  } else if (percentage >= 80) {
    return '#FFB380'
  } else {
    return '#1678D4'
  }
}

const getRemainingClass = (row: EnterpriseQuota) => {
  const percentage = getUsagePercentage(row)
  if (percentage >= 90) {
    return 'remaining-critical'
  } else if (percentage >= 80) {
    return 'remaining-warning'
  }
  return ''
}

const statusMap: Record<number, string> = {
  0: 'tag-warning',
  1: 'tag-success',
  2: 'tag-error'
}

const getStatusClass = (status: number) => {
  return statusMap[status] || 'tag-info'
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getEnterpriseQuotaList({
      current: pagination.current,
      size: pagination.size
    })
    tableData.value = data.records
    pagination.total = data.total
  } catch (error) {
    console.error('加载企业配额数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.enterpriseName = ''
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleRecharge = (row: EnterpriseQuota) => {
  rechargeForm.enterpriseId = row.enterpriseId
  rechargeForm.enterpriseName = row.enterpriseName
  rechargeForm.scaleId = row.scaleId
  rechargeForm.scaleName = row.scaleName
  rechargeForm.currentQuota = row.remainingQuota
  rechargeForm.addQuota = 1
  rechargeForm.remark = ''
  rechargeDialogVisible.value = true
}

const handleRechargeSubmit = async () => {
  try {
    await rechargeEnterpriseQuota({
      enterpriseId: rechargeForm.enterpriseId,
      scaleId: rechargeForm.scaleId,
      quota: rechargeForm.addQuota,
      remark: rechargeForm.remark
    })
    ElMessage.success('充值成功')
    rechargeDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('充值失败:', error)
  }
}

const handleExpire = async (row: EnterpriseQuota) => {
  try {
    await ElMessageBox.confirm(`确定要将企业「${row.enterpriseName}」的「${row.scaleName}」配额过期吗？`, '提示', {
      type: 'warning'
    })
    await expireEnterpriseQuota(row.id)
    ElMessage.success('操作成功')
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
.enterprise-quota-list {
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

.quota-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.quota-progress :deep(.el-progress) {
  flex: 1;
}

.quota-text {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  white-space: nowrap;
}

.remaining-quota {
  font-weight: var(--font-weight-semibold);
}

.remaining-warning {
  color: #fa8c16;
}

.remaining-critical {
  color: #ff4d4f;
}
</style>
