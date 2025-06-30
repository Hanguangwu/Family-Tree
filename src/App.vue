<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeIndex = ref('/')

const handleSelect = (key: string) => {
  activeIndex.value = key
  router.push(key)
}
</script>

<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo-container">
            <h1>云码宗谱</h1>
          </div>
          <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            mode="horizontal"
            @select="handleSelect"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/mindmap">思维导图</el-menu-item>
            <el-menu-item index="/modern-tree">现代苏式族谱</el-menu-item>
            <el-menu-item index="/data-overview">数据概览</el-menu-item>
          </el-menu>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
      <el-footer>
        <div class="footer-content">
          <p>© 2025 云码宗谱 - 家谱族谱制作软件</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<style>
.app-container {
  width: 100%;
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-header {
  padding: 0;
  background-color: #545c64;
  color: #fff;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo-container {
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.logo-container h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #ffd04b;
}

.el-menu-demo {
  flex: 1;
}

.el-main {
  padding: 20px;
  overflow-y: auto;
}

.el-footer {
  background-color: #545c64;
  color: #fff;
  text-align: center;
  padding: 20px;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }
  
  .logo-container {
    margin-bottom: 10px;
  }
  
  .el-menu-demo {
    width: 100%;
  }
}
</style>
