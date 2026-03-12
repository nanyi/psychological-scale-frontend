<template>
  <div class="order-list">
    <h2 class="page-title">订单管理</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
        </el-form-item>
        <el-form-item label="用户手机">
          <el-input v-model="searchForm.phone" placeholder="请输入用户手机" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已退款" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <el-table :data="tableData" stripe>
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="scaleName" label="量表名称" min-width="150" />
        <el-table-column prop="amount" label="金额(元)" width="100">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['tag', getStatusClass(row.status)]">
              {{ getStatusName(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="支付时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link>详情</el-button>
            <el-button v-if="row.status === 1" type="danger" link>退款</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="mt-md"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        background
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const searchForm = reactive({
  orderNo: '',
  phone: '',
  status: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = [
  {
    orderNo: 'ORDER202403120001',
    userName: '张三',
    phone: '13800138000',
    scaleName: 'SCL-90症状自评量表',
    amount: 29.9,
    status: 2,
    payTime: '2024-03-12 10:30:00'
  },
  {
    orderNo: 'ORDER202403120002',
    userName: '李四',
    phone: '13900139000',
    scaleName: 'MBTI职业性格测试',
    amount: 19.9,
    status: 1,
    payTime: '2024-03-12 11:00:00'
  },
  {
    orderNo: 'ORDER202403110001',
    userName: '王五',
    phone: '13700137000',
    scaleName: 'SDS抑郁自评量表',
    amount: 9.9,
    status: 3,
    payTime: '2024-03-11 15:20:00'
  }
]

const statusMap: Record<number, string> = {
  0: '待支付',
  1: '已支付',
  2: '已完成',
  3: '已退款'
}

const getStatusName = (status: number) => {
  return statusMap[status] || '未知'
}

const getStatusClass = (status: number) => {
  const classMap: Record<number, string> = {
    0: 'tag-warning',
    1: 'tag-info',
    2: 'tag-success',
    3: 'tag-error'
  }
  return classMap[status] || 'tag-info'
}
</script>

<style scoped>
.order-list {
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
