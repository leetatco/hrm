<template>
  <div class="quality">
    <h2>质量管理</h2>
    <div class="card">
      <h3>质量检测记录</h3>
      <div class="search-bar">
        <input type="text" placeholder="搜索检测记录" v-model="searchQuery">
        <button class="btn btn-primary">搜索</button>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>检测编号</th>
              <th>检测项目</th>
              <th>检测结果</th>
              <th>检测时间</th>
              <th>检测人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in filteredRecords" :key="record.id">
              <td>{{ record.id }}</td>
              <td>{{ record.item }}</td>
              <td :class="record.result === '合格' ? 'pass' : 'fail'">
                {{ record.result }}
              </td>
              <td>{{ record.time }}</td>
              <td>{{ record.operator }}</td>
              <td>
                <button class="btn btn-secondary">查看</button>
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
      <h3>添加检测记录</h3>
      <form @submit.prevent="addQualityRecord">
        <div class="form-group">
          <label for="recordItem">检测项目</label>
          <input type="text" id="recordItem" v-model="newRecord.item" placeholder="请输入检测项目">
        </div>
        <div class="form-group">
          <label for="recordResult">检测结果</label>
          <select id="recordResult" v-model="newRecord.result">
            <option value="合格">合格</option>
            <option value="不合格">不合格</option>
          </select>
        </div>
        <div class="form-group">
          <label for="recordNote">备注</label>
          <textarea id="recordNote" v-model="newRecord.note" placeholder="请输入备注"></textarea>
        </div>
        <div class="form-group">
          <label for="recordTime">检测时间</label>
          <input type="datetime-local" id="recordTime" v-model="newRecord.time">
        </div>
        <button type="submit" class="btn btn-primary">添加记录</button>
      </form>
    </div>
    <div class="card">
      <h3>质量统计</h3>
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>总检测次数</h3>
          <div class="value">{{ totalTests }}</div>
        </div>
        <div class="dashboard-card">
          <h3>合格次数</h3>
          <div class="value">{{ passTests }}</div>
        </div>
        <div class="dashboard-card">
          <h3>不合格次数</h3>
          <div class="value">{{ failTests }}</div>
        </div>
        <div class="dashboard-card">
          <h3>合格率</h3>
          <div class="value">{{ passRate }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Quality',
  data() {
    return {
      searchQuery: '',
      totalTests: 120,
      passTests: 115,
      failTests: 5,
      passRate: 95.8,
      newRecord: {
        item: '',
        result: '合格',
        note: '',
        time: ''
      },
      records: [
        { id: 'Q-20240101-001', item: '食材新鲜度', result: '合格', time: '2024-01-01 10:30', operator: '张三' },
        { id: 'Q-20240101-002', item: '食品卫生', result: '合格', time: '2024-01-01 09:15', operator: '李四' },
        { id: 'Q-20240101-003', item: '加工工艺', result: '合格', time: '2024-01-01 08:45', operator: '王五' },
        { id: 'Q-20240101-004', item: '包装质量', result: '不合格', time: '2024-01-01 08:00', operator: '赵六' }
      ]
    }
  },
  computed: {
    filteredRecords() {
      if (!this.searchQuery) {
        return this.records;
      }
      return this.records.filter(record => 
        record.item.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        record.operator.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  methods: {
    addQualityRecord() {
      // 添加检测记录逻辑
      alert('检测记录添加成功！');
    }
  }
}
</script>

<style scoped>
.quality {
  padding: 20px 0;
}

.quality h2 {
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

.pass {
  color: #27ae60;
  font-weight: bold;
}

.fail {
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}
</style>