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
            <el-option label="人格测试" :value="1" />
            <el-option label="情绪测试" :value="2" />
            <el-option label="职业测试" :value="3" />
            <el-option label="心理健康" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <div class="table-toolbar">
        <el-button type="primary">新增量表</el-button>
      </div>
      
      <el-table :data="tableData" stripe class="mt-md" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="量表名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <span class="tag tag-info">{{ getCategoryName(row.category) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="questionCount" label="题目数量" width="100" />
        <el-table-column prop="price" label="价格(元)" width="100">
          <template #default="{ row }">
            ¥{{ row.price?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
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
        v-model:current-page="pagination.page"
        :page-size="pagination.pageSize"
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
import { getScaleList, type ScaleItem } from '@/api/scale'

const searchForm = reactive({
  name: '',
  category: undefined as number | undefined,
  status: undefined as number | undefined
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref<ScaleItem[]>([])
const loading = ref(false)

const categoryMap: Record<number, string> = {
  1: '人格测试',
  2: '情绪测试',
  3: '职业测试',
  4: '心理健康'
}

const getCategoryName = (category: number) => {
  return categoryMap[category] || '未知'
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getScaleList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      category: searchForm.category,
      status: searchForm.status
    })
    tableData.value = data.records
    pagination.total = data.total
  } catch (error) {
    console.error('加载量表数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.category = undefined
  searchForm.status = undefined
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

onMounted(() => {
  loadData()
})
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
