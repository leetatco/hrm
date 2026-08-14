<template>
	<view class="container">
		<!-- 真实内容 -->
		<view v-if="!pageLoading">
			<!-- ========== 固定卡片区域（头部 + 搜索 + 轮播 融合） ========== -->
			<view class="sticky-card">
				<!-- 顶部区域（头部+搜索整合） -->
				<view class="top-section">
					<!-- 状态栏占位（与胶囊按钮对齐） -->
					<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
					
					<!-- 用户头部 -->
					<view class="header">
						<view class="user-info">
							<u-avatar :src="userInfo.avatar || '/static/txl/ico_logo_@3x.png'" size="76"></u-avatar>
							<view class="user-detail">
								<text class="user-name">{{ userInfo.nickname || '欢迎回来' }}</text>
								<text class="user-greeting">{{ getGreeting() }}</text>
							</view>
						</view>
					</view>

					<!-- 搜索栏 -->
					<view class="search-box" v-if="hasLogin">
						<view class="search-inner" @click="onSearch">
							<u-icon name="search" size="32" color="#999"></u-icon>
							<text class="search-placeholder">搜索通知、公告...</text>
							<view class="search-btn">搜索</view>
						</view>
					</view>
				</view>

				<!-- 轮播图（白色背景，不透明） -->
				<view class="swiper-box" v-if="hasLogin">
					<u-swiper :list="swiperList.length ? swiperList : defaultSwiper" height="320"
						indicator-pos="bottomCenter" circular :autoplay="true" :interval="3000" :duration="500"
						bgColor="#ffffff" radius="16" @click="onSwiperClick"></u-swiper>
				</view>
			</view>

			<!-- ========== 常用功能（显示8个） ========== -->
			<view class="menu-box">
				<view class="section-header">
					<text class="section-title">常用功能</text>
					<text class="section-more" @click="viewAllFunctions">更多</text>
				</view>

				<u-grid :col="4" :border="false" :gap="6">
					<u-grid-item v-for="(item, index) in displayMenuList" :key="index" @click="goToPage(item)">
						<view class="menu-item">
							<view class="menu-icon-wrapper">
								<image class="menu-icon" :src="item.imgUrl || ''" mode="aspectFill"
									@error="onIconError($event, item)" v-if="item.imgUrl && item._imgLoaded !== false">
								</image>
								<view class="menu-icon-placeholder" :style="{ background: getColor(index) }" v-else>
									<text class="placeholder-text">{{ item.name.charAt(0) }}</text>
								</view>
							</view>
							<text class="menu-text">{{ item.name }}</text>
							<u-badge v-if="item.badge" :value="item.badge" :offset="[-5, -5]" size="mini"></u-badge>
						</view>
					</u-grid-item>
				</u-grid>
			</view>

			<!-- ========== 通知公告 ========== -->
			<view class="notice-box" v-if="hasLogin">
				<view class="section-header">
					<text class="section-title">通知公告</text>
					<text class="section-more" @click="viewAllNotices">更多</text>
				</view>

				<view class="notice-list">
					<u-notice-bar :list="noticeList.map(item => item.title)" :duration="4000" :is-circular="false"
						bgColor="#f5f7fa" color="#ff9900" mode="vertical" @click.stop="onNoticeClick"></u-notice-bar>

					<view class="notice-detail" @click="showDetail(currentNotice)">
						<view class="notice-card">
							<view class="notice-card-header">
								<text class="notice-card-title u-line-1">{{ currentNotice.title || '暂无通知' }}</text>
								<text
									class="notice-card-time">{{ currentNotice.publish_date ? vk.pubfn.timeFormat(new Date(currentNotice.publish_date), 'MM-dd') : '' }}</text>
							</view>
							<view class="notice-card-body u-line-2" v-html="currentNotice.content || '暂无内容'"></view>
						</view>
					</view>
				</view>
			</view>

			<!-- ========== 快捷入口 ========== -->
			<view class="quick-access" v-if="hasLogin">
				<view class="section-header">
					<text class="section-title">快捷入口</text>
				</view>
				<view class="quick-grid">
					<view class="quick-item" v-for="(item, index) in quickList" :key="index"
						@click="handleQuickAction(item)">
						<view class="quick-icon" :style="{ background: item.bgColor }">
							<u-icon :name="item.icon" size="32" color="#ffffff"></u-icon>
						</view>
						<text class="quick-text">{{ item.text }}</text>
					</view>
				</view>
			</view>

			<!-- ========== 公告详情弹窗 ========== -->
			<u-popup v-model="showDetailPopup" :mode="popupStyle.mode" :closeable="true" :mask-close-able="true"
				:height="popupStyle.height" :border-radius="popupStyle.border_radius" v-if="hasLogin">
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
		</view>

		<!-- ========== 骨架屏 ========== -->
		<view v-else class="skeleton-container">
			<view class="skeleton-sticky-card">
				<view class="skeleton-status-bar"></view>
				<view class="skeleton-top-section">
					<view class="skeleton-header">
						<view class="skeleton-avatar"></view>
						<view class="skeleton-user-detail">
							<view class="skeleton-line" style="width: 200rpx;"></view>
							<view class="skeleton-line short" style="width: 140rpx;"></view>
						</view>
						<view class="skeleton-dept-tag"></view>
					</view>
					<view class="skeleton-search-bar"></view>
				</view>
				<view class="skeleton-swiper-box"></view>
			</view>

			<view class="skeleton-menu-box">
				<view class="skeleton-section-title"></view>
				<view class="skeleton-grid">
					<view class="skeleton-grid-item" v-for="i in 8" :key="i">
						<view class="skeleton-icon"></view>
						<view class="skeleton-line short" style="width: 60rpx; margin-top: 10rpx;"></view>
					</view>
				</view>
			</view>

			<view class="skeleton-notice-box">
				<view class="skeleton-section-title"></view>
				<view class="skeleton-notice-bar"></view>
				<view class="skeleton-notice-card"></view>
			</view>

			<view class="skeleton-quick-access">
				<view class="skeleton-section-title"></view>
				<view class="skeleton-quick-grid">
					<view class="skeleton-quick-item" v-for="i in 4" :key="i">
						<view class="skeleton-quick-icon"></view>
						<view class="skeleton-line short" style="width: 60rpx; margin-top: 10rpx;"></view>
					</view>
				</view>
			</view>
		</view>

		<!-- ========== 底部导航 ========== -->
		<u-tabbar :list="tabbar" :before-switch="beforeTabSwitch" icon-size="48" font-size="20" border-top hide-tab-bar
			active-color="#2979ff" inactive-color="#999"></u-tabbar>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pageLoading: true,
				statusBarHeight: 20,
				popupStyle: {
					mode: "bottom",
					border_radius: 16,
					height: "90%"
				},
				userInfo: {},
				searchKeyword: '',
				swiperList: [],
				defaultSwiper: [{
					image: '/static/default_banner.png',
					title: '欢迎使用'
				}],
				menuList: [],
				menuSort: [666],
				showDetailPopup: false,
				noticeList: [],
				currentNotice: {
					title: '',
					content: '',
					publish_date: ''
				},
				colorPool: ['#2979ff', '#19be6b', '#ff9900', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22', '#3498db'],
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
			};
		},
		computed: {
			departMentName() {
				return vk.getVuex('$user.employeeInfo.department_name') || '人事部';
			},
			hasLogin() {
				return !!vk.getVuex('$user.userInfo.username');
			},
			displayMenuList() {
				return this.menuList.slice(0, 8);
			}
		},
		async onLoad() {
			const sysInfo = uni.getSystemInfoSync();
			this.statusBarHeight = sysInfo.statusBarHeight || 20;
			
			this.pageLoading = true;
			this.loadUserInfo();
			await Promise.all([
				this.loadSwiperList(),
				this.loadMenuList(),
				this.loadNoticeList()
			]);
			this.currentNotice = this.noticeList[0] || {
				title: '暂无通知',
				content: '暂无内容',
				publish_date: ''
			};
			this.pageLoading = false;
		},
		onShow() {
			this.refreshData();
			this.loadUnreadCount();
		},
		onPullDownRefresh() {
			this.refreshData();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			async loadSwiperList() {
				try {
					const res = await this.vk.callFunction({
						url: 'admin/opendb-banner/pub/getList',
						data: {
							pageSize: -1,
							pageIndex: 1
						}
					});
					if (res.code === 0 && res.rows.length) {
						this.swiperList = res.rows.map(e => ({
							image: e.bannerfile,
							title: e.title || ''
						}));
					}
				} catch (error) {
					console.error('加载轮播图失败:', error);
				}
			},
			async loadMenuList() {
				try {
					const url = this.hasLogin ? 'admin/common-functions/sys/getList' :
						'admin/common-functions/pub/getList';
					const res = await this.vk.callFunction({
						url: url,
						data: {
							status: 'enabled',
							sort: this.menuSort,
							pageSize: -1,
							pageIndex: 1
						}
					});
					if (res.code === 0) {
						this.menuList = res.rows.map(item => ({
							...item,
							_imgLoaded: true
						}));
					}
				} catch (error) {
					console.error('加载常用功能失败:', error);
				}
			},
			async loadNoticeList() {
				try {
					if (!this.hasLogin) return;
					const res = await this.vk.callFunction({
						url: 'admin/opendb-notice/pub/getListTop',
						data: {
							pageSize: -1,
							pageIndex: 1
						}
					});
					if (res.code === 0) {
						this.noticeList = res.rows;
					}
				} catch (error) {
					console.error('加载通知失败:', error);
				}
			},
			async loadUnreadCount() {
				try {
					if (!this.hasLogin) return;
					const res = await this.vk.callFunction({
						url: 'admin/bpmn/notification/pub/getUnreadCount',
						data: {
							userInfo: this.userInfo,
							pageSize: -1,
							pageIndex: 1
						}
					});
					if (res.code === 0) {
						this.tabbar[1].count = res.data.count || 0;
					}
				} catch (error) {
					console.error('加载未读数量失败:', error);
				}
			},
			loadUserInfo() {
				try {
					this.userInfo = vk.getVuex('$user.userInfo') || {};
				} catch (error) {
					console.error('加载用户信息失败:', error);
				}
			},
			refreshData() {
				console.log('刷新数据');
			},
			getColor(index) {
				return this.colorPool[index % this.colorPool.length];
			},
			onIconError(event, item) {
				item._imgLoaded = false;
				this.$forceUpdate();
			},
			getGreeting() {
				const hour = new Date().getHours();
				if (hour < 9) return '早上好 ☀️';
				if (hour < 12) return '上午好 🌤';
				if (hour < 14) return '中午好 🌞';
				if (hour < 18) return '下午好 🌥';
				return '晚上好 🌙';
			},
			onSearch() {
				uni.navigateTo({
					url: '/pages/opendb-notice/index'
				});
			},
			onSwiperClick(index) {
				const item = this.swiperList[index];
				if (item?.url) {
					uni.navigateTo({
						url: item.url
					});
				}
			},
			goToPage(item) {
				if (!item.route) {
					uni.showToast({
						title: '功能开发中',
						icon: 'none'
					});
					return;
				}
				if (item.badge > 0) item.badge = 0;
				uni.navigateTo({
					url: item.route
				});
			},
			viewAllFunctions() {
				uni.navigateTo({
					url: '/pages/functions/index'
				});
			},
			viewAllNotices() {
				uni.navigateTo({
					url: '/pages/opendb-notice/index'
				});
			},
			onNoticeClick(index) {
				if (this.noticeList[index]) {
					this.currentNotice = this.noticeList[index];
				}
			},
			showDetail(item) {
				if (!item.title) return;
				this.currentNotice = {
					...item
				};
				this.showDetailPopup = true;
			},
			handleQuickAction(item) {
				switch (item.action) {
					case 'scan':
						uni.scanCode({
							success: (res) => {
								vk.alert(res, '提示', '确定');
							}
						});
						break;
					case 'attendance':
						break;
					case 'message':
						uni.switchTab({
							url: '/pages/notice/index'
						});
						break;
					case 'setting':
						uni.navigateTo({
							url: '/pages/setting/index'
						});
						break;
				}
			},
			beforeTabSwitch(index) {
				return true;
			}
		}
	};
</script>

<style lang="scss" scoped>
	/* ============================================================
	   设计变量
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
		--radius-inner: 16rpx;
		--card-gap: 24rpx;  /* 👈 统一间距变量，方便全局调整 */
	}

	.search-btn {
		padding: 8rpx 20rpx;
		background: linear-gradient(135deg, #2979ff, #5a9cff);
		color: #fff;
		font-size: 24rpx;
		border-radius: 28rpx;
		box-shadow: 0 4rpx 12rpx rgba(41, 121, 255, 0.3);
		flex-shrink: 0;
		margin-left: 12rpx;
	}

	.container {
		min-height: 100vh;
		background: var(--color-bg);
		padding-bottom: 120rpx;
		box-sizing: border-box;
	}

	/* ============================================================
	   固定卡片区域 ———— 上下外边距 24rpx（8网格标准）
	   ============================================================ */
	.sticky-card {
		margin: var(--card-gap) 24rpx;
		border-radius: var(--radius-card);
		overflow: hidden;
		box-shadow: var(--shadow-card);
		position: sticky;
		top: 0;
		z-index: 10;
		background:
			radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 30%),
			radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.4) 0%, transparent 25%),
			radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 40%),
			linear-gradient(160deg, #ffffff 0%, #eaf6ff 30%, #fff0f6 60%, #f0fdf4 100%);
		position: relative;
	}

	/* 装饰光晕 1（左上角，天空蓝） */
	.sticky-card::before {
		content: '';
		position: absolute;
		top: -80rpx;
		right: -60rpx;
		width: 300rpx;
		height: 300rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(100, 180, 255, 0.35) 0%, rgba(100, 180, 255, 0.12) 45%, transparent 70%);
		pointer-events: none;
		animation: floatGlow 6s ease-in-out infinite;
	}

	/* 装饰光晕 2（右下角，亮橙色/金色） */
	.sticky-card::after {
		content: '';
		position: absolute;
		bottom: -60rpx;
		left: -40rpx;
		width: 240rpx;
		height: 240rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 190, 50, 0.40) 0%, rgba(255, 170, 30, 0.18) 45%, transparent 70%);
		pointer-events: none;
		animation: floatGlow 8s ease-in-out infinite reverse;
	}

	/* 装饰光晕 3（中间偏上，樱花粉） */
	.top-section::after {
		content: '';
		position: absolute;
		top: 20rpx;
		left: 40%;
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 180, 200, 0.35) 0%, rgba(255, 150, 180, 0.15) 50%, transparent 70%);
		pointer-events: none;
		animation: floatGlow 7s ease-in-out infinite;
	}

	@keyframes floatGlow {
		0%, 100% {
			transform: translate(0, 0) scale(1);
			opacity: 0.9;
		}
		50% {
			transform: translate(8rpx, -12rpx) scale(1.03);
			opacity: 1;
		}
	}

	/* ============================================================
	   顶部区域（背景透明）
	   ============================================================ */
	.top-section {
		position: relative;
		overflow: visible;
		padding: 0 24rpx 0;
		background: transparent;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}

	.status-bar {
		width: 100%;
		background: transparent;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0;
		position: relative;
		z-index: 2;

		.user-info {
			display: flex;
			align-items: center;

			.user-detail {
				display: flex;
				flex-direction: column;
				margin-left: 16rpx;

				.user-name {
					font-size: 34rpx;
					font-weight: 600;
					color: var(--color-text-primary);
					margin-bottom: 4rpx;
					letter-spacing: 0.5rpx;
				}

				.user-greeting {
					font-size: 24rpx;
					color: var(--color-text-light);
					letter-spacing: 0.3rpx;
				}
			}
		}
	}

	/* -------- 搜索栏 -------- */
	.search-box {
		padding: 16rpx 0 12rpx;
		position: relative;
		z-index: 2;
		background: transparent;

		.search-inner {
			display: flex;
			align-items: center;
			height: 72rpx;
			background: rgba(255, 255, 255, 0.9);
			backdrop-filter: blur(12rpx);
			-webkit-backdrop-filter: blur(12rpx);
			border-radius: 36rpx;
			padding: 0 24rpx;
			border: 1rpx solid rgba(0, 0, 0, 0.03);
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
			transition: box-shadow 0.2s, transform 0.2s;

			&:active {
				box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
				transform: scale(0.98);
			}

			.search-placeholder {
				flex: 1;
				margin-left: 12rpx;
				font-size: 26rpx;
				color: #b0b7c3;
			}
		}
	}

	/* ============================================================
	   轮播图（白色背景）
	   ============================================================ */
	.swiper-box {
		padding: 0 24rpx 20rpx;
		margin-top: 0;
		background: transparent;

		::v-deep .u-swiper {
			border-radius: 16rpx !important;
			overflow: hidden;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

			.u-swiper-indicator {
				bottom: 16rpx !important;

				.u-swiper-indicator__dot {
					width: 12rpx !important;
					height: 12rpx !important;
					background-color: rgba(0, 0, 0, 0.15) !important;

					&.u-swiper-indicator__dot--active {
						background-color: #2979ff !important;
						width: 24rpx !important;
						border-radius: 6rpx !important;
					}
				}
			}
		}
	}

	/* ============================================================
	   通用：区块卡片 ———— 所有区块统一 margin: 24rpx 24rpx
	   ============================================================ */
	.menu-box,
	.notice-box,
	.quick-access {
		background: var(--color-card);
		margin: var(--card-gap) 24rpx;
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-card);
		overflow: hidden;
		transition: box-shadow 0.2s;

		&:hover {
			box-shadow: var(--shadow-hover);
		}
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 24rpx 6rpx;

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
				background: var(--color-primary);
				border-radius: 4rpx;
				margin-right: 14rpx;
				vertical-align: middle;
			}
		}

		.section-more {
			font-size: 24rpx;
			color: var(--color-text-light);
			padding: 6rpx 16rpx;
			border-radius: 24rpx;
			background: #f5f7fa;
			transition: all 0.2s;

			&:active {
				background: #e8eaed;
				color: var(--color-text-secondary);
			}
		}
	}

	/* ============================================================
	   功能菜单
	   ============================================================ */
	.menu-box {
		.menu-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			position: relative;

			.menu-icon-wrapper {
				width: 80rpx;
				height: 80rpx;
				border-radius: 18rpx;
				overflow: hidden;
				margin-bottom: 8rpx;
				flex-shrink: 0;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
				transition: transform 0.2s, box-shadow 0.2s;

				.menu-icon {
					width: 100%;
					height: 100%;
					display: block;
				}

				.menu-icon-placeholder {
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 18rpx;
					background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
					color: #fff;
				}
			}

			.menu-text {
				font-size: 24rpx;
				color: var(--color-text-secondary);
				text-align: center;
				line-height: 1.3;
				max-width: 100rpx;
				word-break: break-all;
			}

			&:active .menu-icon-wrapper {
				transform: scale(0.92);
				box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
			}
		}

		::v-deep .u-grid-item {
			&::after {
				display: none;
			}
		}
	}

	/* ============================================================
	   通知公告
	   ============================================================ */
	.notice-box {
		.notice-list {
			padding: 0 24rpx 20rpx;

			::v-deep .u-notice-bar {
				border-radius: 12rpx;
				padding: 12rpx 20rpx;
				margin-bottom: 16rpx;
				background: #f8fafc !important;
				border: 1rpx solid #eef1f4;

				.u-notice-bar__content {
					font-size: 26rpx;
					color: var(--color-text-secondary);
				}
			}

			.notice-card {
				background: #fafbfc;
				border-radius: 12rpx;
				padding: 16rpx 20rpx;
				border: 1rpx solid #f0f0f0;
				position: relative;
				transition: all 0.2s;

				&:active {
					background: #f0f2f5;
					transform: translateY(2rpx);
				}

				.notice-card-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 6rpx;

					.notice-card-title {
						font-size: 28rpx;
						font-weight: 500;
						color: var(--color-text-primary);
						flex: 1;
						margin-right: 16rpx;
					}

					.notice-card-time {
						font-size: 24rpx;
						color: #b0b7c3;
						flex-shrink: 0;
					}
				}

				.notice-card-body {
					font-size: 24rpx;
					color: var(--color-text-secondary);
					line-height: 1.6;
				}
			}
		}
	}

	/* ============================================================
	   快捷入口
	   ============================================================ */
	.quick-access {
		.quick-grid {
			display: flex;
			justify-content: space-around;
			padding: 6rpx 16rpx 16rpx;

			.quick-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				min-width: 100rpx;

				.quick-icon {
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 10rpx;
					box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.10);
					transition: transform 0.2s, box-shadow 0.2s;
					position: relative;
					overflow: hidden;

					&::after {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						height: 50%;
						background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
						border-radius: 50% 50% 0 0;
					}
				}

				.quick-text {
					font-size: 24rpx;
					color: var(--color-text-secondary);
				}

				&:active .quick-icon {
					transform: scale(0.9);
					box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
				}
			}
		}
	}

	.detail-popup {
		height: 100%;
		display: flex;
		flex-direction: column;

		.detail-scroll {
			flex: 1;
			padding: 30rpx 32rpx 40rpx;
		}

		.detail-title {
			font-size: 38rpx;
			font-weight: 600;
			color: var(--color-text-primary);
			margin-bottom: 20rpx;
			line-height: 1.4;
		}

		.detail-meta {
			font-size: 26rpx;
			color: #b0b7c3;
			margin-bottom: 30rpx;
			display: flex;
			gap: 24rpx;
		}

		.detail-content {
			font-size: 30rpx;
			color: var(--color-text-secondary);
			line-height: 1.8;
		}
	}

	/* ============================================================
	   响应式适配（统一间距）
	   ============================================================ */
	@media (max-width: 750px) {
		.sticky-card {
			margin: 20rpx 20rpx; /* 小屏适当缩小，仍保持8网格节奏 */
		}
		.top-section {
			padding: 0 20rpx 0;
		}
		.swiper-box {
			padding: 0 20rpx 16rpx;
		}
		.menu-box,
		.notice-box,
		.quick-access {
			margin: 20rpx 20rpx;
		}
		.section-header {
			padding: 14rpx 20rpx 4rpx;
		}
	}

	/* ============================================================
	   骨架屏
	   ============================================================ */
	.skeleton-container {
		padding: 0;
		background: var(--color-bg);
	}

	.skeleton-sticky-card {
		margin: var(--card-gap) 24rpx;
		border-radius: var(--radius-card);
		overflow: hidden;
		background: linear-gradient(160deg, #f5f9ff, #fff5f9);
		box-shadow: var(--shadow-card);
	}

	.skeleton-status-bar {
		height: 20px;
		width: 100%;
		background: transparent;
	}

	.skeleton-top-section {
		padding: 0 24rpx 0;
		background: transparent;
	}

	.skeleton-header {
		display: flex;
		align-items: center;
		padding: 0 0 10rpx;
	}

	.skeleton-avatar {
		width: 76rpx;
		height: 76rpx;
		border-radius: 50%;
		flex-shrink: 0;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-user-detail {
		flex: 1;
		margin-left: 16rpx;
	}

	.skeleton-dept-tag {
		width: 80rpx;
		height: 36rpx;
		border-radius: 30rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-search-bar {
		margin: 16rpx 0 12rpx;
		height: 72rpx;
		border-radius: 36rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-swiper-box {
		height: 280rpx;
		border-radius: 16rpx;
		margin: 0 24rpx 20rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-menu-box,
	.skeleton-notice-box,
	.skeleton-quick-access {
		background: #ffffff;
		margin: var(--card-gap) 24rpx;
		border-radius: var(--radius-card);
		padding: 0 0 16rpx;
		box-shadow: var(--shadow-card);
		overflow: hidden;
	}

	.skeleton-section-title {
		height: 28rpx;
		width: 160rpx;
		border-radius: 8rpx;
		margin: 16rpx 24rpx 10rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 0 10rpx;
	}

	.skeleton-grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 25%;
	}

	.skeleton-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 18rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-notice-bar {
		height: 56rpx;
		border-radius: 12rpx;
		margin: 0 24rpx 16rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-notice-card {
		height: 100rpx;
		border-radius: 12rpx;
		margin: 0 24rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-quick-grid {
		display: flex;
		justify-content: space-around;
		padding: 0 16rpx 16rpx;
	}

	.skeleton-quick-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.skeleton-quick-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-line {
		height: 24rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		border-radius: 8rpx;
		animation: skeleton-loading 1.5s infinite;
		margin-bottom: 8rpx;

		&.short {
			height: 20rpx;
		}
	}

	@keyframes skeleton-loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>