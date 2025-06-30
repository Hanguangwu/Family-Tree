import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/mindmap',
    name: 'MindMap',
    component: () => import('../views/MindMap.vue'),
    meta: {
      title: '思维导图'
    }
  },
  {
    path: '/modern-tree',
    name: 'ModernTree',
    component: () => import('../views/ModernTree.vue'),
    meta: {
      title: '现代苏式族谱'
    }
  },
  {
    path: '/data-overview',
    name: 'DataOverview',
    component: () => import('../views/DataOverview.vue'),
    meta: {
      title: '数据概览'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router