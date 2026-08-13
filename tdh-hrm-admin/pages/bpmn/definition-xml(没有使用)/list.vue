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
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasRole('hr-add')" @click="addBtn">添加</el-button>
				<!-- 批量操作 -->
				<!-- <el-dropdown v-if="table1.multipleSelection" :split-button="false"	trigger="click" @command="batchBtn">
					<el-button type="danger" size="small" style="margin-left: 20rpx;"
						:disabled="table1.multipleSelection.length === 0"
					>
						批量操作<i class="el-icon-arrow-down el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item :command="1">批量操作1</el-dropdown-item>
						<el-dropdown-item :command="2">批量操作2</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown> -->
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="1500px" mode="form"
			:close-on-click-modal="false">
			<view class="dialog-content">
				<!-- 表单区域 -->
				<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
					:inline="true" :form-type="form1.props.formType" :columns='form1.props.columns' :columnsNumber="3"
					label-width="100px" :before-action="form1.props.beforeAction"
					@success="form1.props.show = false;refresh();">
				</vk-data-form>

				<!-- BPMN 设计器区域 -->
				<view class="bpmn-section">
					<view class="section-title">流程设计</view>
					<bpmn-table ref="bpmnDesigner" :inputxml="form1.data.xml"></bpmn-table>
				</view>
			</view>

			<!-- 自定义底部按钮 -->
			<!-- <template #footer>
				<el-button @click="form1.props.show = false">取消</el-button>
				<el-button type="primary" @click="saveBpmnAndForm">保存</el-button>
			</template> -->
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	import BpmnTable from '@/components/custom-bpmn-palette/custom-bpmn-palette.vue'
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 200;
	export default {
		components: {
			'bpmn-table': BpmnTable
		},
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
					action: "admin/bpmn/definition/sys/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasRole('hr-read')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasRole('hr-update')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasRole('hr-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							"key": "name",
							"title": "流程名称",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "key",
							"title": "流程KEY",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "description",
							"title": "流程描述",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "category_name",
							"title": "流程分类",
							"type": "text",
							"width": colWidth,
							formatter: function(val, row, column, index) {
								return row.category_name =
									`${row.categorys11[0].categorys1[0].category_name}/${row.categorys11[0].category_name}`;
							}
						},
						{
							"key": "status",
							"title": "状态",
							"type": "switch",
							"activeValue": "active",
							"inactiveValue": "inactive",
							"width": colWidth - 100
						},
						{
							"key": "version",
							"title": "版本号",
							"type": "number",
							"width": colWidth - 100
						},
						{
							"key": "xml",
							"title": "XML内容",
							"type": "text",
							"width": colWidth,
							"show": ["detail"]
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"type": "time",
							"width": colWidth,
							"show": ["detail"]
						},
						{
							"key": "users.username",
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
							"key": "name",
							"title": "流程名称",
							"type": "text",
							"width": colWidth,
							"mode": "="
						},
						{
							"key": "key",
							"title": "流程KEY",
							"type": "text",
							"width": colWidth,
							"mode": "="
						},
						//{"key":"version","title":"版本号","type":"number","width":200,"mode":"="},
						//{"key":"xml","title":"BPMN XML内容","type":"text","width":200,"mode":"="},
						//{"key":"description","title":"流程描述","type":"text","width":200,"mode":"="},
						//{"key":"category","title":"流程分类","type":"text","width":200,"mode":"="},
						//{"key":"status","title":"状态","type":"text","width":200,"data":[{},{},{}],"mode":"="},
						//{"key":"tags","title":"标签，用于快速筛选","type":"text","width":200,"mode":"="},
						//{"key":"update_date","title":"更新时间","type":"datetimerange","width":200,"mode":"="},
						//{"key":"updat_id","title":"更新人","type":"text","width":200,"mode":"="}
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						version: 1,
						status: 'active'
					},
					// 表单属性
					props: {
						beforeAction: async (formData) => {
							// 可在此处修改 formData 后返回 formData，若在此处return false，则表单不触发提交请求。
							await this.$refs.bpmnDesigner.diagramToXml();
							this.$set(this.form1.data, "xml", this.$refs.bpmnDesigner.xmlString);
							return formData;
						},
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								"key": "name",
								"title": "流程名称",
								"type": "text",
								"width": colWidth + 100
							},
							{
								"key": "key",
								"title": "流程KEY",
								"type": "text",
								"width": colWidth + 100
							},
							{
								"key": "description",
								"title": "流程描述",
								"type": "text",
								"width": colWidth + 100
							},
							{
								key: "xml",
								title: "XML内容",
								type: "text",
								width: colWidth + 100
							},
							{
								key: "category_id",
								title: "流程分类",
								type: "tree-select",
								action: "admin/bpmn/category/sys/getList",
								width: colWidth + 100,
								props: {
									list: "rows",
									value: "category_id",
									label: "category_name",
									children: "children"
								},
							},
							{
								"key": "tags",
								"title": "标签",
								"type": "text",
								"width": colWidth,
								"show": ["detail"]
							},
							{
								"key": "status",
								"title": "状态",
								"type": "radio",
								"width": colWidth + 100,
								"data": [{
									"value": "active",
									"label": "生效"
								}, {
									"value": "inactive",
									"label": "失效"
								}]
							}
						],
						// 表单验证规则
						rules: {
							_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							name: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							category_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							key: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							xml: [{
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
				this.form1.props.action = 'admin/bpmn/definition/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/bpmn/definition/sys/update';
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
					action: "admin/bpmn/definition/sys/delete",
					data: {
						_id: item._id
					},
				});
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
			},
			// 保存 BPMN 和表单数据
			async saveBpmnAndForm() {
				try {
					// 先保存 BPMN 设计
					if (this.$refs.bpmnDesigner && this.$refs.bpmnDesigner.saveDiagram) {
						await this.$refs.bpmnDesigner.saveDiagram();
					}

					// 然后提交表单
					// 这里需要根据你的实际表单提交逻辑来调整
					// 假设表单会自动提交，我们只需要关闭弹窗
					this.form1.props.show = false;
					this.refresh();

				} catch (error) {
					console.error('保存失败:', error);
					this.$message.error('保存失败');
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

	.dialog-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.bpmn-section {
		border: 1px solid #e4e7ed;
		border-radius: 4px;
		padding: 16px;
		background: #fafafa;
	}

	.section-title {
		font-size: 14px;
		margin-bottom: 12px;
		color: #303133;
	}
</style>