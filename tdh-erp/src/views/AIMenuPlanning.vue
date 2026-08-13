<template>
  <div class="ai-menu">
    <h2>AI智能排菜</h2>
    <div class="card">
      <h3>排菜设置</h3>
      <form @submit.prevent="generateMenu">
        <div class="form-group">
          <label for="menuDate">排菜日期</label>
          <input type="date" id="menuDate" v-model="menuParams.date">
        </div>
        <div class="form-group">
          <label for="menuType">餐别类型</label>
          <select id="menuType" v-model="menuParams.type">
            <option value="breakfast">早餐</option>
            <option value="lunch">午餐</option>
            <option value="dinner">晚餐</option>
            <option value="all">全天</option>
          </select>
        </div>
        <div class="form-group">
          <label for="menuGuests">用餐人数</label>
          <input type="number" id="menuGuests" v-model="menuParams.guests" placeholder="请输入用餐人数">
        </div>
        <div class="form-group">
          <label for="menuBudget">人均预算</label>
          <input type="number" id="menuBudget" v-model="menuParams.budget" placeholder="请输入人均预算">
        </div>
        <div class="form-group">
          <label for="menuPreferences">口味偏好</label>
          <select id="menuPreferences" v-model="menuParams.preferences" multiple>
            <option value="spicy">辣</option>
            <option value="sweet">甜</option>
            <option value="sour">酸</option>
            <option value="salty">咸</option>
            <option value="bland">清淡</option>
          </select>
        </div>
        <div class="form-group">
          <label for="menuRestrictions">饮食禁忌</label>
          <select id="menuRestrictions" v-model="menuParams.restrictions" multiple>
            <option value="pork">猪肉</option>
            <option value="beef">牛肉</option>
            <option value="mutton">羊肉</option>
            <option value="fish">鱼肉</option>
            <option value="egg">鸡蛋</option>
            <option value="dairy">乳制品</option>
            <option value="nuts">坚果</option>
          </select>
        </div>
        <div class="form-group">
          <label>智能选项</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" v-model="menuParams.useInventory">
              考虑库存情况
            </label>
            <label class="checkbox-item">
              <input type="checkbox" v-model="menuParams.seasonalIngredients">
              使用季节性食材
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>菜单模板</label>
          <div class="template-group">
            <button 
              v-for="template in menuTemplates" 
              :key="template.id"
              type="button"
              class="btn btn-secondary template-btn"
              @click="applyTemplate(template.id)"
            >
              {{ template.name }}
            </button>
          </div>
        </div>
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '生成中...' : '生成菜单' }}
        </button>
      </form>
    </div>
    <div class="card">
      <h3>AI生成菜单</h3>
      <div v-if="generatedMenu" class="menu-result">
        <div class="menu-header">
          <h4>{{ generatedMenu.date }} - {{ getMealTypeName(generatedMenu.type) }}</h4>
          <p>用餐人数: {{ generatedMenu.guests }}人 | 人均预算: ¥{{ generatedMenu.budget }} | 营养评分: {{ generatedMenu.nutritionScore }}分 | 预估成本: ¥{{ generatedMenu.cost }}</p>
        </div>
        <div class="menu-courses">
          <div v-for="(course, index) in generatedMenu.courses" :key="index" class="course-item">
            <h5>{{ course.name }}</h5>
            <ul>
              <li v-for="(dish, dishIndex) in course.dishes" :key="dishIndex" :class="{ 'dish-unavailable': !dish.available }">
                {{ dish.name }} - {{ dish.description }} ({{ dish.calories }}卡路里) - ¥{{ dish.cost }}
                <span v-if="!dish.available" class="availability-badge">食材不足</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="menu-nutrition">
          <h5>营养分析</h5>
          <div class="nutrition-grid">
            <div class="nutrition-item">
              <span class="nutrition-label">蛋白质</span>
              <span class="nutrition-value">{{ generatedMenu.nutrition.protein }}g</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">碳水化合物</span>
              <span class="nutrition-value">{{ generatedMenu.nutrition.carbohydrates }}g</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">脂肪</span>
              <span class="nutrition-value">{{ generatedMenu.nutrition.fat }}g</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">纤维素</span>
              <span class="nutrition-value">{{ generatedMenu.nutrition.fiber }}g</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">维生素</span>
              <span class="nutrition-value">{{ generatedMenu.nutrition.vitamins }}</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">矿物质</span>
              <span class="nutrition-value">{{ generatedMenu.nutrition.minerals }}</span>
            </div>
          </div>
        </div>
        <div class="menu-actions">
          <button class="btn btn-primary">保存菜单</button>
          <button class="btn btn-secondary">调整菜单</button>
          <button class="btn btn-secondary">导出菜单</button>
        </div>
      </div>
      <div v-else class="no-results">
        <p>请点击"生成菜单"按钮获取AI智能排菜结果</p>
      </div>
    </div>
    <div class="card">
      <h3>历史菜单</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>餐别</th>
              <th>用餐人数</th>
              <th>人均预算</th>
              <th>营养评分</th>
              <th>成本</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="menu in menuHistory" :key="menu.id">
              <td>{{ menu.date }}</td>
              <td>{{ getMealTypeName(menu.type) }}</td>
              <td>{{ menu.guests }}人</td>
              <td>¥{{ menu.budget }}</td>
              <td>{{ menu.nutritionScore }}分</td>
              <td>¥{{ menu.cost }}</td>
              <td>
                <button class="btn btn-secondary">查看</button>
                <button class="btn btn-primary">复制</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIMenuPlanning',
  data() {
    return {
      menuParams: {
        date: '',
        type: 'lunch',
        guests: 100,
        budget: 30,
        preferences: [],
        restrictions: [],
        useInventory: true,
        seasonalIngredients: true
      },
      generatedMenu: null,
      menuHistory: [],
      menuTemplates: [
        { id: 1, name: '商务套餐', description: '适合商务宴请' },
        { id: 2, name: '员工午餐', description: '适合企业员工' },
        { id: 3, name: '健康套餐', description: '低卡路里健康饮食' },
        { id: 4, name: '节日套餐', description: '适合节日庆祝' }
      ],
      inventoryItems: [
        { id: 1, name: '黄瓜', quantity: 50, unit: 'kg', status: '充足' },
        { id: 2, name: '土豆', quantity: 100, unit: 'kg', status: '充足' },
        { id: 3, name: '鸡肉', quantity: 80, unit: 'kg', status: '充足' },
        { id: 4, name: '猪肉', quantity: 60, unit: 'kg', status: '充足' },
        { id: 5, name: '西兰花', quantity: 30, unit: 'kg', status: '不足' },
        { id: 6, name: '西红柿', quantity: 40, unit: 'kg', status: '充足' },
        { id: 7, name: '鸡蛋', quantity: 200, unit: '个', status: '充足' }
      ],
      loading: false,
      error: null
    }
  },
  mounted() {
    this.loadMenuHistory();
  },
  methods: {
    async generateMenu() {
      this.loading = true;
      this.error = null;
      
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 模拟动态生成菜单
        const menu = this.generateDynamicMenu();
        this.generatedMenu = menu;
        
        // 保存到历史记录
        this.saveToHistory(menu);
        
        alert('菜单生成成功！');
      } catch (err) {
        this.error = '生成菜单失败，请重试';
        console.error('生成菜单失败:', err);
      } finally {
        this.loading = false;
      }
    },
    generateDynamicMenu() {
      // 根据参数动态生成菜单
      const courses = [];
      
      // 凉菜
      const coldDishes = this.generateDishes('凉菜', 2);
      if (coldDishes.length > 0) {
        courses.push({ name: '凉菜', dishes: coldDishes });
      }
      
      // 热菜
      const hotDishes = this.generateDishes('热菜', 3);
      if (hotDishes.length > 0) {
        courses.push({ name: '热菜', dishes: hotDishes });
      }
      
      // 主食
      const stapleDishes = this.generateDishes('主食', 2);
      if (stapleDishes.length > 0) {
        courses.push({ name: '主食', dishes: stapleDishes });
      }
      
      // 汤品
      const soupDishes = this.generateDishes('汤品', 1);
      if (soupDishes.length > 0) {
        courses.push({ name: '汤品', dishes: soupDishes });
      }
      
      // 计算营养成分
      const nutrition = this.calculateNutrition(courses);
      
      return {
        date: this.menuParams.date || new Date().toISOString().split('T')[0],
        type: this.menuParams.type,
        guests: this.menuParams.guests,
        budget: this.menuParams.budget,
        nutritionScore: Math.floor(Math.random() * 10) + 85, // 85-95分
        courses: courses,
        nutrition: nutrition,
        cost: this.calculateCost(courses)
      };
    },
    generateDishes(courseType, count) {
      const dishes = [];
      const dishTemplates = {
        '凉菜': [
          { name: '凉拌黄瓜', description: '清爽可口', calories: 80, cost: 5 },
          { name: '酸辣土豆丝', description: '开胃小菜', calories: 120, cost: 6 },
          { name: '凉拌木耳', description: '营养健康', calories: 90, cost: 7 },
          { name: '拍黄瓜', description: '简单清爽', calories: 70, cost: 4 }
        ],
        '热菜': [
          { name: '宫保鸡丁', description: '经典川菜', calories: 250, cost: 15 },
          { name: '鱼香肉丝', description: '酸甜可口', calories: 220, cost: 12 },
          { name: '蒜蓉西兰花', description: '健康蔬菜', calories: 100, cost: 8 },
          { name: '红烧肉', description: '肥而不腻', calories: 300, cost: 20 },
          { name: '糖醋排骨', description: '酸甜适中', calories: 280, cost: 18 }
        ],
        '主食': [
          { name: '白米饭', description: '香软可口', calories: 150, cost: 2 },
          { name: '馒头', description: '传统面食', calories: 180, cost: 1.5 },
          { name: '面条', description: '劲道爽口', calories: 160, cost: 3 },
          { name: '炒饭', description: '香气四溢', calories: 200, cost: 5 }
        ],
        '汤品': [
          { name: '番茄鸡蛋汤', description: '营养丰富', calories: 90, cost: 6 },
          { name: '酸辣汤', description: '开胃暖心', calories: 110, cost: 8 },
          { name: '冬瓜汤', description: '清淡解暑', calories: 80, cost: 5 },
          { name: '排骨汤', description: '滋补营养', calories: 150, cost: 12 }
        ]
      };
      
      const availableTemplates = dishTemplates[courseType] || [];
      
      // 随机选择菜品，确保不重复
      const selectedIndexes = new Set();
      while (dishes.length < count && selectedIndexes.size < availableTemplates.length) {
        const randomIndex = Math.floor(Math.random() * availableTemplates.length);
        if (!selectedIndexes.has(randomIndex)) {
          selectedIndexes.add(randomIndex);
          const template = availableTemplates[randomIndex];
          dishes.push({
            ...template,
            // 根据库存状态调整
            available: this.checkIngredientAvailability(template.name)
          });
        }
      }
      
      return dishes;
    },
    checkIngredientAvailability(dishName) {
      // 简单模拟食材可用性检查
      const ingredientMap = {
        '凉拌黄瓜': '黄瓜',
        '酸辣土豆丝': '土豆',
        '宫保鸡丁': '鸡肉',
        '鱼香肉丝': '猪肉',
        '蒜蓉西兰花': '西兰花',
        '番茄鸡蛋汤': '西红柿'
      };
      
      const ingredient = ingredientMap[dishName];
      if (!ingredient) return true;
      
      const inventoryItem = this.inventoryItems.find(item => item.name === ingredient);
      return inventoryItem ? inventoryItem.status === '充足' : true;
    },
    calculateNutrition(courses) {
      let protein = 0;
      let carbohydrates = 0;
      let fat = 0;
      let fiber = 0;
      
      courses.forEach(course => {
        course.dishes.forEach(dish => {
          // 模拟营养成分计算
          protein += Math.floor(Math.random() * 10) + 5;
          carbohydrates += Math.floor(Math.random() * 15) + 10;
          fat += Math.floor(Math.random() * 5) + 2;
          fiber += Math.floor(Math.random() * 3) + 1;
        });
      });
      
      return {
        protein: protein,
        carbohydrates: carbohydrates,
        fat: fat,
        fiber: fiber,
        vitamins: '丰富',
        minerals: '均衡'
      };
    },
    calculateCost(courses) {
      let totalCost = 0;
      courses.forEach(course => {
        course.dishes.forEach(dish => {
          totalCost += dish.cost || 0;
        });
      });
      return totalCost;
    },
    async loadMenuHistory() {
      this.loading = true;
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.menuHistory = [
          { id: 1, date: '2026-03-12', type: 'lunch', guests: 100, budget: 30, nutritionScore: 92, cost: 850 },
          { id: 2, date: '2026-03-12', type: 'dinner', guests: 80, budget: 40, nutritionScore: 88, cost: 960 },
          { id: 3, date: '2026-03-11', type: 'lunch', guests: 120, budget: 25, nutritionScore: 85, cost: 900 },
          { id: 4, date: '2026-03-11', type: 'dinner', guests: 90, budget: 35, nutritionScore: 90, cost: 1080 }
        ];
      } catch (err) {
        this.error = '加载历史菜单失败';
        console.error('加载历史菜单失败:', err);
      } finally {
        this.loading = false;
      }
    },
    saveToHistory(menu) {
      const newHistoryItem = {
        id: Date.now(),
        date: menu.date,
        type: menu.type,
        guests: menu.guests,
        budget: menu.budget,
        nutritionScore: menu.nutritionScore,
        cost: menu.cost
      };
      this.menuHistory.unshift(newHistoryItem);
    },
    applyTemplate(templateId) {
      // 模拟应用模板
      const template = this.menuTemplates.find(t => t.id === templateId);
      if (template) {
        alert(`已应用模板: ${template.name}`);
        // 根据模板调整参数
        if (template.name === '商务套餐') {
          this.menuParams.budget = 50;
        } else if (template.name === '员工午餐') {
          this.menuParams.budget = 25;
        } else if (template.name === '健康套餐') {
          this.menuParams.preferences = ['bland'];
        }
      }
    },
    getMealTypeName(type) {
      const typeMap = {
        breakfast: '早餐',
        lunch: '午餐',
        dinner: '晚餐',
        all: '全天'
      };
      return typeMap[type] || type;
    }
  }
}
</script>

<style scoped>
.ai-menu {
  padding: 20px 0;
}

.ai-menu h2 {
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

.menu-result {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.menu-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.menu-header h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.menu-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.menu-courses {
  margin-bottom: 20px;
}

.course-item {
  margin-bottom: 15px;
}

.course-item h5 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.course-item ul {
  margin: 0;
  padding-left: 20px;
}

.course-item li {
  margin-bottom: 5px;
  color: #666;
  font-size: 14px;
}

.menu-nutrition {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f8ff;
  border-radius: 8px;
}

.menu-nutrition h5 {
  margin: 0 0 15px 0;
  color: #333;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.nutrition-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
}

.nutrition-label {
  color: #666;
  font-size: 14px;
}

.nutrition-value {
  color: #3498db;
  font-weight: bold;
  font-size: 14px;
}

.menu-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.no-results {
  text-align: center;
  padding: 50px 0;
  color: #999;
}

.table-container {
  margin-bottom: 20px;
}

.checkbox-group {
  display: flex;
  gap: 20px;
  margin-top: 5px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.template-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.template-btn {
  margin-bottom: 5px;
}

.dish-unavailable {
  color: #999;
  text-decoration: line-through;
}

.availability-badge {
  display: inline-block;
  background-color: #e74c3c;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 10px;
}

.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>