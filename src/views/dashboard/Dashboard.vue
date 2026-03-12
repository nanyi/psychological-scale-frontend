<template>
  <div class="dashboard">
    <h2 class="page-title">数据驾驶舱</h2>
    <el-row :gutter="24">
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: 'var(--spacing-lg)' }">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--color-primary-500)">
              <el-icon :size="24"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">1,234</div>
              <div class="stat-label">总测评次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: 'var(--spacing-lg)' }">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--color-success)">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">567</div>
              <div class="stat-label">活跃用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: 'var(--spacing-lg)' }">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--color-warning)">
              <el-icon :size="24"><List /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">28</div>
              <div class="stat-label">量表数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" :body-style="{ padding: 'var(--spacing-lg)' }">
          <div class="stat-card">
            <div class="stat-icon" style="background: var(--color-error)">
              <el-icon :size="24"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">12%</div>
              <div class="stat-label">异常率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Document, User, List, Warning } from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-800);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  margin-top: 2px;
}

.el-card {
  border-radius: var(--border-radius-lg);
  border: none;
}
</style>
