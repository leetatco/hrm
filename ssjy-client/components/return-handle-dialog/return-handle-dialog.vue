<template>
	<!-- 使用 u-modal 替代 vk-data-dialog -->
	<u-modal v-model="show" :title="title" :show-confirm-button="false" :show-cancel-button="false"
		width="800" :zoom="false" :mask-close-able="false">
		<view class="return-handle-dialog">
			<!-- 使用 approve-header-detail 组件 -->
			<approve-header-detail
				:detail-data="application"
				:form-schema="formSchema"
				:process-info="processInfo"
				:status-history="statusHistory"
				:current-tasks="currentTasks"
				:return-info="returnInfo"
				:show-basic-info="true"
				:show-return-info="true"
				:show-approval-flow="true"
				:show-current-task="false"
				:show-handle-form="true"
				:show-edit-prompt="true"
				:basic-info-title="'基本信息'"
				:form-info-title="'申请信息'"
				:handle-form-title="'处理方式'"
				:handle-form="handleForm"
				:handle-form-rules="handleFormRules"
				:field-value-formatter="fieldValueFormatter"
				:form-type-configs="formTypeConfigs"
				@preview-file="handlePreviewFile"
				@download-file="handleDownloadFile"
				@edit-application="handleEditApplication"
				@handle-action-change="onHandleActionChange"
				ref="applicationDetail"
			>
				<!-- 自定义处理表单插槽 -->
				<template v-slot:handle-form>
					<u-form :model="handleForm" ref="handleFormRef" label-width="150">
						<u-form-item label="处理方式" prop="action" :border-bottom="false" :required="true">
							<u-radio-group v-model="handleForm.action" @change="onHandleActionChange">
								<view class="radio-row">
									<u-radio name="resubmit" label="重新提交" size="28" active-color="#2979ff"></u-radio>
								</view>
								<view class="radio-row">
									<u-radio name="withdraw" label="撤回申请" size="28" active-color="#fa3534"></u-radio>
								</view>
							</u-radio-group>
						</u-form-item>

						<u-form-item label="修改说明" prop="modify_comment" v-if="handleForm.action === 'resubmit'" 
							:border-bottom="false" :required="true">
							<u-input v-model="handleForm.modify_comment" type="textarea" placeholder="请说明修改的内容"
								maxlength="500" :height="120" :count="true" :border="true" :clearable="false"></u-input>
						</u-form-item>

						<u-form-item label="撤回原因" prop="withdraw_reason" v-if="handleForm.action === 'withdraw'" 
							:border-bottom="false" :required="true">
							<u-input v-model="handleForm.withdraw_reason" type="textarea" placeholder="请说明撤回申请的原因"
								maxlength="500" :height="120" :count="true" :border="true" :clearable="false"></u-input>
						</u-form-item>
					</u-form>
				</template>
			</approve-header-detail>
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
		name: 'ReturnHandleDialog',
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
				default: '退回处理'
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
			statusHistory: {
				type: Array,
				default: () => []
			},
			currentTasks: {
				type: Array,
				default: () => []
			},
			formTypeConfigs: {
				type: Object,
				default: () => ({})
			},
			loading: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				handleForm: {
					action: 'resubmit',
					modify_comment: '',
					withdraw_reason: ''
				},
				handleFormRules: {
					action: [{
						required: true,
						message: "请选择处理方式",
						trigger: ['change']
					}],
					modify_comment: [{
						validator: (rule, value, callback) => {
							if (this.handleForm.action === 'resubmit' && !value) {
								callback(new Error("请填写修改说明"));
							} else {
								callback();
							}
						},
						trigger: ['blur', 'change']
					}],
					withdraw_reason: [{
						validator: (rule, value, callback) => {
							if (this.handleForm.action === 'withdraw' && !value) {
								callback(new Error("请填写撤回原因"));
							} else {
								callback();
							}
						},
						trigger: ['blur', 'change']
					}]
				}
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
			returnInfo() {
				if (!this.task) return null;
				
				return {
					returnReason: this.task.task_data ? this.task.task_data.return_reason || '未指定原因' : '未指定原因',
					returnedFrom: this.task.task_data ? this.task.task_data.returned_from || '未知环节' : '未知环节',
					returnTime: this.task.create_time,
					task: this.task
				};
			}
		},
		watch: {
			value(newVal) {
				if (newVal) {
					this.resetForm();
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
			
			handleEditApplication() {
				this.$emit('edit-application');
			},
			
			onHandleActionChange(action) {
				this.$emit('handle-action-change', action);
			},
			
			async handleSubmit() {
				try {
					// 验证表单
					const valid = await this.$refs.handleFormRef.validate();
					if (!valid) {
						uni.showToast({
							title: '请完善表单信息',
							icon: 'none'
						});
						return;
					}
					
					const submitData = {
						task_id: this.task._id,
						action: this.handleForm.action,
						modify_comment: this.handleForm.modify_comment,
						withdraw_reason: this.handleForm.withdraw_reason
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
				this.handleForm = {
					action: 'resubmit',
					modify_comment: '',
					withdraw_reason: ''
				};
				
				if (this.$refs.handleFormRef) {
					this.$refs.handleFormRef.clearValidate();
				}
			},
			
			// 字段值格式化函数
			fieldValueFormatter(fieldName, value, field) {
				// 特殊字段格式化
				if (fieldName === 'copies' && value !== null && value !== undefined) {
					return `${value} 份`;
				}
				
				// 日期字段格式化
				if ((fieldName === 'expected_date' || fieldName.includes('date')) && value) {
					return this.formatDate(value, 'yyyy-MM-dd');
				}
				
				return undefined; // 返回 undefined 让组件使用默认格式化
			},
			
			formatDate(timestamp, formatStr) {
				if (!timestamp) return '-';
				const vk = uni.vk;
				return vk.pubfn.timeFormat(timestamp, formatStr || 'yyyy-MM-dd hh:mm:ss');
			}
		}
	};
</script>

<style lang="scss" scoped>
	.return-handle-dialog {
		padding: 20rpx;
		max-height: 80vh;
		overflow-y: auto;
		
		// 确保内层组件的样式正确
		::v-deep .approve-header-detail {
			background-color: transparent;
			box-shadow: none;
			border-radius: 0;
		}
		
		::v-deep .detail-section {
			margin-bottom: 20rpx;
			padding: 30rpx;
			background-color: #ffffff;
			border-radius: 12rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			
			&:last-child {
				margin-bottom: 0;
			}
		}
	}

	/* 单选框组样式 */
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

	/* 表单样式 */
	::v-deep .u-form {
		.u-form-item {
			padding: 30rpx 0;
			
			.u-form-item__body {
				padding: 0;
			}
			
			.u-form-item__body__left__content__label {
				font-size: 28rpx;
				color: #333333;
				font-weight: 500;
			}
			
			.u-input {
				background-color: #f8f9fa;
				border-radius: 8rpx;
				
				.u-input__content {
					padding: 20rpx 24rpx;
				}
			}
			
			.u-textarea {
				background-color: #f8f9fa;
				border-radius: 8rpx;
				
				.u-textarea__field {
					padding: 20rpx 24rpx;
					min-height: 120rpx;
				}
			}
		}
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
		.return-handle-dialog {
			padding: 10rpx;
			
			::v-deep .detail-section {
				padding: 20rpx;
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
	.return-handle-dialog::-webkit-scrollbar {
		width: 6rpx;
	}

	.return-handle-dialog::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3rpx;
	}

	.return-handle-dialog::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 3rpx;
	}

	.return-handle-dialog::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>