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
					v-if="$hasRole('admin') || $hasPermission('attendance-shift-add')" @click="addBtn">添加</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="750px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="90px" :inline="true"
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
					action: "admin/hrm/attendance/sys/shift/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => this.$hasRole('admin') || this.$hasPermission('attendance-shift-view')
						}, {
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-shift-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('attendance-shift-delete')
						}
					],
					columns: [{
							key: "shift_name",
							title: "班次名称",
							type: "text",
							width: colWidth - 40,
							fixed: true
						},
						{
							key: "shift_type",
							title: "班次类型",
							type: "select",
							width: colWidth - 40,
							data: [{
									value: 1,
									label: "固定班次"
								},
								{
									value: 2,
									label: "弹性班次"
								}
							],
							formatter: (val) => val == 1 ? '固定班次' : '弹性班次'
						},
						{
							key: "segments",
							title: "班次时段",
							type: "text",
							width: colWidth * 2,
							formatter: (val) => {
								if (!val || !Array.isArray(val) || val.length === 0) return '-';
								return val.map(seg => `${seg.name} ${seg.start_time}~${seg.end_time}`).join('，');
							}
						},
						{
							key: "status",
							title: "启用",
							type: "switch",
							width: colWidth - 80,
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
							key: "shift_name",
							title: "班次名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "shift_type",
							title: "班次类型",
							type: "select",
							width: colWidth - 40,
							data: [{
									value: 1,
									label: "固定班次"
								},
								{
									value: 2,
									label: "弹性班次"
								}
							],
							mode: "="
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
						shift_name: '',
						shift_type: 1,
						segments: [{
								name: '上午',
								start_time: '08:30',
								end_time: '12:00'
							},
							{
								name: '下午',
								start_time: '13:30',
								end_time: '18:00'
							}
						],
						status: true,
						remark: ''
					},
					props: {
						action: "",
						columns: [{
								key: "shift_name",
								title: "班次名称",
								type: "text",
								width: colWidth,
								required: true
							},
							{
								key: "shift_type",
								title: "班次类型",
								type: "radio",
								width: colWidth,
								required: true,
								data: [{
										value: 1,
										label: "固定班次"
									},
									{
										value: 2,
										label: "弹性班次"
									}
								]
							},
							{
								key: "status",
								title: "启用状态",
								type: "switch",
								width: colWidth - 80,
								defaultValue: true
							},
							{
								key: "remark",
								title: "备注",
								type: "text",
								width: colWidth
							},
							{
								key: "segments",
								title: "班次时段",
								type: "array<object>",
								itemWidth: 300,
								showAdd: true,
								showClear: true,
								columnIndexWidth: 50,
								// 新增一行时的默认值
								defaultValue: {
									name: "",
									start_time: "",
									end_time: ""
								},
								rightBtns: ['copy', 'delete'],
								// 子字段编辑规则
								columns: [{
										key: "name",
										title: "时段名称",
										type: "text",
										width: 150,
										isUnique: true,
										rules: [{
											required: true,
											message: "名称不能为空",
											trigger: ["change", "blur"]
										}]
									},
									{
										key: "start_time",
										title: "上班时间",
										type: "time",
										width: 180,
										valueFormat: "HH:mm",
										pickerOptions: {
											format: "HH:mm"
										},
										rules: [{
											required: true,
											message: "上班时间不能为空",
											trigger: ["change", "blur"]
										}]
									},
									{
										key: "end_time",
										title: "下班时间",
										type: "time",
										width: 180,
										valueFormat: "HH:mm",
										pickerOptions: {
											format: "HH:mm"
										},
										rules: [{
											required: true,
											message: "下班时间不能为空",
											trigger: ["change", "blur"]
										}]
									}
								]
							}
						],
						rules: {
							shift_name: [{
								required: true,
								message: "班次名称不能为空",
								trigger: "blur"
							}],
							shift_type: [{
								required: true,
								message: "班次类型不能为空",
								trigger: "change"
							}],
							segments: [{
								validator: (rule, value, callback) => {
									if (!value || value.length === 0) {
										callback(new Error('至少需要一个时段'));
									} else if (value.some(seg => !seg.name || !seg.start_time || !seg
											.end_time)) {
										callback(new Error('时段信息不完整'));
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
			'form1.data.shift_type'(newVal) {
				// 弹性班次逻辑后续扩展
			}
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
				this.form1.props.action = 'admin/hrm/attendance/sys/shift/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加班次';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/attendance/sys/shift/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑班次';
				this.form1.props.show = true;
				this.form1.data = {
					...item,
					segments: item.segments || []
				};
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/attendance/sys/shift/delete",
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