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
					v-if="$hasRole('admin') || $hasRole('hr-add')" @click="addBtn">添加</el-button>
				<!-- 批量操作 -->
				<el-dropdown v-if="table1.multipleSelection" :split-button="false" trigger="click" @command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0">
						批量操作<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">通过</el-dropdown-item>
						<el-dropdown-item :command="2">未通过</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
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
	const colTableWidth = 100;
	const colQueryWidth = 200;
	const colFormWidth = 300;
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
					action: "admin/hrm/attendance/sys/approve/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasRole('hr-read')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasRole('hr-update')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasRole('hr-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							"key": "employees.employee_id",
							"title": "员工工号",
							"type": "text",
							"width": colTableWidth
						},
						{
							"key": "employees.employee_name",
							"title": "员工姓名",
							"type": "text",
							"width": colTableWidth
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text",
							"width": colTableWidth + 100
						},
						{
							"key": "employees.departments.department_name",
							"title": "部门",
							"type": "text",
							"width": colTableWidth + 100
						},
						{
							"key": "employees.positions.position_name",
							"title": "职位",
							"type": "text",
							"width": colTableWidth
						},
						{
							"key": "work_days",
							"title": "全勤天数",
							"type": "number",
							"width": colTableWidth
						},
						{
							"key": "real_days",
							"title": "实际天数",
							"type": "number",
							"width": colTableWidth
						},
						{
							"key": "overtime_hours",
							"title": "加班小时",
							"type": "text",
							"width": colTableWidth
						},
						{
							"key": "earlytime_hours",
							"title": "迟/早退(分)",
							"type": "number",
							"width": colTableWidth
						},
						{
							"key": "missed_count",
							"title": "未打卡(次)",
							"type": "number",
							"width": colTableWidth
						},
						{
							key: "enable_hr",
							title: "人事审核",
							type: "switch",
							activeValue: true,
							inactiveValue: false,
							width: colTableWidth,
							watch: (res) => {
								let {
									value,
									row,
									change
								} = res;
								vk.callFunction({
									url: "admin/hrm/attendance/sys/approve/update",
									title: value ? "通过中..." : "未通过中...",
									data: {
										_id: row._id,
										enable_hr: value
									},
									success: data => {
										this.refresh()
									}
								});
							}
						},
						{
							key: "enable_fd",
							title: "财务审核",
							type: "switch",
							activeValue: true,
							inactiveValue: false,
							width: colTableWidth,
							watch: (res) => {
								let {
									value,
									row,
									change
								} = res;
								vk.callFunction({
									url: "admin/hrm/attendance/sys/approve/update",
									title: value ? "通过中..." : "未通过中...",
									data: {
										_id: row._id,
										enable_fd: value
									},
									success: data => {
										this.refresh()
									}
								});
							}
						},
						{
							"key": "comment",
							"title": "备注",
							"type": "text",
							"width": colTableWidth + 100
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"type": "time",
							"width": colTableWidth,
							"show": ["detail"]
						},
						{
							"key": "usersupd.username",
							"title": "更新人",
							"type": "text",
							"width": colTableWidth,
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
						enable_hr: true
					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
							"key": "employee_id",
							"title": "员工工号",
							"type": "text",
							"width": colQueryWidth,
							"mode": "="
						},
						//{"key":"real_days","title":"实际天数","type":"number","width":200,"mode":"="},
						//{"key":"overtime_hours","title":"加班小时","type":"text","width":200,"mode":"="},
						//{"key":"earlytime_hours","title":"迟/早退(分)","type":"number","width":200,"mode":"="},
						//{"key":"missed_count","title":"未打卡(次)","type":"number","width":200,"mode":"="},
						{
							"key": "enable_fd",
							"title": "财务审核",
							"type": "select",
							"width": colQueryWidth,
							"data": [{
								"value": true,
								"label": "已通过"
							}, {
								"value": false,
								"label": "未通过"
							}],
							"mode": "="
						},
						//{"key":"comment","title":"备注","type":"text","width":200,"mode":"="},
						//{"key":"update_date","title":"更新时间","type":"datetimerange","width":200,"mode":"="},
						//{"key":"update_id","title":"更新人","type":"text","width":200,"mode":"="}
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {

					},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								"key": "employee_id",
								"title": "员工工号",
								"type": "text",
								"width": colFormWidth
							},
							{
								"key": "work_days",
								"title": "全勤天数",
								"type": "number",
								"width": colFormWidth
							},
							{
								"key": "real_days",
								"title": "实际天数",
								"type": "number",
								"width": colFormWidth
							},
							{
								"key": "overtime_hours",
								"title": "加班小时",
								"type": "number",
								"precision": 1,
								"width": colFormWidth
							},
							{
								"key": "earlytime_hours",
								"title": "迟/早退(分)",
								"type": "number",
								"width": colFormWidth
							},
							{
								"key": "missed_count",
								"title": "未打卡(次)",
								"type": "number",
								"width": colFormWidth
							},
							{
								"key": "enable_hr",
								"title": "人事审核",
								"type": "switch",
								"tips": "当关闭时，审核未通过，开启时，审核通过",
								"width": colFormWidth
							},
							{
								"key": "enable_fd",
								"title": "财务审核",
								"type": "switch",
								"tips": "当关闭时，审核未通过，开启时，审核通过",
								"width": colFormWidth
							},
							{
								key: "comment",
								title: "备注",
								type: "textarea",
								maxlength: "99",
								showWordLimit: true,
								width: colFormWidth,
								autosize: {
									minRows: 2,
									maxRows: 10
								}
							},
							{
								"key": "update_date",
								"title": "更新时间",
								"type": "date",
								"dateType": "datetime",
								"width": colFormWidth,
								"show": ["detail"]
							},
							{
								"key": "update_id",
								"title": "更新人",
								"type": "text",
								"width": colFormWidth,
								"show": ["detail"]
							}
						],
						// 表单验证规则
						rules: {
							employee_id: [{
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
				this.form1.props.action = 'admin/hrm/attendance/sys/approve/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/attendance/sys/approve/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			// 删除按钮
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/attendance/sys/approve/delete",
					data: {
						_id: item._id
					},
				});
			},
			// 监听 - 批量操作的按钮点击事件
			batchBtn(index) {
				switch (index) {
					case 1:
						this.table1.multipleSelection.forEach(async (e) => {
							let data = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/approve/update',
								title: '请求中...',
								data: {
									_id: e._id,
									enable_fd: true
								}
							})
							if (data.code == 0) vk.alert("批量审核通过成功", "确定",
								() => {
									this.refresh()
								})
						})

						break;
					case 2:
						this.table1.multipleSelection.forEach(async (e) => {
							let data = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/approve/update',
								title: '请求中...',
								data: {
									_id: e._id,
									enable_fd: false
								}
							})
							if (data.code == 0) vk.alert("批量审核未通过成功", "确定",
								() => {
									this.refresh()
								})
						})
						break;
					default:
						break;
				}
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