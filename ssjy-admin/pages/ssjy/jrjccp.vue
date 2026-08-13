<template>
	<div class="dining-rate-analysis-system">
		<!-- 侧边导航栏（保持不变） -->
		<div class="sidebar">
			<div class="logo">食堂管理中心</div>

			<div class="menu-section">
				<div class="section-title">核心监管</div>
				<ul class="menu">
					<li v-for="item in coreMenu" :key="item.id" :class="{ active: activeMenu === item.id }"
						@click="switchMenu(item.id)">
						<i :class="'el-icon-' + item.icon"></i>
						<span>{{ item.name }}</span>
					</li>
				</ul>
			</div>

			<div class="menu-section">
				<div class="section-title">数据管理</div>
				<ul class="menu">
					<li v-for="item in dataMenu" :key="item.id" :class="{ active: activeMenu === item.id }"
						@click="switchMenu(item.id)">
						<i :class="'el-icon-' + item.icon"></i>
						<span>{{ item.name }}</span>
					</li>
				</ul>
			</div>

			<div class="menu-section">
				<div class="section-title">系统管理</div>
				<ul class="menu">
					<li v-for="item in systemMenu" :key="item.id" :class="{ active: activeMenu === item.id }"
						@click="switchMenu(item.id)">
						<i :class="'el-icon-' + item.icon"></i>
						<span>{{ item.name }}</span>
					</li>
				</ul>
			</div>
		</div>

		<!-- 主内容区（动态切换） -->
		<div class="main-content">
			<!-- 顶部标题栏（标题根据当前菜单变化） -->
			<div class="top-bar">
				<div class="title-area">
					<h1>{{ pageTitle }}</h1>
					<p class="subtitle">{{ pageSubtitle }}</p>
				</div>
				<div class="update-time">
					<span>数据更新至 {{ currentTime }}</span>
				</div>
			</div>

			<!-- 就餐分析专属内容：监控卡片 + 图表 + 菜品排行 -->
			<template v-if="activeMenu === '就餐分析'">
				<!-- 核心监控区卡片（固定数据） -->
				<div class="monitor-cards">
					<div class="monitor-card">
						<div class="card-icon">
							<i class="icon-dining"></i>
						</div>
						<div class="card-content">
							<div class="card-title">今日就餐率</div>
							<div class="card-value">78.5%</div>
							<div class="card-trend up">
								<i class="icon-up"></i>
								较昨日上升 4.2%
							</div>
						</div>
					</div>

					<div class="monitor-card">
						<div class="card-icon">
							<i class="icon-hot-dish"></i>
						</div>
						<div class="card-content">
							<div class="card-title">热销菜品TOP1</div>
							<div class="card-value">红烧牛肉</div>
							<div class="card-desc">销量 186 份 | 满意度 98%</div>
						</div>
					</div>

					<div class="monitor-card">
						<div class="card-icon">
							<i class="icon-busy-window"></i>
						</div>
						<div class="card-content">
							<div class="card-title">最忙服务窗口</div>
							<div class="card-value">3号窗口</div>
							<div class="card-desc">接单 218 单 | 平均等待 2.3分钟</div>
						</div>
					</div>

					<div class="monitor-card">
						<div class="card-icon">
							<i class="icon-satisfaction"></i>
						</div>
						<div class="card-content">
							<div class="card-title">整体满意度</div>
							<div class="card-value">92.3%</div>
							<div class="card-trend up">
								<i class="icon-up"></i>
								较上周上升 1.8%
							</div>
						</div>
					</div>
				</div>

				<!-- 图表分析区 -->
				<div class="chart-analysis">
					<!-- 左侧：近7天就餐率趋势图 -->
					<div class="chart-left">
						<div class="chart-header">
							<h2>近7天就餐率趋势</h2>
							<div class="chart-legend">
								<span class="legend-item rate">
									<span class="legend-dot"></span>
									就餐率
								</span>
								<span class="legend-item capacity">
									<span class="legend-dot"></span>
									食堂容量上限
								</span>
							</div>
						</div>
						<div class="chart-container">
							<div ref="trendChart" class="echarts-chart"></div>
						</div>
					</div>

					<!-- 右侧：菜品品类销售占比饼图 -->
					<div class="chart-right">
						<div class="chart-header">
							<h2>菜品品类销售占比</h2>
							<div class="chart-actions">
								<button class="action-btn active">全部</button>
								<button class="action-btn">导出数据</button>
								<button class="action-btn">刷新</button>
								<button class="action-btn">筛选</button>
							</div>
						</div>
						<div class="chart-container">
							<div ref="pieChart" class="echarts-chart"></div>
						</div>
					</div>
				</div>

				<!-- 详细数据区：TOP10菜品销量排行 -->
				<div class="detail-data">
					<div class="detail-header">
						<h2>TOP10菜品销量排行</h2>
					</div>
					<div class="detail-container">
						<div class="ranking-list">
							<div class="ranking-item" v-for="(item, index) in topDishes" :key="item.id">
								<div class="rank-number">{{ index + 1 }}</div>
								<div class="dish-info">
									<div class="dish-name">{{ item.name }}</div>
									<div class="dish-sales">{{ item.sales }} 份</div>
								</div>
								<div class="sales-bar">
									<div class="bar-bg">
										<div class="bar-fill"
											:style="{ width: `${item.percentage}%`, backgroundColor: item.color }">
										</div>
									</div>
								</div>
								<div class="sales-count">{{ item.sales }} 份</div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<!-- 其他菜单的专属内容：概览卡片 + 明细表格 -->
			<template v-else>
				<div class="menu-content">
					<div class="content-body">
						<div class="menu-data">
							<h3>{{ getMenuTitle(activeMenu) }} 数据概览</h3>

							<div class="menu-cards">
								<div class="menu-card" v-for="stat in getMenuStats(activeMenu)" :key="stat.label">
									<div class="menu-card-icon">
										<i :class="stat.icon"></i>
									</div>
									<div class="menu-card-content">
										<div class="menu-card-label">{{ stat.label }}</div>
										<div class="menu-card-value">{{ stat.value }}</div>
										<div class="menu-card-trend" :class="stat.trend">
											{{ stat.change }}
										</div>
									</div>
								</div>
							</div>

							<div class="menu-table">
								<table>
									<thead>
										<tr>
											<th>项目</th>
											<th>今日数据</th>
											<th>昨日数据</th>
											<th>变化趋势</th>
										</tr>
									</thead>
									<tbody>
										<tr v-for="row in getMenuTableData(activeMenu)" :key="row.item">
											<td>{{ row.item }}</td>
											<td>{{ row.today }}</td>
											<td>{{ row.yesterday }}</td>
											<td>
												<span :class="row.trendClass">
													{{ row.trend }}
												</span>
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							<div class="menu-note">
								<p>注：以上为{{ getMenuTitle(activeMenu) }}功能的基础数据展示，详细功能正在开发中...</p>
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'DiningRateAnalysisSystem',

		data() {
			return {
				// 当前激活的菜单
				activeMenu: '就餐分析',

				// 当前时间
				currentTime: vk.pubfn.timeFormat(new Date(), 'yyyy-MM-dd hh:mm:ss'),

				// 核心监管菜单
				coreMenu: [{
						id: '实时监控',
						name: '实时监控',
						icon: 'video-camera'
					},
					{
						id: '预警管理',
						name: '预警管理',
						icon: 'warning-outline'
					},
					{
						id: '卫生检查',
						name: '卫生检查',
						icon: 'medal'
					},
					{
						id: '温湿度监控',
						name: '温湿度监控',
						icon: 'timer'
					} // 若 Element 无温度图标，可换为 'sunrise' 等
				],
				dataMenu: [{
						id: '食材溯源',
						name: '食材溯源',
						icon: 'grape'
					},
					{
						id: '采购台账',
						name: '采购台账',
						icon: 'shopping-cart-1'
					},
					{
						id: '就餐分析',
						name: '就餐分析',
						icon: 'data-analysis'
					},
					{
						id: '操作日志',
						name: '操作日志',
						icon: 'document'
					}
				],
				systemMenu: [{
						id: '设备管理',
						name: '设备管理',
						icon: 'set-up'
					},
					{
						id: '权限设置',
						name: '权限设置',
						icon: 'lock'
					},
					{
						id: '通知设置',
						name: '通知设置',
						icon: 'bell'
					},
					{
						id: '帮助中心',
						name: '帮助中心',
						icon: 'question'
					}
				],

				// TOP10菜品销量排行数据
				topDishes: [{
						id: 1,
						name: '红烧牛肉',
						sales: 186,
						percentage: 100,
						color: '#5B8FF9'
					},
					{
						id: 2,
						name: '回锅肉',
						sales: 178,
						percentage: 95.7,
						color: '#5AD8A6'
					},
					{
						id: 3,
						name: '红烧肉',
						sales: 172,
						percentage: 92.5,
						color: '#F6BD16'
					},
					{
						id: 4,
						name: '青椒炒肉',
						sales: 168,
						percentage: 90.3,
						color: '#E8684A'
					},
					{
						id: 5,
						name: '麻婆豆腐',
						sales: 160,
						percentage: 86.0,
						color: '#6F5DD7'
					},
					{
						id: 6,
						name: '清蒸鱼',
						sales: 160,
						percentage: 86.0,
						color: '#9C27B0'
					},
					{
						id: 7,
						name: '鱼香肉丝',
						sales: 142,
						percentage: 76.3,
						color: '#5B8FF9'
					},
					{
						id: 8,
						name: '宫保鸡丁',
						sales: 136,
						percentage: 73.1,
						color: '#5AD8A6'
					},
					{
						id: 9,
						name: '水煮肉片',
						sales: 134,
						percentage: 72.0,
						color: '#F6BD16'
					},
					{
						id: 10,
						name: '番茄炒蛋',
						sales: 124,
						percentage: 66.7,
						color: '#E8684A'
					}
				],

				// 菜单统计数据（用于其他菜单的概览卡片）
				menuStats: {
					'实时监控': [{
							label: '监控设备总数',
							value: '28台',
							trend: 'up',
							change: '较昨日 +2',
							icon: 'icon-device'
						},
						{
							label: '在线设备数',
							value: '26台',
							trend: 'up',
							change: '在线率 92.9%',
							icon: 'icon-online'
						},
						{
							label: '异常设备数',
							value: '2台',
							trend: 'warning',
							change: '需立即处理',
							icon: 'icon-warning'
						},
						{
							label: '今日报警次数',
							value: '12次',
							trend: 'down',
							change: '较昨日 -3',
							icon: 'icon-alert'
						}
					],
					'预警管理': [{
							label: '今日预警总数',
							value: '8条',
							trend: 'down',
							change: '较昨日 -2',
							icon: 'icon-warning'
						},
						{
							label: '高风险预警',
							value: '2条',
							trend: 'warning',
							change: '需立即处理',
							icon: 'icon-high'
						},
						{
							label: '中风险预警',
							value: '3条',
							trend: 'normal',
							change: '正在处理',
							icon: 'icon-medium'
						},
						{
							label: '低风险预警',
							value: '3条',
							trend: 'normal',
							change: '已处理',
							icon: 'icon-low'
						}
					],
					'卫生检查': [{
							label: '今日检查总数',
							value: '15次',
							trend: 'up',
							change: '较昨日 +3',
							icon: 'icon-check'
						},
						{
							label: '合格次数',
							value: '14次',
							trend: 'up',
							change: '合格率 93.3%',
							icon: 'icon-qualified'
						},
						{
							label: '不合格次数',
							value: '1次',
							trend: 'warning',
							change: '需整改',
							icon: 'icon-unqualified'
						},
						{
							label: '整改完成率',
							value: '100%',
							trend: 'up',
							change: '按时完成',
							icon: 'icon-complete'
						}
					],
					'温湿度监控': [{
							label: '监控点位总数',
							value: '32个',
							trend: 'normal',
							change: '全部正常',
							icon: 'icon-sensor'
						},
						{
							label: '温度异常点',
							value: '1个',
							trend: 'warning',
							change: '冷藏区2号',
							icon: 'icon-temperature'
						},
						{
							label: '湿度异常点',
							value: '0个',
							trend: 'up',
							change: '全部正常',
							icon: 'icon-humidity'
						},
						{
							label: '今日平均温度',
							value: '5.2°C',
							trend: 'normal',
							change: '符合标准',
							icon: 'icon-avg'
						}
					],
					'食材溯源': [{
							label: '今日采购食材',
							value: '28种',
							trend: 'up',
							change: '较昨日 +5',
							icon: 'icon-ingredient'
						},
						{
							label: '检测合格率',
							value: '96.4%',
							trend: 'up',
							change: '合格率上升',
							icon: 'icon-qualified'
						},
						{
							label: '供应商数量',
							value: '12家',
							trend: 'normal',
							change: '合作稳定',
							icon: 'icon-supplier'
						},
						{
							label: '溯源覆盖率',
							value: '100%',
							trend: 'up',
							change: '全部可追溯',
							icon: 'icon-trace'
						}
					],
					'采购台账': [{
							label: '今日采购金额',
							value: '￥8,562',
							trend: 'down',
							change: '较昨日 -12%',
							icon: 'icon-amount'
						},
						{
							label: '本月累计金额',
							value: '￥125,320',
							trend: 'up',
							change: '预算内',
							icon: 'icon-total'
						},
						{
							label: '供应商结算',
							value: '8家',
							trend: 'normal',
							change: '按时结算',
							icon: 'icon-settlement'
						},
						{
							label: '库存周转率',
							value: '2.3次',
							trend: 'up',
							change: '效率良好',
							icon: 'icon-turnover'
						}
					],
					'操作日志': [{
							label: '今日操作记录',
							value: '156条',
							trend: 'normal',
							change: '正常范围',
							icon: 'icon-log'
						},
						{
							label: '系统登录次数',
							value: '24次',
							trend: 'up',
							change: '较昨日 +3',
							icon: 'icon-login'
						},
						{
							label: '数据修改记录',
							value: '8条',
							trend: 'down',
							change: '较昨日 -2',
							icon: 'icon-edit'
						},
						{
							label: '异常操作记录',
							value: '0条',
							trend: 'up',
							change: '无异常',
							icon: 'icon-abnormal'
						}
					],
					'设备管理': [{
							label: '设备总数',
							value: '48台',
							trend: 'normal',
							change: '全部登记',
							icon: 'icon-device'
						},
						{
							label: '在线设备',
							value: '46台',
							trend: 'up',
							change: '在线率 95.8%',
							icon: 'icon-online'
						},
						{
							label: '故障设备',
							value: '2台',
							trend: 'warning',
							change: '需维修',
							icon: 'icon-fault'
						},
						{
							label: '维护计划',
							value: '8项',
							trend: 'normal',
							change: '按计划进行',
							icon: 'icon-maintenance'
						}
					],
					'权限设置': [{
							label: '系统用户数',
							value: '24人',
							trend: 'normal',
							change: '全部授权',
							icon: 'icon-user'
						},
						{
							label: '管理员数量',
							value: '3人',
							trend: 'normal',
							change: '权限正常',
							icon: 'icon-admin'
						},
						{
							label: '操作员数量',
							value: '18人',
							trend: 'up',
							change: '较上月 +2',
							icon: 'icon-operator'
						},
						{
							label: '权限变更记录',
							value: '5条',
							trend: 'down',
							change: '较昨日 -1',
							icon: 'icon-change'
						}
					],
					'通知设置': [{
							label: '今日通知总数',
							value: '28条',
							trend: 'up',
							change: '较昨日 +4',
							icon: 'icon-notification'
						},
						{
							label: '已读通知',
							value: '26条',
							trend: 'up',
							change: '已读率 92.9%',
							icon: 'icon-read'
						},
						{
							label: '未读通知',
							value: '2条',
							trend: 'warning',
							change: '需关注',
							icon: 'icon-unread'
						},
						{
							label: '通知类型',
							value: '5类',
							trend: 'normal',
							change: '分类清晰',
							icon: 'icon-type'
						}
					],
					'帮助中心': [{
							label: '帮助文档',
							value: '156篇',
							trend: 'up',
							change: '持续更新',
							icon: 'icon-doc'
						},
						{
							label: '常见问题',
							value: '45个',
							trend: 'normal',
							change: '覆盖全面',
							icon: 'icon-faq'
						},
						{
							label: '今日咨询',
							value: '8次',
							trend: 'down',
							change: '较昨日 -2',
							icon: 'icon-consult'
						},
						{
							label: '问题解决率',
							value: '100%',
							trend: 'up',
							change: '全部解决',
							icon: 'icon-solve'
						}
					]
				},

				// 菜单表格数据（为所有菜单补充完整）
				menuTableData: {
					'实时监控': [{
							item: '监控摄像头',
							today: '28台',
							yesterday: '26台',
							trend: '+2台',
							trendClass: 'up'
						},
						{
							item: '温湿度传感器',
							today: '15个',
							yesterday: '15个',
							trend: '持平',
							trendClass: 'neutral'
						},
						{
							item: '报警器',
							today: '8个',
							yesterday: '8个',
							trend: '持平',
							trendClass: 'neutral'
						},
						{
							item: '数据采集器',
							today: '5台',
							yesterday: '5台',
							trend: '持平',
							trendClass: 'neutral'
						}
					],
					'预警管理': [{
							item: '食品安全预警',
							today: '3条',
							yesterday: '5条',
							trend: '-2条',
							trendClass: 'down'
						},
						{
							item: '设备异常预警',
							today: '2条',
							yesterday: '3条',
							trend: '-1条',
							trendClass: 'down'
						},
						{
							item: '卫生检查预警',
							today: '1条',
							yesterday: '2条',
							trend: '-1条',
							trendClass: 'down'
						},
						{
							item: '库存不足预警',
							today: '2条',
							yesterday: '1条',
							trend: '+1条',
							trendClass: 'up'
						}
					],
					'卫生检查': [{
							item: '餐具消毒检查',
							today: '合格',
							yesterday: '合格',
							trend: '正常',
							trendClass: 'up'
						},
						{
							item: '操作间卫生',
							today: '合格',
							yesterday: '合格',
							trend: '正常',
							trendClass: 'up'
						},
						{
							item: '个人卫生检查',
							today: '合格',
							yesterday: '不合格',
							trend: '改进',
							trendClass: 'up'
						},
						{
							item: '食品储存检查',
							today: '合格',
							yesterday: '合格',
							trend: '正常',
							trendClass: 'up'
						}
					],
					'温湿度监控': [{
							item: '冷藏库温度',
							today: '4.8°C',
							yesterday: '5.1°C',
							trend: '-0.3°C',
							trendClass: 'down'
						},
						{
							item: '冷冻库温度',
							today: '-18.2°C',
							yesterday: '-17.8°C',
							trend: '-0.4°C',
							trendClass: 'down'
						},
						{
							item: '操作间温度',
							today: '22.5°C',
							yesterday: '23.1°C',
							trend: '-0.6°C',
							trendClass: 'down'
						},
						{
							item: '操作间湿度',
							today: '58%',
							yesterday: '62%',
							trend: '-4%',
							trendClass: 'down'
						}
					],
					'食材溯源': [{
							item: '猪肉',
							today: '5批次',
							yesterday: '4批次',
							trend: '+1',
							trendClass: 'up'
						},
						{
							item: '牛肉',
							today: '3批次',
							yesterday: '3批次',
							trend: '持平',
							trendClass: 'neutral'
						},
						{
							item: '蔬菜',
							today: '8批次',
							yesterday: '7批次',
							trend: '+1',
							trendClass: 'up'
						},
						{
							item: '大米',
							today: '2批次',
							yesterday: '2批次',
							trend: '持平',
							trendClass: 'neutral'
						}
					],
					'采购台账': [{
							item: '采购总额',
							today: '￥8,562',
							yesterday: '￥9,720',
							trend: '-1,158',
							trendClass: 'down'
						},
						{
							item: '采购批次',
							today: '12次',
							yesterday: '15次',
							trend: '-3',
							trendClass: 'down'
						},
						{
							item: '供应商数量',
							today: '8家',
							yesterday: '8家',
							trend: '持平',
							trendClass: 'neutral'
						},
						{
							item: '平均单价',
							today: '￥45.2',
							yesterday: '￥46.8',
							trend: '-1.6',
							trendClass: 'down'
						}
					],
					'操作日志': [{
							item: '登录日志',
							today: '24次',
							yesterday: '21次',
							trend: '+3',
							trendClass: 'up'
						},
						{
							item: '数据修改',
							today: '8次',
							yesterday: '10次',
							trend: '-2',
							trendClass: 'down'
						},
						{
							item: '系统操作',
							today: '156次',
							yesterday: '148次',
							trend: '+8',
							trendClass: 'up'
						},
						{
							item: '异常日志',
							today: '0次',
							yesterday: '1次',
							trend: '-1',
							trendClass: 'down'
						}
					],
					'设备管理': [{
							item: '设备总数',
							today: '48台',
							yesterday: '48台',
							trend: '持平',
							trendClass: 'neutral'
						},
						{
							item: '在线设备',
							today: '46台',
							yesterday: '45台',
							trend: '+1',
							trendClass: 'up'
						},
						{
							item: '故障设备',
							today: '2台',
							yesterday: '3台',
							trend: '-1',
							trendClass: 'down'
						},
						{
							item: '维护中',
							today: '2台',
							yesterday: '2台',
							trend: '持平',
							trendClass: 'neutral'
						}
					],
					'权限设置': [{
							item: '用户总数',
							today: '24人',
							yesterday: '23人',
							trend: '+1',
							trendClass: 'up'
						},
						{
							item: '管理员',
							today: '3人',
							yesterday: '3人',
							trend: '持平',
							trendClass: 'neutral'
						},
						{
							item: '操作员',
							today: '18人',
							yesterday: '17人',
							trend: '+1',
							trendClass: 'up'
						},
						{
							item: '访客',
							today: '3人',
							yesterday: '3人',
							trend: '持平',
							trendClass: 'neutral'
						}
					],
					'通知设置': [{
							item: '今日通知',
							today: '28条',
							yesterday: '24条',
							trend: '+4',
							trendClass: 'up'
						},
						{
							item: '已读通知',
							today: '26条',
							yesterday: '22条',
							trend: '+4',
							trendClass: 'up'
						},
						{
							item: '未读通知',
							today: '2条',
							yesterday: '2条',
							trend: '持平',
							trendClass: 'neutral'
						},
						{
							item: '系统通知',
							today: '15条',
							yesterday: '12条',
							trend: '+3',
							trendClass: 'up'
						}
					],
					'帮助中心': [{
							item: '帮助文档',
							today: '156篇',
							yesterday: '152篇',
							trend: '+4',
							trendClass: 'up'
						},
						{
							item: '常见问题',
							today: '45个',
							yesterday: '44个',
							trend: '+1',
							trendClass: 'up'
						},
						{
							item: '今日咨询',
							today: '8次',
							yesterday: '10次',
							trend: '-2',
							trendClass: 'down'
						},
						{
							item: '问题解决率',
							today: '100%',
							yesterday: '100%',
							trend: '持平',
							trendClass: 'neutral'
						}
					]
				},

				// ECharts实例
				trendChart: null,
				pieChart: null
			};
		},

		computed: {
			chartDates() {
				const dates = [];
				const today = new Date();
				// 生成最近7天日期，从6天前到今天
				for (let i = 6; i >= 0; i--) {
					const date = new Date(today);
					date.setDate(today.getDate() - i);
					const month = date.getMonth() + 1;
					const day = date.getDate();
					dates.push(`${month}月${day}日`);
				}
				return dates;
			},
			// 页面主标题
			pageTitle() {
				if (this.activeMenu === '就餐分析') {
					return '就餐率及菜品销售分析';
				}
				return `${this.activeMenu} 数据`;
			},
			// 页面副标题
			pageSubtitle() {
				if (this.activeMenu === '就餐分析') {
					return '校园食堂运营数据分析平台 | 就餐率・菜品销量・窗口效率';
				}
				return `${this.activeMenu} 实时数据监控 | 概览 · 明细 · 趋势`;
			}
		},

		methods: {
			// 切换菜单
			switchMenu(menuId) {
				this.activeMenu = menuId;

				// 如果切换到就餐分析，重新初始化图表
				if (menuId === '就餐分析') {
					this.$nextTick(() => {
						this.initCharts();
					});
				} else {
					// 否则销毁图表实例，释放资源
					this.disposeCharts();
				}
			},

			// 获取菜单标题
			getMenuTitle(menuId) {
				return menuId;
			},

			// 获取菜单统计数据
			getMenuStats(menuId) {
				return this.menuStats[menuId] || [];
			},

			// 获取菜单表格数据
			getMenuTableData(menuId) {
				return this.menuTableData[menuId] || [{
						item: '数据项1',
						today: '100',
						yesterday: '95',
						trend: '+5',
						trendClass: 'up'
					},
					{
						item: '数据项2',
						today: '85',
						yesterday: '88',
						trend: '-3',
						trendClass: 'down'
					},
					{
						item: '数据项3',
						today: '92',
						yesterday: '92',
						trend: '持平',
						trendClass: 'neutral'
					},
					{
						item: '数据项4',
						today: '78',
						yesterday: '75',
						trend: '+3',
						trendClass: 'up'
					}
				];
			},

			// 初始化所有图表
			initCharts() {
				this.initTrendChart();
				this.initPieChart();
			},

			// 销毁所有图表
			disposeCharts() {
				if (this.trendChart) {
					this.trendChart.dispose();
					this.trendChart = null;
				}
				if (this.pieChart) {
					this.pieChart.dispose();
					this.pieChart = null;
				}
			},

			// 初始化趋势图
			initTrendChart() {
				if (!this.$refs.trendChart) return;

				if (this.trendChart) {
					this.trendChart.dispose();
				}

				this.trendChart = this.$echarts.init(this.$refs.trendChart);

				const option = {
					backgroundColor: 'transparent',
					tooltip: {
						trigger: 'axis',
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						borderColor: '#5B8FF9',
						borderWidth: 1,
						textStyle: {
							color: '#fff',
							fontSize: 12
						},
						formatter: function(params) {
							let result = `<div style="margin-bottom: 5px;">${params[0].axisValue}</div>`;
							params.forEach(item => {
								const value = item.seriesName === '食堂容量上限' ? `${item.value}人` :
									`${item.value}%`;
								const color = item.color;
								result += `
                <div style="display: flex; align-items: center; margin: 2px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px;"></span>
                  <span style="flex: 1;">${item.seriesName}</span>
                  <span style="font-weight: bold;">${value}</span>
                </div>
              `;
							});
							return result;
						}
					},
					legend: {
						show: false
					},
					grid: {
						left: '3%',
						right: '4%',
						bottom: '10%',
						top: '10%',
						containLabel: true
					},
					xAxis: {
						type: 'category',
						boundaryGap: false,
						data: this.chartDates,
						axisLine: {
							lineStyle: {
								color: 'rgba(255, 255, 255, 0.3)'
							}
						},
						axisLabel: {
							color: 'rgba(255, 255, 255, 0.7)',
							fontSize: 12
						},
						splitLine: {
							show: true,
							lineStyle: {
								color: 'rgba(255, 255, 255, 0.1)',
								type: 'dashed'
							}
						}
					},
					yAxis: {
						type: 'value',
						min: 0,
						max: 100,
						axisLine: {
							show: true,
							lineStyle: {
								color: 'rgba(255, 255, 255, 0.3)'
							}
						},
						axisLabel: {
							color: 'rgba(255, 255, 255, 0.7)',
							fontSize: 12,
							formatter: '{value}%'
						},
						splitLine: {
							lineStyle: {
								color: 'rgba(255, 255, 255, 0.1)',
								type: 'dashed'
							}
						}
					},
					series: [{
							name: '就餐率',
							type: 'line',
							smooth: true,
							symbol: 'circle',
							symbolSize: 6,
							lineStyle: {
								width: 3,
								color: '#5B8FF9'
							},
							itemStyle: {
								color: '#5B8FF9',
								borderColor: '#0a1633',
								borderWidth: 2
							},
							data: [70.5, 72.3, 74.8, 76.2, 75.8, 77.1, 78.5]
						},
						{
							name: '食堂容量上限',
							type: 'line',
							smooth: true,
							symbol: 'none',
							lineStyle: {
								width: 2,
								color: '#E8684A',
								type: 'dashed'
							},
							data: [85, 85, 85, 85, 85, 85, 85]
						}
					]
				};

				this.trendChart.setOption(option);
			},

			// 初始化饼图
			initPieChart() {
				if (!this.$refs.pieChart) return;

				if (this.pieChart) {
					this.pieChart.dispose();
				}

				this.pieChart = this.$echarts.init(this.$refs.pieChart);

				const option = {
					backgroundColor: 'transparent',
					tooltip: {
						trigger: 'item',
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						borderColor: '#5B8FF9',
						borderWidth: 1,
						textStyle: {
							color: '#fff',
							fontSize: 12
						},
						formatter: '{a} <br/>{b}: {c}% ({d}%)'
					},
					legend: {
						orient: 'vertical',
						right: 10,
						top: 'center',
						textStyle: {
							color: 'rgba(255, 255, 255, 0.7)',
							fontSize: 12
						}
					},
					series: [{
						name: '菜品品类销售占比',
						type: 'pie',
						radius: ['40%', '70%'],
						center: ['35%', '50%'],
						avoidLabelOverlap: false,
						itemStyle: {
							borderRadius: 10,
							borderColor: '#0a1633',
							borderWidth: 2
						},
						label: {
							show: false
						},
						emphasis: {
							label: {
								show: true,
								fontSize: 16,
								fontWeight: 'bold',
								color: '#fff'
							}
						},
						labelLine: {
							show: false
						},
						data: [{
								value: 35,
								name: '快餐/盖浇饭',
								itemStyle: {
									color: '#5B8FF9'
								}
							},
							{
								value: 25,
								name: '面食/馄饨',
								itemStyle: {
									color: '#5AD8A6'
								}
							},
							{
								value: 20,
								name: '套餐/盒饭',
								itemStyle: {
									color: '#F6BD16'
								}
							},
							{
								value: 12,
								name: '特色小吃',
								itemStyle: {
									color: '#6F5DD7'
								}
							},
							{
								value: 8,
								name: '汤面/米线',
								itemStyle: {
									color: '#9C27B0'
								}
							}
						]
					}]
				};

				this.pieChart.setOption(option);
			},

			// 处理窗口大小变化
			handleResize() {
				if (this.trendChart) {
					this.trendChart.resize();
				}
				if (this.pieChart) {
					this.pieChart.resize();
				}
			}
		},

		mounted() {
			// 初始化时间（可自行添加更新时间逻辑）
			// 如果当前是就餐分析，初始化图表
			if (this.activeMenu === '就餐分析') {
				this.$nextTick(() => {
					this.initCharts();
				});
			}

			// 监听窗口大小变化
			window.addEventListener('resize', this.handleResize);
		},

		beforeDestroy() {
			// 销毁图表实例
			this.disposeCharts();
			// 移除窗口大小变化监听
			window.removeEventListener('resize', this.handleResize);
		}
	};
</script>
<style scoped>
	.menu li i {
		margin-right: 8px;
		font-size: 16px;
		vertical-align: middle;
	}

	.menu li span {
		vertical-align: middle;
	}

	.dining-rate-analysis-system {
		display: flex;
		height: 100vh;
		font-family: 'Arial', 'Microsoft YaHei', sans-serif;
		background-color: #0a1633;
		color: #fff;
		overflow: hidden;
	}

	/* 侧边导航栏 */
	.sidebar {
		width: 220px;
		background-color: #0d1b44;
		border-right: 1px solid #1a2b5c;
		padding: 20px 0;
		overflow-y: auto;
	}

	.logo {
		padding: 0 20px 20px 20px;
		font-size: 16px;
		font-weight: 600;
		color: #5B8FF9;
		border-bottom: 1px solid #1a2b5c;
		margin-bottom: 20px;
	}

	.menu-section {
		margin-bottom: 30px;
	}

	.section-title {
		padding: 0 20px 10px 20px;
		font-size: 12px;
		color: #5B8FF9;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
		border-bottom: 1px solid #1a2b5c;
		margin-bottom: 10px;
	}

	.menu {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.menu li {
		padding: 12px 20px;
		font-size: 14px;
		color: #8a9bb8;
		cursor: pointer;
		transition: all 0.3s ease;
		border-left: 4px solid transparent;
	}

	.menu li:hover {
		background-color: rgba(91, 143, 249, 0.1);
		color: #fff;
	}

	.menu li.active {
		background-color: rgba(91, 143, 249, 0.2);
		border-left: 4px solid #5B8FF9;
		color: #fff;
	}

	/* 主内容区 */
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	/* 顶部标题栏 */
	.top-bar {
		padding: 20px 30px;
		border-bottom: 1px solid #1a2b5c;
	}

	.title-area h1 {
		margin: 0 0 8px 0;
		font-size: 24px;
		font-weight: 600;
		color: #fff;
	}

	.subtitle {
		margin: 0 0 10px 0;
		font-size: 14px;
		color: #8a9bb8;
	}

	.update-time {
		font-size: 14px;
		color: #8a9bb8;
	}

	/* 核心监控区卡片 */
	.monitor-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		padding: 20px 30px;
	}

	.monitor-card {
		background: linear-gradient(135deg, rgba(26, 43, 92, 0.8), rgba(13, 27, 68, 0.9));
		border-radius: 8px;
		padding: 20px;
		border: 1px solid rgba(91, 143, 249, 0.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		transition: transform 0.3s, box-shadow 0.3s;
	}

	.monitor-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
		border-color: rgba(91, 143, 249, 0.3);
	}

	.card-icon {
		width: 50px;
		height: 50px;
		background-color: rgba(91, 143, 249, 0.1);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 15px;
		font-size: 24px;
		color: #5B8FF9;
	}

	.card-content {
		flex: 1;
	}

	.card-title {
		font-size: 14px;
		color: #8a9bb8;
		margin-bottom: 8px;
	}

	.card-value {
		font-size: 28px;
		font-weight: 700;
		color: #fff;
		margin-bottom: 8px;
		background: linear-gradient(90deg, #5B8FF9, #5AD8A6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.card-desc {
		font-size: 12px;
		color: #8a9bb8;
	}

	.card-trend {
		font-size: 12px;
		padding: 4px 8px;
		border-radius: 10px;
		display: inline-flex;
		align-items: center;
		gap: 3px;
	}

	.card-trend.up {
		background-color: rgba(90, 216, 166, 0.2);
		color: #5AD8A6;
	}

	/* 图表分析区 */
	.chart-analysis {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		padding: 0 30px 20px 30px;
	}

	.chart-left,
	.chart-right {
		background: linear-gradient(135deg, rgba(26, 43, 92, 0.8), rgba(13, 27, 68, 0.9));
		border-radius: 8px;
		padding: 20px;
		border: 1px solid rgba(91, 143, 249, 0.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.chart-header h2 {
		margin: 0;
		font-size: 18px;
		color: #fff;
		font-weight: 600;
	}

	.chart-legend {
		display: flex;
		gap: 15px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: #8a9bb8;
	}

	.legend-item.rate .legend-dot {
		background-color: #5B8FF9;
	}

	.legend-item.capacity .legend-dot {
		background-color: #E8684A;
	}

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.chart-actions {
		display: flex;
		gap: 8px;
	}

	.action-btn {
		padding: 6px 12px;
		background-color: rgba(91, 143, 249, 0.1);
		border: 1px solid rgba(91, 143, 249, 0.2);
		border-radius: 6px;
		font-size: 12px;
		color: #8a9bb8;
		cursor: pointer;
		transition: all 0.3s;
	}

	.action-btn:hover {
		background-color: rgba(91, 143, 249, 0.2);
		color: #fff;
	}

	.action-btn.active {
		background-color: #5B8FF9;
		color: #fff;
		border-color: #5B8FF9;
	}

	.chart-container {
		height: 300px;
	}

	.echarts-chart {
		width: 100%;
		height: 100%;
	}

	/* 详细数据区 */
	.detail-data {
		background: linear-gradient(135deg, rgba(26, 43, 92, 0.8), rgba(13, 27, 68, 0.9));
		border-radius: 8px;
		margin: 0 30px 20px 30px;
		padding: 20px;
		border: 1px solid rgba(91, 143, 249, 0.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.detail-header {
		margin-bottom: 20px;
	}

	.detail-header h2 {
		margin: 0;
		font-size: 18px;
		color: #fff;
		font-weight: 600;
	}

	.ranking-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.ranking-item {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 12px 15px;
		background-color: rgba(13, 27, 68, 0.5);
		border-radius: 8px;
		border: 1px solid rgba(91, 143, 249, 0.1);
		transition: all 0.3s;
	}

	.ranking-item:hover {
		background-color: rgba(91, 143, 249, 0.1);
		border-color: rgba(91, 143, 249, 0.3);
	}

	.rank-number {
		width: 30px;
		height: 30px;
		background: linear-gradient(135deg, #5B8FF9, #5AD8A6);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: #fff;
		font-size: 14px;
	}

	.dish-info {
		flex: 1;
	}

	.dish-name {
		font-weight: 600;
		color: #fff;
		margin-bottom: 4px;
	}

	.dish-sales {
		font-size: 12px;
		color: #8a9bb8;
	}

	.sales-bar {
		flex: 2;
		height: 20px;
	}

	.bar-bg {
		width: 100%;
		height: 100%;
		background-color: rgba(91, 143, 249, 0.1);
		border-radius: 10px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: 10px;
		transition: width 1s ease;
	}

	.sales-count {
		width: 80px;
		text-align: right;
		font-weight: 600;
		color: #fff;
	}

	/* 菜单页面内容 */
	.menu-content {
		padding: 0 30px 20px 30px;
		flex: 1;
	}

	.content-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 1px solid rgba(91, 143, 249, 0.2);
	}

	.content-header h2 {
		margin: 0;
		font-size: 20px;
		color: #fff;
		font-weight: 600;
	}

	.content-time {
		font-size: 14px;
		color: #8a9bb8;
	}

	.content-body {
		background: linear-gradient(135deg, rgba(26, 43, 92, 0.8), rgba(13, 27, 68, 0.9));
		border-radius: 8px;
		padding: 20px;
		border: 1px solid rgba(91, 143, 249, 0.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		min-height: 500px;
	}

	.menu-data h3 {
		margin: 0 0 20px 0;
		font-size: 18px;
		color: #fff;
		font-weight: 600;
		padding-bottom: 15px;
		border-bottom: 1px solid rgba(91, 143, 249, 0.2);
	}

	.menu-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-bottom: 30px;
	}

	.menu-card {
		background-color: rgba(13, 27, 68, 0.5);
		border-radius: 8px;
		padding: 20px;
		border: 1px solid rgba(91, 143, 249, 0.1);
		display: flex;
		align-items: center;
		transition: all 0.3s;
	}

	.menu-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
		border-color: rgba(91, 143, 249, 0.3);
	}

	.menu-card-icon {
		width: 50px;
		height: 50px;
		background-color: rgba(91, 143, 249, 0.1);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 15px;
		font-size: 24px;
		color: #5B8FF9;
	}

	.menu-card-content {
		flex: 1;
	}

	.menu-card-label {
		font-size: 14px;
		color: #8a9bb8;
		margin-bottom: 5px;
	}

	.menu-card-value {
		font-size: 24px;
		font-weight: 700;
		color: #fff;
		margin-bottom: 5px;
		background: linear-gradient(90deg, #5B8FF9, #5AD8A6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.menu-card-trend {
		font-size: 12px;
		padding: 4px 8px;
		border-radius: 10px;
		display: inline-block;
	}

	.menu-card-trend.up {
		background-color: rgba(90, 216, 166, 0.2);
		color: #5AD8A6;
	}

	.menu-card-trend.down {
		background-color: rgba(232, 104, 74, 0.2);
		color: #E8684A;
	}

	.menu-card-trend.warning {
		background-color: rgba(246, 189, 22, 0.2);
		color: #F6BD16;
	}

	.menu-card-trend.normal {
		background-color: rgba(91, 143, 249, 0.2);
		color: #5B8FF9;
	}

	.menu-table {
		overflow-x: auto;
		margin-bottom: 20px;
	}

	.menu-table table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.menu-table th {
		padding: 15px;
		text-align: left;
		font-weight: 600;
		color: #8a9bb8;
		background-color: rgba(26, 43, 92, 0.8);
		border-bottom: 2px solid rgba(91, 143, 249, 0.3);
		white-space: nowrap;
	}

	.menu-table td {
		padding: 15px;
		color: #fff;
		border-bottom: 1px solid rgba(91, 143, 249, 0.1);
		white-space: nowrap;
	}

	.menu-table tbody tr:hover {
		background-color: rgba(91, 143, 249, 0.05);
	}

	.menu-table .up {
		color: #5AD8A6;
		font-weight: 600;
	}

	.menu-table .down {
		color: #E8684A;
		font-weight: 600;
	}

	.menu-table .neutral {
		color: #8a9bb8;
		font-weight: 600;
	}

	.menu-note {
		padding: 15px;
		background-color: rgba(13, 27, 68, 0.5);
		border-radius: 8px;
		border: 1px solid rgba(91, 143, 249, 0.1);
	}

	.menu-note p {
		margin: 0;
		font-size: 14px;
		color: #8a9bb8;
		line-height: 1.6;
	}

	/* 图标样式 */
	.icon-up,
	.icon-down,
	.icon-dining,
	.icon-hot-dish,
	.icon-busy-window,
	.icon-satisfaction {
		display: inline-block;
		width: 16px;
		height: 16px;
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
	}

	.icon-up {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235AD8A6'%3E%3Cpath d='M7 14l5-5 5 5z'/%3E%3C/svg%3E");
	}

	.icon-down {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23E8684A'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
	}

	.icon-dining {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235B8FF9'%3E%3Cpath d='M8.1 13.34L2 19.36V22h2.8l6.16-6.16-2.86-2.5zM20.41 4.94l-1.35-1.35c-.2-.2-.45-.29-.71-.29-.26 0-.51.1-.71.29l-1.65 1.65 2.77 2.77 1.65-1.65c.39-.39.39-1.02 0-1.41zM18.21 9.61l-4.24-4.24 1.41-1.41 4.24 4.24-1.41 1.41z'/%3E%3C/svg%3E");
	}

	.icon-hot-dish {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23F6BD16'%3E%3Cpath d='M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z'/%3E%3C/svg%3E");
	}

	.icon-busy-window {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235AD8A6'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z'/%3E%3C/svg%3E");
	}

	.icon-satisfaction {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236F5DD7'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7 13.5c-.82 0-1.5-.67-1.5-1.5s.68-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5.03 3.94c-.68.01-1.28-.41-1.6-1.04h3.2c-.33.63-.93 1.05-1.6 1.04zm4.47-1.5c0 .83-.68 1.5-1.5 1.5s-1.5-.67-1.5-1.5.68-1.5 1.5-1.5 1.5.67 1.5 1.5z'/%3E%3C/svg%3E");
	}

	/* 菜单图标 */
	.icon-device,
	.icon-online,
	.icon-warning,
	.icon-alert,
	.icon-high,
	.icon-medium,
	.icon-low,
	.icon-check,
	.icon-qualified,
	.icon-unqualified,
	.icon-complete,
	.icon-sensor,
	.icon-temperature,
	.icon-humidity,
	.icon-avg,
	.icon-ingredient,
	.icon-supplier,
	.icon-trace,
	.icon-amount,
	.icon-total,
	.icon-settlement,
	.icon-turnover,
	.icon-log,
	.icon-login,
	.icon-edit,
	.icon-abnormal,
	.icon-fault,
	.icon-maintenance,
	.icon-user,
	.icon-admin,
	.icon-operator,
	.icon-change,
	.icon-notification,
	.icon-read,
	.icon-unread,
	.icon-type,
	.icon-doc,
	.icon-faq,
	.icon-consult,
	.icon-solve {
		display: inline-block;
		width: 24px;
		height: 24px;
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235B8FF9'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/%3E%3C/svg%3E");
	}

	/* 响应式设计 */
	@media (max-width: 1200px) {

		.monitor-cards,
		.menu-cards {
			grid-template-columns: repeat(2, 1fr);
		}

		.chart-analysis {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.dining-rate-analysis-system {
			flex-direction: column;
			height: auto;
		}

		.sidebar {
			width: 100%;
			height: auto;
			border-right: none;
			border-bottom: 1px solid #1a2b5c;
		}

		.menu {
			display: flex;
			flex-wrap: wrap;
		}

		.menu li {
			flex: 1;
			min-width: 120px;
			text-align: center;
		}

		.top-bar {
			flex-direction: column;
			align-items: flex-start;
			gap: 15px;
			padding: 15px;
		}

		.update-time {
			align-self: flex-start;
		}

		.monitor-cards,
		.menu-cards {
			grid-template-columns: 1fr;
		}

		.chart-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 15px;
		}

		.chart-legend,
		.chart-actions {
			align-self: flex-start;
		}

		.ranking-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}

		.sales-bar {
			width: 100%;
		}

		.sales-count {
			align-self: flex-end;
		}
	}
</style>