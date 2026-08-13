<template>
  <div class="analysis">
    <h2>数据分析</h2>
    <div class="card">
      <h3>销售分析</h3>
      <div class="chart-container">
        <div class="chart-header">
          <h4>销售趋势</h4>
          <div class="chart-controls">
            <select v-model="salesPeriod">
              <option value="day">按日</option>
              <option value="week">按周</option>
              <option value="month">按月</option>
              <option value="year">按年</option>
            </select>
          </div>
        </div>
        <div class="chart-placeholder">
          <!-- 销售趋势图表 -->
          <div class="chart-bar" v-for="(value, index) in salesData" :key="index" :style="{ height: value + '%' }"></div>
        </div>
        <div class="chart-labels">
          <span v-for="(label, index) in salesLabels" :key="index">{{ label }}</span>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>库存分析</h3>
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>库存周转率</h3>
          <div class="value">{{ inventoryTurnover }}次/月</div>
        </div>
        <div class="dashboard-card">
          <h3>库存价值</h3>
          <div class="value">¥{{ inventoryValue }}</div>
        </div>
        <div class="dashboard-card">
          <h3>滞销品数量</h3>
          <div class="value">{{ slowMovingCount }}</div>
        </div>
        <div class="dashboard-card">
          <h3>库存预警</h3>
          <div class="value">{{ inventoryAlertCount }}</div>
        </div>
      </div>
      <div class="table-container">
        <h4>库存预警列表</h4>
        <table class="table">
          <thead>
            <tr>
              <th>物品名称</th>
              <th>当前库存</th>
              <th>安全库存</th>
              <th>预警状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inventoryAlerts" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.currentStock }}</td>
              <td>{{ item.safeStock }}</td>
              <td>{{ item.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <h3>生产分析</h3>
      <div class="chart-container">
        <div class="chart-header">
          <h4>生产效率</h4>
        </div>
        <div class="chart-placeholder">
          <!-- 生产效率图表 -->
          <div class="chart-bar" v-for="(value, index) in productionData" :key="index" :style="{ height: value + '%' }"></div>
        </div>
        <div class="chart-labels">
          <span v-for="(label, index) in productionLabels" :key="index">{{ label }}</span>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>财务分析</h3>
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>收入</h3>
          <div class="value">¥{{ financeData.income }}</div>
          <div class="change positive">+15%</div>
        </div>
        <div class="dashboard-card">
          <h3>支出</h3>
          <div class="value">¥{{ financeData.expense }}</div>
          <div class="change negative">+8%</div>
        </div>
        <div class="dashboard-card">
          <h3>利润</h3>
          <div class="value">¥{{ financeData.profit }}</div>
          <div class="change positive">+20%</div>
        </div>
        <div class="dashboard-card">
          <h3>利润率</h3>
          <div class="value">{{ financeData.profitRate }}%</div>
          <div class="change positive">+2%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Analysis',
  data() {
    return {
      salesPeriod: 'month',
      salesData: [65, 78, 90, 81, 56, 55, 40],
      salesLabels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
      productionData: [80, 75, 90, 85, 70, 80, 85],
      productionLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      inventoryTurnover: 4.5,
      inventoryValue: 85000,
      slowMovingCount: 12,
      inventoryAlertCount: 5,
      financeData: {
        income: 380000,
        expense: 250000,
        profit: 130000,
        profitRate: 34.2
      },
      inventoryAlerts: [
        { id: 1, name: '盐', currentStock: 20, safeStock: 50, status: '低库存' },
        { id: 2, name: '鸡蛋', currentStock: 50, safeStock: 100, status: '低库存' },
        { id: 3, name: '食用油', currentStock: 50, safeStock: 80, status: '正常' },
        { id: 4, name: '面粉', currentStock: 800, safeStock: 500, status: '正常' },
        { id: 5, name: '大米', currentStock: 1000, safeStock: 800, status: '正常' }
      ]
    }
  }
}
</script>

<style scoped>
.analysis {
  padding: 20px 0;
}

.analysis h2 {
  margin-bottom: 30px;
  color: #3498db;
}

.card {
  margin-bottom: 30px;
}

.card h3 {
  margin-bottom: 20px;
  color: #333;
}

.card h4 {
  margin-bottom: 15px;
  color: #666;
}

.chart-container {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h4 {
  margin: 0;
  color: #333;
}

.chart-controls select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  height: 200px;
  gap: 10px;
  margin-bottom: 10px;
}

.chart-bar {
  flex: 1;
  background-color: #3498db;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.dashboard-grid {
  margin-bottom: 30px;
}

.table-container {
  margin-top: 20px;
}
</style>