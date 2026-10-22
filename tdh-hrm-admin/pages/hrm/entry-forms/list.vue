<template>
	<view class="page-body">
		<!-- 表格搜索组件开始 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm"></vk-data-table-query>
		<!-- 表格搜索组件结束 -->

		<!-- 自定义按钮区域开始 -->
		<view>
			<el-row>
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-employee-add')" @click="exportExcelAll">导出全部
				</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<div style="overflow-x: auto;">
			<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
				:right-btns="table1.rightBtns" :custom-right-btns="table1.customRightBtns" :selection="true"
				:row-no="true" :pagination="true" @update="updateBtn" @delete="deleteBtn"
				@current-change="currentChange" @selection-change="selectionChange">
			</vk-data-table>
		</div>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="900px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="130px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 转为员工档案弹窗开始 -->
		<vk-data-dialog v-model="transferDialog.show" :title="transferDialog.title" width="1000px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="transferForm" v-model="transferDialog.data" :columns="transferColumns"
				:rules="transferRules" label-width="130px" :inline="true" :columnsNumber="2" :border="true">
				<div slot="footer">
					<el-button @click="transferDialog.show = false">取消</el-button>
					<el-button type="primary" :loading="transferDialog.loading" @click="submitTransfer">确 定</el-button>
				</div>
			</vk-data-form>
		</vk-data-dialog>
		<!-- 转为员工档案弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	let vk = uni.vk;
	let originalForms = {};
	const colWidth = 200;

	export default {
		data() {
			return {
				fileList: [],
				loading: false,
				data: {},
				table1: {
					action: "admin/hrm/entry-forms/sys/getList",
					rightBtns: [{
						mode: 'update',
						title: '编辑',
						show: (item) => {
							return this.$hasRole('admin') || this.$hasPermission('hrm-employee-edit')
						}
					}, {
						mode: 'delete',
						title: '删除',
						show: () => this.$hasRole('admin') || this.$hasPermission('hrm-employee-add')
					}],
					customRightBtns: [{
						type: 'primary',
						title: '转为员工',
						icon: 'vk-icon-profile_light',
						show: (item) => {
							return (this.$hasRole('admin') || this.$hasPermission('hrm-employee-add'));
						},
						onClick: (item) => {
							this.transferToEmployee(item);
						}
					}],
					columns: [{
							key: "employee_name",
							title: "员工姓名",
							type: "text",
							width: colWidth - 50,
							fixed: true
						},
						{
							key: "card",
							title: "身份证号码",
							type: "text",
							width: colWidth
						},
						{
							key: "mobile",
							title: "手机号码",
							type: "text",
							width: colWidth - 50
						},
						// ===== 新增：身份证正反面 =====
						{
							key: "id_card_front",
							title: "身份证正面",
							type: "image",
							width: colWidth,
							show: ["detail", "row"]
						},
						{
							key: "id_card_back",
							title: "身份证反面",
							type: "image",
							width: colWidth,
							show: ["detail", "row"]
						},
						// ===== 新增：介绍人/面试人/定薪人/试用期/期望薪资 =====
						{
							key: "internal_name",
							title: "介绍人",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "interviewer_name",
							title: "面试人",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "salary_name",
							title: "定薪人",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "probation_period",
							title: "试用期",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "expected_salary",
							title: "期望薪资",
							type: "text",
							width: colWidth - 100
						},
						// ===== 新增结束 =====
						{
							key: "gender",
							title: "性别",
							type: "text",
							width: colWidth - 150,
							formatter: (val) => val == 1 ? '男' : '女'
						},
						{
							key: "age",
							title: "年龄",
							type: "text",
							width: colWidth - 150
						},
						{
							key: "birth_date",
							title: "出生日期",
							type: "date",
							valueFormat: "yyyy-MM-dd",
							width: colWidth - 50
						},
						{
							key: "birth_month",
							title: "月份",
							type: "text",
							width: colWidth - 150
						},
						{
							key: "banks.bank_name",
							title: "银行名称",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "bank_card",
							title: "银行卡号",
							type: "text",
							width: colWidth
						},
						{
							key: "locations.location_name",
							title: "开户地",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "nations.name",
							title: "民族",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "educationals.educational_name",
							title: "学历",
							type: "text",
							width: colWidth - 150
						},
						{
							key: "stay",
							title: "住宿",
							type: "text",
							width: colWidth - 150,
							formatter: (val) => val == 1 ? '是' : '否'
						},
						{
							key: "expiration_date",
							title: "身份证有效期限",
							type: "text",
							width: colWidth
						},
						{
							key: "card_location",
							title: "户口所在地",
							type: "text",
							width: colWidth
						},
						{
							key: "emergency_contact",
							title: "紧急联系人",
							type: "text",
							width: colWidth - 100
						},
						{
							key: "emergency_mobile",
							title: "紧急联系人电话",
							type: "text",
							width: colWidth - 50
						},
						{
							key: "marital_status",
							title: "婚姻状况",
							type: "text",
							width: colWidth - 100,
							formatter: (val) => val == 1 ? '已婚' : '未婚'
						},
						{
							key: "no_crime",
							title: "无犯罪证明",
							type: "text",
							width: colWidth - 100,
							formatter: (val) => val == 1 ? '有' : '无'
						},
						{
							key: "comment",
							title: "家庭成员",
							type: "text",
							width: colWidth,
							show: ["detail"]
						},
						{
							key: "avatar",
							title: "头像",
							type: "avatar",
							width: colWidth - 150,
							show: ["detail", "row"]
						},
						{
							key: "file_attachments",
							title: "证明文件",
							type: "html",
							width: colWidth,
							show: ["detail"],
							formatter: (val, row, column, index) => {
								if (val && val.length > 0) {
									let html = '';
									const rowId = row._id || row.employee_id || `row-${index}`;
									val.forEach((url, idx) => {
										if (!url) return;
										const fileName = url.split('/').pop() || '证明文件';
										const fileExtension = fileName.split('.').pop().toLowerCase();
										const isImage = /(jpg|jpeg|png|gif|bmp|webp)$/i.test(
											fileExtension);
										const fileId = `${rowId}-file-${idx}`;
										if (isImage) {
											html += `<a href="javascript:void(0);" 
						                               id="${fileId}"
						                               class="file-preview-link"
						                               data-url="${url}"
						                               data-row-id="${rowId}"
						                               data-file-index="${idx}"
						                               data-is-image="true"
						                               style="color: #409EFF; text-decoration: underline; margin-right: 5px;">
						                             ${fileName}
						                           </a>`;
										} else {
											html += `<a href="${url}" 
						                               download="${fileName}" 
						                               target="_blank" 
						                               style="color: #67C23A; text-decoration: underline; margin-right: 5px;">
						                             ${fileName}
						                           </a>`;
										}
										if (idx < val.length - 1) {
											html += '，';
										}
									});
									html +=
										`<span style="margin-left: 5px; color: #909399; font-size: 12px;">(${val.length}个文件)</span>`;
									return html;
								}
								return '<span style="color: #909399;">无</span>';
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
							key: "employee_name",
							title: "员工姓名",
							type: "text",
							width: colWidth - 50,
							mode: "%%"
						},
						{
							key: "card",
							title: "身份证号码",
							type: "text",
							width: colWidth,
							mode: "="
						},
						{
							key: "mobile",
							title: "手机号码",
							type: "text",
							width: colWidth - 50,
							mode: "="
						},
						// ===== 新增：介绍人/面试人/定薪人/试用期/期望薪资搜索 =====
						{
							key: "internal_name",
							title: "介绍人",
							type: "text",
							width: colWidth - 100,
							mode: "%%"
						},
						{
							key: "interviewer_name",
							title: "面试人",
							type: "text",
							width: colWidth - 100,
							mode: "%%"
						},
						{
							key: "salary_name",
							title: "定薪人",
							type: "text",
							width: colWidth - 100,
							mode: "%%"
						},
						{
							key: "probation_period",
							title: "试用期",
							type: "text",
							width: colWidth - 100,
							mode: "%%"
						},
						{
							key: "expected_salary",
							title: "期望薪资",
							type: "number",
							width: colWidth - 100,
							mode: "="
						},
						// ===== 新增结束 =====
						{
							key: "gender",
							title: "性别",
							type: "select",
							width: colWidth - 130,
							mode: "=",
							data: [{
								value: 1,
								label: "男"
							}, {
								value: 2,
								label: "女"
							}]
						},
						{
							key: "bank_id",
							title: "银行名称",
							type: "remote-select",
							width: colWidth - 100,
							mode: "=",
							action: "admin/hrm/bank/sys/getList",
							props: {
								list: "rows",
								value: "bank_id",
								label: "bank_name"
							},
							showAll: true,
							actionData: {
								pageSize: 1000
							}
						},
						{
							key: "educational_id",
							title: "学历",
							type: "remote-select",
							width: colWidth - 100,
							mode: "=",
							action: "admin/hrm/educational/sys/getList",
							props: {
								list: "rows",
								value: "educational_id",
								label: "educational_name"
							},
							showAll: true,
							actionData: {
								pageSize: 1000
							}
						}
					]
				},
				form1: {
					data: {
						stay: 1,
						marital_status: 2,
						no_crime: 2
					},
					props: {
						action: "",
						columns: [{
								key: "employee_name",
								title: "员工姓名",
								type: "text",
								width: colWidth
							},
							{
								key: "card",
								title: "身份证号码",
								type: "text",
								width: colWidth,
								watch: async (res) => {
									let les = vk.myfn.test1(res.value);
									this.$set(this.form1.data, "gender", les.data.sex);
									this.$set(this.form1.data, "age", les.data.age);
									this.$set(this.form1.data, "birth_month", les.data.month);
									this.$set(this.form1.data, "birth_date", les.data.birthday);
								}
							},
							// ===== 新增：身份证正反面 =====
							{
								key: "id_card_front",
								title: "身份证正面",
								type: "avatar",
								disabled: true,
								cloudDirectory: "entry-forms/idcard",
								width: colWidth,
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file, fileList)
								}
							},
							{
								key: "id_card_back",
								title: "身份证反面",
								type: "avatar",
								disabled: true,
								cloudDirectory: "entry-forms/idcard",
								width: colWidth,
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file, fileList)
								}
							},
							// ===== 新增：介绍人/面试人/定薪人/试用期/期望薪资 =====
							{
								key: "internal_name",
								title: "介绍人",
								type: "text",
								width: colWidth
							},
							{
								key: "expected_salary",
								title: "期望薪资",
								type: "number",
								precision: 0, // int 类型，只保留整数
								width: colWidth
							},
							// ===== 新增结束 =====
							{
								key: "mobile",
								title: "手机号码",
								type: "text",
								width: colWidth
							},
							{
								key: "gender",
								title: "性别",
								type: "radio",
								width: colWidth,
								disabled: true,
								data: [{
									value: 1,
									label: "男"
								}, {
									value: 2,
									label: "女"
								}]
							},
							{
								key: "age",
								title: "年龄",
								type: "number",
								width: colWidth,
								disabled: true
							},
							{
								key: "birth_date",
								title: "出生日期",
								type: "date",
								dateType: "date",
								valueFormat: "yyyy-MM-dd",
								width: colWidth,
								disabled: true
							},
							{
								key: "birth_month",
								title: "月份",
								type: "number",
								width: colWidth,
								disabled: true
							},
							{
								key: "bank_card",
								title: "银行卡号",
								type: "text",
								width: colWidth
							},
							{
								key: "bank_id",
								title: "银行名称",
								type: "remote-select",
								width: colWidth,
								disabled: true,
								action: "admin/hrm/bank/sys/getList",
								props: {
									list: "rows",
									value: "bank_id",
									label: "bank_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "location_id",
								title: "开户地",
								type: "remote-select",
								width: colWidth,
								action: "admin/hrm/banklocation/sys/getList",
								props: {
									list: "rows",
									value: "location_id",
									label: "location_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "nation_id",
								title: "民族",
								type: "remote-select",
								width: colWidth,
								action: "admin/hrm/nation/sys/getList",
								props: {
									list: "rows",
									value: "_id",
									label: "name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "educational_id",
								title: "学历",
								type: "remote-select",
								width: colWidth,
								action: "admin/hrm/educational/sys/getList",
								props: {
									list: "rows",
									value: "educational_id",
									label: "educational_name"
								},
								showAll: true,
								actionData: {
									pageSize: 1000
								}
							},
							{
								key: "stay",
								title: "住宿",
								type: "radio",
								width: colWidth,
								data: [{
									value: 1,
									label: "是"
								}, {
									value: 2,
									label: "否"
								}]
							},
							{
								key: "expiration_date",
								title: "身份证有效期限",
								type: "text",
								width: colWidth
							},
							{
								key: "emergency_contact",
								title: "紧急联系人",
								type: "text",
								width: colWidth
							},
							{
								key: "emergency_mobile",
								title: "紧急联系人电话",
								type: "text",
								width: colWidth
							},
							{
								key: "marital_status",
								title: "婚姻状况",
								type: "radio",
								width: colWidth,
								data: [{
									value: 1,
									label: "已婚"
								}, {
									value: 2,
									label: "未婚"
								}]
							},
							{
								key: "card_location",
								title: "户口所在地",
								type: "textarea",
								width: colWidth,
								autosize: {
									minRows: 2,
									maxRows: 4
								}
							},
							{
								key: "no_crime",
								title: "无犯罪证明",
								type: "radio",
								width: colWidth,
								data: [{
									value: 1,
									label: "有"
								}, {
									value: 2,
									label: "无"
								}]
							},
							{
								key: "interviewer_name",
								title: "面试人",
								type: "text",
								width: colWidth
							},
							{
								key: "salary_name",
								title: "定薪人",
								type: "text",
								width: colWidth
							},
							{
								key: "probation_period",
								title: "试用期",
								type: "text",
								width: colWidth
							},
							{
								key: "comment",
								title: "家庭成员",
								type: "textarea",
								width: colWidth + 430,
								autosize: {
									minRows: 5,
									maxRows: 10
								}
							},
							{
								key: "avatar",
								title: "头像地址",
								type: "avatar",
								cloudDirectory: "entry-forms/avatar",
								width: colWidth,
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file, fileList)
								}
							},
							{
								key: "file_attachments",
								title: "证明文件",
								type: "file",
								oneLine: true,
								limit: 9,
								accept: ".jpeg,.jpg,.png,.pdf",
								fileSize: 2,
								sizeUnit: "mb",
								tips: "只能上传pdf/jpg/png文件，且不超过2MB",
								cloudPathRemoveChinese: false,
								cloudDirectory: "entry-forms/file",
								onRemove: (file, fileList) => {
									vk.myfn.deleteFile(file, fileList)
								}
							}
						],
						rules: {
							employee_name: [{
								required: true,
								message: "员工姓名不能为空",
								trigger: ['blur', 'change']
							}],
							card: [{
									required: true,
									message: "身份证号码不能为空",
									trigger: ['blur', 'change']
								},
								{
									validator: vk.pubfn.validator("card"),
									message: '身份证格式错误',
									trigger: 'blur'
								}
							],
							// ===== 新增：介绍人/面试人/定薪人/试用期/期望薪资校验 =====
							internal_name: [{
								required: false,
								message: "介绍人不能为空",
								trigger: ['blur', 'change']
							}],
							interviewer_name: [{
								required: false,
								message: "面试人不能为空",
								trigger: ['blur', 'change']
							}],
							salary_name: [{
								required: false,
								message: "定薪人不能为空",
								trigger: ['blur', 'change']
							}],
							probation_period: [{
								required: false,
								message: "试用期不能为空",
								trigger: ['blur', 'change']
							}],
							expected_salary: [{
								required: false,
								message: "期望薪资不能为空",
								trigger: ['blur', 'change']
							}],
							// ===== 新增结束 =====
							mobile: [{
									required: true,
									message: "手机号码不能为空",
									trigger: ['blur', 'change']
								},
								{
									validator: vk.pubfn.validator("mobile"),
									message: '手机号格式错误',
									trigger: 'blur'
								}
							],
							bank_card: [{
								required: false,
								message: "银行卡号不能为空",
								trigger: ['blur', 'change'],

							}, {
								validator: async (rule, value, callback) => {
									if (vk.pubfn.isNull(value)) {
										callback();
									}
									let res = await vk.request({
										method: 'get',
										url: "https://ccdcapi.alipay.com/validateAndCacheCardInfo.json",
										data: {
											cardNo: value,
											cardBinCheck: true
										},
										contentType: 'json',
										dataType: 'json'
									})
									if (vk.pubfn.isNull(res.bank)) {
										callback(new Error('银行卡号不正确'));
									} else {
										this.$set(this.form1.data, "bank_id", res.bank);
										callback();
									}
								},
								trigger: 'blur'
							}],
							bank_id: [{
								required: false,
								message: "银行名称不能为空",
								trigger: ['blur', 'change']
							}],
							location_id: [{
								required: false,
								message: "开户地不能为空",
								trigger: ['blur', 'change']
							}],
							nation_id: [{
								required: true,
								message: "民族不能为空",
								trigger: ['blur', 'change']
							}],
							educational_id: [{
								required: true,
								message: "学历不能为空",
								trigger: ['blur', 'change']
							}],
							stay: [{
								required: true,
								message: "住宿不能为空",
								trigger: ['blur', 'change']
							}],
							expiration_date: [{
								required: true,
								message: "身份证有效期限不能为空",
								trigger: ['blur', 'change']
							}],
							card_location: [{
								required: true,
								message: "户口所在地不能为空",
								trigger: ['blur', 'change']
							}],
							emergency_contact: [{
								required: true,
								message: "紧急联系人不能为空",
								trigger: ['blur', 'change']
							}],
							emergency_mobile: [{
									required: true,
									message: "紧急联系人电话不能为空",
									trigger: ['blur', 'change']
								},
								{
									validator: vk.pubfn.validator("mobile"),
									message: '手机号格式错误',
									trigger: 'blur'
								}
							],
							marital_status: [{
								required: true,
								message: "婚姻状况不能为空",
								trigger: ['blur', 'change']
							}],
							no_crime: [{
								required: true,
								message: "无犯罪证明不能为空",
								trigger: ['blur', 'change']
							}]
						},
						formType: "",
						title: "",
						show: false
					}
				},
				formDatas: {},
				// 转为员工弹窗相关数据
				transferDialog: {
					show: false,
					title: "转为员工档案",
					data: {},
					loading: false
				},
				currentTransferEntryId: null,
				// 转换表单字段定义（改为响应式数组，以便联动修改）
				transferColumns: [],
				transferRules: {}
			};
		},
		onLoad(options = {}) {
			this.options = options;
			this.init(options);
			this.initTransferColumns(); // 初始化转换表单字段
		},
		methods: {
			init(options) {
				originalForms["form1"] = vk.pubfn.copyObject(this.form1);
			},
			// 初始化转换弹窗的字段（一次性定义，便于联动）
			initTransferColumns() {
				this.transferColumns = [{
						key: "employee_id",
						title: "员工工号",
						type: "text",
						disabled: true,
						width: colWidth,
						rules: [{
							required: true,
							message: "工号不能为空"
						}]
					},
					{
						key: "employee_name",
						title: "员工姓名",
						type: "text",
						disabled: true,
						width: colWidth
					},
					{
						key: "card",
						title: "身份证号码",
						type: "text",
						disabled: true,
						width: colWidth
					},
					{
						key: "mobile",
						title: "手机号码",
						type: "text",
						disabled: true,
						width: colWidth
					},
					{
						key: "gender",
						title: "性别",
						type: "radio",
						disabled: true,
						data: [{
							value: 1,
							label: "男"
						}, {
							value: 2,
							label: "女"
						}],
						width: colWidth
					},
					{
						key: "birth_date",
						title: "出生日期",
						type: "date",
						disabled: true,
						valueFormat: "yyyy-MM-dd",
						width: colWidth
					},
					{
						key: "age",
						title: "年龄",
						type: "number",
						disabled: true,
						width: colWidth
					},
					{
						key: "bank_card",
						title: "银行卡号",
						type: "text",
						disabled: true,
						width: colWidth
					},
					{
						key: "bank_id",
						title: "银行名称",
						type: "remote-select",
						disabled: true,
						action: "admin/hrm/bank/sys/getList",
						props: {
							list: "rows",
							value: "bank_id",
							label: "bank_name"
						},
						showAll: true,
						actionData: {
							pageSize: -1,
							pageIndex: 1
						},
						width: colWidth
					},
					{
						key: "location_id",
						title: "开户地",
						type: "remote-select",
						action: "admin/hrm/banklocation/sys/getList",
						props: {
							list: "rows",
							value: "location_id",
							label: "location_name"
						},
						showAll: true,
						width: colWidth,
						actionData: {
							pageSize: -1,
							pageIndex: 1
						}
					},
					{
						key: "nation_id",
						title: "民族",
						type: "remote-select",
						action: "admin/hrm/nation/sys/getList",
						props: {
							list: "rows",
							value: "_id",
							label: "name"
						},
						showAll: true,
						width: colWidth,
						actionData: {
							pageSize: -1,
							pageIndex: 1
						}
					},
					{
						key: "educational_id",
						title: "学历",
						type: "remote-select",
						action: "admin/hrm/educational/sys/getList",
						props: {
							list: "rows",
							value: "educational_id",
							label: "educational_name"
						},
						showAll: true,
						width: colWidth,
						actionData: {
							pageSize: -1,
							pageIndex: 1
						}
					},
					{
						key: "stay",
						title: "住宿",
						type: "radio",
						data: [{
							value: 1,
							label: "是"
						}, {
							value: 2,
							label: "否"
						}],
						width: colWidth
					},
					{
						key: "expiration_date",
						title: "身份证有效期限",
						type: "text",
						width: colWidth
					},
					{
						key: "emergency_contact",
						title: "紧急联系人",
						type: "text",
						width: colWidth
					},
					{
						key: "card_location",
						title: "户口所在地",
						type: "textarea",
						width: colWidth,
						autosize: {
							minRows: 2,
							maxRows: 3
						}
					},
					{
						key: "emergency_mobile",
						title: "紧急联系人电话",
						type: "text",
						width: colWidth
					},
					{
						key: "marital_status",
						title: "婚姻状况",
						type: "radio",
						data: [{
							value: 1,
							label: "已婚"
						}, {
							value: 2,
							label: "未婚"
						}],
						width: colWidth
					},
					{
						key: "no_crime",
						title: "无犯罪证明",
						type: "radio",
						data: [{
							value: 1,
							label: "有"
						}, {
							value: 2,
							label: "无"
						}],
						width: colWidth
					},
					{
						key: "comment",
						title: "家庭成员",
						type: "textarea",
						width: colWidth,
						autosize: {
							minRows: 3,
							maxRows: 5
						}
					},
					{
						key: "avatar",
						title: "头像",
						type: "avatar",
						disabled: true,
						width: colWidth
					},
					{
						key: "expected_salary",
						title: "期望薪资",
						type: "number",
						precision: 0,
						width: colWidth
					},
					// ===== 新增：身份证正反面 + 介绍人/面试人/定薪人/试用期/期望薪资 =====
					{
						key: "id_card_front",
						title: "身份证正面",
						type: "avatar",
						disabled: true,
						width: colWidth
					},
					{
						key: "id_card_back",
						title: "身份证反面",
						disabled: true,
						type: "avatar",
						width: colWidth
					},

					{
						key: "internal_name",
						title: "介绍人",
						type: "text",
						width: colWidth
					},
					{
						key: "interviewer_name",
						title: "面试人",
						type: "text",
						width: colWidth
					},
					{
						key: "salary_name",
						title: "定薪人",
						type: "text",
						width: colWidth
					},
					{
						key: "probation_period",
						title: "试用期",
						type: "text",
						width: colWidth
					},
					// ===== 新增结束 =====
					{
						key: "center_id",
						title: "六大中心",
						type: "remote-select",
						action: "admin/hrm/center/sys/getList",
						props: {
							list: "rows",
							value: "center_id",
							label: "center_name"
						},
						showAll: true,
						rules: [{
							required: true,
							message: "请选择中心"
						}],
						width: colWidth
					},
					{
						key: "point_id",
						title: "分点名称",
						type: "remote-select",
						action: "admin/hrm/point/sys/getList",
						actionData: {
							pageSize: -1,
							pageIndex: 1
						},
						props: {
							list: "rows",
							value: "point_id",
							label: "point_name"
						},
						showAll: true,
						rules: [{
							required: true,
							message: "请选择分点"
						}],
						width: colWidth
					},
					{
						key: "company_id",
						title: "所属公司",
						type: "tree-select",
						width: colWidth,
						action: "admin/hrm/company/sys/getList",
						props: {
							list: "rows",
							value: "company_id",
							label: "company_name",
							children: "children"
						},
						rules: [{
							required: true,
							message: "请选择公司"
						}],
						watch: async ({
							value,
							formData,
							$set
						}) => {
							// 取最大工号
							let data = await vk.callFunction({
								url: 'admin/hrm/employees/sys/getMaxEmp',
								title: '请求中...',
								data: {
									company_id: value
								},
							});
							this.$set(formData, "employee_id", data.nextNo || "");

							// 联动：根据选中的公司，修改部门列的请求参数
							const deptCol = this.transferColumns.find(col => col.key === "department_id");
							if (deptCol) {
								deptCol.actionData = {
									company_id: value
								};
								this.$set(formData, "department_id", "");
								this.$forceUpdate();
							}
						}
					},
					{
						key: "department_id",
						title: "所属部门",
						type: "tree-select",
						action: "admin/hrm/department/pub/getList",
						props: {
							list: "rows",
							value: "department_id",
							label: "department_name",
							children: "children"
						},
						rules: [{
							required: true,
							message: "请选择部门"
						}],
						actionData: {
							pageSize: -1,
							pageIndex: 1,
							company_id: ""
						},
						width: colWidth,
						watch: ({
							value,
							formData,
							option,
							$set
						}) => {
							if (option && option.department_manager_id) {
								this.$set(formData, "manager_id", option.department_manager_id);
							}
						}
					},
					{
						key: "position_id",
						title: "职位名称",
						type: "remote-select",
						action: "admin/hrm/position/sys/getList",
						actionData: {
							pageSize: -1,
							pageIndex: 1
						},
						props: {
							list: "rows",
							value: "position_id",
							label: "position_name"
						},
						showAll: true,
						rules: [{
							required: true,
							message: "请选择职位"
						}],
						width: colWidth
					},
					{
						key: "manager_id",
						title: "上级主管",
						type: "table-select",
						placeholder: "选择上级主管",
						width: colWidth,
						action: "admin/hrm/employees/sys/getList",
						multiple: false,
						columns: [{
								key: "employee_id",
								title: "员工工号",
								type: "text",
								idKey: true
							},
							{
								key: "employee_name",
								title: "员工姓名",
								type: "text",
								nameKey: true
							},
						],
						queryColumns: [{
								key: "employee_id",
								title: "员工工号",
								type: "text",
								width: 150,
								mode: "%%"
							},
							{
								key: "employee_name",
								title: "员工姓名",
								type: "text",
								width: 150,
								mode: "%%"
							},
							{
								key: "status",
								title: "状态",
								type: "number",
								mode: "=",
								show: ["none"]
							}
						],
						formData: () => {
							return {
								status: 1
							}
						}
					},
					{
						key: "hire_date",
						title: "入职日期",
						type: "date",
						valueFormat: "yyyy-MM-dd",
						defaultValue: new Date(),
						rules: [{
							required: true,
							message: "入职日期不能为空"
						}],
						width: colWidth
					},
					{
						key: "insurance_id",
						title: "保险",
						type: "remote-select",
						action: "admin/hrm/insurance/sys/getList",
						actionData: {
							pageSize: 1000
						},
						props: {
							list: "rows",
							value: "insurance_id",
							label: "insurance_name"
						},
						showAll: true,
						width: colWidth
					},
					{
						key: "contract_id",
						title: "合同是否签定",
						type: "remote-select",
						action: "admin/hrm/contract/sys/getList",
						props: {
							list: "rows",
							value: "contract_id",
							label: "contract_name"
						},
						showAll: true,
						width: colWidth
					},
					{
						key: "contract_date",
						title: "合同到期日",
						type: "date",
						valueFormat: "yyyy-MM-dd",
						width: colWidth
					},
					{
						key: "contract_desc",
						title: "合同签订情况",
						type: "text",
						width: colWidth
					},
					{
						key: "registration",
						title: "档案是否申请",
						type: "radio",
						data: [{
							value: 1,
							label: "是"
						}, {
							value: 2,
							label: "否"
						}],
						width: colWidth
					},
					{
						key: "status",
						title: "员工状态",
						type: "radio",
						data: [{
							value: 1,
							label: "在职"
						}, {
							value: 2,
							label: "离职"
						}],
						defaultValue: 1,
						width: colWidth
					}
				];
				// 初始化验证规则
				this.transferRules = {
					center_id: [{
						required: true,
						message: "请选择中心",
						trigger: ['blur', 'change']
					}],
					point_id: [{
						required: true,
						message: "请选择分点",
						trigger: ['blur', 'change']
					}],
					company_id: [{
						required: true,
						message: "请选择公司",
						trigger: ['blur', 'change']
					}],
					department_id: [{
						required: true,
						message: "请选择部门",
						trigger: ['blur', 'change']
					}],
					position_id: [{
						required: true,
						message: "请选择职位",
						trigger: ['blur', 'change']
					}],
					employee_id: [{
						required: true,
						message: "工号不能为空",
						trigger: ['blur', 'change']
					}],
					hire_date: [{
						required: true,
						message: "入职日期不能为空",
						trigger: ['blur', 'change']
					}],
					mobile: [{
						required: true,
						message: "手机号不能为空",
						trigger: ['blur', 'change']
					}, {
						validator: vk.pubfn.validator("mobile"),
						message: '手机号格式错误',
						trigger: 'blur'
					}],
					card: [{
						required: true,
						message: "身份证号不能为空",
						trigger: ['blur', 'change']
					}, {
						validator: vk.pubfn.validator("card"),
						message: '身份证格式错误',
						trigger: 'blur'
					}],
				};
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
			currentChange(val) {
				this.table1.selectItem = val;
			},
			selectionChange(list) {
				this.table1.multipleSelection = list;
			},
			addBtn() {
				this.resetForm();
				this.form1.props.action = 'admin/hrm/entry-forms/sys/add';
				this.form1.props.formType = 'add';
				this.form1.props.title = '添加入职申请';
				this.form1.props.show = true;
			},
			updateBtn({
				item
			}) {
				this.form1.props.action = 'admin/hrm/entry-forms/sys/update';
				this.form1.props.formType = 'update';
				this.form1.props.title = '编辑入职申请';
				this.form1.props.show = true;
				this.form1.data = item;
			},
			deleteBtn({
				item,
				deleteFn
			}) {
				deleteFn({
					action: "admin/hrm/entry-forms/sys/delete",
					data: {
						_id: item._id
					}
				});
				//删除附件
				item.url = item.avatar;
				vk.myfn.deleteFile(item);
				vk.myfn.deleteFiles(item.file_attachments);
			},
			handleChange(file) {
				let typeObj = {
					employee_name: {
						title: "员工姓名",
						type: "text"
					},
					card: {
						title: "身份证号码",
						type: "text"
					},
					mobile: {
						title: "手机号码",
						type: "text"
					},
					// ===== 新增：介绍人/面试人/定薪人/试用期/期望薪资 =====
					internal_name: {
						title: "介绍人",
						type: "text"
					},
					interviewer_name: {
						title: "面试人",
						type: "text"
					},
					salary_name: {
						title: "定薪人",
						type: "text"
					},
					probation_period: {
						title: "试用期",
						type: "text"
					},
					expected_salary: {
						title: "期望薪资",
						type: "text"
					},
					// ===== 新增结束 =====
					bank_card: {
						title: "银行卡号",
						type: "text"
					},
					bank_id: {
						title: "银行名称",
						type: "text"
					},
					location_id: {
						title: "开户地",
						type: "text"
					},
					nation_id: {
						title: "民族",
						type: "text"
					},
					educational_id: {
						title: "学历",
						type: "text"
					},
					stay: {
						title: "住宿",
						type: "text"
					},
					expiration_date: {
						title: "身份证有效期限",
						type: "text"
					},
					card_location: {
						title: "户口所在地",
						type: "text"
					},
					emergency_contact: {
						title: "紧急联系人",
						type: "text"
					},
					emergency_mobile: {
						title: "紧急联系人电话",
						type: "text"
					},
					marital_status: {
						title: "婚姻状况",
						type: "text"
					},
					no_crime: {
						title: "无犯罪证明",
						type: "text"
					},
					comment: {
						title: "家庭成员",
						type: "text"
					}
				};
				this.$iexcel.importExcel(file.raw, typeObj, async (res) => {
					let count = 0;
					for (const item of res) {
						// ===== 新增：期望薪资 int 类型转换 =====
						if (item.expected_salary) {
							item.expected_salary = Number(item.expected_salary);
						}
						// ===== 新增结束 =====
						let addRes = await vk.callFunction({
							url: 'admin/hrm/entry_forms/sys/add',
							data: item
						});
						if (addRes.code == 0) count++;
					}
					this.fileList = [];
					vk.alert(`成功导入${count}条`, "导入完成", "确定", () => this.refresh());
				});
			},
			exportExcelModel() {
				this.$refs.table1.exportExcel({
					fileName: '入职申请表模版',
					columns: [{
							key: "employee_name",
							title: "员工姓名",
							type: "text"
						},
						{
							key: "card",
							title: "身份证号码",
							type: "text"
						},
						{
							key: "mobile",
							title: "手机号码",
							type: "text"
						},
						// ===== 新增 =====
						{
							key: "internal_name",
							title: "介绍人",
							type: "text"
						},
						{
							key: "interviewer_name",
							title: "面试人",
							type: "text"
						},
						{
							key: "salary_name",
							title: "定薪人",
							type: "text"
						},
						{
							key: "probation_period",
							title: "试用期",
							type: "text"
						},
						{
							key: "expected_salary",
							title: "期望薪资",
							type: "text"
						},
						// ===== 新增结束 =====
						{
							key: "bank_card",
							title: "银行卡号",
							type: "text"
						},
						{
							key: "banks.bank_name",
							title: "银行名称",
							type: "text"
						},
						{
							key: "locations.location_name",
							title: "开户地",
							type: "text"
						},
						{
							key: "nations.name",
							title: "民族",
							type: "text"
						},
						{
							key: "educationals.educational_name",
							title: "学历",
							type: "text"
						},
						{
							key: "stay",
							title: "住宿",
							type: "text",
							formatter: (val) => val == 1 ? '是' : '否'
						},
						{
							key: "expiration_date",
							title: "身份证有效期限",
							type: "text"
						},
						{
							key: "card_location",
							title: "户口所在地",
							type: "text"
						},
						{
							key: "emergency_contact",
							title: "紧急联系人",
							type: "text"
						},
						{
							key: "emergency_mobile",
							title: "紧急联系人电话",
							type: "text"
						},
						{
							key: "marital_status",
							title: "婚姻状况",
							type: "text",
							formatter: (val) => val == 1 ? '已婚' : '未婚'
						},
						{
							key: "no_crime",
							title: "无犯罪证明",
							type: "text",
							formatter: (val) => val == 1 ? '有' : '无'
						},
						{
							key: "comment",
							title: "家庭成员",
							type: "text"
						}
					],
					pageIndex: 1,
					pageSize: -1
				});
			},
			exportExcelAll() {
				this.$refs.table1.exportExcel({
					fileName: '入职申请表全部数据',
					title: '正在导出数据...',
					columns: this.table1.columns.filter(c => !c.show || c.show.includes('list')),
					pageIndex: 1,
					pageSize: -1
				});
			},
			batchBtn(index) {
				vk.toast("批量操作功能开发中");
			},
			async transferToEmployee(row) {
				this.currentTransferEntryId = row._id;
				// 重置部门列的 actionData（避免残留）
				const deptCol = this.transferColumns.find(col => col.key === "department_id");
				if (deptCol) deptCol.actionData = {
					company_id: ""
				};
				// 预填充数据
				const defaultData = {
					employee_name: row.employee_name,
					card: row.card,
					mobile: row.mobile,
					gender: row.gender,
					birth_date: row.birth_date,
					birth_month: row.birth_month,
					age: row.age,
					bank_card: row.bank_card,
					bank_id: row.bank_id,
					location_id: row.location_id,
					nation_id: row.nation_id,
					educational_id: row.educational_id,
					stay: row.stay,
					expiration_date: row.expiration_date,
					card_location: row.card_location,
					emergency_contact: row.emergency_contact,
					emergency_mobile: row.emergency_mobile,
					marital_status: row.marital_status,
					no_crime: row.no_crime,
					comment: row.comment,
					avatar: row.avatar,
					file_attachments: row.file_attachments,
					// ===== 新增：身份证正反面 + 介绍人/面试人/定薪人/试用期/期望薪资 =====
					id_card_front: row.id_card_front,
					id_card_back: row.id_card_back,
					internal_name: row.internal_name,
					interviewer_name: row.interviewer_name,
					salary_name: row.salary_name,
					probation_period: row.probation_period,
					expected_salary: row.expected_salary,
					// ===== 新增结束 =====
					employee_id: "",
					center_id: "3",
					point_id: "",
					company_id: row.company_id || "",
					department_id: "",
					position_id: "",
					manager_id: "",
					hire_date: new Date().toISOString().slice(0, 10),
					insurance_id: "",
					contract_id: "",
					contract_date: "",
					contract_desc: "",
					registration: 2,
					status: 1
				};

				const el = await vk.myfn.getResignEmployees(row.card);
				const employeeMap = await vk.myfn.batchGetEmployeeInfo([row.card]);

				let msg = "";
				//离职人员信息
				if (vk.pubfn.isNotNull(el)) {
					el.forEach(e => {
						msg +=
							`姓名：${e.employee_name}(${e.employee_id})\n入职日期：${e.hire_date}\n离职日期：${e.resign_date}\n离职原因：${e.resign_desc}\n`;
					})
					vk.confirm(msg, '该员工为再次入职，信息如下', '继续', '取消', (res) => {
						if (res.confirm) {
							this.transferDialog.data = defaultData;
							this.transferDialog.show = true;
							return;
						}
					})
				}

				//在职人员信息
				if (employeeMap && employeeMap.size > 0) {
					const empInfo = employeeMap.get(row.card)
					msg = `姓名：${row.employee_name}(${empInfo.employee_id}),已经存在,将执行删除操作！`;

					vk.alert(msg, '提示', '确定', async () => {
						const delRes = await vk.callFunction({
							url: 'admin/hrm/entry-forms/sys/delete',
							data: {
								_id: this.currentTransferEntryId
							},
							title: '删除入职申请记录'
						});
						if (delRes.code === 0) {
							this.refresh();
						}
					})
				} else {
					let departmentItem = vk.pubfn.getListItem(this.transferColumns, "key", "department_id");
					departmentItem.actionData.company_id = defaultData.company_id;

					// 取最大工号
					if (vk.pubfn.isNotNull(defaultData.company_id)) {
						let data = await vk.callFunction({
							url: 'admin/hrm/employees/sys/getMaxEmp',
							title: '请求中...',
							data: {
								company_id: defaultData.company_id
							},
						});
						this.$set(defaultData, "employee_id", data.nextNo || "");
					}

					this.transferDialog.data = defaultData;
					this.transferDialog.show = true;
				}
			},
			async submitTransfer() {
				this.$refs.transferForm.validate(async (valid) => {
					if (!valid) return;
					try {
						this.transferDialog.loading = true;
						// ===== 新增：期望薪资 int 类型兜底转换 =====
						if (this.transferDialog.data.expected_salary === '' || this.transferDialog.data
							.expected_salary === null) {
							this.transferDialog.data.expected_salary = null;
						} else {
							this.transferDialog.data.expected_salary = Number(this.transferDialog.data
								.expected_salary);
						}
						// ===== 新增结束 =====
						const addRes = await vk.callFunction({
							url: 'admin/hrm/employees/sys/add',
							data: this.transferDialog.data,
							title: '正在转为员工档案...'
						});
						if (addRes.code === 0) {
							this.$message.success('成功转为员工档案');
							this.transferDialog.show = false;
							const msg = "是否删除入职申请记录？"
							vk.confirm(msg, '提示', '确认', '取消', async (res) => {
								if (res.confirm) {
									const delRes = await vk.callFunction({
										url: 'admin/hrm/entry-forms/sys/delete',
										data: {
											_id: this.currentTransferEntryId
										},
										title: '删除入职申请记录'
									});
									if (delRes.code === 0) {
										this.refresh();
									} else {
										this.$message.warning(
											'员工档案已添加，但入职申请记录删除失败，请手动处理');
										this.refresh();
									}
								}
							})
						} else {
							this.$message.error(addRes.message || '转换失败');
						}
					} catch (err) {
						console.error(err);
						this.$message.error('转换失败，请重试');
					} finally {
						this.transferDialog.loading = false;
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page-body {}
</style>