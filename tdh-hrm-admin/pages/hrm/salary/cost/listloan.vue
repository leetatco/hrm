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
					v-if="$hasRole('admin') || $hasRole('fd-add')" @click="addBtn">添加</el-button>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasRole('fd-read')" @click="exportExcelAll"> 导出全部
				</el-button>
				<!-- 批量操作 -->
				<el-dropdown v-if="table1.multipleSelection" :split-button="false" trigger="click" @command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0">
						批量操作<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">批量复制</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" :show-summary="true" :total-option=" [				
			    { key: 'repayment_amount', 'unit': '元', type:'number'},							 
			  ]" @selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="500px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :before-action="form1.props.beforeAction"
				:action="form1.props.action" :form-type="form1.props.formType" :columns='form1.props.columns'
				label-width="80px" @success="form1.props.show = false;refresh();"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 200;
	let nowy = new Date(vk.pubfn.getOffsetTime(new Date(), {
		month: 0,
		mode: "before", // after 之后 before 之前
	})).getFullYear();

	let nowm = new Date(vk.pubfn.getOffsetTime(new Date(), {
		month: 0,
		mode: "before", // after 之后 before 之前
	})).getMonth();

	nowm = nowm > 9 ? nowm : `0${nowm}`;
	const nowym = vk.myfn.normalizeMonth(`${nowy}-${nowm}`);
	export default {
		data() {
			// 页面数据变量
			return {
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/salary/sys/loan/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasRole('fd-read')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasRole('fd-update')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasRole('fd-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "employee_id",
							"title": "员工工号",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "employees.employee_name",
							"title": "员工姓名",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "employees.card",
							"title": "身份证号码",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "loan_date",
							"title": "借款日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth - 100
						},
						{
							"key": "loan_amount",
							"title": "借款金额",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "repayment_amount",
							"title": "本期还款",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "repayment_total",
							"title": "还款总计",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "remaining_principal",
							"title": "剩余金额",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"type": "time",
							"width": colWidth,
							"show": ["detail"]
						},
						{
							"key": "users.nickname",
							"title": "更新人",
							"type": "text",
							"width": colWidth,
							"show": ["detail"]
						}
					],
					// 多选框选中的值
					multipleSelection: [],
					// 当前高亮的记录
					selectItem: ""
				},
				// 表格相关结束 -----------------------------------------------------------
				// 表单相关开始 -----------------------------------------------------------
				// 查询表单请求数据
				queryForm1: {
					// 查询表单数据源，可在此设置默认值
					formData: {
						attendance_ym: nowym
					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
							key: "attendance_ym",
							title: "考勤日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
							"width": colWidth
						},
						{
							key: "card",
							title: "",
							type: "table-select",
							placeholder: "选择员工",
							action: "admin/hrm/employees/sys/getList",
							multiple: false,
							columns: [{
									key: "employee_id",
									title: "员工工号",
									type: "text",
									nameKey: true
								}, // idKey:true 代表此字段为主键字段，若设置show:["none"],则可以在表格中隐藏该字段的显示
								{
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									nameKey: true
								},
								{
									key: "card",
									title: "身份证号码",
									type: "text",
									idKey: true

								}
							],
							queryColumns: [{
									key: "employee_id",
									title: "员工工号",
									type: "text",
									width: colWidth - 50,
									mode: "%%"
								},
								{
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									width: colWidth - 50,
									mode: "%%"
								}, {
									key: "card",
									title: "身份证号码",
									type: "text",
									width: colWidth,
									mode: "%%"
								}

							]
						},
						//{"key":"loan_date","title":"借款日期","type":"datetimerange","width":200,"mode":"="},
						//{"key":"loan_amount","title":"借款金额","type":"number","width":200,"mode":"="},
						//{"key":"repayment_amount","title":"本期还款","type":"number","width":200,"mode":"="},
						//{"key":"comment","title":"备注","type":"text","width":200,"mode":"="},
						//{"key":"update_date","title":"更新时间","type":"datetimerange","width":200,"mode":"="},
						//{"key":"update_id","title":"更新人","type":"text","width":200,"mode":"="}
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						attendance_ym: nowym
					},
					// 表单属性
					props: {
						beforeAction: async (formData) => {
							console.log(formData);
							// 可在此处修改 formData 后返回 formData，若在此处return false，则表单不触发提交请求。						
							// 计算是否已还完贷款
							let res = await vk.callFunction({
								url: 'admin/hrm/salary/pub/getRemaining',
								title: '请求中...',
								data: {
									card: formData.card
								},
							});
							if (res.total > 0) {
								if (vk.pubfn.isNull(formData._id)) {
									this.$set(formData, 'remaining_principal', formData.loan_amount - (formData
										.repayment_amount || 0) - res.rows[0].total);
								} else {
									this.$set(formData, 'remaining_principal', formData
										.loan_amount - (formData.repayment_amount || 0) - res.rows[0].total + (
											formData.repayment_amount_old || 0));
								}
							} else {
								if ((formData.loan_amount || 0) > 0 && (formData
										.repayment_amount || 0) > 0)
									this.$set(formData, 'remaining_principal', formData.loan_amount - formData
										.repayment_amount);
							}

							if (formData.remaining_principal < 0) {
								if (vk.pubfn.isNull(formData._id)) {
									this.$set(formData, 'repayment_amount', formData
										.loan_amount - res.rows[0].total);
									vk.alert(`已超出还款金额,本期最多可还款${formData
										.loan_amount - res.rows[0].total}元,请重新修改！`);
								} else {
									this.$set(formData, 'repayment_amount', formData
										.loan_amount - res.rows[0].total + (
											formData.repayment_amount_old || 0));
									vk.alert(`已超出还款金额,本期最多可还款${formData
											.loan_amount - res.rows[0].total+(
											formData.repayment_amount_old || 0)}元,请重新修改！`);
								}
								return false
							}
							return formData;
						},
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								key: "attendance_ym",
								title: "考勤日期",
								type: "date",
								dateType: "date",
								valueFormat: "yyyy-MM",
								format: "yyyy-MM",
								"width": colWidth
							},
							{
								key: "card",
								title: "",
								type: "table-select",
								placeholder: "选择员工",
								action: "admin/hrm/employees/sys/getList",
								multiple: false,
								columns: [{
										key: "employee_id",
										title: "员工工号",
										type: "text",
										nameKey: true
									}, // idKey:true 代表此字段为主键字段，若设置show:["none"],则可以在表格中隐藏该字段的显示
									{
										key: "employee_name",
										title: "员工姓名",
										type: "text",
										nameKey: true
									},
									{
										key: "card",
										title: "身份证号码",
										type: "text",
										idKey: true

									}
								],
								queryColumns: [{
										key: "employee_id",
										title: "员工工号",
										type: "text",
										width: colWidth - 50,
										mode: "%%"
									},
									{
										key: "employee_name",
										title: "员工姓名",
										type: "text",
										width: colWidth - 50,
										mode: "%%"
									}, {
										key: "card",
										title: "身份证号码",
										type: "text",
										width: colWidth,
										mode: "%%"
									}

								],
								watch: async (val, formData, column, index, option) => {
									let res = await vk.callFunction({
										url: 'admin/hrm/salary/sys/loan/getLoanList',
										title: '请求中...',
										data: {
											card: val.value
										}
									});
									if (res.total > 0) {
										this.$set(this.form1.data, "loan_date", res.rows[0].loan_date);
										this.$set(this.form1.data, "loan_amount", res.rows[0].loan_amount);
										this.$set(this.form1.data, "repayment_amount", res.rows[0]
											.repayment_amount || "");
										this.$set(this.form1.data, "repayment_amount_old", res.rows[0]
											.repayment_amount || 0);
									} else {
										this.$set(this.form1.data, "loan_date", "");
										this.$set(this.form1.data, "loan_amount", "");
										this.$set(this.form1.data, "repayment_amount", "");
										this.$set(this.form1.data, "remaining_principal", "");
										this.$set(this.form1.data, "repayment_amount_old", 0);
									}
								}
							},
							{
								"key": "loan_date",
								"title": "借款日期",
								"type": "date",
								"dateType": "date",
								"valueFormat": "yyyy-MM-dd",
								"width": colWidth
							},
							{
								"key": "loan_amount",
								"title": "借款金额",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "repayment_amount",
								"title": "本期还款",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "repayment_amount_old",
								"title": "本期还款_old",
								"type": "number",
								"show": ["none"],
								"width": colWidth
							},
							{
								"key": "remaining_principal",
								"title": "剩余金额",
								disabled: true,
								"type": "number",
								"width": colWidth
							},
							{
								key: "comment",
								title: "备注",
								type: "textarea",
								maxlength: "100",
								showWordLimit: true,
								width: colWidth,
								autosize: {
									minRows: 4,
									maxRows: 10
								}
							}
						],
						// 表单验证规则
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
							}],
							loan_date: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							loan_amount: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}]
						},
						// add 代表添加 update 代表修改
						formType: "",
						// 弹窗标题
						title: "",
						// 是否显示表单的弹窗
						show: false
					}
				},
				// 其他弹窗表单
				formDatas: {},
				// 表单相关结束 -----------------------------------------------------------
			};
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options = {}) {			
			this.options = options;
			this.init(options);
		},
		// 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
		onReady() {

		},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {

		},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {

		},
		// 函数
		methods: {
			// 导出xls表格文件（全部数据）
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '员工借支还款信息',
					title: "正在导出数据...",
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "text"
						}, {
							"key": "employee_id",
							"title": "员工工号",
							"type": "text"
						},
						{
							"key": "employees.employee_name",
							"title": "员工姓名",
							"type": "text"
						},
						{
							"key": "employees.card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "loan_date",
							"title": "借款日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "loan_amount",
							"title": "借款金额",
							"type": "number"
						},
						{
							"key": "repayment_amount",
							"title": "本期还款",
							"type": "number"
						},
						{
							"key": "repayment_total",
							"title": "还款总计",
							"type": "number"
						},
						{
							"key": "remaining_principal",
							"title": "剩余金额",
							"type": "number"
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text"
						}
					],
					pageIndex: 1,
					pageSize: -1, // 此值为-1，代表导出所有数据
				});
			},
			// 页面数据初始化函数
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
			// 页面跳转
			pageTo(path) {
				vk.navigateTo(path);
			},
			// 表单重置
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},
			// 搜索
			search() {
				this.$refs.table1.search();
			},
			// 刷新
			refresh() {
				this.$refs.table1.refresh();
			},
			// 获取当前选中的行的数据
			getCurrentRow() {
				return this.$refs.table1.getCurrentRow();
			},
			// 监听 - 行的选中高亮事件
			currentChange(val) {
				this.table1.selectItem = val;
			},
			// 当选择项发生变化时会触发该事件
			selectionChange(list) {
				this.table1.multipleSelection = list;
			},
			// 显示添加页面
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/salary/sys/loan/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/salary/sys/loan/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑';
				this.form1.props.show = true;
				item.repayment_amount_old = item.repayment_amount;
				this.form1.data = item;
			},
			// 删除按钮
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/salary/sys/loan/delete",
					data: {
						_id: item._id
					},
				});
			},
			// 监听 - 批量操作的按钮点击事件
			async batchBtn(index) {
				if (index == 1) {
					vk.confirm(`确定将删除${nowym}月全部数据，重新生成新数据！`, '提示', '确定', '取消', async res => {
						if (res.confirm) {
							for (let s of this.table1.multipleSelection) {
								console.log(s);
								//清除原数据
								let delRes = await vk.callFunction({
									url: 'admin/hrm/salary/sys/loan/delete',
									title: '请求中...',
									data: {
										card: s.card,
										attendance_ym: nowym
									}
								})
								if (delRes.code == 0) {
									//检测是否已还完款
									let res = await vk.callFunction({
										url: 'admin/hrm/salary/pub/getRemaining',
										title: '请求中...',
										data: {
											card: s.card,
										},
									});

									let checkValue = s.loan_amount - res.rows[0].total - s
										.repayment_amount;
									// console.log(checkValue, s.loan_amount, res.rows[0].total, s.repayment_amount);
									if (checkValue < 0) {
										this.refresh();
										return vk.alert(
											`已超过还款金额，不能新增(${s.employees.employee_name}-借${s.loan_amount}元-剩${s.loan_amount - res.rows[0].total}元-还${s.repayment_amount}元)`
										);
									}
									//新增新数据							
									s.attendance_ym = nowym;
									let data = await vk.callFunction({
										url: 'admin/hrm/salary/sys/loan/add',
										title: '请求中...',
										data: s
									})
									vk.alert(`复制${nowym}月${this.table1.multipleSelection.length}条数据成功!`,
										'提示', '确定');
									this.refresh();
								} else {
									return vk.alert(`删除数据出错(id:${s._id})!`);
								}
							}
						}
					})
				}
			}
		},
		// 监听属性
		watch: {},
		// 计算属性
		computed: {

		}
	};
</script>
<style lang="scss" scoped>
	.page-body {}
</style>