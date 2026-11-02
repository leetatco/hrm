<template>
  <scroll-view
    class="unsign-list"
    scroll-y
    :refresher-enabled="true"
    :refresher-triggered="refreshing"
    @refresherrefresh="onRefresh"
  >
    <!-- 下拉刷新 -->
    <u-refresh slot="refresher" :refresher-triggered="refreshing" @refresh="onRefresh" />

    <!-- 加载 -->
    <view v-if="loading" class="status-text">加载中...</view>

    <!-- 空状态 -->
    <view v-else-if="list.length === 0">
      <u-empty text="暂无待签合同" mode="list"></u-empty>
    </view>

    <!-- 列表 -->
    <view v-else class="list">
      <view
        v-for="item in list"
        :key="item._id"
        class="item"
        @click="goSign(item)"
      >
        <text class="name">姓名：{{ vk.getVuex('$user.employeeInfo')?.employee_name || item.card }}</text>
        <text class="contract">
          {{ item.contractInfo?.contract_sign_name || item.contract_sign_id }}
        </text>
        <text class="date">{{ formatDate(item.sign_date) }}</text>
        <text class="sign-badge">待签署</text>
      </view>
    </view>
  </scroll-view>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      list: [],
      refreshing: false
    };
  },
  onShow() {
    this.loadData();
  },
  methods: {
    async loadData(fromRefresh = false) {
      if (this.loading) return;
      this.loading = true;
      if (fromRefresh) this.refreshing = true;

      try {
        const card = vk.getVuex('$user.employeeInfo.card') || '';
        if (!card) {
          uni.showToast({ title: '未获取到员工信息', icon: 'none' });
          return;
        }

        const res = await vk.callFunction({
          url: 'admin/hrm/contract-sign/sys/getDetail',
          title: '加载中...',
          data: {           
              card,
              status: 4 // 待签署           
          }
        });

        if (res.code === 0) {
          this.list = res.rows || [];
        } else {
          uni.showToast({ title: res.msg || '查询失败', icon: 'none' });
        }
      } catch (e) {
        uni.showToast({ title: '网络异常', icon: 'none' });
        console.error(e);
      } finally {
        this.loading = false;
        if (fromRefresh) this.refreshing = false;
      }
    },

    onRefresh() {
      if (this.loading) return;
      this.loadData(true);
    },

    goSign(item) {
      uni.navigateTo({
        url: `/pages/contact-sign/sign?_id=${item._id}`
      });
    },

    formatDate(val) {
      if (!val) return '';
      const d = new Date(val);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped>
.unsign-list {
  height: 100vh;
  background: #f5f5f5;
  box-sizing: border-box;
  padding: 30rpx;
}

.status-text {
  text-align: center;
  padding-top: 200rpx;
  color: #999;
  font-size: 32rpx;
}

.list .item {
  background: #fff;
  padding: 30rpx 40rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.name {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  width: 100%;
}

.contract {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
}

.date {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
}

.sign-badge {
  background: #f56c6c;
  color: #fff;
  padding: 6rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}
</style>