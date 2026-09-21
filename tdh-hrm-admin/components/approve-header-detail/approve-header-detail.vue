<template>
	<view class="application-detail">
		<!-- 基本信息 -->
		<view class="detail-section" v-if="showBasicInfo">
			<view class="section-title">{{ basicInfoTitle }}</view>
			<view class="info-grid">
				<view class="info-item">
					<view class="info-label">申请单号：</view>
					<view class="info-value">{{ detailData._id }}</view>
				</view>
				<view class="info-item">
					<view class="info-label">申请人：</view>
					<view class="info-value">{{ detailData.applicant_name }}</view>
				</view>
				<view class="info-item">
					<view class="info-label">申请部门：</view>
					<view class="info-value">{{ detailData.applicant_department || '-' }}</view>
				</view>
				<view class="info-item">
					<view class="info-label">申请类型：</view>
					<view class="info-value">{{ getFormTypeName(detailData.form_type_code) }}</view>
				</view>
				<view class="info-item">
					<view class="info-label">申请状态：</view>
					<view class="info-value">
						<el-tag :type="getStatusType(detailData.status)" size="small">
							{{ getStatusText(detailData.status) }}
						</el-tag>
					</view>
				</view>
				<view class="info-item">
					<view class="info-label">申请时间：</view>
					<view class="info-value">{{ formatDate(detailData._add_time) }}</view>
				</view>
				<view class="info-item" v-if="detailData.current_task">
					<view class="info-label">当前环节：</view>
					<view class="info-value">{{ detailData.current_task }}</view>
				</view>
			</view>
		</view>

		<!-- 退回信息 -->
		<view class="detail-section" v-if="showReturnInfo && returnInfo">
			<view class="section-title">退回信息</view>
			<view class="info-grid">
				<view class="info-item">
					<view class="info-label">退回原因：</view>
					<view class="info-value">{{ returnInfo.returnReason || '-' }}</view>
				</view>
				<view class="info-item">
					<view class="info-label">退回环节：</view>
					<view class="info-value">{{ returnInfo.returnedFrom || '-' }}</view>
				</view>
				<view class="info-item">
					<view class="info-label">退回时间：</view>
					<view class="info-value">{{ formatDate(returnInfo.returnTime) }}</view>
				</view>
				<view class="info-item" v-if="returnInfo.task">
					<view class="info-label">当前任务：</view>
					<view class="info-value">
						<el-tag type="warning">{{ returnInfo.task.task_name }}</el-tag>
					</view>
				</view>
			</view>
		</view>

		<!-- 动态表单信息 - 重新排序字段 -->
		<view class="detail-section" v-if="formSchema && formSchema.fields">
			<view class="section-title">{{ formInfoTitle }}</view>
			<view class="info-grid">
				<!-- 普通字段 -->
				<view v-for="field in getNormalFields()" :key="field.name"
					:class="['info-item', { 'full-width': isFullWidthField(field) }]">
					<view class="info-label">{{ field.label }}：</view>
					<view class="info-value">
						<template v-if="field.type === 'textarea'">
							<view class="textarea-content">{{ getFieldDisplayValue(field) }}</view>
						</template>
						<template v-else>
							{{ getFieldDisplayValue(field) }}
						</template>
					</view>
				</view>
				<view v-for="field in getArrayObjectFields()" :key="field.name" class="info-item full-width">
					<view class="info-label">{{ field.label }}：</view>
					<view class="info-value">
						<view class="textarea-content">
							<div v-html="getFieldDisplayValue(field)"></div>
						</view>
					</view>
				</view>

				<!-- textarea 字段 - 显示在倒数第二 -->
				<view v-for="field in getTextareaFields()" :key="field.name" class="info-item full-width">
					<view class="info-label">{{ field.label }}：</view>
					<view class="info-value">
						<view class="textarea-content">{{ getFieldDisplayValue(field) }}</view>
					</view>
				</view>

				<!-- 文件字段 - 显示在最后 -->
				<view v-for="field in getFileFields()" :key="field.name" class="info-item full-width">
					<view class="info-label">{{ field.label }}：</view>
					<view class="info-value">
						<view class="file-attachments"
							v-if="getFieldValue(field.name) && getFieldValue(field.name).length > 0">
							<view v-for="(file, index) in getFieldValue(field.name)" :key="index"
								class="attachment-item">
								<i class="el-icon-document attachment-icon"></i>
								<span class="attachment-name">{{ file.name || file.url }}</span>
								<view class="attachment-actions">
									<el-button type="text" size="mini" @click="handlePreviewFile(file)">预览</el-button>
									<el-button type="text" size="mini" @click="handleDownloadFile(file)">下载</el-button>
								</view>
							</view>
						</view>
						<span v-else>-</span>
					</view>
				</view>
			</view>
		</view>

		<!-- 审批流程公共组件 -->
		<view class="detail-section" v-if="showApprovalFlow && processInfo.tasks && processInfo.tasks.length > 0">
			<approve-work-flow :tasks="processInfo.tasks" :history="statusHistory" :create-record="{
          create_time: detailData._add_time,
          operator_name: detailData.applicant_name,
          comment: '创建申请'
        }" :format-date-fn="formatDate" />
		</view>

		<!-- 当前任务信息 -->
		<view class="detail-section" v-if="showCurrentTask && currentTasks && currentTasks.length > 0">
			<view class="section-title">当前待办</view>
			<view class="current-tasks">
				<view v-for="(task, index) in currentTasks" :key="index" class="task-item">
					<view class="task-info">
						<view class="task-name">{{ task.task_name }}</view>
						<view class="task-assignee">处理人：{{ task.assignee_name || task.assignee }}</view>
						<view class="task-time">到达时间：{{ formatDate(task._add_time) }}</view>
						<view class="task-due" v-if="task.due_date">
							截止时间：{{ formatDate(task.due_date) }}
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 处理表单 -->
		<view class="detail-section" v-if="showHandleForm">
			<view class="section-title">{{ handleFormTitle }}</view>
			<slot name="handle-form">
				<!-- 默认处理表单内容，可由父组件覆盖 -->
				<el-form :model="handleForm" :rules="handleFormRules" ref="handleFormRef" label-width="100px">
					<el-form-item label="处理方式" prop="action" required>
						<el-radio-group v-model="handleForm.action" @change="onHandleActionChange">
							<el-radio label="resubmit">重新提交</el-radio>
							<el-radio label="withdraw">撤回申请</el-radio>
						</el-radio-group>
					</el-form-item>

					<el-form-item label="修改说明" prop="modify_comment" v-if="handleForm.action === 'resubmit'" required>
						<el-input v-model="handleForm.modify_comment" type="textarea" :rows="3" placeholder="请说明修改的内容"
							maxlength="500" show-word-limit />
					</el-form-item>

					<el-form-item label="撤回原因" prop="withdraw_reason" v-if="handleForm.action === 'withdraw'" required>
						<el-input v-model="handleForm.withdraw_reason" type="textarea" :rows="3"
							placeholder="请说明撤回申请的原因" maxlength="500" show-word-limit />
					</el-form-item>
				</el-form>
			</slot>
		</view>

		<!-- 申请信息修改提示 -->
		<view class="detail-section" v-if="showEditPrompt && handleForm.action === 'resubmit'">
			<view class="section-title">申请信息修改</view>
			<view class="form-preview">
				<el-alert type="info" :closable="false">
					如需修改申请信息，请点击下方"修改申请信息"按钮
				</el-alert>
				<el-button type="primary" size="small" @click="handleEditApplication" style="margin-top: 10px;">
					修改申请信息
				</el-button>
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
			// 数据相关
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

			// 显示控制
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

			// 标题自定义
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

			// 表单相关
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

			// 工具函数
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
						trigger: ['blur', 'change']
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
			// 合并默认规则和传入的规则
			mergedHandleFormRules() {
				return {
					...this.defaultHandleFormRules,
					...this.handleFormRules
				};
			}
		},
		methods: {
			// 表单验证
			validateForm() {
				return this.$refs.handleFormRef.validate();
			},

			clearFormValidation() {
				if (this.$refs.handleFormRef) {
					this.$refs.handleFormRef.clearValidate();
				}
			},

			// 事件处理
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

			// 获取普通字段（不包括 textarea 和 file）
			getNormalFields() {
				if (!this.formSchema || !this.formSchema.fields) return [];

				return this.formSchema.fields.filter(field => {
					return field.type !== 'textarea' && field.type !== 'file' && field.type !== 'array<object>';
				});
			},

			// 获取 textarea 字段
			getTextareaFields() {
				if (!this.formSchema || !this.formSchema.fields) return [];

				return this.formSchema.fields.filter(field => {
					return field.type === 'textarea';
				});
			},

			// 获取 array<object> 字段
			getArrayObjectFields() {
				if (!this.formSchema || !this.formSchema.fields) return [];

				return this.formSchema.fields.filter(field => {
					return field.type === 'array<object>';
				});
			},

			// 获取 file 字段
			getFileFields() {
				if (!this.formSchema || !this.formSchema.fields) return [];

				return this.formSchema.fields.filter(field => {
					return field.type === 'file';
				});
			},

			// 判断字段是否占满整行
			isFullWidthField(field) {
				return field.type === 'textarea' || field.type === 'file';
			},

			// 获取字段值
			getFieldValue(fieldName) {
				if (!this.detailData || !this.detailData.form_data) return null;
				return this.detailData.form_data[fieldName];
			},

			// 获取字段显示值
			getFieldDisplayValue(field) {
				const value = this.getFieldValue(field.name);

				// 如果提供了自定义格式化函数，优先使用
				if (this.fieldValueFormatter) {
					const formattedValue = this.fieldValueFormatter(field.name, value, field);
					if (formattedValue !== undefined) return formattedValue;
				}

				// 处理空值
				if (value === null || value === undefined || value === '') {
					return '-';
				}

				// ========== 特殊处理：total_minutes 统一以“X小时Y分钟”显示 ==========
				if (field.name === 'total_minutes') {
					if (typeof vk !== 'undefined' && vk.myfn && typeof vk.myfn.formatMinutes === 'function') {
						return vk.myfn.formatMinutes(value);
					}					
				}
				// =====================================================================

				// 1. 如果字段有 displayNameKey，优先使用 displayNameKey 对应的值作为显示文本
				if (field.displayNameKey) {
					const displayValue = this.getFieldValue(field.displayNameKey);
					if (displayValue != null && displayValue !== '') {
						return displayValue;
					}
				}

				// 2. 处理选择框字段（包括 select、remote-select、table-select、cascader）
				const selectTypes = ['select', 'remote-select', 'table-select', 'cascader'];
				if (selectTypes.includes(field.type)) {
					if (field.options && Array.isArray(field.options)) {
						const option = field.options.find(opt => opt.value === value);
						if (option) return option.label;
					}
					const labelKey = field.name + '_label';
					const labelValue = this.getFieldValue(labelKey);
					if (labelValue != null && labelValue !== '') return labelValue;
					return value;
				}

				// 3. 处理日期字段
				if (field.type === 'date' || field.type === 'datetime') {
					return this.formatDate(value, field.type === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd hh:mm:ss');
				}

				// 4. 处理 array<object>
				if (field.type === 'array<object>') {
					return vk.myfn.formatArrayObjectField(field, value);
				}

				// 默认返回原值
				return value;
			},

			// 使用字段列表格式化
			formatWithFieldList(item, fieldList) {
				const parts = fieldList.map(fieldConfig => {
					let fieldName, label;

					if (typeof fieldConfig === 'string') {
						fieldName = fieldConfig;
						label = this.getFieldLabel(fieldName);
					} else if (fieldConfig && typeof fieldConfig === 'object') {
						fieldName = fieldConfig.name || fieldConfig.field;
						label = fieldConfig.label || this.getFieldLabel(fieldName);
					} else {
						return '';
					}

					const value = this.getNestedProperty(item, fieldName);

					if (fieldConfig.transform && typeof fieldConfig.transform === 'function') {
						return `${label}: ${fieldConfig.transform(value)}`;
					}

					return `${label}: ${value !== undefined && value !== null ? value : ''}`;
				});

				return parts.filter(part => part).join('; ');
			},

			// 获取嵌套属性值
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

			// 获取表单类型名称
			getFormTypeName(formTypeCode) {
				const formType = this.formTypeConfigs[formTypeCode];
				return formType ? formType.name : formTypeCode;
			},

			getStatusType(status) {
				const typeMap = {
					draft: 'info',
					pending: 'warning',
					approved: 'success',
					rejected: 'danger',
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
					}

					&.full-width {
						grid-column: 1 / -1;
					}
				}
			}

			.textarea-content {
				background: #f5f7fa;
				padding: 16px;
				border-radius: 4px;
				line-height: 1.6;
				white-space: pre-wrap;
			}

			.file-attachments {
				.attachment-item {
					display: flex;
					align-items: center;
					padding: 8px 12px;
					margin-bottom: 8px;
					background: #f5f7fa;
					border-radius: 4px;

					&:last-child {
						margin-bottom: 0;
					}

					.attachment-icon {
						color: #409eff;
						margin-right: 8px;
						font-size: 16px;
					}

					.attachment-name {
						flex: 1;
						color: #303133;
						font-size: 14px;
					}

					.attachment-actions {
						.el-button {
							margin-left: 8px;
						}
					}
				}
			}

			.current-tasks {
				.task-item {
					border: 1px solid #e6a23c;
					border-radius: 4px;
					padding: 12px;
					margin-bottom: 8px;
					background: #fdf6ec;

					.task-info {
						.task-name {
							font-weight: bold;
							color: #e6a23c;
							margin-bottom: 4px;
						}

						.task-assignee {
							color: #606266;
							font-size: 14px;
							margin-bottom: 2px;
						}

						.task-time {
							color: #909399;
							font-size: 12px;
							margin-bottom: 2px;
						}

						.task-due {
							color: #f56c6c;
							font-size: 12px;
						}
					}
				}
			}

			// 表单样式
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

			.form-preview {
				.el-alert {
					margin-bottom: 0;
				}
			}
		}
	}

	// 响应式调整
	@media (max-width: 768px) {
		.application-detail .detail-section .info-grid {
			grid-template-columns: 1fr;
			gap: 12px;
		}
	}
</style>