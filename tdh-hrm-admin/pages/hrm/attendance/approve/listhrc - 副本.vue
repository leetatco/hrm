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
				<!-- <el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin')" @click="addBtn">添加</el-button>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin')" @click="autoBtn">自动生成月考勤表</el-button> -->
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-export')" @click="exportExcelAll"> 导出全部
				</el-button>
				<!-- 批量操作 -->
				<el-dropdown v-if="table1.multipleSelection && $hasRole('admin')" :split-button="false" trigger="click"
					@command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0">
						批量审核<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="2">未通过</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :data-preprocess="table1.dataPreprocess" :selection="true" :row-no="false"
			:pagination="true" @update="updateBtn" @delete="deleteBtn" @current-change="currentChange"
			@selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="700px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="100px"
				@success="form1.props.show = false;refresh();" :inline="true" :columnsNumber="2">
				<template v-slot:share_cost="{form}">
					<view>
						<text>{{form.share_cost}}</text>
					</view>
				</template>
				<template v-slot:clothes_cost="{form}">
					<view>
						<text>{{form.clothes_cost}}</text>
					</view>
				</template>
				<template v-slot:reward_cost="{form}">
					<view>
						<text>{{form.reward_cost}}</text>
					</view>
				</template>
				<template v-slot:punish_cost="{form}">
					<view>
						<text>{{form.punish_cost}}</text>
					</view>
				</template>
				<template v-slot:grant="{form}">
					<view>
						<text>{{form.grant}}</text>
					</view>
				</template>
				<template v-slot:agency_fee="{form}">
					<view>
						<text>{{form.agency_fee}}</text>
					</view>
				</template>
				<template v-slot:other_cost="{form}">
					<view>
						<text>{{form.other_cost}}</text>
					</view>
				</template>
			</vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
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
				nowym: '',
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: `admin/hrm/attendance/sys/approve/getList`,
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-attendance-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin')
							}
						}
					],
					dataPreprocess: (list) => {
						return list;

					},
					// 表格字段显示规则
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM",
							"format": "yyyy-MM",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "employee_id",
							"title": "员工工号",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "employees.employee_name",
							"title": "员工姓名",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "employees.card",
							"title": "身份证号码",
							"type": "text",
							"fixed": true,
							"width": colWidth - 30
						},
						{
							"key": "employees.departments.department_name",
							"title": "部门",
							"type": "text",
							"fixed": true,
							"width": colWidth,
							formatter: function(val, row, column, index) {
								if (vk.pubfn.isNotNull(row.resign_month)) {
									if (nowm !== row.resign_month) {
										return row.resign_month + val;
									}
								}
								return val;
							}
						},
						{
							"key": "employees.positions.position_name",
							"title": "职位",
							"type": "text",
							"width": colWidth - 100
						},
						{
							key: "employees.hire_date",
							title: "入职日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM-dd",
							format: "yyyy-MM-dd",
							width: colWidth - 100
						},
						{
							"key": "resign_month",
							"title": "离职日期",
							"type": "number",
							"width": colWidth - 100,
							formatter: function(val, row, column, index) {
								return val ? val + '月离职工资' : '';
							}
						},
						{
							"key": "work_days",
							"title": "全勤天数",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "real_days",
							"title": "实际天数",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "overtime_hours",
							"title": "加班小时",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "overtime_cost",
							"title": "加班费",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "earlytime_hours",
							"title": "迟/早退(分)",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "earlytime_cost",
							"title": "迟到费",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "missed_count",
							"title": "未打卡(次)",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "missed_cost",
							"title": "未打卡费",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "share_cost",
							"title": "水电费用",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "clothes_cost",
							"title": "工衣费用",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "reward_cost",
							"title": "奖励",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "punish_cost",
							"title": "惩罚",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "grant",
							"title": "补助金",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "agency_fee",
							"title": "介绍费",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "other_cost",
							"title": "其它费用",
							"type": "number",
							"width": colWidth - 100
						},
						{
							key: "enable_hr",
							title: "考勤审核",
							type: "switch",
							width: colWidth - 50
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text",
							"show": ["detail"],
							"width": colWidth + 100
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"type": "time",
							"width": colWidth,
							"show": ["detail"]
						},
						{
							"key": "users.username",
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
						enable_hr: true
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
							"key": "enable_hr",
							"title": "考勤审核",
							"type": "select",
							"width": colWidth,
							"hidden": true,
							"data": [{
								"value": true,
								"label": "已通过"
							}, {
								"value": false,
								"label": "未通过"
							}],
							"mode": "="
						}, {
							key: "employee_id",
							title: "",
							type: "table-select",
							placeholder: "选择员工",
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
								{
									key: "card",
									title: "身份证号码",
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
									key: "card",
									title: "身份证号码",
									type: "text",
									width: 150,
									mode: "%%"
								}

							]
						},
						//{"key":"real_days","title":"实际天数","type":"number","width":200,"mode":"="},
						//{"key":"overtime_hours","title":"加班小时","type":"text","width":200,"mode":"="},
						//{"key":"earlytime_hours","title":"迟/早退(分)","type":"number","width":200,"mode":"="},
						//{"key":"missed_count","title":"未打卡(次)","type":"number","width":200,"mode":"="},						
						//{"key":"comment","title":"备注","type":"text","width":200,"mode":"="},
						//{"key":"update_date","title":"更新时间","type":"datetimerange","width":200,"mode":"="},
						//{"key":"update_id","title":"更新人","type":"text","width":200,"mode":"="}
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						enable_hr: false,
						enable_fd: false
					},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								key: "attendance_ym",
								title: "考勤日期",
								type: "date",
								dateType: "date",
								valueFormat: "yyyy-MM",
								format: "yyyy-MM",
								"width": colWidth

							}, {
								key: "employee_id",
								title: "",
								type: "table-select",
								placeholder: "选择员工",
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
									{
										key: "card",
										title: "身份证号码",
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
										key: "card",
										title: "身份证号码",
										type: "text",
										width: 150,
										mode: "%%"
									}

								]
							},
							{
								key: "resign_month",
								title: "离职日期",
								type: "number",
								disabled: true,
								width: colWidth
							},
							{
								"key": "work_days",
								"title": "全勤天数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "real_days",
								"title": "实际天数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "overtime_hours",
								"title": "加班小时",
								"type": "number",
								"precision": 1,
								"width": colWidth
							},
							{
								"key": "overtime_cost",
								"title": "加班费",
								"type": "number",
								"disabled": true,
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "earlytime_hours",
								"title": "迟/早退(分)",
								"type": "number",
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "earlytime_cost",
								"title": "迟到费",
								"disabled": true,
								"type": "number",
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "missed_count",
								"title": "未打卡(次)",
								"type": "number",
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "missed_cost",
								"title": "未打卡费",
								"type": "number",
								"disabled": true,
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "share_cost",
								"title": "水电费用",
								"type": "number",
								"disabled": true,
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "clothes_cost",
								"title": "工衣费用",
								"type": "number",
								"disabled": true,
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "reward_cost",
								"title": "奖励",
								"type": "number",
								"disabled": true,
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "punish_cost",
								"title": "惩罚",
								"type": "number",
								"disabled": true,
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "grant",
								"title": "补助金",
								"type": "number",
								"disabled": true,
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "agency_fee",
								"title": "介绍费",
								"type": "number",
								"disabled": true,
								"precision": 0,
								"width": colWidth - 100
							},
							{
								"key": "other_cost",
								"title": "其它费用",
								"type": "number",
								"disabled": true,
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "enable_hr",
								"title": "考勤审核",
								"type": "switch",
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
									minRows: 2,
									maxRows: 10
								}
							}
						],
						// 表单验证规则
						rules: {
							attendance_ym: [{
								required: true,
								message: "该项不能为空",
								trigger: ['change']
							}],
							employee_id: [{
								required: true,
								message: "该项不能为空",
								// validator: async (rule, value, callback) => {
								// 	this.computCost();
								// },
								trigger: ['change']
							}],
							work_days: [{
								required: true,
								message: "该项不能为空",
								trigger: ['change']
							}],
							real_days: [{
								required: true,
								message: "该项不能为空",
								trigger: ['change']
							}],
							overtime_hours: [{
								validator: async (rule, value, callback) => {
									if (value > 0)
										this.computCost();
								},
								trigger: ['change']
							}],
							earlytime_hours: [{
								validator: async (rule, value, callback) => {
									if (value > 0)
										this.computCost();
								},
								trigger: ['change']
							}],
							missed_count: [{
								validator: async (rule, value, callback) => {
									if (value > 0)
										this.computCost();
								},
								trigger: ['change']
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
			// 导出xls表格文件（全部数据）
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: nowym + '员工考勤信息',
					title: "正在导出数据...",
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM",
							"format": "yyyy-MM"
						},
						{
							"key": "employee_id",
							"title": "员工工号",
							"type": "text"
						},
						{
							"key": "employees.employee_name",
							"title": "员工姓名",
							"type": "text"
						},
						{
							"key": "employees.card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "employees.departments.department_name",
							"title": "部门",
							"type": "text",
							formatter: function(val, row, column, index) {
								if (vk.pubfn.isNotNull(row.resign_month)) {
									if (nowm !== row.resign_month) {
										return row.resign_month + val;
									}
								}
								return val;
							}
						},
						{
							"key": "employees.positions.position_name",
							"title": "职位",
							"type": "text"
						},
						{
							"key": "employees.hire_date",
							"title": "入职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"format": "yyyy-MM-dd"
						},
						{
							"key": "resign_month",
							"title": "离职日期",
							"type": "number",
							formatter: function(val, row, column, index) {
								return val ? val + '月离职工资' : '';
							}
						},
						{
							"key": "work_days",
							"title": "全勤天数",
							"type": "number"
						},
						{
							"key": "real_days",
							"title": "实际天数",
							"type": "number"
						},
						{
							"key": "overtime_hours",
							"title": "加班小时",
							"type": "number"
						},
						{
							"key": "overtime_cost",
							"title": "加班费",
							"type": "number"
						},
						{
							"key": "earlytime_hours",
							"title": "迟/早退(分)",
							"type": "number"
						},
						{
							"key": "earlytime_cost",
							"title": "迟到费",
							"type": "number"
						},
						{
							"key": "missed_count",
							"title": "未打卡(次)",
							"type": "number"
						},
						{
							"key": "missed_cost",
							"title": "未打卡费",
							"type": "number"
						},
						{
							"key": "share_cost",
							"title": "水电费用",
							"type": "number"
						},
						{
							"key": "clothes_cost",
							"title": "工衣费用",
							"type": "number"
						},
						{
							"key": "reward_cost",
							"title": "奖励",
							"type": "number"
						},
						{
							"key": "punish_cost",
							"title": "惩罚",
							"type": "number"
						},
						{
							"key": "grant",
							"title": "补助金",
							"type": "number"
						},
						{
							"key": "agency_fee",
							"title": "介绍费",
							"type": "number",
						},
						{
							"key": "other_cost",
							"title": "其它费用",
							"type": "number"
						},
						{
							key: "enable_hr",
							title: "考勤审核",
							type: "text",
							formatter: function(val, row, column, index) {
								return val ? '通过' : '未通过';
							}
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text"
						},
					],
					pageIndex: 1,
					pageSize: -1, // 此值为-1，代表导出所有数据
				});

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
			//计算费用
			async computCost() {
				//迟/早退打卡
				let ll_data = await vk.callFunction({
					url: 'admin/hrm/salary/sys/lateclock/getList',
					title: '请求中...',
					data: {}
				});
				//通用加班费用
				let com_data = await vk.callFunction({
					url: 'admin/hrm/salary/sys/overtime/getList',
					title: '请求中...',
					data: {
						employee_id: 'common'
					}
				});

				if (ll_data.total == 0) return vk.alert('请设定迟/早退打卡规则！');
				if (com_data.total == 0) return vk.alert('请设通用加班规则！');

				let employee_id = this.form1.data.employee_id || 0;
				let overtime_hours = this.form1.data.overtime_hours || 0;
				let earlytime_hours = this.form1.data.earlytime_hours || 0;
				let missed_count = this.form1.data.missed_count || 0;

				if (employee_id == 0) return vk.alert('请选择员工！');

				//加班费
				if (overtime_hours !== 0) {
					//特殊人员加班费用
					let emp_data = await vk.callFunction({
						url: 'admin/hrm/salary/sys/overtime/getList',
						title: '请求中...',
						data: {
							employee_id
						}
					})
					if (emp_data.total > 0) {
						let value = overtime_hours * emp_data.rows[0].overtime_cost;
						this.$set(this.form1.data, 'overtime_cost', value);
					} else {
						let value = overtime_hours * (com_data.rows[0].overtime_cost || 20);
						this.$set(this.form1.data, 'overtime_cost', value);
					}
				}

				//迟到费
				let eh = (earlytime_hours - ll_data.rows[0].late_min) * ll_data.rows[0].late_price;
				if (eh > 0) {
					this.$set(this.form1.data, 'earlytime_cost', eh);
				} else {
					this.$set(this.form1.data, 'earlytime_cost', 0);
				}

				//未打卡费
				let mc = (missed_count - ll_data.rows[0].clock_min) * ll_data.rows[0].clock_price;
				if (mc > 0) {
					this.$set(this.form1.data, 'missed_cost', mc);
				} else {
					this.$set(this.form1.data, 'missed_cost', 0);
				}


			},
			//自动生成考勤数据
			async autoBtn() {
				vk.confirm(`确定将删除${nowym}全部数据，重新生成考勤数据！`, '提示', '确定', '取消', async (res) => {
					if (res.confirm) {
						//考勤明细数据
						let resDetails = await vk.callFunction({
							url: 'admin/hrm/attendance/sys/getList',
							title: '请求中...',
							data: {
								attendance_ym: nowym
							},
						});
						let count = 0;
						let errorRow = "";
						for (let row of resDetails.rows) {
							if (vk.pubfn.isNotNull(row.resign_month)) {
								let rm = row.resign_month > 9 ? row.resign_month :
									`0${row.resign_month}`;
								row.attendance_ym_key = `${nowy}-${rm}`;
							} else {
								row.attendance_ym_key = row.attendance_ym;
							}
							//先处理水电，工衣，人事等费用								
							//水电费(有可能有多笔)		
							let res = await vk.callFunction({
								url: 'admin/hrm/salary/sys/we/getSumList',
								title: '请求中...',
								data: {
									employee_id: row.employee_id,
									attendance_ym_key: row.attendance_ym_key
								},
							})
							if (res.total > 0) {
								row.share_cost = res.rows[0].share_cost || ""
							} else {
								row.share_cost = ""
							}
							//工衣
							res = await vk.callFunction({
								url: 'admin/hrm/salary/sys/clothes/getList',
								title: '请求中...',
								data: {
									employee_id: row.employee_id,
									attendance_ym_key: row.attendance_ym_key
								},
							})
							if (res.total > 0) {
								row.clothes_cost = res.rows[0].clothes_cost || ""
							} else {
								row.clothes_cost = ""
							}
							//人事费用
							res = await vk.callFunction({
								url: 'admin/hrm/salary/sys/cost/getList',
								title: '请求中...',
								data: {
									employee_id: row.employee_id,
									attendance_ym_key: row.attendance_ym_key
								},
							})
							if (res.total > 0) {
								// 奖励
								row.reward_cost = res.rows[0].reward_cost || ""
								// 惩罚
								row.punish_cost = res.rows[0].punish_cost || ""
								// 补助金
								row.grant = res.rows[0].grant || ""
								// 介绍费
								row.agency_fee = res.rows[0].agency_fee || ""
								// 其它费用
								row.other_cost = res.rows[0].other_cost || ""
							} else {
								row.reward_cost = ""
								row.punish_cost = ""
								row.grant = ""
								row.agency_fee = ""
								row.other_cost = ""
							}

							let delRes = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/approve/delete',
								title: '请求中...',
								data: {
									employee_id: row.employee_id,
									attendance_ym_key: row.attendance_ym_key
								},
							})
							if (delRes.code == 0) {
								row.enable_hr = false;
								let addRes = await vk.callFunction({
									url: 'admin/hrm/attendance/sys/approve/add',
									title: '请求中...',
									data: row,
								});
								if (addRes.code == 0) {
									count++;
								} else {
									count = 0;
									errorRow = JSON.stringify(row);
									break;
								}
							}
						}

						if (count == 0) {
							vk.alert(`错误数据:${errorRow}`, "新增失败", "确定", () => {});
						} else {
							vk.alert(`导入数据:${count}条`, "新增成功", "确定",
								() => {
									this.refresh()
								})
						}
					}
				})
			},
			// 显示添加页面
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/attendance/sys/approve/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/attendance/sys/approve/update';
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
					action: "admin/hrm/attendance/sys/approve/delete",
					data: {
						_id: item._id
					},
				});
			},
			// 监听 - 批量操作的按钮点击事件
			batchBtn(index) {
				switch (index) {
					case 1:
						this.table1.multipleSelection.forEach(async (e) => {
							let data = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/approve/update',
								title: '请求中...',
								data: {
									_id: e._id,
									employee_id: e.employee_id,
									attendance_ym_key: e.attendance_ym_key,
									enable_hr: true
								}
							})
							if (data.code == 0) vk.alert("批量审核通过成功", "确定",
								() => {
									this.refresh()
								})
						})

						break;
					case 2:
						this.table1.multipleSelection.forEach(async (e) => {
							let data = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/approve/update',
								title: '请求中...',
								data: {
									_id: e._id,
									employee_id: e.employee_id,
									attendance_ym_key: e.attendance_ym_key,
									enable_hr: false
								}
							})
							if (data.code == 0) vk.alert("批量审核未通过成功", "确定",
								() => {
									this.refresh()
								})
						})
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