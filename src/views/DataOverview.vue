<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts/core'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  PieChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

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

// 图表实例
const genderChartRef = ref<HTMLElement | null>(null)
const generationChartRef = ref<HTMLElement | null>(null)
const timelineChartRef = ref<HTMLElement | null>(null)
const relationshipChartRef = ref<HTMLElement | null>(null)

// 图表实例对象
let genderChart: echarts.ECharts | null = null
let generationChart: echarts.ECharts | null = null
let timelineChart: echarts.ECharts | null = null
let relationshipChart: echarts.ECharts | null = null

// 统计数据
const statistics = reactive({
  totalMembers: 0,
  maleCount: 0,
  femaleCount: 0,
  generationCount: 0,
  earliestBirth: '',
  latestBirth: '',
  averageLifespan: 0
})

// 计算统计数据
const calculateStatistics = () => {
  const members = familyMembers.value
  
  // 总人数
  statistics.totalMembers = members.length
  
  // 性别统计
  statistics.maleCount = members.filter(m => m.gender === 'male').length
  statistics.femaleCount = members.filter(m => m.gender === 'female').length
  
  // 世代统计
  const generations = new Set<number>()
  members.forEach(m => generations.add(m.generation))
  statistics.generationCount = generations.size
  
  // 出生日期统计
  const birthDates = members
    .filter(m => m.birthDate)
    .map(m => new Date(m.birthDate!))
    .sort((a, b) => a.getTime() - b.getTime())
  
  if (birthDates.length > 0) {
    statistics.earliestBirth = birthDates[0].toISOString().split('T')[0]
    statistics.latestBirth = birthDates[birthDates.length - 1].toISOString().split('T')[0]
  }
  
  // 平均寿命统计
  const lifespans = members
    .filter(m => m.birthDate && m.deathDate)
    .map(m => {
      const birth = new Date(m.birthDate!)
      const death = new Date(m.deathDate!)
      return Math.floor((death.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365))
    })
  
  if (lifespans.length > 0) {
    statistics.averageLifespan = Math.round(lifespans.reduce((sum, age) => sum + age, 0) / lifespans.length)
  }
}

// 初始化性别分布图表
const initGenderChart = () => {
  if (!genderChartRef.value) return
  
  genderChart = echarts.init(genderChartRef.value)
  
  const option = {
    title: {
      text: '性别分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['男性', '女性']
    },
    series: [
      {
        name: '性别分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: statistics.maleCount, name: '男性' },
          { value: statistics.femaleCount, name: '女性' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  genderChart.setOption(option)
}

// 初始化世代分布图表
const initGenerationChart = () => {
  if (!generationChartRef.value) return
  
  generationChart = echarts.init(generationChartRef.value)
  
  // 按世代统计人数
const generationData = familyMembers.value.reduce((acc, member) => {
    const gen = member.generation
    if (!acc[gen]) acc[gen] = 0
    acc[gen]++
    return acc
  }, {} as Record<number, number>)
  
  const generations = Object.keys(generationData).map(Number).sort((a, b) => a - b)
  const counts = generations.map(gen => generationData[gen])
  
  const option = {
    title: {
      text: '世代分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: generations.map(gen => `第${gen}代`),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: function(params: any) {
            const colorList = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272']
            return colorList[params.dataIndex % colorList.length]
          }
        }
      }
    ]
  }
  
  generationChart.setOption(option)
}

// 初始化时间线图表
const initTimelineChart = () => {
  if (!timelineChartRef.value) return
  
  timelineChart = echarts.init(timelineChartRef.value)
  
  // 按年代统计出生人数
  const birthYears = familyMembers.value
    .filter(m => m.birthDate)
    .map(m => parseInt(m.birthDate!.split('-')[0]))
    .sort((a, b) => a - b)
  
  if (birthYears.length === 0) return
  
  const minYear = Math.floor(birthYears[0] / 10) * 10
  const maxYear = Math.ceil(birthYears[birthYears.length - 1] / 10) * 10
  
  const decades: Record<string, number> = {}
  for (let year = minYear; year <= maxYear; year += 10) {
    decades[`${year}s`] = 0
  }
  
  birthYears.forEach(year => {
    const decade = Math.floor(year / 10) * 10
    decades[`${decade}s`]++
  })
  
  const option = {
    title: {
      text: '出生年代分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: Object.keys(decades),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '出生人数',
        type: 'line',
        data: Object.values(decades),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#5470c6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(84, 112, 198, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(84, 112, 198, 0.1)'
              }
            ]
          }
        }
      }
    ]
  }
  
  timelineChart.setOption(option)
}

// 初始化关系分布图表
const initRelationshipChart = () => {
  if (!relationshipChartRef.value) return
  
  relationshipChart = echarts.init(relationshipChartRef.value)
  
  // 统计关系分布
  const relationships = familyMembers.value
    .filter(m => m.relationship)
    .reduce((acc, member) => {
      const rel = member.relationship!
      if (!acc[rel]) acc[rel] = 0
      acc[rel]++
      return acc
    }, {} as Record<string, number>)
  
  const relationshipData = Object.entries(relationships).map(([name, value]) => ({ name, value }))
  
  const option = {
    title: {
      text: '关系分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: Object.keys(relationships)
    },
    series: [
      {
        name: '关系分布',
        type: 'pie',
        radius: ['30%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: relationshipData
      }
    ]
  }
  
  relationshipChart.setOption(option)
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
      calculateStatistics()
      updateCharts()
      ElMessage.success('导入成功')
    } catch (error) {
      ElMessage.error('导入失败，文件格式不正确')
    }
  }
  
  reader.readAsText(file)
  
  // 重置input，允许重复导入同一文件
  target.value = ''
}

// 更新所有图表
const updateCharts = () => {
  initGenderChart()
  initGenerationChart()
  initTimelineChart()
  initRelationshipChart()
}

// 窗口大小变化时重新调整图表大小
const handleResize = () => {
  genderChart?.resize()
  generationChart?.resize()
  timelineChart?.resize()
  relationshipChart?.resize()
}

// 组件挂载时初始化
onMounted(() => {
  calculateStatistics()
  updateCharts()
  
  window.addEventListener('resize', handleResize)
})
</script>

<template>
  <div class="data-overview-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <h2>数据概览</h2>
              <div class="header-actions">
                <el-button>
                  <el-icon><Upload /></el-icon> 导入数据
                  <input 
                    type="file" 
                    accept=".json" 
                    class="file-input" 
                    @change="importTree"
                  />
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="statistics-cards">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <el-icon class="stat-icon"><User /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.totalMembers }}</div>
                      <div class="stat-label">总人数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <el-icon class="stat-icon"><Male /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.maleCount }}</div>
                      <div class="stat-label">男性人数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <el-icon class="stat-icon"><Female /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.femaleCount }}</div>
                      <div class="stat-label">女性人数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <el-icon class="stat-icon"><Menu /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.generationCount }}</div>
                      <div class="stat-label">世代数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <el-icon class="stat-icon"><Calendar /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.earliestBirth || '未知' }}</div>
                      <div class="stat-label">最早出生</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <el-icon class="stat-icon"><Calendar /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.latestBirth || '未知' }}</div>
                      <div class="stat-label">最晚出生</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
                <el-card class="stat-card" shadow="hover">
                  <div class="stat-content">
                    <el-icon class="stat-icon"><Timer /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.averageLifespan || '未知' }}</div>
                      <div class="stat-label">平均寿命</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          
          <div class="charts-container">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <div class="chart-wrapper">
                  <div ref="genderChartRef" class="chart"></div>
                </div>
              </el-col>
              
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <div class="chart-wrapper">
                  <div ref="generationChartRef" class="chart"></div>
                </div>
              </el-col>
              
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <div class="chart-wrapper">
                  <div ref="timelineChartRef" class="chart"></div>
                </div>
              </el-col>
              
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <div class="chart-wrapper">
                  <div ref="relationshipChartRef" class="chart"></div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.data-overview-container {
  max-width: 1200px;
  margin: 0 auto;
}

.overview-card {
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

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.statistics-cards {
  margin-bottom: 30px;
}

.stat-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  font-size: 40px;
  margin-right: 15px;
  color: #409EFF;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-container {
  margin-top: 20px;
}

.chart-wrapper {
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
}

.chart {
  height: 300px;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    margin-top: 10px;
  }
  
  .chart {
    height: 250px;
  }
}
</style>