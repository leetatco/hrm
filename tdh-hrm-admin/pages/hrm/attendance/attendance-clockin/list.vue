<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
			<template v-slot:clockintime>
				<vk-data-input-date-time v-model="queryForm1.formData.clockintime"
					type="daterange"></vk-data-input-date-time>
			</template>
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="primary" size="small" icon="el-icon-download"
					v-if="$hasRole('admin') || $hasPermission('clockin-record-export')"
					@click="exportExcel">导出全部</el-button>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('clockin-record-add')" @click="addBtn">添加打卡记录</el-button>
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
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="140px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
		</vk-data-dialog>
	</view>
</template>

<script>
	let vk = uni.vk;
	let originalForms = {}; // 表单初始化数据	
	const colWidth = 200;
	export default {
		data() {
			return {
				table1: {
					action: "admin/hrm/clockin/sys/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('clockin-record-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('clockin-record-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('clockin-record-delete')
						}
					],
					columns: [{
							key: "employee_id",
							title: "员工工号",
							type: "text",
							width: colWidth - 100,
							fixed: true
						},
						{
							key: "employee_name",
							title: "员工姓名",
							type: "text",
							width: colWidth - 100,
							formatter: (val, row) => row.employeeInfo ? row.employeeInfo.employee_name : ''
						},
						{
							key: "clockintime",
							title: "打卡时间",
							type: "date",
							width: colWidth,
							sortable: true,
							valueFormat: "yyyy-MM-dd hh:mm:ss",
							dateType: "datetime"
						},
						{
							key: "type",
							title: "打卡类型",
							type: "tag",
							width: colWidth - 60,
							data: [{
									value: "公司卡",
									label: "公司卡",
									tagType: "success"
								},
								{
									value: "出差卡",
									label: "出差卡",
									tagType: "warning"
								}
							]
						},
						{
							key: "wifis.address",
							title: "打卡地点",
							type: "text",
							width: colWidth
						},
						{
							key: "img",
							title: "考勤图片",
							type: "image",
							width: colWidth - 60
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
							type: "date",
							width: colWidth,
							show: ["detail"],
							valueFormat: "yyyy-MM-dd hh:mm:ss",
							dateType: "datetime"
						},
						{
							key: "users.nickname",
							title: "操作人",
							type: "text",
							width: colWidth,
							show: ["detail"]
						}
					]
				},
				queryForm1: {
					formData: {},
					columns: [{
							key: "employee_id",
							title: "员工",
							type: "table-select",
							placeholder: "请选择员工",
							width: colWidth + 40,
							action: "admin/hrm/employees/sys/getList",
							multiple: false,
							columns: [{
									key: "employee_id",
									title: "员工工号",
									type: "text",
									idKey: true
								},
								{
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									nameKey: true
								},
							],
							queryColumns: [{
									key: "employee_id",
									title: "员工工号",
									type: "text",
									width: 150,
									mode: "%%"
								},
								{
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									width: 150,
									mode: "%%"
								},
							],
							mode: "="
						},
						{
							key: "type",
							title: "打卡类型",
							type: "select",
							width: colWidth - 60,
							data: [{
									value: "公司卡",
									label: "公司卡"
								},
								{
									value: "出差卡",
									label: "出差卡"
								}
							],
							mode: "="
						},
						{
							key: "clockintime",
							title: "打卡时间",
							type: "datetimerange",
							width: colWidth + 120,
							mode: "[]"
						}
					]
				},
				form1: {
					data: {
						employee_id: '',
						clockintime: '', // 字符串格式: "2022-10-18 11:00:00"
						type: '',
						wifis: {
							address: ''
						},
						img: '',
						remark: ''
					},
					props: {
						action: "",
						columns: [{
								key: "employee_id",
								title: "员工",
								type: "table-select",
								placeholder: "请选择员工",
								width: colWidth + 40,
								action: "admin/hrm/employees/sys/getList",
								multiple: false,
								columns: [{
										key: "employee_id",
										title: "员工工号",
										type: "text",
										idKey: true
									},
									{
										key: "employee_name",
										title: "员工姓名",
										type: "text",
										nameKey: true
									},
								],
								queryColumns: [{
										key: "employee_id",
										title: "员工工号",
										type: "text",
										width: 150,
										mode: "%%"
									},
									{
										key: "employee_name",
										title: "员工姓名",
										type: "text",
										width: 150,
										mode: "%%"
									},
								]
							},
							{
								key: "clockintime",
								title: "打卡时间",
								type: "date",
								width: colWidth,
								required: true,
								valueFormat: "yyyy-MM-dd HH:mm:ss",
								dateType: "datetime",
								placeholder: "请选择打卡时间"
							},
							{
								key: "type",
								title: "打卡类型",
								type: "select",
								width: colWidth - 60,
								required: true,
								data: [{
										value: "公司卡",
										label: "公司卡"
									},
									{
										value: "出差卡",
										label: "出差卡"
									}
								]
							},
							{
								key: "bssid",
								title: "打卡地点",
								type: "remote-select",
								placeholder: "请输入打卡地点",
								width: colWidth,
								action: "admin/hrm/clockin/sys/setting/getList",
								props: {
									list: "rows",
									value: "bssid",
									label: "address"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "img",
								title: "考勤图片",
								type: "image",
								width: colWidth,
								limit: 1,
								placeholder: "请上传考勤图片"
							},
							{
								key: "remark",
								title: "备注",
								type: "textarea",
								width: colWidth,
								rows: 8,
								placeholder: "请输入备注"
							}
						],
						rules: {
							employee_id: [{
								required: true,
								message: "员工工号不能为空",
								trigger: "blur"
							}],
							employee_name: [{
								required: true,
								message: "员工姓名不能为空",
								trigger: "blur"
							}],
							clockintime: [{
								required: true,
								message: "打卡时间不能为空",
								trigger: "change"
							}],
							type: [{
								required: true,
								message: "打卡类型不能为空",
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
			// 添加
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/clockin/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加打卡记录';
				this.form1.props.show = true;
			},
			// 编辑
			updateBtn({
				item
			}) {
				// 确保日期字段是字符串格式
				const formData = {
					...item
				};
				if (formData.clockintime && typeof formData.clockintime !== 'string') {
					// 如果是时间戳，转换为字符串格式
					const date = new Date(formData.clockintime);
					formData.clockintime = this.formatDate(date);
				}
				this.form1.props.action = 'admin/hrm/clockin/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑打卡记录';
				this.form1.props.show = true;
				this.form1.data = formData;
			},
			// 删除
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/clockin/sys/delete",
					data: {
						_id: item._id
					}
				});
			},
			// 导出
			exportExcel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '打卡明细',
					title: "正在导出数据...",
					columns: this.table1.columns.filter(c => c.key !== '_id' && c.type !== 'image'),
					pageIndex: 1,
					pageSize: -1
				});
			},
			// 格式化日期工具方法
			formatDate(date) {
				if (!date) return '';
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				const seconds = String(date.getSeconds()).padStart(2, '0');
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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