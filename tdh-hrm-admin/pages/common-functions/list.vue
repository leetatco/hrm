<template>
	<view class="page-body">
		<!-- 表格搜索组件开始 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search"></vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view>
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					@click="addBtn">添加功能</el-button>
				<!-- 批量操作 -->
				<el-dropdown v-if="table1.multipleSelection" :split-button="false" trigger="click" @command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0">
						批量操作<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">批量启用</el-dropdown-item>
						<el-dropdown-item :command="2">批量停用</el-dropdown-item>
						<el-dropdown-item :command="3">批量删除</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<div style="overflow-x: auto;">
			<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
				:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @update="updateBtn"
				@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
		</div>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="800px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="120px"
				@success="form1.props.show = false;refresh();" :inline="false" :columnsNumber="1"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 150;
	export default {
		data() {
			return {
				loading: false,
				data: {},
				table1: {
					// 数据请求地址（需后端实现对应的云函数）
					action: "admin/common-functions/sys/getList",
					// 按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin')
							}
						}
					],
					columns: [{
							"key": "name",
							"title": "功能名称",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "imgUrl",
							"title": "图标",
							"type": "image",
							"width": colWidth
						},
						{
							"key": "route",
							"title": "路由路径",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "sort",
							"title": "排序",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "status",
							"title": "状态",
							"type": "text",
							"width": colWidth,
							formatter: (value, row, column, index) => {
								const map = {
									enabled: '启用',
									disabled: '停用'
								};
								return map[value] || value;
							}
						},
						{
							"key": "remark",
							"title": "备注",
							"type": "text",
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
					],
					multipleSelection: [],
					selectItem: ""
				},
				queryForm1: {
					formData: {},
					columns: [{
							key: "name",
							title: "功能名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "route",
							title: "路由路径",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "status",
							title: "状态",
							type: "select",
							width: colWidth,
							mode: "=",
							data: [{
									value: "enabled",
									label: "启用"
								},
								{
									value: "disabled",
									label: "停用"
								}
							]
						}
					]
				},
				form1: {
					data: {},
					props: {
						action: "",
						columns: [{
								key: "name",
								title: "功能名称",
								type: "text",
								width: "100%",
								placeholder: "请输入功能名称"
							},
							{
								"key": "imgUrl",
								"title": "图片文件",
								"type": "image",
								"limit": 1,
								"width": colWidth,
								"cloudDirectory": "/common-functions",
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file)
								}
							},
							{
								key: "route",
								title: "路由路径",
								type: "text",
								width: "100%",
								placeholder: "例如: /pages/workflow/seal/seal"
							},
							{
								key: "sort",
								title: "排序序号",
								type: "number",
								width: "100%",
								placeholder: "数字越小越靠前"
							},
							{
								key: "status",
								title: "状态",
								type: "radio",
								width: "100%",
								data: [{
										value: "enabled",
										label: "启用"
									},
									{
										value: "disabled",
										label: "停用"
									}
								]
							},
							{
								key: "remark",
								title: "备注",
								type: "textarea",
								width: "100%",
								placeholder: "可选"
							}
						],
						rules: {
							name: [{
								required: true,
								message: '功能名称不能为空',
								trigger: 'blur'
							}],
							route: [{
								required: true,
								message: '路由路径不能为空',
								trigger: 'blur'
							}],
							sort: [{
								required: true,
								message: '排序序号不能为空',
								trigger: 'blur'
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				},
				formDatas: {},
			};
		},
		onLoad(options = {}) {			
			this.options = options;
			this.init(options);
		},
		onReady() {},
		onShow() {},
		onHide() {},
		methods: {
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
			pageTo(path) {
				vk.navigateTo(path);
			},
			resetForm() {
				vk.pubfn.resetForm(originalForms, this);
			},
			search() {
				this.$refs.table1.search();
			},
			refresh() {
				this.$refs.table1.refresh();
			},
			getCurrentRow() {
				return this.$refs.table1.getCurrentRow();
			},
			currentChange(val) {
				this.table1.selectItem = val;
			},
			selectionChange(list) {
				this.table1.multipleSelection = list;
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/common-functions/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加常用功能';
				this.form1.props.show = true;
				// 设置默认值
				this.form1.data = {
					sort: 0,
					status: 'enabled',
					imgUrl: null
				};
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/common-functions/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑常用功能';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/common-functions/sys/delete",
					data: {
						_id: item._id
					},
				});
				//删除附件
				item.url = item.imgUrl;
				vk.myfn.deleteFile(item);

			},
			async batchBtn(index) {
				const ids = this.table1.multipleSelection.map(item => item._id);
				if (ids.length === 0) {
					vk.toast('请先选择要操作的功能');
					return;
				}
				let action = '';
				let newStatus = '';
				let confirmMsg = '';
				if (index === 1) {
					action = 'admin/common-functions/sys/batchEnable';
					newStatus = 'enabled';
					confirmMsg = '确定要批量启用选中的功能吗？';
				} else if (index === 2) {
					action = 'admin/common-functions/sys/batchDisable';
					newStatus = 'disabled';
					confirmMsg = '确定要批量停用选中的功能吗？';
				} else if (index === 3) {
					action = 'admin/common-functions/sys/batchDelete';
					confirmMsg = '确定要批量删除选中的功能吗？此操作不可恢复！';
				}
				uni.showModal({
					title: '提示',
					content: confirmMsg,
					success: async (res) => {
						if (res.confirm) {
							if (index === 3) {
								// 批量删除
								await vk.callFunction({
									url: action,
									data: {
										ids
									}
								});
							} else {
								// 批量更新状态
								await vk.callFunction({
									url: action,
									data: {
										ids,
										status: newStatus
									}
								});
							}
							vk.toast('操作成功');
							this.refresh();
						}
					}
				});
			}
		},
		watch: {},
		computed: {}
	};
</script>

<style lang="scss" scoped>
	.page-body {}
</style>