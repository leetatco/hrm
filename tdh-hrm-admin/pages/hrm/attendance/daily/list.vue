<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
			<template v-slot:attendance_date>
				<vk-data-input-date-time v-model="queryForm1.formData.attendance_date"
					type="daterange"></vk-data-input-date-time>
			</template>
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-refresh"
					v-if="$hasRole('admin') || $hasPermission('attendance-daily-generate')"
					@click="showGenerateDialog">手动生成考勤</el-button>
				<el-button type="primary" size="small" icon="el-icon-download"
					v-if="$hasRole('admin') || $hasPermission('attendance-daily-export')"
					@click="exportExcel">导出全部</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:custom-right-btns="table1.customRightBtns" :selection="false" :row-no="false" :pagination="true">
		</vk-data-table>

		<!-- 手动生成弹窗 -->
		<vk-data-dialog v-model="generateDialog.show" title="手动生成日考勤" width="500px" top="10vh"
		  :close-on-click-modal="false">
		  <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="100px">
		    <el-form-item label="日期范围" prop="dateRange" required>
		      <el-date-picker
		        v-model="generateForm.dateRange"
		        type="daterange"
		        range-separator="至"
		        start-placeholder="开始日期"
		        end-placeholder="结束日期"
		        value-format="yyyy-MM-dd"
		        style="width: 100%"
		      ></el-date-picker>
		    </el-form-item>
		    <el-form-item label="员工" prop="employee_id">
		      <vk-data-input-table-select
		        v-model="generateForm.employee_id"
		        action="admin/hrm/employees/sys/getList"
		        placeholder="全部员工（留空则计算所有）"
		        :columns="[
		          { key: 'employee_id', title: '员工工号', type: 'text', idKey: true },
		          { key: 'employee_name', title: '员工姓名', type: 'text', nameKey: true }
		        ]"
		        :queryColumns="[
		          { key: 'employee_id', title: '员工工号', type: 'text', width: 150, mode: '%%' },
		          { key: 'employee_name', title: '员工姓名', type: 'text', width: 150, mode: '%%' }
		        ]"
		      ></vk-data-input-table-select>
		    </el-form-item>
		  </el-form>
		  <template v-slot:footer>
		    <el-button @click="generateDialog.show = false">取消</el-button>
		    <el-button type="primary" @click="doGenerate" :loading="generateLoading">开始生成</el-button>
		  </template>
		</vk-data-dialog>

		<!-- 详情弹窗 -->
		<vk-data-dialog v-model="detailDialog.show" :title="detailDialog.title" width="750px" top="5vh"
			:close-on-click-modal="false">
			<view v-if="detailDialog.loading" style="text-align:center;padding:50px;">
				<i class="el-icon-loading" style="font-size:30px;"></i>
				<p>加载中...</p>
			</view>
			<view v-else-if="detailDialog.data" style="max-height:70vh;overflow-y:auto;">
				<el-card shadow="never" class="detail-card">
					<div slot="header"><span>考勤信息</span></div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="员工工号">{{ detailDialog.data.employee_id }}</el-descriptions-item>
						<el-descriptions-item
							label="员工姓名">{{ detailDialog.data.employee_name || '-' }}</el-descriptions-item>
						<el-descriptions-item label="日期">{{ vk.pubfn.timeFormat(new Date(detailDialog.data.attendance_date), 'yyyy-MM-dd')}}</el-descriptions-item>
						<el-descriptions-item
							label="班次">{{ detailDialog.data.shift_name || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="签到时间">{{ detailDialog.data.clock_in || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="签退时间">{{ detailDialog.data.clock_out || '-' }}</el-descriptions-item>
						<el-descriptions-item label="迟到(分)">{{ detailDialog.data.late_minutes }}</el-descriptions-item>
						<el-descriptions-item label="早退(分)">{{ detailDialog.data.early_minutes }}</el-descriptions-item>
						<el-descriptions-item
							label="旷工(分)">{{ detailDialog.data.absent_minutes }}</el-descriptions-item>
						<el-descriptions-item
							label="加班(时)">{{ detailDialog.data.overtime_hours }}</el-descriptions-item>
						<el-descriptions-item label="请假(时)">{{ detailDialog.data.leave_hours }}</el-descriptions-item>
						<el-descriptions-item label="出差(时)">{{ detailDialog.data.trip_hours }}</el-descriptions-item>
						<el-descriptions-item
							label="调休(时)">{{ detailDialog.data.compensatory_hours }}</el-descriptions-item>
						<el-descriptions-item
							label="补卡">{{ detailDialog.data.remedy_flag ? '是' : '否' }}</el-descriptions-item>
						<el-descriptions-item label="状态">
							<el-tag :type="getStatusTag(detailDialog.data.attendance_status)">
								{{ getStatusText(detailDialog.data.attendance_status) }}
							</el-tag>
						</el-descriptions-item>
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
	const colWidth = 200;

	export default {
		data() {
			return {
				table1: {
					action: "admin/hrm/attendance/sys/dailyAttendance/getList",
					customRightBtns: [{
						mode: 'custom',
						title: '详情',
						icon: 'el-icon-view',
						type: 'primary',
						show: () => true,
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
							key: "attendance_date",
							title: "日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM-dd",
							width: colWidth - 60
						},
						{
							key: "shift_name",
							title: "班次",
							type: "text",
							width: colWidth - 60
						},
						{
							key: "clock_in",
							title: "签到",
							type: "text",
							width: colWidth - 60
						},
						{
							key: "clock_out",
							title: "签退",
							type: "text",
							width: colWidth - 60
						},
						{
							key: "late_minutes",
							title: "迟到",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "early_minutes",
							title: "早退",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "absent_minutes",
							title: "旷工",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "overtime_hours",
							title: "加班",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "leave_hours",
							title: "请假",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "trip_hours",
							title: "出差",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "compensatory_hours",
							title: "调休",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "remedy_flag",
							title: "补卡",
							type: "tag",
							width: colWidth - 80,
							data: [{
								value: true,
								label: "是",
								tagType: "info"
							}],
							formatter: (val) => val ? '是' : ''
						},
						{
							key: "attendance_status",
							title: "状态",
							type: "tag",
							width: colWidth - 80,
							data: [{
									value: 0,
									label: "异常",
									tagType: "danger"
								},
								{
									value: 1,
									label: "正常",
									tagType: "success"
								},
								{
									value: 2,
									label: "请假",
									tagType: "warning"
								},
								{
									value: 3,
									label: "出差",
									tagType: "info"
								},
								{
									value: 4,
									label: "调休",
									tagType: "warning"
								},
								{
									value: 5,
									label: "旷工",
									tagType: "danger"
								},
								{
									value: 6,
									label: "加班",
									tagType: "warning"
								}
							]
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
							key: "attendance_date",
							title: "日期范围",
							type: "datetimerange",
							width: colWidth + 120,
							mode: "[]"
						},
						{
							key: "attendance_status",
							title: "状态",
							type: "select",
							width: colWidth - 80,
							data: [{
									value: 0,
									label: "异常"
								},
								{
									value: 1,
									label: "正常"
								},
								{
									value: 2,
									label: "请假"
								},
								{
									value: 3,
									label: "出差"
								},
								{
									value: 4,
									label: "调休"
								},
								{
									value: 5,
									label: "旷工"
								},
								{
									value: 6,
									label: "加班"
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
				},
				// 手动生成相关
				generateDialog: {
					show: false
				},
				generateForm: {
					dateRange: [],
					employee_id: ''
				},
				generateRules: {
					dateRange: [{
						required: true,
						message: '请选择日期范围',
						trigger: 'blur'
					}]
				},
				generateLoading: false
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
					fileName: '日考勤明细',
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
							key: "attendance_date",
							title: "日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM-dd"
						},
						{
							key: "shift_name",
							title: "班次",
							type: "text"
						},
						{
							key: "clock_in",
							title: "签到时间",
							type: "text"
						},
						{
							key: "clock_out",
							title: "签退时间",
							type: "text"
						},
						{
							key: "late_minutes",
							title: "迟到(分)",
							type: "number"
						},
						{
							key: "early_minutes",
							title: "早退(分)",
							type: "number"
						},
						{
							key: "absent_minutes",
							title: "旷工(分)",
							type: "number"
						},
						{
							key: "overtime_hours",
							title: "加班(时)",
							type: "number"
						},
						{
							key: "leave_hours",
							title: "请假(时)",
							type: "number"
						},
						{
							key: "trip_hours",
							title: "出差(时)",
							type: "number"
						},
						{
							key: "compensatory_hours",
							title: "调休(时)",
							type: "number"
						},
						{
							key: "remedy_flag",
							title: "补卡",
							type: "text",
							formatter: (val) => val ? '是' : '否'
						},
						{
							key: "attendance_status",
							title: "状态",
							type: "text",
							formatter: (val) => this.getStatusText(val)
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
				this.detailDialog.title = '考勤详情';
				this.detailDialog.loading = false;
			},

			getStatusTag(status) {
				const map = {
					0: 'danger',
					1: 'success',
					2: 'warning',
					3: 'info',
					4: 'warning',
					5: 'danger'
				};
				return map[status] || 'info';
			},
			getStatusText(status) {
				const map = {
					0: '异常',
					1: '正常',
					2: '请假',
					3: '出差',
					4: '调休',
					5: '旷工'
				};
				return map[status] || status;
			},

			// 手动生成
			showGenerateDialog() {
				this.generateForm.dateRange = [];
				this.generateForm.employee_id = '';
				this.generateDialog.show = true;
				this.$nextTick(() => {
					if (this.$refs.generateFormRef) this.$refs.generateFormRef.clearValidate();
				});
			},

			async doGenerate() {
				const valid = await this.$refs.generateFormRef.validate().catch(() => false);
				if (!valid) return;

				this.generateLoading = true;
				try {
					const params = {};
					if (this.generateForm.dateRange.length === 2) {
						params.start_date = this.generateForm.dateRange[0];
						params.end_date = this.generateForm.dateRange[1];
					}
					if (this.generateForm.employee_id) {
						params.employee_id = this.generateForm.employee_id;
					}

					const res = await vk.callFunction({
						url: 'admin/hrm/attendance/sys/calcDailyAttendance',
						data: params
					});

					if (res.code === 0) {
						vk.alert(`成功生成 ${res.total} 条考勤记录`, '提示', () => {
							this.generateDialog.show = false;
							this.refresh();
						});
					} else {
						vk.toast(res.msg || '生成失败');
					}
				} catch (e) {
					vk.toast('请求异常');
				} finally {
					this.generateLoading = false;
				}
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