<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
			<template v-slot:clockintime>
				<vk-data-input-date-time v-model="queryForm1.formData.clockintime"
					type="daterange"></vk-data-input-date-time>
			</template>
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="primary" size="small" icon="el-icon-download"
					v-if="$hasRole('admin') || $hasPermission('clockin-record-export')"
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
	let originalForms = {}; // 表单初始化数据	
	const colWidth = 200;
	export default {
		data() {
			return {
				table1: {
					action: "admin/hrm/clockin/sys/getList",
					rightBtns: [{
						mode: 'detail_auto',
						title: '详细',
						show: () => this.$hasRole('admin') || this.$hasPermission('clockin-record-view')
					}],
					columns: [{
							key: "employee_id",
							title: "员工工号",
							type: "text",
							width: colWidth - 100,
							fixed: true
						},
						{
							key: "employee_name",
							title: "员工姓名",
							type: "text",
							width: colWidth - 100,
							formatter: (val, row) => row.employeeInfo ? row.employeeInfo.employee_name : ''
						},
						{
							key: "clockintime",
							title: "打卡时间",
							type: "time",
							width: colWidth,
							sortable: true
						},
						{
							key: "type",
							title: "打卡类型",
							type: "tag",
							width: colWidth - 60,
							data: [{
									value: "公司卡",
									label: "公司卡",
									tagType: "success"
								},
								{
									value: "出差卡",
									label: "出差卡",
									tagType: "warning"
								}
							]
						},
						{
							key: "wifis.address",
							title: "打卡地点",
							type: "text",
							width: colWidth
						},
						{
							key: "img",
							title: "考勤图片",
							type: "image",
							width: colWidth - 60
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
							title: "操作人",
							type: "text",
							width: colWidth,
							show: ["detail"]
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
							key: "type",
							title: "打卡类型",
							type: "select",
							width: colWidth - 60,
							data: [{
									value: "公司卡",
									label: "公司卡"
								},
								{
									value: "出差卡",
									label: "出差卡"
								}
							],
							mode: "="
						},
						{
							key: "clockintime",
							title: "打卡时间",
							type: "datetimerange",
							width: colWidth + 120,
							mode: "[]"
						}
					]
				}
			};
		},
		methods: {
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
			exportExcel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '打卡明细',
					title: "正在导出数据...",
					columns: this.table1.columns.filter(c => c.key !== '_id' && c.type !== 'image'),
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