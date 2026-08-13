<template>
	<div class="page-body">
		<div id="button">
			<el-button type="success" size="small" round icon="vk-icon-punch_light" v-print="printAre">列印</el-button>
		</div>
		<el-table id="printAre" border :data="datas" style="width: 100%" size="small">
			<el-table-column prop="total_salary" label="综合工资">
			</el-table-column>
			<el-table-column prop="rest_type_name" label="休息类型">
			</el-table-column>
			<el-table-column prop="attendance_ym" label="考勤日期">
			</el-table-column>
			<el-table-column prop="employees.employee_id" label="员工工号">
			</el-table-column>
			<el-table-column prop="employees.employee_name" label="员工姓名">
			</el-table-column>
			<el-table-column prop="card" label="身份证号码" width="91">
			</el-table-column>
			<el-table-column prop="employees.departments.department_name" label="部门">
			</el-table-column>
			<el-table-column prop="employees.positions.position_name" label="职位">
			</el-table-column>
			<el-table-column prop="employees.hire_date" label="入职日期">
			</el-table-column>
			<el-table-column prop="employees.resign_date" label="离职日期">
			</el-table-column>
			<el-table-column prop="base_salary" label="基本工资">
			</el-table-column>
			<el-table-column prop="performance_salary" label="绩效工资">
			</el-table-column>
			<el-table-column prop="overtime_fee" label="固定加班">
			</el-table-column>
			<el-table-column prop="housing_fund" label="公积补偿金" width="91">
			</el-table-column>
			<el-table-column prop="annual_allowance" label="年度补偿金" width="91">
			</el-table-column>
			<el-table-column prop="floating_bonus" label="浮动奖励">
			</el-table-column>
			<el-table-column prop="confidentiality_fee" label="保密费">
			</el-table-column>
			<el-table-column prop="work_days" label="应勤天数">
			</el-table-column>
			<el-table-column prop="real_days" label="实际出勤">
			</el-table-column>
			<el-table-column prop="gross_salary" label="应发工资">
			</el-table-column>
			<el-table-column prop="overtime_cost" label="加班费">
			</el-table-column>
			<el-table-column prop="free_cost" label="放假补助">
			</el-table-column>
			<el-table-column prop="grant" label="补助金">
			</el-table-column>
			<el-table-column prop="agency_fee" label="介绍费">
			</el-table-column>
			<el-table-column prop="other_cost" label="其他费用">
			</el-table-column>
			<el-table-column prop="we_cost" label="水电费">
			</el-table-column>
			<el-table-column prop="clothes_cost" label="工衣费用">
			</el-table-column>
			<el-table-column prop="earlytime_cost" label="迟/早退费" width="85">
			</el-table-column>
			<el-table-column prop="missed_cost" label="未打卡费">
			</el-table-column>
			<el-table-column prop="loan_cost" label="借款">
			</el-table-column>
			<el-table-column prop="last_month_sb" label="上月社保">
			</el-table-column>
			<el-table-column prop="last_month_dk" label="代扣部份">
			</el-table-column>
			<el-table-column prop="this_month_sb" label="本月社保">
			</el-table-column>
			<el-table-column prop="this_month_dk" label="代扣部份">
			</el-table-column>
			<el-table-column prop="dkgs" label="代扣个税">
			</el-table-column>
			<el-table-column prop="real_salary" label="实发工资">
			</el-table-column>
			<el-table-column prop="company_sb" label="公司部份社保" width="110">
			</el-table-column>
		</el-table>
	</div>
</template>
<script>
	let nowy = new Date(vk.pubfn.getOffsetTime(new Date(), {
		mode: "before", // after 之后 before 之前
	})).getFullYear();

	let nowm = new Date(vk.pubfn.getOffsetTime(new Date(), {
		mode: "before", // after 之后 before 之前
	})).getMonth();

	nowm = nowm > 9 ? nowm : `0${nowm}`;

	const nowym = `${nowy}-${nowm}`;
	export default {
		props: {
			datas: Array
		},
		data() {
			return {
				printAre: {
					id: "printAre",
					popTitle: `${nowym}月工资表`,
					extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
					// 添加打印样式
					style: '.print-table, .print-table th, .print-table td { border: 1px solid #000 !important; }'
				}
			}
		}
	}
</script>
<style lang="scss" scoped>
	.page-body {
		#printAre {
			padding: 10px;
		}

		#button {
			padding-bottom: 10px;
		}
	}
</style>