<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <h2>欢迎使用云码宗谱</h2>
            </div>
          </template>
          <div class="card-content">
            <p>云码宗谱为纸质版、电子家谱、手机家谱、云谱、微信谱等提供跨平台数据。</p>
            <el-divider content-position="center">主要功能</el-divider>
            <el-row :gutter="20" class="feature-list">
              <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8" v-for="(feature, index) in features" :key="index">
                <el-card class="feature-card" shadow="hover">
                  <el-icon class="feature-icon">
                    <component :is="feature.icon"></component>
                  </el-icon>
                  <h3>{{ feature.title }}</h3>
                  <p>{{ feature.description }}</p>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="quick-start-card">
          <template #header>
            <div class="card-header">
              <h2>快速开始</h2>
            </div>
          </template>
          <div class="card-content">
            <el-steps :active="1" direction="vertical">
              <el-step title="创建家谱" description="开始创建您的家族谱系">
                <template #icon>
                  <el-icon><Plus /></el-icon>
                </template>
              </el-step>
              <el-step title="添加成员" description="添加家族成员信息">
                <template #icon>
                  <el-icon><User /></el-icon>
                </template>
              </el-step>
              <el-step title="构建关系" description="建立家族成员之间的关系">
                <template #icon>
                  <el-icon><Connection /></el-icon>
                </template>
              </el-step>
              <el-step title="导出家谱" description="导出为多种格式">
                <template #icon>
                  <el-icon><Download /></el-icon>
                </template>
              </el-step>
            </el-steps>
            <div class="action-buttons">
              <el-button type="primary" @click="navigateTo('/mindmap')">
                <el-icon><Pointer /></el-icon> 开始使用思维导图
              </el-button>
              <el-button type="success" @click="navigateTo('/modern-tree')">
                <el-icon><Share /></el-icon> 查看现代苏式族谱
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <h2>家谱预览</h2>
            </div>
          </template>
          <div class="card-content preview-images">
            <el-carousel :interval="4000" type="card" height="300px">
              <el-carousel-item v-for="(image, index) in previewImages" :key="index">
                <div class="preview-image-container">
                  <h3 class="preview-title">{{ image.title }}</h3>
                  <div class="image-placeholder">
                    <el-icon class="placeholder-icon"><Picture /></el-icon>
                    <span>{{ image.description }}</span>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      features: [
        {
          icon: 'DataLine',
          title: '数据安全',
          description: '家谱数据在本地电脑安全可靠，无录入人数限制。'
        },
        {
          icon: 'Edit',
          title: '快捷录入',
          description: '快捷录入与表格录入并存，满足专业与非专业用户需求。'
        },
        {
          icon: 'Share',
          title: '云协编',
          description: '不受时间、区域限制，可以实现云协编，云核对。'
        },
        {
          icon: 'Document',
          title: '多种格式',
          description: '各种家谱格式一键生成，官方预设百种家谱版式任选。'
        },
        {
          icon: 'Files',
          title: '多种文件',
          description: '可生成三种不同格式文件：版式文件、电子档文件。'
        },
        {
          icon: 'Search',
          title: '智能查错',
          description: '多种智能查错功能，确保家谱数据的准确性。'
        }
      ],
      previewImages: [
        {
          title: '家谱世系纲目',
          description: '家谱世系纲目紧接展示'
        },
        {
          title: '家谱速查表',
          description: '前指纲，后指目'
        },
        {
          title: '现代苏式家谱',
          description: '家谱世系目'
        },
        {
          title: '云码宗谱技术续谱拓朴图',
          description: '技术续谱拓朴图展示'
        },
        {
          title: '家谱人员录入界面',
          description: '人员信息录入界面'
        }
      ]
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card,
.quick-start-card,
.preview-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  padding: 10px 0;
}

.feature-list {
  margin-top: 20px;
}

.feature-card {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 10px;
  color: #409EFF;
}

.mt-20 {
  margin-top: 20px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.preview-images {
  padding: 10px 0;
}

.preview-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.preview-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.image-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #e4e7ed;
  border-radius: 4px;
}

.placeholder-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    margin-bottom: 10px;
  }
}
</style>