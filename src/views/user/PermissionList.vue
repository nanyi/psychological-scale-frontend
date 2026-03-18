<template>
  <div class="permission-list">
    <h2 class="page-title">权限管理</h2>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="权限名称">
          <el-input v-model="searchForm.permissionName" placeholder="请输入权限名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" style="min-width: 100px;" placeholder="请选择" clearable>
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
        <el-button type="primary" @click="handleAdd()">新增权限</el-button>
      </div>

      <el-table :data="tableData" row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" v-loading="loading">
        <el-table-column prop="permissionName" label="权限名称" min-width="180">
          <template #default="{ row }">
            <span>{{ row.permissionName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon" :size="18">
              <component :is="row.icon" />
            </el-icon>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.permissionType)" size="small">
              {{ getTypeName(row.permissionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="150" show-overflow-tooltip />
        <el-table-column prop="component" label="组件" min-width="150" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span :class="['tag', row.status === 1 ? 'tag-success' : 'tag-error']">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleAdd(row)">新增子级</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="父级权限" v-if="form.parentId">
          <el-input :value="parentMenuName" disabled />
        </el-form-item>
        <el-form-item label="权限类型" prop="permissionType">
          <el-radio-group v-model="form.permissionType">
            <el-radio :value="1">菜单目录</el-radio>
            <el-radio :value="2">菜单</el-radio>
            <el-radio :value="3">功能</el-radio>
            <el-radio :value="4">数据</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限名称" prop="permissionName">
          <el-input v-model="form.permissionName" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="菜单编码" prop="permissionCode">
          <el-input v-model="form.permissionCode" placeholder="请输入菜单编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="form.icon" placeholder="请选择图标" clearable style="width: 100%;">
            <el-option
              v-for="icon in iconList"
              :key="icon"
              :label="icon"
              :value="icon"
            >
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-icon :size="18"><component :is="icon" /></el-icon>
                <span>{{ icon }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="路由路径" prop="path" v-if="form.permissionType === 2">
          <el-input v-model="form.path" placeholder="请输入路由路径，如 /user" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-if="form.permissionType === 2">
          <el-input v-model="form.component" placeholder="请输入组件路径，如 user/UserList" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getMenuTree, type MenuItem } from '@/api/role'

const searchForm = reactive({
  permissionName: '',
  status: undefined as number | undefined
})

const tableData = ref<MenuItem[]>([])
const loading = ref(false)
const originalData = ref<MenuItem[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const editId = ref<number>()
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const parentMenuName = ref('')

const form = reactive({
  parentId: 0,
  permissionType: 2,
  permissionName: '',
  permissionCode: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 1
})

const rules = {
  permissionName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  permissionCode: [{ required: true, message: '请输入菜单编码', trigger: 'blur' }],
  permissionType: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
}

const iconList = [
  'HomeFilled',
  'Menu',
  'User',
  'UserFilled',
  'Setting',
  'Document',
  'Folder',
  'FolderOpened',
  'Files',
  'List',
  'Grid',
  'Operation',
  'Tools',
  'Management',
  'DataAnalysis',
  'TrendCharts',
  'Monitor',
  'Platform',
  'Connection',
  'Promotion',
  'ShoppingCart',
  'Ticket',
  'OfficeBuilding',
  'School',
  'House',
  'Lock',
  'Key',
  'Shield',
  'Warning',
  'CircleCheck',
  'CircleClose',
  'InfoFilled',
  'SuccessFilled',
  'WarningFilled',
  'ErrorFilled',
  'Search',
  'Plus',
  'Minus',
  'Edit',
  'Delete',
  'Refresh',
  'Upload',
  'Download',
  'View',
  'Hide',
  'Camera',
  'Picture',
  'Message',
  'Bell',
  'Calendar',
  'Clock',
  'Star',
  'Heart',
  'Flag',
  'Location',
  'Phone',
  'Message',
  'Mail',
  'Link',
  'Paperclip'
]

const filterData = (data: MenuItem[], keyword: string, status?: number): MenuItem[] => {
  return data
    .filter(item => {
      const matchName = !keyword || item.permissionName.toLowerCase().includes(keyword.toLowerCase())
      const matchStatus = status === undefined || item.status === status
      return matchName && matchStatus
    })
    .map(item => ({
      ...item,
      children: item.children ? filterData(item.children, keyword, status) : []
    }))
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getMenuTree()
    originalData.value = data || []
    tableData.value = filterData(originalData.value, searchForm.permissionName, searchForm.status)
  } catch (error) {
    console.error('加载菜单数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  tableData.value = filterData(originalData.value, searchForm.permissionName, searchForm.status)
}

const handleReset = () => {
  searchForm.permissionName = ''
  searchForm.status = undefined
  handleSearch()
}

const findParentName = (data: MenuItem[], parentId: number): string => {
  for (const item of data) {
    if (item.id === parentId) {
      return item.permissionName
    }
    if (item.children) {
      const found = findParentName(item.children, parentId)
      if (found) return found
    }
  }
  return ''
}

const handleAdd = (row?: MenuItem) => {
  dialogTitle.value = row ? '新增子菜单' : '新增权限'
  isEdit.value = false
  editId.value = undefined
  form.parentId = row?.id || 0
  parentMenuName.value = row ? row.permissionName : ''
  permissionType = row ? 2 : 1
  form.permissionName = ''
  form.permissionCode = ''
  form.path = ''
  form.component = ''
  form.icon = ''
  form.sort = 0
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: MenuItem) => {
  dialogTitle.value = '编辑菜单'
  isEdit.value = true
  editId.value = row.id
  form.parentId = row.parentId
  parentMenuName.value = findParentName(originalData.value, row.parentId)
  form.permissionType = row.permissionType || row.type
  form.permissionName = row.permissionName
  form.permissionCode = row.permissionCode
  form.path = row.path || ''
  form.component = row.component || ''
  form.icon = row.icon || ''
  form.sort = row.sort
  form.status = row.status
  dialogVisible.value = true
}

const generateId = (): number => {
  return Math.max(0, ...originalData.value.map(item => item.id)) + Math.floor(Math.random() * 1000) + 1
}

const addMenuToTree = (data: MenuItem[], newItem: MenuItem): MenuItem[] => {
  if (newItem.parentId === 0) {
    return [...data, newItem]
  }
  return data.map(item => {
    if (item.id === newItem.parentId) {
      return {
        ...item,
        children: [...(item.children || []), newItem]
      }
    }
    if (item.children) {
      return {
        ...item,
        children: addMenuToTree(item.children, newItem)
      }
    }
    return item
  })
}

const updateMenuInTree = (data: MenuItem[], updatedItem: MenuItem): MenuItem[] => {
  return data.map(item => {
    if (item.id === updatedItem.id) {
      return { ...item, ...updatedItem }
    }
    if (item.children) {
      return {
        ...item,
        children: updateMenuInTree(item.children, updatedItem)
      }
    }
    return item
  })
}

const deleteMenuFromTree = (data: MenuItem[], id: number): MenuItem[] => {
  return data
    .filter(item => item.id !== id)
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: deleteMenuFromTree(item.children, id)
        }
      }
      return item
    })
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value && editId.value) {
      const updatedItem: MenuItem = {
        id: editId.value,
        permissionName: form.permissionName,
        permissionCode: form.permissionCode,
        type: permissionType,
        parentId: form.parentId,
        path: form.path,
        component: form.component,
        icon: form.icon,
        sort: form.sort,
        status: form.status
      }
      originalData.value = updateMenuInTree(originalData.value, updatedItem)
      ElMessage.success('更新成功')
    } else {
      const newItem: MenuItem = {
        id: generateId(),
        permissionName: form.permissionName,
        permissionCode: form.permissionCode,
        type: permissionType,
        parentId: form.parentId,
        path: form.path,
        component: form.component,
        icon: form.icon,
        sort: form.sort,
        status: form.status,
        children: []
      }
      originalData.value = addMenuToTree(originalData.value, newItem)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    tableData.value = filterData(originalData.value, searchForm.permissionName, searchForm.status)
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

const getTypeName = (type: number) => {
  const typeMap: Record<number, string> = {
    1: '菜单目录',
    2: '菜单',
    3: '功能',
    4: '数据'
  }
  return typeMap[type] || '未知'
}

const getTypeTagType = (type: number) => {
  const tagMap: Record<number, string> = {
    1: 'warning',
    2: 'success',
    3: 'primary',
    4: 'info'
  }
  return tagMap[type] || 'info'
}

const handleDelete = async (row: MenuItem) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('请先删除子菜单')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除菜单「${row.permissionName}」吗？`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    originalData.value = deleteMenuFromTree(originalData.value, row.id)
    tableData.value = filterData(originalData.value, searchForm.permissionName, searchForm.status)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.permission-list {
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

.text-gray {
  color: var(--color-gray-400);
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
}

.tag-success {
  background-color: var(--color-success-100);
  color: var(--color-success-600);
}

.tag-error {
  background-color: var(--color-danger-100);
  color: var(--color-danger-600);
}
</style>
