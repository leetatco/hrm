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
				<!-- <el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasRole('hr-add')" @click="importMonthDatas"> 读入月考勤数据
				</el-button> -->
				<el-upload style="display: inline-block;margin-left: 20rpx;margin-right: 20rpx;" accept=".xlsx, .xls"
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-add')" :auto-upload="false" :limit="1"
					:show-file-list="false" :on-change="handleChange" :file-list="fileList" action="">
					<el-button type="success" size="small" icon="el-icon-upload2">导入excel</el-button>
				</el-upload>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-export')" @click="exportExcelAll"> 导出全部
				</el-button>
				<el-button type="primary" size="small" icon="el-icon-tickets" @click="exportExcelModel"
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-add')"> 下载模版
				</el-button>				
				<el-button type="danger" size="small" icon="el-icon-delete" @click="deleteAll"
					v-if="$hasRole('admin')"> 删除考勤日期数据
				</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:row-no="false" :pagination="true" @current-change="currentChange" :selection="true"
			@selection-change="selectionChange" :page-sizes="pageSizes"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="500px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="80px"
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

	let nowm1 = nowm > 9 ? nowm : `0${nowm}`;
	const nowym = vk.myfn.normalizeMonth(`${nowy}-${nowm1}`);
	export default {
		data() {
			// 页面数据变量
			return {
				pageSizes: [1, 5, 10, 20, 50, 100, 500, 1000],
				fileList: [],
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/attendance/sys/getList",
					//按钮显示
					rightBtns: [{
						mode: 'detail_auto',
						title: '详细',
						show: (item) => {
							return this.$hasRole('admin') || this.$hasPermission('hrm-attendance-view')
						}
					}],
					// 表格字段显示规则
					columns: [{
							key: "attendance_ym",
							title: "考勤日期",
							type: "date",
							dateType: "date",
							fixed: true,
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
							width: colWidth - 100
						},
						{
							"key": "employee_name",
							"title": "员工姓名",
							"type": "text",
							fixed: true,
							"width": colWidth - 100
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text",
							"sortable": true,
							"width": colWidth - 30
						},
						{
							"key": "department_name",
							"title": "部门",
							"type": "text",
							"width": colWidth - 50
						},
						{
							"key": "position_name",
							"title": "岗位",
							"type": "text",
							"width": colWidth - 50
						},
						{
							key: "hire_date",
							title: "入职日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM-dd",
							format: "yyyy-MM-dd",
							width: colWidth - 100
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "text",
							"width": colWidth - 50
						},
						{
							"key": "work_days",
							"title": "全勤天数",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "real_days",
							"title": "实际天数",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "typhoon_duty",
							"title": "台风",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "spring_festival_duty",
							"title": "留年",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "overtime_hours",
							"title": "加班小时",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "earlytime_hours",
							"title": "迟/早退(分)",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "missed_count",
							"title": "未打卡(次)",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "user_confirmed",
							"title": "本人确认",
							"type": "text",
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
							format: "yyyy-MM"
						},
						{
							key: "card",
							title: "",
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
						//{"key":"real_days","title":"实际天数","type":"number","width":200,"mode":"="},
						//{"key":"overtime_hours","title":"加班小时","type":"text","width":200,"mode":"="},
						//{"key":"earlytime_hours","title":"迟/早退（分）","type":"number","width":200,"mode":"="},
						//{"key":"missed_count","title":"未打卡（次）","type":"number","width":200,"mode":"="},
						// {
						// 	"key": "enable_hr",
						// 	"title": "人事审核",
						// 	"type": "select",
						// 	"width": colQueryWidth,
						// 	// "show": ["none"],
						// 	"data": [{
						// 		"value": true,
						// 		"label": "已通过"
						// 	}, {
						// 		"value": false,
						// 		"label": "未通过"
						// 	}],
						// 	"mode": "="
						// },
						//{"key":"comment","title":"备注","type":"text","width":200,"mode":"="},
						//{"key":"update_date","title":"更新时间","type":"datetimerange","width":200,"mode":"="},
						//{"key":"update_id","title":"更新人","type":"text","width":200,"mode":"="}
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						enable_hr: false,
						enable_fd: false
					},
					// 表单属性
					props: {
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
								"key": "employee_name",
								"title": "员工姓名",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "work_days",
								"title": "全勤天数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "real_days",
								"title": "实际天数",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "overtime_hours",
								"title": "加班小时",
								"type": "number",
								"precision": 1,
								"width": colWidth
							},
							{
								"key": "earlytime_hours",
								"title": "迟/早退（分）",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "missed_count",
								"title": "未打卡（次）",
								"type": "number",
								"width": colWidth
							},
							{
								"key": "enable_hr",
								"title": "人事审核",
								"type": "switch",
								"tips": "当关闭时，审核未通过，开启时，审核通过",
								"width": colWidth
							},
							{
								key: "comment",
								title: "备注",
								type: "textarea",
								maxlength: "99",
								showWordLimit: true,
								width: colWidth,
								autosize: {
									minRows: 2,
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
							employee_name: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							work_days: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}, {
								validator: vk.pubfn.validator("number"),
								message: '只能输入数学',
								trigger: 'blur'
							}],
							real_days: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}, {
								validator: vk.pubfn.validator("number"),
								message: '只能输入数学',
								trigger: 'blur'
							}],
							overtime_hours: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							earlytime_hours: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}, {
								validator: vk.pubfn.validator("number"),
								message: '只能输入数学',
								trigger: 'blur'
							}],
							missed_count: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}, {
								validator: vk.pubfn.validator("number"),
								message: '只能输入数学',
								trigger: 'blur'
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
			async importMonthDatas() {
				let data = await vk.callFunction({
					url: 'admin/hrm/attendance/sys/importMonthDatas',
					title: '请求中...',
					data: {
						sql: 'select * from tdh_oa.tdh_signrecord where admin_id=?',
						params: ['12590']
					},
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
			//删除导入的数据
			async deleteAll() {
				try {
					if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
						return vk.alert(`考勤日期不能为空！`);
					}
					const attendance_ym = this.queryForm1.formData.attendance_ym;
					// 删除旧数据
					let delRes = await vk.callFunction({
						url: 'admin/hrm/attendance/sys/all/deleteDetailAll',
						title: '删除中...',
						data: {
							attendance_ym: attendance_ym
						}
					})

					if (delRes.code != 0) {
						return vk.alert(`${attendance_ym}月考勤明细删除失败！`);
					}
					return vk.alert(`${attendance_ym}月考勤明细删除成功！`);
				} catch (err) {

				} finally {
					this.refresh();
				}
			},
			//导入xls表格文件
			async handleChange(file) {
				// 定义字段类型
				let typeObj = {
					attendance_ym: {
						"title": "考勤日期",
						"type": "text"
					},
					employee_name: {
						"title": "姓名",
						"type": "text"
					},
					card: {
						"title": "身份证号码",
						"type": "text"
					},
					department_name: {
						"title": "部门",
						"type": "text"
					},
					position_name: {
						"title": "岗位",
						"type": "text"
					},
					hire_date: {
						"title": "入职日期",
						"type": "number"
					},
					resign_date: {
						"title": "离职日期",
						"type": "text"
					},
					work_days: {
						"title": "全勤天数",
						"type": "number"
					},
					real_days: {
						"title": "上班天数",
						"type": "text"
					},
					typhoon_duty: {
						"title": "台风",
						"type": "text"
					},
					spring_festival_duty: {
						"title": "留年",
						"type": "text"
					},
					overtime_hours: {
						"title": "加班小时",
						"precision": 1,
						"type": "number"
					},
					earlytime_hours: {
						"title": "迟/早退（分）",
						"type": "number"
					},
					missed_count: {
						"title": "未打卡（次）",
						"type": "number"
					},
					user_confirmed: {
						"title": "本人确认",
						"type": "text"
					},
					comment: {
						"title": "备注",
						"type": "text"
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

						// 删除旧数据
						let delRes = await vk.callFunction({
							url: 'admin/hrm/attendance/sys/all/deleteDetailAll',
							title: '删除中...',
							data: {
								attendance_ym: attendance_ym
							}
						})

						if (delRes.code != 0) {
							return vk.alert(`${attendance_ym}月考勤明细删除失败！`);
						}

						// 1. 数据验证
						const validationResult = this.validateExcelData(res);
						if (!validationResult.valid) {
							return vk.alert(validationResult.message, "数据验证失败", "确定");
						}

						// 2. 提取所有身份证号码
						const cards = res.map(item => item.card).filter(card => card);
						if (cards.length === 0) {
							return vk.alert('Excel中没有有效的身份证号码！');
						}

						// 3. 批量检查人员基本资料
						// vk.toast('检查人员基本资料中...');
						// const checkRes = await vk.callFunction({
						// 	url: 'admin/hrm/employees/pub/getCheckCards',
						// 	title: '检查人员资料...',
						// 	data: {
						// 		cards: cards
						// 	}
						// });

						// if (checkRes.cardeds && checkRes.cardeds.length > 0) {
						// 	const errorCards = checkRes.cardeds.slice(0, 10).join(', ');
						// 	const errorMsg = checkRes.cardeds.length > 10 ?
						// 		`人员基本资料不能为空(${checkRes.cardeds.length}条): ${errorCards}...等` :
						// 		`人员基本资料不能为空(${checkRes.cardeds.length}条): ${errorCards}`;
						// 	return vk.alert(errorMsg, "检测Excel导入数据", "确定");
						// }

						// 4. 批量获取员工信息映射
						// vk.toast('获取员工信息中...');
						// const employeeMap = await vk.myfn.batchGetEmployeeInfo(cards);
						// if (!employeeMap) {
						// 	return vk.alert('获取员工信息失败！');
						// }

						// 5. 准备要处理的数据
						const validData = [];
						const errorData = [];

						for (const item of res) {

							item.attendance_ym = attendance_ym

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

							// 获取employee_id
							// const employeeInfo = employeeMap.get(item.card);
							// if (!employeeInfo) {
							// 	errorData.push({
							// 		item,
							// 		reason: '未找到对应的员工信息'
							// 	});
							// 	continue;
							// }

							//修改新增人员和时间									
							item.update_date = new Date().getTime();
							item.update_id = vk.getVuex('$user.userInfo._id');

							// item.employee_id = employeeInfo.employee_id;
							// item.attendance_ym = this.formatAttendanceYm(item.attendance_ym);							

							let utcDate = new Date(Date.UTC(1900, 0, item.hire_date - 1));
							item.hire_date = utcDate.toISOString().slice(0, 10);

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
							url: 'admin/hrm/attendance/sys/all/addDetailAll',
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

			// 验证Excel数据
			validateExcelData(data) {
				if (!Array.isArray(data)) {
					return {
						valid: false,
						message: '数据格式错误'
					};
				}

				// 检查是否有重复的身份证+考勤日期组合
				const keySet = new Set();
				const duplicates = [];

				for (const item of data) {
					if (item.card && item.attendance_ym) {
						const key = `${item.card}_${item.attendance_ym}_${item.resign_date}`;
						if (keySet.has(key)) {
							console.log('重复数据:', item);
							duplicates.push(item.card);
						}
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

			// 按考勤日期分组数据
			groupDataByAttendanceYm(data) {
				const grouped = {};

				data.forEach(item => {
					const key = item.attendance_ym;
					if (!grouped[key]) {
						grouped[key] = [];
					}
					grouped[key].push(item);
				});
				return grouped;
			},

			// 格式化考勤日期
			formatAttendanceYm(attendanceYm) {
				// 假设attendance_ym格式为 'YYYY-MM' 或 'YYYY/MM' 或时间戳
				if (typeof attendanceYm === 'number') {
					// 如果是Excel日期数字，转换为日期字符串
					const date = new Date((attendanceYm - 25569) * 86400 * 1000);
					return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
				}

				// 处理字符串格式
				if (typeof attendanceYm === 'string') {
					// 替换斜杠为横杠
					attendanceYm = attendanceYm.replace(/\//g, '-');

					// 确保格式为 YYYY-MM
					const match = attendanceYm.match(/(\d{4})[-/]?(\d{1,2})/);
					if (match) {
						const year = match[1];
						const month = String(match[2]).padStart(2, '0');
						return `${year}-${month}`;
					}
				}

				return attendanceYm;
			},

			// 导入xls表格文件模版
			exportExcelModel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '考勤明细模版',
					title: "正在导出数据...",
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "text"
						},
						{
							"key": "employee_name",
							"title": "姓名",
							"type": "text"
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "department_name",
							"title": "部门",
							"type": "text"
						},
						{
							"key": "position_name",
							"title": "岗位",
							"type": "text"
						},
						{
							"key": "hire_date",
							"title": "入职日期",
							"type": "number"
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "text"
						},
						{
							"key": "work_days",
							"title": "全勤天数",
							"type": "number"
						},
						{
							"key": "real_days",
							"title": "实际天数",
							"type": "text"
						},
						{
							"key": "typhoon_duty",
							"title": "台风",
							"type": "text"
						},
						{
							"key": "spring_festival_duty",
							"title": "留年",
							"type": "text"
						},
						{
							"key": "overtime_hours",
							"title": "加班小时",
							"type": "number",
							"precision": 1
						},
						{
							"key": "earlytime_hours",
							"title": "迟/早退（分）",
							"type": "number"
						},
						{
							"key": "missed_count",
							"title": "未打卡（次）",
							"type": "number"
						},
						{
							"key": "user_confirmed",
							"title": "本人确认",
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
				if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
					return vk.alert(`考勤日期不能为空！`);
				}
				const attendance_ym = this.queryForm1.formData.attendance_ym;
				this.$refs.table1.exportExcel({
					fileName: attendance_ym + '员工考勤信息',
					title: "正在导出数据...",
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM",
							"format": "yyyy-MM"
						},
						{
							"key": "employee_name",
							"title": "员工姓名",
							"type": "text"
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text"
						},
						{
							"key": "department_name",
							"title": "部门",
							"type": "text"
						},
						{
							"key": "position_name",
							"title": "岗位",
							"type": "text"
						},
						{
							"key": "hire_date",
							"title": "入职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"format": "yyyy-MM-dd"
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "text"
						},
						{
							"key": "work_days",
							"title": "全勤天数",
							"type": "number"
						},
						{
							"key": "typhoon_duty",
							"title": "台风",
							"type": "text"
						},
						{
							"key": "spring_festival_duty",
							"title": "留年",
							"type": "text"
						},
						{
							"key": "real_days",
							"title": "实际天数",
							"type": "number"
						},
						{
							"key": "overtime_hours",
							"title": "加班小时",
							"type": "number",
							"precision": 1
						},
						{
							"key": "earlytime_hours",
							"title": "迟/早退（分）",
							"type": "number"
						},
						{
							"key": "missed_count",
							"title": "未打卡（次）",
							"type": "number"
						},
						{
							"key": "user_confirmed",
							"title": "本人确认",
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