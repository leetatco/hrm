<template>
	<view class="page-body">
		<!-- 页面内容开始 -->
		<!-- 自定义按钮区域开始 -->
		<view class="vk-table-button-box">
			<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
				v-if="$hasRole('admin') || $hasPermission('hrm-employee-config-add')" @click="addBtn">添加</el-button>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :default-expand-all="false" @update="updateBtn" @delete="deleteBtn"
			@current-change="currentChange" @selection-change="selectionChange" @success="tableSuccess">
			<!-- 排序值 -->
			<template v-slot:sort="{ row, column, index }" v-if="$hasRole('admin') || $hasPermission('hrm-employee-config-add')">
				<el-input-number v-model="row.sort" size="mini" :precision="0" :min="0"
					@change="sortChange($event, row)" />
			</template>
		</vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="700px" mode="form">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="80px"
				@success="formSuccess"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	import getPluginMenu from './libs/pluginMenu.js'
	const pluginMenuJsons = getPluginMenu();
	let that; // 当前页面对象
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据	
	const colWidth = 200;
	export default {
		data() {
			// 页面数据变量
			return {
				pluginMenus: [],
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/company/sys/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-employee-config-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-employee-config-edit')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-employee-config-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							key: "company_name",
							title: "公司名称",
							type: "html",
							width: colWidth,
							align: "left",
							formatter: function(val, row, column, index) {
								let icon = "el-icon-office-building";
								return `<i class="${icon}" style="margin-right: 10px;"></i><text>${row.company_name}</text>`;
							}
						},
						{
							key: "company_id",
							title: "公司代码",
							type: "text",
							align: "left",
							width: 150
						},
						{
							key: "sort",
							title: "排序值",
							type: "number",
							width: colWidth
						},
						{
							key: "parentCompanys.company_name",
							title: "父级公司",
							type: "text",
							width: colWidth
						},
						{
							key: "comment",
							title: "备注",
							type: "text",
							align: "left",
							width: colWidth
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"type": "time",
							"width": this.colTableWidth,
							"show": ["detail"]
						},
						{
							"key": "users.nickname",
							"title": "更新人",
							"type": "text",
							"width": this.colTableWidth,
							"show": ["detail"]
						}
					],
					// 多选框选中的值
					multipleSelection: [],
					// 当前高亮的记录
					selectItem: "",
				},
				formDatas: {},
				// 表格相关结束 -----------------------------------------------------------
				// 表单相关开始-----------------------------------------------------------
				// 查询表单请求数据
				queryForm1: {
					// 查询表单数据源，可在此设置默认值
					formData: {

					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [

					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						sort: 0,
						enable: true,
						url: ""
					},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								key: "company_id",
								title: "公司代码",
								type: "text",
								show: ["add"]
							},
							{
								key: "company_name",
								title: "公司名称",
								type: "text",
							},
							{
								key: "sort",
								title: "排序值",
								type: "number",
								tips: "越小越显示在前面"
							},
							{
								key: "parent_company_id",
								title: "父级公司",
								type: "tree-select",
								tips: "父级的公司",
								action: "admin/hrm/company/sys/getList",
								props: {
									list: "rows",
									value: "company_id",
									label: "company_name",
									children: "children"
								},
							},
							{
								key: "comment",
								title: "备注",
								type: "textarea",
								maxlength: "99",
								showWordLimit: true,
								autosize: {
									minRows: 2,
									maxRows: 10
								},
								tips: "设置一个备注来更详细的描述此权限的含义"
							}
						],
						// 表单对应的验证规则
						rules: {
							company_id: [{
								required: true,
								message: '公司代码不能为空',
								trigger: 'blur'
							}],
							company_name: [{
								required: true,
								message: '菜单名称不能为空',
								trigger: 'blur'
							}, ],
							sort: [{
								type: 'number',
								message: '排序值必须为数字'
							}]
						},
						// add 代表添加 update 代表修改
						formType: '',
						// 是否显示表单1 的弹窗
						show: false,
					}
				},
				// 表单相关结束-----------------------------------------------------------
			};
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options = {}) {
			that = this;
			vk = that.vk;
			that.options = options;
			that.init(options);
		},
		// 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
		onReady() {},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {},
		// 函数
		methods: {
			// 页面数据初始化函数
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(that.form1);
			},
			tableSuccess() {
				// this.pluginMenus = this.getPluginMenus();
			},
			// 页面跳转
			pageTo(path) {
				vk.navigateTo(path);
			},
			// 表单重置
			resetForm() {
				vk.pubfn.resetForm(originalForms, that);
			},
			// 搜索
			search() {
				that.$refs.table1.search();
			},
			// 刷新
			refresh() {
				that.$refs.table1.refresh();
			},
			// 获取当前选中的行的数据
			getCurrentRow(key) {
				return that.$refs.table1.getCurrentRow(key);
			},
			// 监听 - 行的选中高亮事件
			currentChange(val) {
				that.table1.selectItem = val;
			},
			// 当选择项发生变化时会触发该事件
			selectionChange(list) {
				that.table1.multipleSelection = list;
			},
			// 显示添加页面
			addBtn() {
				that.resetForm();
				that.form1.props.action = 'admin/hrm/company/sys/add';
				that.form1.props.formType = 'add';
				that.form1.props.title = '添加';
				that.form1.props.show = true;
				let currentRow = that.getCurrentRow();
				if (currentRow && currentRow.company_id) {
					that.$set(that.form1.data, "parent_company_id", currentRow.company_id);
					that.$set(that.form1.data, "company_id", currentRow.company_id + "-");
				}
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				that.form1.props.action = 'admin/hrm/company/sys/update';
				that.form1.props.formType = 'update';
				that.form1.props.title = '编辑';
				that.form1.props.show = true;
				that.form1.data = item;
			},
			formSuccess() {
				that.form1.props.show = false;
				// 下面的写法是为了部分修改完成后，减少一次再次请求数据库的查询
				if (that.form1.props.formType === "update") {
					let item = that.getCurrentRow(true);
					if (item.parent_company_id !== that.form1.data.parent_company_id) {
						that.refresh();
					} else {
						vk.pubfn.objectAssignForVue(item, that.form1.data, that);
					}
				} else {
					that.refresh();
				}
			},
			// 删除按钮
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/company/sys/delete",
					data: {
						_id: item._id
					},
				});
			},
			// 设置内置权限

			// 修改排序值
			sortChange(sort, item) {
				vk.callFunction({
					url: 'admin/hrm/company/sys/update',
					data: {
						_id: item._id,
						sort: item.sort,
						company_id: item.company_id,
						company_name: item.company_name,
						parent_company_id: item.parent_company_id
					},
					success: (data) => {
						this.refresh();
					}
				});
			},
			getPluginMenus() {
				const companys = [];
				const tableData = this.$refs.table1.getTableData() || [];
				const dbcompanys = vk.pubfn.treeToArray(tableData, {
					company_id: "company_id",
					parent_company_id: "parent_company_id",
					children: "children"
				});
				pluginMenuJsons.forEach(company => {
					// 查找尚未被注册到数据库中的菜单
					if (!dbcompanys.find(item => item.company_id === company.company_id)) {
						companys.push(company);
					}
				})
				return companys;
			},
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

</style>