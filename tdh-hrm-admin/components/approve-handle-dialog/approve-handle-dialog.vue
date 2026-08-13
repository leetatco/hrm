<template>
	<vk-data-dialog v-model="show" :title="title" width="900px">
		<!-- 使用 ApproveHeaderDetail 组件 -->
		<approve-header-detail :detail-data="application" :form-schema="formSchema" :process-info="processInfo"
			:status-history="approvalHistory" :show-basic-info="true" :show-return-info="false"
			:show-approval-flow="true" :show-current-task="false" :show-handle-form="false" :basic-info-title="'基本信息'"
			:form-info-title="'申请信息'" :form-type-configs="formTypeConfigs" @preview-file="handlePreviewFile"
			@download-file="handleDownloadFile" />

		<!-- 当前任务信息 -->
		<view class="detail-section" v-if="task">
			<view class="section-title">当前任务</view>
			<view class="info-grid">
				<view class="info-item">
					<view class="info-label">任务名称：</view>
					<view class="info-value">
						<el-tag type="warning">{{ task.task_name }}</el-tag>
					</view>
				</view>
				<view class="info-item">
					<view class="info-label">到达时间：</view>
					<view class="info-value">{{ formatDate(task._add_time) }}</view>
				</view>
				<view class="info-item">
					<view class="info-label">截止时间：</view>
					<view class="info-value">
						<span :class="{'text-danger': isTaskOverdue(task)}">
							{{ formatDate(task.due_date) }}
						</span>
					</view>
				</view>
				<view class="info-item">
					<view class="info-label">处理人：</view>
					<view class="info-value">
						{{ task.assignee_name || task.assignee }}
					</view>
				</view>
			</view>
		</view>

		<!-- 审批操作表单 -->
		<view class="detail-section">
			<view class="section-title">审批操作</view>
			<el-form :model="approveForm" :rules="approveRules" ref="approveFormRef" label-width="100px">
				<el-form-item label="操作类型" prop="action" required>
					<el-radio-group v-model="approveForm.action" @change="onActionChange">
						<el-radio v-for="opt in operationOptions" :key="opt.value"
							:label="opt.value">{{ opt.label }}</el-radio>
					</el-radio-group>
				</el-form-item>

				<el-form-item label="审批意见" prop="comment"
					:required="!['approve', 'confirm', 'add_sign'].includes(this.approveForm.action)">
					<el-input v-model="approveForm.comment" type="textarea" :rows="4"
						:placeholder="getCommentPlaceholder()" maxlength="500" show-word-limit />
				</el-form-item>

				<!-- 转办人员：仅当当前操作为转办且节点允许转办时显示 -->
				<el-form-item label="转办人员" v-if="showTransferField" prop="transfer_user" required>
					<vk-data-input-table-select v-model="approveForm.transfer_user"
						action="admin/hrm/employees/sys/getList" placeholder="请选择转办人员" :columns="[
              { key:'employee_name', title:'姓名', type:'text', nameKey:true },
              { key:'employee_id', title:'工号', type:'text', idKey:true }
            ]" />
					<div class="form-tip">转办后，被转办人将取代您成为新的审核者</div>
				</el-form-item>

				<el-form-item label="加签人员" v-if="showAddSignField" prop="add_sign_user" required>
					<vk-data-input-table-select v-model="approveForm.add_sign_user"
						action="admin/hrm/employees/sys/getList" placeholder="请选择加签人员" :columns="[
				      { key:'employee_name', title:'姓名', type:'text', nameKey:true },
				      { key:'employee_id', title:'工号', type:'text', idKey:true }
				    ]" />
					<div class="form-tip">加签后，被加签人处理完成后需您再次处理</div>
				</el-form-item>
			</el-form>
		</view>

		<template v-slot:footer>
			<el-button @click="handleClose">取消</el-button>
			<el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
		</template>
	</vk-data-dialog>
</template>

<script>
	import ApproveHeaderDetail from '@/components/approve-header-detail/approve-header-detail.vue';

	export default {
		name: 'ApproveHandleDialog',
		components: {
			ApproveHeaderDetail
		},
		props: {
			value: {
				type: Boolean,
				default: false
			},
			title: {
				type: String,
				default: '审批处理'
			},
			task: {
				type: Object,
				default: null
			},
			application: {
				type: Object,
				default: null
			},
			formSchema: {
				type: Object,
				default: null
			},
			processInfo: {
				type: Object,
				default: () => ({
					tasks: [],
					instance: null
				})
			},
			approvalHistory: {
				type: Array,
				default: () => []
			},
			formTypeConfigs: {
				type: Object,
				default: () => ({})
			},
			showAddSignOption: {
				type: Boolean,
				default: false
			},
			loading: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				approveForm: {
					action: 'approve',
					comment: '',
					transfer_user: '',
					add_sign_user: '' // 改为单个用户
				},
				approveRules: {
					action: [{
						required: true,
						message: "请选择审批操作",
						trigger: ['blur', 'change']
					}],
					comment: [{
						validator: (rule, value, callback) => {
							if (!['approve', 'confirm', 'add_sign'].includes(this.approveForm.action) && !
								value) {
								callback(new Error("必须填写审批意见"));
							} else {
								callback();
							}
						},
						trigger: ['blur', 'change']
					}],
					transfer_user: [{
						validator: (rule, value, callback) => {
							if (this.approveForm.action === 'transfer' && !value) {
								callback(new Error("请选择转办人员"));
							} else {
								callback();
							}
						},
						trigger: ['blur', 'change']
					}],
					add_sign_user: [{
						validator: (rule, value, callback) => {
							if (this.approveForm.action === 'add_sign' && !value) {
								callback(new Error("请选择加签人员"));
							} else {
								callback();
							}
						},
						trigger: ['blur', 'change']
					}]
				},
				userOptions: [],
				searchLoading: false
			};
		},
		computed: {
			show: {
				get() {
					return this.value;
				},
				set(val) {
					this.$emit('input', val);
				}
			},
			allowedActions() {
				if (this.task && Array.isArray(this.task.actions)) return this.task.actions;
				if (this.task?.node_info?.actions) return this.task.node_info.actions;
				return ['approve'];
			},
			operationOptions() {
				const map = {
					approve: {
						label: '同意',
						value: 'approve'
					},
					reject: {
						label: '驳回',
						value: 'reject'
					},
					return: {
						label: '退回',
						value: 'return'
					},
					transfer: {
						label: '转办',
						value: 'transfer'
					},
					add_sign: {
						label: '加签',
						value: 'add_sign'
					},
					add_sign_complete: {
						label: '加签完成',
						value: 'add_sign_complete'
					}, // ← 新增
					confirm: {
						label: '确认',
						value: 'confirm'
					}
				};
				return this.allowedActions.filter(a => map[a]).map(a => map[a]);
			},
			showTransferField() {
				return this.approveForm.action === 'transfer' && this.allowedActions.includes('transfer');
			},
			showAddSignField() {
				// 当操作为“加签”时，或操作为“同意”且父组件允许加签时，显示加签人员选择
				return this.approveForm.action === 'add_sign' ||
					(this.approveForm.action === 'approve' && this.showAddSignOption);
			}
		},
		watch: {
			value(newVal) {
				if (newVal) {
					this.resetForm();
					if (!this.allowedActions.includes(this.approveForm.action)) {
						this.approveForm.action = this.operationOptions[0]?.value || 'approve';
					}
				}
			}
		},
		methods: {
			handleClose() {
				this.show = false;
			},
			handlePreviewFile(file) {
				this.$emit('preview-file', file);
			},
			handleDownloadFile(file) {
				this.$emit('download-file', file);
			},
			onActionChange(action) {
				if (action === 'approve' && this.task?.allow_add_sign) {
					this.$emit('update:showAddSignOption', true);
				} else {
					this.$emit('update:showAddSignOption', false);
				}
				this.$emit('action-change', action);
			},
			// 远程搜索用户
			async searchAddSignUsers(query) {
				if (!query) {
					this.userOptions = [];
					return;
				}
				this.searchLoading = true;
				try {
					const res = await uni.vk.callFunction({
						url: 'admin/system/user/sys/getList', // 或你的用户查询接口
						data: {
							pageIndex: 1,
							pageSize: 20,
							formData: {
								nickname: query
							},
							orderBy: 'username asc'
						}
					});
					if (res.code === 0) {
						this.userOptions = res.rows;
					} else {
						this.userOptions = [];
					}
				} catch (e) {
					console.error('搜索用户失败:', e);
				} finally {
					this.searchLoading = false;
				}
			},
			async handleSubmit() {
				try {
					await this.$refs.approveFormRef.validate();

					const submitData = {
						task_id: this.task._id,
						action: this.approveForm.action,
						comment: this.approveForm.comment,
						transfer_user: this.approveForm.transfer_user || this.approveForm
							.add_sign_user, // 转办/加签共用 transfer_user
						applicationData: this.application
					};

					console.log("submitData:", submitData);

					this.$emit('submit', submitData);
				} catch (error) {
					console.error('表单验证失败:', error);
				}
			},
			resetForm() {
				this.approveForm = {
					action: 'approve',
					comment: '',
					transfer_user: '',
					add_sign_user: ''
				};
				this.userOptions = [];
				if (this.$refs.approveFormRef) this.$refs.approveFormRef.clearValidate();
			},
			getCommentPlaceholder() {
				switch (this.approveForm.action) {
					case 'approve':
						return '同意时可选填审批意见';
					case 'reject':
						return '请填写驳回理由';
					case 'return':
						return '请填写退回原因';
					case 'transfer':
						return '请填写转办说明';
					case 'add_sign':
						return '请填写加签说明';
					case 'confirm':
						return '确认时可选填意见'; // 新增
					default:
						return '请输入审批意见';
				}
			},
			isTaskOverdue(task) {
				if (!task?.due_date) return false;
				return new Date(task.due_date).getTime() < Date.now();
			},
			formatDate(timestamp) {
				if (!timestamp) return '-';
				return uni.vk.pubfn.timeFormat(timestamp, 'yyyy-MM-dd hh:mm:ss');
			}
		}
	};
</script>
</script>

<style lang="scss" scoped>
	.detail-section {
		margin-bottom: 24px;

		.section-title {
			font-size: 16px;
			font-weight: bold;
			color: #303133;
			margin-bottom: 16px;
			padding-bottom: 8px;
			border-bottom: 1px solid #e4e7ed;
		}

		.info-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 16px;

			.info-item {
				display: flex;
				align-items: flex-start;

				.info-label {
					font-weight: bold;
					color: #606266;
					min-width: 100px;
				}

				.info-value {
					color: #303133;
					flex: 1;

					.text-danger {
						color: #f56c6c;
						font-weight: bold;
					}
				}
			}
		}

		.el-form {
			.el-form-item {
				margin-bottom: 18px;

				:deep(.el-form-item__label) {
					font-weight: bold;
					color: #606266;
				}

				:deep(.el-radio-group) {
					.el-radio {
						margin-right: 20px;
					}
				}

				:deep(.el-textarea) {
					.el-textarea__inner {
						border-radius: 4px;
						resize: vertical;
					}
				}
			}
		}
	}

	.form-tip {
		color: #909399;
		font-size: 12px;
		margin-top: 4px;
	}

	@media (max-width: 768px) {
		.detail-section .info-grid {
			grid-template-columns: 1fr;
			gap: 12px;
		}
	}
</style>