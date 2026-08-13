<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('attendance-overtimerule-add')" @click="addBtn">添加</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="850px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="180px" :inline="true"
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
					action: "admin/hrm/attendance/sys/overtimerule/getList",
					rightBtns: [
						{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-overtimerule-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-overtimerule-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-overtimerule-delete')
						}
					],
					columns: [
						{
							key: "rule_name",
							title: "规则名称",
							type: "text",
							width: colWidth - 40,
							fixed: true
						},
						{
							key: "weekday_overtime_ratio",
							title: "工作日系数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "weekend_overtime_ratio",
							title: "休息日系数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "holiday_overtime_ratio",
							title: "节假日系数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "min_calculate_unit",
							title: "最小单位(分)",
							type: "number",
							width: colWidth - 40
						},
						{
							key: "compensate_type",
							title: "补偿方式",
							type: "select",
							width: colWidth - 40,
							data: [
								{ value: 1, label: "调休优先" },
								{ value: 2, label: "计薪优先" },
								{ value: 3, label: "仅计薪" },
								{ value: 4, label: "仅调休" }
							],
							formatter: (val) => {
								const map = { 1: '调休优先', 2: '计薪优先', 3: '仅计薪', 4: '仅调休' };
								return map[val] || val;
							}
						},
						{
							key: "max_daily_overtime",
							title: "日最大(时)",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "max_monthly_overtime",
							title: "月最大(时)",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "status",
							title: "启用",
							type: "switch",
							width: colWidth - 100,
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
					columns: [
						{
							key: "rule_name",
							title: "规则名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "status",
							title: "启用状态",
							type: "select",
							width: colWidth - 100,
							data: [
								{ value: true, label: "启用" },
								{ value: false, label: "停用" }
							],
							mode: "="
						}
					]
				},
				form1: {
					data: {
						rule_name: '',
						weekday_overtime_ratio: 1.5,
						weekend_overtime_ratio: 2.0,
						holiday_overtime_ratio: 3.0,
						min_calculate_unit: 30,
						compensate_type: 1,
						max_daily_overtime: 0,
						max_monthly_overtime: 0,
						status: true,
						remark: ''
					},
					props: {
						action: "",
						columns: [
							{
								key: "rule_name",
								title: "规则名称",
								type: "text",
								width: colWidth,
								required: true
							},
							{
								key: "weekday_overtime_ratio",
								title: "工作日加班系数",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "weekend_overtime_ratio",
								title: "休息日加班系数",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "holiday_overtime_ratio",
								title: "节假日加班系数",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "min_calculate_unit",
								title: "最小计算单位(分钟)",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "compensate_type",
								title: "补偿方式",
								type: "select",
								width: colWidth - 60,
								required: true,
								data: [
									{ value: 1, label: "调休优先" },
									{ value: 2, label: "计薪优先" },
									{ value: 3, label: "仅计薪" },
									{ value: 4, label: "仅调休" }
								]
							},
							{
								key: "max_daily_overtime",
								title: "每日最大加班(小时)",
								type: "number",
								width: colWidth - 60
							},
							{
								key: "max_monthly_overtime",
								title: "每月最大加班(小时)",
								type: "number",
								width: colWidth - 60
							},
							{
								key: "status",
								title: "启用状态",
								type: "switch",
								width: colWidth - 100,
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
							rule_name: [{ required: true, message: "规则名称不能为空", trigger: "blur" }],
							weekday_overtime_ratio: [{ required: true, message: "工作日系数不能为空", trigger: "blur" }],
							weekend_overtime_ratio: [{ required: true, message: "休息日系数不能为空", trigger: "blur" }],
							holiday_overtime_ratio: [{ required: true, message: "节假日系数不能为空", trigger: "blur" }],
							min_calculate_unit: [{ required: true, message: "最小计算单位不能为空", trigger: "blur" }],
							compensate_type: [{ required: true, message: "补偿方式不能为空", trigger: "change" }]
						},
						formType: "",
						title: "",
						show: false
					}
				}
			};
		},
		onLoad() {
			originalForms = { form1: vk.pubfn.copyObject(this.form1) };
		},
		methods: {
			search() { this.$refs.table1.search(); },
			refresh() { this.$refs.table1.refresh(); },
			resetForm() { vk.pubfn.resetForm(originalForms, this); },
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/attendance/sys/overtimerule/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加工加班规则';
				this.form1.props.show = true;
			},
			updateBtn({ item }) {
				this.form1.props.action = 'admin/hrm/attendance/sys/overtimerule/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑加班规则';
				this.form1.props.show = true;
				this.form1.data = { ...item };
			},
			deleteBtn({ item, deleteFn }) {
				deleteFn({
					action: "admin/hrm/attendance/sys/overtimerule/delete",
					data: { _id: item._id }
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body { padding: 20rpx; }
	.btn-group { margin: 20rpx 0; }
</style>