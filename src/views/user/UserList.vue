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
          <el-select v-model="searchForm.status" style="min-width: 100px" placeholder="请选择" clearable>
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
        <el-button type="primary" @click="handleAdd">新增用户</el-button>
        <el-button @click="handleExport">导出</el-button>
      </div>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar || defaultAvatar" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleAssignRole(row)">分配角色</el-button>
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

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="userType">
          <el-select v-model="form.userType" placeholder="请选择角色">
            <el-option label="普通用户" :value="2" />
            <el-option label="管理员" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="500px"
      destroy-on-close
    >
      <div class="role-dialog-content">
        <div class="current-user">
          <span class="label">当前用户：</span>
          <span class="username">{{ currentUser?.username }}</span>
        </div>
        <el-divider />
        <div class="role-selection">
          <div class="selection-title">选择角色（支持多选）</div>
          <el-checkbox-group v-model="selectedRoleIds" class="role-checkbox-group">
            <el-checkbox v-for="role in allRoles" :key="role.id" :value="role.id" class="role-checkbox">
              {{ role.roleName }}
            </el-checkbox>
          </el-checkbox-group>
          <el-empty v-if="allRoles.length === 0" description="暂无可用角色" :image-size="60" />
        </div>
      </div>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRoles" :loading="roleLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getUserList, updateUser, updateUserStatus, deleteUser, createUser, type UserItem } from '@/api/user'
import { getRoleAll, assignRole, removeRole, getUserRoles, type RoleItem } from '@/api/role'

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

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const editId = ref<number>()
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: '',
  userType: 2,
  status: 1
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur', min: 6 }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }]
}

// 角色分配相关
const roleDialogVisible = ref(false)
const roleLoading = ref(false)
const currentUser = ref<UserItem | null>(null)
const allRoles = ref<RoleItem[]>([])
const selectedRoleIds = ref<number[]>([])
const userAssignedRoles = ref<RoleItem[]>([])

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

const handleAdd = () => {
  dialogTitle.value = '新增用户'
  isEdit.value = false
  editId.value = undefined
  form.username = ''
  form.password = ''
  form.nickname = ''
  form.phone = ''
  form.email = ''
  form.userType = 2
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: UserItem) => {
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  editId.value = row.id
  form.username = row.username
  form.nickname = row.nickname || ''
  form.phone = row.phone || ''
  form.email = row.email || ''
  form.userType = row.userType
  form.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()

  submitLoading.value = true
  try {
    if (isEdit.value && editId.value) {
      await updateUser(editId.value, {
        username: form.username,
        nickname: form.nickname,
        phone: form.phone,
        email: form.email,
        userType: form.userType,
        status: form.status
      })
      ElMessage.success('更新成功')
    } else {
      await createUser({
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        phone: form.phone,
        email: form.email,
        userType: form.userType,
        status: 1
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    // ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
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

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleAssignRole = async (row: UserItem) => {
  currentUser.value = row
  roleDialogVisible.value = true
  
  try {
    const [rolesData, userRolesData] = await Promise.all([
      getRoleAll(),
      getUserRoles(row.id)
    ])
    allRoles.value = rolesData
    userAssignedRoles.value = userRolesData
    selectedRoleIds.value = userRolesData.map(r => r.id)
  } catch (error) {
    console.error('加载角色数据失败:', error)
    ElMessage.error('加载角色数据失败')
  }
}

const handleSaveRoles = async () => {
  if (!currentUser.value) return
  
  roleLoading.value = true
  try {
    const userId = currentUser.value.id
    const currentIds = selectedRoleIds.value
    const previousIds = userAssignedRoles.value.map(r => r.id)
    
    const toAdd = currentIds.filter(id => !previousIds.includes(id))
    const toRemove = previousIds.filter(id => !currentIds.includes(id))
    
    for (const roleId of toAdd) {
      await assignRole(userId, roleId)
    }
    for (const roleId of toRemove) {
      await removeRole(userId, roleId)
    }
    
    ElMessage.success('角色分配保存成功')
    roleDialogVisible.value = false
  } catch (error) {
    console.error('保存角色失败:', error)
    ElMessage.error('保存角色失败')
  } finally {
    roleLoading.value = false
  }
}

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

.role-dialog-content {
  padding: var(--spacing-sm) 0;
}

.current-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.current-user .label {
  color: var(--text-secondary);
  font-size: 14px;
}

.current-user .username {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 15px;
}

.role-selection {
  padding: var(--spacing-sm) 0;
}

.selection-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.role-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.role-checkbox {
  margin-right: 0;
  height: auto;
}
</style>
