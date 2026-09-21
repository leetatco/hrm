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
					v-if="$hasRole('admin') || $hasPermission('attendance-seniority-add')" @click="addBtn">添加</el-button>
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
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="160px" :inline="true"
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
					action: "admin/hrm/attendance/sys/seniority/getList",
					rightBtns: [
						{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-seniority-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-seniority-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-seniority-delete')
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
							key: "seniority_type",
							title: "工龄类型",
							type: "select",
							width: colWidth - 40,
							data: [
								{ value: 1, label: "社会工龄" },
								{ value: 2, label: "司龄" }
							],
							formatter: (val) => val == 1 ? '社会工龄' : '司龄'
						},
						{
							key: "rule_details",
							title: "分段规则",
							type: "text",
							width: colWidth * 2,
							formatter: (val) => {
								if (!val || !Array.isArray(val)) return '';
								return val.map(r => `${r.year_min}-${r.year_max}年:${r.annual_days}天`).join('，');
							}
						},
						{
							key: "first_year_prorate",
							title: "入职折算",
							type: "switch",
							width: colWidth - 80,
							formatter: (val) => val ? '是' : '否'
						},
						{
							key: "carry_forward",
							title: "允许顺延",
							type: "switch",
							width: colWidth - 80,
							formatter: (val) => val ? '是' : '否'
						},
						{
							key: "carry_forward_months",
							title: "顺延有效月数",
							type: "text",
							width: colWidth - 80
						},						
						{
							key: "status",
							title: "启用",
							type: "switch",
							width: colWidth - 100,
							formatter: (val) => val? '启用' : '停用'
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
						seniority_type: 1,
						rule_details: [
							{ year_min: 1, year_max: 9, annual_days: 5 },
							{ year_min: 10, year_max: 19, annual_days: 10 },
							{ year_min: 20, year_max: null, annual_days: 15 }
						],
						probational_provide: false,
						first_year_prorate: true,
						prorate_method: 1,
						carry_forward: false,
						carry_forward_months: 3,
						max_accumulate_days: 0,
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
								key: "seniority_type",
								title: "工龄类型",
								type: "select",
								width: colWidth - 80,
								required: true,
								data: [
									{ value: 1, label: "社会工龄" },
									{ value: 2, label: "司龄" }
								]
							},
							{
								key: "rule_details",
								title: "分段规则",
								type: "array<object>",
								width: 630,
								oneLine: true,
								required: true,
								showAdd: true,
								showClear: true,
								showSort: true,
								itemWidth: 600,
								columnIndexWidth: 50,
								defaultValue: {
									year_min: 0,
									year_max: null,
									annual_days: 0
								},
								rightBtns: ['copy', 'delete'],
								columns: [
									{
										key: "year_min",
										title: "最小工龄(年)",
										type: "number",
										width: 160,
										required: true,
										rules: [
											{ required: true, message: "不能为空", trigger: ["change", "blur"] }
										]
									},
									{
										key: "year_max",
										title: "最大工龄(年)",
										type: "number",
										width: 160,
										tips: "留空表示无上限"
									},
									{
										key: "annual_days",
										title: "年假天数",
										type: "number",
										width: 140,
										required: true,
										rules: [
											{ required: true, message: "不能为空", trigger: ["change", "blur"] }
										]
									}
								]
							},
							{
								key: "probational_provide",
								title: "试用期享有年假",
								type: "switch",
								width: colWidth - 80
							},
							{
								key: "first_year_prorate",
								title: "入职当年折算",
								type: "switch",
								width: colWidth - 80
							},
							{
								key: "prorate_method",
								title: "折算方式",
								type: "select",
								width: colWidth - 80,
								data: [
									{ value: 1, label: "按月份折算" },
									{ value: 2, label: "按剩余天数折算" }
								],
								hidden: false
							},
							{
								key: "carry_forward",
								title: "允许顺延",
								type: "switch",
								width: colWidth - 80
							},
							{
								key: "carry_forward_months",
								title: "顺延有效月数",
								type: "number",
								width: colWidth - 80,
								hidden: false
							},
							{
								key: "max_accumulate_days",
								title: "累积上限(天)",
								type: "number",
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
								maxlength: 500								
							}
						],
						rules: {
							rule_name: [{ required: true, message: "规则名称不能为空", trigger: "blur" }],
							seniority_type: [{ required: true, message: "工龄类型不能为空", trigger: "change" }],
							rule_details: [{
								validator: (rule, value, callback) => {
									if (!value || value.length === 0) {
										callback(new Error('至少添加一条分段规则'));
									} else {
										callback();
									}
								},
								trigger: 'change'
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				}
			};
		},
		watch: {
			'form1.data.first_year_prorate'(val) {
				const prorateCol = this.form1.props.columns.find(c => c.key === 'prorate_method');
				if (prorateCol) prorateCol.hidden = !val;
			},
			'form1.data.carry_forward'(val) {
				const monthsCol = this.form1.props.columns.find(c => c.key === 'carry_forward_months');
				if (monthsCol) monthsCol.hidden = !val;
			}
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
				this.form1.props.action = 'admin/hrm/attendance/sys/seniority/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加年假规则';
				this.form1.props.show = true;
			},
			updateBtn({ item }) {
				this.form1.props.action = 'admin/hrm/attendance/sys/seniority/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑年假规则';
				this.form1.props.show = true;
				this.form1.data = { ...item };
			},
			deleteBtn({ item, deleteFn }) {
				deleteFn({
					action: "admin/hrm/attendance/sys/seniority/delete",
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