<template>
  <div class="order-detail">
    <div class="page-header">
      <el-button text @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 class="page-title">订单详情</h2>
    </div>

    <div v-loading="loading" class="detail-content">
      <template v-if="orderDetail">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card shadow="never" class="info-card">
              <template #header>
                <div class="card-header">
                  <span class="card-title">基本信息</span>
                  <span :class="['status-tag', `status-${orderDetail.status}`]">
                    {{ orderDetail.statusName }}
                  </span>
                </div>
              </template>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="订单编号">
                  {{ orderDetail.orderNo }}
                </el-descriptions-item>
                <el-descriptions-item label="订单类型">
                  {{ orderDetail.orderTypeName }}
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                  {{ orderDetail.createTime }}
                </el-descriptions-item>
                <el-descriptions-item label="过期时间">
                  {{ orderDetail.expireTime || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="支付时间">
                  {{ orderDetail.payTime || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="支付渠道">
                  {{ orderDetail.payChannel || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-card shadow="never" class="info-card mt-lg">
              <template #header>
                <span class="card-title">用户信息</span>
              </template>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="用户名">
                  {{ orderDetail.userName }}
                </el-descriptions-item>
                <el-descriptions-item label="手机号">
                  {{ orderDetail.phone }}
                </el-descriptions-item>
                <el-descriptions-item label="邮箱">
                  {{ orderDetail.email || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-card shadow="never" class="info-card mt-lg">
              <template #header>
                <span class="card-title">订单金额</span>
              </template>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="原价">
                  <span class="amount">¥{{ orderDetail.originalAmount?.toFixed(2) || '0.00' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="优惠金额">
                  <span class="discount">-¥{{ orderDetail.discountAmount?.toFixed(2) || '0.00' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="实付金额" :span="2">
                  <span class="actual-amount">¥{{ orderDetail.actualAmount?.toFixed(2) || '0.00' }}</span>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-card shadow="never" class="info-card mt-lg">
              <template #header>
                <span class="card-title">订单项</span>
              </template>
              <el-table :data="orderDetail.items" stripe>
                <el-table-column label="量表" min-width="200">
                  <template #default="{ row }">
                    <div class="scale-info">
                      <el-image
                        v-if="row.scaleCover"
                        :src="row.scaleCover"
                        fit="cover"
                        class="scale-cover"
                      />
                      <span>{{ row.scaleName }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="unitPrice" label="单价" width="100">
                  <template #default="{ row }">
                    ¥{{ row.unitPrice?.toFixed(2) || '0.00' }}
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="80" />
                <el-table-column prop="totalPrice" label="小计" width="100">
                  <template #default="{ row }">
                    ¥{{ row.totalPrice?.toFixed(2) || '0.00' }}
                  </template>
                </el-table-column>
                <el-table-column prop="refundStatusName" label="退款状态" width="100">
                  <template #default="{ row }">
                    <span :class="['refund-tag', `refund-${row.refundStatus}`]">
                      {{ row.refundStatusName }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card shadow="never" class="action-card">
              <template #header>
                <span class="card-title">操作</span>
              </template>
              <div class="action-list">
                <el-button
                  v-if="orderDetail.status === 1"
                  type="primary"
                  class="action-btn"
                  @click="handleRefund"
                >
                  申请退款
                </el-button>
                <el-button
                  v-if="orderDetail.status === 1"
                  class="action-btn"
                  @click="handleCancel"
                >
                  取消订单
                </el-button>
                <el-button class="action-btn" @click="handleExport">
                  导出订单
                </el-button>
              </div>
            </el-card>

            <el-card shadow="never" class="info-card mt-lg">
              <template #header>
                <span class="card-title">时间线</span>
              </template>
              <el-timeline>
                <el-timeline-item
                  :timestamp="orderDetail.createTime"
                  placement="top"
                >
                  订单创建
                </el-timeline-item>
                <el-timeline-item
                  v-if="orderDetail.payTime"
                  :timestamp="orderDetail.payTime"
                  placement="top"
                  type="success"
                >
                  订单支付
                </el-timeline-item>
                <el-timeline-item
                  v-if="orderDetail.cancelTime"
                  :timestamp="orderDetail.cancelTime"
                  placement="top"
                  type="danger"
                >
                  订单取消
                </el-timeline-item>
                <el-timeline-item
                  v-if="orderDetail.refundTime"
                  :timestamp="orderDetail.refundTime"
                  placement="top"
                  type="warning"
                >
                  订单退款
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </div>

    <el-dialog v-model="refundDialogVisible" title="申请退款" width="500px">
      <el-form ref="refundFormRef" :model="refundForm" :rules="refundRules" label-width="80px">
        <el-form-item label="订单编号">
          <span>{{ orderDetail?.orderNo }}</span>
        </el-form-item>
        <el-form-item label="退款金额">
          <span class="amount">¥{{ orderDetail?.actualAmount?.toFixed(2) || '0.00' }}</span>
        </el-form-item>
        <el-form-item label="退款原因" prop="reason">
          <el-input
            v-model="refundForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入退款原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="refundLoading" @click="submitRefund">
          确认退款
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getOrderDetail, applyRefund, type OrderDetail } from '@/api/order'

const route = useRoute()
const router = useRouter()

const orderDetail = ref<OrderDetail | null>(null)
const loading = ref(false)

const refundDialogVisible = ref(false)
const refundLoading = ref(false)
const refundFormRef = ref<FormInstance>()
const refundForm = reactive({
  reason: ''
})

const refundRules: FormRules = {
  reason: [
    { required: true, message: '请输入退款原因', trigger: 'blur' }
  ]
}

const loadOrderDetail = async () => {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('订单ID无效')
    return
  }

  loading.value = true
  try {
    const data = await getOrderDetail(id)
    orderDetail.value = data
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/order')
}

const handleRefund = () => {
  refundForm.reason = ''
  refundDialogVisible.value = true
}

const submitRefund = async () => {
  if (!orderDetail.value) return

  const valid = await refundFormRef.value?.validate().catch(() => false)
  if (!valid) return

  refundLoading.value = true
  try {
    await applyRefund(orderDetail.value.id, refundForm.reason)
    ElMessage.success('退款申请已提交')
    refundDialogVisible.value = false
    loadOrderDetail()
  } catch (error) {
    console.error('退款申请失败:', error)
    ElMessage.error('退款申请失败')
  } finally {
    refundLoading.value = false
  }
}

const handleCancel = async () => {
  if (!orderDetail.value) return

  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      type: 'warning'
    })
    ElMessage.success('订单已取消')
    loadOrderDetail()
  } catch {
    // 用户取消
  }
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.detail-content {
  min-height: 400px;
}

.info-card,
.action-card {
  border-radius: var(--border-radius-lg);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.status-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: var(--font-size-sm);
}

.status-0 {
  background: #FEF3C7;
  color: #92400E;
}

.status-1 {
  background: #D1FAE5;
  color: #065F46;
}

.status-2 {
  background: #FEE2E2;
  color: #991B1B;
}

.status-3 {
  background: #E0E7FF;
  color: #3730A3;
}

.status-4 {
  background: #FEF3C7;
  color: #92400E;
}

.amount {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-primary);
}

.discount {
  color: #10B981;
}

.actual-amount {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
}

.scale-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.scale-cover {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-sm);
  object-fit: cover;
}

.refund-tag {
  font-size: var(--font-size-sm);
}

.refund-0 {
  color: var(--text-secondary);
}

.refund-1 {
  color: #F59E0B;
}

.refund-2 {
  color: #10B981;
}

.action-card {
  position: sticky;
  top: 20px;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.action-btn {
  width: 100%;
}

.mt-lg {
  margin-top: var(--spacing-lg);
}
</style>
