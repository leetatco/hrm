<template>
	<vk-data-dialog v-model="value.show" :title="dialogTitle" width="500px" top="10vh"
		:close-on-click-modal="false" @open="onOpen" @closed="onClose">
		<el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="padding: 10px 20px;">
			<el-form-item :label="dateLabel" prop="seal_date">
				<el-date-picker v-model="form.seal_date" type="date" value-format="yyyy-MM-dd"
					:placeholder="datePlaceholder" style="width: 100%;"></el-date-picker>
			</el-form-item>
			<el-form-item label="员工" prop="employee_ids">
				<vk-data-input-table-select v-model="form.employee_ids" multiple
					action="admin/hrm/employees/sys/getList" placeholder="留空表示全体人员" :columns="[
			          { key: 'employee_id', title: '员工工号', type: 'text', idKey: true },
			          { key: 'employee_name', title: '员工姓名', type: 'text', nameKey: true }
			        ]" :queryColumns="[
			          { key: 'employee_id', title: '员工工号', type: 'text', width: 150, mode: '%%' },
			          { key: 'employee_name', title: '员工姓名', type: 'text', width: 150, mode: '%%' }
			        ]"></vk-data-input-table-select>
				<view style="color:#999;font-size:12px;margin-top:5px;">留空表示{{ modeText }}全体人员的数据</view>
			</el-form-item>
			<el-alert :type="isSeal ? 'warning' : 'info'" :closable="false" :title="alertText"></el-alert>
		</el-form>
		<template v-slot:footer>
			<el-button @click="value.show = false">取消</el-button>
			<el-button :type="isSeal ? 'primary' : 'warning'" :loading="loading" @click="doAction">
				{{ isSeal ? '执行封存' : '执行解封' }}
			</el-button>
		</template>
	</vk-data-dialog>
</template>

<script>
	let vk = uni.vk;
	export default {
		name: 'attendance-seal',
		props: {
			value: {
				type: Object,
				default: () => ({
					show: false,
					mode: 'seal',
					seal_date: '',
					employee_ids: []
				})
			}
		},
		data() {
			return {
				loading: false,
				form: {
					seal_date: '',
					employee_ids: []
				},
				rules: {
					seal_date: [{
						required: true,
						message: '请选择日期',
						trigger: ['blur', 'change']
					}]
				}
			};
		},
		computed: {
			isSeal() {
				return this.value.mode !== 'unseal';
			},
			dialogTitle() {
				return this.isSeal ? '封存日考勤数据' : '解封日考勤数据';
			},
			dateLabel() {
				return this.isSeal ? '封存日期' : '解封日期';
			},
			datePlaceholder() {
				return this.isSeal ? '选择封存日期（含当天）' : '选择解封日期（含当天）';
			},
			modeText() {
				return this.isSeal ? '封存' : '解封';
			},
			alertText() {
				return this.isSeal ?
					'封存后，该日期及之前的日考勤数据将不允许被重算覆盖，请谨慎操作。' :
					'解封后，该日期及之前的日考勤数据将允许被重算覆盖。';
			}
		},
		methods: {
			onOpen() {
				this.form.seal_date = this.value.seal_date || '';
				this.form.employee_ids = this.value.employee_ids || [];
				this.$nextTick(() => {
					if (this.$refs.formRef) this.$refs.formRef.clearValidate();
				});
			},
			onClose() {
				this.form.seal_date = '';
				this.form.employee_ids = [];
			},
			async doAction() {
				const valid = await this.$refs.formRef.validate().catch(() => false);
				if (!valid) return;

				const actionText = this.isSeal ? '封存' : '解封';

				// 封存用普通确认，解封要求输入“解封”二次确认
				let confirm = false;
				if (this.isSeal) {
					confirm = await new Promise(resolve => {
						vk.confirm(
							`确认封存 ${this.form.seal_date} 及之前的日考勤数据？封存后将不允许被重算覆盖。`,
							'提示',
							'确定',
							'取消',
							(res) => resolve(res.confirm)
						);
					});
				} else {
					confirm = await new Promise(resolve => {
						vk.prompt(
							`解封会允许重算覆盖历史数据，请谨慎操作。请输入"解封"确认：`,
							'解封确认',
							'确定',
							'取消',
							(res) => {
								if (res.confirm && res.content === '解封') {
									resolve(true);
								} else if (res.confirm) {
									vk.toast('输入不正确');
									resolve(false);
								} else {
									resolve(false);
								}
							}
						);
					});
				}
				if (!confirm) return;

				this.loading = true;
				try {
					const url = this.isSeal ?
						'admin/hrm/attendance/sys/sealDailyData' :
						'admin/hrm/attendance/sys/unsealDailyData';
					const res = await vk.callFunction({
						url,
						title: `${actionText}中...`,
						data: {
							seal_date: this.form.seal_date,
							employee_ids: this.form.employee_ids
						}
					});
					if (res.code === 0) {
						vk.alert(res.msg, '提示', () => {
							this.value.show = false;
							this.$emit('success', res);
						});
					} else {
						vk.toast(res.msg || `${actionText}失败`);
					}
				} catch (e) {
					vk.toast('请求异常');
				} finally {
					this.loading = false;
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
</style>