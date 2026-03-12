<template>
  <div class="scale-list">
    <h2 class="page-title">量表管理</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="量表名称">
          <el-input v-model="searchForm.name" placeholder="请输入量表名称" clearable />
        </el-form-item>
        <el-form-item label="量表分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable>
            <el-option label="人格测试" value="personality" />
            <el-option label="情绪测试" value="emotion" />
            <el-option label="职业测试" value="career" />
            <el-option label="心理健康" value="mental" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <div class="table-toolbar">
        <el-button type="primary">新增量表</el-button>
      </div>
      
      <el-table :data="tableData" stripe class="mt-md">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="量表名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <span class="tag tag-info">{{ getCategoryName(row.category) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="questionCount" label="题目数量" width="100" />
        <el-table-column prop="price" label="价格(元)" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span :class="['tag', row.status === 1 ? 'tag-success' : 'tag-warning']">
              {{ row.status === 1 ? '上架' : '下架' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link>编辑</el-button>
            <el-button type="primary" link>题目</el-button>
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
  name: '',
  category: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = [
  {
    id: 1,
    name: 'SCL-90症状自评量表',
    category: 'mental',
    questionCount: 90,
    price: 29.9,
    status: 1,
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    name: 'MBTI职业性格测试',
    category: 'personality',
    questionCount: 93,
    price: 19.9,
    status: 1,
    createTime: '2024-01-10 09:30:00'
  },
  {
    id: 3,
    name: 'SDS抑郁自评量表',
    category: 'emotion',
    questionCount: 20,
    price: 9.9,
    status: 1,
    createTime: '2024-01-08 14:20:00'
  },
  {
    id: 4,
    name: '职业价值观测试',
    category: 'career',
    questionCount: 60,
    price: 15.0,
    status: 0,
    createTime: '2024-01-05 11:00:00'
  }
]

const categoryMap: Record<string, string> = {
  personality: '人格测试',
  emotion: '情绪测试',
  career: '职业测试',
  mental: '心理健康'
}

const getCategoryName = (category: string) => {
  return categoryMap[category] || category
}
</script>

<style scoped>
.scale-list {
  padding: 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-sm);
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
}

.el-card {
  border-radius: var(--border-radius-lg);
  border: none;
}

.mt-md {
  margin-top: var(--spacing-md);
}
</style>
