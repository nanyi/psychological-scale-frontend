<template>
  <div class="scale-list">
    <h2 class="page-title">量表管理</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="量表名称">
          <el-input v-model="searchForm.name" placeholder="请输入量表名称" clearable />
        </el-form-item>
        <el-form-item label="量表分类">
          <el-select v-model="searchForm.categoryId" placeholder="请选择" clearable>
            <el-option
              v-for="cat in categoryList"
              :key="cat.id"
              :label="cat.categoryName"
              :value="cat.id"
            />
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
        <el-table-column prop="scaleName" label="量表名称" min-width="150" />
        <el-table-column prop="categoryName" label="分类" width="120">
          <template #default="{ row }">
            <span class="tag tag-info">{{ row.categoryName || '未分类' }}</span>
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
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="handleQuestions(row)">题目</el-button>
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
import { getScaleList, type ScaleItem } from '@/api/scale'
import { getCategoryAll, type ScaleCategory } from '@/api/scaleCategory'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  name: '',
  categoryId: undefined as number | undefined,
  status: undefined as number | undefined
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref<ScaleItem[]>([])
const loading = ref(false)
const categoryList = ref<ScaleCategory[]>([])

const loadCategoryList = async () => {
  try {
    const data = await getCategoryAll()
    categoryList.value = data || []
  } catch (error) {
    console.error('加载分类数据失败:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getScaleList({
      current: pagination.current,
      size: pagination.size,
      categoryId: searchForm.categoryId,
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
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.categoryId = undefined
  searchForm.status = undefined
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleEdit = (row: ScaleItem) => {
  ElMessage.info(`编辑量表：${row.scaleName}`)
}

const handleQuestions = (row: ScaleItem) => {
  ElMessage.info(`管理题目：${row.scaleName}`)
}

const handleDelete = async (row: ScaleItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除量表「${row.scaleName}」吗？`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadCategoryList()
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
