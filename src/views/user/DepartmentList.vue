<template>
  <div class="department-list">
    <h2 class="page-title">组织架构</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }" class="mt-md">
      <div class="table-toolbar">
        <el-button type="primary" @click="handleAddRoot">新增部门</el-button>
      </div>
      
      <el-table :data="tableData" stripe v-loading="loading" row-key="id" :tree-props="{ children: 'children' }">
        <el-table-column prop="departmentName" label="部门名称" min-width="200" />
        <el-table-column prop="leader" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
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
            <el-button type="primary" link @click="handleAddChild(row)">添加子部门</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑部门对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item v-if="form.parentId" label="上级部门">
          <el-input :value="parentDepartmentName" disabled />
        </el-form-item>
        <el-form-item label="部门名称" prop="departmentName">
          <el-input v-model="form.departmentName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="form.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" />
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
import { reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getDepartmentTree, createDepartment, updateDepartment, deleteDepartment, type DepartmentItem } from '@/api/department'

const tableData = ref<DepartmentItem[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const editId = ref<number>()
const parentDepartmentName = ref('')
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const form = reactive({
  parentId: undefined as number | undefined,
  departmentName: '',
  leader: '',
  phone: '',
  email: '',
  sortOrder: 0,
  status: 1
})

const rules = {
  departmentName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getDepartmentTree()
    tableData.value = data || []
  } catch (error) {
    console.error('加载部门数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAddRoot = () => {
  dialogTitle.value = '新增部门'
  isEdit.value = false
  editId.value = undefined
  form.parentId = undefined
  parentDepartmentName.value = ''
  form.departmentName = ''
  form.leader = ''
  form.phone = ''
  form.email = ''
  form.sortOrder = 0
  form.status = 1
  dialogVisible.value = true
}

const handleAddChild = (row: DepartmentItem) => {
  dialogTitle.value = '添加子部门'
  isEdit.value = false
  editId.value = undefined
  form.parentId = row.id
  parentDepartmentName.value = row.departmentName
  form.departmentName = ''
  form.leader = ''
  form.phone = ''
  form.email = ''
  form.sortOrder = 0
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: DepartmentItem) => {
  dialogTitle.value = '编辑部门'
  isEdit.value = true
  editId.value = row.id
  form.parentId = row.parentId
  form.departmentName = row.departmentName
  form.leader = row.leader || ''
  form.phone = row.phone || ''
  form.email = row.email || ''
  form.sortOrder = row.sortOrder || 0
  form.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value && editId.value) {
      await updateDepartment(editId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createDepartment(form)
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

const handleDelete = async (row: DepartmentItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除部门「${row.departmentName}」吗？此操作不可恢复。`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteDepartment(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

loadData()
</script>

<style scoped>
.department-list {
  padding: 0;
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
