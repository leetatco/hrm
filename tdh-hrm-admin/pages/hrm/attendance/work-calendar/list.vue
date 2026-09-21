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

		<!-- 表格区域：三级树形结构 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="false"
			:tree-props="table1.treeProps" row-key="_id" default-expand-all @update="updateBtn" @delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="600px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="120px"
				@success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
		</vk-data-dialog>

		<!-- 批量生成弹窗 -->
		<vk-data-dialog v-model="batchForm.props.show" :title="batchForm.props.title" width="500px" mode="form"
			:close-on-click-modal="false">
			<el-form ref="batchForm" :model="batchForm.data" :rules="batchForm.props.rules" label-width="120px"
				style="padding: 10px 20px;">
				<el-form-item label="年份" prop="year">
					<el-input-number v-model="batchForm.data.year" :min="2000" :max="2100" :controls="false"
						placeholder="请输入年份，如 2026" style="width: 100%;"></el-input-number>
				</el-form-item>
				<el-form-item label="工作日历名称" prop="calendar_name">
					<el-input v-model="batchForm.data.calendar_name" placeholder="如：研发部工作日历"
						maxlength="50"></el-input>
				</el-form-item>
				<el-form-item label="周六是否上班" prop="saturday_work">
					<el-radio-group v-model="batchForm.data.saturday_work">
						<el-radio :label="true">是</el-radio>
						<el-radio :label="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :loading="batchForm.props.loading"
						@click="batchGenerateSubmit">确定生成</el-button>
					<el-button @click="batchForm.props.show = false">取消</el-button>
				</el-form-item>
			</el-form>
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
					// 树形表格配置
					treeProps: {
						children: 'children',
						hasChildren: 'hasChildren'
					},
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							// 只有日期（叶子节点）显示按钮
							show: (row) => row.type === "date" &&
								(this.$hasRole('admin') || this.$hasPermission('attendance-calendar-view'))
						},
						{
							mode: 'update',
							title: '编辑',
							show: (row) => row.type === "date" &&
								(this.$hasRole('admin') || this.$hasPermission('attendance-calendar-edit'))
						},
						{
							mode: 'delete',
							title: '删除',
							show: (row) => row.type === "date" &&
								(this.$hasRole('admin') || this.$hasPermission('attendance-calendar-delete'))
						}
					],
					columns: [{
							key: "title", // 兜底字段，实际显示走 formatter
							title: "工作日历",
							type: "text",
							fixed: true,
							width: colWidth,
							formatter: (val, row) => {
								// 年份行
								if (row.type === "year") {
									return `${row.year}年`;
								}
								// 日历行
								if (row.type === "calendar") {
									return row.calendar_name || "";
								}
								// 日期行
								if (row.type === "date") {
									return row.calendar_date || "";
								}
								return val || "";
							}
						},
						{
							key: "date_type",
							title: "日期类型",
							type: "tag",
							width: colWidth - 100,
							formatter: (val, row) => {
								// 只有日期行显示
								return row.type === "date" ? val : "";
							},
							data: [{
									value: 1,
									label: "工作",
									tagType: ""
								},
								{
									value: 2,
									label: "休息",
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
							key: "name",
							title: "节日/调休说明",
							type: "text",
							width: colWidth - 50,
							formatter: (val, row) => row.type === "date" ? val : ""
						},
						{
							key: "is_default",
							title: "是否默认",
							type: "text",
							width: colWidth - 100,
							formatter: (val, row) => {
								if (row.type !== "date") return "";
								return val ? '是' : '否';
							}
						},
						{
							key: "remark",
							title: "备注",
							type: "text",
							width: colWidth,
							formatter: (val, row) => row.type === "date" ? val : ""
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
							width: colWidth - 100,
							mode: "="
						},
						{
							key: "calendar_name",
							title: "工作日历名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "date_type",
							title: "日期类型",
							type: "select",
							width: colWidth - 100,
							data: [{
									value: 1,
									label: "工作日"
								},
								{
									value: 2,
									label: "休息"
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
							width: colWidth - 20,
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
								key: "calendar_name",
								title: "工作日历名称",
								type: "text",
								width: colWidth,
								required: true,
								placeholder: "如：研发部工作日历",
								tips: "同一日历名称 + 年份代表一个独立的工作日历"
							}, {
								key: "year",
								title: "年份",
								type: "number",
								width: colWidth,
								disabled: true // 由日期自动计算，禁止手动修改
							}, {
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
										label: "休息"
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
								key: "name",
								title: "节日/调休说明",
								type: "text",
								width: colWidth + 100,
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
							calendar_name: [{
								required: true,
								message: "工作日历名称不能为空",
								trigger: "blur"
							}],
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
				},
				// 批量生成表单
				batchForm: {
					data: {
						year: new Date().getFullYear(),
						calendar_name: '',
						saturday_work: false
					},
					props: {
						title: "批量生成工作日历",
						show: false,
						loading: false,
						rules: {
							year: [{
								required: true,
								message: "年份不能为空",
								trigger: "blur"
							}],
							calendar_name: [{
								required: true,
								message: "工作日历名称不能为空",
								trigger: "blur"
							}]
						}
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
				// 只有日期（叶子节点）允许编辑
				if (item.type !== "date") return;
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
				// 只有日期（叶子节点）允许删除
				if (item.type !== "date") return;
				deleteFn({
					action: "admin/hrm/attendance/sys/calendar/delete",
					data: {
						_id: item._id
					}
				});
			},
			// 打开批量生成弹窗
			batchGenerate() {
				this.batchForm.data = {
					year: new Date().getFullYear(),
					calendar_name: '',
					saturday_work: false
				};
				this.batchForm.props.show = true;
				this.$nextTick(() => {
					if (this.$refs.batchForm) {
						this.$refs.batchForm.clearValidate();
					}
				});
			},
			// 提交批量生成
			batchGenerateSubmit() {
				this.$refs.batchForm.validate(async (valid) => {
					if (!valid) return;
					const {
						year,
						calendar_name,
						saturday_work
					} = this.batchForm.data;
					this.batchForm.props.loading = true;
					try {
						const result = await vk.callFunction({
							url: 'admin/hrm/attendance/sys/calendar/batchGenerate',
							title: '请求中...',
							data: {
								year,
								calendar_name,
								saturday_work
							}
						});
						if (result.code === 0) {
							this.batchForm.props.show = false;
							const satTip = saturday_work ? '（周六上班）' : '（周六休息）';
							vk.alert(`成功生成【${calendar_name}（${year}）】工作日历${satTip}`, '提示', () => {
								this.refresh();
							});
						} else {
							vk.toast(result.msg || '生成失败');
						}
					} catch (e) {
						vk.toast('请求异常');
					} finally {
						this.batchForm.props.loading = false;
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