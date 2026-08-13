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
					@click="addBtn">添加公告</el-button>
				<!-- 批量操作 -->
				<el-dropdown v-if="table1.multipleSelection" :split-button="false" trigger="click" @command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0">
						批量操作<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">批量发布</el-dropdown-item>
						<el-dropdown-item :command="2">批量下架</el-dropdown-item>
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
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="900px" mode="form"
			:close-on-click-modal="false" :destroy-on-close="true">
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
					action: "admin/opendb-notice/sys/getList",
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
							"key": "title",
							"title": "标题",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "type",
							"title": "公告类型",
							"type": "text",
							"width": colWidth,
							formatter: (value, row, column, index) => {
								const map = {
									system: '系统公告',
									activity: '活动通知',									
									notice: '一般通知',
									about: '关于我们',
									other: '其他'
								};
								return map[value] || value;
							}
						},
						{
							"key": "status",
							"title": "状态",
							"type": "text",
							"width": colWidth,
							formatter: (value, row, column, index) => {
								const map = {
									draft: '草稿',
									published: '已发布',
									offline: '已下架'
								};
								return map[value] || value;
							}
						},
						{
							"key": "is_top",
							"title": "置顶",
							"type": "text",
							"width": colWidth,
							formatter: (value, row, column, index) => value ? '是' : '否'
						},
						{
							"key": "publish_date",
							"title": "发布时间",
							"type": "date",
							valueFormat: "yyyy-MM-dd",
							"width": colWidth
						},
						{
							"key": "effective_start_date",
							"title": "生效开始",
							"type": "date",
							valueFormat: "yyyy-MM-dd",
							"width": colWidth
						},
						{
							"key": "effective_end_date",
							"title": "生效结束",
							valueFormat: "yyyy-MM-dd",
							"type": "date",
							"width": colWidth
						},
						{
							"key": "view_count",
							"title": "阅读量",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "like_count",
							"title": "点赞数",
							"type": "text",
							"width": colWidth
						},
						{
							key: "content",
							title: "公告信息",
							type: "custom",
							component: "custom-editor-tinymce",
							show: ["detail"]
						},
						{
							"key": "publisher_name",
							"title": "发布人",
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
							key: "title",
							title: "标题",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "type",
							title: "公告类型",
							type: "select",
							width: colWidth,
							mode: "=",
							data: [{
									value: "system",
									label: "系统公告"
								},
								{
									value: "activity",
									label: "活动通知"
								},
								{
									value: "about",
									label: "关于我们"
								},
								{
									value: "notice",
									label: "一般通知"
								},
								{
									value: "other",
									label: "其他"
								}
							]
						},
						{
							key: "status",
							title: "状态",
							type: "select",
							width: colWidth,
							mode: "=",
							data: [{
									value: "draft",
									label: "草稿"
								},
								{
									value: "published",
									label: "已发布"
								},
								{
									value: "offline",
									label: "已下架"
								}
							]
						},
						{
							key: "is_top",
							title: "置顶",
							type: "select",
							width: colWidth,
							mode: "=",
							data: [{
									value: true,
									label: "是"
								},
								{
									value: false,
									label: "否"
								}
							]
						},
						{
							key: "publish_date_start",
							title: "发布时间范围",
							type: "date",
							width: colWidth,
							placeholder: "开始日期"
						},
						{
							key: "publish_date_end",
							title: "",
							type: "date",
							width: colWidth,
							placeholder: "结束日期"
						}
					]
				},
				form1: {
					data: {},
					props: {
						action: "",
						columns: [{
								key: "title",
								title: "标题",
								type: "text",
								width: "100%",
								placeholder: "请输入公告标题"
							},
							{
								key: "type",
								title: "公告类型",
								type: "select",
								width: "100%",
								data: [{
										value: "system",
										label: "系统公告"
									},
									{
										value: "activity",
										label: "活动通知"
									},
									{
										value: "about",
										label: "关于我们"
									},
									{
										value: "notice",
										label: "一般通知"
									},
									{
										value: "other",
										label: "其他"
									}
								]
							},
							{
								key: "status",
								title: "状态",
								type: "select",
								width: "100%",
								data: [{
										value: "draft",
										label: "草稿"
									},
									{
										value: "published",
										label: "已发布"
									},
									{
										value: "offline",
										label: "已下架"
									}
								]
							},
							{
								key: "is_top",
								title: "置顶",
								type: "switch",
								width: "100%"
							},
							{
								key: "publish_date",
								title: "发布时间",
								type: "date",
								width: "100%"
							},
							{
								key: "effective_start_date",
								title: "生效开始时间",
								type: "date",
								width: "100%"
							},
							{
								key: "effective_end_date",
								title: "生效结束时间",
								type: "date",
								width: "100%"
							},
							{
								key: "content",
								title: "公告内容",
								type: "custom",
								component: "custom-editor-tinymce",
								width: "100%",
								placeholder: "开始输入..."
							},
							{
								key: "publisher_name",
								title: "发布人",
								type: "remote-select",
								placeholder: "请选择发布人",
								width: "100%",
								action: "admin/hrm/employees/pub/getAllEmployee",
								props: {
									list: "rows",
									value: "employee_name",
									label: "employee_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1
								}
							}
						],
						rules: {
							effective_start_date: [{
								required: true,
								message: '生效开始时间不能为空',
								trigger: 'change'
							}],
							effective_end_date: [{
								required: true,
								message: '生效结束时间不能为空',
								trigger: 'change'
							}],
							title: [{
								required: true,
								message: '标题不能为空',
								trigger: 'blur'
							}],
							type: [{
								required: true,
								message: '公告类型不能为空',
								trigger: 'change'
							}],
							content: [{
								required: true,
								message: '公告内容不能为空',
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
				// 处理发布时间范围查询
				const formData = this.queryForm1.formData;
				if (formData.publish_date_start && formData.publish_date_end) {
					formData.publish_date = {
						$gte: formData.publish_date_start,
						$lte: formData.publish_date_end
					};
				} else if (formData.publish_date_start) {
					formData.publish_date = {
						$gte: formData.publish_date_start
					};
				} else if (formData.publish_date_end) {
					formData.publish_date = {
						$lte: formData.publish_date_end
					};
				}
				delete formData.publish_date_start;
				delete formData.publish_date_end;
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
				this.form1.props.action = 'admin/opendb-notice/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加公告';
				this.form1.props.show = true;
				// 设置默认值
				this.form1.data = {
					is_top: false,
					status: 'draft',
					type: 'notice',
					attachment_urls: []
				};
			},
			updateBtn({
				item
			}) {				
				this.form1.props.action = 'admin/opendb-notice/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑公告';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/opendb-notice/sys/delete",
					data: {
						_id: item._id
					},
				});
			},
			batchBtn(index) {
				const ids = this.table1.multipleSelection.map(item => item._id);
				if (ids.length === 0) {
					vk.toast('请先选择要操作的公告');
					return;
				}
				let action = '';
				let newStatus = '';
				if (index === 1) {
					action = 'admin/opendb-notice/sys/batchPublish';
					newStatus = 'published';
				} else if (index === 2) {
					action = 'admin/opendb-notice/sys/batchOffline';
					newStatus = 'offline';
				}
				uni.showModal({
					title: '提示',
					content: `确定要${index === 1 ? '批量发布' : '批量下架'}选中的公告吗？`,
					success: (res) => {
						if (res.confirm) {
							vk.callFunction({
								url: action,
								data: {
									ids,
									status: newStatus
								},
								success: (data) => {
									vk.toast('操作成功');
									this.refresh();
								},
								fail: (err) => {
									vk.toast('操作失败');
								}
							});
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