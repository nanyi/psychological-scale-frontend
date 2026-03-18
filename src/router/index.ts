import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue')
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '数据驾驶舱' }
      },
      {
        path: 'scale',
        name: 'Scale',
        component: () => import('@/views/scale/ScaleList.vue'),
        meta: { title: '量表管理' }
      },
      {
        path: 'scale/category',
        name: 'ScaleCategory',
        component: () => import('@/views/scale/ScaleCategoryList.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'scale/:id',
        name: 'ScaleDetail',
        component: () => import('@/views/scale/ScaleDetail.vue'),
        meta: { title: '量表详情' }
      },
      {
        path: 'scale/questions/:id',
        name: 'ScaleQuestions',
        component: () => import('@/views/scale/ScaleQuestionList.vue'),
        meta: { title: '题目管理' }
      },
      {
        path: 'scale/exam',
        name: 'ExamList',
        component: () => import('@/views/scale/ExamList.vue'),
        meta: { title: '测评记录' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/UserList.vue'),
        meta: { title: '用户列表' }
      },
      {
        path: 'user/role',
        name: 'Role',
        component: () => import('@/views/user/RoleList.vue'),
        meta: { title: '角色权限' }
      },
      {
        path: 'user/department',
        name: 'Department',
        component: () => import('@/views/user/DepartmentList.vue'),
        meta: { title: '组织架构' }
      },
      {
        path: 'user/group',
        name: 'UserGroup',
        component: () => import('@/views/user/UserGroupList.vue'),
        meta: { title: '用户分组' }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/order/OrderList.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'order/enterprise-quota',
        name: 'EnterpriseQuota',
        component: () => import('@/views/order/EnterpriseQuotaList.vue'),
        meta: { title: '企业配额' }
      },
      {
        path: 'order/detail/:id',
        name: 'OrderDetail',
        component: () => import('@/views/order/OrderDetail.vue'),
        meta: { title: '订单详情' }
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('@/views/report/ReportList.vue'),
        meta: { title: '报告管理' }
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('@/views/analysis/Analysis.vue'),
        meta: { title: '数据分析' }
      },
      {
        path: 'thirdparty/config',
        name: 'ThirdPartyConfig',
        component: () => import('@/views/thirdparty/ThirdPartyConfigList.vue'),
        meta: { title: '第三方配置' }
      },
      {
        path: 'thirdparty/sync-logs',
        name: 'SyncLogList',
        component: () => import('@/views/thirdparty/SyncLogList.vue'),
        meta: { title: '同步日志' }
      },
      {
        path: 'thirdparty/monitor',
        name: 'ServiceMonitor',
        component: () => import('@/views/thirdparty/ServiceMonitor.vue'),
        meta: { title: '服务监控' }
      },
      {
        path: 'system/setting',
        name: 'SystemSetting',
        component: () => import('@/views/system/SystemSetting.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard'
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.initFromStorage()

  console.log('authStore.isLoggedIn:', authStore.isLoggedIn)
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/dashboard')
  } else if (to.path === '/') {
    next('/dashboard')
  } else if (to.path === '/' && authStore.isLoggedIn) {
    next('/dashboard')
  } else if (to.path === '/' && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.matched.length === 0) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
