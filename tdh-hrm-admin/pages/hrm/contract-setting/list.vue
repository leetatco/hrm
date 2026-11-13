<template>
	<view class="page-body">
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search"></vk-data-table-query>

		<view>
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-employee-config-add')" @click="addBtn">添加</el-button>
			</el-row>
		</view>

		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>

		<!-- 添加或编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="900px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :before-action="form1.props.beforeAction"
				:action="form1.props.action" :form-type="form1.props.formType" :columns='form1.props.columns'
				label-width="100px" @success="form1.props.show = false;refresh();">
				<!-- 核心修改：将 template_file 传给组件 -->
				<template v-slot:sign_positions_ui="{ form }">
					<ContractSignPosition v-model="form1.data.sign_positions" :text-value="form1.data.text_positions"
						:file-url="form1.data.template_file" @text-change="val => form1.data.text_positions = val">
					</ContractSignPosition>
				</template>
			</vk-data-form>
		</vk-data-dialog>
	</view>
</template>

<script>
	import ContractSignPosition from "@/components/contract-sign-position/contract-sign-position.vue";
	let vk = uni.vk;
	let originalForms = {};
	const colWidth = 200;
	export default {
		components: {
			ContractSignPosition
		},
		data() {
			return {
				loading: false,
				data: {},
				colWidth: 200,

				table1: {
					action: "admin/hrm/contract-sign/sys/setting/getList",
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: () => this.$hasRole('admin') || this.$hasPermission('hrm-employee-config-view')
						},
						{
							mode: 'update',
							title: '编辑',
							show: () => this.$hasRole('admin') || this.$hasPermission('hrm-employee-config-edit')
						},
						{
							mode: 'delete',
							title: '删除',
							show: () => this.$hasRole('admin') || this.$hasPermission('hrm-employee-config-delete')
						}
					],
					columns: [{
							key: "contract_sign_id",
							title: "合同代码",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "contract_sign_name",
							title: "合同名称",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "companys.company_name",
							title: "所属公司",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "template_file",
							title: "模版文件",
							type: "file", // 表格展示附件
							width: colWidth - 100,
							show: ["detail", "row"]
						},
						{
							key: "sign_positions",
							title: "签名框定位",
							type: "html",
							width: colWidth,
							formatter: (val) => {
								if (!val || !val.length) return "-";
								return val.map((v, i) => {
									const p = v.page === 0 ? "末页" : `P${v.page}`;
									return `#${i + 1} ${p} (${v.x},${v.y}) ${v.width}x${v.height}`;
								}).join("<br>");
							}
						},
						{
							key: "text_positions",
							title: "文本框定位",
							type: "html",
							width: colWidth,
							formatter: (val) => {
								if (!val || !val.length) return "-";
								return val.map((v, i) => {
									const p = v.page === 0 ? "末页" : `P${v.page}`;
									return `#${i + 1} ${p} (${v.x},${v.y}) ${v.width}x${v.height}`;
								}).join("<br>");
							}
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
					],
					multipleSelection: [],
					selectItem: ""
				},

				queryForm1: {
					formData: {},
					columns: [{
							key: "contract_sign_id",
							title: "合同代码",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "contract_sign_name",
							title: "合同名称",
							type: "text",
							width: colWidth,
							mode: "%%"
						},
						{
							key: "company_id",
							title: "公司名称",
							type: "remote-select",
							placeholder: "请选择公司名称",
							action: "admin/hrm/company/sys/getList",
							width: colWidth,
							props: {
								list: "rows",
								value: "company_id",
								label: "company_name"
							},
							showAll: true,
							actionData: {
								pageSize: 1000
							},
							mode: "="
						}
					]
				},

				form1: {
					data: {
						contract_sign_id: "",
						contract_sign_name: "",
						company_id: "",
						template_file: "",
						fill_fields: [], // 新增：普通文本定位
						sign_positions: [],
						text_positions: [] // 初始化
					},
					props: {
						action: "",
						beforeAction: (formData) => {
							if (!Array.isArray(formData.sign_positions)) {
								formData.sign_positions = [];
							}
							return formData;
						},
						columns: [{
								key: "contract_sign_id",
								title: "合同代码",
								type: "text",
								width: colWidth
							},
							{
								key: "contract_sign_name",
								title: "合同名称",
								type: "text",
								width: colWidth
							},
							{
								key: "company_id",
								title: "公司名称",
								type: "remote-select",
								placeholder: "请选择公司名称",
								action: "admin/hrm/company/sys/getList",
								width: colWidth,
								props: {
									list: "rows",
									value: "company_id",
									label: "company_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "template_file",
								title: "模版文件",
								type: "file",
								accept: ".pdf",
								limit: 1,
								cloudDirectory: "contract/template",
								width: colWidth,
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file);
									// 移除模版文件时，顺带清空坐标配置，避免坐标错乱
									this.form1.data.sign_positions = [];
								}
							},
							{
								key: "sign_positions_ui",
								title: "签名与文本定位",
								type: "slot",
								show: ["add", "update"]
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
							}],
							company_id: [{
								required: true,
								message: "请选择所属公司",
								trigger: ["blur", "change"]
							}],
							template_file: [{
								required: true,
								message: "请上传模版文件",
								trigger: ["blur", "change"]
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				},
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

				this.form1.data = {
					contract_sign_id: "",
					contract_sign_name: "",
					company_id: "",
					template_file: "",
					sign_positions: [],
					text_positions: [] // 初始化空数组
				};

				this.form1.props.show = true;
			},

			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/contract-sign/sys/setting/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑合同配置';

				let copyItem = vk.pubfn.copyObject(item);
				let positions = Array.isArray(copyItem.sign_positions) ? copyItem.sign_positions : [];

				this.form1.data = {
					...copyItem,
					sign_positions: item.sign_positions || [],
					text_positions: item.text_positions || []
				};

				this.form1.props.show = true;
			},

			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/contract-sign/sys/setting/delete",
					data: {
						_id: item._id
					},
				});
				// 删除附件
				if (item.template_file) {
					vk.myfn.deleteFiles([item.template_file]);
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body {}
</style>