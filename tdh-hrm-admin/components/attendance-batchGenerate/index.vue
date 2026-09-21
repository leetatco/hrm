<template>
	<vk-data-dialog v-model="value.show" :title="page.title" :top="page.top" :width="page.width" mode="form"
		@open="onOpen" @closed="onClose">
		<vk-data-form ref="form1" v-loading="page.loading" v-model="form1.data" :rules="form1.props.rules"
			:action="form1.props.action" :columns="form1.props.columns" :loading.sync="form1.props.loading"
			:label-width="form1.props.labelWidth" :show-cancel="page.showCancel" :cancel-text="page.cancelText"
			:submit-text="page.submitText" @success="onFormSuccess">
		</vk-data-form>
	</vk-data-dialog>
</template>

<script>
	let that;
	let vk = uni.vk;
	export default {
		props: {
			value: {
				type: Object,
				default: () => ({
					show: false,
					item: {} // 可传入 { attendance_group_id: 'xxx' } 等初始值
				})
			}
		},
		data() {
			return {
				page: {
					title: "批量生成排班",
					submitText: "生成",
					cancelText: "关闭",
					showCancel: true,
					top: "10vh",
					width: "600px",
					loading: false
				},
				form1: {
					data: {
						attendance_group_id: "",
						start_date: "",
						end_date: ""
					},
					props: {
						action: "admin/hrm/attendance/sys/schedule/batchGenerate",
						columns: [{
								key: "attendance_group_id",
								title: "考勤组",
								type: "cascader",
								placeholder: "请选择考勤组（含班次）",
								required: true,
								action: "admin/hrm/attendance/sys/schedule/getCascader",
								props: {
									list: "rows",
									value: "_id",
									label: "label",
									children: "children",
									emitPath: false
								}
							},
							{
								key: "start_date",
								title: "开始日期",
								type: "date",
								dateType: "date",
								valueFormat: "yyyy-MM-dd",
								required: true
							},
							{
								key: "end_date",
								title: "结束日期",
								type: "date",
								dateType: "date",
								valueFormat: "yyyy-MM-dd",
								required: true
							}
						],
						rules: {
							attendance_group_id: [{
								required: true,
								message: "请选择考勤组",
								trigger: "change"
							}],
							start_date: [{
								required: true,
								message: "请选择开始日期",
								trigger: "blur"
							}],
							end_date: [{
								required: true,
								message: "请选择结束日期",
								trigger: "blur"
							}]
						},
						labelWidth: "120px"
					}
				}
			};
		},
		mounted() {
			that = this;
			that.init();
		},
		methods: {
			init() {
				that.$emit("input", that.value);
			},
			onOpen() {
				that = this;
				// 延迟到下一帧确保表单已挂载
				this.$nextTick(() => {
					if (that.$refs.form1) {
						// 先重置表单数据
						that.$refs.form1.resetForm();
						// 如果传入了考勤组ID，则设置为默认值
						if (that.value.item && that.value.item.attendance_group_id) {
							that.form1.data.attendance_group_id = that.value.item.attendance_group_id;
						}
					}
				});
			},
			onClose() {
				if (that.$refs.form1) {
					that.$refs.form1.resetForm();
				}
			},
			onFormSuccess(res) {
				that.value.show = false;
				that.$emit("success", res.data);
			}
		}
	};
</script>

<style scoped>
</style>