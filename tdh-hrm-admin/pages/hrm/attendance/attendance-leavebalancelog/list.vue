<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="primary" size="small" icon="el-icon-download"
					v-if="$hasRole('admin') || $hasPermission('attendance-balancelog-export')"
					@click="exportExcel">导出全部</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true">
		</vk-data-table>
	</view>
</template>

<script>
	let vk = uni.vk;
	const colWidth = 200;
	export default {
		data() {
			return {
				table1: {
					action: "admin/hrm/attendance/sys/leavebalancelog/getList",
					rightBtns: [{
						mode: 'detail_auto',
						title: '详细',
						show: () => this.$hasRole('admin') || this.$hasPermission('attendance-balancelog-view')
					}],
					columns: [{
							key: "employee_id",
							title: "员工工号",
							type: "text",
							width: 120
						},
						{
							key: "employee_name",
							title: "员工姓名",
							type: "text",
							width: 100,
							formatter: (val, row) => row.employeeInfo ? row.employeeInfo.employee_name : ''
						},
						{
							key: "leave_type_id",
							title: "假期类型",
							type: "text",
							width: 100,
							formatter: (val, row) => row.leaveTypeInfo ? row.leaveTypeInfo.leave_name : val
						},
						{
							key: "year",
							title: "年度",
							type: "number",
							width: 80
						},
						{
							key: "change_type",
							title: "变动类型",
							type: "tag",
							width: 100,
							data: [{
									value: 1,
									label: "初始化",
									tagType: "info"
								},
								{
									value: 2,
									label: "自动发放",
									tagType: "success"
								},
								{
									value: 3,
									label: "手工增加",
									tagType: "success"
								},
								{
									value: 4,
									label: "请假扣减",
									tagType: "warning"
								},
								{
									value: 5,
									label: "手工扣减",
									tagType: "danger"
								},
								{
									value: 6,
									label: "过期清零",
									tagType: "danger"
								},
								{
									value: 7,
									label: "其他调整",
									tagType: "info"
								}
							],
							formatter: (val) => {
								const map = {
									1: '初始化',
									2: '自动发放',
									3: '手工增加',
									4: '请假扣减',
									5: '手工扣减',
									6: '过期清零',
									7: '其他调整'
								};
								return map[val] || val;
							}
						},
						{
							key: "change_amount",
							title: "变动额度",
							type: "text",
							width: 140,
							formatter: (val) => {
								if (!val) return '0分钟';
								const prefix = val > 0 ? '+' : '';
								return prefix + vk.myfn.formatMinutes(Math.abs(val)) * (val > 0 ? 1 : -1);
							}
						},
						{
							key: "before_balance",
							title: "变动前",
							type: "text",
							width: 120,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "after_balance",
							title: "变动后",
							type: "text",
							width: 120,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "ref_id",
							title: "关联单号",
							type: "text",
							width: 200
						},
						{
							key: "remark",
							title: "备注",
							type: "text",
							width: 200
						},
						{
							key: "update_date",
							title: "操作时间",
							type: "time",
							width: 160
						},
						{
							key: "users.nickname",
							title: "操作人",
							type: "text",
							width: 100
						}
					]
				},
				queryForm1: {
					formData: {},
					columns: [{
							key: "employee_id",
							title: "员工",
							type: "table-select",
							placeholder: "请选择员工",
							width: colWidth + 40,
							action: "admin/hrm/employees/sys/getList",
							multiple: false,
							columns: [{
									key: "employee_id",
									title: "员工工号",
									type: "text",
									idKey: true
								},
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
							],
							mode: "="
						},
						{
							key: "leave_type_id",
							title: "假期类型",
							type: "remote-select",
							placeholder: "请选择假期类型",
							width: colWidth,
							action: "admin/hrm/attendance/sys/leave/getList",
							props: {
								list: "rows",
								value: "leave_code",
								label: "leave_name"
							},
							showAll: true,
							actionData: {
								pageSize: 1000
							},
							mode: "="
						},
						{
							key: "year",
							title: "年度",
							type: "number",
							width: colWidth - 60,
							mode: "="
						},
						{
							key: "change_type",
							title: "变动类型",
							type: "select",
							width: colWidth,
							data: [{
									value: 1,
									label: "初始化"
								},
								{
									value: 2,
									label: "自动发放"
								},
								{
									value: 3,
									label: "手工增加"
								},
								{
									value: 4,
									label: "请假扣减"
								},
								{
									value: 5,
									label: "手工扣减"
								},
								{
									value: 6,
									label: "过期清零"
								},
								{
									value: 7,
									label: "其他调整"
								}
							],
							mode: "="
						}
					]
				}
			};
		},
		methods: {
			search() {
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			exportExcel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '额度变动日志',
					title: "正在导出数据...",
					columns: this.table1.columns.filter(c => c.type !== 'html' && c.key !== '_id'),
					pageIndex: 1,
					pageSize: -1
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