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
				<text class="ym">{{ formatDate(item.attendance_ym) }}</text>
				<text class="name">{{ item.employee_name }}/{{ item.department_name }}</text>
				<text class="badge">待签名</text>
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
				refreshing: false, // 下拉刷新状态
			};
		},
		onShow() {
			// 每次页面显示时刷新（从签名页返回时）
			this.loadData();
		},
		methods: {
			async loadData(fromRefresh = false) {
				if (this.loading) return; // 防止重复请求
				this.loading = true;
				if (fromRefresh) {
					this.refreshing = true; // 显示下拉动画
				}
				try {
					// 获取当前员工的身份证号（card）
					const card = vk.getVuex('$user.employeeInfo.card') || '';
					if (!card) {
						uni.showToast({
							title: '未获取到员工信息',
							icon: 'none'
						});
						return;
					}

					// 调用云函数
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
						this.refreshing = false; // 复位下拉动画
					}
				}
			},
			// 下拉刷新处理
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
		/* 撑满全屏 */
		background: #f5f5f5;
		box-sizing: border-box;
		padding: 30rpx;
		/* 内边距置于 scroll-view 上，避免内容紧贴边缘 */
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

	.badge {
		background: #f56c6c;
		color: #fff;
		padding: 6rpx 24rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
	}
</style>