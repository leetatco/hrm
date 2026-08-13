<template>
	<view class="page-body">
		<!-- 搜索区域：完全复用工作日历的写法 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('attendance-shift-add')" @click="addBtn">添加</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="950px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="160px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
		</vk-data-dialog>
	</view>
</template>

<script>
	let vk = uni.vk;
	let originalForms = {};
	const colWidth = 200;
	export default {
		data() {
			return {
				table1: {
					action: "admin/hrm/attendance/sys/shift/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => this.$hasRole('admin') || this.$hasPermission('attendance-params-view')
						}, {
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-shift-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-shift-delete')
						}
					],
					columns: [{
							key: "shift_name",
							title: "班次名称",
							type: "text",
							width: colWidth - 40,
							fixed: true
						},
						{
							key: "shift_type",
							title: "班次类型",
							type: "number",
							width: colWidth - 40,
							data: [{
									value: 1,
									label: "固定班次"
								},
								{
									value: 2,
									label: "弹性班次"
								}
							],
							formatter: (val) => val == 1 ? '固定班次' : '弹性班次'
						},
						{
							key: "start_time",
							title: "上班时间",
							type: "text",
							width: colWidth - 60
						},
						{
							key: "end_time",
							title: "下班时间",
							type: "text",
							width: colWidth - 60
						},
						{
							key: "is_cross_day",
							title: "是否跨天",
							type: "switch",
							width: colWidth - 80,
							formatter: (val) => val ? '是' : '否'
						},
						{
							key: "flexible_start_earliest",
							title: "最早签到",
							type: "text",
							width: colWidth - 60,
							formatter: (val, row) => row.shift_type == 2 ? val : ''
						},
						{
							key: "flexible_start_latest",
							title: "核心上班",
							type: "text",
							width: colWidth - 60,
							formatter: (val, row) => row.shift_type == 2 ? val : ''
						},
						{
							key: "flexible_end_earliest",
							title: "核心下班",
							type: "text",
							width: colWidth - 60,
							formatter: (val, row) => row.shift_type == 2 ? val : ''
						},
						{
							key: "flexible_end_latest",
							title: "最晚签退",
							type: "text",
							width: colWidth - 60,
							formatter: (val, row) => row.shift_type == 2 ? val : ''
						},
						{
							key: "rest_start_time",
							title: "休息开始",
							type: "text",
							width: colWidth - 60
						},
						{
							key: "rest_end_time",
							title: "休息结束",
							type: "text",
							width: colWidth - 60
						},
						{
							key: "rest_duration",
							title: "休息时长(分)",
							type: "number",
							width: colWidth - 40
						},
						{
							key: "status",
							title: "启用",
							type: "switch",
							width: colWidth - 80,
							formatter: (val) => val ? '启用' : '停用'
						},
						{
							key: "remark",
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
					]
				},
				queryForm1: {
					formData: {},
					columns: [{
							key: "shift_name",
							title: "班次名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "shift_type",
							title: "班次类型",
							type: "select",
							width: colWidth - 40,
							data: [{
									value: 1,
									label: "固定班次"
								},
								{
									value: 2,
									label: "弹性班次"
								}
							],
							mode: "="
						},
						{
							key: "status",
							title: "启用状态",
							type: "select",
							width: colWidth - 80,
							data: [{
									value: true,
									label: "启用"
								},
								{
									value: false,
									label: "停用"
								}
							],
							mode: "="
						}
					]
				},
				form1: {
					data: {
						shift_name: '',
						shift_type: 1,
						start_time: '09:00',
						end_time: '18:00',
						is_cross_day: false,
						flexible_start_earliest: '08:00',
						flexible_start_latest: '09:30',
						flexible_end_earliest: '17:30',
						flexible_end_latest: '20:00',
						rest_start_time: '12:00',
						rest_end_time: '13:00',
						rest_duration: 60,
						status: 1,
						remark: ''
					},
					props: {
						action: "",
						columns: [{
								key: "shift_name",
								title: "班次名称",
								type: "text",
								width: colWidth,
								required: true
							},
							{
								key: "shift_type",
								title: "班次类型",
								type: "radio",
								width: colWidth,
								required: true,
								data: [{
										value: 1,
										label: "固定班次"
									},
									{
										value: 2,
										label: "弹性班次"
									}
								]
							},
							{
								key: "start_time",
								title: "上班时间",
								type: "time",
								width: colWidth - 60,
								required: true,
								valueFormat: "HH:mm",
								pickerOptions: {
									format: "HH:mm"
								}
							},
							{
								key: "end_time",
								title: "下班时间",
								type: "time",
								width: colWidth - 60,
								required: true,
								valueFormat: "HH:mm",
								pickerOptions: {
									format: "HH:mm"
								}
							},
							{
								key: "is_cross_day",
								title: "是否跨天",
								type: "switch",
								width: colWidth - 80
							},
							{
								key: "flexible_start_earliest",
								title: "弹性最早签到",
								type: "time",
								width: colWidth - 60,
								valueFormat: "HH:mm",
								pickerOptions: {
									format: "HH:mm"
								},
								hidden: true,
								required: false
							},
							{
								key: "flexible_start_latest",
								title: "核心上班时间",
								type: "time",
								width: colWidth - 60,
								valueFormat: "HH:mm",
								pickerOptions: {
									format: "HH:mm"
								},
								hidden: true,
								required: false
							},
							{
								key: "flexible_end_earliest",
								title: "核心下班时间",
								type: "time",
								width: colWidth - 60,
								valueFormat: "HH:mm",
								pickerOptions: {
									format: "HH:mm"
								},
								hidden: true,
								required: false
							},
							{
								key: "flexible_end_latest",
								title: "弹性最晚签退",
								type: "time",
								width: colWidth - 60,
								valueFormat: "HH:mm",
								pickerOptions: {
									format: "HH:mm"
								},
								hidden: true,
								required: false
							},
							{
								key: "rest_start_time",
								title: "休息开始",
								type: "time",
								width: colWidth - 60,
								valueFormat: "HH:mm",
								pickerOptions: {
									format: "HH:mm"
								}
							},
							{
								key: "rest_end_time",
								title: "休息结束",
								type: "time",
								width: colWidth - 60,
								valueFormat: "HH:mm",
								pickerOptions: {
									format: "HH:mm"
								}
							},
							{
								key: "rest_duration",
								title: "休息时长(分)",
								type: "number",
								width: colWidth - 60
							},
							{
								key: "status",
								title: "启用状态",
								type: "switch",
								width: colWidth - 80,
								defaultValue: true
							},
							{
								key: "remark",
								title: "备注",
								type: "textarea",
								maxlength: 500,
								width: colWidth * 3
							}
						],
						rules: {
							shift_name: [{
								required: true,
								message: "班次名称不能为空",
								trigger: "blur"
							}],
							shift_type: [{
								required: true,
								message: "班次类型不能为空",
								trigger: "change"
							}],
							start_time: [{
								required: true,
								message: "上班时间不能为空",
								trigger: "blur"
							}],
							end_time: [{
								required: true,
								message: "下班时间不能为空",
								trigger: "blur"
							}],
							flexible_start_earliest: [{
								validator: (rule, value, callback) => {
									if (this.form1.data.shift_type == 2 && !value) {
										callback(new Error('弹性最早签到不能为空'));
									} else {
										callback();
									}
								},
								trigger: 'blur'
							}],
							flexible_start_latest: [{
								validator: (rule, value, callback) => {
									if (this.form1.data.shift_type == 2 && !value) {
										callback(new Error('核心上班时间不能为空'));
									} else {
										callback();
									}
								},
								trigger: 'blur'
							}],
							flexible_end_earliest: [{
								validator: (rule, value, callback) => {
									if (this.form1.data.shift_type == 2 && !value) {
										callback(new Error('核心下班时间不能为空'));
									} else {
										callback();
									}
								},
								trigger: 'blur'
							}],
							flexible_end_latest: [{
								validator: (rule, value, callback) => {
									if (this.form1.data.shift_type == 2 && !value) {
										callback(new Error('弹性最晚签退不能为空'));
									} else {
										callback();
									}
								},
								trigger: 'blur'
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				}
			};
		},
		watch: {
			'form1.data.shift_type'(newVal) {
				const cols = this.form1.props.columns;
				const flexFields = ['flexible_start_earliest', 'flexible_start_latest', 'flexible_end_earliest',
					'flexible_end_latest'
				];
				cols.forEach(col => {
					if (flexFields.includes(col.key)) {
						col.hidden = (newVal != 2);
						col.required = (newVal == 2);
					}
				});
			}
		},
		onLoad() {
			originalForms = {
				form1: vk.pubfn.copyObject(this.form1)
			};
		},
		methods: {
			search() {
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/attendance/sys/shift/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加班次';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/attendance/sys/shift/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑班次';
				this.form1.props.show = true;
				this.form1.data = {
					...item
				};
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/attendance/sys/shift/delete",
					data: {
						_id: item._id
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body {
		padding: 20rpx;
	}

	.btn-group {
		margin: 20rpx 0;
	}
</style>