<template>
	<view class="page-body">
		<!-- 页面内容开始 -->

		<!-- 表格搜索组件开始 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search"></vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view>
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline" @click="addBtn">添加</el-button>
				<!-- 批量操作 -->
				<el-dropdown v-if="table1.multipleSelection" :split-button="false" trigger="click" @command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0">
						批量操作<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">批量操作1</el-dropdown-item>
						<el-dropdown-item :command="2">批量操作2</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="['detail_auto','update','delete']" :selection="true" :row-no="true" :pagination="true"
			@update="updateBtn" @delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange">
			<template v-slot:sort="{ row, column, index }" v-if="$hasRole('admin')">
				<el-input-number v-model="row.sort" size="mini" :precision="0" :min="0"
					@change="sortChange($event, row)" />
			</template>
		</vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="500px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="80px"
				@success="form1.props.show = false;refresh();"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 200;
	export default {
		data() {
			// 页面数据变量
			return {
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/opendb-banner/sys/getList",
					// 表格字段显示规则
					columns: [{
							"key": "title",
							"title": "标题",
							"type": "text",
							"width": colWidth
						}, {
							"key": "bannerfile",
							"title": "图片文件",
							"type": "image",
							"width": colWidth
						},
						{
							"key": "open_url",
							"title": "地址",
							"type": "text",
							"width": colWidth
						},

						{
							"key": "sort",
							"title": "排序",
							"type": "number",
							controls: true,
							"width": colWidth
						},
						{
							"key": "category_id",
							"title": "分类",
							"type": "text",
							"width": colWidth,
							formatter: function(val, row, column, index) {
								return row.category_id == 'url' ? '网页' : '页面';
							}
						},
						{
							"key": "status",
							"title": "生效状态",
							"type": "switch",
							"width": colWidth
						},
						{
							"key": "description",
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
					// 多选框选中的值
					multipleSelection: [],
					// 当前高亮的记录
					selectItem: ""
				},
				// 表格相关结束 -----------------------------------------------------------
				// 表单相关开始 -----------------------------------------------------------
				// 查询表单请求数据
				queryForm1: {
					// 查询表单数据源，可在此设置默认值
					formData: {

					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
							"key": "title",
							"title": "标题",
							"type": "text",
							"width": colWidth,
							"mode": "%%"
						},
						//{"key":"sort","title":"排序","type":"number","width":colWidth,"mode":"="},
						//{"key":"category_id","title":"分类id","type":"text","width":colWidth,"mode":"="},
						//{"key":"status","title":"生效状态","type":"switch","width":colWidth,"mode":"="},
						//{"key":"description","title":"备注","type":"text","width":colWidth,"mode":"="}
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {

					},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								"key": "title",
								"title": "标题",
								"type": "text",
								"width": colWidth
							}, {
								"key": "bannerfile",
								"title": "图片文件",
								"type": "image",
								"limit": 1,
								"cloudDirectory": "/open-banner",
								"width": colWidth,
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file, fileList)
								}
							},
							{
								"key": "open_url",
								"title": "地址",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "sort",
								"title": "排序",
								"type": "number",
								controls: true,
								"step": 1,
								"width": colWidth
							},
							{
								"key": "category_id",
								"title": "类型",
								"type": "select",
								"filterable": true,
								"clearable": true,
								"width": colWidth,
								"data": [{
										value: "url",
										label: "网页"
									},
									{
										value: "path",
										label: "页面"
									}
								]
							},
							{
								"key": "status",
								"title": "生效状态",
								"type": "switch",
								"width": colWidth
							},
							{
								"key": "description",
								"title": "备注",
								"type": "text",
								"width": colWidth
							}
						],
						// 表单验证规则
						rules: {
							bannerfile: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}]
						},
						// add 代表添加 update 代表修改
						formType: "",
						// 弹窗标题
						title: "",
						// 是否显示表单的弹窗
						show: false
					}
				},
				// 其他弹窗表单
				formDatas: {},
				// 表单相关结束 -----------------------------------------------------------
			};
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options = {}) {			
			this.options = options;
			this.init(options);
		},
		// 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
		onReady() {

		},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {

		},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {

		},
		// 函数
		methods: {
			// 修改排序值
			sortChange(sort, item) {
				vk.callFunction({
					url: 'admin/opendb-banner/sys/update',
					data: {
						_id: item._id,
						sort: item.sort
					},
					success: (data) => {
						this.refresh();
					}
				});
			},
			// 页面数据初始化函数
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
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
			// 获取当前选中的行的数据
			getCurrentRow() {
				return this.$refs.table1.getCurrentRow();
			},
			// 监听 - 行的选中高亮事件
			currentChange(val) {
				this.table1.selectItem = val;
			},
			// 当选择项发生变化时会触发该事件
			selectionChange(list) {
				this.table1.multipleSelection = list;
			},
			// 显示添加页面
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/opendb-banner/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/opendb-banner/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			// 删除按钮
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/opendb-banner/sys/delete",
					data: {
						_id: item._id
					},
				});
				//删除附件
				item.url = item.bannerfile;
				vk.myfn.deleteFile(item);
			},
			// 监听 - 批量操作的按钮点击事件
			batchBtn(index) {
				switch (index) {
					case 1:
						vk.toast("批量操作按钮1");
						break;
					case 2:
						vk.toast("批量操作按钮2");
						break;
					default:
						break;
				}
			}
		},
		// 监听属性
		watch: {

		},
		// 计算属性
		computed: {

		}
	};
</script>
<style lang="scss" scoped>
	.page-body {}
</style>