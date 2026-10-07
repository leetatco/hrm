<template>
	<view class="page-body">
		<!-- 页面内容开始 -->

		<!-- 表格搜索组件开始 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search"></vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view>
			<el-row>
				<el-button type="success" v-if="$hasRole('admin') || $hasPermission('hrm-salary-add')" size="small"
					icon="el-icon-circle-plus-outline" @click="autoSalary">自动生成工资表</el-button>
				<el-upload style="display: inline-block;margin-left: 20rpx;margin-right: 20rpx;" accept=".xlsx, .xls"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-add')" :auto-upload="false" :limit="1"
					:show-file-list="false" :on-change="handleChange" :file-list="fileList" action="">
					<el-button type="success" size="small" icon="el-icon-upload2">导入excel</el-button>
				</el-upload>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-export')" @click="exportExcelAll"> 导出全部
				</el-button>
				<el-button type="primary" size="small" icon="el-icon-tickets" @click="exportExcelModel"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-add')"> 下载模版
				</el-button>
				<el-button type="danger" size="small" icon="el-icon-delete" @click="deleteAll" v-if="$hasRole('admin')">
					删除考勤日期数据
				</el-button>
				<!-- 批量操作 -->
				<el-dropdown v-if="table1.multipleSelection && ($hasRole('admin') || $hasPermission('hrm-salary-edit'))"
					:split-button="false" trigger="click" @command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0">
						批量审核<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">通过</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange" :show-summary="true"
			:summary-method="summaryMethod" :page-sizes="pageSizes"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="800px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :before-action="form1.props.beforeAction"
				:columns='form1.props.columns' label-width="110px" @success="form1.props.show = false;refresh();"
				:inline="true" :columnsNumber="2"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	let vk = uni.vk;
	let originalForms = {};
	const colWidth = 200;

	let nowy = new Date(vk.pubfn.getOffsetTime(new Date(), {
		mode: "before", // after 之后 before 之前
	})).getFullYear();

	let nowm = new Date(vk.pubfn.getOffsetTime(new Date(), {
		mode: "before", // after 之后 before 之前
	})).getMonth();

	let nowm1 = nowm > 9 ? nowm : `0${nowm}`;
	const nowym = vk.myfn.normalizeMonth(`${nowy}-${nowm1}`);

	export default {
		data() {
			return {
				pageSizes: [1, 5, 10, 20, 50, 100, 500, 1000],
				fileList: [],
				sumList: [],
				loading: false,

				// ========== 表格 ==========
				table1: {
					action: "admin/hrm/salary/sys/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('hrm-salary-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('hrm-salary-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('hrm-salary-delete')
						}
					],
					columns: [{
							key: "attendance_ym",
							title: "考勤月份",
							type: "text",
							fixed: true,
							width: colWidth - 100
						},
						{
							key: "employee_name",
							title: "姓名",
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
							key: "department_name",
							title: "部门",
							type: "text",
							fixed: true,
							width: colWidth
						},
						{
							key: "position_name",
							title: "岗位",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "hire_date",
							title: "入职日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM-dd",
							width: colWidth - 100
						},
						{
							key: "resign_date",
							title: "离职日期",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "total_salary",
							title: "综合",
							type: "number",
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
							key: "base_salary",
							title: "基本工资",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "performance_salary",
							title: "绩效工资",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "overtime_fee",
							title: "固定加班",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "penalty_fund",
							title: "社保补偿金",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "housing_fund",
							title: "公积补偿金",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "annual_allowance",
							title: "年度补偿金",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "floating_bonus",
							title: "浮动奖励",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "confidentiality_fee",
							title: "保密费",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "work_days",
							title: "应勤天数",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "real_days",
							title: "实际出勤",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "gross_salary",
							title: "应发工资",
							type: "number",
							width: colWidth - 50
						},
						{
							key: "overtime_cost",
							title: "加班费",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "free_cost",
							title: "放假补助",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "grant",
							title: "补助",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "agency_fee",
							title: "介绍费",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "other_cost",
							title: "其他",
							type: "number",
							width: colWidth - 50
						},
						{
							key: "we_cost",
							title: "水电",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "clothes_cost",
							title: "工衣",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "earlytime_cost",
							title: "迟到早退",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "missed_cost",
							title: "未打卡",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "loan_cost",
							title: "借款",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "this_month_sb",
							title: "本月社保",
							type: "number",
							width: colWidth - 50
						},
						{
							key: "this_month_dk",
							title: "本月代扣部份",
							type: "number",
							width: colWidth - 50
						},
						{
							key: "dkgs",
							title: "代扣个税",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "real_salary",
							title: "实发工资",
							type: "number",
							width: colWidth - 50
						},
						{
							key: "comment",
							title: "备注",
							type: "text",
							width: colWidth,
							show: ["detail"]
						},
						{
							key: "company_sb",
							title: "公司部份社保",
							type: "number",
							width: colWidth - 50
						},
						{
							key: "company_gjj",
							title: "公司部份公积金",
							type: "number",
							width: colWidth - 50
						},
						{
							key: "last_month_sb",
							title: "下月社保",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "last_month_gjj",
							title: "下月公积金",
							type: "number",
							width: colWidth - 100
						},
						{
							key: "enable_fd1",
							title: "财务审核一级",
							type: "switch",
							activeValue: true,
							inactiveValue: false,
							width: colWidth - 50,
							watch: (res) => {
								let {
									value,
									row
								} = res;
								vk.callFunction({
									url: "admin/hrm/salary/sys/update",
									title: value ? "通过中..." : "未通过中...",
									data: {
										_id: row._id,
										card: row.card,
										attendance_ym: row.attendance_ym,
										enable_fd1: value
									},
									success: data => {
										this.refresh();
									}
								});
							}
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
						attendance_ym: nowym,
						enable_fd1: false
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
							key: "card",
							title: "员工",
							type: "table-select",
							placeholder: "选择员工",
							action: "admin/hrm/employees/sys/getList",
							multiple: false,
							columns: [{
									key: "card",
									title: "身份证号码",
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
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									width: 150,
									mode: "%%"
								},
								{
									key: "card",
									title: "身份证号码",
									type: "text",
									width: 150,
									mode: "%%"
								}
							]
						},
						{
							key: "enable_fd1",
							title: "财务审核一级",
							type: "select",
							show: ["none"],
							data: [{
									value: true,
									label: "已通过"
								},
								{
									value: false,
									label: "未通过"
								}
							],
							mode: "="
						},
						{
							key: "enable_fd2",
							title: "财务审核二级",
							type: "select",
							show: ["none"],
							data: [{
									value: true,
									label: "已通过"
								},
								{
									value: false,
									label: "未通过"
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
						beforeAction: (formData) => {
							formData = this.calculateSalary(formData);
							return formData;
						},
						action: "",
						columns: [{
								key: "attendance_ym",
								title: "考勤月份",
								type: "date",
								dateType: "month",
								disabled: true,
								valueFormat: "yyyy-MM",
								format: "yyyy-MM",
								width: colWidth
							},
							{
								key: "card",
								title: "姓名",
								type: "table-select",
								disabled: true,
								placeholder: "选择员工",
								action: "admin/hrm/employees/sys/getList",
								multiple: false,
								columns: [{
										key: "card",
										title: "身份证号码",
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
										key: "employee_name",
										title: "员工姓名",
										type: "text",
										width: 150,
										mode: "%%"
									},
									{
										key: "card",
										title: "身份证号码",
										type: "text",
										width: 150,
										mode: "%%"
									}
								]
							},
							{
								key: "total_salary",
								title: "综合",
								type: "number",
								disabled: true,
								width: colWidth
							},
							{
								key: "base_salary",
								title: "基本工资",
								type: "number",
								disabled: true,
								width: colWidth
							},
							{
								key: "performance_salary",
								title: "绩效工资",
								disabled: true,
								type: "number",
								width: colWidth
							},
							{
								key: "overtime_fee",
								title: "固定加班",
								type: "number",
								disabled: true,
								width: colWidth
							},
							{
								key: "penalty_fund",
								title: "社保补偿金",
								disabled: true,
								type: "number",
								width: colWidth
							},
							{
								key: "housing_fund",
								title: "公积补偿金",
								disabled: true,
								type: "number",
								width: colWidth
							},
							{
								key: "annual_allowance",
								title: "年度补偿金",
								disabled: true,
								type: "number",
								width: colWidth
							},
							{
								key: "floating_bonus",
								title: "浮动奖励",
								disabled: true,
								type: "number",
								width: colWidth
							},
							{
								key: "confidentiality_fee",
								title: "保密费",
								disabled: true,
								type: "number",
								width: colWidth
							},
							{
								key: "work_days",
								title: "应勤天数",
								disabled: true,
								type: "number",
								width: colWidth
							},
							{
								key: "real_days",
								title: "实际出勤",
								disabled: true,
								type: "number",
								width: colWidth
							},
							{
								key: "gross_salary",
								title: "应发工资",
								disabled: true,
								type: "number",
								width: colWidth
							},
							{
								key: "overtime_cost",
								title: "加班费",
								type: "number",
								min: -10000,
								controls: true,
								width: colWidth
							},
							{
								key: "free_cost",
								title: "放假补助",
								type: "number",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								width: colWidth
							},
							{
								key: "grant",
								title: "补助",
								type: "number",
								min: -10000,
								controls: true,
								width: colWidth
							},
							{
								key: "agency_fee",
								title: "介绍费",
								type: "number",
								min: -10000,
								controls: true,
								width: colWidth
							},
							{
								key: "other_cost",
								title: "其他",
								type: "number",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								width: colWidth
							},
							{
								key: "we_cost",
								title: "水电",
								type: "number",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								width: colWidth
							},
							{
								key: "clothes_cost",
								title: "工衣",
								type: "number",
								min: -10000,
								controls: true,
								width: colWidth
							},
							{
								key: "earlytime_cost",
								title: "迟到早退",
								type: "number",
								min: -10000,
								controls: true,
								width: colWidth
							},
							{
								key: "missed_cost",
								title: "未打卡",
								type: "number",
								min: -10000,
								controls: true,
								width: colWidth
							},
							{
								key: "loan_cost",
								title: "借款",
								type: "number",
								min: -10000,
								controls: true,
								width: colWidth
							},
							{
								key: "this_month_sb",
								title: "本月社保",
								type: "number",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								width: colWidth
							},
							{
								key: "this_month_dk",
								title: "本月代扣部份",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								type: "number",
								width: colWidth
							},
							{
								key: "dkgs",
								title: "代扣个税",
								type: "number",
								min: -10000,
								controls: true,
								precision: 2,
								step: 0.01,
								width: colWidth
							},
							{
								key: "real_salary",
								title: "实发工资",
								type: "number",
								disabled: true,
								width: colWidth
							},
							{
								key: "company_sb",
								title: "公司部份社保",
								type: "number",
								width: colWidth
							},
							{
								key: "company_gjj",
								title: "公司部份公积金",
								type: "number",
								width: colWidth
							},
							{
								key: "last_month_sb",
								title: "下月社保",
								type: "number",
								width: colWidth
							},
							{
								key: "last_month_gjj",
								title: "下月公积金",
								type: "number",
								width: colWidth
							},
							{
								key: "enable_fd1",
								title: "财务审核一级",
								type: "switch",
								width: colWidth
							},
							{
								key: "comment",
								title: "备注",
								type: "textarea",
								maxlength: "500",
								showWordLimit: true,
								width: colWidth,
								autosize: {
									minRows: 4,
									maxRows: 10
								}
							}
						],
						rules: {
							attendance_ym: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							employee_name: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				},

				formDatas: {}
			};
		},
		onLoad(options = {}) {
			this.options = options;
			this.init(options);
			this.getSumList();
		},
		onReady() {},
		onShow() {},
		onHide() {},

		methods: {
			// ========== 合计 ==========
			async getSumList() {
				const attendance_ym = this.queryForm1.formData.attendance_ym;
				let res = await vk.callFunction({
					url: 'admin/hrm/salary/pub/getSumList',
					title: '请求中...',
					data: {
						attendance_ym
					}
				});
				if (res.code == 0) {
					this.sumList = res.rows || [];
				} else {
					this.sumList = [];
				}
			},

			summaryMethod({
				columns,
				data
			}) {
				const totalSummary = this.sumList[0] || {};
				const means = [''];
				const totalOption = [{
						key: 'work_days',
						unit: '',
						precision: 2
					},
					{
						key: 'real_days',
						unit: '',
						precision: 2
					},
					{
						key: 'gross_salary',
						unit: '元',
						precision: 2
					},
					{
						key: 'overtime_cost',
						unit: '元',
						precision: 2
					},
					{
						key: 'free_cost',
						unit: '元',
						precision: 2
					},
					{
						key: 'grant',
						unit: '元',
						precision: 2
					},
					{
						key: 'agency_fee',
						unit: '元',
						precision: 2
					},
					{
						key: 'other_cost',
						unit: '元',
						precision: 2
					},
					{
						key: 'typhoon_cost',
						unit: '元',
						precision: 2
					},
					{
						key: 'liunian_cost',
						unit: '元',
						precision: 2
					},
					{
						key: 'we_cost',
						unit: '元',
						precision: 2
					},
					{
						key: 'clothes_cost',
						unit: '元',
						precision: 2
					},
					{
						key: 'earlytime_cost',
						unit: '元',
						precision: 2
					},
					{
						key: 'missed_cost',
						unit: '元',
						precision: 2
					},
					{
						key: 'loan_cost',
						unit: '元',
						precision: 2
					},
					{
						key: 'this_month_sb',
						unit: '元',
						precision: 2
					},
					{
						key: 'this_month_dk',
						unit: '元',
						precision: 2
					},
					{
						key: 'dkgs',
						unit: '元',
						precision: 2
					},
					{
						key: 'real_salary',
						unit: '元',
						precision: 2
					}
				];

				for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
					const column = columns[columnIndex];
					if (columnIndex === 0) {
						means.push('合计');
					} else {
						const columnItem = totalOption.find(item => item.key === column.property);
						if (!columnItem) {
							means.push('');
							continue;
						}
						const {
							key,
							precision = 2,
							unit
						} = columnItem;
						// ★ 修正：直接用 totalSummary[key]，不再引用 totalCommon
						let totalValue = totalSummary[key] || 0;
						totalValue = vk.pubfn.toDecimal(totalValue, precision);
						means[columnIndex] = `<span style="color: red">${totalValue}${unit}</span>`;
					}
				}
				return [means];
			},

			// ========== 删除 ==========
			async deleteAll() {
				try {
					if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
						return vk.alert(`考勤日期不能为空！`);
					}
					const attendance_ym = this.queryForm1.formData.attendance_ym;
					let delRes = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/deleteAll',
						title: '删除中...',
						data: {
							attendance_ym
						}
					});
					if (delRes.code != 0) {
						return vk.alert(`${attendance_ym}月工资表明细删除失败！`);
					}
					return vk.alert(`${attendance_ym}月工资表明细删除成功！`);
				} catch (err) {} finally {
					this.refresh();
				}
			},

			// ========== 导入 Excel ==========
			async handleChange(file) {
				let typeObj = {
					total_salary: {
						title: "综合",
						type: "number"
					},
					employee_name: {
						title: "姓名",
						type: "text"
					},
					card: {
						title: "身份证号码",
						type: "text"
					},
					department_name: {
						title: "任职部门",
						type: "text"
					},
					position_name: {
						title: "岗位",
						type: "text"
					},
					hire_date: {
						title: "入职日期",
						type: "number"
					},
					resign_date: {
						title: "离职日期",
						type: "text"
					},
					base_salary: {
						title: "基本工资",
						type: "number"
					},
					performance_salary: {
						title: "绩效工资",
						type: "number"
					},
					overtime_fee: {
						title: "固定加班",
						type: "number"
					},
					penalty_fund: {
						title: "社保补偿金",
						type: "number"
					},
					housing_fund: {
						title: "公积补偿金",
						type: "number"
					},
					annual_allowance: {
						title: "年度补偿金",
						type: "number"
					},
					floating_bonus: {
						title: "浮动奖励",
						type: "number"
					},
					confidentiality_fee: {
						title: "保密费",
						type: "number"
					},
					work_days: {
						title: "应勤天数",
						type: "number"
					},
					real_days: {
						title: "实际出勤",
						type: "number"
					},
					gross_salary: {
						title: "应发工资",
						type: "number"
					},
					overtime_cost: {
						title: "加班费",
						type: "number"
					},
					free_cost: {
						title: "放假补助",
						type: "number"
					},
					grant: {
						title: "补助",
						type: "number"
					},
					agency_fee: {
						title: "介绍费",
						type: "number"
					},
					other_cost: {
						title: "其他",
						type: "number"
					},
					we_cost: {
						title: "水电",
						type: "number"
					},
					clothes_cost: {
						title: "工衣",
						type: "number"
					},
					earlytime_cost: {
						title: "迟到早退",
						type: "number"
					},
					missed_cost: {
						title: "未打卡",
						type: "number"
					},
					loan_cost: {
						title: "借款",
						type: "number"
					},
					this_month_sb: {
						title: "本月社保",
						type: "number"
					},
					this_month_dk: {
						title: "本月代扣部份",
						type: "number"
					},
					dkgs: {
						title: "代扣个税",
						type: "number"
					},
					real_salary: {
						title: "实发工资",
						type: "number"
					},
					comment: {
						title: "备注",
						type: "text"
					},
					company_sb: {
						title: "公司部份社保",
						type: "number"
					},
					company_gjj: {
						title: "公司部份公积金",
						type: "number"
					},
					last_month_sb: {
						title: "下月社保",
						type: "number"
					},
					last_month_gjj: {
						title: "下月公积金",
						type: "number"
					}
				};

				try {
					if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
						return vk.alert(`考勤日期不能为空！`);
					}

					const attendance_ym = this.queryForm1.formData.attendance_ym;

					this.$iexcel.importExcel(file.raw, typeObj, async (res) => {
						if (!res || res.length === 0) {
							return vk.alert('Excel中没有数据！');
						}

						let delRes = await vk.callFunction({
							url: 'admin/hrm/salary/sys/all/deleteAll',
							title: '删除中...',
							data: {
								attendance_ym
							}
						});
						if (delRes.code != 0) {
							return vk.alert(`${attendance_ym}月工资表明细删除失败！`);
						}

						const validationResult = this.validateExcelData(res);
						if (!validationResult.valid) {
							return vk.alert(validationResult.message, "数据验证失败", "确定");
						}

						const validData = [];
						const errorData = [];

						for (const item of res) {
							item.attendance_ym = attendance_ym;

							if (!item.attendance_ym) {
								errorData.push({
									item,
									reason: '考勤日期不能为空'
								});
								continue;
							}
							if (!item.card) {
								errorData.push({
									item,
									reason: '身份证号码不能为空'
								});
								continue;
							}

							item.gross_salary = item.gross_salary || 0;
							item.real_salary = item.real_salary || 0;
							let newItem = vk.pubfn.copyObject(item);
							newItem = this.calculateSalary(newItem);

							item.enable_fd1 = false;
							item.enable_fd2 = false;
							item.update_date = new Date().getTime();
							item.update_id = vk.getVuex('$user.userInfo._id');

							if (vk.pubfn.isNotNull(item.hire_date)) {
								let utcDate = new Date(Date.UTC(1900, 0, item.hire_date - 1));
								item.hire_date = utcDate.toISOString().slice(0, 10);
							}

							if (newItem.gross_salary !== item.gross_salary || newItem.real_salary !== item
								.real_salary) {
								errorData.push({
									item,
									reason: `应发工资:${newItem.gross_salary}=${item.gross_salary},实发工资:${newItem.real_salary}=${item.real_salary}`
								});
							}

							validData.push(item);
						}

						if (errorData.length > 0) {
							let errorMsg = errorData.slice(0, 5).map(err =>
								`姓名: ${err.item.employee_name} - ${err.reason}`
							).join('\n');
							if (errorData.length > 5) {
								errorMsg += `\n...还有${errorData.length - 5}条错误数据`;
							}
							vk.confirm(`数据验证失败:\n${errorMsg}`, "是否继续导入数据", "是", "否", async (res) => {
								if (res.confirm) {
									await this._doImport(validData);
								}
							});
						} else {
							await this._doImport(validData);
						}
					});
				} catch (error) {
					console.error('导入Excel失败:', error);
					vk.alert(`导入Excel失败: ${error.message}`, "系统错误", "确定");
					this.fileList = [];
				} finally {
					this.fileList = [];
				}
			},

			async _doImport(validData) {
				vk.toast('开始导入数据...');
				const result = await vk.callFunction({
					url: 'admin/hrm/salary/sys/all/addAll',
					title: '请求中...',
					data: {
						items: validData
					}
				});
				if (result.code === 0) {
					vk.alert(`导入完成！成功: ${result.id.length}条`, "导入成功", "确定", () => {
						this.refresh();
					});
				} else {
					vk.alert(`导入Excel失败!`, "系统错误", "确定");
				}
			},

			validateExcelData(data) {
				if (!Array.isArray(data)) {
					return {
						valid: false,
						message: '数据格式错误'
					};
				}
				const keySet = new Set();
				const duplicates = [];
				for (const item of data) {
					if (item.card && item.attendance_ym) {
						const key = `${item.card}_${item.attendance_ym}`;
						if (keySet.has(key)) duplicates.push(item.card);
						keySet.add(key);
					}
				}
				if (duplicates.length > 0) {
					return {
						valid: false,
						message: `存在重复数据: ${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '...' : ''}`
					};
				}
				return {
					valid: true,
					message: ''
				};
			},

			// ========== 自动生成工资表 ==========
			async autoSalary() {
				try {
					if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
						return vk.alert(`考勤日期不能为空！`);
					}
					const attendance_ym = this.queryForm1.formData.attendance_ym;

					vk.confirm(`确定将删除${attendance_ym}月全部数据，重新生成工资表！`, '提示', '确定', '取消', async (res) => {
						if (res.confirm) {
							vk.toast('开始生成工资表...');

							// 1. 获取月度考勤汇总
							let resAprove = await vk.callFunction({
								url: 'admin/hrm/salary/pub/getAproveList',
								title: '请求中...',
								data: {
									attendance_ym: attendance_ym,
									enable_hr: true
								}
							});

							if (resAprove.total == 0) {
								return vk.alert(`没有${attendance_ym}月考勤数据，请联系人事考勤！`);
							}

							// 2. 删除旧数据
							let delRes = await vk.callFunction({
								url: 'admin/hrm/salary/sys/all/deleteAll',
								title: '删除中...',
								data: {
									attendance_ym
								}
							});
							if (delRes.code != 0) {
								return vk.alert(`${attendance_ym}月工资表明细删除失败！`);
							}

							// 3. 提取关联键
							const cards = resAprove.rows.map(item => item.card).filter(Boolean);
							// 定薪信息
							const totalSalaries = [...new Set(
								resAprove.rows.map(item => item.salarys?.salary).filter(s => s !=
									null)
							)];

							// 4. 批量查询所有关联数据
							vk.toast('批量获取相关数据...');
							const [
								salaryRulesMap,
								freeMap,
								socialTaxMap,
								costResult,
								lateRule,
								overtimeRateMap
							] = await Promise.all([
								this.batchGetSalaryRules(totalSalaries),
								this.batchGetFreeData(cards, attendance_ym),
								this.batchGetSocialTaxData(cards, attendance_ym),
								this.batchGetCostData(cards, attendance_ym),
								this.getLateRule(),
								this.batchGetOvertimeRate(cards)
							]);
							const {
								weMap,
								clothesMap,
								costMap
							} = costResult;

							// 5. 逐员工处理
							const processedRows = [];
							const errors = [];

							for (let item of resAprove.rows) {
								try {
									// 定薪校验
									if (vk.pubfn.isNull(item.salarys) || vk.pubfn.isNull(item.salarys
											.salary)) {
										errors.push(`员工：${item.employee_name}/${item.card}, 没有定薪数据！`);
									}

									// 薪资分配规则
									const salaryRule = item.salarys ? salaryRulesMap.get(item.salarys
										.salary) : null;
									if (!salaryRule && item.salarys && item.salarys.salary_type === 1) {
										errors.push(
											`综合：${item.salarys.salary}, 员工：${item.employee_name}/${item.card}, 没有薪资分配表数据！`
										);
									}
									if (item.salarys && item.salarys.salary_type === 1 && salaryRule) {
										if (item.salarys.salary !== salaryRule.total_salary) {
											salaryRule.performance_salary -= (salaryRule.total_salary -
												item.salarys.salary);
										}
										item.bases = salaryRule;
									}

									// 关联数据
									const key = `${item.card}_${attendance_ym}`;
									item.frees = freeMap.get(key) || {};
									item.socialTax = socialTaxMap.get(key) || {};
									item.weData = weMap.get(key) || {};
									item.clothesData = clothesMap.get(key) || {};
									item.costData = costMap.get(key) || {};

									// 迟到和加班规则
									item.lateRule = lateRule;
									item.overtimeRate = overtimeRateMap.get(item.card) || 0;

									item.enable_fd1 = false;
									item.enable_fd2 = false;
									item.update_date = new Date().getTime();
									item.update_id = vk.getVuex('$user.userInfo._id');

									// 字段映射 + 计算
									item = this.setSalaryFields(item);
									item = this.calculateSalary(item);

									processedRows.push(item);
								} catch (error) {
									errors.push(
										`处理员工 ${item.employee_name || item.card} 失败: ${error.message}`);
								}
							}

							if (errors.length > 0) {
								const errorMsg = errors.slice(0, 5).join('\n');
								const moreErrors = errors.length > 5 ? `\n...还有${errors.length - 5}条错误` :
									'';
								vk.confirm(
									`发现${errors.length}个错误：\n${errorMsg}${moreErrors}\n\n是否继续处理有效数据？`,
									'处理警告', '继续', '取消',
									async (confirmRes) => {
										if (confirmRes.confirm) {
											await this.saveSalaryData(processedRows);
										}
									}
								);
							} else {
								await this.saveSalaryData(processedRows);
							}
						}
					});
				} catch (error) {
					console.error('处理过程中发生错误:', error);
					vk.alert(`处理过程中发生错误: ${error.message}`, "系统错误", "确定");
				}
			},

			// ========== 批量查询辅助（带兜底） ==========			
			// 获取迟到/未打卡规则（全局唯一）
			async getLateRule() {
				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/getLateRule',
						title: '获取迟到规则中...',
						data: {}
					});
					if (res && res.code === 0 && res.data) {
						return res.data;
					}
				} catch (error) {
					console.error('获取迟到规则失败:', error);
				}
				// 兜底
				return {
					late_min: 0,
					late_price: 0,
					clock_min: 0,
					clock_price: 0
				};
			},

			// 批量获取加班费单价（优先员工自己的，没有则用 common）
			async batchGetOvertimeRate(cards) {
				const overtimeRateMap = new Map();
				try {
					if (!cards || cards.length === 0) return overtimeRateMap;

					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/getOvertimeRate',
						title: '获取加班费规则中...',
						data: {
							cards
						}
					});

					if (res && res.code === 0 && res.rows) {
						let commonRate = 0;
						const empRateMap = new Map();

						res.rows.forEach(item => {
							if (item.card === 'common') {
								commonRate = item.overtime_cost || 0;
							} else {
								empRateMap.set(item.card, item.overtime_cost || 0);
							}
						});

						// 每个员工：有自己配置就用，否则用 common
						cards.forEach(card => {
							const rate = empRateMap.has(card) ? empRateMap.get(card) : commonRate;
							overtimeRateMap.set(card, rate);
						});
					}
				} catch (error) {
					console.error('批量获取加班费规则失败:', error);
				}
				return overtimeRateMap;
			},
			async batchGetSalaryRules(totalSalaries) {
				const salaryRulesMap = new Map();
				try {
					if (!totalSalaries || totalSalaries.length === 0) return salaryRulesMap;

					const res = await vk.callFunction({
						url: 'admin/hrm/salary/pub/getBaseSalary',
						title: '获取薪资规则中...',
						data: {
							total_salaries: totalSalaries,
							match_type: 'range'
						}
					});
					if (res && res.code === 0 && res.data) {
						Object.entries(res.data).forEach(([salary, rule]) => {
							salaryRulesMap.set(Number(salary), rule);
						});
					}
				} catch (error) {
					console.error('批量获取薪资规则失败:', error);
				}
				return salaryRulesMap;
			},

			async batchGetFreeData(cards, attendance_ym) {
				const freeMap = new Map();
				try {
					if (!cards || cards.length === 0 || !attendance_ym) return freeMap;

					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/getfreeAll',
						title: '获取放假补助中...',
						data: {
							cards: cards,
							attendance_ym: attendance_ym
						}
					});
					if (res && res.code === 0 && res.rows) {
						res.rows.forEach(item => {
							const key = `${item.card}_${item.attendance_ym}`;
							freeMap.set(key, item);
						});
					}
				} catch (error) {
					console.error('批量获取放假补助失败:', error);
				}
				return freeMap;
			},

			async batchGetSocialTaxData(cards, attendance_ym) {
				const socialTaxMap = new Map();
				try {
					if (!cards || cards.length === 0 || !attendance_ym) return socialTaxMap;

					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/getSocialTaxAll',
						title: '获取社保公积金个税中...',
						data: {
							cards: cards,
							attendance_ym: attendance_ym
						}
					});
					if (res && res.code === 0 && res.rows) {
						res.rows.forEach(item => {
							const key = `${item.card}_${item.attendance_ym}`;
							socialTaxMap.set(key, item);
						});
					}
				} catch (error) {
					console.error('批量获取社保公积金个税失败:', error);
				}
				return socialTaxMap;
			},

			async batchGetCostData(cards, attendance_ym) {
				const weMap = new Map();
				const clothesMap = new Map();
				const costMap = new Map();

				try {
					if (!cards || cards.length === 0 || !attendance_ym) {
						return {
							weMap,
							clothesMap,
							costMap
						};
					}

					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/getCostAll',
						title: '获取费用数据中...',
						data: {
							cards: cards,
							attendance_ym: attendance_ym
						}
					});

					if (res && res.code === 0 && res.data) {
						// 水电费
						(res.data.we || []).forEach(item => {
							const key = `${item.card}_${item.attendance_ym}`;
							weMap.set(key, item);
						});
						// 工衣费
						(res.data.clothes || []).forEach(item => {
							const key = `${item.card}_${item.attendance_ym}`;
							clothesMap.set(key, item);
						});
						// 人事费用
						(res.data.cost || []).forEach(item => {
							const key = `${item.card}_${item.attendance_ym}`;
							costMap.set(key, item);
						});
					}
				} catch (error) {
					console.error('批量获取费用数据失败:', error);
				}

				return {
					weMap,
					clothesMap,
					costMap
				};
			},

			// ========== 字段映射（带兜底） ==========
			setSalaryFields(item) {
				// 基础信息
				item.total_salary = item.salarys ? (item.salarys.salary || 0) : 0;
				item.salary_type = item.salarys ? (item.salarys.salary_type || 0) : 0;

				// 人员信息
				item.department_name = item.employeeInfo?.departments?.department_name;
				item.position_name = item.employeeInfo?.positions?.position_name;
				item.hire_date = item.employeeInfo?.hire_date;
				item.resign_date = item.employeeInfo?.resign_date;

				// ========== 豁免人员判断 ==========
				const isExempted = item.exempted === true;

				if (isExempted) {
					// 豁免人员：出勤天数 = 定薪表的合同天数（全勤）
					item.work_days = item.salarys?.contract_days || item.work_days || 0;
					item.real_days = item.work_days; // 全勤

					// 迟到、未打卡、旷工等异常都不计
					item.late_early_minutes = 0;
					item.no_punch_count = 0;
					item.absent_count = 0;
				} else {
					// 普通员工：用实际考勤数据
					item.work_days = item.should_days || 0;
					item.real_days = item.actual_days || 0;
					item.late_early_minutes = (item.late_minutes || 0) + (item.early_minutes || 0);
					item.no_punch_count = item.no_punch_count || 0;
					item.absent_count = item.absent_count || 0;
				}

				// 加班数据（豁免人员也保留，视公司制度决定是否计入）
				item.overtime_minutes = item.overtime_minutes || 0;
				item.overtime_compensatory_minutes = item.overtime_compensatory_minutes || 0;
				item.overtime_paid_minutes = item.overtime_paid_minutes || 0;

				// 工资构成
				item.base_salary = item.bases ? (item.bases.base_salary || 0) : 0;
				item.performance_salary = item.bases ? (item.bases.performance_salary || 0) : 0;
				item.overtime_fee = item.bases ? (item.bases.overtime_fee || 0) : 0;
				item.penalty_fund = item.bases ? (item.bases.penalty_fund || 0) : 0;
				item.housing_fund = item.bases ? (item.bases.housing_fund || 0) : 0;
				item.annual_allowance = item.bases ? (item.bases.annual_allowance || 0) : 0;
				item.floating_bonus = item.bases ? (item.bases.floating_bonus || 0) : 0;
				item.confidentiality_fee = item.bases ? (item.bases.confidentiality_fee || 0) : 0;

				// 加班费
				const paidHours = (item.overtime_paid_minutes || 0) / 60;
				const overtimeRate = item.overtimeRate || 0;
				item.overtime_cost = vk.pubfn.toDecimal(paidHours * overtimeRate, 2);

				// 迟到费 / 未打卡费
				const lateRule = item.lateRule || {};
				if (isExempted) {
					// 豁免人员不计迟到、未打卡费用
					item.earlytime_cost = 0;
					item.missed_cost = 0;
				} else {
					const lateMinutes = item.late_early_minutes || 0;
					const lateMin = lateRule.late_min || 0;
					const latePrice = lateRule.late_price || 0;
					if (lateMinutes > lateMin) {
						item.earlytime_cost = vk.pubfn.toDecimal((lateMinutes - lateMin) * latePrice, 2);
					} else {
						item.earlytime_cost = 0;
					}

					const noPunchCount = item.no_punch_count || 0;
					const clockMin = lateRule.clock_min || 0;
					const clockPrice = lateRule.clock_price || 0;
					if (noPunchCount > clockMin) {
						item.missed_cost = vk.pubfn.toDecimal((noPunchCount - clockMin) * clockPrice, 2);
					} else {
						item.missed_cost = 0;
					}
				}

				// 放假补助
				item.free_cost = item.frees ? (item.frees.amount || 0) : 0;

				// 社保、公积金、个税
				const st = item.socialTax || {};
				item.this_month_sb = st.this_month_sb || 0;
				item.this_month_dk = st.this_month_dk || 0;
				item.last_month_sb = st.last_month_sb || 0;
				item.last_month_dk = st.last_month_dk || 0;
				item.personal_fund = st.personal_fund || 0;
				item.last_month_gjj = st.last_month_gjj || 0;
				item.dkgs = st.dkgs || 0;
				item.company_sb = st.company_social || 0;
				item.company_gjj = st.company_fund || 0;

				// 费用
				item.we_cost = item.weData ? (item.weData.share_cost || 0) : 0;
				item.clothes_cost = item.clothesData ? (item.clothesData.clothes_cost || 0) : 0;

				const cost = item.costData || {};
				let reward_cost = cost.reward_cost || 0;
				let punish_cost = cost.punish_cost || 0;
				let other_cost = cost.other_cost || 0;
				item.other_cost = reward_cost + other_cost - punish_cost;

				item.agency_fee = cost.agency_fee || 0;

				let grant = cost.grant || 0;
				let typhoon_cost = cost.typhoon_cost || 0;
				let liunian_cost = cost.liunian_cost || 0;
				item.grant = grant + typhoon_cost + liunian_cost;

				// 记录豁免标记
				item.is_exempted = isExempted;

				return item;
			},

			// ========== 工资计算（带兜底） ==========
			calculateSalary(item) {
				// 日薪/时薪：base_salary = total_salary, work_days = 1
				if ((item.salarys ? item.salarys.salary_type : item.salary_type) !== 1) {
					if (vk.pubfn.isNotNull(item.salary_type)) {
						item.base_salary = item.total_salary || 0;
						item.work_days = 1;
						item.real_days = 1;
					}
				}

				// 应发工资
				let total = 0;
				total += vk.pubfn.string2Number(item.base_salary || 0);
				total += vk.pubfn.string2Number(item.performance_salary || 0);
				total += vk.pubfn.string2Number(item.overtime_fee || 0);
				total += vk.pubfn.string2Number(item.penalty_fund || 0);
				total += vk.pubfn.string2Number(item.housing_fund || 0);
				total += vk.pubfn.string2Number(item.annual_allowance || 0);
				total += vk.pubfn.string2Number(item.floating_bonus || 0);
				total += vk.pubfn.string2Number(item.confidentiality_fee || 0);

				const workDays = item.work_days || 1;
				const realDays = item.real_days || 0;
				let grossSalary;

				if (item.is_exempted) {
					// 豁免人员：全勤计算，不做折算
					grossSalary = total;
				} else {
					grossSalary = total / workDays * realDays;
				}
				item.gross_salary = vk.pubfn.toDecimal(grossSalary, 2);

				// 实发工资
				let realSalary = 0;
				realSalary += vk.pubfn.string2Number(item.gross_salary || 0);

				// 加项
				realSalary += vk.pubfn.string2Number(item.overtime_cost || 0);
				realSalary += vk.pubfn.string2Number(item.free_cost || 0);
				realSalary += vk.pubfn.string2Number(item.grant || 0);
				realSalary += vk.pubfn.string2Number(item.agency_fee || 0);
				realSalary += vk.pubfn.string2Number(item.other_cost || 0);
				realSalary += vk.pubfn.string2Number(item.typhoon_cost || 0);
				realSalary += vk.pubfn.string2Number(item.liunian_cost || 0);

				// 减项
				realSalary -= vk.pubfn.string2Number(item.we_cost || 0);
				realSalary -= vk.pubfn.string2Number(item.clothes_cost || 0);
				realSalary -= vk.pubfn.string2Number(item.earlytime_cost || 0);
				realSalary -= vk.pubfn.string2Number(item.missed_cost || 0);
				realSalary -= vk.pubfn.string2Number(item.loan_cost || 0);
				realSalary -= vk.pubfn.string2Number(item.this_month_sb || 0);
				realSalary -= vk.pubfn.string2Number(item.this_month_dk || 0);
				realSalary -= vk.pubfn.string2Number(item.dkgs || 0);

				item.real_salary = vk.pubfn.toDecimal(realSalary, 2);
				return item;
			},

			async saveSalaryData(processedRows) {
				if (processedRows.length === 0) {
					return vk.alert('没有有效数据需要保存！');
				}
				try {
					vk.toast('保存工资表中...');
					const result = await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/addAll',
						title: '请求中...',
						data: {
							items: processedRows
						}
					});
					if (result.code === 0) {
						vk.alert(`新增工资表完成！成功: ${result.id?.length || processedRows.length}条`, "新增成功", "确定", () => {
							this.refresh();
						});
					} else {
						vk.alert(`新增失败: ${result.msg || '未知错误'}`, "系统错误", "确定");
					}
				} catch (error) {
					console.error('保存工资表失败:', error);
					vk.alert(`保存工资表失败: ${error.message}`, "系统错误", "确定");
				}
			},

			// ========== 基础方法 ==========
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
			pageTo(path) {
				vk.navigateTo(path);
			},
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},
			async search() {
				await this.getSumList();
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
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/salary/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/salary/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/salary/sys/delete",
					data: {
						_id: item._id
					}
				});
			},
			async batchApprove(enable_fd1) {
				try {
					await vk.callFunction({
						url: 'admin/hrm/salary/sys/all/updateAll',
						title: '请求中...',
						data: {
							items: this.table1.multipleSelection,
							enable_fd1
						}
					});
					vk.alert('批量审核成功', '确定', () => {
						this.refresh();
					});
				} catch (error) {
					vk.alert('操作异常：' + error.message);
				} finally {
					uni.hideLoading();
				}
			},
			batchBtn(index) {
				switch (index) {
					case 1:
						this.batchApprove(true);
						break;
					default:
						break;
				}
			},

			// ========== 导出模版 ==========
			exportExcelModel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '考勤明细模版',
					title: "正在导出数据...",
					columns: [{
							key: "total_salary",
							title: "综合",
							type: "number"
						},
						{
							key: "attendance_ym",
							title: "月份",
							type: "text"
						},
						{
							key: "employee_name",
							title: "姓名",
							type: "text"
						},
						{
							key: "card",
							title: "身份证号码",
							type: "text"
						},
						{
							key: "department_name",
							title: "任职部门",
							type: "text"
						},
						{
							key: "position_name",
							title: "岗位",
							type: "text"
						},
						{
							key: "hire_date",
							title: "入职日期",
							type: "number"
						},
						{
							key: "resign_date",
							title: "离职日期",
							type: "text"
						},
						{
							key: "base_salary",
							title: "基本工资",
							type: "number"
						},
						{
							key: "performance_salary",
							title: "绩效工资",
							type: "number"
						},
						{
							key: "overtime_fee",
							title: "固定加班",
							type: "number"
						},
						{
							key: "penalty_fund",
							title: "社保补偿金",
							type: "number"
						},
						{
							key: "housing_fund",
							title: "公积补偿金",
							type: "number"
						},
						{
							key: "annual_allowance",
							title: "年度补偿金",
							type: "number"
						},
						{
							key: "floating_bonus",
							title: "浮动奖励",
							type: "number"
						},
						{
							key: "confidentiality_fee",
							title: "保密费",
							type: "number"
						},
						{
							key: "work_days",
							title: "应勤天数",
							type: "number"
						},
						{
							key: "real_days",
							title: "实际出勤",
							type: "number"
						},
						{
							key: "gross_salary",
							title: "应发工资",
							type: "number"
						},
						{
							key: "overtime_cost",
							title: "加班费",
							type: "number"
						},
						{
							key: "free_cost",
							title: "放假补助",
							type: "number"
						},
						{
							key: "grant",
							title: "补助",
							type: "number"
						},
						{
							key: "agency_fee",
							title: "介绍费",
							type: "number"
						},
						{
							key: "other_cost",
							title: "其他",
							type: "number"
						},
						{
							key: "we_cost",
							title: "水电",
							type: "number"
						},
						{
							key: "clothes_cost",
							title: "工衣",
							type: "number"
						},
						{
							key: "earlytime_cost",
							title: "迟到早退",
							type: "number"
						},
						{
							key: "missed_cost",
							title: "未打卡",
							type: "number"
						},
						{
							key: "loan_cost",
							title: "借款",
							type: "number"
						},
						{
							key: "this_month_sb",
							title: "本月社保",
							type: "number"
						},
						{
							key: "this_month_dk",
							title: "本月代扣部份",
							type: "number"
						},
						{
							key: "dkgs",
							title: "代扣个税",
							type: "number"
						},
						{
							key: "real_salary",
							title: "实发工资",
							type: "number"
						},
						{
							key: "comment",
							title: "备注",
							type: "text"
						},
						{
							key: "company_sb",
							title: "公司部份社保",
							type: "number"
						},
						{
							key: "company_gjj",
							title: "公司部份公积金",
							type: "number"
						},
						{
							key: "last_month_sb",
							title: "下月社保",
							type: "number"
						},
						{
							key: "last_month_gjj",
							title: "下月公积金",
							type: "number"
						}
					],
					pageIndex: 1,
					pageSize: 1
				});
			},

			// ========== 导出全部 ==========
			exportExcelAll() {
				if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
					return vk.alert(`考勤日期不能为空！`);
				}
				const attendance_ym = this.queryForm1.formData.attendance_ym;
				this.$refs.table1.exportExcel({
					fileName: attendance_ym + '月份工资表',
					title: "正在导出数据...",
					columns: [{
							key: "attendance_ym",
							title: "考勤月份",
							type: "text",
							fixed: true
						},
						{
							key: "total_salary",
							title: "综合",
							type: "number"
						},
						{
							key: "employee_name",
							title: "姓名",
							type: "text"
						},
						{
							key: "card",
							title: "身份证号码",
							type: "text"
						},
						{
							key: "department_name",
							title: "任职部门",
							type: "text"
						},
						{
							key: "position_name",
							title: "岗位",
							type: "text"
						},
						{
							key: "hire_date",
							title: "入职日期",
							type: "number"
						},
						{
							key: "resign_date",
							title: "离职日期",
							type: "text"
						},
						{
							key: "base_salary",
							title: "基本工资",
							type: "number"
						},
						{
							key: "performance_salary",
							title: "绩效工资",
							type: "number"
						},
						{
							key: "overtime_fee",
							title: "固定加班",
							type: "number"
						},
						{
							key: "penalty_fund",
							title: "社保补偿金",
							type: "number"
						},
						{
							key: "housing_fund",
							title: "公积补偿金",
							type: "number"
						},
						{
							key: "annual_allowance",
							title: "年度补偿金",
							type: "number"
						},
						{
							key: "floating_bonus",
							title: "浮动奖励",
							type: "number"
						},
						{
							key: "confidentiality_fee",
							title: "保密费",
							type: "number"
						},
						{
							key: "work_days",
							title: "应勤天数",
							type: "number"
						},
						{
							key: "real_days",
							title: "实际出勤",
							type: "number"
						},
						{
							key: "gross_salary",
							title: "应发工资",
							type: "number"
						},
						{
							key: "overtime_cost",
							title: "加班费",
							type: "number"
						},
						{
							key: "free_cost",
							title: "放假补助",
							type: "number"
						},
						{
							key: "grant",
							title: "补助",
							type: "number"
						},
						{
							key: "agency_fee",
							title: "介绍费",
							type: "number"
						},
						{
							key: "other_cost",
							title: "其他",
							type: "number"
						},
						{
							key: "we_cost",
							title: "水电",
							type: "number"
						},
						{
							key: "clothes_cost",
							title: "工衣",
							type: "number"
						},
						{
							key: "earlytime_cost",
							title: "迟到早退",
							type: "number"
						},
						{
							key: "missed_cost",
							title: "未打卡",
							type: "number"
						},
						{
							key: "loan_cost",
							title: "借款",
							type: "number"
						},
						{
							key: "this_month_sb",
							title: "本月社保",
							type: "number"
						},
						{
							key: "this_month_dk",
							title: "本月代扣部份",
							type: "number"
						},
						{
							key: "dkgs",
							title: "代扣个税",
							type: "number"
						},
						{
							key: "real_salary",
							title: "实发工资",
							type: "number"
						},
						{
							key: "comment",
							title: "备注",
							type: "text"
						},
						{
							key: "company_sb",
							title: "公司部份社保",
							type: "number"
						},
						{
							key: "company_gjj",
							title: "公司部份公积金",
							type: "number"
						},
						{
							key: "last_month_sb",
							title: "下月社保",
							type: "number"
						},
						{
							key: "last_month_gjj",
							title: "下月公积金",
							type: "number"
						},
						{
							key: "enable_fd1",
							title: "财务审核一级",
							type: "text",
							formatter: function(val) {
								return val ? '通过' : '未通过';
							}
						},
						{
							key: "enable_fd2",
							title: "财务审核二级",
							type: "text",
							formatter: function(val) {
								return val ? '通过' : '未通过';
							}
						}
					],
					pageIndex: 1,
					pageSize: -1
				});
			}
		},

		watch: {},
		computed: {}
	};
</script>

<style lang="scss" scoped>
	.page-body {}
</style>