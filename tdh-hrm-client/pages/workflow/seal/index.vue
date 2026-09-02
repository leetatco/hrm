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
								<text class="item-title">{{ item.form_data?.file_name || '未命名文件' }}</text>
							</view>
							<u-tag :type="getStatusTagType(item.status)" size="mini" :border="false" class="status-tag">
								{{ getStatusText(item.status) }}
							</u-tag>
						</view>

						<view class="item-content">
							<view class="info-grid">
								<view class="info-item">
									<text class="info-label">用印类型</text>
									<text
										class="info-value">{{ getFieldOptionLabel('seal_type', item.form_data?.seal_type) }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">文件类型</text>
									<text
										class="info-value">{{ getFieldOptionLabel('file_type', item.form_data?.file_type) }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">份数</text>
									<text class="info-value">{{ item.form_data?.copies || 1 }} 份</text>
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
						<u-empty mode="data" icon="/static/empty.png" text="暂无申请记录">
							<u-button type="primary" shape="circle" @click="addBtn" :customStyle="buttonStyle.primary">
								立即新建
							</u-button>
						</u-empty>
					</view>

					<!-- 加载更多 -->
					<view class="load-more" v-if="hasMore && tableData.length > 0">
						<u-loadmore :status="loadMoreStatus" :load-text="loadText" @loadmore="loadMore" />
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 动态表单弹窗（保持不变，仅调整样式） -->
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

		<!-- 其余弹窗保持不变，仅微调样式 -->
		<u-popup v-model="simulateDialog.show" :mode="popupStyle.mode" :closeable="true"
			:border-radius="popupStyle.border_radius" :height="popupStyle.height">
			<simulate-handle-dialog :simulate-data="simulateDialog.data" />
		</u-popup>

		<u-popup v-model="detailDialog.show" :mode="popupStyle.mode" :closeable="true"
			:border-radius="popupStyle.border_radius" :height="popupStyle.height">
			<view class="detail-dialog">
				<view class="detail-header">
					<text class="detail-title">用印申请详情</text>
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
		name: 'SealApply',
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
				// 加载状态
				loading: true,
				refreshing: false,
				// 按钮加载状态
				addLoading: false,
				saveFormLoading: false,
				submitFormLoading: false,
				simulateFormLoading: false,
				// 表单配置
				formSchema: null,
				formTypeCode: 'SEAL_APPLY',
				formTypeConfigs: {},
				// 列表数据
				tableData: [],
				totalCount: 0,
				draftCount: 0,
				pendingCount: 0,
				// 分页
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
				// 状态筛选
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
				// 查询表单
				queryForm1: {
					formData: {
						form_type_code: "SEAL_APPLY",
						status: ""
					}
				},
				// 弹窗相关
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
					title: '用印申请详情',
					currentTasks: [],
					data: null
				},
				deleteDialog: {
					show: false,
					content: '确定删除该用印申请吗？',
					data: null
				},
				// 审批流程
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
				// 提取节点数组（兼容多种字段名）
				let nodes = rawData.nodes || rawData.data?.nodes || rawData.process?.nodes || rawData.steps || rawData
					.tasks;
				if (!Array.isArray(nodes)) nodes = [];

				// 标准化每个节点
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

				// 处理预估时长
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
					...rawData // 保留其他原始字段
				};
			},
			filePreviewClose() {
				this.filePreview.show = false;
			},
			// 关闭表单弹窗
			closeFormDialog() {
				this.formDialog.show = false;
			},
			async init(options) {
				try {
					this.loading = true;
					// 先尝试加载表单配置
					await this.loadFormTypes();
					await this.getFormTypeSchema();

					// 如果表单配置加载失败，使用备用表单
					if (!this.formSchema) {
						console.warn('表单配置加载失败，使用备用表单');
						this.useDefaultFormSchema();
					}

					// 加载列表数据
					await this.loadListData();
				} catch (error) {
					console.error('初始化失败:', error);
					// 即使失败也使用备用表单
					this.useDefaultFormSchema();
				} finally {
					this.loading = false;
				}
			},

			// 加载表单类型
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

					console.log('加载表单类型结果:', res);

					if (res.code === 0 && res.rows) {
						const configs = {};
						res.rows.forEach(formType => {
							configs[formType.code] = formType;
						});
						this.formTypeConfigs = configs;
						console.log('表单类型配置已加载:', Object.keys(configs));
					} else {
						console.error('加载表单类型失败:', res.msg);
					}
				} catch (error) {
					console.error('加载表单类型失败:', error);
				}
			},

			// 获取表单schema - 优化版本
			async getFormTypeSchema() {
				try {
					// 方法1: 尝试直接获取表单配置
					const res = await vk.callFunction({
						url: 'admin/bpmn/form-type/sys/getList',
						data: {
							code: this.formTypeCode,
							status: 'active'
						}
					});

					if (res.code === 0 && res.rows && res.rows.length > 0) {
						const formType = res.rows[0];
						console.log('直接获取表单类型成功:', formType);

						if (formType.form_schema) {
							try {
								this.formSchema = JSON.parse(formType.form_schema);
								console.log('表单schema解析成功');
								return;
							} catch (parseError) {
								console.error('表单schema解析失败:', parseError);
							}
						}
					}

					// 方法2: 从已加载的配置中获取
					if (this.formTypeConfigs[this.formTypeCode]) {
						const formType = this.formTypeConfigs[this.formTypeCode];
						if (formType.form_schema) {
							try {
								this.formSchema = JSON.parse(formType.form_schema);
								console.log('从缓存获取表单schema成功');
								return;
							} catch (parseError) {
								console.error('表单schema解析失败:', parseError);
							}
						}
					}

					// 方法3: 使用默认表单
					console.warn('无法加载表单配置，使用默认表单');
					this.useDefaultFormSchema();

				} catch (error) {
					console.error('获取表单schema失败:', error);
					this.useDefaultFormSchema();
				}
			},

			// 使用默认表单配置
			useDefaultFormSchema() {
				this.formSchema = {
					fields: [{
							name: "file_name",
							label: "文件名称",
							type: "text",
							required: true,
							placeholder: "请输入文件名称",
							rules: [{
								required: true,
								message: "请输入文件名称"
							}]
						},
						{
							name: "seal_type",
							label: "用印类型",
							type: "select",
							required: true,
							placeholder: "请选择用印类型",
							options: [{
									value: "company_seal",
									label: "公司印章"
								},
								{
									value: "finance_seal",
									label: "财务印章"
								},
								{
									value: "contract_seal",
									label: "合同专用章"
								},
								{
									value: "legal_seal",
									label: "法人章"
								}
							],
							rules: [{
								required: true,
								message: "请选择用印类型"
							}]
						},
						{
							name: "file_type",
							label: "文件类型",
							type: "select",
							required: true,
							placeholder: "请选择文件类型",
							options: [{
									value: "contract",
									label: "合同"
								},
								{
									value: "certificate",
									label: "证明文件"
								},
								{
									value: "report",
									label: "报告"
								},
								{
									value: "agreement",
									label: "协议"
								},
								{
									value: "other",
									label: "其他"
								}
							],
							rules: [{
								required: true,
								message: "请选择文件类型"
							}]
						},
						{
							name: "copies",
							label: "份数",
							type: "number",
							required: true,
							placeholder: "请输入份数",
							min: 1,
							max: 100,
							rules: [{
									required: true,
									message: "请输入份数"
								},
								{
									type: 'number',
									min: 1,
									message: "份数必须大于0"
								}
							]
						},
						{
							name: "remark",
							label: "备注",
							type: "textarea",
							placeholder: "请输入备注信息（可选）",
							rows: 3
						}
					]
				};
				console.log('已使用默认表单配置');
			},

			// 加载列表数据
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

						// 统计各种状态的数量
						this.draftCount = this.tableData.filter(item => item.status === 'draft').length;
						this.pendingCount = this.tableData.filter(item => item.status === 'pending').length;

						// 判断是否还有更多数据
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

			// 下拉刷新
			onPullDownRefresh() {
				this.refreshing = true;
				this.loadListData(true);
			},

			// 加载更多
			loadMore() {
				if (!this.hasMore || this.loadMoreStatus === 'loading' || this.loading) {
					return;
				}

				this.loadMoreStatus = 'loading';
				this.pagination.pageIndex++;
				this.loadListData(false);
			},

			// 获取状态标题
			getStatusTitle() {
				const status = this.queryForm1.formData.status;
				if (!status) return '全部状态';
				const option = this.statusOptions.find(opt => opt.value === status);
				return option ? option.label : '状态';
			},

			// 状态筛选变化
			handleStatusChange(status) {
				this.queryForm1.formData.status = status;
				this.loadListData(true);
			},

			// 获取状态标签类型
			getStatusTagType(status) {
				switch (status) {
					case 'draft':
						return 'info';
					case 'pending':
						return 'warning';
					case 'rejected':
						return 'error';
					case 'withdrawn':
						return 'default';
					case 'approved':
						return 'success';
					default:
						return 'default';
				}
			},

			// 获取状态文本
			getStatusText(status) {
				switch (status) {
					case 'draft':
						return '草稿';
					case 'pending':
						return '待处理';
					case 'rejected':
						return '已驳回';
					case 'withdrawn':
						return '已撤回';
					case 'approved':
						return '已通过';
					default:
						return status;
				}
			},

			// 判断是否可以编辑
			canEdit(item) {
				const userInfo = vk.getVuex('$user.userInfo');
				return item.status === 'draft' && item.applicant_id === (userInfo?.username || userInfo?.user_id);
			},

			// 判断是否可以删除
			canDelete(item) {
				const userInfo = vk.getVuex('$user.userInfo');
				return item.status === 'draft' && item.applicant_id === (userInfo?.username || userInfo?.user_id);
			},

			// 处理编辑
			handleEdit(item) {
				this.updateBtn({
					item
				});
			},

			// 处理删除
			handleDelete(item) {
				this.deleteDialog.data = item;
				this.deleteDialog.show = true;
			},

			// 确认删除
			async confirmDelete() {
				const item = this.deleteDialog.data;
				if (!item) return;
				// console.log(item);
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/application-form/sys/delete',
						data: {
							id: item._id
						}
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

			// 取消删除
			cancelDelete() {
				this.deleteDialog.show = false;
			},

			// 新建按钮 - 优化版本
			addBtn() {
				// 确保表单schema已加载
				if (!this.formSchema) {
					console.warn('表单schema未加载，尝试重新加载');
					this.loadFormSchemaAndOpenDialog();
					return;
				}

				this.openFormDialog();
			},

			// 加载表单schema并打开对话框
			async loadFormSchemaAndOpenDialog() {
				this.addLoading = true;
				try {
					await this.getFormTypeSchema();

					if (this.formSchema) {
						this.openFormDialog();
					} else {
						uni.showToast({
							title: '表单配置加载失败，请稍后重试',
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

			// 打开表单对话框
			openFormDialog() {
				this.formDialog = {
					show: true,
					title: '新建用印申请',
					data: {
						form_type_code: this.formTypeCode,
						form_data: {}
					}
				};
				console.log('打开表单对话框，formSchema:', this.formSchema);
			},

			// 编辑按钮
			updateBtn({
				item
			}) {
				if (!this.formSchema) {
					uni.showToast({
						title: '表单配置加载中，请稍后重试',
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
					title: '编辑用印申请',
					data: formData
				};
			},

			// 刷新按钮
			refresh() {
				this.loadListData(true);
			},

			// 显示详情
			async showDetail(item) {
				this.detailDialog.data = item;
				await this.loadProcessFlow(item);
				await this.loadStatusHistory(item);

				// console.log("item:", item, this.formTypeConfigs);

				this.detailDialog.show = true;
			},

			// 加载审批流程
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

			// 加载审批历史
			async loadStatusHistory(item) {
				try {
					this.statusHistory = [];

					this.statusHistory.push({
						action: 'create',
						operation_time: item._add_time,
						operator_name: item.applicant_name,
						comment: '创建用印申请',
						task_name: '申请创建'
					});

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
				if (history.task_data?.node_info) {
					return history.task_data.node_info.node_name;
				}
				if (history.task_snapshot) {
					return history.task_snapshot.task_name;
				}
				return '任务处理';
			},

			// 表单保存
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

			// 表单提交
			async handleFormSubmit(formData) {
				formData._id = formData._id ? formData._id : this.formDialog.data._id;
				this.submitFormLoading = true;
				try {
					const userInfo = vk.getVuex('$user.userInfo');
					const calculatedValues = {
						file_count: 1,
						total_pages: formData.form_data?.copies || 1
					};

					const title =
						`${userInfo?.username || '用户'}的${this.getFieldOptionLabel('seal_type', formData.form_data?.seal_type)}用印申请`;

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

			// 试算流程
			async handleSimulate(formData) {
				this.simulateFormLoading = true;
				try {
					const userInfo = vk.getVuex('$user.userInfo');
					const calculatedValues = {
						file_count: 1,
						total_pages: formData.form_data?.copies || 1
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
						// 处理数据结构，可能数据在 res.data.data 中
						let simulateResult = res.data;
						if (res.data && res.data.data) {
							simulateResult = res.data.data;
						}
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

			// 显示试算结果
			showSimulateResult(result) {
				const normalizedData = this.normalizeSimulateData(result);
				console.log('标准化后数据:', normalizedData);
				if (!normalizedData.nodes.length) {
					uni.showToast({
						title: '试算结果格式异常',
						icon: 'none'
					});
				}
				this.simulateDialog.data = normalizedData;
				this.simulateDialog.show = true;
			},

			// 确认提交申请
			submitAfterSimulate() {
				this.simulateDialog.show = false;
				this.handleFormSubmit(this.formDialog.data);
			},

			// 获取字段选项标签
			getFieldOptionLabel(fieldName, value) {
				if (!this.formSchema?.fields) return value;
				const field = this.formSchema.fields.find(f => f.name === fieldName);
				if (!field?.options) return value;
				const option = field.options.find(opt => opt.value === value);
				return option ? option.label : value;
			},

			// 格式化日期
			formatDate(timestamp, formatStr) {
				if (!timestamp) return '-';
				return vk.pubfn.timeFormat(timestamp, formatStr || 'yyyy-MM-dd hh:mm:ss');
			},

			// 文件预览
			previewFile(file) {
				console.log(file)
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

			// 下载文件			
			downloadFile(file) {
				if (!file?.url) {
					uni.showToast({
						title: '文件地址无效',
						icon: 'none'
					});
					return;
				}

				// 真实下载逻辑
				uni.showLoading({
					title: '准备下载'
				});

				uni.downloadFile({
					url: file.url,
					success: (res) => {
						if (res.statusCode === 200) {
							// 保存到本地
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
							title: '下载失败: ' + (err.errMsg || '网络错误'),
							icon: 'none',
							duration: 3000
						});
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			},

			// 获取文件类型
			getFileType(file) {
				if (!file) return 'unknown';
				const name = file.name || '';
				const type = file.type || '';

				if (type.includes('pdf') || name.toLowerCase().endsWith('.pdf')) {
					return 'pdf';
				} else if (type.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name)) {
					return 'image';
				} else if (type.includes('text') || /\.(txt|md)$/i.test(name)) {
					return 'text';
				} else {
					return 'other';
				}
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

			.add-button-wrapper {}
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

				.empty-btn {
					margin-top: 40rpx;
					width: 240rpx;
					height: 80rpx;
					border-radius: 40rpx;
					background: linear-gradient(135deg, #2979ff 0%, #1e6ae0 100%);
					border: none;
					font-size: 28rpx;
					font-weight: 500;
				}
			}
		}
	}

	/* 弹窗样式优化 */
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
				letter-spacing: 0.5px;
			}
		}

		.form-content,
		.detail-content {
			max-height: 70vh;
			padding: 24rpx;
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

			.add-button-wrapper .add-btn {
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

			.item-actions .action-btn {
				min-width: 100rpx;
				height: 56rpx;
				font-size: 22rpx;
			}
		}
	}
</style>