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
				<el-button type="primary" size="small" icon="el-icon-edit-outline" @click="exportExcelAll"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-config-add')"> 导出全部
				</el-button>
				<el-upload style="display: inline-block;margin-left: 20rpx;margin-right: 20rpx;" accept=".xlsx, .xls"
					:auto-upload="false" :limit="1" :show-file-list="false" :file-list="fileList"
					:on-change="handleChange" action="">
					<el-button type="primary" size="small" icon="el-icon-upload2"
						v-if="$hasRole('admin') || $hasPermission('hrm-salary-config-add')">导入excel</el-button>
				</el-upload>
				<el-button type="primary" size="small" icon="el-icon-tickets" @click="exportExcelModel"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-config-add')"> 下载模版
				</el-button>
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
				:before-action="form1.props.beforeAction" :form-type="form1.props.formType"
				:columns='form1.props.columns' label-width="80px" :columnsNumber="2" :inline="true"
				@success="form1.props.show = false;refresh();"></vk-data-form>
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
				fileList: [],
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/salary/sys/free/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-attendance-config-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-attendance-config-edit')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission(
									'hrm-attendance-config-delete')
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
							"key": "employees.employee_name",
							"title": "员工姓名",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "employees.department_name",
							"title": "部门",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "employees.position_name",
							"title": "职务",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "employees.hire_date",
							"title": "入职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth - 100
						},
						{
							"key": "standard",
							"title": "放假标准",
							"type": "html",
							"width": colWidth - 100,
							formatter: function(val, row, column, index) {
								if (row.standard_type == 1) return `<text>${row.standard}/月</text>`;
								if (row.standard_type == 2) return `<text>${row.standard}/天</text>`;
							}
						},
						{
							"key": "first_month",
							"title": "第一月",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "second_month",
							"title": "第二月",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "total",
							"title": "合计",
							"type": "number",
							"width": colWidth - 100
						}, {
							"key": "amount",
							"title": "补贴金额",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text",
							"width": colWidth,
							"show": ["detail"]
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
							"mode": "="
						}, {
							key: "card",
							title: "姓名",
							type: "table-select",
							placeholder: "选择员工",
							action: "admin/hrm/attendance/sys/getList",							
							multiple: false,
							columns: [{
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
						//{"key":"confirm_id","title":"确认人","type":"text","width":colWidth,"mode":"="},
						//{"key":"comment","title":"备注","type":"text","width":colWidth,"mode":"="},
						//{"key":"update_date","title":"更新时间","type":"datetimerange","width":colWidth,"mode":"="},
						//{"key":"update_id","title":"更新人","type":"text","width":colWidth,"mode":"="}
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						attendance_ym: nowym
					},
					// 表单属性
					props: {
						beforeAction: (formData) => {
							// 可在此处修改 formData 后返回 formData，若在此处return false，则表单不触发提交请求。
							this.computerAmount();
							// console.log("formData:", formData)
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
							}, {
								key: "card",
								title: "姓名",
								type: "table-select",
								placeholder: "选择员工",
								action: "admin/hrm/attendance/sys/getList",								
								multiple: false,
								columns: [{
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
								"key": "standard_type",
								"title": "标准类型",
								"type": "radio",
								"width": colWidth,
								"data": [{
									"value": 1,
									"label": "月薪"
								}, {
									"value": 2,
									"label": "日薪"
								}]
							},
							{
								"key": "standard",
								"title": "放假标准",
								"precision": 0,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "first_month",
								"title": "第一月",
								"precision": 0,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "second_month",
								"title": "第二月",
								"precision": 0,
								"type": "number",
								"width": colWidth
							},
							{
								"key": "total",
								"title": "合计",
								"precision": 0,
								"type": "number",
								"disabled": true,
								"width": colWidth
							},
							{
								"key": "amount",
								"title": "补贴金额",
								"precision": 2,
								"type": "number",
								"disabled": true,
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
							standard: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							standard_type: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							first_month: [{
									required: true,
									message: "该项不能为空",
									trigger: ['blur', 'change']
								},
								{
									validator: async (rule, value, callback) => {
										this.computerAmount();
									},
									trigger: ['blur', 'change']
								}
							],
							second_month: [{
								validator: async (rule, value, callback) => {
									this.computerAmount();
								},
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
			computerAmount() {
				let first = this.form1.data.first_month || 0;
				let second = this.form1.data.second_month || 0;
				let s_type = this.form1.data.standard_type || 0;
				let std = this.form1.data.standard || 0;
				let total = first + second;
				if (total > 0 && std > 0) {
					this.$set(this.form1.data, 'total', total);
					if (s_type == 1) {
						this.$set(this.form1.data, 'amount', vk.pubfn.toDecimal(std / 26 *
							total, 2));
					} else {
						this.$set(this.form1.data, 'amount', std * total);
					}
				} else {
					this.$set(this.form1.data, 'total', 0);
					this.$set(this.form1.data, 'amount', 0);
				}
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
				this.form1.props.action = 'admin/hrm/salary/sys/free/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/salary/sys/free/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑';
				this.form1.props.show = true;
				this.form1.data = item;
				this.computerAmount();
			},
			// 删除按钮
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/salary/sys/free/delete",
					data: {
						_id: item._id
					},
				});
			},
			// 监听 - 批量操作的按钮点击事件
			async batchBtn(index) {
				switch (index) {
					case 1:
						this.table1.multipleSelection.forEach(async (e) => {
							let data = await vk.callFunction({
								url: 'admin/hrm/salary/sys/free/update',
								title: '请求中...',
								data: {
									_id: e._id,
									card: e.card,
									enabled: true
								}
							})
							if (data.code == 0) vk.alert("批量生效成功", "确定",
								() => {
									this.refresh()
								})
						})

						break;
					case 2:
						this.table1.multipleSelection.forEach(async (e) => {
							let data = await vk.callFunction({
								url: 'admin/hrm/salary/sys/free/update',
								title: '请求中...',
								data: {
									_id: e._id,
									card: e.card,
									enabled: false
								}
							})
							if (data.code == 0) vk.alert("批量失效成功", "确定",
								() => {
									this.refresh()
								})
						})
						break;
					default:
						break;

				}
			},
			//导入xls表格文件
			handleChange(file) {
				//定义字段即将导入的excel表中的数据显示在el-table中，这些字段是显示的部分（同时需要将导入的数据传给后端）
				let typeObj = {
					attendance_ym: {
						"title": "考勤日期",
						"type": "text"
					},
					card: {
						"title": "身份证号码",
						"type": "text"
					},					
					standard_type: {
						"title": "标准类型",
						"type": "text"
					},
					standard: {
						"title": "放假标准",
						"type": "number"
					},
					first_month: {
						"title": "第一月",
						"type": "number"
					},
					second_month: {
						"title": "第二月",
						"type": "number"
					},
					total: {
						"title": "合计",
						"type": "number"
					},
					amount: {
						"title": "补贴金额",
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

						// 删除旧数据
						let delRes = await vk.callFunction({
							url: 'admin/hrm/salary/sys/free/deleteAll',
							title: '删除中...',
							data: {
								attendance_ym: nowym
							}
						})

						if (delRes.code != 0) {
							return vk.alert(`${nowym}月员工放个补助明细删除失败！`);
						}

						// 2. 提取所有身份证号码
						const cards = res.map(item => item.card).filter(card => card);
						if (cards.length === 0) {
							return vk.alert('Excel中没有有效的身份证号码！');
						}

						// 3. 批量检查人员基本资料
						/*vk.toast('检查人员基本资料中...');
						const checkRes = await vk.callFunction({
							url: 'admin/hrm/employees/pub/getCheckCards',
							title: '检查人员资料...',
							data: {
								cards: cards
							}
						});

						if (checkRes.cardeds && checkRes.cardeds.length > 0) {
							const errorCards = checkRes.cardeds.slice(0, 10).join(', ');
							const errorMsg = checkRes.cardeds.length > 10 ?
								`人员基本资料不能为空(${checkRes.cardeds.length}条): ${errorCards}...等` :
								`人员基本资料不能为空(${checkRes.cardeds.length}条): ${errorCards}`;
							return vk.alert(errorMsg, "检测Excel导入数据", "确定");
						}*/

						// 4. 批量获取员工信息映射
						vk.toast('获取员工信息中...');
						const employeeMap = await vk.myfn.batchGetAttendEmployeeInfo(cards);
						if (!employeeMap) {
							return vk.alert('获取员工信息失败！');
						}

						// 5. 准备要处理的数据
						const validData = [];
						const errorData = [];

						for (const item of res) {
							// 验证必要字段
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

							// 获取card
							const employeeInfo = employeeMap.get(item.card);
							if (!employeeInfo) {
								errorData.push({
									item,
									reason: '未找到对应的员工信息'
								});
								continue;
							}

							// 1： 月薪 2： 日薪
							item.standard_type === "月薪" ? 1 : 2;

							//修改新增人员和时间									
							item.update_date = new Date().getTime();
							item.update_id = vk.getVuex('$user.userInfo._id');

							item.card = employeeInfo.card;
							validData.push(item);
						}

						if (errorData.length > 0) {
							const errorMsg = errorData.slice(0, 5).map(err =>
								`身份证: ${err.item.card} - ${err.reason}`
							).join('\n');

							if (errorData.length > 5) {
								errorMsg += `\n...还有${errorData.length - 5}条错误数据`;
							}

							return vk.alert(`所有数据验证失败:\n${errorMsg}`, "导入失败", "确定");
						}

						// 6. 批量处理数据
						vk.toast('开始导入数据...');
						const result = await vk.callFunction({
							url: 'admin/hrm/salary/sys/free/addAll',
							title: '请求中...',
							data: {
								items: validData
							},
						});

						if (result.code === 0) {
							let resultMessage = `导入完成！成功: ${result.id.length}条`;
							vk.alert(resultMessage, "导入成功", "确定", () => {
								this.refresh();
							})
						} else {
							vk.alert(`导入Excel失败!`, "系统错误", "确定");
						}
					})
				} catch (error) {
					console.error('导入Excel失败:', error);
					vk.alert(`导入Excel失败: ${error.message}`, "系统错误", "确定");					
				} finally {
					this.fileList = [];
				}
			},
			// 导入xls表格文件模版
			exportExcelModel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '员工放假补助模版',
					title: "正在导出数据...",
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "text"
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "standard_type",
							"title": "标准类型",
							"type": "number",
							formatter: function(val, row, column, index) {
								if (row.standard_type == 1) return '月薪';
								if (row.standard_type == 2) return '日薪';
							}
						},
						{
							"key": "standard",
							"title": "放假标准",
							"type": "number"
						},
						{
							"key": "first_month",
							"title": "第一月",
							"type": "number"
						},
						{
							"key": "second_month",
							"title": "第二月",
							"type": "number"
						},
						{
							"key": "total",
							"title": "合计",
							"type": "number"
						},
						{
							"key": "amount",
							"title": "补贴金额",
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
					pageSize: 1, // 此值为-1，代表导出所有数据
				});
			},
			// 导出xls表格文件（全部数据）
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '员工放假补助信息',
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
							"key": "employees.position_name",
							"title": "职位名称",
							"type": "text"
						},

						{
							"key": "employees.department_name",
							"title": "所属部门",
							"type": "text"
						},
						{
							"key": "employees.hire_date",
							"title": "入职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
						},
						{
							"key": "standard_type",
							"title": "标准类型",
							"type": "number",
							formatter: function(val, row, column, index) {
								if (row.standard_type == 1) return '月薪';
								if (row.standard_type == 2) return '日薪';
							}
						},
						{
							"key": "standard",
							"title": "放假标准",
							"type": "number",
						},
						{
							"key": "first_month",
							"title": "第一月",
							"type": "number"
						},
						{
							"key": "second_month",
							"title": "第二月",
							"type": "number"
						},
						{
							"key": "total",
							"title": "合计",
							"type": "number"
						},
						{
							"key": "amount",
							"title": "补贴金额",
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
			}
		},
		// 监听属性
		watch: {

		},
		// 计算属性
		computed: {

		}
	};
</script>
<style lang="scss" scoped>
	.page-body {}
</style>