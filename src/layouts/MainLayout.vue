<template>
  <div class="main-layout">
    <el-container>
      <el-aside width="200px">
        <div class="logo">
          <h3>心理测评系统</h3>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="el-menu-vertical"
        >
          <el-menu-item index="/dashboard">
            <span>数据驾驶舱</span>
          </el-menu-item>
          <el-sub-menu index="/scale">
            <template #title>
              <span>量表管理</span>
            </template>
            <el-menu-item index="/scale">量表列表</el-menu-item>
            <el-menu-item index="/scale/category">分类管理</el-menu-item>
            <el-menu-item index="/scale/exam-records">测评记录</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/user">
            <template #title>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/user">用户列表</el-menu-item>
            <el-menu-item index="/user/role">角色权限</el-menu-item>
            <el-menu-item index="/user/permission">权限管理</el-menu-item>
            <el-menu-item index="/user/department">组织架构</el-menu-item>
            <el-menu-item index="/user/group">用户分组</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/order">
            <template #title>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/order">订单列表</el-menu-item>
            <el-menu-item index="/order/enterprise-quota">企业配额</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/report">
            <span>报告管理</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <span>数据分析</span>
          </el-menu-item>
          <el-sub-menu index="/thirdparty">
            <template #title>
              <span>第三方服务</span>
            </template>
            <el-menu-item index="/thirdparty/config">API配置</el-menu-item>
            <el-menu-item index="/thirdparty/sync-logs">同步日志</el-menu-item>
            <el-menu-item index="/thirdparty/monitor">服务监控</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/system/setting">
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                <span class="username">{{ username }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { User } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

const username = computed(() => authStore.userInfo?.nickname || authStore.userInfo?.username || '管理员')

const handleCommand = (command: string) => {
  if (command === 'logout') {
    authStore.logout()
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: var(--color-gray-800);
  width: var(--sidebar-width) !important;
}

.logo {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-900);
  border-bottom: 1px solid var(--color-gray-700);
}

.logo h3 {
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.el-menu {
  border-right: none;
  background-color: var(--color-gray-800);
}

.el-menu-item {
  color: #E5E7EB;
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: var(--border-radius-md);
}

.el-sub-menu__title {
  color: #FFFFFF !important;
  font-weight: 500;
}

.el-sub-menu__title:hover {
  background-color: var(--color-gray-700) !important;
  color: #fff !important;
}

.el-menu-item:hover {
  background-color: var(--color-gray-700) !important;
  color: #fff;
}

.el-menu-item.is-active {
  background-color: var(--color-primary-500) !important;
  color: #fff;
}

.el-header {
  background-color: #fff;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 var(--spacing-lg);
  height: var(--header-height);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--border-radius-md);
  transition: background-color var(--transition-fast);
}

.user-info:hover {
  background-color: var(--color-gray-100);
}

.username {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.el-main {
  background-color: var(--color-gray-100);
  padding: var(--spacing-lg);
  min-height: calc(100vh - var(--header-height));
}
</style>
