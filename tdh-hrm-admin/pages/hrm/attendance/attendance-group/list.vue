<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
			<template v-slot:company_id="{form}">
				<vk-data-input-tree-select v-model="form.company_id" action="admin/hrm/company/sys/getList"
					:props="{ list:'rows', value:'company_id', label:'company_name', children:'children' }"
					@change="toCompany" placeholder="请选择"></vk-data-input-tree-select>
			</template>
			<template v-slot:department_ids="{form}">
				<vk-data-input-tree-select v-model="form1.department_id" :localdata="departments" placeholder="请选择"
					@change="toDepartment"></vk-data-input-tree-select>
			</template>
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('attendance-group-add')" @click="addBtn">添加</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="950px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="140px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
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
				departments: [], // 部门下拉数据（随公司联动）
				table1: {
					action: "admin/hrm/attendance/sys/group/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-group-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-group-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-group-delete')
						}
					],
					columns: [{
							key: "group_name",
							title: "考勤组名称",
							type: "text",
							width: colWidth - 40,
							fixed: true
						},
						{
							key: "company_name",
							title: "所属公司",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.companyInfo ? row.companyInfo.company_name : ''
						},
						{
							key: "department_ids",
							title: "包含部门",
							type: "html",
							width: colWidth,
							formatter: (val, row) => {
								let str = "<text>";
								row.departmentInfo.map((item, index) => {
									str += item.department_name;
									str += "<br>";
								})
								str += "</text>";
								return str;
							}
						},
						{
							key: "employee_ids",
							title: "额外员工",
							type: "html",
							width: colWidth - 80,
							formatter: (val, row) => {
								let str = "<text>";
								row.employeeInfo.map((item, index) => {
									str += item.employee_name;
									str += "<br>";
								})
								str += "</text>";
								return str;
							}
						},
						{
							key: "shift_name",
							title: "默认班次",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.shiftInfo ? row.shiftInfo.shift_name : ''
						},
						{
							key: "overtime_rule_name",
							title: "加班规则",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.overtimeRuleInfo ? row.overtimeRuleInfo.rule_name : ''
						},
						{
							key: "punch_rule_name",
							title: "打卡规则",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.punchRuleInfo ? row.punchRuleInfo.rule_name : ''
						},
						{
							key: "punch_location_id",
							title: "允许打卡地点",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.punchLocationInfo ?
								`${row.punchLocationInfo.ssid}-${row.punchLocationInfo.address}` : ''
						},
						{
							key: "calendar_code",
							title: "工作日历",
							type: "text",
							width: colWidth - 20,
							formatter: (val, row) => {
								// 优先用冗余字段拼接展示
								if (row.calendar_name && row.calendar_year) {
									return `${row.calendar_name}（${row.calendar_year}）`;
								}
								// 兜底：直接用 calendar_code
								if (val) {
									return val;
								}
							}
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
							key: "group_name",
							title: "考勤组名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "company_id",
							title: "所属公司",
							type: "text", // 用 slot 自定义渲染，这里占位
							width: colWidth,
							mode: "="
						},
						{
							key: "department_ids",
							title: "所属部门",
							type: "text", // 用 slot 自定义渲染，这里占位
							width: colWidth,
							mode: "="
						},
						{
							key: "calendar_code",
							title: "工作日历",
							type: "remote-select",
							placeholder: "请选择工作日历",
							width: colWidth + 40,
							action: "admin/hrm/attendance/sys/calendar/getCalendarList",
							props: {
								list: "rows",
								value: "calendar_code",
								label: "label"
							},
							showAll: true,
							actionData: {
								pageSize: 1000
							},
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
						group_name: '',
						company_id: '',
						department_ids: [],
						shift_id: '',
						overtime_rule_id: '',
						punch_rule_id: '',
						calendar_code: '',
						calendar_name: '',
						calendar_year: null,
						employee_ids: [],
						status: true,
						remark: ''
					},
					props: {
						action: "",
						columns: [{
								key: "group_name",
								title: "考勤组名称",
								type: "text",
								width: colWidth,
								required: true
							},
							{
								key: "shift_id",
								title: "默认班次",
								type: "remote-select",
								placeholder: "请选择班次",
								width: colWidth,
								required: true,
								action: "admin/hrm/attendance/sys/shift/getList",
								props: {
									list: "rows",
									value: "_id",
									label: "shift_name"
								},
								showAll: true,
								actionData: {
									flatten: true,
									pageSize: 1000,
									status: true
								}
							},
							{
								key: "overtime_rule_id",
								title: "加班规则",
								type: "remote-select",
								placeholder: "请选择加班规则",
								width: colWidth,
								action: "admin/hrm/attendance/sys/overtimeRule/getList",
								props: {
									list: "rows",
									value: "_id",
									label: "rule_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000,
									status: true
								}
							},
							{
								key: "punch_rule_id",
								title: "打卡规则",
								type: "remote-select",
								placeholder: "请选择打卡规则",
								width: colWidth,
								action: "admin/hrm/attendance/sys/punchrule/getList",
								props: {
									list: "rows",
									value: "_id",
									label: "rule_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000,
									status: true
								}
							},
							{
								key: "calendar_code",
								title: "工作日历",
								type: "remote-select",
								placeholder: "请选择工作日历",
								width: colWidth + 40,
								required: true,
								action: "admin/hrm/attendance/sys/calendar/getCalendarList",
								props: {
									list: "rows",
									value: "calendar_code",
									label: "label"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								},
								watch: ({
									value,
									formData,
									column,
									index,
									option,
									$set
								}) => {
									// 选择日历后，同步冗余字段 calendar_name、calendar_year
									if (value && option) {
										this.$set(this.form1.data, 'calendar_name', option.calendar_name || '');
										this.$set(this.form1.data, 'calendar_year', option.year || null);
									} else {
										this.$set(this.form1.data, 'calendar_name', '');
										this.$set(this.form1.data, 'calendar_year', null);
									}
								}
							},
							{
								key: "company_id",
								title: "所属公司",
								type: "tree-select",
								placeholder: "请选择所属公司",
								width: colWidth,
								required: true,
								action: "admin/hrm/company/sys/getList",
								props: {
									list: "rows",
									value: "company_id",
									label: "company_name",
									children: "children"
								},
								watch: ({
									value,
									formData,
									column,
									index,
									option,
									$set
								}) => {
									// 切换公司时清空已选部门并更新部门接口参数
									let item = vk.pubfn.getListItem(this.form1.props.columns, "key",
										"department_ids");
									if (item) {
										item.actionData.company_id = value;
									}
									this.$set(this.form1.data, "department_ids", []);
								}
							},
							{
								key: "department_ids",
								title: "包含部门",
								type: "tree-select",
								placeholder: "请选择部门（可多选）",
								width: colWidth,
								multiple: true,
								action: "admin/hrm/department/pub/getList",
								props: {
									list: "rows",
									value: "department_id",
									label: "department_name",
									children: "children"
								},
								actionData: {
									company_id: ""
								},
								required: true
							},
							{
								key: "employee_ids",
								title: "额外员工",
								type: "table-select",
								placeholder: "部门外另行指定",
								width: colWidth,
								multiple: true,
								action: "admin/hrm/employees/sys/getList",
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
										width: 150,
										mode: "%%"
									},
									{
										key: "employee_name",
										title: "姓名",
										type: "text",
										width: 150,
										mode: "%%"
									}
								]
							},
							{
								key: "punch_location_id",
								title: "允许打卡地点",
								type: "table-select",
								placeholder: "请选择打卡地点",
								width: colWidth,
								multiple: false,
								action: "admin/hrm/clockin/sys/setting/getList",
								columns: [{
										key: "_id",
										title: "打卡点ID",
										type: "text",
										idKey: true,
										show: ["detail", "update", "add"]
									},
									{
										key: "company_name",
										title: "公司别",
										type: "text",
										width: 100
									},
									{
										key: "department_name",
										title: "部门名称",
										type: "text",
										width: 120
									},
									{
										key: "address",
										title: "位置",
										type: "text",
										nameKey: true
									},
									{
										key: "bssid",
										title: "WiFi名称",
										type: "text"
									},
									{
										key: "ssid",
										title: "WiFi Mac",
										type: "text"
									}
								],
								queryColumns: [{
										key: "company_name",
										title: "公司名称",
										type: "text",
										width: 150,
										mode: "%%"
									},
									{
										key: "department_name",
										title: "部门名称",
										type: "text",
										width: 150,
										mode: "%%"
									},
									{
										key: "address",
										title: "位置",
										type: "text",
										width: 150,
										mode: "%%"
									},
									{
										key: "bssid",
										title: "WiFi名称",
										type: "text",
										width: 150,
										mode: "%%"
									}
								],
								formData: (row) => {
									return {
										flatten: true
									};
								}
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
							group_name: [{
								required: true,
								message: "考勤组名称不能为空",
								trigger: "blur"
							}],
							company_id: [{
								required: true,
								message: "所属公司不能为空",
								trigger: "change"
							}],
							calendar_code: [{
								required: true,
								message: "工作日历不能为空",
								trigger: "change"
							}],
							punch_location_id: [{
								required: true,
								message: "允许打卡点不能为空",
								trigger: "change"
							}],
							department_ids: [{
								required: true,
								message: "至少选择一个部门",
								trigger: "change"
							}],
							punch_rule_id: [{
								required: true,
								message: "至少选择一个打卡规则",
								trigger: "change"
							}],
							shift_id: [{
								required: true,
								message: "默认班次不能为空",
								trigger: "change"
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				}
			};
		},
		onLoad() {
			originalForms = {
				form1: vk.pubfn.copyObject(this.form1)
			};
		},
		methods: {
			search() {
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			resetForm() {
				this.departments = [];
				this.$set(this.form1, "department_id", "");
				vk.pubfn.resetForm(originalForms, this);
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/attendance/sys/group/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加考勤组';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				let departmentItem = vk.pubfn.getListItem(this.form1.props.columns, "key", "department_ids");
				departmentItem.actionData.company_id = item.company_id;
				this.form1.props.action = 'admin/hrm/attendance/sys/group/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑考勤组';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/attendance/sys/group/delete",
					data: {
						_id: item._id
					}
				});
			},
			// 递归转换成 tree-select 需要的结构
			toTreeData(originalData) {
				if (!originalData || !Array.isArray(originalData)) return [];
				const convertNode = (node) => {
					return {
						value: node.department_id,
						label: node.department_name,
						manager: node.department_manager_id,
						children: node.children && node.children.length > 0 ?
							node.children.map(child => convertNode(child)) : []
					};
				};
				return originalData
					.filter(item => vk.pubfn.isNull(item.parent_department_id))
					.map(root => convertNode(root));
			},
			// 选择公司 → 联动加载部门下拉
			async toCompany(e) {
				this.departments = [];
				this.$refs.table1.queryParam.formData.department_id = "";
				this.$set(this.form1.data, "department_id", "");
			
				if (!e) {
					this.search();
					return;
				}
			
				// 拿公司名（用于 tree-select 根节点 label）
				let companyLabel = "";
				let companyList = this.$refs.queryForm1 && this.$refs.queryForm1.options ?
					this.$refs.queryForm1.options.company_id : null;
				if (Array.isArray(companyList)) {
					const found = companyList.find(o => o.value === e);
					if (found) companyLabel = found.label;
				}
			
				let res = await vk.callFunction({
					url: 'admin/hrm/department/pub/getList',
					title: '请求中...',
					data: {
						company_id: e
					},
				});
			
				const deptTree = this.toTreeData(res.rows || []);
			
				// 把"公司"作为根节点包裹，形成"公司 → 部门"层级
				const treeData = [{
					value: e,
					label: companyLabel || "公司",
					children: deptTree
				}];
			
				this.departments = treeData;
				this.search();
			},
			toDepartment(e) {
				this.$set(this.queryForm1.formData, "department_id", e);
				this.search();
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