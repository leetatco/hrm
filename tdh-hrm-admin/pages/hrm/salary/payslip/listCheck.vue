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
				<el-button type="primary" size="small" icon="el-icon-edit-outline"
					v-if="$hasRole('admin') || $hasPermission('hrm-salary-payslip-view')" @click="exportExcelAll"> 导出全部
				</el-button>
			</el-row>
		</view>
		<!-- 自定义按钮区域结束 -->

		<!-- 表格组件开始 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="true" :row-no="false" :pagination="true" @update="updateBtn"
			@delete="deleteBtn" @current-change="currentChange" @selection-change="selectionChange"
			:page-sizes="pageSizes"></vk-data-table>
		<!-- 表格组件结束 -->

		<!-- 添加或编辑的弹窗开始 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="800px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :before-action="form1.props.beforeAction"
				:columns='form1.props.columns' label-width="110px" @success="form1.props.show = false;refresh();"
				:inline="true" :columnsNumber="2"></vk-data-form>
		</vk-data-dialog>
		<!-- 添加或编辑的弹窗结束 -->

		<!-- 页面内容结束 -->
	</view>
</template>

<script>
	import myfn from '../../../../common/function/myPubFunction';

	let vk = uni.vk; // vk实例
	let originalForms = {}; // 表单初始化数据
	const colWidth = 200;
	let nowy = new Date(vk.pubfn.getOffsetTime(new Date(), {
		mode: "before", // after 之后 before 之前
	})).getFullYear();

	let nowm = new Date(vk.pubfn.getOffsetTime(new Date(), {
		mode: "before", // after 之后 before 之前
	})).getMonth();

	let nowm1 = nowm > 9 ? nowm : `0${nowm}`;
	const nowym = vk.myfn.normalizeMonth(`${nowy}-${nowm1}`);
	export default {
		data() {
			// 页面数据变量
			return {
				pageSizes: [1, 5, 10, 20, 50, 100, 500, 1000],
				fileList: [],
				sumList: [],
				// 页面是否请求中或加载中
				loading: false,
				// init请求返回的数据
				data: {

				},
				// 表格相关开始 -----------------------------------------------------------
				table1: {
					// 表格数据请求地址
					action: "admin/hrm/salary/sys/payslip/getList",
					//按钮显示
					rightBtns: [{
						mode: 'detail_auto',
						title: '详细',
						show: (item) => {
							return this.$hasRole('admin') || this.$hasPermission('hrm-salary-payslip-view')
						}
					}],
					// 表格字段显示规则
					columns: [{
							"key": "attendance_ym",
							"title": "考勤日期",
							"type": "date",
							"dateType": "date",
							"fixed": true,
							"valueFormat": "yyyy-MM",
							"format": "yyyy-MM"
						},
						{
							"key": "attendance_ym_key",
							"title": "月份",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "employee_name",
							"title": "姓名",
							"type": "text",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "signature_url",
							"title": "签名",
							"type": "image",
							"fixed": true,
							"width": colWidth - 100
						},
						{
							"key": "card",
							"title": "身份证号码",
							"type": "text",
							"fixed": true,
							"width": colWidth - 30
						},
						{
							"key": "department_name",
							"title": "部门",
							"fixed": true,
							"type": "text",
							"width": colWidth
						},
						{
							"key": "position_name",
							"title": "岗位",
							"type": "text",
							"width": colWidth - 100
						},
						{
							"key": "hire_date",
							"title": "入职日期",
							"type": "date",
							"dateType": "date",
							"valueFormat": "yyyy-MM-dd",
							"width": colWidth - 100
						},
						{
							"key": "resign_date",
							"title": "离职日期",
							"type": "text",
							"width": colWidth - 100
						},
						{
							key: "status",
							title: "状态",
							type: "tag",
							width: colWidth - 100,
							data: [{
									value: 1,
									label: "已签名",
									tagType: "success"
								},
								{
									value: 0,
									label: "未签名",
									tagType: "warning"
								}
							]
						},
						{
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
						attendance_ym: nowym,
						status: 1
					},
					// 查询表单的字段规则 fieldName:指定数据库字段名,不填默认等于key
					columns: [{
						key: "attendance_ym",
						title: "考勤日期",
						type: "date",
						dateType: "date",
						valueFormat: "yyyy-MM",
						format: "yyyy-MM",
						"width": colWidth
					}, {
						key: "card",
						title: "",
						type: "table-select",
						placeholder: "选择员工",
						action: "admin/hrm/salary/sys/payslip/getList",
						multiple: false,
						columns: [{
								key: "employee_name",
								title: "员工姓名",
								type: "text",
								nameKey: true
							},
							{
								key: "card",
								title: "身份证号码",
								type: "text",
								idKey: true

							}
						],
						queryColumns: [{
								key: "employee_name",
								title: "员工姓名",
								type: "text",
								width: 150,
								mode: "%%"
							},
							{
								key: "card",
								title: "身份证号码",
								type: "text",
								width: 150,
								mode: "%%"
							}

						]
					}, {
						key: "status",
						title: "状态",
						type: "select",
						width: colWidth - 50,
						data: [{
								value: 0,
								label: "未签名"
							},
							{
								value: 1,
								label: "已签名"
							}
						],
						mode: "="
					}, ]
				},
				form1: {
					// 表单请求数据，此处可以设置默认值
					data: {},
					// 表单属性
					props: {
						// 表单请求地址
						action: "",
						// 表单字段显示规则
						columns: [{
							key: "attendance_ym",
							title: "考勤日期",
							type: "date",
							dateType: "date",
							disabled: true,
							valueFormat: "yyyy-MM",
							format: "yyyy-MM",
							"width": colWidth

						}, {
							key: "card",
							title: "姓名",
							type: "table-select",
							disabled: true,
							placeholder: "选择员工",
							action: "admin/hrm/salary/sys/payslip/getList",
							multiple: false,
							columns: [{
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									nameKey: true
								},
								{
									key: "card",
									title: "身份证号码",
									type: "text",
									idKey: true

								}
							],
							queryColumns: [{
									key: "employee_name",
									title: "员工姓名",
									type: "text",
									width: 150,
									mode: "%%"
								},
								{
									key: "card",
									title: "身份证号码",
									type: "text",
									width: 150,
									mode: "%%"
								}

							]
						}],
						// 表单验证规则
						rules: {
							attendance_ym: [{
								required: true,
								message: "该项不能为空",
								trigger: ['blur', 'change']
							}],
							employee_name: [{
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
				// 其它弹窗表单
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
			async search() {
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

			// 辅助获取数据
			async fetchAllData(attendance_ym) {
				const res = await vk.callFunction({
					url: 'admin/hrm/salary/sys/payslip/getList',
					data: {
						formData: this.queryForm1.formData,
						columns: this.queryForm1.columns,
						pageIndex: 1,
						pageSize: -1
					}
				});
				if (res.code === 0) {
					return res.rows || [];
				} else {
					vk.alert(res.msg || '获取数据失败');
					return [];
				}
			},

			// 导出xls表格文件（全部数据）
			async exportExcelAll() {
				const attendance_ym = this.queryForm1.formData.attendance_ym;
				if (vk.pubfn.isNull(attendance_ym)) {
					return vk.alert(`考勤日期不能为空！`);
				}
				
				uni.showLoading({
					title: '正在获取数据...'
				});

				// 获取全部数据（建议 pageSize = -1）
				const listData = await this.fetchAllData(attendance_ym);
				if (!listData || listData.length === 0) {
					uni.hideLoading();
					return vk.alert('无数据可导出');
				}

				const ExcelJS = require('exceljs');
				const FileSaver = require('file-saver');
				const workbook = new ExcelJS.Workbook();
				const worksheet = workbook.addWorksheet('工资条', {
					views: [{
						state: 'frozen',
						ySplit: 1
					}]
				});

				// 定义列
				worksheet.columns = [{
						header: '序号',
						key: 'index',
						width: 10
					},
					{
						header: '考勤日期',
						key: 'attendance_ym',
						width: 15
					},
					{
						header: '月份',
						key: 'attendance_ym_key',
						width: 15
					},
					{
						header: '姓名',
						key: 'employee_name',
						width: 15
					},
					{
						header: '签名',
						key: 'signature_url',
						width: 20
					},
					{
						header: '身份证号码',
						key: 'card',
						width: 25
					},
					{
						header: '任职部门',
						key: 'department_name',
						width: 20
					},
					{
						header: '岗位',
						key: 'position_name',
						width: 20
					},
					{
						header: '入职日期',
						key: 'hire_date',
						width: 15
					},
					{
						header: '离职日期',
						key: 'resign_date',
						width: 15
					},
					{
						header: '状态',
						key: 'status',
						width: 15
					}
				];

				// 填充文本数据
				listData.forEach((item, idx) => {
					worksheet.addRow({
						index: idx + 1,
						attendance_ym: item.attendance_ym,
						attendance_ym_key: item.attendance_ym_key,
						employee_name: item.employee_name,
						signature_url: item.signature_url,
						card: item.card,
						department_name: item.department_name,
						position_name: item.position_name,
						hire_date: item.hire_date,
						resign_date: item.resign_date,
						status: item.status == 1 ? '已签名' : '未签名'
					});
				});

				// ========== 图片处理：调用云函数批量获取 base64 ==========
				const colLetter = 'E';
				const dataStartRow = 2;

				// 收集所有有图片的 URL
				const imageUrls = listData.map(item => item.signature_url).filter(Boolean);
				let base64Map = {};
				if (imageUrls.length > 0) {
					try {
						const batchRes = await vk.callFunction({
							url: 'common/sys/getImagesBase64/index',
							data: {
								imageUrls
							}
						});
						if (batchRes.code === 0) {
							batchRes.data.forEach(item => {
								if (item.success) {
									base64Map[item.url] = item.base64;
								}
							});
						} else {
							console.warn('批量获取图片失败:', batchRes.msg);
						}
					} catch (err) {
						console.error('调用云函数失败:', err);
					}
				}

				// 循环嵌入图片
				for (let i = 0; i < listData.length; i++) {
					const row = listData[i];
					const imageUrl = row.signature_url;
					if (!imageUrl) continue;

					const base64 = base64Map[imageUrl];
					if (!base64) continue; // 未获取到则跳过

					try {
						// 添加图片到工作簿
						const imageId = workbook.addImage({
							base64: base64,
							extension: 'png' // 实际格式由 base64 内容决定
						});

						const rowIndex = dataStartRow + i;
						worksheet.addImage(imageId, {
							tl: {
								col: 4.2,
								row: rowIndex - 1
							},
							ext: {
								width: 80,
								height: 30
							}
						});

						// 清空单元格文本
						worksheet.getCell(`${colLetter}${rowIndex}`).value = '';
					} catch (error) {
						uni.hideLoading();
						console.error(`第 ${i+1} 行图片嵌入失败：`, error);
						vk.alert(error.message || '导出失败，请重试');
						// 保留 URL 文本
					}
				}
				// ========== 图片处理结束 ==========

				// 导出
				const buffer = await workbook.xlsx.writeBuffer();
				const blob = new Blob([buffer], {
					type: 'application/octet-stream'
				});
				FileSaver.saveAs(blob, `${attendance_ym}月份工资条（含签名）.xlsx`);
				uni.hideLoading();
				vk.alert('导出成功！');
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