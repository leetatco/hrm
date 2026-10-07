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
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-config-add')" @click="addBtn">添加</el-button>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-config-add')"
					@click="exportExcelAll">导出全部</el-button>
				<el-upload style="display: inline-block;margin-left: 20rpx;margin-right: 20rpx;" accept=".xlsx, .xls"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-config-add')" :auto-upload="false" :limit="1"
					:show-file-list="false" :on-change="handleChange" :file-list="fileList" action="">
					<el-button type="primary" size="small" icon="el-icon-upload2">导入excel</el-button>
				</el-upload>
				<el-button type="primary" size="small" icon="el-icon-tickets" @click="exportExcelModel"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-config-add')">下载模版</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="800px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:columnsNumber="2" :inline="true" :form-type="form1.props.formType" :columns='form1.props.columns'
				label-width="90px" @success="form1.props.show = false;refresh();">
				<template v-slot:last_month_sb="{ form }">
					<el-input-number v-model="form.last_month_sb" :precision="2" />
				</template>
				<template v-slot:last_month_dk="{ form }">
					<el-input-number v-model="form.last_month_dk" :precision="2" />
				</template>
				<template v-slot:this_month_sb="{ form }">
					<el-input-number v-model="form.this_month_sb" :precision="2" />
				</template>
				<template v-slot:this_month_dk="{ form }">
					<el-input-number v-model="form.this_month_dk" :precision="2" />
				</template>
				<template v-slot:company_social="{ form }">
					<el-input-number v-model="form.company_social" :precision="2" />
				</template>
				<template v-slot:company_fund="{ form }">
					<el-input-number v-model="form.company_fund" :precision="2" />
				</template>
				<template v-slot:last_month_gjj="{ form }">
					<el-input-number v-model="form.last_month_gjj" :precision="2" />
				</template>
				<template v-slot:dkgs="{ form }">
					<el-input-number v-model="form.dkgs" :precision="2" />
				</template>
			</vk-data-form>
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
		month: 0,
		mode: "before",
	})).getFullYear();

	let nowm = new Date(vk.pubfn.getOffsetTime(new Date(), {
		month: 0,
		mode: "before",
	})).getMonth();

	nowm = nowm > 9 ? nowm : `0${nowm}`;
	const nowym = vk.myfn.normalizeMonth(`${nowy}-${nowm}`);

	export default {
		data() {
			return {
				fileList: [],
				loading: false,

				// ========== 表格相关 ==========
				table1: {
					action: "admin/hrm/salary/sys/socialTax/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission(
								'hrm-salary-config-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission(
								'hrm-salary-config-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission(
								'hrm-salary-config-delete')
						}
					],
					columns: [{
							key: "attendance_ym",
							title: "考勤日期",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "employees.employee_name",
							title: "员工姓名",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "card",
							title: "身份证号码",
							type: "text",
							width: colWidth
						},

						{
							key: "this_month_sb",
							title: "本月社保",
							type: "number",
							precision: 2,
							width: colWidth - 100
						},
						{
							key: "this_month_dk",
							title: "本月代扣",
							type: "number",
							precision: 2,
							width: colWidth - 100
						},
						{
							key: "last_month_sb",
							title: "下月社保",
							type: "number",
							precision: 2,
							width: colWidth - 100
						},
						{
							key: "last_month_dk",
							title: "下月代扣",
							type: "number",
							precision: 2,
							width: colWidth - 100
						},
						{
							key: "company_social",
							title: "公司社保",
							type: "number",
							precision: 2,
							width: colWidth - 100
						},
						{
							key: "company_fund",
							title: "公司公积金",
							type: "number",
							precision: 2,
							width: colWidth - 100
						},
						{
							key: "last_month_gjj",
							title: "下月公积金",
							type: "number",
							precision: 2,
							width: colWidth - 100
						},
						{
							key: "dkgs",
							title: "代扣个税",
							type: "number",
							precision: 2,
							width: colWidth - 100
						},
						{
							key: "comment",
							title: "备注",
							type: "text",
							width: colWidth,
							show: ["detail"]
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

				// ========== 查询条件 ==========
				queryForm1: {
					formData: {
						attendance_ym: nowym
					},
					columns: [{
							key: "attendance_ym",
							title: "考勤日期",
							type: "date",
							dateType: "month",
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
							mode: "="
						},
						{
							key: "card",
							title: "员工",
							type: "table-select",
							placeholder: "选择员工",
							action: "admin/hrm/employees/sys/getList",
							oneLine: true,
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
						}
					]
				},

				// ========== 表单 ==========
				form1: {
					data: {
						attendance_ym: nowym,
						last_month_sb: 0,
						last_month_dk: 0,
						this_month_sb: 0,
						this_month_dk: 0,
						company_social: 0,
						company_fund: 0,
						last_month_gjj: 0,
						dkgs: 0
					},
					props: {
						action: "",
						columns: [{
								key: "attendance_ym",
								title: "考勤日期",
								type: "date",
								dateType: "month",
								valueFormat: "yyyy-MM",
								format: "yyyy-MM",
								width: colWidth
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
								key: "",
								title: "个人社保",
								type: "bar-title"
							},
							{
								"key": "this_month_sb",
								"title": "本月社保",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "this_month_dk",
								"title": "本月代扣",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "last_month_sb",
								"title": "下月社保",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "last_month_dk",
								"title": "下月代扣",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								key: "",
								title: "公司承担",
								type: "bar-title"
							},
							{
								"key": "company_social",
								"title": "公司社保",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "company_fund",
								"title": "公司公积金",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								key: "",
								title: "下月公积金、个税",
								type: "bar-title"
							},
							{
								"key": "last_month_gjj",
								"title": "下月公积金",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "dkgs",
								"title": "代扣个税",
								"precision": 2,
								"type": "number",
								"width": colWidth
							},
							{
								key: "comment",
								title: "备注",
								type: "textarea",
								maxlength: "100",
								showWordLimit: true,								
								autosize: {
									minRows: 3,
									maxRows: 5
								}
							}
						],
						rules: {
							attendance_ym: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							card: [{
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
		},
		onReady() {},
		onShow() {},
		onHide() {},
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
				this.form1.props.action = 'admin/hrm/salary/sys/socialTax/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/salary/sys/socialTax/update';
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
					action: "admin/hrm/salary/sys/socialTax/delete",
					data: {
						_id: item._id
					}
				});
			},

			// 导入 Excel
			handleChange(file) {
				let typeObj = {
					attendance_ym: {
						"title": "考勤日期",
						"type": "text"
					},
					card: {
						"title": "身份证号码",
						"type": "text"
					},
					last_month_sb: {
						"title": "下月社保",
						"precision": 2,
						"type": "number"
					},
					last_month_dk: {
						"title": "下月代扣",
						"precision": 2,
						"type": "number"
					},
					this_month_sb: {
						"title": "本月社保",
						"precision": 2,
						"type": "number"
					},
					this_month_dk: {
						"title": "本月代扣",
						"precision": 2,
						"type": "number"
					},
					company_social: {
						"title": "公司社保",
						"precision": 2,
						"type": "number"
					},
					company_fund: {
						"title": "公司公积金",
						"precision": 2,
						"type": "number"
					},
					last_month_gjj: {
						"title": "下月公积金",
						"precision": 2,
						"type": "number"
					},
					dkgs: {
						"title": "代扣个税",
						"precision": 2,
						"type": "number"
					},
					comment: {
						"title": "备注",
						"type": "text"
					}
				};
				try {
					this.$iexcel.importExcel(file.raw, typeObj, async (res) => {
						if (!res || res.length === 0) {
							return vk.alert('Excel中没有数据！');
						}

						// 1. 提取身份证
						const cards = res.map(item => item.card).filter(card => card);
						if (cards.length === 0) {
							return vk.alert('Excel中没有有效的身份证号码！');
						}

						// 2. 批量获取员工信息
						vk.toast('获取员工信息中...');
						const employeeMap = await vk.myfn.batchGetAttendEmployeeInfo(cards);
						if (!employeeMap) {
							return vk.alert('获取员工信息失败！');
						}

						// 3. 校验数据
						const validData = [];
						const errorData = [];

						for (const item of res) {
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
							const employeeInfo = employeeMap.get(item.card);
							if (!employeeInfo) {
								errorData.push({
									item,
									reason: '未找到对应的员工信息'
								});
								continue;
							}

							item.update_date = new Date().getTime();
							item.update_id = vk.getVuex('$user.userInfo._id');
							item.employee_id = employeeInfo.employee_id;
							item.card = employeeInfo.card;
							validData.push(item);
						}

						if (errorData.length > 0) {
							const errorMsg = errorData.slice(0, 5).map(err =>
								`身份证: ${err.item.card} - ${err.reason}`
							).join('\n');
							const suffix = errorData.length > 5 ? `\n...还有${errorData.length - 5}条错误数据` : '';
							return vk.alert(`部分数据验证失败:\n${errorMsg}${suffix}`, "导入失败", "确定");
						}

						// 4. 按月份清空旧数据
						const attendance_ym = validData[0].attendance_ym;
						let delRes = await vk.callFunction({
							url: 'admin/hrm/salary/sys/socialTax/deleteAll',
							title: '删除旧数据...',
							data: {
								attendance_ym
							}
						});
						if (delRes.code != 0) {
							return vk.alert(`${attendance_ym} 旧数据删除失败！`);
						}

						// 5. 批量导入
						vk.toast('开始导入数据...');
						const result = await vk.callFunction({
							url: 'admin/hrm/salary/sys/socialTax/addAll',
							title: '请求中...',
							data: {
								items: validData
							}
						});

						if (result.code === 0) {
							vk.alert(result.msg, "导入成功", "确定", () => {
								this.refresh();
							});
						} else {
							vk.alert(`导入Excel失败!`, "系统错误", "确定");
						}
					});
				} catch (error) {
					console.error('导入Excel失败:', error);
					vk.alert(`导入Excel失败: ${error.message}`, "系统错误", "确定");
				} finally {
					this.fileList = [];
				}
			},

			// 导出模版
			exportExcelModel() {
				this.$refs.table1.exportExcel({
					fileName: nowym + '社保公积金个税模版',
					title: "正在导出数据...",
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "text"
						},
						{
							"key": "employees.employee_name",
							"title": "员工姓名",
							"type": "text"
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "last_month_sb",
							"title": "下月社保",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "last_month_dk",
							"title": "下月代扣",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "this_month_sb",
							"title": "本月社保",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "this_month_dk",
							"title": "本月代扣",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "company_social",
							"title": "公司社保",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "company_fund",
							"title": "公司公积金",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "last_month_gjj",
							"title": "下月公积金",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "dkgs",
							"title": "代扣个税",
							"precision": 2,
							"type": "number"
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text"
						}
					],
					pageIndex: 1,
					pageSize: 1
				});
			},

			// 导出全部
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: nowym + '社保公积金个税信息',
					title: "正在导出数据...",
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "text"
						},
						{
							"key": "employees.employee_name",
							"title": "员工姓名",
							"type": "text"
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "last_month_sb",
							"title": "下月社保",
							"type": "number",
							"precision": 2
						},
						{
							"key": "last_month_dk",
							"title": "下月代扣",
							"type": "number",
							"precision": 2
						},
						{
							"key": "this_month_sb",
							"title": "本月社保",
							"type": "number",
							"precision": 2
						},
						{
							"key": "this_month_dk",
							"title": "本月代扣",
							"type": "number",
							"precision": 2
						},
						{
							"key": "company_social",
							"title": "公司社保",
							"type": "number",
							"precision": 2
						},
						{
							"key": "company_fund",
							"title": "公司公积金",
							"type": "number",
							"precision": 2
						},
						{
							"key": "last_month_gjj",
							"title": "下月公积金",
							"type": "number",
							"precision": 2
						},
						{
							"key": "dkgs",
							"title": "代扣个税",
							"type": "number",
							"precision": 2
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text"
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