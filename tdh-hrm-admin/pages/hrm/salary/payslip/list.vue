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
				<el-upload style="display: inline-block;margin-left: 20rpx;margin-right: 20rpx;" accept=".xlsx, .xls"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-payslip-add')" :auto-upload="false" :limit="1"
					:show-file-list="false" :on-change="handleChange" :file-list="fileList" action="">
					<el-button type="success" size="small" icon="el-icon-upload2">导入excel</el-button>
				</el-upload>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-payslip-add')" @click="exportExcelAll"> 导出全部
				</el-button>
				<el-button type="primary" size="small" icon="el-icon-tickets" @click="exportExcelModel"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-payslip-add')"> 下载模版
				</el-button>
				<el-button type="danger" size="small" icon="el-icon-delete" @click="deleteAll" v-if="$hasRole('admin')">
					删除时间数据
				</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"
			:page-sizes="pageSizes"></vk-data-table></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="800px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :before-action="form1.props.beforeAction"
				:columns='form1.props.columns' label-width="110px" @success="form1.props.show = false;refresh();"
				:inline="true" :columnsNumber="2"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	import myfn from '../../../../common/function/myPubFunction';

	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 200;
	let nowy = new Date(vk.pubfn.getOffsetTime(new Date(), {
		mode: "before", // after 之后 before 之前
	})).getFullYear();

	let nowm = new Date(vk.pubfn.getOffsetTime(new Date(), {
		mode: "before", // after 之后 before 之前
	})).getMonth();

	let nowm1 = nowm > 9 ? nowm : `0${nowm}`;
	const nowym = vk.myfn.normalizeMonth(`${nowy}-${nowm1}`);
	export default {
		data() {
			// 页面数据变量
			return {
				pageSizes: [1, 5, 10, 20, 50, 100, 500, 1000],
				fileList: [],
				sumList: [],
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/salary/sys/payslip/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-salary-payslip-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-salary-payslip-edit')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-salary-payslip-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							"key": "attendance_ym",
							"title": "时间",
							"type": "date",
							"dateType": "date",
							"fixed": true,
							"valueFormat": "yyyy-MM",
							"format": "yyyy-MM"
						}, {
							"key": "total_salary",
							"title": "综合",
							"type": "number",
							"show": ["none"],
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "rest_type",
							"title": "制",
							"fixed": true,
							"type": "text",
							"show": ["none"],
							"width": colWidth - 100
						},
						{
							"key": "attendance_ym_key",
							"title": "月份",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "signature_url",
							"title": "签名",
							"type": "image",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "employee_name",
							"title": "姓名",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text",
							"fixed": true,
							"width": colWidth - 30
						},
						{
							"key": "department_name",
							"title": "部门",
							"fixed": true,
							"type": "text",
							"width": colWidth
						},
						{
							"key": "employees.mobile",
							"title": "手机号码",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "position_name",
							"title": "岗位",
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
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "base_salary",
							"title": "基本工资",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "performance_salary",
							"title": "绩效工资",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "overtime_fee",
							"title": "固定加班",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "penalty_fund",
							"title": "社保补偿金",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "housing_fund",
							"title": "公积补偿金",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "annual_allowance",
							"title": "年度补偿金",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "floating_bonus",
							"title": "浮动奖励",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "confidentiality_fee",
							"title": "保密费",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "work_days",
							"title": "应勤天数",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "real_days",
							"title": "实际出勤",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "gross_salary",
							"title": "应发工资",
							"type": "number",
							"width": colWidth - 50
						},
						{
							"key": "overtime_cost",
							"title": "加班费",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "free_cost",
							"title": "放假补助",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "grant",
							"title": "补助",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "agency_fee",
							"title": "介绍费",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "other_cost",
							"title": "其它",
							"type": "text",
							"width": colWidth - 50
						},
						{
							"key": "we_cost",
							"title": "水电",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "clothes_cost",
							"title": "工衣",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "earlytime_cost",
							"title": "迟到早退",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "missed_cost",
							"title": "未打卡",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "loan_cost",
							"title": "借款",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "this_month_sb",
							"title": "本月社保",
							"type": "number",
							"width": colWidth - 50
						},
						{
							"key": "this_month_dk",
							"title": "本月代扣部份",
							"type": "number",
							"width": colWidth - 50
						},
						{
							"key": "dkgs",
							"title": "代扣个税",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "real_salary",
							"title": "实发工资",
							"type": "number",
							"width": colWidth - 50
						},
						// {
						// 	"key": "company_sb",
						// 	"title": "公司部份社保",
						// 	"type": "number",
						// 	"width": colWidth - 50
						// },
						// {
						// 	"key": "company_gjj",
						// 	"title": "公司部份公积金",
						// 	"type": "number",
						// 	"width": colWidth - 50
						// },
						// {
						// 	"key": "last_month_sb",
						// 	"title": "下月社保",
						// 	"type": "number",
						// 	"width": colWidth - 100
						// },
						// {
						// 	"key": "last_month_gjj",
						// 	"title": "下月公积金",
						// 	"type": "number",
						// 	"width": colWidth - 100
						// },
						{
							key: "status",
							title: "状态",
							type: "tag",
							width: colWidth - 100,
							data: [{
									value: 0,
									label: "未签名",
									tagType: "danger"
								}, {
									value: 1,
									label: "已签名",
									tagType: "success"
								},
								{
									value: 2,
									label: "其他",
									tagType: "warning"
								}
							]
						},
						{
							"key": "bank_name",
							"title": "开户行",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "bank_location",
							"title": "开户地",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "bank_card",
							"title": "银行账号",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text",
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
						attendance_ym: nowym,
						status: 0
					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
							key: "attendance_ym",
							title: "时间",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
							"width": colWidth
						}, {
							key: "card",
							title: "",
							type: "table-select",
							placeholder: "选择员工",
							action: "admin/hrm/salary/sys/payslip/getList",
							multiple: false,
							columns: [{
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									nameKey: true
								},
								{
									key: "card",
									title: "身份证号码",
									type: "text",
									idKey: true

								}
							],
							queryColumns: [{
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									width: 150,
									mode: "%%"
								},
								{
									key: "card",
									title: "身份证号码",
									type: "text",
									width: 150,
									mode: "%%"
								}

							]
						},
						{
							key: "department_name",
							title: "部门名称",
							type: "remote-select",
							placeholder: "请选择部门名称",
							width: colWidth,
							action: "admin/hrm/salary/sys/payslip/getList",
							props: {
								list: "rows",
								value: "department_name",
								label: "department_name"
							},
							dataPreprocess: (list) => {
								const departmentList = [...new Set(
									list.map(item => item.department_name)
								)].map(name => ({
									department_name: name
								}));
								return departmentList;
							},
							showAll: true,
							actionData: {
								pageSize: -1,
								pageIndex: 1
							}
						},
						{
							key: "status",
							title: "状态",
							type: "select",
							width: colWidth - 50,
							data: [{
									value: 0,
									label: "未签名"
								},
								{
									value: 1,
									label: "已签名"
								},
								{
									value: 2,
									label: "其他"
								}
							],
							mode: "="
						},

					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								key: "attendance_ym",
								title: "时间",
								type: "date",
								dateType: "date",
								disabled: false,
								valueFormat: "yyyy-MM",
								format: "yyyy-MM",
								"width": colWidth
							},
							{
								key: "attendance_ym_key",
								title: "月份",
								type: "date",
								dateType: "date",
								disabled: false,
								valueFormat: "yyyy-MM",
								format: "yyyy-MM",
								"width": colWidth
							},
							{
								"key": "total_salary",
								"title": "综合",
								"type": "number",
								disabled: true,
								"width": colWidth
							},
							{
								"key": "base_salary",
								"title": "基本工资",
								"type": "number",
								disabled: true,
								"width": colWidth
							},
							{
								"key": "performance_salary",
								"title": "绩效工资",
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "overtime_fee",
								"title": "固定加班",
								"type": "number",
								disabled: true,
								"width": colWidth
							},
							{
								"key": "penalty_fund",
								"title": "社保补偿金",
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "housing_fund",
								"title": "公积补偿金",
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "annual_allowance",
								"title": "年度补偿金",
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "floating_bonus",
								"title": "浮动奖励",
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "confidentiality_fee",
								"title": "保密费",
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "work_days",
								"title": "应勤天数",
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "real_days",
								"title": "实际出勤",
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "gross_salary",
								"title": "应发工资",
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "overtime_cost",
								"title": "加班费",
								"type": "number",
								min: -10000,
								controls: true,
								"width": colWidth
							},
							{
								"key": "free_cost",
								"title": "放假补助",
								"type": "number",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								"width": colWidth
							},
							{
								"key": "grant",
								"title": "补助",
								"type": "number",
								min: -10000,
								controls: true,
								"width": colWidth
							},
							{
								"key": "agency_fee",
								"title": "介绍费",
								"type": "number",
								min: -10000,
								controls: true,
								"width": colWidth
							},
							{
								"key": "other_cost",
								"title": "其它",
								"type": "number",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								"width": colWidth
							},
							{
								"key": "we_cost",
								"title": "水电",
								"type": "number",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								"width": colWidth
							},
							{
								"key": "clothes_cost",
								"title": "工衣",
								"type": "number",
								min: -10000,
								controls: true,
								"width": colWidth
							},
							{
								"key": "earlytime_cost",
								"title": "迟到早退",
								"type": "number",
								min: -10000,
								controls: true,
								"width": colWidth
							},
							{
								"key": "missed_cost",
								"title": "未打卡",
								"type": "number",
								min: -10000,
								controls: true,
								"width": colWidth
							},
							{
								"key": "loan_cost",
								"title": "借款",
								"type": "number",
								min: -10000,
								controls: true,
								"width": colWidth
							},
							{
								"key": "this_month_sb",
								"title": "本月社保",
								"type": "number",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								"width": colWidth
							},
							{
								"key": "this_month_dk",
								"title": "本月代扣部份",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "dkgs",
								"title": "代扣个税",
								"type": "number",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								"width": colWidth
							},
							{
								"key": "real_salary",
								"title": "实发工资",
								"type": "number",
								disabled: true,
								"width": colWidth
							},
							// {
							// 	"key": "company_sb",
							// 	"title": "公司部份社保",
							// 	"type": "number",
							// 	"width": colWidth
							// },
							// {
							// 	"key": "company_gjj",
							// 	"title": "公司部份公积金",
							// 	"type": "number",
							// 	"width": colWidth
							// },
							// {
							// 	"key": "last_month_sb",
							// 	"title": "下月社保",
							// 	"type": "number",
							// 	"width": colWidth
							// },
							// {
							// 	"key": "last_month_gjj",
							// 	"title": "下月公积金",
							// 	"type": "number",
							// 	"width": colWidth
							// },
							{
								key: "status",
								title: "状态",
								type: "radio",
								width: colWidth - 50,
								data: [{
										value: 0,
										label: "未签名"
									},
									{
										value: 1,
										label: "已签名"
									},
									{
										value: 2,
										label: "其他"
									}
								]
							},
							{
								"key": "bank_name",
								"title": "开户行",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "bank_location",
								"title": "开户地",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "bank_card",
								"title": "银行账号",
								"type": "text",
								"width": colWidth
							},
							{
								key: "comment",
								title: "备注",
								type: "textarea",
								maxlength: "500",
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
							attendance_ym: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							employee_name: [{
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
				// 其它弹窗表单
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
			//删除导入的数据
			async deleteAll() {
				try {
					if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
						return vk.alert(`时间不能为空！`);
					}
					const attendance_ym = this.queryForm1.formData.attendance_ym;
					// 删除旧数据
					let delRes = await vk.callFunction({
						url: 'admin/hrm/salary/sys/payslip/all/deleteKeyAll',
						title: '删除中...',
						data: {
							attendance_ym: attendance_ym
						}
					})

					if (delRes.code != 0) {
						return vk.alert(`${attendance_ym}月工资条明细删除失败！`);
					}
					return vk.alert(`${attendance_ym}月工资条明细删除成功！`);
				} catch (err) {

				} finally {
					this.refresh();
				}
			},
			//导入xls表格文件
			async handleChange(file) {
				// 定义字段类型
				let typeObj = {
					total_salary: {
						"title": "综合",
						"type": "number"
					},
					rest_type: {
						"title": "制",
						"type": "text"
					},
					attendance_ym_key: {
						"title": "月份",
						"type": "text"
					},
					employee_name: {
						"title": "姓名",
						"type": "text"
					},
					card: {
						"title": "身份证号码",
						"type": "text"
					},
					department_name: {
						"title": "任职部门",
						"type": "text"
					},
					position_name: {
						"title": "岗位",
						"type": "text"
					},
					hire_date: {
						"title": "入职日期",
						"type": "number"
					},
					resign_date: {
						"title": "离职日期",
						"type": "text"
					},
					base_salary: {
						"title": "基本工资",
						"type": "number"
					},
					performance_salary: {
						"title": "绩效工资",
						"type": "number"
					},
					overtime_fee: {
						"title": "固定加班",
						"type": "number"
					},
					penalty_fund: {
						"title": "社保补偿金",
						"type": "number"
					},
					housing_fund: {
						"title": "公积补偿金",
						"type": "number"
					},
					annual_allowance: {
						"title": "年度补偿金",
						"type": "number"
					},
					floating_bonus: {
						"title": "浮动奖励",
						"type": "number"
					},
					confidentiality_fee: {
						"title": "保密费",
						"type": "number"
					},
					work_days: {
						"title": "应勤天数",
						"type": "number"
					},
					real_days: {
						"title": "实际出勤",
						"type": "number"
					},
					gross_salary: {
						"title": "应发工资",
						"type": "number"
					},
					overtime_cost: {
						"title": "加班费",
						"type": "number"
					},
					free_cost: {
						"title": "放假补助",
						"type": "number"
					},
					grant: {
						"title": "补助",
						"type": "number"
					},
					agency_fee: {
						"title": "介绍费",
						"type": "number"
					},
					other_cost: {
						"title": "其它",
						"type": "number"
					},
					we_cost: {
						"title": "水电",
						"type": "number"
					},
					clothes_cost: {
						"title": "工衣",
						"type": "number"
					},
					earlytime_cost: {
						"title": "迟到早退",
						"type": "number"
					},
					missed_cost: {
						"title": "未打卡",
						"type": "number"
					},
					loan_cost: {
						"title": "借款",
						"type": "number"
					},
					this_month_sb: {
						"title": "本月社保",
						"type": "number"
					},
					this_month_dk: {
						"title": "本月代扣部份",
						"type": "number"
					},
					dkgs: {
						"title": "代扣个税",
						"type": "number"
					},
					real_salary: {
						"title": "实发工资",
						"type": "number"
					},
					// company_sb: {
					// 	"title": "公司部份社保",
					// 	"type": "number",
					// },
					// company_gjj: {
					// 	"title": "公司部份公积金",
					// 	"type": "number",
					// },
					// last_month_sb: {
					// 	"title": "下月社保",
					// 	"type": "number"
					// },
					// last_month_dk: {
					// 	"title": "下月公积金",
					// 	"type": "number"
					// },
					status: {
						"title": "状态",
						"type": "text"
					},
					bank_name: {
						"title": "开户行",
						"type": "text"
					},
					bank_location: {
						"title": "开户地",
						"type": "text"
					},
					bank_card: {
						"title": "银行账号",
						"type": "text"
					},
					comment: {
						"title": "备注",
						"type": "text"
					}
				};

				try {
					if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
						return vk.alert(`时间不能为空！`);
					}

					const attendance_ym = this.queryForm1.formData.attendance_ym;

					this.$iexcel.importExcel(file.raw, typeObj, async (res) => {
						if (!res || res.length === 0) {
							return vk.alert('Excel中没有数据！');
						}

						// 1. 数据验证
						const validationResult = this.validateExcelData(res);
						if (!validationResult.valid) {
							return vk.alert(validationResult.message, "数据验证失败", "确定");
						}

						// 2. 提取所有身份证号码
						const cards = [],
							keys = [];
						for (const item of res) {
							if (item.card) cards.push(item.card);
							const key = vk.myfn.toFormatDate(item.attendance_ym_key);
							if (key) keys.push(key);
						}

						if (cards.length === 0 || keys.length === 0) {
							return vk.alert('Excel中没有有效的身份证号码或月份！');
						}

						// 删除旧数据
						let delRes = await vk.callFunction({
							url: 'admin/hrm/salary/sys/payslip/all/deleteAll',
							title: '删除中...',
							data: {
								cards,
								keys
							}
						})

						if (delRes.code != 0) {
							return vk.alert(`${attendance_ym}月工资条明细删除失败！`);
						}

						// 3. 准备要处理的数据
						const validData = [];
						const errorData = [];

						for (const item of res) {

							item.attendance_ym = attendance_ym;

							//状态
							const STATUS_MAP = {
								'未签名': 0,
								'已签名': 1,
								'其他': 2
							};
							item.status = STATUS_MAP[item.status] ? STATUS_MAP[item.status] : 0;


							// 验证必要字段
							if (!item.attendance_ym) {
								errorData.push({
									item,
									reason: '时间不能为空'
								});
								continue;
							}
							if (!item.card) {
								errorData.push({
									item,
									reason: '身份证号码不能为空'
								});
								continue;
							}

							//处理月份
							item.attendance_ym_key = vk.myfn.toFormatDate(item.attendance_ym_key);

							//修改新增人员和时间									
							item.update_date = new Date().getTime();
							item.update_id = vk.getVuex('$user.userInfo._id');

							if (vk.pubfn.isNotNull(item.hire_date)) {
								let utcDate = new Date(Date.UTC(1900, 0, item.hire_date - 1));
								item.hire_date = utcDate.toISOString().slice(0, 10);
							}

							validData.push(item);
						}

						if (errorData.length > 0) {
							let errorMsg = errorData.slice(0, 5).map(err =>
								`姓名: ${err.item.employee_name} - ${err.reason}`
							).join('\n');
							if (errorData.length > 5) {
								errorMsg += `\n...还有${errorData.length - 5}条错误数据`;
							}
							vk.confirm(`数据验证失败:\n${errorMsg}`, "是否继续导入数据", "是", "否", async (res) => {
								if (res.confirm) {
									// 点击确定按钮后的回调	
									// 6. 批量处理数据
									vk.toast('开始导入数据...');
									const result = await vk.callFunction({
										url: 'admin/hrm/salary/sys/payslip/all/addAll',
										title: '请求中...',
										data: {
											items: validData
										},
									});

									if (result.code === 0) {
										let resultMessage =
											`导入完成！成功: ${result.id.length}条`;
										return vk.alert(resultMessage, "导入成功", "确定",
											() => {
												this.refresh();
											})
									} else {
										return vk.alert(`导入Excel失败!`, "系统错误", "确定");
									}
								} else {
									return;
								}
							})
						} else {
							vk.toast('开始导入数据...');
							const result = await vk.callFunction({
								url: 'admin/hrm/salary/sys/payslip/all/addAll',
								title: '请求中...',
								data: {
									items: validData
								},
							});

							if (result.code === 0) {
								let resultMessage = `导入完成！成功: ${result.id.length}条`;
								return vk.alert(resultMessage, "导入成功", "确定", () => {
									this.refresh();
								})
							} else {
								return vk.alert(`导入Excel失败!`, "系统错误", "确定");
							}
						}
					})
				} catch (error) {
					console.error('导入Excel失败:', error);
					vk.alert(`导入Excel失败: ${error.message}`, "系统错误", "确定");
					this.fileList = [];
				} finally {
					this.fileList = [];
				}
			},
			// 验证Excel数据
			validateExcelData(data) {
				if (!Array.isArray(data)) {
					return {
						valid: false,
						message: '数据格式错误'
					};
				}

				// 检查是否有重复的身份证+时间组合
				const keySet = new Set();
				const duplicates = [];

				for (const item of data) {
					if (item.card && item.attendance_ym) {
						const key = `${item.card}_${item.attendance_ym}`;
						if (keySet.has(key)) {
							duplicates.push(item.card);
						}
						keySet.add(key);
					}
				}

				if (duplicates.length > 0) {
					return {
						valid: false,
						message: `存在重复数据: ${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '...' : ''}`
					};
				}

				return {
					valid: true,
					message: ''
				};
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
			async search() {
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
				this.form1.props.action = 'admin/hrm/salary/sys/payslip/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/salary/sys/payslip/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			// 删除按钮
			async deleteBtn({
				item,
				deleteFn
			}) {
				item.url = item.signature_url;
				await vk.myfn.deleteFile(item);
				console.log("item:", item);
				deleteFn({
					action: "admin/hrm/salary/sys/payslip/delete",
					data: {
						_id: item._id
					},
				});
			},
			// 导入xls表格文件模版
			exportExcelModel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '月份工资条（含签名）模版',
					title: "正在导出数据...",
					columns: [{
							"key": "total_salary",
							"title": "综合",
							"type": "number"
						},
						{
							"key": "rest_type",
							"title": "制",
							"type": "text",
						},
						{
							"key": "attendance_ym",
							"title": "月份",
							"type": "text"
						},
						{
							"key": "employee_name",
							"title": "姓名",
							"type": "text"
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "department_name",
							"title": "任职部门",
							"type": "text"
						},
						{
							"key": "position_name",
							"title": "岗位",
							"type": "text"
						},
						{
							"key": "hire_date",
							"title": "入职日期",
							"type": "number"
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "text"
						},
						{
							"key": "base_salary",
							"title": "基本工资",
							"type": "number"
						},
						{
							"key": "performance_salary",
							"title": "绩效工资",
							"type": "number"
						},
						{
							"key": "overtime_fee",
							"title": "固定加班",
							"type": "number"
						},
						{
							"key": "penalty_fund",
							"title": "社保补偿金",
							"type": "number"
						},
						{
							"key": "housing_fund",
							"title": "公积补偿金",
							"type": "number"
						},
						{
							"key": "annual_allowance",
							"title": "年度补偿金",
							"type": "number"
						},
						{
							"key": "floating_bonus",
							"title": "浮动奖励",
							"type": "number"
						},
						{
							"key": "confidentiality_fee",
							"title": "保密费",
							"type": "number"
						},
						{
							"key": "work_days",
							"title": "应勤天数",
							"type": "number"
						},
						{
							"key": "real_days",
							"title": "实际出勤",
							"type": "number"
						},
						{
							"key": "gross_salary",
							"title": "应发工资",
							"type": "number"
						},
						{
							"key": "overtime_cost",
							"title": "加班费",
							"type": "number"
						},
						{
							"key": "free_cost",
							"title": "放假补助",
							"type": "number"
						},
						{
							"key": "grant",
							"title": "补助",
							"type": "number"
						},
						{
							"key": "agency_fee",
							"title": "介绍费",
							"type": "text"
						},
						{
							"key": "other_cost",
							"title": "其它",
							"type": "text"
						},
						{
							"key": "we_cost",
							"title": "水电",
							"type": "number"
						},
						{
							"key": "clothes_cost",
							"title": "工衣",
							"type": "number"
						},
						{
							"key": "earlytime_cost",
							"title": "迟到早退",
							"type": "number"
						},
						{
							"key": "missed_cost",
							"title": "未打卡",
							"type": "number"
						},
						{
							"key": "loan_cost",
							"title": "借款",
							"type": "number"
						},
						{
							"key": "this_month_sb",
							"title": "本月社保",
							"type": "number"
						},
						{
							"key": "this_month_dk",
							"title": "本月代扣部份",
							"type": "number"
						},
						{
							"key": "dkgs",
							"title": "代扣个税",
							"type": "number"
						},
						{
							"key": "real_salary",
							"title": "实发工资",
							"type": "number"
						},
						// {
						// 	"key": "company_sb",
						// 	"title": "公司部份社保",
						// 	"type": "number",
						// },
						// {
						// 	"key": "company_gjj",
						// 	"title": "公司部份公积金",
						// 	"type": "number",
						// },
						// {
						// 	"key": "last_month_sb",
						// 	"title": "下月社保",
						// 	"type": "number"
						// },
						// {
						// 	"key": "last_month_gjj",
						// 	"title": "下月公积金",
						// 	"type": "number"
						// },
						{
							"key": "status",
							"title": "状态",
							"type": "text",
							formatter: function(val, row, column, index) {
								if (val == 0) return '未签名';
								if (val == 1) return '已签名';
								if (val == 2) return '其他';
							}
						},
						{
							"key": "bank_name",
							"title": "开户行",
							"type": "text"
						},
						{
							"key": "bank_location",
							"title": "开户地",
							"type": "text"
						},
						{
							"key": "bank_card",
							"title": "银行账号",
							"type": "text"
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text"
						}
					],
					pageIndex: 1,
					pageSize: 1, // 此值为-1，代表导出所有数据
				});
			},
			// 辅助获取数据
			async fetchAllData(attendance_ym) {
				const res = await vk.callFunction({
					url: 'admin/hrm/salary/sys/payslip/getList',
					data: {
						formData: this.queryForm1.formData,
						columns: this.queryForm1.columns,
						pageIndex: 1,
						pageSize: -1
					}
				});
				if (res.code === 0) {
					return res.rows || [];
				} else {
					vk.alert(res.msg || '获取数据失败');
					return [];
				}
			},
			// 导出xls表格文件（全部数据）
			async exportExcelAll() {
				// 1. 校验月份
				const attendance_ym = this.queryForm1.formData.attendance_ym;
				if (vk.pubfn.isNull(attendance_ym)) {
					return vk.alert('时间不能为空！');
				}

				uni.showLoading({
					title: '正在获取数据...'
				});

				try {
					// 2. 获取全部数据（建议后端分页，前端合并；单表超过 500 条建议改服务端导出）
					const listData = await this.fetchAllData(attendance_ym);
					if (listData.length === 0) {
						uni.hideLoading();
						return vk.alert('无数据可导出');
					}

					// 3. 引入依赖
					const ExcelJS = require('exceljs');
					const FileSaver = require('file-saver');

					// 4. 创建工作簿
					const workbook = new ExcelJS.Workbook();
					const worksheet = workbook.addWorksheet('工资条', {
						views: [{
							state: 'frozen',
							ySplit: 1
						}]
					});

					// 5. 定义列头
					const columnDefs = [{
							header: '序号',
							key: 'index',
							width: 10
						},
						{
							header: '时间',
							key: 'attendance_ym',
							width: 15
						},
						{
							header: '月份',
							key: 'attendance_ym_key',
							width: 15
						},
						{
							header: '姓名',
							key: 'employee_name',
							width: 15
						},
						{
							header: '签名',
							key: 'signature_url',
							width: 20
						},
						{
							header: '身份证号码',
							key: 'card',
							width: 25
						},
						{
							header: '任职部门',
							key: 'department_name',
							width: 20
						},
						{
							header: '手机号码',
							key: 'mobile',
							width: 20
						},
						{
							header: '岗位',
							key: 'position_name',
							width: 20
						},
						{
							header: '入职日期',
							key: 'hire_date',
							width: 15
						},
						{
							header: '离职日期',
							key: 'resign_date',
							width: 15
						},
						{
							header: '基本工资',
							key: 'base_salary',
							width: 15
						},
						{
							header: '绩效工资',
							key: 'performance_salary',
							width: 15
						},
						{
							header: '固定加班',
							key: 'overtime_fee',
							width: 15
						},
						{
							header: '社保补偿金',
							key: 'penalty_fund',
							width: 15
						},
						{
							header: '公积补偿金',
							key: 'housing_fund',
							width: 15
						},
						{
							header: '年度补偿金',
							key: 'annual_allowance',
							width: 15
						},
						{
							header: '浮动奖励',
							key: 'floating_bonus',
							width: 15
						},
						{
							header: '保密费',
							key: 'confidentiality_fee',
							width: 15
						},
						{
							header: '应勤天数',
							key: 'work_days',
							width: 15
						},
						{
							header: '实际出勤',
							key: 'real_days',
							width: 15
						},
						{
							header: '应发工资',
							key: 'gross_salary',
							width: 15
						},
						{
							header: '加班费',
							key: 'overtime_cost',
							width: 15
						},
						{
							header: '放假补助',
							key: 'free_cost',
							width: 15
						},
						{
							header: '补助',
							key: 'grant',
							width: 15
						},
						{
							header: '介绍费',
							key: 'agency_fee',
							width: 15
						},
						{
							header: '其它',
							key: 'other_cost',
							width: 15
						},
						{
							header: '水电',
							key: 'we_cost',
							width: 15
						},
						{
							header: '工衣',
							key: 'clothes_cost',
							width: 15
						},
						{
							header: '迟到早退',
							key: 'earlytime_cost',
							width: 15
						},
						{
							header: '未打卡',
							key: 'missed_cost',
							width: 15
						},
						{
							header: '借款',
							key: 'loan_cost',
							width: 15
						},
						{
							header: '本月社保',
							key: 'this_month_sb',
							width: 15
						},
						{
							header: '本月代扣部份',
							key: 'this_month_dk',
							width: 15
						},
						{
							header: '代扣个税',
							key: 'dkgs',
							width: 15
						},
						{
							header: '实发工资',
							key: 'real_salary',
							width: 15
						},
						// {
						// 	header: '公司部份社保',
						// 	key: 'company_sb',
						// 	width: 15
						// },
						// {
						// 	header: '公司部份公积金',
						// 	key: 'company_gjj',
						// 	width: 15
						// },
						// {
						// 	header: '下月社保',
						// 	key: 'last_month_sb',
						// 	width: 15
						// },
						// {
						// 	header: '下月公积金',
						// 	key: 'last_month_gjj',
						// 	width: 15
						// },
						{
							header: '状态',
							key: 'status',
							width: 15
						},
						{
							header: '开户行',
							key: 'bank_name',
							width: 15
						},
						{
							header: '开户地',
							key: 'bank_location',
							width: 15
						},
						{
							header: '银行账号',
							key: 'bank_card',
							width: 15
						},
						{
							header: '备注',
							key: 'comment',
							width: 15
						}
					];
					worksheet.columns = columnDefs;

					//状态
					const STATUS_MAP = {
						0: '未签名',
						1: '已签名',
						2: '其他'
					};

					// 6. 填充数据行（先写文本，签名列临时放 URL，后面覆盖）
					listData.forEach((item, idx) => {
						worksheet.addRow({
							index: idx + 1,
							attendance_ym: item.attendance_ym,
							attendance_ym_key: item.attendance_ym_key,
							employee_name: item.employee_name,
							signature_url: item.signature_url, // 先占位，后面清空
							card: item.card,
							department_name: item.department_name,
							mobile: item.employees?.mobile,
							position_name: item.position_name,
							hire_date: item.hire_date,
							resign_date: item.resign_date,
							base_salary: item.base_salary,
							performance_salary: item.performance_salary,
							overtime_fee: item.overtime_fee,
							penalty_fund: item.penalty_fund,
							housing_fund: item.housing_fund,
							annual_allowance: item.annual_allowance,
							floating_bonus: item.floating_bonus,
							confidentiality_fee: item.confidentiality_fee,
							work_days: item.work_days,
							real_days: item.real_days,
							gross_salary: item.gross_salary,
							overtime_cost: item.overtime_cost,
							free_cost: item.free_cost,
							grant: item.grant,
							agency_fee: item.agency_fee,
							other_cost: item.other_cost,
							we_cost: item.we_cost,
							clothes_cost: item.clothes_cost,
							earlytime_cost: item.earlytime_cost,
							missed_cost: item.missed_cost,
							loan_cost: item.loan_cost,
							this_month_sb: item.this_month_sb,
							this_month_dk: item.this_month_dk,
							dkgs: item.dkgs,
							real_salary: item.real_salary,
							company_sb: item.company_sb,
							company_gjj: item.company_gjj,
							last_month_sb: item.last_month_sb,
							last_month_gjj: item.last_month_gjj,
							status: STATUS_MAP[item.status],
							bank_name: item.bank_name,
							bank_location: item.bank_location,
							bank_card: item.bank_card,
							comment: item.comment
						});
					});

					// ========== 核心修改 1：分批获取签名 Base64（防止一次传太多被云函数拒绝） ==========
					const imageUrls = listData.map(item => item.signature_url).filter(Boolean);
					let base64Map = {};
					let failCount = 0;

					if (imageUrls.length > 0) {
						const BATCH_SIZE = 80; // 低于云函数 maxCount(100)，留有余量
						const total = imageUrls.length;
						const batches = [];
						for (let i = 0; i < total; i += BATCH_SIZE) {
							batches.push(imageUrls.slice(i, i + BATCH_SIZE));
						}

						// 串行调用云函数，避免触发云函数并发 QPS 限制
						for (let i = 0; i < batches.length; i++) {
							const current = Math.min((i + 1) * BATCH_SIZE, total);
							uni.showLoading({
								title: `下载签名 ${current}/${total}`
							});
							const res = await vk.callFunction({
								url: 'common/sys/getImagesBase64/index',
								data: {
									imageUrls: batches[i],
									concurrency: 5,
									timeout: 30000,
									retries: 1
								}
							});

							if (res.code === 0) {
								res.data.forEach(item => {
									if (item.success) {
										base64Map[item.url] = item.base64;
									} else {
										failCount++;
										console.warn('签名下载失败:', item.url, item.error);
									}
								});
							} else {
								// 整批失败
								failCount += batches[i].length;
								console.warn('整批签名下载失败:', res.msg);
							}
						}
					}

					// ========== 核心修改 2：并行嵌入图片（内存操作，Promise.all 提速） ==========
					uni.showLoading({
						title: '正在写入签名...'
					});

					const embedTasks = listData.map((item, idx) => {
						return new Promise((resolve) => {
							const url = item.signature_url;
							if (!url || !base64Map[url]) return resolve();

							try {
								const imageId = workbook.addImage({
									base64: base64Map[url],
									extension: 'png'
								});
								// 第 2 行开始（idx=0 → row=1，ExcelJS 是 0-based）
								worksheet.addImage(imageId, {
									tl: {
										col: 4.2,
										row: idx + 1
									},
									ext: {
										width: 80,
										height: 30
									}
								});
								// 清空原 URL 文本，只保留图片
								worksheet.getCell(`E${idx + 2}`).value = '';
							} catch (err) {
								failCount++;
								console.warn(`嵌入第 ${idx + 1} 行签名失败:`, err);
							}
							resolve();
						});
					});
					await Promise.all(embedTasks);

					// 9. 生成并下载文件
					uni.showLoading({
						title: '正在生成文件...'
					});
					const buffer = await workbook.xlsx.writeBuffer();
					const blob = new Blob([buffer], {
						type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					});
					FileSaver.saveAs(blob, `${attendance_ym}月份工资条（含签名）.xlsx`);

					uni.hideLoading();

					// 友好提示
					if (failCount > 0) {
						vk.alert(`导出完成，${failCount} 张签名未能嵌入，请检查网络或重新导出`);
					} else {
						vk.alert('导出成功！');
					}

				} catch (err) {
					console.error('导出失败:', err);
					uni.hideLoading();
					vk.alert(err.message || '导出失败，请重试');
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