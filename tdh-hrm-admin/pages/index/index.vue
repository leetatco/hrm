<template>
	<div class="dashboard-container">
		<!-- 数据概览 -->
		<el-row :gutter="20">
			<el-col :span="3" v-for="(item, index) in overviewData" :key="index">
				<el-card shadow="hover" :body-style="{ backgroundColor: item.color }">
					<div class="card-content">
						<i :class="item.icon"></i>
						<span>{{ item.title }}</span>
						<h2>{{ item.value }}</h2>
					</div>
				</el-card>
			</el-col>
		</el-row>
		<!-- 图表区域 -->
		<el-row :gutter="20" style="margin-top: 20px">
			<!-- 各部门人数分布 -->
			<el-col :span="10">
				<el-card shadow="hover">
					<div slot="header" class="chart-header">
						<span>各中心人数分布</span>
					</div>
					<div ref="CenterChart" style="height: 200px;"></div>
				</el-card>
				<el-card shadow="hover" style="margin-top: 20px;">
					<div slot="header" class="chart-header">
						<span>各省人数分布</span>
					</div>
					<div ref="ProvinceChart" style="height: 200px;"></div>
				</el-card>
			</el-col>

			<!-- 性别分布、学历分布、合同类型分布 -->
			<el-col :span="7">
				<el-card shadow="hover">
					<div slot="header" class="chart-header">
						<span>性别分布</span>
					</div>
					<div ref="genderChart" style="height: 200px;"></div>
				</el-card>
				<el-card shadow="hover" style="margin-top: 20px;">
					<div slot="header" class="chart-header">
						<span>学历分布</span>
					</div>
					<div ref="educationChart" style="height: 200px;"></div>
				</el-card>
			</el-col>

			<!-- 年龄分布、司龄分布 -->
			<el-col :span="7">
				<el-card shadow="hover">
					<div slot="header" class="chart-header">
						<span>年龄分布</span>
					</div>
					<div ref="ageChart" style="height: 200px;"></div>
				</el-card>
				<el-card shadow="hover" style="margin-top: 20px;">
					<div slot="header" class="chart-header">
						<span>合同类型分布</span>
					</div>
					<div ref="contractChart" style="height: 200px;"></div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				companys: [],
				overviewData: {
					zrs: {
						title: '在职人数',
						value: '0人',
						color: '#00a65a',
						icon: 'el-icon-user-solid'
					},
					lzry: {
						title: '离职人数',
						value: '0人',
						color: '#f39c12',
						icon: 'el-icon-warning-outline'
					},
					yg: {
						title: '普通员工',
						value: '0人',
						color: '#00c0ef',
						icon: 'el-icon-s-promotion'
					},
					jcgl: {
						title: '基层管理',
						value: '0人',
						color: '#f56c6c',
						icon: 'el-icon-star-on'
					},
					zcgl: {
						title: '中层管理',
						value: '0人',
						color: '#e67e22',
						icon: 'el-icon-trophy'
					},
					gg: {
						title: '高层管理',
						value: '0人',
						color: '#d33682',
						icon: 'el-icon-medal-1'
					},
					ageAvg: {
						title: '平均年龄',
						value: '0年',
						color: '#00a65a',
						icon: 'el-icon-date'
					},
					yearAvg: {
						title: '平均司龄',
						value: '0年',
						color: '#f39c12',
						icon: 'el-icon-time'
					}
				}
			};
		},
		async mounted() {
			this.companys = await this.getCompanys();
			this.initResignChart();
			this.initCenterChart();
			this.initGenderChart();
			this.initEducationChart();
			this.initContractChart();
			this.initAgeChart();
			this.initProvinceChart();
			this.initViewData();
			this.initManages();
			// 加载未读通知数量
			this.loadUnreadCount();
			this.loadUnProcessCount();
		},
		methods: {
			// 加载未读通知数量
			async loadUnreadCount() {
				try {
					const res = await this.vk.callFunction({
						url: 'admin/bpmn/notification/pub/getList',
						title: '加载中...',
						data: {
							status: 'unread',
							userInfo: this.vk.getVuex('$user.userInfo')
						}
					});

					if (res.code === 0) {
						this.unreadCount = res.data.total || 0;
						this.vk.setVuex('$user.unReadCount', this.unreadCount)
					}
				} catch (error) {
					console.error('加载未读通知数量失败:', error);
				}
			},
			// 加载未处理表单
			async loadUnProcessCount() {
				try {
					const res = await this.vk.callFunction({
						url: 'admin/bpmn/task/sys/getList',
						title: '加载中...',
						data: {
							userInfo: this.vk.getVuex('$user.userInfo'),
							formData: {
								status: "pending"
							}
						}
					});

					if (res.code === 0) {
						this.unProcessCount = res.rows.length || 0;
						this.vk.setVuex('$user.unProcessCount', this.unProcessCount)
					}
				} catch (error) {
					console.error('加载未读通知数量失败:', error);
				}
			},
			//得到人员角色所有公司别
			async getCompanys() {
				let data = await vk.callFunction({
					url: 'admin/hrm/employees/pub/getRoleCompanys',
					title: '请求中...',
					data: {
						user: this.vk.getVuex('$user.userInfo')
					},
				});

				return data.rows
			},

			//计算离职人员
			async initResignChart() {
				let res = await vk.callFunction({
					url: 'admin/hrm/employees/pub/getResignTotal',
					title: '请求中...',
					data: {
						companys: this.companys
					},
				});

				this.overviewData.lzry.value = res.total + '人';
			},
			//计算平均司龄和年龄
			async initViewData() {
				let res = await vk.callFunction({
					url: 'admin/hrm/employees/pub/getTotal',
					title: '请求中...',
					data: {
						companys: this.companys
					},
				});

				let totalPls = res.data.total || 0;
				let ageAvg = res.data.avg_age || 0;
				let yearAvg = res.data.avg_tenure || 0;

				this.overviewData.zrs.value = totalPls + "人";
				this.overviewData.ageAvg.value = ageAvg + "岁";
				this.overviewData.yearAvg.value = yearAvg + "年";
			},
			//计算中心人数
			async initCenterChart() {
				const chart = this.$echarts.init(this.$refs.CenterChart);
				const option = {
					tooltip: {
						trigger: 'axis'
					},
					xAxis: {
						type: 'category',
						data: []
					},
					yAxis: {
						type: 'value'
					},
					series: {
						type: 'bar',
						data: [],
						itemStyle: {
							color: '#00c0ef'
						}
					}
				};

				let res = await vk.callFunction({
					url: 'admin/hrm/employees/pub/getCenters',
					title: '请求中...',
					data: {
						companys: this.companys
					},
				});

				res.rows.map((item, index) => {
					option.xAxis.data.push(item.centers.center_name);
					option.series.data.push(item.count);
				})

				chart.setOption(option);
			},
			//计算男女人数
			async initGenderChart() {
				const chart = this.$echarts.init(this.$refs.genderChart);
				const option = {
					tooltip: {
						trigger: 'item'
					},
					series: {
						type: 'pie',
						data: [],
						color: ['#f56c6c', '#00c0ef']
					}
				};


				let res = await vk.callFunction({
					url: 'admin/hrm/employees/pub/getGenders',
					title: '请求中...',
					data: {
						companys: this.companys
					},
				});

				res.rows.map((item, index) => {
					let gender_name = item.gender == 1 ? '男' : '女';
					option.series.data.push({
						value: item.count,
						name: gender_name
					})
				})

				chart.setOption(option);
			},
			//计算教育人数
			async initEducationChart() {
				const chart = this.$echarts.init(this.$refs.educationChart);
				const option = {
					tooltip: {
						trigger: 'axis'
					},
					xAxis: {
						type: 'category',
						data: []
					},
					yAxis: {
						type: 'value'
					},
					series: {
						type: 'line',
						data: [],
						itemStyle: {
							color: '#00c0ef'
						}
					}
				};

				let res = await vk.callFunction({
					url: 'admin/hrm/employees/pub/getEducationals',
					title: '请求中...',
					data: {
						companys: this.companys
					}
				})

				res.rows.map((item, index) => {
					option.xAxis.data.push(item.educationals.educational_name);
					option.series.data.push(item.count);
				})

				chart.setOption(option);
			},
			//计算合同人数
			async initContractChart() {
				const chart = this.$echarts.init(this.$refs.contractChart);
				const option = {
					tooltip: {
						trigger: 'item'
					},
					series: {
						type: 'pie',
						data: [],
						color: ['#f39c12', '#f56c6c', '#00c0ef']
					}
				};

				let res = await vk.callFunction({
					url: 'admin/hrm/employees/pub/getContracts',
					title: '请求中...',
					data: {
						companys: this.companys
					}
				})

				res.rows.map((item, index) => {
					option.series.data.push({
						value: item.count,
						name: item.contracts.contract_name
					})
				})

				chart.setOption(option);
			},
			async initManages() {
				/*
				员工(yg)：11以下
				储备干部(cbgb)：11-12级
				基层管理(jcgl)：12-13级
				中层管理(zcgl)：13-14级
				高管(gg)：14级以上
				*/
				const positions = {
					yg: {
						start: 11,
						end: 29
					},
					// cbgb: {
					// 	start: 11,
					// 	end: 12
					// },
					jcgl: {
						start: 7,
						end: 10
					},
					zcgl: {
						start: 5,
						end: 6
					},
					gg: {
						start: 1,
						end: 4
					}
				}

				let total_yg = 0;
				// let total_cbgb = 0;
				let total_jcgl = 0;
				let total_zcgl = 0;
				let total_gg = 0;
				for (let key in positions) {
					let res = await vk.callFunction({
						url: 'admin/hrm/employees/pub/getManages',
						title: '请求中...',
						data: {
							companys: this.companys,
							key: positions[key]
						}
					})
					if (res.total > 0) {
						switch (key) {
							case 'yg':
								total_yg = res.total
								break;
								// case 'cbgb':
								// 	total_cbgb = res.total
								// 	break;
							case 'jcgl':
								total_jcgl = res.total
								break;
							case 'zcgl':
								total_zcgl = res.total
								break;
							default:
								total_gg = res.total
								break;
						}
					}
				}
				this.overviewData.yg.value = total_yg + "人";
				// this.overviewData.cbgb.value = total_cbgb + "人";
				this.overviewData.jcgl.value = total_jcgl + "人";
				this.overviewData.zcgl.value = total_zcgl + "人";
				this.overviewData.gg.value = total_gg + "人";
			},
			async initAgeChart() {
				const ages = {
					20: {
						start: 20,
						end: 30
					},
					30: {
						start: 30,
						end: 40
					},
					40: {
						start: 40,
						end: 50
					},
					50: {
						start: 50,
						end: 60
					}
				}
				const chart = this.$echarts.init(this.$refs.ageChart);
				const option = {
					tooltip: {
						trigger: 'axis'
					},
					xAxis: {
						type: 'category',
						data: []
					},
					yAxis: {
						type: 'value'
					},
					series: {
						type: 'line',
						data: [],
						itemStyle: {
							color: '#00c0ef'
						}
					}
				};

				for (let key in ages) {
					let res = await vk.callFunction({
						url: 'admin/hrm/employees/pub/getAges',
						title: '请求中...',
						data: {
							key: ages[key],
							companys: this.companys
						}
					})
					if (res.total > 0) {
						option.xAxis.data.push(ages[key].start + '至' + ages[key].end);
						option.series.data.push(res.total);
					}
					chart.setOption(option);
				}
			},
			async initProvinceChart() {
				const provinces = {
					// "11": "北京",
					// "12": "天津",
					// "13": "河北",
					// "14": "山西",
					// "15": "内蒙古",
					// "21": "辽宁",
					// "22": "吉林",
					// "23": "黑龙江",
					// "31": "上海",
					// "32": "江苏",
					// "33": "浙江",
					"34": "安徽",
					"35": "福建",
					"36": "江西",
					"37": "山东",
					"41": "河南",
					"42": "湖北",
					"43": "湖南",
					"44": "广东",
					"45": "广西",
					"46": "海南",
					"50": "重庆",
					"51": "四川",
					"52": "贵州",
					"53": "云南",
					// "54": "西藏",
					// "61": "陕西",
					// "62": "甘肃",
					// "63": "青海",
					// "64": "宁夏",
					// "65": "新疆",
					// "81": "香港",
					// "82": "澳门",
					// "83": "台湾"
				}

				const chart = this.$echarts.init(this.$refs.ProvinceChart);
				const option = {
					tooltip: {
						trigger: 'axis'
					},
					xAxis: {
						type: 'category',
						data: []
					},
					yAxis: {
						type: 'value'
					},
					series: {
						type: 'bar',
						data: [],
						itemStyle: {
							color: '#00c0ef'
						}
					}
				};

				Object.keys(provinces).forEach(async (key) => {
					let res = await vk.callFunction({
						url: 'admin/hrm/employees/pub/getProvinces',
						title: '请求中...',
						data: {
							key,
							companys: this.companys
						}
					})

					if (res.total > 0) {
						option.xAxis.data.push(provinces[key]);
						option.series.data.push(res.total);
					}

					chart.setOption(option);
				})

			}
		}
	}
</script>

<style scoped>
	.dashboard-container {
		padding: 20px;
		background-color: #f5f7fa;
	}

	.card-content {
		text-align: center;
		padding: 20px 0;
	}

	.card-content i {
		font-size: 24px;
		display: block;
		margin-bottom: 10px;
	}

	.chart-header {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}
</style>