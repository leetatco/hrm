<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm" />

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('attendance-leavebalance-add')"
					@click="addBtn">添加</el-button>
				<el-button type="warning" size="small" icon="el-icon-magic-stick"
					v-if="$hasRole('admin') || $hasPermission('attendance-leavebalance-generate')"
					@click="generateByRule">按年假规则生成额度</el-button>
				<el-upload style="display: inline-block; margin-left: 10px;margin-right: 10px;" accept=".xlsx, .xls"
					:auto-upload="false" :limit="1" :show-file-list="false"
					v-if="$hasRole('admin') || $hasPermission('attendance-leavebalance-import')"
					:on-change="handleChange" action="">
					<el-button type="primary" size="small" icon="el-icon-upload2">导入Excel</el-button>
				</el-upload>
				<el-button type="primary" size="small" icon="el-icon-download"
					v-if="$hasRole('admin') || $hasPermission('attendance-leavebalance-export')"
					@click="exportExcelModel">下载模板</el-button>
				<el-button type="info" size="small" icon="el-icon-document"
					v-if="$hasRole('admin') || $hasPermission('attendance-balancelog-view')"
					@click="viewLogs">额度变动日志</el-button>
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
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="140px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
		</vk-data-dialog>

		<!-- 按规则生成弹窗 -->
		<vk-data-dialog v-model="generateDialog.show" title="按年假规则生成额度" width="500px" top="10vh"
			:close-on-click-modal="false">
			<el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="100px">
				<el-form-item label="年度" prop="year" required>
					<el-input-number v-model="generateForm.year" :min="2000" :max="2100"></el-input-number>
				</el-form-item>
				<el-form-item label="员工" prop="employee_ids">
					<vk-data-input-table-select v-model="generateForm.employee_ids" multiple
						action="admin/hrm/employees/sys/getList" placeholder="全部在职员工（留空则生成所有）" :columns="[
		          { key: 'employee_id', title: '员工工号', type: 'text', idKey: true },
		          { key: 'employee_name', title: '员工姓名', type: 'text', nameKey: true }
		        ]" :queryColumns="[
		          { key: 'employee_id', title: '员工工号', type: 'text', width: 150, mode: '%%' },
		          { key: 'employee_name', title: '员工姓名', type: 'text', width: 150, mode: '%%' }
		        ]"></vk-data-input-table-select>
				</el-form-item>
				<el-alert type="info" :closable="false"
					title="将根据「年假规则配置」中的工龄分段、入职折算、试用期等规则，为员工生成当年年假额度。已存在的年假额度将被覆盖。"></el-alert>
			</el-form>
			<template v-slot:footer>
				<el-button @click="generateDialog.show = false">取消</el-button>
				<el-button type="primary" @click="doGenerate" :loading="generateLoading">开始生成</el-button>
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
				leaveTypeOptions: [],
				table1: {
					action: "admin/hrm/attendance/sys/leavebalance/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-leavebalance-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-leavebalance-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-leavebalance-delete')
						}
					],
					columns: [{
							key: "employee_id",
							title: "员工工号",
							type: "text",
							width: colWidth - 40,
							fixed: true
						},
						{
							key: "employee_name",
							title: "员工姓名",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.employeeInfo ? row.employeeInfo.employee_name : ''
						},
						{
							key: "leave_type_id",
							title: "假期类型",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.leaveTypeInfo ? row.leaveTypeInfo.leave_name : val
						},
						{
							key: "year",
							title: "年度",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "total_minutes",
							title: "总额度",
							type: "text",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "used_minutes",
							title: "已用",
							type: "text",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "remain_minutes",
							title: "剩余",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => vk.myfn.formatMinutes((row.total_minutes || 0) - (row.used_minutes || 0))
						},
						{
							key: "adjust_reason",
							title: "调整原因",
							type: "text",
							width: colWidth
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
							key: "status",
							title: "启用状态",
							type: "select",
							width: colWidth - 100,
							data: [{
									value: true,
									label: "启用"
								},
								{
									value: false,
									label: "停用"
								}
							],
							mode: "="
						}
					]
				},
				form1: {
					data: {
						employee_id: '',
						leave_type_id: '',
						year: new Date().getFullYear(),
						total_minutes: 0,
						used_minutes: 0,
						adjust_reason: '',
						status: true,
						remark: ''
					},
					props: {
						action: "",
						columns: [{
								key: "employee_id",
								title: "员工",
								type: "table-select",
								width: colWidth,
								required: true,
								action: "admin/hrm/employees/sys/getList",
								multiple: false,
								columns: [{
										key: "employee_id",
										title: "工号",
										type: "text",
										idKey: true
									},
									{
										key: "employee_name",
										title: "姓名",
										type: "text",
										nameKey: true
									}
								],
								queryColumns: [{
										key: "employee_id",
										title: "工号",
										type: "text",
										width: 150
									},
									{
										key: "employee_name",
										title: "姓名",
										type: "text",
										width: 150
									}
								]
							},
							{
								key: "leave_type_id",
								title: "假期类型",
								type: "remote-select",
								width: colWidth,
								required: true,
								action: "admin/hrm/attendance/sys/leave/getList",
								props: {
									list: "rows",
									value: "leave_code",
									label: "leave_name"
								},
								showAll: true,
								actionData: {
									pageSize: 100
								}
							},
							{
								key: "year",
								title: "年度",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "total_minutes",
								title: "总额度(分钟)",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "used_minutes",
								title: "已用额度(分钟)",
								type: "number",
								width: colWidth - 60
							},
							{
								key: "adjust_reason",
								title: "调整原因",
								type: "text",
								width: colWidth
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
							employee_id: [{
								required: true,
								message: "员工不能为空",
								trigger: "change"
							}],
							leave_type_id: [{
								required: true,
								message: "假期类型不能为空",
								trigger: "change"
							}],
							year: [{
								required: true,
								message: "年度不能为空",
								trigger: "blur"
							}],
							total_minutes: [{
								required: true,
								message: "总额度不能为空",
								trigger: "blur"
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				},
				// 按规则生成
				generateDialog: {
					show: false
				},
				generateForm: {
					year: new Date().getFullYear(),
					employee_ids: ''
				},
				generateRules: {
					year: [{ required: true, message: '请选择年度', trigger: 'blur' }]
				},
				generateLoading: false
			};
		},
		async onLoad() {
			originalForms = {
				form1: vk.pubfn.copyObject(this.form1)
			};
			// 拉取假期类型下拉选项
			const res = await vk.callFunction({
				url: 'admin/hrm/attendance/sys/leave/getList',
				data: {
					pageSize: 100,
					status: true
				}
			});
			if (res.code === 0 && res.rows) {
				this.leaveTypeOptions = res.rows.map(r => ({
					value: r.leave_code,
					label: r.leave_name
				}));
			}
		},
		methods: {
			search() {
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},
			// 跳转到额度变动日志
			viewLogs() {
				vk.navigateTo('/pages/hrm/attendance/attendance-leavebalancelog/list');
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/attendance/sys/leavebalance/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加员工额度';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/attendance/sys/leavebalance/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑员工额度';
				this.form1.props.show = true;
				this.form1.data = {
					...item
				};
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/attendance/sys/leavebalance/delete",
					data: {
						_id: item._id
					}
				});
			},

			// ========== 按年假规则生成额度 ==========
			generateByRule() {
				this.generateForm.year = new Date().getFullYear();
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
					const res = await vk.callFunction({
						url: 'admin/hrm/attendance/sys/leavebalance/generateByRule',
						data: {
							year: this.generateForm.year,
							employee_ids: this.generateForm.employee_ids && this.generateForm.employee_ids.length > 0 
							      ? this.generateForm.employee_ids 
							      : undefined
						}
					});
					if (res.code === 0) {
						vk.alert(res.msg || `成功生成 ${res.total} 条额度记录`, '提示', () => {
							this.generateDialog.show = false;
							this.refresh();
						});
					} else {
						vk.alert(res.msg || '生成失败', '提示');
					}
				} catch (e) {
					console.error(e);
					vk.alert('请求异常：' + (e.message || '未知错误'), '提示');
				} finally {
					this.generateLoading = false;
				}
			},

			// Excel 导入
			handleChange(file) {
				let typeObj = {
					employee_id: {
						"title": "员工工号",
						"type": "text"
					},
					leave_type_id: {
						"title": "假期类型代码",
						"type": "text"
					},
					year: {
						"title": "年度",
						"type": "number"
					},
					total_minutes: {
						"title": "总额度(分钟)",
						"type": "number"
					},
					used_minutes: {
						"title": "已用额度(分钟)",
						"type": "number"
					},
					adjust_reason: {
						"title": "调整原因",
						"type": "text"
					},
					remark: {
						"title": "备注",
						"type": "text"
					}
				};
				let count = 0;
				let errorRow = "";
				try {
					this.$iexcel.importExcel(file.raw, typeObj, async (res) => {
						for (const item of res) {
							if (vk.pubfn.isNull(item.employee_id) || vk.pubfn.isNull(item.leave_type_id) || vk
								.pubfn.isNull(item.year)) {
								vk.alert('员工工号、假期类型、年度不能为空');
								break;
							}
							let addRes = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/leavebalance/add',
								title: '请求中...',
								data: item
							});
							if (addRes.code === 0) {
								count++;
							} else {
								errorRow = JSON.stringify(item);
								break;
							}
						}
						if (count === 0) {
							vk.alert(`错误数据:${errorRow}`, "导入Excel失败", "确定");
						} else {
							vk.alert(`导入成功${count}条`, "提示", () => {
								this.refresh();
							});
						}
					});
				} catch (error) {
					console.log(error);
				}
			},

			// 下载导入模板
			exportExcelModel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '假期额度导入模板',
					title: "正在导出模板...",
					columns: [{
							key: "employee_id",
							title: "员工工号",
							type: "text"
						},
						{
							key: "leave_type_id",
							title: "假期类型代码",
							type: "text"
						},
						{
							key: "year",
							title: "年度",
							type: "number"
						},
						{
							key: "total_minutes",
							title: "总额度(分钟)",
							type: "number"
						},
						{
							key: "used_minutes",
							title: "已用额度(分钟)",
							type: "number"
						},
						{
							key: "adjust_reason",
							title: "调整原因",
							type: "text"
						},
						{
							key: "remark",
							title: "备注",
							type: "text"
						}
					],
					pageIndex: 1,
					pageSize: 1
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