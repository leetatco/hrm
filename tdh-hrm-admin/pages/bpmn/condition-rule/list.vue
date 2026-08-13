<template>
	<view class="page-body">
		<!-- 表格搜索组件 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search"></vk-data-table-query>

		<!-- 自定义按钮区域 -->
		<view class="button-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('bpmn-workflow-add')" @click="addBtn">
					添加条件规则
				</el-button>
				<el-button type="warning" size="small" icon="el-icon-refresh" @click="refresh">
					刷新
				</el-button>
			</el-row>
		</view>

		<!-- 表格组件 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>

		<!-- 添加或编辑的弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="1000px" mode="form"
			:close-on-click-modal="false" custom-class="condition-rule-dialog">
			<div class="dialog-content">
				<el-form :model="form1.data" :rules="form1.props.rules" ref="formRef" label-width="130px"
					class="condition-form">
					<!-- 基础信息区域 -->
					<el-card shadow="never" class="form-section">
						<div slot="header" class="section-header">
							<span class="section-title">基础信息</span>
						</div>
						<el-row :gutter="24">
							<el-col :span="12">
								<el-form-item label="规则编码" prop="code">
									<el-input v-model="form1.data.code" placeholder="请输入规则编码，如：RULE_AMOUNT_GT_1000"
										maxlength="50" show-word-limit>
										<template slot="prepend">RULE_</template>
									</el-input>
									<div class="form-tip">规则编码需唯一，建议使用大写英文和下划线</div>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="规则名称" prop="name">
									<el-input v-model="form1.data.name" placeholder="请输入规则名称" maxlength="100"
										show-word-limit></el-input>
								</el-form-item>
							</el-col>
						</el-row>
						<el-form-item label="规则描述">
							<el-input v-model="form1.data.description" type="textarea" placeholder="请输入规则描述" :rows="2"
								maxlength="500" show-word-limit></el-input>
						</el-form-item>
					</el-card>

					<!-- 条件配置区域 -->
					<el-card shadow="never" class="form-section">
						<div slot="header" class="section-header">
							<span class="section-title">条件配置</span>
							<div class="section-actions">
								<!-- 表单类型选择 -->
								<el-select v-model="form1.data.form_type_code" placeholder="请选择表单类型" size="small"
									style="width: 180px;" filterable clearable @change="onFormTypeChange">
									<el-option v-for="ft in formTypes" :key="ft.code" :label="ft.name" :value="ft.code">
									</el-option>
								</el-select>
								<el-radio-group v-model="form1.data.rule_expression.type" size="small"
									@change="onRuleTypeChange" style="margin-left: 12px;">
									<el-radio-button label="simple">简单规则</el-radio-button>
									<el-radio-button label="composite">复合规则</el-radio-button>
								</el-radio-group>
								<el-radio-group v-model="form1.data.rule_expression.logic" size="small"
									v-if="form1.data.rule_expression.type === 'composite'" style="margin-left: 12px;">
									<el-radio-button label="and">并且 (AND)</el-radio-button>
									<el-radio-button label="or">或者 (OR)</el-radio-button>
								</el-radio-group>
								<el-button type="text" icon="el-icon-question" size="small" style="margin-left: 12px;"
									@click="showRuleHelp">
									规则说明
								</el-button>
							</div>
						</div>

						<!-- 条件预览 -->
						<div class="rule-preview" v-if="form1.data.rule_expression.conditions.length > 0">
							<div class="preview-title">条件预览：</div>
							<div class="preview-content">
								{{ formatRulePreview() }}
							</div>
						</div>

						<el-form-item prop="rule_expression.conditions" class="no-margin-form-item">
							<div class="conditions-container">
								<div class="condition-list">
									<div class="condition-item"
										v-for="(condition, index) in form1.data.rule_expression.conditions"
										:key="index">
										<div class="condition-header">
											<span class="condition-index">条件 {{ index + 1 }}</span>
											<el-button type="danger" icon="el-icon-delete" size="mini"
												@click="removeCondition(index)" class="condition-remove-btn"
												v-if="form1.data.rule_expression.conditions.length > 1">
												删除
											</el-button>
										</div>
										<div class="condition-content">
											<el-row :gutter="12" class="condition-row">
												<el-col :span="5">
													<el-form-item :prop="`rule_expression.conditions[${index}].field`"
														:rules="fieldRules" class="inline-form-item">
														<el-select v-model="condition.field" placeholder="选择字段"
															@change="onFieldChange(condition)" size="small" filterable
															:disabled="!form1.data.form_type_code">
															<el-option-group v-for="group in dynamicFieldGroups"
																:key="group.label" :label="group.label">
																<el-option v-for="field in group.options"
																	:key="field.value" :label="field.label"
																	:value="field.value">
																	<div class="field-option">
																		<div class="field-name">{{ field.label }}</div>
																		<div class="field-desc">
																			{{ field.description || field.type }}
																		</div>
																	</div>
																</el-option>
															</el-option-group>
														</el-select>
													</el-form-item>
												</el-col>
												<el-col :span="4">
													<el-form-item
														:prop="`rule_expression.conditions[${index}].operator`"
														:rules="operatorRules" class="inline-form-item">
														<el-select v-model="condition.operator" placeholder="操作符"
															size="small">
															<el-option
																v-for="op in getAvailableOperators(condition.field)"
																:key="op.value" :label="op.label" :value="op.value"
																:disabled="op.disabled">
															</el-option>
														</el-select>
													</el-form-item>
												</el-col>
												<el-col :span="10">
													<el-form-item :prop="`rule_expression.conditions[${index}].value`"
														:rules="valueRules" class="inline-form-item">
														<!-- 动态值输入组件 -->
														<component :is="getValueComponent(condition)"
															v-model="condition.value"
															:placeholder="getValuePlaceholder(condition)"
															:options="getFieldOptions(condition.field)"
															:multiple="isMultipleOperator(condition.operator)"
															size="small" style="width: 100%">
														</component>
													</el-form-item>
												</el-col>
												<el-col :span="3">
													<el-form-item
														:prop="`rule_expression.conditions[${index}].value_type`"
														:rules="valueTypeRules" class="inline-form-item">
														<el-select v-model="condition.value_type" placeholder="值类型"
															size="small" @change="onValueTypeChange(condition)">
															<el-option v-for="type in valueTypes" :key="type.value"
																:label="type.label" :value="type.value">
															</el-option>
														</el-select>
													</el-form-item>
												</el-col>
												<el-col :span="2" class="condition-actions">
													<el-tooltip content="测试条件" placement="top">
														<el-button type="info" icon="el-icon-view" circle size="mini"
															@click="testCondition(condition)">
														</el-button>
													</el-tooltip>
												</el-col>
											</el-row>
											<!-- 值类型说明 -->
											<div class="value-type-tip" v-if="condition.value_type">
												值类型：{{ getValueTypeDescription(condition.value_type) }}
											</div>
										</div>
										<!-- 条件连接符 -->
										<div class="condition-connector"
											v-if="form1.data.rule_expression.type === 'composite' && index < form1.data.rule_expression.conditions.length - 1">
											<div class="connector-line"></div>
											<div class="connector-text">
												<el-tag size="small"
													:type="form1.data.rule_expression.logic === 'and' ? 'success' : 'warning'">
													{{ form1.data.rule_expression.logic === 'and' ? '并且 (AND)' : '或者 (OR)' }}
												</el-tag>
											</div>
											<div class="connector-line"></div>
										</div>
									</div>
								</div>

								<div class="condition-actions-bottom">
									<el-button type="primary" icon="el-icon-plus" @click="addCondition"
										class="add-condition-btn" size="small">
										添加条件
									</el-button>
									<el-button type="text" @click="addConditionGroup" size="small"
										v-if="form1.data.rule_expression.type === 'composite'">
										添加条件组
									</el-button>
								</div>
							</div>
						</el-form-item>
					</el-card>

					<!-- 适用范围配置 -->
					<el-card shadow="never" class="form-section">
						<div slot="header" class="section-header">
							<span class="section-title">适用范围</span>
							<el-switch v-model="enableScope" active-text="启用范围限制" inactive-text="禁用范围限制"></el-switch>
						</div>
						<el-row :gutter="24" v-if="enableScope">
							<!-- 新增：适用公司（支持多选） -->
							<el-col :span="12">
								<el-form-item label="适用公司">
									<vk-data-input-tree-select v-model="form1.data.scope.companies"
										action="admin/hrm/company/sys/getList"
										:props="{ list:'rows', value:'company_id', label:'company_name', children:'children' }"
										placeholder="请选择适用公司（不选表示所有公司）" style="width: 100%"
										@change="onScopeCompanyChange"></vk-data-input-tree-select>
									<div class="form-tip">不选择表示适用于所有公司</div>
								</el-form-item>
							</el-col>
							<!-- 修改：适用部门（联动公司，支持多选） -->
							<el-col :span="12">
								<el-form-item label="适用部门">
									<vk-data-input-tree-select v-model="form1.data.scope.departments"
										:localdata="scopeDepartmentsTree" multiple placeholder="请选择适用部门"
										style="width: 100%"
										:disabled="!form1.data.scope.companies || form1.data.scope.companies.length === 0"
										@change="onScopeDepartmentChange"></vk-data-input-tree-select>
									<div class="form-tip">请先选择公司，部门从所选公司下加载</div>
								</el-form-item>
							</el-col>
						</el-row>
						<div v-else class="scope-disabled-tip">
							<el-alert title="适用范围限制已禁用，此规则将适用于所有公司和部门" type="info" :closable="false"
								show-icon></el-alert>
						</div>
					</el-card>

					<!-- 状态配置 -->
					<el-card shadow="never" class="form-section">
						<div slot="header" class="section-header">
							<span class="section-title">状态设置</span>
						</div>
						<el-form-item label="规则状态" prop="status">
							<el-radio-group v-model="form1.data.status">
								<el-radio label="active" border>启用</el-radio>
								<el-radio label="inactive" border>停用</el-radio>
							</el-radio-group>
							<div class="form-tip">停用的规则不会在流程路由中使用</div>
						</el-form-item>
					</el-card>
				</el-form>
			</div>

			<template #footer>
				<div class="dialog-footer">
					<el-button @click="form1.props.show = false" size="medium">取消</el-button>
					<el-button type="primary" @click="submitForm" :loading="formLoading" size="medium">
						{{ form1.props.formType === 'add' ? '创建规则' : '更新规则' }}
					</el-button>
					<el-button type="success" @click="saveAndTest" :loading="formLoading" size="medium">
						保存并测试
					</el-button>
				</div>
			</template>
		</vk-data-dialog>

		<!-- 规则说明弹窗（略） -->
		<el-dialog title="条件规则说明" :visible.sync="ruleHelpVisible" width="600px">
			<div class="rule-help-content">
				<h3>条件规则配置指南</h3>
				<el-divider></el-divider>
				<h4>1. 规则类型</h4>
				<ul>
					<li><strong>简单规则</strong>：单个条件或多个条件的组合</li>
					<li><strong>复合规则</strong>：支持 AND/OR 逻辑组合的复杂条件</li>
				</ul>
				<h4>2. 值类型说明</h4>
				<ul>
					<li><strong>常量</strong>：固定的值</li>
					<li><strong>变量</strong>：引用流程变量，如：${applicant.department}</li>
					<li><strong>表达式</strong>：JavaScript表达式</li>
				</ul>
				<h4>3. 操作符说明</h4>
				<el-table :data="operatorHelpData" size="small" border>
					<el-table-column prop="operator" label="操作符" width="100"></el-table-column>
					<el-table-column prop="description" label="说明"></el-table-column>
					<el-table-column prop="example" label="示例" width="200"></el-table-column>
				</el-table>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="ruleHelpVisible = false" size="small">关闭</el-button>
			</span>
		</el-dialog>
	</view>
</template>

<script>
	// 动态值输入组件（复用原有的）
	const ValueInput = {
		props: ['value', 'placeholder', 'options', 'multiple'],
		render(h) {
			if (this.options && this.options.length > 0) {
				return h('el-select', {
					props: {
						value: this.value,
						placeholder: this.placeholder,
						multiple: this.multiple,
						filterable: true,
						clearable: true
					},
					on: {
						input: (value) => this.$emit('input', value)
					}
				}, this.options.map(option =>
					h('el-option', {
						props: {
							label: option.label,
							value: option.value
						}
					})
				));
			} else {
				return h('el-input', {
					props: {
						value: this.value,
						placeholder: this.placeholder,
						clearable: true
					},
					on: {
						input: (value) => this.$emit('input', value)
					}
				});
			}
		}
	};

	export default {
		components: {
			ValueInput
		},
		data() {
			const fieldRules = [{
				required: true,
				message: '请选择字段',
				trigger: 'change'
			}];
			const operatorRules = [{
				required: true,
				message: '请选择操作符',
				trigger: 'change'
			}];
			const valueRules = [{
				required: true,
				message: '请输入值',
				trigger: 'change'
			}];
			const valueTypeRules = [{
				required: true,
				message: '请选择值类型',
				trigger: 'change'
			}];
			return {
				scopeDepartmentsTree: [], // 适用范围中的部门树（根据公司动态加载）
				companies: [], // 公司列表（用于下拉）
				loading: false,
				formLoading: false,
				ruleHelpVisible: false,
				enableScope: true,
				fieldRules,
				operatorRules,
				valueRules,
				valueTypeRules,
				formTypes: [], // 所有表单类型列表
				dynamicFieldGroups: [], // 动态字段分组
				// 操作符配置（保持不变）
				operators: {
					string: [{
							value: 'eq',
							label: '等于'
						},
						{
							value: 'ne',
							label: '不等于'
						},
						{
							value: 'contains',
							label: '包含'
						},
						{
							value: 'not_contains',
							label: '不包含'
						},
						{
							value: 'regex',
							label: '正则匹配'
						}
					],
					number: [{
							value: 'eq',
							label: '等于'
						},
						{
							value: 'ne',
							label: '不等于'
						},
						{
							value: 'gt',
							label: '大于'
						},
						{
							value: 'gte',
							label: '大于等于'
						},
						{
							value: 'lt',
							label: '小于'
						},
						{
							value: 'lte',
							label: '小于等于'
						}
					],
					select: [{
							value: 'eq',
							label: '等于'
						},
						{
							value: 'ne',
							label: '不等于'
						},
						{
							value: 'in',
							label: '包含任一'
						},
						{
							value: 'not_in',
							label: '不包含任一'
						}
					],
					date: [{
							value: 'eq',
							label: '等于'
						},
						{
							value: 'ne',
							label: '不等于'
						},
						{
							value: 'gt',
							label: '晚于'
						},
						{
							value: 'gte',
							label: '晚于或等于'
						},
						{
							value: 'lt',
							label: '早于'
						},
						{
							value: 'lte',
							label: '早于或等于'
						}
					]
				},
				valueTypes: [{
						value: 'constant',
						label: '常量'
					},
					{
						value: 'variable',
						label: '变量'
					},
					{
						value: 'expression',
						label: '表达式'
					}
				],
				fieldOptions: {}, // 动态字段的选项（如 select 类型的选项）
				operatorHelpData: [{
						operator: 'eq',
						description: '等于',
						example: '部门 = "技术部"'
					},
					{
						operator: 'ne',
						description: '不等于',
						example: '部门 ≠ "人事部"'
					},
					{
						operator: 'gt',
						description: '大于',
						example: '金额 > 1000'
					},
					{
						operator: 'gte',
						description: '大于等于',
						example: '金额 ≥ 5000'
					},
					{
						operator: 'lt',
						description: '小于',
						example: '天数 < 30'
					},
					{
						operator: 'lte',
						description: '小于等于',
						example: '级别 ≤ 3'
					},
					{
						operator: 'contains',
						description: '包含文本',
						example: '事由包含 "紧急"'
					},
					{
						operator: 'in',
						description: '包含任一',
						example: '类型 in ["公章", "合同章"]'
					},
					{
						operator: 'not_in',
						description: '不包含任一',
						example: '部门 not_in ["财务部"]'
					}
				],
				departments: [], // 部门数据（略，可自行加载）
				// 表格配置
				table1: {
					action: "admin/bpmn/condition-rule/sys/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => this.$hasRole('admin') || this.$hasPermission('bpmn-workflow-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => this.$hasRole('admin') || this.$hasPermission('bpmn-workflow-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => this.$hasRole('admin') || this.$hasPermission('bpmn-workflow-delete')
						}
					],
					columns: [{
							key: "code",
							title: "规则编码",
							type: "text",
							width: 250,
							fixed: "left"
						},
						{
							key: "name",
							title: "规则名称",
							type: "text",
							width: 200
						},
						{
							key: "form_type_code",
							title: "关联表单",
							type: "text",
							width: 150,
							formatter: (val, item) => item.formTypes?.name || val
						},
						{
							key: "rule_expression",
							title: "条件配置",
							type: "text",
							width: 200,
							render: (value) => value?.conditions?.length ? `${value.conditions.length}个条件` : '-'
						},
						{
							"key": "scope",
							"title": "适用范围",
							"type": "text",
							"width": 200,
							"render": (value) => {
								if (!value) return '全部';
								const companyCount = value.companies ? value.companies.length : 0;
								const deptCount = value.departments ? value.departments.length : 0;
								if (companyCount === 0 && deptCount === 0) return '全部';
								return `${companyCount}公司 ${deptCount}部门`;
							}
						},
						{
							key: "status",
							title: "状态",
							type: "tag",
							width: 100,
							data: [{
								value: "active",
								label: "启用",
								tagType: "success"
							}, {
								value: "inactive",
								label: "停用",
								tagType: "danger"
							}]
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"type": "time",
							"width": 180,
							"show": ["detail"]
						},
						{
							"key": "users.nickname",
							"title": "更新人",
							"type": "text",
							"width": 180,
							"show": ["detail"]
						}
					],
					multipleSelection: [],
					selectItem: ""
				},
				queryForm1: {
					formData: {
						code: "",
						name: "",
						status: ""
					},
					columns: [{
							key: "code",
							title: "规则编码",
							type: "text",
							width: 200,
							mode: "%%"
						},
						{
							key: "name",
							title: "规则名称",
							type: "text",
							width: 200,
							mode: "%%"
						},
						{
							key: "form_type_code",
							title: "表单类型",
							type: "remote-select",
							placeholder: "选择表单类型",
							width: 200,
							action: "admin/bpmn/form-type/sys/getList",
							props: {
								list: "rows",
								value: "code",
								label: "name"
							},
							showAll: true,
							actionData: {
								status: 'active',
								pageSize: 1000
							}
						},
						{
							key: "status",
							title: "状态",
							type: "select",
							width: 150,
							mode: "=",
							data: [{
								value: "active",
								label: "启用"
							}, {
								value: "inactive",
								label: "停用"
							}]
						}
					]
				},
				form1: {
					data: {
						code: "",
						name: "",
						description: "",
						form_type_code: "",
						rule_expression: {
							type: "simple",
							conditions: [],
							logic: "and"
						},
						scope: {
							departments: []
						},
						status: "active"
					},
					props: {
						action: "",
						rules: {
							code: [{
								required: true,
								message: "规则编码不能为空"
							}, {
								pattern: /^[A-Z][A-Z0-9_]*$/,
								message: "格式需为大写字母、数字、下划线，且字母开头"
							}],
							name: [{
								required: true,
								message: "规则名称不能为空"
							}],
							form_type_code: [{
								required: true,
								message: "请选择表单类型"
							}],
							"rule_expression.conditions": [{
								validator: (rule, value, callback) => {
									if (!value || value.length === 0) callback(new Error("至少需要一个条件"));
									else callback();
								},
								trigger: ['change']
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				}
			};
		},
		onLoad() {
			this.init();
		},
		methods: {
			async init() {
				await this.loadFormTypes();
				await this.loadDepartments();
				this.addCondition(); // 默认添加一个条件
				await this.loadCompanies();
				// 如果有编辑回填数据，需要根据已有的 scope.companies 加载部门树
				if (this.form1.data.scope && this.form1.data.scope.companies && this.form1.data.scope.companies
					.length) {
					await this.onScopeCompanyChange(this.form1.data.scope.companies);
				}
			},
			// 加载公司列表（适用范围）
			async loadCompanies() {
				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/company/sys/getList',
						data: {}
					});
					if (res.code === 0) {
						this.companies = res.rows;
					}
				} catch (error) {
					console.error('加载公司列表失败:', error);
				}
			},

			// 公司变化时加载部门树
			async onScopeCompanyChange(companyIds) {
				// 清空已选部门
				this.form1.data.scope.departments = [];
				if (!companyIds || companyIds.length === 0) {
					this.scopeDepartmentsTree = [];
					return;
				}
				// 通常只取第一个公司加载部门（如果允许多公司，可遍历累加部门树，但简单起见取首个）
				const companyId = Array.isArray(companyIds) ? companyIds[0] : companyIds;
				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/department/pub/getList',
						data: {
							company_id: companyId
						}
					});
					if (res.code === 0) {
						// 转换为树形结构（使用员工管理页面中的 toTreeData 方法）
						this.scopeDepartmentsTree = this.toTreeData(res.rows);
					}
				} catch (error) {
					console.error('加载部门树失败:', error);
					this.scopeDepartmentsTree = [];
				}
			},

			// 部门选择变化（可预留做扩展）
			onScopeDepartmentChange(val) {
				console.log('适用部门变化:', val);
			},

			// 复用员工管理中的 toTreeData 方法（需要定义）
			toTreeData(originalData) {
				// 递归转换，将 department_id / department_name 转为树形结构
				const convertNode = (node) => {
					return {
						value: node.department_id,
						label: node.department_name,
						children: node.children && node.children.length > 0 ?
							node.children.map(child => convertNode(child)) : []
					};
				};
				return originalData
					.filter(item => !item.parent_department_id || item.parent_department_id === null)
					.map(root => convertNode(root));
			},

			// 加载职务类型
			async loadPositionFields() {
				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/position/sys/getList',
						data: {
							pageSize: -1,
							pageIndex: 1
						} // 可根据需要调整
					});
					if (res.code === 0 && res.rows && res.rows.length > 0) {
						const positions = res.rows;
						// 构建职级字段（数值类型）
						const jobLevelField = {
							value: 'position.job_level',
							label: '职级',
							type: 'number', // 使操作符显示数值比较符
							description: '职务对应的职级（数值）'
						};
						// 构建职位名称字段（下拉选择类型）
						const positionNameField = {
							value: 'position.position_name',
							label: '职位名称',
							type: 'select', // 下拉选择
							options: positions.map(p => ({
								label: p.position_name,
								value: p.position_id // 可按需要存 position_id 或 position_name
							})),
							description: '选择具体职位'
						};
						return [jobLevelField, positionNameField];
					}
					return [];
				} catch (error) {
					console.error('加载职务字段失败:', error);
					return [];
				}
			},

			// 加载表单类型
			async loadFormTypes() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/form-type/sys/getList',
						data: {
							pageSize: -1,
							pageIndex: 1,
							status: 'active'
						}
					});
					if (res.code === 0) {
						this.formTypes = res.rows.map(item => ({
							code: item.code,
							name: item.name
						}));
						// 更新查询表单的下拉选项
						const formTypeColumn = this.queryForm1.columns.find(c => c.key === 'form_type_code');
						if (formTypeColumn) formTypeColumn.data = this.formTypes.map(ft => ({
							value: ft.code,
							label: ft.name
						}));
					}
				} catch (error) {
					console.error('加载表单类型失败:', error);
				}
			},
			// 根据表单类型加载字段
			async onFormTypeChange(formTypeCode) {
				if (!formTypeCode) {
					this.dynamicFieldGroups = [];
					return;
				}

				// 原有的表单字段加载
				const formFieldsPromise = vk.callFunction({
					url: 'admin/bpmn/condition-rule/pub/getFormFields',
					data: {
						form_type_code: formTypeCode
					}
				});

				// 新增：加载职务字段
				const positionFieldsPromise = this.loadPositionFields();

				try {
					const [formRes, positionFields] = await Promise.all([formFieldsPromise, positionFieldsPromise]);

					// 处理表单字段分组
					const fields = (formRes.code === 0 && formRes.rows) ? formRes.rows : [];
					const basicFields = fields.filter(f => !f.value.includes('.*.'));
					const detailFields = fields.filter(f => f.value.includes('.*.'));

					this.dynamicFieldGroups = [];
					if (basicFields.length) this.dynamicFieldGroups.push({
						label: '基础字段',
						options: basicFields
					});
					if (detailFields.length) this.dynamicFieldGroups.push({
						label: '明细字段',
						options: detailFields
					});

					// 新增：添加职务字段分组
					if (positionFields.length) {
						this.dynamicFieldGroups.push({
							label: '职务相关字段',
							options: positionFields
						});
					}

					// 缓存选项（用于 select 类型下拉值）
					this.fieldOptions = {};
					fields.forEach(f => {
						if (f.type === 'select' && f.options) this.fieldOptions[f.value] = f.options;
					});
					// 职务字段的选项也缓存
					positionFields.forEach(f => {
						if (f.options) this.fieldOptions[f.value] = f.options;
					});

				} catch (error) {
					console.error('加载字段失败:', error);
					this.dynamicFieldGroups = [];
				}
			},
			// 获取字段配置（根据字段key获取类型等信息）
			getFieldConfig(fieldValue) {
				if (!this.dynamicFieldGroups) return null;
				for (const group of this.dynamicFieldGroups) {
					const field = group.options.find(f => f.value === fieldValue);
					if (field) return field;
				}
				return null;
			},
			getAvailableOperators(fieldValue) {
				const fieldConfig = this.getFieldConfig(fieldValue);
				if (fieldConfig) return this.operators[fieldConfig.type] || this.operators.string;
				return this.operators.string;
			},
			getValueComponent(condition) {
				const fieldConfig = this.getFieldConfig(condition.field);
				if (fieldConfig && fieldConfig.type === 'select') return 'ValueInput';
				return 'el-input';
			},
			getFieldOptions(fieldValue) {
				return this.fieldOptions[fieldValue] || [];
			},
			isMultipleOperator(operator) {
				return ['in', 'not_in'].includes(operator);
			},
			getValuePlaceholder(condition) {
				const fieldConfig = this.getFieldConfig(condition.field);
				if (!fieldConfig) return '输入值';
				if (condition.value_type === 'variable') return '输入变量名，如：${applicant.department}';
				if (condition.value_type === 'expression') return '输入表达式，如：amount > 1000';
				if (fieldConfig.type === 'select') return '选择值';
				return '输入值';
			},
			getValueTypeDescription(valueType) {
				const desc = {
					constant: '固定值',
					variable: '引用流程变量',
					expression: 'JavaScript表达式'
				};
				return desc[valueType] || '';
			},
			onFieldChange(condition) {
				condition.operator = this.getAvailableOperators(condition.field)[0]?.value || 'eq';
				condition.value = '';
			},
			onValueTypeChange(condition) {
				condition.value = '';
			},
			onRuleTypeChange() {},
			formatRulePreview() {
				const {
					conditions,
					type,
					logic
				} = this.form1.data.rule_expression;
				if (!conditions.length) return '暂无条件';
				const texts = conditions.map(c => {
					const fieldConfig = this.getFieldConfig(c.field);
					const fieldName = fieldConfig ? fieldConfig.label : c.field;
					const op = this.getAvailableOperators(c.field).find(o => o.value === c.operator)?.label || c
						.operator;
					return `${fieldName} ${op} ${c.value}`;
				});
				if (type === 'simple' || conditions.length === 1) return texts[0];
				return texts.join(logic === 'and' ? ' 并且 ' : ' 或者 ');
			},
			testCondition(condition) {
				this.$message.info(`测试条件: ${this.formatConditionText(condition)}`);
			},
			formatConditionText(condition) {
				const fieldConfig = this.getFieldConfig(condition.field);
				const fieldName = fieldConfig ? fieldConfig.label : condition.field;
				const op = this.getAvailableOperators(condition.field).find(o => o.value === condition.operator)?.label ||
					condition.operator;
				return `${fieldName} ${op} ${condition.value}`;
			},
			addCondition() {
				this.form1.data.rule_expression.conditions.push({
					field: '',
					operator: 'eq',
					value: '',
					value_type: 'constant'
				});
			},
			addConditionGroup() {
				this.form1.data.rule_expression.conditions.push({
					field: '',
					operator: 'eq',
					value: '',
					value_type: 'constant',
					_group: true
				});
			},
			removeCondition(index) {
				if (this.form1.data.rule_expression.conditions.length > 1) this.form1.data.rule_expression.conditions
					.splice(index, 1);
				else this.$message.warning('至少保留一个条件');
			},
			async loadDepartments() {
				/* 略，可自行实现 */
				this.departments = [];
			},
			showRuleHelp() {
				this.ruleHelpVisible = true;
			},
			resetForm() {
				this.scopeDepartmentsTree = [];
				this.form1.data.scope = {
					companies: [],
					departments: []
				};
				this.enableScope = true;
			},
			search() {
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			currentChange(val) {
				this.table1.selectItem = val;
			},
			selectionChange(list) {
				this.table1.multipleSelection = list;
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/bpmn/condition-rule/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加条件规则';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/bpmn/condition-rule/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑条件规则';
				this.form1.props.show = true;
				this.form1.data = vk.pubfn.copyObject(item);
				// 回填后重新加载字段列表
				if (this.form1.data.form_type_code) this.onFormTypeChange(this.form1.data.form_type_code);
				this.form1.data = vk.pubfn.copyObject(item);
				// 确保 scope 对象存在
				if (!this.form1.data.scope) {
					this.form1.data.scope = {
						companies: [],
						departments: []
					};
				}
				// 如果有已选公司，重新加载部门树
				if (this.form1.data.scope.companies && this.form1.data.scope.companies.length) {
					this.$nextTick(() => {
						this.onScopeCompanyChange(this.form1.data.scope.companies);
					});
				}
				// 启用开关根据是否有范围数据
				this.enableScope = (this.form1.data.scope.companies && this.form1.data.scope.companies.length > 0) ||
					(this.form1.data.scope.departments && this.form1.data.scope.departments.length > 0);
			},
			deleteBtn({
				item
			}) {
				this.$confirm('确定删除该条件规则吗？', '提示', {
					type: 'warning'
				}).then(async () => {
					const res = await vk.callFunction({
						url: 'admin/bpmn/condition-rule/sys/delete',
						data: {
							_id: item._id
						}
					});
					if (res.code === 0) {
						this.$message.success('删除成功');
						this.refresh();
					} else this.$message.error(res.msg || '删除失败');
				}).catch(() => {});
			},
			async submitForm() {
				if (!this.$refs.formRef) return;
				try {
					await this.$refs.formRef.validate();
					if (!this.enableScope) {
						this.form1.data.scope = {
							companies: [],
							departments: []
						};
					}
					this.formLoading = true;
					const res = await vk.callFunction({
						url: this.form1.props.action,
						data: this.form1.data
					});
					if (res.code === 0) {
						this.$message.success(this.form1.props.formType === 'add' ? '添加成功' : '更新成功');
						this.form1.props.show = false;
						this.refresh();
					} else this.$message.error(res.msg || '操作失败');
				} catch (error) {
					console.error(error);
				} finally {
					this.formLoading = false;
				}
			},
			async saveAndTest() {
				await this.submitForm();
				if (!this.form1.props.show) this.testRule(this.form1.data);
			},
			testRule(item) {
				this.$message.info(`测试规则: ${item.name}`);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body {
		padding: 20rpx;
		background: #f5f7fa;
		min-height: 100vh;
	}

	.scope-departments-tree {
		::v-deep .el-tree-node__content {
			height: 28px;
		}
	}

	.button-group {
		margin-bottom: 20rpx;
		padding: 20rpx 24rpx;
		background: #fff;
		border-radius: 8rpx;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #ebeef5;
	}

	// 弹窗样式
	::v-deep .condition-rule-dialog {
		.el-dialog__body {
			padding: 0;
		}
	}

	.dialog-content {
		padding: 24px;
		max-height: 70vh;
		overflow-y: auto;
	}

	.condition-form {
		.form-section {
			margin-bottom: 24px;
			border-radius: 8px;
			border: 1px solid #e4e7ed;

			&:last-child {
				margin-bottom: 0;
			}

			::v-deep .el-card__header {
				padding: 16px 20px;
				background: #f8f9fa;
				border-bottom: 1px solid #e4e7ed;
			}
		}

		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.section-title {
			font-size: 16px;
			font-weight: 600;
			color: #303133;
		}

		.section-actions {
			display: flex;
			align-items: center;
		}

		.form-tip {
			font-size: 12px;
			color: #909399;
			margin-top: 4px;
			line-height: 1.4;
		}

		.no-margin-form-item {
			margin-bottom: 0;

			::v-deep .el-form-item__content {
				margin-left: 0 !important;
			}
		}

		.inline-form-item {
			margin-bottom: 0;

			::v-deep .el-form-item__content {
				line-height: normal;
			}
		}
	}

	// 规则预览
	.rule-preview {
		margin-bottom: 16px;
		padding: 12px 16px;
		background: #f0f9ff;
		border: 1px solid #bee3f8;
		border-radius: 6px;

		.preview-title {
			font-weight: 600;
			color: #2b6cb0;
			margin-bottom: 4px;
		}

		.preview-content {
			color: #2d3748;
			font-family: 'Courier New', monospace;
			background: #fff;
			padding: 8px 12px;
			border-radius: 4px;
			border: 1px solid #e2e8f0;
		}
	}

	// 条件配置样式
	.conditions-container {
		padding: 0;
	}

	.condition-list {
		margin-bottom: 16px;
	}

	.condition-item {
		margin-bottom: 20px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.condition-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
		padding: 0 4px;

		.condition-index {
			font-size: 14px;
			font-weight: 600;
			color: #409eff;
		}
	}

	.condition-content {
		padding: 16px;
		background: #f8f9fa;
		border-radius: 6px;
		border: 1px solid #e4e7ed;
	}

	.condition-row {
		display: flex;
		align-items: flex-start;
	}

	.condition-actions {
		display: flex;
		justify-content: center;
		padding-top: 4px;
	}

	.value-type-tip {
		margin-top: 8px;
		font-size: 12px;
		color: #909399;
		padding: 4px 8px;
		background: #edf2f7;
		border-radius: 4px;
	}

	.condition-connector {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 12px 0;
		padding: 0 20px;
	}

	.connector-line {
		flex: 1;
		height: 2px;
		background: #dcdfe6;
	}

	.connector-text {
		padding: 0 16px;
	}

	.condition-actions-bottom {
		display: flex;
		justify-content: center;
		gap: 12px;
		margin-top: 16px;
	}

	.add-condition-btn {
		border: 1px dashed #dcdfe6;
		background: #fff;
		color: #606266;

		&:hover {
			border-color: #409eff;
			color: #409eff;
		}
	}

	// 字段选项样式
	.field-option {
		.field-name {
			font-size: 14px;
			color: #303133;
		}

		.field-desc {
			font-size: 12px;
			color: #909399;
			margin-top: 2px;
		}
	}

	// 选项样式
	.option-item {
		.option-name {
			font-size: 14px;
			color: #303133;
		}

		.option-code {
			font-size: 12px;
			color: #909399;
			margin-top: 2px;
		}
	}

	// 适用范围禁用提示
	.scope-disabled-tip {
		padding: 12px 0;
	}

	// 对话框底部
	.dialog-footer {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding: 16px 24px;
		border-top: 1px solid #e4e7ed;
		background: #fafafa;
	}

	// 规则帮助内容
	.rule-help-content {

		h3,
		h4 {
			color: #303133;
			margin-bottom: 12px;
		}

		ul {
			padding-left: 20px;
			margin-bottom: 16px;

			li {
				margin-bottom: 8px;
				line-height: 1.5;
			}
		}
	}

	// 表格样式优化
	::v-deep .vk-data-table {
		.el-table {
			border-radius: 8px;
			overflow: hidden;
			box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
		}

		.el-table__header {
			th {
				background-color: #f5f7fa;
				color: #606266;
				font-weight: 600;
			}
		}
	}

	// 响应式调整
	@media (max-width: 768px) {
		.dialog-content {
			padding: 16px;
		}

		.condition-form {
			.form-section {
				margin-bottom: 16px;
			}
		}

		.condition-content {
			padding: 12px;
		}

		.condition-row {
			flex-wrap: wrap;
		}

		.condition-row .el-col {
			margin-bottom: 8px;
		}
	}
</style>