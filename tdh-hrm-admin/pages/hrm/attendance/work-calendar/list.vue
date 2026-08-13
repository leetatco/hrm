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
					v-if="$hasRole('admin') || $hasPermission('attendance-calendar-add')" @click="addBtn">添加</el-button>
				<el-button type="primary" size="small" icon="el-icon-refresh"
					v-if="$hasRole('admin') || $hasPermission('attendance-calendar-batch')"
					@click="batchGenerate">批量生成年份</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="600px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="120px"
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
					action: "admin/hrm/attendance/sys/calendar/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => this.$hasRole('admin') || this.$hasPermission('attendance-calendar-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => this.$hasRole('admin') || this.$hasPermission('attendance-calendar-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => this.$hasRole('admin') || this.$hasPermission('attendance-calendar-delete')
						}
					],
					columns: [{
							key: "calendar_date",
							title: "日期",
							type: "date",
							dateType: "date",
							valueFormat: "yyyy-MM-dd",
							width: colWidth - 100,
							fixed: true
						},
						{
							key: "date_type",
							title: "日期类型",
							type: "tag",
							width: colWidth - 100,
							data: [{
									value: 1,
									label: "工作",
									tagType: ""
								},
								{
									value: 2,
									label: "周末",
									tagType: "success"
								},
								{
									value: 3,
									label: "法定",
									tagType: "danger"
								},
								{
									value: 4,
									label: "调休",
									tagType: "warning"
								}
							]
						},
						{
							key: "year",
							title: "年份",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "name",
							title: "节日/调休说明",
							type: "text",
							width: colWidth
						},
						{
							key: "is_default",
							title: "是否默认",
							type: "switch",
							width: colWidth - 100,
							formatter: (val) => val == 1 ? '是' : '否'
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
					formData: {
						year: new Date().getFullYear()
					},
					columns: [{
							key: "year",
							title: "年份",
							type: "number",
							width: colWidth-100,
							mode: "="
						},
						{
							key: "date_type",
							title: "日期类型",
							type: "select",
							width: colWidth-100,
							data: [{
									value: 1,
									label: "工作日"
								},
								{
									value: 2,
									label: "周末"
								},
								{
									value: 3,
									label: "法定节假日"
								},
								{
									value: 4,
									label: "调休工作日"
								}
							],
							mode: "="
						},
						{
							key: "name",
							title: "节日说明",
							type: "text",
							width: colWidth-20,
							mode: "%%"
						}
					]
				},
				form1: {
					data: {
						date_type: 1,
						is_default: false
					},
					props: {
						action: "",
						columns: [{
								key: "calendar_date",
								title: "日期",
								type: "date",
								dateType: "date",
								width: colWidth,
								valueFormat: "yyyy-MM-dd",
								required: true
							},
							{
								key: "date_type",
								title: "日期类型",
								type: "select",								
								required: true,
								width: colWidth,
								data: [{
										value: 1,
										label: "工作日"
									},
									{
										value: 2,
										label: "周末"
									},
									{
										value: 3,
										label: "法定节假日"
									},
									{
										value: 4,
										label: "调休工作日"
									}
								]
							},
							{
								key: "year",
								title: "年份",
								type: "number",	
								width: colWidth,							
								disabled: true // 由日期自动计算，禁止手动修改
							},
							{
								key: "name",
								title: "节日/调休说明",
								type: "text",		
								width: colWidth+100,						
								placeholder: "如：国庆节、春节调休上班日"
							},
							{
								key: "is_default",
								title: "是否默认",
								type: "switch",		
								width: colWidth,						
								defaultValue: false
							},
							{
								key: "remark",
								title: "备注",
								type: "textarea",								
								maxlength: 500
							}
						],
						rules: {
							calendar_date: [{
								required: true,
								message: "日期不能为空",
								trigger: "blur"
							}],
							date_type: [{
								required: true,
								message: "日期类型不能为空",
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
			// 搜索
			search() {
				this.$refs.table1.search();
			},
			// 刷新
			refresh() {
				this.$refs.table1.refresh();
			},
			// 重置表单
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},
			// 添加
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/attendance/sys/calendar/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加日历';
				this.form1.props.show = true;
				// 设置年份自动计算
				this.$watch('form1.data.calendar_date', (newVal) => {
					if (newVal) {
						this.$set(this.form1.data, 'year', new Date(newVal).getFullYear());
					}
				}, {
					immediate: true
				});
			},
			// 编辑
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/attendance/sys/calendar/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑日历';
				this.form1.props.show = true;
				this.form1.data = {
					...item
				};
			},
			// 删除
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/attendance/sys/calendar/delete",
					data: {
						_id: item._id
					}
				});
			},
			// 批量生成年份			
			batchGenerate() {
				vk.prompt('请输入要生成的年份,如2026', async (res) => {
					if (res.confirm) {
						const year = parseInt(res.content);
						if (!year || year < 2000 || year > 2100) {
							vk.toast('请输入有效的年份');
							return;
						}
						try {
							const result = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/calendar/batchGenerate',
								data: {
									year
								}
							});
							if (result.code === 0) {
								vk.alert(`成功生成${year}年日历`, '提示', () => {
									this.refresh();
								});
							} else {
								vk.toast(result.msg || '生成失败');
							}
						} catch (e) {
							vk.toast('请求异常');
						}
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