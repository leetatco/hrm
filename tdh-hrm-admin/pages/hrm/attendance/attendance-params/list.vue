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
					v-if="$hasRole('admin') || $hasPermission('attendance-params-add')" @click="addBtn">添加</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="700px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="140px"
				@success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
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
					action: "admin/hrm/attendance/sys/params/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => this.$hasRole('admin') || this.$hasPermission('attendance-params-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-params-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-params-delete')
						}
					],
					columns: [{
							key: "late_threshold_minutes",
							title: "迟到阈值(分钟)",
							type: "number",
							width: colWidth
						},
						{
							key: "early_threshold_minutes",
							title: "早退阈值(分钟)",
							type: "number",
							width: colWidth
						},
						{
							key: "absent_threshold_minutes",
							title: "旷工阈值(分钟)",
							type: "number",
							width: colWidth
						},
						{
							key: "monthly_period_type",
							title: "统计周期",
							type: "select",
							width: colWidth - 40,
							data: [{
									value: 1,
									label: "自然月"
								},
								{
									value: 2,
									label: "固定日期段"
								}
							],
							formatter: (val) => val == 1 ? '自然月' : '固定日期段'
						},
						{
							key: "period_start_day",
							title: "周期起始日",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "remedy_limit_per_month",
							title: "月补卡次数",
							type: "number",
							width: colWidth - 60
						},
						{
							key: "overtime_min_unit",
							title: "加班最小单位(分)",
							type: "number",
							width: colWidth
						},
						{
							key: "allow_overtime_application",
							title: "允许加班申请",
							type: "switch",
							width: colWidth - 40,
							formatter: (val) => val ? '是' : '否'
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
							"key": "late_threshold_minutes",
							"title": "迟到阈值(分钟)",
							"type": "number",
							"width": 200,
							"min": 0,
							"mode": "="
						},
						{
							"key": "early_threshold_minutes",
							"title": "早退阈值(分钟)",
							"type": "number",
							"width": 200,
							"min": 0,
							"mode": "="
						},
						//{"key":"absent_threshold_minutes","title":"旷工阈值(分钟)","type":"text","width":200,"min":0,"mode":"="},
						//{"key":"monthly_period_type","title":"月统计周期","type":"text","width":200,"data":[{},{}],"mode":"="},
						//{"key":"period_start_day","title":"周期起始日","type":"text","width":200,"min":1,"max":31,"mode":"="},
						//{"key":"remedy_limit_per_month","title":"每月补卡次数","type":"text","width":200,"min":0,"mode":"="},
						//{"key":"overtime_min_unit","title":"加班最小计算单位(分钟)","type":"text","width":200,"min":0,"mode":"="},
						//{"key":"allow_overtime_application","title":"是否允许申请加班","type":"text","width":200,"mode":"="},
						//{"key":"remark","title":"备注","type":"text","width":200,"mode":"="},
						//{"key":"update_date","title":"更新时间","type":"text","width":200,"mode":"="},
						//{"key":"updat_id","title":"更新人","type":"text","width":200,"mode":"="}
					],
				},
				form1: {
					data: {
						late_threshold_minutes: 1,
						early_threshold_minutes: 1,
						absent_threshold_minutes: 30,
						monthly_period_type: 1,
						period_start_day: 1,
						remedy_limit_per_month: 3,
						overtime_min_unit: 30,
						allow_overtime_application: true
					},
					props: {
						action: "",
						columns: [{
								key: "late_threshold_minutes",
								title: "迟到阈值(分钟)",
								type: "number",
								width: colWidth,
								required: true
							},
							{
								key: "early_threshold_minutes",
								title: "早退阈值(分钟)",
								type: "number",
								width: colWidth,
								required: true
							},
							{
								key: "absent_threshold_minutes",
								title: "旷工阈值(分钟)",
								type: "number",
								width: colWidth,
								required: true
							},
							{
								key: "monthly_period_type",
								title: "月统计周期",
								type: "radio",
								width: colWidth,
								required: true,
								data: [{
										value: 1,
										label: "自然月(1-31)"
									},
									{
										value: 2,
										label: "固定日期段"
									}
								]
							},
							{
								key: "period_start_day",
								title: "周期起始日",
								type: "number",
								width: colWidth,
								hidden: false,
								required: true,
								description: "当统计周期为固定日期段时生效，如26表示上月26-本月25"
							},
							{
								key: "remedy_limit_per_month",
								title: "每月补卡次数",
								type: "number",
								width: colWidth,
								required: true
							},
							{
								key: "overtime_min_unit",
								title: "加班最小单位(分)",
								type: "number",
								width: colWidth,
								required: true
							},
							{
								key: "allow_overtime_application",
								title: "允许加班申请",
								type: "switch",
								width: colWidth
							},
							{
								key: "remark",
								title: "备注",
								type: "textarea",
								maxlength: 500,
								width: colWidth * 2 + 20
							}
						],
						rules: {
							late_threshold_minutes: [{
								required: true,
								message: "迟到阈值不能为空",
								trigger: "blur"
							}],
							early_threshold_minutes: [{
								required: true,
								message: "早退阈值不能为空",
								trigger: "blur"
							}],
							absent_threshold_minutes: [{
								required: true,
								message: "旷工阈值不能为空",
								trigger: "blur"
							}],
							monthly_period_type: [{
								required: true,
								message: "统计周期不能为空",
								trigger: "change"
							}],
							period_start_day: [{
								required: true,
								message: "周期起始日不能为空",
								trigger: "blur"
							}],
							remedy_limit_per_month: [{
								required: true,
								message: "补卡次数不能为空",
								trigger: "blur"
							}],
							overtime_min_unit: [{
								required: true,
								message: "加班最小单位不能为空",
								trigger: "blur"
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
				this.form1.props.action = 'admin/hrm/attendance/sys/params/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加考勤参数';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/attendance/sys/params/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑考勤参数';
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
					action: "admin/hrm/attendance/sys/params/delete",
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