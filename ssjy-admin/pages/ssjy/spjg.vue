<template>
  <div class="canteen-supervision-system">
    <!-- 顶部标题栏 -->
    <div class="top-bar">
      <div class="system-title">
        <h1>学生食堂食品加工流程规范监督系统</h1>
      </div>
      <div class="supervisor-info">
        <div class="info-item">
          <span class="label">监督日期：</span>
          <span class="value">{{ currentDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">食堂监管员：</span>
          <span class="value">{{ supervisorInfo.name }}（{{ supervisorInfo.code }}）</span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 侧边菜单 -->
      <div class="sidebar">
        <div class="user-profile">
          <div class="avatar">
            <i class="el-icon-user-solid"></i>
          </div>
          <div class="user-info">
            <div class="user-name">{{ supervisorInfo.name }}</div>
            <div class="user-role">食堂监管员</div>
          </div>
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
        
        <div class="system-info">
          
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="content-area">
        <!-- 监督概览页面 -->
        <div v-if="activeMenu === 'overview'" class="overview-page">
          <!-- 数据统计卡片 -->
          <div class="stats-section">
            <h2>食堂数据统计</h2>
            <div class="stats-cards">
              <div class="stat-card">
                <div class="stat-header">
                  <h3>今日监督窗口数</h3>
                  <div class="stat-trend positive">
                    <i class="el-icon-top"></i>
                    较昨日（23个）
                  </div>
                </div>
                <div class="stat-value">{{ stats.todaySupervisedWindows }}</div>
                <div class="stat-desc">当前监督窗口数量</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-header">
                  <h3>合规窗口数</h3>
                  <div class="stat-trend negative">
                    <i class="el-icon-bottom"></i>
                    合规率 {{ stats.complianceRate }}（昨日{{ stats.yesterdayComplianceRate }}）
                  </div>
                </div>
                <div class="stat-value">{{ stats.compliantWindows }}</div>
                <div class="stat-desc">符合规范窗口数量</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-header">
                  <h3>违规窗口数</h3>
                  <div class="stat-trend">
                    已暂停供餐（负责人：王强）
                  </div>
                </div>
                <div class="stat-value warning">{{ stats.violationWindows }}</div>
                <div class="stat-desc">存在违规行为窗口</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-header">
                  <h3>平均整改剩余</h3>
                  <div class="stat-trend positive">
                    <i class="el-icon-success"></i>
                    较上月减少2天
                  </div>
                </div>
                <div class="stat-value">{{ stats.avgRectificationDays }}</div>
                <div class="stat-desc">个工作日</div>
              </div>
            </div>
          </div>

          <!-- 食堂食品加工流程规范监督 -->
          <div class="supervision-section">
            <div class="section-header">
              <h2>食堂食品加工流程规范监督</h2>
              <div class="quick-filters">
                <div class="filter-title">快速筛选</div>
                <div class="filter-tags">
                  <span class="filter-tag active">√ 合规窗口</span>
                  <span class="filter-tag">√ 整改中窗口</span>
                  <span class="filter-tag">√ 违规窗口</span>
                  <span class="filter-tag active">√ 食堂区域</span>
                  <span class="filter-tag active">√ 第一学生食堂</span>
                </div>
              </div>
            </div>
            
            <div class="current-supervision">
              <div class="current-header">
                <h3>当前监督：第一学生食堂-中式快餐窗口（3号窗口）</h3>
                <div class="window-status status-compliant">合规</div>
              </div>
              
              <div class="process-supervision">
                <!-- 原料验收流程 -->
                <div class="process-card">
                  <div class="process-header">
                    <h4>原料验收</h4>
                    <div class="process-status status-compliant">合规</div>
                  </div>
                  <div class="process-details">
                    <div class="detail-item">
                      <span class="detail-label">验收人：</span>
                      <span class="detail-value">张芳（仓管）</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">验收时间：</span>
                      <span class="detail-value">06:15 - 06:30</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">验收记录：</span>
                      <span class="detail-value">共验收食材12种，合格率100%</span>
                    </div>
                  </div>
                </div>
                
                <!-- 清洗处理流程 -->
                <div class="process-card">
                  <div class="process-header">
                    <h4>清洗处理</h4>
                    <div class="process-status status-compliant">合规</div>
                  </div>
                  <div class="process-details">
                    <div class="detail-item">
                      <span class="detail-label">操作人：</span>
                      <span class="detail-value">刘敏（厨工）</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">检查时间：</span>
                      <span class="detail-value">06:30</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">检查结果：</span>
                      <span class="detail-value">蔬菜清洗符合标准，水池分类使用正确</span>
                    </div>
                  </div>
                </div>
                
                <!-- 切配加工流程 -->
                <div class="process-card">
                  <div class="process-header">
                    <h4>切配加工</h4>
                    <div class="process-status status-compliant">合规</div>
                  </div>
                  <div class="process-details">
                    <div class="detail-item">
                      <span class="detail-label">操作人：</span>
                      <span class="detail-value">陈明（厨师）</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">检查时间：</span>
                      <span class="detail-value">06:45</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">检查结果：</span>
                      <span class="detail-value">生熟刀具分开，砧板分类使用，操作规范</span>
                    </div>
                  </div>
                </div>
                
                <!-- 烹饪制作流程 -->
                <div class="process-card process-card-violation">
                  <div class="process-header">
                    <h4>烹饪制作</h4>
                    <div class="process-status status-violation">违规</div>
                  </div>
                  <div class="process-details">
                    <div class="detail-item">
                      <span class="detail-label">操作人：</span>
                      <span class="detail-value">赵刚（主厨）</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">检查时间：</span>
                      <span class="detail-value">07:10</span>
                    </div>
                    
                    <!-- 违规详情 -->
                    <div class="violation-details">
                      <div class="violation-title">烹饪制作环节违规详情</div>
                      <div class="violation-item">
                        <div class="violation-label">违规项：</div>
                        <div class="violation-content">
                          红烧排骨烹饪中心温度未达标（学生食堂要求≥80℃，实际检测72℃/73℃/75℃，平均值73.3℃）
                        </div>
                      </div>
                      <div class="violation-item">
                        <div class="violation-label">违规依据：</div>
                        <div class="violation-content">
                          《学校食堂食品安全与营养健康管理规定》（教育部45号令）第23条 食品烹饪要求
                        </div>
                      </div>
                      <div class="violation-item">
                        <div class="violation-label">整改要求：</div>
                        <div class="violation-content">
                          立即调整电炒锅温控参数至85℃，每20分钟记录一次温度，由主厨赵刚签字确认，2026-02-10 07:00前提交整改报告至食堂监管员李伟处
                        </div>
                      </div>
                      <div class="violation-persons">
                        <div class="person-item">
                          <div class="person-label">监督人员：</div>
                          <div class="person-content">
                            李伟（食堂监管编号：XTSC2026001），联系电话：138XXXX5678
                          </div>
                        </div>
                        <div class="person-item">
                          <div class="person-label">食堂负责人：</div>
                          <div class="person-content">
                            周建华（第一食堂主管，联系电话：139XXXX8765），已签字确认违规事实
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 近期食堂窗口监督列表 -->
          <div class="window-list-section">
            <div class="section-header">
              <h2>近期食堂窗口监督列表</h2>
              <div class="list-actions">
                <button class="export-btn">
                  <i class="el-icon-download"></i>
                  导出数据
                </button>
                <button class="add-btn" @click="addNewSupervision">
                  <i class="el-icon-plus"></i>
                  新增监督
                </button>
              </div>
            </div>
            
            <div class="window-table">
              <div class="table-header">
                <div class="header-cell" style="width: 20%;">食堂/窗口</div>
                <div class="header-cell" style="width: 20%;">负责人/联系方式</div>
                <div class="header-cell" style="width: 15%;">监督日期/人员</div>
                <div class="header-cell" style="width: 15%;">主要供应品类</div>
                <div class="header-cell" style="width: 15%;">监督结果</div>
                <div class="header-cell" style="width: 15%;">整改状态</div>
              </div>
              
              <div 
                v-for="window in windowList" 
                :key="window.id"
                class="table-row"
                @click="selectWindow(window)"
              >
                <div class="table-cell" style="width: 20%;">
                  <div class="window-name">{{ window.name }}</div>
                  <div class="window-location">{{ window.location }}</div>
                </div>
                <div class="table-cell" style="width: 20%;">
                  <div class="person-info">
                    <div class="person-name">{{ window.personInCharge.name }}</div>
                    <div class="person-phone">{{ window.personInCharge.phone }}</div>
                  </div>
                </div>
                <div class="table-cell" style="width: 15%;">
                  <div class="supervision-info">
                    <div class="supervision-date">{{ window.supervisionDate }}</div>
                    <div class="supervision-person">{{ window.supervisor }}</div>
                  </div>
                </div>
                <div class="table-cell" style="width: 15%;">
                  <div class="category-tag">{{ window.category }}</div>
                </div>
                <div class="table-cell" style="width: 15%;">
                  <div class="result-badge" :class="`status-${window.result}`">
                    {{ getResultText(window.result) }}
                  </div>
                </div>
                <div class="table-cell" style="width: 15%;">
                  <div class="rectification-status" :class="`status-${window.rectificationStatus}`">
                    {{ getRectificationText(window.rectificationStatus) }}
                  </div>
                  <div v-if="window.rectificationDays" class="rectification-days">
                    剩余{{ window.rectificationDays }}天
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 食堂窗口管理页面 -->
        <div v-else-if="activeMenu === 'window-management'" class="window-management-page">
          <h2>食堂窗口管理</h2>
          <div class="page-content">
            <div class="window-overview">
              <div class="overview-card">
                <h3>窗口统计</h3>
                <div class="overview-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ windowStats.total }}</div>
                    <div class="stat-label">总窗口数</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ windowStats.operating }}</div>
                    <div class="stat-label">营业中</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ windowStats.suspended }}</div>
                    <div class="stat-label">暂停营业</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ windowStats.underRectification }}</div>
                    <div class="stat-label">整改中</div>
                  </div>
                </div>
              </div>
              
              <div class="window-search">
                <input type="text" placeholder="搜索窗口名称、负责人或品类..." v-model="windowSearchKeyword">
                <button class="search-btn">
                  <i class="el-icon-search"></i>
                </button>
              </div>
            </div>
            
            <div class="window-cards">
              <div 
                v-for="window in windowManagementList" 
                :key="window.id"
                class="window-card"
                :class="`status-${window.operatingStatus}`"
              >
                <div class="window-card-header">
                  <h3>{{ window.name }}</h3>
                  <div class="window-status" :class="`status-${window.operatingStatus}`">
                    {{ getOperatingStatusText(window.operatingStatus) }}
                  </div>
                </div>
                
                <div class="window-card-body">
                  <div class="window-info">
                    <div class="info-item">
                      <span class="label">位置：</span>
                      <span class="value">{{ window.location }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">负责人：</span>
                      <span class="value">{{ window.personInCharge.name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">联系方式：</span>
                      <span class="value">{{ window.personInCharge.phone }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">供应品类：</span>
                      <span class="value">{{ window.category }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">营业时间：</span>
                      <span class="value">{{ window.businessHours }}</span>
                    </div>
                  </div>
                  
                  <div class="window-actions">
                    <button class="action-btn detail-btn" @click="viewWindowDetail(window)">
                      查看详情
                    </button>
                    <button class="action-btn edit-btn" @click="editWindow(window)">
                      编辑
                    </button>
                    <button 
                      class="action-btn" 
                      :class="window.operatingStatus === 'operating' ? 'suspend-btn' : 'resume-btn'"
                      @click="toggleWindowStatus(window)"
                    >
                      {{ window.operatingStatus === 'operating' ? '暂停营业' : '恢复营业' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 食堂数据统计页面 -->
        <div v-else-if="activeMenu === 'data-statistics'" class="data-statistics-page">
          <h2>食堂数据统计</h2>
          <div class="page-content">
            <div class="data-cards">
              <div class="data-card">
                <h3>本月监督统计</h3>
                <div class="data-details">
                  <div class="detail-item">
                    <span class="label">总监督次数：</span>
                    <span class="value">{{ monthlyStats.totalSupervisions }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">合规次数：</span>
                    <span class="value value-compliant">{{ monthlyStats.compliantSupervisions }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">违规次数：</span>
                    <span class="value value-violation">{{ monthlyStats.violationSupervisions }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">整改完成：</span>
                    <span class="value value-rectified">{{ monthlyStats.rectifiedSupervisions }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">整体合规率：</span>
                    <span class="value value-rate">{{ monthlyStats.complianceRate }}</span>
                  </div>
                </div>
              </div>
              
              <div class="data-card">
                <h3>违规类型分布</h3>
                <div class="violation-types">
                  <div 
                    v-for="type in violationTypes" 
                    :key="type.name"
                    class="violation-type-item"
                  >
                    <div class="type-name">{{ type.name }}</div>
                    <div class="type-count">{{ type.count }}次</div>
                    <div class="type-percentage">{{ type.percentage }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="chart-section">
              <h3>近30天监督趋势</h3>
              <div class="chart-placeholder">
                <div class="chart-mock">
                  <div class="chart-title">监督合规率趋势图</div>
                  <div class="chart-bars">
                    <div v-for="i in 10" :key="i" class="chart-bar" :style="{height: `${Math.random()*60 + 40}px`}"></div>
                  </div>
                  <div class="chart-labels">
                    <span>2月1日</span>
                    <span>2月5日</span>
                    <span>2月10日</span>
                    <span>2月15日</span>
                    <span>2月20日</span>
                    <span>2月25日</span>
                    <span>2月28日</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 食堂工作人员管理页面 -->
        <div v-else-if="activeMenu === 'staff-management'" class="staff-management-page">
          <h2>食堂工作人员管理</h2>
          <div class="page-content">
            <div class="staff-stats">
              <div class="stat-card">
                <div class="stat-value">{{ staffStats.total }}</div>
                <div class="stat-label">工作人员总数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ staffStats.onDuty }}</div>
                <div class="stat-label">在岗人数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ staffStats.certified }}</div>
                <div class="stat-label">持证人数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ staffStats.trainingRequired }}</div>
                <div class="stat-label">需培训人数</div>
              </div>
            </div>
            
            <div class="staff-table">
              <div class="table-header">
                <div class="header-cell" style="width: 15%;">工号</div>
                <div class="header-cell" style="width: 15%;">姓名</div>
                <div class="header-cell" style="width: 15%;">岗位</div>
                <div class="header-cell" style="width: 20%;">负责窗口</div>
                <div class="header-cell" style="width: 15%;">健康证状态</div>
                <div class="header-cell" style="width: 20%;">操作</div>
              </div>
              
              <div 
                v-for="staff in staffList" 
                :key="staff.id"
                class="table-row"
              >
                <div class="table-cell" style="width: 15%;">
                  {{ staff.employeeId }}
                </div>
                <div class="table-cell" style="width: 15%;">
                  {{ staff.name }}
                </div>
                <div class="table-cell" style="width: 15%;">
                  <span class="position-tag">{{ staff.position }}</span>
                </div>
                <div class="table-cell" style="width: 20%;">
                  {{ staff.responsibleWindow }}
                </div>
                <div class="table-cell" style="width: 15%;">
                  <div class="health-status" :class="`status-${staff.healthCertificateStatus}`">
                    {{ staff.healthCertificateStatus === 'valid' ? '有效' : '即将过期' }}
                  </div>
                  <div v-if="staff.healthCertificateStatus === 'expiring'" class="expiry-date">
                    到期：{{ staff.certificateExpiryDate }}
                  </div>
                </div>
                <div class="table-cell" style="width: 20%;">
                  <div class="staff-actions">
                    <button class="action-btn view-btn" @click="viewStaffDetail(staff)">
                      查看
                    </button>
                    <button class="action-btn edit-btn" @click="editStaff(staff)">
                      编辑
                    </button>
                    <button class="action-btn training-btn" @click="assignTraining(staff)">
                      培训
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统设置页面 -->
        <div v-else class="settings-page">
          <h2>系统设置</h2>
          <div class="page-content">
            <div class="settings-section">
              <h3>系统信息</h3>
              <div class="system-info">
                <div class="info-item">
                  <span class="label">系统版本：</span>
                  <span class="value">V2.1.0</span>
                </div>
                <div class="info-item">
                  <span class="label">最后数据同步：</span>
                  <span class="value">2026-02-08 23:45</span>
                </div>
                <div class="info-item">
                  <span class="label">学校名称：</span>
                  <span class="value">XX市第一中学</span>
                </div>
                <div class="info-item">
                  <span class="label">食堂数量：</span>
                  <span class="value">3个食堂，28个窗口</span>
                </div>
              </div>
            </div>
            
            <div class="settings-section">
              <h3>监管员管理</h3>
              <div class="supervisor-list">
                <div class="supervisor-item" v-for="supervisor in supervisors" :key="supervisor.id">
                  <div class="supervisor-info">
                    <div class="supervisor-name">{{ supervisor.name }}</div>
                    <div class="supervisor-code">{{ supervisor.code }}</div>
                  </div>
                  <div class="supervisor-actions">
                    <button class="action-btn">权限设置</button>
                  </div>
                </div>
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
  name: 'CanteenSupervisionSystem',
  
  data() {
    return {
      // 当前激活的菜单
      activeMenu: 'overview',
      
      // 搜索关键词
      windowSearchKeyword: '',
      
      // 当前日期
      currentDate: '2026-02-09',
      
      // 监管员信息
      supervisorInfo: {
        name: '李伟',
        code: 'XTSC2026001'
      },
      
      // 菜单项数据
      menuItems: [
        { id: 'overview', name: '监督概览', icon: 'el-icon-data-line' },
        { id: 'window-management', name: '食堂窗口管理', icon: 'el-icon-s-shop' },
        { id: 'data-statistics', name: '食堂数据统计', icon: 'el-icon-s-data' },
        { id: 'staff-management', name: '食堂工作人员管理', icon: 'el-icon-user' },
        { id: 'settings', name: '系统设置', icon: 'el-icon-setting' }
      ],
      
      // 统计数据
      stats: {
        todaySupervisedWindows: 28,
        compliantWindows: 22,
        complianceRate: '78.57%',
        yesterdayComplianceRate: '82.61%',
        violationWindows: 1,
        avgRectificationDays: 1
      },
      
      // 窗口列表数据
      windowList: [
        {
          id: 1,
          name: '第一学生食堂-中式快餐窗口',
          location: '3号窗口',
          personInCharge: {
            name: '王强',
            phone: '138XXXX1234'
          },
          supervisionDate: '2026-02-09',
          supervisor: '李伟',
          category: '中式快餐',
          result: 'violation',
          rectificationStatus: 'in-progress',
          rectificationDays: 1
        },
        {
          id: 2,
          name: '第一学生食堂-西式快餐窗口',
          location: '5号窗口',
          personInCharge: {
            name: '张明',
            phone: '138XXXX2345'
          },
          supervisionDate: '2026-02-09',
          supervisor: '李伟',
          category: '西式快餐',
          result: 'compliant',
          rectificationStatus: 'none'
        },
        {
          id: 3,
          name: '第一学生食堂-面食窗口',
          location: '2号窗口',
          personInCharge: {
            name: '刘芳',
            phone: '138XXXX3456'
          },
          supervisionDate: '2026-02-08',
          supervisor: '王芳',
          category: '面食',
          result: 'compliant',
          rectificationStatus: 'none'
        },
        {
          id: 4,
          name: '第二学生食堂-早餐窗口',
          location: '1号窗口',
          personInCharge: {
            name: '陈刚',
            phone: '138XXXX4567'
          },
          supervisionDate: '2026-02-08',
          supervisor: '王芳',
          category: '早餐',
          result: 'rectifying',
          rectificationStatus: 'in-progress',
          rectificationDays: 3
        },
        {
          id: 5,
          name: '第二学生食堂-清真窗口',
          location: '4号窗口',
          personInCharge: {
            name: '马建国',
            phone: '138XXXX5678'
          },
          supervisionDate: '2026-02-07',
          supervisor: '张华',
          category: '清真食品',
          result: 'compliant',
          rectificationStatus: 'none'
        }
      ],
      
      // 窗口管理列表
      windowManagementList: [
        {
          id: 1,
          name: '中式快餐窗口',
          location: '第一学生食堂-3号窗口',
          personInCharge: {
            name: '王强',
            phone: '138XXXX1234'
          },
          category: '中式快餐',
          businessHours: '06:30-13:30, 16:30-19:00',
          operatingStatus: 'suspended'
        },
        {
          id: 2,
          name: '西式快餐窗口',
          location: '第一学生食堂-5号窗口',
          personInCharge: {
            name: '张明',
            phone: '138XXXX2345'
          },
          category: '西式快餐',
          businessHours: '06:30-13:30, 16:30-19:00',
          operatingStatus: 'operating'
        },
        {
          id: 3,
          name: '面食窗口',
          location: '第一学生食堂-2号窗口',
          personInCharge: {
            name: '刘芳',
            phone: '138XXXX3456'
          },
          category: '面食',
          businessHours: '06:30-13:30',
          operatingStatus: 'operating'
        },
        {
          id: 4,
          name: '早餐窗口',
          location: '第二学生食堂-1号窗口',
          personInCharge: {
            name: '陈刚',
            phone: '138XXXX4567'
          },
          category: '早餐',
          businessHours: '06:00-09:30',
          operatingStatus: 'operating'
        },
        {
          id: 5,
          name: '清真窗口',
          location: '第二学生食堂-4号窗口',
          personInCharge: {
            name: '马建国',
            phone: '138XXXX5678'
          },
          category: '清真食品',
          businessHours: '06:30-13:30, 16:30-19:00',
          operatingStatus: 'operating'
        },
        {
          id: 6,
          name: '素食窗口',
          location: '第三学生食堂-2号窗口',
          personInCharge: {
            name: '赵静',
            phone: '138XXXX6789'
          },
          category: '素食',
          businessHours: '06:30-13:30',
          operatingStatus: 'under-rectification'
        }
      ],
      
      // 窗口统计数据
      windowStats: {
        total: 28,
        operating: 25,
        suspended: 1,
        underRectification: 2
      },
      
      // 月度统计数据
      monthlyStats: {
        totalSupervisions: 156,
        compliantSupervisions: 132,
        violationSupervisions: 18,
        rectifiedSupervisions: 6,
        complianceRate: '84.62%'
      },
      
      // 违规类型分布
      violationTypes: [
        { name: '烹饪温度不达标', count: 8, percentage: '44.4%' },
        { name: '食材储存不规范', count: 5, percentage: '27.8%' },
        { name: '卫生清洁不到位', count: 3, percentage: '16.7%' },
        { name: '员工操作不规范', count: 2, percentage: '11.1%' }
      ],
      
      // 工作人员统计数据
      staffStats: {
        total: 86,
        onDuty: 78,
        certified: 82,
        trainingRequired: 12
      },
      
      // 工作人员列表
      staffList: [
        {
          id: 1,
          employeeId: 'XTSC001',
          name: '张芳',
          position: '仓管',
          responsibleWindow: '第一学生食堂-3号窗口',
          healthCertificateStatus: 'valid',
          certificateExpiryDate: '2026-12-31'
        },
        {
          id: 2,
          employeeId: 'XTSC002',
          name: '刘敏',
          position: '厨工',
          responsibleWindow: '第一学生食堂-3号窗口',
          healthCertificateStatus: 'valid',
          certificateExpiryDate: '2026-11-30'
        },
        {
          id: 3,
          employeeId: 'XTSC003',
          name: '陈明',
          position: '厨师',
          responsibleWindow: '第一学生食堂-3号窗口',
          healthCertificateStatus: 'expiring',
          certificateExpiryDate: '2026-03-15'
        },
        {
          id: 4,
          employeeId: 'XTSC004',
          name: '赵刚',
          position: '主厨',
          responsibleWindow: '第一学生食堂-3号窗口',
          healthCertificateStatus: 'valid',
          certificateExpiryDate: '2026-10-31'
        },
        {
          id: 5,
          employeeId: 'XTSC005',
          name: '周建华',
          position: '食堂主管',
          responsibleWindow: '第一学生食堂',
          healthCertificateStatus: 'valid',
          certificateExpiryDate: '2026-09-30'
        }
      ],
      
      // 监管员列表
      supervisors: [
        { id: 1, name: '李伟', code: 'XTSC2026001' },
        { id: 2, name: '王芳', code: 'XTSC2026002' },
        { id: 3, name: '张华', code: 'XTSC2026003' }
      ]
    };
  },
  
  methods: {
    // 切换菜单
    switchMenu(menuId) {
      this.activeMenu = menuId;
    },
    
    // 获取监督结果文本
    getResultText(result) {
      const resultMap = {
        'compliant': '合规',
        'violation': '违规',
        'rectifying': '整改中'
      };
      return resultMap[result] || '未知';
    },
    
    // 获取整改状态文本
    getRectificationText(status) {
      const statusMap = {
        'none': '无需整改',
        'in-progress': '整改中',
        'completed': '已整改'
      };
      return statusMap[status] || '未知';
    },
    
    // 获取营业状态文本
    getOperatingStatusText(status) {
      const statusMap = {
        'operating': '营业中',
        'suspended': '暂停营业',
        'under-rectification': '整改中'
      };
      return statusMap[status] || '未知';
    },
    
    // 选择窗口
    selectWindow(window) {
      console.log('选择窗口:', window);
      alert(`查看窗口详情: ${window.name}\n负责人: ${window.personInCharge.name}\n监督结果: ${this.getResultText(window.result)}`);
    },
    
    // 新增监督
    addNewSupervision() {
      alert('新增监督记录功能');
    },
    
    // 查看窗口详情
    viewWindowDetail(window) {
      alert(`查看窗口详情: ${window.name}\n位置: ${window.location}\n负责人: ${window.personInCharge.name}\n联系电话: ${window.personInCharge.phone}`);
    },
    
    // 编辑窗口信息
    editWindow(window) {
      alert(`编辑窗口信息: ${window.name}`);
    },
    
    // 切换窗口状态
    toggleWindowStatus(window) {
      const newStatus = window.operatingStatus === 'operating' ? 'suspended' : 'operating';
      window.operatingStatus = newStatus;
      alert(`${window.name} 已${newStatus === 'suspended' ? '暂停营业' : '恢复营业'}`);
    },
    
    // 查看工作人员详情
    viewStaffDetail(staff) {
      alert(`查看工作人员详情: ${staff.name}\n工号: ${staff.employeeId}\n岗位: ${staff.position}\n负责窗口: ${staff.responsibleWindow}`);
    },
    
    // 编辑工作人员信息
    editStaff(staff) {
      alert(`编辑工作人员信息: ${staff.name}`);
    },
    
    // 分配培训
    assignTraining(staff) {
      alert(`为 ${staff.name} 分配培训`);
    }
  },
  
  mounted() {
    // 组件加载时初始化数据
    console.log('学生食堂食品加工流程规范监督系统已加载');
  }
};
</script>

<style scoped>
.canteen-supervision-system {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  background-color: #f5f7fa;
}

/* 顶部标题栏样式 */
.top-bar {
  background-color: #fff;
  padding: 15px 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.system-title h1 {
  margin: 0;
  font-size: 22px;
  color: #1a2b4c;
  font-weight: 600;
}

.supervisor-info {
  display: flex;
  gap: 30px;
}

.info-item {
  font-size: 14px;
  color: #666;
}

.info-item .label {
  color: #999;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}

/* 主内容区域 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边菜单样式 */
.sidebar {
  width: 240px;
  background-color: #1a2b4c;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.user-profile {
  padding: 25px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #2a3b5c;
}

.avatar {
  width: 50px;
  height: 50px;
  background-color: #2a3b5c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
}

.user-role {
  font-size: 12px;
  color: #a8b5d1;
}

.menu {
  list-style: none;
  padding: 20px 0;
  margin: 0;
  flex: 1;
}

.menu li {
  padding: 15px 25px;
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
  border-left: 4px solid #ff6b35;
  color: #ff6b35;
}

.menu-icon {
  margin-right: 12px;
  font-size: 18px;
}

.menu span {
  font-size: 16px;
}

.system-info {
  padding: 20px;
  border-top: 1px solid #2a3b5c;
  font-size: 12px;
  color: #a8b5d1;
}

.info-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #fff;
}

.info-content p {
  margin: 5px 0;
}

/* 主内容区域样式 */
.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 监督概览页面样式 */
.overview-page {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 数据统计卡片 */
.stats-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 10px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.stat-header h3 {
  margin: 0;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.stat-trend {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.stat-trend.positive {
  background-color: #f0f9eb;
  color: #67c23a;
}

.stat-trend.negative {
  background-color: #fef0f0;
  color: #f56c6c;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a2b4c;
  margin-bottom: 5px;
}

.stat-value.warning {
  color: #f56c6c;
}

.stat-desc {
  font-size: 14px;
  color: #909399;
}

/* 监督区域样式 */
.supervision-section {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.section-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.quick-filters {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-title {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.filter-tags {
  display: flex;
  gap: 10px;
}

.filter-tag {
  padding: 5px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 15px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tag.active {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.filter-tag:hover {
  background-color: #f5f7fa;
}

/* 当前监督区域 */
.current-supervision {
  margin-top: 20px;
}

.current-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.current-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.window-status {
  padding: 6px 15px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 500;
}

.window-status.status-compliant {
  background-color: #f0f9eb;
  color: #67c23a;
}

.window-status.status-violation {
  background-color: #fef0f0;
  color: #f56c6c;
}

/* 流程监督卡片 */
.process-supervision {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.process-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.process-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.process-card-violation {
  grid-column: span 2;
  border-color: #fde2e2;
  background-color: #fef0f0;
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.process-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.process-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.process-status.status-compliant {
  background-color: #f0f9eb;
  color: #67c23a;
}

.process-status.status-violation {
  background-color: #fef0f0;
  color: #f56c6c;
}

.process-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  font-size: 14px;
}

.detail-label {
  color: #606266;
  min-width: 80px;
}

.detail-value {
  color: #303133;
  font-weight: 500;
  flex: 1;
}

/* 违规详情样式 */
.violation-details {
  margin-top: 15px;
  padding: 15px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #fde2e2;
}

.violation-title {
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #fde2e2;
}

.violation-item {
  margin-bottom: 12px;
  font-size: 14px;
  display: flex;
}

.violation-label {
  color: #f56c6c;
  min-width: 80px;
  font-weight: 500;
}

.violation-content {
  color: #303133;
  flex: 1;
  line-height: 1.5;
}

.violation-persons {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #fde2e2;
}

.person-item {
  margin-bottom: 8px;
  font-size: 14px;
  display: flex;
}

.person-label {
  color: #606266;
  min-width: 100px;
}

.person-content {
  color: #303133;
  flex: 1;
}

/* 窗口监督列表样式 */
.window-list-section {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.list-actions {
  display: flex;
  gap: 10px;
}

.export-btn, .add-btn {
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

.export-btn:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.add-btn {
  background-color: #ff6b35;
  color: white;
  border-color: #ff6b35;
}

.add-btn:hover {
  background-color: #ff5a1f;
}

/* 表格样式 */
.window-table {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 20px;
}

.table-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
  color: #303133;
}

.header-cell {
  padding: 15px 20px;
  text-align: left;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s;
  cursor: pointer;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.window-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.window-location {
  font-size: 12px;
  color: #909399;
}

.person-info, .supervision-info {
  display: flex;
  flex-direction: column;
}

.person-name, .supervision-date {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.person-phone, .supervision-person {
  font-size: 12px;
  color: #909399;
}

.category-tag {
  display: inline-block;
  padding: 4px 10px;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.result-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.result-badge.status-compliant {
  background-color: #f0f9eb;
  color: #67c23a;
}

.result-badge.status-violation {
  background-color: #fef0f0;
  color: #f56c6c;
}

.result-badge.status-rectifying {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.rectification-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
  margin-bottom: 5px;
}

.rectification-status.status-none {
  background-color: #f0f9eb;
  color: #67c23a;
}

.rectification-status.status-in-progress {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.rectification-status.status-completed {
  background-color: #ecf5ff;
  color: #409eff;
}

.rectification-days {
  font-size: 12px;
  color: #f56c6c;
}

/* 窗口管理页面样式 */
.window-management-page, .data-statistics-page, .staff-management-page, .settings-page {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

.window-management-page h2, .data-statistics-page h2, .staff-management-page h2, .settings-page h2 {
  margin: 0 0 25px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.window-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.overview-card {
  flex: 1;
  max-width: 400px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
}

.overview-card h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a2b4c;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.window-search {
  display: flex;
  align-items: center;
  gap: 10px;
}

.window-search input {
  padding: 10px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
  outline: none;
  transition: border-color 0.3s;
}

.window-search input:focus {
  border-color: #ff6b35;
}

.search-btn {
  padding: 10px 20px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #ff5a1f;
}

/* 窗口卡片样式 */
.window-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.window-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.window-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.window-card.status-operating {
  border-left: 4px solid #67c23a;
}

.window-card.status-suspended {
  border-left: 4px solid #f56c6c;
}

.window-card.status-under-rectification {
  border-left: 4px solid #e6a23c;
}

.window-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.window-card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.window-card .window-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.window-card .window-status.status-operating {
  background-color: #f0f9eb;
  color: #67c23a;
}

.window-card .window-status.status-suspended {
  background-color: #fef0f0;
  color: #f56c6c;
}

.window-card .window-status.status-under-rectification {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.window-info {
  margin-bottom: 20px;
}

.window-info .info-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.window-info .label {
  color: #606266;
  min-width: 80px;
}

.window-info .value {
  color: #303133;
  font-weight: 500;
  flex: 1;
}

.window-actions {
  display: flex;
  gap: 10px;
}

.window-actions .action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.detail-btn {
  background-color: #ecf5ff;
  color: #409EFF;
}

.detail-btn:hover {
  background-color: #d9ecff;
}

.edit-btn {
  background-color: #f0f9eb;
  color: #67C23A;
}

.edit-btn:hover {
  background-color: #e1f3d8;
}

.suspend-btn {
  background-color: #fef0f0;
  color: #F56C6C;
}

.suspend-btn:hover {
  background-color: #fde2e2;
}

.resume-btn {
  background-color: #f0f9eb;
  color: #67C23A;
}

.resume-btn:hover {
  background-color: #e1f3d8;
}

/* 数据统计页面样式 */
.data-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.data-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
}

.data-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.data-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-details .detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-details .label {
  color: #606266;
  font-size: 14px;
}

.data-details .value {
  font-weight: 600;
  font-size: 16px;
}

.value-compliant {
  color: #67c23a;
}

.value-violation {
  color: #f56c6c;
}

.value-rectified {
  color: #409eff;
}

.value-rate {
  color: #ff6b35;
  font-size: 20px !important;
}

.violation-types {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.violation-type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.violation-type-item:last-child {
  border-bottom: none;
}

.type-name {
  flex: 2;
  color: #303133;
  font-weight: 500;
}

.type-count {
  flex: 1;
  text-align: center;
  color: #606266;
}

.type-percentage {
  flex: 1;
  text-align: right;
  color: #ff6b35;
  font-weight: 600;
}

.chart-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.chart-placeholder {
  height: 300px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.chart-mock {
  text-align: center;
  color: #909399;
}

.chart-title {
  margin-bottom: 30px;
  font-size: 16px;
  color: #606266;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 15px;
  height: 150px;
  margin-bottom: 20px;
}

.chart-bar {
  width: 30px;
  background-color: #ff6b35;
  border-radius: 3px 3px 0 0;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  color: #909399;
}

/* 工作人员管理页面样式 */
.staff-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.staff-stats .stat-card {
  background-color: white;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
}

.staff-stats .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.staff-stats .stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a2b4c;
  margin-bottom: 10px;
}

.staff-stats .stat-label {
  font-size: 14px;
  color: #909399;
}

.staff-table {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.position-tag {
  display: inline-block;
  padding: 4px 10px;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.health-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.health-status.status-valid {
  background-color: #f0f9eb;
  color: #67c23a;
}

.health-status.status-expiring {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.expiry-date {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 5px;
}

.staff-actions {
  display: flex;
  gap: 8px;
}

.staff-actions .action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.staff-actions .view-btn {
  background-color: #ecf5ff;
  color: #409EFF;
}

.staff-actions .view-btn:hover {
  background-color: #d9ecff;
}

.staff-actions .edit-btn {
  background-color: #f0f9eb;
  color: #67C23A;
}

.staff-actions .edit-btn:hover {
  background-color: #e1f3d8;
}

.staff-actions .training-btn {
  background-color: #fdf6ec;
  color: #E6A23C;
}

.staff-actions .training-btn:hover {
  background-color: #faecd8;
}

/* 系统设置页面样式 */
.settings-section {
  margin-bottom: 30px;
}

.settings-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.system-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.system-info .info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.system-info .label {
  color: #606266;
  font-size: 14px;
}

.system-info .value {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.supervisor-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.supervisor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  transition: all 0.3s;
}

.supervisor-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.supervisor-info {
  flex: 1;
}

.supervisor-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.supervisor-code {
  font-size: 12px;
  color: #909399;
}

.supervisor-actions .action-btn {
  padding: 8px 20px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.supervisor-actions .action-btn:hover {
  background-color: #ff5a1f;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-cards, .staff-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .process-supervision {
    grid-template-columns: 1fr;
  }
  
  .process-card-violation {
    grid-column: span 1;
  }
  
  .data-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .top-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
  }
  
  .supervisor-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .stats-cards, .staff-stats {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .quick-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .filter-tags {
    flex-wrap: wrap;
  }
  
  .window-overview {
    flex-direction: column;
    gap: 20px;
  }
  
  .overview-card {
    max-width: 100%;
  }
  
  .window-search input {
    width: 100%;
  }
  
  .window-cards {
    grid-template-columns: 1fr;
  }
  
  .system-info {
    grid-template-columns: 1fr;
  }
  
  .table-header, .table-row {
    flex-direction: column;
  }
  
  .header-cell, .table-cell {
    width: 100% !important;
    padding: 10px 15px;
  }
}
</style>