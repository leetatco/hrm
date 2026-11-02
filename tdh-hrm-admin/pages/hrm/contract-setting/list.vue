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
					v-if="$hasRole('admin') || $hasPermission('hrm-employee-config-add')" @click="addBtn">添加</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<!-- 注意：宽度建议调大一点，因为 PDF 预览需要空间 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="800px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :before-action="form1.props.beforeAction"
				:action="form1.props.action" :form-type="form1.props.formType" :columns='form1.props.columns'
				label-width="100px" @success="form1.props.show = false;refresh();">
				
				<!-- 【关键修改】：使用插槽自定义组件位置 -->
				<template v-slot:sign_position_ui="{ form }">
					<ContractSignPosition v-model="form1.data"></ContractSignPosition>
				</template>
				
			</vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	// 引入你的 PDF 组件
	import ContractSignPosition from "@/components/contract-sign-position/contract-sign-position.vue";
	let vk = uni.vk;
	let originalForms = {};	

	export default {
		components: {
			ContractSignPosition
		},
		data() {
			return {
				loading: false,
				data: {},

				// 表格相关开始
				table1: {
					action: "admin/hrm/contract-sign/sys/setting/getList",
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
					columns: [{
							"key": "contract_sign_id",
							"title": "合同代码",
							"type": "text",
							"width": 160
						},
						{
							"key": "contract_sign_name",
							"title": "合同名称",
							"type": "text",
							"width": 200
						},
						{
							"key": "sign_position",
							"title": "签名定位",
							"type": "text",
							"width": 240,
							formatter: (val) => {
								if (!val) return "-";
								return `P:${val.page ?? 0} X:${val.x} Y:${val.y} ${val.width}x${val.height}`;
							}
						},
						{
							"key": "update_date",
							"title": "更新时间",
							"type": "time",
							"width": 180,
							"show": ["detail"]
						},
						{
							"key": "users.nickname",
							"title": "更新人",
							"type": "text",
							"width": 140,
							"show": ["detail"]
						}
					],
					multipleSelection: [],
					selectItem: ""
				},
				// 表格相关结束

				// 查询表单开始
				queryForm1: {
					formData: {},
					columns: [{
							"key": "contract_sign_id",
							"title": "合同代码",
							"type": "text",
							"width": 180,
							"mode": "%%"
						},
						{
							"key": "contract_sign_name",
							"title": "合同名称",
							"type": "text",
							"width": 200,
							"mode": "%%"
						}
					]
				},
				// 表单相关开始
				form1: {
					data: {
						contract_sign_id: "",
						contract_sign_name: "",
						page: 0, // 平铺的组件数据
						x: 300,
						y: 180,
						width: 150,
						height: 60
					},
					props: {
						action: "",
						beforeAction: (formData) => {
							// 提交前，将平铺数据组装为对象
							formData.sign_position = {
								page: formData.page,
								x: formData.x,
								y: formData.y,
								width: formData.width,
								height: formData.height
							}
							return formData;
						},
						columns: [
							{
								key: "contract_sign_id",
								title: "合同代码",
								type: "text",
								width: 200
							},
							{
								key: "contract_sign_name",
								title: "合同名称",
								type: "text",
								width: 200
							},
							// 【关键修改】：用于占位和渲染你的插槽
							{
								key: "sign_position_ui",
								title: "签名定位",
								type: "slot", // 指定为插槽类型								
								show: ["add", "update"] // 仅在添加/编辑时显示，详情如果不显示可去掉
							}
						],
						rules: {
							contract_sign_id: [{
								required: true,
								message: "合同代码不能为空",
								trigger: ["blur", "change"]
							}],
							contract_sign_name: [{
								required: true,
								message: "合同名称不能为空",
								trigger: ["blur", "change"]
							}]
							// 由于组件拖拽会自动更新 xy 等，且默认有值，这里的必填校验可以省略或放在组件内处理
						},
						formType: "",
						title: "",
						show: false
					}
				},
				// 表单相关结束
				formDatas: {}
			};
		},
		onLoad(options = {}) {
			this.options = options;
			this.init(options);
		},
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
				this.form1.props.action = 'admin/hrm/contract-sign/sys/setting/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加合同配置';

				// 初始化平铺数据
				this.form1.data = {
					contract_sign_id: "",
					contract_sign_name: "",
					page: 0,
					x: 300,
					y: 180,
					width: 150,
					height: 60
				};

				this.form1.props.show = true;
			},
			updateBtn({ item }) {
				this.form1.props.action = 'admin/hrm/contract-sign/sys/setting/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑合同配置';

				let copyItem = vk.pubfn.copyObject(item);
				let signPos = copyItem.sign_position || {
					page: 0, x: 300, y: 180, width: 150, height: 60
				};

				// 将嵌套数据解构为平铺数据给表单和组件
				this.form1.data = {
					...copyItem,
					page: signPos.page,
					x: signPos.x,
					y: signPos.y,
					width: signPos.width,
					height: signPos.height
				};

				this.form1.props.show = true;
			},
			deleteBtn({ item, deleteFn }) {
				deleteFn({
					action: "admin/hrm/contract-sign/sys/setting/delete",
					data: { _id: item._id },
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body {}
</style>