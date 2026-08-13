<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('attendance-sign-add')" @click="addBtn">添加</el-button>
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
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="180px" :inline="true"
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
				table1: {
					action: "admin/hrm/attendance/sys/sign/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-sign-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-sign-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-sign-delete')
						}
					],
					columns: [{
							key: "rule_name",
							title: "规则名称",
							type: "text",
							width: colWidth - 40,
							fixed: true
						},
						{
							key: "sign_in_before_minutes",
							title: "上班提前(分)",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "sign_in_after_minutes",
							title: "上班延后(分)",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "sign_out_before_minutes",
							title: "下班提前(分)",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "sign_out_after_minutes",
							title: "下班延后(分)",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "multi_punch_strategy",
							title: "多次打卡策略",
							type: "select",
							width: colWidth,
							data: [{
									value: 1,
									label: "取最早签到+最晚签退"
								},
								{
									value: 2,
									label: "取最早两次"
								},
								{
									value: 3,
									label: "取最晚两次"
								}
							],
							formatter: (val) => {
								const map = {
									1: '最早+最晚',
									2: '最早两次',
									3: '最晚两次'
								};
								return map[val] || val;
							}
						},
						{
							key: "missing_punch_min_work_minutes",
							title: "缺卡最低工时(分)",
							type: "number",
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
							key: "rule_name",
							title: "规则名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "status",
							title: "启用状态",
							type: "select",
							width: colWidth - 80,
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
						rule_name: '',
						sign_in_before_minutes: 60,
						sign_in_after_minutes: 30,
						sign_out_before_minutes: 30,
						sign_out_after_minutes: 120,
						multi_punch_strategy: 1,
						missing_punch_min_work_minutes: 0,
						status: 1,
						remark: ''
					},
					props: {
						action: "",
						columns: [{
								key: "rule_name",
								title: "规则名称",
								type: "text",
								width: colWidth,
								required: true
							},
							{
								key: "sign_in_before_minutes",
								title: "上班打卡提前(分钟)",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "sign_in_after_minutes",
								title: "上班打卡延后(分钟)",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "sign_out_before_minutes",
								title: "下班打卡提前(分钟)",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "sign_out_after_minutes",
								title: "下班打卡延后(分钟)",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "multi_punch_strategy",
								title: "多次打卡处理策略",
								type: "select",
								width: colWidth,
								required: true,
								data: [{
										value: 1,
										label: "取最早签到+最晚签退"
									},
									{
										value: 2,
										label: "取最早两次"
									},
									{
										value: 3,
										label: "取最晚两次"
									}
								]
							},
							{
								key: "missing_punch_min_work_minutes",
								title: "缺卡最小工作分钟数",
								type: "number",
								width: colWidth - 60
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
							rule_name: [{
								required: true,
								message: "规则名称不能为空",
								trigger: "blur"
							}],
							sign_in_before_minutes: [{
								required: true,
								message: "不能为空",
								trigger: "blur"
							}],
							sign_in_after_minutes: [{
								required: true,
								message: "不能为空",
								trigger: "blur"
							}],
							sign_out_before_minutes: [{
								required: true,
								message: "不能为空",
								trigger: "blur"
							}],
							sign_out_after_minutes: [{
								required: true,
								message: "不能为空",
								trigger: "blur"
							}],
							multi_punch_strategy: [{
								required: true,
								message: "请选择策略",
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
				vk.pubfn.resetForm(originalForms, this);
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/attendance/sys/sign/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加打卡规则';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/attendance/sys/sign/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑打卡规则';
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
					action: "admin/hrm/attendance/sys/sign/delete",
					data: {
						_id: item._id
					}
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