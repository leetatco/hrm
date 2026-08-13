<template>
	<view class="container">
		<!-- 页面头部 -->
		<view class="header">
			<view class="user-info">
				<u-avatar :src="userInfo.avatar || '/static/txl/ico_logo_@3x.png'" size="80"></u-avatar>
				<view class="user-detail">
					<text class="user-name">{{ userInfo.nickname || '欢迎回来' }}</text>
					<text class="user-greeting">{{ getGreeting() }}</text>
				</view>
			</view>
			<view class="weather-info">
				<u-icon name="sunny" size="36" color="#ff9900"></u-icon>
				<text class="weather-text"
					v-if="userInfo.employeeInfo">{{userInfo.employeeInfo.department_name || '测试部'}}</text>
			</view>
		</view>

		<!-- 搜索栏 -->
		<view class="search-box">
			<u-search placeholder="搜索功能、通知、联系人..." v-model="searchKeyword" shape="round" :showAction="false" height="60"
				:clearabled="true" @search="onSearch" @custom="onSearch"></u-search>
		</view>

		<!-- 轮播图 -->
		<view class="swiper-box">
			<u-swiper :list="swiperList" height="320" indicator-pos="bottomCenter" circular :autoplay="true"
				:interval="3000" :duration="500" bgColor="#ffffff" radius="30"></u-swiper>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-box">
			<view class="section-header">
				<text class="section-title">常用功能</text>
				<text class="section-more" @click="showAllFunctions">全部</text>
			</view>

			<u-grid :col="4" :border="false">
				<u-grid-item v-for="(item, index) in menuList" :key="index" @click="goToPage(item)">
					<view class="menu-item">
						<view class="menu-icon">
							<u-image width="80rpx" height="80rpx" :src="item.imgUrl" mode="aspectFit"></u-image>
						</view>
						<text class="menu-text">{{ item.name }}</text>
						<u-badge v-if="item.badge" :value="item.badge" :offset="[-5, -5]" size="mini"></u-badge>
					</view>
				</u-grid-item>
			</u-grid>
		</view>

		<!-- 通知公告 -->
		<view class="notice-box">
			<view class="section-header">
				<text class="section-title">通知公告</text>
				<text class="section-more" @click="viewAllNotices">更多</text>
			</view>

			<view class="notice-list">
				<u-notice-bar :list="noticeList.map(item => item.title)" type="vertical" :duration="4000"
					:is-circular="true" bgColor="#fff7e6" color="#fa8c16" mode="vertical"
					@click="onNoticeClick"></u-notice-bar>

				<view class="notice-detail">
					<u-card :title="currentNotice.title" :sub-title="currentNotice.time" title-size="32"
						sub-title-size="24" :border="false" padding="30" margin="20" :head-border-bottom="false">
						<template #body>
							<view class="notice-content">
								<text>{{ currentNotice.content }}</text>
							</view>
						</template>
					</u-card>
				</view>
			</view>
		</view>

		<!-- 快捷入口 -->
		<view class="quick-access">
			<view class="section-header">
				<text class="section-title">快捷入口</text>
			</view>

			<view class="quick-grid">
				<view class="quick-item" v-for="(item, index) in quickList" :key="index"
					@click="handleQuickAction(item)">
					<view class="quick-icon" :style="{ backgroundColor: item.bgColor }">
						<u-icon :name="item.icon" size="40" color="#ffffff"></u-icon>
					</view>
					<text class="quick-text">{{ item.text }}</text>
				</view>
			</view>
		</view>
		<!-- 底部导航栏 -->
		<u-tabbar :list="tabbar" :before-switch="beforeTabSwitch" icon-size="50" border-top hide-tab-bar></u-tabbar>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 用户信息
				userInfo: {
					avatar: '',
					nickname: ''
				},
				// 搜索关键词
				searchKeyword: '',
				// 轮播图数据
				swiperList: [{
						image: '/static/banner/1.jpg',
						title: '企业公告：新系统上线通知'
					},
					{
						image: '/static/banner/4.jpg',
						title: '人力资源政策更新'
					},
					{
						image: '/static/banner/5.jpg',
						title: '季度优秀员工评选'
					}
				],
				// 功能菜单
				menuList: [{
						name: "用印申请",
						imgUrl: "/static/ico_workOvertime.png",
						route: "/pages/workflow/seal/seal"
					}, {
						name: "客户查询",
						imgUrl: "/static/ico_leave.png",
						route: "/pages/customer/index"
					},
					// {
					// 	name: "请假申请",
					// 	imgUrl: "/static/ico_leave.png",
					// 	route: "/pagesOA/leave/index"
					// },
					// {
					// 	name: "外出申请",
					// 	imgUrl: "/static/ico_goOut.png",
					// 	route: "/pagesOA/goOut/index"
					// },
					// {
					// 	name: "补卡申请",
					// 	imgUrl: "/static/ico_patchCard.png",
					// 	route: "/pagesOA/patchCard/index"
					// }
				],
				// 通知列表
				noticeList: [{
						id: 1,
						title: '人事考勤系统即将上线，敬请期待！',
						content: '为提升公司管理效率，人事考勤系统将于下周一正式上线，请各位同事提前熟悉操作流程。',
						time: '2024-01-15',
						type: 'system'
					},
					{
						id: 2,
						title: '春节放假安排通知',
						content: '根据国务院办公厅通知，结合公司实际情况，现将2024年春节放假安排通知如下...',
						time: '2024-01-10',
						type: 'holiday'
					},
					{
						id: 3,
						title: '年度员工体检通知',
						content: '公司定于本月25日组织年度员工体检，请各部门安排好工作，准时参加。',
						time: '2024-01-08',
						type: 'health'
					}
				],
				currentNotice: {},
				// 快捷入口
				quickList: [{
						icon: 'scan',
						text: '扫一扫',
						bgColor: '#2979ff',
						action: 'scan'
					},
					{
						icon: 'calendar',
						text: '今日考勤',
						bgColor: '#19be6b',
						action: 'attendance'
					},
					{
						icon: 'chat',
						text: '消息',
						bgColor: '#ff9900',
						action: 'message'
					},
					{
						icon: 'setting',
						text: '设置',
						bgColor: '#909399',
						action: 'setting'
					}
				],
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
						count: 2,
						text: "消息"
					},
					// {
					// 	iconPath: "static/icon_bak.png",
					// 	selectedIconPath: "static/icon_bak_sel.png",
					// 	pagePath: "pages/notice/index",
					// 	midButton: true,
					// 	text: "待办"
					// },
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
			};
		},
		onLoad() {
			this.loadUserInfo();
			this.currentNotice = this.noticeList[0];
		},
		onShow() {
			this.refreshData();
		},
		onPullDownRefresh() {
			this.refreshData();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			// 加载用户信息
			async loadUserInfo() {
				try {
					// 这里可以调用API获取用户信息					
					this.userInfo = vk.getVuex('$user.userInfo');

				} catch (error) {
					console.error('加载用户信息失败:', error);
				}
			},

			// 刷新数据
			refreshData() {
				// 可以在这里调用API更新数据
				console.log('刷新数据');
			},

			// 获取问候语
			getGreeting() {
				const hour = new Date().getHours();
				if (hour < 9) return '早上好！';
				if (hour < 12) return '上午好！';
				if (hour < 14) return '中午好！';
				if (hour < 18) return '下午好！';
				return '晚上好！';
			},

			// 搜索
			onSearch(value) {
				if (!value) {
					uni.showToast({
						title: '请输入搜索内容',
						icon: 'none'
					});
					return;
				}

				uni.navigateTo({
					url: `/pages/search/result?keyword=${encodeURIComponent(value)}`
				});
			},

			// 跳转到功能页面
			goToPage(item) {
				if (!item.route) {
					uni.showToast({
						title: '功能开发中',
						icon: 'none'
					});
					return;
				}

				if (item.badge > 0) {
					// 清除红点
					item.badge = 0;
				}

				uni.navigateTo({
					url: item.route
				});
			},

			// 显示所有功能
			showAllFunctions() {
				uni.navigateTo({
					url: '/pages/functions/index'
				});
			},

			// 查看通知详情
			onNoticeClick(index) {
				this.currentNotice = this.noticeList[index];
			},

			// 查看所有通知
			viewAllNotices() {
				uni.navigateTo({
					url: '/pages/notice/index'
				});
			},

			// 处理快捷操作
			handleQuickAction(item) {
				switch (item.action) {
					case 'scan':
						uni.scanCode({
							success: (res) => {
								console.log('扫码结果:', res);
								uni.showToast({
									title: '扫描成功',
									icon: 'success'
								});
							}
						});
						break;
					case 'attendance':
						uni.navigateTo({
							url: '/pages/attendance/today'
						});
						break;
					case 'message':
						uni.switchTab({
							url: '/pages/message/index'
						});
						break;
					case 'setting':
						uni.navigateTo({
							url: '/pages/setting/index'
						});
						break;
				}
			},

			// 切换tab前的拦截
			beforeTabSwitch(index) {
				// 中间按钮处理
				// if (this.tabbarList[index].midButton) {
				// 	this.showCenterAction();
				// 	return false;
				// }				
				return true;
			},

			// 显示中间按钮操作
			showCenterAction() {
				uni.showActionSheet({
					itemList: ['发布通知', '发起审批', '添加联系人'],
					success: (res) => {
						switch (res.tapIndex) {
							case 0:
								uni.navigateTo({
									url: '/pages/notice/create'
								});
								break;
							case 1:
								uni.navigateTo({
									url: '/pages/approval/create'
								});
								break;
							case 2:
								uni.navigateTo({
									url: '/pages/contacts/add'
								});
								break;
						}
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
		padding-bottom: 120rpx;
		box-sizing: border-box;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 80rpx 40rpx 40rpx;
		background-color: #ffffff;
		border-bottom-left-radius: 30rpx;
		border-bottom-right-radius: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.user-info {
			display: flex;
			align-items: center;

			.user-detail {
				display: flex;
				flex-direction: column;
				margin-left: 20rpx;

				.user-name {
					font-size: 36rpx;
					font-weight: bold;
					color: #333333;
					margin-bottom: 8rpx;
				}

				.user-greeting {
					font-size: 26rpx;
					color: #666666;
				}
			}
		}

		.weather-info {
			display: flex;
			align-items: center;
			padding: 12rpx 24rpx;
			background-color: #f8f9fa;
			border-radius: 40rpx;

			.weather-text {
				margin-left: 10rpx;
				font-size: 26rpx;
				color: #666666;
			}
		}
	}

	.search-box {
		padding: 30rpx 40rpx;
	}

	.swiper-box {
		padding: 0 5rpx;

		::v-deep .u-swiper {
			border-radius: 16rpx;
			overflow: hidden;
			box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
		}
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 40rpx 40rpx 30rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
		}

		.section-more {
			font-size: 26rpx;
			color: #999999;
		}
	}

	.menu-box {
		background-color: #ffffff;
		margin: 30rpx 40rpx;
		border-radius: 20rpx;
		padding: 0 0 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.menu-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 40rpx 0 20rpx;
			position: relative;

			.menu-icon {
				margin-bottom: 20rpx;
				transition: transform 0.3s;
			}

			.menu-text {
				font-size: 26rpx;
				color: #333333;
			}

			&:active .menu-icon {
				transform: scale(0.95);
			}
		}

		::v-deep .u-grid-item {
			&::after {
				display: none;
			}
		}
	}

	.notice-box {
		background-color: #ffffff;
		margin: 30rpx 40rpx;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.notice-list {
			padding: 0 30rpx 30rpx;

			::v-deep .u-notice-bar {
				border-radius: 12rpx;
				padding: 20rpx;
			}

			.notice-content {
				font-size: 28rpx;
				line-height: 1.6;
				color: #666666;
			}
		}
	}

	.quick-access {
		background-color: #ffffff;
		margin: 30rpx 40rpx;
		border-radius: 20rpx;
		padding-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		.quick-grid {
			display: flex;
			justify-content: space-around;
			padding: 0 30rpx;

			.quick-item {
				display: flex;
				flex-direction: column;
				align-items: center;

				.quick-icon {
					width: 100rpx;
					height: 100rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 20rpx;
					transition: transform 0.3s;
				}

				.quick-text {
					font-size: 26rpx;
					color: #333333;
				}

				&:active .quick-icon {
					transform: scale(0.95);
				}
			}
		}
	}

	// 响应式调整
	@media (max-width: 750px) {
		.header {
			padding: 60rpx 30rpx 30rpx;
		}

		.search-box {
			padding: 20rpx 30rpx;
		}

		.swiper-box,
		.menu-box,
		.notice-box,
		.quick-access {
			margin-left: 30rpx;
			margin-right: 30rpx;
		}

		.section-header {
			padding: 30rpx 30rpx 20rpx;
		}
	}
</style>