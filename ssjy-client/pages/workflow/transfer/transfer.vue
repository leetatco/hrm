<template>
	<view class="page-body">
		<!-- 表格搜索组件 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns" @search="search">
			<template v-slot:dateRange>
				<vk-data-input-date-time v-model="queryForm1.formData.dateRange"
					type="daterange"></vk-data-input-date-time>
			</template>
		</vk-data-table-query>

		<!-- 自定义按钮区域 -->
		<view class="button-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasRole('group-common')" @click="addBtn" :disabled="loading"
					:loading="addLoading">
					新建调动申请
				</el-button>
				<el-button type="warning" size="small" icon="el-icon-refresh" @click="refresh" :loading="loading">
					刷新
				</el-button>
			</el-row>
		</view>

		<!-- 加载状态 -->
		<el-skeleton v-if="loading && !formSchema" :rows="10" animated />

		<!-- 表格组件 -->
		<vk-data-table v-else ref="table1" :action="table1.action" :columns="table1.columns"
			:query-form-param="queryForm1" :custom-right-btns="table1.customRightBtns" :selection="false" :row-no="true"
			:pagination="true" @update="updateBtn" @delete="deleteBtn" @current-change="currentChange"
			@selection-change="selectionChange" />

		<!-- 动态表单公共组件 -->
		<dynamic-form-dialog v-model="formDialog.show" :title="formDialog.title" :form-schema="formSchema"
			:form-type-code="formTypeCode" :initial-data="formDialog.data" :butVisible="true"
			:saveLoading="saveFormLoading" :submitLoading="submitFormLoading" :simulateLoading="simulateFormLoading"
			@save="handleFormSave" @submit="handleFormSubmit" @simulate="handleSimulate" @preview-file="previewFile" />

		<!-- 试算结果弹窗公共组件 -->
		<simulate-handle-dialog v-model="simulateDialog.show" :simulate-data="simulateDialog.data"
			@submit="submitAfterSimulate" />

		<!-- 文件预览弹窗公共组件 -->
		<file-preview-dialog v-model="filePreview.show" :file-data="filePreview.data" @download="downloadFile" />

		<vk-data-dialog v-model="detailDialog.show" :title="detailDialog.title" width="900px">
			<approve-header-detail :detail-data="detailDialog.data" :form-schema="formSchema"
				:process-info="processInfo" :status-history="statusHistory" :current-tasks="detailDialog.currentTasks"
				:show-basic-info="true" :show-return-info="false" :show-approval-flow="true" :show-current-task="true"
				:show-handle-form="false" :form-type-configs="formTypeConfigs" @preview-file="previewFile"
				@download-file="downloadFile" />
			<template v-slot:footer>
				<el-button @click="detailDialog.show = false">关闭</el-button>
			</template>
		</vk-data-dialog>
	</view>
</template>

<script>
	// 引入公共组件
	import DynamicFormDialog from '@/components/dynamic-form-dialog/dynamic-form-dialog.vue';
	import SimulateHandleDialog from '@/components/simulate-handle-dialog/simulate-handle-dialog.vue';
	import FilePreviewDialog from '@/components/file-preview-dialog/file-preview-dialog.vue';
	import ApproveHeaderDetail from '@/components/approve-header-detail/approve-header-detail.vue';

	let vk = uni.vk;

	export default {
		name: 'TransferApply',
		components: {
			DynamicFormDialog,
			SimulateHandleDialog,
			FilePreviewDialog,
			ApproveHeaderDetail
		},
		data() {
			return {
				formDatas: {},
				loading: true,
				// 按钮加载状态
				addLoading: false,
				refreshLoading: false,
				saveFormLoading: false,
				submitFormLoading: false,
				simulateFormLoading: false,
				deleteLoading: false,

				formSchema: null,
				formTypeCode: 'TRANSFER_APPLY',
				// 表单类型配置缓存
				formTypeConfigs: {},

				// 表单弹窗相关
				formDialog: {
					show: false,
					title: '',
					data: null
				},

				// 试算结果弹窗
				simulateDialog: {
					show: false,
					data: null
				},

				// 文件预览相关
				filePreview: {
					show: false,
					data: {
						url: '',
						name: '',
						type: ''
					}
				},

				// 审批流程
				processInfo: {
					tasks: [],
					instance: null
				},

				// 表格配置
				table1: {
					action: "admin/bpmn/application-form/sys/getList",
					customRightBtns: [{
							title: '详细',
							icon: 'el-icon-tickets',
							show: (item) => {
								return (this.$hasRole('admin') || this.$hasRole('group-common'));
							},
							onClick: (item) => {
								this.showDetail(item);
							}
						},
						{
							title: '编辑',
							type: 'primary',
							icon: 'el-icon-edit',
							show: (item) => {
								return (this.$hasRole('admin') || this.$hasRole('group-common')) &&
									item.status === 'draft' &&
									item.applicant_id === vk.getVuex('$user.userInfo.username');
							},
							onClick: (item) => {
								this.updateBtn({
									item
								});
							}
						},
						{
							title: '删除',
							type: 'danger',
							icon: 'el-icon-delete',
							show: (item) => {
								return (this.$hasRole('admin') || this.$hasRole('group-common')) &&
									item.status === 'draft' &&
									item.applicant_id === vk.getVuex('$user.userInfo.username');
							},
							onClick: (item) => {
								this.deleteBtn({
									item
								});
							}
						}
					],
					columns: [{
							key: "form_data.transfer_type",
							title: "调动类型",
							type: "text",
							width: 120,
							formatter: (value) => {
								return this.getFieldOptionLabel('transfer_type', value) || value;
							}
						},
						{
							key: "form_data.employee_list",
							title: "调动信息",
							type: "html",
							width: 600,
							formatter: (val) => {
								const field = this.getArrayObjectFields()||[];									
								return this.formatArrayObjectField(field[0], val);
								// let str = "<text>";
								// val.map((item, index) => {
								// 	str +=
								// 		`${item.employee_name}(${item.current_company_name}-${item.current_department_name}-${item.current_position_name}=>`;
								// 	str +=
								// 		`${item.new_company_name}-${item.new_department_name}-${item.new_position_name})`;
								// 	str += "<br>";
								// })
								// str += `总计：${val.length||0}人`;
								// str += "</text>";
								// return str;
							}
						},
						{
							key: "_add_time",
							title: "申请日期",
							type: "time",
							valueFormat: "yyyy-MM-dd",
							width: 180
						},
						{
							key: "form_data.effective_date",
							title: "生效日期",
							type: "date",
							valueFormat: "yyyy-MM-dd",
							width: 120
						},
						{
							key: "applicant_name",
							title: "申请人",
							type: "text",
							width: 100
						},
						{
							key: "status",
							title: "状态",
							type: "tag",
							width: 100,
							data: [{
									value: "draft",
									label: "草稿",
									tagType: "info"
								},
								{
									value: "pending",
									label: "待处理",
									tagType: "warning"
								},
								{
									value: "rejected",
									label: "已驳回",
									tagType: "danger"
								},
								{
									value: "withdrawn",
									label: "已撤回"
								},
								{
									value: "approved",
									label: "已通过",
									tagType: "success"
								}
							]
						}
					]
				},

				// 查询表单配置
				queryForm1: {
					formData: {
						form_type_code: "TRANSFER_APPLY",
						status: "pending"
					},
					columns: [{
							key: "form_type_code",
							title: "表单类型",
							type: "text",
							mode: "=",
							show: ["none"]
						}, {
							key: "status",
							title: "状态",
							type: "select",
							width: 150,
							mode: "=",
							data: [{
									value: "draft",
									label: "草稿"
								},
								{
									value: "pending",
									label: "待处理"
								},
								{
									value: "rejected",
									label: "已驳回"
								},
								{
									value: "withdrawn",
									label: "已撤回"
								}, {
									value: "approved",
									label: "已通过"
								}
							]
						},
						{
							key: "form_data.transfer_type",
							title: "调动类型",
							type: "select",
							width: 150,
							mode: "=",
							data: [{
									value: "promotion",
									label: "晋升"
								},
								{
									value: "demotion",
									label: "降职"
								},
								{
									value: "lateral",
									label: "平级调动"
								},
								{
									value: "department_transfer",
									label: "部门调动"
								},
								{
									value: "company_transfer",
									label: "公司调动"
								},
								{
									value: "position_adjustment",
									label: "岗位调整"
								}
							]
						},
						{
							key: "_add_time",
							title: "申请日期",
							type: "datetimerange",
							width: 300,
							mode: "[]"
						}
					]
				},

				// 详情弹窗
				detailDialog: {
					show: false,
					title: '人事调动申请详情',
					currentTasks: [],
					data: null
				},
				statusHistory: []
			};
		},
		onLoad(options = {}) {
			vk = this.vk;
			this.init(options);
		},
		methods: {
			//处理array<object>
			// 获取 array<object> 字段
			getArrayObjectFields() {
				if (!this.formSchema || !this.formSchema.fields) return [];
				return this.formSchema.fields.filter(field => {
					return field.type === 'array<object>';
				});
			},
			// 格式化array<object>类型字段
			formatArrayObjectField(field, arrayValue) {
				// 如果字段没有定义格式配置，使用默认格式化
				console.log("field:",field,field.itemFormat);
				
				if (vk.pubfn.isNull(field.itemFormat)) {
					this.$message.warning('没有设定array<object>格式！');
					return;
				}

				// 根据格式配置格式化每个数组成员
				const formattedItems = arrayValue.map(item => {
					return this.formatArrayObjectItem(item, field.itemFormat);
				});

				// 用<br>连接所有格式化后的成员
				return formattedItems.join('<br>');
			},

			// 根据格式配置格式化单个数组成员
			formatArrayObjectItem(item, formatConfig) {
				// 如果formatConfig是字符串模板
				if (typeof formatConfig === 'string') {
					return this.formatWithStringTemplate(item, formatConfig);
				}

				// 如果formatConfig是函数
				if (typeof formatConfig === 'function') {
					return formatConfig(item);
				}

				// 如果formatConfig是数组（字段列表）
				if (Array.isArray(formatConfig)) {
					return this.formatWithFieldList(item, formatConfig);
				}

				// 默认使用JSON.stringify
				return JSON.stringify(item);
			},

			// 使用字符串模板格式化
			formatWithStringTemplate(item, template) {
				// 替换模板中的${fieldName}为实际值
				return template.replace(/\${([^}]+)}/g, (match, fieldName) => {
					// 处理嵌套属性，如 new_company_department[0]
					const parts = fieldName.split(/[.[\]]/).filter(part => part);
					let value = item;

					for (const part of parts) {
						if (value && typeof value === 'object' && part in value) {
							value
								= value[part];
						} else {
							return '';
						}
					}

					return value !== undefined && value !== null ? value : '';
				});
			},

			// 使用字段列表格式化
			formatWithFieldList(item, fieldList) {
				const parts = fieldList.map(fieldConfig => {
					let fieldName, label;

					// 支持两种格式：字符串或对象
					if (typeof fieldConfig === 'string') {
						fieldName
							= fieldConfig;
						label
							= this.getFieldLabel(fieldName);
					} else if (fieldConfig && typeof fieldConfig === 'object') {
						fieldName
							= fieldConfig.name || fieldConfig.field;
						label
							= fieldConfig.label || this.getFieldLabel(fieldName);
					} else {
						return '';
					}

					// 获取字段值
					const value = this.getNestedProperty(item, fieldName);

					// 如果有转换函数，应用转换
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
						value
							= value[part];
					} else {
						return undefined;
					}
				}

				return value;
			},
			//结束

			// 打开表单
			openForm(name, item) {
				let that = this;
				let {
					vk
				} = that;
				// 确保使用响应式的方式更新
				that
					.$set(that.formDatas, name, item);
			},
			async init(options) {
				try {
					this.loading = true;
					await this.loadFormTypes();
					await this.getFormTypeSchema();
				} catch (error) {
					console.error('初始化失败:', error);
					this.$message.error('页面初始化失败');
				} finally {
					this.loading = false;
				}
			},
			async loadFormTypes() {
				try {
					const res = await this.vk.callFunction({
						url: 'admin/bpmn/form-type/sys/getList',
						data: {
							status: 'active'
						}
					});

					if (res.code === 0 && res.rows) {
						// 缓存表单类型配置
						res.rows.forEach(formType => {
							this.formTypeConfigs[formType.code] = formType;
						});

						// 更新查询条件中的申请类型选项
						const formTypeColumn = this.queryForm1.columns.find(c => c.key === 'form_type_code');
						if (formTypeColumn) {
							formTypeColumn.data = res.rows.map(item => ({
								value: item.code,
								label: item.name
							}));
						}
					}
				} catch (error) {
					console.error('加载表单类型失败:', error);
				}
			},

			async getFormTypeSchema() {
				try {
					const formType = this.formTypeConfigs[this.formTypeCode];
					if (formType && formType.form_schema) {
						this.formSchema = JSON.parse(formType.form_schema);
						this.initQueryFormOptions();
					} else {
						console.error('加载表单配置失败:', res.msg);
					}

				} catch (error) {
					console.error('加载表单配置失败:', error);
				}
			},

			initQueryFormOptions() {
				if (!this.formSchema || !this.formSchema.fields) return;

				const transferTypeField = this.formSchema.fields.find(f => f.name === 'transfer_type');
				if (transferTypeField && transferTypeField.options) {
					const transferTypeColumn = this.queryForm1.columns.find(c => c.key === 'form_data.transfer_type');
					if (transferTypeColumn) {
						transferTypeColumn.data = transferTypeField.options;
					}
				}
			},

			// 表单相关方法
			addBtn() {
				if (!this.formSchema) {
					this.$message.warning('表单类型没有设定或已失效，请设定后重试！');
					return;
				}
				this.formDialog = {
					show: true,
					title: '新建人事调动申请',
					data: {
						form_type_code: this.formTypeCode,
						form_data: {}
					}
				}

				this.openForm("formDialog", this.formDialog)
			},

			// 在父组件的 updateBtn 方法中
			updateBtn({
				item
			}) {
				if (!this.formSchema) {
					this.$message.warning('表单配置加载中，请稍后重试');
					return;
				}

				console.log('编辑数据:', item);

				// 重新组织数据格式，确保字段在顶层
				const formData = {
					...item
				};

				// 将 form_data 中的字段提升到顶层
				if (item.form_data) {
					Object.keys(item.form_data).forEach(key => {
						formData[key] = item.form_data[key];
					});
				}

				console.log('重组后的数据:', formData);

				this.formDialog = {
					show: true,
					title: '编辑人事调动申请',
					data: formData
				};

				this.openForm("formDialog", this.formDialog)
			},

			// 表单保存
			async handleFormSave(formData) {
				this.saveFormLoading = true;
				try {
					let url = "admin/bpmn/application-form/sys/add";
					if (formData._id) {
						url = "admin/bpmn/application-form/sys/update";
					}

					const res = await this.vk.callFunction({
						url,
						data: formData
					});

					if (res.code === 0) {
						this.$message.success('保存成功');
						this.formDialog.show = false;
						this.refresh();
					} else {
						this.$message.error(res.msg || '保存失败');
					}
				} catch (error) {
					console.error('保存失败:', error);
					this.$message.error('保存失败');
				} finally {
					this.saveFormLoading = false;
				}
			},

			// 表单提交
			async handleFormSubmit(formData) {
				this.submitFormLoading = true;
				try {
					const userInfo = vk.getVuex('$user.userInfo');

					// 计算调动人数
					const employeeCount = formData.form_data.employee_list ? formData.form_data.employee_list.length :
						0;

					const calculatedValues = {
						employee_count: employeeCount,
						transfer_type: formData.form_data.
						transfer_type
					};

					const title =
						`${userInfo.username}的人事调动申请 - ${this.getFieldOptionLabel('transfer_type', formData.form_data.transfer_type)}`;

					const submitData = {
						...formData,
						calculated_values: calculatedValues,
						userInfo,
						title: title
					};

					if (formData._id) {
						submitData
							._id = formData._id;
						submitData
							.status = 'pending';
					}

					const res = await this.vk.callFunction({
						url: 'admin/bpmn/application-form/pub/submit',
						data: submitData
					});

					if (res.code === 0) {
						this.$message.success('提交成功');
						this.formDialog.show = false;
						this.refresh();
					} else {
						this.$message.error(res.msg || '提交失败');
					}
				} catch (error) {
					console
						.error('提交失败:', error);
					this.$message.error('提交失败');
				} finally {
					this.submitFormLoading = false;
				}
			},

			// 试算流程
			async handleSimulate(formData) {
				this.simulateFormLoading = true;
				try {
					const userInfo = vk.getVuex('$user.userInfo');

					// 计算调动人数
					const employeeCount = formData.form_data.employee_list ? formData.form_data.employee_list.length :
						0;

					const calculatedValues = {
						employee_count: employeeCount,
						transfer_type: formData.form_data.transfer_type
					};

					const simulateData = {
						form_type_code: this.formTypeCode,
						form_data: formData.form_data,
						calculated_values: calculatedValues,
						process_definition_key: 'TRANSFER_APPLY',
						userInfo
					};

					const res = await this.vk.callFunction({
						url: 'admin/bpmn/process-engine/pub/simulate',
						data: simulateData
					});

					if (res.code === 0) {
						this.showSimulateResult(res.data);
					} else {
						this.$message.error(res.msg || '试算失败');
					}
				} catch (error) {
					console.error('试算失败:', error);
					this.$message.error('试算失败');
				} finally {
					this.simulateFormLoading = false;
				}
			},
			// 显示试算结果
			showSimulateResult(result) {
				this.simulateDialog.data = result;
				this.simulateDialog.show = true;
			},

			// 确认提交申请
			submitAfterSimulate() {
				this.simulateDialog.show = false;
				this.handleFormSubmit(this.formDialog.data);
			},

			// 获取字段选项标签
			getFieldOptionLabel(fieldName, value) {
				if (!this.formSchema || !this.formSchema.fields) return value;
				const field = this.formSchema.fields.find(f => f.name === fieldName);
				if (!field || !field.options) return value;
				const option = field.options.find(opt => opt.value === value);
				return option ? option.label : value;
			},

			formatDate(timestamp, formatStr) {
				if (!timestamp) return '-';
				return vk.pubfn.timeFormat(timestamp, formatStr || 'yyyy-MM-dd hh:mm:ss');
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

			async showDetail(item) {
				this.detailDialog.data = item;
				await this.loadProcessFlow(item);
				await this.loadStatusHistory(item);
				this.detailDialog.show = true;
			},

			// 加载审批流程
			async loadProcessFlow(item) {
				try {
					const taskRes = await this.vk.callFunction({
						url: 'admin/bpmn/task/pub/getProcessFlow',
						data: {
							formData: {
								application_id: item._id
							},
							userInfo: vk.getVuex('$user.userInfo'),
							orderBy: 'sequence asc'
						}
					});

					if (taskRes.code === 0) {
						this.processInfo.tasks = taskRes.rows || [];
					}

					if (item.process_instance_id) {
						const instanceRes = await this.vk.callFunction({
							url: 'admin/bpmn/instance/sys/getList',
							data: {
								formData: {
									_id: item.process_instance_id
								}
							}
						});

						if (instanceRes.code === 0 && instanceRes.rows && instanceRes.rows.length > 0) {
							this.processInfo.instance = instanceRes.rows[0];
						}
					}
				} catch (error) {
					console.error('加载审批流程失败:', error);
				}
			},

			// 加载审批历史记录
			async loadStatusHistory(item) {
				try {
					this.statusHistory = [];

					this.statusHistory.push({
						action: 'create',
						operation_time: item._add_time,
						operator_name: item.applicant_name,
						comment: '创建人事调动申请',
						task_name: '申请创建'
					});

					const historyRes = await this.vk.callFunction({
						url: 'admin/bpmn/task-history/sys/getList',
						data: {
							formData: {
								application_id: item._id,
								action: "create"
							},
							orderBy: 'operation_time asc'
						}
					});

					if (historyRes.code === 0 && historyRes.rows) {
						historyRes.rows.forEach(history => {
							this.statusHistory.push({
								action: history.action,
								operation_time: history.operation_time,
								operator_name: history.operator_name,
								comment: history.comment,
								task_name: this.getTaskNameFromHistory(history)
							});
						});
					}

					this.statusHistory.sort((a, b) => a.operation_time - b.operation_time);

				} catch (error) {
					console.error('加载状态历史失败:', error);
					this.statusHistory = [{
						action: 'create',
						operation_time: item._add_time,
						operator_name: item.applicant_name,
						comment: '创建人事调动申请',
						task_name: '申请创建'
					}];
				}
			},

			// 从历史记录中获取任务名称
			getTaskNameFromHistory(history) {
				if (history.task_data && history.task_data.node_info) {
					return history.task_data.node_info.node_name;
				}
				if (history.task_snapshot) {
					return history.task_snapshot.task_name;
				}
				return '任务处理';
			},

			async deleteBtn({
				item
			}) {
				this.$confirm('确定删除该人事调动申请吗？', '提示', {
					type: 'warning'
				}).then(async () => {
					this.deleteLoading = true;
					try {
						const res = await this.vk.callFunction({
							url: 'admin/bpmn/application-form/sys/delete',
							data: {
								id: item._id
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
					} finally {
						this.deleteLoading = false;
					}
				}).catch(() => {
					this.deleteLoading = false;
				});
			},

			// 文件预览
			previewFile(file) {
				if (!file || !file.url) {
					this.$message.warning('文件地址无效');
					return;
				}

				this.filePreview.data = {
					url: file.url,
					name: file.name,
					type: this.getFileType(file)
				};
				this.filePreview.show = true;
			},

			// 下载文件
			downloadFile(file) {
				if (!file || !file.url) {
					this.$message.warning('文件地址无效');
					return;
				}

				const link = document.createElement('a');
				link.href = file.url;
				link.download = file.name || 'download';
				link.style.display = 'none';

				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				this.$message.success('开始下载文件');
			},

			// 获取文件类型
			getFileType(file) {
				if (!file) return 'unknown';

				const name = file.name || '';
				const type = file.type || '';

				if (type.includes('pdf') || name.toLowerCase().endsWith('.pdf')) {
					return 'pdf';
				} else if (type.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name)) {
					return 'image';
				} else if (type.includes('text') || /\.(txt|md)$/i.test(name)) {
					return 'text';
				} else {
					return 'other';
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body {
		padding: 20rpx;
	}

	.button-group {
		margin-bottom: 20rpx;
		padding: 20rpx;
		background: #fff;
		border-radius: 8rpx;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	}
</style>