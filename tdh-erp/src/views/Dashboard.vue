<template>
  <div class="dashboard">
    <h2>数据看板</h2>
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>今日订单</h3>
        <div class="value">{{ todayOrders }}</div>
        <div class="change positive">+12%</div>
      </div>
      <div class="dashboard-card">
        <h3>库存总量</h3>
        <div class="value">{{ totalInventory }}</div>
        <div class="change negative">-2%</div>
      </div>
      <div class="dashboard-card">
        <h3>今日生产</h3>
        <div class="value">{{ todayProduction }}</div>
        <div class="change positive">+8%</div>
      </div>
      <div class="dashboard-card">
        <h3>今日销售</h3>
        <div class="value">¥{{ todaySales }}</div>
        <div class="change positive">+15%</div>
      </div>
    </div>
    <div class="card">
      <h3>最近订单</h3>
      <table class="table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>客户</th>
            <th>金额</th>
            <th>状态</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.customer }}</td>
            <td>¥{{ order.amount }}</td>
            <td>{{ order.status }}</td>
            <td>{{ order.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      todayOrders: 128,
      totalInventory: 5230,
      todayProduction: 890,
      todaySales: 12500,
      recentOrders: [
        { id: 'ORD-20240101-001', customer: 'XX公司', amount: 1200, status: '已完成', time: '2024-01-01 10:30' },
        { id: 'ORD-20240101-002', customer: 'YY学校', amount: 2500, status: '处理中', time: '2024-01-01 09:15' },
        { id: 'ORD-20240101-003', customer: 'ZZ医院', amount: 1800, status: '已完成', time: '2024-01-01 08:45' },
        { id: 'ORD-20240101-004', customer: 'AA企业', amount: 3200, status: '待处理', time: '2024-01-01 08:00' }
      ]
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px 0;
}

.dashboard h2 {
  margin-bottom: 30px;
  color: #3498db;
}
</style>