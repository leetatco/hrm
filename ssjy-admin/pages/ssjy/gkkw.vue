<template>
  <div id="customer-taste-analysis">
    <!-- 顶部导航栏 -->
    <el-header class="main-header">
      <div class="header-left">
        <h1 class="system-title">顾客口味消费分析系统</h1>
      </div>
      <div class="header-right">
        <el-input
          placeholder="搜索..."
          prefix-icon="el-icon-search"
          class="search-input"
        ></el-input>
        <div class="admin-info">
          <el-avatar :size="40" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
          <span class="admin-name">管理员</span>
        </div>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 左侧导航栏 -->
      <el-aside width="220px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="#1f2d3d"
          text-color="#b7c0cd"
          active-text-color="#409EFF"
          @select="handleMenuSelect"
        >
          <div class="menu-title">导航菜单</div>
          
          <el-menu-item index="dashboard">
            <i class="el-icon-data-analysis"></i>
            <span slot="title">数据概览</span>
          </el-menu-item>
          
          <el-menu-item index="taste-analysis">
            <i class="el-icon-pie-chart"></i>
            <span slot="title">口味分析</span>
          </el-menu-item>
          
          <el-menu-item index="consumption-trend">
            <i class="el-icon-trend-charts"></i>
            <span slot="title">消费趋势</span>
          </el-menu-item>
          
          <el-menu-item index="dish-ranking">
            <i class="el-icon-s-data"></i>
            <span slot="title">菜品排行</span>
          </el-menu-item>
          
          <el-menu-item index="customer-portrait">
            <i class="el-icon-user"></i>
            <span slot="title">顾客画像</span>
          </el-menu-item>
          
          <el-menu-item index="system-settings">
            <i class="el-icon-setting"></i>
            <span slot="title">系统设置</span>
          </el-menu-item>
          
          <div class="time-range-section">
            <div class="section-title">数据时间范围</div>
            <div class="time-options">
              <el-button 
                :type="timeRange === '30days' ? 'primary' : 'text'" 
                @click="changeTimeRange('30days')"
                class="time-btn"
              >
                近30天
              </el-button>
              <el-button 
                :type="timeRange === '90days' ? 'primary' : 'text'" 
                @click="changeTimeRange('90days')"
                class="time-btn"
              >
                近90天
              </el-button>
              <el-button 
                :type="timeRange === 'year' ? 'primary' : 'text'" 
                @click="changeTimeRange('year')"
                class="time-btn"
              >
                今年
              </el-button>
              <el-button 
                :type="timeRange === 'custom' ? 'primary' : 'text'" 
                @click="changeTimeRange('custom')"
                class="time-btn"
              >
                自定义
              </el-button>
            </div>
          </div>
        </el-menu>
      </el-aside>

      <!-- 右侧主体内容 -->
      <el-main class="main-content">
        <!-- 数据概览页面（保持不变） -->
        <div v-if="activeMenu === 'dashboard'" class="dashboard-content">
          <div class="data-overview">
            <h2 class="section-title">数据概览</h2>
            
            <!-- 数据卡片 -->
            <div class="data-cards">
              <el-card class="data-card">
                <div class="card-content">
                  <div class="card-title">总消费顾客数</div>
                  <div class="card-value">5,842</div>
                  <div class="card-change positive">
                    <i class="el-icon-top"></i>
                    <span>↑12.5%较上月</span>
                  </div>
                </div>
              </el-card>
              
              <el-card class="data-card">
                <div class="card-content">
                  <div class="card-title">总消费金额</div>
                  <div class="card-value">￥896,521</div>
                  <div class="card-change positive">
                    <i class="el-icon-top"></i>
                    <span>↑8.2%较上月</span>
                  </div>
                </div>
              </el-card>
              
              <el-card class="data-card">
                <div class="card-content">
                  <div class="card-title">热门口味数</div>
                  <div class="card-value">28</div>
                  <div class="card-change neutral">
                    <i class="el-icon-minus"></i>
                    <span>-0%较上月</span>
                  </div>
                </div>
              </el-card>
              
              <el-card class="data-card">
                <div class="card-content">
                  <div class="card-title">复购率</div>
                  <div class="card-value">68.3%</div>
                  <div class="card-change positive">
                    <i class="el-icon-top"></i>
                    <span>↑3.2%较上月</span>
                  </div>
                </div>
              </el-card>
            </div>
            
            <!-- 图表区域 -->
            <div class="charts-section">
              <!-- 口味偏好分布 -->
              <el-card class="chart-card taste-chart">
                <div slot="header" class="chart-header">
                  <span>顾客口味偏好分布</span>
                  <el-select v-model="tasteChartType" placeholder="选择口味" size="mini" class="chart-select">
                    <el-option label="全部口味" value="all"></el-option>
                    <el-option label="麻辣" value="spicy"></el-option>
                    <el-option label="香辣" value="savory"></el-option>
                    <el-option label="酸甜" value="sweet"></el-option>
                  </el-select>
                </div>
                <div class="chart-container">
                  <div ref="tasteChart" class="chart"></div>
                  <div class="chart-legend">
                    <div class="legend-item" v-for="item in tasteData" :key="item.name">
                      <div class="legend-color" :style="{backgroundColor: item.color}"></div>
                      <div class="legend-name">{{item.name}}</div>
                      <div class="legend-percent">{{item.percent}}%</div>
                    </div>
                  </div>
                </div>
              </el-card>
              
              <!-- 口味消费趋势 -->
              <el-card class="chart-card trend-chart">
                <div slot="header" class="chart-header">
                  <span>口味消费趋势</span>
                  <div class="trend-options">
                    <el-radio-group v-model="trendTimeRange" size="mini">
                      <el-radio-button label="月"></el-radio-button>
                      <el-radio-button label="周"></el-radio-button>
                      <el-radio-button label="日"></el-radio-button>
                    </el-radio-group>
                  </div>
                </div>
                <div class="chart-container">
                  <div ref="trendChart" class="chart"></div>
                </div>
              </el-card>
            </div>
            
            <!-- 热门菜品排行 -->
            <el-card class="ranking-card">
              <div slot="header" class="ranking-header">
                <span>热门菜品排行</span>
                <el-button type="text" class="view-more">查看更多</el-button>
              </div>
              <el-table
                :data="dishRanking"
                style="width: 100%"
                :header-cell-style="{background: '#f5f7fa', color: '#606266'}"
              >
                <el-table-column prop="rank" label="排名" width="80" align="center">
                  <template slot-scope="scope">
                    <div class="rank-cell" :class="'rank-' + scope.row.rank">
                      {{scope.row.rank}}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="dishName" label="菜品名称" min-width="180"></el-table-column>
                <el-table-column prop="taste" label="口味" width="100"></el-table-column>
                <el-table-column prop="sales" label="销量" width="120" align="right"></el-table-column>
                <el-table-column prop="salesAmount" label="销售额" width="140" align="right">
                  <template slot-scope="scope">
                    <span class="sales-amount">￥{{scope.row.salesAmount.toLocaleString()}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="growth" label="增长率" width="120" align="right">
                  <template slot-scope="scope">
                    <span :class="scope.row.growth >= 0 ? 'positive' : 'negative'">
                      {{scope.row.growth >= 0 ? '+' : ''}}{{scope.row.growth}}%
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>
        
        <!-- 口味分析页面 - 已添加数据展示 -->
        <div v-if="activeMenu === 'taste-analysis'" class="page-content taste-analysis-page">
          <h2 class="page-title">口味分析</h2>
          <p class="page-desc">分析各口味消费占比、顾客偏好变化、地域分布和季节影响等数据</p>
          
          <!-- 口味分析数据卡片 -->
          <div class="taste-cards">
            <el-card class="taste-stat-card">
              <div class="card-content">
                <div class="card-title">口味偏好统计</div>
                <div class="stat-grid">
                  <div class="stat-item" v-for="item in tasteDetailData" :key="item.name">
                    <div class="stat-name">{{item.name}}</div>
                    <div class="stat-value">{{item.percent}}%</div>
                    <div class="stat-change" :class="item.change >= 0 ? 'positive' : 'negative'">
                      <i :class="item.change >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                      <span>{{item.change >= 0 ? '+' : ''}}{{item.change}}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
            
            <el-card class="taste-region-card">
              <div slot="header" class="card-header">
                <span>口味地域分布</span>
              </div>
              <div class="region-table">
                <el-table
                  :data="regionTasteData"
                  style="width: 100%"
                  height="300"
                  :header-cell-style="{background: '#f5f7fa', color: '#606266'}"
                >
                  <el-table-column prop="region" label="区域" width="120"></el-table-column>
                  <el-table-column prop="spicy" label="麻辣" width="100" align="center">
                    <template slot-scope="scope">
                      <span class="taste-percent spicy">{{scope.row.spicy}}%</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="savory" label="香辣" width="100" align="center">
                    <template slot-scope="scope">
                      <span class="taste-percent savory">{{scope.row.savory}}%</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="sweet" label="酸甜" width="100" align="center">
                    <template slot-scope="scope">
                      <span class="taste-percent sweet">{{scope.row.sweet}}%</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="light" label="清淡" width="100" align="center">
                    <template slot-scope="scope">
                      <span class="taste-percent light">{{scope.row.light}}%</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="other" label="其他" width="100" align="center">
                    <template slot-scope="scope">
                      <span class="taste-percent other">{{scope.row.other}}%</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </div>
          
          <!-- 季节口味趋势 -->
          <el-card class="season-taste-card">
            <div slot="header" class="card-header">
              <span>季节口味趋势</span>
              <el-select v-model="selectedSeason" placeholder="选择季节" size="mini" class="season-select">
                <el-option label="春季" value="spring"></el-option>
                <el-option label="夏季" value="summer"></el-option>
                <el-option label="秋季" value="autumn"></el-option>
                <el-option label="冬季" value="winter"></el-option>
              </el-select>
            </div>
            <div class="season-content">
              <div class="season-chart-placeholder">
                <i class="el-icon-pie-chart chart-icon"></i>
                <p>季节口味分布图表</p>
              </div>
              <div class="season-legend">
                <div class="legend-item" v-for="item in seasonTasteData" :key="item.name">
                  <div class="legend-color" :style="{backgroundColor: item.color}"></div>
                  <div class="legend-name">{{item.name}}</div>
                  <div class="legend-percent">{{item.percent}}%</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        
        <!-- 消费趋势页面 - 已添加数据展示 -->
        <div v-if="activeMenu === 'consumption-trend'" class="page-content consumption-trend-page">
          <h2 class="page-title">消费趋势</h2>
          <p class="page-desc">分析消费时间趋势、节假日影响、消费时段分布等数据</p>
          
          <!-- 时间趋势图表 -->          
          
          <!-- 时段分布和节假日数据 -->
          <div class="trend-data-cards">
            <el-card class="time-distribution-card">
              <div slot="header" class="card-header">
                <span>消费时段分布</span>
              </div>
              <div class="time-distribution">
                <div class="time-item" v-for="item in timeDistribution" :key="item.time">
                  <div class="time-label">{{item.time}}</div>
                  <div class="time-bar">
                    <div class="bar-fill" :style="{width: item.percent + '%'}"></div>
                  </div>
                  <div class="time-percent">{{item.percent}}%</div>
                </div>
              </div>
            </el-card>
            
            <el-card class="holiday-data-card">
              <div slot="header" class="card-header">
                <span>节假日消费数据</span>
              </div>
              <div class="holiday-table">
                <el-table
                  :data="holidayData"
                  style="width: 100%"
                  :header-cell-style="{background: '#f5f7fa', color: '#606266'}"
                >
                  <el-table-column prop="holiday" label="节假日" width="120"></el-table-column>
                  <el-table-column prop="avgConsumption" label="人均消费" width="120" align="right">
                    <template slot-scope="scope">
                      <span>￥{{scope.row.avgConsumption}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="growth" label="增长率" width="100" align="right">
                    <template slot-scope="scope">
                      <span :class="scope.row.growth >= 0 ? 'positive' : 'negative'">
                        {{scope.row.growth >= 0 ? '+' : ''}}{{scope.row.growth}}%
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="tastePreference" label="口味偏好" width="120"></el-table-column>
                </el-table>
              </div>
            </el-card>
          </div>
        </div>
        
        <!-- 菜品排行页面 - 已添加数据展示 -->
        <div v-if="activeMenu === 'dish-ranking'" class="page-content dish-ranking-page">
          <h2 class="page-title">菜品排行</h2>
          <p class="page-desc">菜品销售排行、各品类排行、新菜品表现等详细数据</p>
          
          <!-- 菜品分类筛选 -->
          <div class="dish-filter">
            <el-radio-group v-model="dishCategory" size="small">
              <el-radio-button label="全部品类"></el-radio-button>
              <el-radio-button label="热菜"></el-radio-button>
              <el-radio-button label="凉菜"></el-radio-button>
              <el-radio-button label="主食"></el-radio-button>
              <el-radio-button label="饮品"></el-radio-button>
            </el-radio-group>
            
            <el-select v-model="selectedTaste" placeholder="选择口味" size="small" class="taste-select">
              <el-option label="全部口味" value="all"></el-option>
              <el-option label="麻辣" value="spicy"></el-option>
              <el-option label="香辣" value="savory"></el-option>
              <el-option label="酸甜" value="sweet"></el-option>
              <el-option label="清淡" value="light"></el-option>
            </el-select>
          </div>
          
          <!-- 菜品排行数据 -->
          <div class="dish-ranking-cards">
            <el-card class="dish-ranking-table-card">
              <div slot="header" class="card-header">
                <span>菜品销售排行</span>
                <span class="data-time">数据更新时间: 2026-03-16 18:30</span>
              </div>
              <el-table
                :data="detailedDishRanking"
                style="width: 100%"
                :header-cell-style="{background: '#f5f7fa', color: '#606266'}"
              >
                <el-table-column prop="rank" label="排名" width="80" align="center">
                  <template slot-scope="scope">
                    <div class="rank-cell" :class="'rank-' + scope.row.rank">
                      {{scope.row.rank}}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="dishName" label="菜品名称" min-width="180"></el-table-column>
                <el-table-column prop="category" label="品类" width="100"></el-table-column>
                <el-table-column prop="taste" label="口味" width="100"></el-table-column>
                <el-table-column prop="price" label="单价" width="100" align="right">
                  <template slot-scope="scope">
                    <span>￥{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="sales" label="销量" width="120" align="right"></el-table-column>
                <el-table-column prop="salesAmount" label="销售额" width="140" align="right">
                  <template slot-scope="scope">
                    <span class="sales-amount">￥{{scope.row.salesAmount.toLocaleString()}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="growth" label="增长率" width="120" align="right">
                  <template slot-scope="scope">
                    <span :class="scope.row.growth >= 0 ? 'positive' : 'negative'">
                      {{scope.row.growth >= 0 ? '+' : ''}}{{scope.row.growth}}%
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
            
            <el-card class="dish-category-card">
              <div slot="header" class="card-header">
                <span>品类销售占比</span>
              </div>
              <div class="category-chart-placeholder">
                <i class="el-icon-pie-chart chart-icon"></i>
                <p>品类销售占比饼图</p>
              </div>
              <div class="category-legend">
                <div class="legend-item" v-for="item in categoryData" :key="item.name">
                  <div class="legend-color" :style="{backgroundColor: item.color}"></div>
                  <div class="legend-name">{{item.name}}</div>
                  <div class="legend-percent">{{item.percent}}%</div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
        
        <!-- 顾客画像页面 - 已添加数据展示 -->
        <div v-if="activeMenu === 'customer-portrait'" class="page-content customer-portrait-page">
          <h2 class="page-title">顾客画像</h2>
          <p class="page-desc">顾客年龄分布、性别比例、消费习惯、顾客分群等详细分析</p>
          
          <!-- 顾客画像数据卡片 -->
          <div class="portrait-cards">
            <el-card class="demographic-card">
              <div slot="header" class="card-header">
                <span>顾客人口统计</span>
              </div>
              <div class="demographic-content">
                <div class="gender-distribution">
                  <h3>性别比例</h3>
                  <div class="gender-chart">
                    <div class="gender-item male">
                      <div class="gender-label">男性</div>
                      <div class="gender-bar">
                        <div class="bar-fill" style="width: 58%"></div>
                      </div>
                      <div class="gender-percent">58%</div>
                    </div>
                    <div class="gender-item female">
                      <div class="gender-label">女性</div>
                      <div class="gender-bar">
                        <div class="bar-fill" style="width: 42%"></div>
                      </div>
                      <div class="gender-percent">42%</div>
                    </div>
                  </div>
                </div>
                
                <div class="age-distribution">
                  <h3>年龄分布</h3>
                  <div class="age-data">
                    <div class="age-item" v-for="item in ageData" :key="item.range">
                      <div class="age-range">{{item.range}}</div>
                      <div class="age-bar">
                        <div class="bar-fill" :style="{width: item.percent + '%'}"></div>
                      </div>
                      <div class="age-percent">{{item.percent}}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
            
            <el-card class="customer-group-card">
              <div slot="header" class="card-header">
                <span>顾客分群</span>
              </div>
              <div class="group-table">
                <el-table
                  :data="customerGroups"
                  style="width: 100%"
                  :header-cell-style="{background: '#f5f7fa', color: '#606266'}"
                >
                  <el-table-column prop="group" label="顾客分群" width="150"></el-table-column>
                  <el-table-column prop="count" label="人数" width="100" align="right"></el-table-column>
                  <el-table-column prop="percentage" label="占比" width="100" align="right">
                    <template slot-scope="scope">
                      <span>{{scope.row.percentage}}%</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="avgConsumption" label="人均消费" width="120" align="right">
                    <template slot-scope="scope">
                      <span>￥{{scope.row.avgConsumption}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="tastePreference" label="口味偏好" width="150"></el-table-column>
                </el-table>
              </div>
            </el-card>
          </div>
          
          <!-- 消费习惯分析 -->
          <el-card class="consumption-habit-card">
            <div slot="header" class="card-header">
              <span>消费习惯分析</span>
            </div>
            <div class="habit-content">
              <div class="habit-item" v-for="item in consumptionHabits" :key="item.name">
                <div class="habit-name">{{item.name}}</div>
                <div class="habit-value">{{item.value}}</div>
                <div class="habit-desc">{{item.desc}}</div>
              </div>
            </div>
          </el-card>
        </div>
        
        <!-- 系统设置页面 - 保持原有功能 -->
        <div v-if="activeMenu === 'system-settings'" class="page-content system-settings-page">
          <h2 class="page-title">系统设置</h2>
          <p class="page-desc">系统参数配置、用户权限管理、数据导出等设置功能</p>
          
          <div class="settings-cards">
            <el-card class="settings-card">
              <div slot="header" class="card-header">
                <span>系统参数配置</span>
              </div>
              <div class="settings-form">
                <el-form label-width="120px">
                  <el-form-item label="数据更新频率">
                    <el-select v-model="updateFrequency" placeholder="请选择" style="width: 200px;">
                      <el-option label="实时更新" value="realtime"></el-option>
                      <el-option label="每小时更新" value="hourly"></el-option>
                      <el-option label="每日更新" value="daily"></el-option>
                      <el-option label="每周更新" value="weekly"></el-option>
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="数据保留时间">
                    <el-select v-model="dataRetention" placeholder="请选择" style="width: 200px;">
                      <el-option label="3个月" value="3months"></el-option>
                      <el-option label="6个月" value="6months"></el-option>
                      <el-option label="1年" value="1year"></el-option>
                      <el-option label="2年" value="2years"></el-option>
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="报表导出格式">
                    <el-checkbox-group v-model="exportFormats">
                      <el-checkbox label="Excel"></el-checkbox>
                      <el-checkbox label="PDF"></el-checkbox>
                  <el-checkbox label="CSV"></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveSettings">保存设置</el-button>
                <el-button @click="resetSettings">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
        
        <el-card class="settings-card">
          <div slot="header" class="card-header">
            <span>用户权限管理</span>
          </div>
          <div class="user-table">
            <el-table
              :data="userList"
              style="width: 100%"
              :header-cell-style="{background: '#f5f7fa', color: '#606266'}"
            >
              <el-table-column prop="username" label="用户名" width="150"></el-table-column>
              <el-table-column prop="role" label="角色" width="120">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.role === '管理员' ? 'primary' : 'success'" size="small">
                    {{scope.row.role}}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lastLogin" label="最后登录" width="180"></el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template slot-scope="scope">
                  <el-button type="text" size="small">编辑</el-button>
                  <el-button type="text" size="small" style="color: #F56C6C;">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="add-user-btn">
            <el-button type="primary" icon="el-icon-plus" size="small">添加用户</el-button>
          </div>
        </el-card>
      </div>
    </div>
  </el-main>
</el-container>
</div>
</template>

<script>
export default {
  name: 'CustomerTasteAnalysis',
  data() {
    return {
      activeMenu: 'dashboard',
      timeRange: '30days',
      tasteChartType: 'all',
      trendTimeRange: '月',
      trendViewType: '月度',
      dishCategory: '全部品类',
      selectedTaste: 'all',
      selectedSeason: 'spring',
      updateFrequency: 'daily',
      dataRetention: '1year',
      exportFormats: ['Excel', 'PDF'],
      
      // 口味偏好数据
      tasteData: [
        { name: '麻辣', value: 355536, percent: 35, color: '#E74C3C' },
        { name: '香辣', value: 284429, percent: 28, color: '#E67E22' },
        { name: '酸甜', value: 196204, percent: 19, color: '#F1C40F' },
        { name: '清淡', value: 84520, percent: 8, color: '#2ECC71' },
        { name: '其他', value: 81832, percent: 8, color: '#3498DB' }
      ],
      
      // 口味分析页面数据
      tasteDetailData: [
        { name: '麻辣', percent: 35, change: 5.2 },
        { name: '香辣', percent: 28, change: 2.8 },
        { name: '酸甜', percent: 19, change: -1.5 },
        { name: '清淡', percent: 8, change: 0.8 },
        { name: '咸鲜', percent: 6, change: 1.2 },
        { name: '酸辣', percent: 4, change: 3.1 }
      ],
      
      // 口味地域分布数据
      regionTasteData: [
        { region: '华北地区', spicy: 42, savory: 25, sweet: 15, light: 10, other: 8 },
        { region: '华东地区', spicy: 38, savory: 30, sweet: 18, light: 8, other: 6 },
        { region: '华南地区', spicy: 28, savory: 22, sweet: 25, light: 15, other: 10 },
        { region: '华中地区', spicy: 45, savory: 28, sweet: 12, light: 8, other: 7 },
        { region: '西南地区', spicy: 58, savory: 25, sweet: 8, light: 5, other: 4 },
        { region: '西北地区', spicy: 52, savory: 30, sweet: 6, light: 7, other: 5 }
      ],
      
      // 季节口味数据
      seasonTasteData: [
        { name: '麻辣', percent: 38, color: '#E74C3C' },
        { name: '香辣', percent: 30, color: '#E67E22' },
        { name: '酸甜', percent: 22, color: '#F1C40F' },
        { name: '清淡', percent: 10, color: '#2ECC71' }
      ],
      
      // 消费趋势页面数据
      trendData: {
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        values: [125, 132, 146, 158, 167, 189, 201, 198, 176, 165, 154, 142],
        lastYear: [98, 105, 112, 120, 128, 135, 142, 138, 129, 118, 107, 96]
      },
      
      // 消费时段分布
      timeDistribution: [
        { time: '早餐(6-10点)', percent: 12 },
        { time: '午餐(11-14点)', percent: 35 },
        { time: '下午茶(15-17点)', percent: 8 },
        { time: '晚餐(18-21点)', percent: 40 },
        { time: '夜宵(22-2点)', percent: 5 }
      ],
      
      // 节假日消费数据
      holidayData: [
        { holiday: '春节', avgConsumption: 245, growth: 35, tastePreference: '麻辣/香辣' },
        { holiday: '元宵节', avgConsumption: 168, growth: 12, tastePreference: '甜味' },
        { holiday: '端午节', avgConsumption: 156, growth: 8, tastePreference: '咸鲜' },
        { holiday: '中秋节', avgConsumption: 189, growth: 15, tastePreference: '甜味/咸鲜' },
        { holiday: '国庆节', avgConsumption: 178, growth: 10, tastePreference: '麻辣/香辣' }
      ],
      
      // 菜品排行数据
      dishRanking: [
        { rank: 1, dishName: '麻辣小龙虾', taste: '麻辣', sales: 12589, salesAmount: 462204, growth: 12.5 },
        { rank: 2, dishName: '香辣烤鱼', taste: '香辣', sales: 9876, salesAmount: 395040, growth: 8.7 },
        { rank: 3, dishName: '糖醋里脊', taste: '酸甜', sales: 8452, salesAmount: 287368, growth: 5.3 },
        { rank: 4, dishName: '酸菜鱼', taste: '酸辣', sales: 7321, salesAmount: 263556, growth: 15.2 },
        { rank: 5, dishName: '宫保鸡丁', taste: '麻辣', sales: 6895, salesAmount: 206850, growth: 3.8 },
        { rank: 6, dishName: '水煮肉片', taste: '麻辣', sales: 6543, salesAmount: 261720, growth: 9.1 },
        { rank: 7, dishName: '鱼香肉丝', taste: '酸甜', sales: 5987, salesAmount: 179610, growth: 7.4 },
        { rank: 8, dishName: '回锅肉', taste: '香辣', sales: 5234, salesAmount: 183190, growth: 4.2 },
        { rank: 9, dishName: '麻婆豆腐', taste: '麻辣', sales: 4876, salesAmount: 97520, growth: 6.9 },
        { rank: 10, dishName: '清蒸鲈鱼', taste: '清淡', sales: 4321, salesAmount: 172840, growth: 2.5 }
      ],
      
      // 详细菜品排行数据
      detailedDishRanking: [
        { rank: 1, dishName: '麻辣小龙虾', category: '热菜', taste: '麻辣', price: 88, sales: 12589, salesAmount: 462204, growth: 12.5 },
        { rank: 2, dishName: '香辣烤鱼', category: '热菜', taste: '香辣', price: 128, sales: 9876, salesAmount: 395040, growth: 8.7 },
        { rank: 3, dishName: '糖醋里脊', category: '热菜', taste: '酸甜', price: 48, sales: 8452, salesAmount: 287368, growth: 5.3 },
        { rank: 4, dishName: '酸菜鱼', category: '热菜', taste: '酸辣', price: 78, sales: 7321, salesAmount: 263556, growth: 15.2 },
        { rank: 5, dishName: '宫保鸡丁', category: '热菜', taste: '麻辣', price: 38, sales: 6895, salesAmount: 206850, growth: 3.8 },
        { rank: 6, dishName: '水煮肉片', category: '热菜', taste: '麻辣', price: 68, sales: 6543, salesAmount: 261720, growth: 9.1 },
        { rank: 7, dishName: '鱼香肉丝', category: '热菜', taste: '酸甜', price: 32, sales: 5987, salesAmount: 179610, growth: 7.4 },
        { rank: 8, dishName: '回锅肉', category: '热菜', taste: '香辣', price: 42, sales: 5234, salesAmount: 183190, growth: 4.2 },
        { rank: 9, dishName: '麻婆豆腐', category: '热菜', taste: '麻辣', price: 22, sales: 4876, salesAmount: 97520, growth: 6.9 },
        { rank: 10, dishName: '清蒸鲈鱼', category: '热菜', taste: '清淡', price: 68, sales: 4321, salesAmount: 172840, growth: 2.5 },
        { rank: 11, dishName: '凉拌黄瓜', category: '凉菜', taste: '清淡', price: 12, sales: 4123, salesAmount: 49476, growth: 4.5 },
        { rank: 12, dishName: '酸辣土豆丝', category: '热菜', taste: '酸辣', price: 18, sales: 3987, salesAmount: 71766, growth: 7.2 }
      ],
      
      // 品类销售数据
      categoryData: [
        { name: '热菜', percent: 65, color: '#E74C3C' },
        { name: '凉菜', percent: 15, color: '#3498DB' },
        { name: '主食', percent: 12, color: '#2ECC71' },
        { name: '饮品', percent: 8, color: '#F1C40F' }
      ],
      
      // 顾客画像页面数据
      ageData: [
        { range: '18-25岁', percent: 22 },
        { range: '26-35岁', percent: 38 },
        { range: '36-45岁', percent: 25 },
        { range: '46-55岁', percent: 12 },
        { range: '55岁以上', percent: 3 }
      ],
      
      // 顾客分群数据
      customerGroups: [
        { group: '年轻白领', count: 1250, percentage: 21.4, avgConsumption: 128, tastePreference: '麻辣/酸甜' },
        { group: '商务人士', count: 890, percentage: 15.2, avgConsumption: 245, tastePreference: '咸鲜/清淡' },
        { group: '学生群体', count: 1560, percentage: 26.7, avgConsumption: 65, tastePreference: '香辣/酸甜' },
        { group: '家庭顾客', count: 1320, percentage: 22.6, avgConsumption: 185, tastePreference: '清淡/酸甜' },
        { group: '老年顾客', count: 450, percentage: 7.7, avgConsumption: 98, tastePreference: '清淡/咸鲜' }
      ],
      
      // 消费习惯数据
      consumptionHabits: [
        { name: '平均消费频次', value: '3.2次/月', desc: '每月平均消费次数' },
        { name: '平均客单价', value: '￥153.5', desc: '每次消费平均金额' },
        { name: '最常消费时段', value: '18:00-20:00', desc: '晚餐时间为消费高峰' },
        { name: '平均就餐时长', value: '45分钟', desc: '从进店到离店平均时间' },
        { name: '推荐接受率', value: '68%', desc: '接受服务员推荐的比例' },
        { name: '打包比例', value: '32%', desc: '选择打包带走的比例' }
      ],
      
      // 系统设置页面数据
      userList: [
        { username: 'admin', role: '管理员', lastLogin: '2026-03-16 15:30:22' },
        { username: 'manager_zhang', role: '经理', lastLogin: '2026-03-16 14:20:15' },
        { username: 'analyst_li', role: '分析师', lastLogin: '2026-03-15 11:05:48' },
        { username: 'viewer_wang', role: '查看者', lastLogin: '2026-03-14 09:45:33' }
      ],
      
      // 图表实例
      tasteChart: null,
      trendChart: null
    };
  },
  mounted() {
    // 初始化图表
    this.$nextTick(() => {
      this.initTasteChart();
      this.initTrendChart();
    });
    
    // 监听窗口大小变化，重绘图表
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.tasteChart) {
      this.tasteChart.dispose();
    }
    if (this.trendChart) {
      this.trendChart.dispose();
    }
    
    // 移除事件监听
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    // 处理菜单选择
    handleMenuSelect(index) {
      this.activeMenu = index;
      
      // 切换菜单后重新渲染图表
      if (index === 'dashboard') {
        this.$nextTick(() => {
          this.initTasteChart();
          this.initTrendChart();
        });
      }
    },
    
    // 改变时间范围
    changeTimeRange(range) {
      this.timeRange = range;
      // 在实际应用中，这里会根据选择的时间范围重新加载数据
      vk.alert(`时间范围变更为: ${range}`);
    },
    
    // 初始化口味偏好图表
    initTasteChart() {
      if (!this.$refs.tasteChart) return;
      
      if (this.tasteChart) {
        this.tasteChart.dispose();
      }
      
      // 使用全局挂载的ECharts
      this.tasteChart = this.$echarts.init(this.$refs.tasteChart);
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: '口味偏好',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
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
            data: this.tasteData.map(item => ({
              name: item.name,
              value: item.value,
              itemStyle: {
                color: item.color
              }
            }))
          }
        ]
      };
      
      this.tasteChart.setOption(option);
    },
    
    // 初始化消费趋势图表
    initTrendChart() {
      if (!this.$refs.trendChart) return;
      
      if (this.trendChart) {
        this.trendChart.dispose();
      }
      
      // 使用全局挂载的ECharts
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
          data: ['本年消费', '去年消费'],
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: this.trendData.months
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '消费金额(万元)'
          }
        ],
        series: [
          {
            name: '本年消费',
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 4
            },
            areaStyle: {
              opacity: 0.1
            },
            emphasis: {
              focus: 'series'
            },
            data: this.trendData.values
          },
          {
            name: '去年消费',
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 3,
              type: 'dashed'
            },
            emphasis: {
              focus: 'series'
            },
            data: this.trendData.lastYear
          }
        ]
      };
      
      this.trendChart.setOption(option);
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.tasteChart) {
        this.tasteChart.resize();
      }
      if (this.trendChart) {
        this.trendChart.resize();
      }
    },
    
    // 系统设置保存
    saveSettings() {
      this.$message({
        message: '系统设置已保存',
        type: 'success',
        duration: 2000
      });
    },
    
    // 重置系统设置
    resetSettings() {
      this.updateFrequency = 'daily';
      this.dataRetention = '1year';
      this.exportFormats = ['Excel', 'PDF'];
      this.$message({
        message: '设置已重置为默认值',
        type: 'info',
        duration: 2000
      });
    }
  }
};
</script>

<style scoped>
#customer-taste-analysis {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #f5f7fa;
}

/* 顶部导航栏样式 */
.main-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  line-height: 60px;
}

.system-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2d3d;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.search-input {
  width: 240px;
  margin-right: 24px;
}

.admin-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.admin-name {
  margin-left: 12px;
  font-size: 14px;
  color: #606266;
}

/* 主容器布局 */
.main-container {
  flex: 1;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #1f2d3d;
  color: #b7c0cd;
  overflow-y: auto;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.menu-title {
  padding: 20px 24px 10px;
  font-size: 12px;
  color: #8a94a6;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.el-menu-item {
  height: 56px;
  line-height: 56px;
  font-size: 14px;
  border-left: 3px solid transparent;
}

.el-menu-item.is-active {
  background-color: #2c3a4d !important;
  border-left-color: #409EFF;
}

.el-menu-item i {
  margin-right: 8px;
  font-size: 18px;
}

.time-range-section {
  padding: 20px 24px;
  margin-top: 20px;
  border-top: 1px solid #2c3a4d;
}

.section-title {
  font-size: 12px;
  color: #8a94a6;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.time-options {
  display: flex;
  flex-direction: column;
}

.time-btn {
  margin-bottom: 10px;
  padding: 8px 0;
  text-align: left;
  color: #b7c0cd !important;
}

.time-btn.el-button--primary {
  color: #409EFF !important;
  background-color: transparent !important;
}

/* 主内容区域样式 */
.main-content {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 10px;
}

.page-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 20px;
}

/* 数据卡片样式 */
.data-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.data-card, .taste-stat-card, .time-distribution-card, .holiday-data-card, .dish-category-card, .demographic-card, .customer-group-card, .settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.data-card:hover, .taste-stat-card:hover, .time-distribution-card:hover, .holiday-data-card:hover, .dish-category-card:hover, .demographic-card:hover, .customer-group-card:hover, .settings-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-content {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
  padding: 16px 20px 0;
  border-bottom: none;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.card-change {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.card-change i {
  margin-right: 4px;
}

.card-change.positive {
  color: #67c23a;
}

.card-change.negative {
  color: #f56c6c;
}

.card-change.neutral {
  color: #909399;
}

/* 图表区域样式 */
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card, .season-taste-card, .trend-chart-card, .consumption-habit-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
  padding: 16px 20px 0;
  border-bottom: none;
}

.chart-select, .season-select, .taste-select {
  width: 120px;
}

.chart-container {
  flex: 1;
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
}

.chart {
  flex: 1;
  width: 100%;
  min-height: 300px;
}

.taste-chart .chart-container {
  flex-direction: row;
}

.taste-chart .chart {
  width: 60%;
}

.chart-legend, .season-legend, .category-legend {
  width: 40%;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 10px;
}

.legend-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.legend-percent {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.trend-options {
  margin-top: -5px;
}

/* 热门菜品排行样式 */
.ranking-card, .dish-ranking-table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
  padding: 16px 20px;
  border-bottom: none;
}

.view-more {
  color: #409EFF;
  font-size: 14px;
}

.rank-cell {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 50%;
  font-weight: 600;
}

.rank-1, .rank-2, .rank-3 {
  color: #fff;
}

.rank-1 {
  background-color: #f56c6c;
}

.rank-2 {
  background-color: #e6a23c;
}

.rank-3 {
  background-color: #67c23a;
}

.sales-amount {
  font-weight: 600;
  color: #303133;
}

/* 口味分析页面样式 */
.taste-analysis-page .taste-cards {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
  margin-bottom: 20px;
}

.taste-stat-card .stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-item {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}

.stat-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 5px;
}

.stat-change {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.stat-change.positive {
  color: #67c23a;
}

.stat-change.negative {
  color: #f56c6c;
}

.taste-region-card {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.region-table {
  flex: 1;
  overflow-y: auto;
}

.taste-percent {
  font-weight: 600;
}

.taste-percent.spicy {
  color: #E74C3C;
}

.taste-percent.savory {
  color: #E67E22;
}

.taste-percent.sweet {
  color: #F1C40F;
}

.taste-percent.light {
  color: #2ECC71;
}

.taste-percent.other {
  color: #3498DB;
}

.season-taste-card .season-content {
  flex: 1;
  display: flex;
  padding: 20px;
}

.season-chart-placeholder, .trend-chart-placeholder, .category-chart-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  margin-right: 20px;
  color: #909399;
}

.chart-icon {
  font-size: 60px;
  margin-bottom: 10px;
  color: #409EFF;
}

.season-chart-placeholder p, .trend-chart-placeholder p, .category-chart-placeholder p {
  font-size: 16px;
  color: #606266;
}

/* 消费趋势页面样式 */
.consumption-trend-page .trend-data-cards {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
  margin-top: 20px;
}

.time-distribution-card {
  height: 300px;
  display: flex;
  flex-direction: column;
}

.time-distribution {
  flex: 1;
  padding: 20px;
}

.time-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.time-label {
  width: 120px;
  font-size: 14px;
  color: #606266;
}

.time-bar {
  flex: 1;
  height: 20px;
  background-color: #f0f2f5;
  border-radius: 10px;
  overflow: hidden;
  margin: 0 15px;
}

.bar-fill {
  height: 100%;
  background-color: #409EFF;
  border-radius: 10px;
}

.time-percent {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: #303133;
}

.holiday-data-card {
  height: 300px;
  display: flex;
  flex-direction: column;
}

.holiday-table {
  flex: 1;
  overflow-y: auto;
}

/* 菜品排行页面样式 */
.dish-ranking-page .dish-filter {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.dish-ranking-page .dish-filter .taste-select {
  margin-left: 20px;
  width: 150px;
}

.dish-ranking-page .dish-ranking-cards {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.dish-ranking-table-card .data-time {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.dish-category-card {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.dish-category-card .category-chart-placeholder {
  margin-right: 0;
  margin-bottom: 20px;
  height: 250px;
}

/* 顾客画像页面样式 */
.customer-portrait-page .portrait-cards {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
  margin-bottom: 20px;
}

.demographic-card .demographic-content {
  padding: 20px;
}

.gender-distribution, .age-distribution {
  margin-bottom: 30px;
}

.gender-distribution h3, .age-distribution h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
}

.gender-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.gender-item {
  display: flex;
  align-items: center;
}

.gender-item.male .bar-fill {
  background-color: #409EFF;
}

.gender-item.female .bar-fill {
  background-color: #E91E63;
}

.gender-label {
  width: 60px;
  font-size: 14px;
  color: #606266;
}

.gender-bar {
  flex: 1;
  height: 20px;
  background-color: #f0f2f5;
  border-radius: 10px;
  overflow: hidden;
  margin: 0 15px;
}

.gender-percent {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: #303133;
}

.age-data {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.age-item {
  display: flex;
  align-items: center;
}

.age-range {
  width: 80px;
  font-size: 14px;
  color: #606266;
}

.age-bar {
  flex: 1;
  height: 16px;
  background-color: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 15px;
}

.age-bar .bar-fill {
  height: 100%;
  background-color: #67c23a;
  border-radius: 8px;
}

.age-percent {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: #303133;
}

.customer-group-card {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.group-table {
  flex: 1;
  overflow-y: auto;
}

.consumption-habit-card .habit-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
}

.habit-item {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #409EFF;
}

.habit-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.habit-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 5px;
}

.habit-desc {
  font-size: 12px;
  color: #909399;
}

/* 系统设置页面样式 */
.system-settings-page .settings-cards {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
}

.settings-card {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.settings-form {
  padding: 20px;
}

.user-table {
  flex: 1;
  overflow-y: auto;
}

.add-user-btn {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .data-cards, .taste-analysis-page .taste-cards, .consumption-trend-page .trend-data-cards, 
  .customer-portrait-page .portrait-cards, .system-settings-page .settings-cards,
  .dish-ranking-page .dish-ranking-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .taste-chart .chart-container {
    flex-direction: column;
  }
  
  .taste-chart .chart {
    width: 100%;
  }
  
  .chart-legend, .season-legend, .category-legend {
    width: 100%;
    padding-left: 0;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 20px;
  }
  
  .legend-item {
    margin: 5px 15px;
  }
  
  .season-taste-card .season-content, .consumption-habit-card .habit-content {
    flex-direction: column;
  }
  
  .season-chart-placeholder, .trend-chart-placeholder, .category-chart-placeholder {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .consumption-habit-card .habit-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .data-cards, .taste-stat-card .stat-grid, .consumption-habit-card .habit-content {
    grid-template-columns: 1fr;
  }
  
  .header-right {
    display: none;
  }
  
  .sidebar {
    width: 180px !important;
  }
  
  .dish-filter {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .dish-filter .taste-select {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>