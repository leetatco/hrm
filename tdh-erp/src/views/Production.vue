<template>
  <div class="production">
    <h2>生产管理</h2>
    <div class="card">
      <h3>生产计划</h3>
      <form @submit.prevent="createProductionPlan">
        <div class="form-group">
          <label for="planName">计划名称</label>
          <input type="text" id="planName" v-model="productionPlan.name" placeholder="请输入生产计划名称">
        </div>
        <div class="form-group">
          <label for="planDate">计划日期</label>
          <input type="date" id="planDate" v-model="productionPlan.date">
        </div>
        <div class="form-group">
          <label for="planTarget">生产目标</label>
          <input type="text" id="planTarget" v-model="productionPlan.target" placeholder="请输入生产目标">
        </div>
        <div class="form-group">
          <label>生产任务</label>
          <div v-for="(task, index) in productionPlan.tasks" :key="index" class="production-task">
            <input type="text" v-model="task.name" placeholder="任务名称">
            <input type="number" v-model="task.quantity" placeholder="数量">
            <input type="text" v-model="task.unit" placeholder="单位">
            <button type="button" class="btn btn-danger" @click="removeTask(index)">删除</button>
          </div>
          <button type="button" class="btn btn-secondary" @click="addTask">添加任务</button>
        </div>
        <button type="submit" class="btn btn-primary">创建生产计划</button>
      </form>
    </div>
    <div class="card">
      <h3>生产任务列表</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>计划数量</th>
              <th>已完成数量</th>
              <th>状态</th>
              <th>负责人</th>
              <th>开始时间</th>
              <th>结束时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in productionTasks" :key="task.id">
              <td>{{ task.name }}</td>
              <td>{{ task.planQuantity }}</td>
              <td>{{ task.completedQuantity }}</td>
              <td>{{ task.status }}</td>
              <td>{{ task.responsible }}</td>
              <td>{{ task.startTime }}</td>
              <td>{{ task.endTime }}</td>
              <td>
                <button class="btn btn-secondary">编辑</button>
                <button class="btn btn-primary">开始</button>
                <button class="btn btn-danger">完成</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <h3>生产进度</h3>
      <div class="progress-container">
        <div v-for="task in productionTasks" :key="task.id" class="progress-item">
          <div class="progress-header">
            <h4>{{ task.name }}</h4>
            <span>{{ task.status }}</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: (task.completedQuantity / task.planQuantity) * 100 + '%' }"
            ></div>
          </div>
          <div class="progress-info">
            {{ task.completedQuantity }} / {{ task.planQuantity }} {{ task.unit }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Production',
  data() {
    return {
      productionPlan: {
        name: '',
        date: '',
        target: '',
        tasks: [
          { name: '', quantity: 1, unit: '' }
        ]
      },
      productionTasks: [
        { id: 1, name: '制作米饭', planQuantity: 500, completedQuantity: 300, status: '进行中', responsible: '张三', startTime: '2024-01-01 08:00', endTime: '' },
        { id: 2, name: '炒菜', planQuantity: 200, completedQuantity: 150, status: '进行中', responsible: '李四', startTime: '2024-01-01 08:30', endTime: '' },
        { id: 3, name: '打包', planQuantity: 500, completedQuantity: 250, status: '进行中', responsible: '王五', startTime: '2024-01-01 09:00', endTime: '' },
        { id: 4, name: '配送', planQuantity: 500, completedQuantity: 100, status: '待开始', responsible: '赵六', startTime: '', endTime: '' }
      ]
    }
  },
  methods: {
    addTask() {
      this.productionPlan.tasks.push({ name: '', quantity: 1, unit: '' });
    },
    removeTask(index) {
      this.productionPlan.tasks.splice(index, 1);
    },
    createProductionPlan() {
      // 创建生产计划逻辑
      alert('生产计划创建成功！');
    }
  }
}
</script>

<style scoped>
.production {
  padding: 20px 0;
}

.production h2 {
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.production-task {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.production-task input {
  flex: 1;
}

.btn {
  margin-right: 10px;
}

.table-container {
  margin-bottom: 20px;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-item {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-header h4 {
  margin: 0;
  color: #333;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background-color: #3498db;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-info {
  text-align: right;
  font-size: 14px;
  color: #666;
}
</style>