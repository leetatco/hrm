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
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline" v-if="$hasRole('admin') || $hasPermission('bpmn-workflow-add')" @click="addBtn">添加</el-button>
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
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange">
			<!-- 自定义form_schema字段的显示 -->
			<template v-slot:form_schema="{ row, index }">
				<view class="json-preview">
					<el-button type="text" size="mini" @click="showJsonDetail(row.form_schema)">
						<text class="json-preview-text">查看JSON结构</text>
					</el-button>
				</view>
			</template>
		</vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="600px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="80px"
				@success="form1.props.show = false;refresh();">
				<!-- 自定义form_schema字段在表单中的显示 -->
				<template v-slot:form_schema="{ data, formType }">
					<view class="json-editor-container">
						<el-input 
							v-if="formType !== 'detail'"
							v-model="form1.data.form_schema"
							type="textarea"
							:rows="6"
							:minlength="500"
							placeholder="请输入JSON格式的结构定义"
							show-word-limit
							:autosize="{minRows: 6, maxRows: 20}"
						></el-input>
						<view v-else class="json-viewer-container">
							<vue-json-viewer 
								:value="parseJson(form1.data.form_schema)" 
								:expand-depth="2"
								theme="vk-theme"
								boxed
								copyable
							></vue-json-viewer>
						</view>
					</view>
				</template>
			</vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- JSON详情弹窗 -->
		<el-dialog 
			title="JSON结构详情" 
			:visible.sync="jsonDialogVisible" 
			width="900px"
			:close-on-click-modal="false"
		>
			<view class="json-detail-container">
				<vue-json-viewer 
					:value="currentJson" 
					:expand-depth="10"					
					boxed
					copyable
					show-length
				></vue-json-viewer>
			</view>
			<span slot="footer" class="dialog-footer">
				<el-button @click="jsonDialogVisible = false">关闭</el-button>
				<el-button type="primary" @click="copyJson">复制JSON</el-button>
			</span>
		</el-dialog>

		<!-- 页面内容结束 -->
	</view>
</template>

<script>	
	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 200;
	
	// 引入vue-json-viewer
	import VueJsonViewer from 'vue-json-viewer'
	
	export default {
		components: {
			VueJsonViewer
		},
		data() {
			// 页面数据变量
			return {
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// JSON详情弹窗控制
				jsonDialogVisible: false,
				currentJson: null,
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/bpmn/form-type/sys/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('bpmn-workflow-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('bpmn-workflow-edit')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('bpmn-workflow-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							"key": "name",
							"title": "类型名称",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "code",
							"title": "类型编码",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "description",
							"title": "描述",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "form_schema",
							"title": "结构定义",
							"type": "text",
							"width": colWidth,
							"scopedSlots": true  // 启用自定义插槽
						},
						{
							"key": "status",
							"title": "状态",
							"type": "switch",
							"activeValue": "active",
							"inactiveValue": "inactive",
							"width": colWidth - 100
						}, {
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
							"key": "name",
							"title": "类型名称",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "code",
							"title": "类型编码",
							"type": "text",
							"width": colWidth
						},
					]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {
						status: 'active',
						form_schema: ''
					},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
								"key": "name",
								"title": "类型名称",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "code",
								"title": "类型编码",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "description",
								"title": "描述",
								"type": "text",
								"width": colWidth
							},
							{
								key: "form_schema",
								title: "结构定义",
								type: "textarea",
								showWordLimit: true,
								width: colWidth + 300,
								autosize: {
									minRows: 10,
									maxRows: 50
								},
								scopedSlots: true  // 启用自定义插槽
							},
							{
								"key": "status",
								"title": "状态",
								"type": "radio",
								"width": colWidth,
								"data": [{
									"value": "active",
									"label": "生效"
								}, {
									"value": "inactive",
									"label": "失效"
								}]
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
							code: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							form_schema: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}, {
								validator: this.validateJson,
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
			// 解析JSON字符串
			parseJson(jsonString) {
				if (!jsonString) return {};
				try {
					return JSON.parse(jsonString);
				} catch (error) {
					console.error('JSON解析错误:', error);
					return { error: '无效的JSON格式' };
				}
			},
			// 验证JSON格式
			validateJson(rule, value, callback) {
				if (!value) {
					callback(new Error('结构定义不能为空'));
					return;
				}
				try {
					JSON.parse(value);
					callback();
				} catch (error) {
					callback(new Error('请输入有效的JSON格式'));
				}
			},
			// 显示JSON详情
			showJsonDetail(jsonString) {
				this.currentJson = this.parseJson(jsonString);
				this.jsonDialogVisible = true;
			},
			// 复制JSON
			copyJson() {
				const jsonString = JSON.stringify(this.currentJson, null, 2);
				uni.setClipboardData({
					data: jsonString,
					success: () => {
						this.$message.success('JSON已复制到剪贴板');
					},
					fail: () => {
						this.$message.error('复制失败');
					}
				});
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
				this.form1.props.action = 'admin/bpmn/form-type/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/bpmn/form-type/sys/update';
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
					action: "admin/bpmn/form-type/sys/delete",
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

	.json-preview {
		.json-preview-text {
			color: #409EFF;
			font-size: 12px;
			cursor: pointer;
			
			&:hover {
				color: #67C23A;
				text-decoration: underline;
			}
		}
	}

	.json-editor-container {
		width: 100%;
	}

	.json-viewer-container {
		border: 1px solid #e6e6e6;
		border-radius: 4px;
		padding: 8px;
		background-color: #f8f9fa;
	}

	.json-detail-container {
		max-height: 500px;
		overflow-y: auto;
		border: 1px solid #e6e6e6;
		border-radius: 4px;
		padding: 16px;
		background-color: #f8f9fa;
	}

	// 自定义vue-json-viewer主题
	:deep(.jv-container .jv-code) {
		padding: 8px;
	}

	:deep(.jv-container.boxed) {
		border: none;
		box-shadow: none;
	}
</style>