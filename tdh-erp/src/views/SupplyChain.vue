<template>
  <div class="supply-chain">
    <h2>供应链管理</h2>
    <div class="card">
      <h3>供应商管理</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>供应商名称</th>
              <th>联系人</th>
              <th>联系电话</th>
              <th>地址</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="supplier in suppliers" :key="supplier.id">
              <td>{{ supplier.name }}</td>
              <td>{{ supplier.contact }}</td>
              <td>{{ supplier.phone }}</td>
              <td>{{ supplier.address }}</td>
              <td>{{ supplier.status }}</td>
              <td>
                <button class="btn btn-secondary">编辑</button>
                <button class="btn btn-danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn btn-primary" style="margin-top: 20px;">添加供应商</button>
    </div>
    <div class="card">
      <h3>采购计划</h3>
      <form @submit.prevent="createPurchasePlan">
        <div class="form-group">
          <label for="planName">计划名称</label>
          <input type="text" id="planName" v-model="purchasePlan.name" placeholder="请输入采购计划名称">
        </div>
        <div class="form-group">
          <label for="planDate">计划日期</label>
          <input type="date" id="planDate" v-model="purchasePlan.date">
        </div>
        <div class="form-group">
          <label for="supplier">供应商</label>
          <select id="supplier" v-model="purchasePlan.supplierId">
            <option value="">请选择供应商</option>
            <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
              {{ supplier.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>采购物品</label>
          <div v-for="(item, index) in purchasePlan.items" :key="index" class="purchase-item">
            <input type="text" v-model="item.name" placeholder="物品名称">
            <input type="number" v-model="item.quantity" placeholder="数量">
            <input type="number" v-model="item.price" placeholder="单价">
            <button type="button" class="btn btn-danger" @click="removeItem(index)">删除</button>
          </div>
          <button type="button" class="btn btn-secondary" @click="addItem">添加物品</button>
        </div>
        <button type="submit" class="btn btn-primary">创建采购计划</button>
      </form>
    </div>
    <div class="card">
      <h3>采购订单</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>供应商</th>
              <th>金额</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in purchaseOrders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.supplier }}</td>
              <td>¥{{ order.amount }}</td>
              <td>{{ order.status }}</td>
              <td>{{ order.createTime }}</td>
              <td>
                <button class="btn btn-secondary">查看</button>
                <button class="btn btn-primary">编辑</button>
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
  name: 'SupplyChain',
  data() {
    return {
      suppliers: [
        { id: 1, name: '供应商A', contact: '张三', phone: '13800138001', address: '广州市白云区', status: '活跃' },
        { id: 2, name: '供应商B', contact: '李四', phone: '13900139001', address: '广州市天河区', status: '活跃' },
        { id: 3, name: '供应商C', contact: '王五', phone: '13700137001', address: '广州市海珠区', status: '禁用' }
      ],
      purchasePlan: {
        name: '',
        date: '',
        supplierId: '',
        items: [
          { name: '', quantity: 1, price: 0 }
        ]
      },
      purchaseOrders: [
        { id: 'PO-20240101-001', supplier: '供应商A', amount: 5000, status: '已完成', createTime: '2024-01-01 10:00' },
        { id: 'PO-20240101-002', supplier: '供应商B', amount: 8000, status: '处理中', createTime: '2024-01-01 09:30' },
        { id: 'PO-20240101-003', supplier: '供应商C', amount: 3000, status: '待处理', createTime: '2024-01-01 09:00' }
      ]
    }
  },
  methods: {
    addItem() {
      this.purchasePlan.items.push({ name: '', quantity: 1, price: 0 });
    },
    removeItem(index) {
      this.purchasePlan.items.splice(index, 1);
    },
    createPurchasePlan() {
      // 创建采购计划逻辑
      alert('采购计划创建成功！');
    }
  }
}
</script>

<style scoped>
.supply-chain {
  padding: 20px 0;
}

.supply-chain h2 {
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

.purchase-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.purchase-item input {
  flex: 1;
}

.btn {
  margin-right: 10px;
}

.table-container {
  margin-bottom: 20px;
}
</style>