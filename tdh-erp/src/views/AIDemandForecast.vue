<template>
  <div class="ai-demand">
    <h2>AI预测需求</h2>
    <div class="card">
      <h3>需求预测设置</h3>
      <form @submit.prevent="generateForecast">
        <div class="form-group">
          <label for="forecastPeriod">预测周期</label>
          <select id="forecastPeriod" v-model="forecastParams.period">
            <option value="7">7天</option>
            <option value="14">14天</option>
            <option value="30">30天</option>
          </select>
        </div>
        <div class="form-group">
          <label for="forecastMethod">预测方法</label>
          <select id="forecastMethod" v-model="forecastParams.method">
            <option value="arima">ARIMA模型</option>
            <option value="lstm">LSTM神经网络</option>
            <option value="prophet">Prophet模型</option>
          </select>
        </div>
        <div class="form-group">
          <label for="forecastItems">预测物品</label>
          <select id="forecastItems" v-model="forecastParams.items" multiple>
            <option v-for="item in allItems" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </div>
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '预测中...' : '生成预测' }}
        </button>
      </form>
    </div>
    <div class="card">
      <h3>预测结果</h3>
      <div v-if="forecastResults.length > 0" class="forecast-results">
        <div v-for="result in forecastResults" :key="result.itemId" class="forecast-item">
          <h4>{{ result.itemName }}</h4>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="chart-bar" v-for="(value, index) in result.data" :key="index" :style="{ height: value + '%' }"></div>
            </div>
            <div class="chart-labels">
              <span v-for="(label, index) in result.labels" :key="index">{{ label }}</span>
            </div>
          </div>
          <div class="forecast-summary">
            <p>总预测需求: {{ result.totalDemand }} {{ result.unit }}</p>
            <p>平均日需求: {{ result.avgDailyDemand }} {{ result.unit }}</p>
            <p>峰值需求: {{ result.peakDemand }} {{ result.unit }}</p>
          </div>
        </div>
      </div>
      <div v-else class="no-results">
        <p>请点击"生成预测"按钮获取需求预测结果</p>
      </div>
    </div>
    <div class="card">
      <h3>历史预测对比</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>预测日期</th>
              <th>物品名称</th>
              <th>预测需求量</th>
              <th>实际需求量</th>
              <th>准确率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="history in forecastHistory" :key="history.id">
              <td>{{ history.date }}</td>
              <td>{{ history.itemName }}</td>
              <td>{{ history.forecastDemand }}</td>
              <td>{{ history.actualDemand }}</td>
              <td :class="history.accuracy >= 90 ? 'high' : history.accuracy >= 70 ? 'medium' : 'low'">
                {{ history.accuracy }}%
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
  name: 'AIDemandForecast',
  data() {
    return {
      forecastParams: {
        period: '7',
        method: 'arima',
        items: []
      },
      allItems: [
        { id: 1, name: '大米', unit: 'kg' },
        { id: 2, name: '面粉', unit: 'kg' },
        { id: 3, name: '食用油', unit: 'L' },
        { id: 4, name: '蔬菜', unit: 'kg' },
        { id: 5, name: '肉类', unit: 'kg' },
        { id: 6, name: '鸡蛋', unit: 'kg' }
      ],
      forecastResults: [],
      forecastHistory: [
        { id: 1, date: '2026-03-12', itemName: '大米', forecastDemand: 500, actualDemand: 480, accuracy: 96 },
        { id: 2, date: '2026-03-12', itemName: '面粉', forecastDemand: 300, actualDemand: 320, accuracy: 93.75 },
        { id: 3, date: '2026-03-11', itemName: '蔬菜', forecastDemand: 200, actualDemand: 180, accuracy: 90 },
        { id: 4, date: '2026-03-11', itemName: '肉类', forecastDemand: 100, actualDemand: 110, accuracy: 90.9 }
      ],
      loading: false,
      error: null
    }
  },
  methods: {
    async generateForecast() {
      this.loading = true;
      this.error = null;
      
      try {
        // 调用API
        const results = await this.callAIPredictionAPI();
        this.forecastResults = results;
        this.saveToHistory(results);
        alert('需求预测生成成功！');
      } catch (err) {
        this.error = '生成预测失败，请重试';
        console.error('生成预测失败:', err);
        // 失败时使用模拟数据
        this.useMockData();
      } finally {
        this.loading = false;
      }
    },
    async callAIPredictionAPI() {
      // 实际API调用
      try {
        // 这里是实际的API调用代码
        // const response = await fetch('/api/ai/demand', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(this.forecastParams)
        // });
        // 
        // if (!response.ok) {
        //   throw new Error('API调用失败');
        // }
        // 
        // return await response.json();
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 模拟API返回数据
        return this.generateMockData();
      } catch (error) {
        console.error('API调用失败:', error);
        throw error;
      }
    },
    generateMockData() {
      const period = parseInt(this.forecastParams.period);
      const results = [];
      
      // 为每个选择的物品生成预测数据
      this.forecastParams.items.forEach(itemId => {
        const item = this.allItems.find(i => i.id === parseInt(itemId));
        if (item) {
          const data = [];
          const labels = [];
          let totalDemand = 0;
          
          for (let i = 1; i <= period; i++) {
            const value = Math.floor(Math.random() * 50) + 50;
            data.push(value);
            labels.push(`第${i}天`);
            totalDemand += value;
          }
          
          results.push({
            itemId: item.id,
            itemName: item.name,
            unit: item.unit,
            data: data,
            labels: labels,
            totalDemand: totalDemand,
            avgDailyDemand: parseFloat((totalDemand / period).toFixed(1)),
            peakDemand: Math.max(...data)
          });
        }
      });
      
      return results;
    },
    useMockData() {
      // 使用模拟数据
      this.forecastResults = this.generateMockData();
    },
    saveToHistory(results) {
      // 保存到历史记录
      results.forEach(result => {
        const historyItem = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          itemName: result.itemName,
          forecastDemand: result.totalDemand,
          actualDemand: 0, // 实际需求需要后续填写
          accuracy: 0 // 准确率需要后续计算
        };
        this.forecastHistory.unshift(historyItem);
      });
    }
  }
}
</script>

<style scoped>
.ai-demand {
  padding: 20px 0;
}

.ai-demand h2 {
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

.forecast-results {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.forecast-item {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.forecast-item h4 {
  margin-bottom: 15px;
  color: #333;
}

.chart-container {
  margin-bottom: 15px;
}

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  height: 200px;
  gap: 10px;
  margin-bottom: 10px;
}

.chart-bar {
  flex: 1;
  background-color: #3498db;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.forecast-summary {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.forecast-summary p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.no-results {
  text-align: center;
  padding: 50px 0;
  color: #999;
}

.table-container {
  margin-bottom: 20px;
}

.high {
  color: #27ae60;
  font-weight: bold;
}

.medium {
  color: #f39c12;
  font-weight: bold;
}

.low {
  color: #e74c3c;
  font-weight: bold;
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