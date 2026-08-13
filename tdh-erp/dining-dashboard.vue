<template>
  <div class="dashboard-container">
    <!-- 左侧导航菜单 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>餐饮管理中心</h3>
      </div>
      <ul class="sidebar-menu">
        <li 
          v-for="menu in menuList" 
          :key="menu.id"
          :class="{ active: currentMenu === menu.id }"
          @click="currentMenu = menu.id"
        >
          <span class="menu-icon">{{ menu.icon }}</span>
          <span class="menu-text">{{ menu.name }}</span>
        </li>
      </ul>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <div class="top-nav-left">
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="top-nav-right">
          <div class="date-info">
            <span>数据更新: 2024-03-18 10:10</span>
          </div>
          <div class="user-info">
            <span class="user-name">管理员</span>
            <span class="user-avatar">👤</span>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 核心经营指标页面 -->
        <div v-if="currentMenu === 'core'" class="core-metrics-page">
          <!-- 顶部统计卡片 -->
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-value">78.5%</div>
              <div class="stat-label">今日就餐率</div>
              <div class="stat-change">较昨日 +0.5%</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">1,256</div>
              <div class="stat-label">今日就餐人数</div>
              <div class="stat-change">较昨日 +39 人</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">11:30-12:10</div>
              <div class="stat-label">就餐高峰时段</div>
              <div class="stat-change">就餐 428 人</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">74.2%</div>
              <div class="stat-label">比上周同时段</div>
              <div class="stat-change">上升 1.2%</div>
            </div>
          </div>

          <!-- 近7天就餐率趋势分析图表 -->
          <div class="chart-section">
            <h3>近7天就餐率趋势分析</h3>
            <div class="chart-container">
              <div ref="trendChart" class="chart"></div>
            </div>
          </div>

          <!-- 今日各时段就餐详情表格 -->
          <div class="table-section">
            <h3>今日各时段就餐详情</h3>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>时间段</th>
                    <th>就餐人数</th>
                    <th>就餐率</th>
                    <th>平均满意度</th>
                    <th>平均时长</th>
                    <th>同比增长</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in timeSlotData" :key="item.id">
                    <td>{{ item.timeSlot }}</td>
                    <td>{{ item.people }}</td>
                    <td>{{ item.rate }}</td>
                    <td>{{ item.satisfaction }}</td>
                    <td>{{ item.duration }}</td>
                    <td>{{ item.growth }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 实时监控页面 -->
        <div v-else-if="currentMenu === 'monitor'" class="monitor-page">
          <h3>实时监控</h3>
          <div class="temp-data">
            <p>实时监控页面 - 临时数据</p>
            <div ref="monitorChart" class="chart temp-chart"></div>
          </div>
        </div>

        <!-- 数据管理页面 -->
        <div v-else-if="currentMenu === 'data'" class="data-page">
          <h3>数据管理</h3>
          <div class="temp-data">
            <p>数据管理页面 - 临时数据</p>
            <div ref="dataChart" class="chart temp-chart"></div>
          </div>
        </div>

        <!-- 报表分析页面 -->
        <div v-else-if="currentMenu === 'report'" class="report-page">
          <h3>报表分析</h3>
          <div class="temp-data">
            <p>报表分析页面 - 临时数据</p>
            <div ref="reportChart" class="chart temp-chart"></div>
          </div>
        </div>

        <!-- 系统管理页面 -->
        <div v-else-if="currentMenu === 'system'" class="system-page">
          <h3>系统管理</h3>
          
          <!-- 系统信息 -->
          <div class="system-section">
            <h4>系统信息</h4>
            <div class="system-info">
              <div class="info-item" v-for="item in systemData" :key="item.id">
                <span class="info-label">{{ item.name }}:</span>
                <span class="info-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
          
          <!-- 用户管理 -->
          <div class="system-section">
            <h4>用户管理</h4>
            <div class="user-table">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>用户ID</th>
                    <th>用户名</th>
                    <th>角色</th>
                    <th>状态</th>
                    <th>最后登录</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in userData" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.role }}</td>
                    <td>{{ user.status }}</td>
                    <td>{{ user.lastLogin }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 系统设置 -->
          <div class="system-section">
            <h4>系统设置</h4>
            <div class="settings-list">
              <div class="setting-item" v-for="setting in settingsData" :key="setting.id">
                <span class="setting-name">{{ setting.name }}</span>
                <span class="setting-value">{{ setting.value }}</span>
                <button class="btn btn-sm">修改</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiningDashboard',
  data() {
    return {
      currentMenu: 'core',
      menuList: [
        { id: 'core', name: '核心经营指标', icon: '📊' },
        { id: 'monitor', name: '实时监控', icon: '👁️' },
        { id: 'data', name: '数据管理', icon: '💾' },
        { id: 'report', name: '报表分析', icon: '📈' },
        { id: 'system', name: '系统管理', icon: '⚙️' }
      ],
      timeSlotData: [
        { id: 1, timeSlot: '早餐 (7:00-8:30)', people: '328人', rate: '66.5%', satisfaction: '4.5', duration: '25分钟', growth: '1.2%' },
        { id: 2, timeSlot: '午餐 (11:00-13:00)', people: '675人', rate: '80.5%', satisfaction: '4.8', duration: '30分钟', growth: '1.5%' },
        { id: 3, timeSlot: '晚餐 (17:30-21:00)', people: '253人', rate: '61.8%', satisfaction: '4.6', duration: '28分钟', growth: '0.8%' }
      ],
      systemData: [
        { id: 1, name: '系统版本', value: 'v2.0.1' },
        { id: 2, name: '数据备份', value: '每日' },
        { id: 3, name: '用户数量', value: '25' },
        { id: 4, name: '服务器状态', value: '运行中' },
        { id: 5, name: '数据库状态', value: '正常' },
        { id: 6, name: '最后更新', value: '2024-03-18 08:00' }
      ],
      userData: [
        { id: 1, username: 'admin', role: '超级管理员', status: '在线', lastLogin: '2024-03-18 09:30' },
        { id: 2, username: 'manager', role: '管理员', status: '在线', lastLogin: '2024-03-18 08:45' },
        { id: 3, username: 'staff1', role: '普通用户', status: '离线', lastLogin: '2024-03-17 17:20' },
        { id: 4, username: 'staff2', role: '普通用户', status: '离线', lastLogin: '2024-03-17 16:45' },
        { id: 5, username: 'staff3', role: '普通用户', status: '离线', lastLogin: '2024-03-17 15:30' }
      ],
      settingsData: [
        { id: 1, name: '系统语言', value: '简体中文' },
        { id: 2, name: '时区设置', value: '中国标准时间' },
        { id: 3, name: '数据保留期限', value: '365天' },
        { id: 4, name: '自动备份', value: '开启' },
        { id: 5, name: '通知提醒', value: '开启' },
        { id: 6, name: '日志记录', value: '开启' }
      ],
      trendChart: null,
      monitorChart: null,
      dataChart: null,
      reportChart: null
    }
  },
  computed: {
    pageTitle() {
      const menu = this.menuList.find(m => m.id === this.currentMenu);
      return menu ? menu.name : '核心经营指标';
    }
  },
  mounted() {
    this.initCharts();
    window.addEventListener('resize', this.resizeCharts);
  },
  watch: {
    currentMenu() {
      // 当菜单切换时，延迟一点时间重新初始化图表，确保DOM已经渲染
      setTimeout(() => {
        this.initCharts();
      }, 100);
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts);
    this.destroyCharts();
  },
  methods: {
    initCharts() {
      // 先销毁现有图表实例
      this.destroyCharts();
      
      // 重新初始化所有图表
      this.initTrendChart();
      this.initMonitorChart();
      this.initDataChart();
      this.initReportChart();
    },
    initTrendChart() {
      if (this.$refs.trendChart) {
        this.trendChart = this.$echarts.init(this.$refs.trendChart);
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          legend: {
            data: ['就餐率', '平均满意度', '就餐人数', '空闲座位比例'],
            textStyle: {
              color: '#999'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['3月12日', '3月13日', '3月14日', '3月15日', '3月16日', '3月17日', '3月18日'],
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisLabel: {
              color: '#999'
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisLabel: {
              color: '#999',
              formatter: '{value}%'
            },
            splitLine: {
              lineStyle: {
                color: '#222'
              }
            }
          },
          series: [
            {
              name: '就餐率',
              type: 'line',
              stack: 'Total',
              areaStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(52, 152, 219, 0.6)' },
                  { offset: 1, color: 'rgba(52, 152, 219, 0.1)' }
                ])
              },
              emphasis: {
                focus: 'series'
              },
              data: [72.5, 73.2, 75.8, 76.5, 77.0, 78.0, 78.5]
            },
            {
              name: '平均满意度',
              type: 'line',
              stack: 'Total',
              areaStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(46, 204, 113, 0.6)' },
                  { offset: 1, color: 'rgba(46, 204, 113, 0.1)' }
                ])
              },
              emphasis: {
                focus: 'series'
              },
              data: [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8]
            },
            {
              name: '就餐人数',
              type: 'line',
              stack: 'Total',
              areaStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(241, 196, 15, 0.6)' },
                  { offset: 1, color: 'rgba(241, 196, 15, 0.1)' }
                ])
              },
              emphasis: {
                focus: 'series'
              },
              data: [1050, 1100, 1150, 1180, 1200, 1217, 1256]
            },
            {
              name: '空闲座位比例',
              type: 'line',
              stack: 'Total',
              areaStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(231, 76, 60, 0.6)' },
                  { offset: 1, color: 'rgba(231, 76, 60, 0.1)' }
                ])
              },
              emphasis: {
                focus: 'series'
              },
              data: [27.5, 26.8, 24.2, 23.5, 23.0, 22.0, 21.5]
            }
          ]
        };
        this.trendChart.setOption(option);
      }
    },
    initMonitorChart() {
      if (this.$refs.monitorChart) {
        this.monitorChart = this.$echarts.init(this.$refs.monitorChart);
        const option = {
          title: {
            text: '实时就餐人数',
            textStyle: {
              color: '#999'
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'],
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisLabel: {
              color: '#999'
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisLabel: {
              color: '#999'
            },
            splitLine: {
              lineStyle: {
                color: '#222'
              }
            }
          },
          series: [
            {
              data: [120, 190, 300, 428, 350, 200, 100],
              type: 'line',
              smooth: true,
              lineStyle: {
                color: '#3498db'
              },
              areaStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(52, 152, 219, 0.6)' },
                  { offset: 1, color: 'rgba(52, 152, 219, 0.1)' }
                ])
              }
            }
          ]
        };
        this.monitorChart.setOption(option);
      }
    },
    initDataChart() {
      if (this.$refs.dataChart) {
        this.dataChart = this.$echarts.init(this.$refs.dataChart);
        const option = {
          title: {
            text: '周就餐人数统计',
            textStyle: {
              color: '#999'
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisLabel: {
              color: '#999'
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#333'
              }
            },
            axisLabel: {
              color: '#999'
            },
            splitLine: {
              lineStyle: {
                color: '#222'
              }
            }
          },
          series: [
            {
              data: [1100, 1150, 1200, 1180, 1250, 900, 850],
              type: 'bar',
              itemStyle: {
                color: '#27ae60'
              }
            }
          ]
        };
        this.dataChart.setOption(option);
      }
    },
    initReportChart() {
      if (this.$refs.reportChart) {
        this.reportChart = this.$echarts.init(this.$refs.reportChart);
        const option = {
          title: {
            text: '就餐类型分布',
            textStyle: {
              color: '#999'
            }
          },
          tooltip: {
            trigger: 'item'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
              color: '#999'
            }
          },
          series: [
            {
              name: '就餐类型',
              type: 'pie',
              radius: '50%',
              data: [
                { value: 60, name: '堂食' },
                { value: 30, name: '外卖' },
                { value: 10, name: '打包' }
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
        };
        this.reportChart.setOption(option);
      }
    },
    resizeCharts() {
      if (this.trendChart) this.trendChart.resize();
      if (this.monitorChart) this.monitorChart.resize();
      if (this.dataChart) this.dataChart.resize();
      if (this.reportChart) this.reportChart.resize();
    },
    destroyCharts() {
      if (this.trendChart) this.trendChart.dispose();
      if (this.monitorChart) this.monitorChart.dispose();
      if (this.dataChart) this.dataChart.dispose();
      if (this.reportChart) this.reportChart.dispose();
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  background-color: #1a1a1a;
  color: #fff;
}

/* 左侧导航菜单 */
.sidebar {
  width: 200px;
  background-color: #2c3e50;
  padding: 20px 0;
}

.sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid #34495e;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #fff;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
}

.sidebar-menu li {
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
}

.sidebar-menu li:hover {
  background-color: #34495e;
}

.sidebar-menu li.active {
  background-color: #3498db;
}

.menu-icon {
  margin-right: 10px;
  font-size: 16px;
}

.menu-text {
  font-size: 14px;
  color: #fff;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航栏 */
.top-nav {
  background-color: #222;
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
}

.top-nav-left h2 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.top-nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date-info {
  font-size: 14px;
  color: #999;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  color: #fff;
}

.user-avatar {
  font-size: 20px;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 核心经营指标页面 */
.core-metrics-page {
  height: 100%;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #222;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
  color: #27ae60;
}

/* 图表区域 */
.chart-section {
  margin-bottom: 30px;
}

.chart-section h3 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #fff;
}

.chart-container {
  background-color: #222;
  border-radius: 8px;
  padding: 20px;
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* 表格区域 */
.table-section {
  margin-top: 30px;
}

.table-section h3 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #fff;
}

.table-container {
  background-color: #222;
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #333;
  color: #999;
}

.data-table th {
  background-color: #2a2a2a;
  color: #fff;
  font-weight: bold;
}

.data-table tr:hover {
  background-color: #2a2a2a;
}

/* 其他页面 */
.monitor-page,
.data-page,
.report-page,
.system-page {
  background-color: #222;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
}

.temp-data {
  margin-top: 20px;
}

.temp-data p {
  color: #999;
  margin-bottom: 20px;
}

.temp-chart {
  height: 400px;
  margin-top: 20px;
  width: 100%;
  min-height: 400px;
}

.temp-data ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
}

.temp-data li {
  padding: 8px 0;
  border-bottom: 1px solid #333;
  color: #999;
}

/* 系统管理页面样式 */
.system-section {
  margin-bottom: 30px;
  background-color: #222;
  border-radius: 8px;
  padding: 20px;
}

.system-section h4 {
  margin: 0 0 15px;
  font-size: 14px;
  color: #fff;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
}

.system-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.system-info .info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

.system-info .info-label {
  color: #999;
}

.system-info .info-value {
  color: #fff;
  font-weight: bold;
}

.user-table {
  overflow-x: auto;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #2a2a2a;
  border-radius: 4px;
}

.setting-name {
  color: #999;
}

.setting-value {
  color: #fff;
  font-weight: bold;
  margin: 0 20px;
  flex: 1;
  text-align: center;
}

.setting-item .btn {
  padding: 4px 12px;
  font-size: 12px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.setting-item .btn:hover {
  background-color: #2980b9;
}
</style>