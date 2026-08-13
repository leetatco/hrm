<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-upload2"
					:disabled="!table1.selectItem || table1.selectItem.import_status !== 0"
					v-if="$hasRole('admin') || $hasPermission('attendance-import-execute')"
					@click="executeImport">汇入</el-button>
				<el-button type="warning" size="small" icon="el-icon-upload"
					:disabled="table1.multipleSelection.length === 0 || queryForm1.formData.import_status !== 0"
					v-if="$hasRole('admin') || $hasPermission('attendance-import-batch')"
					@click="batchImport">批量汇入</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :custom-right-btns="table1.customRightBtns" :selection="true" :row-no="false"
			:pagination="true" @current-change="currentChange" @selection-change="selectionChange">
		</vk-data-table>

		<!-- 查看汇入表单弹窗（仅基本信息和表单内容，无审批流） -->
		<vk-data-dialog v-model="importFormDialog.show" :title="importFormDialog.title" width="800px" top="5vh"
			:close-on-click-modal="false">
			<view v-if="importFormDialog.loading" style="text-align:center;padding:50px;">
				<i class="el-icon-loading" style="font-size:30px;"></i>
				<p>加载中...</p>
			</view>
			<view v-else-if="importFormDialog.data" style="max-height:70vh;overflow-y:auto;">
				<ApproveHeaderDetail :detailData="importFormDialog.data" :formSchema="importFormDialog.formSchema"
					:showBasicInfo="true" :showReturnInfo="false" :showApprovalFlow="false" :showCurrentTask="false"
					:showHandleForm="false" :formTypeConfigs="formTypeConfigs" />
			</view>
			<template v-slot:footer>
				<el-button @click="importFormDialog.show = false">关闭</el-button>
			</template>
		</vk-data-dialog>
	</view>
</template>

<script>
	let vk = uni.vk;
	let originalForms = {}; // 表单初始化数据	
	const colWidth = 200;
	import ApproveHeaderDetail from '@/components/approve-header-detail/approve-header-detail.vue';

	export default {
		components: {
			ApproveHeaderDetail
		},
		data() {
			return {
				table1: {
					action: "admin/hrm/attendance/sys/oaImport/getList",
					// 右侧内置按钮：将 detail_auto 替换为自定义按钮，通过监听 detail 事件或重写 onClick
					rightBtns: [{
						mode: 'detail_auto',
						title: '查看详情',
						show: () => this.$hasRole('admin') || this.$hasPermission('attendance-import-view')
					}],
					// 自定义按钮：查看汇入表单
					customRightBtns: [{
						mode: 'custom',
						title: '查看汇入表单',
						icon: 'el-icon-view',
						type: 'primary',
						show: () => this.$hasRole('admin') || this.$hasPermission('attendance-import-view'),
						onClick: (item) => {
							this.viewImportForm(item);
						}
					}],
					columns: [{
							key: "title",
							title: "申请标题",
							type: "text",
							width: colWidth
						},
						{
							key: "form_type_name",
							title: "表单类型",
							type: "text",
							width: colWidth - 40,
							formatter: (val, row) => row.formTypeInfo ? row.formTypeInfo.name : row.form_type_code
						},
						{
							key: "applicant_name",
							title: "申请人",
							type: "text",
							width: colWidth - 40
						},
						{
							key: "import_status",
							title: "汇入状态",
							type: "tag",
							width: colWidth - 60,
							data: [{
									value: 0,
									label: "未汇入",
									tagType: "warning"
								},
								{
									value: 1,
									label: "已汇入",
									tagType: "success"
								},
								{
									value: 2,
									label: "失败",
									tagType: "danger"
								}
							]
						},
						{
							key: "import_time",
							title: "汇入时间",
							type: "time",
							width: colWidth
						}
					],
					selectItem: null,
					multipleSelection: []
				},
				queryForm1: {
					formData: {
						import_status: 0
					},
					columns: [{
							key: "form_type_code",
							title: "表单类型",
							type: "remote-select",
							placeholder: "请选择",
							width: colWidth - 40,
							action: "admin/hrm/attendance/sys/oaimportconfig/getAllowedFormTypes",
							showAll: true,
							props: {
								list: "rows",
								value: "code",
								label: "name"
							},
							mode: "="
						},
						{
							key: "import_status",
							title: "汇入状态",
							type: "select",
							width: colWidth - 40,
							data: [{
									value: 0,
									label: "未汇入"
								},
								{
									value: 1,
									label: "已汇入"
								},
								{
									value: 2,
									label: "失败"
								}
							],
							mode: "="
						}
					]
				},
				importFormDialog: {
					show: false,
					title: '',
					data: null,
					loading: false,
					formSchema: null
				},
				formTypeConfigs: {}
			};
		},
		async mounted() {
			await this.loadFormTypeConfigs();
		},
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
			currentChange(val) {
				this.table1.selectItem = val;
			},
			selectionChange(list) {
				this.table1.multipleSelection = list;
			},

			// 查看汇入表单（仅基本信息和表单内容）
			async viewImportForm(row) {
				this.importFormDialog.show = true;
				this.importFormDialog.loading = true;
				this.importFormDialog.data = null;
				this.importFormDialog.formSchema = null;
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/application-form/sys/getList',
						data: {
							id: row._id
						}
					});
					if (res.code === 0 && res.total > 0) {
						const app = res.rows[0];
						this.importFormDialog.data = app;
						this.importFormDialog.title = `汇入表单 - ${this.getFormTypeName(app.form_type_code)}`;
						this.importFormDialog.formSchema = this.getFormSchema(app.form_type_code);
					} else {
						vk.toast(res.msg || '获取数据失败');
						this.importFormDialog.show = false;
					}
				} catch (e) {
					console.error(e);
					vk.toast('请求异常');
					this.importFormDialog.show = false;
				} finally {
					this.importFormDialog.loading = false;
				}
			},

			async loadFormTypeConfigs() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/form-type/sys/getList',
						data: {
							pageSize: 100
						}
					});
					if (res.code === 0 && res.rows) {
						res.rows.forEach(item => {
							this.formTypeConfigs[item.code] = item;
						});
					}
				} catch (e) {
					console.error('加载表单类型失败:', e);
				}
			},

			getFormTypeName(code) {
				const config = this.formTypeConfigs[code];
				return config ? config.name : code;
			},
			getFormSchema(code) {
				const config = this.formTypeConfigs[code];
				if (config && config.form_schema) {
					try {
						return JSON.parse(config.form_schema);
					} catch (e) {
						return null;
					}
				}
				return null;
			},

			getStatusType(status) {
				const map = {
					draft: 'info',
					pending: 'warning',
					approved: 'success',
					rejected: 'danger',
					cancelled: 'info',
					withdrawn: 'info',
					returned: 'warning'
				};
				return map[status] || 'info';
			},
			getStatusText(status) {
				const map = {
					draft: '草稿',
					pending: '审批中',
					approved: '已通过',
					rejected: '已驳回',
					cancelled: '已取消',
					withdrawn: '已撤回',
					returned: '已退回'
				};
				return map[status] || status;
			},
			formatDate(timestamp) {
				return timestamp ? vk.pubfn.timeFormat(timestamp, 'yyyy-MM-dd hh:mm:ss') : '-';
			},

			async executeImport() {
				if (!this.table1.selectItem) return vk.toast('请先选择一条记录');
				const item = this.table1.selectItem;
				vk.confirm('确定要汇入该条审批数据吗？', async (res) => {
					if (res.confirm) {
						vk.toast('开始处理数据...');
						const result = await vk.callFunction({
							url: 'admin/hrm/attendance/sys/oaimport/importOAData',
							data: {
								_id: item._id
							}
						});
						if (result.code === 0) vk.toast('汇入成功');
						else vk.toast(result.msg || '汇入失败');
						this.refresh();
					}
				});
			},
			async batchImport() {
				const ids = this.table1.multipleSelection.map(item => item._id);
				if (ids.length === 0) return vk.toast('请勾选要汇入的记录');
				vk.confirm(`确定要批量汇入 ${ids.length} 条记录吗？`, async (res) => {
					if (res.confirm) {
						vk.toast('开始处理数据...');
						let successCount = 0;
						for (let _id of ids) {
							const result = await vk.callFunction({
								url: 'admin/hrm/attendance/sys/oaimport/importOAData',
								data: {
									_id
								}
							});
							if (result.code === 0) successCount++;
						}
						vk.alert(`成功汇入 ${successCount} 条，失败 ${ids.length - successCount} 条`, '提示', () =>
							this.refresh());
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body {
		padding: 20rpx;
	}

	.btn-group {
		margin: 20rpx 0;
	}

	.detail-card {
		margin-bottom: 15px;
	}
</style>