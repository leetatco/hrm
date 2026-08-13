<template>
	<vk-data-dialog v-model="show" :title="title" width="900px">
		<view v-if="simulateData" class="simulate-result">
			<!-- 流程概览 -->
			<view class="overview-section">
				<view class="overview-title">流程概览</view>
				<view class="overview-grid">
					<view class="overview-item">
						<view class="overview-label">申请类型</view>
						<view class="overview-value">{{ simulateData.form_type }}</view>
					</view>
					<view class="overview-item">
						<view class="overview-label">流程名称</view>
						<view class="overview-value">{{ simulateData.process_definition.name }}</view>
					</view>
					<view class="overview-item">
						<view class="overview-label">预计时长</view>
						<view class="overview-value">
							<el-tag type="warning">{{ simulateData.estimated_duration.formatted }}</el-tag>
						</view>
					</view>
					<view class="overview-item">
						<view class="overview-label">总节点数</view>
						<view class="overview-value">{{ simulateData.total_nodes }} 个</view>
					</view>
				</view>
			</view>

			<!-- 审批路径 -->
			<view class="path-section">
				<view class="section-title">审批路径</view>
				<view class="path-steps">
					<view v-for="(node, index) in simulateData.nodes" :key="node.node_key"
						:class="['path-step', getNodeStepClass(node)]">
						<view class="step-icon">
							<i :class="getNodeIcon(node)"></i>
						</view>
						<view class="step-content">
							<view class="step-title">{{ node.node_name }}</view>
							<!-- 处理人显示：优先展示 estimated_assignees 数组 -->
							<view class="step-info"
								v-if="node.estimated_assignees && node.estimated_assignees.length > 0">
								处理人:
								<text v-for="(assignee, aIndex) in node.estimated_assignees" :key="aIndex">
									{{ assignee.name }}<text v-if="aIndex < node.estimated_assignees.length - 1">,
									</text>
								</text>
								<text v-if="node.estimated_assignees.length > 1">
									(共{{ node.estimated_assignees.length }}人)</text>
							</view>
							<view class="step-info" v-else-if="node.estimated_assignee">
								处理人: {{ node.estimated_assignee.name }}
							</view>
							<view class="step-info" v-if="node.required_approvals > 1">
								<text>需 {{ node.required_approvals }} 人同意</text>
							</view>
							<view class="step-info" v-if="node.duration_estimate">
								预计: {{ node.duration_estimate }}小时
							</view>
							<view class="step-actions" v-if="node.actions && node.actions.length > 0">
								<el-tag v-for="action in node.actions" :key="action" size="mini"
									:type="getActionTagType(action)">
									{{ getActionText(action) }}
								</el-tag>
							</view>
						</view>
						<view class="step-connector" v-if="index < simulateData.nodes.length - 1">
							<i class="el-icon-arrow-right"></i>
						</view>
					</view>
				</view>
			</view>

			<!-- 节点详情 -->
			<view class="detail-section">
				<view class="section-title">节点详情</view>
				<el-collapse v-model="activeNodes">
					<el-collapse-item v-for="node in simulateData.nodes" :key="node.node_key" :title="node.node_name"
						:name="node.node_key">
						<view class="node-detail">
							<view class="detail-row">
								<view class="detail-label">节点类型:</view>
								<view class="detail-value">{{ getNodeTypeText(node.node_type) }}</view>
							</view>
							<!-- 预计处理人：支持多人 -->
							<view class="detail-row"
								v-if="node.estimated_assignees && node.estimated_assignees.length > 0">
								<view class="detail-label">预计处理人:</view>
								<view class="detail-value">
									<text v-for="(assignee, aIndex) in node.estimated_assignees" :key="aIndex">
										{{ assignee.name }}
										({{ getAssigneeTypeText(assignee.type || node.assignee_type) }})<text
											v-if="aIndex < node.estimated_assignees.length - 1">, </text>
									</text>
								</view>
							</view>
							<view class="detail-row" v-else-if="node.estimated_assignee">
								<view class="detail-label">预计处理人:</view>
								<view class="detail-value">
									{{ node.estimated_assignee.name }}
									({{ getAssigneeTypeText(node.assignee_type) }})
								</view>
							</view>
							<view class="detail-row" v-if="node.assignee_type">
								<view class="detail-label">分配方式:</view>
								<view class="detail-value">
									{{ getAssigneeTypeText(node.assignee_type) }}:
									<text
										v-if="Array.isArray(node.assignee_value)">{{ node.assignee_value.join(', ') }}</text>
									<text v-else>{{ node.assignee_value }}</text>
								</view>
							</view>
							<view class="detail-row" v-if="node.required_approvals > 1">
								<view class="detail-label">需要同意数:</view>
								<view class="detail-value">{{ node.required_approvals }} 人</view>
							</view>
							<view class="detail-row" v-if="node.duration_estimate">
								<view class="detail-label">处理时长:</view>
								<view class="detail-value">{{ node.duration_estimate }} 小时</view>
							</view>
							<view class="detail-row" v-if="node.actions && node.actions.length > 0">
								<view class="detail-label">可用操作:</view>
								<view class="detail-value">
									<el-tag v-for="action in node.actions" :key="action" size="small"
										:type="getActionTagType(action)" class="action-tag">
										{{ getActionText(action) }}
									</el-tag>
								</view>
							</view>
							<view class="detail-row" v-if="node.conditions && node.conditions.length > 0">
								<view class="detail-label">下一节点条件:</view>
								<view class="detail-value">
									<view v-for="condition in node.conditions" :key="condition.target_node"
										class="condition-item">
										<el-tag :type="condition.matched ? 'success' : 'info'" size="small">
											{{ condition.matched ? '✓' : '○' }}
										</el-tag>
										{{ getNodeName(condition.target_node) }}
										<span v-if="condition.condition_rule" class="condition-rule">
											({{ condition.condition_rule }})
										</span>
										<span v-if="condition.is_default" class="default-path">[默认路径]</span>
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
					</el-collapse-item>
				</el-collapse>
			</view>
		</view>
		<template v-slot:footer>
			<el-button @click="handleClose">关闭</el-button>
		</template>
	</vk-data-dialog>
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
					if (newVal && newVal.nodes) {
						this.activeNodes = newVal.nodes.map(node => node.node_key);
					}
				}
			}
		},
		methods: {
			handleClose() {
				this.show = false;
			},
			handleSubmit() {
				// console.log(this.simulateData.variables)
				this.$emit('submit');
			},

			getNodeStepClass(node) {
				const classes = ['step-base'];
				if (node.node_type === 'start') classes.push('step-start');
				if (node.node_type === 'end') classes.push('step-end');
				if (node.node_type === 'userTask' || node.node_type === 'approval') classes.push('step-task');
				if (node.node_type === 'review') classes.push('step-review');
				return classes.join(' ');
			},
			getNodeIcon(node) {
				const iconMap = {
					'start': 'el-icon-video-play',
					'end': 'el-icon-circle-check',
					'userTask': 'el-icon-user',
					'approval': 'el-icon-document-checked',
					'review': 'el-icon-bell',
					'gateway': 'el-icon-share'
				};
				return iconMap[node.node_type] || 'el-icon-question';
			},
			getNodeTypeText(nodeType) {
				const typeMap = {
					'start': '开始节点',
					'end': '结束节点',
					'userTask': '用户任务',
					'approval': '审批节点',
					'review': '通知节点',
					'gateway': '网关节点'
				};
				return typeMap[nodeType] || nodeType;
			},
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
			getActionText(action) {
				const textMap = {
					'approve': '同意',
					'reject': '驳回',
					'return': '退回',
					'transfer': '转办',
					'add_sign': '加签',
					'confirm': '确认',
					'create': '创建',
					'complete': '完成'
				};
				return textMap[action] || action;
			},
			getActionTagType(action) {
				const typeMap = {
					'approve': 'success',
					'reject': 'danger',
					'return': 'warning',
					'transfer': 'info',
					'add_sign': 'primary',
					'confirm': 'success',
					'create': 'info',
					'complete': 'success'
				};
				return typeMap[action] || 'info';
			},
			getNodeName(nodeKey) {
				if (!this.simulateData || !this.simulateData.nodes) return nodeKey;
				const node = this.simulateData.nodes.find(n => n.node_key === nodeKey);
				return node ? node.node_name : nodeKey;
			}
		}
	};
</script>

<style lang="scss" scoped>
	.simulate-result {
		.overview-section {
			margin-bottom: 24px;
			padding: 16px;
			background: #f8f9fa;
			border-radius: 8px;

			.overview-title {
				font-size: 16px;
				font-weight: bold;
				color: #303133;
				margin-bottom: 16px;
			}

			.overview-grid {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 16px;

				.overview-item {
					display: flex;
					align-items: center;

					.overview-label {
						font-weight: bold;
						color: #606266;
						min-width: 80px;
						margin-right: 8px;
					}

					.overview-value {
						color: #303133;
						flex: 1;
					}
				}
			}
		}

		.path-section {
			margin-bottom: 24px;

			.section-title {
				font-size: 16px;
				font-weight: bold;
				color: #303133;
				margin-bottom: 16px;
				padding-bottom: 8px;
				border-bottom: 1px solid #e4e7ed;
			}

			.path-steps {
				.path-step {
					display: flex;
					align-items: flex-start;
					margin-bottom: 16px;
					padding: 16px;
					border-radius: 8px;
					background: #fafafa;
					border: 1px solid #e4e7ed;
					position: relative;

					&.step-start {
						background: #f0f9ff;
						border-color: #1890ff;
					}

					&.step-end {
						background: #f6ffed;
						border-color: #52c41a;
					}

					&.step-task {
						background: #fff7e6;
						border-color: #fa8c16;
					}

					.step-icon {
						width: 40px;
						height: 40px;
						border-radius: 50%;
						background: #409eff;
						color: white;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 12px;
						flex-shrink: 0;

						i {
							font-size: 18px;
						}
					}

					.step-content {
						flex: 1;

						.step-title {
							font-weight: bold;
							color: #303133;
							margin-bottom: 8px;
							font-size: 16px;
						}

						.step-info {
							color: #606266;
							font-size: 14px;
							margin-bottom: 4px;
						}

						.step-actions {
							margin-top: 8px;

							.el-tag {
								margin-right: 4px;
								margin-bottom: 4px;
							}
						}
					}

					.step-connector {
						color: #909399;
						margin-left: 16px;
						flex-shrink: 0;
						display: flex;
						align-items: center;
						height: 100%;

						i {
							font-size: 16px;
						}
					}
				}
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

			.node-detail {
				.detail-row {
					display: flex;
					margin-bottom: 12px;
					padding-bottom: 12px;
					border-bottom: 1px solid #f0f0f0;

					&:last-child {
						border-bottom: none;
						margin-bottom: 0;
					}

					.detail-label {
						font-weight: bold;
						color: #606266;
						min-width: 120px;
					}

					.detail-value {
						color: #303133;
						flex: 1;

						.action-tag {
							margin-right: 4px;
							margin-bottom: 4px;
						}

						.condition-item {
							display: flex;
							align-items: center;
							margin-bottom: 4px;

							.el-tag {
								margin-right: 8px;
							}

							.condition-rule {
								color: #909399;
								font-size: 12px;
								margin-left: 4px;
							}

							.default-path {
								color: #1890ff;
								font-size: 12px;
								margin-left: 8px;
								font-weight: bold;
							}
						}
					}
				}
			}
		}

		.variables-section {
			.section-title {
				font-size: 16px;
				font-weight: bold;
				color: #303133;
				margin-bottom: 16px;
				padding-bottom: 8px;
				border-bottom: 1px solid #e4e7ed;
			}

			.variables-grid {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 12px;

				.variable-item {
					display: flex;
					padding: 8px 12px;
					background: #f5f7fa;
					border-radius: 4px;

					.variable-label {
						font-weight: bold;
						color: #606266;
						min-width: 100px;
					}

					.variable-value {
						color: #303133;
						flex: 1;
						word-break: break-all;
					}
				}
			}
		}
	}
</style>