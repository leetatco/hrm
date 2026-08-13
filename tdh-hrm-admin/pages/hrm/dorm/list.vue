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
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-config-add')"
					@click="addBtn">添加</el-button>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-config-add')" @click="exportExcelAll">
					导出全部
				</el-button>
				<el-upload style="display: inline-block;margin-left: 20rpx;margin-right: 20rpx;" accept=".xlsx, .xls"
					:auto-upload="false" :limit="1" :show-file-list="false" :file-list="fileList"
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-config-add')" :on-change="handleChange"
					action="">
					<el-button type="primary" size="small" icon="el-icon-upload2">导入excel</el-button>
				</el-upload>
				<el-button type="primary" size="small" icon="el-icon-tickets"
					v-if="$hasRole('admin') || $hasPermission('hrm-attendance-config-add')" @click="exportExcelModel">
					下载模版
				</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="true" :pagination="true"
			:default-sort="{ name:'location', type:'asc',name:'dorm_id', type:'asc'}" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"></vk-data-table>
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
	const colWidth = colWidth;
	export default {
		data() {
			// 页面数据变量
			return {
				fileList: [],
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/dorm/sys/getList",
					//按钮显示
					rightBtns: [{
							mode: 'detail_auto',
							title: '详细',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-attendance-config-view')
							}
						},
						{
							mode: 'update',
							title: '编辑',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission('hrm-attendance-config-edit')
							}
						},
						{
							mode: 'delete',
							title: '删除',
							show: (item) => {
								return this.$hasRole('admin') || this.$hasPermission(
									'hrm-attendance-config-delete')
							}
						}
					],
					// 表格字段显示规则
					columns: [{
							"key": "dorm_id",
							"title": "房号",
							"type": "text",
							"width": colWidth
						},
						{
							"key": "dorm_rent",
							"title": "租金/月",
							"type": "number",
							"width": colWidth
						},
						{
							"key": "location",
							"title": "宿舍地址",
							"type": "text",
							"width": colWidth
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
							"key": "dorm_id",
							"title": "房号",
							"type": "text",
							"width": colWidth,
							"mode": "="
						},
						{
							"key": "dorm_rent",
							"title": "租金",
							"type": "number",
							"width": colWidth,
							"mode": "="
						},
						//{"key":"location","title":"宿舍地址","type":"text","width":colWidth,"mode":"="},
						//{"key":"update_date","title":"更新时间","type":"datetimerange","width":colWidth,"mode":"="},
						//{"key":"updat_id","title":"更新人","type":"text","width":colWidth,"mode":"="}
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
								"key": "dorm_id",
								"title": "房号",
								"type": "text",
								"width": colWidth
							},
							{
								"key": "dorm_rent",
								"title": "租金",
								"type": "number",
								"precision": 0,
								"width": colWidth
							},
							{
								"key": "location",
								"title": "宿舍地址",
								"type": "text",
								"width": colWidth
							},
						],
						// 表单验证规则
						rules: {
							dorm_id: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							location: [{
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
				this.form1.props.action = 'admin/hrm/dorm/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加';
				this.form1.props.show = true;
			},
			// 显示修改页面
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/dorm/sys/update';
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
					action: "admin/hrm/dorm/sys/delete",
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
			//导入xls表格文件
			handleChange(file) {
				//定义字段即将导入的excel表中的数据显示在el-table中，这些字段是显示的部分（同时需要将导入的数据传给后端）
				let typeObj = {
					dorm_id: {
						"title": "房号",
						"type": "text"
					},
					dorm_rent: {
						"title": "租金",
						"type": "number"
					},
					location: {
						"title": "宿舍地址",
						"type": "text"
					}
				};
				let count = 0;
				let errorRow = "";
				try {
					this.$iexcel.importExcel(file.raw, typeObj, async (res) => {
						for (const item of res) {
							if (vk.pubfn.isNull(item.dorm_id)) {
								vk.alert('房号不能为空');
								break;
							}
							let delRes = await vk.callFunction({
								url: 'admin/hrm/dorm/sys/delete',
								title: '请求中...',
								data: {
									dorm_id: item.dorm_id
								},
							})
							if (delRes.code == 0) {
								let addRes = await vk.callFunction({
									url: 'admin/hrm/dorm/sys/add',
									title: '请求中...',
									data: item,
								});
								if (addRes.code == 0) {
									count++;
								} else {
									count = 0;
									errorRow = JSON.stringify(item);
									break;
								}
							}
						}
						this.fileList = [];
						if (count == 0) {
							vk.alert(`错误数据:${errorRow}`, "导入Excel失败", "确定", () => {});
						} else {
							vk.alert(`导入数据:${count}条`, "导入Excel成功", "确定",
								() => {
									this.refresh()
								});
						}
					});
				} catch (error) {
					console.log(error);
				} finally {}
			},
			// 导入xls表格文件模版
			exportExcelModel() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '宿舍管理模版',
					title: "正在导出数据...",
					columns: [{
							"key": "dorm_id",
							"title": "房号",
							"type": "text"
						},
						{
							"key": "dorm_rent",
							"title": "租金",
							"type": "number"
						},
						{
							"key": "location",
							"title": "宿舍地址",
							"type": "text"
						}
					],
					pageIndex: 1,
					pageSize: 1, // 此值为-1，代表导出所有数据
				});
			},
			// 导出xls表格文件（全部数据）
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: new Date().getFullYear() + '宿舍管理信息',
					title: "正在导出数据...",
					columns: [{
							"key": "dorm_id",
							"title": "房号",
							"type": "text"
						},
						{
							"key": "dorm_rent",
							"title": "租金",
							"type": "number"
						},
						{
							"key": "location",
							"title": "宿舍地址",
							"type": "text"
						}
					],
					pageIndex: 1,
					pageSize: -1, // 此值为-1，代表导出所有数据
				});
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