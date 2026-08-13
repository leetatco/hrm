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
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-export')" @click="exportExcelAll"> 导出全部
				</el-button>
				<!-- 批量操作 -->
				<el-dropdown
					v-if="table1.multipleSelection && ($hasRole('admin') || $hasPermission('hrm-attendance-add'))"
					:split-button="false" trigger="click" @command="batchBtn">
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
			@selection-change="selectionChange" :page-sizes="pageSizes"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="700px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="100px"
				@success="form1.props.show = false;refresh();" :inline="true" :columnsNumber="2">
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
				pageSizes: [1, 5, 10, 20, 50, 100, 500, 1000],
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
							"type": "text",
							"fixed": true,
							"width": colWidth
						},
						{
							"key": "position_name",
							"title": "岗位",
							"type": "text",
							"width": colWidth - 100
						},
						{
							key: "hire_date",
							title: "入职日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM-dd",
							format: "yyyy-MM-dd",
							width: colWidth - 100
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "text",
							"width": colWidth - 90
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
							"type": "html",
							"width": colWidth - 100,
							formatter: function(val, row, column, index) {
								if (row.salary_type == 1) return `<text>${val}</text>`;
								if (row.salary_type == 2) return `<text>${val}天</text>`;
								if (row.salary_type == 3) return `<text>${val}H</text>`;
							}
						},
						{
							"key": "salary_type",
							"title": "工资类型",
							"type": "number",
							"width": colWidth - 100,
							formatter: function(val, row, column, index) {
								if (row.salary_type == 1) return '月薪';
								if (row.salary_type == 2) return '日薪';
								if (row.salary_type == 3) return '时薪';
							}
						},
						{
							"key": "typhoon_duty",
							"title": "台风",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "spring_festival_duty",
							"title": "留年",
							"type": "text",
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
							"key": "user_confirmed",
							"title": "本人确认",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "enable_hr",
							"title": "考勤审核",
							"type": "switch",
							"width": colWidth - 50
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
							key: "card",
							title: "",
							type: "table-select",
							placeholder: "选择员工",
							action: "admin/hrm/attendance/sys/getList",
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
								key: "card",
								title: "",
								type: "table-select",
								placeholder: "选择员工",
								action: "admin/hrm/attendance/sys/getList",
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
								key: "resign_date",
								title: "离职日期",
								type: "text",
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
								"type": "text",
								"width": colWidth
							},
							{
								"key": "salary_type",
								"title": "工资类型",
								"type": "select",
								"width": colWidth,
								"data": [{
									"value": 1,
									"label": "月薪"
								}, {
									"value": 2,
									"label": "日薪"
								}, {
									"value": 3,
									"label": "时薪"
								}]
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
							card: [{
								required: true,
								message: "该项不能为空",
								// validator: async (rule, value, callback) => {
								// 	this.computCost();
								// },
								trigger: ['change']
							}],
							// work_days: [{
							// 	required: true,
							// 	message: "该项不能为空",
							// 	trigger: ['change']
							// }],
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
							"key": "department_name",
							"title": "部门",
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
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"format": "yyyy-MM-dd"
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "text"
						},
						{
							"key": "work_days",
							"title": "全勤天数",
							"type": "number"
						},
						{
							"key": "real_days",
							"title": "实际天数",
							"type": "number",
							formatter: function(val, row, column, index) {
								if (row.salary_type == 1) return `<text>${val}</text>`;
								if (row.salary_type == 2) return `<text>${val}天</text>`;
								if (row.salary_type == 3) return `<text>${val}H</text>`;
							}
						},
						{
							"key": "salary_type",
							"title": "工资类型",
							"type": "number",
							formatter: function(val, row, column, index) {
								if (val == 1) return '月薪';
								if (val == 2) return '日薪';
								if (val == 3) return '时薪';
							}
						},
						{
							"key": "typhoon_duty",
							"title": "台风",
							"type": "text"
						},
						{
							"key": "spring_festival_duty",
							"title": "留年",
							"type": "text"
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
							"key": "user_confirmed",
							"title": "本人确认",
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
						}
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
						card: 'common'
					}
				});

				if (ll_data.total == 0) return vk.alert('请设定迟/早退打卡规则！');
				if (com_data.total == 0) return vk.alert('请设通用加班规则！');

				let card = this.form1.data.card || 0;
				let overtime_hours = this.form1.data.overtime_hours || 0;
				let earlytime_hours = this.form1.data.earlytime_hours || 0;
				let missed_count = this.form1.data.missed_count || 0;

				if (card == 0) return vk.alert('请选择员工！');

				//加班费
				if (overtime_hours !== 0) {
					//特殊人员加班费用
					let emp_data = await vk.callFunction({
						url: 'admin/hrm/salary/sys/overtime/getList',
						title: '请求中...',
						data: {
							card
						}
					})
					if (emp_data.total > 0) {
						let value = overtime_hours * emp_data.rows[0].overtime_cost;
						this.$set(this.form1.data, 'overtime_cost', value);
					} else {
						let value = overtime_hours * (com_data.rows[0].overtime_cost || 20);
						this.$set(this.form1.data, 'overtime_cost', value);
					}

					// let value = overtime_hours * (com_data.rows[0].overtime_cost || 20);
					// this.$set(this.form1.data, 'overtime_cost', value);

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
				vk.confirm(`确定将删除${nowym}月全部数据，重新生成考勤表数据！`, '提示', '确定', '取消', async (res) => {
					if (res.confirm) {
						try {
							// 1. 先获取所有考勤明细数据
							let resDetails = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/all/getListAll',
								title: '请求中...',
								data: {
									attendance_ym: nowym
								},
							});

							if (resDetails.total == 0) {
								return vk.alert(`没有${nowym}月考勤明细！`);
							}

							// 2. 删除旧数据
							let delRes = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/all/deleteAproAll',
								title: '请求中...',
								data: {
									attendance_ym: nowym
								}
							})

							if (delRes.code != 0) {
								return vk.alert(`${nowym}月考勤明细删除失败！`);
							}

							// 3. 提取所有员工card和可能的attendance_ym_key
							const employeeCards = [];
							const attendanceYmKeys = new Set();

							//处理离职月份
							for (let row of resDetails.rows) {
								employeeCards.push(row.card);
								row.resign_month = "";
								if (vk.pubfn.isNotNull(row.resign_date)) {
									const match = row.resign_date.match(/\.(\d+)/);
									row.resign_month = match[1] || "";
								}

								// 计算attendance_ym_key
								let attendance_ym_key;
								if (vk.pubfn.isNotNull(row.resign_month)) {
									if (nowym.split('-')[1] != row.resign_month) {
										let rm = row.resign_month > 9 ? row.resign_month :
											`0${row.resign_month}`;
										attendance_ym_key = `${nowy}-${rm}`;
									} else {
										attendance_ym_key = row.attendance_ym;
									}
								} else {
									attendance_ym_key = row.attendance_ym;
								}

								row.attendance_ym_key = attendance_ym_key;

								// 添加到集合（自动去重）
								attendanceYmKeys.add(row.attendance_ym_key);

							}

							// 4. 批量获取所有费用数据
							vk.toast('开始获取费用数据...');
							const allCostsMap = await this.batchGetAllCosts(employeeCards, Array.from(
								attendanceYmKeys));

							// 5. 获取计算规则（包含特殊人员加班规则）
							vk.toast('获取计算规则...');
							const rules = await this.getComputeRulesWithSpecial(employeeCards);
							if (!rules) return;

							// 6. 分批处理数据
							vk.toast('开始处理数据...');

							let addDates = await this.processRowDatas(resDetails.rows, allCostsMap, rules);

							const result = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/all/addAproAll',
								title: '请求中...',
								data: {
									items: addDates
								},
							});

							if (result.code === 0) {
								let resultMessage = `新增考勤表完成！成功: ${result.id.length}条`;
								vk.alert(resultMessage, "新增成功", "确定", () => {
									this.refresh();
								})
							} else {
								vk.alert(`新增失败!`, "系统错误", "确定");
							}

						} catch (error) {
							console.error('处理过程中发生错误:', error);
							vk.alert(`处理过程中发生错误: ${error.message}`, "系统错误", "确定");
						}
					}
				});
			},

			// 批量获取所有费用数据
			async batchGetAllCosts(employeeCards, attendanceYmKeys) {
				const allCostsMap = new Map();

				// 如果没有数据，直接返回空map
				if (!employeeCards || employeeCards.length === 0 || !attendanceYmKeys || attendanceYmKeys.length ===
					0) {
					return allCostsMap;
				}

				// 分批处理，避免一次请求数据量太大
				const batchSize = 200; // 每批200个员工
				const totalBatches = Math.ceil(employeeCards.length / batchSize);

				for (let i = 0; i < employeeCards.length; i += batchSize) {
					const batchemployeeCards = employeeCards.slice(i, i + batchSize);
					const currentBatch = Math.floor(i / batchSize) + 1;

					vk.toast(`获取费用数据... (${currentBatch}/${totalBatches})`);

					try {
						const res = await vk.callFunction({
							url: 'admin/hrm/attendance/sys/all/getCostAll',
							title: '获取费用数据中...',
							data: {
								card: batchemployeeCards,
								attendance_ym_key: attendanceYmKeys
							},
						});

						if (res.code === 0 && res.data) {
							// 处理水电费
							if (res.data.we && res.data.we.length > 0) {
								res.data.we.forEach(item => {
									const key = `${item.card}_${item.attendance_ym}`;
									const existingData = allCostsMap.get(key) || {};
									allCostsMap.set(key, {
										...existingData,
										share_cost: item.share_cost || 0
									});
								});
							}

							// 处理工衣费
							if (res.data.clothes && res.data.clothes.length > 0) {
								res.data.clothes.forEach(item => {
									const key = `${item.card}_${item.attendance_ym}`;
									const existingData = allCostsMap.get(key) || {};
									allCostsMap.set(key, {
										...existingData,
										clothes_cost: item.clothes_cost || 0
									});
								});
							}

							// 处理人事费用
							if (res.data.cost && res.data.cost.length > 0) {
								res.data.cost.forEach(item => {
									const key = `${item.card}_${item.attendance_ym}`;
									const existingData = allCostsMap.get(key) || {};
									allCostsMap.set(key, {
										...existingData,
										reward_cost: item.reward_cost || 0,
										punish_cost: item.punish_cost || 0,
										agency_fee: item.agency_fee || 0,
										other_cost: item.other_cost || 0
									});
								});
							}
						} else {
							console.warn(`第${currentBatch}批费用数据获取失败:`, res.msg);
						}

					} catch (error) {
						console.error(`第${currentBatch}批费用数据获取异常:`, error);
					}

					// 给服务器一点喘息时间
					if (i + batchSize < employeeCards.length) {
						await this.delay(200);
					}
				}

				return allCostsMap;
			},

			// 获取计算规则（包含特殊人员加班规则）
			async getComputeRulesWithSpecial(employeeCards) {
				try {
					// 1. 获取迟/早退打卡规则
					const ll_data = await vk.callFunction({
						url: 'admin/hrm/salary/sys/lateclock/getList',
						title: '获取规则中...',
						data: {}
					});

					// 2. 获取通用加班费用规则
					const com_data = await vk.callFunction({
						url: 'admin/hrm/salary/sys/overtime/getList',
						title: '获取规则中...',
						data: {
							card: 'common'
						}
					});

					if (ll_data.total == 0) {
						vk.alert('请设定迟/早退打卡规则！');
						return null;
					}

					if (com_data.total == 0) {
						vk.alert('请设通用加班规则！');
						return null;
					}

					// 3. 获取特殊人员加班规则
					vk.toast('获取特殊人员加班规则...');
					const specialOvertimeMap = await this.batchGetSpecialOvertimeRules(employeeCards);

					return {
						ll_data,
						com_data,
						specialOvertimeMap
					};

				} catch (error) {
					console.error('获取计算规则失败:', error);
					vk.alert(`获取计算规则失败: ${error.message}`);
					return null;
				}
			},

			// 批量获取特殊人员加班规则
			async batchGetSpecialOvertimeRules(employeeCards) {
				const specialRulesMap = new Map();

				try {
					// 由于特殊人员很少（最多100个左右），我们可以一次性查询所有特殊规则
					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/overtime/getList',
						title: '获取特殊加班规则中...',
						data: {
							pageIndex: 1,
							pageSize: -1, // 足够大，确保能获取所有特殊规则
							// 查询条件：card不是'common'，并且在我们需要的员工列表中
							whereJson: {
								card: {
									$ne: 'common',
									$in: employeeCards
								}
							}
						}
					});

					if (res.code === 0 && res.rows && res.rows.length > 0) {
						// 建立员工ID到特殊规则的映射
						res.rows.forEach(item => {
							// 确保card存在且不是通用规则
							if (item.card && item.card !== 'common') {
								specialRulesMap.set(item.card, item);
							}
						});

						console.log(`获取到${specialRulesMap.size}个特殊人员的加班规则`);
					} else if (res.code !== 0) {
						console.warn('获取特殊加班规则失败:', res.msg);
					}
				} catch (error) {
					console.warn('获取特殊加班规则失败，将使用通用规则:', error);
				}

				return specialRulesMap;
			},
			// 处理多行数据
			async processRowDatas(rows = [], allCostsMap, rules) {
				try {
					rows.forEach(row => {
						// 获取该行数据的attendance_ym_key
						const attendance_ym_key = row.attendance_ym_key;
						if (!attendance_ym_key) {
							throw new Error('无法确定考勤月份');
						}

						const key = `${row.card}_${attendance_ym_key}`;
						const costData = allCostsMap.get(key) || {};

						//处理工资类型
						let salary = vk.myfn.parseSalary(row.real_days)
						if (salary) {
							row.real_days = salary.number;
							row.salary_type = salary.type;
						}

						//月薪，实际天数>全勤天数，实际天数=全勤天数
						if (vk.pubfn.isNotNull(row.work_days) && vk.pubfn.isNotNull(row.real_days)) {
							row.real_days = row.real_days > row.work_days ? row.work_days : row.real_days
						}



						// 设置费用数据
						row.share_cost = costData.share_cost || 0;
						row.clothes_cost = costData.clothes_cost || 0;
						row.reward_cost = costData.reward_cost || 0;
						row.punish_cost = costData.punish_cost || 0;
						row.agency_fee = costData.agency_fee || 0;
						row.other_cost = costData.other_cost || 0;

						// 计算加班、早退、漏卡费用（传入特殊规则）
						const costs = this.computeCostsWithSpecial(row, rules);
						row.overtime_cost = costs.overtime_cost;
						row.earlytime_cost = costs.earlytime_cost;
						row.missed_cost = costs.missed_cost;

						// 添加新记录
						row.enable_hr = false;
						row.attendance_ym_key = attendance_ym_key;
					})
					return rows
				} catch (error) {
					console.error(`处理数据失败:`, error);
					return []
				}
			},

			// 计算费用（考虑特殊人员加班规则）
			computeCostsWithSpecial(row, rules) {
				const {
					ll_data,
					com_data,
					specialOvertimeMap
				} = rules;
				const {
					card,
					overtime_hours = 0,
					earlytime_hours = 0,
					missed_count = 0
				} = row;

				// 加班费 - 优先使用特殊人员规则
				let overtime_cost = 0;
				if (overtime_hours !== 0) {
					// 检查是否有特殊规则
					if (specialOvertimeMap.has(card)) {
						const specialRule = specialOvertimeMap.get(card);
						overtime_cost = overtime_hours * (specialRule.overtime_cost || 20);
					} else {
						// 使用通用规则
						overtime_cost = overtime_hours * (com_data.rows[0]?.overtime_cost || 20);
					}
				}

				// 迟到费
				let earlytime_cost = 0;
				const eh = (earlytime_hours - ll_data.rows[0].late_min) * ll_data.rows[0].late_price;
				if (eh > 0) {
					earlytime_cost = eh;
				}

				// 未打卡费
				let missed_cost = 0;
				const mc = (missed_count - ll_data.rows[0].clock_min) * ll_data.rows[0].clock_price;
				if (mc > 0) {
					missed_cost = mc;
				}

				return {
					overtime_cost,
					earlytime_cost,
					missed_cost
				};
			},

			// 延迟函数
			delay(ms) {
				return new Promise(resolve => setTimeout(resolve, ms));
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
			async batchBtn(index) {
				switch (index) {
					case 1:
						let res = await vk.callFunction({
							url: 'admin/hrm/attendance/sys/all/updateAll',
							title: '请求中...',
							data: {
								items: this.table1.multipleSelection,
								enable_hr: true
							}
						})
						this.refresh();
						break;
					case 2:
						res = await vk.callFunction({
							url: 'admin/hrm/attendance/sys/all/updateAll',
							title: '请求中...',
							data: {
								items: this.table1.multipleSelection,
								enable_hr: false
							}
						})
						this.refresh()
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