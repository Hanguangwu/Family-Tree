<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 族谱成员类型定义
interface FamilyMember {
  id: string
  name: string
  gender: 'male' | 'female'
  birthDate?: string
  deathDate?: string
  description?: string
  generation: number
  parentId?: string
  spouseId?: string
  children?: string[]
  relationship?: string
  isExpanded?: boolean
}

// 示例数据
const defaultMembers: FamilyMember[] = [
  {
    id: '1',
    name: '始祖',
    gender: 'male',
    birthDate: '1850-01-01',
    description: '家族始祖，点击可查看详细信息',
    generation: 1,
    children: ['2', '3', '4'],
    isExpanded: true
  },
  {
    id: '2',
    name: '长子',
    gender: 'male',
    birthDate: '1880-05-15',
    deathDate: '1960-08-22',
    description: '家族长子，继承家业',
    generation: 2,
    parentId: '1',
    children: ['5', '6'],
    relationship: '长子',
    isExpanded: true
  },
  {
    id: '3',
    name: '次子',
    gender: 'male',
    birthDate: '1882-11-30',
    deathDate: '1965-02-18',
    description: '家族次子，经商有成',
    generation: 2,
    parentId: '1',
    children: ['7'],
    relationship: '次子',
    isExpanded: true
  },
  {
    id: '4',
    name: '长女',
    gender: 'female',
    birthDate: '1885-04-22',
    deathDate: '1970-12-05',
    description: '家族长女，贤淑大方',
    generation: 2,
    parentId: '1',
    relationship: '长女',
    isExpanded: true
  },
  {
    id: '5',
    name: '长孙',
    gender: 'male',
    birthDate: '1910-03-20',
    deathDate: '1985-11-10',
    description: '家族长孙',
    generation: 3,
    parentId: '2',
    relationship: '长子',
    isExpanded: false
  },
  {
    id: '6',
    name: '次孙',
    gender: 'male',
    birthDate: '1912-07-08',
    deathDate: '1990-04-15',
    description: '家族次孙',
    generation: 3,
    parentId: '2',
    relationship: '次子',
    isExpanded: false
  },
  {
    id: '7',
    name: '长女',
    gender: 'female',
    birthDate: '1915-09-12',
    description: '家族长女',
    generation: 3,
    parentId: '3',
    relationship: '长女',
    isExpanded: false
  }
]

// 当前数据
const familyMembers = ref<FamilyMember[]>(JSON.parse(JSON.stringify(defaultMembers)))

// 当前选中的成员
const selectedMember = ref<FamilyMember | null>(null)

// 编辑表单数据
const editForm = reactive({
  name: '',
  gender: 'male',
  birthDate: '',
  deathDate: '',
  description: '',
  relationship: ''
})

// 编辑对话框可见性
const editDialogVisible = ref(false)

// 添加成员对话框可见性
const addMemberDialogVisible = ref(false)

// 新成员表单数据
const newMemberForm = reactive({
  name: '',
  gender: 'male',
  birthDate: '',
  deathDate: '',
  description: '',
  relationship: '',
  parentId: ''
})

// Markdown编辑器内容
const markdownContent = ref('')

// Markdown编辑器对话框可见性
const markdownDialogVisible = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 筛选条件
const filterOptions = reactive({
  generation: '',
  gender: ''
})

// 获取所有世代选项
const generationOptions = computed(() => {
  const generations = new Set<number>()
  familyMembers.value.forEach(member => {
    generations.add(member.generation)
  })
  return Array.from(generations).sort((a, b) => a - b)
})

// 筛选后的成员列表
const filteredMembers = computed(() => {
  return familyMembers.value.filter(member => {
    // 搜索关键词筛选
    const matchesKeyword = searchKeyword.value === '' || 
      member.name.includes(searchKeyword.value) || 
      (member.description && member.description.includes(searchKeyword.value))
    
    // 世代筛选
    const matchesGeneration = filterOptions.generation === '' || 
      member.generation === parseInt(filterOptions.generation)
    
    // 性别筛选
    const matchesGender = filterOptions.gender === '' || 
      member.gender === filterOptions.gender
    
    return matchesKeyword && matchesGeneration && matchesGender
  })
})

// 按世代分组的成员
const membersByGeneration = computed(() => {
  const result: Record<number, FamilyMember[]> = {}
  
  filteredMembers.value.forEach(member => {
    if (!result[member.generation]) {
      result[member.generation] = []
    }
    result[member.generation].push(member)
  })
  
  // 按世代排序
  return Object.keys(result)
    .map(Number)
    .sort((a, b) => a - b)
    .reduce((acc, generation) => {
      acc[generation] = result[generation].sort((a, b) => {
        // 同一世代内按名字排序
        return a.name.localeCompare(b.name)
      })
      return acc
    }, {} as Record<number, FamilyMember[]>)
})

// 获取成员的父亲
const getParent = (memberId: string) => {
  return familyMembers.value.find(m => m.id === memberId)
}

// 获取成员的子女
const getChildren = (memberId: string) => {
  return familyMembers.value.filter(m => m.parentId === memberId)
}

// 选择成员
const selectMember = (member: FamilyMember) => {
  selectedMember.value = member
  
  // 填充编辑表单
  editForm.name = member.name
  editForm.gender = member.gender
  editForm.birthDate = member.birthDate || ''
  editForm.deathDate = member.deathDate || ''
  editForm.description = member.description || ''
  editForm.relationship = member.relationship || ''
  
  // 填充Markdown编辑器内容
  markdownContent.value = `# ${member.name}\n\n` +
    `**世代**: 第${member.generation}代\n\n` +
    `**出生日期**: ${member.birthDate || '未知'}\n\n` +
    `**逝世日期**: ${member.deathDate || '未知'}\n\n` +
    `**性别**: ${member.gender === 'male' ? '男' : '女'}\n\n` +
    `**关系**: ${member.relationship || '未知'}\n\n` +
    `## 描述\n\n${member.description || '暂无描述'}`
}

// 切换成员展开状态
const toggleMemberExpand = (member: FamilyMember) => {
  const children = getChildren(member.id)
  if (children.length > 0) {
    member.isExpanded = !member.isExpanded
  }
}

// 打开编辑对话框
const openEditDialog = () => {
  if (!selectedMember.value) {
    ElMessage.warning('请先选择一个成员')
    return
  }
  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = () => {
  if (!selectedMember.value) return
  
  selectedMember.value.name = editForm.name
  selectedMember.value.gender = editForm.gender as 'male' | 'female'
  selectedMember.value.birthDate = editForm.birthDate
  selectedMember.value.deathDate = editForm.deathDate
  selectedMember.value.description = editForm.description
  selectedMember.value.relationship = editForm.relationship
  
  editDialogVisible.value = false
  ElMessage.success('保存成功')
}

// 打开添加成员对话框
const openAddMemberDialog = () => {
  // 重置表单
  newMemberForm.name = ''
  newMemberForm.gender = 'male'
  newMemberForm.birthDate = ''
  newMemberForm.deathDate = ''
  newMemberForm.description = ''
  newMemberForm.relationship = ''
  newMemberForm.parentId = selectedMember.value?.id || ''
  
  addMemberDialogVisible.value = true
}

// 添加成员
const addMember = () => {
  if (!newMemberForm.name) {
    ElMessage.warning('请输入姓名')
    return
  }
  
  if (!newMemberForm.parentId) {
    ElMessage.warning('请选择父亲')
    return
  }
  
  const parent = familyMembers.value.find(m => m.id === newMemberForm.parentId)
  if (!parent) {
    ElMessage.warning('父亲不存在')
    return
  }
  
  const newId = `${Date.now()}`
  const newMember: FamilyMember = {
    id: newId,
    name: newMemberForm.name,
    gender: newMemberForm.gender as 'male' | 'female',
    birthDate: newMemberForm.birthDate,
    deathDate: newMemberForm.deathDate,
    description: newMemberForm.description,
    generation: parent.generation + 1,
    parentId: newMemberForm.parentId,
    relationship: newMemberForm.relationship,
    isExpanded: false
  }
  
  // 更新父亲的子女列表
  if (!parent.children) {
    parent.children = []
  }
  parent.children.push(newId)
  parent.isExpanded = true
  
  // 添加新成员
  familyMembers.value.push(newMember)
  
  addMemberDialogVisible.value = false
  ElMessage.success('添加成功')
}

// 删除成员
const deleteMember = () => {
  if (!selectedMember.value) {
    ElMessage.warning('请先选择一个成员')
    return
  }
  
  if (selectedMember.value.id === '1') {
    ElMessage.error('不能删除始祖')
    return
  }
  
  ElMessageBox.confirm(
    '确定要删除该成员吗？删除后将无法恢复，且会同时删除其所有子女。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const memberToDelete = selectedMember.value
    if (!memberToDelete) return
    
    // 递归获取所有子孙的ID
    const getAllDescendantIds = (memberId: string): string[] => {
      const children = familyMembers.value.filter(m => m.parentId === memberId)
      let ids: string[] = []
      
      children.forEach(child => {
        ids.push(child.id)
        ids = ids.concat(getAllDescendantIds(child.id))
      })
      
      return ids
    }
    
    const descendantIds = getAllDescendantIds(memberToDelete.id)
    const idsToDelete = [memberToDelete.id, ...descendantIds]
    
    // 从父亲的子女列表中移除
    if (memberToDelete.parentId) {
      const parent = familyMembers.value.find(m => m.id === memberToDelete.parentId)
      if (parent && parent.children) {
        parent.children = parent.children.filter(id => id !== memberToDelete.id)
      }
    }
    
    // 删除成员及其所有子孙
    familyMembers.value = familyMembers.value.filter(m => !idsToDelete.includes(m.id))
    
    selectedMember.value = null
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 打开Markdown编辑器对话框
const openMarkdownDialog = () => {
  if (!selectedMember.value) {
    ElMessage.warning('请先选择一个成员')
    return
  }
  markdownDialogVisible.value = true
}

// 保存Markdown内容
const saveMarkdown = () => {
  if (!selectedMember.value) return
  
  // 解析Markdown内容更新成员信息
  // 这里简化处理，实际应用中可能需要更复杂的解析逻辑
  selectedMember.value.description = markdownContent.value.split('## 描述')[1]?.trim() || ''
  
  markdownDialogVisible.value = false
  ElMessage.success('保存成功')
}

// 重置族谱
const resetTree = () => {
  ElMessageBox.confirm(
    '确定要重置族谱吗？所有修改将丢失。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    familyMembers.value = JSON.parse(JSON.stringify(defaultMembers))
    selectedMember.value = null
    ElMessage.success('重置成功')
  }).catch(() => {
    // 取消重置
  })
}

// 导出族谱数据
const exportTree = () => {
  const dataStr = JSON.stringify(familyMembers.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  
  const exportFileDefaultName = 'family-tree.json'
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  
  ElMessage.success('导出成功')
}

// 导入族谱数据
const importTree = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  
  const file = target.files[0]
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const result = e.target?.result as string
      const data = JSON.parse(result) as FamilyMember[]
      
      familyMembers.value = data
      selectedMember.value = null
      ElMessage.success('导入成功')
    } catch (error) {
      ElMessage.error('导入失败，文件格式不正确')
    }
  }
  
  reader.readAsText(file)
  
  // 重置input，允许重复导入同一文件
  target.value = ''
}
</script>

<template>
  <div class="modern-tree-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card class="modern-tree-card">
          <template #header>
            <div class="card-header">
              <h2>现代苏式族谱</h2>
              <div class="header-actions">
                <el-button-group>
                  <el-button type="primary" @click="openEditDialog" :disabled="!selectedMember">
                    <el-icon><Edit /></el-icon> 编辑成员
                  </el-button>
                  <el-button type="success" @click="openAddMemberDialog">
                    <el-icon><Plus /></el-icon> 添加成员
                  </el-button>
                  <el-button type="danger" @click="deleteMember" :disabled="!selectedMember || selectedMember.id === '1'">
                    <el-icon><Delete /></el-icon> 删除成员
                  </el-button>
                  <el-button type="warning" @click="openMarkdownDialog" :disabled="!selectedMember">
                    <el-icon><Document /></el-icon> Markdown编辑
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>
          
          <div class="toolbar">
            <div class="search-filter">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索成员"
                clearable
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              
              <el-select
                v-model="filterOptions.generation"
                placeholder="选择世代"
                clearable
                class="filter-select"
              >
                <el-option
                  v-for="gen in generationOptions"
                  :key="gen"
                  :label="`第${gen}代`"
                  :value="gen.toString()"
                ></el-option>
              </el-select>
              
              <el-select
                v-model="filterOptions.gender"
                placeholder="选择性别"
                clearable
                class="filter-select"
              >
                <el-option label="男" value="male"></el-option>
                <el-option label="女" value="female"></el-option>
              </el-select>
            </div>
            
            <el-button-group>
              <el-button @click="resetTree">
                <el-icon><Refresh /></el-icon> 重置
              </el-button>
              <el-button @click="exportTree">
                <el-icon><Download /></el-icon> 导出
              </el-button>
              <el-button>
                <el-icon><Upload /></el-icon> 导入
                <input 
                  type="file" 
                  accept=".json" 
                  class="file-input" 
                  @change="importTree"
                />
              </el-button>
            </el-button-group>
          </div>
          
          <div class="tree-content">
            <div class="tree-view">
              <template v-if="Object.keys(membersByGeneration).length > 0">
                <div 
                  v-for="(members, generation) in membersByGeneration" 
                  :key="generation"
                  class="generation-group"
                >
                  <div class="generation-header">
                    <h3>第{{ generation }}代</h3>
                  </div>
                  <div class="generation-members">
                    <div 
                      v-for="member in members" 
                      :key="member.id"
                      :class="['member-card', 
                        member.gender === 'male' ? 'male' : 'female',
                        selectedMember && selectedMember.id === member.id ? 'selected' : ''
                      ]"
                      @click="selectMember(member)"
                    >
                      <div class="member-header">
                        <span class="member-name">{{ member.name }}</span>
                        <el-tag size="small" :type="member.gender === 'male' ? 'primary' : 'danger'">
                          {{ member.gender === 'male' ? '男' : '女' }}
                        </el-tag>
                      </div>
                      
                      <div class="member-info">
                        <div v-if="member.relationship" class="member-relationship">
                          {{ member.relationship }}
                        </div>
                        
                        <div class="member-dates">
                          <span v-if="member.birthDate">{{ member.birthDate }}</span>
                          <span v-if="member.birthDate && member.deathDate"> - </span>
                          <span v-if="member.deathDate">{{ member.deathDate }}</span>
                        </div>
                        
                        <el-tooltip 
                          v-if="member.description" 
                          class="box-item" 
                          effect="dark" 
                          :content="member.description" 
                          placement="top"
                        >
                          <div class="member-description">
                            {{ member.description.length > 30 ? member.description.substring(0, 30) + '...' : member.description }}
                          </div>
                        </el-tooltip>
                      </div>
                      
                      <div class="member-actions">
                        <el-button 
                          v-if="getChildren(member.id).length > 0"
                          size="small" 
                          circle 
                          @click.stop="toggleMemberExpand(member)"
                        >
                          <el-icon>
                            <ArrowDown v-if="member.isExpanded" />
                            <ArrowRight v-else />
                          </el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <el-empty v-else description="暂无数据" />
            </div>
            
            <div class="member-details" v-if="selectedMember">
              <el-card class="details-card">
                <template #header>
                  <div class="details-header">
                    <h3>{{ selectedMember.name }}</h3>
                    <el-tag :type="selectedMember.gender === 'male' ? 'primary' : 'danger'">
                      {{ selectedMember.gender === 'male' ? '男' : '女' }}
                    </el-tag>
                  </div>
                </template>
                <div class="details-content">
                  <p><strong>世代：</strong>第{{ selectedMember.generation }}代</p>
                  <p v-if="selectedMember.relationship"><strong>关系：</strong>{{ selectedMember.relationship }}</p>
                  <p v-if="selectedMember.birthDate"><strong>出生日期：</strong>{{ selectedMember.birthDate }}</p>
                  <p v-if="selectedMember.deathDate"><strong>逝世日期：</strong>{{ selectedMember.deathDate }}</p>
                  
                  <el-divider>家族关系</el-divider>
                  
                  <div v-if="selectedMember.parentId" class="relation-item">
                    <strong>父亲：</strong>
                    <el-tag 
                      class="clickable-tag"
                      @click="selectMember(getParent(selectedMember.parentId)!)"
                    >
                      {{ getParent(selectedMember.parentId)?.name }}
                    </el-tag>
                  </div>
                  
                  <div v-if="getChildren(selectedMember.id).length > 0" class="relation-item">
                    <strong>子女：</strong>
                    <div class="children-tags">
                      <el-tag 
                        v-for="child in getChildren(selectedMember.id)" 
                        :key="child.id"
                        class="clickable-tag"
                        :type="child.gender === 'male' ? 'primary' : 'danger'"
                        @click="selectMember(child)"
                      >
                        {{ child.name }}
                      </el-tag>
                    </div>
                  </div>
                  
                  <el-divider>描述</el-divider>
                  <p class="description">{{ selectedMember.description || '暂无描述' }}</p>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 编辑成员对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑成员"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
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
        <el-form-item label="关系">
          <el-input v-model="editForm.relationship" placeholder="例如：长子、次女等"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 添加成员对话框 -->
    <el-dialog
      v-model="addMemberDialogVisible"
      title="添加成员"
      width="500px"
    >
      <el-form :model="newMemberForm" label-width="100px">
        <el-form-item label="姓名" required>
          <el-input v-model="newMemberForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="父亲" required>
          <el-select v-model="newMemberForm.parentId" placeholder="选择父亲">
            <el-option 
              v-for="member in familyMembers" 
              :key="member.id"
              :label="member.name"
              :value="member.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="newMemberForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker 
            v-model="newMemberForm.birthDate" 
            type="date" 
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="逝世日期">
          <el-date-picker 
            v-model="newMemberForm.deathDate" 
            type="date" 
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="关系">
          <el-input v-model="newMemberForm.relationship" placeholder="例如：长子、次女等"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="newMemberForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addMemberDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addMember">添加</el-button>
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
.modern-tree-container {
  max-width: 1200px;
  margin: 0 auto;
}

.modern-tree-card {
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
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.search-filter {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 200px;
}

.filter-select {
  width: 150px;
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

.tree-content {
  display: flex;
  gap: 20px;
}

.tree-view {
  flex: 3;
  overflow-y: auto;
  max-height: 600px;
}

.member-details {
  flex: 1;
  min-width: 250px;
}

.generation-group {
  margin-bottom: 30px;
}

.generation-header {
  margin-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 10px;
}

.generation-header h3 {
  margin: 0;
  color: #303133;
}

.generation-members {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.member-card {
  width: 250px;
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.member-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
}

.member-card.male {
  border-left: 4px solid #409EFF;
}

.member-card.female {
  border-left: 4px solid #F56C6C;
}

.member-card.selected {
  outline: 2px solid #409EFF;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.member-name {
  font-weight: bold;
  font-size: 16px;
}

.member-info {
  margin-bottom: 10px;
}

.member-relationship {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.member-dates {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.member-description {
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-actions {
  display: flex;
  justify-content: flex-end;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-header h3 {
  margin: 0;
}

.relation-item {
  margin-bottom: 10px;
}

.children-tags {
  margin-top: 5px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.clickable-tag {
  cursor: pointer;
}

.description {
  white-space: pre-wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tree-content {
    flex-direction: column;
  }
  
  .member-details {
    margin-top: 20px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter {
    margin-bottom: 10px;
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
  
  .member-card {
    width: 100%;
  }
}
</style>