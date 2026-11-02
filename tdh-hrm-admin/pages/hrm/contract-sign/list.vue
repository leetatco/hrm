<template>
	<view class="page-body">
		<!-- 查询开始 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
			<!-- 身份证号码（table-select） -->
			<template v-slot:card="{ form }">
				<vk-data-input-table-select v-model="form.card" action="admin/hrm/employees/sys/getList" :columns="[
            { key:'card', title:'身份证号码', type:'text', idKey:true },
            { key:'employee_name', title:'姓名', type:'text', nameKey:true }
          ]" :query-columns="[
            { key:'card', title:'身份证号码', type:'text', mode:'%%' },
            { key:'employee_name', title:'姓名', type:'text', mode:'%%' }
          ]" placeholder="请选择员工" />
			</template>
		</vk-data-table-query>
		<!-- 查询结束 -->

		<!-- 按钮区 -->
		<view>
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-contract-sign-add')" @click="addBtn">添加</el-button>

				<el-button type="primary" size="small" icon="el-icon-tickets" @click="exportExcelAll">导出全部</el-button>
			</el-row>
		</view>

		<!-- 表格 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :pagination="true" @update="updateBtn" @delete="deleteBtn" />

		<!-- 表单弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="900px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns="form1.props.columns" label-width="130px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false; refresh();" :border="true" />
		</vk-data-dialog>

	</view>
</template>

<script>
	let vk = uni.vk;
	const colWidth = 200;

	export default {
		data() {
			return {
				table1: {
					action: "admin/hrm/contract-sign/sys/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-contract-sign-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-contract-sign-edit')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-contract-sign-delete')
							}
						}
					],
					columns: [{
							key: "employees.employee_id",
							title: "员工工号",
							type: "text",
							"fixed": true,
							width: colWidth - 100
						},{
							key: "employees.employee_name",
							title: "员工姓名",
							type: "text",
							"fixed": true,
							width: colWidth - 70
						},
						{
							key: "signature_url",
							title: "签名图片",
							type: "image",
							width: colWidth - 100,
							"fixed": true,
							show: ["detail", "row"]
						},
						{
							key: "card",
							title: "身份证号码",
							type: "text",
							"fixed": true,
							width: colWidth - 30
						},
						{
							key: "contractInfo.contract_sign_name",
							title: "合同类型",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "sign_date",
							title: "签订日期",
							type: "date",
							valueFormat: "yyyy-MM-dd",
							width: colWidth - 100
						},
						{
							key: "end_date",
							title: "到期日期",
							type: "date",
							valueFormat: "yyyy-MM-dd",
							width: colWidth - 100
						},
						{
							key: "status",
							title: "状态",
							type: "tag",
							width: colWidth - 100,
							data: [{
									value: 4,
									label: "待签署",
									tagType: "danger"
								}, {
									value: 1,
									label: "已签署",
									tagType: "success"
								},
								{
									value: 2,
									label: "已到期",
									tagType: "warning"
								},
								{
									value: 3,
									label: "已解除",
									tagType: "warning"
								}
							]
						},
						{
							key: "contract_sign_file",
							title: "合同文件",
							type: "file",
							width: colWidth - 100,
							show: ["detail", "row"]
						},
						{
							"key": "sign_time",
							"title": "签署时间",
							"type": "time",
							"width": colWidth
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"type": "time",
							"width": colWidth,
							"show": ["detail"]
						},
						{
							"key": "users.nickname",
							"title": "更新人",
							"type": "text",
							"width": colWidth,
							"show": ["detail"]
						}
					]
				},
				queryForm1: {
					formData: {},
					columns: [{
							key: "card",
							title: "员工姓名",
							type: "text",
							width: colWidth,
							mode: "="
						},
						{
							key: "contract_sign_id",
							title: "合同类型",
							type: "remote-select",
							width: colWidth,
							action: "admin/hrm/contract-sign/sys/setting/getList",
							props: {
								list: "rows",
								value: "contract_sign_id",
								label: "contract_sign_name"
							},
							showAll: true,
							actionData: {
								pageSize: 1000
							}
						},
						{
							key: "status",
							title: "状态",
							type: "select",
							width: colWidth,
							data: [{
									value: 4,
									label: "待签署"
								},
								{
									value: 1,
									label: "已签署"
								},
								{
									value: 2,
									label: "已到期"
								},
								{
									value: 3,
									label: "已解除"
								}
							],
							mode: "="
						},
						{
							key: "sign_date",
							title: "签订日期",
							type: "date",
							width: colWidth,
							mode: ">="
						}
					]
				},
				form1: {
					data: {
						status: 4
					},
					props: {
						action: "",
						formType: "",
						title: "",
						show: false,
						columns: [{
								key: "card",
								title: "员工姓名",
								type: "table-select",
								width: colWidth,
								action: "admin/hrm/employees/sys/getList",
								columns: [{
										key: "card",
										title: "身份证号码",
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
										key: "card",
										title: "身份证号码",
										type: "text",
										mode: "%%"
									},
									{
										key: "employee_name",
										title: "姓名",
										type: "text",
										mode: "%%"
									}
								]
							},
							{
								key: "contract_sign_id",
								title: "合同类型",
								type: "remote-select",
								width: colWidth,
								action: "admin/hrm/contract-sign/sys/setting/getList",
								props: {
									list: "rows",
									value: "contract_sign_id",
									label: "contract_sign_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "sign_date",
								title: "签订日期",
								type: "date",
								valueFormat: "yyyy-MM-dd",
								width: colWidth
							},
							{
								key: "end_date",
								title: "到期日期",
								type: "date",
								valueFormat: "yyyy-MM-dd",
								width: colWidth
							},
							{
								key: "status",
								title: "状态",
								type: "select",
								width: colWidth,
								data: [{
										value: 4,
										label: "待签署"
									},
									{
										value: 1,
										label: "已签署"
									},
									{
										value: 2,
										label: "已到期"
									},
									{
										value: 3,
										label: "已解除"
									}
								]
							},
							{
								key: "contract_sign_file",
								title: "合同文件",
								type: "file",
								accept: ".pdf",
								limit: 1,
								cloudDirectory: "contract/sign",
								width: colWidth,
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file)
								}
							},
							{
								key: "signature_url",
								title: "签名图片",
								type: "image",
								disabled: true,
								limit: 1,
								accept: ".png",
								cloudDirectory: "contract/signature",
								width: colWidth,
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file)
								}
							}
						],
						rules: {
							card: [{
								required: true,
								message: "请选择员工",
								trigger: "change"
							}],
							contract_sign_id: [{
								required: true,
								message: "请选择合同类型",
								trigger: "change"
							}],
							sign_date: [{
								required: true,
								message: "请选择签订日期",
								trigger: "change"
							}],
							status: [{
								required: true,
								message: "请选择状态",
								trigger: "change"
							}],
							contract_sign_file: [{
								required: true,
								message: "请上传合同",
								trigger: "change"
							}]
						}
					}
				}
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
				this.queryForm1.formData = {};
				this.search();
			},
			addBtn() {
				this.form1.data = {
					status: 4
				};
				this.form1.props.action = "admin/hrm/contract-sign/sys/add";
				this.form1.props.formType = "add";
				this.form1.props.title = "新增合同签署";
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.data = item;
				this.form1.props.action = "admin/hrm/contract-sign/sys/update";
				this.form1.props.formType = "update";
				this.form1.props.title = "编辑合同签署";
				this.form1.props.show = true;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/contract-sign/sys/delete",
					data: {
						_id: item._id
					}
				});
				//删除附件						
				vk.myfn.deleteFiles([item.contract_sign_file, item.signature_url]);
			},
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: "合同签署列表",
					title: "正在导出...",
					columns: this.table1.columns.filter(
						(c) => !["contract_sign_file", "signature_url", "update_date", "users.nickname"].includes(c.key)
					),
					pageIndex: 1,
					pageSize: -1
				});
			}
		}
	};
</script>
<style lang="scss" scoped>
	.page-body {}
</style>