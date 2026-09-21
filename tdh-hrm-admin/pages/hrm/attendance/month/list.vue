<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-refresh"
					v-if="$hasRole('admin') || $hasPermission('attendance-monthly-generate')"
					@click="showGenerateDialog">生成月度汇总</el-button>
				<el-button type="primary" size="small" icon="el-icon-download"
					v-if="$hasRole('admin') || $hasPermission('attendance-monthly-export')"
					@click="exportExcel">导出全部</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:custom-right-btns="table1.customRightBtns" :selection="false" :row-no="false" :pagination="true">
		</vk-data-table>

		<!-- 生成弹窗 -->
		<vk-data-dialog v-model="generateDialog.show" title="生成月度汇总" width="500px" top="10vh"
			:close-on-click-modal="false">
			<el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="100px">
				<el-form-item label="年度" prop="year" required>
					<el-input-number v-model="generateForm.year" :min="2000" :max="2100"></el-input-number>
				</el-form-item>
				<el-form-item label="月份" prop="month" required>
					<el-input-number v-model="generateForm.month" :min="1" :max="12"></el-input-number>
				</el-form-item>
				<el-form-item label="员工" prop="employee_ids">
					<vk-data-input-table-select v-model="generateForm.employee_ids" multiple
						action="admin/hrm/employees/sys/getList" placeholder="全部员工（留空则汇总所有）" :columns="[
		          { key: 'employee_id', title: '员工工号', type: 'text', idKey: true },
		          { key: 'employee_name', title: '员工姓名', type: 'text', nameKey: true }
		        ]" :queryColumns="[
		          { key: 'employee_id', title: '员工工号', type: 'text', width: 150, mode: '%%' },
		          { key: 'employee_name', title: '员工姓名', type: 'text', width: 150, mode: '%%' }
		        ]"></vk-data-input-table-select>
				</el-form-item>
			</el-form>
			<template v-slot:footer>
				<el-button @click="generateDialog.show = false">取消</el-button>
				<el-button type="primary" @click="doGenerate" :loading="generateLoading">开始生成</el-button>
			</template>
		</vk-data-dialog>

		<!-- 详情弹窗 -->
		<vk-data-dialog v-model="detailDialog.show" :title="detailDialog.title" width="800px" top="5vh"
			:close-on-click-modal="false">
			<view v-if="detailDialog.data" style="max-height:70vh;overflow-y:auto;">
				<el-card shadow="never" class="detail-card">
					<div slot="header"><span>汇总信息</span></div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="员工工号">{{ detailDialog.data.employee_id }}</el-descriptions-item>
						<el-descriptions-item
							label="员工姓名">{{ detailDialog.data.employee_name || '-' }}</el-descriptions-item>
						<el-descriptions-item label="统计周期">{{ detailDialog.data.period_start }} ~
							{{ detailDialog.data.period_end }}</el-descriptions-item>
						<el-descriptions-item label="全勤">
							<el-tag :type="detailDialog.data.full_attendance ? 'success' : 'info'">
								{{ detailDialog.data.full_attendance ? '是' : '否' }}
							</el-tag>
						</el-descriptions-item>
						<el-descriptions-item label="应出勤天数">{{ detailDialog.data.should_days }}</el-descriptions-item>
						<el-descriptions-item label="实际出勤天数">{{ detailDialog.data.actual_days }}</el-descriptions-item>
						<el-descriptions-item label="休息天数">{{ detailDialog.data.rest_days }}</el-descriptions-item>
						<el-descriptions-item label="迟到">{{ detailDialog.data.late_count }}次 /
							{{ vk.myfn.formatMinutes(detailDialog.data.late_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="早退">{{ detailDialog.data.early_count }}次 /
							{{ vk.myfn.formatMinutes(detailDialog.data.early_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="旷工">{{ detailDialog.data.absent_count }}次 /
							{{ vk.myfn.formatMinutes(detailDialog.data.absent_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="加班">{{ vk.myfn.formatMinutes(detailDialog.data.overtime_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="请假">{{ vk.myfn.formatMinutes(detailDialog.data.leave_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="出差">{{ vk.myfn.formatMinutes(detailDialog.data.trip_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="外出">{{ vk.myfn.formatMinutes(detailDialog.data.outing_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="调休">{{ vk.myfn.formatMinutes(detailDialog.data.compensatory_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="补卡次数">{{ detailDialog.data.remedy_count }}</el-descriptions-item>
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
	let originalForms = {};
	const colWidth = 200;

	export default {
		data() {
			return {
				table1: {
					action: "admin/hrm/attendance/sys/monthlyAttendance/getList",
					customRightBtns: [{
						mode: 'custom',
						title: '详情',
						icon: 'el-icon-view',
						type: 'primary',
						show: () => true,
						onClick: (item) => this.onDetail(item)
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
							fixed: true,
							width: colWidth - 100,
							formatter: (val, row) => row.employeeInfo ? row.employeeInfo.employee_name : ''
						},
						{
							key: "year",
							title: "年度",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "month",
							title: "月份",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "should_days",
							title: "应出勤",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "actual_days",
							title: "实出勤",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "late_count",
							title: "迟到次数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "late_minutes",
							title: "迟到",
							type: "number",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "early_count",
							title: "早退次数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "early_minutes",
							title: "早退",
							type: "number",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "absent_count",
							title: "旷工次数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "overtime_minutes",
							title: "加班",
							type: "text",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "leave_minutes",
							title: "请假",
							type: "text",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "trip_minutes",
							title: "出差",
							type: "text",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "outing_minutes",
							title: "外出",
							type: "text",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "compensatory_minutes",
							title: "调休",
							type: "text",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "remedy_count",
							title: "补卡次数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "full_attendance",
							title: "全勤",
							type: "tag",
							width: colWidth - 100,
							data: [{
								value: true,
								label: "是",
								tagType: "success"
							}, {
								value: false,
								label: "否",
								tagType: "info"
							}]
						}
					]
				},
				queryForm1: {
					formData: {
						year: new Date().getFullYear(),
						month: new Date().getMonth() + 1
					},
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
							}, {
								key: "employee_name",
								title: "员工姓名",
								type: "text",
								nameKey: true
							}],
							queryColumns: [{
								key: "employee_id",
								title: "员工工号",
								type: "text",
								width: 150,
								mode: "%%"
							}, {
								key: "employee_name",
								title: "员工姓名",
								type: "text",
								width: 150,
								mode: "%%"
							}],
							mode: "="
						},
						{
							key: "year",
							title: "年度",
							type: "number",
							width: colWidth - 80,
							mode: "="
						},
						{
							key: "month",
							title: "月份",
							type: "number",
							width: colWidth - 80,
							mode: "="
						},
						{
							key: "full_attendance",
							title: "全勤",
							type: "select",
							width: colWidth - 100,
							data: [{
								value: true,
								label: "是"
							}, {
								value: false,
								label: "否"
							}],
							mode: "="
						}
					]
				},
				detailDialog: {
					show: false,
					title: '月度考勤汇总详情',
					data: null
				},
				generateDialog: {
					show: false
				},
				generateForm: {
					year: new Date().getFullYear(),
					month: new Date().getMonth() + 1,
					employee_ids: []
				},
				generateRules: {
					year: [{
						required: true,
						message: '请选择年度',
						trigger: 'blur'
					}],
					month: [{
						required: true,
						message: '请选择月份',
						trigger: 'blur'
					}]
				},
				generateLoading: false
			};
		},
		methods: {
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
			search() {
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},

			async exportExcel() {
				this.$refs.table1.exportExcel({
					fileName: '月度考勤汇总',
					title: "正在导出数据...",
					columns: this.table1.columns.filter(c => c.key !== '_id'),
					pageIndex: 1,
					pageSize: -1
				});
			},

			onDetail(item) {
				this.detailDialog.data = {
					...item,
					employee_name: item.employeeInfo ? item.employeeInfo.employee_name : ''
				};
				this.detailDialog.show = true;
			},

			showGenerateDialog() {
				this.generateForm.year = new Date().getFullYear();
				this.generateForm.month = new Date().getMonth() + 1;
				this.generateForm.employee_ids = [];
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
					const params = {
						year: this.generateForm.year,
						month: this.generateForm.month
					};
					if (this.generateForm.employee_ids.length > 0) {
						params.employee_ids = this.generateForm.employee_ids;
					}
					const res = await vk.callFunction({
						url: 'admin/hrm/attendance/sys/calcMonthlyAttendance',
						data: params
					});
					if (res.code === 0) {
						vk.alert(res.msg, '提示', () => {
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