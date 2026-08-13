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
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-export')" @click="exportExcelAll"> 导出全部
				</el-button>
				<!-- 批量操作 -->
				<el-dropdown v-if="table1.multipleSelection && ($hasRole('admin') || $hasPermission('hrm-salary-edit'))"
					:split-button="false" trigger="click" @command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0">
						批量审核<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">通过</el-dropdown-item>
						<el-dropdown-item :command="2">未通过</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
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
	import myfn from '../../../common/function/myPubFunction';

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
				fileList: [],
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/salary/sys/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-salary-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-salary-edit')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-salary-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "date",
							"dateType": "date",
							"fixed": true,
							"valueFormat": "yyyy-MM",
							"format": "yyyy-MM"
						}, {
							"key": "total_salary",
							"title": "综合",
							"type": "number",
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
							"width": colWidth - 100
						},
						{
							"key": "overtime_cost",
							"title": "加班费",
							"type": "text",
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
							"width": colWidth - 100
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
							"width": colWidth - 100
						},
						{
							"key": "this_month_dk",
							"title": "本月代扣部份",
							"type": "number",
							"width": colWidth - 100
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
							"width": colWidth - 100
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text",
							"width": colWidth,
							"show": ["detail"]
						},
						{
							"key": "company_sb",
							"title": "公司部份社保",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "company_gjj",
							"title": "公司部份公积金",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "last_month_sb",
							"title": "下月社保",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "last_month_gjj",
							"title": "下月公积金",
							"type": "number",
							"width": colWidth - 100
						},
						{
							key: "enable_fd1",
							title: "财务审核一级",
							type: "switch",
							activeValue: true,
							inactiveValue: false,
							width: colWidth - 50,
							watch: (res) => {
								let {
									value,
									row,
									change
								} = res;
								vk.callFunction({
									url: "admin/hrm/salary/sys/update",
									title: value ? "通过中..." : "未通过中...",
									data: {
										_id: row._id,
										attendance_ym_key: row.attendance_ym_key,
										card: row.card,
										enable_fd1: value
									},
									success: data => {
										this.refresh();
									}
								});
							}
						},
						{
							key: "enable_fd2",
							title: "财务审核二级",
							type: "switch",
							activeValue: true,
							inactiveValue: false,
							width: colWidth - 50,
							watch: (res) => {
								let {
									value,
									row,
									change
								} = res;
								vk.callFunction({
									url: "admin/hrm/salary/sys/update",
									title: value ? "通过中..." : "未通过中...",
									data: {
										_id: row._id,
										attendance_ym_key: row.attendance_ym_key,
										card: row.card,
										enable_fd2: value
									},
									success: data => {
										this.refresh();
									}
								});
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
						attendance_ym: nowym,
						enable_fd1: true,
						enable_fd2: false
					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
							key: "attendance_ym",
							title: "考勤日期",
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
							action: "admin/hrm/salary/sys/getList",
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
							"key": "enable_fd1",
							"title": "财务审核一级",
							"type": "select",
							"show": ["none"],
							"data": [{
								"value": true,
								"label": "已通过"
							}, {
								"value": false,
								"label": "未通过"
							}],
							"mode": "="
						},
						{
							"key": "enable_fd2",
							"title": "财务审核二级",
							"type": "select",
							"show": ["none"],
							"data": [{
								"value": true,
								"label": "已通过"
							}, {
								"value": false,
								"label": "未通过"
							}],
							"mode": "="
						},
						//{"key":"total_salary","title":"综合工资","type":"number","width":colWidth,"mode":"="},
						//{"key":"rest_type","title":"休息类型","type":"number","width":colWidth,"data":[{"value":1,"label":"单休"},{"value":2,"label":"双休"},{"value":3,"label":"大小周"}],"mode":"="},
						//{"key":"base_salary","title":"基本工资","type":"number","width":colWidth,"mode":"="},
						//{"key":"performance_salary","title":"绩效工资","type":"number","width":colWidth,"mode":"="},
						//{"key":"overtime_fee","title":"固定加班","type":"number","width":colWidth,"mode":"="},
						//{"key":"housing_fund","title":"公积补偿金","type":"number","width":colWidth,"mode":"="},
						//{"key":"annual_allowance","title":"年度补偿金","type":"number","width":colWidth,"mode":"="},
						//{"key":"floating_bonus","title":"浮动奖励","type":"number","width":colWidth,"mode":"="},
						//{"key":"confidentiality_fee","title":"保密费","type":"number","width":colWidth,"mode":"="},
						//{"key":"work_days","title":"应勤天数","type":"number","width":colWidth,"mode":"="},
						//{"key":"real_days","title":"实际出勤","type":"number","width":colWidth,"mode":"="},
						//{"key":"gross_salary","title":"应发工资","type":"number","width":colWidth,"mode":"="},
						//{"key":"overtime_cost","title":"加班费","type":"text","width":colWidth,"mode":"="},
						//{"key":"free_cost","title":"放假补助","type":"number","width":colWidth,"mode":"="},
						//{"key":"grant","title":"补助金","type":"number","width":colWidth,"mode":"="},
						//{"key":"agency_fee","title":"介绍费","type":"text","width":colWidth,"mode":"="},
						//{"key":"other_cost","title":"其它费用","type":"text","width":colWidth,"mode":"="},
						//{"key":"we_cost","title":"水电费","type":"number","width":colWidth,"mode":"="},
						//{"key":"clothes_cost","title":"工衣费用","type":"number","width":colWidth,"mode":"="},
						//{"key":"earlytime_cost","title":"迟/早退费","type":"number","width":colWidth,"mode":"="},
						//{"key":"missed_cost","title":"未打卡费","type":"number","width":colWidth,"mode":"="},
						//{"key":"loan_cost","title":"借款","type":"number","width":colWidth,"mode":"="},
						//{"key":"last_month_sb","title":"上月社保","type":"number","width":colWidth,"mode":"="},
						//{"key":"last_month_dk","title":"上月社保代扣部份","type":"number","width":colWidth,"mode":"="},
						//{"key":"this_month_sb","title":"本月社保","type":"number","width":colWidth,"mode":"="},
						//{"key":"this_month_dk","title":"本月社保代扣部份","type":"number","width":colWidth,"mode":"="},
						//{"key":"dkgs","title":"代扣个税","type":"number","width":colWidth,"mode":"="},
						//{"key":"real_salary","title":"实发工资","type":"number","width":colWidth,"mode":"="},
						//{"key":"company_sb","title":"公司部份社保","type":"number","width":colWidth,"mode":"="},
						//{"key":"comment","title":"备注","type":"text","width":colWidth,"mode":"="},						
						//{"key":"update_date","title":"更新时间","type":"datetimerange","width":colWidth,"mode":"="},
						//{"key":"update_id","title":"更新人","type":"text","width":colWidth,"mode":"="}
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {},
					// 表单属性
					props: {
						beforeAction: (formData) => {
							// 可在此处修改 formData 后返回 formData，若在此处return false，则表单不触发提交请求。
							formData = this.calculateSalary(formData);
							return formData;
						},
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								key: "attendance_ym",
								title: "考勤日期",
								type: "date",
								dateType: "date",
								disabled: true,
								valueFormat: "yyyy-MM",
								format: "yyyy-MM",
								"width": colWidth

							}, {
								key: "card",
								title: "姓名",
								type: "table-select",
								disabled: true,
								placeholder: "选择员工",
								action: "admin/hrm/salary/sys/getList",
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
								"key": "total_salary",
								"title": "综合",
								"type": "number",
								disabled: true,
								"width": colWidth
							},
							// {
							// 	"key": "rest_type",
							// 	"title": "休息类型",
							// 	"type": "text",
							// 	disabled: true,
							// 	"width": colWidth
							// },
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
							{
								"key": "company_sb",
								"title": "公司部份社保",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "company_gjj",
								"title": "公司部份公积金",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "last_month_sb",
								"title": "下月社保",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "last_month_gjj",
								"title": "下月公积金",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "enable_fd1",
								"title": "财务审核一级",
								"type": "switch",
								"width": colWidth
							}, {
								"key": "enable_fd1",
								"title": "财务审核一级",
								"type": "switch",
								"width": colWidth
							}, {
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
						"type": "text"
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
					comment: {
						"title": "备注",
						"type": "text"
					},
					company_sb: {
						"title": "公司部份社保",
						"type": "number",
					},
					company_gjj: {
						"title": "公司部份公积金",
						"type": "number",
					},
					last_month_sb: {
						"title": "下月社保",
						"type": "number"
					},
					last_month_dk: {
						"title": "下月公积金",
						"type": "number"
					}
				};

				try {
					if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
						return vk.alert(`考勤日期不能为空！`);
					}

					const attendance_ym = this.queryForm1.formData.attendance_ym;

					this.$iexcel.importExcel(file.raw, typeObj, async (res) => {
						if (!res || res.length === 0) {
							return vk.alert('Excel中没有数据！');
						}

						// 删除旧数据
						let delRes = await vk.callFunction({
							url: 'admin/hrm/salary/sys/all/deleteAll',
							title: '删除中...',
							data: {
								attendance_ym: attendance_ym
							}
						})

						if (delRes.code != 0) {
							return vk.alert(`${attendance_ym}月工资表明细删除失败！`);
						}

						// 1. 数据验证
						const validationResult = this.validateExcelData(res);
						if (!validationResult.valid) {
							return vk.alert(validationResult.message, "数据验证失败", "确定");
						}

						// 2. 提取所有身份证号码
						const cards = res.map(item => item.card).filter(card => card);
						if (cards.length === 0) {
							return vk.alert('Excel中没有有效的身份证号码！');
						}

						// 3. 准备要处理的数据
						const validData = [];
						const errorData = [];

						for (const item of res) {

							item.attendance_ym = attendance_ym

							// 验证必要字段
							if (!item.attendance_ym) {
								errorData.push({
									item,
									reason: '考勤日期不能为空'
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

							// 重新计算应发工资和实发工资是否正确
							item.gross_salary = item.gross_salary || 0;
							item.real_salary = item.real_salary || 0;
							let newItem = vk.pubfn.copyObject(item);
							newItem = this.calculateSalary(newItem);

							// 财务审核状态
							item.enable_fd1 = false;
							item.enable_fd2 = false;

							console.log("item:", item);
							console.log("newItem:", newItem);

							if (newItem.gross_salary !== item.gross_salary || newItem.real_salary !== item
								.real_salary) {
								errorData.push({
									item,
									reason: `应发工资:${newItem.gross_salary}=${item.gross_salary},实发工资:${newItem.real_salary}=${item.real_salary}`
								});
								// continue;
							}
							//处理月份
							item.attendance_ym_key = vk.myfn.toFormatDate(item.attendance_ym_key);

							//修改新增人员和时间									
							item.update_date = new Date().getTime();
							item.update_id = vk.getVuex('$user.userInfo._id');

							let utcDate = new Date(Date.UTC(1900, 0, item.hire_date - 1));
							item.hire_date = utcDate.toISOString().slice(0, 10);

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
										url: 'admin/hrm/salary/sys/all/addAll',
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
								} else {
									return;
								}
							});
						}
						// 6. 批量处理数据
						vk.toast('开始导入数据...');
						const result = await vk.callFunction({
							url: 'admin/hrm/salary/sys/all/addAll',
							title: '请求中...',
							data: {
								items: validData
							},
						});

						if (result.code === 0) {
							let resultMessage = `导入完成！成功: ${result.id.length}条`;
							vk.alert(resultMessage, "导入成功", "确定", () => {
								this.refresh();
							})
						} else {
							vk.alert(`导入Excel失败!`, "系统错误", "确定");
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

				// 检查是否有重复的身份证+考勤日期组合
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

			//自动生成薪资表
			async autoSalary() {
				try {

					if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
						return vk.alert(`考勤日期不能为空！`);
					}

					const attendance_ym = this.queryForm1.formData.attendance_ym;

					vk.confirm(`确定将删除${attendance_ym}月全部数据，重新生成工资表！`, '提示', '确定', '取消', async (res) => {
						if (res.confirm) {
							vk.toast('开始生成工资表...');

							// 1. 获取考勤审核数据
							let resAprove = await vk.callFunction({
								url: 'admin/hrm/salary/pub/getAproveList',
								title: '请求中...',
								data: {
									attendance_ym: attendance_ym,
									enable_hr: true
								},
							});

							if (resAprove.total == 0) {
								return vk.alert(`没有${attendance_ym}月考勤数据，请联系人事考勤！`);
							}

							// 2. 删除旧数据
							let delRes = await vk.callFunction({
								url: 'admin/hrm/salary/sys/all/deleteAll',
								title: '删除中...',
								data: {
									attendance_ym: attendance_ym
								}
							})

							if (delRes.code != 0) {
								return vk.alert(`${attendance_ym}月工资表明细删除失败！`);
							}

							// 3. 提取所有员工信息，用于批量查询
							const cards = resAprove.rows.map(item => item.card);
							const attendanceYmKeys = [...new Set(resAprove.rows.map(item => item
								.attendance_ym_key))];
							const totalSalaries = [...new Set(resAprove.rows.map(item => item.salarys
								?.salary).filter(salary => salary != null))];

							// 批量获取各种数据
							vk.toast('批量获取相关数据...');
							const [
								salaryRulesMap,
								freeMap,
								gsMap,
								sbMap,
								companySbMap
							] = await Promise.all([
								//薪资分配规则
								this.batchGetSalaryRules(totalSalaries),
								this.batchGetFreeData(cards, attendanceYmKeys),
								this.batchGetGsData(cards, attendanceYmKeys),
								this.batchGetSbData(cards, attendanceYmKeys),
								this.batchGetCompanySbData(cards, attendanceYmKeys)
							]);

							// 4. 处理每个员工的数据
							const processedRows = [];
							const errors = [];

							for (let item of resAprove.rows) {
								try {
									// 验证定薪数据
									if (vk.pubfn.isNull(item.salarys) || vk.pubfn.isNull(item.salarys
											.salary)) {
										errors.push(
											`员工姓名：${item.employee_name}/${item.card}, 没有定薪数据！`
										);
										continue;
									}

									// 获取薪资分配规则
									const salaryRule = salaryRulesMap.get(item.salarys.salary);
									if (!salaryRule && item.salarys.salary_type === '1') {
										errors.push(
											`综合：${item.salarys.salary}, 基本资料：${item.employee_name}/${item.card}, 没有薪资分配表数据！`
										);
										continue;
									}

									// 处理薪资分配规则
									if (item.salarys.salary_type === '1' && salaryRule) {
										// 月薪类型，调整绩效工资
										if (item.salarys.salary !== salaryRule.total_salary) {
											salaryRule.performance_salary -= (salaryRule.total_salary -
												item.salarys.salary);
										}
										item.bases = salaryRule;
									}

									// 获取其他数据
									const key = `${item.card}_${item.attendance_ym_key}`;
									item.frees = freeMap.get(key) || {};
									item.gss = gsMap.get(key) || {};
									item.sbs = sbMap.get(key) || {};
									item.companysbs = companySbMap.get(key) || {};

									// 财务审核状态
									item.enable_fd1 = false;
									item.enable_fd2 = false;

									//修改新增人员和时间									
									item.update_date = new Date().getTime();
									item.update_id = vk.getVuex('$user.userInfo._id');

									// 设置工资相关字段
									item = this.setSalaryFields(item);

									// 计算工资
									item = this.calculateSalary(item);

									processedRows.push(item);

								} catch (error) {
									errors.push(
										`处理员工 ${item.employee_name || item.card} 失败: ${error.message}`
									);
								}
							}

							// 5. 如果有错误，先显示错误
							if (errors.length > 0) {
								const errorMsg = errors.slice(0, 5).join('\n');
								const moreErrors = errors.length > 5 ? `\n...还有${errors.length - 5}条错误` :
									'';

								vk.confirm(
									`发现${errors.length}个错误：\n${errorMsg}${moreErrors}\n\n是否继续处理有效数据？`,
									'处理警告',
									'继续',
									'取消',
									async (confirmRes) => {
										if (confirmRes.confirm) {
											await this.saveSalaryData(processedRows);
										}
									}
								);
							} else {
								await this.saveSalaryData(processedRows);
							}
						}
					});
				} catch (error) {
					console.error('处理过程中发生错误:', error);
					vk.alert(`处理过程中发生错误: ${error.message}`, "系统错误", "确定");
				}
			},

			// 批量获取薪资分配规则
			async batchGetSalaryRules(totalSalaries) {
				const salaryRulesMap = new Map();
				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/salary/pub/getBaseSalary',
						title: '获取薪资规则中...',
						data: {
							total_salaries: totalSalaries,
							match_type: 'range' // 使用区间匹配
						},
					});

					if (res.code === 0 && res.data) {
						// 转换为Map以便快速查找
						Object.entries(res.data).forEach(([salary, rule]) => {
							salaryRulesMap.set(Number(salary), rule);
						});
					}
				} catch (error) {
					console.error('批量获取薪资规则失败:', error);
				}
				return salaryRulesMap;
			},

			// 批量获取放假补助
			async batchGetFreeData(cards, attendanceYmKeys) {
				const freeMap = new Map();

				try {
					// 使用之前创建的批量查询接口
					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/getfreeAll',
						title: '获取放假补助中...',
						data: {
							cards: cards,
							attendance_ym_keys: attendanceYmKeys
						},
					});

					if (res.code === 0 && res.rows) {
						res.rows.forEach(item => {
							const key = `${item.card}_${item.attendance_ym}`;
							freeMap.set(key, item);
						});
					}

				} catch (error) {
					console.error('批量获取放假补助失败:', error);
				}

				return freeMap;
			},

			// 批量获取代扣个税
			async batchGetGsData(cards, attendanceYmKeys) {
				const gsMap = new Map();

				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/getgsAll',
						title: '获取个税数据中...',
						data: {
							cards: cards,
							attendance_ym_keys: attendanceYmKeys
						},
					});

					if (res.code === 0 && res.rows) {
						res.rows.forEach(item => {
							const key = `${item.card}_${item.attendance_ym}`;
							gsMap.set(key, item);
						});
					}

				} catch (error) {
					console.error('批量获取个税数据失败:', error);
				}
				return gsMap;
			},

			// 批量获取个人社保
			async batchGetSbData(cards, attendanceYmKeys) {
				const sbMap = new Map();

				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/getsbdkAll',
						title: '获取个人社保中...',
						data: {
							cards: cards,
							attendance_ym_keys: attendanceYmKeys
						},
					});

					if (res.code === 0 && res.rows) {
						res.rows.forEach(item => {
							const key = `${item.card}_${item.attendance_ym}`;
							sbMap.set(key, item);
						});
					}

				} catch (error) {
					console.error('批量获取个人社保失败:', error);
				}

				return sbMap;
			},

			// 批量获取公司社保
			async batchGetCompanySbData(cards, attendanceYmKeys) {
				const companySbMap = new Map();

				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/getcomsbAll',
						title: '获取公司社保中...',
						data: {
							cards: cards,
							attendance_ym_keys: attendanceYmKeys
						},
					});

					if (res.code === 0 && res.rows) {
						res.rows.forEach(item => {
							const key = `${item.card}_${item.attendance_ym}`;
							companySbMap.set(key, item);
						});
					}

				} catch (error) {
					console.error('批量获取公司社保失败:', error);
				}

				return companySbMap;
			},

			// 设置工资相关字段
			setSalaryFields(item) {
				// 综合工资
				item.total_salary = item.salarys ? item.salarys.salary : 0;
				// 休息类型
				item.rest_type = item.rest_type || '';
				// 工资类型
				item.salary_type = item.salarys ? item.salarys.salary_type : '';
				// 基本工资
				item.base_salary = item.bases ? item.bases.base_salary : 0;
				// 绩效工资
				item.performance_salary = item.bases ? item.bases.performance_salary : 0;
				// 固定加班
				item.overtime_fee = item.bases ? item.bases.overtime_fee : 0;
				// 社保补偿金
				item.penalty_fund = item.bases ? item.bases.penalty_fund : 0;
				// 公积补偿金
				item.housing_fund = item.bases ? item.bases.housing_fund : 0;
				// 年度补偿金
				item.annual_allowance = item.bases ? item.bases.annual_allowance : 0;
				// 浮动奖励
				item.floating_bonus = item.bases ? item.bases.floating_bonus : 0;
				// 保密费
				item.confidentiality_fee = item.bases ? item.bases.confidentiality_fee : 0;

				// 放假补助
				item.free_cost = item.frees ? item.frees.amount : 0;
				// 介绍费
				item.agency_fee = item.agency_fee || 0;

				// 其它费用(包括奖励和惩罚)
				let reward_cost = item.reward_cost || 0;
				let punish_cost = item.punish_cost || 0;
				let other_cost = item.other_cost || 0;
				item.other_cost = reward_cost + other_cost - punish_cost;

				// 水电费
				item.we_cost = item.share_cost || 0;
				// 工衣费用
				item.clothes_cost = item.clothes_cost || 0;

				// 上月社保
				item.last_month_sb = item.sbs ? item.sbs.last_month_sb : 0;
				// 上月社保代扣部份
				item.last_month_dk = item.sbs ? item.sbs.last_month_dk : 0;
				// 本月社保
				item.this_month_sb = item.sbs ? item.sbs.this_month_sb : 0;
				// 本月社保代扣部份
				item.this_month_dk = item.sbs ? item.sbs.this_month_dk : 0;
				// 代扣个税
				item.dkgs = item.gss ? item.gss.gs : 0;
				// 公司社保和公积金
				item.company_sb = item.companysbs ? item.companysbs.amount : 0;
				item.company_gjj = item.companysbs ? item.companysbs.provident_fund : 0;

				return item;
			},

			// 计算工资
			calculateSalary(item) {
				// 根据定薪表来判断是 1:月、2:日、3:时薪，计算工资
				// 基本工资、应勤天数、实际出勤				
				if ((item.salarys ? item.salarys.salary_type : item.salary_type) !== '1') {
					if (vk.pubfn.isNotNull(item.salary_type)) {
						item.base_salary = item.total_salary;
						item.work_days = 1;
					}
				}
				// 工资总和=								
				let total = 0;
				// 基本工资+
				total += vk.pubfn.string2Number(item.base_salary || 0);
				// 绩效工资+
				total += vk.pubfn.string2Number(item.performance_salary || 0);
				// 固定加班+
				total += vk.pubfn.string2Number(item.overtime_fee || 0);
				// 社保补偿金+
				total += vk.pubfn.string2Number(item.penalty_fund || 0);
				// 公积补偿金+
				total += vk.pubfn.string2Number(item.housing_fund || 0);
				// 年度补偿金+
				total += vk.pubfn.string2Number(item.annual_allowance || 0);
				// 浮动奖励+
				total += vk.pubfn.string2Number(item.floating_bonus || 0);
				// 保密费
				total += vk.pubfn.string2Number(item.confidentiality_fee || 0);

				// 计算应发工资=工资总和/应勤天数*实际出勤
				let grossSalary = total / item.work_days * item.real_days;
				item.gross_salary = vk.pubfn.toDecimal(grossSalary, 2);

				// 计算实发工资
				let realSalary = 0;
				// 实发工资				
				realSalary += vk.pubfn.string2Number(item.gross_salary || 0);

				// 加项
				// 加班费
				realSalary += vk.pubfn.string2Number(item.overtime_cost || 0);
				// 放假补助
				realSalary += vk.pubfn.string2Number(item.free_cost || 0);
				// 补助
				realSalary += vk.pubfn.string2Number(item.grant || 0);
				// 介绍费
				realSalary += vk.pubfn.string2Number(item.agency_fee || 0);
				// 其它
				realSalary += vk.pubfn.string2Number(item.other_cost || 0);

				// 减项
				// 水电
				realSalary -= vk.pubfn.string2Number(item.we_cost || 0);
				// 工衣
				realSalary -= vk.pubfn.string2Number(item.clothes_cost || 0);
				// 迟到早退
				realSalary -= vk.pubfn.string2Number(item.earlytime_cost || 0);
				// 未打卡
				realSalary -= vk.pubfn.string2Number(item.missed_cost || 0);
				// 借款
				realSalary -= vk.pubfn.string2Number(item.loan_cost || 0);
				// 本月社保 				
				realSalary -= vk.pubfn.string2Number(item.this_month_sb || 0);
				// 本月代扣部份
				realSalary -= vk.pubfn.string2Number(item.this_month_dk || 0);

				// 代扣个税
				realSalary -= vk.pubfn.string2Number(item.dkgs || 0);

				// 实发工资
				item.real_salary = vk.pubfn.toDecimal(realSalary, 2);
				console.log("item:", item);

				return item;
			},

			// 保存工资数据
			async saveSalaryData(processedRows) {
				if (processedRows.length === 0) {
					return vk.alert('没有有效数据需要保存！');
				}

				try {
					vk.toast('保存工资表中...');

					const result = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/addAll',
						title: '请求中...',
						data: {
							items: processedRows
						},
					});

					if (result.code === 0) {
						let resultMessage = `新增工资表完成！成功: ${result.id?.length || processedRows.length}条`;
						vk.alert(resultMessage, "新增成功", "确定", () => {
							this.refresh();
						});
					} else {
						vk.alert(`新增失败: ${result.msg || '未知错误'}`, "系统错误", "确定");
					}

				} catch (error) {
					console.error('保存工资表失败:', error);
					vk.alert(`保存工资表失败: ${error.message}`, "系统错误", "确定");
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
				this.form1.props.action = 'admin/hrm/salary/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/salary/sys/update';
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
					action: "admin/hrm/salary/sys/delete",
					data: {
						_id: item._id
					},
				});
			},
			async batchApprove(enable_fd1,enable_fd2) {
				try {
					let res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/updateAll',
						title: '请求中...',
						data: {
							items: this.table1.multipleSelection,
							enable_fd1,
							enable_fd2
						}
					})
					vk.alert('批量审核成功', '确定', () => {
						this.refresh();
					});
				} catch (error) {
					vk.alert('操作异常：' + error.message);
				} finally {
					uni.hideLoading();
				}
			},
			// 监听 - 批量操作的按钮点击事件
			batchBtn(index) {
				switch (index) {
					case 1:
						this.batchApprove(true,true);
						break;
					case 2:
						this.batchApprove(false,false);
						break;
					default:
						break;
				}
			},
			// 导入xls表格文件模版
			exportExcelModel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '考勤明细模版',
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
							"type": "text"
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
						// {
						// 	"key": "last_month_dk",
						// 	"title": "代扣部份",
						// 	"type": "number"
						// },						
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
						{
							"key": "comment",
							"title": "备注",
							"type": "text"
						},
						{
							"key": "company_sb",
							"title": "公司部份社保",
							"type": "number",
						},
						{
							"key": "company_gjj",
							"title": "公司部份公积金",
							"type": "number",
						},
						{
							"key": "last_month_sb",
							"title": "下月社保",
							"type": "number"
						},
						{
							"key": "last_month_gjj",
							"title": "下月公积金",
							"type": "number"
						}
					],
					pageIndex: 1,
					pageSize: 1, // 此值为-1，代表导出所有数据
				});
			},
			// 导出xls表格文件（全部数据）
			exportExcelAll() {
				if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
					return vk.alert(`考勤日期不能为空！`);
				}
				const attendance_ym = this.queryForm1.formData.attendance_ym;
				this.$refs.table1.exportExcel({
					fileName: attendance_ym + '月份工资表',
					title: "正在导出数据...",
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "date",
							"dateType": "date",
							"fixed": true,
							"valueFormat": "yyyy-MM",
							"format": "yyyy-MM"
						}, {
							"key": "total_salary",
							"title": "综合",
							"type": "number"
						},
						// {
						// 	"key": "rest_type",
						// 	"title": "制",
						// 	"type": "text",
						// },
						{
							"key": "attendance_ym_key",
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
							"type": "text"
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
						// {
						// 	"key": "last_month_dk",
						// 	"title": "代扣部份",
						// 	"type": "number"
						// },						
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
						{
							"key": "comment",
							"title": "备注",
							"type": "text"
						},
						{
							"key": "company_sb",
							"title": "公司部份社保",
							"type": "number",
						},
						{
							"key": "company_gjj",
							"title": "公司部份公积金",
							"type": "number",
						},
						{
							"key": "last_month_sb",
							"title": "下月社保",
							"type": "number"
						},
						{
							"key": "last_month_gjj",
							"title": "下月公积金",
							"type": "number"
						},
						{
							key: "enable_fd1",
							title: "财务审核一级",
							type: "text",
							formatter: function(val, row, column, index) {
								return val ? '通过' : '未通过';
							}
						},
						{
							key: "enable_fd2",
							title: "财务审核二级",
							type: "text",
							formatter: function(val, row, column, index) {
								return val ? '通过' : '未通过';
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