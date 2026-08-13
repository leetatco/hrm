<template>
	<view class="page-body">
		<!-- 页面内容开始 -->

		<!-- 表格搜索组件开始 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search"></vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view>
			<el-row>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-employee-export')" @click="exportExcelAll"> 导出全部
				</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="900px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="130px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	import {
		read,
		utils
	} from "xlsx";
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 200;
	export default {
		data() {
			// 页面数据变量
			return {
				fileList: [],
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/employees/sys/getList",
					//按钮显示
					rightBtns: [{
						mode: 'detail_auto',
						title: '详细',
						show: (item) => {
							return this.$hasRole('admin') || this.$hasRole('hr-read')
						}
					}],
					// 表格字段显示规则
					columns: [{
							"key": "employee_id",
							"title": "员工工号",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "center_id",
							"title": "中心代码",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "centers.center_name",
							"title": "六大中心",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "points.point_name",
							"title": "分点名称",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "employee_name",
							"title": "员工姓名",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "bank_card",
							"title": "银行卡号",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "banks.bank_name",
							"title": "银行名称",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "locations.location_name",
							"title": "开户地",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "gender",
							"title": "性别",
							"type": "number",
							"width": colWidth - 150,
							formatter: function(val, row, column, index) {
								return row.gender == 1 ? '男' : '女';
							}
						},
						{
							"key": "nations.name",
							"title": "民族",
							"type": "text",
							"width": colWidth - 150
						},
						{
							"key": "departments.department_name",
							"title": "所属部门",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "companys.company_name",
							"title": "所属公司",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "positions.position_name",
							"title": "职位名称",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "hire_date",
							"title": "入职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth - 100
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth - 100
						},
						{
							"key": "mobile",
							"title": "手机号码",
							"type": "text",
							"width": colWidth - 50
						},
						{
							"key": "educationals.educational_name",
							"title": "学历",
							"type": "text",
							"width": colWidth - 150
						},
						{
							"key": "insurances.insurance_name",
							"title": "保险",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "stay",
							"title": "住宿",
							"type": "number",
							"width": colWidth - 150,
							formatter: function(val, row, column, index) {
								return row.gender == 1 ? '是' : '否';
							}
						},
						{
							"key": "contracts.contract_name",
							"title": "合同是否签定",
							"type": "text",
							"width": colWidth - 50
						},
						{
							"key": "contract_date",
							"title": "合同到期日",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth - 100
						},
						{
							"key": "contract_desc",
							"title": "合同签订情况",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "registration",
							"title": "档案是否登记	",
							"type": "number",
							"width": colWidth - 50,
							formatter: function(val, row, column, index) {
								return row.gender == 1 ? '是' : '否';
							}
						},
						{
							"key": "birth_month",
							"title": "月份",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "birth_date",
							"title": "出生日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth - 100
						},
						{
							"key": "expiration_date",
							"title": "身份证有效期限",
							"type": "text",
							"width": colWidth - 50
						},
						{
							"key": "age",
							"title": "年龄",
							"type": "number",
							"width": colWidth - 150
						},
						{
							"key": "card_location",
							"title": "户口所在地",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "emergency_contact",
							"title": "紧急联系人",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "emergency_mobile",
							"title": "紧急联系人电话",
							"type": "text",
							"width": colWidth - 50
						},
						{
							"key": "internals.employee_name",
							"title": "内部介绍人",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "marital_status",
							"title": "婚姻情况",
							"type": "number",
							"width": colWidth - 100,
							formatter: (val, row, column, index) => {
								return val == 1 ? '已婚' : '未婚';
							}
						},
						{
							"key": "no_crime",
							"title": "无犯罪证明",
							"type": "number",
							"width": colWidth - 100,
							formatter: (val, row, column, index) => {
								return val == 1 ? '有' : '无';
							}
						},
						{
							"key": "resigntypes.type_name",
							"title": "离职类型",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "rest_type",
							"title": "休息类型",
							"type": "number",
							formatter: (val, row, column, index) => {
								if (val == 1) return '单休';
								if (val == 2) return '双休';
								if (val == 3) return '大小周';
							}
						},
						{
							"key": "status",
							"title": "用户状态",
							"type": "number",
							"width": colWidth - 100,
							formatter: (val, row, column, index) => {
								return val == 1 ? '在职' : '离职';
							}
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text",
							"show": ["detail"],
							"width": colWidth
						},
						{
							"key": "avatar",
							"title": "头像",
							"type": "avatar",
							"width": colWidth
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

					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
							"key": "gender",
							"title": "性别",
							"type": "select",
							"width": colWidth,
							"data": [{
								"value": 1,
								"label": "男"
							}, {
								"value": 2,
								"label": "女"
							}],
							"mode": "="
						},
						{
							"key": "status",
							"title": "用户状态",
							"type": "select",
							"width": colWidth,
							"data": [{
								"value": 1,
								"label": "在职"
							}, {
								"value": 2,
								"label": "离职"
							}],
							"mode": "="
						},
						{
							"key": "rest_type",
							"title": "休息类别",
							"type": "select",
							"width": colWidth,
							"data": [{
								"value": 1,
								"label": "单休"
							}, {
								"value": 2,
								"label": "双休"
							}, {
								"value": 3,
								"label": "大小周"
							}],
							"mode": "="
						},	
						{"key":"company_id","title":"所属部门","type":"text","width":200,"mode":"=","hidden":true},					
						{
							key: "department_id",
							title: "选择公司或部门",
							type: "cascader",
							placeholder: "请选择部门",
							action: "admin/hrm/department/sys/getList",
							props: {
								list: "rows",
								value: "department_id",
								label: "department_name",
								checkStrictly: true,
								emitPath: false
							},
							showAll: true,
							"mode":"="
						},
						//{"key":"card","title":"身份证号码","type":"text","width":200,"mode":"="},
						//{"key":"birth_date","title":"出生日期","type":"datetimerange","width":200,"mode":"="},
						//{"key":"mobile","title":"手机号码","type":"text","width":200,"mode":"="},
						//{"key":"avatar","title":"头像地址","type":"text","width":200,"mode":"="},
						//{"key":"avatar_file","title":"头像文件","type":"image","width":200,"mode":"="},
						//{"key":"hire_date","title":"入职日期","type":"datetimerange","width":200,"mode":"="},
						//{"key":"resign_date","title":"离职日期","type":"datetimerange","width":200,"mode":"="},
						//{"key":"position_id","title":"职位名称","type":"text","width":200,"mode":"="},
						
						//{"key":"update_date","title":"更新时间","type":"datetimerange","width":200,"mode":"="},
						//{"key":"update_id","title":"更新人","type":"text","width":200,"mode":"="}
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						"employee_type": 1,
						"hire_date": new Date(),
						"status": 1
					},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
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
								key: "center_id",
								title: "六大中心",
								type: "remote-select",
								placeholder: "请选择中心名称",
								width: colWidth,
								action: "admin/hrm/center/sys/getList",
								props: {
									list: "rows",
									value: "center_id",
									label: "center_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "point_id",
								title: "分点名称",
								type: "remote-select",
								placeholder: "请选择分点名称",
								width: colWidth,
								action: "admin/hrm/point/sys/getList",
								props: {
									list: "rows",
									value: "point_id",
									label: "point_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								"key": "card",
								"title": "身份证号码",
								"type": "text",
								"width": colWidth,
								watch: (res) => {
									let les = vk.myfn.test1(res.value)
									if (les.code == 0) {
										this.$set(this.form1.data, "gender", les.data.sex);
										this.$set(this.form1.data, "age", les.data.age);
										this.$set(this.form1.data, "birth_month", les.data.month);
										this.$set(this.form1.data, "birth_date", les.data.birthday);
									}
								}
							},
							{
								"key": "bank_card",
								"title": "银行卡号",
								"type": "text",
								"width": colWidth
							},
							{
								key: "bank_id",
								title: "银行名称",
								type: "remote-select",
								placeholder: "请选择银行名称",
								width: colWidth,
								disabled: true,
								action: "admin/hrm/bank/sys/getList",
								props: {
									list: "rows",
									value: "bank_id",
									label: "bank_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "location_id",
								title: "开户地",
								type: "remote-select",
								placeholder: "请选择开户地",
								width: colWidth,
								action: "admin/hrm/banklocation/sys/getList",
								props: {
									list: "rows",
									value: "location_id",
									label: "location_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								"key": "birth_month",
								"title": "月份",
								"type": "number",
								"disabled": true,
								"width": colWidth
							},
							{
								"key": "birth_date",
								"title": "出生日期",
								"type": "date",
								"disabled": true,
								"dateType": "date",
								"valueFormat": "yyyy-MM-dd",
								"width": colWidth
							},
							{
								"key": "age",
								"title": "年龄",
								"type": "number",
								"disabled": true,
								"width": colWidth
							},
							{
								"key": "gender",
								"title": "员工性别",
								"type": "radio",
								"disabled": true,
								"width": colWidth,
								"data": [{
									"value": 1,
									"label": "男"
								}, {
									"value": 2,
									"label": "女"
								}]
							},
							{
								key: "nation_id",
								title: "民族",
								type: "remote-select",
								placeholder: "请选择民族",
								width: colWidth,
								action: "admin/hrm/nation/sys/getList",
								props: {
									list: "rows",
									value: "_id",
									label: "name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "position_id",
								title: "职位名称",
								type: "remote-select",
								placeholder: "请选择职位名称",
								action: "admin/hrm/position/sys/getList",
								width: colWidth,
								props: {
									list: "rows",
									value: "position_id",
									label: "position_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "company_id",
								title: "所属公司",
								type: "tree-select",
								width: colWidth,
								action: "admin/hrm/company/sys/getList",
								props: {
									list: "rows",
									value: "company_id",
									label: "company_name",
									children: "children"
								},
								watch: ({
									value,
									formData,
									column,
									index,
									option,
									$set
								}) => {
									// 此处根据选择的值动态改变department_id的actionData的值
									let item = vk.pubfn.getListItem(this.form1.props.columns, "key",
										"department_id");
									item.actionData.company_id = value;
								}
							},
							{
								key: "department_id",
								title: "所属部门",
								type: "tree-select",
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
								width: colWidth
							},
							{
								"key": "hire_date",
								"title": "入职日期",
								"type": "date",
								"dateType": "date",
								"valueFormat": "yyyy-MM-dd",
								"width": colWidth
							},
							{
								"key": "resign_date",
								"title": "离职日期",
								"type": "date",
								"dateType": "date",
								"valueFormat": "yyyy-MM-dd",
								"width": colWidth
							},
							{
								"key": "mobile",
								"title": "手机号码",
								"type": "text",
								"width": colWidth
							},
							{
								key: "educational_id",
								title: "学历",
								type: "remote-select",
								placeholder: "请选择学历",
								width: colWidth,
								action: "admin/hrm/educational/sys/getList",
								props: {
									list: "rows",
									value: "educational_id",
									label: "educational_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "insurance_id",
								title: "保险",
								type: "remote-select",
								placeholder: "请选择保险",
								width: colWidth,
								action: "admin/hrm/insurance/sys/getList",
								props: {
									list: "rows",
									value: "insurance_id",
									label: "insurance_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								"key": "stay",
								"title": "住宿",
								"type": "radio",
								"width": colWidth,
								"data": [{
									"value": 1,
									"label": "是"
								}, {
									"value": 2,
									"label": "否"
								}]
							},
							{
								key: "contract_id",
								title: "合同是否签定",
								type: "remote-select",
								placeholder: "请选择合同是否签定",
								action: "admin/hrm/contract/sys/getList",
								width: colWidth,
								props: {
									list: "rows",
									value: "contract_id",
									label: "contract_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								"key": "contract_date",
								"title": "合同到期日",
								"type": "date",
								"dateType": "date",
								"valueFormat": "yyyy-MM-dd",
								"width": colWidth
							},
							{
								"key": "contract_desc",
								"title": "合同签订情况",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "registration",
								"title": "档案是否登记",
								"type": "radio",
								"width": colWidth,
								"data": [{
									"value": 1,
									"label": "是"
								}, {
									"value": 2,
									"label": "否"
								}]
							},
							{
								"key": "expiration_date",
								"title": "身份证有效期限",
								"type": "text",
								"width": colWidth
							},
							{
								key: "card_location",
								title: "户口所在地",
								type: "textarea",
								maxlength: "99",
								showWordLimit: true,
								width: colWidth,
								autosize: {
									minRows: 2,
									maxRows: 10
								}
							},

							{
								"key": "emergency_contact",
								"title": "紧急联系人",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "emergency_mobile",
								"title": "紧急联系人电话",
								"type": "text",
								"width": colWidth
							},
							{
								key: "internal_id",
								title: "",
								type: "table-select",
								placeholder: "选择内部介绍人",
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
							{
								"key": "marital_status",
								"title": "婚姻状况",
								"type": "radio",
								"width": colWidth,
								"data": [{
									"value": 1,
									"label": "已婚"
								}, {
									"value": 2,
									"label": "未婚"
								}]
							},
							{
								"key": "no_crime",
								"title": "无犯罪证明",
								"type": "radio",
								"width": colWidth,
								"data": [{
									"value": 1,
									"label": "有"
								}, {
									"value": 2,
									"label": "无"
								}]
							},
							{
								"key": "status",
								"title": "用户状态",
								"type": "radio",
								"width": colWidth,
								"defaultValue": 1,
								"data": [{
									"value": 1,
									"label": "在职"
								}, {
									"value": 2,
									"label": "离职"
								}]
							},
							{
								"key": "rest_type",
								"title": "休息类型",
								"type": "select",
								"width": colWidth,
								"defaultValue": 1,
								"data": [{
									"value": 1,
									"label": "单休"
								}, {
									"value": 2,
									"label": "双休"
								}, {
									"value": 3,
									"label": "大小周"
								}]
							},
							{
								key: "type_id",
								title: "离职类型",
								type: "remote-select",
								width: colWidth,
								placeholder: "请选择离职类型",
								action: "admin/hrm/resigntype/sys/getList",
								props: {
									list: "rows",
									value: "type_id",
									label: "type_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								"key": "avatar",
								"title": "头像地址",
								"type": "avatar",
								"width": colWidth
							},
							{
								key: "comment",
								title: "备注",
								type: "textarea",
								maxlength: "99",
								showWordLimit: true,
								width: colWidth,
								autosize: {
									minRows: 4,
									maxRows: 10
								}
							}
						],
						// 表单验证规则
						rules: {
							center_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							point_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							bank_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							bank_card: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change'],

							}, {
								validator: async (rule, value, callback) => {
									let res = await vk.request({
										method: 'get',
										url: "https://ccdcapi.alipay.com/validateAndCacheCardInfo.json",
										data: {
											cardNo: value,
											cardBinCheck: true
										},
										contentType: 'json', // 指定以application/json发送data内的数据
										dataType: 'json' // 指定返回值为text格式
									})
									if (vk.pubfn.isNull(res.bank)) {
										callback(new Error('银行卡号不正确'));
									} else {
										this.$set(this.form1.data, "bank_id", res.bank);
										callback();
									}
								},
								trigger: 'blur'
							}],
							location_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							nation_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							educational_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							insurance_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							stay: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							contract_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							contract_date: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							contract_desc: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							registration: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							expiration_date: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							card_location: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							marital_status: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							no_crime: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							employee_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							employee_name: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							mobile: [{
									required: true,
									message: "该项不能为空",
									trigger: ['blur', 'change']
								}, // 必须是手机号格式
								{
									validator: vk.pubfn.validator("mobile"),
									message: '手机号格式错误',
									trigger: 'blur'
								}
							],
							emergency_mobile: [{
								validator: vk.pubfn.validator("mobile"),
								message: '手机号格式错误',
								trigger: 'blur'
							}],
							card: [{
									required: true,
									message: "该项不能为空",
									trigger: ['blur', 'change']
								},
								// 身份证
								{
									validator: vk.pubfn.validator("card"),
									message: '身份证格式错误',
									trigger: ['blur']
								}
							],
							birth_date: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							birth_month: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							age: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							gender: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							department_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							company_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							hire_date: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							position_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							type_id: [{
								validator: (rule, value, callback) => {
									if (this.form1.data.status == 2) {
										if (!value) {
											return callback(new Error('离职类型不能为空！'));
										}
										callback();
									} else {
										this.$set(this.form1.data, "resign_date", "");
										this.$set(this.form1.data, "type_id", "");
										callback();
									}
								},
								trigger: ['blur', 'change']
							}],
							resign_date: [{
								validator: (rule, value, callback) => {
									if (this.form1.data.status == 2) {
										if (!value) {
											return callback(new Error('离职日期不能为空！'));
										}
										if (value < this.form1.data.hire_date) {
											return callback(new Error('离职日期不能小于入职日期！'));
										}
										callback();
									} else {
										this.$set(this.form1.data, "resign_date", "");
										this.$set(this.form1.data, "type_id", "");
										callback();
									}
								},
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
				if (this.$refs.table1.queryParam.formData) {
					for (let key in this.$refs.table1.queryParam.formData) {
						if (key == 'department_id') {
							this.$refs.table1.queryParam.formData.company_id = "";
							let strDept = this.$refs.table1.queryParam.formData[key];
							if (strDept && strDept.indexOf("company") >= 0) {
								strDept = strDept.split('_')[1]
								this.$refs.table1.queryParam.formData.company_id = strDept;
								this.$refs.table1.queryParam.formData[key]="";
							}
						}
					}
				};
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
				this.form1.props.action = 'admin/hrm/employees/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				let departmentItem = vk.pubfn.getListItem(this.form1.props.columns, "key", "department_id");
				departmentItem.actionData.company_id = item.company_id;
				this.form1.props.action = 'admin/hrm/employees/sys/update';
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
					action: "admin/hrm/employees/sys/delete",
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
			},

			//导入xls表格文件 			
			handleChange(file) {
				//定义字段即将导入的excel表中的数据显示在el-table中，这些字段是显示的部分（同时需要将导入的数据传给后端）
				let typeObj = {
					employee_id: {
						"title": "员工工号",
						"type": "text"
					},
					employee_name: {
						"title": "员工姓名",
						"type": "text"
					},
					center_id: {
						"title": "中心代码",
						"type": "text"
					},
					point_id: {
						"title": "分点代码",
						"type": "text"
					},
					card: {
						"title": "身份证号码",
						"type": "text"
					},
					bank_card: {
						"title": "银行卡号",
						"type": "text"
					},
					bank_id: {
						"title": "银行代码",
						"type": "text"
					},
					location_id: {
						"title": "开户地代码",
						"type": "text"
					},
					gender: {
						"title": "性别 1：男 2：女",
						"type": "number"
					},
					nation_id: {
						"title": "民族代码",
						"type": "text"
					},
					department_id: {
						"title": "所属部门代码",
						"type": "text"
					},
					company_id: {
						"title": "所属公司代码",
						"type": "text"
					},
					position_id: {
						"title": "职位代码",
						"type": "text"
					},
					hire_date: {
						"title": "入职日期",
						"type": "date"
					},
					resign_date: {
						"title": "离职日期",
						"type": "date"
					},
					mobile: {
						"title": "手机号码",
						"type": "text"
					},
					educational_id: {
						"title": "学历代码",
						"type": "text"
					},
					insurance_id: {
						"title": "保险代码",
						"type": "text"
					},
					stay: {
						"title": "住宿 1：是 2：否",
						"type": "number"
					},
					contract_id: {
						"title": "合同是否签定代码",
						"type": "text"
					},
					contract_date: {
						"title": "合同到期日",
						"type": "date"
					},
					contract_desc: {
						"title": "合同签订情况",
						"type": "text"
					},
					registration: {
						"title": "档案是否登记 1：是 2：否",
						"type": "number"
					},
					birth_month: {
						"title": "月份",
						"type": "number"
					},
					birth_date: {
						"title": "出生日期",
						"type": "date"
					},
					expiration_date: {
						"title": "身份证有效期限",
						"type": "text"
					},
					age: {
						"title": "年龄",
						"type": "number"
					},
					card_location: {
						"title": "户口所在地",
						"type": "text"
					},
					emergency_contact: {
						"title": "紧急联系人",
						"type": "text"
					},
					emergency_mobile: {
						"title": "紧急联系人电话",
						"type": "text"
					},
					internal_id: {
						"title": "内部介绍人工号",
						"type": "text"
					},
					marital_status: {
						"title": "婚姻情况 1：已婚 2：未婚",
						"type": "number"
					},
					no_crime: {
						"title": "无犯罪证明 1：有 2：无",
						"type": "number"
					},
					comment: {
						"title": "备注",
						"type": "text"
					},
					type_id: {
						"title": "离职类型代码",
						"type": "text"
					},
					rest_type: {
						"title": "休息类型 1：单休 2：双休 3：大小周",
						"type": "number"
					},
					status: {
						"title": "用户状态 1：在职 2：离职",
						"type": "number"
					}
				};
				let count = 0;
				let errorRow = "";
				try {
					this.$iexcel.importExcel(file.raw, typeObj, async (res) => {
						for (const item of res) {
							if (vk.pubfn.isNull(item.employee_id)) {
								vk.alert('id或工号不能为空');
								break;
							}
							let delRes = await vk.callFunction({
								url: 'admin/hrm/employees/sys/delete',
								title: '请求中...',
								data: {
									employee_id: item.employee_id
								},
							})
							if (delRes.code == 0) {
								let addRes = await vk.callFunction({
									url: 'admin/hrm/employees/sys/add',
									title: '请求中...',
									data: item,
								});
								if (addRes.code == 0) {
									count++;
								} else {
									count = 0;
									errorRow = JSON.stringify(item);
									break;
								}
							}
						}
						this.fileList = [];
						if (count == 0) {
							vk.alert(`错误数据:${errorRow}`, "导入Excel失败", "确定", () => {});
						} else {
							vk.alert(`导入数据:${count}条`, "导入Excel成功", "确定",
								() => {
									this.refresh()
								});
						}
					});
				} catch (error) {
					console.log(error);
				} finally {
					// this.refresh();	
				}
			},
			// 导入xls表格文件模版
			exportExcelModel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '员工列表模版',
					title: "正在导出数据...",
					columns: [{
							"key": "employee_id",
							"title": "员工工号",
							"type": "text"
						},
						{
							"key": "center_id",
							"title": "中心代码",
							"type": "text"
						},
						{
							"key": "point_id",
							"title": "分点代码",
							"type": "text"
						},
						{
							"key": "employee_name",
							"title": "员工姓名",
							"type": "text"
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "bank_card",
							"title": "银行卡号",
							"type": "text"
						},
						{
							"key": "bank_id",
							"title": "银行代码",
							"type": "text"
						},
						{
							"key": "location_id",
							"title": "开户地代码",
							"type": "text"
						},
						{
							"key": "gender",
							"title": "性别 1：男 2：女",
							"type": "number"
						},
						{
							"key": "nation_id",
							"title": "民族代码",
							"type": "text"
						},
						{
							"key": "department_id",
							"title": "所属部门代码",
							"type": "text"
						},
						{
							"key": "company_id",
							"title": "所属公司代码",
							"type": "text"
						},
						{
							"key": "position_id",
							"title": "职位代码",
							"type": "text"
						},
						{
							"key": "hire_date",
							"title": "入职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "mobile",
							"title": "手机号码",
							"type": "text"
						},
						{
							"key": "educational_id",
							"title": "学历代码",
							"type": "text"
						},
						{
							"key": "insurance_id",
							"title": "保险代码",
							"type": "text"
						},
						{
							"key": "stay",
							"title": "住宿 1：是 2：否",
							"type": "number"
						},
						{
							"key": "contract_id",
							"title": "合同是否签定代码",
							"type": "text"
						},
						{
							"key": "contract_date",
							"title": "合同到期日",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "contract_desc",
							"title": "合同签订情况",
							"type": "text"
						},
						{
							"key": "registration",
							"title": "档案是否登记 1：是 2：否",
							"type": "number"
						},
						{
							"key": "birth_month",
							"title": "月份",
							"type": "number"
						},
						{
							"key": "birth_date",
							"title": "出生日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "expiration_date",
							"title": "身份证有效期限",
							"type": "text"
						},
						{
							"key": "age",
							"title": "年龄",
							"type": "number"
						},
						{
							"key": "card_location",
							"title": "户口所在地",
							"type": "text"
						},
						{
							"key": "emergency_contact",
							"title": "紧急联系人",
							"type": "text"
						},
						{
							"key": "emergency_mobile",
							"title": "紧急联系人电话",
							"type": "text"
						},
						{
							"key": "internal_id",
							"title": "内部介绍人工号",
							"type": "text"
						},
						{
							"key": "marital_status",
							"title": "婚姻情况 1：已婚 2：未婚",
							"type": "number"
						},
						{
							"key": "no_crime",
							"title": "无犯罪证明 1：有 2：无",
							"type": "number"
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text"
						},
						{
							"key": "type_id",
							"title": "离职类型代码",
							"type": "text"
						},
						{
							"key": "rest_type",
							"title": "休息类型 1：单休 2：双休 3：大小周",
							"type": "number"
						},
						{
							"key": "status",
							"title": "用户状态 1：在职 2：离职",
							"type": "number"
						}
					],
					pageIndex: 1,
					pageSize: 1, // 此值为-1，代表导出所有数据
				});
			},

			// 导出xls表格文件（全部数据）
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '人员信息',
					title: "正在导出数据...",
					columns: [{
							"key": "employee_id",
							"title": "员工工号",
							"type": "text"
						},
						{
							"key": "center_id",
							"title": "中心代码",
							"type": "text"
						},
						{
							"key": "centers.center_name",
							"title": "六大中心",
							"type": "text"
						},
						{
							"key": "points.point_name",
							"title": "分点名称",
							"type": "text"
						},
						{
							"key": "employee_name",
							"title": "员工姓名",
							"type": "text"
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "bank_card",
							"title": "银行卡号",
							"type": "text"
						},
						{
							"key": "banks.bank_name",
							"title": "银行名称",
							"type": "text"
						},
						{
							"key": "locations.location_name",
							"title": "开户地",
							"type": "text"
						},
						{
							"key": "gender",
							"title": "性别",
							"type": "number",
							formatter: function(val, row, column, index) {
								return row.gender == 1 ? '男' : '女';
							}
						},
						{
							"key": "nations.name",
							"title": "民族",
							"type": "text"
						},
						{
							"key": "departments.department_name",
							"title": "所属部门",
							"type": "text"
						},
						{
							"key": "companys.company_name",
							"title": "所属公司",
							"type": "text"
						},
						{
							"key": "positions.position_name",
							"title": "职位名称",
							"type": "text"
						},
						{
							"key": "hire_date",
							"title": "入职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "mobile",
							"title": "手机号码",
							"type": "text"
						},
						{
							"key": "educationals.educational_name",
							"title": "学历",
							"type": "text"
						},
						{
							"key": "insurances.insurance_name",
							"title": "保险",
							"type": "text"
						},
						{
							"key": "stay",
							"title": "住宿",
							"type": "number",
							formatter: function(val, row, column, index) {
								return row.stay == 1 ? '是' : '否';
							}
						},
						{
							"key": "contracts.contract_name",
							"title": "合同是否签定",
							"type": "text"
						},
						{
							"key": "contract_date",
							"title": "合同到期日",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "contract_desc",
							"title": "合同签订情况",
							"type": "text"
						},
						{
							"key": "registration",
							"title": "档案是否登记	",
							"type": "number",
							formatter: function(val, row, column, index) {
								return row.registration == 1 ? '是' : '否';
							}
						},
						{
							"key": "birth_month",
							"title": "月份",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "birth_date",
							"title": "出生日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "expiration_date",
							"title": "身份证有效期限",
							"type": "text"
						},
						{
							"key": "age",
							"title": "年龄",
							"type": "number"
						},
						{
							"key": "card_location",
							"title": "户口所在地",
							"type": "text"
						},
						{
							"key": "emergency_contact",
							"title": "紧急联系人",
							"type": "text"
						},
						{
							"key": "emergency_mobile",
							"title": "紧急联系人电话",
							"type": "text"
						},
						{
							"key": "internals.employee_name",
							"title": "内部介绍人",
							"type": "text"
						},
						{
							"key": "marital_status",
							"title": "婚姻情况",
							"type": "number",
							formatter: (val, row, column, index) => {
								return row.marital_status == 1 ? '已婚' : '未婚';
							}
						},
						{
							"key": "no_crime",
							"title": "无犯罪证明",
							"type": "number",
							formatter: (val, row, column, index) => {
								return row.no_crime == 1 ? '有' : '无';
							}
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text"
						},
						{
							"key": "resigntypes.type_name",
							"title": "离职类型",
							"type": "text"
						},
						{
							"key": "rest_type",
							"title": "休息类型",
							"type": "number",
							formatter: (val, row, column, index) => {
								if (val == 1) return '单休';
								if (val == 2) return '双休';
								if (val == 3) return '大小周';
							}
						},
						{
							"key": "status",
							"title": "用户状态",
							"type": "number",
							formatter: (val, row, column, index) => {
								return val == 1 ? '在职' : '离职';
							}
						}
					],
					pageIndex: 1,
					pageSize: -1, // 此值为-1，代表导出所有数据
				});
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