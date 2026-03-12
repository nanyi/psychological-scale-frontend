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
          <el-button type="primary">搜索</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <el-table :data="tableData" stripe>
        <el-table-column prop="reportNo" label="报告编号" width="180" />
        <el-table-column prop="userName" label="用户" width="100" />
        <el-table-column prop="scaleName" label="量表名称" min-width="150" />
        <el-table-column prop="score" label="总分" width="80" />
        <el-table-column prop="level" label="等级" width="80">
          <template #default="{ row }">
            <span :class="['tag', getLevelClass(row.level)]">
              {{ row.level }}
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
            <el-button type="primary" link>查看</el-button>
            <el-button type="primary" link>下载</el-button>
            <el-button type="danger" link>删除</el-button>
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
  reportNo: '',
  userName: '',
  scaleName: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = [
  {
    reportNo: 'RPT202403120001',
    userName: '张三',
    scaleName: 'SCL-90症状自评量表',
    score: 156,
    level: '正常',
    status: 1,
    createTime: '2024-03-12 10:30:00'
  },
  {
    reportNo: 'RPT202403120002',
    userName: '李四',
    scaleName: 'MBTI职业性格测试',
    score: 0,
    level: 'INTJ',
    status: 1,
    createTime: '2024-03-12 11:00:00'
  },
  {
    reportNo: 'RPT202403110001',
    userName: '王五',
    scaleName: 'SDS抑郁自评量表',
    score: 45,
    level: '轻度抑郁',
    status: 1,
    createTime: '2024-03-11 15:20:00'
  },
  {
    reportNo: 'RPT202403100001',
    userName: '赵六',
    scaleName: '职业价值观测试',
    score: 0,
    level: '-',
    status: 2,
    createTime: '2024-03-10 09:00:00'
  }
]

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
  if (level === '正常' || level === 'INTJ') return 'tag-success'
  if (level.includes('抑郁') || level.includes('焦虑')) return 'tag-warning'
  return 'tag-info'
}
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
