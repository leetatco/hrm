<template>
	<view class="container">
		<!-- 顶部日期导航栏 -->
		<view class="date-navbar">
			<view class="date-navbar__inner">
				<view class="date-navbar__arrow" @click="prevDay">
					<u-icon name="arrow-left" size="32" color="#666"></u-icon>
				</view>
				<view class="date-navbar__date" @click="openCalendar">
					<text class="date-navbar__date-text">{{ currentDateStr }}</text>
					<text class="date-navbar__weekday">{{ currentWeekday }}</text>
					<u-icon name="calendar" size="28" color="#999" class="date-navbar__calendar-icon"></u-icon>
				</view>
				<view class="date-navbar__arrow" @click="nextDay">
					<u-icon name="arrow-right" size="32" color="#666"></u-icon>
				</view>
			</view>
		</view>

		<!-- 统计卡片 - 显示当日打卡次数 -->
		<view class="stats-card" v-if="!empty && clocks.length > 0">
			<view class="stats-card__inner">
				<u-icon name="checkmark-circle" size="40" color="#2d8cff"></u-icon>
				<text class="stats-card__text">今日已打卡 <text class="stats-card__count">{{ clocks.length }}</text> 次</text>
			</view>
		</view>

		<!-- 列表区 -->
		<scroll-view scroll-y class="list-scroll" :style="{ height: scrollHeight + 'px' }" enhanced
			:show-scrollbar="false" :refresher-enabled="true" :refresher-triggered="refreshing"
			@refresherrefresh="onRefresherRefresh" @scrolltolower="onScrollToLower" lower-threshold="100">
			<view class="list-container">
				<!-- 空白页 -->
				<view v-if="empty" class="empty-wrapper">
					<u-empty :text="`${currentDateStr} 暂无打卡记录`" mode="list"
						icon="http://cdn.uviewui.com/uview/empty/list.png"></u-empty>
					<view class="empty-tip">
						<text class="empty-tip__text">点击底部「打卡」按钮开始记录</text>
					</view>
				</view>

				<!-- 打卡记录卡片列表 -->
				<view class="clock-card" v-for="(item, index) in clocks" :key="index">
					<view class="clock-card__header">
						<view class="clock-card__time-badge">
							<u-icon name="clock" size="28" color="#2d8cff"></u-icon>
							<text
								class="clock-card__time">{{ vk.pubfn.timeFormat(new Date(item.clockintime), 'hh:mm') }}</text>
						</view>
						<view class="clock-card__type" :class="getTypeClass(item.type)">
							<text>{{ item.type }}</text>
						</view>
					</view>

					<view class="clock-card__content">
						<!-- 图片区域 -->
						<view class="clock-card__image" v-if="item.img && item.img.url">
							<uni-file-picker v-model="item.img" fileMediatype="image" returnType="object"
								:image-styles="imageStyle" :del-icon="false" disabled />
						</view>

						<!-- 信息区域 -->
						<view class="clock-card__info" :class="{ 'full-width': !(item.img && item.img.url) }">
							<!-- Wi-Fi 名称 -->
							<view class="info-row" v-if="item.wifis">
								<view class="info-label">
									<u-icon name="wifi" size="28" color="#999"></u-icon>
									<text>名称</text>
								</view>
								<text class="info-value">{{ item.wifis.ssid }}</text>
							</view>
							<!-- Wi-Fi 位置 -->
							<view class="info-row">
								<view class="info-label">
									<u-icon name="map" size="28" color="#999"></u-icon>
									<text>位置</text>
								</view>
								<text class="info-value">{{ item.bssid || '未获取' }}</text>
							</view>
							<view class="info-row">
								<view class="info-label">
									<u-icon name="account" size="28" color="#999"></u-icon>
									<text>姓名</text>
								</view>
								<text class="info-value">{{ item.employeeInfo?.employee_name || '' }}</text>
							</view>
							<view class="info-row">
								<view class="info-label">
									<u-icon name="edit-pen" size="28" color="#999"></u-icon>
									<text>备注</text>
								</view>
								<text class="info-value remark-text">{{ item.remark }}</text>
							</view>
						</view>
					</view>
				</view>

				<view style="height: 120rpx"></view>
			</view>
		</scroll-view>

		<!-- 底部操作区 -->
		<view class="oper-area">
			<view class="oper-area__left">
				<view @click="openCalendar" class="oper-btn">
					<u-icon name="calendar" size="44" color="#666"></u-icon>
					<text class="oper-btn__text">日期</text>
				</view>
				<view @click="todayDatas" class="oper-btn">
					<u-icon name="order" size="44" color="#666"></u-icon>
					<text class="oper-btn__text">最新</text>
				</view>
				<view v-if="uniIDHasRole('clockinAdmin') || uniIDHasRole('admin')" @click="toSetting" class="oper-btn">
					<u-icon name="setting" size="44" color="#666"></u-icon>
					<text class="oper-btn__text">设置</text>
				</view>
			</view>
			<view class="oper-area__right">
				<view class="clockin-btn" @click="toClockin">
					<u-icon name="map" size="40" color="#ffffff"></u-icon>
					<text class="clockin-btn__text">打卡</text>
				</view>
			</view>
		</view>

		<!-- 日历组件 -->
		<u-calendar v-model="showCalendar" :mode="mode" @change="handleCalendarChange" :color="themeColor"
			:bg-color="'#ffffff'" :month-bg="'#f5f5f5'" :btn-type="'primary'" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 主题色
				themeColor: '#2d8cff',
				// 图片样式配置
				imageStyle: {
					border: {
						radius: '12rpx'
					},
					height: "140rpx",
					width: "140rpx",
				},
				// 请求数据
				reqdata: {
					clockintime: "",
					todayStart: "",
					todayEnd: ""
				},
				empty: false,
				mode: 'date',
				showCalendar: false,
				clocks: [],
				is_submit: 1,
				platform: "",
				platform_name: "",
				currentDateStr: "", // 当前显示的日期字符串
				currentWeekday: "", // 当前星期几
				scrollHeight: 0, // 滚动区域高度
				refreshing: false, // 下拉刷新状态
				loadingMore: false, // 上拉加载更多状态
			};
		},
		watch: {
			clocks(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			},
		},
		onLoad() {
			this.initScrollHeight();
		},
		onShow() {
			this.loadData();
		},
		methods: {
			// 初始化滚动区域高度
			initScrollHeight() {
				const systemInfo = uni.getSystemInfoSync();
				const windowHeight = systemInfo.windowHeight;
				// 减去导航栏高度和底部操作区高度（单位px）
				const navBarHeight = 100; // 日期导航栏大约100rpx转px
				const operAreaHeight = 120; // 底部操作区120rpx转px
				const rpxToPx = systemInfo.windowWidth / 750;
				const navHeight = navBarHeight * rpxToPx;
				const operHeight = operAreaHeight * rpxToPx;
				this.scrollHeight = windowHeight - navHeight - operHeight;
			},
			// 获取星期几
			getWeekday(date) {
				const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
				return weekdays[date.getDay()];
			},
			// 更新显示的日期
			updateDisplayDate() {
				let date = new Date(this.reqdata.clockintime);
				this.currentDateStr = vk.pubfn.timeFormat(date, 'yyyy年MM月dd日');
				this.currentWeekday = this.getWeekday(date);
			},
			// 打开日历
			openCalendar() {
				this.showCalendar = true;
			},
			// 日历选择回调
			async handleCalendarChange(e) {
				this.reqdata.clockintime = e.result;
				this.updateDisplayDate();
				await this.loadData();
			},
			// 前一天
			async prevDay() {
				let currentDate = new Date(this.reqdata.clockintime);
				let prevDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
				this.reqdata.clockintime = vk.pubfn.timeFormat(prevDate, 'yyyy-MM-dd');
				this.updateDisplayDate();
				await this.loadData();
			},
			// 后一天
			async nextDay() {
				let currentDate = new Date(this.reqdata.clockintime);
				let nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
				this.reqdata.clockintime = vk.pubfn.timeFormat(nextDate, 'yyyy-MM-dd');
				this.updateDisplayDate();
				await this.loadData();
			},
			// 获取今日记录
			async todayDatas() {
				this.reqdata.clockintime = vk.pubfn.timeFormat(new Date(), 'yyyy-MM-dd');
				this.updateDisplayDate();
				await this.loadData();
			},
			// 加载数据
			async loadData() {
				if (!this.reqdata.clockintime) {
					this.reqdata.clockintime = vk.pubfn.timeFormat(new Date(), 'yyyy-MM-dd');
				}
				this.updateDisplayDate();

				let {
					todayStart,
					todayEnd
				} = vk.pubfn.getCommonTime(new Date(this.reqdata.clockintime));
				this.reqdata.todayStart = todayStart;
				this.reqdata.todayEnd = todayEnd;

				let res = await vk.callFunction({
					url: 'admin/hrm/clockin/sys/getList',
					title: '加载中...',
					data: this.reqdata
				});

				if (res.code === 0) {
					this.empty = res.total > 0 ? false : true;
					this.clocks = res.rows;
					this.is_submit = 0;
					this.clocks.forEach((el) => {
						if (el.img) {
							el.img = {
								url: el.img
							};
						}
					});
					return;
				}
				vk.alert(res.msg);
			},
			// 跳转打卡页
			toClockin() {
				uni.navigateTo({
					url: "/pages/clockin/clockin",
				});
			},
			// 跳转设置页
			toSetting() {
				uni.navigateTo({
					url: "/pages/clockin/setting",
				});
			},
			// 获取打卡类型样式类
			getTypeClass(type) {
				const typeMap = {
					'上班': 'type-work',
					'下班': 'type-offwork',
					'加班': 'type-overtime',
					'外出': 'type-outside'
				};
				return typeMap[type] || 'type-default';
			},
			// 下拉刷新：重新加载当前日期
			async onRefresherRefresh() {
				if (this.refreshing) return;
				this.refreshing = true;
				try {
					await this.loadData();
				} finally {
					this.refreshing = false;
				}
			},
			// 上拉加载更多：切换到前一天（相当于加载更早的记录）
			async onScrollToLower() {
				if (this.loadingMore) return;
				this.loadingMore = true;
				try {
					await this.prevDay();
				} finally {
					this.loadingMore = false;
				}
			}
		}
	}
</script>

<style lang="scss">
	// 全局主题变量
	$theme-color: #2d8cff;
	$theme-gradient: linear-gradient(135deg, #2d8cff 0%, #5ba3ff 100%);
	$text-primary: #1f2f3a;
	$text-secondary: #6c7a8a;
	$text-weak: #99a9bf;
	$border-color: #eef2f6;
	$bg-gray: #f8f9fc;
	$card-shadow: 0 4rpx 20rpx 0 rgba(0, 0, 0, 0.04), 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.02);

	page,
	.container {
		min-height: 100%;
		background: $bg-gray;
	}

	.container {
		position: relative;
		display: flex;
		flex-direction: column;
	}

	// 顶部日期导航栏
	.date-navbar {
		background: #ffffff;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid $border-color;
		box-shadow: 0 2rpx 8rpx 0 rgba(0, 0, 0, 0.02);

		&__inner {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		&__arrow {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 30rpx;
			background: $bg-gray;
			transition: all 0.2s;

			&:active {
				background: #e8edf2;
			}
		}

		&__date {
			flex: 1;
			display: flex;
			align-items: baseline;
			justify-content: center;
			gap: 12rpx;
			padding: 16rpx 0;
			background: $bg-gray;
			border-radius: 60rpx;
			margin: 0 20rpx;
			transition: all 0.2s;

			&:active {
				background: #e8edf2;
			}
		}

		&__date-text {
			font-size: 32rpx;
			font-weight: 600;
			color: $text-primary;
		}

		&__weekday {
			font-size: 26rpx;
			color: $text-secondary;
		}

		&__calendar-icon {
			margin-left: 8rpx;
		}
	}

	// 统计卡片
	.stats-card {
		padding: 20rpx 30rpx 0;

		&__inner {
			background: linear-gradient(135deg, rgba(45, 140, 255, 0.08) 0%, rgba(45, 140, 255, 0.02) 100%);
			border-radius: 20rpx;
			padding: 24rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			border: 1rpx solid rgba(45, 140, 255, 0.15);
		}

		&__text {
			font-size: 28rpx;
			color: $text-secondary;
		}

		&__count {
			font-size: 40rpx;
			font-weight: 700;
			color: $theme-color;
			margin: 0 6rpx;
		}
	}

	// 滚动区域
	.list-scroll {
		flex: 1;
	}

	.list-container {
		padding: 20rpx 30rpx 0;
	}

	// 打卡卡片
	.clock-card {
		background: #ffffff;
		border-radius: 24rpx;
		margin-bottom: 24rpx;
		padding: 28rpx;
		box-shadow: $card-shadow;
		transition: transform 0.2s;

		&:active {
			transform: scale(0.99);
		}

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 20rpx;
			padding-bottom: 16rpx;
			border-bottom: 1rpx solid $border-color;
		}

		&__time-badge {
			display: flex;
			align-items: center;
			gap: 8rpx;
			background: #f0f7ff;
			padding: 8rpx 20rpx;
			border-radius: 30rpx;
		}

		&__time {
			font-size: 28rpx;
			font-weight: 600;
			color: $theme-color;
		}

		&__type {
			font-size: 24rpx;
			padding: 6rpx 20rpx;
			border-radius: 30rpx;
			font-weight: 500;

			&.type-work {
				background: #e8f5e9;
				color: #4caf50;
			}

			&.type-offwork {
				background: #fff3e0;
				color: #ff9800;
			}

			&.type-overtime {
				background: #fce4ec;
				color: #f44336;
			}

			&.type-outside {
				background: #e3f2fd;
				color: #2196f3;
			}

			&.type-default {
				background: #f5f5f5;
				color: #9e9e9e;
			}
		}

		&__content {
			display: flex;
			gap: 24rpx;
		}

		&__image {
			flex-shrink: 0;

			::v-deep .uni-file-picker {
				.uni-file-picker__container {
					width: 140rpx !important;
					height: 140rpx !important;
				}

				.uni-file-picker__files {
					width: 140rpx !important;
					height: 140rpx !important;
				}

				.uni-file-picker__files-list {
					width: 140rpx !important;
					height: 140rpx !important;
				}
			}
		}

		&__info {
			flex: 1;

			&.full-width {
				width: 100%;
			}
		}
	}

	.info-row {
		display: flex;
		align-items: flex-start;
		margin-bottom: 16rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.info-label {
		display: flex;
		align-items: center;
		gap: 8rpx;
		min-width: 100rpx;
		font-size: 26rpx;
		color: $text-weak;

		text {
			font-size: 26rpx;
		}
	}

	.info-value {
		flex: 1;
		font-size: 28rpx;
		color: $text-primary;
		line-height: 1.5;

		&.remark-text {
			color: $text-secondary;
		}
	}

	// 空状态样式
	.empty-wrapper {
		padding: 120rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.empty-tip {
		margin-top: 40rpx;

		&__text {
			font-size: 26rpx;
			color: $text-weak;
		}
	}

	// 底部操作区
	.oper-area {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.96);
		backdrop-filter: blur(20rpx);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 30rpx;
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid $border-color;
		box-shadow: 0 -4rpx 20rpx 0 rgba(0, 0, 0, 0.04);
		z-index: 10;

		&__left {
			display: flex;
			gap: 20rpx;
		}

		&__right {
			flex-shrink: 0;
		}
	}

	.oper-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
		padding: 8rpx 24rpx;
		border-radius: 40rpx;
		transition: all 0.2s;

		&:active {
			background: $bg-gray;
		}

		&__text {
			font-size: 22rpx;
			color: $text-secondary;
		}
	}

	.clockin-btn {
		background: $theme-gradient;
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 16rpx 36rpx;
		border-radius: 60rpx;
		box-shadow: 0 8rpx 20rpx 0 rgba(45, 140, 255, 0.25);
		transition: all 0.2s;

		&:active {
			transform: scale(0.96);
			box-shadow: 0 4rpx 12rpx 0 rgba(45, 140, 255, 0.3);
		}

		&__text {
			font-size: 30rpx;
			font-weight: 600;
			color: #ffffff;
			letter-spacing: 2rpx;
		}
	}
</style>