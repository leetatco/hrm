<template>
  <div class="sales">
    <h2>销售管理</h2>
    <div class="card">
      <h3>客户管理</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>客户名称</th>
              <th>联系人</th>
              <th>联系电话</th>
              <th>地址</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.id">
              <td>{{ customer.name }}</td>
              <td>{{ customer.contact }}</td>
              <td>{{ customer.phone }}</td>
              <td>{{ customer.address }}</td>
              <td>{{ customer.status }}</td>
              <td>
                <button class="btn btn-secondary">编辑</button>
                <button class="btn btn-danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn btn-primary" style="margin-top: 20px;">添加客户</button>
    </div>
    <div class="card">
      <h3>订单管理</h3>
      <div class="search-bar">
        <input type="text" placeholder="搜索订单号或客户名称" v-model="searchQuery">
        <button class="btn btn-primary">搜索</button>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>客户</th>
              <th>金额</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.customer }}</td>
              <td>¥{{ order.amount }}</td>
              <td>{{ order.status }}</td>
              <td>{{ order.createTime }}</td>
              <td>
                <button class="btn btn-secondary">查看</button>
                <button class="btn btn-primary">编辑</button>
                <button class="btn btn-danger">取消</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button class="btn btn-secondary">上一页</button>
        <button class="btn btn-primary">1</button>
        <button class="btn btn-secondary">2</button>
        <button class="btn btn-secondary">3</button>
        <button class="btn btn-secondary">下一页</button>
      </div>
    </div>
    <div class="card">
      <h3>销售统计</h3>
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>今日销售</h3>
          <div class="value">¥{{ todaySales }}</div>
          <div class="change positive">+15%</div>
        </div>
        <div class="dashboard-card">
          <h3>本月销售</h3>
          <div class="value">¥{{ monthSales }}</div>
          <div class="change positive">+8%</div>
        </div>
        <div class="dashboard-card">
          <h3>本年销售</h3>
          <div class="value">¥{{ yearSales }}</div>
          <div class="change positive">+12%</div>
        </div>
        <div class="dashboard-card">
          <h3>订单数量</h3>
          <div class="value">{{ orderCount }}</div>
          <div class="change positive">+5%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sales',
  data() {
    return {
      searchQuery: '',
      todaySales: 12500,
      monthSales: 380000,
      yearSales: 4500000,
      orderCount: 128,
      customers: [
        { id: 1, name: 'XX公司', contact: '张三', phone: '13800138001', address: '广州市天河区', status: '活跃' },
        { id: 2, name: 'YY学校', contact: '李四', phone: '13900139001', address: '广州市白云区', status: '活跃' },
        { id: 3, name: 'ZZ医院', contact: '王五', phone: '13700137001', address: '广州市海珠区', status: '活跃' },
        { id: 4, name: 'AA企业', contact: '赵六', phone: '13600136001', address: '广州市番禺区', status: '禁用' }
      ],
      orders: [
        { id: 'ORD-20240101-001', customer: 'XX公司', amount: 1200, status: '已完成', createTime: '2024-01-01 10:30' },
        { id: 'ORD-20240101-002', customer: 'YY学校', amount: 2500, status: '处理中', createTime: '2024-01-01 09:15' },
        { id: 'ORD-20240101-003', customer: 'ZZ医院', amount: 1800, status: '已完成', createTime: '2024-01-01 08:45' },
        { id: 'ORD-20240101-004', customer: 'AA企业', amount: 3200, status: '待处理', createTime: '2024-01-01 08:00' }
      ]
    }
  },
  computed: {
    filteredOrders() {
      if (!this.searchQuery) {
        return this.orders;
      }
      return this.orders.filter(order => 
        order.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
}
</script>

<style scoped>
.sales {
  padding: 20px 0;
}

.sales h2 {
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

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-bar input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn {
  margin-right: 10px;
}

.dashboard-grid {
  margin-bottom: 30px;
}
</style>