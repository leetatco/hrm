<template>
	<view class="dynamic-form-wrapper">
		<view class="form-container">
			<u-form ref="uForm" :model="formData" :rules="formRules" label-position="top" label-width="150"
				:label-style="{ fontSize: '28rpx' }" :error-type="['toast']">
				<template v-for="(group, groupIndex) in formLayoutGroups" :key="groupIndex">
					<view class="form-group">
						<view class="group-title" v-if="group.title">{{ group.title }}</view>
						<template v-for="field in getGroupFields(group)" :key="field.name">
							<!-- 文本输入 -->
							<u-form-item v-if="field.type === 'text'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item">
								<!-- total_minutes 特殊处理：只读展示 -->
								<view v-if="field.name === 'total_minutes'">
									{{ vk.myfn.formatMinutes(formData[field.name]) }}
								</view>
								<!-- 其他普通文本字段 -->
								<u-input v-else v-model="formData[field.name]" :placeholder="field.placeholder || '请输入'"
									:disabled="field.disabled" :type="field.inputType || 'text'"
									:maxlength="field.maxLength" :clearable="true" />
							</u-form-item>

							<!-- 数字输入 -->
							<u-form-item v-else-if="field.type === 'number'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item">
								<u-input v-model="formData[field.name]" :placeholder="field.placeholder || '请输入数字'"
									:disabled="field.disabled" type="number"
									@input="(e) => onNumberInput(field.name, e)" :clearable="true" />
							</u-form-item>

							<!-- 顶层选择字段 -->
							<u-form-item v-else-if="isSelectField(field)" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item">
								<u-input v-model="formData[getDisplayKeyForField(field)]" type="select"
									:placeholder="field.placeholder || '请选择'" :disabled="field.disabled"
									:clearable="true" @click="showTopSelectPicker(field)" />
								<u-input v-model="formData[field.name]" type="text" style="display: none" />
							</u-form-item>

							<!-- 多行文本 -->
							<u-form-item v-else-if="field.type === 'textarea'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item textarea-form-item">
								<u-input v-model="formData[field.name]" :placeholder="field.placeholder || '请输入'"
									:disabled="field.disabled" :type="field.type"
									:height="field.rows ? field.rows * 40 : 120" :maxlength="field.maxLength" />
							</u-form-item>

							<!-- 日期选择 -->
							<u-form-item v-else-if="field.type === 'date'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item">
								<u-input v-model="formData[field.name]" type="select"
									:placeholder="field.placeholder || '请选择日期'" :disabled="field.disabled"
									:clearable="true" @click="showDatePicker(field)" />
							</u-form-item>

							<!-- 时间选择 -->
							<u-form-item v-else-if="field.type === 'time'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item">
								<u-input v-model="formData[field.name]" type="select"
									:placeholder="field.placeholder || '请选择时间'" :disabled="field.disabled"
									:clearable="true" @click="showTimePicker(field.name)" />
							</u-form-item>

							<!-- 文件上传 -->
							<u-form-item v-else-if="field.type === 'file'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item file-form-item">
								<view class="file-upload-container">
									<uni-file-picker ref="fileUploadRef" :disabled="field.disabled"
										:value="formData[field.name]"
										@input="(val) => onFilePickerInput(val, field.name)"
										:limit="field.maxCount || 10" :del-icon="true" :auto-upload="false"
										:disable-preview="true" :dir="fileDir"
										:file-mediatype="getFileMediaType(field.accept)"
										@select="(e) => onFileSelect(e, field.name)"
										@success="(e) => onFileUploadSuccess(e, field.name)" @fail="onFileUploadFail"
										@delete="(e) => onFileDelete(e, field.name)" />
									<view class="file-list">
										<view v-for="(file, index) in formData[field.name]" :key="index"
											class="file-item">
											<view class="file-item-inner">
												<view class="file-info"
													@click="handleFilePreview(file, field.name)">
													<u-icon name="file-text" class="file-icon"></u-icon>
													<text class="file-name">{{ getFileName(file) }}</text>
													<text class="file-size"
														v-if="file.size">({{ formatFileSize(file.size) }})</text>
												</view>
												<view class="file-actions">
													<u-button type="primary" size="mini"
														@click="downloadFile(file)">下载</u-button>
													<u-button type="text" size="mini" :plain="true"
														class="margin-left-xs"
														@click="handleFilePreview(file, field.name)">预览</u-button>
												</view>
											</view>
										</view>
									</view>
								</view>
							</u-form-item>

							<!-- array<object> 卡片部分 -->
							<u-form-item v-else-if="field.type === 'array<object>'" :label="field.label"
								:prop="field.name" :required="field.required" class="custom-form-item array-form-item">
								<view class="array-container">
									<view class="array-actions">
										<u-button type="primary" size="mini" @click="addArrayItem(field)">＋
											添加</u-button>
										<u-button v-if="formTypeCode === 'LEAVE_APPLICATION' && field.name === 'items'"
											type="primary" size="mini" @click="openBatchDatePicker(field)">
											<u-icon name="calendar" size="25"></u-icon> 批量生成日期
										</u-button>
										<u-button v-if="field.showClear !== false" type="error" size="mini"
											@click="clearArray(field.name)">清空</u-button>
									</view>

									<view class="array-cards">
										<view v-for="(item, index) in formData[field.name]" :key="index"
											class="array-card">
											<view class="card-header">
												<text class="card-index">第 {{ index + 1 }} 项</text>
												<view class="card-ops">
													<u-button
														v-if="field.showSort !== false && index > 0 && !item.batchGenerated && !formData[field.name][index-1].batchGenerated"
														type="text" size="mini"
														@click="moveArrayItem(field.name, index, -1)">上移</u-button>
													<u-button
														v-if="field.showSort !== false && index < formData[field.name].length - 1 && !item.batchGenerated && !formData[field.name][index+1].batchGenerated"
														type="text" size="mini"
														@click="moveArrayItem(field.name, index, 1)">下移</u-button>
													<u-button type="text" size="mini" v-if="!item.batchGenerated"
														@click="removeArrayItem(field.name, index)">删除</u-button>
													<text class="card-index"
														v-if="item.batchGenerated">{{index==0?'开始日期':'结束日期'}}</text>
												</view>
											</view>

											<view class="card-body">
												<template v-for="subField in field.columns" :key="subField.key">
													<template v-if="subField.show === false" />

													<!-- 选择类子字段 -->
													<view class="sub-field" v-else-if="isSubSelectField(subField)">
														<view class="sub-label">
															<text v-if="subField.required"
																style="color: #f56c6c; margin-right: 4rpx;">*</text>
															{{ subField.title }}
														</view>
														<u-input v-model="item[getDisplayKey(subField)]" type="select"
															:placeholder="subField.placeholder || '请选择'"
															:disabled="subField.disabled" size="mini" :clearable="true"
															@click="showSubRemoteSelect(subField, field.name, index)" />
													</view>

													<!-- 子字段日期时间选择 -->
													<view class="sub-field"
														v-else-if="subField.type === 'date' && subField.dateType === 'datetime'">
														<view class="sub-label">
															<text v-if="subField.required"
																style="color: #f56c6c; margin-right: 4rpx;">*</text>
															{{ subField.title }}
														</view>
														<u-input v-model="item[subField.key]" type="select"
															:placeholder="subField.placeholder || '请选择日期'"
															:disabled="subField.disabled" :clearable="true"
															@click="showSubDateTimePicker(field.name, index, subField)" />
													</view>

													<!-- 子字段日期选择 -->
													<view class="sub-field" v-else-if="subField.type === 'date'">
														<view class="sub-label">
															<text v-if="subField.required"
																style="color: #f56c6c; margin-right: 4rpx;">*</text>
															{{ subField.title }}
														</view>
														<u-input v-model="item[subField.key]" type="select"
															:placeholder="subField.placeholder || '请选择日期'"
															:disabled="subField.disabled" :clearable="true"
															@click="!isItemBatchDisabled(item, subField.key) && showSubDatePicker(field.name, index, subField)" />
													</view>

													<!-- 子字段时间范围 -->
													<view class="sub-field"
														v-else-if="subField.type === 'time' && subField.isRange">
														<view class="sub-label">
															<text v-if="subField.required"
																style="color: #f56c6c; margin-right: 4rpx;">*</text>
															{{ subField.title }}
														</view>
														<view class="time-range">
															<u-input v-model="item[subField.key][0]" type="select"
																:placeholder="subField.startPlaceholder || '开始'"
																:clearable="true"
																@click="!isItemBatchDisabled(item, subField.key) && showSubTimePicker(field.name, index, subField, 'start')" />
															<text class="range-separator">~</text>
															<u-input v-model="item[subField.key][1]" type="select"
																:placeholder="subField.endPlaceholder || '结束'"
																:clearable="true"
																@click="!isItemBatchDisabled(item, subField.key) && showSubTimePicker(field.name, index, subField, 'end')" />
														</view>
													</view>

													<!-- 普通文本 -->
													<view class="sub-field" v-else-if="subField.type === 'text'">
														<view class="sub-label">
															<text v-if="subField.required"
																style="color: #f56c6c; margin-right: 4rpx;">*</text>
															{{ subField.title }}
														</view>
														<u-input v-model="item[subField.key]"
															:placeholder="subField.placeholder || '请输入'"
															:disabled="subField.disabled" :type="subField.type"
															size="mini" :clearable="true" />
													</view>
													<!-- 数字子字段 -->
													<view class="sub-field" v-else-if="subField.type === 'number'">
														<view class="sub-label">
															<text v-if="subField.required"
																style="color: #f56c6c; margin-right: 4rpx;">*</text>
															{{ subField.title }}
														</view>
														<u-input v-model="item[subField.key]"
															:placeholder="subField.placeholder || '请输入'"
															:disabled="subField.disabled" :type="subField.type"
															@input="(e) => onArrayNumberInput(field.name, index, subField.key, e)"
															size="mini" :clearable="true" />
													</view>
													<!-- 多行文本子字段 -->
													<view class="sub-field" v-else-if="subField.type === 'textarea'">
														<view class="sub-label">
															<text v-if="subField.required"
																style="color: #f56c6c; margin-right: 4rpx;">*</text>
															{{ subField.title }}
														</view>
														<u-input v-model="item[subField.key]"
															:placeholder="subField.placeholder || '请输入'"
															:disabled="subField.disabled" type="text"
															:maxlength="subField.maxLength" :clearable="true" />
													</view>
												</template>
											</view>
										</view>
									</view>

									<view v-if="!formData[field.name] || formData[field.name].length === 0"
										class="array-empty">
										<u-empty text="暂无数据" mode="list"></u-empty>
									</view>
								</view>
							</u-form-item>
						</template>
					</view>
				</template>
			</u-form>

			<!-- 按钮区域 -->
			<view class="form-buttons">
				<u-button @click="handleCancel">取消</u-button>
				<u-button v-if="!butVisible" type="primary" :loading="saveLoadingLocal"
					@click="handleSave()">保存</u-button>
				<u-button v-if="butVisible" type="info" :loading="simulateLoadingLocal"
					@click="handleSimulate">流程</u-button>
				<u-button v-if="butVisible" type="primary" :loading="saveLoadingLocal"
					@click="handleSave('draft')">草稿</u-button>
				<u-button v-if="butVisible" type="success" :loading="submitLoadingLocal"
					@click="handleSubmit">提交</u-button>
			</view>
		</view>

		<!-- 日期选择器 -->
		<u-picker v-model="datePickerShow" mode="time" :params="datePickerParams" @confirm="onDateConfirm" />
		<!-- 时间选择器 -->
		<u-picker v-model="timePickerShow" mode="time" :params="timePickerParams" @confirm="onTimeConfirm" />

		<!-- 子字段远程搜索选择弹窗 -->
		<u-popup v-model="subRemoteSelectVisible" mode="bottom" height="70%" border-radius="20">
			<view class="sub-remote-popup">
				<view class="popup-header">
					<text
						class="popup-title">{{ (subRemote.currentField && subRemote.currentField.label) || '请选择' }}</text>
					<u-button type="text" @click="subRemoteSelectVisible = false">取消</u-button>
				</view>

				<view v-if="subRemote.mode === 'single'">
					<view class="popup-search">
						<u-search v-model="subRemote.keyword" placeholder="输入关键词搜索" :show-action="false"
							@search="onSubRemoteSearch" />
					</view>
					<scroll-view scroll-y class="popup-list">
						<view v-for="item in subRemote.options" :key="item.value" class="popup-item"
							@click="selectSubRemoteItem(item)">
							<text>{{ item.label }}</text>
							<u-icon v-if="item.value === subRemote.selectedValue" name="checkmark-circle"
								color="#2979ff" size="28" />
						</view>
						<view v-if="subRemote.loading" class="loading-tip"><u-loading mode="circle" size="30" /></view>
						<view v-if="!subRemote.loading && subRemote.options.length === 0" class="empty-tip">暂无数据</view>
					</scroll-view>
				</view>

				<view v-else-if="subRemote.mode === 'cascader'">
					<view class="cascader-layout">
						<view class="cascader-col">
							<view class="col-title">选择公司</view>
							<view v-if="subRemote.loading" class="dflex-c"><u-loading mode="circle" size="30" /></view>
							<scroll-view scroll-y class="col-list">
								<view v-for="company in subRemote.cascaderData.companies" :key="company.value"
									class="col-item"
									:class="{ active: (subRemote.cascaderData.selectedCompany && subRemote.cascaderData.selectedCompany.value) === company.value }"
									@click="selectCascaderCompany(company)">
									<text class="item-text">{{ company.label }}</text>
									<u-icon v-if="company.children && company.children.length" name="arrow-right"
										size="24" color="#c0c4cc" />
								</view>
							</scroll-view>
						</view>

						<view class="cascader-col">
							<view class="col-title">
								{{ subRemote.cascaderData.selectedCompany ? subRemote.cascaderData.selectedCompany.label : '选择部门' }}
							</view>
							<scroll-view scroll-y class="col-list" v-if="subRemote.cascaderData.selectedCompany">
								<view v-for="dept in subRemote.cascaderData.selectedCompany.children" :key="dept.value"
									class="col-item"
									:class="{ active: (subRemote.cascaderData.selectedDept && subRemote.cascaderData.selectedDept.value) === dept.value }"
									@click="selectCascaderDept(dept)">
									<text class="item-text">{{ dept.label }}</text>
									<u-icon
										v-if="(subRemote.cascaderData.selectedDept && subRemote.cascaderData.selectedDept.value) === dept.value"
										name="checkmark-circle" size="28" color="#2979ff" />
								</view>
							</scroll-view>
							<view v-else class="empty-tip">请先选择公司</view>
						</view>
					</view>
				</view>
			</view>
		</u-popup>

		<!-- 子字段日期选择器 -->
		<u-picker
			v-model="subDatePickerShow[currentSubDateInfo.fieldName + '_' + currentSubDateInfo.itemIndex + '_' + (currentSubDateInfo.subField ? currentSubDateInfo.subField.key : '')]"
			mode="time" :params="subDatePickerParams" @confirm="onSubDateConfirm" />

		<!-- 子字段日期时间选择器 -->
		<u-picker
			v-model="subDateTimePickerShow[currentSubDateTimeInfo.fieldName + '_' + currentSubDateTimeInfo.itemIndex + '_' + (currentSubDateTimeInfo.subField ? currentSubDateTimeInfo.subField.key : '')]"
			mode="time" :params="subDateTimePickerParams" @confirm="onSubDateTimeConfirm" />

		<!-- 子字段时间选择器 -->
		<u-picker
			v-model="subTimePickerShow[currentSubTimeInfo.fieldName + '_' + currentSubTimeInfo.itemIndex + '_' + (currentSubTimeInfo.subField ? currentSubTimeInfo.subField.key : '') + '_' + currentSubTimeInfo.range]"
			mode="time" :params="subTimePickerParams" @confirm="onSubTimeConfirm" />

		<!-- 批量生成日期弹窗 -->
		<u-popup v-model="showBatchDatePicker" mode="bottom" border-radius="20" :closeable="true">
			<view class="batch-date-picker">
				<view class="picker-header">选择假期起止日期</view>
				<view class="picker-subheader">注意：批量生成日期自动清空列表，并生成第一和第二项内容</view>
				<view class="picker-item">
					<text>开始日期</text>
					<u-input v-model="batchStartDate" type="select" placeholder="请选择"
						@click="onBatchDatePickerShow('start')" />
				</view>
				<view class="picker-item">
					<text>结束日期</text>
					<u-input v-model="batchEndDate" type="select" placeholder="请选择"
						@click="onBatchDatePickerShow('end')" />
				</view>
				<view class="picker-actions">
					<u-button @click="showBatchDatePicker = false">取消</u-button>
					<u-button type="primary" @click="generateBatchDates">生成</u-button>
				</view>
			</view>
		</u-popup>

		<u-picker v-model="batchPickerShow" mode="time" :params="batchDatePickerParams" @confirm="onBatchDateConfirm" />

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
			},
		},
		data() {
			return {
				showBatchDatePicker: false,
				batchStartDate: '',
				batchEndDate: '',
				batchPickerShow: false,
				batchPickerType: 'start',
				batchDatePickerParams: {
					year: true,
					month: true,
					day: true
				},
				formData: {},
				formRules: {},
				formLayoutGroups: [],
				formFields: [],
				selectShow: {},
				subRemoteSelectVisible: false,
				subRemote: {
					keyword: '',
					currentField: null,
					arrayFieldName: '',
					itemIndex: -1,
					options: [],
					loading: false,
					selectedValue: '',
					pageIndex: 1,
					pageSize: 20,
					total: 0,
					mode: 'single',
					isTopLevel: false,
					cascaderData: {
						companies: [],
						selectedCompany: null,
						selectedDept: null,
					},
				},
				datePickerShow: false,
				datePickerParams: {
					year: true,
					month: true,
					day: true
				},
				dateRange: 0,
				currentDateField: null,
				timePickerShow: false,
				timePickerParams: {
					hour: true,
					minute: true,
					second: false
				},
				currentTimeField: null,
				subDatePickerShow: {},
				subDatePickerParams: {
					year: true,
					month: true,
					day: true
				},
				currentSubDateInfo: {
					fieldName: '',
					itemIndex: -1,
					subField: null
				},
				subDateTimePickerShow: {},
				subDateTimePickerParams: {
					year: true,
					month: true,
					day: true,
					hour: true,
					minute: true,
					second: false
				},
				currentSubDateTimeInfo: {
					fieldName: '',
					itemIndex: -1,
					subField: null
				},
				subTimePickerShow: {},
				subTimePickerParams: {
					hour: true,
					minute: true,
					second: false
				},
				currentSubTimeInfo: {
					fieldName: '',
					itemIndex: -1,
					subField: null,
					range: ''
				},
				saveLoadingLocal: false,
				submitLoadingLocal: false,
				simulateLoadingLocal: false,
				fileDir: 'oa'
			}
		},
		computed: {
			watchHandlerMap() {
				return {
					watchEmployeeChange: (arrayItem, empData) => {
						const emp = empData.raw || empData;
						this.$set(arrayItem, 'employee_name', emp.employee_name || '');
						this.$set(arrayItem, 'current_company_id', (emp.companys && emp.companys.company_id) || '');
						this.$set(arrayItem, 'current_company_name', (emp.companys && emp.companys.company_name) ||
							'');
						this.$set(arrayItem, 'current_department_id', (emp.departments && emp.departments
							.department_id) || '');
						this.$set(arrayItem, 'current_department_name', (emp.departments && emp.departments
							.department_name) || '');
						this.$set(arrayItem, 'current_position_id', (emp.positions && emp.positions.position_id) ||
							'');
						this.$set(arrayItem, 'current_position_name', (emp.positions && emp.positions.position_name) ||
							'');
					},
					watchHandoverEmployeeChange: (arrayItem, empData) => {
						const emp = empData.raw || empData;
						this.$set(arrayItem, 'handover_person_name', emp.employee_name || '');
					},
					// 加班单选择回调（改为分钟）
					onOvertimeSelected: (arrayItem, overtimeData) => {
						const over = overtimeData.raw || overtimeData;
						this.$set(arrayItem, 'remaining_minutes', (over && over.remaining_minutes) || 0);
					}
				}
			}
		},
		watch: {
			formSchema: {
				immediate: true,
				deep: true,
				handler: 'initForm'
			},
			initialData: {
				immediate: true,
				deep: true,
				handler: 'handleInitialData'
			},
			saveLoading(val) {
				this.saveLoadingLocal = val;
			},
			submitLoading(val) {
				this.submitLoadingLocal = val;
			},
			simulateLoading(val) {
				this.simulateLoadingLocal = val;
			},
			value(newVal) {
				if (newVal && this.formSchema) this.$nextTick(() => this.initForm());
			},
		},
		methods: {
			async loadRemoteDefaultLabels() {
				const remoteFields = this.formSchema.fields.filter(f =>
					this.isSelectField(f) && f.action && this.formData[f.name] && this.formData[f.name] !== ''
				);
				for (const field of remoteFields) {
					const value = this.formData[field.name];
					try {
						const res = await vk.callFunction({
							url: field.action,
							data: {
								pageSize: 200,
								...(field.actionData || {})
							}
						});
						if (res.code === 0) {
							const rows = res.rows || res.data || [];
							const valueKey = (field.props && field.props.value) || 'value';
							const labelKey = (field.props && field.props.label) || 'label';
							const matched = rows.find(item => item[valueKey] == value);
							if (matched) {
								const displayKey = this.getDisplayKeyForField(field);
								const label = matched[labelKey] || matched.name || matched.title || '';
								this.$set(this.formData, displayKey, label);
							}
						}
					} catch (e) {
						console.error(`加载字段 ${field.name} 默认标签失败`, e);
					}
				}
			},
			isSelectField(field) {
				const types = ['select', 'remote-select', 'table-select', 'cascader'];
				return types.includes(field.type) || !!field.displayNameKey;
			},
			isSubSelectField(subField) {
				const types = ['select', 'remote-select', 'table-select', 'cascader'];
				return types.includes(subField.type) || !!subField.displayNameKey;
			},
			showTopSelectPicker(field) {
				this.subRemote = {
					keyword: '',
					currentField: field,
					selectedValue: this.formData[field.name] || '',
					arrayFieldName: '',
					itemIndex: -1,
					options: [],
					loading: false,
					pageIndex: 1,
					pageSize: 20,
					total: 0,
					mode: field.type === 'cascader' ? 'cascader' : 'single',
					isTopLevel: true,
					cascaderData: {
						companies: [],
						selectedCompany: null,
						selectedDept: null
					},
				};

				if (field.options && Array.isArray(field.options)) {
					const valueKey = field.valueName || 'value';
					const labelKey = field.labelName || 'label';
					this.subRemote.options = field.options.map(opt => ({
						value: (opt[valueKey] !== undefined && opt[valueKey] !== null) ? opt[valueKey] : opt
							.value,
						label: (opt[labelKey] !== undefined && opt[labelKey] !== null) ? opt[labelKey] : opt
							.label,
						raw: opt,
					}));
					this.subRemote.total = this.subRemote.options.length;
					this.subRemoteSelectVisible = true;
					return;
				}

				if (field.action) {
					this.fetchSubRemoteOptions();
					this.subRemoteSelectVisible = true;
				} else {
					uni.showToast({
						title: '无数据源',
						icon: 'none'
					});
				}
			},
			showSubRemoteSelect(subField, arrayFieldName, itemIndex) {
				const isCascader = subField.type === 'cascader';
				const arrayItem = this.formData[arrayFieldName][itemIndex];
				this.subRemote = {
					keyword: '',
					currentField: subField,
					arrayFieldName,
					itemIndex,
					options: [],
					loading: false,
					selectedValue: isCascader ? null : (arrayItem[subField.key] || ''),
					pageIndex: 1,
					pageSize: 20,
					total: 0,
					mode: isCascader ? 'cascader' : 'single',
					isTopLevel: false,
					cascaderData: {
						companies: [],
						selectedCompany: null,
						selectedDept: null,
					},
				};
				this.subRemoteSelectVisible = true;
				if (isCascader) {
					this.fetchCascaderData();
				} else {
					this.fetchSubRemoteOptions();
				}
			},
			async fetchSubRemoteOptions() {
				const {
					currentField
				} = this.subRemote;
				if (!currentField || !currentField.action) return;
				this.subRemote.loading = true;
				try {
					const params = {
						pageIndex: this.subRemote.pageIndex,
						pageSize: this.subRemote.pageSize,
					};
					if (this.subRemote.keyword) params.keyword = this.subRemote.keyword;
					if (currentField.actionData) {
						Object.assign(params, currentField.actionData);
					}
					const res = await vk.callFunction({
						url: currentField.action,
						data: params
					});
					if (res.code === 0) {
						const rows = res.rows || res.data || [];
						const valueKey = (currentField.props && currentField.props.value) || 'value';
						const labelKey = (currentField.props && currentField.props.label) || 'label';
						this.subRemote.options = rows.map((item) => ({
							value: (item[valueKey] !== undefined && item[valueKey] !== null) ? item[
								valueKey] : (item.employee_id !== undefined && item.employee_id !==
								null) ? item.employee_id : (item.department_id !== undefined && item
								.department_id !== null) ? item.department_id : (item.position_id !==
								undefined && item.position_id !== null) ? item.position_id : (item
								._id !== undefined && item._id !== null) ? item._id : item.value,
							label: (item[labelKey] !== undefined && item[labelKey] !== null) ? item[
									labelKey] : (item.name !== undefined && item.name !== null) ? item
								.name : (item.employee_name !== undefined && item.employee_name !== null) ?
								item.employee_name : (item.department_name !== undefined && item
									.department_name !== null) ? item.department_name : (item
									.position_name !== undefined && item.position_name !== null) ? item
								.position_name : (item.title !== undefined && item.title !== null) ? item
								.title : item.label,
							raw: item,
						}));
						this.subRemote.total = res.total || 0;
					}
				} catch (e) {
					console.error('获取远程选项失败', e);
				} finally {
					this.subRemote.loading = false;
				}
			},
			async fetchCascaderData() {
				this.subRemote.loading = true;
				try {
					const action = this.subRemote.currentField.action;
					const res = await vk.callFunction({
						url: action,
						data: {
							pageSize: 500
						}
					});
					if (res.code === 0) {
						const companies = (res.rows || []).map((company) => ({
							value: company.department_id || company.company_id,
							label: company.department_name || company.company_name,
							children: (company.children || []).map((dept) => ({
								value: dept.department_id,
								label: dept.department_name,
							})),
						}));
						this.subRemote.cascaderData.companies = companies;
					}
				} catch (e) {
					console.error('获取级联数据失败', e);
				} finally {
					this.subRemote.loading = false;
				}
			},
			selectCascaderCompany(company) {
				this.subRemote.cascaderData.selectedCompany = company;
				this.subRemote.cascaderData.selectedDept = null;
			},
			selectCascaderDept(dept) {
				this.subRemote.cascaderData.selectedDept = dept;
				const {
					arrayFieldName,
					itemIndex,
					currentField,
					isTopLevel
				} = this.subRemote;
				if (isTopLevel) {
					const company = this.subRemote.cascaderData.selectedCompany;
					this.$set(this.formData, currentField.name, [company.value, dept.value]);
					const displayKey = this.getDisplayKeyForField(currentField);
					this.$set(this.formData, displayKey, company.label + ' / ' + dept.label);
				} else {
					const arrayItem = this.formData[arrayFieldName][itemIndex];
					const company = this.subRemote.cascaderData.selectedCompany;
					this.$set(arrayItem, currentField.key, [company.value, dept.value]);
					if (currentField.displayNameKey) {
						this.$set(arrayItem, currentField.displayNameKey, company.label + ' / ' + dept.label);
					}
					this.$set(arrayItem, 'new_company_id', company.value);
					this.$set(arrayItem, 'new_company_name', company.label);
					this.$set(arrayItem, 'new_department_id', dept.value);
					this.$set(arrayItem, 'new_department_name', dept.label);
				}
				this.subRemoteSelectVisible = false;
			},
			onSubRemoteSearch() {
				this.subRemote.pageIndex = 1;
				this.fetchSubRemoteOptions();
			},
			selectSubRemoteItem(item) {
				const {
					arrayFieldName,
					itemIndex,
					currentField,
					isTopLevel
				} = this.subRemote;
				const raw = item.raw || item;
				if (isTopLevel) {
					this.$set(this.formData, currentField.name, item.value);
					const displayKey = this.getDisplayKeyForField(currentField);
					this.$set(this.formData, displayKey, item.label || raw[currentField.displayNameKey] || '');
				} else {
					const arrayItem = this.formData[arrayFieldName][itemIndex];
					this.$set(arrayItem, currentField.key, item.value);
					if (currentField.displayNameKey) {
						this.$set(arrayItem, currentField.displayNameKey, item.label || raw[currentField
							.displayNameKey] || '');
					} else {
						this.$set(arrayItem, currentField.key + '_label', item.label);
					}
					if (currentField.watch && this.watchHandlerMap[currentField.watch]) {
						this.watchHandlerMap[currentField.watch](arrayItem, item);
					}
				}
				this.subRemoteSelectVisible = false;
			},
			isItemBatchDisabled(item, subFieldKey) {
				return this.formTypeCode === 'LEAVE_APPLICATION' && item.batchGenerated === true;
			},
			getDisplayKeyForField(field) {
				return field.displayNameKey || (field.name + '_label');
			},
			getDisplayKey(field) {
				return field.displayNameKey || field.key + '_label';
			},
			openBatchDatePicker(field) {
				this.currentBatchField = field;
				this.showBatchDatePicker = true;
			},
			onBatchDatePickerShow(type) {
				this.batchPickerType = type;
				this.batchPickerShow = true;
			},
			onBatchDateConfirm(e) {
				const dateStr = `${e.year}-${e.month}-${e.day}`;
				if (this.batchPickerType === 'start') {
					this.batchStartDate = dateStr;
				} else {
					this.batchEndDate = dateStr;
				}
				this.batchPickerShow = false;
			},
			generateBatchDates() {
				if (!this.batchStartDate || !this.batchEndDate) {
					uni.showToast({
						title: '请选择起止日期',
						icon: 'none'
					});
					return;
				}
				const start = new Date(this.batchStartDate.replace(/-/g, '/'));
				const end = new Date(this.batchEndDate.replace(/-/g, '/'));
				if (end < start) {
					uni.showToast({
						title: '结束日期不能早于开始日期',
						icon: 'none'
					});
					return;
				}

				this.clearArray('items');

				const startItem = {
					leave_date: this.batchStartDate,
					morning_range: ['08:30', '12:00'],
					afternoon_range: ['13:30', '18:00'],
					batchGenerated: true
				};
				const endItem = {
					leave_date: this.batchEndDate,
					morning_range: ['08:30', '12:00'],
					afternoon_range: ['13:30', '18:00'],
					batchGenerated: true
				};

				if (!this.formData.items) this.$set(this.formData, 'items', []);
				this.formData.items.push(startItem, endItem);

				const diffTime = Math.abs(end - start);
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
				const totalMinutes = diffDays * 8 * 60; // 每天8小时=480分钟
				this.$set(this.formData, 'total_minutes', String(totalMinutes));

				this.showBatchDatePicker = false;
				uni.showToast({
					title: `已生成首尾明细，共 ${vk.myfn.formatMinutes(totalMinutes)}`,
					icon: 'success'
				});
			},
			filterNumberInput(rawValue) {
				let value = rawValue;
				let filtered = value.replace(/[^\d.]/g, '');
				const dotIndex = filtered.indexOf('.');
				if (dotIndex !== -1) {
					filtered = filtered.substring(0, dotIndex + 1) + filtered.substring(dotIndex + 1).replace(/\./g, '');
				}
				if (filtered.startsWith('.')) filtered = '0' + filtered;
				if (filtered.length > 1 && filtered[0] === '0' && filtered[1] !== '.') {
					filtered = filtered.replace(/^0+/, '') || '0';
				}
				if (filtered === '.') filtered = '0.';
				return filtered;
			},
			onNumberInput(fieldName, e) {
				let value = '';
				if (typeof e === 'string') {
					value = e;
				} else if (e && e.detail && e.detail.value !== undefined) {
					value = e.detail.value;
				} else if (e && e.target && e.target.value !== undefined) {
					value = e.target.value;
				}
				const filtered = this.filterNumberInput(value);
				this.$forceUpdate();
				this.$nextTick(() => {
					this.$set(this.formData, fieldName, filtered);
					this.calcAutoTotal();
				})
			},
			onArrayNumberInput(fieldName, itemIndex, subFieldKey, e) {
				let value = '';
				if (typeof e === 'string') {
					value = e;
				} else if (e && e.detail && e.detail.value !== undefined) {
					value = e.detail.value;
				} else if (e && e.target && e.target.value !== undefined) {
					value = e.target.value;
				}
				const filtered = this.filterNumberInput(value);
				this.$forceUpdate();
				this.$nextTick(() => {
					this.$set(this.formData[fieldName][itemIndex], subFieldKey, filtered);
					this.calcAutoTotal();
				})
			},
			timeToMinutes(timeStr) {
				if (!timeStr) return null;
				const [h, m] = timeStr.split(':').map(Number);
				return h * 60 + m;
			},
			checkArrayUniqueness(arr, columns, newItem) {
				for (const col of columns) {
					if (col.isUnique) {
						const key = col.key;
						const newValue = newItem[key];
						if (newValue === undefined || newValue === '' || newValue === null) continue;
						const exists = arr.some((item, idx) =>
							item !== newItem && String(item[key]) === String(newValue)
						);
						if (exists) {
							return col.title || col.key;
						}
					}
				}
				return false;
			},
			validateArrayUniqueness() {
				const arrayFields = this.formSchema.fields.filter(f => f.type === 'array<object>');
				for (const field of arrayFields) {
					const arr = this.formData[field.name] || [];
					const cols = field.columns || [];
					for (let i = 0; i < arr.length; i++) {
						const conflict = this.checkArrayUniqueness(
							arr.filter((_, idx) => idx !== i), cols, arr[i]
						);
						if (conflict) {
							uni.showToast({
								title: `"${conflict}"存在重复`,
								icon: 'none'
							});
							return false;
						}
					}
				}
				return true;
			},
			validateTimeRanges() {
				const arrayFields = this.formSchema.fields.filter(f => f.type === 'array<object>');
				for (const field of arrayFields) {
					const arr = this.formData[field.name] || [];
					for (let i = 0; i < arr.length; i++) {
						const item = arr[i];
						for (const col of field.columns) {
							if (col.type === 'time' && col.isRange) {
								const range = item[col.key];
								if (!Array.isArray(range)) continue;
								const [start, end] = range;
								if (!start || !end) continue;
								if (start >= end) {
									uni.showToast({
										title: `第${i+1}项"${col.title}"开始时间必须早于结束时间`,
										icon: 'none'
									});
									return false;
								}
								if (col.allowedRangeStart && col.allowedRangeEnd) {
									const startMins = this.timeToMinutes(start);
									const endMins = this.timeToMinutes(end);
									const minStart = this.timeToMinutes(col.allowedRangeStart);
									const maxEnd = this.timeToMinutes(col.allowedRangeEnd);
									if (startMins < minStart || endMins > maxEnd) {
										uni.showToast({
											title: `第${i+1}项"${col.title}"时间必须在 ${col.allowedRangeStart}-${col.allowedRangeEnd} 之间`,
											icon: 'none'
										});
										return false;
									}
								}
							}
						}
					}
				}
				return true;
			},
			validateArrayItemsRequired() {
				const arrayFields = this.formSchema.fields.filter(f => f.type === 'array<object>');
				for (const field of arrayFields) {
					const arr = this.formData[field.name] || [];
					if (field.required && arr.length === 0) {
						uni.showToast({
							title: `${field.label}至少需要一条明细`,
							icon: 'none'
						});
						return false;
					}
					for (let i = 0; i < arr.length; i++) {
						const item = arr[i];
						if (!field.columns) continue;
						for (const col of field.columns) {
							if (col.required) {
								const value = item[col.key];
								if (col.type === 'time' && col.isRange) {
									if (!Array.isArray(value) || value.length !== 2 || !value[0] || !value[1]) {
										uni.showToast({
											title: `第${i+1}项"${col.title}"为必填，请完善`,
											icon: 'none'
										});
										return false;
									}
								} else {
									if (value === undefined || value === null || value === '') {
										uni.showToast({
											title: `第${i+1}项"${col.title}"为必填`,
											icon: 'none'
										});
										return false;
									}
								}
							}
						}
					}
				}
				return true;
			},
			validateNumberLimits() {
				const topFields = this.formSchema.fields.filter(f => f.type === 'number');
				for (const field of topFields) {
					const val = parseFloat(this.formData[field.name]);
					if (isNaN(val)) continue;
					if (field.min !== undefined && val < field.min) {
						uni.showToast({
							title: `"${field.label}"不能小于${field.min}`,
							icon: 'none'
						});
						return false;
					}
					if (field.max !== undefined && val > field.max) {
						uni.showToast({
							title: `"${field.label}"不能大于${field.max}`,
							icon: 'none'
						});
						return false;
					}
				}
				const arrayFields = this.formSchema.fields.filter(f => f.type === 'array<object>');
				for (const field of arrayFields) {
					const arr = this.formData[field.name] || [];
					for (let i = 0; i < arr.length; i++) {
						const item = arr[i];
						if (!field.columns) continue;
						for (const col of field.columns) {
							if (col.type === 'number') {
								const val = parseFloat(item[col.key]);
								if (isNaN(val)) continue;
								if (col.min !== undefined && val < col.min) {
									uni.showToast({
										title: `第${i+1}项"${col.title}"不能小于${col.min}`,
										icon: 'none'
									});
									return false;
								}
								if (col.maxFromField) {
									const maxVal = parseFloat(item[col.maxFromField]);
									if (!isNaN(maxVal) && val > maxVal) {
										uni.showToast({
											title: `第${i+1}项"${col.title}"不能超过${maxVal}`,
											icon: 'none'
										});
										return false;
									}
								}
							}
						}
					}
				}
				return true;
			},
			initForm() {
				if (!this.formSchema || !this.formSchema.fields) return;
				this.initFormData();
				this.initFormRules();
				this.initFormLayout();
				this.formFields = this.formSchema.fields;
				this.$nextTick(() => {
					this.loadRemoteDefaultLabels();
				});
			},
			initFormData() {
				if (!this.formSchema || !this.formSchema.fields) return;
				const formData = {};
				this.formSchema.fields.forEach((field) => {
					if (field.type === 'file' || field.type === 'array<object>') {
						formData[field.name] = [];
					} else if (field.type === 'time' && field.isRange) {
						formData[field.name] = ['', ''];
					} else {
						formData[field.name] = (field.defaultValue !== undefined && field.defaultValue !== null) ?
							field.defaultValue :
							'';
					}
					if (this.isSelectField(field)) {
						const displayKey = this.getDisplayKeyForField(field);
						if (!(displayKey in formData)) {
							formData[displayKey] = '';
						}
					}
				});
				if (this.initialData && this.initialData.form_data) {
					Object.assign(formData, this.initialData.form_data);
				}
				this.formData = formData;
				this.initSelectShow();
				this.syncSelectLabels();
				this.$nextTick(() => this.calcAutoTotal());
			},
			initSelectShow() {
				const show = {};
				this.formSchema.fields.forEach((field) => {
					if (field.type === 'select') show[field.name] = false;
				});
				this.selectShow = show;
			},
			initFormRules() {
				if (!this.formSchema || !this.formSchema.fields) return;
				const rules = {};
				this.formSchema.fields.forEach((field) => {
					const fieldRules = [];
					if (field.required) {
						if (field.type === 'file' || field.type === 'array<object>') {
							fieldRules.push({
								validator: (rule, value, callback) => {
									if (!value || (Array.isArray(value) && value.length === 0)) {
										return new Error(`${field.label}是必填项`);
									}
									return true;
								},
								trigger: ['change', 'blur'],
							});
						} else if (field.type === 'number') {
							fieldRules.push({
								validator: (rule, value, callback) => {
									if (value === undefined || value === null || value === '') {
										return new Error(`${field.label}是必填项`);
									}
									return true;
								},
								trigger: ['blur', 'change'],
							});
						} else {
							fieldRules.push({
								required: true,
								message: `${field.label}是必填项`,
								trigger: ['blur', 'change'],
							});
						}
					}
					if (fieldRules.length > 0) rules[field.name] = fieldRules;
				});
				this.formRules = rules;
				this.$nextTick(() => {
					if (this.$refs.uForm) this.$refs.uForm.setRules(this.formRules);
				});
			},
			initFormLayout() {
				if (this.formSchema && this.formSchema.layout && this.formSchema.layout.groups) {
					this.formLayoutGroups = this.formSchema.layout.groups;
				} else {
					this.formLayoutGroups = [{
						title: '',
						fields: (this.formSchema && this.formSchema.fields) ? this.formSchema.fields.map((f) => f
							.name) : []
					}];
				}
			},
			getGroupFields(group) {
				if (!group.fields || !this.formSchema || !this.formSchema.fields) return [];
				return this.formSchema.fields.filter((f) => group.fields.includes(f.name));
			},
			syncSelectLabels() {
				if (!this.formSchema || !this.formSchema.fields) return;
				this.formSchema.fields.forEach(field => {
					if (this.isSelectField(field) && field.options) {
						const value = this.formData[field.name];
						const displayKey = this.getDisplayKeyForField(field);
						if (value != null && value !== '' && !this.formData[displayKey]) {
							const option = field.options.find(o => o.value == value);
							if (option) {
								this.$set(this.formData, displayKey, option.label);
							}
						}
					}
				});
			},
			normalizeArrayFields() {
				if (!this.formSchema) return;
				const arrayFields = this.formSchema.fields.filter(f => f.type === 'array<object>');
				arrayFields.forEach(field => {
					const arr = this.formData[field.name];
					if (!Array.isArray(arr)) return;
					const columns = field.columns || [];
					arr.forEach(item => {
						columns.forEach(col => {
							if (col.type === 'time' && col.isRange) {
								if (!Array.isArray(item[col.key]) || item[col.key].length !== 2) {
									this.$set(item, col.key, ['', '']);
								}
							}
						});
					});
				});
			},
			handleInitialData(initialData) {
				if (initialData && initialData.form_data) {
					Object.assign(this.formData, initialData.form_data);
					this.syncSelectLabels();
					this.normalizeArrayFields();
					this.$nextTick(() => this.calcAutoTotal());
				}
			},
			showDatePicker(field) {
				this.currentDateField = field.name;
				this.dateRange = field.day || 0;
				this.datePickerShow = true;
			},
			onDateConfirm(e) {
				if (this.currentDateField && e) {
					const {
						year,
						month,
						day
					} = e;
					const dateStr = `${year}-${month}-${day}`;
					if (this.dateRange > 0) {
						const selected = new Date(year, month - 1, day);
						const now = new Date();
						const before = new Date(now.getTime() - this.dateRange * 24 * 3600 * 1000);
						if (selected < before || selected > now) {
							uni.showToast({
								title: `只能选择最近${this.dateRange}天的日期`,
								icon: 'none'
							});
							return;
						}
					}
					this.formData[this.currentDateField] = dateStr;
				}
			},
			showTimePicker(fieldName) {
				this.currentTimeField = fieldName;
				this.timePickerShow = true;
			},
			onTimeConfirm(e) {
				if (this.currentTimeField && e) {
					const h = e.hour.toString().padStart(2, '0');
					const m = e.minute.toString().padStart(2, '0');
					this.formData[this.currentTimeField] = `${h}:${m}`;
					this.calcAutoTotal();
				}
				this.timePickerShow = false;
			},
			showSubDatePicker(fieldName, itemIndex, subField) {
				this.currentSubDateInfo = {
					fieldName,
					itemIndex,
					subField
				};
				const key = `${fieldName}_${itemIndex}_${subField.key}`;
				this.$set(this.subDatePickerShow, key, true);
			},
			onSubDateConfirm(e) {
				const {
					fieldName,
					itemIndex,
					subField
				} = this.currentSubDateInfo;
				if (!fieldName) return;
				const item = this.formData[fieldName][itemIndex];
				const dateStr = `${e.year}-${e.month}-${e.day}`;
				this.$set(item, subField.key, dateStr);
				this.subDatePickerShow[`${fieldName}_${itemIndex}_${subField.key}`] = false;
				this.calcAutoTotal();
			},
			showSubDateTimePicker(fieldName, itemIndex, subField) {
				this.currentSubDateTimeInfo = {
					fieldName,
					itemIndex,
					subField
				};
				const key = `${fieldName}_${itemIndex}_${subField.key}`;
				this.$set(this.subDateTimePickerShow, key, true);
			},
			onSubDateTimeConfirm(e) {
				const {
					fieldName,
					itemIndex,
					subField
				} = this.currentSubDateTimeInfo;
				if (!fieldName) return;
				const item = this.formData[fieldName][itemIndex];
				const dateStr = `${e.year}-${e.month}-${e.day} ${e.hour}:${e.minute}`;
				this.$set(item, subField.key, dateStr);
				this.subDateTimePickerShow[`${fieldName}_${itemIndex}_${subField.key}`] = false;
				this.calcAutoTotal();
			},
			showSubTimePicker(fieldName, itemIndex, subField, range) {
				this.currentSubTimeInfo = {
					fieldName,
					itemIndex,
					subField,
					range
				};
				const key = `${fieldName}_${itemIndex}_${subField.key}_${range}`;
				this.$set(this.subTimePickerShow, key, true);
			},
			onSubTimeConfirm(e) {
				const {
					fieldName,
					itemIndex,
					subField,
					range
				} = this.currentSubTimeInfo;
				if (!fieldName) return;
				const item = this.formData[fieldName][itemIndex];
				const timeStr = `${e.hour}:${e.minute}`;
				const idx = range === 'start' ? 0 : 1;
				if (!Array.isArray(item[subField.key])) {
					this.$set(item, subField.key, ['', '']);
				}
				this.$set(item[subField.key], idx, timeStr);
				this.subTimePickerShow[`${fieldName}_${itemIndex}_${subField.key}_${range}`] = false;
				this.calcAutoTotal();
			},
			// ========== 自动计算总时长（统一为分钟） ==========
			calcAutoTotal() {
				const type = this.formTypeCode;
				const formData = this.formData;
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

			getFileMediaType(accept) {
				if (!accept) return 'all';
				if (accept.includes('image')) return 'image';
				if (accept.includes('video')) return 'video';
				return 'all';
			},

			async onFileSelect(e, fieldName) {
				if (!e.tempFilePaths || e.tempFilePaths.length === 0) return;
				try {
					uni.showLoading({
						title: '上传中...',
						mask: true
					});
					for (let i = 0; i < e.tempFilePaths.length; i++) {
						const tempFilePath = e.tempFilePaths[i];
						const fileInfo = e.tempFiles[i] || {};
						const fileName = fileInfo.name || this.getFileNameFromPath(tempFilePath);
						const fileSize = fileInfo.size || 0;
						const timestamp = Date.now();
						const random = Math.floor(Math.random() * 10000);
						const ext = fileName.split('.').pop() || 'file';
						const cloudPath = `public/${this.fileDir}/${timestamp}_${random}.${ext}`;

						const uploadOptionsRes = await vk.callFunction({
							url: 'common/pub/getUploadFileOptions/index',
							data: {
								cloudPath: cloudPath
							}
						});

						if (uploadOptionsRes.code !== 0) {
							throw new Error(uploadOptionsRes.msg || '获取上传参数失败');
						}

						const uploadOptions = uploadOptionsRes.rows;

						await new Promise((resolve, reject) => {
							uni.uploadFile({
								...uploadOptions.uploadFileOptions,
								filePath: tempFilePath,
								name: 'file',
								success: (res) => {
									if (res.statusCode === 200) resolve(res);
									else reject(new Error(`上传失败: ${res.statusCode}`));
								},
								fail: reject
							});
						});

						const fileUrl = `https://tdhstorage.cntdh.net/${cloudPath}`;

						if (!this.formData[fieldName]) {
							this.$set(this.formData, fieldName, []);
						}

						this.formData[fieldName].push({
							name: fileName,
							size: fileSize,
							url: fileUrl,
							fileID: cloudPath,
							path: fileUrl,
							cloudPath: cloudPath,
							ext: ext
						});
					}
					uni.hideLoading();
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					});
				} catch (error) {
					uni.hideLoading();
					console.error('文件上传失败:', error);
					uni.showToast({
						title: '上传失败: ' + (error.message || '未知错误'),
						icon: 'none'
					});
				}
			},

			getFileNameFromPath(filePath) {
				if (!filePath) return '未命名文件';
				const parts = filePath.split('/');
				return parts[parts.length - 1];
			},
			onFileUploadSuccess(e, fieldName) {
				console.log('文件上传成功回调:', e);
			},
			onFileUploadFail(err) {
				console.error('文件上传失败:', err);
				uni.showToast({
					title: '上传失败',
					icon: 'none'
				});
			},
			onFilePickerInput(val, fieldName) {
				if (Array.isArray(val) && val.length > 0) {
					const hasTempPath = val.some(file =>
						file.url && file.url.startsWith('http://tmp/')
					);
					if (hasTempPath) return;
				}
				this.$set(this.formData, fieldName, val);
			},
			async onFileDelete(e, fieldName) {
				try {
					const fileInfo = this.formData[fieldName][e.index];
					if (fileInfo.cloudPath || fileInfo.fileID) {
						const cloudPath = fileInfo.cloudPath || fileInfo.fileID;
						await vk.myfn.deleteFile(fileInfo);
					}
					this.formData[fieldName].splice(e.index, 1);
					uni.showToast({
						title: '删除成功',
							icon: 'success'
					});
				} catch (error) {
					console.error('删除文件失败:', error);
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					});
				}
			},
			handleFilePreview(file, fieldName) {
				this.$emit('preview-file', {
					url: file.url,
					name: this.getFileName(file),
					size: file.size,
					type: file.mimetype || this.getFileTypeFromName(file),
				});
			},
			downloadFile(file) {
				this.$emit('download-file', file);
			},
			getFileName(file) {
				if (file.name) return file.name;
				if (file.url) {
					const clean = file.url.split(/[?#]/)[0];
					return clean.split('/').pop() || '未命名文件';
				}
				return '未命名文件';
			},
			getFileTypeFromName(file) {
				const name = this.getFileName(file);
				const ext = name.split('.').pop().toLowerCase();
				const map = {
					jpg: 'image',
					jpeg: 'image',
					png: 'image',
					gif: 'image',
					bmp: 'image',
					pdf: 'pdf'
				};
				return map[ext] || 'unknown';
			},
			formatFileSize(bytes) {
				if (!bytes) return '0 B';
				const k = 1024;
				const sizes = ['B', 'KB', 'MB', 'GB'];
				const i = Math.floor(Math.log(bytes) / Math.log(k));
				return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
			},
			addArrayItem(field) {
				if (!this.formData[field.name]) this.$set(this.formData, field.name, []);
				const item = {};
				if (field.columns) {
					field.columns.forEach((sub) => {
						if (sub.type === 'time' && sub.isRange) {
							item[sub.key] = ['', ''];
						} else {
							item[sub.key] = sub.defaultValue !== undefined ? sub.defaultValue : '';
						}
						if (sub.displayNameKey) item[sub.displayNameKey] = '';
					});
				}
				const conflict = this.checkArrayUniqueness(
					this.formData[field.name], field.columns, item
				);
				if (conflict) {
					uni.showToast({
						title: `"${conflict}"不能重复添加`,
						icon: 'none'
					});
					return;
				}
				this.formData[field.name].push(item);
				this.calcAutoTotal();
			},
			removeArrayItem(fieldName, index) {
				if (this.formData[fieldName]) {
					this.formData[fieldName].splice(index, 1);
				}
				this.calcAutoTotal();
			},
			moveArrayItem(fieldName, index, direction) {
				const arr = this.formData[fieldName];
				if (!arr || arr.length <= 1) return;
				const newIndex = index + direction;
				if (newIndex < 0 || newIndex >= arr.length) return;
				[arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
			},
			clearArray(fieldName) {
				this.formData[fieldName] = [];
				this.calcAutoTotal();
			},
			async handleSave(status) {
				try {
					this.saveLoadingLocal = true;
					const valid = await this.$refs.uForm.validate();
					if (!valid) return;
					if (!this.validateArrayUniqueness()) return;
					if (!this.validateTimeRanges()) return;
					if (!this.validateArrayItemsRequired()) return;
					if (!this.validateNumberLimits()) return;
					const data = this.processFormData();
					if (status) data.status = status;
					this.$emit('save', data);
				} catch (e) {
					uni.showToast({
						title: '请完善表单信息',
						icon: 'none'
					});
				} finally {
					this.saveLoadingLocal = false;
				}
			},
			async handleSubmit() {
				try {
					const valid = await this.$refs.uForm.validate();
					if (!valid) return;
					if (!this.validateArrayUniqueness()) return;
					if (!this.validateTimeRanges()) return;
					if (!this.validateArrayItemsRequired()) return;
					if (!this.validateNumberLimits()) return;
					this.submitLoadingLocal = true;
					const data = this.processFormData();
					data.status = 'pending';
					this.$emit('submit', data);
				} catch (e) {
					uni.showToast({
						title: '请完善表单信息',
						icon: 'none'
					});
				} finally {
					this.submitLoadingLocal = false;
				}
			},
			async handleSimulate() {
				try {
					const valid = await this.$refs.uForm.validate();
					if (!valid) return;
					if (!this.validateArrayUniqueness()) return;
					if (!this.validateTimeRanges()) return;
					if (!this.validateArrayItemsRequired()) return;
					if (!this.validateNumberLimits()) return;
					this.simulateLoadingLocal = true;
					const data = this.processFormData();
					this.$emit('simulate', data);
				} catch (e) {
					uni.showToast({
						title: '请完善表单信息',
						icon: 'none'
					});
				} finally {
					this.simulateLoadingLocal = false;
				}
			},
			handleCancel() {
				this.$emit('cancel');
				this.$emit('input', false);
			},
			processFormData() {
				const clonedData = JSON.parse(JSON.stringify(this.formData));
				this.formSchema.fields.forEach(field => {
					if (field.type === 'number') {
						const val = clonedData[field.name];
						if (val !== undefined && val !== null && val !== '') {
							clonedData[field.name] = Number(val);
						}
					}
				});
				const arrayFields = this.formSchema.fields.filter(f => f.type === 'array<object>');
				arrayFields.forEach(field => {
					const arr = clonedData[field.name];
					if (Array.isArray(arr)) {
						arr.forEach(item => {
							(field.columns || []).forEach(col => {
								if (col.type === 'number') {
									const val = item[col.key];
									if (val !== undefined && val !== null && val !== '') {
										item[col.key] = Number(val);
									}
								}
							});
						});
					}
				});
				if (clonedData.items && Array.isArray(clonedData.items) && this.formTypeCode == 'TRANSFER_APPLY') {
					const allowedKeys = [
						'employee_id', 'employee_name',
						'current_company_id', 'current_company_name',
						'current_department_id', 'current_department_name',
						'current_position_id', 'current_position_name',
						'new_company_department', 'new_company_id', 'new_company_name',
						'new_department_id', 'new_department_name',
						'new_position_id', 'new_position_name',
						'remarks'
					];
					clonedData.items = clonedData.items.map(item => {
						const clean = {};
						allowedKeys.forEach(key => {
							if (item.hasOwnProperty(key)) clean[key] = item[key];
						});
						return clean;
					});
				}
				return {
					form_type_code: this.formTypeCode,
					form_data: clonedData,
				};
			}
		}
	};
</script>

<style lang="scss" scoped>
	/* 样式保持不变 */
	.dynamic-form-wrapper {
		.form-container {
			padding: 30rpx;
		}

		.form-group {
			margin-bottom: 40rpx;

			.group-title {
				font-size: 32rpx;
				font-weight: bold;
				margin-bottom: 20rpx;
				padding-bottom: 10rpx;
				border-bottom: 1px solid #e4e7ed;
				color: #303133;
			}
		}

		.form-buttons {
			display: flex;
			justify-content: center;
			flex-wrap: nowrap;
			gap: 20rpx;
			margin-top: 40rpx;
			padding-top: 20rpx;
			border-top: 1px solid #e4e7ed;

			.u-button {
				margin: 0;
				flex: 0 0 auto;
				min-width: 120rpx;
			}
		}

		.custom-form-item {
			margin-bottom: 30rpx;
		}

		.file-upload-container {
			.file-list {
				margin-top: 20rpx;

				.file-item {
					padding: 0;
					margin-bottom: 20rpx;
					background: #f8f9fa;
					border-radius: 8rpx;
					border: 1px solid #e4e7ed;
					overflow: hidden;

					.file-item-inner {
						display: flex;
						align-items: center;
						justify-content: space-between;
						padding: 20rpx;
					}

					.file-info {
						display: flex;
						align-items: center;

						.file-icon {
							color: #409eff;
							margin-right: 12rpx;
							font-size: 32rpx;
							flex-shrink: 0;
						}

						.file-name {
							width: 250rpx;
							flex: none;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							font-size: 28rpx;
							color: #303133;
						}

						.file-size {
							flex-shrink: 0;
							font-size: 24rpx;
							color: #909399;
							margin-left: 8rpx;
						}
					}

					.file-actions {
						display: flex;
						align-items: center;
						flex-shrink: 0;
						margin-left: 12rpx;

						.u-button {
							margin-left: 8rpx;
							white-space: nowrap;
							flex-shrink: 0;
						}
					}
				}
			}
		}

		.array-container {
			width: 100%;

			.array-actions {
				display: flex;
				justify-content: space-between;
				margin-bottom: 20rpx;
			}

			.array-cards {
				.array-card {
					background: #f9fafc;
					border-radius: 12rpx;
					padding: 20rpx;
					margin-bottom: 20rpx;
					border: 1rpx solid #eef0f4;

					.card-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 16rpx;
						padding-bottom: 12rpx;
						border-bottom: 1rpx dashed #ddd;

						.card-index {
							font-weight: 600;
						}

						.card-ops {
							display: flex;
							gap: 10rpx;
						}
					}

					.card-body {
						.sub-field {
							display: flex;
							align-items: center;
							margin-bottom: 16rpx;

							.sub-label {
								width: 210rpx;
								flex-shrink: 0;
								font-size: 26rpx;
								color: #555;
							}

							.u-input,
							.u-select {
								flex: 1;
							}

							.time-range {
								display: flex;
								align-items: center;
								gap: 8rpx;
								flex: 1;

								.range-separator {
									color: #999;
									margin: 0 8rpx;
								}

								.u-input {
									flex: 1;
								}
							}
						}
					}
				}
			}

			.array-empty {
				padding: 40rpx 0;
				text-align: center;
			}
		}

		.sub-remote-popup {
			padding: 30rpx;

			.popup-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 30rpx;

				.popup-title {
					font-size: 32rpx;
					font-weight: bold;
				}
			}

			.popup-search {
				margin-bottom: 20rpx;
			}

			.popup-list {
				max-height: 50vh;

				.popup-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 24rpx 0;
					border-bottom: 1rpx solid #f5f5f5;
					font-size: 28rpx;
				}

				.loading-tip,
				.empty-tip {
					text-align: center;
					padding: 30rpx;
					color: #999;
				}
			}
		}

		.cascader-layout {
			display: flex;
			height: 600rpx;
			border-top: 1px solid #f0f0f0;

			.cascader-col {
				width: 50%;
				display: flex;
				flex-direction: column;
				background: #fafafa;

				&:first-child {
					border-right: 1px solid #f0f0f0;
				}

				.col-title {
					padding: 24rpx 20rpx;
					font-size: 28rpx;
					font-weight: 600;
					color: #333;
					background: #fff;
					border-bottom: 1px solid #f0f0f0;
					text-align: center;
					flex-shrink: 0;
					position: sticky;
					top: 0;
					z-index: 10;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.col-list {
					flex: 1;
					height: 0;
					padding: 8rpx 0;
				}

				.col-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 20rpx 16rpx;
					margin: 0 12rpx 8rpx;
					background: #fff;
					border-radius: 12rpx;
					transition: all 0.2s;

					&:active {
						background: #f0f8ff;
					}

					&.active {
						background: #e6f7ff;

						.item-text {
							color: #2979ff;
							font-weight: 600;
						}
					}

					.item-text {
						font-size: 26rpx;
						color: #333;
						flex: 1;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}

				.empty-tip {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 200rpx;
					color: #999;
					font-size: 28rpx;
				}
			}
		}

		.batch-date-picker {
			padding: 30rpx;

			.picker-header {
				text-align: center;
				font-weight: bold;
				font-size: 32rpx;
				margin-bottom: 40rpx;
			}

			.picker-subheader {
				text-align: center;
				font-size: 26rpx;
				margin-bottom: 40rpx;
			}

			.picker-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 30rpx;
				font-size: 28rpx;

				>text {
					width: 150rpx;
				}

				>.u-input {
					flex: 1;
				}
			}

			.picker-actions {
				display: flex;
				justify-content: space-around;
				margin-top: 40rpx;
			}
		}
	}
</style>