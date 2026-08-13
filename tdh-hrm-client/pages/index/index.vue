<template>
	<view class="container">
		<!-- 真实内容 -->
		<view v-if="!pageLoading">
			<!-- ========== 固定区域（头部 + 搜索 + 轮播） ========== -->
			<view class="sticky-area">
				<!-- 顶部区域（头部+搜索整合） -->
				<view class="top-section">
					<!-- 用户头部 -->
					<view class="header">
						<view class="user-info">
							<u-avatar :src="userInfo.avatar || '/static/txl/ico_logo_@3x.png'" size="80"></u-avatar>
							<view class="user-detail">
								<text class="user-name">{{ userInfo.nickname || '欢迎回来' }}</text>
								<text class="user-greeting">{{ getGreeting() }}</text>
							</view>
						</view>
						<!-- <view class="dept-tag">
							<u-icon name="grid" size="28" color="#ff9900"></u-icon>
							<text class="dept-text">{{ departMentName }}</text>
						</view> -->
					</view>

					<!-- 搜索栏 -->
					<view class="search-box" v-if="hasLogin">
						<view class="search-inner" @click="onSearch">
							<u-icon name="search" size="32" color="#999"></u-icon>
							<text class="search-placeholder">搜索通知、公告...</text>
						</view>
					</view>
				</view>

				<!-- 轮播图 -->
				<view class="swiper-box" v-if="hasLogin">
					<u-swiper :list="swiperList.length ? swiperList : defaultSwiper" height="300"
						indicator-pos="bottomCenter" circular :autoplay="true" :interval="3000" :duration="500"
						bgColor="#f0f2f5" radius="20" @click="onSwiperClick"></u-swiper>
				</view>
			</view>

			<!-- ========== 常用功能（显示8个） ========== -->
			<view class="menu-box">
				<view class="section-header">
					<text class="section-title">常用功能</text>
					<text class="section-more" @click="viewAllFunctions">更多</text>
				</view>

				<u-grid :col="4" :border="false" :gap="10">
					<u-grid-item v-for="(item, index) in displayMenuList" :key="index" @click="goToPage(item)">
						<view class="menu-item">
							<view class="menu-icon-wrapper">
								<!-- 优先显示图片，失败则显示首字母占位 -->
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
							<u-icon :name="item.icon" size="36" color="#ffffff"></u-icon>
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
			<!-- 顶部区域骨架 -->
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

			<!-- 轮播骨架 -->
			<view class="skeleton-swiper-box"></view>

			<!-- 功能菜单骨架 -->
			<view class="skeleton-menu-box">
				<view class="skeleton-section-title"></view>
				<view class="skeleton-grid">
					<view class="skeleton-grid-item" v-for="i in 8" :key="i">
						<view class="skeleton-icon"></view>
						<view class="skeleton-line short" style="width: 60rpx; margin-top: 12rpx;"></view>
					</view>
				</view>
			</view>

			<!-- 通知公告骨架 -->
			<view class="skeleton-notice-box">
				<view class="skeleton-section-title"></view>
				<view class="skeleton-notice-bar"></view>
				<view class="skeleton-notice-card"></view>
			</view>

			<!-- 快捷入口骨架 -->
			<view class="skeleton-quick-access">
				<view class="skeleton-section-title"></view>
				<view class="skeleton-quick-grid">
					<view class="skeleton-quick-item" v-for="i in 4" :key="i">
						<view class="skeleton-quick-icon"></view>
						<view class="skeleton-line short" style="width: 60rpx; margin-top: 12rpx;"></view>
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
						// uni.navigateTo({ url: '/pages/clockin/index' });
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
	   设计变量（统一管理色彩与阴影）
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
		--radius-card: 24rpx;
		--radius-inner: 16rpx;
	}

	/* ============================================================
	   全局容器
	   ============================================================ */
	.container {
		min-height: 100vh;
		background: var(--color-bg);
		padding-bottom: 120rpx;
		box-sizing: border-box;
	}

	/* ============================================================
	   固定区域（头部 + 搜索 + 轮播）
	   ============================================================ */
	.sticky-area {
		position: sticky;
		top: 0;
		z-index: 10;
		background: var(--color-bg);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
	}

	/* ============================================================
	   顶部区域（头部 + 搜索）—— 小清新明亮版
	   ============================================================ */
	.top-section {
		position: relative;
		overflow: hidden;
		padding-bottom: 8rpx;
		border-bottom-left-radius: 36rpx;
		border-bottom-right-radius: 36rpx;
		/* 主背景：明亮渐变色 + 极淡彩色圆点纹理 */
		background:
			radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 30%),
			radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.4) 0%, transparent 25%),
			radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 40%),
			linear-gradient(160deg, #ffffff 0%, #eaf6ff 30%, #fff0f6 60%, #f0fdf4 100%);
		box-shadow: 0 8rpx 30rpx rgba(180, 210, 240, 0.15);
	}

	/* 装饰光晕 1（左上角，天空蓝） */
	.top-section::before {
		content: '';
		position: absolute;
		top: -80rpx;
		right: -60rpx;
		width: 300rpx;
		height: 300rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(135, 206, 250, 0.35) 0%, rgba(135, 206, 250, 0.12) 40%, transparent 70%);
		pointer-events: none;
		animation: floatGlow 6s ease-in-out infinite;
	}

	/* 装饰光晕 2（右下角，薄荷绿） */
	.top-section::after {
		content: '';
		position: absolute;
		bottom: -60rpx;
		left: -40rpx;
		width: 240rpx;
		height: 240rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(144, 238, 144, 0.3) 0%, rgba(144, 238, 144, 0.1) 45%, transparent 70%);
		pointer-events: none;
		animation: floatGlow 8s ease-in-out infinite reverse;
	}

	/* 装饰光晕 3（中间偏上，樱花粉） */
	.top-section .header::after {
		content: '';
		position: absolute;
		top: 20rpx;
		left: 40%;
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 182, 193, 0.3) 0%, rgba(255, 182, 193, 0.1) 50%, transparent 70%);
		pointer-events: none;
		animation: floatGlow 7s ease-in-out infinite;
	}

	/* 光晕浮动动画（更轻柔） */
	@keyframes floatGlow {

		0%,
		100% {
			transform: translate(0, 0) scale(1);
			opacity: 0.9;
		}

		50% {
			transform: translate(8rpx, -12rpx) scale(1.03);
			opacity: 1;
		}
	}

	/* -------- 用户头部 -------- */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 50rpx;
		position: relative;
		z-index: 2;

		.user-info {
			display: flex;
			align-items: center;

			.user-detail {
				display: flex;
				flex-direction: column;
				margin-left: 20rpx;

				.user-name {
					font-size: 36rpx;
					font-weight: 600;
					color: var(--color-text-primary);
					margin-bottom: 6rpx;
					letter-spacing: 0.5rpx;
				}

				.user-greeting {
					font-size: 25rpx;
					color: var(--color-text-light);
					letter-spacing: 0.3rpx;
				}
			}
		}

		.dept-tag {
			display: flex;
			align-items: center;
			padding: 12rpx 22rpx;
			background: rgba(255, 153, 0, 0.1);
			border-radius: 30rpx;
			border: 1rpx solid rgba(255, 153, 0, 0.2);

			.dept-text {
				margin-left: 8rpx;
				font-size: 25rpx;
				color: #e67e22;
				font-weight: 500;
			}
		}
	}

	/* -------- 搜索栏 -------- */
	.search-box {
		padding: 20rpx 24rpx 30rpx;
		position: relative;
		z-index: 2;

		.search-inner {
			display: flex;
			align-items: center;
			height: 76rpx;
			background: rgba(255, 255, 255, 0.9);
			backdrop-filter: blur(12rpx);
			-webkit-backdrop-filter: blur(12rpx);
			border-radius: 38rpx;
			padding: 0 30rpx;
			border: 1rpx solid rgba(0, 0, 0, 0.03);
			box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
			transition: box-shadow 0.2s, transform 0.2s;

			&:active {
				box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.06);
				transform: scale(0.98);
			}

			.search-placeholder {
				margin-left: 14rpx;
				font-size: 27rpx;
				color: #b0b7c3;
			}
		}
	}

	/* ============================================================
	   轮播图
	   ============================================================ */
	.swiper-box {
		padding: 0 24rpx;
		margin-top: -20rpx;
		position: relative;
		z-index: 2;

		::v-deep .u-swiper {
			border-radius: 24rpx !important;
			overflow: hidden;
			box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);

			.u-swiper-indicator {
				bottom: 20rpx !important;

				.u-swiper-indicator__dot {
					width: 14rpx !important;
					height: 14rpx !important;
					background-color: rgba(255, 255, 255, 0.6) !important;

					&.u-swiper-indicator__dot--active {
						background-color: #ffffff !important;
						width: 28rpx !important;
						border-radius: 8rpx !important;
					}
				}
			}
		}
	}

	/* ============================================================
	   通用：区块卡片 & 标题
	   ============================================================ */
	.menu-box,
	.notice-box,
	.quick-access {
		background: var(--color-card);
		margin: 24rpx 30rpx;
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
		padding: 28rpx 30rpx 16rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: var(--color-text-primary);
			letter-spacing: 0.5rpx;

			&::before {
				content: '';
				display: inline-block;
				width: 8rpx;
				height: 32rpx;
				background: var(--color-primary);
				border-radius: 4rpx;
				margin-right: 16rpx;
				vertical-align: middle;
			}
		}

		.section-more {
			font-size: 26rpx;
			color: var(--color-text-light);
			padding: 8rpx 20rpx;
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
			// padding: 10rpx 0 12rpx;
			position: relative;

			.menu-icon-wrapper {
				width: 88rpx;
				height: 88rpx;
				border-radius: 20rpx;
				overflow: hidden;
				margin-bottom: 12rpx;
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
					border-radius: 20rpx;
					background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
					color: #fff;
				}
			}

			.menu-text {
				font-size: 26rpx;
				color: var(--color-text-secondary);
				text-align: center;
				line-height: 1.3;
				max-width: 110rpx;
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

		.menu-more {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 18rpx 0 26rpx;
			border-top: 1rpx solid var(--color-border);
			margin: 0 30rpx;

			text {
				font-size: 26rpx;
				color: var(--color-text-light);
				margin-right: 6rpx;
			}

			&:active {
				opacity: 0.6;
			}
		}
	}

	/* ============================================================
	   通知公告
	   ============================================================ */
	.notice-box {
		.notice-list {
			padding: 0 30rpx 30rpx;

			::v-deep .u-notice-bar {
				border-radius: 16rpx;
				padding: 16rpx 24rpx;
				margin-bottom: 20rpx;
				background: #f8fafc !important;
				border: 1rpx solid #eef1f4;

				.u-notice-bar__content {
					font-size: 27rpx;
					color: var(--color-text-secondary);
				}
			}

			.notice-card {
				background: #fafbfc;
				border-radius: 16rpx;
				padding: 22rpx 26rpx;
				border: 1rpx solid #f0f0f0;
				position: relative;
				transition: all 0.2s;

				&::before {
					content: '';
					position: absolute;
					left: 0;
					top: 0;
					bottom: 0;
					width: 6rpx;
					// background: var(--color-primary);
					border-radius: 0 4rpx 4rpx 0;
				}

				&:active {
					background: #f0f2f5;
					transform: translateY(2rpx);
				}

				.notice-card-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 12rpx;

					.notice-card-title {
						font-size: 30rpx;
						font-weight: 500;
						color: var(--color-text-primary);
						flex: 1;
						margin-right: 20rpx;
					}

					.notice-card-time {
						font-size: 26rpx;
						color: #b0b7c3;
						flex-shrink: 0;
					}
				}

				.notice-card-body {
					font-size: 26rpx;
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
			padding: 10rpx 20rpx 30rpx;

			.quick-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				min-width: 120rpx;

				.quick-icon {
					width: 92rpx;
					height: 92rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 14rpx;
					box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.12);
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
					font-size: 26rpx;
					color: var(--color-text-secondary);
				}

				&:active .quick-icon {
					transform: scale(0.9);
					box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
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
	   响应式适配
	   ============================================================ */
	@media (max-width: 750px) {
		.header {
			padding: 36rpx 28rpx 6rpx;
		}

		.search-box {
			padding: 12rpx 24rpx 22rpx;
		}

		.swiper-box {
			padding: 0 24rpx;
		}

		.menu-box,
		.notice-box,
		.quick-access {
			margin: 20rpx 24rpx;
		}

		.section-header {
			padding: 22rpx 24rpx 12rpx;
		}

		.menu-box .menu-more {
			margin: 0 24rpx;
		}
	}

	/* ============================================================
	   骨架屏（同步视觉升级）
	   ============================================================ */
	.skeleton-container {
		padding: 0;
		background: var(--color-bg);
	}

	.skeleton-top-section {
		background: #ffffff;
		border-bottom-left-radius: 36rpx;
		border-bottom-right-radius: 36rpx;
		padding-bottom: 8rpx;
		margin-bottom: 0;
	}

	.skeleton-header {
		display: flex;
		align-items: center;
		padding: 44rpx 30rpx 10rpx;
	}

	.skeleton-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		flex-shrink: 0;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-user-detail {
		flex: 1;
		margin-left: 20rpx;
	}

	.skeleton-dept-tag {
		width: 80rpx;
		height: 40rpx;
		border-radius: 30rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-search-bar {
		margin: 20rpx 24rpx 30rpx;
		height: 76rpx;
		border-radius: 38rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-swiper-box {
		height: 300rpx;
		border-radius: 24rpx;
		margin: -20rpx 24rpx 0;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-menu-box,
	.skeleton-notice-box,
	.skeleton-quick-access {
		background: #ffffff;
		margin: 24rpx 30rpx;
		border-radius: 24rpx;
		padding: 0 0 24rpx;
		box-shadow: var(--shadow-card);
		overflow: hidden;
	}

	.skeleton-section-title {
		height: 32rpx;
		width: 180rpx;
		border-radius: 8rpx;
		margin: 28rpx 30rpx 20rpx;
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
		// padding: 10rpx 0 12rpx;
	}

	.skeleton-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 20rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-notice-bar {
		height: 60rpx;
		border-radius: 16rpx;
		margin: 0 30rpx 20rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-notice-card {
		height: 110rpx;
		border-radius: 16rpx;
		margin: 0 30rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-quick-grid {
		display: flex;
		justify-content: space-around;
		padding: 10rpx 20rpx 30rpx;
	}

	.skeleton-quick-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.skeleton-quick-icon {
		width: 92rpx;
		height: 92rpx;
		border-radius: 50%;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		animation: skeleton-loading 1.5s infinite;
	}

	.skeleton-line {
		height: 28rpx;
		background: linear-gradient(90deg, #e8ecf1 25%, #f2f5f8 50%, #e8ecf1 75%);
		background-size: 200% 100%;
		border-radius: 8rpx;
		animation: skeleton-loading 1.5s infinite;
		margin-bottom: 10rpx;

		&.short {
			height: 22rpx;
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