<template>
  <div class="scale-category">
    <h2 class="page-title">量表分类管理</h2>
    
    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <div class="table-toolbar">
        <el-button type="primary" @click="handleAdd">新增分类</el-button>
      </div>
      
      <el-table :data="tableData" stripe v-loading="loading" row-key="id" :tree-props="{ children: 'children' }">
        <el-table-column prop="categoryName" label="分类名称" min-width="150" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span :class="['tag', row.status === 1 ? 'tag-success' : 'tag-error']">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="handleAddChild(row)">添加子分类</el-button>
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
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类" prop="parentId">
          <el-cascader
            v-model="form.parentId"
            :options="categoryOptions"
            :props="{ checkStrictly: true, value: 'id', label: 'categoryName', emitPath: false }"
            placeholder="请选择父级分类（不选为一级分类）"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getCategoryTree, getCategoryAll, createCategory, updateCategory, deleteCategory, type ScaleCategory } from '@/api/scaleCategory'

const loading = ref(false)
const tableData = ref<ScaleCategory[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref<number>()

const form = reactive({
  categoryName: '',
  parentId: undefined as number | undefined,
  sortOrder: 0,
  status: 1,
  remark: ''
})

const rules = {
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const categoryOptions = computed(() => {
  const flatten = (list: ScaleCategory[]): ScaleCategory[] => {
    return list.reduce((acc: ScaleCategory[], item) => {
      acc.push(item)
      if (item.children?.length) {
        acc.push(...flatten(item.children))
      }
      return acc
    }, [])
  }
  return flatten(tableData.value)
})

const loadData = async () => {
  loading.value = true
  try {
    const data = await getCategoryTree()
    tableData.value = data || []
  } catch (error) {
    console.error('加载分类数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增分类'
  isEdit.value = false
  editId.value = undefined
  form.categoryName = ''
  form.parentId = undefined
  form.sortOrder = 0
  form.status = 1
  form.remark = ''
  dialogVisible.value = true
}

const handleAddChild = (row: ScaleCategory) => {
  dialogTitle.value = '添加子分类'
  isEdit.value = false
  editId.value = undefined
  form.categoryName = ''
  form.parentId = row.id
  form.sortOrder = 0
  form.status = 1
  form.remark = ''
  dialogVisible.value = true
}

const handleEdit = (row: ScaleCategory) => {
  dialogTitle.value = '编辑分类'
  isEdit.value = true
  editId.value = row.id
  form.categoryName = row.categoryName
  form.parentId = row.parentId === 0 ? undefined : row.parentId
  form.sortOrder = row.sortOrder
  form.status = row.status
  form.remark = row.remark || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  
  try {
    if (isEdit.value && editId.value) {
      await updateCategory(editId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createCategory(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleToggleStatus = async (row: ScaleCategory) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}分类「${row.categoryName}」吗？`, '提示', {
      type: 'warning'
    })
    await updateCategory(row.id, { status: row.status === 1 ? 0 : 1 })
    ElMessage.success(`${action}成功`)
    loadData()
  } catch {
    // 用户取消
  }
}

const handleDelete = async (row: ScaleCategory) => {
  try {
    await ElMessageBox.confirm(`确定要删除分类「${row.categoryName}」吗？此操作不可恢复。`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 用户取消
  }
}

loadData()
</script>

<style scoped>
.scale-category {
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
</style>
