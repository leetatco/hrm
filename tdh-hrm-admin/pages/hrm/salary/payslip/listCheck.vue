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
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-payslip-view')" @click="exportExcelAll"> 导出全部
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
	import myfn from '../../../../common/function/myPubFunction';

	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
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
			// 页面数据变量
			return {
				pageSizes: [1, 5, 10, 20, 50, 100, 500, 1000],
				fileList: [],
				sumList: [],
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/salary/sys/payslip/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-salary-payslip-view')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "date",
							"dateType": "date",
							"fixed": true,
							"valueFormat": "yyyy-MM",
							"format": "yyyy-MM"
						}, 
						{
							"key": "attendance_ym_key",
							"title": "月份",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "employee_name",
							"title": "姓名",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "signature_url",
							"title": "签名",
							"type": "image",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text",
							"fixed": true,
							"width": colWidth - 30
						},
						{
							"key": "department_name",
							"title": "部门",
							"fixed": true,
							"type": "text",
							"width": colWidth
						},
						{
							"key": "position_name",
							"title": "岗位",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "hire_date",
							"title": "入职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth - 100
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "text",
							"width": colWidth - 100
						},						
						{
							key: "status",
							title: "状态",
							type: "tag",
							width: colWidth - 100,
							data: [{
									value: 1,
									label: "已签名",
									tagType: "success"
								},
								{
									value: 0,
									label: "未签名",
									tagType: "warning"
								}
							]
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
						attendance_ym: nowym,
						status: 1
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
						}, {
							key: "card",
							title: "",
							type: "table-select",
							placeholder: "选择员工",
							action: "admin/hrm/salary/sys/payslip/getList",
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
						},{
							key: "status",
							title: "状态",
							type: "select",
							width: colWidth - 50,
							data: [{
									value: 0,
									label: "未签名"
								},
								{
									value: 1,
									label: "已签名"
								}
							],
							mode: "="
						},
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {},
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
								disabled: true,
								valueFormat: "yyyy-MM",
								format: "yyyy-MM",
								"width": colWidth

							}, {
								key: "card",
								title: "姓名",
								type: "table-select",
								disabled: true,
								placeholder: "选择员工",
								action: "admin/hrm/salary/sys/payslip/getList",
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
				// 其它弹窗表单
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
			async search() {				
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
			
			// 导出xls表格文件（全部数据）
			exportExcelAll() {
				if (vk.pubfn.isNull(this.queryForm1.formData.attendance_ym)) {
					return vk.alert(`考勤日期不能为空！`);
				}
				const attendance_ym = this.queryForm1.formData.attendance_ym;
				this.$refs.table1.exportExcel({
					fileName: attendance_ym + '月份工资条',
					title: "正在导出数据...",
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "date",
							"dateType": "date",
							"fixed": true,
							"valueFormat": "yyyy-MM",
							"format": "yyyy-MM"
						}, 
						{
							"key": "attendance_ym_key",
							"title": "月份",
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
							"title": "任职部门",
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
							"key": "status",
							"title": "状态",
							"type": "number",
							formatter: function(val, row, column, index) {
								return row.status == 1 ? '已签名' : '未签名';
							}
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