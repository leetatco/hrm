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
					<el-date-picker v-model="generateForm.dateRange" type="daterange" range-separator="至"
						start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"
						style="width: 100%"></el-date-picker>
				</el-form-item>
				<el-form-item label="员工" prop="employee_id">
					<vk-data-input-table-select v-model="generateForm.employee_ids" multiple
						action="admin/hrm/employees/sys/getList" placeholder="全部员工（留空则计算所有）" :columns="[
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
			<view v-if="detailDialog.loading" style="text-align:center;padding:50px;">
				<i class="el-icon-loading" style="font-size:30px;"></i>
				<p>加载中...</p>
			</view>
			<view v-else-if="detailDialog.data" style="max-height:70vh;overflow-y:auto;">

				<!-- 考勤信息 -->
				<el-card shadow="never" class="detail-card">
					<div slot="header"><span>考勤信息</span></div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="员工工号">{{ detailDialog.data.employee_id }}</el-descriptions-item>
						<el-descriptions-item
							label="员工姓名">{{ detailDialog.data.employee_name || '-' }}</el-descriptions-item>
						<el-descriptions-item
							label="日期">{{ vk.pubfn.timeFormat(new Date(detailDialog.data.attendance_date), 'yyyy-MM-dd')}}</el-descriptions-item>
						<el-descriptions-item
							label="班次">{{ detailDialog.data.shift_name || '-' }}</el-descriptions-item>
						<el-descriptions-item label="迟到">{{ vk.myfn.formatMinutes(detailDialog.data.late_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="早退">{{ vk.myfn.formatMinutes(detailDialog.data.early_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="旷工">{{ vk.myfn.formatMinutes(detailDialog.data.absent_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="加班">{{ vk.myfn.formatMinutes(detailDialog.data.overtime_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="请假">{{ vk.myfn.formatMinutes(detailDialog.data.leave_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="出差">{{ vk.myfn.formatMinutes(detailDialog.data.trip_minutes) }}</el-descriptions-item>
						<el-descriptions-item label="外出">{{ vk.myfn.formatMinutes(detailDialog.data.outing_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="调休">{{ vk.myfn.formatMinutes(detailDialog.data.compensatory_minutes) }}</el-descriptions-item>
						<el-descriptions-item
							label="补卡">{{ detailDialog.data.remedy_flag ? '是' : '否' }}</el-descriptions-item>
						<el-descriptions-item label="状态">
							<el-tag :type="getStatusTag(detailDialog.data.attendance_status)">
								{{ getStatusText(detailDialog.data.attendance_status) }}
							</el-tag>
						</el-descriptions-item>
					</el-descriptions>
				</el-card>

				<!-- 打卡记录 -->
				<el-card shadow="never" class="detail-card" style="margin-top:15px;"
					v-if="detailDialog.data.segments && detailDialog.data.segments.length > 0">
					<div slot="header"><span>打卡记录</span></div>
					<el-timeline>
						<el-timeline-item v-for="(seg, index) in detailDialog.data.segments" :key="index"
							:timestamp="`${seg.segment_name} ${seg.start_time}~${seg.end_time}`" placement="top">
							<view style="display: flex; flex-wrap: wrap; gap: 20rpx;">
								<view>
									<text style="font-weight: bold;">签到：</text>
									<text style="color: #409EFF;" v-if="seg.clock_in">{{ seg.clock_in }}</text>
									<text style="color: #F56C6C;" v-else>缺卡</text>
								</view>
								<view>
									<text style="font-weight: bold;">签退：</text>
									<text style="color: #67C23A;" v-if="seg.clock_out">{{ seg.clock_out }}</text>
									<text style="color: #F56C6C;" v-else>缺卡</text>
								</view>
								<view v-if="seg.late_minutes > 0" style="color: #E6A23C;">
									迟到 {{ seg.late_minutes }} 分钟
								</view>
								<view v-if="seg.early_minutes > 0" style="color: #E6A23C;">
									早退 {{ seg.early_minutes }} 分钟
								</view>
							</view>
						</el-timeline-item>
					</el-timeline>
				</el-card>

				<!-- 加班明细 -->
				<el-card shadow="never" class="detail-card" style="margin-top:15px;"
					v-if="detailDialog.data.overtime_records && detailDialog.data.overtime_records.length > 0">
					<div slot="header"><span>加班明细</span></div>
					<el-table :data="detailDialog.data.overtime_records" border size="small">
						<el-table-column label="日期" width="120">
							<template slot-scope="scope">
								{{ vk.pubfn.timeFormat(new Date(scope.row.overtime_date), 'yyyy-MM-dd') }}
							</template>
						</el-table-column>
						<el-table-column label="类型" width="120">
							<template slot-scope="scope">
								{{ scope.row.overtime_type === 'paid' ? '计薪' : '调休' }}
							</template>
						</el-table-column>
						<el-table-column label="时长" width="120">
							<template slot-scope="scope">
								{{ vk.myfn.formatMinutes(scope.row.total_minutes) }}
							</template>
						</el-table-column>
						<el-table-column label="时段">
							<template slot-scope="scope">
								<text v-if="scope.row.morning_range">上午
									{{ scope.row.morning_range[0] }}~{{ scope.row.morning_range[1] }}；</text>
								<text v-if="scope.row.afternoon_range">下午
									{{ scope.row.afternoon_range[0] }}~{{ scope.row.afternoon_range[1] }}</text>
							</template>
						</el-table-column>
					</el-table>
				</el-card>

				<!-- 请假明细 -->
				<el-card shadow="never" class="detail-card" style="margin-top:15px;"
					v-if="detailDialog.data.leave_records && detailDialog.data.leave_records.length > 0">
					<div slot="header"><span>请假明细</span></div>
					<el-table :data="detailDialog.data.leave_records" border size="small">
						<el-table-column prop="leave_name" label="类型" width="120"></el-table-column>
						<el-table-column label="时长" width="120">
							<template slot-scope="scope">
								{{ vk.myfn.formatMinutes(scope.row.total_minutes) }}
							</template>
						</el-table-column>
						<el-table-column prop="reason" label="原因"></el-table-column>
					</el-table>
				</el-card>

				<!-- 出差明细 -->
				<el-card shadow="never" class="detail-card" style="margin-top:15px;"
					v-if="detailDialog.data.trip_records && detailDialog.data.trip_records.length > 0">
					<div slot="header"><span>出差明细</span></div>
					<el-table :data="detailDialog.data.trip_records" border size="small">
						<el-table-column prop="trip_location" label="地点"></el-table-column>
						<el-table-column label="开始时间">
							<template slot-scope="scope">
								{{ vk.pubfn.timeFormat(new Date(scope.row.start_time), 'yyyy-MM-dd hh:mm') }}
							</template>
						</el-table-column>
						<el-table-column label="结束时间">
							<template slot-scope="scope">
								{{ vk.pubfn.timeFormat(new Date(scope.row.end_time), 'yyyy-MM-dd hh:mm') }}
							</template>
						</el-table-column>
						<el-table-column label="时长">
							<template slot-scope="scope">
								{{ vk.myfn.formatMinutes(scope.row.total_minutes) }}
							</template>
						</el-table-column>
					</el-table>
				</el-card>

				<!-- 外出明细 -->
				<el-card shadow="never" class="detail-card" style="margin-top:15px;"
					v-if="detailDialog.data.outing_records && detailDialog.data.outing_records.length > 0">
					<div slot="header"><span>外出明细</span></div>
					<el-table :data="detailDialog.data.outing_records" border size="small">
						<el-table-column prop="outing_title" label="外出地点"></el-table-column>
						<el-table-column label="类型" width="120">
							<template slot-scope="scope">
								{{ getOutingTypeText(scope.row.outing_type) }}
							</template>
						</el-table-column>
						<el-table-column prop="start_time" label="开始时间" width="100"></el-table-column>
						<el-table-column prop="end_time" label="结束时间" width="100"></el-table-column>
						<el-table-column label="时长" width="120">
							<template slot-scope="scope">
								{{ vk.myfn.formatMinutes(scope.row.total_minutes) }}
							</template>
						</el-table-column>
						<el-table-column prop="outing_reason" label="外出事由"></el-table-column>
					</el-table>
				</el-card>

				<!-- 调休明细 -->
				<el-card shadow="never" class="detail-card" style="margin-top:15px;"
					v-if="detailDialog.data.compensatory_records && detailDialog.data.compensatory_records.length > 0">
					<div slot="header"><span>调休明细</span></div>
					<el-table :data="detailDialog.data.compensatory_records" border size="small">
						<el-table-column label="时长" width="120">
							<template slot-scope="scope">
								{{ vk.myfn.formatMinutes(scope.row.total_minutes) }}
							</template>
						</el-table-column>
						<el-table-column prop="reason" label="原因"></el-table-column>
					</el-table>
				</el-card>

				<!-- 补卡明细 -->
				<el-card shadow="never" class="detail-card" style="margin-top:15px;"
					v-if="detailDialog.data.remedy_records && detailDialog.data.remedy_records.length > 0">
					<div slot="header"><span>补卡明细</span></div>
					<el-table :data="detailDialog.data.remedy_records" border size="small">
						<el-table-column label="类型">
							<template slot-scope="scope">
								{{ scope.row.miss_type === 'clock_in' ? '上班签到卡' : '下班签退卡' }}
							</template>
						</el-table-column>
						<el-table-column prop="miss_time" label="时间"></el-table-column>
						<el-table-column label="原因">
							<template slot-scope="scope">
								<el-tag :type="scope.row.miss_reason === 'work_need' ? 'success' : 'info'" size="small">
									{{ scope.row.miss_reason === 'work_need' ? '因公签卡' : '其他原因' }}
								</el-tag>
							</template>
						</el-table-column>
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
							width: colWidth - 60,
							formatter: (val) => val ? vk.pubfn.timeFormat(new Date(val), 'yyyy-MM-dd') : ''
						},
						{
							key: "shift_name",
							title: "班次",
							type: "text",
							width: colWidth - 60
						},
						{
							key: "punch_records",
							title: "打卡记录",
							type: "text",
							width: colWidth * 2,
							formatter: (val, row) => {
								if (!row.segments || row.segments.length === 0) return '-';
								const records = [];
								row.segments.forEach(seg => {
									const inTime = seg.clock_in || '缺卡';
									const outTime = seg.clock_out || '缺卡';
									records.push(`${seg.segment_name} ${inTime}~${outTime}`);
								});
								return records.join('；');
							}
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
							key: "remedy_flag",
							title: "补卡",
							type: "tag",
							width: colWidth - 80,
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
				generateDialog: {
					show: false
				},
				generateForm: {
					dateRange: [],
					employee_ids: []
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
							valueFormat: "yyyy-MM-dd",
							formatter: (val) => val ? vk.pubfn.timeFormat(new Date(val), 'yyyy-MM-dd') : ''
						},
						{
							key: "shift_name",
							title: "班次",
							type: "text"
						},
						{
							key: "punch_records",
							title: "打卡记录",
							type: "text",
							formatter: (val, row) => {
								if (!row.segments || row.segments.length === 0) return '-';
								return row.segments.map(seg =>
									`${seg.segment_name} ${seg.clock_in || '缺卡'}~${seg.clock_out || '缺卡'}`
								).join('；');
							}
						},
						{
							key: "late_minutes",
							title: "迟到",
							type: "number",
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "early_minutes",
							title: "早退",
							type: "number",
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "absent_minutes",
							title: "旷工",
							type: "number",
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "overtime_minutes",
							title: "加班",
							type: "text",
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "leave_minutes",
							title: "请假",
							type: "text",
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "trip_minutes",
							title: "出差",
							type: "text",
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "outing_minutes",
							title: "外出",
							type: "text",
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "compensatory_minutes",
							title: "调休",
							type: "text",
							formatter: (val) => vk.myfn.formatMinutes(val)
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
				this.detailDialog.data = null;
				this.$nextTick(() => {
					this.detailDialog.title = '考勤详情';
					this.$set(this.detailDialog, 'data', {
						...JSON.parse(JSON.stringify(item || {})),
						employee_name: item.employeeInfo ? item.employeeInfo.employee_name : ''
					});
					this.detailDialog.loading = false;
					this.$forceUpdate();
				});
			},

			getStatusTag(status) {
				const map = {
					0: 'danger',
					1: 'success',
					2: 'warning',
					3: 'info',
					4: 'warning',
					5: 'danger',
					6: 'warning'
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
					5: '旷工',
					6: '加班'
				};
				return map[status] || status;
			},
			getOutingTypeText(type) {
				const map = {
					visit_client: '拜访客户',
					errand: '外出办事',
					meeting: '参加会议',
					other: '其他'
				};
				return map[type] || type || '未指定';
			},

			showGenerateDialog() {
				this.generateForm.dateRange = [];
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
					const params = {};
					if (this.generateForm.dateRange.length === 2) {
						params.start_date = this.generateForm.dateRange[0];
						params.end_date = this.generateForm.dateRange[1];
					}
					if (this.generateForm.employee_ids.length > 0) {
						params.employee_ids = this.generateForm.employee_ids;
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