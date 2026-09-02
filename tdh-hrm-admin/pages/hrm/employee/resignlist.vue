<template>
	<view class="page-body">
		<!-- 页面内容开始 -->

		<!-- 表格搜索组件开始 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
			<template v-slot:company_id="{form}">
				<vk-data-input-tree-select v-model="form.company_id" action="admin/hrm/company/sys/getList"
					:props="{ list:'rows', value:'company_id', label:'company_name',children:'children' }"
					@change="toCompany" placeholder="请选择"></vk-data-input-tree-select>
			</template>
			<!-- 显示department_id的值，必须用form1.department_id -->
			<template v-slot:department_id="{form}">
				<vk-data-input-tree-select v-model="form1.department_id" :localdata="departments" placeholder="请选择"
					@change="toDepartment"></vk-data-input-tree-select>
			</template>
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
				<el-upload style="display: inline-block;margin-left: 20rpx;margin-right: 20rpx;" accept=".xlsx, .xls"
					:auto-upload="false" :limit="1" :show-file-list="false" :file-list="fileList"
					v-if="$hasRole('admin') || $hasPermission('hrm-employee-add')" :on-change="handleChange" action="">
					<el-button type="primary" size="small" icon="el-icon-upload2">导入excel</el-button>
				</el-upload>
				<el-button type="primary" size="small" icon="el-icon-tickets"
					v-if="$hasRole('admin') || $hasPermission('hrm-employee-add')" @click="exportExcelModel"> 下载模版
				</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange">
		</vk-data-table>
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
				departments: [],
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
								return this.$hasRole('admin') || this.$hasPermission('hrm-employee-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-employee-edit')
							}
						},
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
							"key": "employee_id",
							"title": "员工工号",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "center_id",
							"title": "中心代码",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "centers.center_name",
							"title": "六大中心",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "points.point_name",
							"title": "分点名称",
							"type": "text",
							"fixed": true,
							"width": colWidth
						},
						{
							"key": "employee_name",
							"title": "员工姓名",
							"type": "text",
							"fixed": true,
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
							"key": "managers.employee_name",
							"title": "上级主管",
							"type": "text",
							"width": colWidth - 100
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
							"key": "handovers.employee_name",
							"title": "交接人",
							"type": "text",
							"width": colWidth - 100
						},
						// {
						// 	"key": "rest_type",
						// 	"title": "休息类型",
						// 	"type": "number",
						// 	formatter: (val, row, column, index) => {
						// 		if (val == 1) return '单休';
						// 		if (val == 2) return '双休';
						// 		if (val == 3) return '大小周';
						// 	}
						// },
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
							"key": "resign_desc",
							"title": "离职原因",
							"type": "text",
							"show": ["detail"],
							"width": colWidth
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
							"width": colWidth - 150
						},
						{
							"key": "expected_salary",
							"title": "意向工资",
							"type": "text",
							"show": ["row"],
							"showRule": (formData) => {
								return this.$hasPermission('hrm-employee-edit');
							},
							"width": colWidth - 100
						},
						{
							"key": "file_attachments",
							"title": "证明文件",
							"type": "html",
							"width": colWidth,
							"show": ["detail"],
							"formatter": (val, row, column, index) => {
								if (val && val.length > 0) {
									let html = '';

									// 为当前行生成唯一ID
									const rowId = row._id || row.employee_id || `row-${index}`;

									val.forEach((url, idx) => {
										if (!url) return;

										const fileName = url.split('/').pop() || '证明文件';
										const fileExtension = fileName.split('.').pop().toLowerCase();
										const isImage = /(jpg|jpeg|png|gif|bmp|webp)$/i.test(
											fileExtension);

										// 生成唯一的文件ID
										const fileId = `${rowId}-file-${idx}`;

										if (isImage) {
											// 图片文件
											html += `<a href="javascript:void(0);" 
						                               id="${fileId}"
						                               class="file-preview-link"
						                               data-url="${url}"
						                               data-row-id="${rowId}"
						                               data-file-index="${idx}"
						                               data-is-image="true"
						                               style="color: #409EFF; text-decoration: underline; margin-right: 5px;">
						                             ${fileName}
						                           </a>`;
										} else {
											// 非图片文件
											html += `<a href="${url}" 
						                               download="${fileName}" 
						                               target="_blank" 
						                               style="color: #67C23A; text-decoration: underline; margin-right: 5px;">
						                             ${fileName}
						                           </a>`;
										}

										// 如果不是最后一个文件，添加分隔符
										if (idx < val.length - 1) {
											html += '，';
										}
									});

									// 添加文件数量提示
									html +=
										`<span style="margin-left: 5px; color: #909399; font-size: 12px;">(${val.length}个文件)</span>`;

									return html;
								}
								return '<span style="color: #909399;">无</span>';
							}
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
						status: 2
					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
							"key": "employee_id",
							"title": "员工工号",
							"type": "text",
							"width": colWidth - 50,
							"mode": "="
						},
						{
							"key": "employee_name",
							"title": "员工姓名",
							"type": "text",
							"width": colWidth - 50,
							"mode": "%%"
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text",
							"width": colWidth - 10,
							"mode": "="

						}, {
							"key": "gender",
							"title": "性别",
							"type": "select",
							"width": colWidth - 50,
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
							"hidden": true,
							"type": "select",
							"width": colWidth - 50,
							"data": [{
								"value": 1,
								"label": "在职"
							}, {
								"value": 2,
								"label": "离职"
							}],
							"mode": "="
						},
						// {
						// 	"key": "rest_type",
						// 	"title": "休息类别",
						// 	"type": "select",
						// 	"width": colWidth - 50,
						// 	"data": [{
						// 		"value": 1,
						// 		"label": "单休"
						// 	}, {
						// 		"value": 2,
						// 		"label": "双休"
						// 	}, {
						// 		"value": 3,
						// 		"label": "大小周"
						// 	}],
						// 	"mode": "="
						// },
						{
							"key": "company_id",
							"title": "所属公司",
							"type": "text",
							"width": colWidth - 50,
							"mode": "="
						},
						{
							"key": "department_id",
							"title": "所属部门",
							"type": "text",
							"width": colWidth - 50,
							"mode": "="
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
						//{"key":"card","title":"身份证号码","type":"text","width":200,"mode":"="},
						//{"key":"birth_date","title":"出生日期","type":"datetimerange","width":200,"mode":"="},
						//{"key":"mobile","title":"手机号码","type":"text","width":200,"mode":"="},
						//{"key":"avatar","title":"头像地址","type":"text","width":200,"mode":"="},
						//{"key":"avatar_file","title":"头像文件","type":"image","width":200,"mode":"="},
						//{"key":"hire_date","title":"入职日期","type":"datetimerange","width":200,"mode":"="},
						//{"key":"resign_date","title":"离职日期","type":"datetimerange","width":200,"mode":"="},
						//{"key":"position_id","title":"职位名称","type":"text","width":200,"mode":"="},
						//{"key":"department_id","title":"所属部门","type":"text","width":200,"mode":"="},
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
								watch: async (res) => {
									let les = vk.myfn.test1(res.value);
									let msg = "";
									if (les.code == 0) {
										const el = await vk.myfn.getResignEmployees(res.value);
										if (vk.pubfn.isNotNull(el)) {
											el.forEach(e => {
												msg +=
													`姓名：${e.employee_name}(${e.employee_id})\n入职日期：${e.hire_date}\n离职日期：${e.resign_date}\n离职原因：${e.resign_desc}`;
											})

											vk.alert(msg, '该员工为再次入职，信息如下', '确定');
										}
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
									this.$set(this.form1.data, item.key, "");
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
								width: colWidth,
								watch: ({
									value,
									formData,
									column,
									index,
									option,
									$set
								}) => {
									let item = vk.pubfn.getListItem(this.form1.props.columns, "key",
										"manager_id");
									this.$set(this.form1.data, item.key, option.department_manager_id);
									// console.log(value,option);
								}
							},
							{
								key: "manager_id",
								title: "上级主管",
								type: "table-select",
								placeholder: "选择上级主管",
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
								}
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
								title: "内部介绍人",
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
								}
							},
							{
								"key": "card_location",
								"title": "户口所在地",
								"type": "textarea",
								"maxlength": "99",
								"showWordLimit": true,
								"width": colWidth,
								"autosize": {
									minRows: 3,
									maxRows: 10
								}
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
							// {
							// 	"key": "rest_type",
							// 	"title": "休息类型",
							// 	"type": "select",
							// 	"width": colWidth,
							// 	"defaultValue": 1,
							// 	"data": [{
							// 		"value": 1,
							// 		"label": "单休"
							// 	}, {
							// 		"value": 2,
							// 		"label": "双休"
							// 	}, {
							// 		"value": 3,
							// 		"label": "大小周"
							// 	}]
							// },
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
								"key": "expected_salary",
								"title": "意向工资",
								"precision": 0,
								"type": "number",
								"width": colWidth
							},
							{
								key: "handover_person_id",
								title: "交接人",
								type: "table-select",
								placeholder: "选择交接人",
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
								}
							},
							{
								"key": "avatar",
								"title": "头像地址",
								"type": "avatar",
								"cloudDirectory": "employee/avatar",
								"width": colWidth,
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file, fileList)
								}
							},
							{
								key: "file_attachments",
								title: "证明文件",
								type: "file",
								oneLine: true,
								limit: 9,
								accept: ".jpeg,.jpg,.png,.pdf",
								fileSize: 2,
								sizeUnit: "mb",
								tips: "只能上传pdf/jpg/png文件，且不超过2MB",
								cloudPathRemoveChinese: false,
								cloudDirectory: "employee/file",
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file)
								}
							},
							{
								key: "resign_desc",
								title: "离职原因",
								type: "textarea",
								maxlength: "99",
								showWordLimit: true,
								width: colWidth + 430,
								autosize: {
									minRows: 4,
									maxRows: 10
								}
							},
							{
								key: "comment",
								title: "备注",
								type: "textarea",
								maxlength: "99",
								showWordLimit: true,
								width: colWidth + 430,
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
								required: false,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							bank_card: [{
								required: false,
								message: "该项不能为空",
								trigger: ['blur', 'change'],

							}, {
								validator: async (rule, value, callback) => {
									if (vk.pubfn.isNull(value)) {
										callback();
									}
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
								required: false,
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
		beforeDestroy() {
			// 移除事件监听
			if (this.handleFileClick) {
				document
					.removeEventListener('click', this.handleFileClick);
			}
		},
		// 函数
		methods: {
			// 在 init 方法中添加
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);

				// 添加文件点击事件监听
				this.$nextTick(() => {
					this.bindFileClickEvents();
				});
			},
			// 绑定文件点击事件
			bindFileClickEvents() {
				// 注意：这里需要确保DOM已经渲染完成
				// 由于表格是动态渲染的，我们可能需要使用事件委托，或者在表格渲染完成后绑定事件

				// 方案一：使用事件委托（推荐）
				const handleFileClick = (e) => {
					const target = e.target;
					if (target.classList.contains('file-preview-link')) {
						e.preventDefault();

						const url = target.getAttribute('data-url');
						const rowId = target.getAttribute('data-row-id');
						const fileIndex = parseInt(target.getAttribute('data-file-index'), 10);

						// 查找同一行的所有图片文件
						const rowLinks = document.querySelectorAll(`[data-row-id="${rowId}"].file-preview-link`);
						const imageUrls = [];

						rowLinks.forEach(link => {
							const linkUrl = link.getAttribute('data-url');
							const linkExtension = linkUrl.split('.').pop().toLowerCase();
							if (/(jpg|jpeg|png|gif|bmp|webp)$/i.test(linkExtension)) {
								imageUrls.push(linkUrl);
							}
						});

						// 预览图片
						if (imageUrls.length > 0) {
							const currentIndex = imageUrls.indexOf(url);
							this.previewImage(url, imageUrls, currentIndex);
						}
					}
				};

				// 移除旧的事件监听器（避免重复绑定）
				document.removeEventListener('click', this.handleFileClick);
				this.handleFileClick = handleFileClick;
				document.addEventListener('click', this.handleFileClick);
			},

			// 图片预览方法
			previewImage(currentUrl, urls, currentIndex) {
				// 过滤出有效的图片URL
				const validImageUrls = urls.filter(url => {
					if (!url) return false;
					const extension = url.split('.').pop().toLowerCase();
					return /(jpg|jpeg|png|gif|bmp|webp)$/i.test(extension);
				});

				if (validImageUrls.length === 0) {
					uni.showToast({
						title: '没有可预览的图片',
						icon: 'none'
					});
					return;
				}

				// 确保当前索引有效
				if (currentIndex === undefined || currentIndex < 0 || currentIndex >= validImageUrls.length) {
					currentIndex = 0;
				}

				// 确保当前URL在数组中
				if (!validImageUrls.includes(currentUrl) && currentUrl) {
					validImageUrls.unshift(currentUrl);
					currentIndex = 0;
				}

				// 调用uni-app的预览图片API
				uni.previewImage({
					current: currentIndex,
					urls: validImageUrls,
					indicator: 'number',
					loop: true,
					success: () => {
						console.log('图片预览成功');
					},
					fail: (err) => {
						console.error('图片预览失败:', err);
						// 如果预览失败，尝试直接打开图片链接
						if (currentUrl) {
							uni.showModal({
								title: '提示',
								content: '图片预览失败，是否下载图片？',
								success: (res) => {
									if (res.confirm) {
										uni.downloadFile({
											url: currentUrl,
											success: (downloadRes) => {
												if (downloadRes.statusCode === 200) {
													uni.saveImageToPhotosAlbum({
														filePath: downloadRes
															.tempFilePath,
														success: () => {
															uni.showToast({
																title: '图片已保存到相册',
																icon: 'success'
															});
														},
														fail: (saveErr) => {
															console.error(
																'保存图片失败:',
																saveErr
															);
															uni.showToast({
																title: '保存图片失败',
																icon: 'none'
															});
														}
													});
												}
											},
											fail: (downloadErr) => {
												console.error('下载图片失败:', downloadErr);
												uni.showToast({
													title: '下载图片失败',
													icon: 'none'
												});
											}
										});
									}
								}
							});
						}
					}
				});
			},
			toTreeData(originalData) {
				// 递归转换函数
				const convertNode = (node) => {
					return {
						value: node.department_id,
						label: node.department_name,
						manager: node.department_manager_id,
						children: node.children && node.children.length > 0 ?
							node.children.map(child => convertNode(child)) : []
					};
				};
				// 只处理顶级节点（parent_department_id 为 null）
				return originalData
					.filter(item => vk.pubfn.isNull(item.parent_department_id))
					.map(root => convertNode(root));
			},

			async toCompany(e) {
				this.departments = []
				let res = await vk.callFunction({
					url: 'admin/hrm/department/pub/getList',
					title: '请求中...',
					data: {
						company_id: e
					},
				});
				const treeData = this.toTreeData(res.rows);
				this.departments = treeData;
				this.$refs.table1.queryParam.formData.department_id = "";
				this.$set(this.form1, "department_id", "");
				this.search();
			},
			toDepartment(e) {
				this.$set(this.queryForm1.formData, "department_id", e);
				this.search();
			},
			// 页面数据初始化函数
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);

				// 添加文件点击事件监听
				this.$nextTick(() => {
					this.bindFileClickEvents();
				});
			},
			// 页面跳转
			pageTo(path) {
				vk.navigateTo(path);
			},
			// 表单重置
			resetForm() {
				this.$set(this.form1, 'department_id', '');
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
				//删除附件
				item.url = item.avatar;
				vk.myfn.deleteFile(item);
				vk.myfn.deleteFiles(item.file_attachments);
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
					card: {
						"title": "身份证号码",
						"type": "text"
					},
					resign_date: {
						"title": "离职日期",
						"type": "date"
					},
					resign_desc: {
						"title": "离职原因",
						"type": "text"
					},
					type_id: {
						"title": "离职类型",
						"type": "text"
					},
					status: {
						"title": "用户状态",
						"type": "number"
					}
				};
				let count = 0;
				let errorRow = "";
				try {
					this.$iexcel.importExcel(file.raw, typeObj, async (res) => {
						if (!res || res.length === 0) {
							return vk.alert('Excel中没有数据！');
						}

						// 1. 提取所有身份证号码
						const cards = res.map(item => item.card).filter(card => card);
						if (cards.length === 0) {
							return vk.alert('Excel中没有有效的身份证号码！');
						}

						// 2. 批量检查人员基本资料
						vk.toast('检查人员基本资料中...');
						const checkRes = await vk.callFunction({
							url: 'admin/hrm/employees/pub/getCheckCards',
							title: '检查人员资料...',
							data: {
								cards: cards
							}
						});

						if (checkRes.cardeds && checkRes.cardeds.length > 0) {
							const errorCards = checkRes.cardeds.slice(0, 10).join(', ');
							const errorMsg = checkRes.cardeds.length > 10 ?
								`人员基本资料不能为空(${checkRes.cardeds.length}条): ${errorCards}...等` :
								`人员基本资料不能为空(${checkRes.cardeds.length}条): ${errorCards}`;
							return vk.alert(errorMsg, "检测Excel导入数据", "确定");
						}

						// 3. 批量获取员工信息映射
						vk.toast('获取员工信息中...');
						const employeeMap = await vk.myfn.batchGetEmployeeInfo(cards);
						if (!employeeMap) {
							return vk.alert('获取员工信息失败！');
						}

						for (const item of res) {
							if (vk.pubfn.isNull(item.card)) {
								vk.alert('身份证号不能为空');
								break;
							}

							// 获取employee_id
							const employeeInfo = employeeMap.get(item.card);
							item.employee_id = employeeInfo.employee_id;

							if (item.type_id === '主动辞职') {
								item.type_id = '03';
							} else {
								item.type_id = item.type_id === '退休' ? '01' : '02';
							}

							item.status = item.status === '在职' ? 1 : 2;

							let upRes = await vk.callFunction({
								url: 'admin/hrm/employees/pub/updateResign',
								title: '请求中...',
								data: item,
							});
							if (upRes.code == 0) {
								count++;
							} else {
								count = 0;
								errorRow = JSON.stringify(item);
								break;
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
					fileName: new Date().getFullYear() + '离职员工列表模版',
					title: "正在导出数据...",
					columns: [{
							"key": "card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "resign_desc",
							"title": "离职原因",
							"type": "text"
						},
						{
							"key": "type_id",
							"title": "离职类型",
							"type": "text",
							formatter: (val, row, column, index) => {
								if (val === '03') {
									return '主动辞职';
								}
								return val == '01' ? '退休' : '被辞退';
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
					pageSize: 1, // 此值为-1，代表导出所有数据
				});
			},

			// 导出xls表格文件（全部数据）
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '离职人员信息',
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
							"key": "managers.employee_name",
							"title": "上级主管",
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
							"key": "resign_desc",
							"title": "离职原因",
							"type": "text"
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
							"key": "handovers.employee_name",
							"title": "交接人",
							"type": "text"
						},
						// {
						// 	"key": "rest_type",
						// 	"title": "休息类型",
						// 	"type": "number",
						// 	formatter: (val, row, column, index) => {
						// 		if (val == 1) return '单休';
						// 		if (val == 2) return '双休';
						// 		if (val == 3) return '大小周';
						// 	}
						// },
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
		computed: {}
	};
</script>
<style lang="scss" scoped>
	.page-body {}
</style>