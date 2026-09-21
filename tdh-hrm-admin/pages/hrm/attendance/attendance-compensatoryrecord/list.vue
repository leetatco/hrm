<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
			<template v-slot:compensatory_date>
				<vk-data-input-date-time v-model="queryForm1.formData.compensatory_date"
					type="daterange"></vk-data-input-date-time>
			</template>
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="primary" size="small" icon="el-icon-download"
					v-if="$hasRole('admin') || $hasPermission('attendance-compensatoryrecord-export')"
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
						<el-descriptions-item
							label="调休日期">{{ formatLeaveDate(detailDialog.data.compensatory_date) }}</el-descriptions-item>
						<el-descriptions-item label="调休时长">{{ vk.myfn.formatMinutes(detailDialog.data.total_minutes) }}</el-descriptions-item>
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

				<el-card shadow="never" class="detail-card" style="margin-top:15px;"
					v-if="detailDialog.data.items && detailDialog.data.items.length > 0">
					<div slot="header"><span>关联加班单</span></div>
					<el-table :data="detailDialog.data.items" border size="small">
						<el-table-column prop="overtime_title" label="加班标题"></el-table-column>
						<el-table-column label="调休时长" width="140">
							<template slot-scope="scope">
								{{ vk.myfn.formatMinutes(scope.row.deduct_minutes) }}
							</template>
						</el-table-column>
						<el-table-column prop="overtime_id" label="加班单ID" show-overflow-tooltip></el-table-column>
					</el-table>
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
	let originalForms = {};
	const colWidth = 200;

	export default {
		data() {
			return {
				table1: {
					action: "admin/hrm/attendance/sys/compensatoryrecord/getList",
					customRightBtns: [{
						mode: 'custom',
						title: '详情',
						icon: 'el-icon-view',
						type: 'primary',
						show: () => this.$hasRole('admin') || this.$hasPermission(
							'attendance-compensatoryrecord-view'),
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
							key: "compensatory_date",
							title: "调休日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM-dd",
							width: colWidth - 60,
							formatter: (val) => val ? vk.pubfn.timeFormat(new Date(val), 'yyyy-MM-dd') : ''
						},
						{
							key: "total_minutes",
							title: "调休时长",
							type: "text",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
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
							key: "compensatory_date",
							title: "调休日期",
							type: "datetimerange",
							width: colWidth + 120,
							mode: "[]"
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
			async exportExcel() {
				this.$refs.table1.exportExcel({
					fileName: '调休记录',
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
							key: "compensatory_date",
							title: "调休日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM-dd",
							formatter: (val) => val ? vk.pubfn.timeFormat(new Date(val), 'yyyy-MM-dd') : ''
						},
						{
							key: "total_minutes",
							title: "调休时长",
							type: "text",
							formatter: (val) => vk.myfn.formatMinutes(val)
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
							type: "time"
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
				this.detailDialog.title = '调休详情';
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
			formatLeaveDate(timestamp) {
				return timestamp ? vk.pubfn.timeFormat(new Date(timestamp), 'yyyy-MM-dd') : '-';
			},
			formatDate(timestamp) {
				return timestamp ? vk.pubfn.timeFormat(timestamp, 'yyyy-MM-dd hh:mm:ss') : '-';
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