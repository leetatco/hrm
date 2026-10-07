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
					@click="exportExcelAll">导出全部</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"
			:page-sizes="pageSizes"></vk-data-table>

		<!-- 生成弹窗 -->
		<vk-data-dialog v-model="generateDialog.show" title="生成月度汇总" width="500px" top="10vh"
			:close-on-click-modal="false">
			<el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="100px">
				<el-form-item label="考勤月份" prop="attendance_ym" required>
					<el-date-picker v-model="generateForm.attendance_ym" type="month" value-format="yyyy-MM"
						placeholder="选择月份" style="width: 100%"></el-date-picker>
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
					<div slot="header"><span>员工信息</span></div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="员工工号">{{ detailDialog.data.employee_id }}</el-descriptions-item>
						<el-descriptions-item
							label="员工姓名">{{ detailDialog.data.employee_name || '-' }}</el-descriptions-item>
						<el-descriptions-item label="身份证号">{{ detailDialog.data.card || '-' }}</el-descriptions-item>
						<el-descriptions-item label="统计周期">{{ detailDialog.data.period_start }} ~
							{{ detailDialog.data.period_end }}</el-descriptions-item>
						<el-descriptions-item label="考勤月份">{{ detailDialog.data.attendance_ym }}</el-descriptions-item>
						<el-descriptions-item label="计薪方式">
							<el-tag :type="getSalaryTypeTag(detailDialog.data.salary_type)">
								{{ getSalaryTypeText(detailDialog.data.salary_type) }}
							</el-tag>
						</el-descriptions-item>
					</el-descriptions>
				</el-card>

				<el-card shadow="never" class="detail-card" style="margin-top:15px;">
					<div slot="header"><span>汇总信息</span></div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="应出勤天数">{{ detailDialog.data.should_days }}</el-descriptions-item>
						<el-descriptions-item label="实际出勤天数">{{ detailDialog.data.actual_days }}</el-descriptions-item>
						<el-descriptions-item label="休息天数">{{ detailDialog.data.rest_days }}</el-descriptions-item>
						<el-descriptions-item label="应出勤时长">
							{{ vk.myfn.formatMinutes(detailDialog.data.should_minutes) }}
						</el-descriptions-item>
						<el-descriptions-item label="实际出勤时长">
							{{ vk.myfn.formatMinutes(detailDialog.data.actual_minutes) }}
						</el-descriptions-item>
						<el-descriptions-item v-if="detailDialog.data.salary_type === 2" label="计薪天数">
							{{ detailDialog.data.pay_days }}
						</el-descriptions-item>
						<el-descriptions-item v-if="detailDialog.data.salary_type === 3" label="计薪小时数">
							{{ detailDialog.data.pay_hours }}
						</el-descriptions-item>
						<el-descriptions-item label="迟到">{{ detailDialog.data.late_count }}次 /
							{{ vk.myfn.formatMinutes(detailDialog.data.late_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="早退">{{ detailDialog.data.early_count }}次 /
							{{ vk.myfn.formatMinutes(detailDialog.data.early_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="旷工">{{ detailDialog.data.absent_count }}次 /
							{{ vk.myfn.formatMinutes(detailDialog.data.absent_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="加班合计">{{ vk.myfn.formatMinutes(detailDialog.data.overtime_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="调休加班">
							{{ vk.myfn.formatMinutes(detailDialog.data.overtime_compensatory_minutes) }}
						</el-descriptions-item>
						<el-descriptions-item label="计薪加班">
							{{ vk.myfn.formatMinutes(detailDialog.data.overtime_paid_minutes) }}
						</el-descriptions-item>
						<el-descriptions-item
							label="请假">{{ vk.myfn.formatMinutes(detailDialog.data.leave_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="出差">{{ vk.myfn.formatMinutes(detailDialog.data.trip_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="外出">{{ vk.myfn.formatMinutes(detailDialog.data.outing_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="调休">{{ vk.myfn.formatMinutes(detailDialog.data.compensatory_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="补卡次数">{{ detailDialog.data.remedy_count }}</el-descriptions-item>
						<el-descriptions-item label="是否豁免">
							<el-tag :type="detailDialog.data.exempted ? 'info' : 'success'">
								{{ detailDialog.data.exempted ? '豁免' : '正常' }}
							</el-tag>
						</el-descriptions-item>
						<el-descriptions-item label="全勤">
							<el-tag :type="detailDialog.data.full_attendance ? 'success' : 'info'">
								{{ detailDialog.data.full_attendance ? '是' : '否' }}
							</el-tag>
						</el-descriptions-item>
						<el-descriptions-item v-if="detailDialog.data.exempted" label="豁免原因" :span="2">
							{{ detailDialog.data.exemption_reason || '-' }}
						</el-descriptions-item>
					</el-descriptions>
				</el-card>

				<!-- 合同天数差异 & 签单 -->
				<el-card shadow="never" class="detail-card" style="margin-top:15px;"
					v-if="detailDialog.data.salary_type === 1 && detailDialog.data.sign_status !== 2">
					<div slot="header"><span>合同天数差异</span></div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="合同天数">{{ detailDialog.data.contract_days }}</el-descriptions-item>
						<el-descriptions-item label="应出勤天数">{{ detailDialog.data.should_days }}</el-descriptions-item>
						<el-descriptions-item label="差异天数">
							<span
								:style="{ color: detailDialog.data.diff_days > 0 ? '#F56C6C' : '#67C23A', fontWeight: 'bold' }">
								{{ detailDialog.data.diff_days }} 天
							</span>
						</el-descriptions-item>
						<el-descriptions-item label="签单状态">
							<el-tag :type="getSignStatusTag(detailDialog.data.sign_status)">
								{{ getSignStatusText(detailDialog.data.sign_status) }}
							</el-tag>
						</el-descriptions-item>
					</el-descriptions>

					<view v-if="detailDialog.data.sign_status === 1 && detailDialog.data.signature_url"
						style="margin-top:15px;">
						<p style="margin-bottom:8px;">签名图片：</p>
						<el-image :src="detailDialog.data.signature_url"
							style="width: 240px; height: 120px; border: 1px solid #ddd;"
							:preview-src-list="[detailDialog.data.signature_url]"></el-image>
						<p style="margin-top:10px;color:#666;">
							签单日期：{{ detailDialog.data.sign_date ? vk.pubfn.timeFormat(new Date(detailDialog.data.sign_date), 'yyyy-MM-dd hh:mm') : '-' }}
						</p>
					</view>

					<view v-else-if="detailDialog.data.sign_status === 0" style="margin-top:15px;">
						<el-alert title="该员工存在合同天数差异，请在小程序端完成签单" type="warning" :closable="false"></el-alert>
					</view>
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

	// 当前月份
	let nowy = new Date().getFullYear();
	let nowm = new Date().getMonth();
	nowm = nowm > 9 ? nowm : `0${nowm}`;
	const nowym = `${nowy}-${nowm}`;

	export default {
		data() {
			return {
				pageSizes: [1, 5, 10, 20, 50, 100, 500, 1000],

				// ========== 表格 ==========
				table1: {
					action: "admin/hrm/attendance/sys/monthlyAttendance/getList",
					rightBtns: [{
						mode: 'detail_auto',
						title: '详细',
						show: () => this.$hasRole('admin') || this.$hasPermission(
							'attendance-monthly-view')
					}],
					columns: [{
							key: "attendance_ym",
							title: "考勤月份",
							type: "text",
							fixed: true,
							width: colWidth - 100
						},
						{
							key: "employee_id",
							title: "员工工号",
							type: "text",
							fixed: true,
							width: colWidth - 100
						},
						{
							key: "card",
							title: "身份证号码",
							type: "text",
							fixed: true,
							width: colWidth - 30
						},
						{
							key: "employee_name",
							title: "员工姓名",
							type: "text",
							fixed: true,
							width: colWidth - 50,
							formatter: (val, row) => row.employees ? row.employees.employee_name : (
								row.employee_name || '')
						},
						{
							key: "salary_type",
							title: "计薪方式",
							type: "tag",
							width: colWidth - 100,
							data: [{
									value: 1,
									label: "月薪",
									tagType: ""
								},
								{
									value: 2,
									label: "日薪",
									tagType: "success"
								},
								{
									value: 3,
									label: "时薪",
									tagType: "warning"
								}
							]
						},
						{
							key: "should_days",
							title: "应出勤天数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "actual_days",
							title: "实出勤天数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "should_minutes",
							title: "应出勤时长",
							type: "text",
							width: colWidth - 20,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "actual_minutes",
							title: "实际出勤时长",
							type: "text",
							width: colWidth - 20,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "late_minutes",
							title: "迟到",
							type: "number",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "early_minutes",
							title: "早退",
							type: "number",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "absent_minutes",
							title: "旷工",
							type: "number",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "overtime_compensatory_minutes",
							title: "调休加班",
							type: "text",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "overtime_paid_minutes",
							title: "计薪加班",
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
							key: "exempted",
							title: "豁免",
							type: "tag",
							width: colWidth - 100,
							data: [{
									value: true,
									label: "豁免",
									tagType: "info"
								},
								{
									value: false,
									label: "正常",
									tagType: "success"
								}
							]
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
								},
								{
									value: false,
									label: "否",
									tagType: "info"
								}
							]
						}
					],
					multipleSelection: [],
					selectItem: ""
				},

				// ========== 查询 ==========
				queryForm1: {
					formData: {
						attendance_ym: nowym
					},
					columns: [{
							key: "attendance_ym",
							title: "考勤月份",
							type: "date",
							dateType: "month",
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
							width: colWidth,
							mode: "="
						},
						{
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
							key: "salary_type",
							title: "计薪方式",
							type: "select",
							width: colWidth - 100,
							data: [{
									value: 1,
									label: "月薪"
								},
								{
									value: 2,
									label: "日薪"
								},
								{
									value: 3,
									label: "时薪"
								}
							],
							mode: "="
						},
						{
							key: "exempted",
							title: "豁免",
							type: "select",
							width: colWidth - 100,
							data: [{
									value: true,
									label: "豁免"
								},
								{
									value: false,
									label: "正常"
								}
							],
							mode: "="
						}
					]
				},

				// ========== 详情 ==========
				detailDialog: {
					show: false,
					title: '月度考勤汇总详情',
					data: null
				},

				// ========== 生成 ==========
				generateDialog: {
					show: false
				},
				generateForm: {
					attendance_ym: nowym,
					employee_ids: []
				},
				generateRules: {
					attendance_ym: [{
						required: true,
						message: '请选择考勤月份',
						trigger: 'blur'
					}]
				},
				generateLoading: false
			};
		},
		onLoad() {
			originalForms = {
				form1: vk.pubfn.copyObject(this.form1)
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
				this.init();
			},
			currentChange(val) {
				this.table1.selectItem = val;
			},
			selectionChange(list) {
				this.table1.multipleSelection = list;
			},

			updateBtn({
				item
			}) {
				this.$set(this, 'form1', {
					data: {
						_id: item._id,
						attendance_ym: item.attendance_ym,
						card: item.card,
						sign_status: item.sign_status === 1 ? 1 : 0
					},
					props: {
						action: 'admin/hrm/attendance/sys/monthlyAttendance/update',
						formType: 'update',
						title: '编辑签单状态',
						show: true,
						columns: [{
								key: "attendance_ym",
								title: "考勤月份",
								type: "text",
								disabled: true,
								width: colWidth
							},
							{
								key: "card",
								title: "身份证号码",
								type: "text",
								disabled: true,
								width: colWidth
							},
							{
								key: "sign_status",
								title: "签单状态",
								type: "radio",
								width: colWidth,
								data: [{
										value: 0,
										label: "未签"
									},
									{
										value: 1,
										label: "已签"
									}
								]
							}
						],
						rules: {
							sign_status: [{
								required: true,
								message: '签单状态不能为空',
								trigger: ['blur', 'change']
							}]
						}
					}
				});
			},

			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/attendance/sys/monthlyAttendance/delete",
					data: {
						_id: item._id
					}
				});
			},

			onDetail(item) {
				this.detailDialog.data = {
					...item,
					employee_name: item.employees ? item.employees.employee_name : (item.employee_name || '')
				};
				this.detailDialog.show = true;
			},

			getSalaryTypeTag(type) {
				const map = {
					1: '',
					2: 'success',
					3: 'warning'
				};
				return map[type] || '';
			},
			getSalaryTypeText(type) {
				const map = {
					1: '月薪',
					2: '日薪',
					3: '时薪'
				};
				return map[type] || '月薪';
			},
			getSignStatusTag(status) {
				const map = {
					0: 'warning',
					1: 'success',
					2: 'info'
				};
				return map[status] || 'info';
			},
			getSignStatusText(status) {
				const map = {
					0: '待签单',
					1: '已签单',
					2: '无需签单'
				};
				return map[status] || '未知';
			},

			showGenerateDialog() {
				this.generateForm.attendance_ym = nowym;
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
						attendance_ym: this.generateForm.attendance_ym
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
			},

			async exportExcelAll() {
				const {
					attendance_ym
				} = this.queryForm1.formData;
				if (vk.pubfn.isNull(attendance_ym)) {
					return vk.alert('请先选择考勤月份');
				}

				uni.showLoading({
					title: '正在获取数据...'
				});

				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/attendance/sys/monthlyAttendance/getList',
						data: {
							formData: this.queryForm1.formData,
							pageIndex: 1,
							pageSize: -1
						}
					});
					if (res.code !== 0) {
						uni.hideLoading();
						return vk.alert(res.msg || '获取数据失败');
					}
					const listData = res.rows || [];
					if (listData.length === 0) {
						uni.hideLoading();
						return vk.alert('无数据可导出');
					}

					const ExcelJS = require('exceljs');
					const FileSaver = require('file-saver');

					const workbook = new ExcelJS.Workbook();
					const worksheet = workbook.addWorksheet('月度考勤汇总', {
						views: [{
							state: 'frozen',
							ySplit: 1
						}]
					});

					const columnDefs = [{
							header: '序号',
							key: 'index',
							width: 8
						},
						{
							header: '考勤月份',
							key: 'attendance_ym',
							width: 12
						},
						{
							header: '员工工号',
							key: 'employee_id',
							width: 15
						},
						{
							header: '身份证号码',
							key: 'card',
							width: 22
						},
						{
							header: '员工姓名',
							key: 'employee_name',
							width: 12
						},
						{
							header: '计薪方式',
							key: 'salary_type',
							width: 10
						},
						{
							header: '应出勤天数',
							key: 'should_days',
							width: 12
						},
						{
							header: '实出勤天数',
							key: 'actual_days',
							width: 12
						},
						{
							header: '应出勤时长',
							key: 'should_minutes',
							width: 12
						},
						{
							header: '实际出勤时长',
							key: 'actual_minutes',
							width: 12
						},
						{
							header: '迟到(分)',
							key: 'late_minutes',
							width: 10
						},
						{
							header: '早退(分)',
							key: 'early_minutes',
							width: 10
						},
						{
							header: '旷工(分)',
							key: 'absent_minutes',
							width: 10
						},
						{
							header: '调休加班(分)',
							key: 'overtime_compensatory_minutes',
							width: 14
						},
						{
							header: '计薪加班(分)',
							key: 'overtime_paid_minutes',
							width: 14
						},
						{
							header: '请假(分)',
							key: 'leave_minutes',
							width: 10
						},
						{
							header: '出差(分)',
							key: 'trip_minutes',
							width: 10
						},
						{
							header: '外出(分)',
							key: 'outing_minutes',
							width: 10
						},
						{
							header: '调休(分)',
							key: 'compensatory_minutes',
							width: 10
						},
						{
							header: '是否豁免',
							key: 'exempted',
							width: 10
						},
						{
							header: '全勤',
							key: 'full_attendance',
							width: 10
						}
					];
					worksheet.columns = columnDefs;

					const SALARY_TYPE_MAP = {
						1: '月薪',
						2: '日薪',
						3: '时薪'
					};

					listData.forEach((item, idx) => {
						worksheet.addRow({
							index: idx + 1,
							attendance_ym: item.attendance_ym,
							employee_id: item.employee_id,
							card: item.card,
							employee_name: item.employees ? item.employees.employee_name : (item
								.employee_name || ''),
							salary_type: SALARY_TYPE_MAP[item.salary_type] || '',
							should_days: item.should_days,
							actual_days: item.actual_days,
							should_minutes: item.should_minutes,
							actual_minutes: item.actual_minutes,
							late_minutes: item.late_minutes,
							early_minutes: item.early_minutes,
							absent_minutes: item.absent_minutes,
							overtime_compensatory_minutes: item.overtime_compensatory_minutes || 0,
							overtime_paid_minutes: item.overtime_paid_minutes || 0,
							leave_minutes: item.leave_minutes,
							trip_minutes: item.trip_minutes,
							outing_minutes: item.outing_minutes,
							compensatory_minutes: item.compensatory_minutes,
							exempted: item.exempted ? '豁免' : '正常',
							full_attendance: item.full_attendance ? '是' : '否'
						});
					});

					uni.showLoading({
						title: '正在生成文件...'
					});
					const buffer = await workbook.xlsx.writeBuffer();
					const blob = new Blob([buffer], {
						type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					});
					FileSaver.saveAs(blob, `${attendance_ym}月度考勤汇总.xlsx`);

					uni.hideLoading();
					vk.alert('导出成功！');
				} catch (err) {
					console.error('导出失败:', err);
					uni.hideLoading();
					vk.alert(err.message || '导出失败，请重试');
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