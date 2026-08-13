<template>
  <div class="inventory">
    <h2>库存管理</h2>
    <div class="card">
      <h3>库存概览</h3>
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>总库存量</h3>
          <div class="value">{{ totalInventory }}</div>
        </div>
        <div class="dashboard-card">
          <h3>低库存预警</h3>
          <div class="value">{{ lowStockCount }}</div>
        </div>
        <div class="dashboard-card">
          <h3>库存价值</h3>
          <div class="value">¥{{ inventoryValue }}</div>
        </div>
        <div class="dashboard-card">
          <h3>今日出库</h3>
          <div class="value">{{ todayOutbound }}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>库存列表</h3>
      <div class="search-bar">
        <input type="text" placeholder="搜索物品名称" v-model="searchQuery">
        <button class="btn btn-primary">搜索</button>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>物品名称</th>
              <th>分类</th>
              <th>库存数量</th>
              <th>单位</th>
              <th>单价</th>
              <th>库存价值</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unit }}</td>
              <td>¥{{ item.price }}</td>
              <td>¥{{ item.quantity * item.price }}</td>
              <td>{{ item.status }}</td>
              <td>
                <button class="btn btn-secondary">编辑</button>
                <button class="btn btn-primary">入库</button>
                <button class="btn btn-danger">出库</button>
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
      <h3>库存操作记录</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>操作时间</th>
              <th>操作类型</th>
              <th>物品名称</th>
              <th>数量</th>
              <th>操作人</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in inventoryRecords" :key="record.id">
              <td>{{ record.time }}</td>
              <td>{{ record.type }}</td>
              <td>{{ record.itemName }}</td>
              <td>{{ record.quantity }}</td>
              <td>{{ record.operator }}</td>
              <td>{{ record.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Inventory',
  data() {
    return {
      totalInventory: 5230,
      lowStockCount: 12,
      inventoryValue: 85000,
      todayOutbound: 320,
      searchQuery: '',
      items: [
        { id: 1, name: '大米', category: '粮食', quantity: 1000, unit: 'kg', price: 5, status: '正常' },
        { id: 2, name: '面粉', category: '粮食', quantity: 800, unit: 'kg', price: 4, status: '正常' },
        { id: 3, name: '食用油', category: '调料', quantity: 50, unit: 'L', price: 80, status: '正常' },
        { id: 4, name: '盐', category: '调料', quantity: 20, unit: 'kg', price: 3, status: '低库存' },
        { id: 5, name: '酱油', category: '调料', quantity: 30, unit: 'L', price: 20, status: '正常' },
        { id: 6, name: '蔬菜', category: '生鲜', quantity: 150, unit: 'kg', price: 6, status: '正常' },
        { id: 7, name: '肉类', category: '生鲜', quantity: 80, unit: 'kg', price: 30, status: '正常' },
        { id: 8, name: '鸡蛋', category: '生鲜', quantity: 50, unit: 'kg', price: 12, status: '低库存' }
      ],
      inventoryRecords: [
        { id: 1, time: '2024-01-01 10:30', type: '入库', itemName: '大米', quantity: 200, operator: '张三', note: '采购入库' },
        { id: 2, time: '2024-01-01 09:15', type: '出库', itemName: '蔬菜', quantity: 50, operator: '李四', note: '生产使用' },
        { id: 3, time: '2024-01-01 08:45', type: '入库', itemName: '肉类', quantity: 30, operator: '王五', note: '采购入库' },
        { id: 4, time: '2024-01-01 08:00', type: '出库', itemName: '面粉', quantity: 100, operator: '赵六', note: '生产使用' }
      ]
    }
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) {
        return this.items;
      }
      return this.items.filter(item => 
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
}
</script>

<style scoped>
.inventory {
  padding: 20px 0;
}

.inventory h2 {
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

.dashboard-grid {
  margin-bottom: 30px;
}
</style>