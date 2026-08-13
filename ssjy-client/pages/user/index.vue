<template>
	<view class="page">
		<!-- 状态栏 -->
		<u-status-bar bgColor="transparent"></u-status-bar>

		<!-- 用户信息卡片 -->
		<view class="user-card" @click="bindLogin" :class="{ 'not-login': !hasLogin }">
			<view class="card-content">
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

				<view class="user-status" v-if="hasLogin">
					<view class="status-item">
						<text class="status-value">{{ userInfo.attendance || 0 }}</text>
						<text class="status-label">考勤天数</text>
					</view>
					<view class="status-divider"></view>
					<view class="status-item">
						<text class="status-value">{{ userInfo.tasks || 0 }}</text>
						<text class="status-label">待办任务</text>
					</view>
					<view class="status-divider"></view>
					<view class="status-item">
						<text class="status-value">{{ userInfo.notices || 0 }}</text>
						<text class="status-label">未读通知</text>
					</view>
				</view>
			</view>

			<!-- 登录提示 -->
			<view v-if="!hasLogin" class="login-tip">
				<u-icon name="arrow-right" color="#ffffff" size="24"></u-icon>
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
					<view class="item-icon" :style="{ backgroundColor: item.bgColor }">
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

				<!-- 意见反馈 -->
				<view class="account-item">
					<button class="feedback-btn" open-type="feedback" @click.stop="tofeedback">
						<view class="item-left">
							<view class="item-icon-wrapper"
								style="background: linear-gradient(135deg, #ff4444, #ff6b6b);">
								<u-icon name="chat" size="24" color="#ffffff"></u-icon>
							</view>
							<text class="item-title">意见反馈</text>
						</view>
						<u-icon name="arrow-right" color="#c0c4cc" size="20"></u-icon>
					</button>
				</view>
				<!-- 关于我们 -->
				<view class="account-item" @click="goto('about')">
					<view class="item-left">
						<view class="item-icon-wrapper" style="background: linear-gradient(135deg, #909399, #a6a9ad);">
							<u-icon name="info-circle" size="24" color="#ffffff"></u-icon>
						</view>
						<text class="item-title">关于我们</text>
					</view>
					<u-icon name="arrow-right" color="#c0c4cc" size="20"></u-icon>
				</view>
			</view>
		</view>

		<!-- 退出登录按钮 -->
		<view class="logout-section" v-if="hasLogin">
			<u-button type="error" shape="circle" @click="logout" :customStyle="{
					height: '90rpx',
					fontSize: '32rpx',
					margin: '40rpx 0',
					background: 'linear-gradient(135deg, #ff4444, #ff6b6b)'
				}">退出登录</u-button>
		</view>

		<!-- 版本信息 -->
		<view class="version-info">
			<text class="version-text">版本 {{ appVersion }}</text>
			<text class="copyright">© {{ currentYear }} 版权所有</text>
		</view>
		<!-- 底部导航栏 -->
		<u-tabbar :list="tabbar" :before-switch="beforeTabSwitch" icon-size="50" border-top hide-tab-bar></u-tabbar>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 功能列表
				functionList: [{
						icon: 'order',
						text: '我的审批',
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
				avatar: '../static/txl/ico_logo_@3x.png',
				// 用户信息
				userInfo: {},
				// 应用版本
				appVersion: '1.0.0',
				// 未读通知数量
				unreadNotifications: 0,
				// 个人资料是否完善
				profileUncompleted: false,
				// 底部导航
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
			// 是否已登录
			hasLogin() {
				return this.vk?.getVuex('$user.userInfo')?.username ? true : false;
			},
			// 当前年份
			currentYear() {
				return new Date().getFullYear();
			}
		},
		onLoad() {
			// 初始化vk对象
			this.vk = uni.vk;
			// 获取应用版本
			this.getAppVersion();
		},
		onShow() {
			// 页面显示时更新用户信息
			this.updateUserInfo();
			// 更新通知数量
			this.updateNotifications();
		},
		methods: {
			// 切换tab前的拦截
			beforeTabSwitch(index) {
				// 中间按钮处理
				// if (this.tabbarList[index].midButton) {
				// 	this.showCenterAction();
				// 	return false;
				// }
				return true;
			},
			// 更新用户信息
			updateUserInfo() {
				if (this.hasLogin) {
					this.userInfo = this.vk.getVuex('$user.userInfo') || {};
					console.log('用户信息:', this.userInfo);
					// 检查资料是否完善
					this.checkProfileCompletion();
				} else {
					this.userInfo = {};
				}
			},

			// 检查资料是否完善
			checkProfileCompletion() {
				// 这里可以添加逻辑检查用户资料是否完整
				const requiredFields = ['avatar', 'nickname'];
				this.profileUncompleted = requiredFields.some(field => {
					const value = this.userInfo[field];
					return !value || value.trim() === '';
				});
			},

			// 获取应用版本
			getAppVersion() {
				// 这里可以调用API获取应用版本
				// 或者从配置文件中读取
				// this.appVersion = uni.getStorageSync('appVersion') || '1.0.0';
			},

			// 更新通知数量
			updateNotifications() {
				// 这里可以调用API获取未读通知数量
				// this.unreadNotifications = await this.$api.notification.getUnreadCount();
			},

			// 绑定登录
			bindLogin() {
				if (!this.hasLogin) {
					this.vk.navigateToLogin();
				} else {
					// 已登录跳转到个人资料
					this.goto('profile');
				}
			},


			// 跳转页面
			goto(value) {
				if (!this.hasLogin && value !== 'about') {
					this.vk.navigateToLogin();
					return;
				}

				const routes = {
					'setting': '/pages/setting/index',
					'notification': '/pages/notification/index',
					'about': '/pages/about/index'
				};

				if (routes[value]) {
					uni.navigateTo({
						url: routes[value]
					});
				}
			},

			// 处理功能点击
			handleFunction(item) {
				if (!this.hasLogin) {
					this.vk.navigateToLogin();
					return;
				}

				const actionMap = {
					'approval': '/pages/approval/list',
					'attendance': '/pages/attendance/record',
					'document': '/pages/gongwen/index',
					'setting': '/pages/setting/index'
				};

				if (actionMap[item.action]) {
					uni.navigateTo({
						url: actionMap[item.action]
					});
				}
			},

			// 反馈
			tofeedback(e) {
				console.log('打开反馈页面');
				// 如果需要自定义反馈页面，可以在这里跳转
				// uni.navigateTo({
				// 	url: '/pages/feedback/index'
				// });
			},

			// 退出登录
			logout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					confirmColor: '#ff4444',
					success: (res) => {
						if (res.confirm) {
							this.vk.userCenter.logout();
							setTimeout(() => {
								uni.showToast({
									title: '已退出登录',
									icon: 'success'
								});
								// 清空用户信息
								this.userInfo = {};
								// 刷新页面
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
	.page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
		padding-bottom: 40rpx;
		box-sizing: border-box;
	}

	.header {
		padding: 80rpx 40rpx 30rpx;

		.header-title {
			font-size: 48rpx;
			font-weight: bold;
			color: #333333;
			display: block;
		}
	}

	.user-card {
		background: linear-gradient(135deg, #2979ff 0%, #4dabff 100%);
		border-radius: 30rpx;
		margin: 0 40rpx 40rpx;
		padding: 60rpx 40rpx;
		position: relative;
		overflow: hidden;
		box-shadow: 0 20rpx 60rpx rgba(41, 121, 255, 0.2);

		&.not-login {
			background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
			box-shadow: 0 20rpx 60rpx rgba(255, 107, 107, 0.2);

			.card-content {
				opacity: 0.9;
			}
		}

		.card-content {
			position: relative;
			z-index: 1;
		}

		.avatar-section {
			position: relative;
			display: inline-block;
			margin-bottom: 40rpx;

			.user-avatar {
				border: 4rpx solid rgba(255, 255, 255, 0.3);
				box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
			}

			.edit-avatar {
				position: absolute;
				bottom: 0;
				right: 0;
				width: 40rpx;
				height: 40rpx;
				background-color: rgba(0, 0, 0, 0.5);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 2rpx solid #ffffff;
				z-index: 2;
			}
		}

		.user-detail {
			display: flex;
			flex-direction: column;
			margin-bottom: 40rpx;

			.user-name {
				font-size: 40rpx;
				font-weight: bold;
				color: #ffffff;
				margin-bottom: 8rpx;
				line-height: 1.4;
			}

			.user-account {
				font-size: 28rpx;
				color: rgba(255, 255, 255, 0.9);
				margin-bottom: 4rpx;
			}

			.user-position {
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.7);
			}
		}

		.user-status {
			display: flex;
			align-items: center;
			justify-content: space-around;
			padding-top: 40rpx;
			border-top: 1rpx solid rgba(255, 255, 255, 0.2);

			.status-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				flex: 1;

				.status-value {
					font-size: 36rpx;
					font-weight: bold;
					color: #ffffff;
					margin-bottom: 8rpx;
					text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
				}

				.status-label {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.9);
				}
			}

			.status-divider {
				width: 1rpx;
				height: 40rpx;
				background-color: rgba(255, 255, 255, 0.2);
			}
		}

		.login-tip {
			position: absolute;
			right: 40rpx;
			top: 50%;
			transform: translateY(-50%);
		}
	}

	.section-header {
		padding: 0 40rpx 20rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
		}
	}

	.function-section {
		background-color: #ffffff;
		border-radius: 24rpx;
		margin: 0 40rpx 30rpx;
		padding: 30rpx 20rpx;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.06);

		.function-grid {
			display: flex;
			justify-content: space-around;

			.grid-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				position: relative;
				padding: 10rpx;
				border-radius: 16rpx;
				transition: all 0.3s;

				&:active {
					background-color: rgba(0, 0, 0, 0.02);
				}

				.item-icon {
					width: 80rpx;
					height: 80rpx;
					border-radius: 20rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 20rpx;
					box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
				}

				.item-text {
					font-size: 26rpx;
					color: #333333;
					font-weight: 500;
				}
			}
		}
	}

	.account-section {
		background-color: #ffffff;
		border-radius: 24rpx;
		margin: 0 40rpx 30rpx;
		padding: 30rpx 0;
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.06);
		overflow: hidden;

		.account-list {
			.account-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 30rpx 40rpx;
				transition: all 0.3s;

				&:active {
					background-color: rgba(0, 0, 0, 0.02);
				}

				&:not(:last-child) {
					border-bottom: 1rpx solid #f0f0f0;
				}

				.item-left {
					display: flex;
					align-items: center;
					flex: 1;

					.item-icon-wrapper {
						width: 48rpx;
						height: 48rpx;
						border-radius: 12rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 20rpx;
						box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
					}

					.item-title {
						font-size: 30rpx;
						color: #333333;
						font-weight: 500;
					}
				}

				.item-right {
					display: flex;
					align-items: center;

					.item-desc {
						font-size: 24rpx;
						color: #999999;
						margin-right: 12rpx;

						&.warn {
							color: #ff9900;
						}

						&.success {
							color: #19be6b;
						}
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

	.logout-section {
		padding: 0 40rpx;

		::v-deep .u-button {
			background: linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%) !important;
			border: none !important;
			box-shadow: 0 10rpx 30rpx rgba(255, 68, 68, 0.2);
			transition: all 0.3s;

			&:active {
				transform: scale(0.98);
				box-shadow: 0 5rpx 15rpx rgba(255, 68, 68, 0.3);
			}
		}
	}

	.version-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 60rpx;

		.version-text {
			font-size: 26rpx;
			color: #999999;
			margin-bottom: 10rpx;
		}

		.copyright {
			font-size: 24rpx;
			color: #cccccc;
		}
	}

	/* 响应式调整 */
	@media (max-width: 750px) {
		.header {
			padding: 60rpx 30rpx 20rpx;

			.header-title {
				font-size: 40rpx;
			}
		}

		.user-card,
		.function-section,
		.account-section {
			margin-left: 30rpx;
			margin-right: 30rpx;
		}

		.user-card {
			padding: 50rpx 30rpx;

			.user-detail {
				.user-name {
					font-size: 36rpx;
				}
			}

			.user-status {
				.status-value {
					font-size: 32rpx;
				}
			}
		}

		.section-header {
			padding: 0 30rpx 20rpx;
		}

		.function-section {
			padding: 20rpx 10rpx;

			.function-grid {
				.grid-item {
					.item-icon {
						width: 70rpx;
						height: 70rpx;
					}
				}
			}
		}

		.account-section {
			padding: 20rpx 0;

			.account-list {
				.account-item {
					padding: 28rpx 30rpx;

					.item-left {
						.item-icon-wrapper {
							width: 44rpx;
							height: 44rpx;
						}

						.item-title {
							font-size: 28rpx;
						}
					}
				}
			}
		}

		.logout-section {
			padding: 0 30rpx;
		}
	}
</style>