<template>
	<view class="page-body">
		<!-- 页面内容开始 -->

		<!-- 表格搜索组件开始 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns" @search="search">
			<template v-slot:transfer_date>
				<vk-data-input-date-time v-model="queryForm1.formData.transfer_date" type="daterange" /></template>
		</vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view>
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-employee-add')" @click="addBtn">添加</el-button>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-employee-export')" @click="exportExcelAll"> 导出全部
				</el-button>
				<!-- 批量操作 -->
				<!-- <el-dropdown v-if="table1.multipleSelection" :split-button="false" trigger="click" @command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0">
						批量操作<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">批量操作1</el-dropdown-item>
						<el-dropdown-item :command="2">批量操作2</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown> -->
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="2500rpx" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="80px"
				@success="form1.props.show = false;refresh();" :footer-show="false"></vk-data-form>
			<template v-slot:footer>
				<el-button @click="form1.props.show = false">取 消</el-button>
				<el-button type="primary" @click="submit">确 定</el-button>
			</template>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 100;
	export default {
		data() {
			// 页面数据变量
			return {
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/employees/sys/transfer/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-employee-view')
							}
						},
						// {
						// 	mode: 'update',
						// 	title: '编辑',
						// 	show: (item) => {
						// 		return this.$hasRole('admin') || this.$hasPermission('hrm-employee-edit')
						// 	}
						// },
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-employee-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							"key": "transfer_date",
							"title": "调动日期",
							"type": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth
						},
						{
							"key": "employee_id",
							"title": "员工工号",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "employee_name",
							"title": "员工姓名",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "current_company_name",
							"title": "原公司",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "current_department_name",
							"title": "原部门",
							"type": "text",
							"width": colWidth + 100
						},
						{
							"key": "current_position_name",
							"title": "原职务",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "new_company_name",
							"title": "新公司",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "new_department_name",
							"title": "新部门",
							"type": "text",
							"width": colWidth + 100
						},
						{
							"key": "new_position_name",
							"title": "新职务",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"show": ["detail"],
							"type": "time",
							"width": colWidth
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

					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
							"key": "transfer_date",
							"title": "调动日期",
							"type": "datetimerange",
							"width": colWidth + 100,
							"mode": "[]"
						},
						{
							key: "employee_id",
							title: "调动人员",
							type: "table-select",
							placeholder: "选择调动人员",
							width: colWidth,
							action: "admin/hrm/employees/sys/getList",
							multiple: false,
							columns: [{
									key: "employee_id",
									title: "员工工号",
									type: "text",
									idKey: true
								}, // idKey:true 代表此字段为主键字段，若设置show:["none"],则可以在表格中隐藏该字段的显示
								{
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									nameKey: true
								},
							],
							queryColumns: [{
									key: "employee_id",
									title: "员工工号",
									type: "text",
									width: 150,
									mode: "%%"
								},
								{
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									width: 150,
									mode: "%%"
								}

							]
						},
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {

					},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								key: "transfer_date",
								title: "调动日期",
								type: "date",
								dateType: "date",
								width: colWidth + 100
							},
							{
								key: "employee_list",
								title: "调动人员",
								type: "array<object>",
								itemFormat: "${employee_name}(${employee_id})从${current_company_name}-${current_department_name}-${current_position_name} --> ${new_company_name}-${new_department_name}-${new_position_name}",
								required: true,
								itemWidth: 140,
								columnIndexWidth: 50,
								showAdd: true,
								showClear: true,
								showSort: false,
								rightBtns: [
									"copy",
									"delete"
								],
								columns: [{
										key: "employee_id",
										title: "人员",
										type: "table-select",
										required: true,
										isUnique: true,
										action: "admin/hrm/employees/sys/getList",
										multiple: false,
										columns: [{
												key: "employee_id",
												title: "员工工号",
												type: "text",
												idKey: true
											},
											{
												key: "employee_name",
												title: "员工姓名",
												type: "text",
												nameKey: true
											}
										],
										queryColumns: [{
												key: "employee_id",
												title: "员工工号",
												type: "text",
												width: 150,
												mode: "%%"
											},
											{
												key: "employee_name",
												title: "员工姓名",
												type: "text",
												width: 150,
												mode: "%%"
											},
											{
												key: "status",
												title: "状态",
												type: "number",
												mode: "=",
												show: ["none"]
											}
										],
										formData: () => {
											return {
												status: 1
											}
										},
										placeholder: "选择人员",
										watch: this.watchEmployeeChange,
										rules: [{
											required: true,
											message: "必填项",
											trigger: [
												"change",
												"blur"
											]
										}]
									},
									{
										key: "current_company_name",
										title: "原公司",
										type: "text",
										required: true,
										disabled: true,
										placeholder: "自动带入"
									},
									{
										key: "current_department_name",
										title: "原部门",
										type: "text",
										required: true,
										disabled: true,
										placeholder: "自动带入"
									},
									{
										key: "current_position_name",
										title: "原职务",
										type: "text",
										required: true,
										disabled: true,
										placeholder: "自动带入"
									},

									{
										key: "new_company_name",
										title: "新公司",
										type: "tree-select",
										placeholder: "请选择",
										action: "admin/hrm/company/sys/getList",
										props: {
											list: "rows",
											value: "company_name",
											label: "company_name",
											children: "children"
										},
										rules: [{
											"required": true,
											"message": "必填项",
											"trigger": [
												"change",
												"blur"
											]
										}],
										watch: ({
											value,
											formData,
											column,
											index,
											option,
											$set
										}) => {
											if (option && option.company_id) {
												formData.new_company_id = option.company_id;
												this.form1.props.columns[1].columns[5].actionData.company_id =
													option.company_id;
											}

										}
									},
									{
										key: "new_department_name",
										title: "新部门",
										type: "tree-select",
										placeholder: "请选择",
										action: "admin/hrm/department/pub/getList",
										props: {
											list: "rows",
											value: "department_id",
											label: "department_name",
											children: "children"
										},
										actionData: {
											company_id: "", // 关联select1选择的值
										},
										rules: [{
											"required": true,
											"message": "必填项",
											"trigger": [
												"change",
												"blur"
											]
										}],
										watch: this.watchNewdepartmentChange
									},

									{
										key: "new_position_name",
										title: "新职务",
										type: "remote-select",
										required: true,
										action: "admin/hrm/position/sys/getList",
										placeholder: "请选择",
										props: {
											"list": "rows",
											"value": "position_id",
											"label": "position_name"
										},
										showAll: true,
										actionData: {
											"pageSize": 1000
										},
										watch: this.watchNewPositionChange,
										rules: [{
											"required": true,
											"message": "必填项",
											"trigger": [
												"change",
												"blur"
											]
										}]
									}
								]
							}
						],
						// 表单验证规则
						rules: {
							employee_list: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							transfer_date: [{
								required: true,
								message: "该项不能为空",
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
				},
				// 其他弹窗表单
				formDatas: {},
				// 表单相关结束 -----------------------------------------------------------
			};
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options = {}) {			
			this.options = options;
			this.init(options);
		},
		// 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
		onReady() {

		},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {

		},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {

		},
		// 函数
		methods: {
			submit() {
				this.$refs.form1.validate((valid) => {
					if (valid) {
						// 验证通过				    
						this.form1.data.employee_list.forEach(async (e) => {
							e.transfer_date = this.form1.data.transfer_date;
							let data = await vk.callFunction({
								url: 'admin/hrm/employees/sys/transfer/add',
								title: '请求中...',
								data: e
							})
							if (data.code !== 0) {
								return vk.alert("新增不成功")
							} else {
								//更新调动人员资料
								let res = await vk.callFunction({
									url: 'admin/hrm/employees/sys/transfer/updateEmployess',
									title: '请求中...',
									data: e
								});
								if (res.code !== 0) {
									return vk.alert("新增不成功")
								}
							}
						})
						vk.alert("新增成功", "提示", "确定", () => {
							// 点击确定按钮后的回调
							this.form1.props.show = false;
							this.refresh()
						})
					}
				})
			},
			// 导出xls表格文件（全部数据）
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '调动人员信息',
					title: "正在导出数据...",
					columns: [{
							"key": "transfer_date",
							"title": "调动日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						}, {
							"key": "employee_id",
							"title": "员工工号",
							"type": "text"
						},
						{
							"key": "employee_name",
							"title": "员工姓名",
							"type": "text"
						},
						{
							"key": "current_company_name",
							"title": "原公司",
							"type": "text"
						},
						{
							"key": "current_department_name",
							"title": "原部门",
							"type": "text"
						},
						{
							"key": "current_position_name",
							"title": "原职务",
							"type": "text"
						}, {
							"key": "new_company_name",
							"title": "新公司",
							"type": "text"
						},
						{
							"key": "new_department_name",
							"title": "新部门",
							"type": "text"
						},
						{
							"key": "new_position_name",
							"title": "新职务",
							"type": "text"
						}
					],
					pageIndex: 1,
					pageSize: -1, // 此值为-1，代表导出所有数据
				});

			},
			// 新部门选择变化处理
			watchNewdepartmentChange({
				value,
				formData,
				column,
				index,
				option
			}) {
				console
					.log('新部门选择变化:', value, option);

				if (option) {
					formData
						.new_department_id = value;
					formData
						.new_department_name = option.department_name || option.label || '';
				} else {
					formData
						.new_department_id = '';
					formData
						.new_department_name = '';
				}
			},
			// 新职务选择变化处理
			watchNewPositionChange({
				value,
				formData,
				column,
				index,
				option
			}) {
				console
					.log('新职务选择变化:', value, option);

				if (option) {
					formData
						.new_position_id = value;
					formData
						.new_position_name = option.position_name || option.label || '';
				} else {
					formData
						.new_position_id = '';
					formData
						.new_position_name = '';
				}
			},
			// 人员选择变化监听 - 自动填充现公司、部门、职务
			watchEmployeeChange({
				value,
				formData,
				column,
				index,
				option
			}) {
				console
					.log('人员选择变化:', value, formData, column, index, option);

				if (option) {
					// 填充员工姓名
					formData
						.employee_name = option.employee_name || '';

					// 填充现公司信息
					const companyInfo = option.companys;
					if (companyInfo) {
						this.$set(formData, "current_company_id", companyInfo.company_id || '')
						this.$set(formData, "current_company_name", companyInfo.company_name || '')
					}

					// 填充现部门信息
					const departmentInfo = option.departments;
					if (departmentInfo) {
						this.$set(formData, "current_department_id", departmentInfo.department_id || '')
						this.$set(formData, "current_department_name", departmentInfo.department_name || '')
					}

					// 填充现职务信息
					const positionInfo = option.positions;
					if (positionInfo) {
						this.$set(formData, "current_position_id", positionInfo.position_id || '')
						this.$set(formData, "current_position_name", positionInfo.position_name || '')
						this.$set(formData, "new_position_id", positionInfo.position_id || '')
						this.$set(formData, "new_position_name", positionInfo.position_name || '')
					}
				} else {
					// 如果选项信息不完整，清空相关字段
					this.$set(formData, "employee_name", '')
					this.$set(formData, "current_company_id", '')
					this.$set(formData, "current_company_name", '')
					this.$set(formData, "current_department_id", '')
					this.$set(formData, "current_department_name", '')
					this.$set(formData, "current_position_id", '')
					this.$set(formData, "current_position_name", '')
					this.$set(formData, "new_position_id", '')
					this.$set(formData, "new_position_name", '')
				}
			},
			// 页面数据初始化函数
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
			// 页面跳转
			pageTo(path) {
				vk.navigateTo(path);
			},
			// 表单重置
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
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
				this.form1.props.action = 'admin/hrm/employees/sys/transfer/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/employees/sys/transfer/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			// 删除按钮
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/employees/sys/transfer/delete",
					data: {
						_id: item._id
					},
				});
			},
			// 监听 - 批量操作的按钮点击事件
			batchBtn(index) {
				switch (index) {
					case 1:
						vk.toast("批量操作按钮1");
						break;
					case 2:
						vk.toast("批量操作按钮2");
						break;
					default:
						break;
				}
			}
		},
		// 监听属性
		watch: {

		},
		// 计算属性
		computed: {

		}
	};
</script>
<style lang="scss" scoped>
	.page-body {}
</style>