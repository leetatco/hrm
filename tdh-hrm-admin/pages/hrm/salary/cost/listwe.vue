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
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-config-add')"
					@click="addBtn">添加</el-button>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-config-add')"
					@click="addDatas">复制上月数据</el-button>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-config-add')" @click="exportExcelAll">
					导出全部
				</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true"
			:default-sort="{ name:'dorms.location', type:'asc',name:'dorm_id', type:'asc'}" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="700px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:before-action="form1.props.beforeAction" :form-type="form1.props.formType"
				:columns='form1.props.columns' label-width="100px" :inline="true" :columnsNumber="2"
				@success="form1.props.show = false;refresh();">
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
		month: 0,
		mode: "before", // after 之后 before 之前
	})).getFullYear();

	let nowm = new Date(vk.pubfn.getOffsetTime(new Date(), {
		month: 0,
		mode: "before", // after 之后 before 之前
	})).getMonth();

	nowm = nowm > 9 ? nowm : `0${nowm}`;
	const nowym = vk.myfn.normalizeMonth(`${nowy}-${nowm}`);


	//上上月
	let nowy1 = new Date(vk.pubfn.getOffsetTime(new Date(), {
		month: 1,
		mode: "before", // after 之后 before 之前
	})).getFullYear();

	let nowm1 = new Date(vk.pubfn.getOffsetTime(new Date(), {
		month: 1,
		mode: "before", // after 之后 before 之前
	})).getMonth();

	nowm1 = nowm1 > 9 ? nowm1 : `0${nowm1}`;
	const nowym1 = vk.myfn.normalizeMonth(`${nowy1}-${nowm1}`);

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
					action: "admin/hrm/salary/sys/we/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-attendance-config-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-attendance-config-edit')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission(
									'hrm-attendance-config-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							key: "attendance_ym",
							title: "考勤日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM",
							format: "yyyy-MM"
						},
						{
							key: "cards",
							title: "身份证号",
							type: "html",
							width: colWidth,
							formatter: (val, row, column, index) => {
								let str = "<text>";
								row.cards.map((item, index) => {
									str += item;
									str += "<br>";
								})
								str += "</text>";
								return str;
							}
						},
						{
							key: "employee_names",
							title: "员工姓名",
							type: "html",
							width: colWidth - 100,
							formatter: (val, row, column, index) => {
								let str = "<text>";
								row.employees.map((item, index) => {
									str += item.employee_name;
									str += "<br>";
								})
								str += "</text>";
								return str;
							}
						},
						{
							"key": "dorm_id",
							"title": "房号",
							"type": "html",
							"width": colWidth,
							formatter: function(val, row, column, index) {
								return `<text>${row.dorm_id}-${row.dorms.location}</text>`;
							}
						},
						{
							"key": "last_month_water",
							"title": "上月数",
							"precision": 2,
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "current_month_water",
							"title": "本月数",
							"precision": 2,
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "unit_price_water",
							"title": "单价",
							"precision": 2,
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "water_cost",
							"title": "水费",
							"precision": 2,
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "last_month_electricity",
							"title": "上月数",
							"precision": 2,
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "current_month_electricity",
							"title": "本月数",
							"precision": 2,
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "unit_price_electricity",
							"title": "单价",
							"precision": 2,
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "electricity_cost",
							"title": "电费",
							"precision": 2,
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "total_cost",
							"title": "总计(元)",
							"precision": 2,
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "share_cost",
							"title": "分摊(元/人)",
							"precision": 2,
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
						attendance_ym: nowym
					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
							key: "attendance_ym",
							title: "考勤日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
							"mode": "="
						},
						{
							key: "cards",
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
							key: "dorm_id",
							title: "",
							type: "table-select",
							placeholder: "选择房号",
							action: "admin/hrm/dorm/sys/getList",
							multiple: false,
							columns: [{
									key: "dorm_id",
									title: "房号",
									type: "text",
									show: ["none"],
									idKey: true
								}, // idKey:true 代表此字段为主键字段，若设置show:["none"],则可以在表格中隐藏该字段的显示
								{
									key: "dorm_id",
									title: "房号",
									type: "text",
									nameKey: true
								},
								{
									key: "dorm_rent",
									title: "租金",
									type: "number",
									nameKey: true
								},
								{
									key: "location",
									title: "宿舍地址",
									type: "text",
									nameKey: true
								}
							],
							queryColumns: [{
									key: "dorm_id",
									title: "房号",
									type: "text",
									width: colWidth - 50,
									mode: "%%"
								},
								{
									key: "dorm_rent",
									title: "租金",
									type: "number",
									width: colWidth - 50,
									mode: "%%"
								}, {
									key: "location",
									title: "宿舍地址",
									type: "text",
									width: colWidth,
									mode: "%%"
								}

							]
						},
						//{"key":"last_month_water","title":"上月数","type":"number","width":colWidth,"mode":"="},
						//{"key":"current_month_water","title":"本月数","type":"number","width":colWidth,"mode":"="},
						//{"key":"unit_price_water","title":"单价","type":"text","width":colWidth,"mode":"="},
						//{"key":"last_month_electricity","title":"上月数","type":"number","width":colWidth,"mode":"="},
						//{"key":"current_month_electricity","title":"本月数","type":"number","width":colWidth,"mode":"="},
						//{"key":"unit_price_electricity","title":"单价","type":"text","width":colWidth,"mode":"="},
						//{"key":"grant","title":"补助金","type":"number","width":colWidth,"mode":"="},
						//{"key":"other_cost","title":"其他费用","type":"number","width":colWidth,"mode":"="},
						//{"key":"comment","title":"备注","type":"text","width":colWidth,"mode":"="},
						//{"key":"update_date","title":"更新时间","type":"datetimerange","width":colWidth,"mode":"="},
						//{"key":"update_id","title":"更新人","type":"text","width":colWidth,"mode":"="}
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						attendance_ym: nowym
					},
					// 表单属性
					props: {
						beforeAction: (formData) => {
							// 可在此处修改 formData 后返回 formData，若在此处return false，则表单不触发提交请求。
							this.computeCost(formData.water_cost, formData.electricity_cost);
							return formData;
						},
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								key: "",
								title: "基础资料",
								type: "bar-title"
							},
							{
								key: "attendance_ym",
								title: "考勤日期",
								type: "date",
								dateType: "date",
								valueFormat: "yyyy-MM",
								format: "yyyy-MM",
								"width": colWidth
							},
							{
								key: "dorm_id",
								title: "房号",
								type: "table-select",
								placeholder: "选择房号",
								action: "admin/hrm/dorm/sys/getList",
								multiple: false,
								columns: [{
										key: "dorm_id",
										title: "房号",
										type: "text",
										show: ["none"],
										idKey: true
									}, // idKey:true 代表此字段为主键字段，若设置show:["none"],则可以在表格中隐藏该字段的显示
									{
										key: "dorm_id",
										title: "房号",
										type: "text",
										nameKey: true
									}, {
										key: "dorm_rent",
										title: "租金",
										type: "number",
										nameKey: true
									},
									{
										key: "location",
										title: "宿舍地址",
										type: "text",
										nameKey: true

									}
								],
								queryColumns: [{
										key: "dorm_id",
										title: "房号",
										type: "text",
										width: colWidth - 50,
										mode: "%%"
									},
									{
										key: "dorm_rent",
										title: "租金",
										type: "number",
										width: colWidth - 50,
										mode: "%%"
									}, {
										key: "location",
										title: "宿舍地址",
										type: "text",
										width: colWidth,
										mode: "%%"
									}

								]
							},
							{
								key: "cards",
								title: "入住员工",
								type: "table-select",
								placeholder: "选择员工",
								action: "admin/hrm/attendance/sys/getList",
								oneLine: true,
								multiple: true,
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
								key: "",
								title: "水费",
								type: "bar-title"
							},
							{
								"key": "last_month_water",
								"title": "上月数",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "current_month_water",
								"title": "本月数",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "unit_price_water",
								"title": "单价",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "water_cost",
								"title": "水费",
								"precision": 2,
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								key: "",
								title: "电费",
								type: "bar-title"
							},
							{
								"key": "last_month_electricity",
								"title": "上月数",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "current_month_electricity",
								"title": "本月数",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "unit_price_electricity",
								"title": "单价",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "electricity_cost",
								"title": "电费",
								"precision": 2,
								"type": "number",
								disabled: true,
								"width": colWidth
							},
							{
								key: "",
								title: "总计、分摊费用",
								type: "bar-title"
							},
							{
								"key": "total_cost",
								"title": "总计(元)",
								"precision": 2,
								"type": "number",
								disabled: true,
								"width": colWidth
							},
							{
								"key": "share_cost",
								"title": "分摊(元/人)",
								"precision": 2,
								"type": "number",
								disabled: true,
								"width": colWidth
							},
							{
								key: "comment",
								title: "备注",
								type: "textarea",
								maxlength: "100",
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
							dorm_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							cards: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							unit_price_water: [{
								validator: async (rule, value, callback) => {
									let last = this.form1.data.last_month_water ? this.form1.data
										.last_month_water : 0;
									let current = this.form1.data.current_month_water ? this.form1.data
										.current_month_water : 0;
									let unit = this.form1.data.unit_price_water ? this.form1.data
										.unit_price_water : 0;
									value = current - last;
									if (value > 0) {
										value = value * unit;
										this.$set(this.form1.data, 'water_cost', value);
									} else {
										value = 0;
										this.$set(this.form1.data, 'water_cost', value);
									}

									this.computeCost(this.form1.data.water_cost, this.form1.data
										.electricity_cost);

								},
								trigger: ['blur', 'change']
							}],
							last_month_water: [{
								validator: async (rule, value, callback) => {
									let last = this.form1.data.last_month_water ? this.form1.data
										.last_month_water : 0;
									let current = this.form1.data.current_month_water ? this.form1.data
										.current_month_water : 0;
									let unit = this.form1.data.unit_price_water ? this.form1.data
										.unit_price_water : 0;
									value = current - last;
									if (value > 0) {
										value = value * unit;
										this.$set(this.form1.data, 'water_cost', value);
									} else {
										value = 0;
										this.$set(this.form1.data, 'water_cost', value);
									}

									this.computeCost(this.form1.data.water_cost, this.form1.data
										.electricity_cost);

								},
								trigger: ['blur', 'change']
							}],
							current_month_water: [{
								validator: async (rule, value, callback) => {
									let last = this.form1.data.last_month_water ? this.form1.data
										.last_month_water : 0;
									let current = this.form1.data.current_month_water ? this.form1.data
										.current_month_water : 0;
									let unit = this.form1.data.unit_price_water ? this.form1.data
										.unit_price_water : 0;
									value = current - last;
									if (value > 0) {
										value = value * unit;
										this.$set(this.form1.data, 'water_cost', value);
									} else {
										value = 0;
										this.$set(this.form1.data, 'water_cost', value);
									}

									this.computeCost(this.form1.data.water_cost, this.form1.data
										.electricity_cost);

								},
								trigger: ['blur', 'change']
							}],
							unit_price_electricity: [{
								validator: async (rule, value, callback) => {
									let last = this.form1.data.last_month_electricity ? this.form1.data
										.last_month_electricity : 0;
									let current = this.form1.data.current_month_electricity ? this.form1.data
										.current_month_electricity : 0;
									let unit = this.form1.data.unit_price_electricity ? this.form1.data
										.unit_price_electricity : 0;
									value = current - last;
									if (value > 0) {
										value = value * unit;
										this.$set(this.form1.data, 'electricity_cost', value);
									} else {
										value = 0;
										this.$set(this.form1.data, 'electricity_cost', value);
									}

									this.computeCost(this.form1.data.water_cost, this.form1.data
										.electricity_cost);

								},
								trigger: ['blur', 'change']
							}],
							last_month_electricity: [{
								validator: async (rule, value, callback) => {
									let last = this.form1.data.last_month_electricity ? this.form1.data
										.last_month_electricity : 0;
									let current = this.form1.data.current_month_electricity ? this.form1.data
										.current_month_electricity : 0;
									let unit = this.form1.data.unit_price_electricity ? this.form1.data
										.unit_price_electricity : 0;
									value = current - last;
									if (value > 0) {
										value = value * unit;
										this.$set(this.form1.data, 'electricity_cost', value);
									} else {
										value = 0;
										this.$set(this.form1.data, 'electricity_cost', value);
									}
									this.computeCost(this.form1.data.water_cost, this.form1.data
										.electricity_cost);
								},
								trigger: ['blur', 'change']
							}],
							current_month_electricity: [{
								validator: async (rule, value, callback) => {
									let last = this.form1.data.last_month_electricity ? this.form1.data
										.last_month_electricity : 0;
									let current = this.form1.data.current_month_electricity ? this.form1.data
										.current_month_electricity : 0;
									let unit = this.form1.data.unit_price_electricity ? this.form1.data
										.unit_price_electricity : 0;
									value = current - last;
									if (value > 0) {
										value = value * unit;
										this.$set(this.form1.data, 'electricity_cost', value);
									} else {
										value = 0;
										this.$set(this.form1.data, 'electricity_cost', value);
									}
									this.computeCost(this.form1.data.water_cost, this.form1.data
										.electricity_cost);
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
			// 导出xls表格文件（全部数据）
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: nowym + '人员水电费用信息',
					title: "正在导出数据...",
					columns: [{
							key: "attendance_ym",
							title: "考勤日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
						}, {
							"key": "cards",
							"title": "员工身份证号",
							"type": "text",
							formatter: (val, row, column, index) => {
								let str = "<text>";
								row.employees.map((item, index) => {
									str += item.card;
									str += "<br>";
								})
								str += "</text>";
								return str;
							}
						},
						{
							"key": "employee_names",
							"title": "员工姓名",
							"type": "text",
							formatter: (val, row, column, index) => {
								let str = "<text>";
								row.employees.map((item, index) => {
									str += item.employee_name;
									str += "<br>";
								})
								str += "</text>";
								return str;
							}
						},
						{
							"key": "dorm_id",
							"title": "房号",
							"type": "text"
						},
						{
							"key": "dorms.location",
							"title": "宿舍地址",
							"type": "text"
						},
						{
							"key": "last_month_water",
							"title": "上月数",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "current_month_water",
							"title": "本月数",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "unit_price_water",
							"title": "单价",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "water_cost",
							"title": "水费",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "last_month_electricity",
							"title": "上月数",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "current_month_electricity",
							"title": "本月数",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "unit_price_electricity",
							"title": "单价",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "electricity_cost",
							"title": "电费",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "total_cost",
							"title": "总计(元)",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "share_cost",
							"title": "分摊(元/人)",
							"precision": 2,
							"type": "number"
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
			//计算费用
			computeCost(w_cost, e_cost) {
				let total = 0;
				let share_cost = 0;
				let length = 0;
				total = w_cost + e_cost;
				if (vk.pubfn.isNotNull(this.form1.data.cards))
					length = this.form1.data.cards.length || 0;
				if (total > 0 && length > 0) {
					share_cost = total / length;
				} else {
					share_cost = total;
				}
				this.$set(this.form1.data, 'total_cost', total);
				this.$set(this.form1.data, 'share_cost', vk.pubfn.toDecimal(share_cost, 2));
			},
			//复制上个月数据
			async addDatas() {
				vk.confirm(`确定将删除${nowym}月全部数据，重新生成新数据！`, '提示', '确定', '取消', async res => {
					if (res.confirm) {
						let res = await vk.callFunction({
							url: 'admin/hrm/salary/sys/we/getCopyList',
							title: '请求中...',
							data: {
								attendance_ym: nowym1
							},
						})

						if (res.total == 0) {
							return vk.alert('没有上月数据，请联系相关人员！');
						}

						//清除原数据
						let delRes = await vk.callFunction({
							url: 'admin/hrm/salary/sys/we/delete',
							title: '请求中...',
							data: {
								attendance_ym: nowym
							}
						})

						if (delRes.code == 0) {
							for (let s of res.rows) {
								//新增新数据							
								s.attendance_ym = nowym;
								// 水费是固定数量，所在不用改变
								// s.last_month_water = s.current_month_water;
								s.last_month_electricity = s.current_month_electricity;
								let data = await vk.callFunction({
									url: 'admin/hrm/salary/sys/we/add',
									title: '请求中...',
									data: s
								})
							}
							vk.alert(`复制${nowym1}月${res.total}条数据成功!`, '提示', '确定');
							this.refresh();
						} else {
							return vk.alert(`删除数据出错(id:${s._id})!`);
						}
					}
				})
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
				this.form1.props.action = 'admin/hrm/salary/sys/we/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/salary/sys/we/update';
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
					action: "admin/hrm/salary/sys/we/delete",
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