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
					v-if="$hasRole('admin') || $hasPermission('attendance-comprule-add')" @click="addBtn">添加</el-button>
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
					action: "admin/hrm/attendance/sys/comprule/getList",
					rightBtns: [
						{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-comprule-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-comprule-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-comprule-delete')
						}
					],
					columns: [
						{
							key: "rule_name",
							title: "规则名称",
							type: "text",
							width: colWidth - 40,
							fixed: true
						},
						{
							key: "valid_period",
							title: "有效期(月)",
							type: "number",
							width: colWidth - 80
						},
						{
							key: "auto_expire",
							title: "到期清零",
							type: "switch",
							width: colWidth - 80,
							formatter: (val) => val ? '是' : '否'
						},
						{
							key: "min_unit",
							title: "最小单位",
							type: "text",
							width: colWidth - 60,							
							formatter: (val) => {
								const map = { 1: '小时', 2: '半天', 3: '天',4: '分钟' };
								return map[val] || val;
							}
						},
						{
							key: "max_accumulate_minutes",
							title: "最大累积",
							type: "text",
							width: colWidth - 40,
							formatter: (val) => vk.myfn.formatMinutes(val)
						},
						{
							key: "overtime_to_comp_ratio",
							title: "加班转调休系数",
							type: "number",
							width: colWidth
						},
						{
							key: "same_month_only",
							title: "仅限当月调休",
							type: "switch",
							width: colWidth - 80,
							formatter: (val) => val ? '是' : '否'
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
					columns: [
						{
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
							data: [
								{ value: true, label: "启用" },
								{ value: false, label: "停用" }
							],
							mode: "="
						}
					]
				},
				form1: {
					data: {
						rule_name: '',
						valid_period: 3,
						auto_expire: true,
						min_unit: 1,
						max_accumulate_minutes: 0,
						overtime_to_comp_ratio: 1.0,
						status: true,
						remark: ''
					},
					props: {
						action: "",
						columns: [
							{
								key: "rule_name",
								title: "规则名称",
								type: "text",
								width: colWidth,
								required: true
							},
							{
								key: "valid_period",
								title: "有效期(月)",
								type: "number",
								width: colWidth - 60,
								required: true
							},
							{
								key: "auto_expire",
								title: "到期自动清零",
								type: "switch",
								width: colWidth - 80
							},
							{
								key: "min_unit",
								title: "最小调休单位",
								type: "select",
								width: colWidth - 60,
								required: true,
								data: [
									{ value: 1, label: "小时" },
									{ value: 2, label: "半天" },
									{ value: 3, label: "天" },
									{ value: 4, label: "分钟" },
								]
							},
							{
								key: "max_accumulate_minutes",
								title: "最大累积(分钟)",
								type: "number",
								width: colWidth - 60,
								tips: "0表示无上限，例如480分钟=8小时"
							},
							{
								key: "overtime_to_comp_ratio",
								title: "加班转调休系数",
								type: "number",
								width: colWidth - 60,
								tips: "如1.5倍：加班1小时得1.5小时调休",
								required: true
							},
							{
								key: "same_month_only",
								title: "仅限当月调休",
								type: "switch",
								width: colWidth - 80
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
							rule_name: [{ required: true, message: "规则名称不能为空", trigger: "blur" }],
							valid_period: [{ required: true, message: "有效期不能为空", trigger: "blur" }],
							min_unit: [{ required: true, message: "最小单位不能为空", trigger: "change" }],
							overtime_to_comp_ratio: [{ required: true, message: "转换系数不能为空", trigger: "blur" }]
						},
						formType: "",
						title: "",
						show: false
					}
				}
			};
		},
		onLoad() {
			originalForms = { form1: vk.pubfn.copyObject(this.form1) };
		},
		methods: {
			search() { this.$refs.table1.search(); },
			refresh() { this.$refs.table1.refresh(); },
			resetForm() { vk.pubfn.resetForm(originalForms, this); },
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/attendance/sys/comprule/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加调休规则';
				this.form1.props.show = true;
			},
			updateBtn({ item }) {
				this.form1.props.action = 'admin/hrm/attendance/sys/comprule/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑调休规则';
				this.form1.props.show = true;
				this.form1.data = { ...item };
			},
			deleteBtn({ item, deleteFn }) {
				deleteFn({
					action: "admin/hrm/attendance/sys/comprule/delete",
					data: { _id: item._id }
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body { padding: 20rpx; }
	.btn-group { margin: 20rpx 0; }
</style>