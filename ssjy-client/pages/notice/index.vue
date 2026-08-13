<template>
	<view class="container">
		<!-- 搜索和筛选区域 -->
		<view class="filter-section">
			<!-- 搜索框 -->
			<view class="search-box">
				<u-search placeholder="搜索通知标题或内容" v-model="searchKeyword" shape="round" :showAction="false" height="70"
					bgColor="#f5f5f5" @search="handleSearch" @clear="handleClearSearch"></u-search>
			</view>

			<!-- 筛选标签和操作按钮 -->
			<view class="filter-row">
				<view class="filter-tags-container">
					<view class="filter-tags">
						<u-tag v-for="tag in filterTags" :key="tag.value" :text="tag.label"
							:type="activeFilter === tag.value ? 'primary' : 'info'" size="default"
							:plain="activeFilter !== tag.value" @click="changeFilter(tag.value)" class="filter-tag"></u-tag>
					</view>
				</view>
				
				<view class="action-buttons">
					<u-button 
						type="primary" 
						size="mini" 
						shape="circle" 
						:disabled="unreadCount === 0" 
						@click="markAllAsRead"
						class="mark-all-btn"
					>
						<u-icon name="checkmark-circle" size="16" color="#ffffff"></u-icon>
						<text class="btn-text">全部标记已读</text>
					</u-button>
				</view>
			</view>
		</view>

		<!-- 通知列表 -->
		<scroll-view class="notice-list" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing"
			@refresherrefresh="onRefresh" @scrolltolower="loadMore">
			<!-- 下拉刷新 -->
			<u-refresh slot="refresher" :refresher-triggered="refreshing" @refresh="onRefresh"></u-refresh>

			<!-- 空状态 -->
			<view v-if="loading && notices.length === 0" class="empty-state loading">
				<u-loading-icon size="36" text="加载中..."></u-loading-icon>
			</view>

			<view v-else-if="!loading && notices.length === 0" class="empty-state">
				<u-empty mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png" text="暂无通知">
					<template #bottom>
						<view v-if="activeFilter === 'unread'" class="empty-tips">
							<text>没有未读通知，去看看已读通知吧</text>
						</view>
					</template>
				</u-empty>
			</view>

			<!-- 通知列表 -->
			<view v-else class="notice-items">
				<view v-for="(item, index) in notices" :key="item._id || index" class="notice-item"
					:class="{ unread: item.status === 'unread' }" @click="viewNoticeDetail(item)">
					<!-- 左侧状态标识 -->
					<view class="notice-status">
						<view v-if="item.status === 'unread'" class="unread-dot"></view>
						<u-icon v-else name="checkmark-circle-fill" size="20" color="#19be6b"></u-icon>
					</view>

					<!-- 通知内容 -->
					<view class="notice-content">
						<view class="notice-header">
							<text class="notice-title">{{ item.title || '无标题' }}</text>
							<view class="notice-badges">
								<u-tag v-if="item.type" :text="getTypeText(item.type)" type="info" size="mini"
									shape="circle" :plain="true"></u-tag>
								<view v-if="item.priority === 'high'" class="priority-badge">
									<text>紧急</text>
								</view>
							</view>
						</view>

						<view class="notice-body">
							<text class="notice-text">{{ getShortContent(item.content) }}</text>
						</view>

						<view class="notice-footer">
							<view class="notice-time">
								<u-icon name="clock" size="12" color="#999"></u-icon>
								<text class="time-text">{{ formatTime(item.create_time) }}</text>
							</view>

							<view v-if="item.sender" class="notice-sender">
								<text class="sender-text">发送者: {{ item.sender }}</text>
							</view>
						</view>

						<!-- 操作按钮 -->
						<view v-if="item.status === 'unread'" class="notice-actions">
							<u-button type="primary" size="mini" shape="circle" plain @click.stop="markAsRead(item)"
								class="action-btn">
								标记已读
							</u-button>

							<u-button v-if="item.data && item.data.application_id" type="success" size="mini"
								shape="circle" plain @click.stop="handleApplication(item.data.application_id)"
								class="action-btn">
								处理申请
							</u-button>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view v-if="hasMore" class="load-more">
				<u-loadmore :status="loadmoreStatus" />
			</view>

			<view v-else-if="notices.length > 0" class="no-more">
				<text class="no-more-text">没有更多通知了</text>
			</view>
		</scroll-view>

		<!-- 底部导航栏 -->
		<view class="bottom-tabbar">
			<u-tabbar :list="tabbar" :before-switch="beforeTabSwitch" icon-size="50" border-top></u-tabbar>
		</view>	

		<!-- 加载动画 -->
		<u-loading-page :loading="pageLoading" bgColor="#f5f5f5"></u-loading-page>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pageTitle: '系统通知',
				pageLoading: false,
				loading: false,
				refreshing: false,

				// 搜索和筛选
				searchKeyword: '',
				activeFilter: 'unread',
				filterTags: [{
						label: '未读',
						value: 'unread'
					},
					{
						label: '已读',
						value: 'read'
					},
					{
						label: '全部',
						value: 'all'
					}
				],

				// 通知数据
				notices: [],
				unreadCount: 0,

				// 分页
				pagination: {
					pageIndex: 1,
					pageSize: 15,
					total: 0
				},
				hasMore: true,
				loadmoreStatus: 'loadmore',				

				// 错误信息
				errorMessage: '',
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
			};
		},

		onLoad(options) {
			// 从参数获取初始筛选状态
			if (options.filter) {
				this.activeFilter = options.filter;
			}

			// 设置页面标题
			if (this.activeFilter === 'unread') {
				this.pageTitle = '未读通知';
			} else if (this.activeFilter === 'read') {
				this.pageTitle = '已读通知';
			}

			this.initPage();
		},

		onShow() {
			// 页面显示时刷新数据
			this.refreshData();
		},

		onPullDownRefresh() {
			this.onRefresh();
		},

		methods: {
			// 初始化页面
			async initPage() {
				this.pageLoading = true;
				await this.loadUnreadCount();
				await this.loadNotices(true);
				this.pageLoading = false;
			},

			// 返回上一页
			goBack() {
				uni.navigateBack();
			},

			// 切换tab前的拦截
			beforeTabSwitch(index) {
				return true;
			},

			// 显示更多操作
			showMoreAction() {
				this.showActionSheet = true;
			},			

			// 跳转到设置
			goToSetting() {
				uni.navigateTo({
					url: '/pages/setting/index'
				});
			},

			// 显示关于信息
			showAbout() {
				uni.showModal({
					title: '关于',
					content: '通知中心 v1.0.0\n接收和管理系统通知消息',
					showCancel: false
				});
			},

			// 搜索
			handleSearch(value) {
				if (!value) {
					uni.showToast({
						title: '请输入搜索内容',
						icon: 'none'
					});
					return;
				}

				this.searchKeyword = value;
				this.refreshData();
			},

			// 清除搜索
			handleClearSearch() {
				this.searchKeyword = '';
				this.refreshData();
			},

			// 切换筛选
			changeFilter(filter) {
				if (this.activeFilter === filter) return;

				this.activeFilter = filter;
				this.pageTitle = this.getPageTitleByFilter(filter);
				this.refreshData();
			},

			// 根据筛选状态获取页面标题
			getPageTitleByFilter(filter) {
				const map = {
					'unread': '未读通知',
					'read': '已读通知',
					'all': '全部通知'
				};
				return map[filter] || '系统通知';
			},

			// 获取类型文本
			getTypeText(type) {
				const map = {
					'system': '系统',
					'approval': '审批',
					'remind': '提醒',
					'announce': '公告'
				};
				return map[type] || type;
			},

			// 获取短内容
			getShortContent(content) {
				if (!content) return '无内容';
				if (content.length > 60) {
					return content.substring(0, 60) + '...';
				}
				return content;
			},

			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '未知时间';

				try {
					const date = new Date(timestamp);
					const now = new Date();
					const diff = now - date;
					const dayDiff = Math.floor(diff / (24 * 60 * 60 * 1000));

					if (dayDiff === 0) {
						// 今天
						return date.getHours().toString().padStart(2, '0') + ':' +
							date.getMinutes().toString().padStart(2, '0');
					} else if (dayDiff === 1) {
						// 昨天
						return '昨天';
					} else if (dayDiff < 7) {
						// 一周内
						return dayDiff + '天前';
					} else {
						// 更早
						return date.getFullYear() + '-' +
							(date.getMonth() + 1).toString().padStart(2, '0') + '-' +
							date.getDate().toString().padStart(2, '0');
					}
				} catch (error) {
					return '时间错误';
				}
			},

			// 构建请求参数
			buildRequestParams(isRefresh = false) {
				const params = {
					pageIndex: isRefresh ? 1 : this.pagination.pageIndex,
					pageSize: this.pagination.pageSize,
					userInfo: this.vk.getVuex('$user.userInfo')
				};

				// 筛选状态
				if (this.activeFilter !== 'all') {
					params.status = this.activeFilter;
				}

				// 搜索关键词
				if (this.searchKeyword) {
					params.title = this.searchKeyword;
					params.content = this.searchKeyword;
				}

				return params;
			},

			// 加载通知列表
			async loadNotices(isRefresh = false) {
				if (this.loading && !isRefresh) return;

				this.loading = true;
				this.loadmoreStatus = 'loading';

				try {
					const params = this.buildRequestParams(isRefresh);

					const res = await this.vk.callFunction({
						url: 'admin/bpmn/notification/pub/getList',
						title: '加载中...',
						data: params
					});

					if (res.code === 0) {
						const data = res.data || {};
						const newNotices = data.rows || [];
						const total = data.total || 0;

						if (isRefresh) {
							this.notices = newNotices;
							this.pagination.pageIndex = 1;
						} else {
							this.notices = [...this.notices, ...newNotices];
						}

						this.pagination.total = total;
						this.hasMore = this.notices.length < total;

						// 更新加载状态
						this.loadmoreStatus = this.hasMore ? 'loadmore' : 'nomore';

						// 更新未读数量
						await this.loadUnreadCount();
					} else {
						uni.showToast({
							title: res.msg || '加载失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('加载通知失败:', error);
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'none'
					});
				} finally {
					this.loading = false;
					this.refreshing = false;
					uni.stopPullDownRefresh();
				}
			},

			// 加载未读数量
			async loadUnreadCount() {
				try {
					const res = await this.vk.callFunction({
						url: 'admin/bpmn/notification/pub/getUnreadCount',
						data: {
							userInfo: this.vk.getVuex('$user.userInfo')
						}
					});

					if (res.code === 0) {
						this.unreadCount = res.data.count || 0;
					}
				} catch (error) {
					console.error('加载未读数量失败:', error);
				}
			},

			// 查看通知详情
			viewNoticeDetail(item) {
				// 如果是未读，先标记为已读
				if (item.status === 'unread') {
					this.markAsRead(item);
				}

				// 如果是审批通知，跳转到申请详情
				if (item.data && item.data.application_id) {
					this.handleApplication(item.data.application_id);
					return;
				}

				// 普通通知显示详情弹窗
				uni.showModal({
					title: item.title || '通知详情',
					content: item.content || '无内容',
					showCancel: false,
					confirmText: '知道了'
				});
			},

			// 标记为已读
			async markAsRead(item) {
				if (item.status === 'read') return;

				try {
					const res = await this.vk.callFunction({
						url: 'admin/bpmn/notification/pub/markAsRead',
						title: '处理中...',
						data: {
							notification_id: item._id,
							userInfo: this.vk.getVuex('$user.userInfo')
						}
					});

					if (res.code === 0) {
						// 更新本地数据
						item.status = 'read';
						this.unreadCount = Math.max(0, this.unreadCount - 1);

						uni.showToast({
							title: '已标记为已读',
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('标记为已读失败:', error);
					uni.showToast({
						title: '操作失败',
						icon: 'none'
					});
				}
			},

			// 全部标记为已读
			async markAllAsRead() {
				if (this.unreadCount === 0) {
					uni.showToast({
						title: '暂无未读通知',
						icon: 'none'
					});
					return;
				}

				uni.showModal({
					title: '提示',
					content: `确定要将所有未读通知标记为已读吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await this.vk.callFunction({
									url: 'admin/bpmn/notification/pub/markAllAsRead',
									title: '处理中...',
									data: {
										userInfo: this.vk.getVuex('$user.userInfo')
									}
								});

								if (result.code === 0) {
									// 更新本地数据
									this.notices.forEach(item => {
										if (item.status === 'unread') {
											item.status = 'read';
										}
									});
									this.unreadCount = 0;

									uni.showToast({
										title: '全部标记为已读成功',
										icon: 'success'
									});
								} else {
									uni.showToast({
										title: result.msg || '操作失败',
										icon: 'none'
									});
								}
							} catch (error) {
								console.error('全部标记为已读失败:', error);
								uni.showToast({
									title: '操作失败',
									icon: 'none'
								});
							}
						}
					}
				});
			},

			// 处理申请
			handleApplication(applicationId) {
				uni.navigateTo({
					url: `/pages/bpmn/application-form/list`
				});
			},

			// 刷新数据
			refreshData() {
				this.refreshing = true;
				this.loadNotices(true);
			},

			// 下拉刷新
			onRefresh() {
				this.refreshData();
			},

			// 加载更多
			loadMore() {
				if (this.loading || !this.hasMore) return;

				this.pagination.pageIndex++;
				this.loadNotices();
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx;
		box-sizing: border-box;
	}

	.filter-section {
		background-color: #ffffff;
		padding: 30rpx;
		
		.search-box {
			margin-bottom: 30rpx;
		}
		
		.filter-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-wrap: nowrap; /* 确保不换行 */
			white-space: nowrap;
			width: 100%;
			
			.filter-tags-container {
				flex: 1;
				overflow: hidden; /* 隐藏溢出内容 */
				min-width: 0; /* 允许flex容器收缩 */
			}
			
			.filter-tags {
				display: flex;
				flex-wrap: nowrap; /* 确保标签不换行 */
				white-space: nowrap;
				overflow-x: auto; /* 如果需要可以横向滚动 */
				padding-bottom: 4rpx; /* 为滚动条留空间 */
				
				/* 隐藏滚动条，但保留滚动功能 */
				&::-webkit-scrollbar {
					display: none;
				}
				
				.filter-tag {
					flex-shrink: 0; /* 防止标签被压缩 */
					margin-right: 20rpx;
					
					&:last-child {
						margin-right: 0;
					}
					
					::v-deep .u-tag {
						padding: 12rpx 30rpx;
						border-radius: 30rpx;
						white-space: nowrap;
					}
				}
			}
			
			.action-buttons {
				flex-shrink: 0; /* 防止按钮被压缩 */
				margin-left: 20rpx;
				min-width: 140rpx; /* 给按钮一个最小宽度 */
				
				.mark-all-btn {
					::v-deep .u-button {
						height: 60rpx;
						font-size: 24rpx;
						padding: 0 20rpx;
						white-space: nowrap;
						
						&[disabled] {
							background-color: #c8c9cc !important;
							color: #ffffff !important;
							border-color: #c8c9cc !important;
							opacity: 0.6;
						}
					}
					
					.btn-text {
						margin-left: 8rpx;
					}
				}
			}
		}
	}

	.notice-list {
		height: calc(100vh - 240rpx);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 400rpx;

		&.loading {
			height: 600rpx;
		}

		.empty-tips {
			margin-top: 30rpx;
			font-size: 26rpx;
			color: #999999;
			text-align: center;
		}
	}

	.notice-items {
		padding: 30rpx;
	}

	.notice-item {
		display: flex;
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

		&:active {
			background-color: #f9f9f9;
		}

		&.unread {
			border-left: 8rpx solid #2979ff;
			background-color: #f0f8ff;

			&:active {
				background-color: #e8f2ff;
			}
		}

		.notice-status {
			margin-right: 20rpx;

			.unread-dot {
				width: 20rpx;
				height: 20rpx;
				border-radius: 50%;
				background-color: #2979ff;
			}
		}

		.notice-content {
			flex: 1;

			.notice-header {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 20rpx;

				.notice-title {
					flex: 1;
					font-size: 32rpx;
					font-weight: bold;
					color: #333333;
					line-height: 1.4;
					margin-right: 20rpx;
				}

				.notice-badges {
					display: flex;
					flex-wrap: wrap;
					gap: 10rpx;

					.priority-badge {
						background-color: #f56c6c;
						color: #ffffff;
						font-size: 22rpx;
						padding: 4rpx 12rpx;
						border-radius: 12rpx;
					}
				}
			}

			.notice-body {
				margin-bottom: 20rpx;

				.notice-text {
					font-size: 28rpx;
					color: #666666;
					line-height: 1.5;
				}
			}

			.notice-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				.notice-time {
					display: flex;
					align-items: center;

					.time-text {
						margin-left: 8rpx;
						font-size: 24rpx;
						color: #999999;
					}
				}

				.notice-sender {
					.sender-text {
						font-size: 24rpx;
						color: #999999;
					}
				}
			}

			.notice-actions {
				display: flex;
				gap: 20rpx;

				.action-btn {
					::v-deep .u-button {
						padding: 0 24rpx;
						height: 50rpx;
						line-height: 50rpx;
					}
				}
			}
		}
	}

	.load-more,
	.no-more {
		padding: 30rpx 0;
		text-align: center;

		.no-more-text {
			font-size: 26rpx;
			color: #999999;
		}
	}

	.bottom-tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 999;
	}

	// 响应式调整 - 确保在小屏幕上也保持一行布局
	@media (max-width: 750px) {
		.filter-section {
			padding: 20rpx;
			
			.filter-row {
				/* 在小屏幕上，如果空间不足，筛选标签可以横向滚动 */
				.filter-tags {
					overflow-x: auto;
					
					.filter-tag {
						margin-right: 15rpx;
					}
				}
				
				.action-buttons {
					margin-left: 15rpx;
					min-width: 130rpx;
					
					.mark-all-btn {
						::v-deep .u-button {
							padding: 0 15rpx;
							font-size: 22rpx;
						}
					}
				}
			}
		}

		.notice-items {
			padding: 20rpx;
		}

		.notice-item {
			padding: 20rpx;

			.notice-content {
				.notice-header {
					flex-direction: column;
					align-items: flex-start;

					.notice-title {
						margin-right: 0;
						margin-bottom: 10rpx;
					}
				}

				.notice-footer {
					flex-direction: column;
					align-items: flex-start;
					gap: 10rpx;
				}
			}
		}
	}
</style>