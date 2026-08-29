<template>
	<scroll-view class="unsign-list" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing"
		@refresherrefresh="onRefresh">
		<!-- uView 自定义下拉刷新组件 -->
		<u-refresh slot="refresher" :refresher-triggered="refreshing" @refresh="onRefresh"></u-refresh>
		<!-- 加载状态 -->
		<view v-if="loading" class="status-text">加载中...</view>
		<!-- 空状态 -->
		<view v-else-if="list.length === 0"><u-empty text="暂无待签薪资" mode="list"></u-empty></view>
		<!-- 列表 -->
		<view v-else class="list">
			<view v-for="item in list" :key="item._id" class="item" @click="goSign(item)">
				<text class="ym">{{ formatDate(item.attendance_ym_key) }}</text>
				<text class="name">{{ item.employee_name }}</text>
				<text class="sign-badge">待签名</text>
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
				refreshing: false,
			};
		},
		onShow() {
			this.loadData();
		},
		methods: {
			async loadData(fromRefresh = false) {
				if (this.loading) return;
				this.loading = true;
				if (fromRefresh) {
					this.refreshing = true;
				}
				try {
					const card = vk.getVuex('$user.employeeInfo.card') || '';
					if (!card) {
						uni.showToast({
							title: '未获取到员工信息',
							icon: 'none'
						});
						return;
					}

					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/payslip/getDetail',
						title: '加载中...',
						data: {
							card: card,
							status: 0,
						},
					});

					if (res.code === 0) {
						this.list = res.rows || [];
					} else {
						uni.showToast({
							title: res.msg || '查询失败',
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: '网络异常',
						icon: 'none'
					});
					console.error(e);
				} finally {
					this.loading = false;
					if (fromRefresh) {
						this.refreshing = false;
					}
				}
			},
			onRefresh() {
				if (this.loading) return;
				this.loadData(true);
			},
			goSign(item) {
				uni.navigateTo({
					url: `/pages/payslip/sign?_id=${item._id}&attendance_ym=${item.attendance_ym}`,
				});
			},
			formatDate(val) {
				if (!val) return '';
				const d = new Date(val);
				return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月`;
			},
		},
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
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	}

	.ym {
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
	}

	.name {
		color: #666;
		font-size: 28rpx;
	}

	.sign-badge {
		background: #f56c6c;
		color: #fff;
		padding: 6rpx 24rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
	}
</style>