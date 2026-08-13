<template>
	<view class="dynamic-form-wrapper">
		<!-- 表单内容 -->
		<view class="form-container">
			<u-form ref="uForm" :model="formData" :rules="formRules" label-position="top" label-width="150"
				:label-style="{fontSize: '28rpx'}" :error-type="['toast']">
				<template v-for="(group, groupIndex) in formLayoutGroups" :key="groupIndex">
					<view class="form-group">
						<view class="group-title" v-if="group.title">{{ group.title }}</view>

						<template v-for="field in getGroupFields(group)" :key="field.name">
							<!-- 文本输入 -->
							<u-form-item v-if="field.type === 'text'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item">
								<u-input v-model="formData[field.name]" :placeholder="field.placeholder || '请输入'"
									:disabled="field.disabled" :type="field.inputType || 'text'"
									:maxlength="field.maxLength" :clearable="true" />
							</u-form-item>

							<!-- 数字输入 -->
							<u-form-item v-else-if="field.type === 'number'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item">
								<u-input v-model="formData[field.name]" :placeholder="field.placeholder || '请输入数字'"
									:disabled="field.disabled" type="number" :clearable="true" />
							</u-form-item>

							<!-- 下拉选择 -->
							<u-form-item v-else-if="field.type === 'select'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item">
								<u-select v-model="selectShow[field.name]" :list="field.options || []"
									:value-name="field.valueName || 'value'" :label-name="field.labelName || 'label'"
									@confirm="(e) => onSelectConfirm(e, field.name)" />
								<u-input v-model="formData[field.name + '_label']"
									:placeholder="field.placeholder || '请选择'" :disabled="field.disabled"
									:clearable="true" @click="selectShow[field.name] = true" readonly />
								<u-input v-model="formData[field.name]" type="text" style="display: none;" />
							</u-form-item>

							<!-- 多行文本 -->
							<u-form-item v-else-if="field.type === 'textarea'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item textarea-form-item">
								<u-input v-model="formData[field.name]" :placeholder="field.placeholder || '请输入'"
									:disabled="field.disabled" type="textarea"
									:height="field.rows ? field.rows * 40 : 120" :maxlength="field.maxLength" />
							</u-form-item>

							<!-- 日期选择 -->
							<u-form-item v-else-if="field.type === 'date'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item">
								<u-input v-model="formData[field.name]" :placeholder="field.placeholder || '请选择日期'"
									:disabled="field.disabled" :clearable="true" @click="showDatePicker(field.name)"
									readonly />
							</u-form-item>

							<!-- 文件上传 -->
							<u-form-item v-else-if="field.type === 'file'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item file-form-item">
								<view class="file-upload-container">
									<uni-file-picker ref="fileUploadRef" :disabled="field.disabled"
										v-model="formData[field.name]" :limit="field.maxCount || 10" :del-icon="true"
										:auto-upload="true" :disable-preview="true"
										:file-mediatype="getFileMediaType(field.accept)"
										@select="(e) => onFileSelect(e, field.name)"
										@success="(e) => onFileUploadSuccess(e, field.name)" @fail="onFileUploadFail"
										@delete="(e) => onFileDelete(e, field.name)" </uni-file-picker>

										<!-- 文件列表展示 -->
										<view class="file-list">
											<view v-for="(file, index) in formData[field.name]" :key="index"
												class="file-item">
												<view class="file-info">
													<u-icon name="file-text" class="file-icon"></u-icon>
													<view class="file-name"
														@click="handleFilePreview(file, field.name)">
														{{ getFileName(file) }}
													</view>
													<view class="file-size" v-if="file.size">
														({{ formatFileSize(file.size) }})
													</view>
												</view>
												<view class="file-actions">
													<u-button type="text" size="mini"
														@click="handleFilePreview(file, field.name)">预览</u-button>
													<u-button type="text" size="mini"
														@click="downloadFile(file)">下载</u-button>
													<u-button type="text" size="mini" class="delete-btn"
														@click="removeFile(field.name, index)">
														删除
													</u-button>
												</view>
											</view>
										</view>
								</view>
							</u-form-item>

							<!-- 远程选择器 -->
							<u-form-item v-else-if="field.type === 'remote-select'" :label="field.label"
								:prop="field.name" :required="field.required" class="custom-form-item">
								<view @click="showRemoteSelect(field)">
									<u-input v-model="formData[field.name + '_label']"
										:placeholder="field.placeholder || '请选择'" :disabled="field.disabled"
										:clearable="true" readonly />
									<u-input v-model="formData[field.name]" type="text" style="display: none;" />
								</view>
							</u-form-item>

							<!-- 级联选择 -->
							<u-form-item v-else-if="field.type === 'cascader'" :label="field.label" :prop="field.name"
								:required="field.required" class="custom-form-item">
								<view @click="showCascader(field)">
									<u-input v-model="formData[field.name + '_label']"
										:placeholder="field.placeholder || '请选择'" :disabled="field.disabled"
										:clearable="true" readonly />
									<u-input v-model="formData[field.name]" type="text" style="display: none;" />
								</view>
							</u-form-item>

							<!-- 表格数组 -->
							<u-form-item v-else-if="field.type === 'array<object>'" :label="field.label"
								:prop="field.name" :required="field.required" class="custom-form-item array-form-item">
								<view class="array-table-container">
									<view class="array-table-header">
										<view class="table-actions">
											<u-button type="primary" size="mini" @click="addArrayItem(field)">
												添加
											</u-button>
											<u-button type="error" size="mini" @click="clearArray(field.name)"
												v-if="field.showClear !== false">
												清空
											</u-button>
										</view>
									</view>

									<view class="array-table-body"
										v-if="formData[field.name] && formData[field.name].length > 0">
										<view v-for="(item, index) in formData[field.name]" :key="index"
											class="array-table-row">
											<view class="row-header">
												<text class="row-index">第{{ index + 1 }}项</text>
												<view class="row-actions">
													<u-button type="text" size="mini"
														@click="removeArrayItem(field.name, index)">删除</u-button>
													<u-button type="text" size="mini"
														@click="moveArrayItem(field.name, index, -1)"
														v-if="field.showSort !== false && index > 0">上移</u-button>
													<u-button type="text" size="mini"
														@click="moveArrayItem(field.name, index, 1)"
														v-if="field.showSort !== false && index < formData[field.name].length - 1">下移</u-button>
												</view>
											</view>

											<view class="row-fields">
												<template v-for="subField in field.columns" :key="subField.key">
													<view class="sub-field"
														:style="{width: subField.width ? subField.width + 'rpx' : 'auto'}">
														<view class="sub-field-label">{{ subField.title }}</view>
														<view class="sub-field-input">
															<!-- 这里根据子字段类型渲染不同的输入组件 -->
															<template v-if="subField.type === 'text'">
																<u-input v-model="item[subField.key]"
																	:placeholder="subField.placeholder || '请输入'"
																	:disabled="subField.disabled" size="mini" />
															</template>
															<template v-else-if="subField.type === 'number'">
																<u-input v-model="item[subField.key]"
																	:placeholder="subField.placeholder || '请输入数字'"
																	:disabled="subField.disabled" type="number"
																	size="mini" />
															</template>
															<template v-else-if="subField.type === 'select'">
																<u-select
																	v-model="subSelectShow[field.name + '_' + subField.key + '_' + index]"
																	:list="subField.data || []" size="mini"
																	@confirm="(e) => onSubSelectConfirm(e, field.name, subField.key, index)" />
																<u-input v-model="item[subField.key + '_label']"
																	:placeholder="subField.placeholder || '请选择'"
																	:disabled="subField.disabled" size="mini" clearable
																	@click="subSelectShow[field.name + '_' + subField.key + '_' + index] = true"
																	readonly />
															</template>
														</view>
													</view>
												</template>
											</view>
										</view>
									</view>
									<view v-else class="empty-tips">
										暂无数据，点击添加按钮新增
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
				<u-button v-if="butVisible" type="info" @click="handleSimulate"
					:loading="simulateLoadingLocal">试算流程</u-button>
				<u-button v-if="butVisible" type="primary" @click="handleSave('draft')"
					:loading="saveLoadingLocal">保存草稿</u-button>
				<u-button v-if="butVisible" type="success" @click="handleSubmit"
					:loading="submitLoadingLocal">提交申请</u-button>
			</view>
		</view>

		<!-- 日期选择器 -->
		<u-picker v-model="datePickerShow" mode="time" :params="datePickerParams" @confirm="onDateConfirm" />

		<!-- 远程选择弹窗 -->
		<u-popup v-model="remoteSelectShow" mode="bottom" height="70%">
			<view class="remote-select-popup">
				<view class="popup-header">
					<text class="popup-title">{{ currentRemoteField?.label || '请选择' }}</text>
					<u-button type="text" @click="remoteSelectShow = false">关闭</u-button>
				</view>
				<view class="popup-content">
					<!-- 这里可以根据需要实现远程搜索和选择 -->
					<u-empty mode="list" v-if="true" />
				</view>
			</view>
		</u-popup>

		<!-- 级联选择弹窗 -->
		<u-popup v-model="cascaderShow" mode="bottom" height="70%">
			<view class="cascader-popup">
				<view class="popup-header">
					<text class="popup-title">{{ currentCascaderField?.label || '请选择' }}</text>
					<u-button type="text" @click="cascaderShow = false">关闭</u-button>
				</view>
				<view class="popup-content">
					<!-- 这里可以根据需要实现级联选择 -->
					<u-empty mode="list" v-if="true" />
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		name: 'DynamicFormDialog',
		props: {
			// 控制显示隐藏
			value: {
				type: Boolean,
				default: false
			},
			// 控制button显示隐藏
			butVisible: {
				type: Boolean,
				default: false
			},
			// 弹窗标题
			title: {
				type: String,
				default: '表单'
			},
			// 表单配置
			formSchema: {
				type: Object,
				default: null
			},
			// 表单类型代码
			formTypeCode: {
				type: String,
				required: true
			},
			// 初始表单数据
			initialData: {
				type: Object,
				default: () => ({})
			},
			// 表单动作 (add/update)
			formAction: {
				type: String,
				default: 'add'
			},
			// 表单提交地址
			actionUrl: {
				type: String,
				default: ''
			},
			// 新增 loading 状态 props
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
				// 表单数据
				formData: {},
				// 表单验证规则
				formRules: {},
				// 表单布局分组
				formLayoutGroups: [],
				// 所有字段配置
				formFields: [],

				// 选择器显示控制
				selectShow: {},
				subSelectShow: {},

				// 日期选择器
				datePickerShow: false,
				datePickerParams: {
					year: true,
					month: true,
					day: true
				},
				currentDateField: null,

				// 远程选择
				remoteSelectShow: false,
				currentRemoteField: null,

				// 级联选择
				cascaderShow: false,
				currentCascaderField: null,

				// 文件上传配置
				fileUploadConfig: {
					imageStyles: {
						width: 120,
						height: 120,
						border: {
							radius: '4px'
						}
					},
					listStyles: {
						border: true,
						dividline: true,
						borderStyle: {
							width: 1,
							color: '#dcdfe6',
							style: 'solid',
							radius: '4px'
						}
					}
				},

				// 本地loading状态
				saveLoadingLocal: false,
				submitLoadingLocal: false,
				simulateLoadingLocal: false
			};
		},
		watch: {
			formSchema: {
				immediate: true,
				deep: true,
				handler(newVal) {
					if (newVal) {
						this.initForm();
					}
				}
			},
			initialData: {
				immediate: true,
				deep: true,
				handler(newVal) {
					if (newVal) {
						this.handleInitialData(newVal);
					}
				}
			},
			saveLoading(newVal) {
				this.saveLoadingLocal = newVal;
			},
			submitLoading(newVal) {
				this.submitLoadingLocal = newVal;
			},
			simulateLoading(newVal) {
				this.simulateLoadingLocal = newVal;
			},
			value(newVal) {
				if (newVal && this.formSchema) {
					this.$nextTick(() => {
						this.initForm();
					});
				}
			}
		},
		methods: {
			// 初始化表单
			initForm() {
				if (!this.formSchema || !this.formSchema.fields) {
					console.warn('表单配置为空');
					return;
				}

				// 初始化字段数据
				this.initFormData();

				// 初始化验证规则
				this.initFormRules();

				// 初始化布局
				this.initFormLayout();

				// 初始化字段配置
				this.formFields = this.formSchema.fields || [];
			},

			// 初始化表单数据
			initFormData() {
				if (!this.formSchema || !this.formSchema.fields) return;

				const formData = {};
				this.formSchema.fields.forEach(field => {
					if (field.type === 'file' || field.type === 'array<object>') {
						formData[field.name] = [];
					} else if (field.type === 'table') {
						formData[field.name] = field.defaultValue || [];
					} else {
						formData[field.name] = field.defaultValue || '';
					}

					// 为选择字段添加标签字段
					if (field.type === 'select' || field.type === 'remote-select' || field.type === 'cascader') {
						formData[field.name + '_label'] = '';
					}
				});

				// 合并初始数据
				if (this.initialData && this.initialData.form_data) {
					Object.assign(formData, this.initialData.form_data);
				}

				this.formData = formData;

				// 初始化选择器显示状态
				this.initSelectShow();
			},

			// 初始化选择器显示状态
			initSelectShow() {
				const selectShow = {};
				this.formSchema.fields.forEach(field => {
					if (field.type === 'select') {
						selectShow[field.name] = false;
					}

					// 处理数组类型中的选择器
					if (field.type === 'array<object>' && field.columns) {
						field.columns.forEach(subField => {
							if (subField.type === 'select') {
								const formData = this.formData[field.name] || [];
								formData.forEach((item, index) => {
									selectShow[`${field.name}_${subField.key}_${index}`] = false;
								});
							}
						});
					}
				});
				this.selectShow = selectShow;
			},

			// 初始化验证规则
			initFormRules() {
				if (!this.formSchema || !this.formSchema.fields) return;

				const rules = {};
				this.formSchema.fields.forEach(field => {
					const fieldRules = [];

					// 必填验证
					if (field.required) {
						if (field.type === 'file' || field.type === 'array<object>') {
							fieldRules.push({
								validator: (rule, value, callback) => {
									if (!value || (Array.isArray(value) && value.length === 0)) {
										return new Error(`${field.label}是必填项`);
									}
									return true;
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

					// 数字类型验证
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

					// 文本长度验证
					if ((field.type === 'text' || field.type === 'textarea') && field.maxLength) {
						fieldRules.push({
							max: field.maxLength,
							message: `${field.label}不能超过${field.maxLength}个字符`,
							trigger: ['blur', 'change']
						});
					}

					// 文件大小验证
					if (field.type === 'file' && field.maxSize) {
						fieldRules.push({
							validator: (rule, value, callback) => {
								if (value && value.length > 0) {
									const oversizedFiles = value.filter(file =>
										file.size > field.maxSize * 1024 * 1024
									);
									if (oversizedFiles.length > 0) {
										return new Error(`文件大小不能超过${field.maxSize}MB`);
									}
								}
								return true;
							},
							trigger: ['change']
						});
					}

					// 文件数量验证
					if (field.type === 'file' && field.maxCount) {
						fieldRules.push({
							validator: (rule, value, callback) => {
								if (value && value.length > field.maxCount) {
									return new Error(`最多只能上传${field.maxCount}个文件`);
								}
								return true;
							},
							trigger: ['change']
						});
					}

					// 表格验证
					if (field.type === 'array<object>' && field.minRows) {
						fieldRules.push({
							validator: (rule, value, callback) => {
								if (!value || value.length < field.minRows) {
									return new Error(`至少需要${field.minRows}条记录`);
								}
								return true;
							},
							trigger: ['change']
						});
					}

					if (fieldRules.length > 0) {
						rules[field.name] = fieldRules;
					}
				});

				this.formRules = rules;
			},

			getFileName(file) {				
				if (file.name) return file.name;				
				if (file.url) {
					const cleanUrl = file.url.split(/[?#]/)[0];
					return cleanUrl.split('/').pop() || '未命名文件';
				}
				return '未命名文件';				
			},

			// 初始化表单布局
			initFormLayout() {
				if (!this.formSchema || !this.formSchema.layout) {
					// 如果没有布局配置，创建一个默认分组
					this.formLayoutGroups = [{
						title: '',
						fields: this.formSchema.fields.map(f => f.name)
					}];
				} else {
					this.formLayoutGroups = this.formSchema.layout.groups || [];
				}
			},

			// 获取分组字段
			getGroupFields(group) {
				if (!group.fields || !this.formSchema.fields) return [];

				return this.formSchema.fields.filter(field =>
					group.fields.includes(field.name)
				);
			},

			// 处理初始数据
			handleInitialData(initialData) {
				if (!initialData) return;

				// 如果有 form_data，使用它
				if (initialData.form_data) {
					Object.assign(this.formData, initialData.form_data);
				}
			},

			// 选择确认
			onSelectConfirm(e, fieldName) {
				if (e && e.length > 0) {
					this.formData[fieldName] = e[0].value;
					this.formData[fieldName + '_label'] = e[0].label;
				}
			},

			// 子选择确认
			onSubSelectConfirm(e, arrayFieldName, subFieldKey, index) {
				if (e && e.length > 0) {
					if (!this.formData[arrayFieldName]) {
						this.formData[arrayFieldName] = [];
					}

					if (!this.formData[arrayFieldName][index]) {
						this.formData[arrayFieldName][index] = {};
					}

					this.formData[arrayFieldName][index][subFieldKey] = e[0].value;

					// 如果存在标签字段，也更新
					if (this.formData[arrayFieldName][index][subFieldKey + '_label'] !== undefined) {
						this.formData[arrayFieldName][index][subFieldKey + '_label'] = e[0].label;
					}
				}
			},

			// 显示日期选择器
			showDatePicker(fieldName) {
				this.currentDateField = fieldName;
				this.datePickerShow = true;
			},

			// 日期确认
			onDateConfirm(e) {
				if (this.currentDateField && e) {
					const dateStr = `${e.year}-${e.month}-${e.day}`;
					this.formData[this.currentDateField] = dateStr;
				}
			},

			// 显示远程选择
			showRemoteSelect(field) {
				this.currentRemoteField = field;
				this.remoteSelectShow = true;
			},

			// 显示级联选择
			showCascader(field) {
				this.currentCascaderField = field;
				this.cascaderShow = true;
			},

			// 文件上传进度
			onFileProgress(e) {
				console.log('上传进度:', e);
				// 如果需要显示上传进度，可以在这里处理
			},

			// 文件上传失败
			onFileUploadFail(e) {
				console.error('文件上传失败:', e);
				uni.showToast({
					title: '文件上传失败',
					icon: 'none'
				});
			},

			// 文件上传相关方法
			getFileMediaType(accept) {
				if (!accept) return 'all';
				if (accept.includes('image')) return 'image';
				if (accept.includes('video')) return 'video';
				return 'all';
			},

			onFileSelect(e, fieldName) {
				// 文件选择逻辑
				console.log('文件选择:', e, fieldName);
			},

			onFileUploadSuccess(e, fieldName) {
				console.log('上传成功:', e);
				// 标准化返回的文件对象
				if (e.tempFiles && e.tempFiles.length > 0) {
					e.tempFiles.forEach(file => {
						if (file.response && file.response.data) {
							// 假设后端返回格式: { url: '...', name: '...' }
							file.url = file.response.data.url || file.response.data.fileUrl;
							file.name = file.response.data.name || this.getFileNameFromUrl(file.url);
						}
					});
				}
				uni.showToast({
					title: '文件上传成功',
					icon: 'success'
				});
			},
			getFileNameFromUrl(url) {
				if (!url) return '未命名文件';
				const cleanUrl = url.split(/[?#]/)[0];
				return cleanUrl.split('/').pop() || '未命名文件';
			},

			onFileDelete(e, fieldName) {
				console.log('删除文件:', e, fieldName);
				// uni-file-picker 会自动更新 formData[fieldName]，此处可添加额外处理
				uni.showToast({
					title: '文件已删除',
					icon: 'success'
				});
			},

			removeFile(fieldName, index) {
				if (this.formData[fieldName] && this.formData[fieldName][index]) {
					this.formData[fieldName].splice(index, 1);
					uni.showToast({
						title: '文件删除成功',
						icon: 'success'
					});
				}
			},

			// 数组操作
			addArrayItem(field) {
				if (!this.formData[field.name]) {
					this.$set(this.formData, field.name, []);
				}

				const newItem = {};
				if (field.columns) {
					field.columns.forEach(subField => {
						if (subField.defaultValue !== undefined) {
							newItem[subField.key] = subField.defaultValue;
						} else {
							newItem[subField.key] = '';
						}

						// 为选择字段添加标签字段
						if (subField.type === 'select') {
							newItem[subField.key + '_label'] = '';
						}
					});
				}

				this.formData[field.name].push(newItem);
			},

			removeArrayItem(fieldName, index) {
				if (this.formData[fieldName] && this.formData[fieldName][index]) {
					this.formData[fieldName].splice(index, 1);
				}
			},

			moveArrayItem(fieldName, index, direction) {
				const array = this.formData[fieldName];
				if (!array || array.length <= 1) return;

				const newIndex = index + direction;
				if (newIndex < 0 || newIndex >= array.length) return;

				// 交换位置
				const temp = array[index];
				array[index] = array[newIndex];
				array[newIndex] = temp;

				// 重新设置数组以触发更新
				this.formData[fieldName] = [...array];
			},

			clearArray(fieldName) {
				this.formData[fieldName] = [];
			},

			// 表单提交
			async handleSave(status) {
				// 表单验证
				try {
					await this.$refs.uForm.validate();

					this.saveLoadingLocal = true;

					// 处理表单数据
					const formData = this.processFormData();
					if (status) {
						formData.status = status;
					}

					console.log('保存的数据:', formData);
					this.$emit('save', formData);

				} catch (error) {
					console.error('表单验证失败:', error);
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
					await this.$refs.uForm.validate();

					this.submitLoadingLocal = true;

					const formData = this.processFormData();
					formData.status = 'pending';

					console.log('提交的数据:', formData);
					this.$emit('submit', formData);

				} catch (error) {
					console.error('表单验证失败:', error);
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
					await this.$refs.uForm.validate();

					this.simulateLoadingLocal = true;

					const formData = this.processFormData();
					console.log('试算的数据:', formData);
					this.$emit('simulate', formData);

				} catch (error) {
					console.error('表单验证失败:', error);
					uni.showToast({
						title: '请完善表单信息',
						icon: 'none'
					});
				} finally {
					this.simulateLoadingLocal = false;
				}
			},

			// 处理表单数据
			processFormData() {
				const result = {
					form_type_code: this.formTypeCode,
					form_data: {}
				};

				// 复制表单数据到 form_data
				Object.assign(result.form_data, this.formData);

				return result;
			},

			// 取消操作
			handleCancel() {
				this.$emit('cancel');
				this.$emit('input', false);
			},

			getFileName(file) {
				if (file.name) return file.name;
				if (file.url) {
					const cleanUrl = file.url.split(/[?#]/)[0];
					return cleanUrl.split('/').pop() || '未命名文件';
				}
				return '未命名文件';
			},

			// 文件预览
			handleFilePreview(file, fieldName) {
				// 标准化文件对象
				const previewFile = {
					url: file.url || file.fileUrl,
					name: this.getFileName(file),
					size: file.size,
					type: file.mimetype || this.getFileTypeFromName(file)
				};

				// 触发预览事件
				this.$emit('preview-file', previewFile);
			},
			getFileTypeFromName(file) {
				const name = this.getFileName(file);
				const ext = name.split('.').pop().toLowerCase();
				const types = {
					'jpg': 'image',
					'jpeg': 'image',
					'png': 'image',
					'gif': 'image',
					'bmp': 'image',
					'pdf': 'pdf',
					'doc': 'office',
					'docx': 'office',
					'xls': 'office',
					'xlsx': 'office',
					'ppt': 'office',
					'pptx': 'office'
				};
				return types[ext] || 'unknown';
			},

			// 文件下载
			downloadFile(file) {
				this.$emit('download-file', file);
			},

			// 格式化文件大小
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
	.dynamic-form-wrapper {
		.form-container {
			padding: 30rpx;
			max-height: 80vh;
			overflow-y: auto;
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
			justify-content: flex-end;
			flex-wrap: wrap;
			margin-top: 40rpx;
			padding-top: 20rpx;
			border-top: 1px solid #e4e7ed;

			.u-button {
				margin-left: 20rpx;
				margin-bottom: 10rpx;

				&:first-child {
					margin-left: 0;
				}
			}
		}

		// 自定义表单项样式
		.custom-form-item {
			margin-bottom: 30rpx;

			// 替代原来的 ::v-deep .u-form-item__body
			.u-form-item__body {
				padding: 0;
			}
		}

		.textarea-form-item {
			.u-form-item__body {
				.u-input {
					width: 100%;
				}
			}
		}

		.file-form-item {
			.u-form-item__body {
				width: 100%;
			}
		}

		.array-form-item {
			.u-form-item__body {
				width: 100%;
			}
		}

		.file-upload-container {
			width: 100%;

			.upload-button {
				margin-bottom: 20rpx;
			}

			.file-list {
				margin-top: 20rpx;

				.file-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 20rpx;
					margin-bottom: 20rpx;
					background: #f8f9fa;
					border-radius: 8rpx;
					border: 1px solid #e4e7ed;

					.file-info {
						display: flex;
						align-items: center;
						flex: 1;
						min-width: 0;

						.file-icon {
							color: #409eff;
							margin-right: 16rpx;
							font-size: 32rpx;
						}

						.file-name {
							flex: 1;
							color: #303133;
							font-size: 28rpx;
							width: 10rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							margin-right: 16rpx;
						}

						.file-size {
							color: #909399;
							font-size: 24rpx;
						}
					}

					.file-actions {
						display: flex;
						align-items: center;

						.u-button {
							margin-left: 16rpx;
							font-size: 24rpx;

							&.delete-btn {
								color: #f56c6c;
							}
						}
					}
				}
			}
		}

		.array-table-container {
			border: 1px solid #e4e7ed;
			border-radius: 8rpx;
			overflow: hidden;

			.array-table-header {
				background: #f8f9fa;
				padding: 20rpx;
				border-bottom: 1px solid #e4e7ed;

				.table-actions {
					display: flex;
					justify-content: space-between;
				}
			}

			.array-table-body {
				padding: 20rpx;

				.array-table-row {
					margin-bottom: 30rpx;
					padding: 20rpx;
					background: #f8f9fa;
					border-radius: 8rpx;

					&:last-child {
						margin-bottom: 0;
					}

					.row-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 20rpx;
						padding-bottom: 10rpx;
						border-bottom: 1px dashed #dcdfe6;

						.row-index {
							font-weight: bold;
							color: #303133;
							font-size: 28rpx;
						}

						.row-actions {
							display: flex;

							.u-button {
								margin-left: 10rpx;
								font-size: 24rpx;
							}
						}
					}

					.row-fields {
						display: flex;
						flex-wrap: wrap;

						.sub-field {
							margin-right: 20rpx;
							margin-bottom: 20rpx;

							.sub-field-label {
								font-size: 24rpx;
								color: #606266;
								margin-bottom: 10rpx;
							}

							.sub-field-input {
								min-width: 200rpx;
							}
						}
					}
				}
			}

			.empty-tips {
				padding: 40rpx 20rpx;
				text-align: center;
				color: #909399;
				font-size: 28rpx;
			}
		}

		.remote-select-popup,
		.cascader-popup {
			.popup-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 30rpx;
				border-bottom: 1px solid #e4e7ed;

				.popup-title {
					font-size: 32rpx;
					font-weight: bold;
					color: #303133;
				}
			}

			.popup-content {
				padding: 30rpx;
			}
		}

		// 统一设置所有 u-form-item 样式
		.u-form-item {
			margin-bottom: 30rpx;
		}
	}
</style>