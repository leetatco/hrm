<template>
  <div class="basic-settings">
    <h2>基础设置</h2>
    <div class="card">
      <h3>企业信息</h3>
      <form @submit.prevent="saveCompanyInfo">
        <div class="form-group">
          <label for="companyName">企业名称</label>
          <input type="text" id="companyName" v-model="companyInfo.name" placeholder="请输入企业名称">
        </div>
        <div class="form-group">
          <label for="companyAddress">企业地址</label>
          <input type="text" id="companyAddress" v-model="companyInfo.address" placeholder="请输入企业地址">
        </div>
        <div class="form-group">
          <label for="companyPhone">联系电话</label>
          <input type="text" id="companyPhone" v-model="companyInfo.phone" placeholder="请输入联系电话">
        </div>
        <button type="submit" class="btn btn-primary">保存</button>
      </form>
    </div>
    <div class="card">
      <h3>系统设置</h3>
      <form @submit.prevent="saveSystemSettings">
        <div class="form-group">
          <label for="systemName">系统名称</label>
          <input type="text" id="systemName" v-model="systemSettings.name" placeholder="请输入系统名称">
        </div>
        <div class="form-group">
          <label for="systemLogo">系统Logo</label>
          <input type="file" id="systemLogo" @change="handleLogoUpload">
        </div>
        <div class="form-group">
          <label for="systemTheme">系统主题</label>
          <select id="systemTheme" v-model="systemSettings.theme">
            <option value="light">浅色主题</option>
            <option value="dark">深色主题</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">保存</button>
      </form>
    </div>
    <div class="card">
      <h3>用户管理</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>角色</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.status }}</td>
              <td>
                <button class="btn btn-secondary">编辑</button>
                <button class="btn btn-danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn btn-primary" style="margin-top: 20px;">添加用户</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BasicSettings',
  data() {
    return {
      companyInfo: {
        name: '团餐中央厨房',
        address: '广州市天河区',
        phone: '12345678901'
      },
      systemSettings: {
        name: '团餐中央厨房ERP系统',
        theme: 'light'
      },
      users: [
        { id: 1, username: 'admin', role: '管理员', status: '活跃' },
        { id: 2, username: 'user1', role: '普通用户', status: '活跃' },
        { id: 3, username: 'user2', role: '普通用户', status: '禁用' }
      ]
    }
  },
  methods: {
    saveCompanyInfo() {
      // 保存企业信息逻辑
      alert('企业信息保存成功！');
    },
    saveSystemSettings() {
      // 保存系统设置逻辑
      alert('系统设置保存成功！');
    },
    handleLogoUpload() {
      // 处理Logo上传逻辑
    }
  }
}
</script>

<style scoped>
.basic-settings {
  padding: 20px 0;
}

.basic-settings h2 {
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  margin-right: 10px;
}

.table-container {
  margin-bottom: 20px;
}
</style>