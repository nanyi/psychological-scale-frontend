<template>
  <div class="user-group-list">
    <h2 class="page-title">用户分组</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="分组名称">
          <el-input v-model="searchForm.groupName" placeholder="请输入分组名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <div class="table-toolbar">
        <el-button type="primary" @click="handleAdd">新增分组</el-button>
      </div>
      
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="groupName" label="分组名称" min-width="150" />
        <el-table-column prop="groupCode" label="分组编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="memberCount" label="成员数量" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="handleMembers(row)">成员管理</el-button>
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

    <!-- 新增/编辑分组对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分组名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组编码" prop="groupCode">
          <el-input v-model="form.groupCode" placeholder="请输入分组编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 成员管理对话框 -->
    <el-dialog
      v-model="memberDialogVisible"
      title="成员管理"
      width="600px"
      destroy-on-close
    >
      <div class="member-toolbar">
        <el-button type="primary" size="small" @click="handleAddMembers">添加成员</el-button>
      </div>
      <el-table :data="memberList" stripe v-loading="memberLoading">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="handleRemoveMember(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getGroupList, createGroup, updateGroup, deleteGroup, getGroupMembers, removeGroupMembers, type UserGroupItem } from '@/api/userGroup'
import { getUserList } from '@/api/user'

const searchForm = reactive({
  groupName: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref<UserGroupItem[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const editId = ref<number>()
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const form = reactive({
  groupName: '',
  groupCode: '',
  description: ''
})

const rules = {
  groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  groupCode: [{ required: true, message: '请输入分组编码', trigger: 'blur' }]
}

const memberDialogVisible = ref(false)
const memberLoading = ref(false)
const memberList = ref<any[]>([])
const currentGroupId = ref<number>()

const loadData = async () => {
  loading.value = true
  try {
    const data = await getGroupList({
      current: pagination.current,
      size: pagination.size,
      groupName: searchForm.groupName || undefined
    })
    tableData.value = data.records
    pagination.total = data.total
  } catch (error) {
    console.error('加载分组数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.groupName = ''
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增分组'
  isEdit.value = false
  editId.value = undefined
  form.groupName = ''
  form.groupCode = ''
  form.description = ''
  dialogVisible.value = true
}

const handleEdit = (row: UserGroupItem) => {
  dialogTitle.value = '编辑分组'
  isEdit.value = true
  editId.value = row.id
  form.groupName = row.groupName
  form.groupCode = row.groupCode
  form.description = row.description || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value && editId.value) {
      await updateGroup(editId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createGroup(form)
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

const handleDelete = async (row: UserGroupItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除分组「${row.groupName}」吗？`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteGroup(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

const handleMembers = async (row: UserGroupItem) => {
  currentGroupId.value = row.id
  memberDialogVisible.value = true
  memberLoading.value = true
  try {
    const members = await getGroupMembers(row.id)
    if (members && members.length > 0) {
      const data = await getUserList({ current: 1, size: 1000 })
      const allUsers = data.records
      memberList.value = allUsers.filter((u: any) => members.includes(u.id))
    } else {
      memberList.value = []
    }
  } catch (error) {
    console.error('加载成员数据失败:', error)
  } finally {
    memberLoading.value = false
  }
}

const handleAddMembers = () => {
  ElMessage.info('添加成员功能开发中')
}

const handleRemoveMember = async (row: any) => {
  if (!currentGroupId.value) return
  try {
    await ElMessageBox.confirm(`确定要移除成员「${row.username}」吗？`, '提示')
    await removeGroupMembers(currentGroupId.value, [row.id])
    ElMessage.success('移除成功')
    handleMembers({ id: currentGroupId.value })
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-group-list {
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

.member-toolbar {
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
