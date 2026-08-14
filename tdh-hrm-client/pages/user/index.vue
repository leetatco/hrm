<template>
	<view class="page">
		<!-- 状态栏 -->
		<u-status-bar bgColor="transparent"></u-status-bar>

		<!-- 用户信息卡片 -->
		<view class="user-card" :class="{ 'not-login': !hasLogin }">
			<view class="card-content" @click="bindLogin">
				<view class="avatar-section">
					<u-avatar :src="hasLogin && userInfo.avatar ? userInfo.avatar : '/static/txl/ico_logo_@3x.png'"
						size="120" mode="aspectFill" shape="circle"></u-avatar>
				</view>
				<view class="user-detail">
					<text class="user-name">
						{{ hasLogin ? (userInfo.nickname || '未设置昵称') : '点击登录/注册' }}
					</text>
					<text v-if="hasLogin" class="user-account">
						{{ userInfo.username || userInfo.mobile || '未绑定账号' }}
					</text>
					<text v-if="hasLogin && userInfo.position" class="user-position">
						{{ userInfo.position }}
					</text>
				</view>
				<!-- 登录箭头提示 -->
				<view v-if="!hasLogin" class="login-arrow">
					<u-icon name="arrow-right" color="rgba(255,255,255,0.8)" size="36"></u-icon>
				</view>
			</view>

			<!-- 用户数据统计 -->
			<view class="user-status" v-if="hasLogin">
				<view class="status-item">
					<text class="status-value">{{ userInfo.attendance || 0 }}</text>
					<text class="status-label">{{ new Date().getMonth()+1 }}月考勤天数</text>
				</view>
				<view class="status-divider"></view>
				<view class="status-item" @click="handleFunction({action:'approval'})">
					<text class="status-value">{{ userInfo.tasks || 0 }}</text>
					<text class="status-label">待办任务</text>
				</view>
				<view class="status-divider"></view>
				<view class="status-item" @click="handleFunction({action:'notice'})">
					<text class="status-value">{{ userInfo.notices || 0 }}</text>
					<text class="status-label">未读通知</text>
				</view>
			</view>
		</view>

		<!-- 功能列表 -->
		<view class="function-section">
			<view class="section-header">
				<text class="section-title">我的功能</text>
			</view>

			<view class="function-grid">
				<view class="grid-item" v-for="(item, index) in functionList" :key="index"
					@click="handleFunction(item)">
					<view class="item-icon" :style="{ background: item.bgColor }">
						<u-icon :name="item.icon" size="32" color="#ffffff"></u-icon>
					</view>
					<text class="item-text">{{ item.text }}</text>
					<u-badge v-if="item.badge" :value="item.badge" :offset="[-5, -5]" size="mini"></u-badge>
				</view>
			</view>
		</view>

		<!-- 账户设置 -->
		<view class="account-section">
			<view class="section-header">
				<text class="section-title">账户设置</text>
			</view>

			<view class="account-list">
				<!-- 个人资料 -->
				<view class="account-item" @click="goto('setting')">
					<view class="item-left">
						<view class="item-icon-wrapper" style="background: linear-gradient(135deg, #2979ff, #4dabff);">
							<u-icon name="account" size="24" color="#ffffff"></u-icon>
						</view>
						<text class="item-title">个人资料</text>
					</view>
					<view class="item-right">
						<text class="item-desc" v-if="profileUncompleted">待完善</text>
						<u-icon name="arrow-right" color="#c0c4cc" size="20"></u-icon>
					</view>
				</view>
				<!-- 消息通知 -->
				<view class="account-item" @click="goto('notification')">
					<view class="item-left">
						<view class="item-icon-wrapper" style="background: linear-gradient(135deg, #ff9900, #ffad33);">
							<u-icon name="bell" size="24" color="#ffffff"></u-icon>
						</view>
						<text class="item-title">消息通知</text>
					</view>
					<view class="item-right">
						<u-badge v-if="unreadNotifications > 0" :value="unreadNotifications" type="error"
							size="mini"></u-badge>
						<u-icon name="arrow-right" color="#c0c4cc" size="20"></u-icon>
					</view>
				</view>

				<!-- 我的客服 -->
				<view class="account-item">
					<button class="feedback-btn" open-type="contact" @click.stop="tofeedback">
						<view class="item-left">
							<view class="item-icon-wrapper"
								style="background: linear-gradient(135deg, #ff6b6b, #ff8e8e);">
								<u-icon name="chat" size="24" color="#ffffff"></u-icon>
							</view>
							<text class="item-title">我的客服</text>
						</view>
						<u-icon name="arrow-right" color="#c0c4cc" size="20"></u-icon>
					</button>
				</view>

				<!-- 解除微信绑定 -->
				<view class="account-item" @click="goto('unbindWeixin')" v-if="$hasRole('admin')">
					<view class="item-left">
						<view class="item-icon-wrapper" style="background: linear-gradient(135deg, #4cd964, #6ddb7a);">
							<u-icon name="lock-open" size="24" color="#ffffff"></u-icon>
						</view>
						<text class="item-title">解除绑定</text>
					</view>
					<u-icon name="arrow-right" color="#c0c4cc" size="20"></u-icon>
				</view>

				<!-- 关于我们 -->
				<view class="account-item" @click="goto('about')">
					<view class="item-left">
						<view class="item-icon-wrapper" style="background: linear-gradient(135deg, #909399, #b0b3b8);">
							<u-icon name="info-circle" size="24" color="#ffffff"></u-icon>
						</view>
						<text class="item-title">关于我们</text>
					</view>
					<u-icon name="arrow-right" color="#c0c4cc" size="20"></u-icon>
				</view>
			</view>
		</view>

		<!-- ========== 公告详情弹窗 ========== -->
		<u-popup v-model="showDetailPopup" :mode="popupStyle.mode" :closeable="true" :mask-close-able="true"
			:height="popupStyle.height" :border-radius="popupStyle.border_radius">
			<view class="detail-popup">
				<scroll-view scroll-y class="detail-scroll">
					<view class="detail-title">{{ currentNotice.title }}</view>
					<view class="detail-meta">
						<text>发布时间：{{ vk.pubfn.timeFormat(new Date(currentNotice.publish_date), 'yyyy-MM-dd') }}</text>
						<text v-if="currentNotice.publisher_name"> 发布人：{{ currentNotice.publisher_name }}</text>
					</view>
					<view class="detail-content">
						<u-parse :html="currentNotice.content" />
					</view>
				</scroll-view>
			</view>
		</u-popup>

		<!-- 底部导航栏 -->
		<u-tabbar :list="tabbar" :before-switch="beforeTabSwitch" icon-size="48" font-size="20" border-top hide-tab-bar
			active-color="#2979ff" inactive-color="#999"></u-tabbar>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				popupStyle: {
					mode: "bottom",
					border_radius: 16,
					height: "90%"
				},
				functionList: [{
						icon: 'order',
						text: '我的任务',
						bgColor: 'linear-gradient(135deg, #2979ff, #4dabff)',
						action: 'approval',
						badge: 3
					},
					{
						icon: 'calendar',
						text: '考勤记录',
						bgColor: 'linear-gradient(135deg, #19be6b, #36cf89)',
						action: 'attendance'
					},
					{
						icon: 'file-text',
						text: '公文管理',
						bgColor: 'linear-gradient(135deg, #ff9900, #ffad33)',
						action: 'document'
					},
					{
						icon: 'setting',
						text: '系统设置',
						bgColor: 'linear-gradient(135deg, #909399, #a6a9ad)',
						action: 'setting'
					}
				],
				showDetailPopup: false,
				currentNotice: {},
				userInfo: {},
				appVersion: '1.0.0',
				unreadNotifications: 0,
				profileUncompleted: false,
				tabbar: [{
						iconPath: "/static/icon_home.png",
						selectedIconPath: "/static/icon_home_sel.png",
						pagePath: "/pages/index/index",
						text: "首页"
					},
					{
						iconPath: "/static/icon_msg.png",
						selectedIconPath: "/static/icon_msg_sel.png",
						pagePath: "/pages/notice/index",
						text: "消息"
					},
					{
						iconPath: "/static/icon_mailList.png",
						selectedIconPath: "/static/icon_mailList_sel.png",
						pagePath: "/pages/contacts/index",
						text: "通讯录"
					},
					{
						iconPath: "/static/icon_user.png",
						selectedIconPath: "/static/icon_user_sel.png",
						pagePath: "/pages/user/index",
						text: "我的"
					}
				]
			}
		},
		computed: {
			hasLogin() {
				return !!vk.getVuex('$user.userInfo.username');
			},
			currentYear() {
				return new Date().getFullYear();
			}
		},
		onLoad() {
			this.getAppVersion();
		},
		onShow() {
			this.loadUnreadCount();
			this.loadUnApproveCount();
			this.loadAttendCount();
			this.updateUserInfo();
			this.updateNotifications();
			this.loadNoticeList();
		},
		methods: {
			async loadNoticeList() {
				try {
					const res = await vk.callFunction({
						url: 'admin/opendb-notice/pub/getListType',
						data: {
							type: 'about',
							status: 'published'
						}
					});
					if (res.code === 0 && res.total > 0) {
						this.currentNotice = res.rows[0];
					}
				} catch (error) {
					console.error('加载公告失败:', error);
				}
			},
			showDetail() {
				this.showDetailPopup = true;
			},
			async loadUnreadCount() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/notification/pub/getUnreadCount',
						data: {
							userInfo: vk.getVuex('$user.userInfo')
						}
					});
					if (res.code === 0) {
						this.tabbar[1].count = res.data.count || 0;
						this.userInfo.notices = this.tabbar[1].count;
					}
				} catch (error) {
					console.error('加载未读数量失败:', error);
				}
			},
			async loadUnApproveCount() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/task/sys/getList',
						data: {
							formData: {
								status: "pending"
							}
						}
					});
					if (res.code === 0) {
						this.userInfo.tasks = res.total;
					}
				} catch (error) {
					console.error('加载待办任务失败:', error);
				}
			},
			async loadAttendCount() {
				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/clockin/pub/getListDays',
						data: {
							userInfo: vk.getVuex('$user.userInfo')
						}
					});
					if (res.code === 0) {
						this.userInfo.attendance = res.totalDays;
					}
				} catch (error) {
					console.error('加载考勤天数失败:', error);
				}
			},
			beforeTabSwitch(index) {
				return true;
			},
			updateUserInfo() {
				if (this.hasLogin) {
					this.userInfo = vk.getVuex('$user.userInfo') || {};
					this.checkProfileCompletion();
				} else {
					this.userInfo = {};
				}
			},
			checkProfileCompletion() {
				const requiredFields = ['avatar', 'nickname'];
				this.profileUncompleted = requiredFields.some(field => {
					const value = this.userInfo[field];
					return !value || value.trim() === '';
				});
			},
			getAppVersion() {},
			updateNotifications() {},
			bindLogin() {
				if (!this.hasLogin) {
					vk.navigateToLogin();
				} else {
					this.goto('setting');
				}
			},
			async goto(value) {
				if (!this.hasLogin && value !== 'about') {
					vk.navigateToLogin();
					return;
				}
				if (value === 'about') {
					this.showDetail();
					return;
				}
				if (value === 'unbindWeixin') {
					await this.unbindWeixin();
					return;
				}
				const routes = {
					'setting': '/pages/setting/index',
					'notification': '/pages/notice/index',
					'about': '/pages/about/index'
				};
				if (routes[value]) {
					vk.navigateTo(routes[value]);
				}
			},
			async unbindWeixin() {
				try {
					await vk.userCenter.unbindWeixin();
					uni.clearStorageSync();
					vk.alert('解除绑定微信成功', '提示', '确定', () => {
						vk.navigateToLogin();
					});
				} catch (e) {
					console.log('解除绑定微信失败:', e);
					uni.clearStorageSync();
					vk.navigateToLogin();
				}
			},
			handleFunction(item) {
				if (!this.hasLogin) {
					vk.navigateToLogin();
					return;
				}
				const actionMap = {
					'approval': '/pages/workflow/application-form/list',
					// 'attendance': '/pages/clockin/index',
					'document': '/pages/opendb-notice/index',
					'notice': '/pages/notice/index',
					'setting': '/pages/setting/index'
				};
				if (actionMap[item.action]) {
					vk.navigateTo({
						url: actionMap[item.action]
					});
				}
			},
			tofeedback(e) {
				console.log('打开客服反馈');
			},
			logout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					confirmColor: '#ff4444',
					success: (res) => {
						if (res.confirm) {
							vk.userCenter.logout();
							setTimeout(() => {
								uni.showToast({
									title: '已退出登录',
									icon: 'success'
								});
								this.userInfo = {};
								this.$forceUpdate();
							}, 300);
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* ============================================================
	   设计变量（与首页完全一致）
	   ============================================================ */
	:root {
		--color-primary: #2979ff;
		--color-primary-light: #5a9cff;
		--color-bg: #f5f7fa;
		--color-card: #ffffff;
		--color-text-primary: #1a1a2e;
		--color-text-secondary: #666;
		--color-text-light: #999;
		--color-border: #f0f0f0;
		--shadow-card: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
		--shadow-hover: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
		--radius-card: 20rpx;
		--card-gap: 24rpx;  /* 👈 统一间距变量，与首页完全一致 */
	}

	/* ============================================================
	   页面背景 - 与首页完全一致
	   ============================================================ */
	.page {
		min-height: 100vh;
		background: var(--color-bg);
		padding-bottom: 120rpx;
		box-sizing: border-box;
	}

	/* ============================================================
	   用户信息卡片 ———— 间距 24rpx（8网格标准）
	   ============================================================ */
	.user-card {
		background: linear-gradient(145deg, #4a7aff 0%, #6c8cff 60%, #8aa4ff 100%);
		border-radius: var(--radius-card);
		margin: var(--card-gap) 24rpx;  /* 上下24rpx，与首页完全一致 */
		padding: 40rpx 32rpx 32rpx;
		position: relative;
		overflow: hidden;
		box-shadow: 0 16rpx 48rpx rgba(41, 121, 255, 0.25);

		&.not-login {
			background: linear-gradient(145deg, #ff6b6b 0%, #ff8e8e 60%, #ffb0b0 100%);
			box-shadow: 0 16rpx 48rpx rgba(255, 107, 107, 0.25);
		}

		/* 装饰光晕 - 与首页一致 */
		&::before {
			content: '';
			position: absolute;
			top: -120rpx;
			right: -80rpx;
			width: 320rpx;
			height: 320rpx;
			border-radius: 50%;
			background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
			pointer-events: none;
		}
		&::after {
			content: '';
			position: absolute;
			bottom: -80rpx;
			left: -60rpx;
			width: 240rpx;
			height: 240rpx;
			border-radius: 50%;
			background: radial-gradient(circle, rgba(255, 255, 255, 0.10) 0%, transparent 70%);
			pointer-events: none;
		}

		.card-content {
			display: flex;
			align-items: center;
			position: relative;
			z-index: 1;
		}

		.avatar-section {
			flex-shrink: 0;
			margin-right: 24rpx;

			::v-deep .u-avatar {
				border: 4rpx solid rgba(255, 255, 255, 0.3);
				box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
			}
		}

		.user-detail {
			flex: 1;
			display: flex;
			flex-direction: column;

			.user-name {
				font-size: 34rpx;
				font-weight: 600;
				color: #ffffff;
				margin-bottom: 4rpx;
				line-height: 1.3;
			}

			.user-account {
				font-size: 26rpx;
				color: rgba(255, 255, 255, 0.85);
				margin-bottom: 2rpx;
			}

			.user-position {
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.7);
			}
		}

		.login-arrow {
			flex-shrink: 0;
			margin-left: 12rpx;
			animation: arrowPulse 1.8s ease-in-out infinite;
		}

		@keyframes arrowPulse {
			0%, 100% { transform: translateX(0); opacity: 0.7; }
			50% { transform: translateX(8rpx); opacity: 1; }
		}

		.user-status {
			display: flex;
			align-items: center;
			justify-content: space-around;
			margin-top: 32rpx;
			padding-top: 28rpx;
			border-top: 1rpx solid rgba(255, 255, 255, 0.2);
			position: relative;
			z-index: 1;

			.status-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				flex: 1;
				padding: 6rpx 0;
				border-radius: 12rpx;
				transition: background 0.2s;

				&:active {
					background: rgba(255, 255, 255, 0.10);
				}

				.status-value {
					font-size: 32rpx;
					font-weight: 700;
					color: #ffffff;
					margin-bottom: 4rpx;
					text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.10);
				}

				.status-label {
					font-size: 22rpx;
					color: rgba(255, 255, 255, 0.85);
				}
			}

			.status-divider {
				width: 1rpx;
				height: 44rpx;
				background: rgba(255, 255, 255, 0.2);
				flex-shrink: 0;
			}
		}
	}

	/* ============================================================
	   区块通用样式 ———— 所有区块 margin: 24rpx 24rpx
	   ============================================================ */
	.function-section,
	.account-section {
		background: var(--color-card);
		margin: var(--card-gap) 24rpx;  /* 上下24rpx，与首页完全一致 */
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-card);
		overflow: hidden;
		transition: box-shadow 0.2s;

		&:hover {
			box-shadow: var(--shadow-hover);
		}
	}

	.section-header {
		padding: 18rpx 24rpx 8rpx;

		.section-title {
			font-size: 30rpx;
			font-weight: 600;
			color: var(--color-text-primary);
			letter-spacing: 0.5rpx;

			&::before {
				content: '';
				display: inline-block;
				width: 6rpx;
				height: 28rpx;
				background: #2979ff;
				border-radius: 4rpx;
				margin-right: 14rpx;
				vertical-align: middle;
			}
		}
	}

	/* ============================================================
	   我的功能
	   ============================================================ */
	.function-section {
		padding: 6rpx 8rpx 16rpx;

		.function-grid {
			display: flex;
			justify-content: space-around;
			padding: 0 8rpx;

			.grid-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				position: relative;
				padding: 12rpx 16rpx;
				border-radius: 16rpx;
				transition: all 0.2s;
				min-width: 100rpx;

				&:active {
					background: rgba(0, 0, 0, 0.03);
					transform: scale(0.96);
				}

				.item-icon {
					width: 72rpx;
					height: 72rpx;
					border-radius: 18rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 14rpx;
					box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);
					transition: transform 0.2s;
				}

				&:active .item-icon {
					transform: scale(0.92);
				}

				.item-text {
					font-size: 24rpx;
					color: var(--color-text-secondary);
					font-weight: 500;
					text-align: center;
				}
			}
		}
	}

	/* ============================================================
	   账户设置
	   ============================================================ */
	.account-section {
		padding: 6rpx 0 4rpx;

		.account-list {
			.account-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 24rpx 24rpx;
				transition: all 0.2s;
				min-height: 80rpx;

				&:active {
					background: rgba(0, 0, 0, 0.02);
				}

				&:not(:last-child) {
					border-bottom: 1rpx solid #f0f2f5;
				}

				.item-left {
					display: flex;
					align-items: center;
					flex: 1;

					.item-icon-wrapper {
						width: 44rpx;
						height: 44rpx;
						border-radius: 12rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 18rpx;
						box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
						flex-shrink: 0;
					}

					.item-title {
						font-size: 28rpx;
						color: var(--color-text-primary);
						font-weight: 500;
					}
				}

				.item-right {
					display: flex;
					align-items: center;
					flex-shrink: 0;

					.item-desc {
						font-size: 24rpx;
						color: #ff9900;
						margin-right: 10rpx;
					}
				}

				.feedback-btn {
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: space-between;
					background: transparent;
					border: none;
					padding: 0;
					margin: 0;
					line-height: normal;
					font-size: inherit;
					color: inherit;
					position: relative;

					&::after {
						display: none;
					}
				}
			}
		}
	}

	/* ============================================================
	   公告详情弹窗
	   ============================================================ */
	.detail-popup {
		height: 100%;
		display: flex;
		flex-direction: column;

		.detail-scroll {
			flex: 1;
			padding: 30rpx 32rpx 40rpx;
		}

		.detail-title {
			font-size: 36rpx;
			font-weight: 600;
			color: var(--color-text-primary);
			margin-bottom: 20rpx;
			line-height: 1.4;
		}

		.detail-meta {
			font-size: 24rpx;
			color: #b0b7c3;
			margin-bottom: 30rpx;
			display: flex;
			gap: 24rpx;
			flex-wrap: wrap;
		}

		.detail-content {
			font-size: 28rpx;
			color: var(--color-text-secondary);
			line-height: 1.8;
		}
	}

	/* ============================================================
	   响应式适配 ———— 与首页完全一致
	   ============================================================ */
	@media (max-width: 750px) {
		.user-card,
		.function-section,
		.account-section {
			margin-left: 20rpx;
			margin-right: 20rpx;
		}

		.user-card {
			padding: 32rpx 24rpx 24rpx;

			.user-detail .user-name {
				font-size: 30rpx;
			}
			.user-status {
				.status-value {
					font-size: 28rpx;
				}
				.status-label {
					font-size: 20rpx;
				}
			}
			.avatar-section ::v-deep .u-avatar {
				width: 80rpx !important;
				height: 80rpx !important;
			}
		}

		.function-section {
			padding: 4rpx 4rpx 12rpx;

			.function-grid .grid-item {
				min-width: 80rpx;
				padding: 8rpx 8rpx;

				.item-icon {
					width: 64rpx;
					height: 64rpx;
				}
				.item-text {
					font-size: 22rpx;
				}
			}
		}

		.account-section .account-list .account-item {
			padding: 20rpx 20rpx;
			min-height: 72rpx;

			.item-left .item-title {
				font-size: 26rpx;
			}
			.item-left .item-icon-wrapper {
				width: 40rpx;
				height: 40rpx;
			}
		}

		.section-header {
			padding: 14rpx 20rpx 6rpx;
			.section-title {
				font-size: 28rpx;
			}
		}
	}

	@media (max-width: 400px) {
		.user-card {
			padding: 24rpx 18rpx 18rpx;

			.user-status .status-value {
				font-size: 24rpx;
			}
			.user-status .status-label {
				font-size: 18rpx;
			}
		}
		.function-section .function-grid .grid-item {
			min-width: 60rpx;
			.item-icon {
				width: 56rpx;
				height: 56rpx;
			}
			.item-text {
				font-size: 20rpx;
			}
		}
	}
</style>