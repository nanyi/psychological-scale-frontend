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
          <el-menu-item index="/scale">
            <span>量表管理</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/order">
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/report">
            <span>报告管理</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <span>数据分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-right">
            <span class="username">管理员</span>
            <el-button type="danger" size="small">退出</el-button>
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
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
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
  color: var(--color-gray-400);
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: var(--border-radius-md);
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
