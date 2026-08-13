<template>
  <div class="equipment-monitoring-system">
    <!-- 侧边导航栏 -->
    <div class="sidebar">
      <div class="logo">
        <h2>设备清洗消毒控制系统</h2>
      </div>
      <ul class="menu">
        <li 
          v-for="item in menuItems" 
          :key="item.id"
          :class="{ active: activeMenu === item.id }"
          @click="switchMenu(item.id)"
        >
          <i class="menu-icon" :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </li>
      </ul>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <div class="title">
          <h1>{{ pageTitle }}</h1>
        </div>
        <div class="top-actions">
          <div class="search-box">
            <input type="text" placeholder="搜索设备或记录..." />
            <i class="el-icon-search"></i>
          </div>
          <button class="add-btn">
            <i class="el-icon-plus"></i>
            <span>添加设备</span>
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 清洗记录页面 -->
        <div v-if="activeMenu === 'cleaning-records'" class="cleaning-records-page">
          <!-- 数据概览卡片 -->
          <div class="overview-section">
            <h2>加工设备清洗消毒数据概览</h2>
            <div class="overview-cards">
              <div class="overview-card card-total">
                <div class="card-content">
                  <h3>设备总数</h3>
                  <div class="card-value">{{ overviewData.totalEquipment }}</div>
                  <div class="card-desc">台在线设备</div>
                </div>
                <div class="card-icon">
                  <i class="el-icon-s-platform"></i>
                </div>
              </div>
              
              <div class="overview-card card-cleaned">
                <div class="card-content">
                  <h3>今日已清洗设备</h3>
                  <div class="card-value">{{ overviewData.todayCleaned }}</div>
                  <div class="card-desc">今日清洗数</div>
                </div>
                <div class="card-icon">
                  <i class="el-icon-watermelon"></i>
                </div>
              </div>
              
              <div class="overview-card card-abnormal">
                <div class="card-content">
                  <h3>异常设备</h3>
                  <div class="card-value">{{ overviewData.abnormalEquipment }}</div>
                  <div class="card-desc">需关注处理</div>
                </div>
                <div class="card-icon">
                  <i class="el-icon-warning-outline"></i>
                </div>
              </div>
              
              <div class="overview-card card-qualified">
                <div class="card-content">
                  <h3>抽检合格数</h3>
                  <div class="card-value">{{ overviewData.qualified }}</div>
                  <div class="card-desc">合格率 {{ overviewData.qualifiedRate }}</div>
                </div>
                <div class="card-icon">
                  <i class="el-icon-check"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- 设备实时状态监控 -->
          <div class="monitoring-section">
            <div class="section-header">
              <h2>设备实时状态监控</h2>
              <div class="section-actions">
                <button class="filter-btn">筛选</button>
                <button class="refresh-btn" @click="refreshDeviceList">
                  <i class="el-icon-refresh"></i>
                  刷新
                </button>
              </div>
            </div>
            
            <div class="device-cards">
              <div 
                v-for="device in deviceList" 
                :key="device.id"
                class="device-card"
                :class="`status-${device.status}`"
                @click="selectDevice(device)"
              >
                <div class="device-header">
                  <h3 class="device-name">{{ device.name }}</h3>
                  <span class="device-status" :class="`status-${device.status}`">
                    {{ getStatusText(device.status) }}
                  </span>
                </div>
                
                <div class="device-info">
                  <div class="info-row">
                    <span class="info-label">设备编号:</span>
                    <span class="info-value">{{ device.code }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">生产区域:</span>
                    <span class="info-value">{{ device.area }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">上线时间:</span>
                    <span class="info-value">{{ device.onlineTime }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">下线时间:</span>
                    <span class="info-value">{{ device.offlineTime }}</span>
                  </div>
                </div>
                
                <div class="device-actions">
                  <button class="action-btn view-btn" @click.stop="viewDeviceDetails(device)">
                    <i class="el-icon-view"></i>
                    查看详情
                  </button>
                  <button class="action-btn clean-btn" @click.stop="startCleaning(device)">
                    <i class="el-icon-watermelon"></i>
                    开始清洗
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 设备管理页面 -->
        <div v-else-if="activeMenu === 'equipment-management'" class="other-page">
          <h2>设备管理</h2>
          <div class="page-content">
            <p>设备管理功能页面</p>
            <p>当前设备总数: {{ overviewData.totalEquipment }}</p>
            <div class="sample-data">
              <h3>设备分类统计:</h3>
              <ul>
                <li>清洗设备: 24台</li>
                <li>消毒设备: 18台</li>
                <li>其他设备: 6台</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 消毒记录页面 -->
        <div v-else-if="activeMenu === 'disinfection-records'" class="other-page">
          <h2>消毒记录</h2>
          <div class="page-content">
            <p>消毒记录功能页面</p>
            <div class="sample-data">
              <h3>近期消毒记录:</h3>
              <ul>
                <li>今日已完成消毒: 15台</li>
                <li>本周累计消毒: 85台</li>
                <li>消毒合格率: 98.5%</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 报告统计页面 -->
        <div v-else-if="activeMenu === 'reports'" class="other-page">
          <h2>报告统计</h2>
          <div class="page-content">
            <p>报告统计功能页面</p>
            <div class="sample-data">
              <h3>本月统计数据:</h3>
              <ul>
                <li>清洗次数: 420次</li>
                <li>消毒次数: 380次</li>
                <li>异常报告: 12份</li>
                <li>抽检报告: 45份</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 系统设置页面 -->
        <div v-else class="other-page">
          <h2>系统设置</h2>
          <div class="page-content">
            <p>系统设置功能页面</p>
            <div class="sample-data">
              <h3>系统信息:</h3>
              <ul>
                <li>版本: V2.1.0</li>
                <li>最后更新: 2024-02-15</li>
                <li>用户数: 24人</li>
                <li>设备接入: 48台</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EquipmentCleaningMonitoringSystem',
  
  data() {
    return {
      // 当前激活的菜单
      activeMenu: 'cleaning-records',
      
      // 菜单项数据
      menuItems: [
        { id: 'equipment-management', name: '设备管理', icon: 'el-icon-s-platform' },
        { id: 'cleaning-records', name: '清洗记录', icon: 'el-icon-watermelon' },
        { id: 'disinfection-records', name: '消毒记录', icon: 'el-icon-medal' },
        { id: 'reports', name: '报告统计', icon: 'el-icon-data-line' },
        { id: 'settings', name: '系统设置', icon: 'el-icon-setting' }
      ],
      
      // 概览数据
      overviewData: {
        totalEquipment: 48,
        todayCleaned: 32,
        abnormalEquipment: 8,
        qualified: 3,
        qualifiedRate: '93.8%'
      },
      
      // 设备列表数据
      deviceList: [
        {
          id: 1,
          name: '贯通式烘箱 JX-480A',
          code: '582030001',
          area: '生产区域A',
          onlineTime: '2024-02-15 08:30',
          offlineTime: '2024-02-15 10:15',
          status: 'normal' // normal: 正常, cleaning: 清洗中, abnormal: 异常
        },
        {
          id: 2,
          name: '西双版纳冲压设备 MJ-3000A',
          code: '582030002',
          area: '生产区域B',
          onlineTime: '2024-02-15 10:45',
          offlineTime: '2024-02-15 14:20',
          status: 'cleaning'
        },
        {
          id: 3,
          name: '自动清洗机 CS-500',
          code: '582030003',
          area: '清洗区域',
          onlineTime: '2024-02-16 09:45',
          offlineTime: '2024-02-16 10:00',
          status: 'normal'
        },
        {
          id: 4,
          name: '高温消毒炉 DX-800',
          code: '582030004',
          area: '消毒区域',
          onlineTime: '2024-02-16 09:45',
          offlineTime: '2024-02-16 14:20',
          status: 'abnormal'
        },
        {
          id: 5,
          name: '超声波清洗机 CS-300',
          code: '582030005',
          area: '生产区域C',
          onlineTime: '2024-02-17 08:00',
          offlineTime: '2024-02-17 12:30',
          status: 'normal'
        },
        {
          id: 6,
          name: '真空干燥箱 ZG-600',
          code: '582030006',
          area: '生产区域A',
          onlineTime: '2024-02-17 09:15',
          offlineTime: '2024-02-17 16:45',
          status: 'cleaning'
        }
      ]
    };
  },
  
  computed: {
    // 计算当前页面标题
    pageTitle() {
      const menu = this.menuItems.find(item => item.id === this.activeMenu);
      return menu ? menu.name : '设备清洗消毒控制系统';
    }
  },
  
  methods: {
    // 切换菜单
    switchMenu(menuId) {
      this.activeMenu = menuId;
      
      // 模拟不同菜单下的数据变化
      if (menuId === 'cleaning-records') {
        this.refreshCleaningData();
      } else if (menuId === 'equipment-management') {
        // 可以在这里加载设备管理相关数据
        console.log('切换到设备管理页面');
      }
    },
    
    // 刷新设备列表
    refreshDeviceList() {
      // 模拟数据刷新
      this.$message({
        message: '设备列表已刷新',
        type: 'success'
      });
      
      // 在实际应用中，这里会调用API获取最新数据
      // 现在只是模拟随机更新一些数据
      this.deviceList.forEach(device => {
        if (Math.random() > 0.7) {
          device.status = ['normal', 'cleaning', 'abnormal'][Math.floor(Math.random() * 3)];
        }
      });
    },
    
    // 刷新清洗数据
    refreshCleaningData() {
      // 模拟数据更新
      this.overviewData.todayCleaned = Math.floor(Math.random() * 10) + 28; // 28-38之间
      this.overviewData.qualified = Math.floor(Math.random() * 5) + 1; // 1-6之间
      this.overviewData.qualifiedRate = `${Math.floor(Math.random() * 5) + 92}%`; // 92-97%之间
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        normal: '正常',
        cleaning: '清洗中',
        abnormal: '异常'
      };
      return statusMap[status] || '未知';
    },
    
    // 选择设备
    selectDevice(device) {
      console.log('选择设备:', device);
      this.$message({
        message: `已选择设备: ${device.name}`,
        type: 'info'
      });
    },
    
    // 查看设备详情
    viewDeviceDetails(device) {
      this.$message({
        message: `查看设备详情: ${device.name}`,
        type: 'info'
      });
      // 在实际应用中，这里会跳转到详情页面或打开详情弹窗
    },
    
    // 开始清洗设备
    startCleaning(device) {
      this.$message({
        message: `开始清洗设备: ${device.name}`,
        type: 'success'
      });
      
      // 更新设备状态为清洗中
      device.status = 'cleaning';
      
      // 更新今日清洗数
      this.overviewData.todayCleaned += 1;
    }
  },
  
  mounted() {
    // 组件加载时初始化数据
    console.log('设备清洗消毒监控系统已加载');
  }
};
</script>

<style scoped>
.equipment-monitoring-system {
  display: flex;
  height: 100vh;
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 220px;
  background-color: #1a2b4c;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.logo {
  padding: 20px 15px;
  border-bottom: 1px solid #2a3b5c;
  text-align: center;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.menu {
  list-style: none;
  padding: 20px 0;
  margin: 0;
  flex: 1;
}

.menu li {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.menu li:hover {
  background-color: #2a3b5c;
}

.menu li.active {
  background-color: #2a3b5c;
  border-left: 4px solid #409EFF;
  color: #409EFF;
}

.menu-icon {
  margin-right: 12px;
  font-size: 18px;
}

.menu span {
  font-size: 16px;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 5;
}

.title h1 {
  margin: 0;
  font-size: 22px;
  color: #333;
  font-weight: 600;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  padding: 8px 15px 8px 35px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  width: 250px;
  outline: none;
  transition: border-color 0.3s;
}

.search-box input:focus {
  border-color: #409EFF;
}

.search-box .el-icon-search {
  position: absolute;
  left: 12px;
  color: #909399;
}

.add-btn {
  padding: 8px 15px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #66b1ff;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 清洗记录页面样式 */
.cleaning-records-page {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.overview-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 10px;
}

.overview-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-total {
  border-top: 4px solid #409EFF;
}

.card-cleaned {
  border-top: 4px solid #67C23A;
}

.card-abnormal {
  border-top: 4px solid #F56C6C;
}

.card-qualified {
  border-top: 4px solid #E6A23C;
}

.card-content h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 5px;
}

.card-desc {
  font-size: 14px;
  color: #909399;
}

.card-icon {
  font-size: 40px;
  opacity: 0.8;
}

.card-total .card-icon {
  color: #409EFF;
}

.card-cleaned .card-icon {
  color: #67C23A;
}

.card-abnormal .card-icon {
  color: #F56C6C;
}

.card-qualified .card-icon {
  color: #E6A23C;
}

/* 监控区域样式 */
.monitoring-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: 10px;
}

.filter-btn, .refresh-btn {
  padding: 8px 15px;
  border: 1px solid #dcdfe6;
  background-color: white;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.filter-btn:hover, .refresh-btn:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.refresh-btn {
  color: #409EFF;
  border-color: #409EFF;
}

.refresh-btn:hover {
  background-color: #ecf5ff;
}

/* 设备卡片样式 */
.device-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.device-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: white;
  transition: all 0.3s;
  cursor: pointer;
}

.device-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.device-card.status-normal {
  border-left: 4px solid #67C23A;
}

.device-card.status-cleaning {
  border-left: 4px solid #409EFF;
}

.device-card.status-abnormal {
  border-left: 4px solid #F56C6C;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.device-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.device-status {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.device-status.status-normal {
  background-color: #f0f9eb;
  color: #67C23A;
}

.device-status.status-cleaning {
  background-color: #ecf5ff;
  color: #409EFF;
}

.device-status.status-abnormal {
  background-color: #fef0f0;
  color: #F56C6C;
}

.device-info {
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  color: #909399;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.device-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.3s;
}

.view-btn {
  background-color: #f4f4f5;
  color: #909399;
}

.view-btn:hover {
  background-color: #e9e9eb;
  color: #606266;
}

.clean-btn {
  background-color: #ecf5ff;
  color: #409EFF;
}

.clean-btn:hover {
  background-color: #d9ecff;
  color: #409EFF;
}

/* 其他页面样式 */
.other-page {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

.other-page h2 {
  margin: 0 0 25px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.page-content {
  padding: 20px 0;
}

.page-content p {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
}

.sample-data {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 6px;
  margin-top: 30px;
}

.sample-data h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.sample-data ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sample-data li {
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
  color: #606266;
  font-size: 15px;
}

.sample-data li:last-child {
  border-bottom: none;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 180px;
  }
  
  .logo h2 {
    font-size: 16px;
  }
  
  .top-nav {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-box input {
    width: 200px;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .device-cards {
    grid-template-columns: 1fr;
  }
}
</style>