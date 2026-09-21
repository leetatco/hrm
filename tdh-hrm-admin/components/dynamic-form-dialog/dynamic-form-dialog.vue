<template>
	<view>
		<vk-data-dialog v-model="form.props.show" :title="form.props.title" width="930px" mode="form"
			:destroy-on-close="true" @closed="handleCancel">
			<div v-if="formTypeCode === 'LEAVE_APPLICATION'" class="batch-bar">
				<el-button type="primary" icon="el-icon-date" size="small" plain @click="openBatchDatePicker">
					批量生成日期
				</el-button>
			</div>
			<vk-data-form v-model="form.data" :rules="form.props.rules" :action="form.props.action" ref="formRef"
				:form-type="form.props.formType" :columns="form.props.columns" label-width="130px" :inline="true"
				:columnsNumber="2" :border="true" @success="handleSuccess">
				<template v-slot:file_attachments>
					<div v-if="getFieldType('file_attachments') === 'file'" class="file-upload-container">
						<vk-data-upload ref="fileUploadRef" :accept="getFieldAccept('file_attachments')"
							:file-list="form.data.form_data['file_attachments'] || []" :action="uploadConfig.action"
							:headers="uploadConfig.headers" :multiple="getFileMultiple('file_attachments')"
							:limit="getFileMaxCount('file_attachments')" :on-exceed="handleExceed"
							:before-upload="beforeUpload" :cloud-directory="fileDir"
							:on-success="(res, file, fileList) => onUploadSuccess(res, file, fileList, 'file_attachments')"
							:on-remove="(file, fileList) => onUploadRemove(file, fileList, 'file_attachments')"
							:on-error="onUploadError" :on-preview="onUploadPreview" list-type="text">
							<el-button size="small" type="primary" icon="el-icon-upload" class="upload-button">
								点击上传
							</el-button>
							<div slot="tip" class="el-upload__tip">
								{{ getFileDescription('file_attachments') }}
							</div>
						</vk-data-upload>
						<div v-if="form.data.form_data['file_attachments'] && form.data.form_data['file_attachments'].length > 0"
							class="file-list">
							<div v-for="(file, index) in form.data.form_data['file_attachments']" :key="index"
								class="file-item">
								<div class="file-info">
									<i class="el-icon-document file-icon"></i>
									<span class="file-name" :title="file.name || file.url">
										{{ file.name || file.url }}
									</span>
									<span class="file-size" v-if="file.size">
										({{ formatFileSize(file.size) }})
									</span>
								</div>
								<div class="file-actions">
									<el-button type="text" size="mini" @click="previewFile(file)">预览</el-button>
									<el-button type="text" size="mini" @click="downloadFile(file)">下载</el-button>
									<el-button type="text" size="mini" class="delete-btn"
										@click="removeFile('file_attachments', index)">
										删除
									</el-button>
								</div>
							</div>
						</div>
					</div>
				</template>
				<template v-slot:footer>
					<el-button @click="handleCancel">取消</el-button>
					<el-button v-if="!butVisible" type="primary" :loading="saveLoadingLocal"
						@click="handleSave()">保存</el-button>
					<el-button v-if="butVisible" type="info" @click="handleSimulate"
						:loading="simulateLoadingLocal">试算流程</el-button>
					<el-button v-if="butVisible" type="primary" @click="handleSave('draft')"
						:loading="saveLoadingLocal">保存草稿</el-button>
					<el-button v-if="butVisible" type="success" @click="handleSubmit"
						:loading="submitLoadingLocal">提交申请</el-button>
				</template>
			</vk-data-form>
		</vk-data-dialog>
		<el-dialog title="选择假期起止日期" :visible.sync="showBatchDatePicker" width="400px" append-to-body>
			<view>注意：批量生成日期自动清空列表，并生成第一和第二项内容</view>
			<el-form label-width="80px">
				<el-form-item label="开始日期">
					<el-date-picker v-model="batchStartDate" type="date" placeholder="选择开始日期"
						value-format="yyyy-MM-dd" />
				</el-form-item>
				<el-form-item label="结束日期">
					<el-date-picker v-model="batchEndDate" type="date" placeholder="选择结束日期" value-format="yyyy-MM-dd" />
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="showBatchDatePicker = false">取消</el-button>
				<el-button type="primary" @click="generateBatchDates">生成</el-button>
			</span>
		</el-dialog>
	</view>
</template>
<script>
	export default {
		name: 'DynamicFormDialog',
		props: {
			value: {
				type: Boolean,
				default: false
			},
			butVisible: {
				type: Boolean,
				default: false
			},
			title: {
				type: String,
				default: '表单'
			},
			formSchema: {
				type: Object,
				default: null
			},
			formTypeCode: {
				type: String,
				required: true
			},
			initialData: {
				type: Object,
				default: () => ({})
			},
			formAction: {
				type: String,
				default: 'add'
			},
			actionUrl: {
				type: String,
				default: ''
			},
			saveLoading: {
				type: Boolean,
				default: false
			},
			submitLoading: {
				type: Boolean,
				default: false
			},
			simulateLoading: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				batchStartDate: '',
				batchEndDate: '',
				showBatchDatePicker: false,
				batchPickerShow: false,
				batchPickerType: 'start',
				watchHandlers: {
					watchEmployeeChange: this.watchEmployeeChange,
					watchHandoverEmployeeChange: this.watchHandoverEmployeeChange,
					watchPositionChange: this.watchPositionChange,
					watchNewPositionChange: this.watchNewPositionChange,
					handleCascaderChange: this.handleCascaderChange,
					validateCascaderSelection: this.validateCascaderSelection,
					onOvertimeSelected: this.onOvertimeSelected,
					validateOutingDateAfterToday: this.validateOutingDateAfterToday,
					validateEndTimeAfterStart: this.validateEndTimeAfterStart,
				},
				form: {
					data: {
						form_type_code: this.formTypeCode,
						form_data: {}
					},
					props: {
						action: this.actionUrl,
						columns: [],
						rules: {},
						formType: this.formAction,
						title: this.title,
						show: false
					}
				},
				uploadConfig: {
					action: 'admin/upload/file',
					headers: {},
					withCredentials: false
				},
				saveLoadingLocal: false,
				submitLoadingLocal: false,
				simulateLoadingLocal: false,
				fileDir: 'oa'
			};
		},
		computed: {
			visible: {
				get() {
					return this.value;
				},
				set(val) {
					this.$emit('input', val);
				}
			}
		},
		watch: {
			'form.data': {
				handler(newVal) {
					if (!newVal || !this.formSchema) return;
					this.calcAutoTotal();
				},
				deep: true,
				immediate: true
			},
			visible: {
				immediate: true,
				handler(newVal) {
					this.form.props.show = newVal;
					if (newVal) {
						this.$nextTick(() => {
							this.initForm();
						});
					}
				}
			},
			formSchema: {
				immediate: true,
				deep: true,
				handler(newVal) {
					if (newVal && this.visible) {
						this.$nextTick(() => {
							this.initForm();
						});
					}
				}
			},
			initialData: {
				immediate: true,
				deep: true,
				handler(newVal) {
					if (newVal && Object.keys(newVal).length > 0) {
						this.handleInitialData(newVal);
					}
				}
			},
			title(newVal) {
				this.form.props.title = newVal;
			},
			formAction(newVal) {
				this.form.props.formType = newVal;
			},
			actionUrl(newVal) {
				this.form.props.action = newVal;
			},
			saveLoading(newVal) {
				this.saveLoadingLocal = newVal;
			},
			submitLoading(newVal) {
				this.submitLoadingLocal = newVal;
			},
			simulateLoading(newVal) {
				this.simulateLoadingLocal = newVal;
			}
		},
		methods: {
			// ================= 计算总分钟数 =================
			_calcRangeMinutes(range, toMinutes) {
				if (Array.isArray(range) && range.length === 2) {
					const startMins = toMinutes(range[0]);
					const endMins = toMinutes(range[1]);
					if (endMins > startMins) return endMins - startMins;
				}
				return 0;
			},
			computeTotalMinutes(items) {
				if (!Array.isArray(items) || items.length === 0) return 0;
				const toMinutes = (timeStr) => {
					if (!timeStr) return 0;
					const parts = timeStr.split(':');
					const hours = parseInt(parts[0], 10) || 0;
					const minutes = parseInt(parts[1], 10) || 0;
					const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
					return hours * 60 + minutes + Math.round(seconds / 60);
				};

				const hasBatchItems = items.some(item => item.batchGenerated === true);
				if (hasBatchItems) {
					const batchItems = items.filter(item => item.batchGenerated === true);
					const dates = batchItems
						.map(item => item.leave_date)
						.filter(date => date)
						.map(date => new Date(date.replace(/-/g, '/')));
					if (dates.length === 0) {
						let totalMinutes = 0;
						for (const item of items) {
							totalMinutes += this._calcRangeMinutes(item.morning_range, toMinutes);
							totalMinutes += this._calcRangeMinutes(item.afternoon_range, toMinutes);
						}
						return Math.max(0, totalMinutes);
					}
					const minDate = new Date(Math.min(...dates));
					const maxDate = new Date(Math.max(...dates));
					const diffDays = Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
					const baseMinutes = diffDays * 8 * 60;

					let extraMinutes = 0;
					items.forEach(item => {
						if (!item.batchGenerated) {
							extraMinutes += this._calcRangeMinutes(item.morning_range, toMinutes);
							extraMinutes += this._calcRangeMinutes(item.afternoon_range, toMinutes);
						}
					});
					return Math.max(0, baseMinutes + extraMinutes);
				}

				let totalMinutes = 0;
				for (const item of items) {
					totalMinutes += this._calcRangeMinutes(item.morning_range, toMinutes);
					totalMinutes += this._calcRangeMinutes(item.afternoon_range, toMinutes);
				}
				return Math.max(0, totalMinutes);
			},
			// ========== 自动计算总时长 ==========
			calcAutoTotal() {
				const type = this.formTypeCode;
				const formData = this.form.data;
				const itemsField = 'items';
				const totalField = 'total_minutes';

				if (['LEAVE_APPLICATION', 'OVERTIME_APPLICATION', 'COMPENSATORY_APPLICATION',
						'BUSINESS_TRIP_APPLICATION', 'OUTING_APPLICATION'
					].includes(type)) {
					let totalMinutes = 0;

					if (type === 'LEAVE_APPLICATION' || type === 'OVERTIME_APPLICATION') {
						const items = formData[itemsField];
						if (!Array.isArray(items)) return;
						totalMinutes = this.computeTotalMinutes(items);

					} else if (type === 'COMPENSATORY_APPLICATION') {
						// 调休：直接累加 deduct_minutes（单位已是分钟）
						const items = formData[itemsField];
						if (!Array.isArray(items)) return;
						items.forEach(item => {
							const minutes = parseFloat(item.deduct_minutes) || 0;
							totalMinutes += minutes;
						});

					} else if (type === 'BUSINESS_TRIP_APPLICATION') {
						const items = formData[itemsField];
						if (!Array.isArray(items)) return;
						items.forEach(item => {
							const start = item.start_time;
							const end = item.end_time;
							if (start && end) {
								const startDate = new Date(start.replace(/-/g, '/'));
								const endDate = new Date(end.replace(/-/g, '/'));
								if (!isNaN(startDate) && !isNaN(endDate)) {
									totalMinutes += Math.max(0, (endDate - startDate) / 60000);
								}
							}
						});

					} else if (type === 'OUTING_APPLICATION') {
						const start = formData.start_time;
						const end = formData.end_time;
						if (start && end) {
							const [sh, sm] = start.split(':').map(Number);
							const [eh, em] = end.split(':').map(Number);
							totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
						}
					}

					this.$set(formData, totalField, Math.max(0, Math.round(totalMinutes)).toString());
					return;
				}

				// 报销金额
				if (type === 'REIMBURSEMENT_APPLICATION') {
					const items = formData[itemsField];
					if (!Array.isArray(items)) return;
					let total = 0;
					items.forEach(item => {
						const val = parseFloat(item.expense_amount);
						if (!isNaN(val)) total += val;
					});
					this.$set(formData, 'total_detail_amount', (Math.round(total * 100) / 100).toString());
					return;
				}

				// 件数类
				if (type === 'WORK_CLOTHES_APPLICATION' || type === 'RECRUITMENT_APPLICATION') {
					const items = formData[itemsField];
					if (!Array.isArray(items)) return;
					let total = 0;
					items.forEach(item => {
						total += parseInt(item.quantity) || 0;
					});
					this.$set(formData, 'total_quantity', total.toString());
					return;
				}
			},
			// ================= 批量生成日期 =================
			openBatchDatePicker() {
				this.showBatchDatePicker = true;
			},
			onBatchPickerShow(type) {
				this.batchPickerType = type;
				this.batchPickerShow = true;
			},
			onBatchDateConfirm(date) {
				if (this.batchPickerType === 'start') {
					this.batchStartDate = date;
				} else {
					this.batchEndDate = date;
				}
				this.batchPickerShow = false;
			},
			generateBatchDates() {
				if (!this.batchStartDate || !this.batchEndDate) {
					this.$message.warning('请选择起止日期');
					return;
				}
				const start = new Date(this.batchStartDate.replace(/-/g, '/'));
				const end = new Date(this.batchEndDate.replace(/-/g, '/'));
				if (end < start) {
					this.$message.error('结束日期不能早于开始日期');
					return;
				}
				const startItem = {
					leave_date: this.batchStartDate,
					morning_range: ['08:30', '12:00'],
					afternoon_range: ['13:30', '18:00'],
					batchGenerated: true,
				};
				const endItem = {
					leave_date: this.batchEndDate,
					morning_range: ['08:30', '12:00'],
					afternoon_range: ['13:30', '18:00'],
					batchGenerated: true,
				};
				this.$set(this.form.data, 'items', [startItem, endItem]);
				const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
				const totalMinutes = diffDays * 8 * 60;
				this.$set(this.form.data, 'total_minutes', String(totalMinutes));
				this.showBatchDatePicker = false;
				this.$message.success(`已生成首尾明细，共 ${vk.myfn.formatMinutes(totalMinutes)}`);
			},
			// ================= 时间工具 =================
			timeToMinutes(timeStr) {
				if (!timeStr) return 0;
				const [h, m] = timeStr.split(':').map(Number);
				return h * 60 + m;
			},
			createTimeRangeValidator(allowedStart, allowedEnd) {
				return {
					validator: (rule, value, callback) => {
						if (!value || !Array.isArray(value) || value.length !== 2) {
							callback();
							return;
						}
						const [startTime, endTime] = value;
						if (!startTime && !endTime) {
							callback();
							return;
						}
						if (startTime >= endTime) {
							callback(new Error('结束时间必须晚于开始时间'));
							return;
						}
						if (allowedStart && allowedEnd) {
							const startMins = this.timeToMinutes(startTime);
							const endMins = this.timeToMinutes(endTime);
							const minStart = this.timeToMinutes(allowedStart);
							const maxEnd = this.timeToMinutes(allowedEnd);
							if (startMins < minStart || endMins > maxEnd) {
								callback(new Error(`时间范围必须在 ${allowedStart} 至 ${allowedEnd} 之间`));
								return;
							}
						}
						callback();
					},
					trigger: ['change', 'blur']
				};
			},
			// ================= 联动回调 =================
			onOvertimeSelected({
				value,
				formData,
				index,
				option
			}) {
				if (!value) return;
				if (formData && typeof formData === 'object') {
					let remaining = 0;
					let title = '';
					if (option && typeof option === 'object') {
						remaining = option.remaining_minutes || 0;
						title = option.title || '';
					}
					// 单位：分钟
					this.$set(formData, 'remaining_minutes', remaining);
					this.$set(formData, 'overtime_title', title);
					this.$nextTick(() => {
						this.$refs.formRef?.validateField(`items.${index}.deduct_minutes`);
					});
				}
			},
			watchEmployeeChange({
				value,
				formData,
				column,
				index,
				option
			}) {
				if (option) {
					formData.employee_name = option.employee_name || '';
					const companyInfo = option.companys;
					if (companyInfo) {
						formData.current_company_id = companyInfo.company_id || '';
						formData.current_company_name = companyInfo.company_name || '';
					}
					const departmentInfo = option.departments;
					if (departmentInfo) {
						formData.current_department_id = departmentInfo.department_id || '';
						formData.current_department_name = departmentInfo.department_name || '';
					}
					const positionInfo = option.positions;
					if (positionInfo) {
						formData.current_position_id = positionInfo.position_id || '';
						formData.current_position_name = positionInfo.position_name || '';
					}
				} else {
					formData.employee_name = '';
					formData.current_company_id = '';
					formData.current_company_name = '';
					formData.current_department_id = '';
					formData.current_department_name = '';
					formData.current_position_id = '';
					formData.current_position_name = '';
				}
				this.$forceUpdate();
			},
			watchHandoverEmployeeChange({
				value,
				formData,
				column,
				index,
				option
			}) {
				if (option) {
					formData.handover_person_name = option.employee_name || '';
				} else {
					formData.handover_person_name = '';
				}
				this.$forceUpdate();
			},
			validateOutingDateAfterToday(rule, value, callback) {
				if (value && new Date(value) < new Date(new Date().toDateString())) {
					callback(new Error('外出日期不能早于今天'));
				} else {
					callback();
				}
			},
			validateEndTimeAfterStart(rule, value, callback) {
				const formData = this.form.data.form_data || this.form.data;
				const startTime = formData.start_time;
				if (value && startTime) {
					if (value <= startTime) {
						callback(new Error('结束时间必须晚于开始时间'));
						return;
					}
				}
				callback();
			},
			handleCascaderChange({
				value,
				formData,
				column,
				index,
				option
			}) {
				if (value && value.length >= 2) {
					const companyNode = option.companys;
					const departmentNode = option;
					if (vk.pubfn.isNotNull(companyNode)) {
						formData.new_company_id = companyNode.company_id || companyNode.value;
						formData.new_company_name = companyNode.company_name || companyNode.label;
					}
					if (vk.pubfn.isNotNull(departmentNode)) {
						formData.new_department_id = departmentNode.department_id || departmentNode.value;
						formData.new_department_name = departmentNode.department_name || departmentNode.label;
					}
				} else {
					formData.new_company_id = '';
					formData.new_company_name = '';
					formData.new_department_id = '';
					formData.new_department_name = '';
				}
				this.$forceUpdate();
			},
			watchNewPositionChange({
				value,
				formData,
				column,
				index,
				option
			}) {
				if (option) {
					formData.new_position_id = value;
					formData.new_position_name = option.position_name || option.label || '';
				} else {
					formData.new_position_id = '';
					formData.new_position_name = '';
				}
				this.$forceUpdate();
			},
			watchPositionChange({
				value,
				formData,
				column,
				index,
				option
			}) {
				if (option) {
					formData.position_id = value;
					formData.position_name = option.position_name || option.label || '';
				} else {
					formData.position_id = '';
					formData.position_name = '';
				}
				this.$forceUpdate();
			},
			validateCascaderSelection(rule, value = [], callback) {
				if (!value || value.length < 2) {
					callback(new Error('请选择具体部门'));
				} else {
					callback();
				}
			},
			// ================= 初始数据处理 =================
			handleInitialData(initialData) {
				if (!initialData._id) {
					this.form.data = initialData;
				} else {
					const {
						form_data,
						...otherData
					} = initialData;
					this.form.data = {
						...this.form.data,
						...otherData
					};
					if (form_data) {
						this.form.data.form_data = {
							...this.form.data.form_data,
							...form_data
						};
						Object.keys(this.form.data.form_data).forEach(key => {
							this.$set(this.form.data, key, this.form.data.form_data[key]);
						});
					}
					if (this.form.data.form_data.items && !Array.isArray(this.form.data.form_data.items)) {
						this.form.data.form_data.items = [];
					}
					if (this.form.data.form_data.supporting_documents && !Array.isArray(this.form.data.form_data
							.supporting_documents)) {
						this.form.data.form_data.supporting_documents = [];
					}
				}
			},
			// ================= 初始化 =================
			initForm() {
				if (!this.formSchema || !this.formSchema.fields) {
					console.warn('表单配置为空');
					return;
				}
				this.initFormData();
				this.form.props.columns = this.convertFieldsToColumns();
				this.initFormRules();
				this.$nextTick(() => {
					this.loadRemoteDefaultLabels();
				});
			},
			initFormData() {
				if (!this.formSchema || !this.formSchema.fields) return;
				const formData = {};
				this.formSchema.fields.forEach(field => {
					if (field.type === 'file' || field.type === 'table' || field.type === 'array<object>') {
						formData[field.name] = Array.isArray(field.defaultValue) ? field.defaultValue : [];
					} else {
						formData[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
					}
					if (field.displayNameKey) {
						formData[field.displayNameKey] = '';
					}
				});
				if (this.initialData) {
					if (this.initialData.form_data) {
						Object.assign(formData, this.initialData.form_data);
					}
					Object.keys(this.initialData).forEach(key => {
						if (key !== 'form_data') {
							this.$set(this.form.data, key, this.initialData[key]);
						}
					});
				}
				Object.keys(formData).forEach(key => {
					this.$set(this.form.data, key, formData[key]);
				});
				if (this.form.data.form_data) {
					Object.keys(this.form.data.form_data).forEach(key => {
						if (!(key in this.form.data)) {
							this.$set(this.form.data, key, this.form.data.form_data[key]);
						}
					});
				}
			},
			initFormRules() {
				if (!this.formSchema || !this.formSchema.fields) return;
				const rules = {};
				this.formSchema.fields.forEach(field => {
					const fieldKey = field.name;
					const fieldRules = [];

					if (field.required) {
						if (field.type === 'file' || field.type === 'table') {
							fieldRules.push({
								validator: (rule, value, callback) => {
									if (!value || (Array.isArray(value) && value.length === 0)) {
										callback(new Error(`${field.label}是必填项`));
									} else {
										callback();
									}
								},
								trigger: ['change', 'blur']
							});
						} else {
							fieldRules.push({
								required: true,
								message: `${field.label}是必填项`,
								trigger: ['blur', 'change']
							});
						}
					}
					if (field.type === 'number') {
						if (field.min !== undefined) {
							fieldRules.push({
								type: 'number',
								min: field.min,
								message: `${field.label}不能小于${field.min}`,
								trigger: ['blur', 'change']
							});
						}
						if (field.max !== undefined) {
							fieldRules.push({
								type: 'number',
								max: field.max,
								message: `${field.label}不能大于${field.max}`,
								trigger: ['blur', 'change']
							});
						}
					}
					if (field.type === 'text' || field.type === 'textarea') {
						if (field.maxLength) {
							fieldRules.push({
								max: field.maxLength,
								message: `${field.label}不能超过${field.maxLength}个字符`,
								trigger: ['blur', 'change']
							});
						}
					}
					if (field.type === 'file' && field.maxSize) {
						fieldRules.push({
							validator: (rule, value, callback) => {
								if (value && value.length > 0) {
									const oversizedFiles = value.filter(file => file.size > field
										.maxSize * 1024 * 1024);
									if (oversizedFiles.length > 0) {
										callback(new Error(`文件大小不能超过${field.maxSize}MB`));
										return;
									}
								}
								callback();
							},
							trigger: ['change']
						});
					}
					if (field.type === 'file' && field.maxCount) {
						fieldRules.push({
							validator: (rule, value, callback) => {
								if (value && value.length > field.maxCount) {
									callback(new Error(`最多只能上传${field.maxCount}个文件`));
									return;
								}
								callback();
							},
							trigger: ['change']
						});
					}
					if (field.type === 'table' && field.minRows) {
						fieldRules.push({
							validator: (rule, value, callback) => {
								if (!value || value.length < field.minRows) {
									callback(new Error(`至少需要${field.minRows}条记录`));
									return;
								}
								callback();
							},
							trigger: ['change']
						});
					}

					if (fieldRules.length > 0) {
						rules[fieldKey] = fieldRules;
					}

					if (field.rules && Array.isArray(field.rules)) {
						const customRules = field.rules.map(rule => {
							if (rule.validator && typeof rule.validator === 'string') {
								if (this.watchHandlers[rule.validator]) {
									return {
										...rule,
										validator: this.watchHandlers[rule.validator].bind(this)
									};
								}
							}
							return rule;
						});
						if (rules[fieldKey]) {
							customRules.forEach(cr => {
								const exists = rules[fieldKey].some(r =>
									r.validator === cr.validator ||
									(r.message && r.message === cr.message && JSON.stringify(r
										.trigger) === JSON.stringify(cr.trigger))
								);
								if (!exists) {
									rules[fieldKey].push(cr);
								}
							});
						} else {
							rules[fieldKey] = customRules;
						}
					}
				});
				this.form.props.rules = rules;
			},
			// ================= 转换字段为columns =================
			convertFieldsToColumns() {
				if (!this.formSchema || !this.formSchema.fields) return [];
				const columns = [];
				let column = {};
				let columnTitle = {};
				if (this.formSchema.layout && this.formSchema.layout.groups) {
					this.formSchema.layout.groups.forEach((e) => {
						columnTitle = [];
						const obj = {
							key: "",
							title: e.title,
							type: "bar-title"
						}
						columnTitle = obj;
						columns.push(columnTitle);
						this.formSchema.fields.forEach(field => {
							const group = e;
							if (group.fields && group.fields.includes(field.name)) {
								column = {
									key: field.name,
									title: field.label,
									type: this.convertFieldType(field.type),
									width: 200,
									required: field.required || false
								};
								if (group.fullWidth) {
									column.oneLine = true;
									if (field.type === 'file' || field.type === 'table' || field.type ===
										'array<object>') {
										column.width = 630;
									}
								}
								if (field.placeholder) {
									column.placeholder = field.placeholder;
								}
								if (field.defaultValue !== undefined && field.defaultValue !== null) {
									column.defaultValue = field.defaultValue;
								}
								if (field.watch) {
									if (typeof field.watch === 'string' && this.watchHandlers[field
											.watch]) {
										column.watch = this.watchHandlers[field.watch];
									} else if (typeof field.watch === 'function') {
										column.watch = field.watch;
									}
								}
								if (field.disabled) {
									column.disabled = true;
								}
								switch (field.type) {
									case 'text':
										if (field.maxLength) {
											column.maxlength = field.maxLength;
											column.showWordLimit = true;
										}
										break;
									case 'number':
										column.type = 'number';
										if (field.min !== undefined) column.min = field.min;
										if (field.max !== undefined) column.max = field.max;
										if (field.placeholder) column.placeholder = field.placeholder;
										break;
									case 'select':
										column.data = field.options || [];
										if (field.placeholder) column.placeholder = field.placeholder;
										break;
									case 'textarea':
										column.type = 'textarea';
										column.width = 630;
										column.oneLine = true;
										if (field.rows) {
											column.autosize = {
												minRows: field.rows,
												maxRows: field.rows * 2
											};
										}
										if (field.maxLength) {
											column.maxlength = field.maxLength;
											column.showWordLimit = true;
										}
										break;
									case 'date':
										column.dateType = 'date';
										column.valueFormat = 'yyyy-MM-dd';
										column.pickerOptions = {
											disabledDate: (time) => {
												// 仅当月可选
												if (field.pickerOptions?.disabledDate ===
													'currentMonthOnly') {
													const now = new Date();
													const year = now.getFullYear();
													const month = now.getMonth();
													const startOfMonth = new Date(year, month, 1)
														.getTime();
													const endOfMonth = new Date(year, month + 1, 0,
														23, 59, 59, 999).getTime();
													return time.getTime() < startOfMonth || time
														.getTime() > endOfMonth;
												}

												if (vk.pubfn.isNotNull(field.day)) {
													let nowTime = new Date();
													let beforeTime = vk.pubfn.getOffsetTime(
														nowTime, {
															day: field.day,
															mode: "before",
														});
													if (time.getTime() < beforeTime) {
														return true;
													}
													if (time.getTime() > nowTime) {
														return true;
													}
													return false;
												}
												return time.getTime() < Date.now() - 8.64e7;
											}
										}
										break;
									case 'time':
										column.type = 'time';
										column.valueFormat = field.valueFormat || 'HH:mm';
										if (field.isRange === true) {
											column.isRange = true;
											column.startPlaceholder = field.startPlaceholder || '开始时间';
											column.endPlaceholder = field.endPlaceholder || '结束时间';
											column.pickerOptions = {
												selectableRange: field.pickerOptions
													?.selectableRange || '08:00:00 - 18:00:00',
												format: field.pickerOptions?.format || 'HH:mm',
											};
										} else if (field.custom === true) {
											column.custom = true;
											column.pickerOptions = {
												format: field.pickerOptions?.format || 'HH:mm',
												start: field.pickerOptions?.start || '08:00',
												step: field.pickerOptions?.step || '00:30',
												end: field.pickerOptions?.end || '18:00'
											};
										} else {
											column.placeholder = field.placeholder || '请选择时间';
											column.pickerOptions = {
												format: field.pickerOptions?.format || 'HH:mm',
											};
										}
										break;
									case 'file':
										column.oneLine = true;
										column.type = 'upload';
										column.multiple = (field.multiple !== false);
										column.limit = field.maxCount || 10;
										column.accept = field.accept || '*';
										column.props = {
											value: "url",
											label: "name"
										};
										break;
									case 'radio':
										column.data = field.options || [];
										break;
									case 'remote-select':
										column.type = 'remote-select';
										if (field.action) column.action = field.action;
										if (field.props) column.props = field.props;
										if (field.actionData) column.actionData = field.actionData;
										if (field.showAll !== undefined) column.showAll = field.showAll;
										if (field.displayNameKey) {
											column.watch = ({
												value,
												formData,
												option
											}) => {
												if (option) {
													const labelKey = field.props?.label || 'label';
													const label = option[labelKey] || option.label ||
														'';
													formData[field.displayNameKey] = label;
												} else {
													formData[field.displayNameKey] = '';
												}
											};
										}
										break;
									case 'tree-select':
										column.type = 'tree-select';
										if (field.action) column.action = field.action;
										if (field.props) column.props = field.props;
										if (field.actionData) column.actionData = field.actionData;
										break;
									case 'table-select':
										column.type = 'table-select';
										if (field.action) column.action = field.action;
										if (field.multiple !== undefined) column.multiple = field.multiple;
										if (field.columns) column.columns = field.columns;
										if (field.queryColumns) column.queryColumns = field.queryColumns;
										break;
									case 'cascader':
										column.type = 'cascader';
										if (field.action) column.action = field.action;
										if (field.props) column.props = field.props;
										if (field.placeholder) column.placeholder = field.placeholder;
										if (field.checkStrictly) column.checkStrictly = field
											.checkStrictly;
										break;
									case 'array<object>':
										column.type = 'array<object>';
										column.oneLine = true;
										column.width = 630;
										if (field.itemWidth !== undefined) column.itemWidth = field
											.itemWidth;
										if (field.columnIndexWidth !== undefined) column.columnIndexWidth =
											field.columnIndexWidth;
										if (field.showAdd !== undefined) column.showAdd = field.showAdd;
										if (field.showClear !== undefined) column.showClear = field
											.showClear;
										if (field.showSort !== undefined) column.showSort = field.showSort;
										if (field.defaultValue !== undefined) column.defaultValue = field
											.defaultValue;
										if (field.rightBtns !== undefined) {
											const resolveShowWhen = (showWhen) => {
												if (!showWhen) return () => true;
												return (item) => {
													return Object.keys(showWhen).every(field => {
														const condition = showWhen[field];
														if (typeof condition ===
															'boolean') {
															return condition ? item[
																field] === true : item[
																field] !== true;
														}
														if (typeof condition ===
															'string' ||
															typeof condition === 'number'
														) {
															return item[field] ===
																condition;
														}
														return true;
													});
												};
											};
											if (field.rightBtns && Array.isArray(field.rightBtns)) {
												column.rightBtns = field.rightBtns.map(btn => {
													const baseShow = btn.show || (() => true);
													const conditionShow = resolveShowWhen(btn
														.showWhen);
													return {
														...btn,
														show: (item, index) => baseShow(item,
															index) && conditionShow(item)
													};
												});
											} else {
												column.rightBtns = [{
														mode: 'copy',
														title: '复制',
														showWhen: {
															batchGenerated: false
														}
													},
													{
														mode: 'delete',
														title: '删除',
														showWhen: {
															batchGenerated: false
														}
													}
												].map(btn => ({
													...btn,
													show: resolveShowWhen(btn.showWhen)
												}));
											}
										}
										if (field.columns) {
											column.columns = field.columns
												.filter(subColumn => subColumn.show !== false)
												.map(subColumn => {
													const subCol = {
														key: subColumn.key,
														title: subColumn.title,
														type: this.convertFieldType(subColumn
															.type),
														width: subColumn.width || 120,
														isUnique: subColumn.isUnique || false,
														required: subColumn.required || false
													};
													switch (subColumn.type) {
														case 'table-select':
															subCol.type = 'table-select';
															if (subColumn.action) subCol.action =
																subColumn.action;
															if (subColumn.multiple !== undefined)
																subCol.multiple = subColumn.multiple;
															if (subColumn.columns) subCol.columns =
																subColumn.columns;
															if (subColumn.queryColumns) subCol
																.queryColumns = subColumn.queryColumns;
															if (subColumn.placeholder) subCol
																.placeholder = subColumn.placeholder;
															break;
														case 'tree-select':
															subCol.type = 'tree-select';
															if (subColumn.action) subCol.action =
																subColumn.action;
															if (subColumn.props) subCol.props =
																subColumn.props;
															if (subColumn.actionData) subCol
																.actionData = subColumn.actionData;
															if (subColumn.placeholder) subCol
																.placeholder = subColumn.placeholder;
															break;
														case 'remote-select':
															subCol.type = 'remote-select';
															if (subColumn.action) subCol.action =
																subColumn.action;
															if (subColumn.props) subCol.props =
																subColumn.props;
															if (subColumn.actionData) subCol
																.actionData = subColumn.actionData;
															if (subColumn.showAll !== undefined) subCol
																.showAll = subColumn.showAll;
															if (subColumn.placeholder) subCol
																.placeholder = subColumn.placeholder;
															if (subColumn.displayNameKey) {
																subCol.watch = ({
																	value,
																	formData,
																	option
																}) => {
																	if (option) {
																		const labelKey = subColumn
																			.props?.label ||
																			'label';
																		const label = option[
																				labelKey] || option
																			.label || '';
																		formData[subColumn
																				.displayNameKey] =
																			label;
																	} else {
																		formData[subColumn
																				.displayNameKey] =
																			'';
																	}
																};
															}
															break;
														case 'cascader':
															subCol.type = 'cascader';
															if (subColumn.action) subCol.action =
																subColumn.action;
															if (subColumn.props) subCol.props =
																subColumn.props;
															if (subColumn.placeholder) subCol
																.placeholder = subColumn.placeholder;
															if (subColumn.checkStrictly) subCol
																.checkStrictly = subColumn
																.checkStrictly;
															break;
														case 'select':
															subCol.data = subColumn.data || [];
															break;
														case 'text':
															if (subColumn.placeholder) subCol
																.placeholder = subColumn.placeholder;
															if (subColumn.maxLength) {
																subCol.maxlength = subColumn.maxLength;
																subCol.showWordLimit = true;
															}
															if (subColumn.disabled !== undefined) {
																subCol.disabled = subColumn.disabled;
															}
															break;
														case 'number':
															subCol.type = 'number';
															subCol.valueType = 'number';
															subCol.parse = (val) => Number(val);
															if (subColumn.min !== undefined) subCol
																.min = subColumn.min;
															if (subColumn.max !== undefined) subCol
																.max = subColumn.max;
															if (subColumn.defaultValue !== undefined)
																subCol.defaultValue = subColumn
																.defaultValue;

															const numberValidator = {
																validator: (rule, value,
																	callback) => {
																	if (value === undefined ||
																		value === null ||
																		value === '') {
																		callback();
																		return;
																	}
																	const num = Number(value);
																	if (isNaN(num)) {
																		callback(new Error(
																			`${subColumn.title}必须是数字`
																		));
																		return;
																	}
																	if (subColumn.min !==
																		undefined && num <
																		subColumn.min) {
																		callback(new Error(
																			`${subColumn.title}不能小于${subColumn.min}`
																		));
																		return;
																	}
																	if (subColumn.max !==
																		undefined && num >
																		subColumn.max) {
																		callback(new Error(
																			`${subColumn.title}不能大于${subColumn.max}`
																		));
																		return;
																	}
																	callback();
																},
																trigger: ['change', 'blur']
															};

															const existingRules = subColumn.rules ||
														[];
															const finalRules = [];
															existingRules.forEach(rule => {
																if (rule.required === true) {
																	finalRules.push(rule);
																} else if (rule.validator) {
																	finalRules.push(rule);
																} else if (rule.type ===
																	'number' || rule.min !==
																	undefined || rule.max !==
																	undefined) {} else {
																	finalRules.push(rule);
																}
															});
															finalRules.push(numberValidator);
															subCol.rules = finalRules;
															break;
														case 'date':
															subCol.type = subColumn.type;
															subCol.dateType = subColumn.dateType;
															subCol.valueFormat = subColumn.valueFormat;
															break;
														case 'time':
															subCol.type = 'time';
															subCol.valueFormat = subColumn
																.valueFormat || 'HH:mm';
															if (subColumn.isRange === true) {
																subCol.isRange = true;
																subCol.startPlaceholder = subColumn
																	.startPlaceholder || '开始时间';
																subCol.endPlaceholder = subColumn
																	.endPlaceholder || '结束时间';
																let allowedStart = null;
																let allowedEnd = null;
																if (subColumn.allowedRangeStart)
																	allowedStart = subColumn
																	.allowedRangeStart;
																if (subColumn.allowedRangeEnd)
																	allowedEnd = subColumn
																	.allowedRangeEnd;
																if (!allowedStart || !allowedEnd) {
																	const opts = subColumn
																		.pickerOptions || {};
																	if (subColumn.custom === true) {
																		allowedStart = allowedStart ||
																			opts.start;
																		allowedEnd = allowedEnd || opts
																			.end;
																	} else {
																		let rangeStr = opts
																			.selectableRange;
																		if (rangeStr) {
																			if (Array.isArray(
																					rangeStr))
																				rangeStr =
																				rangeStr[0];
																			const match = rangeStr
																				.match(
																					/(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2})/
																				);
																			if (match) {
																				allowedStart =
																					allowedStart ||
																					match[1].substring(
																						0, 5);
																				allowedEnd =
																					allowedEnd ||
																					match[2].substring(
																						0, 5);
																			}
																		}
																	}
																}
																const fixedStart = allowedStart;
																const fixedEnd = allowedEnd;
																const existingRules = subColumn.rules ?
																	[
																		...subColumn.rules
																	] : [];
																subCol.rules = [...existingRules, this
																	.createTimeRangeValidator(
																		fixedStart, fixedEnd)
																];
															} else {
																subCol.placeholder = subColumn
																	.placeholder || '请选择时间';
															}
															const pickerOptionsBase = {};
															if (subColumn.custom === true) {
																pickerOptionsBase.start = subColumn
																	.pickerOptions?.start || '08:30';
																pickerOptionsBase.step = subColumn
																	.pickerOptions?.step || '00:30';
																pickerOptionsBase.end = subColumn
																	.pickerOptions?.end || '18:00';
															} else {
																if (subColumn.pickerOptions
																	?.selectableRange) {
																	pickerOptionsBase.selectableRange =
																		subColumn.pickerOptions
																		.selectableRange;
																}
															}
															subCol.pickerOptions = {
																...pickerOptionsBase,
																format: subColumn.pickerOptions
																	?.format || 'HH:mm',
																...subColumn.pickerOptions
															};
															break;
													}
													if (subColumn.rules) {
														const convertedRules = subColumn.rules.map(
															rule => {
																if (rule.validator && typeof rule
																	.validator === 'string') {
																	if (this.watchHandlers[rule
																			.validator]) {
																		return {
																			...rule,
																			validator: this
																				.watchHandlers[rule
																					.validator]
																				.bind(this)
																		};
																	}
																}
																return rule;
															});
														if (subCol.rules && Array.isArray(subCol
																.rules) && subCol.rules.length > 0) {
															convertedRules.forEach(rule => {
																const exists = subCol.rules
																	.some(existing =>
																		existing.validator ===
																		rule.validator ||
																		(existing.message &&
																			existing
																			.message === rule
																			.message)
																	);
																if (!exists) {
																	subCol.rules.push(rule);
																}
															});
														} else {
															subCol.rules = convertedRules;
														}
													}
													if (subColumn.watch) {
														if (typeof subColumn.watch === 'string' && this
															.watchHandlers[subColumn.watch]) {
															subCol.watch = this.watchHandlers[subColumn
																.watch];
														} else if (typeof subColumn.watch ===
															'function') {
															subCol.watch = subColumn.watch;
														}
													}
													return subCol;
												});
										}
										break;
								}
								if (field.name === 'total_minutes') {
									column.type = 'html';
									column.formatter = (val) => vk.myfn.formatMinutes(val);
								}
								columns.push(column);
							}
						});
					});
				}
				return columns;
			},
			convertFieldType(type) {
				const typeMap = {
					'text': 'text',
					'number': 'number',
					'select': 'select',
					'textarea': 'textarea',
					'date': 'date',
					'file': 'upload',
					'radio': 'radio',
					'remote-select': 'remote-select',
					'tree-select': 'tree-select',
					'table-select': 'table-select',
					'array<object>': 'array<object>',
					'cascader': 'cascader'
				};
				return typeMap[type] || 'text';
			},
			// ================= 加载远程默认标签 =================
			async loadRemoteDefaultLabels() {
				if (!this.formSchema || !this.formSchema.fields) return;
				for (const field of this.formSchema.fields) {
					if (field.type === 'remote-select' && field.displayNameKey) {
						const value = this.form.data[field.name];
						const displayValue = this.form.data[field.displayNameKey];
						if (value && !displayValue) {
							try {
								const res = await vk.callFunction({
									url: field.action,
									data: {
										pageSize: -1,
										pageIndex: 1,
										...(field.actionData || {})
									}
								});
								if (res.code === 0) {
									const rows = res.rows || res.data || [];
									const valueKey = field.props?.value || 'value';
									const labelKey = field.props?.label || 'label';
									const matched = rows.find(item => item[valueKey] == value);
									if (matched) {
										const label = matched[labelKey] || matched.label || '';
										this.$set(this.form.data, field.displayNameKey, label);
									}
								}
							} catch (e) {
								console.error(`加载字段 ${field.name} 默认标签失败`, e);
							}
						}
					}
				}
			},
			// ================= 表单提交 =================
			handleSuccess() {
				this.form.props.show = false;
				this.$emit('success');
				this.$emit('input', false);
			},
			handleCancel() {
				this.form.props.show = false;
				this.$emit('cancel');
				this.$emit('input', false);
			},
			async handleSave(status) {
				this.$refs.formRef.validate((isValid) => {
					if (!isValid) {
						this.$message.error('请完善表单信息');
						return;
					}
					this.saveLoadingLocal = true;
					try {
						const processedData = this.processFormData();
						const formData = {
							...processedData
						};
						if (status) {
							formData.status = status;
						}
						this.$emit('save', formData);
					} catch (error) {
						console.error('保存失败:', error);
						this.$message.error('保存失败');
						this.$emit('error', error);
					} finally {
						this.saveLoadingLocal = false;
					}
				});
			},
			async handleSubmit() {
				this.$refs.formRef.validate((isValid) => {
					if (!isValid) {
						this.$message.error('请完善表单信息');
						return;
					}
					this.submitLoadingLocal = true;
					try {
						const processedData = this.processFormData();
						const formData = {
							...processedData,
							status: 'pending'
						};
						this.$emit('submit', formData);
					} catch (error) {
						console.error('提交失败:', error);
						this.$message.error('提交失败');
						this.$emit('error', error);
					} finally {
						this.submitLoadingLocal = false;
					}
				});
			},
			async handleSimulate() {
				this.$refs.formRef.validate((isValid) => {
					if (!isValid) {
						this.$message.error('请完善表单信息');
						return;
					}
					this.simulateLoadingLocal = true;
					try {
						const processedData = this.processFormData();
						const formData = {
							...processedData
						};
						this.$emit('simulate', formData);
					} catch (error) {
						console.error('试算失败:', error);
						this.$message.error('试算失败');
						this.$emit('error', error);
					} finally {
						this.simulateLoadingLocal = false;
					}
				});
			},
			processFormData() {
				if (!this.formSchema || !this.formSchema.fields) return this.form.data;
				const result = {
					form_type_code: this.form.data.form_type_code,
					form_data: {},
					...this.form.data
				};
				if (!result.form_data) {
					result.form_data = {};
				}
				this.formSchema.fields.forEach(field => {
					const fieldName = field.name;
					if (this.form.data[fieldName] !== undefined) {
						result.form_data[fieldName] = this.form.data[fieldName];
						delete result[fieldName];
					} else if (this.form.data.form_data && this.form.data.form_data[fieldName] !== undefined) {
						result.form_data[fieldName] = this.form.data.form_data[fieldName];
					}
					if (field.displayNameKey) {
						const displayKey = field.displayNameKey;
						if (this.form.data[displayKey] !== undefined) {
							result.form_data[displayKey] = this.form.data[displayKey];
							delete result[displayKey];
						} else if (this.form.data.form_data && this.form.data.form_data[displayKey] !==
							undefined) {
							result.form_data[displayKey] = this.form.data.form_data[displayKey];
						}
					}
				});
				return result;
			},
			resetForm() {
				this.initFormData();
			},
			// ================= 文件上传方法 =================
			getFieldLabel(fieldName) {
				if (!this.formSchema || !this.formSchema.fields) return fieldName;
				const field = this.formSchema.fields.find(f => f.name === fieldName);
				return field ? field.label : fieldName;
			},
			getFieldType(fieldName) {
				if (!this.formSchema || !this.formSchema.fields) return 'text';
				const field = this.formSchema.fields.find(f => f.name === fieldName);
				return field ? field.type : 'text';
			},
			getFieldAccept(fieldName) {
				if (!this.formSchema || !this.formSchema.fields) return '*';
				const field = this.formSchema.fields.find(f => f.name === fieldName);
				return field ? field.accept : '*';
			},
			getFileMaxSize(fieldName) {
				if (!this.formSchema || !this.formSchema.fields) return 50;
				const field = this.formSchema.fields.find(f => f.name === fieldName);
				return field ? (field.maxSize || 50) : 50;
			},
			getFileMaxCount(fieldName) {
				if (!this.formSchema || !this.formSchema.fields) return 10;
				const field = this.formSchema.fields.find(f => f.name === fieldName);
				return field ? (field.maxCount || 10) : 10;
			},
			getFileMultiple(fieldName) {
				if (!this.formSchema || !this.formSchema.fields) return true;
				const field = this.formSchema.fields.find(f => f.name === fieldName);
				return field ? (field.multiple !== false) : true;
			},
			getFileDescription(fieldName) {
				if (!this.formSchema || !this.formSchema.fields) return '请上传文件';
				const field = this.formSchema.fields.find(f => f.name === fieldName);
				return field ? (field.description || '请上传文件') : '请上传文件';
			},
			beforeUpload(file) {
				const maxSize = this.getFileMaxSize('file_attachments') * 1024 * 1024;
				if (file.size > maxSize) {
					this.$message.error(`文件大小不能超过 ${this.getFileMaxSize('file_attachments')}MB`);
					return false;
				}
				return true;
			},
			handleExceed(files, fileList) {
				this.$message.warning(`最多只能上传 ${this.getFileMaxCount('file_attachments')} 个文件`);
			},
			onUploadSuccess(response, file, fileList, fieldName) {
				this.$message.success('文件上传成功');
				if (!this.form.data.form_data[fieldName]) {
					this.$set(this.form.data.form_data, fieldName, []);
				}
				const fileInfo = {
					uid: file.uid,
					name: file.name,
					url: response.url || file.url,
					size: file.size,
					type: file.type,
					uploadTime: Date.now()
				};
				this.form.data.form_data[fieldName].push(fileInfo);
			},
			onUploadRemove(file, fileList, fieldName) {
				if (this.form.data.form_data[fieldName]) {
					const index = this.form.data.form_data[fieldName].findIndex(f => f.uid === file.uid);
					if (index > -1) {
						vk.myfn.deleteFile(file.response);
						this.form.data.form_data[fieldName].splice(index, 1);
					}
				}
			},
			onUploadPreview(file) {
				this.previewFile(file);
			},
			onUploadError(error, file, fileList) {
				console.error('文件上传失败:', error);
				this.$message.error('文件上传失败: ' + (error.message || '未知错误'));
			},
			async removeFile(fieldName, index) {
				await vk.myfn.deleteFile(this.form.data.form_data[fieldName][index]);
				this.form.data.form_data[fieldName].splice(index, 1);
				this.$message.success('文件删除成功');
			},
			previewFile(file) {
				if (!file || !file.url) {
					this.$message.warning('文件地址无效');
					return;
				}
				this.$emit('preview-file', file);
			},
			downloadFile(file) {
				if (!file || !file.url) {
					this.$message.warning('文件地址无效');
					return;
				}
				const link = document.createElement('a');
				link.href = file.url;
				link.download = file.name || 'download';
				link.style.display = 'none';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				this.$message.success('开始下载文件');
			},
			formatFileSize(bytes) {
				if (!bytes) return '0 B';
				const k = 1024;
				const sizes = ['B', 'KB', 'MB', 'GB'];
				const i = Math.floor(Math.log(bytes) / Math.log(k));
				return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
			}
		}
	};
</script>

<style lang="scss" scoped>
	.file-upload-container {
		width: 630px;

		::v-deep .el-upload {
			width: auto;
			text-align: left;

			.upload-button {
				margin-right: 10px;
			}
		}

		::v-deep .el-upload-list {
			width: 100%;
			text-align: left;
		}

		.file-list {
			margin-top: 12px;
			border: 1px solid #e4e7ed;
			border-radius: 4px;
			padding: 12px;
			background: #fafafa;
			width: 100%;
			box-sizing: border-box;

			.file-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 8px;
				margin-bottom: 8px;
				background: white;
				border-radius: 4px;
				border: 1px solid #e4e7ed;
				width: 100%;
				box-sizing: border-box;

				&:last-child {
					margin-bottom: 0;
				}

				.file-info {
					display: flex;
					align-items: center;
					flex: 1;
					min-width: 0;

					.file-icon {
						color: #409eff;
						margin-right: 8px;
						font-size: 16px;
						flex-shrink: 0;
					}

					.file-name {
						flex: 1;
						color: #303133;
						font-size: 14px;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						min-width: 0;
					}

					.file-size {
						color: #909399;
						font-size: 12px;
						margin-left: 8px;
						flex-shrink: 0;
					}
				}

				.file-actions {
					display: flex;
					align-items: center;
					flex-shrink: 0;

					.el-button {
						margin-left: 8px;
					}

					.delete-btn {
						color: #f56c6c;
					}
				}
			}
		}
	}

	.batch-bar {
		padding: 30rpx;
	}

	::v-deep .vk-data-form {
		.form-item {
			&.one-line {
				.el-form-item__content {
					width: 630px;
				}
			}
		}
	}
</style>