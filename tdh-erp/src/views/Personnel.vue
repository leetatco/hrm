<template>
  <div class="personnel">
    <h2>人员管理</h2>
    <div class="card">
      <h3>员工列表</h3>
      <div class="search-bar">
        <input type="text" placeholder="搜索员工姓名或工号" v-model="searchQuery">
        <button class="btn btn-primary">搜索</button>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>工号</th>
              <th>姓名</th>
              <th>部门</th>
              <th>职位</th>
              <th>联系电话</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in filteredEmployees" :key="employee.id">
              <td>{{ employee.id }}</td>
              <td>{{ employee.name }}</td>
              <td>{{ employee.department }}</td>
              <td>{{ employee.position }}</td>
              <td>{{ employee.phone }}</td>
              <td>{{ employee.status }}</td>
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
      <h3>添加员工</h3>
      <form @submit.prevent="addEmployee">
        <div class="form-group">
          <label for="employeeId">工号</label>
          <input type="text" id="employeeId" v-model="newEmployee.id" placeholder="请输入工号">
        </div>
        <div class="form-group">
          <label for="employeeName">姓名</label>
          <input type="text" id="employeeName" v-model="newEmployee.name" placeholder="请输入姓名">
        </div>
        <div class="form-group">
          <label for="employeeDepartment">部门</label>
          <select id="employeeDepartment" v-model="newEmployee.department">
            <option value="">请选择部门</option>
            <option value="采购部">采购部</option>
            <option value="生产部">生产部</option>
            <option value="销售部">销售部</option>
            <option value="财务部">财务部</option>
            <option value="行政部">行政部</option>
          </select>
        </div>
        <div class="form-group">
          <label for="employeePosition">职位</label>
          <input type="text" id="employeePosition" v-model="newEmployee.position" placeholder="请输入职位">
        </div>
        <div class="form-group">
          <label for="employeePhone">联系电话</label>
          <input type="text" id="employeePhone" v-model="newEmployee.phone" placeholder="请输入联系电话">
        </div>
        <div class="form-group">
          <label for="employeeStatus">状态</label>
          <select id="employeeStatus" v-model="newEmployee.status">
            <option value="在职">在职</option>
            <option value="离职">离职</option>
            <option value="请假">请假</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">添加员工</button>
      </form>
    </div>
    <div class="card">
      <h3>部门管理</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>部门名称</th>
              <th>负责人</th>
              <th>员工数量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="department in departments" :key="department.id">
              <td>{{ department.name }}</td>
              <td>{{ department.manager }}</td>
              <td>{{ department.employeeCount }}</td>
              <td>
                <button class="btn btn-secondary">编辑</button>
                <button class="btn btn-danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn btn-primary" style="margin-top: 20px;">添加部门</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Personnel',
  data() {
    return {
      searchQuery: '',
      newEmployee: {
        id: '',
        name: '',
        department: '',
        position: '',
        phone: '',
        status: '在职'
      },
      employees: [
        { id: 'EMP001', name: '张三', department: '采购部', position: '采购员', phone: '13800138001', status: '在职' },
        { id: 'EMP002', name: '李四', department: '生产部', position: '生产主管', phone: '13900139001', status: '在职' },
        { id: 'EMP003', name: '王五', department: '销售部', position: '销售经理', phone: '13700137001', status: '在职' },
        { id: 'EMP004', name: '赵六', department: '财务部', position: '会计', phone: '13600136001', status: '在职' },
        { id: 'EMP005', name: '钱七', department: '行政部', position: '行政助理', phone: '13500135001', status: '离职' }
      ],
      departments: [
        { id: 1, name: '采购部', manager: '张三', employeeCount: 5 },
        { id: 2, name: '生产部', manager: '李四', employeeCount: 20 },
        { id: 3, name: '销售部', manager: '王五', employeeCount: 8 },
        { id: 4, name: '财务部', manager: '赵六', employeeCount: 3 },
        { id: 5, name: '行政部', manager: '钱七', employeeCount: 4 }
      ]
    }
  },
  computed: {
    filteredEmployees() {
      if (!this.searchQuery) {
        return this.employees;
      }
      return this.employees.filter(employee => 
        employee.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        employee.id.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  methods: {
    addEmployee() {
      // 添加员工逻辑
      alert('员工添加成功！');
    }
  }
}
</script>

<style scoped>
.personnel {
  padding: 20px 0;
}

.personnel h2 {
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