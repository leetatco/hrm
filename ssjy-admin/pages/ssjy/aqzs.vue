<template>
  <div class="food-safety-traceability-system">
    <!-- 侧边导航栏 -->
    <div class="sidebar">
      <div class="logo">
        <h2>校园食品安全追溯系统</h2>
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
          <p class="subtitle">{{ pageSubtitle }}</p>
        </div>
        <div class="top-actions">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchKeyword"
              placeholder="搜索食材、供应商或记录..." 
              @keyup.enter="performSearch"
            />
            <i class="el-icon-search" @click="performSearch"></i>
          </div>
          <div class="date-display">
            <i class="el-icon-date"></i>
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 食材溯源页面 -->
        <div v-if="activeMenu === 'ingredient-trace'" class="trace-page">
          <!-- 数据概览卡片 -->
          <div class="overview-section">
            <h2>食品安全数据概览</h2>
            <div class="overview-cards">
              <div class="overview-card card-total">
                <div class="card-content">
                  <h3>今日采购食材</h3>
                  <div class="card-value">{{ overviewData.todayIngredients }}</div>
                  <div class="card-desc">种食材</div>
                </div>
                <div class="card-icon">
                  <i class="el-icon-shopping-cart-full"></i>
                </div>
              </div>
              
              <div class="overview-card card-qualified">
                <div class="card-content">
                  <h3>检测合格率</h3>
                  <div class="card-value">{{ overviewData.qualifiedRate }}</div>
                  <div class="card-desc">今日抽检: {{ overviewData.todayTested }}</div>
                </div>
                <div class="card-icon">
                  <i class="el-icon-check"></i>
                </div>
              </div>
              
              <div class="overview-card card-suppliers">
                <div class="card-content">
                  <h3>合作供应商</h3>
                  <div class="card-value">{{ overviewData.totalSuppliers }}</div>
                  <div class="card-desc">家合格供应商</div>
                </div>
                <div class="card-icon">
                  <i class="el-icon-office-building"></i>
                </div>
              </div>
              
              <div class="overview-card card-warning">
                <div class="card-content">
                  <h3>预警食材</h3>
                  <div class="card-value">{{ overviewData.warningIngredients }}</div>
                  <div class="card-desc">需重点关注</div>
                </div>
                <div class="card-icon">
                  <i class="el-icon-warning-outline"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- 溯源查询区域 -->
          <div class="trace-section">
            <div class="section-header">
              <h2>食材溯源查询</h2>
              <div class="trace-actions">
                <button class="scan-btn" @click="scanQRCode">
                  <i class="el-icon-camera"></i>
                  扫码溯源
                </button>
                <button class="filter-btn" @click="toggleFilter">
                  <i class="el-icon-s-data"></i>
                  {{ showFilter ? '隐藏筛选' : '高级筛选' }}
                </button>
              </div>
            </div>
            
            <!-- 筛选条件 -->
            <div v-if="showFilter" class="filter-section">
              <div class="filter-row">
                <div class="filter-item">
                  <label>食材类别:</label>
                  <select v-model="filters.category">
                    <option value="">全部</option>
                    <option value="vegetable">蔬菜类</option>
                    <option value="meat">肉类</option>
                    <option value="aquatic">水产类</option>
                    <option value="grain">粮油类</option>
                    <option value="fruit">水果类</option>
                  </select>
                </div>
                
                <div class="filter-item">
                  <label>采购日期:</label>
                  <div class="date-range">
                    <input type="date" v-model="filters.startDate">
                    <span>至</span>
                    <input type="date" v-model="filters.endDate">
                  </div>
                </div>
                
                <div class="filter-item">
                  <label>检测状态:</label>
                  <select v-model="filters.testStatus">
                    <option value="">全部</option>
                    <option value="qualified">合格</option>
                    <option value="unqualified">不合格</option>
                    <option value="waiting">待检测</option>
                  </select>
                </div>
              </div>
              
              <div class="filter-actions">
                <button class="filter-reset" @click="resetFilters">重置筛选</button>
                <button class="filter-apply" @click="applyFilters">应用筛选</button>
              </div>
            </div>
            
            <!-- 食材追溯列表 -->
            <div class="trace-table">
              <div class="table-header">
                <div class="header-cell" style="width: 15%;">食材编码</div>
                <div class="header-cell" style="width: 20%;">食材名称</div>
                <div class="header-cell" style="width: 15%;">食材类别</div>
                <div class="header-cell" style="width: 15%;">供应商</div>
                <div class="header-cell" style="width: 15%;">检测结果</div>
                <div class="header-cell" style="width: 20%;">操作</div>
              </div>
              
              <div 
                v-for="ingredient in filteredIngredients" 
                :key="ingredient.id"
                class="table-row"
                :class="`status-${ingredient.testStatus}`"
              >
                <div class="table-cell" style="width: 15%;">
                  <div class="code-cell">
                    <i class="el-icon-tickets"></i>
                    {{ ingredient.code }}
                  </div>
                </div>
                <div class="table-cell" style="width: 20%;">
                  <strong>{{ ingredient.name }}</strong>
                  <div class="cell-desc">{{ ingredient.origin }}</div>
                </div>
                <div class="table-cell" style="width: 15%;">
                  <span class="category-tag" :class="ingredient.category">
                    {{ getCategoryText(ingredient.category) }}
                  </span>
                </div>
                <div class="table-cell" style="width: 15%;">
                  {{ ingredient.supplier }}
                  <div class="cell-desc">联系电话: {{ ingredient.supplierPhone }}</div>
                </div>
                <div class="table-cell" style="width: 15%;">
                  <div class="status-indicator" :class="`status-${ingredient.testStatus}`">
                    {{ getTestStatusText(ingredient.testStatus) }}
                  </div>
                  <div class="cell-desc" v-if="ingredient.testDate">
                    检测日期: {{ ingredient.testDate }}
                  </div>
                </div>
                <div class="table-cell" style="width: 20%;">
                  <div class="row-actions">
                    <button class="action-btn trace-btn" @click="viewTraceDetail(ingredient)">
                      <i class="el-icon-search"></i>
                      查看溯源
                    </button>
                    <button class="action-btn test-btn" @click="viewTestReport(ingredient)">
                      <i class="el-icon-document"></i>
                      检测报告
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 分页 -->
            <div class="pagination">
              <button 
                class="page-btn" 
                :disabled="currentPage === 1" 
                @click="changePage(currentPage - 1)"
              >
                上一页
              </button>
              <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
              <button 
                class="page-btn" 
                :disabled="currentPage === totalPages" 
                @click="changePage(currentPage + 1)"
              >
                下一页
              </button>
            </div>
          </div>
        </div>

        <!-- 供应商管理页面 -->
        <div v-else-if="activeMenu === 'supplier-management'" class="supplier-page">
          <h2>供应商管理</h2>
          <div class="page-content">
            <div class="supplier-overview">
              <div class="supplier-card" v-for="supplier in supplierList" :key="supplier.id">
                <div class="supplier-header">
                  <h3>{{ supplier.name }}</h3>
                  <span class="supplier-rating" :class="`rating-${supplier.rating}`">
                    {{ supplier.rating }}分
                  </span>
                </div>
                <div class="supplier-info">
                  <p><i class="el-icon-user"></i> 联系人: {{ supplier.contact }}</p>
                  <p><i class="el-icon-phone"></i> 电话: {{ supplier.phone }}</p>
                  <p><i class="el-icon-location"></i> 地址: {{ supplier.address }}</p>
                  <p><i class="el-icon-goods"></i> 主要供应: {{ supplier.mainProducts }}</p>
                </div>
                <div class="supplier-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ supplier.totalSupplies }}</div>
                    <div class="stat-label">累计供应</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ supplier.qualifiedRate }}</div>
                    <div class="stat-label">合格率</div>
                  </div>
                </div>
                <div class="supplier-actions">
                  <button class="action-btn view-btn" @click="viewSupplierDetail(supplier)">
                    查看详情
                  </button>
                  <button class="action-btn evaluate-btn" @click="evaluateSupplier(supplier)">
                    评价
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 检测记录页面 -->
        <div v-else-if="activeMenu === 'test-records'" class="test-page">
          <h2>食材检测记录</h2>
          <div class="page-content">
            <div class="test-statistics">
              <div class="stat-card">
                <h3>本月检测统计</h3>
                <div class="stat-details">
                  <div class="detail-item">
                    <span class="label">总检测数:</span>
                    <span class="value">{{ testStats.totalTests }} 次</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">合格数:</span>
                    <span class="value value-qualified">{{ testStats.qualified }} 次</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">不合格数:</span>
                    <span class="value value-unqualified">{{ testStats.unqualified }} 次</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">合格率:</span>
                    <span class="value value-rate">{{ testStats.qualifiedRate }}</span>
                  </div>
                </div>
              </div>
              
              <div class="recent-tests">
                <h3>最近检测记录</h3>
                <div class="test-list">
                  <div 
                    v-for="test in recentTests" 
                    :key="test.id"
                    class="test-item"
                    :class="`status-${test.result}`"
                  >
                    <div class="test-info">
                      <div class="test-name">{{ test.ingredientName }}</div>
                      <div class="test-details">
                        <span>检测人: {{ test.tester }}</span>
                        <span>检测时间: {{ test.testTime }}</span>
                      </div>
                    </div>
                    <div class="test-result">
                      {{ test.result === 'qualified' ? '合格' : '不合格' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 预警管理页面 -->
        <div v-else-if="activeMenu === 'warning-management'" class="warning-page">
          <h2>安全预警管理</h2>
          <div class="page-content">
            <div class="warning-list">
              <div 
                v-for="warning in warningList" 
                :key="warning.id"
                class="warning-item"
                :class="`level-${warning.level}`"
              >
                <div class="warning-icon">
                  <i class="el-icon-warning"></i>
                </div>
                <div class="warning-content">
                  <h3>{{ warning.title }}</h3>
                  <p>{{ warning.description }}</p>
                  <div class="warning-meta">
                    <span>预警时间: {{ warning.time }}</span>
                    <span>相关食材: {{ warning.relatedIngredient }}</span>
                    <span>预警等级: {{ getWarningLevelText(warning.level) }}</span>
                  </div>
                </div>
                <div class="warning-actions">
                  <button class="action-btn handle-btn" @click="handleWarning(warning)">
                    处理
                  </button>
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
                  <span class="label">系统版本:</span>
                  <span class="value">V2.0.1</span>
                </div>
                <div class="info-item">
                  <span class="label">最后数据同步:</span>
                  <span class="value">{{vk.pubfn.timeFormat(new Date(), 'yyyy-MM-dd')}}</span>
                </div>
                <div class="info-item">
                  <span class="label">学校名称:</span>
                  <span class="value">XX市第一中学</span>
                </div>
                <div class="info-item">
                  <span class="label">使用部门:</span>
                  <span class="value">食堂管理部、后勤部</span>
                </div>
              </div>
            </div>
            
            <div class="settings-section">
              <h3>数据统计</h3>
              <div class="data-stats">
                <div class="data-item">
                  <div class="data-value">{{ systemStats.totalIngredients }}</div>
                  <div class="data-label">总食材记录</div>
                </div>
                <div class="data-item">
                  <div class="data-value">{{ systemStats.totalSuppliers }}</div>
                  <div class="data-label">合作供应商</div>
                </div>
                <div class="data-item">
                  <div class="data-value">{{ systemStats.totalTests }}</div>
                  <div class="data-label">检测记录</div>
                </div>
                <div class="data-item">
                  <div class="data-value">{{ systemStats.totalWarnings }}</div>
                  <div class="data-label">预警记录</div>
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
  name: 'FoodSafetyTraceabilitySystem',
  
  data() {
    return {
      // 当前激活的菜单
      activeMenu: 'ingredient-trace',
      
      // 搜索关键词
      searchKeyword: '',
      
      // 当前页码
      currentPage: 1,
      itemsPerPage: 5,
      
      // 是否显示筛选条件
      showFilter: false,
      
      // 筛选条件
      filters: {
        category: '',
        startDate: '',
        endDate: '',
        testStatus: ''
      },
      
      // 菜单项数据
      menuItems: [
        { id: 'ingredient-trace', name: '食材溯源', icon: 'el-icon-search', subtitle: '追溯食材来源与流向' },
        { id: 'supplier-management', name: '供应商管理', icon: 'el-icon-office-building', subtitle: '管理食材供应商信息' },
        { id: 'test-records', name: '检测记录', icon: 'el-icon-document-checked', subtitle: '查看食材检测结果' },
        { id: 'warning-management', name: '预警管理', icon: 'el-icon-warning', subtitle: '安全预警与处理' },
        { id: 'settings', name: '系统设置', icon: 'el-icon-setting', subtitle: '系统配置与信息' }
      ],
      
      // 概览数据
      overviewData: {
        todayIngredients: 156,
        qualifiedRate: '98.7%',
        todayTested: 48,
        totalSuppliers: 23,
        warningIngredients: 7
      },
      
      // 食材列表数据
      ingredientList: [
        {
          id: 1,
          code: 'SC20240216001',
          name: '有机西红柿',
          origin: '山东寿光',
          category: 'vegetable',
          supplier: '绿源农产品有限公司',
          supplierPhone: '13800138001',
          testStatus: 'qualified',
          testDate: '2024-02-16',
          purchaseDate: '2024-02-15',
          quantity: '50kg',
          storage: '2号冷库',
          expirationDate: '2024-02-25'
        },
        {
          id: 2,
          code: 'SC20240216002',
          name: '新鲜猪肉',
          origin: '河南双汇',
          category: 'meat',
          supplier: '双汇食品集团',
          supplierPhone: '13800138002',
          testStatus: 'qualified',
          testDate: '2024-02-16',
          purchaseDate: '2024-02-15',
          quantity: '30kg',
          storage: '1号冷库',
          expirationDate: '2024-02-20'
        },
        {
          id: 3,
          code: 'SC20240215003',
          name: '东北大米',
          origin: '黑龙江五常',
          category: 'grain',
          supplier: '五常米业有限公司',
          supplierPhone: '13800138003',
          testStatus: 'qualified',
          testDate: '2024-02-15',
          purchaseDate: '2024-02-14',
          quantity: '100袋',
          storage: '主食仓库',
          expirationDate: '2025-02-14'
        },
        {
          id: 4,
          code: 'SC20240215004',
          name: '鲜活鲫鱼',
          origin: '江苏太湖',
          category: 'aquatic',
          supplier: '太湖水产有限公司',
          supplierPhone: '13800138004',
          testStatus: 'unqualified',
          testDate: '2024-02-15',
          purchaseDate: '2024-02-14',
          quantity: '20kg',
          storage: '水产区',
          expirationDate: '2024-02-18',
          unqualifiedReason: '重金属超标'
        },
        {
          id: 5,
          code: 'SC20240214005',
          name: '红富士苹果',
          origin: '陕西延安',
          category: 'fruit',
          supplier: '延安果业合作社',
          supplierPhone: '13800138005',
          testStatus: 'qualified',
          testDate: '2024-02-14',
          purchaseDate: '2024-02-13',
          quantity: '40箱',
          storage: '水果仓库',
          expirationDate: '2024-03-13'
        },
        {
          id: 6,
          code: 'SC20240214006',
          name: '有机菠菜',
          origin: '北京小汤山',
          category: 'vegetable',
          supplier: '小汤山农业基地',
          supplierPhone: '13800138006',
          testStatus: 'waiting',
          testDate: '',
          purchaseDate: '2024-02-16',
          quantity: '25kg',
          storage: '3号冷库',
          expirationDate: '2024-02-23'
        },
        {
          id: 7,
          code: 'SC20240213007',
          name: '鲜鸡蛋',
          origin: '河北正大',
          category: 'other',
          supplier: '正大食品有限公司',
          supplierPhone: '13800138007',
          testStatus: 'qualified',
          testDate: '2024-02-13',
          purchaseDate: '2024-02-12',
          quantity: '200个',
          storage: '蛋品区',
          expirationDate: '2024-02-28'
        }
      ],
      
      // 供应商列表
      supplierList: [
        {
          id: 1,
          name: '绿源农产品有限公司',
          contact: '张经理',
          phone: '13800138001',
          address: '山东省寿光市农业示范区',
          mainProducts: '蔬菜、水果',
          rating: 4.8,
          totalSupplies: 156,
          qualifiedRate: '99.2%',
          cooperationYears: 3
        },
        {
          id: 2,
          name: '双汇食品集团',
          contact: '李经理',
          phone: '13800138002',
          address: '河南省漯河市双汇工业园',
          mainProducts: '肉类制品',
          rating: 4.9,
          totalSupplies: 203,
          qualifiedRate: '99.5%',
          cooperationYears: 5
        },
        {
          id: 3,
          name: '五常米业有限公司',
          contact: '王经理',
          phone: '13800138003',
          address: '黑龙江省五常市',
          mainProducts: '大米、谷物',
          rating: 4.7,
          totalSupplies: 89,
          qualifiedRate: '98.8%',
          cooperationYears: 2
        },
        {
          id: 4,
          name: '太湖水产有限公司',
          contact: '赵经理',
          phone: '13800138004',
          address: '江苏省苏州市太湖区',
          mainProducts: '水产品',
          rating: 4.2,
          totalSupplies: 45,
          qualifiedRate: '95.6%',
          cooperationYears: 1
        }
      ],
      
      // 检测统计
      testStats: {
        totalTests: 245,
        qualified: 242,
        unqualified: 3,
        qualifiedRate: '98.8%'
      },
      
      // 最近检测记录
      recentTests: [
        {
          id: 1,
          ingredientName: '有机西红柿',
          tester: '张三',
          testTime: '2024-02-16 09:30',
          result: 'qualified'
        },
        {
          id: 2,
          ingredientName: '新鲜猪肉',
          tester: '李四',
          testTime: '2024-02-16 10:15',
          result: 'qualified'
        },
        {
          id: 3,
          ingredientName: '鲜活鲫鱼',
          tester: '王五',
          testTime: '2024-02-15 14:20',
          result: 'unqualified'
        },
        {
          id: 4,
          ingredientName: '东北大米',
          tester: '赵六',
          testTime: '2024-02-15 11:10',
          result: 'qualified'
        }
      ],
      
      // 预警列表
      warningList: [
        {
          id: 1,
          title: '鲜活鲫鱼检测不合格',
          description: '检测发现重金属超标，已暂停使用并联系供应商处理',
          time: '2024-02-15 15:30',
          relatedIngredient: '鲜活鲫鱼',
          level: 'high',
          status: 'processing'
        },
        {
          id: 2,
          title: '有机菠菜临近保质期',
          description: '库存中有机菠菜将于3天后到期，请优先使用',
          time: '2024-02-16 09:15',
          relatedIngredient: '有机菠菜',
          level: 'medium',
          status: 'pending'
        },
        {
          id: 3,
          title: '供应商评价下降',
          description: '太湖水产有限公司近期合格率下降至95.6%，需加强抽检',
          time: '2024-02-14 16:45',
          relatedIngredient: '多类水产品',
          level: 'low',
          status: 'pending'
        }
      ],
      
      // 系统统计
      systemStats: {
        totalIngredients: 1245,
        totalSuppliers: 23,
        totalTests: 5689,
        totalWarnings: 37
      }
    };
  },
  
  computed: {
    // 计算当前页面标题
    pageTitle() {
      const menu = this.menuItems.find(item => item.id === this.activeMenu);
      return menu ? menu.name : '校园食品安全追溯系统';
    },
    
    // 计算当前页面副标题
    pageSubtitle() {
      const menu = this.menuItems.find(item => item.id === this.activeMenu);
      return menu ? menu.subtitle : '';
    },
    
    // 获取当前日期
    currentDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    // 过滤后的食材列表
    filteredIngredients() {
      let filtered = [...this.ingredientList];
      
      // 按搜索关键词过滤
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(keyword) ||
          item.code.toLowerCase().includes(keyword) ||
          item.supplier.toLowerCase().includes(keyword)
        );
      }
      
      // 按食材类别过滤
      if (this.filters.category) {
        filtered = filtered.filter(item => item.category === this.filters.category);
      }
      
      // 按检测状态过滤
      if (this.filters.testStatus) {
        filtered = filtered.filter(item => item.testStatus === this.filters.testStatus);
      }
      
      // 分页
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return filtered.slice(startIndex, endIndex);
    },
    
    // 总页数
    totalPages() {
      return Math.ceil(this.ingredientList.length / this.itemsPerPage);
    }
  },
  
  methods: {
    // 切换菜单
    switchMenu(menuId) {
      this.activeMenu = menuId;
      this.currentPage = 1;
      
      // 模拟不同菜单下的数据加载
      if (menuId === 'ingredient-trace') {
        this.refreshIngredientData();
      }
    },
    
    // 刷新食材数据
    refreshIngredientData() {
      // 模拟数据更新
      console.log('刷新食材数据');
    },
    
    // 获取食材类别文本
    getCategoryText(category) {
      const categoryMap = {
        vegetable: '蔬菜类',
        meat: '肉类',
        aquatic: '水产类',
        grain: '粮油类',
        fruit: '水果类',
        other: '其他'
      };
      return categoryMap[category] || '未知';
    },
    
    // 获取检测状态文本
    getTestStatusText(status) {
      const statusMap = {
        qualified: '合格',
        unqualified: '不合格',
        waiting: '待检测'
      };
      return statusMap[status] || '未知';
    },
    
    // 获取预警等级文本
    getWarningLevelText(level) {
      const levelMap = {
        high: '高',
        medium: '中',
        low: '低'
      };
      return levelMap[level] || '未知';
    },
    
    // 执行搜索
    performSearch() {
      console.log('搜索关键词:', this.searchKeyword);
      this.currentPage = 1;
    },
    
    // 切换筛选条件显示
    toggleFilter() {
      this.showFilter = !this.showFilter;
    },
    
    // 应用筛选条件
    applyFilters() {
      console.log('应用筛选条件:', this.filters);
      this.currentPage = 1;
    },
    
    // 重置筛选条件
    resetFilters() {
      this.filters = {
        category: '',
        startDate: '',
        endDate: '',
        testStatus: ''
      };
      this.currentPage = 1;
    },
    
    // 切换页码
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    // 查看溯源详情
    viewTraceDetail(ingredient) {
      alert(`查看食材溯源详情: ${ingredient.name}\n食材编码: ${ingredient.code}\n供应商: ${ingredient.supplier}`);
    },
    
    // 查看检测报告
    viewTestReport(ingredient) {
      alert(`查看检测报告: ${ingredient.name}\n检测状态: ${this.getTestStatusText(ingredient.testStatus)}\n检测日期: ${ingredient.testDate || '未检测'}`);
    },
    
    // 扫码溯源
    scanQRCode() {
      alert('模拟扫码溯源功能\n请将摄像头对准食材二维码...');
    },
    
    // 查看供应商详情
    viewSupplierDetail(supplier) {
      alert(`查看供应商详情: ${supplier.name}\n联系人: ${supplier.contact}\n联系电话: ${supplier.phone}\n地址: ${supplier.address}`);
    },
    
    // 评价供应商
    evaluateSupplier(supplier) {
      alert(`评价供应商: ${supplier.name}`);
    },
    
    // 处理预警
    handleWarning(warning) {
      alert(`处理安全预警: ${warning.title}\n处理中...`);
    }
  },
  
  mounted() {
    // 组件加载时初始化数据
    console.log('校园食品安全追溯系统已加载');
    
    // 设置默认筛选日期为最近一周
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    this.filters.startDate = oneWeekAgo.toISOString().split('T')[0];
    this.filters.endDate = today.toISOString().split('T')[0];
  }
};
</script>

<style scoped>
.food-safety-traceability-system {
  display: flex;
  height: 100vh;
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 220px;
  background-color: #1a4d2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.logo {
  padding: 20px 15px;
  border-bottom: 1px solid #2a6d3c;
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
  background-color: #2a6d3c;
}

.menu li.active {
  background-color: #2a6d3c;
  border-left: 4px solid #5dbb63;
  color: #a8e6a3;
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
  margin: 0 0 5px 0;
  font-size: 22px;
  color: #333;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 20px;
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
  width: 300px;
  outline: none;
  transition: border-color 0.3s;
}

.search-box input:focus {
  border-color: #5dbb63;
}

.search-box .el-icon-search {
  position: absolute;
  left: 12px;
  color: #909399;
  cursor: pointer;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 食材溯源页面样式 */
.trace-page {
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
  border-top: 4px solid #5dbb63;
}

.card-qualified {
  border-top: 4px solid #409EFF;
}

.card-suppliers {
  border-top: 4px solid #E6A23C;
}

.card-warning {
  border-top: 4px solid #F56C6C;
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
  color: #5dbb63;
}

.card-qualified .card-icon {
  color: #409EFF;
}

.card-suppliers .card-icon {
  color: #E6A23C;
}

.card-warning .card-icon {
  color: #F56C6C;
}

/* 溯源查询区域 */
.trace-section {
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

.trace-actions {
  display: flex;
  gap: 10px;
}

.scan-btn, .filter-btn {
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

.scan-btn:hover, .filter-btn:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.scan-btn {
  color: #5dbb63;
  border-color: #5dbb63;
}

.scan-btn:hover {
  background-color: #f0f9f0;
}

.filter-btn {
  color: #409EFF;
  border-color: #409EFF;
}

.filter-btn:hover {
  background-color: #ecf5ff;
}

/* 筛选条件区域 */
.filter-section {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.filter-row {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.filter-item select, .filter-item input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
  outline: none;
  transition: border-color 0.3s;
}

.filter-item select:focus, .filter-item input:focus {
  border-color: #5dbb63;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-range span {
  color: #606266;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.filter-reset, .filter-apply {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-reset {
  background-color: #f4f4f5;
  color: #606266;
}

.filter-reset:hover {
  background-color: #e9e9eb;
}

.filter-apply {
  background-color: #5dbb63;
  color: white;
}

.filter-apply:hover {
  background-color: #4da955;
}

/* 食材追溯表格 */
.trace-table {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
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
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row.status-unqualified {
  background-color: #fef0f0;
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

.code-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5dbb63;
  font-weight: 500;
}

.cell-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.category-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.category-tag.vegetable {
  background-color: #f0f9eb;
  color: #67c23a;
}

.category-tag.meat {
  background-color: #fef0f0;
  color: #f56c6c;
}

.category-tag.aquatic {
  background-color: #ecf5ff;
  color: #409eff;
}

.category-tag.grain {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.category-tag.fruit {
  background-color: #f9e7ff;
  color: #b37feb;
}

.category-tag.other {
  background-color: #f4f4f5;
  color: #909399;
}

.status-indicator {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.status-indicator.status-qualified {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-indicator.status-unqualified {
  background-color: #fef0f0;
  color: #f56c6c;
}

.status-indicator.status-waiting {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.row-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.trace-btn {
  background-color: #ecf5ff;
  color: #409EFF;
}

.trace-btn:hover {
  background-color: #d9ecff;
}

.test-btn {
  background-color: #f0f9eb;
  color: #67C23A;
}

.test-btn:hover {
  background-color: #e1f3d8;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 15px;
}

.page-btn {
  padding: 8px 20px;
  border: 1px solid #dcdfe6;
  background-color: white;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #606266;
  font-size: 14px;
}

/* 供应商页面样式 */
.supplier-page, .test-page, .warning-page, .settings-page {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

.supplier-page h2, .test-page h2, .warning-page h2, .settings-page h2 {
  margin: 0 0 25px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.supplier-overview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.supplier-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.supplier-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.supplier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.supplier-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.supplier-rating {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.supplier-rating.rating-4.8, .supplier-rating.rating-4.9 {
  background-color: #f0f9eb;
  color: #67c23a;
}

.supplier-rating.rating-4.7 {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.supplier-rating.rating-4.2 {
  background-color: #fef0f0;
  color: #f56c6c;
}

.supplier-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.supplier-stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  padding: 15px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #5dbb63;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.supplier-actions {
  display: flex;
  gap: 10px;
}

.supplier-actions .action-btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
}

.view-btn {
  background-color: #ecf5ff;
  color: #409EFF;
}

.view-btn:hover {
  background-color: #d9ecff;
}

.evaluate-btn {
  background-color: #f0f9eb;
  color: #67C23A;
}

.evaluate-btn:hover {
  background-color: #e1f3d8;
}

/* 检测记录页面样式 */
.test-statistics {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  margin-top: 20px;
}

.stat-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
}

.stat-card h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item .label {
  color: #606266;
  font-size: 14px;
}

.detail-item .value {
  font-weight: 600;
  font-size: 16px;
}

.value-qualified {
  color: #67c23a;
}

.value-unqualified {
  color: #f56c6c;
}

.value-rate {
  color: #409eff;
  font-size: 20px !important;
}

.recent-tests h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.test-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.test-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  transition: all 0.3s;
}

.test-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-item.status-unqualified {
  background-color: #fef0f0;
  border-color: #fde2e2;
}

.test-info {
  flex: 1;
}

.test-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.test-details {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
}

.test-result {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.test-item.status-qualified .test-result {
  background-color: #f0f9eb;
  color: #67c23a;
}

.test-item.status-unqualified .test-result {
  background-color: #fef0f0;
  color: #f56c6c;
}

/* 预警管理页面样式 */
.warning-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.warning-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  border-left: 5px solid #f56c6c;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.warning-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.warning-item.level-high {
  border-left-color: #f56c6c;
}

.warning-item.level-medium {
  border-left-color: #e6a23c;
}

.warning-item.level-low {
  border-left-color: #409eff;
}

.warning-icon {
  font-size: 28px;
  color: #f56c6c;
  margin-right: 20px;
}

.warning-item.level-high .warning-icon {
  color: #f56c6c;
}

.warning-item.level-medium .warning-icon {
  color: #e6a23c;
}

.warning-item.level-low .warning-icon {
  color: #409eff;
}

.warning-content {
  flex: 1;
}

.warning-content h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
}

.warning-content p {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.warning-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
}

.warning-actions .action-btn {
  padding: 8px 20px;
  background-color: #5dbb63;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.warning-actions .action-btn:hover {
  background-color: #4da955;
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

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.info-item .label {
  color: #606266;
  font-size: 14px;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.data-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.data-item {
  text-align: center;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
}

.data-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-3px);
}

.data-value {
  font-size: 32px;
  font-weight: 700;
  color: #5dbb63;
  margin-bottom: 10px;
}

.data-label {
  color: #909399;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .overview-cards, .data-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .test-statistics {
    grid-template-columns: 1fr;
  }
  
  .supplier-overview {
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
    width: 100%;
  }
  
  .overview-cards, .data-stats, .supplier-overview {
    grid-template-columns: 1fr;
  }
  
  .table-header, .table-row {
    flex-direction: column;
  }
  
  .header-cell, .table-cell {
    width: 100% !important;
    padding: 10px 15px;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-item select, .filter-item input {
    min-width: 100%;
  }
  
  .warning-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .warning-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .warning-actions {
    width: 100%;
    margin-top: 15px;
  }
  
  .warning-actions .action-btn {
    width: 100%;
  }
}
</style>