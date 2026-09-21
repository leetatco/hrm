<template>
	<view class="page-body">
		<!-- 表格搜索组件 -->
		<vk-data-table-query v-model="queryForm1.formData" :columns="queryForm1.columns" @search="search">
			<template v-slot:_add_time>
				<vk-data-input-date-time v-model="queryForm1.formData._add_time"
					type="daterange"></vk-data-input-date-time>
			</template>
		</vk-data-table-query>

		<!-- 自定义按钮区域 -->
		<view class="button-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasRole('group-common')" @click="addBtn" :disabled="loading"
					:loading="addLoading">
					新建外出申请
				</el-button>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasRole('OA-exportExcel')" @click="exportExcelAll">导出全部
				</el-button>
				<el-button type="warning" size="small" icon="el-icon-refresh" @click="refresh" :loading="loading">
					刷新
				</el-button>
			</el-row>
		</view>

		<!-- 加载状态 -->
		<el-skeleton v-if="loading && !formSchema" :rows="10" animated />

		<!-- 表格组件 -->
		<vk-data-table v-else ref="table1" :action="table1.action" :columns="table1.columns"
			:query-form-param="queryForm1" :custom-right-btns="table1.customRightBtns" :selection="false" :row-no="true"
			:pagination="true" @update="updateBtn" @delete="deleteBtn" @current-change="currentChange"
			@selection-change="selectionChange" />

		<!-- 动态表单公共组件 -->
		<dynamic-form-dialog v-model="formDialog.show" :title="formDialog.title" :form-schema="formSchema"
			:form-type-code="formTypeCode" :initial-data="formDialog.data" :butVisible="true"
			:saveLoading="saveFormLoading" :submitLoading="submitFormLoading" :simulateLoading="simulateFormLoading"
			@save="handleFormSave" @submit="handleFormSubmit" @simulate="handleSimulate" @preview-file="previewFile" />

		<!-- 试算结果弹窗 -->
		<simulate-handle-dialog v-model="simulateDialog.show" :simulate-data="simulateDialog.data"
			@submit="submitAfterSimulate" />

		<!-- 文件预览弹窗 -->
		<file-preview-dialog v-model="filePreview.show" :file-data="filePreview.data" @download="downloadFile" />

		<!-- 详情弹窗 -->
		<vk-data-dialog v-model="detailDialog.show" :title="detailDialog.title" width="900px">
			<approve-header-detail :detail-data="detailDialog.data" :form-schema="formSchema"
				:process-info="processInfo" :status-history="statusHistory" :current-tasks="detailDialog.currentTasks"
				:show-basic-info="true" :show-return-info="false" :show-approval-flow="true" :show-current-task="true"
				:show-handle-form="false" :form-type-configs="formTypeConfigs" @preview-file="previewFile"
				@download-file="downloadFile" />
			<template v-slot:footer>
				<el-button @click="detailDialog.show = false">关闭</el-button>
			</template>
		</vk-data-dialog>
	</view>
</template>

<script>
	import DynamicFormDialog from '@/components/dynamic-form-dialog/dynamic-form-dialog.vue';
	import SimulateHandleDialog from '@/components/simulate-handle-dialog/simulate-handle-dialog.vue';
	import FilePreviewDialog from '@/components/file-preview-dialog/file-preview-dialog.vue';
	import ApproveHeaderDetail from '@/components/approve-header-detail/approve-header-detail.vue';

	export default {
		name: 'OutingApply',
		components: {
			DynamicFormDialog,
			SimulateHandleDialog,
			FilePreviewDialog,
			ApproveHeaderDetail
		},
		data() {
			return {
				formDatas: {},
				loading: true,
				addLoading: false,
				refreshLoading: false,
				saveFormLoading: false,
				submitFormLoading: false,
				simulateFormLoading: false,
				deleteLoading: false,

				formSchema: null,
				formTypeCode: 'OUTING_APPLICATION',
				formTypeConfigs: {},

				formDialog: { show: false, title: '', data: null },
				simulateDialog: { show: false, data: null },
				filePreview: { show: false, data: { url: '', name: '', type: '' } },
				processInfo: { tasks: [], instance: null },

				table1: {
					action: "admin/bpmn/application-form/sys/getList",
					customRightBtns: [
						{ title: '详细', icon: 'el-icon-tickets', show: () => this.$hasRole('admin') || this.$hasRole('group-common'), onClick: (item) => this.showDetail(item) },
						{ title: '编辑', type: 'primary', icon: 'el-icon-edit', show: (item) => (this.$hasRole('admin') || this.$hasRole('group-common')) && item.status === 'draft' && item.applicant_id === vk.getVuex('$user.userInfo.username'), onClick: (item) => this.updateBtn({ item }) },
						{ title: '删除', type: 'danger', icon: 'el-icon-delete', show: (item) => (this.$hasRole('admin') || this.$hasRole('group-common')) && item.status === 'draft' && item.applicant_id === vk.getVuex('$user.userInfo.username'), onClick: (item) => this.deleteBtn({ item }) }
					],
					columns: [
						{ key: "form_data.outing_title", title: "外出地点", type: "text", width: 200, showOverflowTooltip: true },
						{ key: "form_data.outing_type", title: "外出类型", type: "text", width: 100, formatter: (val) => this.getOutingTypeLabel(val) },
						{ key: "form_data.outing_date", title: "外出日期", type: "date", width: 120 },
						{ key: "form_data.start_time", title: "开始时间", type: "text", width: 100 },
						{ key: "form_data.end_time", title: "结束时间", type: "text", width: 100 },
						{ key: "form_data.total_minutes", title: "总时长", type: "text", width: 120, formatter: (val) => vk.myfn.formatMinutes(val) },
						{ key: "applicant_name", title: "申请人", type: "text", width: 100 },
						{ key: "_add_time", title: "申请日期", type: "time", valueFormat: "yyyy-MM-dd", width: 180 },
						{ key: "status", title: "状态", type: "tag", width: 100, data: [
							{ value: "draft", label: "草稿", tagType: "info" },
							{ value: "pending", label: "待处理", tagType: "warning" },
							{ value: "rejected", label: "已驳回", tagType: "danger" },
							{ value: "withdrawn", label: "已撤回" },
							{ value: "approved", label: "已通过", tagType: "success" }
						]}
					]
				},

				queryForm1: {
					formData: { form_type_code: "OUTING_APPLICATION", status: "pending" },
					columns: [
						{ key: "form_type_code", title: "表单类型", type: "text", mode: "=", show: ["none"] },
						{ key: "status", title: "状态", type: "select", width: 150, mode: "=", data: [
							{ value: "draft", label: "草稿" }, { value: "pending", label: "待处理" },
							{ value: "rejected", label: "已驳回" }, { value: "withdrawn", label: "已撤回" },
							{ value: "approved", label: "已通过" }
						] },
						{ key: "form_data.outing_title", title: "外出地点", type: "text", width: 200, mode: "%%" },
						{ key: "form_data.outing_type", title: "外出类型", type: "select", width: 150, mode: "=", data: [
							{ value: "visit_client", label: "拜访客户" },
							{ value: "errand", label: "外出办事" },
							{ value: "meeting", label: "参加会议" },
							{ value: "other", label: "其他" }
						] },
						{ key: "form_data.outing_date", title: "外出日期", type: "date", width: 150, mode: "=" },
						{ key: "_add_time", title: "申请日期", type: "datetimerange", width: 300, mode: "[]" }
					]
				},

				detailDialog: { show: false, title: '外出申请详情', currentTasks: [], data: null },
				statusHistory: []
			};
		},
		onLoad(options = {}) {
			this.init(options);
		},
		methods: {
			getOutingTypeLabel(val) {
				const map = {
					visit_client: '拜访客户',
					errand: '外出办事',
					meeting: '参加会议',
					other: '其他'
				};
				return map[val] || val;
			},

			openForm(name, item) {
				this.$set(this.formDatas, name, item);
			},

			async init(options) {
				try {
					this.loading = true;
					await this.loadFormTypes();
					await this.getFormTypeSchema();
				} catch (error) {
					console.error('初始化失败:', error);
					this.$message.error('页面初始化失败');
				} finally {
					this.loading = false;
				}
			},

			async loadFormTypes() {
				try {
					const res = await vk.callFunction({
						url: 'admin/bpmn/form-type/sys/getList',
						data: { pageIndex: 1, pageSize: -1, status: 'active' }
					});
					if (res.code === 0 && res.rows) {
						res.rows.forEach(formType => this.formTypeConfigs[formType.code] = formType);
						const formTypeColumn = this.queryForm1.columns.find(c => c.key === 'form_type_code');
						if (formTypeColumn) formTypeColumn.data = res.rows.map(item => ({ value: item.code, label: item.name }));
					}
				} catch (error) { console.error('加载表单类型失败:', error); }
			},

			async getFormTypeSchema() {
				try {
					const formType = this.formTypeConfigs[this.formTypeCode];
					if (formType && formType.form_schema) {
						this.formSchema = JSON.parse(formType.form_schema);
					} else {
						this.$message.warning('表单配置未加载，请检查系统配置');
					}
				} catch (error) {
					console.error('加载表单配置失败:', error);
					this.$message.error('加载表单配置失败');
				}
			},

			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: '外出申请表查询数据',
					title: '正在导出数据...',
					columns: this.table1.columns.filter(c => !c.show || c.show.includes('list')),
					pageIndex: 1,
					pageSize: -1
				});
			},

			addBtn() {
				if (!this.formSchema) { this.$message.warning('表单配置未加载'); return; }
				this.formDialog = {
					show: true,
					title: '新建外出申请',
					data: {
						form_type_code: this.formTypeCode,
						form_data: {
							total_minutes: 0
						}
					}
				};
				this.openForm("formDialog", this.formDialog);
			},

			updateBtn({ item }) {
				if (!this.formSchema) { this.$message.warning('表单配置未加载'); return; }
				const formData = { ...item };
				if (item.form_data) {
					Object.keys(item.form_data).forEach(key => formData[key] = item.form_data[key]);
				}
				if (!formData.total_minutes) formData.total_minutes = 0;
				this.formDialog = { show: true, title: '编辑外出申请', data: formData };
				this.openForm("formDialog", this.formDialog);
			},

			async handleFormSave(formData) {
				this.saveFormLoading = true;
				try {
					let url = "admin/bpmn/application-form/sys/add";
					if (formData._id) url = "admin/bpmn/application-form/sys/update";
					const res = await vk.callFunction({ url, data: formData });
					if (res.code === 0) {
						this.$message.success('保存成功');
						this.formDialog.show = false;
						this.refresh();
					} else this.$message.error(res.msg || '保存失败');
				} catch (error) { this.$message.error('保存失败'); }
				finally { this.saveFormLoading = false; }
			},

			async handleFormSubmit(formData) {
				this.submitFormLoading = true;
				try {
					const userInfo = vk.getVuex('$user.userInfo');
					const title = formData.form_data.outing_title || `${userInfo.username}的外出申请`;
					const submitData = {
						...formData,
						userInfo,
						title,
						status: 'pending'
					};
					if (formData._id) submitData._id = formData._id;
					const res = await vk.callFunction({
						url: 'admin/bpmn/application-form/pub/submit',
						data: submitData
					});
					if (res.code === 0) {
						this.$message.success('提交成功');
						this.formDialog.show = false;
						this.refresh();
					} else this.$message.error(res.msg || '提交失败');
				} catch (error) { this.$message.error('提交失败'); }
				finally { this.submitFormLoading = false; }
			},

			async handleSimulate(formData) {
				this.simulateFormLoading = true;
				try {
					const userInfo = vk.getVuex('$user.userInfo');
					const simulateData = {
						form_type_code: this.formTypeCode,
						form_data: formData.form_data,
						process_definition_key: 'OUTING_APPLICATION',
						userInfo
					};
					const res = await vk.callFunction({
						url: 'admin/bpmn/process-engine/pub/simulate',
						data: simulateData
					});
					if (res.code === 0) this.showSimulateResult(res.data);
					else this.$message.error(res.msg || '试算失败');
				} catch (error) { this.$message.error('试算失败'); }
				finally { this.simulateFormLoading = false; }
			},

			showSimulateResult(result) { this.simulateDialog.data = result; this.simulateDialog.show = true; },
			submitAfterSimulate() { this.simulateDialog.show = false; this.handleFormSubmit(this.formDialog.data); },
			search() { this.$refs.table1.search(); },
			refresh() { this.$refs.table1.refresh(); },
			currentChange(val) { this.table1.selectItem = val; },
			selectionChange(list) { this.table1.multipleSelection = list; },

			async showDetail(item) {
				this.detailDialog.data = item;
				await Promise.all([this.loadProcessFlow(item), this.loadStatusHistory(item)]);
				this.detailDialog.show = true;
			},

			async loadProcessFlow(item) {
				try {
					const taskRes = await vk.callFunction({
						url: 'admin/bpmn/task/pub/getProcessFlow',
						data: {
							formData: { application_id: item._id },
							userInfo: vk.getVuex('$user.userInfo'),
							orderBy: 'sequence asc'
						}
					});
					if (taskRes.code === 0) this.processInfo.tasks = taskRes.rows || [];
					if (item.process_instance_id) {
						const instanceRes = await vk.callFunction({
							url: 'admin/bpmn/instance/sys/getList',
							data: { formData: { _id: item.process_instance_id } }
						});
						if (instanceRes.code === 0 && instanceRes.rows?.length) this.processInfo.instance = instanceRes.rows[0];
					}
				} catch (error) { console.error('加载审批流程失败:', error); }
			},

			async loadStatusHistory(item) {
				try {
					this.statusHistory = [{
						action: 'create',
						operation_time: item._add_time,
						operator_name: item.applicant_name,
						comment: '创建外出申请',
						task_name: '申请创建'
					}];
					const historyRes = await vk.callFunction({
						url: 'admin/bpmn/task-history/sys/getList',
						data: {
							formData: { application_id: item._id, action: "create" },
							orderBy: 'operation_time asc'
						}
					});
					if (historyRes.code === 0 && historyRes.rows) {
						historyRes.rows.forEach(history => {
							this.statusHistory.push({
								action: history.action,
								operation_time: history.operation_time,
								operator_name: history.operator_name,
								comment: history.comment,
								task_name: this.getTaskNameFromHistory(history)
							});
						});
					}
					this.statusHistory.sort((a, b) => a.operation_time - b.operation_time);
				} catch (error) { console.error('加载状态历史失败:', error); }
			},

			getTaskNameFromHistory(history) {
				if (history.task_data?.node_info) return history.task_data.node_info.node_name;
				if (history.task_snapshot) return history.task_snapshot.task_name;
				return '任务处理';
			},

			async deleteBtn({ item }) {
				this.$confirm('确定删除该外出申请吗？', '提示', { type: 'warning' }).then(async () => {
					this.deleteLoading = true;
					try {
						const res = await vk.callFunction({
							url: 'admin/bpmn/application-form/sys/delete',
							data: { id: item._id }
						});
						item.form_data?.file_attachments?.forEach((e) => {
							vk.myfn.deleteFile(e);
						});
						if (res.code === 0) { this.$message.success('删除成功'); this.refresh(); }
						else this.$message.error(res.msg || '删除失败');
					} catch (error) { this.$message.error('删除失败'); }
					finally { this.deleteLoading = false; }
				}).catch(() => { this.deleteLoading = false; });
			},

			previewFile(file) {
				if (!file?.url) return;
				this.filePreview.data = { url: file.url, name: file.name, type: this.getFileType(file) };
				this.filePreview.show = true;
			},

			downloadFile(file) {
				if (!file?.url) return;
				const link = document.createElement('a');
				link.href = file.url;
				link.download = file.name || 'download';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				this.$message.success('开始下载文件');
			},

			getFileType(file) {
				if (!file) return 'unknown';
				const name = file.name || '';
				const type = file.type || '';
				if (type.includes('pdf') || name.toLowerCase().endsWith('.pdf')) return 'pdf';
				if (type.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name)) return 'image';
				if (type.includes('text') || /\.(txt|md)$/i.test(name)) return 'text';
				return 'other';
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body { padding: 20rpx; }
	.button-group {
		margin-bottom: 20rpx;
		padding: 20rpx;
		background: #fff;
		border-radius: 8rpx;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	}
</style>