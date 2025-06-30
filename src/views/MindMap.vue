<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 思维导图节点类型定义
interface MindMapNode {
  id: string
  name: string
  children?: MindMapNode[]
  description?: string
  birthDate?: string
  deathDate?: string
  gender?: 'male' | 'female'
  isExpanded?: boolean
  relationship?: string
}

// 示例数据
const defaultData: MindMapNode = {
  id: 'root',
  name: '始祖',
  description: '家族始祖，点击节点可查看详细信息',
  birthDate: '1850-01-01',
  gender: 'male',
  isExpanded: true,
  children: [
    {
      id: 'child1',
      name: '长子',
      description: '家族长子，继承家业',
      birthDate: '1880-05-15',
      deathDate: '1960-08-22',
      gender: 'male',
      relationship: '长子',
      isExpanded: true,
      children: [
        {
          id: 'grandchild1',
          name: '长孙',
          description: '家族长孙',
          birthDate: '1910-03-20',
          deathDate: '1985-11-10',
          gender: 'male',
          relationship: '长子',
          isExpanded: false,
          children: []
        },
        {
          id: 'grandchild2',
          name: '次孙',
          description: '家族次孙',
          birthDate: '1912-07-08',
          deathDate: '1990-04-15',
          gender: 'male',
          relationship: '次子',
          isExpanded: false,
          children: []
        }
      ]
    },
    {
      id: 'child2',
      name: '次子',
      description: '家族次子，经商有成',
      birthDate: '1882-11-30',
      deathDate: '1965-02-18',
      gender: 'male',
      relationship: '次子',
      isExpanded: true,
      children: [
        {
          id: 'grandchild3',
          name: '长女',
          description: '家族长女',
          birthDate: '1915-09-12',
          gender: 'female',
          relationship: '长女',
          isExpanded: false,
          children: []
        }
      ]
    },
    {
      id: 'child3',
      name: '长女',
      description: '家族长女，贤淑大方',
      birthDate: '1885-04-22',
      deathDate: '1970-12-05',
      gender: 'female',
      relationship: '长女',
      isExpanded: true,
      children: []
    }
  ]
}

// 当前数据
const mindMapData = ref<MindMapNode>(JSON.parse(JSON.stringify(defaultData)))

// 当前选中的节点
const selectedNode = ref<MindMapNode | null>(null)

// 编辑表单数据
const editForm = reactive({
  name: '',
  description: '',
  birthDate: '',
  deathDate: '',
  gender: '',
  relationship: ''
})

// 编辑对话框可见性
const editDialogVisible = ref(false)

// 添加子节点对话框可见性
const addChildDialogVisible = ref(false)

// 新子节点表单数据
const newChildForm = reactive({
  name: '',
  description: '',
  birthDate: '',
  deathDate: '',
  gender: 'male',
  relationship: ''
})

// Markdown编辑器内容
const markdownContent = ref('')

// Markdown编辑器对话框可见性
const markdownDialogVisible = ref(false)

// 选择节点
const selectNode = (node: MindMapNode) => {
  selectedNode.value = node
  
  // 填充编辑表单
  editForm.name = node.name
  editForm.description = node.description || ''
  editForm.birthDate = node.birthDate || ''
  editForm.deathDate = node.deathDate || ''
  editForm.gender = node.gender || ''
  editForm.relationship = node.relationship || ''
  
  // 填充Markdown编辑器内容
  markdownContent.value = `# ${node.name}\n\n` +
    `**出生日期**: ${node.birthDate || '未知'}\n\n` +
    `**逝世日期**: ${node.deathDate || '未知'}\n\n` +
    `**性别**: ${node.gender === 'male' ? '男' : node.gender === 'female' ? '女' : '未知'}\n\n` +
    `**关系**: ${node.relationship || '未知'}\n\n` +
    `## 描述\n\n${node.description || '暂无描述'}`
}

// 切换节点展开状态
const toggleNodeExpand = (node: MindMapNode) => {
  if (node.children && node.children.length > 0) {
    node.isExpanded = !node.isExpanded
  }
}

// 打开编辑对话框
const openEditDialog = () => {
  if (!selectedNode.value) {
    ElMessage.warning('请先选择一个节点')
    return
  }
  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = () => {
  if (!selectedNode.value) return
  
  selectedNode.value.name = editForm.name
  selectedNode.value.description = editForm.description
  selectedNode.value.birthDate = editForm.birthDate
  selectedNode.value.deathDate = editForm.deathDate
  selectedNode.value.gender = editForm.gender as 'male' | 'female'
  selectedNode.value.relationship = editForm.relationship
  
  editDialogVisible.value = false
  ElMessage.success('保存成功')
}

// 打开添加子节点对话框
const openAddChildDialog = () => {
  if (!selectedNode.value) {
    ElMessage.warning('请先选择一个节点')
    return
  }
  
  // 重置表单
  newChildForm.name = ''
  newChildForm.description = ''
  newChildForm.birthDate = ''
  newChildForm.deathDate = ''
  newChildForm.gender = 'male'
  newChildForm.relationship = ''
  
  addChildDialogVisible.value = true
}

// 添加子节点
const addChild = () => {
  if (!selectedNode.value) return
  
  if (!selectedNode.value.children) {
    selectedNode.value.children = []
  }
  
  const newChild: MindMapNode = {
    id: `node-${Date.now()}`,
    name: newChildForm.name,
    description: newChildForm.description,
    birthDate: newChildForm.birthDate,
    deathDate: newChildForm.deathDate,
    gender: newChildForm.gender as 'male' | 'female',
    relationship: newChildForm.relationship,
    isExpanded: false,
    children: []
  }
  
  selectedNode.value.children.push(newChild)
  selectedNode.value.isExpanded = true
  
  addChildDialogVisible.value = false
  ElMessage.success('添加成功')
}

// 删除节点
const deleteNode = () => {
  if (!selectedNode.value) {
    ElMessage.warning('请先选择一个节点')
    return
  }
  
  if (selectedNode.value.id === 'root') {
    ElMessage.error('不能删除根节点')
    return
  }
  
  ElMessageBox.confirm(
    '确定要删除该节点吗？删除后将无法恢复，且会同时删除其所有子节点。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 递归查找并删除节点
    const removeNode = (parent: MindMapNode, nodeId: string): boolean => {
      if (!parent.children) return false
      
      const index = parent.children.findIndex(child => child.id === nodeId)
      if (index !== -1) {
        parent.children.splice(index, 1)
        return true
      }
      
      for (const child of parent.children) {
        if (removeNode(child, nodeId)) return true
      }
      
      return false
    }
    
    if (selectedNode.value) {
      removeNode(mindMapData.value, selectedNode.value.id)
      selectedNode.value = null
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 打开Markdown编辑器对话框
const openMarkdownDialog = () => {
  if (!selectedNode.value) {
    ElMessage.warning('请先选择一个节点')
    return
  }
  markdownDialogVisible.value = true
}

// 保存Markdown内容
const saveMarkdown = () => {
  if (!selectedNode.value) return
  
  // 解析Markdown内容更新节点信息
  // 这里简化处理，实际应用中可能需要更复杂的解析逻辑
  selectedNode.value.description = markdownContent.value.split('## 描述')[1]?.trim() || ''
  
  markdownDialogVisible.value = false
  ElMessage.success('保存成功')
}

// 重置思维导图
const resetMindMap = () => {
  ElMessageBox.confirm(
    '确定要重置思维导图吗？所有修改将丢失。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    mindMapData.value = JSON.parse(JSON.stringify(defaultData))
    selectedNode.value = null
    ElMessage.success('重置成功')
  }).catch(() => {
    // 取消重置
  })
}

// 导出思维导图数据
const exportMindMap = () => {
  const dataStr = JSON.stringify(mindMapData.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  
  const exportFileDefaultName = 'family-mind-map.json'
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  
  ElMessage.success('导出成功')
}

// 导入思维导图数据
const importMindMap = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  
  const file = target.files[0]
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const result = e.target?.result as string
      const data = JSON.parse(result) as MindMapNode
      
      mindMapData.value = data
      selectedNode.value = null
      ElMessage.success('导入成功')
    } catch (error) {
      ElMessage.error('导入失败，文件格式不正确')
    }
  }
  
  reader.readAsText(file)
  
  // 重置input，允许重复导入同一文件
  target.value = ''
}

// 递归渲染节点
const renderNode = (node: MindMapNode, level: number = 0) => {
  const isSelected = selectedNode.value && selectedNode.value.id === node.id
  const hasChildren = node.children && node.children.length > 0
  
  return {
    template: `
      <div :class="'mind-map-node level-' + level + (isSelected ? ' selected' : '')">
        <div 
          :class="'node-content ' + (node.gender === 'male' ? 'male' : node.gender === 'female' ? 'female' : '')"
          @click="selectNode(node)"
        >
          <div class="node-header">
            <span class="node-name">{{ node.name }}</span>
            <template v-if="hasChildren">
              <el-button 
                class="expand-button" 
                size="small" 
                circle 
                @click.stop="toggleNodeExpand(node)"
              >
                <el-icon>
                  <ArrowDown v-if="node.isExpanded" />
                  <ArrowRight v-else />
                </el-icon>
              </el-button>
            </template>
          </div>
           <template v-if="node.description">
             <el-tooltip 
               class="box-item" 
               effect="dark" 
               :content="node.description" 
               placement="top"
             >
               <div class="node-description">{{ node.description.length > 20 ? node.description.substring(0, 20) + '...' : node.description }}</div>
             </el-tooltip>
           </template>
           <div class="node-dates">
             <span v-if="node.birthDate">{{ node.birthDate }}</span>
             <span v-if="node.birthDate && node.deathDate"> - </span>
             <span v-if="node.deathDate">{{ node.deathDate }}</span>
           </div>
         </div>
         <template v-if="hasChildren && node.isExpanded">
           <div class="node-children">
             <template v-for="child in node.children">
               <component :is="renderNode(child, level + 1)" />
             </template>
           </div>
         </template>
       </div>
    `
  }
}
</script>

<template>
  <div class="mind-map-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card class="mind-map-card">
          <template #header>
            <div class="card-header">
              <h2>家谱思维导图</h2>
              <div class="header-actions">
                <el-button-group>
                  <el-button type="primary" @click="openEditDialog" :disabled="!selectedNode">
                    <el-icon><Edit /></el-icon> 编辑节点
                  </el-button>
                  <el-button type="success" @click="openAddChildDialog" :disabled="!selectedNode">
                    <el-icon><Plus /></el-icon> 添加子节点
                  </el-button>
                  <el-button type="danger" @click="deleteNode" :disabled="!selectedNode || selectedNode.id === 'root'">
                    <el-icon><Delete /></el-icon> 删除节点
                  </el-button>
                  <el-button type="warning" @click="openMarkdownDialog" :disabled="!selectedNode">
                    <el-icon><Document /></el-icon> Markdown编辑
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>
          
          <div class="toolbar">
            <el-button-group>
              <el-button @click="resetMindMap">
                <el-icon><Refresh /></el-icon> 重置
              </el-button>
              <el-button @click="exportMindMap">
                <el-icon><Download /></el-icon> 导出
              </el-button>
              <el-button>
                <el-icon><Upload /></el-icon> 导入
                <input 
                  type="file" 
                  accept=".json" 
                  class="file-input" 
                  @change="importMindMap"
                />
              </el-button>
            </el-button-group>
          </div>
          
          <div class="mind-map-content">
            <div class="mind-map">
              <div class="mind-map-wrapper">
                <div v-if="mindMapData">
                  <component :is="renderNode(mindMapData)" />
                </div>
                <div v-else class="no-data">
                  <el-empty description="暂无数据" />
                </div>
              </div>
            </div>
            
            <div class="node-details" v-if="selectedNode">
              <el-card class="details-card">
                <template #header>
                  <div class="details-header">
                    <h3>{{ selectedNode.name }}</h3>
                    <el-tag :type="selectedNode.gender === 'male' ? 'primary' : 'danger'">
                      {{ selectedNode.gender === 'male' ? '男' : selectedNode.gender === 'female' ? '女' : '未知' }}
                    </el-tag>
                  </div>
                </template>
                <div class="details-content">
                  <p v-if="selectedNode.relationship"><strong>关系：</strong>{{ selectedNode.relationship }}</p>
                  <p v-if="selectedNode.birthDate"><strong>出生日期：</strong>{{ selectedNode.birthDate }}</p>
                  <p v-if="selectedNode.deathDate"><strong>逝世日期：</strong>{{ selectedNode.deathDate }}</p>
                  <el-divider>描述</el-divider>
                  <p class="description">{{ selectedNode.description || '暂无描述' }}</p>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 编辑节点对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑节点"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker 
            v-model="editForm.birthDate" 
            type="date" 
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="逝世日期">
          <el-date-picker 
            v-model="editForm.deathDate" 
            type="date" 
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关系">
          <el-input v-model="editForm.relationship" placeholder="例如：长子、次女等"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 添加子节点对话框 -->
    <el-dialog
      v-model="addChildDialogVisible"
      title="添加子节点"
      width="500px"
    >
      <el-form :model="newChildForm" label-width="100px">
        <el-form-item label="姓名" required>
          <el-input v-model="newChildForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="newChildForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker 
            v-model="newChildForm.birthDate" 
            type="date" 
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="逝世日期">
          <el-date-picker 
            v-model="newChildForm.deathDate" 
            type="date" 
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="newChildForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关系">
          <el-input v-model="newChildForm.relationship" placeholder="例如：长子、次女等"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addChildDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addChild">添加</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- Markdown编辑器对话框 -->
    <el-dialog
      v-model="markdownDialogVisible"
      title="Markdown编辑"
      width="800px"
      :fullscreen="false"
    >
      <md-editor v-model="markdownContent" style="height: 400px" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="markdownDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMarkdown">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.mind-map-container {
  max-width: 1200px;
  margin: 0 auto;
}

.mind-map-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.mind-map-content {
  display: flex;
  gap: 20px;
}

.mind-map {
  flex: 3;
  overflow-x: auto;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  min-height: 500px;
}

.mind-map-wrapper {
  min-width: 600px;
}

.node-details {
  flex: 1;
  min-width: 250px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-header h3 {
  margin: 0;
}

.description {
  white-space: pre-wrap;
}

/* 思维导图节点样式 */
.mind-map-node {
  margin-bottom: 10px;
}

.node-content {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;
}

.node-content:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
}

.node-content.male {
  border-left: 4px solid #409EFF;
}

.node-content.female {
  border-left: 4px solid #F56C6C;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.node-name {
  font-weight: bold;
  font-size: 16px;
}

.node-description {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-dates {
  font-size: 12px;
  color: #909399;
}

.node-children {
  margin-left: 40px;
  padding-left: 20px;
  border-left: 1px dashed #DCDFE6;
}

.selected .node-content {
  outline: 2px solid #409EFF;
}

.expand-button {
  margin-left: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mind-map-content {
    flex-direction: column;
  }
  
  .node-details {
    margin-top: 20px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    margin-top: 10px;
    width: 100%;
  }
  
  .el-button-group {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>