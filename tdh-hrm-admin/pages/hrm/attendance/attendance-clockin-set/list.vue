<template>
	<view class="page-body">
		<!-- 搜索区域 -->
		<vk-data-table-query ref="queryForm1" v-model="queryForm1.formData" :columns="queryForm1.columns"
			@search="search" @reset="resetForm">
		</vk-data-table-query>

		<!-- 操作按钮 -->
		<view class="btn-group">
			<el-row>
				<el-button type="success" size="small" icon="el-icon-circle-plus-outline"
					v-if="$hasRole('admin') || $hasPermission('attendance-wificonfig-add')" @click="addBtn">添加打卡点</el-button>
			</el-row>
		</view>

		<!-- 表格区域 -->
		<vk-data-table ref="table1" :action="table1.action" :columns="table1.columns" :query-form-param="queryForm1"
			:right-btns="table1.rightBtns" :selection="false" :row-no="false" :pagination="true"
			@update="updateBtn" @delete="deleteBtn">
		</vk-data-table>

		<!-- 添加/编辑弹窗 -->
		<vk-data-dialog v-model="form1.props.show" :title="form1.props.title" width="750px" mode="form"
			:close-on-click-modal="false">
			<vk-data-form ref="form1" v-model="form1.data" :rules="form1.props.rules" :action="form1.props.action"
				:form-type="form1.props.formType" :columns='form1.props.columns' label-width="140px" :inline="true"
				:columnsNumber="2" @success="form1.props.show = false;refresh();" :border="true"></vk-data-form>
		</vk-data-dialog>
	</view>
</template>

<script>
let vk = uni.vk;
let originalForms = {};
const colWidth = 200;
export default {
	data() {
		return {
			table1: {
				action: "admin/hrm/clockin/sys/setting/getList",
				rightBtns: [
					{
						mode: 'detail_auto',
						title: '详细',
						show: () => this.$hasRole('admin') || this.$hasPermission('attendance-wificonfig-view')
					},
					{
						mode: 'update',
						title: '编辑',
						show: () => this.$hasRole('admin') || this.$hasPermission('attendance-wificonfig-edit')
					},
					{
						mode: 'delete',
						title: '删除',
						show: () => this.$hasRole('admin') || this.$hasPermission('attendance-wificonfig-delete')
					}
				],
				columns: [
					{
						key: "address",
						title: "位置",
						type: "text",
						width: colWidth,
						fixed: true
					},
					{
						key: "bssid",
						title: "WiFi名称",
						type: "text",
						width: colWidth
					},
					{
						key: "ssid",
						title: "WiFi Mac",
						type: "text",
						width: colWidth
					},					
					{
						key: "signalStrength",
						title: "信号强度",
						type: "number",
						width: colWidth - 60
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
				]
			},
			queryForm1: {
				formData: {},
				columns: [
					{
						key: "address",
						title: "位置",
						type: "text",
						width: colWidth,
						mode: "%%"
					},
					{
						key: "bssid",
						title: "WiFi名称",
						type: "text",
						width: colWidth,
						mode: "%%"
					}
				]
			},
			form1: {
				data: {
					address: '',
					longitude: 0,
					latitude: 0,
					distance_in: 100,
					bssid: '',
					ssid: '',
					signalStrength: 0
				},
				props: {
					action: "",
					columns: [
						{
							key: "address",
							title: "位置描述",
							type: "text",
							width: colWidth,
							required: true,
							placeholder: "如：公司一楼大厅"
						},
						{
							key: "bssid",
							title: "WiFi名称 (BSSID)",
							type: "text",
							width: colWidth,
							required: true,
							placeholder: "连接的WiFi名"
						},
						{
							key: "ssid",
							title: "WiFi Mac (SSID)",
							type: "text",
							width: colWidth,
							required: true,
							placeholder: "WiFi路由器MAC地址"
						},						
						{
							key: "signalStrength",
							title: "最低信号强度",
							type: "number",
							width: colWidth - 60,
							description: "0～100，低于此值可能无法打卡"
						}
					],
					rules: {
						address: [{ required: true, message: "位置描述不能为空", trigger: "blur" }],
						bssid: [{ required: true, message: "WiFi名称不能为空", trigger: "blur" }],
						ssid: [{ required: true, message: "WiFi Mac不能为空", trigger: "blur" }]						
					},
					formType: "",
					title: "",
					show: false
				}
			}
		};
	},
	onLoad() {
		originalForms = { form1: vk.pubfn.copyObject(this.form1) };
	},
	methods: {
		search() { this.$refs.table1.search(); },
		refresh() { this.$refs.table1.refresh(); },
		resetForm() { vk.pubfn.resetForm(originalForms, this); },
		addBtn() {
			this.resetForm();
			this.form1.props.action = 'admin/hrm/clockin/sys/setting/add';
			this.form1.props.formType = 'add';
			this.form1.props.title = '添加打卡点';
			this.form1.props.show = true;
		},
		updateBtn({ item }) {
			this.form1.props.action = 'admin/hrm/clockin/sys/setting/update';
			this.form1.props.formType = 'update';
			this.form1.props.title = '编辑打卡点';
			this.form1.props.show = true;
			this.form1.data = { ...item };
		},
		deleteBtn({ item, deleteFn }) {
			deleteFn({
				action: "admin/hrm/clockin/sys/setting/delete",
				data: { _id: item._id }
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.page-body { padding: 20rpx; }
.btn-group { margin: 20rpx 0; }
</style>