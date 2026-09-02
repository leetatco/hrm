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
								<u-icon name="file-text-fill" size="32" color="#2979ff"></u-icon>
								<text class="item-title">
									{{ item.form_data?.clothes_title || '未命名工衣申请' }}
								</text>
							</view>
							<u-tag :type="getStatusTagType(item.status)" size="mini" :border="false" class="status-tag">
								{{ getStatusText(item.status) }}
							</u-tag>
						</view>

						<view class="item-content">
							<view class="info-grid">
								<view class="info-item">
									<text class="info-label">总人数</text>
									<text class="info-value">
										{{ getClothesSummary(item.form_data?.items) }}
									</text>
								</view>
								<view class="info-item">
									<text class="info-label">总件数</text>
									<text class="info-value">
										{{ item.form_data?.total_quantity || 0 }}
									</text>
								</view>
								<view class="info-item">
									<text class="info-label">申请人</text>
									<text class="info-value">{{ item.applicant_name || '未知' }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">申请日期</text>
									<text class="info-value">{{ formatDate(item._add_time, 'yyyy-MM-dd') }}</text>
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
						<u-empty mode="data" icon="/static/empty.png" text="暂无工衣申请记录">
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
			:border-radius="popupStyle.border_radius" :height="popupStyle.height">
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
					<text class="detail-title">工衣申请详情</text>
				</view>
				<view class="detail-content">
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
				</view>
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
		name: 'ClothesApply',
		components: {
			DynamicFormDialog,
			SimulateHandleDialog,
			FilePreviewDialog,
			ApproveHeaderDetail,
		},
		data() {
			return {
				popupStyle: {
					mode: 'bottom',
					border_radius: 16,
					height: '90%',
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
						background: 'transparent',
					},
					dangerPlain: {
						padding: '0 24rpx',
						border: '1rpx solid #f56c6c',
						color: '#f56c6c',
						background: 'transparent',
					},
					infoPlain: {
						padding: '0 24rpx',
						border: '1rpx solid #909399',
						color: '#606266',
						background: 'transparent',
					},
				},
				loading: true,
				refreshing: false,
				saveFormLoading: false,
				submitFormLoading: false,
				simulateFormLoading: false,

				formSchema: null,
				formTypeCode: 'WORK_CLOTHES_APPLICATION',
				formTypeConfigs: {},

				tableData: [],
				totalCount: 0,
				draftCount: 0,
				pendingCount: 0,

				pagination: {
					pageIndex: 1,
					pageSize: 10,
					total: 0,
				},
				hasMore: true,
				loadMoreStatus: 'loadmore',
				loadText: {
					loadmore: '点击加载更多',
					loading: '正在加载...',
					nomore: '没有更多了',
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
					},
				],

				queryForm1: {
					formData: {
						form_type_code: 'WORK_CLOTHES_APPLICATION',
						status: '',
					},
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
					currentTasks: [],
					data: null
				},
				deleteDialog: {
					show: false,
					content: '确定删除该工衣申请吗？',
					data: null
				},
				processInfo: {
					tasks: [],
					instance: null
				},
				statusHistory: [],
			};
		},
		onLoad(options = {}) {
			this.init(options);
		},
		onShow() {
			this.loadListData(true);
		},
		methods: {
			/* ---------- 工具方法 ---------- */
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
					next_node_keys: node.next_node_keys || node.nextNodes || [],
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
					...rawData,
				};
			},
			filePreviewClose() {
				this.filePreview.show = false;
			},
			closeFormDialog() {
				this.formDialog.show = false;
			},
			getClothesSummary(items) {
				if (!items || !Array.isArray(items) || items.length === 0) {
					return '暂无领取明细';
				}
				return `${items.length}人`;
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
					approved: '已通过',
				};
				return map[status] || status;
			},
			formatDate(timestamp, formatStr) {
				if (!timestamp) return '-';
				return vk.pubfn.timeFormat(timestamp, formatStr || 'yyyy-MM-dd hh:mm:ss');
			},

			/* ---------- 初始化 ---------- */
			async init() {
				try {
					this.loading = true;
					await this.loadFormTypes();
					await this.getFormTypeSchema();
					if (!this.formSchema) this.useDefaultFormSchema();
					await this.loadListData();
				} catch (e) {
					console.error('初始化失败:', e);
					this.useDefaultFormSchema();
				} finally {
					this.loading = false;
				}
			},
			async loadFormTypes() {
				const res = await vk.callFunction({
					url: 'admin/bpmn/form-type/sys/getList',
					data: {
						status: 'active',
						pageIndex: 1,
						pageSize: -1
					},
				});
				if (res.code === 0 && res.rows) {
					const configs = {};
					res.rows.forEach((ft) => (configs[ft.code] = ft));
					this.formTypeConfigs = configs;
				}
			},
			async getFormTypeSchema() {
				const formType = this.formTypeConfigs[this.formTypeCode];
				if (formType?.form_schema) {
					this.formSchema = JSON.parse(formType.form_schema);
				} else {
					// 如果没有从缓存获取到，尝试从服务器获取
					const res = await vk.callFunction({
						url: 'admin/bpmn/form-type/sys/getList',
						data: {
							code: this.formTypeCode,
							status: 'active'
						},
					});
					if (res.code === 0 && res.rows && res.rows.length > 0) {
						const ft = res.rows[0];
						this.formSchema = ft.form_schema ? JSON.parse(ft.form_schema) : null;
					}
				}
			},
			useDefaultFormSchema() {
				// 工衣申请默认表单配置（根据提供的 schema）
				this.formSchema = {
					fields: [{
						name: "clothes_title",
						label: "申请标题",
						type: "text",
						required: true,
						placeholder: "如：夏季工衣领取申请",
						defaultValue: ""
					}, {
						name: "items",
						label: "领取明细",
						type: "array<object>",
						itemFormat: "${name} × ${quantity}件：${remark}",
						required: true,
						showAdd: true,
						showClear: true,
						showSort: false,
						itemWidth: 600,
						columnIndexWidth: 50,
						defaultValue: {
							name: "",
							quantity: 1,
							remark: ""
						},
						rightBtns: [{
							mode: "copy",
							title: "复制",
							showWhen: {
								batchGenerated: false
							}
						}, {
							mode: "delete",
							title: "删除",
							showWhen: {
								batchGenerated: false
							}
						}],
						columns: [{
							key: "name",
							title: "姓名",
							type: "text",
							width: 150,
							required: true,
							isUnique: true,
							placeholder: "请输入姓名",
							rules: [{
								required: true,
								message: "姓名不能为空",
								trigger: ["blur", "change"]
							}]
						}, {
							key: "quantity",
							title: "件数",
							type: "number",
							width: 150,
							min: 1,
							step: 1,
							defaultValue: 1,
							placeholder: "请输入件数",
							rules: [{
								required: true,
								message: "件数不能为空",
								trigger: ["blur", "change"]
							}, {
								min: 1,
								message: "件数至少为1",
								trigger: ["blur", "change"]
							}]
						}, {
							key: "remark",
							title: "说明（尺码、颜色及类型）",
							type: "textarea",
							width: 350,
							rows: 3,
							maxLength: 500,
							rules: [{
								required: true,
								message: "说明不能为空",
								trigger: ["blur", "change"]
							}]
						}]
					}, {
						name: "total_quantity",
						label: "总件数",
						type: "number",
						disabled: true,
						defaultValue: 0,
						tip: "明细中件数之和"
					}, {
						name: "reason",
						label: "申请事由",
						type: "textarea",
						required: true,
						placeholder: "请说明领取工衣的原因（如：新员工入职、工衣破损更换等）",
						rows: 4,
						maxLength: 500,
						rules: [{
							required: true,
							message: "申请事由不能为空",
							trigger: ["blur", "change"]
						}]
					}, {
						name: "remarks",
						label: "备注",
						type: "textarea",
						required: false,
						placeholder: "其他需要说明的事项",
						rows: 3,
						maxLength: 500,
						defaultValue: ""
					}, {
						name: "file_attachments",
						label: "相关附件",
						type: "file",
						required: false,
						multiple: true,
						accept: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png",
						maxSize: 10,
						maxCount: 10,
						description: "支持上传人员名单、更换申请等文档"
					}],
					layout: {
						type: "grid",
						columns: 2,
						groups: [{
							title: "基本信息",
							fields: ["clothes_title", "total_quantity"]
						}, {
							title: "领取明细",
							fields: ["items"],
							fullWidth: true
						}, {
							title: "申请事由",
							fields: ["reason"],
							fullWidth: true
						}, {
							title: "备注与附件",
							fields: ["remarks", "file_attachments"],
							fullWidth: true
						}]
					},
					validation: {
						rules: {
							items: {
								minRows: 1,
								message: "至少需要添加一条明细"
							}
						}
					}
				};
			},

			/* ---------- 数据加载 ---------- */
			async loadListData(reset = true) {
				if (reset) {
					this.pagination.pageIndex = 1;
					this.hasMore = true;
					this.loadMoreStatus = 'loadmore';
				}
				const params = {
					pageIndex: this.pagination.pageIndex,
					pageSize: this.pagination.pageSize,
					...this.queryForm1.formData,
				};
				const res = await vk.callFunction({
					url: 'client/bpmn/application-form/sys/getList',
					data: params,
				});
				if (res.code === 0) {
					const data = res.rows || [];
					if (reset) {
						this.tableData = data;
					} else {
						this.tableData = [...this.tableData, ...data];
					}
					this.pagination.total = res.total || 0;
					this.countStats();
					this.hasMore = data.length >= this.pagination.pageSize;
					this.loadMoreStatus = this.hasMore ? 'loadmore' : 'nomore';
				}
				this.loading = false;
				this.refreshing = false;
				uni.stopPullDownRefresh();
			},
			countStats() {
				this.totalCount = this.tableData.length;
				this.draftCount = this.tableData.filter((i) => i.status === 'draft').length;
				this.pendingCount = this.tableData.filter((i) => i.status === 'pending').length;
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

			/* ---------- 筛选 ---------- */
			getStatusTitle() {
				const v = this.queryForm1.formData.status;
				if (!v) return '全部状态';
				return this.statusOptions.find((o) => o.value === v)?.label || '状态';
			},
			handleStatusChange(status) {
				this.queryForm1.formData.status = status;
				this.loadListData(true);
			},

			/* ---------- 权限判断 ---------- */
			canEdit(item) {
				const uid = vk.getVuex('$user.userInfo')?.username;
				return item.status === 'draft' && item.applicant_id === uid;
			},
			canDelete(item) {
				return this.canEdit(item);
			},

			/* ---------- 操作 ---------- */
			addBtn() {
				if (!this.formSchema) {
					uni.showToast({
						title: '表单配置加载中',
						icon: 'none'
					});
					return;
				}
				this.formDialog = {
					show: true,
					title: '新建工衣申请',
					data: {
						form_type_code: this.formTypeCode,
						form_data: {}
					},
				};
			},
			handleEdit(item) {
				console.log(item);
				const formData = {
					...item
				};
				if (item.form_data) {
					Object.keys(item.form_data).forEach((k) => (formData[k] = item.form_data[k]));
				}
				this.formDialog = {
					show: true,
					title: '编辑工衣申请',
					data: formData
				};
			},
			handleDelete(item) {
				this.deleteDialog.data = item;
				this.deleteDialog.show = true;
			},
			async confirmDelete() {
				const item = this.deleteDialog.data;
				const res = await vk.callFunction({
					url: 'admin/bpmn/application-form/sys/delete',
					data: {
						id: item._id
					},
				});

				// 删除附件
				item.form_data?.file_attachments.map(async (e, index) => {
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
				this.deleteDialog.show = false;
			},
			cancelDelete() {
				this.deleteDialog.show = false;
			},

			/* ---------- 表单保存/提交/试算 ---------- */
			async handleFormSave(formData) {
				formData._id = formData._id ? formData._id : this.formDialog.data._id;
				this.saveFormLoading = true;
				try {
					let url = "admin/bpmn/application-form/sys/add";
					if (formData._id) {
						url = "admin/bpmn/application-form/sys/update";
					}

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

					// 计算工衣总件数
					let totalQuantity = formData.total_quantity;
					if (formData.form_data?.items && Array.isArray(formData.form_data.items)) {
						totalQuantity = formData.form_data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
					}
					// 也可从 total_quantity 字段获取，但确保一致性
					const calculatedValues = {
						total_quantity: totalQuantity,
					};

					const title = formData.form_data?.clothes_title || `${userInfo?.username || '用户'}的工衣申请`;

					const submitData = {
						...formData,
						calculated_values: calculatedValues,
						userInfo,
						title,
					};

					if (formData._id) {
						submitData._id = formData._id;
						submitData.status = 'pending';
					}

					const res = await vk.callFunction({
						url: 'admin/bpmn/application-form/pub/submit',
						data: submitData,
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
				} catch (e) {
					console.error('提交失败:', e);
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

					let totalQuantity = 0;
					if (formData.form_data?.items && Array.isArray(formData.form_data.items)) {
						totalQuantity = formData.form_data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
					}

					const calculatedValues = {
						total_quantity: totalQuantity,
					};

					const simulateData = {
						form_type_code: this.formTypeCode,
						form_data: formData.form_data,
						calculated_values: calculatedValues,
						process_definition_key: 'WORK_CLOTHES_APPLICATION', // 根据实际流程定义 key 调整
						userInfo,
					};

					const res = await vk.callFunction({
						url: 'admin/bpmn/process-engine/pub/simulate',
						data: simulateData,
					});

					if (res.code === 0) {
						const result = this.normalizeSimulateData(res.data);
						this.showSimulateResult(result);
					} else {
						uni.showToast({
							title: res.msg || '试算失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error('试算失败:', e);
					uni.showToast({
						title: '试算失败',
						icon: 'none'
					});
				} finally {
					this.simulateFormLoading = false;
				}
			},
			showSimulateResult(result) {
				this.simulateDialog.data = result;
				this.simulateDialog.show = true;
			},
			submitAfterSimulate() {
				this.simulateDialog.show = false;
				this.handleFormSubmit(this.formDialog.data);
			},

			/* ---------- 详情 ---------- */
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
							userInfo,
							orderBy: 'sequence asc',
						},
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
							},
						});
						if (instanceRes.code === 0 && instanceRes.rows?.length > 0) {
							this.processInfo.instance = instanceRes.rows[0];
						}
					}
				} catch (e) {
					console.error('加载审批流程失败:', e);
				}
			},
			async loadStatusHistory(item) {
				try {
					this.statusHistory = [{
						action: 'create',
						operation_time: item._add_time,
						operator_name: item.applicant_name,
						comment: '创建工衣申请',
						task_name: '申请创建',
					}, ];
					const historyRes = await vk.callFunction({
						url: 'admin/bpmn/task-history/sys/getList',
						data: {
							formData: {
								application_id: item._id,
								action: 'create'
							},
							orderBy: 'operation_time asc',
						},
					});
					if (historyRes.code === 0 && historyRes.rows) {
						historyRes.rows.forEach((history) => {
							this.statusHistory.push({
								action: history.action,
								operation_time: history.operation_time,
								operator_name: history.operator_name,
								comment: history.comment,
								task_name: this.getTaskNameFromHistory(history),
							});
						});
					}
					this.statusHistory.sort((a, b) => a.operation_time - b.operation_time);
				} catch (e) {
					console.error('加载状态历史失败:', e);
				}
			},
			getTaskNameFromHistory(history) {
				if (history.task_data?.node_info) return history.task_data.node_info.node_name;
				if (history.task_snapshot) return history.task_snapshot.task_name;
				return '任务处理';
			},

			/* ---------- 文件 ---------- */
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
					name: file.name || '未命名文件',
					type: this.getFileType(file),
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
				uni.downloadFile({
					url: file.url,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveFile({
								tempFilePath: res.tempFilePath,
								success: () => uni.showToast({
									title: '下载成功',
									icon: 'success'
								}),
								fail: (err) => uni.showToast({
									title: '保存失败',
									icon: 'none'
								}),
							});
						} else {
							uni.showToast({
								title: '下载失败',
								icon: 'none'
							});
						}
					},
					fail: () => uni.showToast({
						title: '下载失败',
						icon: 'none'
					}),
				});
			},
			getFileType(file) {
				if (!file) return 'unknown';
				const name = file.name || '';
				const type = file.type || '';
				if (type.includes('pdf') || /\.pdf$/i.test(name)) return 'pdf';
				if (type.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name)) return 'image';
				if (type.includes('text') || /\.(txt|md)$/i.test(name)) return 'text';
				return 'other';
			},
		},
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
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
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
				letter-spacing: 1rpx;
			}
		}

		.form-content,
		.detail-content {
			height: calc(90vh - 100rpx);
			padding: 24rpx;

			::v-deep .vk-data-form .bar-title {
				font-size: 28rpx !important;
				font-weight: 600 !important;
				color: #333 !important;
				background-color: #f5f7fa !important;
				padding: 16rpx 20rpx !important;
				border-radius: 8rpx !important;
				margin: 24rpx 0 16rpx !important;
				border-left: 4rpx solid #2979ff !important;
			}

			::v-deep .el-form-item__label,
			::v-deep .u-form-item__body__left__content__label {
				font-size: 28rpx !important;
				font-weight: 600 !important;
				color: #333333 !important;
			}

			::v-deep .el-form-item,
			::v-deep .u-form-item {
				margin-bottom: 24rpx !important;
				padding: 0 4rpx;
			}

			::v-deep .el-input,
			::v-deep .u-input {
				width: 100% !important;
			}

			.form-loading {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 60rpx 0;

				.loading-text {
					margin-top: 20rpx;
					color: #999;
				}
			}
		}
	}
</style>