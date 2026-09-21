<template>
	<view class="container">
		<!-- 筛选区域 -->
		<view class="filter-section">
			<view class="filter-row">
				<view class="filter-item">
					<u-dropdown ref="statusFilter" active-color="#2979ff">
						<u-dropdown-item :title="getStatusTitle()" @change="handleStatusChange"
							v-model="queryForm1.formData.status" :options="statusOptions"></u-dropdown-item>
					</u-dropdown>
				</view>
				<view class="add-button-wrapper">
					<u-button type="primary" shape="circle" size="medium" :plain="false" @click="addBtn"
						:custom-style="buttonStyle.primary">
						<u-icon name="plus" size="20" color="#fff"></u-icon>
						<text class="btn-text">新建</text>
					</u-button>
				</view>
			</view>
		</view>

		<!-- 统计卡片区域 -->
		<view class="stats-cards">
			<view class="stat-card total" @click="handleStatusChange('')">
				<text class="stat-number">{{ totalCount }}</text>
				<text class="stat-label">全部申请</text>
			</view>
			<view class="stat-card draft" @click="handleStatusChange('draft')">
				<text class="stat-number">{{ draftCount }}</text>
				<text class="stat-label">草稿</text>
			</view>
			<view class="stat-card pending" @click="handleStatusChange('pending')">
				<text class="stat-number">{{ pendingCount }}</text>
				<text class="stat-label">待处理</text>
			</view>
		</view>

		<!-- 加载状态 - 骨架屏 -->
		<view class="skeleton-section" v-if="loading && !formSchema">
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
							<view class="title-wrapper">
								<u-icon name="calendar-fill" size="32" color="#2979ff"></u-icon>
								<text class="item-title">{{ item.form_data?.miss_date || '未填写日期' }} 签卡申请</text>
							</view>
							<u-tag :type="getStatusTagType(item.status)" size="mini" :border="false" class="status-tag">
								{{ getStatusText(item.status) }}
							</u-tag>
						</view>

						<view class="item-content">
							<view class="info-grid">
								<view class="info-item">
									<text class="info-label">签卡类型</text>
									<text class="info-value">{{ getMissTypeLabel(item.form_data?.miss_type) }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">签卡原因</text>
									<text
										class="info-value">{{ getMissReasonLabel(item.form_data?.miss_reason) }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">签卡时间点</text>
									<text class="info-value">{{ item.form_data?.miss_time || '未填写' }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">申请人</text>
									<text class="info-value">{{ item.applicant_name || '未知' }}</text>
								</view>
							</view>
							<view class="item-footer">
								<view class="time-info" v-if="item._add_time">
									<u-icon name="clock" size="24" color="#c0c4cc"></u-icon>
									<text>{{ formatDate(item._add_time) }}</text>
								</view>
							</view>
						</view>

						<view class="item-actions">
							<u-button v-if="canEdit(item)" type="primary" size="medium" :plain="true"
								:custom-style="buttonStyle.plain" @click.stop="handleEdit(item)">
								编辑
							</u-button>
							<u-button v-if="canDelete(item)" type="error" size="medium" :plain="true"
								:custom-style="buttonStyle.dangerPlain" @click.stop="handleDelete(item)">
								删除
							</u-button>
							<u-button type="info" size="medium" :plain="true" :custom-style="buttonStyle.infoPlain"
								@click.stop="showDetail(item)">
								详情
							</u-button>
						</view>
					</view>

					<!-- 空状态 -->
					<view class="empty-wrapper" v-if="!loading && tableData.length === 0">
						<u-empty mode="data" icon="/static/empty.png" text="暂无签卡申请记录">
							<u-button type="primary" shape="circle" @click="addBtn" :customStyle="buttonStyle.primary">
								立即新建
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

		<!-- 动态表单弹窗 -->
		<u-popup v-model="formDialog.show" :mode="popupStyle.mode" :closeable="true"
			:border-radius="popupStyle.border_radius" :height="popupStyle.height" :close-on-click-overlay="true">
			<view class="form-dialog">
				<view class="form-header">
					<text class="form-title">{{ formDialog.title }}</text>
				</view>
				<view class="form-content">
					<view v-if="!formSchema" class="form-loading">
						<u-loading mode="circle" size="36" color="#2979ff"></u-loading>
						<text class="loading-text">表单加载中...</text>
					</view>
					<view v-else>
						<dynamic-form-dialog :form-schema="formSchema" :form-type-code="formTypeCode"
							:value="formDialog.show" :initial-data="formDialog.data" :butVisible="true"
							:saveLoading="saveFormLoading" :submitLoading="submitFormLoading"
							:simulateLoading="simulateFormLoading" @save="handleFormSave" @submit="handleFormSubmit"
							@simulate="handleSimulate" @preview-file="previewFile" @cancel="closeFormDialog"
							@download-file="downloadFile" />
					</view>
				</view>
			</view>
		</u-popup>

		<!-- 试算结果弹窗 -->
		<u-popup v-model="simulateDialog.show" :mode="popupStyle.mode" :closeable="true"
			:border-radius="popupStyle.border_radius" :height="popupStyle.height">
			<simulate-handle-dialog :simulate-data="simulateDialog.data" />
		</u-popup>

		<!-- 详情弹窗 -->
		<u-popup v-model="detailDialog.show" :mode="popupStyle.mode" :closeable="true"
			:border-radius="popupStyle.border_radius" :height="popupStyle.height">
			<view class="detail-dialog">
				<view class="detail-header">
					<text class="detail-title">签卡申请详情</text>
				</view>
				<scroll-view scroll-y class="detail-content">
					<view v-if="!formSchema" class="form-loading">
						<u-loading mode="circle" size="36" color="#2979ff"></u-loading>
						<text class="loading-text">详情加载中...</text>
					</view>
					<view v-else>
						<approve-header-detail :detail-data="detailDialog.data" :form-schema="formSchema"
							:process-info="processInfo" :status-history="statusHistory"
							:current-tasks="detailDialog.currentTasks" :show-basic-info="true" :show-return-info="false"
							:show-approval-flow="true" :show-current-task="true" :show-handle-form="false"
							:form-type-configs="formTypeConfigs" @preview-file="previewFile"
							@download-file="downloadFile" />
					</view>
				</scroll-view>
			</view>
		</u-popup>

		<u-modal v-model="deleteDialog.show" :show-cancel-button="true" :show-confirm-button="true" :async-close="true"
			:content="deleteDialog.content" @confirm="confirmDelete" @cancel="cancelDelete">
		</u-modal>
	</view>
	<file-preview-dialog :value="filePreview.show" :file-data="filePreview.data" @filePreviewClose="filePreviewClose"
		@download-file="downloadFile" />
</template>

<script>
	import DynamicFormDialog from '@/components/dynamic-form-dialog/dynamic-form-dialog.vue';
	import SimulateHandleDialog from '@/components/simulate-handle-dialog/simulate-handle-dialog.vue';
	import FilePreviewDialog from '@/components/file-preview-dialog/file-preview-dialog.vue';
	import ApproveHeaderDetail from '@/components/approve-header-detail/approve-header-detail.vue';

	export default {
		name: 'MissPunchApply',
		components: {
			DynamicFormDialog,
			SimulateHandleDialog,
			FilePreviewDialog,
			ApproveHeaderDetail
		},
		data() {
			return {
				popupStyle: {
					mode: "bottom",
					border_radius: 16,
					height: "90%"
				},
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
					}
				},
				loading: true,
				refreshing: false,
				addLoading: false,
				saveFormLoading: false,
				submitFormLoading: false,
				simulateFormLoading: false,

				formSchema: null,
				formTypeCode: 'MISS_PUNCH_RECORD', // 签卡申请表单类型代码
				formTypeConfigs: {},

				tableData: [],
				totalCount: 0,
				draftCount: 0,
				pendingCount: 0,

				pagination: {
					pageIndex: 1,
					pageSize: 10,
					total: 0
				},
				hasMore: true,
				loadMoreStatus: 'loadmore',
				loadText: {
					loadmore: '点击加载更多',
					loading: '正在加载...',
					nomore: '没有更多了'
				},

				statusOptions: [{
						value: '',
						label: '全部状态'
					},
					{
						value: 'draft',
						label: '草稿'
					},
					{
						value: 'pending',
						label: '待处理'
					},
					{
						value: 'rejected',
						label: '已驳回'
					},
					{
						value: 'withdrawn',
						label: '已撤回'
					},
					{
						value: 'approved',
						label: '已通过'
					}
				],

				queryForm1: {
					formData: {
						form_type_code: "MISS_PUNCH_RECORD",
						status: ""
					}
				},

				formDialog: {
					show: false,
					title: '',
					data: null
				},
				simulateDialog: {
					show: false,
					data: null
				},
				filePreview: {
					show: false,
					data: {
						url: '',
						name: '',
						type: ''
					}
				},
				detailDialog: {
					show: false,
					title: '签卡申请详情',
					currentTasks: [],
					data: null
				},
				deleteDialog: {
					show: false,
					content: '确定删除该签卡申请吗？',
					data: null
				},
				processInfo: {
					tasks: [],
					instance: null
				},
				statusHistory: []
			};
		},
		onLoad(options = {}) {			
			this.init(options);
		},
		onShow() {
			this.loadListData(true);
		},
		onPullDownRefresh() {
			this.onPullDownRefresh();
		},
		methods: {
			normalizeSimulateData(rawData) {
				let nodes = rawData.nodes || rawData.data?.nodes || rawData.process?.nodes || rawData.steps || rawData
					.tasks;
				if (!Array.isArray(nodes)) nodes = [];

				const standardNodes = nodes.map(node => ({
					node_key: node.node_key || node.id || `node_${Math.random()}`,
					node_name: node.node_name || node.name || '未命名节点',
					node_type: node.node_type || node.type || 'userTask',
					estimated_assignee: node.estimated_assignee || node.assignee || null,
					assignee_type: node.assignee_type || node.assignType || 'user',
					assignee_value: node.assignee_value || node.assignValue || '',
					duration_estimate: node.duration_estimate || node.duration || 0,
					actions: node.actions || node.availableActions || [],
					conditions: node.conditions || [],
					next_node_keys: node.next_node_keys || node.nextNodes || []
				}));

				let estimatedDuration = rawData.estimated_duration || rawData.estimatedDuration;
				if (estimatedDuration && typeof estimatedDuration === 'number') {
					estimatedDuration = {
						formatted: `${estimatedDuration} 小时`
					};
				} else if (estimatedDuration && !estimatedDuration.formatted) {
					estimatedDuration = {
						formatted: '未知'
					};
				}

				return {
					nodes: standardNodes,
					process_definition: rawData.process_definition || rawData.processDefinition || null,
					estimated_duration: estimatedDuration,
					total_nodes: standardNodes.length,
					form_type: rawData.form_type || rawData.formType || '未指定',
					...rawData
				};
			},
			filePreviewClose() {
				this.filePreview.show = false;
			},
			closeFormDialog() {
				this.formDialog.show = false;
			},
			async init(options) {
				try {
					this.loading = true;
					await this.loadFormTypes();
					await this.getFormTypeSchema();
					if (!this.formSchema) {
						this.useDefaultFormSchema();
					}
					await this.loadListData();
				} catch (error) {
					console.error('初始化失败:', error);
					this.useDefaultFormSchema();
				} finally {
					this.loading = false;
				}
			},
			async loadFormTypes() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/form-type/sys/getList',
						data: {
							status: 'active',
							pageIndex: 1,
							pageSize: -1
						}
					});
					if (res.code === 0 && res.rows) {
						const configs = {};
						res.rows.forEach(formType => {
							configs[formType.code] = formType;
						});
						this.formTypeConfigs = configs;
					}
				} catch (error) {
					console.error('加载表单类型失败:', error);
				}
			},
			async getFormTypeSchema() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/form-type/sys/getList',
						data: {
							code: this.formTypeCode,
							status: 'active'
						}
					});
					if (res.code === 0 && res.rows && res.rows.length > 0) {
						const formType = res.rows[0];
						if (formType.form_schema) {
							this.formSchema = JSON.parse(formType.form_schema);
							return;
						}
					}
					if (this.formTypeConfigs[this.formTypeCode]?.form_schema) {
						this.formSchema = JSON.parse(this.formTypeConfigs[this.formTypeCode].form_schema);
					}
				} catch (error) {
					console.error('获取表单schema失败:', error);
				}
			},
			useDefaultFormSchema() {
				// 默认签卡申请表单配置（与提供的JSON一致）
				this.formSchema = {
					fields: [{
							name: "miss_date",
							label: "签卡日期",
							type: "date",
							required: true,
							defaultValue: "",
							placeholder: "请选择签卡发生的日期"
						},
						{
							name: "miss_type",
							label: "签卡类型",
							type: "select",
							required: true,
							options: [{
									value: "clock_in",
									label: "上班签到卡"
								},
								{
									value: "clock_out",
									label: "下班签退卡"
								}
							],
							defaultValue: "clock_in"
						},
						{
							name: "miss_reason",
							label: "签卡原因",
							type: "select",
							required: true,
							options: [{
									value: "work_need",
									label: "因工作需要"
								},
								{
									value: "other",
									label: "其他原因"
								}
							],
							defaultValue: ""
						},
						{
							name: "miss_time",
							label: "签卡时间点",
							type: "time",
							required: false,
							placeholder: "例如：09:00 或 17:30",
							description: "如知道具体签卡时间点请填写，便于核实"
						},
						{
							name: "remarks",
							label: "备注",
							type: "textarea",
							required: true,
							placeholder: "请详细说明签卡原因、经过以及其他补充信息",
							rows: 4,
							maxLength: 500,
							defaultValue: ""
						},
						{
							name: "attachments",
							label: "相关证明附件",
							type: "file",
							required: true,
							multiple: true,
							accept: ".pdf,.doc,.docx,.jpg,.png,.jpeg",
							maxSize: 10,
							maxCount: 5,
							description: "支持PDF、Word、图片等格式，单个文件不超过10MB，最多上传5个文件"
						}
					],
					layout: {
						type: "grid",
						columns: 2,
						groups: [{
								title: "签卡信息",
								fields: ["miss_date", "miss_type", "miss_reason", "miss_time"]
							},
							{
								title: "详细说明",
								fields: ["remarks"],
								fullWidth: true
							},
							{
								title: "证明材料",
								fields: ["attachments"],
								fullWidth: true
							}
						]
					},
					validation: {
						rules: {
							miss_date: {
								maxToday: true,
								message: "签卡日期不能晚于今天"
							},
							remarks: {
								required: true,
								maxLength: 500,
								message: "备注为必填项且不能超过500字"
							},
							attachments: {
								required: true,
								message: "请上传相关证明附件"
							}
						}
					}
				};
				console.log('已使用默认签卡表单配置');
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
						...this.queryForm1.formData
					};
					const res = await vk.callFunction({
						url: 'client/bpmn/application-form/sys/getList',
						data: params
					});
					if (res.code === 0) {
						const data = res.rows || [];
						const total = res.total || 0;
						if (reset) {
							this.tableData = data;
						} else {
							this.tableData = [...this.tableData, ...data];
						}
						this.pagination.total = total;
						this.totalCount = this.tableData.length;
						this.draftCount = this.tableData.filter(item => item.status === 'draft').length;
						this.pendingCount = this.tableData.filter(item => item.status === 'pending').length;
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
					console.error('加载列表数据失败:', error);
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
			getStatusTitle() {
				const status = this.queryForm1.formData.status;
				if (!status) return '全部状态';
				const option = this.statusOptions.find(opt => opt.value === status);
				return option ? option.label : '状态';
			},
			handleStatusChange(status) {
				this.queryForm1.formData.status = status;
				this.loadListData(true);
			},
			getStatusTagType(status) {
				const map = {
					draft: 'info',
					pending: 'warning',
					rejected: 'error',
					withdrawn: 'default',
					approved: 'success'
				};
				return map[status] || 'default';
			},
			getStatusText(status) {
				const map = {
					draft: '草稿',
					pending: '待处理',
					rejected: '已驳回',
					withdrawn: '已撤回',
					approved: '已通过'
				};
				return map[status] || status;
			},
			getMissTypeLabel(value) {
				const map = {
					clock_in: '上班签到卡',
					clock_out: '下班签退卡'
				};
				return map[value] || value;
			},
			getMissReasonLabel(value) {
				const map = {
					work_need: '因工作需要',
					other: '其他原因'
				};
				return map[value] || value;
			},
			canEdit(item) {
				const userInfo = vk.getVuex('$user.userInfo');
				const userId = userInfo?.username || userInfo?.user_id;
				return item.status === 'draft' && item.applicant_id === userId;
			},
			canDelete(item) {
				const userInfo = vk.getVuex('$user.userInfo');
				const userId = userInfo?.username || userInfo?.user_id;
				return item.status === 'draft' && item.applicant_id === userId;
			},
			handleEdit(item) {
				this.updateBtn({
					item
				});
			},
			handleDelete(item) {
				this.deleteDialog.data = item;
				this.deleteDialog.show = true;
			},
			async confirmDelete() {
				const item = this.deleteDialog.data;
				if (!item) return;
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/application-form/sys/delete',
						data: {
							id: item._id
						}
					});

					// 删除附件
					item.form_data?.file_attachments.map(async (e,index) => {
						await vk.myfn.deleteFile(e);
					});

					if (res.code === 0) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
						this.loadListData(true);
					} else {
						uni.showToast({
							title: res.msg || '删除失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('删除失败:', error);
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					});
				} finally {
					this.deleteDialog.show = false;
				}
			},
			cancelDelete() {
				this.deleteDialog.show = false;
			},
			addBtn() {
				if (!this.formSchema) {
					this.loadFormSchemaAndOpenDialog();
					return;
				}
				this.openFormDialog();
			},
			async loadFormSchemaAndOpenDialog() {
				this.addLoading = true;
				try {
					await this.getFormTypeSchema();
					if (this.formSchema) {
						this.openFormDialog();
					} else {
						uni.showToast({
							title: '表单配置加载失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('加载表单schema失败:', error);
					uni.showToast({
						title: '表单配置加载失败',
						icon: 'none'
					});
				} finally {
					this.addLoading = false;
				}
			},
			openFormDialog() {
				this.formDialog = {
					show: true,
					title: '新建签卡申请',
					data: {
						form_type_code: this.formTypeCode,
						form_data: {}
					}
				};
			},
			updateBtn({
				item
			}) {
				if (!this.formSchema) {
					uni.showToast({
						title: '表单配置加载中',
						icon: 'none'
					});
					return;
				}
				const formData = {
					...item
				};
				if (item.form_data) {
					Object.keys(item.form_data).forEach(key => {
						formData[key] = item.form_data[key];
					});
				}
				this.formDialog = {
					show: true,
					title: '编辑签卡申请',
					data: formData
				};
			},
			refresh() {
				this.loadListData(true);
			},
			async showDetail(item) {
				this.detailDialog.data = item;
				await this.loadProcessFlow(item);
				await this.loadStatusHistory(item);
				this.detailDialog.show = true;
			},
			async loadProcessFlow(item) {
				try {
					const userInfo = vk.getVuex('$user.userInfo');
					const taskRes = await vk.callFunction({
						url: 'admin/bpmn/task/pub/getProcessFlow',
						data: {
							formData: {
								application_id: item._id
							},
							userInfo: userInfo,
							orderBy: 'sequence asc'
						}
					});
					if (taskRes.code === 0) {
						this.processInfo.tasks = taskRes.rows || [];
					}
					if (item.process_instance_id) {
						const instanceRes = await vk.callFunction({
							url: 'admin/bpmn/instance/sys/getList',
							data: {
								formData: {
									_id: item.process_instance_id
								}
							}
						});
						if (instanceRes.code === 0 && instanceRes.rows?.length > 0) {
							this.processInfo.instance = instanceRes.rows[0];
						}
					}
				} catch (error) {
					console.error('加载审批流程失败:', error);
				}
			},
			async loadStatusHistory(item) {
				try {
					this.statusHistory = [{
						action: 'create',
						operation_time: item._add_time,
						operator_name: item.applicant_name,
						comment: '创建签卡申请',
						task_name: '申请创建'
					}];
					const historyRes = await vk.callFunction({
						url: 'admin/bpmn/task-history/sys/getList',
						data: {
							formData: {
								application_id: item._id,
								action: "create"
							},
							orderBy: 'operation_time asc'
						}
					});
					if (historyRes.code === 0 && historyRes.rows) {
						historyRes.rows.forEach(history => {
							this.statusHistory.push({
								action: history.action,
								operation_time: history.operation_time,
								operator_name: history.operator_name,
								comment: history.comment,
								task_name: this.getTaskNameFromHistory(history)
							});
						});
					}
					this.statusHistory.sort((a, b) => a.operation_time - b.operation_time);
				} catch (error) {
					console.error('加载状态历史失败:', error);
				}
			},
			getTaskNameFromHistory(history) {
				if (history.task_data?.node_info) return history.task_data.node_info.node_name;
				if (history.task_snapshot) return history.task_snapshot.task_name;
				return '任务处理';
			},
			async handleFormSave(formData) {
				formData._id = formData._id ? formData._id : this.formDialog.data._id;
				this.saveFormLoading = true;
				try {
					let url = "admin/bpmn/application-form/sys/add";
					if (formData._id) url = "admin/bpmn/application-form/sys/update";
					const res = await vk.callFunction({
						url,
						data: {
							...formData,
							_id: formData._id
						}
					});
					if (res.code === 0) {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						});
						this.formDialog.show = false;
						this.loadListData(true);
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
			async handleFormSubmit(formData) {
				formData._id = formData._id ? formData._id : this.formDialog.data._id;
				this.submitFormLoading = true;
				try {
					const userInfo = vk.getVuex('$user.userInfo');
					
					// ===== 校验每月补卡次数 =====
					const checkRes = await vk.callFunction({
						url: 'admin/hrm/attendance/pub/checkRemedyLimit',
						data: {
							employee_id: userInfo.username, // 假设工号与用户名一致，请根据实际调整
							date: formData.form_data?.miss_date,
							fileLength: formData.form_data?.file_attachments.length
						}
					});
					if (checkRes.code !== 0) {
						this.$message.error(checkRes.msg || '补卡次数校验失败');
						this.submitFormLoading = false;
						return;
					}
					// ================================
					
					const calculatedValues = {
						miss_date: formData.form_data?.miss_date,
						miss_reason_label: this.getMissReasonLabel(formData.form_data?.miss_reason)
					};
					const title = `${userInfo?.username || '用户'}的签卡申请（${formData.form_data?.miss_date || '未知日期'}）`;
					const submitData = {
						...formData,
						calculated_values: calculatedValues,
						userInfo: userInfo,
						title: title
					};
					if (formData._id) {
						submitData._id = formData._id;
						submitData.status = 'pending';
					}
					const res = await vk.callFunction({
						url: 'admin/bpmn/application-form/pub/submit',
						data: submitData
					});
					if (res.code === 0) {
						uni.showToast({
							title: '提交成功',
							icon: 'success'
						});
						this.formDialog.show = false;
						this.loadListData(true);
					} else {
						uni.showToast({
							title: res.msg || '提交失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('提交失败:', error);
					uni.showToast({
						title: '提交失败',
						icon: 'none'
					});
				} finally {
					this.submitFormLoading = false;
				}
			},
			async handleSimulate(formData) {
				this.simulateFormLoading = true;
				try {
					const userInfo = vk.getVuex('$user.userInfo');
					const calculatedValues = {
						miss_date: formData.form_data?.miss_date,
						miss_reason_label: this.getMissReasonLabel(formData.form_data?.miss_reason)
					};
					const simulateData = {
						form_type_code: this.formTypeCode,
						form_data: formData.form_data,
						calculated_values: calculatedValues,
						userInfo: userInfo
					};
					const res = await vk.callFunction({
						url: 'admin/bpmn/process-engine/pub/simulate',
						data: simulateData
					});
					if (res.code === 0) {
						let simulateResult = res.data;
						if (res.data && res.data.data) simulateResult = res.data.data;
						this.showSimulateResult(simulateResult);
					} else {
						uni.showToast({
							title: res.msg || '试算失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('试算失败:', error);
					uni.showToast({
						title: '试算失败',
						icon: 'none'
					});
				} finally {
					this.simulateFormLoading = false;
				}
			},
			showSimulateResult(result) {
				const normalizedData = this.normalizeSimulateData(result);
				if (!normalizedData.nodes.length) {
					uni.showToast({
						title: '试算结果格式异常',
						icon: 'none'
					});
				}
				this.simulateDialog.data = normalizedData;
				this.simulateDialog.show = true;
			},
			submitAfterSimulate() {
				this.simulateDialog.show = false;
				this.handleFormSubmit(this.formDialog.data);
			},
			getFieldOptionLabel(fieldName, value) {
				if (!this.formSchema?.fields) return value;
				const field = this.formSchema.fields.find(f => f.name === fieldName);
				if (!field?.options) return value;
				const option = field.options.find(opt => opt.value === value);
				return option ? option.label : value;
			},
			formatDate(timestamp, formatStr) {
				if (!timestamp) return '-';
				return vk.pubfn.timeFormat(timestamp, formatStr || 'yyyy-MM-dd hh:mm:ss');
			},
			previewFile(file) {
				if (!file?.url) {
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
				if (!file?.url) {
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
										title: `文件已保存`,
										icon: 'success',
										duration: 3000
									});
								},
								fail: (err) => {
									console.error('保存文件失败', err);
									uni.showToast({
										title: '保存失败: ' + err.errMsg,
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
	.container {
		min-height: 100vh;
		background: #f5f7fa;
		padding-bottom: 20rpx;
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

			&.total .stat-number {
				color: #2979ff;
			}

			&.draft .stat-number {
				color: #909399;
			}

			&.pending .stat-number {
				color: #f39c12;
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
			height: calc(100vh - 340rpx);
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
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
				}

				.item-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 20rpx;

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
						flex-wrap: wrap;
						margin-bottom: 16rpx;

						.info-item {
							width: 50%;
							margin-bottom: 16rpx;
							display: flex;
							align-items: baseline;

							.info-label {
								font-size: 26rpx;
								color: #8e98a3;
								width: 120rpx;
							}

							.info-value {
								font-size: 28rpx;
								color: #1a1e25;
								font-weight: 500;
								flex: 1;
							}
						}
					}

					.item-footer {
						display: flex;
						justify-content: flex-end;

						.time-info {
							display: flex;
							align-items: center;
							font-size: 24rpx;
							color: #a8b1bd;

							text {
								margin-left: 6rpx;
							}
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
				}
			}

			.empty-wrapper {
				padding: 100rpx 0;
			}
		}
	}

	/* 弹窗样式 */
	.form-dialog,
	.detail-dialog {
		background: #ffffff;
		border-radius: 24rpx 24rpx 0 0;

		.form-header,
		.detail-header {
			padding: 36rpx 30rpx 20rpx;
			text-align: center;
			border-bottom: 1rpx solid #f0f2f5;

			.form-title,
			.detail-title {
				font-size: 36rpx;
				font-weight: 700;
				color: #1a1e25;
			}
		}

		.form-content,
		.detail-content {
			max-height: 70vh;
			padding: 24rpx;
		}
	}
</style>