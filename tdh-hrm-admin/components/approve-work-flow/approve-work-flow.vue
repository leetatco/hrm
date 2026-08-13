<template>
	<view class="approval-flow-container">
		<!-- 审批流程信息 -->
		<view class="detail-section" v-if="tasks && tasks.length > 0">
			<view class="section-title">
				{{ title || '审批流程' }}
				<span class="process-summary">
					(共 {{ tasks.length }} 个环节，已完成 {{ completedTasksCount }} 个)
				</span>
			</view>
			<view class="process-flow-container">
				<!-- 流程状态图例 -->
				<view class="process-legend">
					<view class="legend-item">
						<view class="legend-color completed"></view>
						<span>已完成</span>
					</view>
					<view class="legend-item">
						<view class="legend-color current"></view>
						<span>当前环节</span>
					</view>
					<view class="legend-item">
						<view class="legend-color waiting"></view>
						<span>待处理</span>
					</view>
					<view class="legend-item">
						<view class="legend-color rejected"></view>
						<span>已驳回</span>
					</view>
					<view class="legend-item">
						<view class="legend-color cancelled"></view>
						<span>已取消</span>
					</view>
				</view>

				<!-- 横向流程步骤条 -->
				<view class="process-steps-horizontal">
					<view v-for="(task, index) in tasks" :key="task._id"
						:class="['process-step-horizontal', getStepStatusClass(task)]">
						<view class="step-circle">
							<view class="step-icon" :class="getStepIconClass(task)">
								<i :class="getStepIcon(task)"></i>
							</view>
							<view class="step-index">{{ index + 1 }}</view>
						</view>
						<view class="step-content">
							<view class="step-name">{{ task.task_name }}</view>
							<view class="step-assignee">
								<i class="el-icon-user"></i>
								{{ task.assignee_name || task.assignee }}
							</view>
							<view class="step-time" v-if="task.complete_time">
								{{ formatDate(task.complete_time, 'MM-dd hh:mm') }}
							</view>
							<view class="step-comment" v-if="task.comment">
								{{ task.comment }}
							</view>
						</view>
						<view class="step-connector" v-if="index < tasks.length - 1">
							<view class="connector-line" :class="getConnectorClass(task, tasks[index + 1])"></view>
							<i class="el-icon-arrow-right" :class="getConnectorIconClass(task, tasks[index + 1])"></i>
						</view>
					</view>
				</view>

				<!-- 纵向流程步骤条（备用方案） -->
				<view class="process-steps-vertical">
					<view v-for="(task, index) in tasks" :key="task._id + '_vertical'"
						:class="['process-step-vertical', getStepStatusClass(task)]">
						<view class="step-header">
							<view class="step-left">
								<view class="step-circle-vertical">
									<view class="step-icon-vertical" :class="getStepIconClass(task)">
										<i :class="getStepIcon(task)"></i>
									</view>
									<view class="step-index-vertical">{{ index + 1 }}</view>
								</view>
								<view class="step-connector-vertical" v-if="index < tasks.length - 1">
									<view class="connector-line-vertical"
										:class="getConnectorClass(task, tasks[index + 1])"></view>
								</view>
							</view>
							<view class="step-content-vertical">
								<view class="step-main-info">
									<view class="step-name-vertical">{{ task.task_name }}</view>
									<view class="step-status-vertical">
										<el-tag :type="getTaskStatusType(task.status)" size="small">
											{{ getTaskStatusText(task.status) }}
										</el-tag>
									</view>
								</view>
								<view class="step-details-vertical">
									<view class="step-assignee-vertical">
										<i class="el-icon-user"></i>
										处理人: {{ task.assignee_name || task.assignee }}
									</view>
									<view class="step-time-vertical" v-if="task.complete_time">
										<i class="el-icon-time"></i>
										处理时间: {{ formatDate(task.complete_time) }}
									</view>
									<view class="step-comment-vertical" v-if="task.comment">
										<i class="el-icon-chat-dot-round"></i>
										审批意见: {{ task.comment }}
									</view>
									<view class="step-actions-vertical" v-if="task.actions && task.actions.length > 0">
										<el-tag v-for="action in task.actions" :key="action" size="mini"
											:type="getActionTagType(action)" class="action-tag">
											{{ getActionText(action) }}
										</el-tag>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 审批记录 -->
		<view class="detail-section">
			<view class="section-title">{{ historyTitle || '审批记录' }}</view>
			<view class="approval-history">
				<view class="history-timeline">
					<view v-for="(record, index) in history" :key="index"
						:class="['history-item', getHistoryItemClass(record)]">
						<view class="timeline-node">
							<view class="node-icon" :class="getHistoryIconClass(record)">
								<i :class="getHistoryIcon(record)"></i>
							</view>
							<view class="timeline-connector" v-if="index < history.length - 1"></view>
						</view>
						<view class="history-content">
							<view class="history-header">
								<view class="history-action">
									<el-tag :type="getActionType(record.action)" size="small">
										{{ getActionText(record.action) }}
									</el-tag>
								</view>
								<view class="history-time">{{ formatDate(record.operation_time) }}</view>
							</view>
							<view class="history-details">
								<view class="history-operator">
									<i class="el-icon-user"></i>
									操作人: {{ record.operator_name }}
								</view>
								<view class="history-task" v-if="record.task_name">
									<i class="el-icon-s-operation"></i>
									环节: {{ record.task_name }}
								</view>
								<view class="history-comment" v-if="record.comment">
									<i class="el-icon-chat-dot-round"></i>
									意见: {{ record.comment }}
								</view>
							</view>
						</view>
					</view>

					<!-- 如果没有审批记录，显示创建记录 -->
					<view class="history-item history-create" v-if="history.length === 0 && createRecord">
						<view class="timeline-node">
							<view class="node-icon history-create-icon">
								<i class="el-icon-document-add"></i>
							</view>
						</view>
						<view class="history-content">
							<view class="history-header">
								<view class="history-action">
									<el-tag type="info" size="small">创建申请</el-tag>
								</view>
								<view class="history-time">{{ formatDate(createRecord.create_time) }}</view>
							</view>
							<view class="history-details">
								<view class="history-operator">
									<i class="el-icon-user"></i>
									操作人: {{ createRecord.operator_name }}
								</view>
								<view class="history-comment">{{ createRecord.comment || '创建申请' }}</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'ApproveWorkFlow',
		props: {
			// 任务列表
			tasks: {
				type: Array,
				default: () => []
			},
			// 审批历史记录
			history: {
				type: Array,
				default: () => []
			},
			// 创建记录信息
			createRecord: {
				type: Object,
				default: null
			},
			// 标题
			title: {
				type: String,
				default: '审批流程'
			},
			// 历史记录标题
			historyTitle: {
				type: String,
				default: '审批记录'
			},
			// 日期格式化函数
			formatDateFn: {
				type: Function,
				default: null
			}
		},
		computed: {
			completedTasksCount() {
				if (!this.tasks) return 0;
				return this.tasks.filter(task =>
					task.status === 'completed' && task.action !== 'reject'
				).length;
			},
			pendingTasksCount() {
				if (!this.tasks) return 0;
				return this.tasks.filter(task => task.status === 'pending').length;
			},
			waitingTasksCount() {
				if (!this.tasks) return 0;
				return this.tasks.filter(task => task.status === 'waiting').length;
			}
		},
		methods: {
			// 日期格式化
			formatDate(timestamp, formatStr) {
				if (this.formatDateFn) {
					return this.formatDateFn(timestamp, formatStr);
				}
				if (!timestamp) return '-';
				// 简单的日期格式化，可以根据需要扩展
				const date = new Date(timestamp);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');

				if (formatStr === 'MM-dd hh:mm') {
					return `${month}-${day} ${hours}:${minutes}`;
				}

				return `${year}-${month}-${day} ${hours}:${minutes}`;
			},

			// 获取步骤状态样式类
			getStepStatusClass(task) {
				const status = task.status;
				const action = task.action;

				if (action === 'reject') {
					return 'step-rejected';
				}

				if (status === 'completed') {
					return 'step-completed';
				} else if (status === 'pending') {
					return 'step-current';
				} else if (status === 'waiting') {
					return 'step-waiting';
				} else if (status === 'cancelled') {
					return 'step-cancelled';
				}

				return 'step-waiting';
			},

			// 获取步骤图标样式类
			getStepIconClass(task) {
				const statusClass = this.getStepStatusClass(task);
				return `${statusClass}-icon`;
			},

			// 获取步骤图标
			getStepIcon(task) {
				const status = task.status;
				const action = task.action;

				if (action === 'reject') {
					return 'el-icon-close';
				}

				if (status === 'completed') {
					return 'el-icon-check';
				} else if (status === 'pending') {
					return 'el-icon-loading';
				} else if (status === 'waiting') {
					return 'el-icon-time';
				} else if (status === 'cancelled') {
					return 'el-icon-turn-off';
				}

				return 'el-icon-time';
			},

			// 获取连接线样式
			getConnectorClass(currentTask, nextTask) {
				const currentStatus = this.getStepStatusClass(currentTask);
				const nextStatus = this.getStepStatusClass(nextTask);

				if (currentStatus === 'step-completed' && nextStatus === 'step-completed') {
					return 'connector-completed';
				} else if (currentStatus === 'step-completed' && nextStatus !== 'step-completed') {
					return 'connector-partial';
				} else {
					return 'connector-waiting';
				}
			},

			// 获取连接线图标样式
			getConnectorIconClass(currentTask, nextTask) {
				const connectorClass = this.getConnectorClass(currentTask, nextTask);
				return `${connectorClass}-icon`;
			},

			// 获取历史记录项样式类
			getHistoryItemClass(record) {
				const action = record.action;
				if (action === 'approve') {
					return 'history-approve';
				} else if (action === 'reject') {
					return 'history-reject';
				} else if (action === 'return') {
					return 'history-return';
				} else if (action === 'create') {
					return 'history-create';
				}
				return 'history-default';
			},

			// 获取历史记录图标样式类
			getHistoryIconClass(record) {
				const itemClass = this.getHistoryItemClass(record);
				return `${itemClass}-icon`;
			},

			// 获取历史记录图标
			getHistoryIcon(record) {
				const action = record.action;
				if (action === 'approve') {
					return 'el-icon-check';
				} else if (action === 'reject') {
					return 'el-icon-close';
				} else if (action === 'return') {
					return 'el-icon-back';
				} else if (action === 'create') {
					return 'el-icon-document-add';
				} else if (action === 'transfer') {
					return 'el-icon-right';
				}
				return 'el-icon-document';
			},

			// 获取任务状态类型
			getTaskStatusType(status) {
				const typeMap = {
					'pending': 'warning',
					'completed': 'success',
					'cancelled': 'info',
					'transferred': 'info',
					'waiting': 'info'
				};
				return typeMap[status] || 'info';
			},

			// 获取任务状态文本
			getTaskStatusText(status) {
				const textMap = {
					'pending': '待处理',
					'completed': '已完成',
					'cancelled': '已取消',
					'transferred': '已转办',
					'waiting': '等待中'
				};
				return textMap[status] || status;
			},

			// 1. getActionType 中追加 resubmit
			getActionType(action) {
			    const typeMap = {
			        'approve': 'success',
			        'reject': 'danger',
			        'return': 'warning',
			        'transfer': 'info',
			        'delegate': 'info',
			        'create': 'info',
			        'complete': 'success',
			        'claim': 'warning',
			        'withdraw': 'info',
			        'add_sign': 'primary',
			        'add_sign_complete': 'success',
			        'confirm': 'warning',
			        'resubmit': 'info'        // 新增
			    };
			    return typeMap[action] || 'info';
			},
			
			// 2. getActionText 中追加 resubmit
			getActionText(action) {
			    const textMap = {
			        'approve': '同意',
			        'reject': '驳回',
			        'return': '退回',
			        'transfer': '转办',
			        'create': '创建',
			        'complete': '完成',
			        'withdraw': '撤回',
			        'add_sign': '加签',
			        'add_sign_complete': '加签完成',
			        'confirm': '确认',
			        'resubmit': '重新提交'    // 新增
			    };
			    return textMap[action] || action;
			},
			
			// 3. getActionTagType 中修正 add_sign 的错误值，并补充 resubmit
			getActionTagType(action) {
			    const typeMap = {
			        'approve': 'success',
			        'reject': 'danger',
			        'return': 'warning',
			        'transfer': 'info',
			        'delegate': 'info',
			        'create': 'info',
			        'complete': 'success',
			        'claim': 'warning',
			        'withdraw': 'info',
			        'add_sign': 'primary',            // 修正之前错误的文本
			        'add_sign_complete': 'success',   // 修正之前错误的文本
			        'confirm': 'warning',             // 修正之前错误的文本
			        'resubmit': 'info'                // 新增
			    };
			    return typeMap[action] || 'info';
			}
		}
	};
</script>

<style lang="scss" scoped>
	.approval-flow-container {
		width: 100%;
	}

	/* 审批流程样式 */
	.process-flow-container {
		margin-top: 16px;
	}

	.process-legend {
		display: flex;
		justify-content: center;
		margin-bottom: 24px;
		padding: 12px;
		background: #f8f9fa;
		border-radius: 8px;
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		margin: 0 16px;
	}

	.legend-color {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		margin-right: 8px;
	}

	.legend-color.completed {
		background: #52c41a;
		border: 2px solid #b7eb8f;
	}

	.legend-color.current {
		background: #1890ff;
		border: 2px solid #91d5ff;
		animation: pulse 2s infinite;
	}

	.legend-color.waiting {
		background: #d9d9d9;
		border: 2px solid #f5f5f5;
	}

	.legend-color.rejected {
		background: #ff4d4f;
		border: 2px solid #ffccc7;
	}

	.legend-color.cancelled {
		background: #faad14;
		border: 2px solid #ffe58f;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(1.1);
		}

		100% {
			transform: scale(1);
		}
	}

	/* 横向流程步骤 */
	.process-steps-horizontal {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 32px;
		position: relative;
	}

	.process-step-horizontal {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		position: relative;
		min-width: 120px;
	}

	.step-circle {
		position: relative;
		width: 60px;
		height: 60px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12px;
		z-index: 2;
	}

	/* 步骤状态样式 */
	.step-completed .step-circle {
		background: #f6ffed;
		border: 3px solid #52c41a;
		box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
	}

	.step-current .step-circle {
		background: #f0f9ff;
		border: 3px solid #1890ff;
		box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
	}

	.step-waiting .step-circle {
		background: #fafafa;
		border: 3px solid #d9d9d9;
	}

	.step-rejected .step-circle {
		background: #fff2f0;
		border: 3px solid #ff4d4f;
		box-shadow: 0 2px 8px rgba(255, 77, 79, 0.2);
	}

	.step-cancelled .step-circle {
		background: #fffbe6;
		border: 3px solid #faad14;
	}

	.step-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 16px;
	}

	.completed-icon {
		background: #52c41a;
	}

	.current-icon {
		background: #1890ff;
	}

	.waiting-icon {
		background: #d9d9d9;
	}

	.rejected-icon {
		background: #ff4d4f;
	}

	.cancelled-icon {
		background: #faad14;
	}

	.step-index {
		position: absolute;
		top: -5px;
		right: -5px;
		background: white;
		border: 2px solid currentColor;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: bold;
		color: inherit;
	}

	.step-completed .step-index {
		color: #52c41a;
	}

	.step-current .step-index {
		color: #1890ff;
	}

	.step-waiting .step-index {
		color: #d9d9d9;
	}

	.step-rejected .step-index {
		color: #ff4d4f;
	}

	.step-cancelled .step-index {
		color: #faad14;
	}

	.step-content {
		text-align: center;
		max-width: 120px;
	}

	.step-name {
		font-weight: bold;
		margin-bottom: 4px;
		font-size: 14px;
	}

	.step-assignee {
		font-size: 12px;
		color: #666;
		margin-bottom: 4px;
	}

	.step-time {
		font-size: 11px;
		color: #999;
		margin-bottom: 4px;
	}

	.step-comment {
		font-size: 11px;
		color: #666;
		background: #f5f5f5;
		padding: 2px 6px;
		border-radius: 4px;
		margin-top: 4px;
		word-break: break-all;
	}

	.step-connector {
		position: absolute;
		top: 30px;
		right: -50%;
		width: 100%;
		display: flex;
		align-items: center;
		z-index: 1;
	}

	.connector-line {
		flex: 1;
		height: 2px;
		margin: 0 8px;
	}

	.connector-completed {
		background: linear-gradient(90deg, #52c41a, #52c41a);
	}

	.connector-partial {
		background: linear-gradient(90deg, #52c41a, #d9d9d9);
	}

	.connector-waiting {
		background: #d9d9d9;
	}

	.connector-completed-icon {
		color: #52c41a;
	}

	.connector-partial-icon {
		color: #1890ff;
	}

	.connector-waiting-icon {
		color: #d9d9d9;
	}

	/* 纵向流程步骤 */
	.process-steps-vertical {
		display: none;
		/* 默认隐藏，可以根据需要显示 */
	}

	.process-step-vertical {
		margin-bottom: 24px;
	}

	.step-header {
		display: flex;
	}

	.step-left {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 16px;
	}

	.step-circle-vertical {
		position: relative;
		width: 50px;
		height: 50px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
	}

	.step-completed .step-circle-vertical {
		background: #f6ffed;
		border: 2px solid #52c41a;
	}

	.step-current .step-circle-vertical {
		background: #f0f9ff;
		border: 2px solid #1890ff;
	}

	.step-waiting .step-circle-vertical {
		background: #fafafa;
		border: 2px solid #d9d9d9;
	}

	.step-rejected .step-circle-vertical {
		background: #fff2f0;
		border: 2px solid #ff4d4f;
	}

	.step-icon-vertical {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 14px;
	}

	.step-index-vertical {
		position: absolute;
		top: -3px;
		right: -3px;
		background: white;
		border: 1px solid currentColor;
		border-radius: 50%;
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: bold;
	}

	.step-connector-vertical {
		flex: 1;
		width: 2px;
		margin: 8px 0;
	}

	.connector-line-vertical {
		width: 100%;
		height: 100%;
	}

	.step-content-vertical {
		flex: 1;
		padding: 12px;
		border-radius: 8px;
		background: #fafafa;
	}

	.step-completed .step-content-vertical {
		background: #f6ffed;
		border-left: 4px solid #52c41a;
	}

	.step-current .step-content-vertical {
		background: #f0f9ff;
		border-left: 4px solid #1890ff;
	}

	.step-waiting .step-content-vertical {
		background: #fafafa;
		border-left: 4px solid #d9d9d9;
	}

	.step-rejected .step-content-vertical {
		background: #fff2f0;
		border-left: 4px solid #ff4d4f;
	}

	.step-main-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.step-name-vertical {
		font-weight: bold;
		font-size: 16px;
	}

	.step-details-vertical {
		font-size: 14px;
		color: #666;
	}

	.step-assignee-vertical,
	.step-time-vertical,
	.step-comment-vertical {
		margin-bottom: 4px;
		display: flex;
		align-items: center;
	}

	.step-assignee-vertical i,
	.step-time-vertical i,
	.step-comment-vertical i {
		margin-right: 6px;
		color: #999;
	}

	.step-actions-vertical {
		margin-top: 8px;
	}

	/* 审批记录时间线 */
	.approval-history {
		margin-top: 16px;
	}

	.history-timeline {
		position: relative;
		padding-left: 24px;
	}

	.history-item {
		display: flex;
		margin-bottom: 24px;
		position: relative;
	}

	.timeline-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 16px;
	}

	.node-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 18px;
		z-index: 2;
	}

	.history-approve-icon {
		background: #52c41a;
		box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
	}

	.history-reject-icon {
		background: #ff4d4f;
		box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);
	}

	.history-return-icon {
		background: #faad14;
		box-shadow: 0 2px 8px rgba(250, 173, 20, 0.3);
	}

	.history-create-icon {
		background: #1890ff;
		box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
	}

	.history-default-icon {
		background: #d9d9d9;
	}

	.timeline-connector {
		width: 2px;
		flex: 1;
		background: #e8e8e8;
		margin: 8px 0;
		min-height: 20px;
	}

	.history-content {
		flex: 1;
		padding: 16px;
		border-radius: 8px;
		background: #fafafa;
	}

	.history-approve .history-content {
		background: #f6ffed;
		border-left: 4px solid #52c41a;
	}

	.history-reject .history-content {
		background: #fff2f0;
		border-left: 4px solid #ff4d4f;
	}

	.history-return .history-content {
		background: #fffbe6;
		border-left: 4px solid #faad14;
	}

	.history-create .history-content {
		background: #f0f9ff;
		border-left: 4px solid #1890ff;
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.history-details {
		font-size: 14px;
		color: #666;
	}

	.history-operator,
	.history-task,
	.history-comment {
		margin-bottom: 6px;
		display: flex;
		align-items: flex-start;
	}

	.history-operator i,
	.history-task i,
	.history-comment i {
		margin-right: 8px;
		color: #999;
		margin-top: 2px;
	}

	.history-comment {
		background: white;
		padding: 8px 12px;
		border-radius: 4px;
		border: 1px solid #e8e8e8;
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.process-steps-horizontal {
			flex-direction: column;
			align-items: flex-start;
		}

		.process-step-horizontal {
			flex-direction: row;
			width: 100%;
			margin-bottom: 16px;
		}

		.step-circle {
			margin-bottom: 0;
			margin-right: 12px;
		}

		.step-content {
			text-align: left;
			max-width: none;
			flex: 1;
		}

		.step-connector {
			display: none;
		}

		.process-legend {
			justify-content: flex-start;
		}

		.legend-item {
			margin: 4px 12px;
		}
	}

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
	}

	.process-summary {
		font-size: 14px;
		color: #606266;
		font-weight: normal;
		margin-left: 8px;
	}

	.action-tag {
		margin-right: 4px;
		margin-bottom: 4px;
	}
</style>