<template>
	<view class="simulate-handle-dialog">
		<view v-if="simulateData" class="simulate-result">
			<!-- 流程概览（一行布局） -->
			<view class="overview-section">
				<view class="section-header">
					<u-icon name="eye" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
					<text class="section-title">流程概览</text>
				</view>
				<view class="overview-grid">
					<view class="overview-item">
						<text class="overview-label">申请类型</text>
						<text class="overview-value">{{ simulateData.form_type || '未指定' }}</text>
					</view>
					<view class="overview-item">
						<text class="overview-label">流程名称</text>
						<text class="overview-value">{{ simulateData.process_definition?.name || '未指定' }}</text>
					</view>
					<view class="overview-item">
						<text class="overview-label">预计时长</text>
						<view class="overview-value">
							<u-tag :text="simulateData.estimated_duration?.formatted || '未知'" type="warning" size="mini"
								shape="circle"></u-tag>
						</view>
					</view>
					<view class="overview-item">
						<text class="overview-label">总节点数</text>
						<text class="overview-value">{{ simulateData.total_nodes || 0 }} 个</text>
					</view>
				</view>
			</view>

			<!-- 审批路径（节点左侧图标与文字同行） -->
			<view class="path-section">
				<view class="section-header">
					<u-icon name="list-dot" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
					<text class="section-title">审批路径</text>
				</view>
				<view v-if="simulateData.nodes && simulateData.nodes.length > 0" class="path-steps">
					<view v-for="(node, index) in simulateData.nodes" :key="node.node_key" class="path-step-wrapper">
						<view class="path-step" :class="getNodeStepClass(node)">
							<!-- 左侧图标 + 序号（水平排列） -->
							<view class="step-icon-wrapper">
								<view class="step-icon" :class="getNodeStepClass(node)">
									<u-icon :name="getNodeIcon(node)" size="28" color="#ffffff"></u-icon>
								</view>
								<view class="step-index" v-if="index === 0">开始</view>
								<view class="step-index" v-else-if="index === simulateData.nodes.length - 1">结束</view>
								<view class="step-index" v-else>{{ index }}</view>
							</view>
							<!-- 右侧内容卡片 -->
							<view class="step-content">
								<view class="step-header">
									<text class="step-title">{{ node.node_name }}</text>
									<u-tag :text="getNodeTypeText(node.node_type)" type="info" size="mini"
										shape="circle"></u-tag>
								</view>
								<view class="step-details">
									<!-- 处理人显示：优先展示 estimated_assignees 数组 -->
									<view class="detail-item"
										v-if="node.estimated_assignees && node.estimated_assignees.length > 0">
										<u-icon name="account" size="20" color="#666"></u-icon>
										<text class="detail-text">
											处理人: {{ node.estimated_assignees.map(a => a.name).join('、') }}
											<text v-if="node.estimated_assignees.length > 1">
												(共{{ node.estimated_assignees.length }}人)</text>
										</text>
									</view>
									<view class="detail-item" v-else-if="node.estimated_assignee">
										<u-icon name="account" size="20" color="#666"></u-icon>
										<text class="detail-text">处理人：{{ node.estimated_assignee.name }}</text>
									</view>
									<!-- 会签所需同意数 -->
									<view class="detail-item" v-if="node.required_approvals > 1">
										<u-icon name="people" size="20" color="#2979ff"></u-icon>
										<text class="detail-text highlight">需 {{ node.required_approvals }} 人同意</text>
									</view>
									<!-- 处理时长 -->
									<view class="detail-item" v-if="node.duration_estimate">
										<u-icon name="clock" size="20" color="#666"></u-icon>
										<text class="detail-text">预计 {{ node.duration_estimate }} 小时</text>
									</view>
									<!-- 分配方式 -->
									<view class="detail-item" v-if="node.assignee_type">
										<u-icon name="setting" size="20" color="#666"></u-icon>
										<text class="detail-text">
											分配方式：{{ getAssigneeTypeText(node.assignee_type) }}
											<text v-if="Array.isArray(node.assignee_value)">
												({{ node.assignee_value.join(', ') }})</text>
											<text v-else-if="node.assignee_value">: {{ node.assignee_value }}</text>
										</text>
									</view>
									<!-- 条件分支简要信息 -->
									<view class="detail-item" v-if="node.conditions && node.conditions.length > 0">
										<u-icon name="share" size="20" color="#666"></u-icon>
										<text
											class="detail-text">分支条件：{{ node.conditions.map(c => getNodeName(c.target_node) + (c.condition_rule ? '('+c.condition_rule+')' : '')).join(' / ') }}</text>
									</view>
								</view>
								<!-- 可用操作 -->
								<view class="step-actions" v-if="node.actions && node.actions.length > 0">
									<text class="actions-label">可用操作：</text>
									<view class="actions-tags">
										<view v-for="action in node.actions" :key="action" class="action-tag">
											<u-tag :text="getActionText(action)" :type="getActionTagType(action)"
												size="mini" shape="circle"></u-tag>
										</view>
									</view>
								</view>
							</view>
						</view>
						<!-- 连接线 -->
						<view v-if="index < simulateData.nodes.length - 1" class="step-connector">
							<u-icon v-if="!isMobile" name="arrow-right" size="24" color="#c1c1c1"></u-icon>
							<view v-else class="vertical-line"></view>
						</view>
					</view>
				</view>
				<view v-else class="no-path-data">
					<u-empty mode="list" icon="/static/empty-data.png">
						<text slot="text">暂无审批路径数据</text>
					</u-empty>
				</view>
			</view>
		</view>

		<!-- 无数据状态 -->
		<view v-else class="empty-result">
			<u-empty mode="list" icon="/static/empty-data.png">
				<text slot="text">暂无试算数据</text>
				<text slot="result">请重新进行流程试算</text>
			</u-empty>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'SimulateHandleDialog',
		props: {
			simulateData: {
				type: Object,
				default: null
			}
		},
		data() {
			return {
				isMobile: false
			};
		},
		mounted() {
			this.checkScreenWidth();
			uni.onWindowResize(() => this.checkScreenWidth());
		},
		methods: {
			checkScreenWidth() {
				uni.getSystemInfo({
					success: (res) => {
						this.isMobile = res.windowWidth <= 750;
					}
				});
			},
			getNodeStepClass(node) {
				const type = node.node_type;
				if (type === 'start') return 'step-start';
				if (type === 'end') return 'step-end';
				if (type === 'userTask' || type === 'approval') return 'step-task';
				if (type === 'review') return 'step-review';
				if (type === 'gateway') return 'step-gateway';
				return 'step-default';
			},
			getNodeIcon(node) {
				const map = {
					'start': 'play-circle',
					'end': 'checkmark-circle',
					'userTask': 'account',
					'approval': 'checkbox-mark',
					'review': 'bell',
					'gateway': 'share'
				};
				return map[node.node_type] || 'question-circle';
			},
			getNodeTypeText(nodeType) {
				const map = {
					'start': '开始节点',
					'end': '结束节点',
					'userTask': '用户任务',
					'approval': '审批节点',
					'review': '通知节点',
					'gateway': '网关节点'
				};
				return map[nodeType] || nodeType;
			},
			getAssigneeTypeText(type) {
				const map = {
					'user': '指定用户',
					'role': '按角色',
					'department': '按部门',
					'variable': '变量指定',
					'previous': '上一处理人'
				};
				return map[type] || type;
			},
			getActionText(action) {
				const map = {
					'approve': '同意',
					'reject': '驳回',
					'return': '退回',
					'transfer': '转办',
					'add_sign': '加签',
					'add_sign_complete': '加签完成',
					'confirm': '确认',
					'resubmit': '重新提交',
					'create': '创建',
					'complete': '完成'
				};
				return map[action] || action;
			},
			getActionTagType(action) {
				const map = {
					'approve': 'success',
					'reject': 'error',
					'return': 'warning',
					'transfer': 'info',
					'add_sign': 'primary',
					'add_sign_complete': 'success',
					'confirm': 'warning',
					'resubmit': 'info',
					'create': 'info',
					'complete': 'success'
				};
				return map[action] || 'info';
			},
			// 根据节点key获取节点名称（用于条件显示）
			getNodeName(nodeKey) {
				if (!this.simulateData || !this.simulateData.nodes) return nodeKey;
				const node = this.simulateData.nodes.find(n => n.node_key === nodeKey);
				return node ? node.node_name : nodeKey;
			}
		},
		watch: {
			simulateData: {
				immediate: true,
				handler(newVal) {
					if (newVal && newVal.nodes) {
						// 不做额外处理，仅用于监听
					}
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
  .simulate-handle-dialog {
    padding: 20rpx;
    // 去掉固定最大高度，由内容决定
    height: auto;
    overflow-y: visible;
    background: #f5f7fa;
    border-radius: 24rpx;
  }

  .simulate-result {
    background-color: #ffffff;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1f2f3d;
      letter-spacing: 0.5rpx;
    }
  }

  .overview-section {
    padding: 32rpx;
    background: linear-gradient(135deg, #ffffff 0%, #fafcff 100%);

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20rpx;

      .overview-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8fafd;
        border-radius: 20rpx;
        padding: 20rpx 24rpx;

        .overview-label {
          font-size: 26rpx;
          color: #8a9bb0;
          font-weight: 500;
          flex-shrink: 0;
          margin-right: 16rpx;
        }

        .overview-value {
          font-size: 28rpx;
          color: #1f2f3d;
          font-weight: 600;
          text-align: right;

          ::v-deep .u-tag {
            font-size: 24rpx;
            padding: 4rpx 20rpx;
            border-radius: 40rpx;
          }
        }
      }
    }
  }

  .path-section {
    padding: 32rpx 32rpx 0; // 底部 padding 设为 0，连接线最后一段会自然结束
    background: #ffffff;

    .path-steps {
      display: flex;
      flex-direction: column;
      gap: 0; // 让连接线控制间距
    }

    .path-step-wrapper {
      position: relative;
    }

    .path-step {
      display: flex;
      align-items: flex-start;
      background: #ffffff;
      border-radius: 24rpx;
      padding: 20rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
      border: 1rpx solid rgba(0, 0, 0, 0.05);

      .step-icon-wrapper {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        margin-right: 24rpx;
        gap: 12rpx;

        .step-icon {
          width: 64rpx;
          height: 64rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);

          &.step-start { background: linear-gradient(135deg, #2979ff, #0a4dc9); }
          &.step-end { background: linear-gradient(135deg, #19be6b, #0f9a57); }
          &.step-task { background: linear-gradient(135deg, #f0ad4e, #e68a2e); }
          &.step-review { background: linear-gradient(135deg, #13c2c2, #0e9e9e); }
          &.step-gateway { background: linear-gradient(135deg, #909399, #6c6f78); }
          &.step-default { background: linear-gradient(135deg, #c1c1c1, #9e9e9e); }
        }

        .step-index {
          font-size: 26rpx;
          font-weight: 500;
          color: #7f8c8d;
        }
      }

      .step-content {
        flex: 1;
        background: #fafcff;
        border-radius: 20rpx;
        padding: 20rpx;
        border: 1rpx solid #edf2f7;

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20rpx;
          padding-bottom: 12rpx;
          border-bottom: 1rpx solid #eef2f6;

          .step-title {
            font-size: 30rpx;
            font-weight: 600;
            color: #2c3e50;
          }

          ::v-deep .u-tag {
            font-size: 22rpx;
            padding: 4rpx 20rpx;
            border-radius: 40rpx;
          }
        }

        .step-details {
          .detail-item {
            display: flex;
            align-items: center;
            margin-bottom: 16rpx;
            font-size: 26rpx;

            &:last-child { margin-bottom: 0; }

            .detail-text {
              margin-left: 12rpx;
              color: #4a5568;
              &.highlight { color: #2979ff; font-weight: 500; }
            }
          }
        }

        .step-actions {
          margin-top: 20rpx;
          padding-top: 16rpx;
          border-top: 1rpx solid #eef2f6;

          .actions-label {
            font-size: 24rpx;
            color: #8a9bb0;
            margin-bottom: 12rpx;
            display: block;
          }

          .actions-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 12rpx;

            .action-tag {
              ::v-deep .u-tag {
                font-size: 22rpx;
                padding: 4rpx 20rpx;
                border-radius: 40rpx;
                background: #f0f4f9;
                color: #2c3e50;
                border: none;
              }
            }
          }
        }
      }
    }

    .step-connector {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 40rpx;              // 固定连接线高度，更可控
      margin-left: 88rpx;
      // 去掉之前可能产生的多余 margin
      &.connector-horizontal { height: 60rpx; }
      &.connector-vertical {
        height: 40rpx;
        justify-content: flex-start;
        .vertical-line {
          width: 2rpx;
          height: 40rpx;
          background: linear-gradient(to bottom, #c1c1c1, #e9ecef);
        }
      }
    }
  }

  .empty-result,
  .no-path-data {
    padding: 40rpx 30rpx;         // 原 80rpx 减半，避免下方过度留白
    background-color: #ffffff;
    border-radius: 24rpx;
    text-align: center;

    ::v-deep .u-empty {
      margin: 0;
    }
  }

  @media (max-width: 750px) {
    .simulate-handle-dialog {
      padding: 12rpx;
    }

    .overview-section,
    .path-section {
      padding: 24rpx;
    }

    .path-section {
      padding-bottom: 0;          // 移动端同样处理
    }

    .overview-grid {
      grid-template-columns: 1fr !important;
      gap: 16rpx !important;

      .overview-item {
        padding: 16rpx 20rpx !important;
        .overview-label { font-size: 24rpx !important; }
        .overview-value { font-size: 26rpx !important; }
      }
    }

    .path-step {
      flex-direction: column;
      align-items: flex-start !important;

      .step-icon-wrapper {
        width: 100%;
        margin-right: 0 !important;
        margin-bottom: 20rpx;
        justify-content: flex-start;
        gap: 16rpx;

        .step-icon { width: 56rpx; height: 56rpx; }
        .step-index { font-size: 24rpx; }
      }

      .step-content { width: 100%; }
    }

    .step-connector {
      margin-left: 68rpx !important;
    }
  }
</style>