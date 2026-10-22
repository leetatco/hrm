<template>
	<view class="page-body">
		<!-- 表格搜索组件开始 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm"></vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view>
			<el-row>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('attendance-monthly-export')" @click="exportExcelAll">
					导出全部
				</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"
			:page-sizes="pageSizes"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="500px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="110px"
				@success="form1.props.show = false;refresh();"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 详情弹窗 -->
		<vk-data-dialog v-model="detailDialog.show" :title="detailDialog.title" width="700px" top="5vh"
			:close-on-click-modal="false">
			<view v-if="detailDialog.data" style="max-height:70vh;overflow-y:auto;">
				<el-card shadow="never" class="detail-card">
					<div slot="header"><span>员工信息</span></div>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="员工工号">{{ detailDialog.data.employee_id }}</el-descriptions-item>
						<el-descriptions-item
							label="员工姓名">{{ detailDialog.data.employee_name || '-' }}</el-descriptions-item>
						<el-descriptions-item label="身份证号">{{ detailDialog.data.card || '-' }}</el-descriptions-item>
						<el-descriptions-item label="考勤月份">{{ detailDialog.data.attendance_ym }}</el-descriptions-item>
						<el-descriptions-item label="统计周期">{{ detailDialog.data.period_start }} ~
							{{ detailDialog.data.period_end }}</el-descriptions-item>
					</el-descriptions>
				</el-card>

				<el-card shadow="never" class="detail-card" style="margin-top:15px;">
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
				loading: false,

				// ========== 表格 ==========
				table1: {
					action: "admin/hrm/attendance/sys/monthlyAttendance/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission(
									'attendance-monthly-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission(
									'attendance-monthly-edit')
							}
						}
					],
					columns: [{
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
							width: colWidth - 100,
							formatter: (val, row) => row.employeeInfo ? row.employeeInfo.employee_name : (
								row.employee_name || '')
						},
						{
							key: "signature_url",
							title: "签名",
							type: "image",
							fixed: true,
							width: colWidth - 100
						},
						{
							key: "attendance_ym",
							title: "考勤月份",
							type: "text",
							fixed: true,
							width: colWidth - 100
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
							key: "contract_days",
							title: "合同天数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "should_days",
							title: "应出勤天数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "diff_days",
							title: "差异天数",
							type: "number",
							width: colWidth - 60,
							formatter: (val) => val > 0 ? val : 0
						},
						{
							key: "sign_status",
							title: "签单状态",
							type: "tag",
							width: colWidth - 80,
							data: [{
									value: 0,
									label: "待签单",
									tagType: "warning"
								},
								{
									value: 1,
									label: "已签单",
									tagType: "success"
								},
								{
									value: 2,
									label: "无需签单",
									tagType: "info"
								}
							]
						},
						{
							key: "sign_date",
							title: "签单时间",
							type: "date",
							valueFormat: "yyyy-MM-dd hh:mm",
							dateType: "datetime",
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
					],
					multipleSelection: [],
					selectItem: ""
				},

				// ========== 查询 ==========
				queryForm1: {
					formData: {
						sign_status: 0,
						attendance_ym: nowym
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
							key: "attendance_ym",
							title: "考勤日期",
							type: "date",
							dateType: "months",
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
							mode: '[]'
						},
						{
							key: "sign_status",
							title: "签单状态",
							type: "select",
							clearable: false,
							width: colWidth - 80,
							data: [{
									value: 0,
									label: "待签单"
								},
								{
									value: 1,
									label: "已签单"
								},
								{
									value: 2,
									label: "无需签单"
								}
							],
							mode: "="
						}
					]
				},

				// ========== 编辑表单 ==========
				form1: {
					data: {},
					props: {
						action: "",
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
								message: "签单状态不能为空",
								trigger: ['blur', 'change']
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				},

				// ========== 详情 ==========
				detailDialog: {
					show: false,
					title: '合同天数差异签单详情',
					data: null
				},

				formDatas: {}
			};
		},
		onLoad(options = {}) {
			this.options = options;
			this.init(options);
		},
		onReady() {},
		onShow() {},
		onHide() {},
		methods: {
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},
			async search() {
				if (this.queryForm1.formData.attendance_ym.length > 0) {
					this.queryForm1.formData.attendance_ym = [...this.queryForm1.formData.attendance_ym].sort()
				}
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			getCurrentRow() {
				return this.$refs.table1.getCurrentRow();
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
				this.form1.props.action = 'admin/hrm/attendance/sys/monthlyAttendance/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑签单状态';
				this.form1.props.show = true;
				this.form1.data = {
					...item,
					sign_status: item.sign_status === 1 ? 1 : 0
				};
			},

			deleteBtn({
				item,
				deleteFn
			}) {},

			onDetail(item) {
				this.detailDialog.data = {
					...item,
					employee_name: item.employeeInfo ? item.employeeInfo.employee_name : (item.employee_name ||
						'')
				};
				this.detailDialog.show = true;
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

			async fetchAllData() {
				const res = await vk.callFunction({
					url: 'admin/hrm/attendance/sys/monthlyAttendance/getList',
					data: {
						formData: this.queryForm1.formData,
						columns: this.queryForm1.columns,
						pageIndex: 1,
						pageSize: -1
					}
				});
				if (res.code === 0) {
					return res.rows || [];
				} else {
					vk.alert(res.msg || '获取数据失败');
					return [];
				}
			},

			async exportExcelAll() {
				const {
					attendance_ym
				} = this.queryForm1.formData;
				if (vk.pubfn.isNull(attendance_ym)) {
					return vk.alert('考勤月份不能为空！');
				}

				uni.showLoading({
					title: '正在获取数据...'
				});

				try {
					const listData = await this.fetchAllData();
					if (listData.length === 0) {
						uni.hideLoading();
						return vk.alert('无数据可导出');
					}

					const ExcelJS = require('exceljs');
					const FileSaver = require('file-saver');

					const workbook = new ExcelJS.Workbook();
					const worksheet = workbook.addWorksheet('合同天数差异签单', {
						views: [{
							state: 'frozen',
							ySplit: 1
						}]
					});

					const columnDefs = [{
							header: '序号',
							key: 'index',
							width: 10
						},
						{
							header: '考勤月份',
							key: 'attendance_ym',
							width: 15
						},
						{
							header: '员工工号',
							key: 'employee_id',
							width: 15
						},
						{
							header: '身份证号码',
							key: 'card',
							width: 25
						},
						{
							header: '员工姓名',
							key: 'employee_name',
							width: 15
						},
						{
							header: '签名',
							key: 'signature_url',
							width: 20
						},
						{
							header: '计薪方式',
							key: 'salary_type',
							width: 12
						},
						{
							header: '合同天数',
							key: 'contract_days',
							width: 12
						},
						{
							header: '应出勤天数',
							key: 'should_days',
							width: 12
						},
						{
							header: '差异天数',
							key: 'diff_days',
							width: 12
						},
						{
							header: '签单状态',
							key: 'sign_status',
							width: 12
						},
						{
							header: '签单时间',
							key: 'sign_date',
							width: 18
						}
					];
					worksheet.columns = columnDefs;

					const SALARY_TYPE_MAP = {
						1: '月薪',
						2: '日薪',
						3: '时薪'
					};
					const SIGN_STATUS_MAP = {
						0: '待签单',
						1: '已签单',
						2: '无需签单'
					};

					listData.forEach((item, idx) => {
						worksheet.addRow({
							index: idx + 1,
							attendance_ym: item.attendance_ym,
							employee_id: item.employee_id,
							employee_name: item.employee_name || (item.employeeInfo ? item
								.employeeInfo.employee_name : ''),
							signature_url: item.signature_url,
							card: item.card,
							salary_type: SALARY_TYPE_MAP[item.salary_type] || '',
							contract_days: item.contract_days,
							should_days: item.should_days,
							diff_days: item.diff_days,
							sign_status: SIGN_STATUS_MAP[item.sign_status] || '',
							sign_date: item.sign_date ? vk.pubfn.timeFormat(new Date(item
								.sign_date), 'yyyy-MM-dd hh:mm') : ''
						});
					});

					// ========== 分批获取签名 Base64 ==========
					const imageUrls = listData.map(item => item.signature_url).filter(Boolean);
					let base64Map = {};
					let failCount = 0;

					if (imageUrls.length > 0) {
						const BATCH_SIZE = 60;
						const total = imageUrls.length;
						const batches = [];
						for (let i = 0; i < total; i += BATCH_SIZE) {
							batches.push(imageUrls.slice(i, i + BATCH_SIZE));
						}

						for (let i = 0; i < batches.length; i++) {
							const current = Math.min((i + 1) * BATCH_SIZE, total);
							uni.showLoading({
								title: `下载签名 ${current}/${total}`
							});
							const res = await vk.callFunction({
								url: 'common/sys/getImagesBase64/index',
								data: {
									imageUrls: batches[i],
									concurrency: 5,
									timeout: 30000,
									retries: 1
								}
							});

							if (res.code === 0) {
								res.data.forEach(item => {
									if (item.success) {
										base64Map[item.url] = item.base64;
									} else {
										failCount++;
									}
								});
							} else {
								failCount += batches[i].length;
							}
						}
					}

					// ========== 嵌入图片 ==========
					uni.showLoading({
						title: '正在写入签名...'
					});

					const embedTasks = listData.map((item, idx) => {
						return new Promise((resolve) => {
							const url = item.signature_url;
							if (!url || !base64Map[url]) return resolve();

							try {
								const imageId = workbook.addImage({
									base64: base64Map[url],
									extension: 'png'
								});
								// 签名在第 6 列（F），索引 5
								worksheet.addImage(imageId, {
									tl: {
										col: 5.2,
										row: idx + 1
									},
									ext: {
										width: 80,
										height: 30
									}
								});
								worksheet.getCell(`F${idx + 2}`).value = '';
							} catch (err) {
								failCount++;
							}
							resolve();
						});
					});
					await Promise.all(embedTasks);

					// ========== 生成文件 ==========
					uni.showLoading({
						title: '正在生成文件...'
					});
					const buffer = await workbook.xlsx.writeBuffer();
					const blob = new Blob([buffer], {
						type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					});
					FileSaver.saveAs(blob, `${attendance_ym}合同天数差异签单.xlsx`);

					uni.hideLoading();

					if (failCount > 0) {
						vk.alert(`导出完成，${failCount} 张签名未能嵌入，请检查网络或重新导出`);
					} else {
						vk.alert('导出成功！');
					}

				} catch (err) {
					console.error('导出失败:', err);
					uni.hideLoading();
					vk.alert(err.message || '导出失败，请重试');
				}
			}
		},
		watch: {},
		computed: {}
	};
</script>
<style lang="scss" scoped>
	.page-body {}

	.detail-card {
		margin-bottom: 15px;
	}
</style>