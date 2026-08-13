<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
			<template v-slot:trip_date_range>
				<vk-data-input-date-time v-model="queryForm1.formData.trip_date_range"
					type="daterange"></vk-data-input-date-time>
			</template>
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="primary" size="small" icon="el-icon-download"
					v-if="$hasRole('admin') || $hasPermission('attendance-triprecord-export')"
					@click="exportExcel">导出全部</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:custom-right-btns="table1.customRightBtns" :selection="false" :row-no="false" :pagination="true">
		</vk-data-table>

		<!-- 详情弹窗 -->
		<vk-data-dialog v-model="detailDialog.show" :title="detailDialog.title" width="700px" top="5vh"
			:close-on-click-modal="false">
			<view v-if="detailDialog.loading" style="text-align:center;padding:50px;">
				<i class="el-icon-loading" style="font-size:30px;"></i>
				<p>加载中...</p>
			</view>
			<view v-else-if="detailDialog.data" style="max-height:70vh;overflow-y:auto;">
				<el-card shadow="never" class="detail-card">
					<div slot="header"><span>基本信息</span></div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="员工工号">{{ detailDialog.data.employee_id }}</el-descriptions-item>
						<el-descriptions-item
							label="员工姓名">{{ detailDialog.data.employee_name || '-' }}</el-descriptions-item>
						<el-descriptions-item label="出差地点">{{ detailDialog.data.trip_location }}</el-descriptions-item>
						<el-descriptions-item label="出差类型">
							<el-tag :type="detailDialog.data.trip_type === 'domestic' ? 'primary' : 'danger'">
								{{ detailDialog.data.trip_type === 'domestic' ? '国内' : '国际' }}
							</el-tag>
						</el-descriptions-item>
						<el-descriptions-item
							label="开始时间">{{ formatDate(detailDialog.data.start_time) }}</el-descriptions-item>
						<el-descriptions-item
							label="结束时间">{{ formatDate(detailDialog.data.end_time) }}</el-descriptions-item>
						<el-descriptions-item label="总小时数">{{ detailDialog.data.total_hours }}</el-descriptions-item>
						<el-descriptions-item label="汇入状态">
							<el-tag :type="getImportStatusType(detailDialog.data.import_status)">
								{{ getImportStatusText(detailDialog.data.import_status) }}
							</el-tag>
						</el-descriptions-item>
						<el-descriptions-item
							label="汇入时间">{{ formatDate(detailDialog.data.update_date) }}</el-descriptions-item>
						<el-descriptions-item label="备注">{{ detailDialog.data.reason || '-' }}</el-descriptions-item>
					</el-descriptions>
				</el-card>
			</view>
			<template v-slot:footer>
				<el-button @click="detailDialog.show = false">关闭</el-button>
			</template>
		</vk-data-dialog>
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
					action: "admin/hrm/attendance/sys/tripRecord/getList",
					customRightBtns: [{
						mode: 'custom',
						title: '详情',
						icon: 'el-icon-view',
						type: 'primary',
						show: () => this.$hasRole('admin') || this.$hasPermission('attendance-triprecord-view'),
						onClick: (item) => {
							this.onDetail(item);
						}
					}],
					columns: [{
							key: "employee_id",
							title: "员工工号",
							type: "text",
							width: colWidth - 40
						},
						{
							key: "employee_name",
							title: "员工姓名",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.employeeInfo ? row.employeeInfo.employee_name : ''
						},
						{
							key: "trip_location",
							title: "出差地点",
							type: "text",
							width: colWidth - 40
						},
						{
							key: "start_time",
							title: "开始时间",
							type: "date",
							dateType: "datetime",
							valueFormat: "yyyy-MM-dd hh:mm",
							width: colWidth - 60
						},
						{
							key: "end_time",
							title: "结束时间",
							type: "date",
							dateType: "datetime",
							valueFormat: "yyyy-MM-dd hh:mm",
							width: colWidth - 60
						},
						{
							key: "total_hours",
							title: "小时数",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "trip_type",
							title: "类型",
							type: "tag",
							width: colWidth - 80,
							data: [{
									value: "domestic",
									label: "国内",
									tagType: "primary"
								},
								{
									value: "international",
									label: "国际",
									tagType: "danger"
								}
							]
						},
						{
							key: "import_status",
							title: "状态",
							type: "tag",
							width: colWidth - 80,
							data: [{
									value: 0,
									label: "未汇入",
									tagType: "info"
								},
								{
									value: 1,
									label: "已汇入",
									tagType: "success"
								},
								{
									value: 2,
									label: "失败",
									tagType: "danger"
								}
							]
						},
						{
							key: "update_date",
							title: "汇入时间",
							type: "date",
							dateType: "datetime",
							valueFormat: "yyyy-MM-dd hh:mm",
							width: colWidth - 60
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
								}
							],
							mode: "="
						},
						{
							key: "trip_date_range",
							title: "出差日期",
							type: "datetimerange",
							width: colWidth + 120,
							mode: "between",
							startKey: "start_time_start",
							endKey: "start_time_end"
						},
						{
							key: "trip_type",
							title: "出差类型",
							type: "select",
							width: colWidth - 60,
							data: [{
									value: "domestic",
									label: "国内"
								},
								{
									value: "international",
									label: "国际"
								}
							],
							mode: "="
						},
						{
							key: "import_status",
							title: "状态",
							type: "select",
							width: colWidth - 80,
							data: [{
									value: 0,
									label: "未汇入"
								},
								{
									value: 1,
									label: "已汇入"
								},
								{
									value: 2,
									label: "失败"
								}
							],
							mode: "="
						}
					]
				},
				detailDialog: {
					show: false,
					title: '',
					data: null,
					loading: false
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

			async exportExcel() {
				this.$refs.table1.exportExcel({
					fileName: '出差记录',
					title: "正在导出数据...",
					columns: [{
							key: "employee_id",
							title: "员工工号",
							type: "text"
						},
						{
							key: "employee_name",
							title: "员工姓名",
							type: "text",
							formatter: (val, row) => row.employeeInfo ? row.employeeInfo.employee_name : ''
						},
						{
							key: "trip_location",
							title: "出差地点",
							type: "text"
						},
						{
							key: "start_time",
							title: "开始时间",
							type: "date",
							dateType: "datetime",
							valueFormat: "yyyy-MM-dd hh:mm"
						},
						{
							key: "end_time",
							title: "结束时间",
							type: "date",
							dateType: "datetime",
							valueFormat: "yyyy-MM-dd hh:mm"
						},
						{
							key: "total_hours",
							title: "小时数",
							type: "number"
						},
						{
							key: "trip_type",
							title: "类型",
							type: "text",
							formatter: (val) => val === 'domestic' ? '国内' : '国际'
						},
						{
							key: "import_status",
							title: "状态",
							type: "text",
							formatter: (val) => this.getImportStatusText(val)
						},
						{
							key: "update_date",
							title: "汇入时间",
							type: "date",
							dateType: "datetime",
							valueFormat: "yyyy-MM-dd hh:mm"
						}
					],
					pageIndex: 1,
					pageSize: -1
				});
			},

			onDetail(item) {
				this.detailDialog.show = true;
				this.detailDialog.loading = true;
				this.detailDialog.data = {
					...item,
					employee_name: item.employeeInfo ? item.employeeInfo.employee_name : ''
				};
				this.detailDialog.title = '出差详情';
				this.detailDialog.loading = false;
			},

			getImportStatusType(status) {
				const map = {
					0: 'info',
					1: 'success',
					2: 'danger'
				};
				return map[status] || 'info';
			},
			getImportStatusText(status) {
				const map = {
					0: '未汇入',
					1: '已汇入',
					2: '失败'
				};
				return map[status] || status;
			},
			formatDate(timestamp) {
				return timestamp ? vk.pubfn.timeFormat(timestamp, 'yyyy-MM-dd hh:mm') : '-';
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

	.detail-card {
		margin-bottom: 15px;
	}
</style>