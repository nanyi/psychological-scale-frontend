<template>
  <div class="user-list">
    <h2 class="page-title">用户管理</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
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
        <el-button type="primary">新增用户</el-button>
        <el-button>导出</el-button>
      </div>
      
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar || defaultAvatar" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column prop="userType" label="角色" width="100">
          <template #default="{ row }">
            <span :class="['tag', row.userType === 1 ? 'tag-info' : 'tag-success']">
              {{ row.userType === 1 ? '管理员' : '普通用户' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span :class="['tag', row.status === 1 ? 'tag-success' : 'tag-error']">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'" 
              link 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, updateUserStatus, deleteUser } from '@/api/user'
import type { UserItem } from '@/api/user'

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const searchForm = reactive({
  username: '',
  phone: '',
  status: undefined as number | undefined
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref<UserItem[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const data = await getUserList({
      current: pagination.current,
      size: pagination.size,
      username: searchForm.username || undefined,
      phone: searchForm.phone || undefined,
      status: searchForm.status
    })
    tableData.value = data.records
    pagination.total = data.total
  } catch (error) {
    console.error('加载用户数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.phone = ''
  searchForm.status = undefined
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleEdit = (row: UserItem) => {
  ElMessage.info(`编辑用户：${row.username}`)
}

const handleToggleStatus = async (row: UserItem) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户「${row.username}」吗？`, '提示', {
      type: 'warning'
    })
    await updateUserStatus(row.id, row.status === 1 ? 0 : 1)
    ElMessage.success(`${action}成功`)
    loadData()
  } catch {
    // 用户取消
  }
}

const handleDelete = async (row: UserItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户「${row.username}」吗？此操作不可恢复。`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

// 初始加载
loadData()
</script>

<style scoped>
.user-list {
  padding: 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-sm);
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.el-card {
  border-radius: var(--border-radius-lg);
  border: none;
}

.mt-md {
  margin-top: var(--spacing-md);
}
</style>
