<template>
	<view class="page-body">
		<!-- 页面内容开始 -->

		<!-- 表格搜索组件开始 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search"></vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view class="button-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('bpmn-workflow-add')" @click="addBtn">添加路由配置</el-button>
				<el-button type="warning" size="small" icon="el-icon-refresh" @click="refresh">刷新</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="900px" mode="form"
			:close-on-click-modal="false" custom-class="route-config-dialog">
			<div class="dialog-content">
				<el-form :model="form1.data" :rules="form1.props.rules" ref="formRef" label-width="130px"
					class="route-form">

					<!-- 基础信息 -->
					<el-card shadow="never" class="form-section">
						<div slot="header" class="section-header">
							<span class="section-title">基础信息</span>
						</div>
						<el-row :gutter="24">
							<el-col :span="12">
								<el-form-item label="配置名称" prop="name">
									<el-input v-model="form1.data.name" placeholder="请输入路由配置名称" maxlength="100"
										show-word-limit>
									</el-input>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="优先级" prop="priority">
									<el-input-number v-model="form1.data.priority" :min="1" :max="999"
										controls-position="right" style="width: 100%">
									</el-input-number>
									<div class="form-tip">数字越小优先级越高</div>
								</el-form-item>
							</el-col>
						</el-row>
						<el-form-item label="配置描述">
							<el-input v-model="form1.data.description" type="textarea" placeholder="请输入配置描述" :rows="3"
								maxlength="500" show-word-limit>
							</el-input>
						</el-form-item>
					</el-card>

					<!-- 路由规则 -->
					<el-card shadow="never" class="form-section">
						<div slot="header" class="section-header">
							<span class="section-title">路由规则配置</span>
						</div>
						<el-row :gutter="24">
							<el-col :span="12">
								<el-form-item label="表单类型" prop="form_type_code">
									<el-select v-model="form1.data.form_type_code" placeholder="请选择表单类型"
										style="width: 100%" filterable>
										<el-option v-for="item in formTypes" :key="item.code" :label="item.name"
											:value="item.code">
											<div class="option-item">
												<div class="option-name">{{ item.name }}</div>
												<div class="option-code">{{ item.code }}</div>
											</div>
										</el-option>
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="流程定义" prop="process_definition_key">
									<el-select v-model="form1.data.process_definition_key" placeholder="请选择流程定义"
										style="width: 100%" filterable>
										<el-option v-for="item in processDefinitions" :key="item.key" :label="item.name"
											:value="item.key">
											<div class="option-item">
												<div class="option-name">{{ item.name }}</div>
												<div class="option-key">{{ item.key }}</div>
											</div>
										</el-option>
									</el-select>
								</el-form-item>
							</el-col>
						</el-row>
						<el-form-item label="条件规则">
							<el-select v-model="form1.data.condition_rule_code" placeholder="请选择条件规则（可选）"
								style="width: 100%" clearable filterable>
								<el-option v-for="item in conditionRules" :key="item.code" :label="item.name"
									:value="item.code">
									<div class="option-item">
										<div class="option-name">{{ item.name }}</div>
										<div class="option-code">{{ item.code }}</div>
										<div class="option-desc">{{ item.description }}</div>
									</div>
								</el-option>
							</el-select>
							<div class="form-tip">不选择条件规则表示无条件匹配</div>
						</el-form-item>
						<el-form-item>
							<el-checkbox v-model="form1.data.fallback">
								设为回退配置
							</el-checkbox>
							<div class="form-tip">回退配置在无其他配置匹配时使用(默认配置)</div>
						</el-form-item>
					</el-card>

					<!-- 变量映射 -->
					<el-card shadow="never" class="form-section">
						<div slot="header" class="section-header">
							<span class="section-title">变量映射配置</span>
							<el-button type="text" icon="el-icon-plus" size="small" @click="addVariableMapping">
								添加变量
							</el-button>
						</div>
						<div class="variables-container">
							<div class="variable-item" v-for="(variable, index) in variableMappings" :key="index">
								<el-row :gutter="12" class="variable-row">
									<el-col :span="6">
										<el-input v-model="variable.key" placeholder="变量名" size="small">
										</el-input>
									</el-col>
									<el-col :span="14">
										<component :is="getVariableValueComponent(variable)" v-model="variable.value"
											:placeholder="getVariableValuePlaceholder(variable)" size="small"
											style="width: 100%">
										</component>
									</el-col>
									<el-col :span="4">
										<el-button type="danger" icon="el-icon-delete" circle size="mini"
											@click="removeVariableMapping(index)">
										</el-button>
									</el-col>
								</el-row>
								<div class="variable-type-selector">
									<el-radio-group v-model="variable.value_type" size="mini"
										@change="onVariableTypeChange(variable)">
										<el-radio-button label="constant">常量</el-radio-button>
										<el-radio-button label="variable">变量</el-radio-button>
										<el-radio-button label="expression">表达式</el-radio-button>
									</el-radio-group>
									<div class="variable-type-tip">
										{{ getVariableTypeDescription(variable.value_type) }}
									</div>
								</div>
							</div>
							<div v-if="variableMappings.length === 0" class="variables-empty">
								<el-empty description="暂无变量配置" :image-size="60"></el-empty>
							</div>
						</div>
					</el-card>

					<!-- 状态设置 -->
					<el-card shadow="never" class="form-section">
						<div slot="header" class="section-header">
							<span class="section-title">状态设置</span>
						</div>
						<el-form-item label="配置状态" prop="status">
							<el-radio-group v-model="form1.data.status">
								<el-radio label="active">启用</el-radio>
								<el-radio label="inactive">停用</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-card>
				</el-form>
			</div>

			<template #footer>
				<div class="dialog-footer">
					<el-button @click="form1.props.show = false" size="medium">取消</el-button>
					<el-button type="primary" @click="submitForm" :loading="formLoading" size="medium">确定</el-button>
				</div>
			</template>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 200;
	// 变量值输入组件
	const VariableValueInput = {
		props: ['value', 'placeholder', 'valueType'],
		data() {
			return {
				internalValue: this.value || ''
			};
		},
		watch: {
			value(newVal) {
				this.internalValue = newVal;
			},
			internalValue(newVal) {
				this.$emit('input', newVal);
			}
		},
		methods: {
			handleInput(value) {
				this.internalValue = value;
			}
		},
		render(h) {
			// 表达式类型使用文本域
			if (this.valueType === 'expression') {
				return h('el-input', {
					props: {
						value: this.internalValue,
						placeholder: this.placeholder,
						type: 'textarea',
						rows: 3,
						clearable: true
					},
					on: {
						input: (value) => this.handleInput(value)
					}
				});
			}

			// 默认文本输入
			return h('el-input', {
				props: {
					value: this.internalValue,
					placeholder: this.placeholder,
					clearable: true
				},
				on: {
					input: (value) => this.handleInput(value)
				}
			});
		}
	};

	export default {
		components: {
			VariableValueInput
		},
		data() {
			return {
				loading: false,
				formLoading: false,
				// 数据源
				formTypes: [],
				processDefinitions: [],
				conditionRules: [],
				// 变量映射
				variableMappings: [],

				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/bpmn/process-route-config/sys/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('bpmn-workflow-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('bpmn-workflow-edit')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('bpmn-workflow-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							"key": "name",
							"title": "配置名称",
							"type": "text",
							"width": colWidth - 50,
							"fixed": "left"
						},
						{
							"key": "form_type_code",
							"title": "表单类型",
							"type": "text",
							"width": colWidth - 50,
							"render": (value, item) => {
								return item.form_type_info?.name || value;
							}
						},
						{
							"key": "process_definition_key",
							"title": "流程定义",
							"type": "text",
							"width": colWidth,
							"render": (value, item) => {
								return item.process_definition_info?.name || value;
							}
						},
						{
							"key": "condition_rule_code",
							"title": "流程条件",
							"type": "text",
							"width": colWidth + 50,
							"render": (value, item) => {
								return item.condition_rule_info?.name || (value ? '已配置' : '无条件');
							}
						},
						{
							"key": "priority",
							"title": "优先级",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "fallback",
							"title": "回退配置",
							"type": "tag",
							"width": colWidth - 100,
							"size": "small",
							"data": [{
									value: true,
									label: "是",
									tagType: "success"
								},
								{
									value: false,
									label: "否",
									tagType: "warning"
								}
							]
						},
						{
							"key": "status",
							"title": "状态",
							"type": "tag",
							"width": colWidth - 100,
							"size": "small",
							"data": [{
									value: 'active',
									label: "启用",
									tagType: "success"
								},
								{
									value: 'inactive',
									label: "停用",
									tagType: "danger"
								}
							]
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"type": "time",
							"width": colWidth,
							"show": ["detail"]
						},
						{
							"key": "users.nickname",
							"title": "更新人",
							"type": "text",
							"width": colWidth,
							"show": ["detail"]
						}
					],
					// 多选框选中的值
					multipleSelection: [],
					// 当前高亮的记录
					selectItem: ""
				},
				// 表格相关结束 -----------------------------------------------------------

				// 表单相关开始 -----------------------------------------------------------
				// 查询表单请求数据
				queryForm1: {
					// 查询表单数据源，可在此设置默认值
					formData: {
						name: "",
						form_type_code: "",
						status: ""
					},
					// 查询表单的字段规则
					columns: [{
							"key": "name",
							"title": "配置名称",
							"type": "text",
							"width": 200,
							"mode": "%%"
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
							"key": "status",
							"title": "状态",
							"type": "select",
							"width": 150,
							"mode": "=",
							"data": [{
									value: "active",
									label: "启用"
								},
								{
									value: "inactive",
									label: "停用"
								}
							]
						}
					]
				},

				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						name: "",
						description: "",
						form_type_code: "",
						process_definition_key: "",
						condition_rule_code: "",
						priority: 1,
						fallback: false,
						config_context: {
							variables_mapping: {}
						},
						status: "active"
					},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单验证规则
						rules: {
							name: [{
									required: true,
									message: "配置名称不能为空",
									trigger: ['blur', 'change']
								},
								{
									max: 100,
									message: "配置名称长度不能超过100个字符",
									trigger: ['blur', 'change']
								}
							],
							form_type_code: [{
								required: true,
								message: "表单类型不能为空",
								trigger: ['blur', 'change']
							}],
							process_definition_key: [{
								required: true,
								message: "流程定义不能为空",
								trigger: ['blur', 'change']
							}],
							priority: [{
									required: true,
									message: "优先级不能为空",
									trigger: ['blur', 'change']
								},
								{
									type: 'number',
									min: 1,
									message: "优先级必须大于0",
									trigger: ['blur', 'change']
								}
							],
							status: [{
								required: true,
								message: "状态不能为空",
								trigger: ['blur', 'change']
							}]
						},
						// add 代表添加 update 代表修改
						formType: "",
						// 弹窗标题
						title: "",
						// 是否显示表单的弹窗
						show: false
					}
				}
			};
		},

		onLoad(options = {}) {
			vk = vk;
			this.options = options;
			this.init(options);
		},

		methods: {
			// 页面数据初始化函数
			async init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
				await this.loadFormTypes();
				await this.loadProcessDefinitions();
				await this.loadConditionRules();
			},

			// 加载表单类型
			async loadFormTypes() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/process-route-config/pub/getFormTypes',
						data: {
							pageIndex: 1,
							pageSize: -1
						}
					});

					if (res.code === 0) {
						this.formTypes = res.rows;
						// 更新查询表单的下拉选项
						const formTypeColumn = this.queryForm1.columns.find(col => col.key === 'form_type_code');
						if (formTypeColumn) {
							formTypeColumn.data = res.rows.map(item => ({
								value: item._id,
								label: item.name
							}));
						}
					}
				} catch (error) {
					console.error('加载表单类型失败:', error);
				}
			},

			// 加载流程定义
			async loadProcessDefinitions() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/process-route-config/pub/getProcessDefinitions'
					});

					if (res.code === 0) {
						this.processDefinitions = res.rows;
					}
				} catch (error) {
					console.error('加载流程定义失败:', error);
				}
			},

			// 加载条件规则
			async loadConditionRules() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/process-route-config/pub/getConditionRules'
					});

					if (res.code === 0) {
						this.conditionRules = res.rows;
					}
				} catch (error) {
					console.error('加载条件规则失败:', error);
				}
			},

			// 变量映射相关方法 - 修复版本
			initVariableMapping() {
				const mapping = this.form1.data.config_context?.variables_mapping || {};
				this.variableMappings = Object.keys(mapping).map(key => {
					const value = mapping[key];
					let displayValue = '';
					let valueType = 'constant';

					// 安全地检测值类型
					if (value === null || value === undefined) {
						displayValue = '';
						valueType = 'constant';
					} else if (typeof value === 'object') {
						// 对象或数组，认为是表达式
						try {
							displayValue = JSON.stringify(value, null, 2);
							valueType = 'expression';
						} catch (error) {
							console.error('JSON stringify error:', error);
							displayValue = String(value);
							valueType = 'constant';
						}
					} else {
						// 字符串或其他基本类型
						displayValue = String(value);
						// 安全地检查是否为变量格式
						if (typeof displayValue === 'string' &&
							displayValue.startsWith &&
							displayValue.startsWith('${') &&
							displayValue.endsWith('}')) {
							valueType = 'variable';
						} else {
							valueType = 'constant';
						}
					}

					return {
						key: key,
						value: displayValue,
						value_type: valueType
					};
				});
			},

			addVariableMapping() {
				this.variableMappings.push({
					key: '',
					value: '',
					value_type: 'constant'
				});
				this.updateVariablesMapping();
			},

			removeVariableMapping(index) {
				this.variableMappings.splice(index, 1);
				this.updateVariablesMapping();
			},

			onVariableTypeChange(variable) {
				// 当变量类型改变时，可以重置值或做其他处理
				if (variable.value_type === 'expression') {
					// 如果是表达式类型，可以设置一个默认的JSON结构
					if (!variable.value || variable.value.trim() === '') {
						variable.value = '{\n  \n}';
					}
				}
				this.updateVariablesMapping();
			},

			updateVariablesMapping() {
				const mapping = {};
				this.variableMappings.forEach(item => {
					if (item.key && item.key.trim() !== '' && item.value !== undefined && item.value !== null) {
						let finalValue = item.value;

						// 根据值类型处理值
						if (item.value_type === 'expression') {
							try {
								// 尝试解析 JSON
								if (item.value.trim() !== '') {
									finalValue = JSON.parse(item.value);
								} else {
									finalValue = {};
								}
							} catch (error) {
								// 如果解析失败，保持原字符串
								console.warn('JSON parse failed, keeping as string:', error);
								finalValue = item.value;
							}
						} else if (item.value_type === 'variable') {
							// 变量类型保持不变
							finalValue = item.value;
						} else {
							// 常量类型，尝试转换为合适的类型
							finalValue = this.convertToAppropriateType(item.value);
						}

						mapping[item.key] = finalValue;
					}
				});

				this.form1.data.config_context.variables_mapping = mapping;
			},

			// 类型转换辅助方法
			convertToAppropriateType(value) {
				if (value === null || value === undefined || value === '') {
					return value;
				}

				// 布尔值
				if (value === 'true') return true;
				if (value === 'false') return false;

				// null 和 undefined
				if (value === 'null') return null;
				if (value === 'undefined') return undefined;

				// 尝试转换为数字
				if (!isNaN(value) && value.toString().trim() !== '') {
					const num = Number(value);
					if (!isNaN(num)) return num;
				}

				// 默认返回字符串
				return value;
			},

			// 获取变量值输入组件
			getVariableValueComponent(variable) {
				return 'VariableValueInput';
			},

			// 获取变量值占位符
			getVariableValuePlaceholder(variable) {
				switch (variable.value_type) {
					case 'variable':
						return '输入变量名，如：${applicant.department}';
					case 'expression':
						return '输入JSON表达式，如：{"type": "function", "name": "getSupervisor"}';
					default:
						return '输入常量值';
				}
			},

			// 获取变量类型描述
			getVariableTypeDescription(valueType) {
				const descriptions = {
					constant: '固定值，直接参与条件比较',
					variable: '引用流程变量，运行时动态获取值',
					expression: 'JSON表达式，支持复杂数据结构'
				};
				return descriptions[valueType] || '';
			},

			// 页面跳转
			pageTo(path) {
				vk.navigateTo(path);
			},

			// 表单重置
			resetForm() {
				this.form1.data = vk.pubfn.copyObject(originalForms["form1"].data);
				this.variableMappings = [];
				if (this.$refs.formRef) {
					this.$refs.formRef.clearValidate();
				}
			},

			// 搜索
			search() {
				this.$refs.table1.search();
			},

			// 刷新
			refresh() {
				this.$refs.table1.refresh();
			},

			// 获取当前选中的行的数据
			getCurrentRow() {
				return this.$refs.table1.getCurrentRow();
			},

			// 监听 - 行的选中高亮事件
			currentChange(val) {
				this.table1.selectItem = val;
			},

			// 当选择项发生变化时会触发该事件
			selectionChange(list) {
				this.table1.multipleSelection = list;
			},

			// 显示添加页面
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/bpmn/process-route-config/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加路由配置';
				this.form1.props.show = true;
			},

			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/bpmn/process-route-config/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑路由配置';
				this.form1.props.show = true;

				// 深拷贝数据
				this.form1.data = vk.pubfn.copyObject(item);

				// 确保数据结构完整
				if (!this.form1.data.config_context) {
					this.form1.data.config_context = {
						variables_mapping: {}
					};
				}

				// 初始化变量映射
				this.initVariableMapping();
			},

			// 删除按钮
			deleteBtn({
				item
			}) {
				this.$confirm('确定删除该路由配置吗？', '提示', {
					type: 'warning'
				}).then(async () => {
					try {
						const res = await vk.callFunction({
							url: 'admin/bpmn/process-route-config/sys/delete',
							data: {
								_id: item._id
							}
						});

						if (res.code === 0) {
							this.$message.success('删除成功');
							this.refresh();
						} else {
							this.$message.error(res.msg || '删除失败');
						}
					} catch (error) {
						console.error('删除失败:', error);
						this.$message.error('删除失败');
					}
				}).catch(() => {
					// 用户取消
				});
			},

			// 提交表单
			async submitForm() {
				if (!this.$refs.formRef) return;

				try {
					// 验证表单
					await this.$refs.formRef.validate();

					// 更新变量映射
					this.updateVariablesMapping();

					this.formLoading = true;

					const res = await vk.callFunction({
						url: this.form1.props.action,
						data: {
							...this.form1.data,
							_id: this.form1.data._id // 更新时需要的ID
						}
					});

					if (res.code === 0) {
						this.$message.success(this.form1.props.formType === 'add' ? '添加成功' : '更新成功');
						this.form1.props.show = false;
						this.refresh();
					} else {
						this.$message.error(res.msg || '操作失败');
					}
				} catch (error) {
					console.error('表单验证失败:', error);
				} finally {
					this.formLoading = false;
				}
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

	.button-group {
		margin-bottom: 20rpx;
		padding: 20rpx 24rpx;
		background: #fff;
		border-radius: 8rpx;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
		border: 1rpx solid #ebeef5;
	}

	// 弹窗样式
	::v-deep .route-config-dialog {
		.el-dialog__body {
			padding: 0;
		}
	}

	.dialog-content {
		padding: 24px;
		max-height: 70vh;
		overflow-y: auto;
	}

	.route-form {
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

		.form-tip {
			font-size: 12px;
			color: #909399;
			margin-top: 4px;
		}
	}

	// 选项样式
	.option-item {
		.option-name {
			font-size: 14px;
			color: #303133;
		}

		.option-code,
		.option-key,
		.option-desc {
			font-size: 12px;
			color: #909399;
			margin-top: 2px;
		}

		.option-desc {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	// 变量配置样式
	.variables-container {
		.variable-item {
			margin-bottom: 16px;
			padding: 16px;
			background: #f8f9fa;
			border-radius: 6px;
			border: 1px solid #e4e7ed;

			&:last-child {
				margin-bottom: 0;
			}
		}

		.variable-row {
			display: flex;
			align-items: center;
			margin-bottom: 8px;
		}

		.variable-type-selector {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 8px;
			padding-top: 8px;
			border-top: 1px dashed #e4e7ed;
		}

		.variable-type-tip {
			font-size: 12px;
			color: #909399;
			flex: 1;
			margin-left: 12px;
		}

		.variables-empty {
			padding: 20px 0;
			text-align: center;
		}
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

		.route-form {
			.form-section {
				margin-bottom: 16px;
			}
		}

		.variable-item {
			padding: 12px;
		}

		.variable-row {
			flex-wrap: wrap;
		}

		.variable-row .el-col {
			margin-bottom: 8px;
		}

		.variable-type-selector {
			flex-direction: column;
			align-items: flex-start;
		}

		.variable-type-tip {
			margin-left: 0;
			margin-top: 4px;
		}
	}
</style>