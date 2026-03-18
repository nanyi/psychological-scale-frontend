<template>
  <div class="system-setting">
    <h2 class="page-title">系统设置</h2>
    <el-card shadow="hover">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="140px">
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统Logo" prop="systemLogo">
              <el-input v-model="basicForm.systemLogo" placeholder="请输入Logo URL">
                <template #append>
                  <el-button @click="handleUploadLogo">上传</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="系统描述" prop="systemDescription">
              <el-input
                v-model="basicForm.systemDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入系统描述"
              />
            </el-form-item>
            <el-form-item label="版权信息" prop="copyright">
              <el-input v-model="basicForm.copyright" placeholder="请输入版权信息" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveBasic">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="安全设置" name="security">
          <el-form ref="securityFormRef" :model="securityForm" :rules="securityRules" label-width="140px">
            <el-form-item label="登录超时时间" prop="loginTimeout">
              <el-input-number v-model="securityForm.loginTimeout" :min="5" :max="1440" />
              <span class="form-tip">分钟 (5-1440)</span>
            </el-form-item>
            <el-form-item label="密码最小长度" prop="passwordMinLength">
              <el-input-number v-model="securityForm.passwordMinLength" :min="6" :max="32" />
              <span class="form-tip">位 (6-32)</span>
            </el-form-item>
            <el-form-item label="密码强度要求">
              <el-checkbox v-model="securityForm.passwordRequireSpecialChar">特殊字符</el-checkbox>
              <el-checkbox v-model="securityForm.passwordRequireNumber">数字</el-checkbox>
              <el-checkbox v-model="securityForm.passwordRequireUppercase">大写字母</el-checkbox>
            </el-form-item>
            <el-form-item label="登录失败锁定" prop="loginFailLock">
              <el-input-number v-model="securityForm.loginFailLock" :min="3" :max="10" />
              <span class="form-tip">次后锁定账户 (3-10)</span>
            </el-form-item>
            <el-form-item label="IP白名单" prop="ipWhitelist">
              <el-input
                v-model="securityForm.ipWhitelist"
                type="textarea"
                :rows="3"
                placeholder="请输入IP地址，多个用逗号分隔"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSecurity">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="通知设置" name="notification">
          <el-form ref="notificationFormRef" :model="notificationForm" label-width="140px">
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationForm.emailEnabled" />
            </el-form-item>
            <el-form-item v-if="notificationForm.emailEnabled" label="邮件模板">
              <el-input
                v-model="notificationForm.emailTemplate"
                type="textarea"
                :rows="4"
                placeholder="请输入邮件通知模板"
              />
            </el-form-item>
            <el-form-item label="短信通知">
              <el-switch v-model="notificationForm.smsEnabled" />
            </el-form-item>
            <el-form-item v-if="notificationForm.smsEnabled" label="短信模板">
              <el-input
                v-model="notificationForm.smsTemplate"
                type="textarea"
                :rows="4"
                placeholder="请输入短信通知模板"
              />
            </el-form-item>
            <el-form-item label="站内信通知">
              <el-switch v-model="notificationForm.siteMessageEnabled" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveNotification">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type {
  SystemBasicSetting,
  SystemSecuritySetting,
  SystemNotificationSetting
} from '@/api/system'

const activeTab = ref('basic')

const basicFormRef = ref<FormInstance>()
const securityFormRef = ref<FormInstance>()
const notificationFormRef = ref<FormInstance>()

const basicForm = reactive<SystemBasicSetting>({
  systemName: '心理测评系统',
  systemLogo: '',
  systemDescription: '',
  copyright: '© 2024 心理测评系统'
})

const securityForm = reactive<SystemSecuritySetting>({
  loginTimeout: 30,
  passwordMinLength: 8,
  passwordRequireSpecialChar: true,
  passwordRequireNumber: true,
  passwordRequireUppercase: false,
  loginFailLock: 5,
  ipWhitelist: ''
})

const notificationForm = reactive<SystemNotificationSetting>({
  emailEnabled: true,
  smsEnabled: false,
  siteMessageEnabled: true,
  emailTemplate: '',
  smsTemplate: ''
})

const basicRules: FormRules = {
  systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }]
}

const securityRules: FormRules = {
  loginTimeout: [{ required: true, message: '请输入登录超时时间', trigger: 'blur' }],
  passwordMinLength: [{ required: true, message: '请输入密码最小长度', trigger: 'blur' }],
  loginFailLock: [{ required: true, message: '请输入登录失败锁定次数', trigger: 'blur' }]
}

const handleSaveBasic = async () => {
  if (!basicFormRef.value) return
  await basicFormRef.value.validate(() => {
    ElMessage.success('基本设置保存成功')
  })
}

const handleSaveSecurity = async () => {
  if (!securityFormRef.value) return
  await securityFormRef.value.validate(() => {
    ElMessage.success('安全设置保存成功')
  })
}

const handleSaveNotification = async () => {
  ElMessage.success('通知设置保存成功')
}

const handleUploadLogo = () => {
  ElMessage.info('上传功能开发中')
}

const loadSettings = () => {
  // 模拟加载数据
  basicForm.systemName = '心理测评系统'
  basicForm.copyright = '© 2024 心理测评系统'
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.system-setting {
  padding: 0;
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-lg);
}

.form-tip {
  margin-left: var(--spacing-sm);
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
}

:deep(.el-tabs__header) {
  margin-bottom: var(--spacing-lg);
}

:deep(.el-form-item) {
  margin-bottom: var(--spacing-lg);
}

:deep(.el-card) {
  border-radius: var(--border-radius-lg);
  border: none;
}
</style>
