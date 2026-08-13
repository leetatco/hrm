<template>
	<view class="approve-handle-dialog">
		<approve-header-detail :detail-data="application" :form-schema="formSchema" :process-info="processInfo"
			:status-history="approvalHistory" :show-basic-info="true" :show-return-info="false"
			:show-approval-flow="true" :show-current-task="false" :show-handle-form="false" :basic-info-title="'基本信息'"
			:form-info-title="'申请信息'" :form-type-configs="formTypeConfigs" @preview-file="handlePreviewFile"
			@download-file="handleDownloadFile" />

		<!-- 审批操作表单 -->
		<view class="detail-section">
			<view class="section-header">
				<u-icon name="edit-pen" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
				<text class="section-title">审批操作</text>
			</view>

			<view>
				<!-- 操作类型 -->
				<view class="form-item">
					<view class="form-label">操作类型 <text class="required">*</text></view>
					<view class="action-radio-group">
						<u-radio-group v-model="approveForm.action" @change="onActionChange">
							<view class="radio-row" v-for="opt in operationOptions" :key="opt.value">
								<u-radio :name="opt.value" size="28"
									:active-color="opt.color">{{ opt.label }}</u-radio>
							</view>
						</u-radio-group>
					</view>
				</view>

				<!-- 审批意见 -->
				<view class="form-item">
					<view class="form-label">
						审批意见
						<text class="required"
							v-if="approveForm.action !== 'approve' && approveForm.action !== 'confirm' && approveForm.action !== 'add_sign_complete'">*</text>
					</view>
					<u-input v-model="approveForm.comment" type="textarea" :placeholder="getCommentPlaceholder()"
						maxlength="500" :height="120" :count="true" :border="true"></u-input>
				</view>

				<!-- 转办人员选择 -->
				<view class="form-item" v-if="approveForm.action === 'transfer' && allowedActions.includes('transfer')">
					<view class="form-label">转办人员 <text class="required">*</text></view>
					<u-input v-model="transferUserName" placeholder="请选择转办人员" suffix-icon="search"
						suffix-icon-style="color: #999" @click="showTransferUserPicker = true" readonly></u-input>
				</view>

				<!-- 加签人员选择 -->
				<view class="form-item" v-if="showAddSignField">
					<view class="form-label">加签人员 <text class="required"
							v-if="approveForm.action === 'add_sign'">*</text></view>
					<view class="add-sign-user">
						<u-input v-model="addSignUserName" placeholder="请选择加签人员" suffix-icon="search"
							suffix-icon-style="color: #999" @click="showAddSignUserPicker = true" readonly></u-input>
					</view>
					<view class="form-tip">加签后，被加签人处理完成后需您再次处理</view>
				</view>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="dflex-c">
			<u-button type="primary" @click="handleSubmit" :loading="loading">确定</u-button>
		</view>
	</view>

	<!-- 转办人员选择弹窗 -->
	<u-popup v-model="showTransferUserPicker" mode="bottom" :round="20" height="70%">
		<view class="transfer-picker">
			<view class="picker-header">
				<text class="picker-title">选择转办人员</text>
				<u-button type="text" @click="showTransferUserPicker = false">取消</u-button>
			</view>
			<u-search v-model="transferSearchKeyword" placeholder="搜索姓名" @search="onTransferSearchTrigger"
				@clear="onTransferSearchClear" :show-action="false"></u-search>
			<scroll-view scroll-y class="user-list">
				<view v-for="user in filteredTransferUsers" :key="user.value" class="user-item"
					@click="selectTransferUser(user)">
					<u-radio-group v-model="tempSelectedTransferUser" :active-color="'#2979ff'">
						<u-radio :name="user.value">{{user.label}}</u-radio>
					</u-radio-group>
				</view>
				<view v-if="filteredTransferUsers.length === 0" class="empty-tip">
					<u-empty mode="data" text="暂无匹配人员"></u-empty>
				</view>
			</scroll-view>
			<view class="dflex">
				<u-button type="primary" @click="confirmTransferUser"
					:custom-style="{ width: '100%', height: '80rpx' }">确定</u-button>
			</view>
		</view>
	</u-popup>

	<!-- 加签人员选择弹窗 -->
	<u-popup v-model="showAddSignUserPicker" mode="bottom" :round="20" height="70%">
		<view class="transfer-picker">
			<view class="picker-header">
				<text class="picker-title">选择加签人员</text>
				<u-button type="text" @click="showAddSignUserPicker = false">取消</u-button>
			</view>
			<u-search v-model="addSignSearchKeyword" placeholder="搜索姓名" @search="onAddSignSearchTrigger"
				@clear="onAddSignSearchClear" :show-action="false"></u-search>
			<scroll-view scroll-y class="user-list">
				<view v-for="user in filteredAddSignUsers" :key="user.value" class="user-item"
					@click="selectAddSignUser(user)">
					<u-radio-group v-model="tempSelectedAddSignUser" :active-color="'#2979ff'">
						<u-radio :name="user.value">{{user.label}}</u-radio>
					</u-radio-group>
				</view>
				<view v-if="filteredAddSignUsers.length === 0" class="empty-tip">
					<u-empty mode="data" text="暂无匹配人员"></u-empty>
				</view>
			</scroll-view>
			<view class="dflex">
				<u-button type="primary" @click="confirmAddSignUser"
					:custom-style="{ width: '100%', height: '80rpx' }">确定</u-button>
			</view>
		</view>
	</u-popup>
</template>

<script>
	import ApproveHeaderDetail from '@/components/approve-header-detail/approve-header-detail.vue';

	export default {
		name: 'ApproveHandleDialog',
		components: {
			ApproveHeaderDetail
		},
		emits: ['preview-file', 'download-file', 'action-change', 'submit', 'update:showAddSignOption'],
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
			},
			userList: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				approveForm: {
					action: '',
					comment: '',
					transfer_user: '',
					add_sign_user: ''
				},
				showTransferUserPicker: false,
				showAddSignUserPicker: false,
				transferUserName: '',
				addSignUserName: '',
				transferSearchKeyword: '',
				addSignSearchKeyword: '',
				tempSelectedTransferUser: '',
				tempSelectedAddSignUser: '',
				filteredTransferUsers: [],
				filteredAddSignUsers: [],
				transferSearchTimer: null,
				addSignSearchTimer: null
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
				return ['add_sign_complete'];
			},
			operationOptions() {
				const map = {
					approve: {
						label: '同意',
						value: 'approve',
						color: '#19be6b'
					},
					reject: {
						label: '驳回',
						value: 'reject',
						color: '#fa3534'
					},
					return: {
						label: '退回',
						value: 'return',
						color: '#f0ad4e'
					},
					transfer: {
						label: '转办',
						value: 'transfer',
						color: '#2979ff'
					},
					add_sign: {
						label: '加签',
						value: 'add_sign',
						color: '#9c27b0'
					},
					add_sign_complete: {
						label: '加签完成',
						value: 'add_sign_complete',
						color: '#19be6b'
					},
					confirm: {
						label: '确认',
						value: 'confirm',
						color: '#19be6b'
					}
				};
				return this.allowedActions.filter(a => map[a]).map(a => map[a]);
			},
			showAddSignField() {
				return this.approveForm.action === 'add_sign' ||
					(this.approveForm.action === 'approve' && this.showAddSignOption);
			}
		},
		watch: {
			// 弹窗显示/隐藏
			value: {
				handler(newVal) {					
					if (newVal) {
						this.resetForm();
						this.loadDefaultUsers();
					}
				},
				immediate: true
			},
			// 任务数据（这是关键！）
			task: {
				handler() {					
					if (this.operationOptions.length > 0) {
						// 直接设为第一个可用操作
						this.approveForm.action = this.operationOptions[0].value;
					}
				},
				deep: true,
				immediate: true
			},
			transferSearchKeyword(newVal) {
				if (this.transferSearchTimer) clearTimeout(this.transferSearchTimer);
				this.transferSearchTimer = setTimeout(() => {
					this.remoteSearchUsers(newVal, 'transfer');
				}, 300);
			},
			addSignSearchKeyword(newVal) {
				if (this.addSignSearchTimer) clearTimeout(this.addSignSearchTimer);
				this.addSignSearchTimer = setTimeout(() => {
					this.remoteSearchUsers(newVal, 'addSign');
				}, 300);
			}
		},
		created() {
			this.loadDefaultUsers();
		},
		methods: {
			handlePreviewFile(file) {
				this.$emit('preview-file', file);
			},
			
			handleDownloadFile(file) {
				this.$emit('download-file', file);
			},
						
			onActionChange(action) {
				this.$emit('action-change', action);
				this.$emit('update:showAddSignOption', action === 'approve' && this.task?.allow_add_sign === true);
			},

			handleSubmit() {
				if (!this.approveForm.action) {
					uni.showToast({
						title: '请选择操作类型',
						icon: 'none'
					});
					return;
				}
				// 只有同意/确认/加签完成时意见可选，其他操作意见必填
				if (!['approve', 'confirm', 'add_sign_complete'].includes(this.approveForm.action) && !this.approveForm
					.comment.trim()) {
					uni.showToast({
						title: '请填写审批意见',
						icon: 'none'
					});
					return;
				}
				if (this.approveForm.action === 'transfer' && !this.approveForm.transfer_user) {
					uni.showToast({
						title: '请选择转办人员',
						icon: 'none'
					});
					return;
				}
				if (this.approveForm.action === 'add_sign' && !this.approveForm.add_sign_user) {
					uni.showToast({
						title: '请选择加签人员',
						icon: 'none'
					});
					return;
				}
				const submitData = {
					task_id: this.task._id,
					action: this.approveForm.action,
					comment: this.approveForm.comment,
					transfer_user: this.approveForm.action === 'transfer' ? this.approveForm.transfer_user : this
						.approveForm.action === 'add_sign' ? this.approveForm.add_sign_user : undefined,
					applicationData: this.application
				};
				this.$emit('submit', submitData);
			},

			resetForm() {
				this.approveForm = {
					action: '',
					comment: '',
					transfer_user: '',
					add_sign_user: ''
				};
				this.transferUserName = '';
				this.addSignUserName = '';
				this.transferSearchKeyword = '';
				this.addSignSearchKeyword = '';
				this.tempSelectedTransferUser = '';
				this.tempSelectedAddSignUser = '';
				this.filteredTransferUsers = [];
				this.filteredAddSignUsers = [];
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
						return '请填写加签说明（可选）';
					case 'add_sign_complete':
						return '加签完成，可选填意见';
					case 'confirm':
						return '确认时可选填意见';
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
				const vk = uni.vk;
				return vk.pubfn.timeFormat(timestamp, 'yyyy-MM-dd hh:mm:ss');
			},

			async loadDefaultUsers() {
				try {
					// 注意：此处应使用 uni.vk.callFunction，但当前环境可能没有 uni.vk，请确保全局 vk 可用
					const res = await vk.callFunction({
						url: 'admin/hrm/employees/sys/getList',
						data: {
							pageIndex: 1,
							pageSize: 10
						}
					});
					if (res.code === 0 && res.rows) {
						const formatted = this.formatUsers(res.rows);
						this.filteredTransferUsers = formatted;
						this.filteredAddSignUsers = formatted;
					} else {
						this.filteredTransferUsers = [];
						this.filteredAddSignUsers = [];
					}
				} catch (e) {
					console.error('加载默认用户失败', e);
				}
			},

			async remoteSearchUsers(keyword, type) {
				if (!keyword || keyword.trim() === '') {
					this.loadDefaultUsers();
					return;
				}
				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/employees/sys/getList',
						data: {
							keyword: keyword
						}
					});
					if (res.code === 0 && res.rows) {
						const formatted = this.formatUsers(res.rows);
						if (type === 'transfer') {
							this.filteredTransferUsers = formatted;
						} else if (type === 'addSign') {
							this.filteredAddSignUsers = formatted;
						}
					} else {
						if (type === 'transfer') this.filteredTransferUsers = [];
						if (type === 'addSign') this.filteredAddSignUsers = [];
					}
				} catch (e) {
					console.error('远程搜索用户失败', e);
				}
			},

			formatUsers(userList) {
				return userList.map(user => ({
					value: user.employee_id,
					label: `${user.employee_name}${user.employee_id ? ` (${user.employee_id})` : ''}`
				}));
			},

			onTransferSearchTrigger() {},
			onTransferSearchClear() {
				this.transferSearchKeyword = '';
			},
			selectTransferUser(user) {
				this.tempSelectedTransferUser = user.value;
			},
			confirmTransferUser() {
				if (!this.tempSelectedTransferUser) {
					uni.showToast({
						title: '请选择转办人员',
						icon: 'none'
					});
					return;
				}
				const user = this.filteredTransferUsers.find(u => u.value === this.tempSelectedTransferUser);
				if (user) {
					this.approveForm.transfer_user = user.value;
					this.transferUserName = user.label;
					this.showTransferUserPicker = false;
				}
			},

			onAddSignSearchTrigger() {},
			onAddSignSearchClear() {
				this.addSignSearchKeyword = '';
			},
			selectAddSignUser(user) {
				this.tempSelectedAddSignUser = user.value;
			},
			confirmAddSignUser() {
				if (!this.tempSelectedAddSignUser) {
					uni.showToast({
						title: '请选择加签人员',
						icon: 'none'
					});
					return;
				}
				const user = this.filteredAddSignUsers.find(u => u.value === this.tempSelectedAddSignUser);
				if (user) {
					this.approveForm.add_sign_user = user.value;
					this.addSignUserName = user.label;
					this.showAddSignUserPicker = false;
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.approve-handle-dialog {
	  padding: 20rpx;
	  // 去掉最大高度和滚动，让外部 popup 控制滚动
	}

	.detail-section {
		margin-bottom: 30rpx;
		padding: 30rpx;
		background-color: #ffffff;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.section-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		padding-bottom: 20rpx;
		border-bottom: 1px solid #f0f0f0;

		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
		}
	}

	.task-info .task-row {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.task-label {
			width: 160rpx;
			font-size: 26rpx;
			color: #666666;
			font-weight: 500;
		}

		.task-value {
			flex: 1;
			font-size: 26rpx;
			color: #333333;

			.overdue-text {
				color: #fa3534;
				font-weight: 500;
				display: flex;
				align-items: center;
			}
		}
	}

	.form-item {
		margin-bottom: 30rpx;

		.form-label {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 12rpx;
			font-weight: 500;

			.required {
				color: #fa3534;
				margin-left: 4rpx;
			}
		}
	}

	.action-radio-group .radio-row {
		margin-bottom: 20rpx;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.add-sign-users {
		.selected-users {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
			margin-bottom: 20rpx;
		}
	}

	.form-tip {
		font-size: 24rpx;
		color: #999999;
		margin-top: 12rpx;
	}

	.dflex-c {
		display: flex;
		justify-content: center;
		padding: 30rpx 0;
	}

	.transfer-picker {
		padding: 30rpx;

		.picker-header {
			display: flex;
			justify-content: space-between;
			margin-bottom: 30rpx;
		}

		.user-list {
			max-height: 500rpx;
			margin-top: 20rpx;

			.user-item {
				padding: 20rpx 0;
				border-bottom: 1px solid #f0f0f0;
			}
		}

		.dflex {
			display: flex;
			justify-content: center;
			margin-top: 30rpx;
		}
	}

	@media (max-width: 750px) {
		.detail-section {
			padding: 24rpx;
		}

		.task-info .task-row {
			flex-direction: column;
			align-items: flex-start;

			.task-label {
				width: 100%;
				margin-bottom: 8rpx;
			}
		}
	}
</style>