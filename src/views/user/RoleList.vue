<template>
  <div class="role-list">
    <h2 class="page-title">角色权限</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="启用" :value="1" />
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
        <el-button type="primary" @click="handleAdd">新增角色</el-button>
      </div>
      
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="roleName" label="角色名称" min-width="120" />
        <el-table-column prop="roleCode" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span :class="['tag', row.status === 1 ? 'tag-success' : 'tag-error']">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="handlePermission(row)">权限配置</el-button>
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

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="form.roleCode" placeholder="请输入角色编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限配置"
      width="500px"
      destroy-on-close
    >
      <div v-loading="permissionLoading">
        <el-tree
          ref="permissionTree"
          :data="permissionTree"
          :props="{ label: 'permissionName', children: 'children' }"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedPermissions"
        />
      </div>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePermissionSubmit" :loading="permissionLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getRoleList, createRole, updateRole, deleteRole, getPermissionTree, getPermissionsByRole, assignPermissions, type RoleItem } from '@/api/role'

const searchForm = reactive({
  roleName: '',
  status: undefined as number | undefined
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref<RoleItem[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const editId = ref<number>()
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const form = reactive({
  roleName: '',
  roleCode: '',
  description: '',
  status: 1
})

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

const permissionDialogVisible = ref(false)
const permissionLoading = ref(false)
const permissionTree = ref<any[]>([])
const checkedPermissions = ref<number[]>([])
const currentRoleId = ref<number>()

const loadData = async () => {
  loading.value = true
  try {
    const data = await getRoleList({
      current: pagination.current,
      size: pagination.size,
      roleName: searchForm.roleName || undefined,
      status: searchForm.status
    })
    tableData.value = data.records
    pagination.total = data.total
  } catch (error) {
    console.error('加载角色数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.roleName = ''
  searchForm.status = undefined
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增角色'
  isEdit.value = false
  editId.value = undefined
  form.roleName = ''
  form.roleCode = ''
  form.description = ''
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: RoleItem) => {
  dialogTitle.value = '编辑角色'
  isEdit.value = true
  editId.value = row.id
  form.roleName = row.roleName
  form.roleCode = row.roleCode
  form.description = row.description || ''
  form.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value && editId.value) {
      await updateRole(editId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createRole(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row: RoleItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色「${row.roleName}」吗？`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

const handlePermission = async (row: RoleItem) => {
  currentRoleId.value = row.id
  permissionDialogVisible.value = true
  permissionLoading.value = true
  try {
    const [treeData, permissions] = await Promise.all([
      getPermissionTree(),
      getPermissionsByRole(row.id)
    ])
    permissionTree.value = treeData || []
    checkedPermissions.value = permissions || []
  } catch (error) {
    console.error('加载权限数据失败:', error)
  } finally {
    permissionLoading.value = false
  }
}

const handlePermissionSubmit = async () => {
  if (!currentRoleId.value) return
  
  permissionLoading.value = true
  try {
    const checkedNodes = (window as any).$refs.permissionTree?.getCheckedKeys() || []
    await assignPermissions(currentRoleId.value, checkedNodes)
    ElMessage.success('权限保存成功')
    permissionDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    permissionLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.role-list {
  padding: 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-sm);
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-md);
}

.el-card {
  border-radius: var(--border-radius-lg);
  border: none;
}

.mt-md {
  margin-top: var(--spacing-md);
}
</style>
