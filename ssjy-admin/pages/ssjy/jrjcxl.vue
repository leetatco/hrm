<template>
	<div class="canteen-dining-rate-system">
		<!-- 侧边菜单栏 -->
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

				<div class="time-area">
					<div class="update-time">
						<span>数据更新时间: {{ currentTime }}</span>
					</div>
					<div class="view-actions">
						<button class="view-btn">
							<i class="icon-chart"></i>
							图表视图
						</button>
						<button class="export-btn">
							<i class="icon-export"></i>
							导出报表
						</button>
					</div>
				</div>
			</div>

			<!-- 核心数据卡片（动态数据，根据菜单变化） -->
			<div class="data-cards">
				<div class="data-card" v-for="(card, index) in currentMenuCards" :key="index">
					<div class="card-header">
						<h3>{{ card.label }}</h3>
						<div class="card-trend" :class="card.trend">
							<i :class="'icon-' + card.trend"></i>
							{{ card.change }}
						</div>
					</div>
					<div class="card-value">{{ card.value }}</div>
					<div class="card-desc">{{ card.desc || '' }}</div>
				</div>
			</div>

			<!-- 图表区域（始终显示，数据根据当前菜单动态变化） -->
			<div class="chart-section">
				<div class="chart-header">
					<h2>{{ chartTitle }}</h2>
					<div class="chart-legend">
						<span v-for="item in chartLegend" :key="item.name" class="legend-item">
							<span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
							{{ item.name }}
						</span>
					</div>
				</div>
				<div class="chart-container">
					<div ref="trendChart" class="echarts-chart"></div>
				</div>
				<div class="chart-footer">
					<div class="date-labels">
						<span v-for="date in chartDates" :key="date">{{ date }}</span>
					</div>
				</div>
			</div>

			<!-- 就餐分析专属内容：就餐率明细表格（仅在 activeMenu === '就餐分析' 时显示） -->
			<template v-if="activeMenu === '就餐分析'">
				<!-- 今日各时段就餐率明细表格 -->
				<div class="table-section">
					<div class="table-header">
						<h2>今日各时段就餐率明细</h2>
						<div class="table-actions">
							<button class="export-btn">
								<i class="icon-export"></i>
								导出表格
							</button>
						</div>
					</div>

					<div class="table-container">
						<table class="detail-table">
							<thead>
								<tr>
									<th>就餐时段</th>
									<th>就餐人数</th>
									<th>就餐率</th>
									<th>平均消费</th>
									<th>高峰时段</th>
									<th>同比昨日</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<div class="period-name">早餐</div>
										<div class="period-time">7:00-8:30</div>
									</td>
									<td>
										<div class="people-count">328 人</div>
										<div class="people-rate">65.8%</div>
									</td>
									<td>
										<div class="rate-progress">
											<div class="progress-bar" style="width: 65.8%"></div>
											<span class="progress-text">65.8%</span>
										</div>
									</td>
									<td>
										<div class="avg-consumption">￥8.5</div>
										<div class="consumption-change up">↑ 1.6%</div>
									</td>
									<td>
										<div class="peak-duration">48 分钟</div>
									</td>
									<td>
										<div class="compare-yesterday down">
											<i class="icon-down"></i>
											↓ 5.7%
										</div>
									</td>
								</tr>
								<tr>
									<td>
										<div class="period-name">午餐</div>
										<div class="period-time">11:00-13:00</div>
									</td>
									<td>
										<div class="people-count">896 人</div>
										<div class="people-rate">89.8%</div>
									</td>
									<td>
										<div class="rate-progress">
											<div class="progress-bar" style="width: 89.8%"></div>
											<span class="progress-text">89.8%</span>
										</div>
									</td>
									<td>
										<div class="avg-consumption">￥12.3</div>
										<div class="consumption-change down">↓ 2.3%</div>
									</td>
									<td>
										<div class="peak-duration">38 分钟</div>
									</td>
									<td>
										<div class="compare-yesterday up">
											<i class="icon-up"></i>
											↑ 2.1%
										</div>
									</td>
								</tr>
								<tr>
									<td>
										<div class="period-name">晚餐</div>
										<div class="period-time">17:00-19:00</div>
									</td>
									<td>
										<div class="people-count">452 人</div>
										<div class="people-rate">45.2%</div>
									</td>
									<td>
										<div class="rate-progress">
											<div class="progress-bar" style="width: 45.2%"></div>
											<span class="progress-text">45.2%</span>
										</div>
									</td>
									<td>
										<div class="avg-consumption">￥9.8</div>
										<div class="consumption-change up">↑ 0.8%</div>
									</td>
									<td>
										<div class="peak-duration">15 分钟</div>
									</td>
									<td>
										<div class="compare-yesterday neutral">持平</div>
									</td>
								</tr>
								<tr>
									<td>
										<div class="period-name">夜宵</div>
										<div class="period-time">20:00-21:30</div>
									</td>
									<td>
										<div class="people-count">86 人</div>
										<div class="people-rate">8.6%</div>
									</td>
									<td>
										<div class="rate-progress">
											<div class="progress-bar" style="width: 8.6%"></div>
											<span class="progress-text">8.6%</span>
										</div>
									</td>
									<td>
										<div class="avg-consumption">￥6.2</div>
										<div class="consumption-change up">↑ 2.1%</div>
									</td>
									<td>
										<div class="peak-duration">25 分钟</div>
									</td>
									<td>
										<div class="compare-yesterday up">
											<i class="icon-up"></i>
											↑ 2.1%
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</template>

			<!-- 其他菜单的专属内容：明细表格（无图表） -->
			<template v-else>
				<div class="menu-content">
					<div class="content-header">
						<h2>{{ activeMenu }} 数据明细</h2>
						<div class="content-time">数据更新时间: {{ currentTime }}</div>
					</div>

					<div class="content-body">
						<div class="simple-data">
							<div class="data-table">
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

							<div class="data-note">
								<p>注：以上为{{ activeMenu }}功能的基础数据展示，详细功能正在开发中...</p>
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
		name: 'CanteenDiningRateSystem',

		data() {
			return {
				// 当前激活的菜单
				activeMenu: '就餐分析',

				// 当前时间
				currentTime: '',

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

				// 所有菜单的卡片数据（用于顶部核心卡片）
				menuCards: {
					// 就餐分析专用卡片（原有四个卡片）
					'就餐分析': [{
							label: '今日整体就餐率',
							value: '78.5%',
							trend: 'up',
							change: '较昨日 +2.1%',
							desc: '就餐人数 1,256'
						},
						{
							label: '就餐高峰时段',
							value: '11:30-12:10',
							trend: 'normal',
							change: '峰值 486人',
							desc: '建议增加窗口或引导分流'
						},
						{
							label: '本周平均就餐率',
							value: '74.2%',
							trend: 'up',
							change: '较上周 +3.5%',
							desc: '本周平均每日就餐人数'
						},
						{
							label: '食堂容量上限',
							value: '1,400 人',
							trend: 'warning',
							change: '使用率 89.7%',
							desc: '建议控制就餐人数在80%以下'
						}
					],
					// 实时监控
					'实时监控': [{
							label: '监控设备总数',
							value: '28台',
							trend: 'up',
							change: '较昨日 +2'
						},
						{
							label: '在线设备数',
							value: '26台',
							trend: 'up',
							change: '在线率 92.9%'
						},
						{
							label: '异常设备数',
							value: '2台',
							trend: 'warning',
							change: '需立即处理'
						},
						{
							label: '今日报警次数',
							value: '12次',
							trend: 'down',
							change: '较昨日 -3'
						}
					],
					// 预警管理
					'预警管理': [{
							label: '今日预警总数',
							value: '8条',
							trend: 'down',
							change: '较昨日 -2'
						},
						{
							label: '高风险预警',
							value: '2条',
							trend: 'warning',
							change: '需立即处理'
						},
						{
							label: '中风险预警',
							value: '3条',
							trend: 'normal',
							change: '正在处理'
						},
						{
							label: '低风险预警',
							value: '3条',
							trend: 'normal',
							change: '已处理'
						}
					],
					// 卫生检查
					'卫生检查': [{
							label: '今日检查总数',
							value: '15次',
							trend: 'up',
							change: '较昨日 +3'
						},
						{
							label: '合格次数',
							value: '14次',
							trend: 'up',
							change: '合格率 93.3%'
						},
						{
							label: '不合格次数',
							value: '1次',
							trend: 'warning',
							change: '需整改'
						},
						{
							label: '整改完成率',
							value: '100%',
							trend: 'up',
							change: '按时完成'
						}
					],
					// 温湿度监控
					'温湿度监控': [{
							label: '监控点位总数',
							value: '32个',
							trend: 'normal',
							change: '全部正常'
						},
						{
							label: '温度异常点',
							value: '1个',
							trend: 'warning',
							change: '冷藏区2号'
						},
						{
							label: '湿度异常点',
							value: '0个',
							trend: 'up',
							change: '全部正常'
						},
						{
							label: '今日平均温度',
							value: '5.2°C',
							trend: 'normal',
							change: '符合标准'
						}
					],
					// 食材溯源
					'食材溯源': [{
							label: '今日采购食材',
							value: '28种',
							trend: 'up',
							change: '较昨日 +5'
						},
						{
							label: '检测合格率',
							value: '96.4%',
							trend: 'up',
							change: '合格率上升'
						},
						{
							label: '供应商数量',
							value: '12家',
							trend: 'normal',
							change: '合作稳定'
						},
						{
							label: '溯源覆盖率',
							value: '100%',
							trend: 'up',
							change: '全部可追溯'
						}
					],
					// 采购台账
					'采购台账': [{
							label: '今日采购金额',
							value: '￥8,562',
							trend: 'down',
							change: '较昨日 -12%'
						},
						{
							label: '本月累计金额',
							value: '￥125,320',
							trend: 'up',
							change: '预算内'
						},
						{
							label: '供应商结算',
							value: '8家',
							trend: 'normal',
							change: '按时结算'
						},
						{
							label: '库存周转率',
							value: '2.3次',
							trend: 'up',
							change: '效率良好'
						}
					],
					// 操作日志
					'操作日志': [{
							label: '今日操作记录',
							value: '156条',
							trend: 'normal',
							change: '正常范围'
						},
						{
							label: '系统登录次数',
							value: '24次',
							trend: 'up',
							change: '较昨日 +3'
						},
						{
							label: '数据修改记录',
							value: '8条',
							trend: 'down',
							change: '较昨日 -2'
						},
						{
							label: '异常操作记录',
							value: '0条',
							trend: 'up',
							change: '无异常'
						}
					],
					// 设备管理
					'设备管理': [{
							label: '设备总数',
							value: '48台',
							trend: 'normal',
							change: '全部登记'
						},
						{
							label: '在线设备',
							value: '46台',
							trend: 'up',
							change: '在线率 95.8%'
						},
						{
							label: '故障设备',
							value: '2台',
							trend: 'warning',
							change: '需维修'
						},
						{
							label: '维护计划',
							value: '8项',
							trend: 'normal',
							change: '按计划进行'
						}
					],
					// 权限设置
					'权限设置': [{
							label: '系统用户数',
							value: '24人',
							trend: 'normal',
							change: '全部授权'
						},
						{
							label: '管理员数量',
							value: '3人',
							trend: 'normal',
							change: '权限正常'
						},
						{
							label: '操作员数量',
							value: '18人',
							trend: 'up',
							change: '较上月 +2'
						},
						{
							label: '权限变更记录',
							value: '5条',
							trend: 'down',
							change: '较昨日 -1'
						}
					],
					// 通知设置
					'通知设置': [{
							label: '今日通知总数',
							value: '28条',
							trend: 'up',
							change: '较昨日 +4'
						},
						{
							label: '已读通知',
							value: '26条',
							trend: 'up',
							change: '已读率 92.9%'
						},
						{
							label: '未读通知',
							value: '2条',
							trend: 'warning',
							change: '需关注'
						},
						{
							label: '通知类型',
							value: '5类',
							trend: 'normal',
							change: '分类清晰'
						}
					],
					// 帮助中心
					'帮助中心': [{
							label: '帮助文档',
							value: '156篇',
							trend: 'up',
							change: '持续更新'
						},
						{
							label: '常见问题',
							value: '45个',
							trend: 'normal',
							change: '覆盖全面'
						},
						{
							label: '今日咨询',
							value: '8次',
							trend: 'down',
							change: '较昨日 -2'
						},
						{
							label: '问题解决率',
							value: '100%',
							trend: 'up',
							change: '全部解决'
						}
					]
				},

				// 菜单表格数据（用于其他菜单的明细表格）
				menuTableData: {
					// 实时监控
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
					// 预警管理
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
					// 卫生检查
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
					// 温湿度监控
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
					// 食材溯源
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
					// 采购台账
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
					// 操作日志
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
					// 设备管理
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
					// 权限设置
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
					// 通知设置
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
					// 帮助中心
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

				// 图表数据映射：每个菜单的折线图配置
				chartDataMap: {
					// 就餐分析
					'就餐分析': {
						title: '近7天就餐率趋势分析',
						legend: [{
								name: '早餐就餐率',
								color: '#5B8FF9'
							},
							{
								name: '午餐就餐率',
								color: '#5AD8A6'
							},
							{
								name: '晚餐就餐率',
								color: '#F6BD16'
							},
							{
								name: '食堂容量上限',
								color: '#E8684A'
							}
						],
						series: [{
								name: '早餐就餐率',
								data: [65, 68, 72, 70, 75, 73, 78],
								color: '#5B8FF9'
							},
							{
								name: '午餐就餐率',
								data: [82, 85, 88, 86, 90, 87, 89],
								color: '#5AD8A6'
							},
							{
								name: '晚餐就餐率',
								data: [45, 48, 52, 50, 55, 53, 58],
								color: '#F6BD16'
							},
							{
								name: '食堂容量上限',
								data: [86, 86, 86, 86, 86, 86, 86],
								color: '#E8684A',
								isCapacity: true
							}
						]
					},
					// 实时监控
					'实时监控': {
						title: '近7天设备在线率趋势',
						legend: [{
								name: '监控摄像头',
								color: '#5B8FF9'
							},
							{
								name: '温湿度传感器',
								color: '#5AD8A6'
							},
							{
								name: '报警器',
								color: '#F6BD16'
							},
							{
								name: '数据采集器',
								color: '#E8684A'
							}
						],
						series: [{
								name: '监控摄像头',
								data: [92, 93, 95, 94, 96, 97, 98],
								color: '#5B8FF9'
							},
							{
								name: '温湿度传感器',
								data: [88, 89, 90, 91, 92, 93, 94],
								color: '#5AD8A6'
							},
							{
								name: '报警器',
								data: [85, 86, 84, 87, 88, 89, 90],
								color: '#F6BD16'
							},
							{
								name: '数据采集器',
								data: [90, 91, 92, 93, 94, 95, 96],
								color: '#E8684A'
							}
						]
					},
					// 预警管理
					'预警管理': {
						title: '近7天预警数量趋势',
						legend: [{
								name: '食品安全预警',
								color: '#E8684A'
							},
							{
								name: '设备异常预警',
								color: '#F6BD16'
							},
							{
								name: '卫生检查预警',
								color: '#5AD8A6'
							}
						],
						series: [{
								name: '食品安全预警',
								data: [8, 7, 6, 5, 4, 3, 2],
								color: '#E8684A'
							},
							{
								name: '设备异常预警',
								data: [5, 4, 5, 3, 2, 2, 1],
								color: '#F6BD16'
							},
							{
								name: '卫生检查预警',
								data: [3, 2, 2, 1, 1, 0, 0],
								color: '#5AD8A6'
							}
						]
					},
					// 卫生检查
					'卫生检查': {
						title: '近7天卫生检查合格率趋势',
						legend: [{
								name: '餐具消毒合格率',
								color: '#5B8FF9'
							},
							{
								name: '操作间卫生合格率',
								color: '#5AD8A6'
							},
							{
								name: '个人卫生合格率',
								color: '#F6BD16'
							}
						],
						series: [{
								name: '餐具消毒合格率',
								data: [98, 98, 99, 99, 100, 100, 100],
								color: '#5B8FF9'
							},
							{
								name: '操作间卫生合格率',
								data: [95, 96, 97, 96, 98, 99, 99],
								color: '#5AD8A6'
							},
							{
								name: '个人卫生合格率',
								data: [92, 93, 94, 95, 96, 97, 98],
								color: '#F6BD16'
							}
						]
					},
					// 温湿度监控
					'温湿度监控': {
						title: '近7天温湿度异常点趋势',
						legend: [{
								name: '温度异常点',
								color: '#E8684A'
							},
							{
								name: '湿度异常点',
								color: '#5B8FF9'
							}
						],
						series: [{
								name: '温度异常点',
								data: [2, 1, 1, 0, 1, 0, 0],
								color: '#E8684A'
							},
							{
								name: '湿度异常点',
								data: [1, 0, 0, 0, 0, 0, 0],
								color: '#5B8FF9'
							}
						]
					},
					// 食材溯源（默认使用就餐分析的类似数据，可自行调整）
					'食材溯源': {
						title: '近7天食材溯源覆盖率趋势',
						legend: [{
							name: '溯源覆盖率',
							color: '#5B8FF9'
						}],
						series: [{
							name: '溯源覆盖率',
							data: [95, 96, 97, 98, 99, 100, 100],
							color: '#5B8FF9'
						}]
					},
					// 采购台账
					'采购台账': {
						title: '近7天采购金额趋势（万元）',
						legend: [{
							name: '采购金额',
							color: '#5AD8A6'
						}],
						series: [{
							name: '采购金额',
							data: [8.5, 9.2, 8.8, 9.5, 8.2, 8.9, 8.6],
							color: '#5AD8A6'
						}]
					},
					// 操作日志
					'操作日志': {
						title: '近7天操作次数趋势',
						legend: [{
							name: '操作次数',
							color: '#F6BD16'
						}],
						series: [{
							name: '操作次数',
							data: [156, 148, 162, 170, 158, 165, 172],
							color: '#F6BD16'
						}]
					},
					// 设备管理
					'设备管理': {
						title: '近7天设备在线率趋势',
						legend: [{
							name: '在线率',
							color: '#5B8FF9'
						}],
						series: [{
							name: '在线率',
							data: [94, 95, 96, 95, 97, 98, 96],
							color: '#5B8FF9'
						}]
					},
					// 权限设置
					'权限设置': {
						title: '近7天权限变更次数',
						legend: [{
							name: '变更次数',
							color: '#E8684A'
						}],
						series: [{
							name: '变更次数',
							data: [5, 3, 4, 2, 6, 3, 2],
							color: '#E8684A'
						}]
					},
					// 通知设置
					'通知设置': {
						title: '近7天通知发送数量',
						legend: [{
							name: '通知数量',
							color: '#5AD8A6'
						}],
						series: [{
							name: '通知数量',
							data: [28, 32, 25, 30, 35, 28, 26],
							color: '#5AD8A6'
						}]
					},
					// 帮助中心
					'帮助中心': {
						title: '近7天咨询数量趋势',
						legend: [{
							name: '咨询次数',
							color: '#F6BD16'
						}],
						series: [{
							name: '咨询次数',
							data: [8, 10, 7, 9, 6, 5, 4],
							color: '#F6BD16'
						}]
					}
				},

				// ECharts实例
				trendChart: null
			};
		},

		computed: {
			// 生成最近7天的日期（格式：X月X日）
			chartDates() {
				const dates = [];
				const today = new Date();
				for (let i = 6; i >= 0; i--) {
					const date = new Date(today);
					date.setDate(today.getDate() - i);
					const month = date.getMonth() + 1;
					const day = date.getDate();
					dates.push(`${month}月${day}日`);
				}
				return dates;
			},

			// 当前菜单对应的卡片数据
			currentMenuCards() {
				return this.menuCards[this.activeMenu] || [];
			},

			// 页面主标题
			pageTitle() {
				if (this.activeMenu === '就餐分析') {
					return '今日就餐率分析';
				}
				return `${this.activeMenu} 数据`;
			},

			// 页面副标题
			pageSubtitle() {
				if (this.activeMenu === '就餐分析') {
					return '校园食堂就餐率实时监控 | 时段分析 · 趋势对比 · 数据预警';
				}
				return `${this.activeMenu} 实时数据监控 | 概览 · 明细 · 趋势`;
			},

			// 当前菜单的图表标题
			chartTitle() {
				return this.chartDataMap[this.activeMenu]?.title || '近7天趋势分析';
			},

			// 当前菜单的图表图例
			chartLegend() {
				return this.chartDataMap[this.activeMenu]?.legend || [];
			}
		},

		methods: {
			// 切换菜单
			switchMenu(menuId) {
				this.activeMenu = menuId;
				this.$nextTick(() => {
					this.initChart();
				});
			},

			// 获取菜单表格数据
			getMenuTableData(menuId) {
				return this.menuTableData[menuId] || [];
			},

			// 更新当前时间
			updateCurrentTime() {
				const now = new Date();
				const year = now.getFullYear();
				const month = String(now.getMonth() + 1).padStart(2, '0');
				const day = String(now.getDate()).padStart(2, '0');
				const hours = String(now.getHours()).padStart(2, '0');
				const minutes = String(now.getMinutes()).padStart(2, '0');
				this.currentTime = `${year}-${month}-${day} ${hours}:${minutes}`;
			},

			// 初始化ECharts图表
			initChart() {
				if (!this.$refs.trendChart) return;

				if (this.trendChart) {
					this.trendChart.dispose();
				}

				this.trendChart = this.$echarts.init(this.$refs.trendChart);

				// 获取当前菜单的图表配置，如果没有则使用就餐分析的作为默认
				const chartConfig = this.chartDataMap[this.activeMenu] || this.chartDataMap['就餐分析'];

				// 构建系列
				const series = chartConfig.series.map(s => ({
					name: s.name,
					type: 'line',
					smooth: true,
					symbol: s.name === '食堂容量上限' ? 'none' : 'circle',
					symbolSize: 6,
					lineStyle: {
						width: s.name === '食堂容量上限' ? 2 : 3,
						color: s.color,
						type: s.name === '食堂容量上限' ? 'dashed' : 'solid'
					},
					itemStyle: {
						color: s.color,
						borderColor: '#0a1633',
						borderWidth: 2
					},
					data: s.data
				}));

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
								const value = item.seriesName.includes('容量') ? `${item.value}人` :
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
						bottom: '15%',
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
					series: series
				};

				this.trendChart.setOption(option);

				// 监听窗口大小变化
				window.addEventListener('resize', this.handleResize);
			},

			// 窗口大小变化处理
			handleResize() {
				if (this.trendChart) {
					this.trendChart.resize();
				}
			}
		},

		mounted() {
			// 初始化时间
			this.updateCurrentTime();
			setInterval(this.updateCurrentTime, 60000);

			// 初始化图表
			this.$nextTick(() => {
				this.initChart();
			});
		},

		beforeDestroy() {
			// 销毁图表实例
			if (this.trendChart) {
				this.trendChart.dispose();
			}
			// 移除 resize 监听
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
	.canteen-dining-rate-system {
		display: flex;
		height: 100vh;
		font-family: 'Arial', 'Microsoft YaHei', sans-serif;
		background-color: #0a1633;
		color: #fff;
		overflow: hidden;
	}

	/* 侧边菜单栏 */
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
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
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
		margin: 0;
		font-size: 14px;
		color: #8a9bb8;
	}

	.time-area {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.update-time {
		font-size: 14px;
		color: #8a9bb8;
		margin-bottom: 15px;
	}

	.view-actions {
		display: flex;
		gap: 10px;
	}

	.view-btn,
	.export-btn {
		padding: 8px 15px;
		background-color: rgba(91, 143, 249, 0.1);
		border: 1px solid rgba(91, 143, 249, 0.2);
		border-radius: 4px;
		font-size: 14px;
		color: #8a9bb8;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 5px;
		transition: all 0.3s;
	}

	.view-btn:hover,
	.export-btn:hover {
		background-color: rgba(91, 143, 249, 0.2);
		color: #fff;
	}

	.export-btn {
		background-color: rgba(90, 216, 166, 0.1);
		border-color: rgba(90, 216, 166, 0.2);
		color: #5AD8A6;
	}

	.export-btn:hover {
		background-color: rgba(90, 216, 166, 0.2);
		color: #fff;
	}

	/* 核心数据卡片 */
	.data-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		padding: 20px 30px;
	}

	.data-card {
		background: linear-gradient(135deg, rgba(26, 43, 92, 0.8), rgba(13, 27, 68, 0.9));
		border-radius: 8px;
		padding: 20px;
		border: 1px solid rgba(91, 143, 249, 0.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s, box-shadow 0.3s;
	}

	.data-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
		border-color: rgba(91, 143, 249, 0.3);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 15px;
	}

	.card-header h3 {
		margin: 0;
		font-size: 14px;
		color: #8a9bb8;
		font-weight: 500;
	}

	.card-trend {
		font-size: 12px;
		padding: 4px 8px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		gap: 3px;
	}

	.card-trend.up {
		background-color: rgba(90, 216, 166, 0.2);
		color: #5AD8A6;
	}

	.card-trend.down {
		background-color: rgba(232, 104, 74, 0.2);
		color: #E8684A;
	}

	.card-trend.warning {
		background-color: rgba(246, 189, 22, 0.2);
		color: #F6BD16;
	}

	.card-trend.normal {
		background-color: rgba(91, 143, 249, 0.2);
		color: #5B8FF9;
	}

	.card-value {
		font-size: 32px;
		font-weight: 700;
		color: #fff;
		margin-bottom: 8px;
		background: linear-gradient(90deg, #5B8FF9, #5AD8A6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.card-desc {
		font-size: 13px;
		color: #8a9bb8;
	}

	/* 图表区域 */
	.chart-section {
		background: linear-gradient(135deg, rgba(26, 43, 92, 0.8), rgba(13, 27, 68, 0.9));
		border-radius: 8px;
		margin: 0 30px 20px 30px;
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
		gap: 20px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: #8a9bb8;
	}

	.legend-item.breakfast .legend-dot {
		background-color: #5B8FF9;
	}

	.legend-item.lunch .legend-dot {
		background-color: #5AD8A6;
	}

	.legend-item.dinner .legend-dot {
		background-color: #F6BD16;
	}

	.legend-item.capacity .legend-dot {
		background-color: #E8684A;
	}

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.chart-container {
		height: 300px;
	}

	.echarts-chart {
		width: 100%;
		height: 100%;
	}

	.chart-footer {
		display: flex;
		justify-content: center;
		margin-top: 10px;
	}

	.date-labels {
		display: flex;
		gap: 40px;
		font-size: 12px;
		color: #8a9bb8;
	}

	/* 表格区域 */
	.table-section {
		background: linear-gradient(135deg, rgba(26, 43, 92, 0.8), rgba(13, 27, 68, 0.9));
		border-radius: 8px;
		margin: 0 30px 20px 30px;
		padding: 20px;
		border: 1px solid rgba(91, 143, 249, 0.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.table-header h2 {
		margin: 0;
		font-size: 18px;
		color: #fff;
		font-weight: 600;
	}

	.table-container {
		overflow-x: auto;
	}

	.detail-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.detail-table thead {
		background-color: rgba(26, 43, 92, 0.8);
	}

	.detail-table th {
		padding: 15px;
		text-align: left;
		font-weight: 600;
		color: #8a9bb8;
		border-bottom: 2px solid rgba(91, 143, 249, 0.3);
		white-space: nowrap;
	}

	.detail-table tbody tr {
		border-bottom: 1px solid rgba(91, 143, 249, 0.1);
		transition: background-color 0.3s;
	}

	.detail-table tbody tr:hover {
		background-color: rgba(91, 143, 249, 0.05);
	}

	.detail-table td {
		padding: 15px;
		color: #fff;
	}

	.period-name {
		font-weight: 600;
		color: #fff;
		margin-bottom: 5px;
	}

	.period-time {
		font-size: 12px;
		color: #8a9bb8;
	}

	.people-count {
		font-weight: 600;
		color: #fff;
		margin-bottom: 5px;
	}

	.people-rate {
		font-size: 12px;
		color: #5AD8A6;
	}

	.rate-progress {
		position: relative;
		height: 24px;
		background-color: rgba(91, 143, 249, 0.1);
		border-radius: 12px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #5B8FF9, #5AD8A6);
		border-radius: 12px;
		transition: width 0.5s ease;
	}

	.progress-text {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: #fff;
		font-size: 12px;
	}

	.avg-consumption {
		font-weight: 600;
		color: #fff;
		margin-bottom: 5px;
	}

	.consumption-change {
		font-size: 12px;
	}

	.consumption-change.up {
		color: #5AD8A6;
	}

	.consumption-change.down {
		color: #E8684A;
	}

	.peak-duration {
		font-weight: 600;
		color: #fff;
	}

	.compare-yesterday {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 6px 12px;
		border-radius: 12px;
		font-weight: 600;
		font-size: 12px;
	}

	.compare-yesterday.up {
		background-color: rgba(90, 216, 166, 0.2);
		color: #5AD8A6;
	}

	.compare-yesterday.down {
		background-color: rgba(232, 104, 74, 0.2);
		color: #E8684A;
	}

	.compare-yesterday.neutral {
		background-color: rgba(91, 143, 249, 0.2);
		color: #5B8FF9;
	}

	/* 菜单内容展示 */
	.menu-content {
		background: linear-gradient(135deg, rgba(26, 43, 92, 0.8), rgba(13, 27, 68, 0.9));
		border-radius: 8px;
		margin: 20px 30px;
		padding: 20px;
		border: 1px solid rgba(91, 143, 249, 0.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
		padding: 20px 0;
	}

	.simple-data h3 {
		margin: 0 0 20px 0;
		font-size: 18px;
		color: #fff;
		font-weight: 600;
	}

	.data-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-bottom: 30px;
	}

	.data-item {
		background-color: rgba(13, 27, 68, 0.5);
		border-radius: 8px;
		padding: 20px;
		border: 1px solid rgba(91, 143, 249, 0.1);
		text-align: center;
		transition: transform 0.3s, box-shadow 0.3s;
	}

	.data-item:hover {
		transform: translateY(-5px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
		border-color: rgba(91, 143, 249, 0.3);
	}

	.data-value {
		font-size: 28px;
		font-weight: 700;
		color: #fff;
		margin-bottom: 8px;
		background: linear-gradient(90deg, #5B8FF9, #5AD8A6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.data-label {
		font-size: 14px;
		color: #8a9bb8;
		margin-bottom: 8px;
	}

	.data-trend {
		font-size: 12px;
		padding: 4px 8px;
		border-radius: 10px;
		display: inline-block;
	}

	.data-trend.up {
		background-color: rgba(90, 216, 166, 0.2);
		color: #5AD8A6;
	}

	.data-trend.down {
		background-color: rgba(232, 104, 74, 0.2);
		color: #E8684A;
	}

	.data-trend.warning {
		background-color: rgba(246, 189, 22, 0.2);
		color: #F6BD16;
	}

	.data-trend.normal {
		background-color: rgba(91, 143, 249, 0.2);
		color: #5B8FF9;
	}

	.data-table {
		overflow-x: auto;
		margin-bottom: 20px;
	}

	.data-table table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.data-table th {
		padding: 15px;
		text-align: left;
		font-weight: 600;
		color: #8a9bb8;
		background-color: rgba(26, 43, 92, 0.8);
		border-bottom: 2px solid rgba(91, 143, 249, 0.3);
	}

	.data-table td {
		padding: 15px;
		color: #fff;
		border-bottom: 1px solid rgba(91, 143, 249, 0.1);
	}

	.data-table tbody tr:hover {
		background-color: rgba(91, 143, 249, 0.05);
	}

	.data-table .up {
		color: #5AD8A6;
		font-weight: 600;
	}

	.data-table .down {
		color: #E8684A;
		font-weight: 600;
	}

	.data-table .neutral {
		color: #8a9bb8;
		font-weight: 600;
	}

	.data-note {
		padding: 15px;
		background-color: rgba(13, 27, 68, 0.5);
		border-radius: 8px;
		border: 1px solid rgba(91, 143, 249, 0.1);
	}

	.data-note p {
		margin: 0;
		font-size: 14px;
		color: #8a9bb8;
		line-height: 1.6;
	}

	/* 图标样式 */
	.icon-up,
	.icon-down,
	.icon-chart,
	.icon-export {
		display: inline-block;
		width: 12px;
		height: 12px;
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

	.icon-chart {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238a9bb8'%3E%3Cpath d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'/%3E%3C/svg%3E");
	}

	.icon-export {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235AD8A6'%3E%3Cpath d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'/%3E%3C/svg%3E");
	}

	/* 响应式设计 */
	@media (max-width: 1200px) {

		.data-cards,
		.data-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.canteen-dining-rate-system {
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

		.time-area {
			align-items: flex-start;
		}

		.data-cards,
		.data-grid {
			grid-template-columns: 1fr;
		}

		.chart-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 15px;
		}

		.chart-legend {
			flex-wrap: wrap;
			gap: 10px;
		}

		.table-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 15px;
		}

		.detail-table {
			display: block;
		}

		.detail-table thead {
			display: none;
		}

		.detail-table tbody,
		.detail-table tr,
		.detail-table td {
			display: block;
			width: 100%;
		}

		.detail-table tr {
			margin-bottom: 15px;
			border: 1px solid rgba(91, 143, 249, 0.1);
			border-radius: 8px;
			padding: 10px;
		}

		.detail-table td {
			padding: 8px 10px;
			border-bottom: 1px solid rgba(91, 143, 249, 0.1);
		}

		.detail-table td:last-child {
			border-bottom: none;
		}
	}
</style>