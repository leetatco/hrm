<template>
	<!-- 使用 u-modal 替代 vk-data-dialog -->
	<u-modal v-model="show" :title="title" :show-confirm-button="false" :show-cancel-button="false"
		width="800" :zoom="false" :mask-close-able="false">
		<view class="approve-handle-dialog">
			<!-- 使用 ApproveHeaderDetail 组件 -->
			<approve-header-detail :detail-data="application" :form-schema="formSchema" :process-info="processInfo"
				:status-history="approvalHistory" :show-basic-info="true" :show-return-info="false"
				:show-approval-flow="true" :show-current-task="false" :show-handle-form="false" 
				:basic-info-title="'基本信息'" :form-info-title="'申请信息'" :form-type-configs="formTypeConfigs" 
				@preview-file="handlePreviewFile" @download-file="handleDownloadFile" />

			<!-- 当前任务信息 -->
			<view class="detail-section" v-if="task">
				<view class="section-header">
					<u-icon name="checkbox-mark" size="36" color="#f0ad4e" style="margin-right: 10rpx;"></u-icon>
					<text class="section-title">当前任务</text>
				</view>
				<view class="task-info">
					<view class="task-row">
						<view class="task-label">任务名称：</view>
						<view class="task-value">
							<u-tag :text="task.task_name" type="warning" size="mini" shape="circle"></u-tag>
						</view>
					</view>
					<view class="task-row">
						<view class="task-label">到达时间：</view>
						<view class="task-value">{{ formatDate(task._add_time) }}</view>
					</view>
					<view class="task-row">
						<view class="task-label">截止时间：</view>
						<view class="task-value">
							<text :class="{'overdue-text': isTaskOverdue(task)}">
								{{ formatDate(task.due_date) }}
								<u-icon v-if="isTaskOverdue(task)" name="error-circle" size="24" color="#fa3534" style="margin-left: 8rpx;"></u-icon>
							</text>
						</view>
					</view>
					<view class="task-row">
						<view class="task-label">处理人：</view>
						<view class="task-value">
							{{ task.assignee_name || task.assignee }}
						</view>
					</view>
				</view>
			</view>

			<!-- 审批操作表单 -->
			<view class="detail-section">
				<view class="section-header">
					<u-icon name="edit-pen" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
					<text class="section-title">审批操作</text>
				</view>
				
				<u-form :model="approveForm" ref="approveFormRef" label-width="150">
					<u-form-item label="操作类型" prop="action" :border-bottom="false" :required="true">
						<view class="action-radio-group">
							<u-radio-group v-model="approveForm.action" @change="onActionChange">
								<view class="radio-row">
									<u-radio name="approve" label="同意" size="28" active-color="#19be6b"></u-radio>
								</view>
								<view class="radio-row">
									<u-radio name="reject" label="驳回" size="28" active-color="#fa3534"></u-radio>
								</view>
								<view class="radio-row" v-if="showReturnOption">
									<u-radio name="return" label="退回" size="28" active-color="#f0ad4e"></u-radio>
								</view>
								<view class="radio-row" v-if="showTransferOption">
									<u-radio name="transfer" label="转办" size="28" active-color="#2979ff"></u-radio>
								</view>
							</u-radio-group>
						</view>
					</u-form-item>

					<u-form-item label="审批意见" prop="comment" :border-bottom="false" 
						:required="approveForm.action !== 'approve'">
						<u-input v-model="approveForm.comment" type="textarea" :placeholder="getCommentPlaceholder()"
							maxlength="500" :height="120" :count="true" :border="true" :clearable="false"></u-input>
					</u-form-item>

					<u-form-item label="转办人员" v-if="approveForm.action === 'transfer'" prop="transfer_user" 
						:border-bottom="false" :required="true">
						<!-- 使用 u-picker 选择转办人员 -->
						<view class="user-selector" @click="showTransferUserPicker = true">
							<u-input v-model="transferUserName" placeholder="请选择转办人员" disabled 
								suffix-icon="arrow-down" suffix-icon-style="color: #999"></u-input>
						</view>
						
						<u-picker v-if="showTransferUserPicker" :show="showTransferUserPicker" 
							:columns="transferUserColumns" keyName="label" @confirm="onTransferUserConfirm"
							@cancel="showTransferUserPicker = false"></u-picker>
					</u-form-item>

					<u-form-item label="加签人员" v-if="showAddSignOption" :border-bottom="false">
						<!-- 使用 u-picker 选择加签人员 -->
						<view class="add-sign-users">
							<view class="selected-users" v-if="approveForm.add_sign_users.length > 0">
								<view v-for="user in approveForm.add_sign_users" :key="user.value" class="selected-tag">
									<u-tag :text="user.label" closable size="mini" @close="removeAddSignUser(user.value)"></u-tag>
								</view>
							</view>
							<u-button type="primary" size="mini" @click="showAddSignUserPicker = true">
								<u-icon name="plus" size="24" style="margin-right: 8rpx;"></u-icon>
								选择加签人员
							</u-button>
							
							<u-picker v-if="showAddSignUserPicker" :show="showAddSignUserPicker" 
								:columns="addSignUserColumns" keyName="label" @confirm="onAddSignUserConfirm"
								@cancel="showAddSignUserPicker = false"></u-picker>
						</view>
						<view class="form-tip">加签人员将在此环节前进行审批</view>
					</u-form-item>
				</u-form>
			</view>
		</view>
		
		<!-- 底部操作按钮 -->
		<template #confirmButton>
			<view class="dialog-footer">
				<u-button type="default" @click="handleClose" :custom-style="{ 
					width: '200rpx', 
					height: '70rpx', 
					marginRight: '20rpx' 
				}">
					取消
				</u-button>
				<u-button type="primary" @click="handleSubmit" :loading="loading" :custom-style="{ 
					width: '200rpx', 
					height: '70rpx' 
				}">
					确定
				</u-button>
			</view>
		</template>
	</u-modal>
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
			showReturnOption: {
				type: Boolean,
				default: true
			},
			showTransferOption: {
				type: Boolean,
				default: true
			},
			showAddSignOption: {
				type: Boolean,
				default: false
			},
			loading: {
				type: Boolean,
				default: false
			},
			// 用户列表（用于转办和加签选择）
			userList: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				approveForm: {
					action: 'approve',
					comment: '',
					transfer_user: '',
					add_sign_users: []
				},
				approveRules: {
					action: [{
						required: true,
						message: "请选择审批操作",
						trigger: ['change']
					}],
					comment: [{
						validator: (rule, value, callback) => {
							if (this.approveForm.action !== 'approve' && !value) {
								callback(new Error("驳回或退回时必须填写审批意见"));
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
						trigger: ['change']
					}]
				},
				showTransferUserPicker: false,
				showAddSignUserPicker: false,
				transferUserName: '',
				// 模拟用户数据，实际项目中应从API获取
				transferUserColumns: [[]],
				addSignUserColumns: [[]]
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
			}
		},
		watch: {
			value(newVal) {
				if (newVal) {
					this.resetForm();
					this.loadUserData();
				}
			},
			task(newTask) {
				if (newTask) {
					this.updateOptionsByTask(newTask);
				}
			},
			userList(newList) {
				if (newList && newList.length > 0) {
					this.formatUserColumns(newList);
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
				if (action === 'approve') {
					this.$emit('update:showAddSignOption', this.task && this.task.allow_add_sign === true);
				} else {
					this.$emit('update:showAddSignOption', false);
				}
				this.$emit('action-change', action);
			},

			async handleSubmit() {
				try {
					const valid = await this.$refs.approveFormRef.validate();
					if (!valid) {
						uni.showToast({
							title: '请完善表单信息',
							icon: 'none'
						});
						return;
					}

					const submitData = {
						task_id: this.task._id,
						action: this.approveForm.action,
						comment: this.approveForm.comment,
						transfer_user: this.approveForm.transfer_user,
						add_sign_users: this.approveForm.add_sign_users.map(user => user.value),
						applicationData: this.application
					};

					this.$emit('submit', submitData);
				} catch (error) {
					console.error('表单验证失败:', error);
					uni.showToast({
						title: '表单验证失败',
						icon: 'none'
					});
				}
			},

			resetForm() {
				this.approveForm = {
					action: 'approve',
					comment: '',
					transfer_user: '',
					add_sign_users: []
				};
				this.transferUserName = '';
				
				if (this.$refs.approveFormRef) {
					this.$refs.approveFormRef.clearValidate();
				}
			},

			updateOptionsByTask(task) {
				if (task) {
					this.$emit('update:showReturnOption', task.task_key !== 'start');
					this.$emit('update:showTransferOption', true);
					this.$emit('update:showAddSignOption', task.allow_add_sign === true);
				}
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
					default:
						return '请输入审批意见';
				}
			},

			isTaskOverdue(task) {
				if (!task || !task.due_date) return false;
				const now = Date.now();
				const dueTime = new Date(task.due_date).getTime();
				return dueTime < now;
			},

			formatDate(timestamp) {
				if (!timestamp) return '-';
				const vk = uni.vk;
				return vk.pubfn.timeFormat(timestamp, 'yyyy-MM-dd hh:mm:ss');
			},
			
			// 加载用户数据
			async loadUserData() {
				try {
					// 实际项目中应从API获取用户列表
					// const userList = await this.$api.user.getList();
					// this.formatUserColumns(userList);
					
					// 模拟数据
					const mockUsers = [
						{ value: '1', label: '张三', employee_id: '001' },
						{ value: '2', label: '李四', employee_id: '002' },
						{ value: '3', label: '王五', employee_id: '003' },
						{ value: '4', label: '赵六', employee_id: '004' }
					];
					this.formatUserColumns(mockUsers);
				} catch (error) {
					console.error('加载用户数据失败:', error);
				}
			},
			
			// 格式化用户列数据
			formatUserColumns(userList) {
				const transferUsers = userList.map(user => ({
					value: user.value,
					label: `${user.label} (${user.employee_id || ''})`
				}));
				
				const addSignUsers = userList.map(user => ({
					value: user.value,
					label: `${user.label} (${user.employee_id || ''})`
				}));
				
				this.transferUserColumns = [transferUsers];
				this.addSignUserColumns = [addSignUsers];
			},
			
			// 转办人员选择确认
			onTransferUserConfirm(e) {
				this.showTransferUserPicker = false;
				const selected = e.value[0];
				this.approveForm.transfer_user = selected.value;
				this.transferUserName = selected.label;
			},
			
			// 加签人员选择确认
			onAddSignUserConfirm(e) {
				this.showAddSignUserPicker = false;
				const selected = e.value[0];
				
				// 检查是否已选择
				const exists = this.approveForm.add_sign_users.find(user => user.value === selected.value);
				if (!exists) {
					this.approveForm.add_sign_users.push(selected);
				} else {
					uni.showToast({
						title: '该人员已选择',
						icon: 'none'
					});
				}
			},
			
			// 移除加签人员
			removeAddSignUser(userId) {
				this.approveForm.add_sign_users = this.approveForm.add_sign_users.filter(
					user => user.value !== userId
				);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.approve-handle-dialog {
		padding: 20rpx;
		max-height: 80vh;
		overflow-y: auto;
	}

	.detail-section {
		margin-bottom: 30rpx;
		padding: 30rpx;
		background-color: #ffffff;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		&:last-child {
			margin-bottom: 0;
		}
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

	/* 任务信息样式 */
	.task-info {
		.task-row {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
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
				
				::v-deep .u-tag {
					font-size: 24rpx;
					padding: 4rpx 20rpx;
				}
			}
		}
	}

	/* 表单样式 */
	.action-radio-group {
		.radio-row {
			margin-bottom: 20rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			::v-deep .u-radio {
				padding: 10rpx 0;
				
				.u-radio__label {
					font-size: 28rpx;
					color: #333333;
				}
			}
		}
	}

	/* 用户选择器样式 */
	.user-selector {
		::v-deep .u-input {
			background-color: #f8f9fa;
			border-radius: 8rpx;
			
			.u-input__content {
				padding: 20rpx 24rpx;
			}
		}
	}

	/* 加签人员选择样式 */
	.add-sign-users {
		.selected-users {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
			margin-bottom: 20rpx;
			
			.selected-tag {
				::v-deep .u-tag {
					font-size: 24rpx;
					padding: 8rpx 20rpx;
					
					.u-icon-close {
						font-size: 20rpx;
					}
				}
			}
		}
		
		::v-deep .u-button {
			font-size: 26rpx;
			height: 60rpx;
		}
	}

	.form-tip {
		font-size: 24rpx;
		color: #999999;
		margin-top: 12rpx;
	}

	/* 对话框底部按钮样式 */
	.dialog-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30rpx 0;
		background-color: #ffffff;
		
		::v-deep .u-button {
			font-size: 28rpx;
			border-radius: 8rpx;
			
			&--default {
				background-color: #f8f9fa;
				color: #333333;
			}
			
			&--primary {
				background-color: #2979ff;
				color: #ffffff;
			}
		}
	}

	/* 响应式设计 */
	@media (max-width: 750px) {
		.detail-section {
			padding: 24rpx;
			margin-bottom: 20rpx;
		}
		
		.task-info {
			.task-row {
				flex-direction: column;
				align-items: flex-start;
				margin-bottom: 16rpx;
				
				.task-label {
					width: 100%;
					margin-bottom: 8rpx;
				}
			}
		}
		
		.dialog-footer {
			flex-direction: column;
			
			::v-deep .u-button {
				width: 100% !important;
				margin-bottom: 20rpx;
				margin-right: 0 !important;
				
				&:last-child {
					margin-bottom: 0;
				}
			}
		}
	}

	/* 滚动条样式 */
	.approve-handle-dialog::-webkit-scrollbar {
		width: 6rpx;
	}

	.approve-handle-dialog::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3rpx;
	}

	.approve-handle-dialog::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 3rpx;
	}

	.approve-handle-dialog::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>