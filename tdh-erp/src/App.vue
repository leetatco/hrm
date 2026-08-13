<template>
  <div id="app">
    <header class="app-header">
      <h1>团餐中央厨房ERP系统</h1>
      <div class="user-info">
        <span>欢迎，管理员</span>
        <button @click="logout">退出</button>
      </div>
    </header>
    <div class="app-container">
      <aside class="sidebar">
        <nav>
          <ul>
            <li v-for="item in menuItems" :key="item.id">
              <router-link :to="item.id">{{ item.name }}</router-link>
            </li>
          </ul>
        </nav>
      </aside>
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      menuItems: [
        { id: '/dashboard', name: '数据看板' },
        { id: '/basic', name: '基础设置' },
        { id: '/supply', name: '供应链管理' },
        { id: '/inventory', name: '库存管理' },
        { id: '/production', name: '生产管理' },
        { id: '/sales', name: '销售管理' },
        { id: '/finance', name: '财务管理' },
        { id: '/personnel', name: '人员管理' },
        { id: '/quality', name: '质量管理' },
        { id: '/analysis', name: '数据分析' },
        { id: '/ai-demand', name: 'AI预测需求' },
        { id: '/ai-menu', name: 'AI智能排菜' }
      ]
    }
  },
  methods: {
    logout() {
      // 退出登录逻辑
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #3498db;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info button {
  background-color: #2980b9;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.app-container {
  flex: 1;
  display: flex;
}

.sidebar {
  width: 200px;
  background-color: #f1f1f1;
  padding: 1rem;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar nav ul li {
  margin-bottom: 0.5rem;
}

.sidebar nav ul li a {
  display: block;
  padding: 0.5rem;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.sidebar nav ul li a:hover {
  background-color: #ddd;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #fff;
}

.main-content h2 {
  margin-top: 0;
  color: #3498db;
}
</style>