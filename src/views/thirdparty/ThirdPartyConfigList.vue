<template>
  <div class="thirdparty-config-list">
    <h2 class="page-title">第三方服务配置</h2>

    <el-card shadow="never" :body-style="{ padding: 'var(--spacing-lg)' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="平台名称">
          <el-input v-model="searchForm.platformName" placeholder="请输入平台名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" style="min-width: 100px" placeholder="请选择" clearable>
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
        <el-button type="primary" @click="handleAdd">新增配置</el-button>
      </div>

      <el-table :data="tableData" stripe class="mt-md" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="platformName" label="平台名称" min-width="150" />
        <el-table-column prop="platformCode" label="平台编码" width="120" />
        <el-table-column prop="apiBaseUrl" label="API地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="appKey" label="AppKey" width="150" show-overflow-tooltip />
        <el-table-column prop="syncStrategyName" label="同步策略" width="100">
          <template #default="{ row }">
            <span class="tag tag-info">{{ row.syncStrategyName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span :class="['tag', row.status === 1 ? 'tag-success' : 'tag-warning']">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="handleTest(row)">测试</el-button>
            <el-button v-if="row.status === 0" type="success" link @click="handleEnable(row)">启用</el-button>
            <el-button v-else type="warning" link @click="handleDisable(row)">禁用</el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="平台名称" prop="platformName">
          <el-input v-model="formData.platformName" placeholder="请输入平台名称" />
        </el-form-item>
        <el-form-item label="平台编码" prop="platformCode">
          <el-input v-model="formData.platformCode" placeholder="请输入平台编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="API基础地址" prop="apiBaseUrl">
          <el-input v-model="formData.apiBaseUrl" placeholder="请输入API基础地址" />
        </el-form-item>
        <el-form-item label="AppKey" prop="appKey">
          <el-input v-model="formData.appKey" placeholder="请输入AppKey" />
        </el-form-item>
        <el-form-item label="AppSecret" prop="appSecret">
          <el-input v-model="formData.appSecret" placeholder="请输入AppSecret" show-password />
        </el-form-item>
        <el-form-item label="回调地址" prop="callbackUrl">
          <el-input v-model="formData.callbackUrl" placeholder="请输入回调地址" />
        </el-form-item>
        <el-form-item label="同步策略" prop="syncStrategy">
          <el-select v-model="formData.syncStrategy" placeholder="请选择同步策略" style="width: 100%">
            <el-option label="实时同步" :value="1" />
            <el-option label="定时同步" :value="2" />
            <el-option label="手动同步" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import {
  getThirdPartyConfigPage,
  createThirdPartyConfig,
  updateThirdPartyConfig,
  deleteThirdPartyConfig,
  enableThirdPartyConfig,
  disableThirdPartyConfig,
  testThirdPartyConfig,
  type ThirdPartyConfig
} from '@/api/thirdParty'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

const searchForm = reactive({
  platformName: '',
  status: undefined as number | undefined
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref<ThirdPartyConfig[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = computed(() => (isEdit.value ? '编辑配置' : '新增配置'))
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const editId = ref<number>()

const formData = reactive({
  platformName: '',
  platformCode: '',
  apiBaseUrl: '',
  appKey: '',
  appSecret: '',
  callbackUrl: '',
  syncStrategy: undefined as number | undefined,
  remark: ''
})

const formRules: FormRules = {
  platformName: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
  platformCode: [{ required: true, message: '请输入平台编码', trigger: 'blur' }],
  apiBaseUrl: [{ required: true, message: '请输入API基础地址', trigger: 'blur' }],
  appKey: [{ required: true, message: '请输入AppKey', trigger: 'blur' }],
  appSecret: [{ required: true, message: '请输入AppSecret', trigger: 'blur' }],
  syncStrategy: [{ required: true, message: '请选择同步策略', trigger: 'change' }]
}

const SYNC_STRATEGY_MAP: Record<number, string> = {
  1: '实时同步',
  2: '定时同步',
  3: '手动同步'
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await getThirdPartyConfigPage({
      current: pagination.current,
      size: pagination.size,
      platformName: searchForm.platformName || undefined,
      status: searchForm.status
    })
    tableData.value = (data.records || []).map(item => ({
      ...item,
      syncStrategyName: SYNC_STRATEGY_MAP[item.syncStrategy] || '-',
      statusName: item.status === 1 ? '启用' : '禁用'
    }))
    pagination.total = data.total
  } catch (error) {
    console.error('加载第三方配置数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.platformName = ''
  searchForm.status = undefined
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = undefined
  resetForm()
  dialogVisible.value = true
}

const handleEdit = async (row: ThirdPartyConfig) => {
  isEdit.value = true
  editId.value = row.id
  formData.platformName = row.platformName
  formData.platformCode = row.platformCode
  formData.apiBaseUrl = row.apiBaseUrl
  formData.appKey = row.appKey
  formData.appSecret = ''
  formData.callbackUrl = row.callbackUrl
  formData.syncStrategy = row.syncStrategy
  formData.remark = row.remark || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (isEdit.value && editId.value) {
      await updateThirdPartyConfig(editId.value, formData)
      ElMessage.success('更新成功')
    } else {
      await createThirdPartyConfig(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  resetForm()
}

const resetForm = () => {
  formData.platformName = ''
  formData.platformCode = ''
  formData.apiBaseUrl = ''
  formData.appKey = ''
  formData.appSecret = ''
  formData.callbackUrl = ''
  formData.syncStrategy = undefined
  formData.remark = ''
}

const handleTest = async (row: ThirdPartyConfig) => {
  try {
    const loadingMsg = ElMessage.info('正在测试连接...', { duration: 0 })
    const result = await testThirdPartyConfig(row.id)
    loadingMsg.close()
    if (result.success) {
      ElMessage.success('连接测试成功')
    } else {
      ElMessage.warning(result.message || '连接测试失败')
    }
  } catch (error) {
    ElMessage.error('连接测试失败')
  }
}

const handleEnable = async (row: ThirdPartyConfig) => {
  try {
    await ElMessageBox.confirm(`确定要启用「${row.platformName}」吗？`, '确认', { type: 'success' })
    await enableThirdPartyConfig(row.id)
    ElMessage.success('启用成功')
    loadData()
  } catch (error) {
    // 用户取消
  }
}

const handleDisable = async (row: ThirdPartyConfig) => {
  try {
    await ElMessageBox.confirm(`确定要禁用「${row.platformName}」吗？`, '确认', { type: 'warning' })
    await disableThirdPartyConfig(row.id)
    ElMessage.success('禁用成功')
    loadData()
  } catch (error) {
    // 用户取消
  }
}

const handleDelete = async (row: ThirdPartyConfig) => {
  try {
    await ElMessageBox.confirm(`确定要删除配置「${row.platformName}」吗？`, '警告', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteThirdPartyConfig(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.thirdparty-config-list {
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
