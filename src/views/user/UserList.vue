<template>
  <div class="user-list">
    <h2 class="page-title">用户管理</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.name" placeholder="请输入用户名" clearable />
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
          <el-button type="primary">搜索</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <div class="table-toolbar">
        <el-button type="primary">新增用户</el-button>
        <el-button>导出</el-button>
      </div>
      
      <el-table :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="用户名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <span :class="['tag', row.role === 'admin' ? 'tag-info' : 'tag-success']">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
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
            <el-button type="primary" link>编辑</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" link>
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
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
  phone: '',
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
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    name: '管理员',
    phone: '13800138000',
    email: 'admin@example.com',
    role: 'admin',
    status: 1,
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    name: '张三',
    phone: '13900139000',
    email: 'zhangsan@example.com',
    role: 'user',
    status: 1,
    createTime: '2024-01-15 09:30:00'
  },
  {
    id: 3,
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    name: '李四',
    phone: '13700137000',
    email: 'lisi@example.com',
    role: 'user',
    status: 0,
    createTime: '2024-01-20 14:20:00'
  }
]
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
