<template>
	<view class="application-detail">
		<!-- 基本信息 -->
		<view class="detail-section" v-if="showBasicInfo">
			<view class="section-header">
				<u-icon name="info-circle" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
				<text class="section-title">{{ basicInfoTitle }}</text>
			</view>
			<view class="info-grid">
				<view class="info-row" v-for="item in basicInfoList" :key="item.key">
					<view class="info-label">{{ item.label }}：</view>
					<view class="info-value" :class="item.type">
						<template v-if="item.type === 'status'">
							<u-tag :text="item.value" :type="getStatusType(item.value)" size="mini" shape="circle"></u-tag>
						</template>
						<template v-else>
							{{ item.value }}
						</template>
					</view>
				</view>
			</view>
		</view>

		<!-- 退回信息 -->
		<view class="detail-section return-info" v-if="showReturnInfo && returnInfo">
			<view class="section-header">
				<u-icon name="back" size="36" color="#fa3534" style="margin-right: 10rpx;"></u-icon>
				<text class="section-title">退回信息</text>
			</view>
			<view class="return-content">
				<view class="return-card">
					<view class="return-header">
						<u-icon name="close-circle" size="24" color="#fa3534"></u-icon>
						<text class="return-title">申请被退回</text>
					</view>
					<view class="return-details">
						<view class="return-item">
							<u-icon name="info-circle" size="24" color="#666"></u-icon>
							<view class="return-item-content">
								<text class="return-item-label">退回原因：</text>
								<text class="return-item-value">{{ returnInfo.returnReason || '无' }}</text>
							</view>
						</view>
						<view class="return-item">
							<u-icon name="list-dot" size="24" color="#666"></u-icon>
							<view class="return-item-content">
								<text class="return-item-label">退回环节：</text>
								<text class="return-item-value">{{ returnInfo.returnedFrom || '-' }}</text>
							</view>
						</view>
						<view class="return-item">
							<u-icon name="clock" size="24" color="#666"></u-icon>
							<view class="return-item-content">
								<text class="return-item-label">退回时间：</text>
								<text class="return-item-value">{{ formatDate(returnInfo.returnTime) }}</text>
							</view>
						</view>
						<view class="return-item" v-if="returnInfo.task">
							<u-icon name="arrow-right" size="24" color="#666"></u-icon>
							<view class="return-item-content">
								<text class="return-item-label">当前任务：</text>
								<view class="return-task">
									<u-tag :text="returnInfo.task.task_name" type="warning" size="mini" shape="circle"></u-tag>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 动态表单信息 -->
		<view class="detail-section" v-if="formSchema && formSchema.fields">
			<view class="section-header">
				<u-icon name="form" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
				<text class="section-title">{{ formInfoTitle }}</text>
			</view>
			<view class="form-content">
				<!-- 普通字段 -->
				<view class="form-field" v-for="field in getNormalFields()" :key="field.name">
					<view class="field-label">{{ field.label }}</view>
					<view class="field-value">
						{{ getFieldDisplayValue(field) }}
					</view>
				</view>

				<!-- array<object> 字段 -->
				<view class="form-field" v-for="field in getArrayObjectFields()" :key="field.name + '_array'">
					<view class="field-label">{{ field.label }}</view>
					<view class="field-value">
						<view class="array-items">
							<view v-for="(item, index) in getFieldValue(field.name)" :key="index" class="array-item">
								<view class="array-item-content">
									<rich-text :nodes="formatArrayObjectItem(item, field.itemFormat)"></rich-text>
								</view>
								<view class="array-item-divider" v-if="index < getFieldValue(field.name).length - 1"></view>
							</view>
						</view>
					</view>
				</view>

				<!-- textarea 字段 -->
				<view class="form-field" v-for="field in getTextareaFields()" :key="field.name + '_textarea'">
					<view class="field-label">{{ field.label }}</view>
					<view class="field-value">
						<view class="textarea-content">
							{{ getFieldDisplayValue(field) }}
						</view>
					</view>
				</view>

				<!-- 文件字段 -->
				<view class="form-field" v-for="field in getFileFields()" :key="field.name + '_file'">
					<view class="field-label">{{ field.label }}</view>
					<view class="field-value">
						<view class="file-list" v-if="getFieldValue(field.name) && getFieldValue(field.name).length > 0">
							<view v-for="(file, index) in getFieldValue(field.name)" :key="index" class="file-item">
								<view class="file-info" @click="handleFileAction('preview', file)">
									<u-icon name="file-text" size="28" color="#2979ff"></u-icon>
									<text class="file-name">{{ file.name || getFileName(file.url) }}</text>
									<text class="file-size" v-if="file.size">{{ formatFileSize(file.size) }}</text>
								</view>
								<view class="file-actions">
									<u-button type="primary" size="mini" @click="handleFileAction('download', file)" 
										:custom-style="{ marginLeft: '10rpx', height: '50rpx', fontSize: '24rpx' }">
										下载
									</u-button>
									<u-button type="default" size="mini" @click="handleFileAction('preview', file)"
										:custom-style="{ marginLeft: '10rpx', height: '50rpx', fontSize: '24rpx' }">
										预览
									</u-button>
								</view>
							</view>
						</view>
						<view class="empty-file" v-else>
							<text>-</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 审批流程公共组件 -->
		<view class="detail-section" v-if="showApprovalFlow && processInfo.tasks && processInfo.tasks.length > 0">
			<view class="section-header">
				<u-icon name="list-dot" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
				<text class="section-title">审批流程</text>
			</view>
			<approve-work-flow 
				:tasks="processInfo.tasks" 
				:history="statusHistory" 
				:create-record="{
					create_time: detailData._add_time,
					operator_name: detailData.applicant_name,
					comment: '创建申请'
				}" 
				:format-date-fn="formatDate"
				title="审批流程"
				history-title="审批记录"
			/>
		</view>

		<!-- 当前任务信息 -->
		<view class="detail-section" v-if="showCurrentTask && currentTasks && currentTasks.length > 0">
			<view class="section-header">
				<u-icon name="clock-fill" size="36" color="#f0ad4e" style="margin-right: 10rpx;"></u-icon>
				<text class="section-title">当前待办</text>
			</view>
			<view class="current-tasks">
				<view v-for="(task, index) in currentTasks" :key="index" class="task-card">
					<view class="task-header">
						<view class="task-title">
							<u-icon name="checkbox-mark" size="28" color="#f0ad4e"></u-icon>
							<text class="task-name">{{ task.task_name }}</text>
						</view>
						<u-tag text="待处理" type="warning" size="mini" shape="circle"></u-tag>
					</view>
					<view class="task-content">
						<view class="task-item">
							<u-icon name="account" size="24" color="#666"></u-icon>
							<text class="task-text">处理人：{{ task.assignee_name || task.assignee }}</text>
						</view>
						<view class="task-item">
							<u-icon name="clock" size="24" color="#666"></u-icon>
							<text class="task-text">到达时间：{{ formatDate(task._add_time) }}</text>
						</view>
						<view class="task-item" v-if="task.due_date">
							<u-icon name="calendar" size="24" color="#fa3534"></u-icon>
							<text class="task-text deadline">截止时间：{{ formatDate(task.due_date) }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 处理表单 -->
		<view class="detail-section" v-if="showHandleForm">
			<view class="section-header">
				<u-icon name="edit-pen" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
				<text class="section-title">{{ handleFormTitle }}</text>
			</view>
			<view class="handle-form">
				<slot name="handle-form">
					<!-- 默认处理表单内容 -->
					<u-form :model="handleForm" ref="handleFormRef" label-width="150">
						<u-form-item label="处理方式" prop="action" :border-bottom="false">
							<u-radio-group v-model="handleForm.action" @change="onHandleActionChange">
								<u-radio name="resubmit" label="重新提交" size="28"></u-radio>
								<u-radio name="withdraw" label="撤回申请" size="28"></u-radio>
							</u-radio-group>
						</u-form-item>

						<u-form-item label="修改说明" prop="modify_comment" v-if="handleForm.action === 'resubmit'"
							:border-bottom="false">
							<u-input v-model="handleForm.modify_comment" type="textarea" placeholder="请说明修改的内容"
								maxlength="500" :height="120" :count="true" :border="true"></u-input>
						</u-form-item>

						<u-form-item label="撤回原因" prop="withdraw_reason" v-if="handleForm.action === 'withdraw'"
							:border-bottom="false">
							<u-input v-model="handleForm.withdraw_reason" type="textarea" placeholder="请说明撤回申请的原因"
								maxlength="500" :height="120" :count="true" :border="true"></u-input>
						</u-form-item>
					</u-form>
				</slot>
			</view>
		</view>

		<!-- 申请信息修改提示 -->
		<view class="detail-section" v-if="showEditPrompt && handleForm.action === 'resubmit'">
			<view class="section-header">
				<u-icon name="info-circle" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
				<text class="section-title">申请信息修改</text>
			</view>
			<view class="edit-prompt">
				<u-alert type="info" title="如需修改申请信息，请点击下方按钮进行修改" :show-icon="true" :closable="false"></u-alert>
				<u-button type="primary" @click="handleEditApplication" 
					:custom-style="{ marginTop: '30rpx', height: '70rpx' }">
					<u-icon name="edit-pen" size="28" style="margin-right: 10rpx;"></u-icon>
					修改申请信息
				</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	import ApproveWorkFlow from '@/components/approve-work-flow/approve-work-flow.vue';

	export default {
		name: 'ApproveHeaderDetail',
		components: {
			ApproveWorkFlow
		},
		props: {
			detailData: {
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
			returnInfo: {
				type: Object,
				default: null
			},
			showBasicInfo: {
				type: Boolean,
				default: true
			},
			showReturnInfo: {
				type: Boolean,
				default: false
			},
			showApprovalFlow: {
				type: Boolean,
				default: true
			},
			showCurrentTask: {
				type: Boolean,
				default: false
			},
			showHandleForm: {
				type: Boolean,
				default: false
			},
			showEditPrompt: {
				type: Boolean,
				default: false
			},
			basicInfoTitle: {
				type: String,
				default: '基本信息'
			},
			formInfoTitle: {
				type: String,
				default: '申请信息'
			},
			handleFormTitle: {
				type: String,
				default: '处理方式'
			},
			handleForm: {
				type: Object,
				default: () => ({
					action: 'resubmit',
					modify_comment: '',
					withdraw_reason: ''
				})
			},
			handleFormRules: {
				type: Object,
				default: () => ({})
			},
			fieldValueFormatter: {
				type: Function,
				default: null
			},
			formTypeConfigs: {
				type: Object,
				default: () => ({})
			}
		},
		data() {
			return {
				defaultHandleFormRules: {
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
			mergedHandleFormRules() {
				return {
					...this.defaultHandleFormRules,
					...this.handleFormRules
				};
			},
			basicInfoList() {
				if (!this.detailData) return [];
				
				return [
					{
						key: 'id',
						label: '申请单号',
						value: this.detailData._id || '-',
						type: 'text'
					},
					{
						key: 'applicant',
						label: '申请人',
						value: this.detailData.applicant_name || '-',
						type: 'text'
					},
					{
						key: 'department',
						label: '申请部门',
						value: this.detailData.applicant_department || '-',
						type: 'text'
					},
					{
						key: 'type',
						label: '申请类型',
						value: this.getFormTypeName(this.detailData.form_type_code),
						type: 'text'
					},
					{
						key: 'status',
						label: '申请状态',
						value: this.getStatusText(this.detailData.status),
						type: 'status'
					},
					{
						key: 'time',
						label: '申请时间',
						value: this.formatDate(this.detailData._add_time),
						type: 'text'
					},
					{
						key: 'currentTask',
						label: '当前环节',
						value: this.detailData.current_task || '-',
						type: 'text'
					}
				];
			}
		},
		methods: {
			validateForm() {
				return new Promise((resolve, reject) => {
					this.$refs.handleFormRef.validate().then(valid => {
						resolve(valid);
					}).catch(errors => {
						reject(errors);
					});
				});
			},

			clearFormValidation() {
				if (this.$refs.handleFormRef) {
					this.$refs.handleFormRef.clearValidate();
				}
			},

			handleFileAction(action, file) {
				if (action === 'preview') {
					this.$emit('preview-file', file);
				} else if (action === 'download') {
					this.$emit('download-file', file);
				}
			},

			handleEditApplication() {
				this.$emit('edit-application');
			},

			onHandleActionChange(action) {
				this.$emit('handle-action-change', action);
			},

			getFileName(url) {
				if (!url) return '未知文件';
				const parts = url.split('/');
				return parts[parts.length - 1];
			},

			formatFileSize(bytes) {
				if (bytes === 0) return '0 Bytes';
				const k = 1024;
				const sizes = ['Bytes', 'KB', 'MB', 'GB'];
				const i = Math.floor(Math.log(bytes) / Math.log(k));
				return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
			},

			getNormalFields() {
				if (!this.formSchema || !this.formSchema.fields) return [];

				return this.formSchema.fields.filter(field => {
					return field.type !== 'textarea' && field.type !== 'file' && field.type !== 'array<object>';
				});
			},

			getTextareaFields() {
				if (!this.formSchema || !this.formSchema.fields) return [];

				return this.formSchema.fields.filter(field => {
					return field.type === 'textarea';
				});
			},

			getArrayObjectFields() {
				if (!this.formSchema || !this.formSchema.fields) return [];

				return this.formSchema.fields.filter(field => {
					return field.type === 'array<object>';
				});
			},

			getFileFields() {
				if (!this.formSchema || !this.formSchema.fields) return [];

				return this.formSchema.fields.filter(field => {
					return field.type === 'file';
				});
			},

			getFieldValue(fieldName) {
				if (!this.detailData || !this.detailData.form_data) return null;
				return this.detailData.form_data[fieldName];
			},

			getFieldDisplayValue(field) {
				const value = this.getFieldValue(field.name);

				if (this.fieldValueFormatter) {
					const formattedValue = this.fieldValueFormatter(field.name, value, field);
					if (formattedValue !== undefined) return formattedValue;
				}

				if (value === null || value === undefined || value === '') {
					return '-';
				}

				if (field.type === 'select' && field.options) {
					const option = field.options.find(opt => opt.value === value);
					return option ? option.label : value;
				}

				if (field.type === 'date' || field.type === 'datetime') {
					return this.formatDate(value, field.type === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd hh:mm:ss');
				}

				if (field.type === 'array<object>') {
					return value;
				}

				return value;
			},

			formatArrayObjectItem(item, formatConfig) {
				if (typeof formatConfig === 'string') {
					return this.formatWithStringTemplate(item, formatConfig);
				}

				if (typeof formatConfig === 'function') {
					return formatConfig(item);
				}

				if (Array.isArray(formatConfig)) {
					const parts = formatConfig.map(fieldConfig => {
						let fieldName, label;
						if (typeof fieldConfig === 'string') {
							fieldName = fieldConfig;
							label = fieldConfig;
						} else if (fieldConfig && typeof fieldConfig === 'object') {
							fieldName = fieldConfig.name || fieldConfig.field;
							label = fieldConfig.label || fieldName;
						} else {
							return '';
						}

						const value = this.getNestedProperty(item, fieldName);
						if (fieldConfig.transform && typeof fieldConfig.transform === 'function') {
							return `<span style="color: #666;">${label}:</span> <span style="color: #333; font-weight: 500;">${fieldConfig.transform(value)}</span>`;
						}

						return `<span style="color: #666;">${label}:</span> <span style="color: #333; font-weight: 500;">${value !== undefined && value !== null ? value : ''}</span>`;
					});

					return parts.filter(part => part).join('<br>');
				}

				return JSON.stringify(item);
			},

			formatWithStringTemplate(item, template) {
				return template.replace(/\${([^}]+)}/g, (match, fieldName) => {
					const parts = fieldName.split(/[.[\]]/).filter(part => part);
					let value = item;

					for (const part of parts) {
						if (value && typeof value === 'object' && part in value) {
							value = value[part];
						} else {
							return '';
						}
					}

					return value !== undefined && value !== null ? value : '';
				});
			},

			getNestedProperty(obj, path) {
				const parts = path.split(/[.[\]]/).filter(part => part);
				let value = obj;

				for (const part of parts) {
					if (value && typeof value === 'object' && part in value) {
						value = value[part];
					} else {
						return undefined;
					}
				}

				return value;
			},

			getFormTypeName(formTypeCode) {
				const formType = this.formTypeConfigs[formTypeCode];
				return formType ? formType.name : formTypeCode;
			},

			getStatusType(status) {
				const typeMap = {
					draft: 'info',
					pending: 'warning',
					approved: 'success',
					rejected: 'error',
					cancelled: 'info',
					withdrawn: 'info',
					returned: 'warning',
					completed: 'success'
				};
				return typeMap[status] || 'info';
			},

			getStatusText(status) {
				const textMap = {
					draft: '草稿',
					pending: '审批中',
					approved: '已通过',
					rejected: '已驳回',
					cancelled: '已取消',
					withdrawn: '已撤回',
					returned: '已退回',
					completed: '已完成'
				};
				return textMap[status] || status;
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
	.application-detail {
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
	}

	.detail-section {
		padding: 40rpx;
		border-bottom: 1px solid #f5f5f5;
		
		&:last-child {
			border-bottom: none;
		}
		
		&.return-info {
			background-color: #fff2f0;
		}
	}

	.section-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
		}
	}

	/* 基本信息样式 */
	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24rpx;
		
		.info-row {
			display: flex;
			align-items: flex-start;
			
			.info-label {
				flex-shrink: 0;
				width: 180rpx;
				font-size: 26rpx;
				color: #666666;
				font-weight: 500;
				line-height: 1.5;
			}
			
			.info-value {
				flex: 1;
				font-size: 26rpx;
				color: #333333;
				line-height: 1.5;
				
				&.status {
					::v-deep .u-tag {
						font-size: 24rpx;
						padding: 4rpx 20rpx;
					}
				}
			}
		}
	}

	/* 退回信息样式 */
	.return-content {
		.return-card {
			background-color: #ffffff;
			border-radius: 12rpx;
			padding: 32rpx;
			border: 1px solid #ffccc7;
			
			.return-header {
				display: flex;
				align-items: center;
				margin-bottom: 24rpx;
				padding-bottom: 16rpx;
				border-bottom: 1px solid #ffeae6;
				
				.return-title {
					font-size: 30rpx;
					font-weight: bold;
					color: #fa3534;
					margin-left: 12rpx;
				}
			}
			
			.return-details {
				.return-item {
					display: flex;
					align-items: flex-start;
					margin-bottom: 20rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.return-item-content {
						flex: 1;
						margin-left: 16rpx;
						
						.return-item-label {
							font-size: 26rpx;
							color: #666666;
							font-weight: 500;
						}
						
						.return-item-value {
							font-size: 26rpx;
							color: #333333;
							margin-left: 8rpx;
						}
					}
					
					.return-task {
						margin-top: 4rpx;
						
						::v-deep .u-tag {
							font-size: 24rpx;
							padding: 4rpx 20rpx;
						}
					}
				}
			}
		}
	}

	/* 表单信息样式 */
	.form-content {
		.form-field {
			margin-bottom: 30rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.field-label {
				font-size: 28rpx;
				font-weight: 500;
				color: #333333;
				margin-bottom: 12rpx;
			}
			
			.field-value {
				font-size: 26rpx;
				color: #666666;
				line-height: 1.6;
			}
			
			.textarea-content {
				background-color: #f8f9fa;
				padding: 24rpx;
				border-radius: 8rpx;
				line-height: 1.6;
				white-space: pre-wrap;
				word-break: break-all;
			}
			
			.array-items {
				.array-item {
					margin-bottom: 20rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.array-item-content {
						background-color: #f8f9fa;
						padding: 24rpx;
						border-radius: 8rpx;
					}
					
					.array-item-divider {
						height: 1px;
						background-color: #e4e7ed;
						margin: 16rpx 0;
					}
				}
			}
			
			.file-list {
				.file-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 20rpx 24rpx;
					background-color: #f8f9fa;
					border-radius: 8rpx;
					margin-bottom: 16rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.file-info {
						flex: 1;
						display: flex;
						align-items: center;
						overflow: hidden;
						
						.file-name {
							font-size: 26rpx;
							color: #333333;
							margin-left: 12rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
						
						.file-size {
							font-size: 22rpx;
							color: #999999;
							margin-left: 16rpx;
							flex-shrink: 0;
						}
					}
					
					.file-actions {
						display: flex;
						flex-shrink: 0;
						margin-left: 20rpx;
					}
				}
			}
			
			.empty-file {
				color: #999999;
			}
		}
	}

	/* 当前任务样式 */
	.current-tasks {
		.task-card {
			background-color: #fdf6ec;
			border: 1px solid #faecd8;
			border-radius: 12rpx;
			padding: 32rpx;
			margin-bottom: 24rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.task-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 24rpx;
				padding-bottom: 16rpx;
				border-bottom: 1px solid #faecd8;
				
				.task-title {
					display: flex;
					align-items: center;
					
					.task-name {
						font-size: 30rpx;
						font-weight: bold;
						color: #e6a23c;
						margin-left: 12rpx;
					}
				}
			}
			
			.task-content {
				.task-item {
					display: flex;
					align-items: center;
					margin-bottom: 12rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.task-text {
						font-size: 26rpx;
						color: #666666;
						margin-left: 12rpx;
						
						&.deadline {
							color: #fa3534;
						}
					}
				}
			}
		}
	}

	/* 处理表单样式 */
	.handle-form {
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
			}
		}
	}

	/* 修改提示样式 */
	.edit-prompt {
		::v-deep .u-alert {
			margin: 0;
			border-radius: 12rpx;
		}
	}

	/* 响应式设计 */
	@media (max-width: 750px) {
		.detail-section {
			padding: 30rpx 20rpx;
		}
		
		.info-grid {
			grid-template-columns: 1fr;
			gap: 20rpx;
			
			.info-row {
				.info-label {
					width: 200rpx;
				}
			}
		}
		
		.form-content .form-field .file-list .file-item {
			flex-direction: column;
			align-items: flex-start;
			
			.file-actions {
				margin-left: 0;
				margin-top: 16rpx;
				width: 100%;
				
				::v-deep .u-button {
					flex: 1;
				}
			}
		}
	}
</style>