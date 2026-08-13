<template>
	<view class="approval-flow-container">
		<!-- 审批流程信息 -->
		<view class="detail-section" v-if="tasks && tasks.length > 0">
			<view class="section-header">
				<view class="section-summary">
					<view class="summary-item">
						<text class="summary-label">环节总数</text>
						<text class="summary-value">{{ tasks.length }}个</text>
					</view>
					<view class="summary-item">
						<text class="summary-label">已完成</text>
						<text class="summary-value completed">{{ completedTasksCount }}个</text>
					</view>
				</view>
			</view>

			<!-- 流程状态图例 -->
			<view class="process-legend">
				<view class="legend-item" v-for="item in legendList" :key="item.type">
					<view class="legend-dot" :class="item.type"></view>
					<text class="legend-text">{{ item.text }}</text>
				</view>
			</view>

			<!-- 纵向流程步骤 -->
			<view class="process-steps-vertical">
				<view v-for="(task, index) in tasks" :key="task._id" class="step-vertical-item">
					<!-- 左侧时间线节点 -->
					<view class="step-vertical-node">
						<view class="step-icon-wrapper" :class="getStepStatusClass(task)">
							<u-icon :name="getStepIcon(task)" size="28" color="#ffffff"></u-icon>
						</view>
						<!-- 纵向连接线（除最后一个外） -->
						<view class="step-vertical-connector" v-if="index < tasks.length - 1"></view>
					</view>

					<!-- 右侧内容卡片 -->
					<view class="step-vertical-content">
						<view class="step-header">
							<text class="step-name">{{ task.task_name || '审批环节' }}</text>
							<u-tag :text="getTaskStatusText(task.status)" :type="getTaskStatusType(task.status)"
								size="mini" shape="plain"></u-tag>
						</view>

						<view class="step-details">
							<view class="detail-item" v-if="task.assignee_name || task.assignee">
								<u-icon name="account" size="24" color="#8c8c8c"></u-icon>
								<text class="detail-text">处理人: {{ task.assignee_name || task.assignee }}</text>
							</view>

							<!-- 会签进度 -->
							<view class="detail-item" v-if="task.required_approvals > 1">
								<u-icon name="people" size="24" color="#2979ff"></u-icon>
								<text class="detail-text highlight">
									{{ task.current_approvals || 0 }}/{{ task.required_approvals }} 人已同意
								</text>
							</view>

							<view class="detail-item" v-if="task.complete_time">
								<u-icon name="calendar" size="24" color="#8c8c8c"></u-icon>
								<text class="detail-text">{{ formatDate(task.complete_time, 'MM-dd hh:mm') }}</text>
							</view>

							<view class="detail-item" v-if="task.comment">
								<u-icon name="chat-fill" size="24" color="#8c8c8c"></u-icon>
								<text class="detail-text">{{ task.comment }}</text>
							</view>
						</view>

						<!-- 操作标签 -->
						<view class="step-actions" v-if="task.actions && task.actions.length > 0">
							<view class="actions-tags">
								<view v-for="action in task.actions" :key="action" class="action-tag">
									<u-tag :text="getActionText(action)" :type="getActionTagType(action)" size="mini"
										shape="plain"></u-tag>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 审批记录 -->
		<view class="detail-section">
			<view class="section-header">
				<view class="section-title">
					<u-icon name="file-text" size="32" color="#2979ff" style="margin-right: 12rpx;"></u-icon>
					<text>{{ historyTitle || '审批记录' }}</text>
				</view>
			</view>

			<view class="approval-history">
				<view class="timeline-container">
					<view v-for="(record, index) in history" :key="index"
						:class="['timeline-item', getHistoryItemClass(record)]">
						<view class="timeline-node">
							<view class="node-icon" :class="getHistoryItemClass(record)">
								<u-icon :name="getHistoryIcon(record)" size="22" color="#ffffff"></u-icon>
							</view>
							<view class="timeline-connector" v-if="index < history.length - 1"></view>
						</view>

						<view class="timeline-content">
							<view class="timeline-header">
								<view class="timeline-action">
									<u-tag :text="getActionText(record.action)" :type="getActionType(record.action)"
										size="mini" shape="plain"></u-tag>
								</view>
								<text class="timeline-time">{{ formatDate(record.operation_time) }}</text>
							</view>

							<view class="timeline-body">
								<view class="timeline-row">
									<u-icon name="account-fill" size="22" color="#8c8c8c"
										style="margin-right: 8rpx;"></u-icon>
									<text class="timeline-text">操作人: {{ record.operator_name || '未知' }}</text>
								</view>

								<view class="timeline-row" v-if="record.task_name">
									<u-icon name="order" size="22" color="#8c8c8c" style="margin-right: 8rpx;"></u-icon>
									<text class="timeline-text">环节: {{ record.task_name }}</text>
								</view>

								<view class="timeline-row" v-if="record.comment">
									<u-icon name="chat-fill" size="22" color="#8c8c8c"
										style="margin-right: 8rpx;"></u-icon>
									<text class="timeline-text">{{ record.comment }}</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 创建记录 -->
					<view class="timeline-item timeline-create" v-if="history.length === 0 && createRecord">
						<view class="timeline-node">
							<view class="node-icon timeline-create">
								<u-icon name="plus-circle" size="22" color="#ffffff"></u-icon>
							</view>
						</view>

						<view class="timeline-content">
							<view class="timeline-header">
								<view class="timeline-action">
									<u-tag text="创建申请" type="info" size="mini" shape="plain"></u-tag>
								</view>
								<text class="timeline-time">{{ formatDate(createRecord.create_time) }}</text>
							</view>

							<view class="timeline-body">
								<view class="timeline-row">
									<u-icon name="account-fill" size="22" color="#8c8c8c"
										style="margin-right: 8rpx;"></u-icon>
									<text class="timeline-text">操作人: {{ createRecord.operator_name || '未知' }}</text>
								</view>

								<view class="timeline-row" v-if="createRecord.comment">
									<u-icon name="chat-fill" size="22" color="#8c8c8c"
										style="margin-right: 8rpx;"></u-icon>
									<text class="timeline-text">{{ createRecord.comment || '创建申请' }}</text>
								</view>
							</view>
						</view>
					</view>

					<view class="empty-state" v-if="history.length === 0 && !createRecord">
						<u-empty mode="list" icon="/static/empty-data.png">
							<text slot="text">暂无审批记录</text>
						</u-empty>
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
			tasks: {
				type: Array,
				default: () => []
			},
			history: {
				type: Array,
				default: () => []
			},
			createRecord: {
				type: Object,
				default: null
			},
			title: {
				type: String,
				default: '审批流程'
			},
			historyTitle: {
				type: String,
				default: '审批记录'
			},
			formatDateFn: {
				type: Function,
				default: null
			}
		},
		data() {
			return {
				legendList: [{
						type: 'completed',
						text: '已完成'
					},
					{
						type: 'current',
						text: '当前环节'
					},
					{
						type: 'waiting',
						text: '待处理'
					},
					{
						type: 'rejected',
						text: '已驳回'
					},
					{
						type: 'cancelled',
						text: '已取消'
					}
				]
			};
		},
		computed: {
			completedTasksCount() {
				if (!this.tasks) return 0;
				return this.tasks.filter(task =>
					task.status === 'completed' && task.action !== 'reject'
				).length;
			}
		},
		methods: {
			formatDate(timestamp, formatStr) {
				if (this.formatDateFn) return this.formatDateFn(timestamp, formatStr);
				if (!timestamp) return '-';
				const date = new Date(timestamp);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				if (formatStr === 'MM-dd hh:mm') return `${month}-${day} ${hours}:${minutes}`;
				return `${year}-${month}-${day} ${hours}:${minutes}`;
			},
			getStepStatusClass(task) {
				const {
					status,
					action
				} = task;
				if (action === 'reject') return 'step-rejected';
				if (status === 'completed') return 'step-completed';
				if (status === 'pending') return 'step-current';
				if (status === 'waiting') return 'step-waiting';
				if (status === 'cancelled') return 'step-cancelled';
				return 'step-waiting';
			},
			getStepIcon(task) {
				const {
					status,
					action
				} = task;
				if (action === 'reject') return 'close-circle';
				if (status === 'completed') return 'checkmark-circle';
				if (status === 'pending') return 'clock';
				if (status === 'waiting') return 'time';
				if (status === 'cancelled') return 'close';
				return 'time';
			},
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
			getActionType(action) {
				const typeMap = {
					'create': 'info',
					'approve': 'success',
					'reject': 'error',
					'return': 'warning',
					'transfer': 'info',
					'complete': 'success',
					'claim': 'warning',
					'withdraw': 'info',
					'add_sign': 'primary',
					'add_sign_complete': 'success',
					'confirm': 'warning',
					'resubmit': 'info'
				};
				return typeMap[action] || 'info';
			},
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
					'resubmit': '重新提交'
				};
				return textMap[action] || action;
			},
			getActionTagType(action) {
				const typeMap = {
					'approve': 'success',
					'reject': 'error',
					'return': 'warning',
					'transfer': 'info',
					'create': 'info',
					'complete': 'success',
					'withdraw': 'info',
					'add_sign': 'primary',
					'add_sign_complete': 'success',
					'confirm': 'warning',
					'resubmit': 'info'
				};
				return typeMap[action] || 'info';
			},
			getHistoryItemClass(record) {
				const action = record.action;
				if (action === 'approve' || action === 'add_sign_complete') return 'history-approve';
				if (action === 'reject') return 'history-reject';
				if (action === 'return') return 'history-return';
				if (action === 'create') return 'history-create';
				return 'history-default';
			},
			getHistoryIcon(record) {
				const action = record.action;
				if (action === 'approve' || action === 'add_sign_complete') return 'checkmark-circle';
				if (action === 'reject') return 'close-circle';
				if (action === 'return') return 'arrow-left';
				if (action === 'create') return 'plus-circle';
				if (action === 'transfer') return 'arrow-right';
				if (action === 'add_sign') return 'plus';
				if (action === 'confirm') return 'checkmark';
				return 'list-dot';
			}
		}
	};
</script>

<style lang="scss" scoped>
.approval-flow-container {
  width: 100%;
  background-color: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.03);
}

.detail-section {
  padding: 40rpx 30rpx;
  border-bottom: 1px solid #f8f8f8;
  &:last-child { border-bottom: none; }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;

  .section-title {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
  }

  .section-summary {
    display: flex;
    gap: 32rpx;

    .summary-item {
      display: flex;
      align-items: baseline;

      .summary-label {
        font-size: 24rpx;
        color: #999;
        margin-right: 8rpx;
      }

      .summary-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
        &.completed { color: #5cb85c; }
      }
    }
  }
}

.process-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-bottom: 36rpx;
  padding: 24rpx 20rpx;
  background-color: #f9fafc;
  border-radius: 16rpx;

  .legend-item {
    display: flex;
    align-items: center;

    .legend-dot {
      width: 20rpx;
      height: 20rpx;
      border-radius: 50%;
      margin-right: 10rpx;

      &.completed { background-color: #5cb85c; box-shadow: 0 0 0 4rpx rgba(92,184,92,0.15); }
      &.current { background-color: #2b7fff; box-shadow: 0 0 0 4rpx rgba(43,127,255,0.15); animation: pulse 2s infinite; }
      &.waiting { background-color: #d2d6e0; box-shadow: 0 0 0 4rpx rgba(210,214,224,0.15); }
      &.rejected { background-color: #fa5151; box-shadow: 0 0 0 4rpx rgba(250,81,81,0.15); }
      &.cancelled { background-color: #f39b3d; box-shadow: 0 0 0 4rpx rgba(243,155,61,0.15); }
    }

    .legend-text {
      font-size: 24rpx;
      color: #666;
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.process-steps-vertical {
  display: flex;
  flex-direction: column;
  margin-top: 24rpx;
}

.step-vertical-item {
  display: flex;
  position: relative;
  margin-bottom: 30rpx;
  &:last-child { margin-bottom: 0; }
}

.step-vertical-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 96rpx;
  flex-shrink: 0;
  position: relative;

  .step-icon-wrapper {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    background-color: #e8ebf2;
    transition: all 0.3s;

    &.step-completed { background-color: #5cb85c; box-shadow: 0 4rpx 16rpx rgba(92,184,92,0.2); }
    &.step-current { background-color: #2b7fff; box-shadow: 0 4rpx 16rpx rgba(43,127,255,0.25); animation: pulse 2s infinite; }
    &.step-waiting { background-color: #e8ebf2; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02); }
    &.step-rejected { background-color: #fa5151; box-shadow: 0 4rpx 16rpx rgba(250,81,81,0.2); }
    &.step-cancelled { background-color: #f39b3d; box-shadow: 0 4rpx 16rpx rgba(243,155,61,0.2); }
  }

  .step-vertical-connector {
    position: absolute;
    top: 80rpx;
    width: 2rpx;
    height: calc(100% + 30rpx);
    background-color: #dcdcdc;
    z-index: 1;
  }
}

.step-vertical-content {
  flex: 1;
  padding: 28rpx;
  background-color: #f9fafc;
  border-radius: 16rpx;
  margin-left: 24rpx;
  border: 1rpx solid #f1f1f1;

  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #efefef;

    .step-name {
      font-size: 30rpx;
      font-weight: 600;
      color: #222;
    }
  }

  .step-details {
    margin-bottom: 16rpx;

    .detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 14rpx;
      &:last-child { margin-bottom: 0; }

      .detail-text {
        font-size: 24rpx;
        color: #555;
        margin-left: 12rpx;
        &.highlight { color: #2b7fff; font-weight: 600; }
      }
    }
  }

  .step-actions {
    padding-top: 16rpx;
    border-top: 1rpx solid #efefef;
    margin-top: 8rpx;

    .actions-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx;

      .action-tag {
        ::v-deep .u-tag {
          font-size: 22rpx;
          padding: 2rpx 16rpx;
          border-radius: 8rpx;
          background: rgba(0,0,0,0.02);
        }
      }
    }
  }
}

.approval-history {
  margin-top: 32rpx;

  .timeline-container {
    position: relative;
    padding-left: 0;
  }
}

.timeline-item {
  display: flex;
  margin-bottom: 36rpx;
  position: relative;
  padding-left: 0;
  &:last-child { margin-bottom: 0; }
}

.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 96rpx;
  flex-shrink: 0;
  position: relative;

  .node-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    &.history-approve { background-color: #5cb85c; box-shadow: 0 4rpx 14rpx rgba(92,184,92,0.2); }
    &.history-reject { background-color: #fa5151; box-shadow: 0 4rpx 14rpx rgba(250,81,81,0.2); }
    &.history-return { background-color: #f39b3d; box-shadow: 0 4rpx 14rpx rgba(243,155,61,0.2); }
    &.history-create { background-color: #2b7fff; box-shadow: 0 4rpx 14rpx rgba(43,127,255,0.2); }
    &.history-default { background-color: #a2a9b6; box-shadow: 0 4rpx 14rpx rgba(162,169,182,0.15); }
  }

  .timeline-connector {
    width: 2rpx;
    flex: 1;
    background-color: #e0e0e0;
    margin: 12rpx 0;
    min-height: 40rpx;
  }
}

.timeline-content {
  flex: 1;
  padding: 24rpx 28rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-left: 24rpx;
  border: 1rpx solid #f1f1f1;

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .timeline-action {
      ::v-deep .u-tag {
        font-size: 22rpx;
        padding: 2rpx 16rpx;
        border-radius: 8rpx;
      }
    }

    .timeline-time {
      font-size: 22rpx;
      color: #999;
    }
  }

  .timeline-body {
    .timeline-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 14rpx;
      &:last-child { margin-bottom: 0; }

      .timeline-text {
        font-size: 24rpx;
        color: #555;
        line-height: 1.6;
      }
    }
  }
}

.timeline-create .timeline-content {
  background-color: #f0f6ff;
  border-left: 6rpx solid #2b7fff;
}

.empty-state {
  padding: 80rpx 20rpx;
  ::v-deep .u-empty { margin: 0; }
}

@media (max-width: 750px) {
  .detail-section { padding: 30rpx 20rpx; }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    .section-summary { margin-top: 16rpx; }
  }
  .process-legend { gap: 20rpx; .legend-item { flex: 0 0 calc(50% - 20rpx); } }
  .step-vertical-node { width: 72rpx; .step-icon-wrapper { width: 64rpx; height: 64rpx; } .step-vertical-connector { top: 64rpx; } }
  .step-vertical-content { padding: 20rpx; margin-left: 16rpx; }
  .timeline-node { width: 72rpx; .node-icon { width: 64rpx; height: 64rpx; } }
  .timeline-content { margin-left: 16rpx; padding: 20rpx; }
  .approval-history { margin-top: 28rpx; }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .approval-flow-container { background-color: #1a1a1a; }
  .detail-section { border-bottom-color: #2a2a2a; }
  .section-header .section-title { color: #eee; }
  .process-legend { background-color: #232324; .legend-text { color: #aaa; } }
  .step-vertical-content { background-color: #232324; border-color: #2a2a2a; .step-name { color: #eee; } .detail-text { color: #aaa; } }
  .timeline-content { background-color: #1e1e1f; border-color: #2a2a2a; .timeline-time { color: #999; } .timeline-text { color: #aaa; } }
  .approval-history { margin-top: 32rpx; }
}
</style>