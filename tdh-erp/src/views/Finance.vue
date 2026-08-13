<template>
  <div class="finance">
    <h2>财务管理</h2>
    <div class="card">
      <h3>财务概览</h3>
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>本月收入</h3>
          <div class="value">¥{{ monthIncome }}</div>
          <div class="change positive">+15%</div>
        </div>
        <div class="dashboard-card">
          <h3>本月支出</h3>
          <div class="value">¥{{ monthExpense }}</div>
          <div class="change negative">+8%</div>
        </div>
        <div class="dashboard-card">
          <h3>本月利润</h3>
          <div class="value">¥{{ monthProfit }}</div>
          <div class="change positive">+20%</div>
        </div>
        <div class="dashboard-card">
          <h3>总余额</h3>
          <div class="value">¥{{ totalBalance }}</div>
          <div class="change positive">+5%</div>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>收支记录</h3>
      <div class="search-bar">
        <input type="text" placeholder="搜索记录" v-model="searchQuery">
        <button class="btn btn-primary">搜索</button>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>类型</th>
              <th>金额</th>
              <th>描述</th>
              <th>操作人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in filteredRecords" :key="record.id">
              <td>{{ record.date }}</td>
              <td>{{ record.type }}</td>
              <td :class="record.type === '收入' ? 'income' : 'expense'">
                {{ record.type === '收入' ? '+' : '-' }}¥{{ record.amount }}
              </td>
              <td>{{ record.description }}</td>
              <td>{{ record.operator }}</td>
              <td>
                <button class="btn btn-secondary">编辑</button>
                <button class="btn btn-danger">删除</button>
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
      <h3>添加收支记录</h3>
      <form @submit.prevent="addFinanceRecord">
        <div class="form-group">
          <label for="recordType">类型</label>
          <select id="recordType" v-model="newRecord.type">
            <option value="收入">收入</option>
            <option value="支出">支出</option>
          </select>
        </div>
        <div class="form-group">
          <label for="recordAmount">金额</label>
          <input type="number" id="recordAmount" v-model="newRecord.amount" placeholder="请输入金额">
        </div>
        <div class="form-group">
          <label for="recordDescription">描述</label>
          <input type="text" id="recordDescription" v-model="newRecord.description" placeholder="请输入描述">
        </div>
        <div class="form-group">
          <label for="recordDate">日期</label>
          <input type="date" id="recordDate" v-model="newRecord.date">
        </div>
        <button type="submit" class="btn btn-primary">添加记录</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Finance',
  data() {
    return {
      searchQuery: '',
      monthIncome: 380000,
      monthExpense: 250000,
      monthProfit: 130000,
      totalBalance: 1200000,
      newRecord: {
        type: '收入',
        amount: 0,
        description: '',
        date: ''
      },
      records: [
        { id: 1, date: '2024-01-01', type: '收入', amount: 1200, description: 'XX公司订单', operator: '张三' },
        { id: 2, date: '2024-01-01', type: '支出', amount: 800, description: '采购食材', operator: '李四' },
        { id: 3, date: '2023-12-31', type: '收入', amount: 2500, description: 'YY学校订单', operator: '王五' },
        { id: 4, date: '2023-12-31', type: '支出', amount: 1200, description: '支付工资', operator: '赵六' }
      ]
    }
  },
  computed: {
    filteredRecords() {
      if (!this.searchQuery) {
        return this.records;
      }
      return this.records.filter(record => 
        record.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        record.operator.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  methods: {
    addFinanceRecord() {
      // 添加收支记录逻辑
      alert('收支记录添加成功！');
    }
  }
}
</script>

<style scoped>
.finance {
  padding: 20px 0;
}

.finance h2 {
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

.income {
  color: #27ae60;
  font-weight: bold;
}

.expense {
  color: #e74c3c;
  font-weight: bold;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
</style>