<template>
	<!-- 使用 u-modal 替代 vk-data-dialog -->
	<u-modal v-model="show" :title="title" :show-confirm-button="false" :show-cancel-button="false"
		width="800" :zoom="false" :mask-close-able="false" :border-radius="16">
		<view class="simulate-handle-dialog">
			<view v-if="simulateData" class="simulate-result">
				<!-- 流程概览 -->
				<view class="overview-section">
					<view class="section-header">
						<u-icon name="eye" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
						<text class="section-title">流程概览</text>
					</view>
					<view class="overview-grid">
						<view class="overview-item">
							<view class="overview-label">申请类型</view>
							<view class="overview-value">{{ simulateData.form_type || '未指定' }}</view>
						</view>
						<view class="overview-item">
							<view class="overview-label">流程名称</view>
							<view class="overview-value">{{ simulateData.process_definition?.name || '未指定' }}</view>
						</view>
						<view class="overview-item">
							<view class="overview-label">预计时长</view>
							<view class="overview-value">
								<u-tag :text="simulateData.estimated_duration?.formatted || '未知'" 
									type="warning" size="mini" shape="circle"></u-tag>
							</view>
						</view>
						<view class="overview-item">
							<view class="overview-label">总节点数</view>
							<view class="overview-value">{{ simulateData.total_nodes || 0 }} 个</view>
						</view>
					</view>
				</view>

				<!-- 审批路径 -->
				<view class="path-section">
					<view class="section-header">
						<u-icon name="list-dot" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
						<text class="section-title">审批路径</text>
					</view>
					<view v-if="simulateData.nodes && simulateData.nodes.length > 0" class="path-steps">
						<view v-for="(node, index) in simulateData.nodes" :key="node.node_key"
							:class="['path-step', getNodeStepClass(node)]">
							<view class="step-icon-wrapper">
								<view class="step-icon" :class="getNodeStepClass(node)">
									<u-icon :name="getNodeIcon(node)" size="24" color="#ffffff"></u-icon>
								</view>
								<view class="step-index" v-if="index === 0">开始</view>
								<view class="step-index" v-else-if="index === simulateData.nodes.length - 1">结束</view>
								<view class="step-index" v-else>{{ index }}</view>
							</view>
							<view class="step-content">
								<view class="step-header">
									<text class="step-title">{{ node.node_name }}</text>
									<u-tag :text="getNodeTypeText(node.node_type)" type="info" size="mini" shape="circle"></u-tag>
								</view>
								<view class="step-details">
									<view class="detail-item" v-if="node.estimated_assignee">
										<u-icon name="account" size="20" color="#666"></u-icon>
										<text class="detail-text">处理人: {{ node.estimated_assignee.name }}</text>
									</view>
									<view class="detail-item" v-if="node.duration_estimate">
										<u-icon name="clock" size="20" color="#666"></u-icon>
										<text class="detail-text">预计: {{ node.duration_estimate }}小时</text>
									</view>
									<view class="detail-item" v-if="node.assignee_type">
										<u-icon name="setting" size="20" color="#666"></u-icon>
										<text class="detail-text">分配方式: {{ getAssigneeTypeText(node.assignee_type) }}</text>
									</view>
									<view class="step-actions" v-if="node.actions && node.actions.length > 0">
										<view class="actions-label">可用操作:</view>
										<view class="actions-tags">
											<view v-for="action in node.actions" :key="action" class="action-tag">
												<u-tag :text="getActionText(action)" 
													:type="getActionTagType(action)" size="mini" shape="circle"></u-tag>
											</view>
										</view>
									</view>
								</view>
							</view>
							<view class="step-connector" v-if="index < simulateData.nodes.length - 1">
								<u-icon name="arrow-right" size="20" color="#c1c1c1"></u-icon>
							</view>
						</view>
					</view>
					<view v-else class="no-path-data">
						<u-empty mode="list" icon="/static/empty-data.png">
							<text slot="text">暂无审批路径数据</text>
						</u-empty>
					</view>
				</view>

				<!-- 节点详情 -->
				<view class="detail-section">
					<view class="section-header">
						<u-icon name="info-circle" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
						<text class="section-title">节点详情</text>
					</view>
					<view v-if="simulateData.nodes && simulateData.nodes.length > 0">
						<u-collapse :accordion="false" :value="activeNodes">
							<u-collapse-item v-for="node in simulateData.nodes" :key="node.node_key" 
								:title="node.node_name" :name="node.node_key" :border="false">
								<view class="node-detail">
									<view class="detail-row">
										<view class="detail-label">节点类型:</view>
										<view class="detail-value">{{ getNodeTypeText(node.node_type) }}</view>
									</view>
									<view class="detail-row" v-if="node.estimated_assignee">
										<view class="detail-label">预计处理人:</view>
										<view class="detail-value">
											{{ node.estimated_assignee.name }}
											<text class="assignee-type">({{ getAssigneeTypeText(node.assignee_type) }})</text>
										</view>
									</view>
									<view class="detail-row" v-if="node.assignee_type">
										<view class="detail-label">分配方式:</view>
										<view class="detail-value">
											{{ getAssigneeTypeText(node.assignee_type) }}: {{ node.assignee_value || '未指定' }}
										</view>
									</view>
									<view class="detail-row" v-if="node.duration_estimate">
										<view class="detail-label">处理时长:</view>
										<view class="detail-value">{{ node.duration_estimate }} 小时</view>
									</view>
									<view class="detail-row" v-if="node.actions && node.actions.length > 0">
										<view class="detail-label">可用操作:</view>
										<view class="detail-value">
											<view class="action-tags">
												<view v-for="action in node.actions" :key="action" class="action-tag">
													<u-tag :text="getActionText(action)" 
														:type="getActionTagType(action)" size="small" shape="circle"></u-tag>
												</view>
											</view>
										</view>
									</view>
									<view class="detail-row" v-if="node.conditions && node.conditions.length > 0">
										<view class="detail-label">下一节点条件:</view>
										<view class="detail-value">
											<view v-for="condition in node.conditions" :key="condition.target_node"
												class="condition-item">
												<u-tag :text="condition.matched ? '匹配' : '未匹配'"
													:type="condition.matched ? 'success' : 'info'" size="small" shape="circle"></u-tag>
												<text class="condition-node">{{ getNodeName(condition.target_node) }}</text>
												<text v-if="condition.condition_rule" class="condition-rule">
													({{ condition.condition_rule }})
												</text>
												<text v-if="condition.is_default" class="default-path">[默认路径]</text>
											</view>
										</view>
									</view>
									<view class="detail-row" v-if="node.next_node_keys && node.next_node_keys.length > 0">
										<view class="detail-label">下一节点:</view>
										<view class="detail-value">
											{{ node.next_node_keys.map(key => getNodeName(key)).join(' → ') }}
										</view>
									</view>
								</view>
							</u-collapse-item>
						</u-collapse>
					</view>
					<view v-else class="no-detail-data">
						<u-empty mode="list" icon="/static/empty-data.png">
							<text slot="text">暂无节点详情数据</text>
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
		
		<!-- 底部操作按钮 -->
		<template #confirmButton>
			<view class="dialog-footer">
				<u-button type="default" @click="handleClose" :custom-style="{ 
					width: '200rpx', 
					height: '70rpx', 
					marginRight: '20rpx' 
				}">
					关闭
				</u-button>
				<u-button type="primary" @click="handleSubmit" :custom-style="{ 
					width: '200rpx', 
					height: '70rpx' 
				}">
					确认提交
				</u-button>
			</view>
		</template>
	</u-modal>
</template>

<script>
	export default {
		name: 'SimulateHandleDialog',
		props: {
			value: {
				type: Boolean,
				default: false
			},
			title: {
				type: String,
				default: '流程试算结果'
			},
			simulateData: {
				type: Object,
				default: null
			}
		},
		data() {
			return {
				activeNodes: []
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
			simulateData: {
				immediate: true,
				handler(newVal) {
					console.log('SimulateHandleDialog 接收到数据:', newVal);
					if (newVal && newVal.nodes && Array.isArray(newVal.nodes)) {
						// 默认展开所有节点
						this.activeNodes = newVal.nodes.map(node => node.node_key);
						console.log('设置 activeNodes:', this.activeNodes);
					} else {
						this.activeNodes = [];
						console.warn('simulateData.nodes 不存在或不是数组:', newVal);
					}
				}
			}
		},
		methods: {
			handleClose() {
				this.show = false;
			},
			
			handleSubmit() {
				this.$emit('submit');
			},

			// 获取节点步骤样式
			getNodeStepClass(node) {
				const nodeType = node.node_type;
				if (nodeType === 'start') return 'step-start';
				if (nodeType === 'end') return 'step-end';
				if (nodeType === 'userTask' || nodeType === 'approval') return 'step-task';
				if (nodeType === 'gateway') return 'step-gateway';
				return 'step-default';
			},

			// 获取节点图标
			getNodeIcon(node) {
				const iconMap = {
					'start': 'play-circle',
					'end': 'checkmark-circle',
					'userTask': 'account',
					'approval': 'checkbox-mark',
					'gateway': 'share'
				};
				return iconMap[node.node_type] || 'question-circle';
			},

			// 获取节点类型文本
			getNodeTypeText(nodeType) {
				const typeMap = {
					'start': '开始节点',
					'end': '结束节点',
					'userTask': '用户任务',
					'approval': '审批节点',
					'gateway': '网关节点'
				};
				return typeMap[nodeType] || nodeType;
			},

			// 获取分配方式文本
			getAssigneeTypeText(assigneeType) {
				const typeMap = {
					'user': '指定用户',
					'role': '按角色',
					'department': '按部门',
					'variable': '变量指定',
					'previous': '上一处理人'
				};
				return typeMap[assigneeType] || assigneeType;
			},

			// 获取操作文本
			getActionText(action) {
				const textMap = {
					'approve': '同意',
					'reject': '驳回',
					'return': '退回',
					'transfer': '转办',
					'delegate': '委托',
					'create': '创建',
					'complete': '完成',
					'claim': '认领',
					'withdraw': '撤回'
				};
				return textMap[action] || action;
			},

			// 获取操作标签类型
			getActionTagType(action) {
				const typeMap = {
					'approve': 'success',
					'reject': 'error',
					'return': 'warning',
					'transfer': 'info',
					'delegate': 'info',
					'create': 'info',
					'complete': 'success',
					'claim': 'warning',
					'withdraw': 'info'
				};
				return typeMap[action] || 'info';
			},

			// 根据节点KEY获取节点名称
			getNodeName(nodeKey) {
				if (!this.simulateData || !this.simulateData.nodes) return nodeKey;
				const node = this.simulateData.nodes.find(n => n.node_key === nodeKey);
				return node ? node.node_name : nodeKey;
			}
		}
	};
</script>

<style lang="scss" scoped>
	.simulate-handle-dialog {
		padding: 20rpx;
		max-height: 80vh;
		overflow-y: auto;
	}

	.simulate-result {
		background-color: #ffffff;
		border-radius: 12rpx;
		overflow: hidden;
	}

	/* 区块标题 */
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

	/* 流程概览 */
	.overview-section {
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
		
		.overview-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 30rpx;
			
			.overview-item {
				display: flex;
				flex-direction: column;
				
				.overview-label {
					font-size: 26rpx;
					color: #666666;
					margin-bottom: 12rpx;
					font-weight: 500;
				}
				
				.overview-value {
					font-size: 28rpx;
					color: #333333;
					font-weight: 500;
					
					::v-deep .u-tag {
						font-size: 24rpx;
						padding: 4rpx 20rpx;
					}
				}
			}
		}
	}

	/* 审批路径 */
	.path-section {
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
		
		.path-steps {
			.path-step {
				display: flex;
				align-items: flex-start;
				margin-bottom: 30rpx;
				position: relative;
				
				&:last-child {
					margin-bottom: 0;
				}
				
				.step-icon-wrapper {
					display: flex;
					flex-direction: column;
					align-items: center;
					margin-right: 24rpx;
					z-index: 2;
					
					.step-icon {
						width: 80rpx;
						height: 80rpx;
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-bottom: 12rpx;
						
						&.step-start {
							background-color: #2979ff;
							box-shadow: 0 8rpx 24rpx rgba(41, 121, 255, 0.3);
						}
						
						&.step-end {
							background-color: #19be6b;
							box-shadow: 0 8rpx 24rpx rgba(25, 190, 107, 0.3);
						}
						
						&.step-task {
							background-color: #f0ad4e;
							box-shadow: 0 8rpx 24rpx rgba(240, 173, 78, 0.3);
						}
						
						&.step-gateway {
							background-color: #909399;
							box-shadow: 0 8rpx 24rpx rgba(144, 147, 153, 0.3);
						}
						
						&.step-default {
							background-color: #c1c1c1;
							box-shadow: 0 8rpx 24rpx rgba(193, 193, 193, 0.3);
						}
					}
					
					.step-index {
						font-size: 24rpx;
						color: #999999;
						font-weight: 500;
					}
				}
				
				.step-content {
					flex: 1;
					padding: 20rpx;
					background-color: #f8f9fa;
					border-radius: 12rpx;
					
					.step-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 20rpx;
						padding-bottom: 16rpx;
						border-bottom: 1px solid #e4e7ed;
						
						.step-title {
							font-size: 30rpx;
							font-weight: bold;
							color: #333333;
							flex: 1;
						}
						
						::v-deep .u-tag {
							font-size: 24rpx;
							padding: 4rpx 20rpx;
						}
					}
					
					.step-details {
						.detail-item {
							display: flex;
							align-items: center;
							margin-bottom: 12rpx;
							
							&:last-child {
								margin-bottom: 0;
							}
							
							.detail-text {
								font-size: 26rpx;
								color: #666666;
								margin-left: 12rpx;
							}
						}
						
						.step-actions {
							margin-top: 16rpx;
							padding-top: 16rpx;
							border-top: 1px solid #e4e7ed;
							
							.actions-label {
								font-size: 26rpx;
								color: #666666;
								margin-bottom: 12rpx;
								font-weight: 500;
							}
							
							.actions-tags {
								display: flex;
								flex-wrap: wrap;
								gap: 10rpx;
								
								.action-tag {
									::v-deep .u-tag {
										font-size: 24rpx;
										padding: 4rpx 20rpx;
									}
								}
							}
						}
					}
				}
				
				.step-connector {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 60rpx;
					height: 100%;
					padding: 0 20rpx;
				}
			}
		}
	}

	/* 节点详情 */
	.detail-section {
		padding: 30rpx;
		
		::v-deep .u-collapse {
			.u-collapse-item {
				margin-bottom: 20rpx;
				border: 1px solid #e4e7ed;
				border-radius: 12rpx;
				overflow: hidden;
				
				&:last-child {
					margin-bottom: 0;
				}
				
				.u-collapse-item__header {
					padding: 30rpx;
					background-color: #f8f9fa;
					
					.u-collapse-item__header__text {
						font-size: 28rpx;
						font-weight: bold;
						color: #333333;
					}
				}
				
				.u-collapse-item__body {
					padding: 0;
					background-color: #ffffff;
				}
			}
		}
		
		.node-detail {
			padding: 30rpx;
			
			.detail-row {
				display: flex;
				align-items: flex-start;
				margin-bottom: 24rpx;
				padding-bottom: 20rpx;
				border-bottom: 1px solid #f0f0f0;
				
				&:last-child {
					border-bottom: none;
					margin-bottom: 0;
					padding-bottom: 0;
				}
				
				.detail-label {
					width: 200rpx;
					font-size: 26rpx;
					color: #666666;
					font-weight: 500;
					flex-shrink: 0;
				}
				
				.detail-value {
					flex: 1;
					font-size: 26rpx;
					color: #333333;
					
					.assignee-type {
						color: #999999;
						font-size: 24rpx;
						margin-left: 8rpx;
					}
					
					.action-tags {
						display: flex;
						flex-wrap: wrap;
						gap: 10rpx;
						
						.action-tag {
							::v-deep .u-tag {
								font-size: 24rpx;
								padding: 4rpx 20rpx;
							}
						}
					}
					
					.condition-item {
						display: flex;
						align-items: center;
						margin-bottom: 12rpx;
						
						&:last-child {
							margin-bottom: 0;
						}
						
						::v-deep .u-tag {
							font-size: 24rpx;
							padding: 4rpx 20rpx;
							margin-right: 12rpx;
						}
						
						.condition-node {
							font-size: 26rpx;
							color: #333333;
							margin-right: 8rpx;
						}
						
						.condition-rule {
							font-size: 24rpx;
							color: #999999;
							margin-right: 12rpx;
						}
						
						.default-path {
							font-size: 24rpx;
							color: #2979ff;
							font-weight: 500;
						}
					}
				}
			}
		}
	}

	/* 无数据状态 */
	.empty-result {
		padding: 60rpx 30rpx;
		background-color: #ffffff;
		border-radius: 12rpx;
		
		::v-deep .u-empty {
			margin: 0;
		}
	}

	/* 审批路径无数据 */
	.no-path-data,
	.no-detail-data {
		padding: 40rpx 30rpx;
		background-color: #ffffff;
		border-radius: 12rpx;
		
		::v-deep .u-empty {
			margin: 0;
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
		.simulate-handle-dialog {
			padding: 10rpx;
		}
		
		.overview-section,
		.path-section,
		.detail-section {
			padding: 20rpx;
		}
		
		.overview-grid {
			grid-template-columns: 1fr !important;
			gap: 20rpx !important;
		}
		
		.path-step {
			flex-direction: column;
			align-items: flex-start !important;
			
			.step-icon-wrapper {
				margin-right: 0 !important;
				margin-bottom: 20rpx;
			}
			
			.step-connector {
				display: none !important;
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
	.simulate-handle-dialog::-webkit-scrollbar {
		width: 6rpx;
	}

	.simulate-handle-dialog::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3rpx;
	}

	.simulate-handle-dialog::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 3rpx;
	}

	.simulate-handle-dialog::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>