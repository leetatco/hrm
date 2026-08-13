<!-- components/notificationList.vue -->
<template>
	<vk-data-dialog v-model="value.show" :title="'系统通知'" width="800px" top="15vh">
		<view class="notification-list">
			<!-- 表格搜索组件开始 -->
			<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns"
				@search="search"></vk-data-table-query>
			<!-- 表格搜索组件结束 -->

			<view class="notification-filter">
				<!-- 使用 el-radio-group 替代 vk-data-radio-group -->
				<el-radio-group v-model="filterStatus" @change="loadNotifications">
					<el-radio label="all">全部</el-radio>
					<el-radio label="unread">未读</el-radio>
					<el-radio label="read">已读</el-radio>
				</el-radio-group>

				<el-button type="button" @click="markAllAsRead" :disabled="unreadCount === 0">
					全部标记为已读
				</el-button>
			</view>

			<view class="notification-content">

				<view v-if="notifications.length === 0" class="empty">
					<el-empty description="暂无通知"></el-empty>
				</view>

				<view v-else class="notifications">
					<view v-for="item in notifications" :key="item._id" class="notification-item"
						:class="{ unread: item.status === 'unread' }" @click="readNotification(item)">
						<view class="notification-header">
							<view class="notification-title">
								<text class="title-text">{{ item.title || '无标题' }}</text>
								<view class="status-tags">
									<el-tag v-if="item.status === 'unread'" size="small" type="danger">未读</el-tag>
									<el-tag v-else size="small" type="success">已读</el-tag>									 
									<el-tag v-if="item.type" size="small" type="info">{{ getTypeText(item.type) }}</el-tag>
								</view>
							</view>
							<view class="notification-time">
								{{ formatTime(item.create_time) }}
							</view>
						</view>
						<view class="notification-body">
							<text class="content-text">{{ item.content || '无内容' }}</text>
						</view>
						<view class="notification-meta">
							<text class="meta-text">接收人: {{ getRecipientsText(item.recipients) }}</text>
							<text class="meta-text">ID: {{ item._id }}</text>
						</view>
						<view v-if="item.data && item.data.application_id && item.status === 'unread'"
							class="notification-actions">
							<el-button type="text" size="small" @click.stop="viewApplication(item)">
								处理申请表单
							</el-button>
						</view>
					</view>
				</view>
			</view>

			<!-- 分页 -->
			<view class="notification-pagination" v-if="total > 0 && total > pagination.pageSize">
				<el-pagination :current-page="pagination.pageIndex" :page-size="pagination.pageSize" :total="total"
					:layout="paginationLayout" @current-change="onPageChange"></el-pagination>
			</view>
		</view>

		<template #footer>
			<el-button @click="close">关闭</el-button>
		</template>
	</vk-data-dialog>
</template>

<script>
	export default {
		props: {
			value: {
				type: Object,
				default: () => ({})
			}
		},
		data() {
			return {
				loading: false,
				notifications: [],
				filterStatus: 'unread',
				pagination: {
					pageIndex: 1,
					pageSize: 10
				},
				total: 0,
				unreadCount: 0,
				debugInfo: '',
				paginationLayout: 'prev, pager, next, jumper',

				// 搜索表单相关
				queryForm1: {
					formData: {
						title: '',
						content: ''
					},
					columns: [{
							"key": "title",
							"title": "通知标题",
							"type": "text",
							"width": 150,
							"mode": "%%"
						},
						{
							"key": "content",
							"title": "通知内容",
							"type": "text",
							"width": 150,
							"mode": "%%"
						}
					]
				}
			};
		},
		watch: {
			'value.show': {
				handler(newVal) {
					console.log('通知弹窗状态变化:', newVal);
					if (newVal) {
						this.resetSearchForm();
						this.loadNotifications();
						this.loadUnreadCount();
					} else {
						this.debugInfo = '';
					}
				},
				immediate: true
			}
		},
		mounted() {
			this.adjustPaginationLayout();
			window.addEventListener('resize', this.adjustPaginationLayout);
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.adjustPaginationLayout);
		},
		methods: {
			// 调整分页布局
			adjustPaginationLayout() {
				const width = window.innerWidth;
				if (width < 768) {
					this.paginationLayout = 'prev, pager, next';
				} else if (width < 1024) {
					this.paginationLayout = 'prev, pager, next, jumper';
				} else {
					this.paginationLayout = 'total, prev, pager, next, jumper';
				}
			},

			// 搜索功能
			search() {
				this.pagination.pageIndex = 1;
				this.loadNotifications();
			},

			// 重置搜索表单
			resetSearchForm() {
				this.queryForm1.formData = {
					_id: '',
					type: '',
					title: '',
					content: '',
					recipients: ''
				};
			},

			// 构建搜索参数
			buildSearchParams() {
				const params = {
					pageIndex: this.pagination.pageIndex,
					pageSize: this.pagination.pageSize,
					userInfo: this.vk.getVuex('$user.userInfo')
				};

				// 添加状态过滤
				if (this.filterStatus !== 'all') {
					params.status = this.filterStatus;
				}

				// 添加搜索条件
				Object.keys(this.queryForm1.formData).forEach(key => {
					const value = this.queryForm1.formData[key];
					if (value !== null && value !== undefined && value !== '') {
						params[key] = value;
					}
				});

				return params;
			},

			onPageChange(page) {
				console.log('分页变化:', page);
				this.pagination.pageIndex = page;
				this.loadNotifications();
			},

			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '未知时间';
				try {
					return this.$formatTime ? this.$formatTime(timestamp) : new Date(timestamp).toLocaleString();
				} catch (error) {
					return '时间格式错误';
				}
			},

			// 加载通知列表
			async loadNotifications() {
				console.log('开始加载通知列表');
				this.loading = true;
				this.debugInfo = '正在加载通知列表...';

				try {
					const searchParams = this.buildSearchParams();
					console.log('搜索参数:', searchParams);

					const res = await this.vk.callFunction({
						url: 'admin/bpmn/notification/pub/getList',
						title: '加载中...',
						data: searchParams
					});

					console.log('通知列表API响应:', res);

					if (res.code === 0) {
						this.notifications = res.data.rows || [];
						this.total = res.data.total || 0;
						this.debugInfo = `加载成功: 共 ${this.total} 条通知，当前显示 ${this.notifications.length} 条`;
					} else {
						this.debugInfo = `加载失败: ${res.msg}`;
						this.$message.error(res.msg);
					}

				} catch (error) {
					console.error('加载通知列表失败:', error);
					this.debugInfo = `请求异常: ${error.message}`;
					this.$message.error('加载通知列表失败');
				} finally {
					this.loading = false;
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

					console.log('未读数量API响应:', res);

					if (res.code === 0) {
						this.unreadCount = res.data.count || 0;
						// 通知父组件更新数量
						this.$emit('update-count');
					}
				} catch (error) {
					console.error('加载未读数量失败:', error);
				}
			},

			// 标记通知为已读
			async readNotification(item) {
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

					console.log('标记已读API响应:', res);

					if (res.code === 0) {
						// 更新本地数据
						item.status = 'read';
						item.read_time = Date.now();
						this.unreadCount = Math.max(0, this.unreadCount - 1);
						this.$emit('update-count');
						this.debugInfo = '标记为已读成功';

						this.close();
						uni.navigateTo({
							url: `/pages/bpmn/application-form/list`
						})
					} else {
						this.$message.error(res.msg);
					}
				} catch (error) {
					console.error('标记通知为已读失败:', error);
					this.$message.error('标记失败');
				}
			},

			// 全部标记为已读
			async markAllAsRead() {
				try {
					const res = await this.vk.callFunction({
						url: 'admin/bpmn/notification/pub/markAllAsRead',
						title: '处理中...',
						data: {
							userInfo: this.vk.getVuex('$user.userInfo')
						}
					});

					console.log('全部标记已读API响应:', res);

					if (res.code === 0) {
						// 更新本地数据
						this.notifications.forEach(item => {
							if (item.status === 'unread') {
								item.status = 'read';
								item.read_time = Date.now();
							}
						});
						this.unreadCount = 0;
						this.$emit('update-count');
						this.$message.success(res.msg);
						this.debugInfo = '全部标记为已读成功';
					} else {
						this.$message.error(res.msg);
					}
				} catch (error) {
					console.error('全部标记为已读失败:', error);
					this.$message.error('操作失败');
				}
			},

			//显示中文标签
			getTypeText(type) {
				const map = {
					// 系统类
					'system': '', // 不显示标签
					'announce': '公告',
					'remind': '提醒',

					// 流程任务类
					'task_assigned': '新任务',
					'task_resubmitted': '新重新提交任务',
					'process_end': '流程结束',

					// 操作类
					'approve': '同意',
					'reject': '驳回',
					'return': '退回',
					'transfer': '转办',
					'add_sign': '加签',
					'add_sign_complete': '加签完成',
					'confirm': '确认',
					'resubmit': '重新提交',
					'withdraw': '撤回',
					'create': '创建',
					'complete': '完成'
				};
				return map[type] !== undefined ? map[type] : type;
			},

			// 获取接收人显示文本
			getRecipientsText(recipients) {
				if (!recipients || !Array.isArray(recipients) || recipients.length === 0) return '无';
				if (recipients.length === 1) return '仅我';
				if (recipients.length === 2) return '我和1人';
				return `我和${recipients.length - 1}人`;
			},

			// 查看申请
			async viewApplication(item) {
				await this.readNotification(item);
				this.close();
				uni.navigateTo({
					url: `/pages/bpmn/application-form/list`
				})
			},

			// 关闭弹窗
			close() {
				console.log('关闭通知弹窗');
				this.$emit('input', {
					...this.value,
					show: false
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.notification-list {
		min-height: 400px;

		.debug-info {
			padding: 8px 12px;
			background-color: #fff2e8;
			border: 1px solid #ffbb96;
			border-radius: 4px;
			margin-bottom: 16px;
			font-size: 12px;
			color: #fa541c;
		}

		.notification-filter {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;
			padding: 10px 0;
			border-bottom: 1px solid #ebeef5;

			.filter-actions {
				display: flex;
				gap: 10px;
			}
		}

		.notification-content {
			min-height: 300px;

			.loading,
			.empty {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				height: 200px;
				gap: 16px;
			}

			.empty-tips {
				margin-top: 10px;
				color: #909399;
				font-size: 14px;
			}

			.notifications {
				.notification-item {
					padding: 16px;
					border: 1px solid #ebeef5;
					border-radius: 4px;
					margin-bottom: 12px;
					cursor: pointer;
					transition: all 0.3s;

					&:hover {
						background-color: #f5f7fa;
						box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
					}

					&.unread {
						border-left: 4px solid #409eff;
						background-color: #f0f8ff;
					}

					.notification-header {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						margin-bottom: 12px;

						.notification-title {
							display: flex;
							align-items: flex-start;
							gap: 8px;
							flex: 1;
							flex-wrap: wrap;

							.title-text {
								font-weight: 600;
								font-size: 14px;
								color: #303133;
								line-height: 1.4;
							}

							.status-tags {
								display: flex;
								gap: 4px;
								flex-wrap: wrap;
							}
						}

						.notification-time {
							font-size: 12px;
							color: #909399;
							white-space: nowrap;
							margin-left: 8px;
						}
					}

					.notification-body {
						margin-bottom: 12px;

						.content-text {
							font-size: 13px;
							color: #606266;
							line-height: 1.5;
						}
					}

					.notification-meta {
						display: flex;
						justify-content: space-between;
						margin-bottom: 12px;

						.meta-text {
							font-size: 12px;
							color: #909399;
						}
					}

					.notification-actions {
						text-align: right;
					}
				}
			}
		}

		.notification-pagination {
			margin-top: 20px;
			text-align: center;

			::v-deep .el-pagination {
				justify-content: center;
			}
		}
	}
</style>