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
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="700px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="80px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false;refresh();">
				<template v-slot:typhoon_cost="{ form }">
					<el-input-number v-model="form.typhoon_cost" :precision="2" />
				</template>
				<template v-slot:liunian_cost="{ form }">
					<el-input-number v-model="form.liunian_cost" :precision="2" />
				</template>
				<template v-slot:grant="{ form }">
					<el-input-number v-model="form.grant" :precision="0" />
				</template>
				<template v-slot:agency_fee="{ form }">
					<el-input-number v-model="form.agency_fee" :precision="0" />
				</template>
				<template v-slot:other_cost="{ form }">
					<el-input-number v-model="form.other_cost" :precision="0" />
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

	// 当前年月（默认查询当月）
	let nowy = new Date(vk.pubfn.getOffsetTime(new Date(), {
		month: 0,
		mode: "before",
	})).getFullYear();

	let nowm = new Date(vk.pubfn.getOffsetTime(new Date(), {
		month: 0,
		mode: "before",
	})).getMonth();

	nowm = nowm > 9 ? nowm : `0${nowm}`;
	const nowym = vk.myfn.normalizeMonth(`${nowy}-${nowm}`);

	export default {
		data() {
			return {
				loading: false,

				// ========== 表格相关 ==========
				table1: {
					action: "admin/hrm/salary/sys/cost/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission(
								'hrm-attendance-config-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission(
								'hrm-attendance-config-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission(
								'hrm-attendance-config-delete')
						}
					],
					columns: [{
							key: "attendance_ym",
							title: "考勤日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
							width: colWidth - 100
						},
						{
							key: "card",
							title: "身份证号",
							type: "text",
							width: colWidth
						},
						{
							key: "employees.employee_name",
							title: "员工姓名",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "typhoon_cost",
							title: "台风费用",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "liunian_cost",
							title: "留年费用",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "reward_cost",
							title: "奖励",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "punish_cost",
							title: "惩罚",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "grant",
							title: "补助金",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "agency_fee",
							title: "介绍费",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "other_cost",
							title: "其他费用",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "comment",
							title: "备注",
							type: "text",
							width: colWidth
						},
						{
							key: "update_date",
							title: "更新时间",
							type: "time",
							width: colWidth,
							show: ["detail"]
						},
						{
							key: "users.nickname",
							title: "更新人",
							type: "text",
							width: colWidth,
							show: ["detail"]
						}
					],
					multipleSelection: [],
					selectItem: ""
				},

				// ========== 查询条件 ==========
				queryForm1: {
					formData: {},
					columns: [{
							key: "attendance_ym",
							title: "考勤日期",
							type: "date",
							dateType: "daterange",
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
							mode: '[]'
						},
						{
							key: "card",
							title: "员工",
							type: "table-select",
							placeholder: "选择员工",
							action: "admin/hrm/employees/sys/getList",
							multiple: false,
							columns: [{
									key: "card",
									title: "身份证号码",
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
							],
							mode: "="
						}
					]
				},

				// ========== 表单 ==========
				form1: {
					data: {
						attendance_ym: nowym,
						typhoon_cost: 0,
						liunian_cost: 0,
						reward_cost: 0,
						punish_cost: 0,
						grant: 0,
						agency_fee: 0,
						other_cost: 0
					},
					props: {
						action: "",
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
								key: "card",
								title: "员工",
								type: "table-select",
								placeholder: "选择员工",
								action: "admin/hrm/employees/sys/getList",
								multiple: false,
								columns: [{
										key: "card",
										title: "身份证号码",
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
								title: "台风、留年",
								type: "bar-title"
							},
							{
								"key": "typhoon_cost",
								"title": "台风费用",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "liunian_cost",
								"title": "留年费用",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								key: "",
								title: "奖惩",
								type: "bar-title"
							},
							{
								"key": "reward_cost",
								"title": "奖励",
								"precision": 0,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "punish_cost",
								"title": "惩罚",
								"precision": 0,
								"type": "number",
								"width": colWidth
							},
							{
								key: "",
								title: "补助金、介绍费、其他费用",
								type: "bar-title"
							},
							{
								"key": "grant",
								"title": "补助金",
								"precision": 0,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "agency_fee",
								"title": "介绍费",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "other_cost",
								"title": "其他费用",
								"precision": 2,
								"type": "number",
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
						rules: {
							attendance_ym: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							card: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				},

				formDatas: {}
			};
		},
		onLoad(options = {}) {
			this.options = options;
			this.init(options);
		},
		onReady() {},
		onShow() {},
		onHide() {},
		methods: {
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
			pageTo(path) {
				vk.navigateTo(path);
			},
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},
			search() {
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			getCurrentRow() {
				return this.$refs.table1.getCurrentRow();
			},
			currentChange(val) {
				this.table1.selectItem = val;
			},
			selectionChange(list) {
				this.table1.multipleSelection = list;
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/salary/sys/cost/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/salary/sys/cost/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/salary/sys/cost/delete",
					data: {
						_id: item._id
					}
				});
			}
		},
		watch: {},
		computed: {}
	};
</script>

<style lang="scss" scoped>
	.page-body {}
</style>