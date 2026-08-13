<template>
	<view class="page-body">
		<!-- 筛选区域 -->
		<view class="filter-section">
			<view class="filter-row">
				<view class="filter-item">
					<u-dropdown ref="typeFilter" active-color="#2979ff">
						<u-dropdown-item :title="getFormTypeTitle()" @change="handleFormTypeChange"
							v-model="queryForm.formData.form_type_code" :options="formTypeOptions"></u-dropdown-item>
					</u-dropdown>
				</view>
				<view class="refresh-btn-wrapper">
					<u-button type="primary" shape="circle" size="medium" :plain="false"
						:custom-style="buttonStyle.primary" @click="refresh" :loading="loading">
						<u-icon name="reload" size="20" color="#fff"></u-icon>
						<text class="btn-text">刷新</text>
					</u-button>
				</view>
			</view>
		</view>

		<!-- 统计卡片 -->
		<view class="stats-cards" v-if="!loading">
			<!-- <view class="stat-card total" @click="filterByStatus('')">
				<text class="stat-number">{{ stats.total }}</text>
				<text class="stat-label">我的申请</text>
			</view> -->
			<view class="stat-card pending" @click="filterByStatus('pending')">
				<text class="stat-number">{{ stats.pending }}</text>
				<text class="stat-label">待处理</text>
			</view>
			<view class="stat-card completed" @click="filterByStatus('completed')">
				<text class="stat-number">{{ stats.completed }}</text>
				<text class="stat-label">已处理</text>
			</view>
		</view>

		<!-- 加载状态 - 骨架屏 -->
		<view class="skeleton-section" v-if="loading">
			<view class="skeleton-item" v-for="i in 3" :key="i">
				<view class="skeleton-header">
					<view class="skeleton-title"></view>
					<view class="skeleton-tag"></view>
				</view>
				<view class="skeleton-line"></view>
				<view class="skeleton-line"></view>
				<view class="skeleton-line short"></view>
			</view>
		</view>

		<!-- 列表数据 -->
		<view class="list-section" v-else>
			<scroll-view scroll-y class="list-scroll" :refresher-enabled="true" :refresher-triggered="refreshing"
				@refresherrefresh="onPullDownRefresh" @scrolltolower="loadMore">
				<view class="list-container">
					<view class="list-item" v-for="(item, index) in tableData" :key="index">
						<view class="item-header">
							<view class="header-left">
								<!-- <u-checkbox v-model="item._checked" @change="(e) => onItemCheck(e, item)"></u-checkbox> -->
								<view class="title-wrapper">
									<u-icon name="file-text-fill" size="32" color="#2979ff"></u-icon>
									<text class="item-title">{{ item.task_name || '未命名任务' }}</text>
								</view>
							</view>
							<u-tag :type="getTaskTypeTag(item.node_type)" size="mini" :border="false"
								class="status-tag">
								{{ getTaskTypeText(item.node_type) }}
							</u-tag>
						</view>

						<view class="item-content">
							<view class="info-grid">
								<view class="info-item">
									<text class="info-label">申请标题</text>
									<text class="info-value">{{ item.application_title || '-' }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">申请类型</text>
									<text class="info-value">{{ getFormTypeName(item.form_type_code) }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">申请人</text>
									<text class="info-value">{{ item.applicant_name || '-' }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">申请部门</text>
									<text class="info-value">{{ item.applicant_department || '-' }}</text>
								</view>
							</view>
							<view class="item-footer">
								<view class="time-info">
									<u-icon name="clock" size="24" color="#c0c4cc"></u-icon>
									<text>{{ formatDate(item._add_time) }}</text>
								</view>
								<view class="due-info" v-if="item.due_date">
									<u-icon name="warning" size="24" :color="getDueDateColor(item.due_date)"></u-icon>
									<text :style="{ color: getDueDateColor(item.due_date) }">
										{{ formatDueDate(item.due_date) }}
									</text>
								</view>
							</view>
						</view>

						<view class="item-actions">
							<u-button type="info" size="medium" :plain="true" :custom-style="buttonStyle.infoPlain"
								@click.stop="showDetail(item)">
								详情
							</u-button>
							<u-button v-if="canHandleTask(item) && item.node_type !== 'return' && item.status ==
									'pending'" type="primary" size="medium" :plain="true" :custom-style="buttonStyle.plain"
								@click.stop="showApproveDialog(item)">
								处理
							</u-button>
							<u-button v-if="item.node_type === 'return' && canHandleReturnTask(item) && item.status ==
									'pending'" type="warning" size="medium" :plain="true" :custom-style="buttonStyle.warningPlain"
								@click.stop="handleReturnTask(item)">
								处理退回
							</u-button>
							<!-- <u-button v-if="canTransferTask(item) && item.node_type !== 'return'" type="warning"
								size="medium" :plain="true" :custom-style="buttonStyle.warningPlain"
								@click.stop="handleTransfer(item)">
								转办
							</u-button> -->
						</view>
					</view>

					<!-- 空状态 -->
					<view class="empty-wrapper" v-if="!loading && tableData.length === 0">
						<u-empty mode="data" icon="/static/empty.png" text="暂无待办任务">
							<u-button type="primary" shape="circle" :custom-style="buttonStyle.primary"
								@click="refresh">
								立即刷新
							</u-button>
						</u-empty>
					</view>

					<!-- 加载更多 -->
					<view class="load-more" v-if="hasMore && tableData.length > 0">
						<u-loadmore :status="loadMoreStatus" :load-text="loadText" />
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 审批处理弹窗（修正：移除外层按钮） -->
		<u-popup v-model="approveDialog.show" :mode="popupStyle.mode" :closeable="true"
			:border-radius="popupStyle.border_radius" :height="popupStyle.height">
			<view class="approve-dialog">
				<view class="dialog-header">
					<text class="dialog-title">{{ approveDialog.title }}</text>
				</view>
				<view class="dialog-content">
					<approve-handle-dialog :task="currentTask" :application="currentApplication"
						:form-schema="getFormTypeSchema(currentApplication ? currentApplication.form_type_code : '')"
						:process-info="approveDialog.processFlow" :approval-history="approveDialog.approvalHistory"
						:form-type-configs="formTypeConfigs" :show-return-option="showReturnOption"
						:user-list="userList" :show-transfer-option="showTransferOption"
						:show-add-sign-option="showAddSignOption" :loading="approveLoading" @preview-file="previewFile"
						@download-file="downloadFile" @action-change="onActionChange" @submit="handleApproveSubmit" />
				</view>
				<!-- 移除外层按钮，避免重复 -->
			</view>
		</u-popup>

		<!-- 详情弹窗 -->
		<u-popup v-model="detailDialog.show" :mode="popupStyle.mode" :closeable="true" :height="popupStyle.height"
			:border-radius="popupStyle.border_radius">
			<view class="detail-dialog">
				<view class="detail-header">
					<text class="detail-title">{{ detailDialog.title }}</text>
				</view>
				<view class="detail-content">
					<approve-header-detail :detail-data="detailDialog.data"
						:form-schema="getFormTypeSchema(detailDialog.data ? detailDialog.data.form_type_code : '')"
						:process-info="detailDialog.processFlow" :status-history="detailDialog.approvalHistory"
						:current-tasks="detailDialog.currentTasks" :show-basic-info="true" :show-return-info="false"
						:show-approval-flow="true" :show-current-task="true" :show-handle-form="false"
						:form-type-configs="formTypeConfigs" @preview-file="previewFile"
						@download-file="downloadFile" />
				</view>				
			</view>
		</u-popup>

		<!-- 批量审批弹窗 -->
		<u-popup v-model="batchApproveDialog.show" :mode="popupStyle.mode" :closeable="true"
			:border-radius="popupStyle.border_radius" :height="popupStyle.height">
			<view class="batch-dialog">
				<view class="dialog-header">
					<text class="dialog-title">批量审批</text>
				</view>
				<view class="dialog-content">
					<view class="batch-info">
						<u-alert type="info" :title="`已选择 ${batchApproveDialog.selectedItems.length} 个待办任务`" />
					</view>
					<u-form :model="batchApproveForm" ref="batchApproveFormRef" label-position="top">
						<u-form-item label="审批操作" prop="action" required>
							<u-radio-group v-model="batchApproveForm.action">
								<u-radio label="approve">批量同意</u-radio>
								<u-radio label="reject">批量驳回</u-radio>
							</u-radio-group>
						</u-form-item>
						<u-form-item label="审批意见" prop="comment" required>
							<u-textarea v-model="batchApproveForm.comment" placeholder="请输入统一的审批意见" :maxlength="200" />
						</u-form-item>
					</u-form>
				</view>
				<view class="dialog-footer">
					<u-button @click="batchApproveDialog.show = false">取消</u-button>
					<u-button type="primary" @click="handleBatchApprove" :loading="batchApproveLoading">确定</u-button>
				</view>
			</view>
		</u-popup>

		<!-- 退回处理弹窗 -->
		<u-popup v-model="returnDialog.show" :mode="popupStyle.mode" :closeable="true"
			:border-radius="popupStyle.border_radius" :height="popupStyle.height">
			<view class="detail-dialog">
				<view class="dialog-header">
					<text class="dialog-title">{{ returnDialog.title }}</text>
				</view>
				<view class="dialog-content">
					<return-handle-dialog :task="returnDialog.task" :application="returnDialog.application"
						:form-schema="getFormTypeSchema(returnDialog.application ? returnDialog.application.form_type_code : '')"
						:process-info="returnDialog.processFlow" :status-history="returnDialog.statusHistory"
						:form-type-configs="formTypeConfigs" :loading="returnLoading" @preview-file="previewFile"
						@download-file="downloadFile" @edit-application="editApplicationContent"
						@submit="handleReturnSubmit" />
				</view>
			</view>
		</u-popup>

		<!-- 撤回确认弹窗 -->
		<u-popup v-model="withdrawDialog.show" :mode="popupStyle.mode" :closeable="true"
			:border-radius="popupStyle.border_radius" :height="popupStyle.height">
			<view class="withdraw-dialog">
				<view class="dialog-header">
					<text class="dialog-title">撤回申请确认</text>
				</view>
				<view class="dialog-content">
					<u-alert type="warning" title="撤回申请后，将无法恢复，请谨慎操作！" :closable="false" />
					<u-form :model="withdrawForm" ref="withdrawFormRef" label-position="top">
						<u-form-item label="撤回原因" prop="reason" required>
							<u-input type="textarea" v-model="withdrawForm.reason" placeholder="请说明撤回申请的原因"
								:maxlength="500" />
						</u-form-item>
					</u-form>
				</view>
				<view class="dialog-footer">
					<u-button @click="withdrawDialog.show = false">取消</u-button>
					<u-button type="danger" @click="handleWithdrawConfirm" :loading="withdrawLoading">确认撤回</u-button>
				</view>
			</view>
		</u-popup>

		<!-- 动态表单弹窗 -->
		<u-popup v-model="dynamicFormDialog.show" :mode="popupStyle.mode" :closeable="true"
			:border-radius="popupStyle.border_radius" :height="popupStyle.height">
			<view>
				<dynamic-form-dialog v-model="dynamicFormDialog.show" :title="dynamicFormDialog.title"
					:butVisible="false" :form-schema="dynamicFormDialog.formSchema"
					:form-type-code="dynamicFormDialog.formTypeCode" :saveLoading="saveFormLoading"
					:initial-data="dynamicFormDialog.data" @save="handleDynamicFormSave"
					@cancel="handleDynamicFormCancel" @preview-file="previewFile" @download-file="downloadFile" />
			</view>
		</u-popup>

		<!-- 文件预览弹窗公共组件 -->
		<file-preview-dialog :value="filePreview.show" :file-data="filePreview.data"
			@filePreviewClose="filePreviewClose" @download-file="downloadFile" />
	</view>
</template>

<script>
	// 引入公共组件
	import ApproeWorkFlow from '@/components/approve-work-flow/approve-work-flow.vue';
	import DynamicFormDialog from '@/components/dynamic-form-dialog/dynamic-form-dialog.vue';
	import FilePreviewDialog from '@/components/file-preview-dialog/file-preview-dialog.vue';
	import ApproveHeaderDetail from '@/components/approve-header-detail/approve-header-detail.vue';
	import ReturnHandleDialog from '@/components/return-handle-dialog/return-handle-dialog.vue';
	import ApproveHandleDialog from '@/components/approve-handle-dialog/approve-handle-dialog.vue';

	let vk = uni.vk;

	export default {
		name: 'TaskCenter',
		components: {
			ApproeWorkFlow,
			DynamicFormDialog,
			FilePreviewDialog,
			ApproveHeaderDetail,
			ReturnHandleDialog,
			ApproveHandleDialog
		},
		data() {
			return {
				loading: true,
				refreshing: false,
				userList: [],

				popupStyle: {
					mode: "bottom",
					border_radius: 16,
					height: "90%"
				},

				// 按钮自定义样式对象
				buttonStyle: {
					primary: {
						height: '64rpx',
						padding: '0 24rpx'
					},
					plain: {
						padding: '0 24rpx',
						border: '1rpx solid #2979ff',
						color: '#2979ff',
						background: 'transparent'
					},
					dangerPlain: {
						padding: '0 24rpx',
						border: '1rpx solid #f56c6c',
						color: '#f56c6c',
						background: 'transparent'
					},
					infoPlain: {
						padding: '0 24rpx',
						border: '1rpx solid #909399',
						color: '#606266',
						background: 'transparent'
					},
					warningPlain: {
						padding: '0 24rpx',
						border: '1rpx solid #e6a23c',
						color: '#e6a23c',
						background: 'transparent'
					}
				},
				// 统计数量
				stats: {
					pending: 0,
					completed: 0
				},

				// 列表数据
				tableData: [],
				pagination: {
					pageIndex: 1,
					pageSize: 20,
					total: 0
				},
				hasMore: true,
				loadMoreStatus: 'loadmore',
				loadText: {
					loadmore: '点击加载更多',
					loading: '正在加载...',
					nomore: '没有更多了'
				},
				multipleSelection: [],
				// 筛选
				queryForm: {
					formData: {
						status: '',
						form_type_code: ''
					}
				},
				formTypeOptions: [],
				// 表单类型配置
				formTypeConfigs: {},
				// 审批弹窗
				approveDialog: {
					show: false,
					title: '审批处理',
					approvalHistory: [],
					processFlow: {
						tasks: []
					}
				},
				approveLoading: false,
				currentTask: null,
				currentApplication: null,
				showReturnOption: true,
				showTransferOption: true,
				showAddSignOption: false,
				// 详情弹窗
				detailDialog: {
					show: false,
					title: '申请详情',
					data: null,
					approvalHistory: [],
					currentTasks: [],
					processFlow: {
						tasks: []
					}
				},
				// 批量审批
				batchApproveDialog: {
					show: false,
					selectedItems: []
				},
				batchApproveForm: {
					action: 'approve',
					comment: ''
				},
				batchApproveLoading: false,
				// 退回处理
				returnDialog: {
					show: false,
					title: '退回处理',
					task: null,
					application: null,
					processFlow: {
						tasks: []
					},
					statusHistory: []
				},
				returnLoading: false,
				// 撤回申请
				withdrawDialog: {
					show: false,
					data: null
				},
				withdrawForm: {
					reason: ''
				},
				withdrawLoading: false,
				// 动态表单
				dynamicFormDialog: {
					show: false,
					title: '',
					formSchema: null,
					formTypeCode: '',
					data: null
				},
				saveFormLoading: false,
				// 文件预览
				filePreview: {
					show: false,
					data: {
						url: '',
						name: '',
						type: ''
					}
				}
			};
		},
		onLoad(options = {}) {
			this.init();
		},
		onShow() {
			this.refresh();
		},
		onPullDownRefresh() {
			this.onPullDownRefresh();
		},
		methods: {
			async init() {
				try {
					this.loading = true;
					await this.loadFormTypes();
					await this.loadListData();

				} catch (error) {
					console.error('初始化失败:', error);
					uni.showToast({
						title: '页面初始化失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},

			async loadFormTypes() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/form-type/sys/getList',
						data: {
							pageSize: 100
						}
					});
					if (res.code === 0 && res.rows) {
						res.rows.forEach(formType => {
							this.formTypeConfigs[formType.code] = formType;
						});
						this.formTypeOptions = [{
								value: '',
								label: '全部类型'
							},
							...res.rows.map(item => ({
								value: item.code,
								label: item.name
							}))
						];
					}
				} catch (error) {
					console.error('加载表单类型失败:', error);
				}
			},

			getFormTypeSchema(formTypeCode) {
				const formType = this.formTypeConfigs[formTypeCode];
				if (formType && formType.form_schema) {
					try {
						return JSON.parse(formType.form_schema);
					} catch (e) {
						return null;
					}
				}
				return null;
			},

			getFormTypeName(formTypeCode) {
				const formType = this.formTypeConfigs[formTypeCode];
				return formType ? formType.name : formTypeCode;
			},

			getFormTypeTitle() {
				const value = this.queryForm.formData.form_type_code;
				if (!value) return '全部类型';
				const option = this.formTypeOptions.find(opt => opt.value === value);
				return option ? option.label : '申请类型';
			},

			filterByStatus(status) {
				this.queryForm.formData.status = status;
				this.loadListData(true);
			},

			handleFormTypeChange(value) {
				this.queryForm.formData.form_type_code = value;
				this.loadListData(true);
			},

			async loadListData(reset = true) {
				try {
					if (reset) {
						this.pagination.pageIndex = 1;
						this.hasMore = true;
						this.loadMoreStatus = 'loadmore';
					}

					const params = {
						pageIndex: this.pagination.pageIndex,
						pageSize: this.pagination.pageSize,
						formData: {
							...this.queryForm.formData
						}
					};

					const res = await vk.callFunction({
						url: 'admin/bpmn/task/sys/getList',
						data: params
					});

					if (res.code === 0) {
						const data = res.rows || [];
						const total = res.total || 0;

						const processedData = data.map(item => ({
							...item,
							_checked: false
						}));

						if (reset) {
							this.tableData = processedData;
						} else {
							this.tableData = [...this.tableData, ...processedData];
						}

						this.pagination.total = total;

						const pendingCount = data.filter(item => item.status === 'pending').length;
						const completedCount = data.filter(item => item.status === 'completed').length;

						this.stats.pending = pendingCount;
						this.stats.completed = completedCount;

						if (data.length < this.pagination.pageSize) {
							this.hasMore = false;
							this.loadMoreStatus = 'nomore';
						} else {
							this.hasMore = true;
							this.loadMoreStatus = 'loadmore';
						}
					} else {
						uni.showToast({
							title: res.msg || '加载失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('加载列表失败:', error);
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
					this.refreshing = false;
					uni.stopPullDownRefresh();
				}
			},

			onPullDownRefresh() {
				this.refreshing = true;
				this.loadListData(true);
			},

			loadMore() {
				if (!this.hasMore || this.loadMoreStatus === 'loading' || this.loading) return;
				this.loadMoreStatus = 'loading';
				this.pagination.pageIndex++;
				this.loadListData(false);
			},

			refresh() {
				this.loadListData(true);
			},

			onItemCheck(checked, item) {
				item._checked = checked.value;
				this.multipleSelection = this.tableData.filter(i => i._checked);
			},

			canHandleTask(task) {
				const userInfo = vk.getVuex('$user.userInfo');
				return task.assignee === userInfo.username ||
					(task.candidate_users && task.candidate_users.includes(userInfo.username)) ||
					(task.candidate_groups && task.candidate_groups.some(group =>
						userInfo.role && userInfo.role.includes(group)));
			},

			canHandleReturnTask(task) {
				const userInfo = vk.getVuex('$user.userInfo');
				return task.node_type === 'return' && task.assignee === userInfo.username;
			},

			canTransferTask(task) {
				const userInfo = vk.getVuex('$user.userInfo');
				return task.assignee === userInfo.username;
			},

			canHandleCurrentTask(application) {
				const userInfo = vk.getVuex('$user.userInfo');
				const currentTask = this.detailDialog.currentTasks[0];
				// console.log("currentTask:", currentTask);
				if (!application || !this.detailDialog.currentTasks || this.detailDialog.currentTasks.length === 0 ||
					currentTask.node_type == 'return') return false;
				return currentTask.assignee === userInfo.username ||
					(currentTask.candidate_users && currentTask.candidate_users.includes(userInfo.username));
			},

			hasReturnTask(application) {
				if (!application || !this.detailDialog.currentTasks) return false;
				return this.detailDialog.currentTasks.some(task => task.node_type === 'return');
			},

			canWithdrawApplication(application) {
				if (!application) return false;
				const userInfo = vk.getVuex('$user.userInfo');
				return application.applicant_id === userInfo.username &&
					(application.status === 'pending' || application.status === 'returned');
			},

			async showDetail(item) {
				try {
					const appRes = await vk.callFunction({
						url: 'admin/bpmn/application-form/pub/detail',
						data: {
							userInfo: vk.getVuex('$user.userInfo'),
							_id: item.application_id
						}
					});

					if (appRes.code === 0) {
						this.detailDialog.data = appRes.data.application;
						this.detailDialog.approvalHistory = appRes.data.history || [];
						this.detailDialog.title =
							`${this.getFormTypeName(appRes.data.application.form_type_code)} - 申请详情`;

						const taskRes = await vk.callFunction({
							url: 'admin/bpmn/task/sys/getList',
							data: {
								formData: {
									application_id: item.application_id,
									status: "pending"
								}
							}
						});
						this.detailDialog.currentTasks = taskRes.code === 0 ? taskRes.rows : [];
						await this.loadProcessFlow(item.application_id, 'detail');
					} else {
						this.detailDialog.data = item;
						this.detailDialog.approvalHistory = [];
						this.detailDialog.currentTasks = [];
						this.detailDialog.title = '申请详情';
					}
				} catch (error) {
					console.error('加载详情失败:', error);
					this.detailDialog.data = item;
					this.detailDialog.approvalHistory = [];
					this.detailDialog.currentTasks = [];
					this.detailDialog.title = '申请详情';
				}
				this.detailDialog.show = true;
			},

			async loadProcessFlow(applicationId, type = 'approve') {
				try {

					if (this.queryForm.formData.status === 'pending') {
						if (type === 'approve') {
							return this.approveDialog.processFlow.tasks = this.detailDialog.currentTasks;
						} else {
							return this.detailDialog.processFlow.tasks = this.detailDialog.currentTasks;
						}
					}

					const taskRes = await vk.callFunction({
						url: 'admin/bpmn/task/sys/getList',
						data: {
							formData: {
								application_id: applicationId,
								status: this.queryForm.formData.status
							},
							orderBy: 'sequence asc'
						}
					});
					if (taskRes.code === 0) {
						if (type === 'approve') {
							this.approveDialog.processFlow.tasks = taskRes.rows || [];
						} else {
							this.detailDialog.processFlow.tasks = taskRes.rows || [];
						}
					}
				} catch (error) {
					console.error('加载流程失败:', error);
				}
			},

			async showApproveDialog(task) {
				this.currentTask = task;
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/application-form/pub/detail',
						data: {
							userInfo: vk.getVuex('$user.userInfo'),
							_id: task.application_id
						}
					});
					if (res.code === 0) {
						this.currentApplication = res.data.application;
						this.approveDialog.title =
							`${this.getFormTypeName(this.currentApplication.form_type_code)} - 审批处理`;
						this.approveDialog.approvalHistory = res.data.history;
						this.showReturnOption = task.task_key !== 'start';
						this.showTransferOption = true;
						this.showAddSignOption = task.allow_add_sign === true;
						await this.loadProcessFlow(task.application_id);
						this.approveDialog.show = true;
					} else {
						uni.showToast({
							title: '获取申请详情失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取申请详情失败:', error);
					uni.showToast({
						title: '获取申请详情失败',
						icon: 'none'
					});
				}
			},

			onActionChange(action) {
				if (action === 'approve') {
					this.showAddSignOption = this.currentTask && this.currentTask.allow_add_sign === true;
				} else {
					this.showAddSignOption = false;
				}
			},

			async handleApproveSubmit(submitData) {
				try {
					this.approveLoading = true;
					const completeData = {
						...submitData,
						userInfo: vk.getVuex('$user.userInfo')
					};
					const res = await vk.callFunction({
						url: 'admin/bpmn/task/pub/complete',
						data: completeData
					});
					if (res.code === 0) {
						uni.showToast({
							title: '处理成功',
							icon: 'success'
						});
						this.approveDialog.show = false;
						this.refresh();
					} else {
						uni.showToast({
							title: res.msg || '处理失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('处理失败:', error);
					uni.showToast({
						title: error.message || '处理失败',
						icon: 'none'
					});
				} finally {
					this.approveLoading = false;
				}
			},

			handleTaskFromDetail(application) {
				if (this.detailDialog.currentTasks && this.detailDialog.currentTasks.length > 0) {
					const task = this.detailDialog.currentTasks[0];
					this.showApproveDialog(task);
					this.detailDialog.show = false;
				}
			},

			async handleTransfer(task) {
				try {
					const userInfo = vk.getVuex('$user.userInfo');
					if (task.assignee !== userInfo.username) {
						uni.showToast({
							title: '只有当前任务处理人可以转交任务',
							icon: 'none'
						});
						return;
					}
					await this.showApproveDialog(task);
				} catch (error) {
					console.error('转交任务失败:', error);
					uni.showToast({
						title: '转交任务失败',
						icon: 'none'
					});
				}
			},

			showBatchApproveDialog() {
				if (this.multipleSelection.length === 0) {
					uni.showToast({
						title: '请选择要处理的待办任务',
						icon: 'none'
					});
					return;
				}
				this.batchApproveDialog.selectedItems = this.multipleSelection;
				this.batchApproveForm = {
					action: 'approve',
					comment: ''
				};
				this.batchApproveDialog.show = true;
			},

			async handleBatchApprove() {
				try {
					if (!this.batchApproveForm.comment) {
						uni.showToast({
							title: '请输入审批意见',
							icon: 'none'
						});
						return;
					}
					this.batchApproveLoading = true;
					const res = await vk.callFunction({
						url: 'admin/bpmn/task/sys/batchComplete',
						data: {
							task_ids: this.batchApproveDialog.selectedItems.map(item => item._id),
							action: this.batchApproveForm.action,
							comment: this.batchApproveForm.comment
						}
					});
					if (res.code === 0) {
						uni.showToast({
							title: `批量处理成功，共处理 ${res.data.processed_count} 个任务`,
							icon: 'success'
						});
						this.batchApproveDialog.show = false;
						this.multipleSelection = [];
						this.refresh();
					} else {
						uni.showToast({
							title: res.msg || '批量处理失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('批量处理失败:', error);
					uni.showToast({
						title: '批量处理失败',
						icon: 'none'
					});
				} finally {
					this.batchApproveLoading = false;
				}
			},

			async handleReturnTask(task) {
				try {
					if (task.node_type !== 'return') {
						uni.showToast({
							title: '该任务不是退回任务',
							icon: 'none'
						});
						return;
					}
					const userInfo = vk.getVuex('$user.userInfo');
					if (task.assignee !== userInfo.username) {
						uni.showToast({
							title: '只有申请人可以处理退回任务',
							icon: 'none'
						});
						return;
					}
					this.returnDialog.task = task;
					const appRes = await vk.callFunction({
						url: 'admin/bpmn/application-form/pub/detail',
						data: {
							userInfo,
							_id: task.application_id
						}
					});
					if (appRes.code === 0) {
						this.returnDialog.application = appRes.data.application;
						this.returnDialog.statusHistory = appRes.data.history || [];
					} else {
						this.returnDialog.application = null;
					}
					this.returnDialog.title = `退回处理 - ${this.getFormTypeName(task.form_type_code)}`;
					this.returnDialog.show = true;
				} catch (error) {
					console.error('处理退回任务失败:', error);
					uni.showToast({
						title: '处理退回任务失败',
						icon: 'none'
					});
				}
			},

			handleReturnTaskFromDetail(application) {
				const returnTask = this.detailDialog.currentTasks.find(task => task.node_type === 'return');
				if (returnTask) {
					this.handleReturnTask(returnTask);
					this.detailDialog.show = false;
				}
			},

			editApplicationContent() {
				if (!this.returnDialog.application) {
					uni.showToast({
						title: '申请信息不存在',
						icon: 'none'
					});
					return;
				}
				const application = this.returnDialog.application;
				const formTypeCode = application.form_type_code;
				const formSchema = this.getFormTypeSchema(formTypeCode);
				if (!formSchema) {
					uni.showToast({
						title: '表单配置不存在',
						icon: 'none'
					});
					return;
				}
				const formData = {
					...application
				};
				if (application.form_data) {
					Object.keys(application.form_data).forEach(key => {
						formData[key] = application.form_data[key];
					});
				}
				this.dynamicFormDialog = {
					show: true,
					title: `修改申请信息 - ${this.getFormTypeName(formTypeCode)}`,
					formSchema: formSchema,
					formTypeCode: formTypeCode,
					data: formData
				};

				console.log(this.dynamicFormDialog)

			},

			async handleDynamicFormSave(formData) {
				try {
					this.saveFormLoading = true;
					const res = await vk.callFunction({
						url: 'admin/bpmn/application-form/sys/update',
						data: {
							...formData,
							_id: this.returnDialog.application._id
						}
					});
					if (res.code === 0) {
						if (this.returnDialog.application) {
							this.returnDialog.application = {
								...this.returnDialog.application,
								...formData
							};
						}
						uni.showToast({
							title: '申请信息修改成功',
							icon: 'success'
						});
						this.dynamicFormDialog.show = false;
					} else {
						uni.showToast({
							title: res.msg || '保存失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('保存失败:', error);
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					});
				} finally {
					this.saveFormLoading = false;
				}
			},

			handleDynamicFormCancel() {
				this.dynamicFormDialog.show = false;
			},

			async handleReturnSubmit(submitData) {
				try {
					this.returnLoading = true;
					const res = await vk.callFunction({
						url: 'admin/bpmn/task/pub/handleReturn',
						data: {
							...submitData,
							userInfo: vk.getVuex('$user.userInfo')
						}
					});
					if (res.code === 0) {
						uni.showToast({
							title: '处理成功',
							icon: 'success'
						});
						this.returnDialog.show = false;
						this.refresh();
						if (submitData.action === 'resubmit') {
							uni.showToast({
								title: '申请已重新提交，等待审批',
								icon: 'success'
							});
						} else if (submitData.action === 'withdraw') {
							uni.showToast({
								title: '申请已撤回',
								icon: 'success'
							});
						}
					} else {
						uni.showToast({
							title: res.msg || '处理失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('处理失败:', error);
					uni.showToast({
						title: '处理失败',
						icon: 'none'
					});
				} finally {
					this.returnLoading = false;
				}
			},

			handleWithdrawApplication(application) {
				this.withdrawDialog.data = application;
				this.withdrawForm.reason = '';
				this.withdrawDialog.show = true;
			},

			async handleWithdrawConfirm() {
				try {

					const task = this.detailDialog.currentTasks[0] || {};

					if (!this.withdrawForm.reason) {
						uni.showToast({
							title: '请填写撤回原因',
							icon: 'none'
						});
						return;
					}
					this.withdrawLoading = true;
					const res = await vk.callFunction({
						url: 'admin/bpmn/task/pub/handleReturn',
						data: {
							action: 'withdraw',
							task_id: task._id,
							reason: this.withdrawForm.reason,
							userInfo: vk.getVuex('$user.userInfo')
						}
					});
					if (res.code === 0) {
						uni.showToast({
							title: '申请已撤回',
							icon: 'success'
						});
						this.withdrawDialog.show = false;
						this.detailDialog.show = false;
						this.refresh();
					} else {
						uni.showToast({
							title: res.msg || '撤回失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('撤回失败:', error);
					uni.showToast({
						title: '撤回失败',
						icon: 'none'
					});
				} finally {
					this.withdrawLoading = false;
				}
			},

			formatDate(timestamp) {
				if (!timestamp) return '-';
				return vk.pubfn.timeFormat(timestamp, 'yyyy-MM-dd hh:mm:ss');
			},

			formatDueDate(dueDate) {
				if (!dueDate) return '-';
				const now = Date.now();
				const dueTime = new Date(dueDate).getTime();
				const diffHours = Math.ceil((dueTime - now) / (1000 * 60 * 60));
				if (diffHours < 0) {
					return `已超时 ${Math.abs(diffHours)}小时`;
				} else if (diffHours < 24) {
					return `剩余 ${diffHours}小时`;
				} else {
					return this.formatDate(dueDate);
				}
			},

			getDueDateColor(dueDate) {
				if (!dueDate) return '#909399';
				const now = Date.now();
				const dueTime = new Date(dueDate).getTime();
				if (dueTime < now) return '#f56c6c';
				if (dueTime - now < 24 * 60 * 60 * 1000) return '#e6a23c';
				return '#909399';
			},

			getTaskTypeTag(nodeType) {
				const map = {
					userTask: 'info',
					approval: 'warning',
					return: 'error'
				};
				return map[nodeType] || 'default';
			},

			getTaskTypeText(nodeType) {
				const map = {
					userTask: '普通任务',
					approval: '审批任务',
					return: '退回任务'
				};
				return map[nodeType] || nodeType;
			},

			filePreviewClose() {
				this.filePreview.show = false;
			},

			previewFile(file) {
				if (!file || !file.url) {
					uni.showToast({
						title: '文件地址无效',
						icon: 'none'
					});
					return;
				}
				this.filePreview.data = {
					url: file.url,
					name: file.name,
					type: this.getFileType(file)
				};
				this.filePreview.show = true;
			},

			downloadFile(file) {
				if (!file || !file.url) {
					uni.showToast({
						title: '文件地址无效',
						icon: 'none'
					});
					return;
				}
				uni.showLoading({
					title: '准备下载'
				});
				uni.downloadFile({
					url: file.url,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveFile({
								tempFilePath: res.tempFilePath,
								success: (saveRes) => {
									uni.showToast({
										title: `文件已保存到: ${saveRes.savedFilePath}`,
										icon: 'success',
										duration: 3000
									});
								},
								fail: (err) => {
									console.error('保存文件失败', err);
									uni.showToast({
										title: '保存失败',
										icon: 'none'
									});
								}
							});
						} else {
							uni.showToast({
								title: `下载失败(${res.statusCode})`,
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('下载失败', err);
						uni.showToast({
							title: '下载失败',
							icon: 'none'
						});
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			},

			getFileType(file) {
				if (!file) return 'unknown';
				const name = file.name || '';
				const type = file.type || '';
				if (type.includes('pdf') || name.toLowerCase().endsWith('.pdf')) return 'pdf';
				if (type.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name)) return 'image';
				if (type.includes('text') || /\.(txt|md)$/i.test(name)) return 'text';
				return 'other';
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body {
		min-height: 100vh;
		background: #f5f7fa;
		padding-bottom: 30rpx;
	}

	/* 筛选区域 */
	.filter-section {
		background: #ffffff;
		padding: 24rpx 30rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

		.filter-row {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.filter-item {
				flex: 1;
				margin-right: 20rpx;

				::v-deep .u-dropdown__menu {
					height: 72rpx;
					background: #f8f9fc;
					border-radius: 36rpx;
					border: 1rpx solid #e9ecef;
					padding: 0 24rpx;

					.u-dropdown__menu__item {
						font-size: 28rpx;
						color: #303133;
						font-weight: 500;
					}

					.u-icon {
						color: #2979ff !important;
					}
				}
			}

			.refresh-btn-wrapper {
				::v-deep .u-button {
					height: 72rpx;
					padding: 0 32rpx;
					display: flex;
					align-items: center;

					.btn-text {
						margin-left: 8rpx;
						font-size: 28rpx;
						font-weight: 500;
						color: #ffffff;
					}
				}
			}
		}
	}

	/* 统计卡片 */
	.stats-cards {
		display: flex;
		padding: 0 30rpx 20rpx;
		gap: 20rpx;

		.stat-card {
			flex: 1;
			background: #ffffff;
			border-radius: 24rpx;
			padding: 24rpx 16rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
			display: flex;
			flex-direction: column;
			align-items: center;
			border: 1rpx solid #f0f2f5;
			transition: all 0.2s ease;

			&:active {
				background: #f8f9fc;
				transform: scale(0.98);
			}

			.stat-number {
				font-size: 44rpx;
				font-weight: 700;
				line-height: 1.2;
				margin-bottom: 8rpx;
			}

			.stat-label {
				font-size: 24rpx;
				color: #606266;
			}

			&.pending .stat-number {
				color: #f39c12;
			}

			&.completed .stat-number {
				color: #2979ff;
			}
		}
	}

	/* 骨架屏 */
	.skeleton-section {
		padding: 0 30rpx;

		.skeleton-item {
			background: #ffffff;
			border-radius: 24rpx;
			padding: 30rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

			.skeleton-header {
				display: flex;
				justify-content: space-between;
				margin-bottom: 24rpx;

				.skeleton-title {
					width: 60%;
					height: 32rpx;
					background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
					background-size: 200% 100%;
					animation: skeleton-loading 1.5s infinite;
					border-radius: 8rpx;
				}

				.skeleton-tag {
					width: 80rpx;
					height: 32rpx;
					background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
					background-size: 200% 100%;
					animation: skeleton-loading 1.5s infinite;
					border-radius: 16rpx;
				}
			}

			.skeleton-line {
				height: 24rpx;
				background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
				background-size: 200% 100%;
				animation: skeleton-loading 1.5s infinite;
				border-radius: 6rpx;
				margin-bottom: 16rpx;

				&.short {
					width: 70%;
				}
			}
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

	/* 列表区域 */
	.list-section {
		.list-scroll {
			height: calc(100vh - 400rpx);
		}

		.list-container {
			padding: 0 30rpx;

			.list-item {
				background: #ffffff;
				margin-bottom: 24rpx;
				padding: 30rpx 24rpx;
				border-radius: 24rpx;
				box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.02);
				border: 1rpx solid #f5f7fa;
				transition: all 0.2s;

				&:active {
					background: #fafbfc;
				}

				.item-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 20rpx;

					.header-left {
						display: flex;
						align-items: center;
						flex: 1;

						.u-checkbox {
							margin-right: 16rpx;
						}

						.title-wrapper {
							display: flex;
							align-items: center;
							flex: 1;

							.item-title {
								font-size: 32rpx;
								font-weight: 600;
								color: #1a1e25;
								margin-left: 12rpx;
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
							}
						}
					}

					.status-tag {
						font-size: 22rpx;
						padding: 6rpx 18rpx;
						border-radius: 30rpx;
						font-weight: 500;
					}
				}

				.item-content {
					.info-grid {
						display: flex;
						flex-direction: column; // 改为纵向排列
						margin-bottom: 16rpx;
						gap: 16rpx; // 行间距

						.info-item {
							display: flex;
							align-items: baseline;
							width: 100%; // 占满整行

							.info-label {
								font-size: 26rpx;
								color: #8e98a3;
								width: 140rpx; // 固定标签宽度，保证对齐
								flex-shrink: 0;
							}

							.info-value {
								font-size: 28rpx;
								color: #1a1e25;
								font-weight: 500;
								flex: 1; // 占据剩余空间
								word-break: break-word;
							}
						}
					}
				}

				.item-footer {
					display: flex;
					justify-content: space-between;
					align-items: center;

					.time-info,
					.due-info {
						display: flex;
						align-items: center;
						font-size: 24rpx;
						color: #a8b1bd;

						text {
							margin-left: 6rpx;
						}
					}
				}

				.item-actions {
					display: flex;
					justify-content: flex-end;
					margin-top: 24rpx;
					padding-top: 20rpx;
					border-top: 1rpx solid #f0f2f5;
					gap: 16rpx;

					::v-deep .u-button {
						min-width: 120rpx;
						height: 60rpx;
						font-size: 24rpx;
						font-weight: 500;
					}
				}
			}

			.empty-wrapper {
				padding: 100rpx 0;

				::v-deep .u-button {
					margin-top: 40rpx;
					width: 240rpx;
					height: 80rpx;
					font-size: 28rpx;
					font-weight: 500;
				}
			}
		}
	}

	/* 弹窗样式优化 */
	.approve-dialog,
	.detail-dialog {
		background: #ffffff;
		border-radius: 24rpx 24rpx 0 0;

		.dialog-header,
		.detail-header {
			padding: 36rpx 30rpx 20rpx;
			text-align: center;
			border-bottom: 1rpx solid #f0f2f5;

			.dialog-title,
			.detail-title {
				font-size: 36rpx;
				font-weight: 700;
				color: #1a1e25;
			}
		}

		.dialog-content,
		.detail-content {
		  // 移除 max-height 和 overflow-y，让 u-popup 处理滚动
		  padding: 24rpx;
		}

		.detail-actions {
			padding: 30rpx;
			border-top: 1rpx solid #f0f2f5;
			display: flex;
			justify-content: flex-end;
			gap: 20rpx;
		}
	}

	/* 响应式调整 */
	@media (max-width: 750px) {
		.filter-section {
			padding: 20rpx 24rpx;

			.filter-row .filter-item ::v-deep .u-dropdown__menu {
				height: 64rpx;
				padding: 0 20rpx;
			}

			.refresh-btn-wrapper ::v-deep .u-button {
				height: 64rpx;
				padding: 0 24rpx;
			}
		}

		.stats-cards {
			padding: 0 24rpx 16rpx;
			gap: 16rpx;

			.stat-card {
				padding: 20rpx 12rpx;

				.stat-number {
					font-size: 40rpx;
				}
			}
		}

		.list-section .list-container .list-item {
			padding: 24rpx 20rpx;

			.item-header .title-wrapper .item-title {
				font-size: 30rpx;
			}

			.item-content .info-grid .info-item .info-label {
				width: 100rpx;
				font-size: 24rpx;
			}
		}
	}
</style>