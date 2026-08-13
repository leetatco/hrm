<template>
	<div id="app">
		<!-- 顶部导航栏 -->
		<div class="header">
			<div class="system-title">
				<h1>校园食堂安全隐患排查系统</h1>
			</div>
			<div class="user-info">
				<span class="user-department">后勤保障部-安全管理员</span>
				<div class="user-avatar">
					<i class="el-icon-user-solid"></i>
				</div>				
			</div>
		</div>

		<div class="main-container">
			<!-- 左侧菜单栏 -->
			<div class="sidebar">
				<div class="menu-header">
					<h3>功能菜单</h3>
					<i class="el-icon-setting system-setting-icon"></i>
				</div>
				<ul class="menu-list">
					<li v-for="menu in menus" :key="menu.id" :class="{ active: activeMenu === menu.id }"
						@click="changeMenu(menu.id)">
						<i :class="menu.icon"></i>
						<span>{{ menu.name }}</span>
						<span v-if="menu.id === 'data-overview' && pendingCount > 0"
							class="badge">{{ pendingCount }}</span>
					</li>
				</ul>
			</div>

			<!-- 右侧内容区域 -->
			<div class="content">
				<!-- 数据概览页面 -->
				<div v-if="activeMenu === 'data-overview'" class="data-overview">
					<h2 class="content-title">校园食堂安全排查数据概览</h2>

					<!-- 数据卡片 -->
					<div class="data-cards">
						<div class="data-card">
							<div class="card-title">待整改隐患</div>
							<div class="card-value">{{ pendingCount }}</div>
							<div class="card-trend up">
								较上周 +2 (12.5%)
							</div>
						</div>
						<div class="data-card">
							<div class="card-title">已整改隐患</div>
							<div class="card-value">{{ resolvedCount }}</div>
							<div class="card-trend">
								整改率 {{ rectificationRate }}
							</div>
						</div>
						<div class="data-card">
							<div class="card-title">排查食堂数</div>
							<div class="card-value">{{ canteenCount }}</div>
							<div class="card-trend">
								覆盖全部食堂 100%
							</div>
						</div>
						<div class="data-card">
							<div class="card-title">本月排查次数</div>
							<div class="card-value">{{ monthlyChecks }}</div>
							<div class="card-trend up">
								较上月 +8 (20%)
							</div>
						</div>
					</div>

					<div class="chart-and-table">
						<!-- 饼图区域 -->
						<div class="chart-container">
							<h3 class="chart-title">食堂隐患类型占比</h3>
							<div class="pie-chart">
								<div class="pie-chart-visual">
									<div class="pie" ref="pieChart"></div>
								</div>
								<div class="chart-legend">
									<div v-for="(item, index) in hazardTypes" :key="index" class="legend-item">
										<span class="legend-color" :style="{backgroundColor: item.color}"></span>
										<span class="legend-label">{{ item.name }}</span>
										<span class="legend-value">{{ item.percentage }}</span>
									</div>
								</div>
							</div>
						</div>

						<!-- 表格区域 -->
						<div class="table-container">
							<h3 class="table-title">近期待整改隐患(食堂)</h3>
							<div class="table-wrapper">
								<table class="hazard-table">
									<thead>
										<tr>
											<th>食堂名称</th>
											<th>主要隐患</th>
											<th>整改期限</th>
											<th>操作</th>
										</tr>
									</thead>
									<tbody>
										<tr v-for="item in pendingHazards" :key="item.id">
											<td>{{ item.canteen }}</td>
											<td>{{ item.hazard }}</td>
											<td :class="{'urgent': isUrgent(item.deadline)}">
												{{ formatDate(item.deadline) }}
											</td>
											<td>
												<button class="btn-resolve"
													@click="resolveHazard(item.id)">标记整改</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<!-- 排查记录页面 -->
				<div v-if="activeMenu === 'check-records'" class="check-records">
					<h2 class="content-title">排查记录</h2>
					<div class="records-container">
						<div class="search-bar">
							<input type="text" placeholder="搜索食堂或隐患..." v-model="searchQuery">
							<button class="search-btn">
								<i class="el-icon-search"></i>
							</button>
						</div>
						<table class="records-table">
							<thead>
								<tr>
									<th>排查日期</th>
									<th>食堂名称</th>
									<th>隐患类型</th>
									<th>整改状态</th>
									<th>操作</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="record in filteredRecords" :key="record.id">
									<td>{{ formatDate(record.date) }}</td>
									<td>{{ record.canteen }}</td>
									<td>{{ record.type }}</td>
									<td>
										<span
											:class="['status-badge', record.status === '已整改' ? 'resolved' : 'pending']">
											{{ record.status }}
										</span>
									</td>
									<td>
										<button class="btn-view">查看详情</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- 新增排查页面 -->
				<div v-if="activeMenu === 'new-check'" class="new-check">
					<h2 class="content-title">新增排查</h2>
					<div class="form-container">
						<div class="form-group">
							<label>食堂名称</label>
							<select v-model="newCheck.canteen">
								<option value="">请选择食堂</option>
								<option v-for="canteen in canteenList" :key="canteen.id" :value="canteen.name">
									{{ canteen.name }}
								</option>
							</select>
						</div>
						<div class="form-group">
							<label>隐患类型</label>
							<select v-model="newCheck.type">
								<option value="">请选择隐患类型</option>
								<option v-for="type in hazardTypes" :key="type.name" :value="type.name">
									{{ type.name }}
								</option>
							</select>
						</div>
						<div class="form-group">
							<label>隐患描述</label>
							<textarea v-model="newCheck.description" rows="4" placeholder="请详细描述发现的隐患..."></textarea>
						</div>
						<div class="form-group">
							<label>整改期限</label>
							<input type="date" v-model="newCheck.deadline">
						</div>
						<div class="form-group">
							<label>上传照片</label>
							<div class="upload-area">
								<i class="el-icon-upload"></i>
								<p>点击或拖拽上传隐患照片</p>
							</div>
						</div>
						<div class="form-actions">
							<button class="btn-submit" @click="submitNewCheck">提交排查记录</button>
							<button class="btn-cancel" @click="resetForm">重置</button>
						</div>
					</div>
				</div>

				<!-- 统计分析页面 -->
				<div v-if="activeMenu === 'statistics'" class="statistics">
					<h2 class="content-title">统计分析</h2>
					<div class="stats-container">

						<div class="stats-card">
							<h3>食堂整改率排名</h3>
							<table class="ranking-table">
								<thead>
									<tr>
										<th>排名</th>
										<th>食堂名称</th>
										<th>整改率</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="(canteen, index) in canteenRanking" :key="canteen.id">
										<td>{{ index + 1 }}</td>
										<td>{{ canteen.name }}</td>
										<td>
											<div class="progress-bar">
												<div class="progress-fill" :style="{width: canteen.rate + '%'}"></div>
												<span>{{ canteen.rate }}%</span>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<!-- 系统配置页面 -->
				<div v-if="activeMenu === 'system-config'" class="system-config-page">
					<h2 class="content-title">系统配置</h2>
					<div class="config-container">
						<div class="config-section">
							<h3>食堂管理</h3>
							<div class="config-item">
								<label>新增食堂</label>
								<div class="add-canteen">
									<input type="text" v-model="newCanteenName" placeholder="输入食堂名称">
									<button @click="addCanteen">添加</button>
								</div>
							</div>
							<div class="canteen-list">
								<h4>食堂列表</h4>
								<ul>
									<li v-for="canteen in canteenList" :key="canteen.id">
										{{ canteen.name }}
										<button class="btn-remove" @click="removeCanteen(canteen.id)">删除</button>
									</li>
								</ul>
							</div>
						</div>
						<div class="config-section">
							<h3>隐患类型管理</h3>
							<div class="config-item">
								<label>新增隐患类型</label>
								<div class="add-hazard">
									<input type="text" v-model="newHazardType" placeholder="输入隐患类型名称">
									<button @click="addHazardType">添加</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'CanteenSafetySystem',
		data() {
			return {
				// 当前激活的菜单
				activeMenu: 'data-overview',

				// 菜单列表
				menus: [{
						id: 'data-overview',
						name: '数据概览',
						icon: 'el-icon-data-line'
					},
					{
						id: 'check-records',
						name: '排查记录',
						icon: 'el-icon-document'
					},
					{
						id: 'new-check',
						name: '新增排查',
						icon: 'el-icon-circle-plus'
					},
					{
						id: 'statistics',
						name: '统计分析',
						icon: 'el-icon-pie-chart'
					},
					{
						id: 'system-config',
						name: '系统配置',
						icon: 'el-icon-setting'
					}
				],

				// 数据概览相关数据
				pendingCount: 18,
				resolvedCount: 146,
				canteenCount: 12,
				monthlyChecks: 48,
				rectificationRate: '89.0%',

				// 隐患类型数据
				hazardTypes: [{
						name: '食材储存不规范',
						percentage: '32%',
						color: '#5470c6'
					},
					{
						name: '餐具消毒不达标',
						percentage: '25%',
						color: '#91cc75'
					},
					{
						name: '从业人员健康证过期',
						percentage: '18%',
						color: '#fac858'
					},
					{
						name: '环境卫生差',
						percentage: '15%',
						color: '#ee6666'
					},
					{
						name: '消防设施不齐全',
						percentage: '7%',
						color: '#73c0de'
					},
					{
						name: '其他隐患',
						percentage: '3%',
						color: '#3ba272'
					}
				],

				// 近期待整改隐患
				pendingHazards: [{
						id: 1,
						canteen: '第一学生食堂',
						hazard: '餐具消毒记录不全',
						deadline: '2026-02-18'
					},
					{
						id: 2,
						canteen: '第二学生食堂',
						hazard: '消防通道堵塞',
						deadline: '2026-02-16'
					},
					{
						id: 3,
						canteen: '风味特色食堂',
						hazard: '食材储存温度超标',
						deadline: '2026-02-20'
					},
					{
						id: 4,
						canteen: '教工食堂',
						hazard: '健康证过期未续办',
						deadline: '2026-02-15'
					},
					{
						id: 5,
						canteen: '西区食堂',
						hazard: '灭火器压力不足',
						deadline: '2026-02-22'
					},
					{
						id: 6,
						canteen: '东区食堂',
						hazard: '油烟机清洗不及时',
						deadline: '2026-02-19'
					}
				],

				// 排查记录数据
				searchQuery: '',
				checkRecords: [{
						id: 1,
						date: '2026-02-10',
						canteen: '第一学生食堂',
						type: '餐具消毒不达标',
						status: '已整改'
					},
					{
						id: 2,
						date: '2026-02-10',
						canteen: '第二学生食堂',
						type: '消防设施不齐全',
						status: '待整改'
					},
					{
						id: 3,
						date: '2026-02-09',
						canteen: '风味特色食堂',
						type: '食材储存不规范',
						status: '已整改'
					},
					{
						id: 4,
						date: '2026-02-09',
						canteen: '教工食堂',
						type: '从业人员健康证过期',
						status: '待整改'
					},
					{
						id: 5,
						date: '2026-02-08',
						canteen: '西区食堂',
						type: '环境卫生差',
						status: '已整改'
					},
					{
						id: 6,
						date: '2026-02-08',
						canteen: '东区食堂',
						type: '其他隐患',
						status: '已整改'
					}
				],

				// 新增排查表单
				newCheck: {
					canteen: '',
					type: '',
					description: '',
					deadline: ''
				},

				// 食堂列表
				canteenList: [{
						id: 1,
						name: '第一学生食堂'
					},
					{
						id: 2,
						name: '第二学生食堂'
					},
					{
						id: 3,
						name: '风味特色食堂'
					},
					{
						id: 4,
						name: '教工食堂'
					},
					{
						id: 5,
						name: '西区食堂'
					},
					{
						id: 6,
						name: '东区食堂'
					}
				],

				// 统计分析数据
				canteenRanking: [{
						id: 1,
						name: '第一学生食堂',
						rate: 95
					},
					{
						id: 2,
						name: '东区食堂',
						rate: 92
					},
					{
						id: 3,
						name: '西区食堂',
						rate: 88
					},
					{
						id: 4,
						name: '风味特色食堂',
						rate: 85
					},
					{
						id: 5,
						name: '第二学生食堂',
						rate: 82
					},
					{
						id: 6,
						name: '教工食堂',
						rate: 78
					}
				],

				// 系统配置
				newCanteenName: '',
				newHazardType: '',

				// 图表数据
				pieChart: null,
				barChart: null
			};
		},
		computed: {
			// 筛选排查记录
			filteredRecords() {
				if (!this.searchQuery) return this.checkRecords;
				const query = this.searchQuery.toLowerCase();
				return this.checkRecords.filter(record =>
					record.canteen.toLowerCase().includes(query) ||
					record.type.toLowerCase().includes(query)
				);
			}
		},
		mounted() {
			// 初始化饼图
			this.initPieChart();

			// 初始化柱状图
			this.initBarChart();
		},
		methods: {			
			// 切换菜单
			changeMenu(menuId) {
				this.activeMenu = menuId;
			},

			// 初始化饼图
			initPieChart() {
				// 模拟饼图绘制
				const pieElement = this.$refs.pieChart;
				if (pieElement) {
					// 创建一个简单的饼图效果
					pieElement.innerHTML = '';

					// 创建SVG饼图
					const svgNS = "http://www.w3.org/2000/svg";
					const svg = document.createElementNS(svgNS, "svg");
					svg.setAttribute("width", "100%");
					svg.setAttribute("height", "100%");
					svg.setAttribute("viewBox", "0 0 200 200");

					const centerX = 100;
					const centerY = 100;
					const radius = 80;

					let startAngle = 0;
					const data = [{
							value: 32,
							color: '#5470c6'
						},
						{
							value: 25,
							color: '#91cc75'
						},
						{
							value: 18,
							color: '#fac858'
						},
						{
							value: 15,
							color: '#ee6666'
						},
						{
							value: 7,
							color: '#73c0de'
						},
						{
							value: 3,
							color: '#3ba272'
						}
					];

					data.forEach(item => {
						const sliceAngle = (item.value / 100) * 2 * Math.PI;
						const endAngle = startAngle + sliceAngle;

						const x1 = centerX + radius * Math.cos(startAngle);
						const y1 = centerY + radius * Math.sin(startAngle);
						const x2 = centerX + radius * Math.cos(endAngle);
						const y2 = centerY + radius * Math.sin(endAngle);

						const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

						const pathData = [
							`M ${centerX} ${centerY}`,
							`L ${x1} ${y1}`,
							`A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
							`Z`
						].join(' ');

						const path = document.createElementNS(svgNS, "path");
						path.setAttribute("d", pathData);
						path.setAttribute("fill", item.color);
						path.setAttribute("stroke", "#fff");
						path.setAttribute("stroke-width", "2");

						svg.appendChild(path);
						startAngle = endAngle;
					});

					// 添加中心圆
					const centerCircle = document.createElementNS(svgNS, "circle");
					centerCircle.setAttribute("cx", centerX);
					centerCircle.setAttribute("cy", centerY);
					centerCircle.setAttribute("r", 30);
					centerCircle.setAttribute("fill", "#fff");
					svg.appendChild(centerCircle);

					pieElement.appendChild(svg);
				}
			},

			// 初始化柱状图
			initBarChart() {
				const barElement = this.$refs.barChart;
				if (barElement) {
					// 模拟月度隐患趋势柱状图
					barElement.innerHTML = '';

					const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
					const hazards = [12, 18, 15, 22, 20, 18];
					const resolved = [10, 15, 12, 18, 17, 16];

					const maxValue = Math.max(...hazards, ...resolved);
					const barWidth = 20;
					const spacing = 30;
					const chartHeight = 150;
					const chartWidth = months.length * (barWidth * 2 + spacing) + 50;

					const svgNS = "http://www.w3.org/2000/svg";
					const svg = document.createElementNS(svgNS, "svg");
					svg.setAttribute("width", "100%");
					svg.setAttribute("height", "100%");
					svg.setAttribute("viewBox", `0 0 ${chartWidth} 200`);

					// 绘制坐标轴
					const axis = document.createElementNS(svgNS, "line");
					axis.setAttribute("x1", "30");
					axis.setAttribute("y1", "10");
					axis.setAttribute("x2", "30");
					axis.setAttribute("y2", chartHeight);
					axis.setAttribute("stroke", "#ccc");
					axis.setAttribute("stroke-width", "1");
					svg.appendChild(axis);

					const axis2 = document.createElementNS(svgNS, "line");
					axis2.setAttribute("x1", "30");
					axis2.setAttribute("y1", chartHeight);
					axis2.setAttribute("x2", chartWidth - 20);
					axis2.setAttribute("y2", chartHeight);
					axis2.setAttribute("stroke", "#ccc");
					axis2.setAttribute("stroke-width", "1");
					svg.appendChild(axis2);

					// 绘制柱状图
					months.forEach((month, index) => {
						const x = 50 + index * (barWidth * 2 + spacing);

						// 总隐患柱
						const hazardHeight = (hazards[index] / maxValue) * (chartHeight - 30);
						const hazardBar = document.createElementNS(svgNS, "rect");
						hazardBar.setAttribute("x", x);
						hazardBar.setAttribute("y", chartHeight - hazardHeight);
						hazardBar.setAttribute("width", barWidth);
						hazardBar.setAttribute("height", hazardHeight);
						hazardBar.setAttribute("fill", "#5470c6");
						svg.appendChild(hazardBar);

						// 已整改柱
						const resolvedHeight = (resolved[index] / maxValue) * (chartHeight - 30);
						const resolvedBar = document.createElementNS(svgNS, "rect");
						resolvedBar.setAttribute("x", x + barWidth);
						resolvedBar.setAttribute("y", chartHeight - resolvedHeight);
						resolvedBar.setAttribute("width", barWidth);
						resolvedBar.setAttribute("height", resolvedHeight);
						resolvedBar.setAttribute("fill", "#91cc75");
						svg.appendChild(resolvedBar);

						// 月份标签
						const monthText = document.createElementNS(svgNS, "text");
						monthText.setAttribute("x", x + barWidth);
						monthText.setAttribute("y", chartHeight + 15);
						monthText.setAttribute("text-anchor", "middle");
						monthText.setAttribute("font-size", "12");
						monthText.setAttribute("fill", "#666");
						monthText.textContent = month;
						svg.appendChild(monthText);
					});

					// 添加图例
					const legend1 = document.createElementNS(svgNS, "rect");
					legend1.setAttribute("x", chartWidth - 120);
					legend1.setAttribute("y", 10);
					legend1.setAttribute("width", 12);
					legend1.setAttribute("height", 12);
					legend1.setAttribute("fill", "#5470c6");
					svg.appendChild(legend1);

					const legend1Text = document.createElementNS(svgNS, "text");
					legend1Text.setAttribute("x", chartWidth - 100);
					legend1Text.setAttribute("y", 20);
					legend1Text.setAttribute("font-size", "12");
					legend1Text.setAttribute("fill", "#666");
					legend1Text.textContent = "总隐患数";
					svg.appendChild(legend1Text);

					const legend2 = document.createElementNS(svgNS, "rect");
					legend2.setAttribute("x", chartWidth - 120);
					legend2.setAttribute("y", 30);
					legend2.setAttribute("width", 12);
					legend2.setAttribute("height", 12);
					legend2.setAttribute("fill", "#91cc75");
					svg.appendChild(legend2);

					const legend2Text = document.createElementNS(svgNS, "text");
					legend2Text.setAttribute("x", chartWidth - 100);
					legend2Text.setAttribute("y", 40);
					legend2Text.setAttribute("font-size", "12");
					legend2Text.setAttribute("fill", "#666");
					legend2Text.textContent = "已整改数";
					svg.appendChild(legend2Text);

					barElement.appendChild(svg);
				}
			},

			// 格式化日期
			formatDate(dateString) {
				const date = new Date(dateString);
				return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
			},

			// 判断是否为紧急任务（3天内到期）
			isUrgent(deadline) {
				const today = new Date();
				const deadlineDate = new Date(deadline);
				const timeDiff = deadlineDate.getTime() - today.getTime();
				const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
				return daysDiff <= 3;
			},

			// 标记隐患为已整改
			resolveHazard(id) {
				const hazardIndex = this.pendingHazards.findIndex(h => h.id === id);
				if (hazardIndex !== -1) {
					// 从待整改列表中移除
					const [resolvedHazard] = this.pendingHazards.splice(hazardIndex, 1);

					// 更新统计数据
					this.pendingCount--;
					this.resolvedCount++;
					this.rectificationRate =
						`${((this.resolvedCount / (this.resolvedCount + this.pendingCount)) * 100).toFixed(1)}%`;

					// 添加到排查记录
					const today = new Date();
					const todayStr = today.toISOString().split('T')[0];
					this.checkRecords.unshift({
						id: this.checkRecords.length + 1,
						date: todayStr,
						canteen: resolvedHazard.canteen,
						type: resolvedHazard.hazard,
						status: '已整改'
					});

					this.$message({
						message: `已标记 ${resolvedHazard.canteen} 的隐患为已整改`,
						type: 'success'
					});
				}
			},

			// 提交新增排查
			submitNewCheck() {
				if (!this.newCheck.canteen || !this.newCheck.type || !this.newCheck.description) {
					this.$message({
						message: '请填写完整信息',
						type: 'warning'
					});
					return;
				}

				// 添加到待整改列表
				const newId = this.pendingHazards.length + 1;
				this.pendingHazards.push({
					id: newId,
					canteen: this.newCheck.canteen,
					hazard: this.newCheck.type,
					deadline: this.newCheck.deadline || '2026-03-20'
				});

				// 更新统计数据
				this.pendingCount++;
				this.monthlyChecks++;
				this.rectificationRate =
					`${((this.resolvedCount / (this.resolvedCount + this.pendingCount)) * 100).toFixed(1)}%`;

				// 添加到排查记录
				const today = new Date();
				const todayStr = today.toISOString().split('T')[0];
				this.checkRecords.unshift({
					id: this.checkRecords.length + 1,
					date: todayStr,
					canteen: this.newCheck.canteen,
					type: this.newCheck.type,
					status: '待整改'
				});

				this.$message({
					message: '排查记录已提交',
					type: 'success'
				});

				// 重置表单
				this.resetForm();
			},

			// 重置表单
			resetForm() {
				this.newCheck = {
					canteen: '',
					type: '',
					description: '',
					deadline: ''
				};
			},

			// 添加食堂
			addCanteen() {
				if (!this.newCanteenName.trim()) {
					this.$message({
						message: '请输入食堂名称',
						type: 'warning'
					});
					return;
				}

				const newId = this.canteenList.length + 1;
				this.canteenList.push({
					id: newId,
					name: this.newCanteenName.trim()
				});

				this.newCanteenName = '';
				this.$message({
					message: '食堂已添加',
					type: 'success'
				});
			},

			// 删除食堂
			removeCanteen(id) {
				const index = this.canteenList.findIndex(c => c.id === id);
				if (index !== -1) {
					this.canteenList.splice(index, 1);
					this.$message({
						message: '食堂已删除',
						type: 'success'
					});
				}
			},

			// 添加隐患类型
			addHazardType() {
				if (!this.newHazardType.trim()) {
					this.$message({
						message: '请输入隐患类型名称',
						type: 'warning'
					});
					return;
				}

				// 这里可以添加逻辑将隐患类型添加到hazardTypes中
				this.$message({
					message: `隐患类型 "${this.newHazardType}" 已添加`,
					type: 'success'
				});

				this.newHazardType = '';
			}
		}
	};
</script>

<style scoped>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: 'Arial', 'Microsoft YaHei', sans-serif;
	}

	#app {
		min-height: 100vh;
		background-color: #f5f7fa;
	}

	/* 顶部导航栏样式 */
	.header {
		background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
		color: white;
		padding: 0 20px;
		height: 60px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.system-title h1 {
		font-size: 20px;
		font-weight: 600;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 15px;
	}

	.user-department {
		font-size: 14px;
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.user-avatar i {
		font-size: 20px;
	}

	/* 主容器样式 */
	.main-container {
		display: flex;
		min-height: calc(100vh - 60px);
	}

	/* 左侧菜单栏样式 */
	.sidebar {
		width: 220px;
		background-color: #1e2a3a;
		color: #c0c6cf;
		display: flex;
		flex-direction: column;
	}

	.menu-header {
		padding: 20px 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #2d3a4b;
	}

	.menu-header h3 {
		font-size: 16px;
		font-weight: 600;
	}

	.system-setting-icon {
		font-size: 18px;
		cursor: pointer;
	}

	.menu-list {
		list-style: none;
		padding: 10px 0;
		flex-grow: 1;
	}

	.menu-list li {
		padding: 14px 20px;
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		transition: all 0.3s;
		position: relative;
	}

	.menu-list li:hover {
		background-color: #2d3a4b;
		color: white;
	}

	.menu-list li.active {
		background-color: #0d47a1;
		color: white;
	}

	.menu-list li i {
		font-size: 18px;
	}

	.menu-list li .badge {
		position: absolute;
		right: 20px;
		background-color: #f56c6c;
		color: white;
		border-radius: 10px;
		padding: 2px 8px;
		font-size: 12px;
	}

	.system-config {
		padding: 15px 20px;
		border-top: 1px solid #2d3a4b;
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		transition: all 0.3s;
	}

	.system-config:hover {
		background-color: #2d3a4b;
		color: white;
	}

	/* 右侧内容区域样式 */
	.content {
		flex-grow: 1;
		padding: 20px;
		overflow-y: auto;
	}

	.content-title {
		font-size: 22px;
		color: #333;
		margin-bottom: 20px;
		font-weight: 600;
	}

	/* 数据卡片样式 */
	.data-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-bottom: 30px;
	}

	.data-card {
		background-color: white;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		transition: transform 0.3s;
	}

	.data-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
	}

	.card-title {
		font-size: 14px;
		color: #666;
		margin-bottom: 10px;
	}

	.card-value {
		font-size: 32px;
		font-weight: 700;
		color: #333;
		margin-bottom: 5px;
	}

	.card-trend {
		font-size: 13px;
		color: #67c23a;
	}

	.card-trend.up {
		color: #f56c6c;
	}

	/* 图表和表格区域样式 */
	.chart-and-table {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 20px;
	}

	.chart-container,
	.table-container {
		background-color: white;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	}

	.chart-title,
	.table-title {
		font-size: 16px;
		font-weight: 600;
		color: #333;
		margin-bottom: 15px;
	}

	.pie-chart {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.pie-chart-visual {
		flex: 1;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pie {
		width: 200px;
		height: 200px;
	}

	.chart-legend {
		flex: 1;
	}

	.legend-item {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
		font-size: 14px;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		margin-right: 10px;
	}

	.legend-label {
		flex-grow: 1;
		color: #555;
	}

	.legend-value {
		font-weight: 600;
		color: #333;
	}

	/* 表格样式 */
	.table-wrapper {
		overflow-x: auto;
	}

	.hazard-table {
		width: 100%;
		border-collapse: collapse;
	}

	.hazard-table th {
		background-color: #f8f9fa;
		color: #555;
		font-weight: 600;
		text-align: left;
		padding: 12px 15px;
		border-bottom: 1px solid #eaeaea;
	}

	.hazard-table td {
		padding: 12px 15px;
		border-bottom: 1px solid #f0f0f0;
		color: #333;
	}

	.hazard-table tr:hover {
		background-color: #f9f9f9;
	}

	.hazard-table td.urgent {
		color: #f56c6c;
		font-weight: 600;
	}

	.btn-resolve {
		background-color: #409eff;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 6px 12px;
		font-size: 13px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.btn-resolve:hover {
		background-color: #1a73e8;
	}

	/* 排查记录页面样式 */
	.records-container {
		background-color: white;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	}

	.search-bar {
		display: flex;
		margin-bottom: 20px;
	}

	.search-bar input {
		flex-grow: 1;
		padding: 10px 15px;
		border: 1px solid #dcdfe6;
		border-radius: 4px 0 0 4px;
		font-size: 14px;
		outline: none;
	}

	.search-bar input:focus {
		border-color: #409eff;
	}

	.search-btn {
		background-color: #409eff;
		color: white;
		border: none;
		border-radius: 0 4px 4px 0;
		padding: 10px 20px;
		cursor: pointer;
		font-size: 16px;
	}

	.records-table {
		width: 100%;
		border-collapse: collapse;
	}

	.records-table th {
		background-color: #f8f9fa;
		color: #555;
		font-weight: 600;
		text-align: left;
		padding: 12px 15px;
		border-bottom: 1px solid #eaeaea;
	}

	.records-table td {
		padding: 12px 15px;
		border-bottom: 1px solid #f0f0f0;
		color: #333;
	}

	.status-badge {
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
	}

	.status-badge.resolved {
		background-color: #f0f9eb;
		color: #67c23a;
	}

	.status-badge.pending {
		background-color: #fef0f0;
		color: #f56c6c;
	}

	.btn-view {
		background-color: #f8f9fa;
		color: #555;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		padding: 6px 12px;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-view:hover {
		background-color: #e9ecef;
		border-color: #c0c4cc;
	}

	/* 新增排查页面样式 */
	.form-container {
		background-color: white;
		border-radius: 8px;
		padding: 30px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		max-width: 800px;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		color: #333;
	}

	.form-group select,
	.form-group input[type="date"],
	.form-group textarea {
		width: 100%;
		padding: 10px 15px;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		font-size: 14px;
		outline: none;
		transition: border-color 0.3s;
	}

	.form-group select:focus,
	.form-group input[type="date"]:focus,
	.form-group textarea:focus {
		border-color: #409eff;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 80px;
	}

	.upload-area {
		border: 2px dashed #dcdfe6;
		border-radius: 6px;
		padding: 40px 20px;
		text-align: center;
		color: #909399;
		cursor: pointer;
		transition: all 0.3s;
	}

	.upload-area:hover {
		border-color: #409eff;
		color: #409eff;
	}

	.upload-area i {
		font-size: 40px;
		margin-bottom: 10px;
	}

	.form-actions {
		display: flex;
		gap: 15px;
		margin-top: 30px;
	}

	.btn-submit {
		background-color: #409eff;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 12px 24px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.btn-submit:hover {
		background-color: #1a73e8;
	}

	.btn-cancel {
		background-color: #f8f9fa;
		color: #555;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		padding: 12px 24px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-cancel:hover {
		background-color: #e9ecef;
		border-color: #c0c4cc;
	}

	/* 统计分析页面样式 */
	.stats-container {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 20px;
	}

	.stats-card {
		background-color: white;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	}

	.stats-card h3 {
		font-size: 16px;
		font-weight: 600;
		color: #333;
		margin-bottom: 15px;
	}

	.trend-chart {
		height: 250px;
	}

	.bar-chart {
		width: 100%;
		height: 100%;
	}

	.ranking-table {
		width: 100%;
		border-collapse: collapse;
	}

	.ranking-table th {
		background-color: #f8f9fa;
		color: #555;
		font-weight: 600;
		text-align: left;
		padding: 12px 15px;
		border-bottom: 1px solid #eaeaea;
	}

	.ranking-table td {
		padding: 12px 15px;
		border-bottom: 1px solid #f0f0f0;
		color: #333;
	}

	.progress-bar {
		background-color: #f0f0f0;
		border-radius: 10px;
		height: 20px;
		position: relative;
	}

	.progress-fill {
		background-color: #67c23a;
		height: 100%;
		border-radius: 10px;
		min-width: 20px;
	}

	.progress-bar span {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		font-size: 12px;
		font-weight: 600;
		color: #333;
	}

	/* 系统配置页面样式 */
	.config-container {
		background-color: white;
		border-radius: 8px;
		padding: 30px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	}

	.config-section {
		margin-bottom: 30px;
	}

	.config-section h3 {
		font-size: 18px;
		font-weight: 600;
		color: #333;
		margin-bottom: 15px;
		padding-bottom: 10px;
		border-bottom: 1px solid #f0f0f0;
	}

	.config-item {
		margin-bottom: 15px;
	}

	.config-item label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		color: #333;
	}

	.add-canteen,
	.add-hazard {
		display: flex;
		gap: 10px;
	}

	.add-canteen input,
	.add-hazard input {
		flex-grow: 1;
		padding: 10px 15px;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		font-size: 14px;
		height: 40px;
		outline: none;
	}

	.add-canteen button,
	.add-hazard button {
		background-color: #409eff;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 10px 20px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.add-canteen button:hover,
	.add-hazard button:hover {
		background-color: #1a73e8;
	}

	.canteen-list h4 {
		font-size: 16px;
		margin: 20px 0 10px;
		color: #555;
	}

	.canteen-list ul {
		list-style: none;
		border: 1px solid #f0f0f0;
		border-radius: 4px;
	}

	.canteen-list li {
		padding: 12px 15px;
		border-bottom: 1px solid #f0f0f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.canteen-list li:last-child {
		border-bottom: none;
	}

	.btn-remove {
		background-color: #f56c6c;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 5px 10px;
		font-size: 12px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.btn-remove:hover {
		background-color: #e53935;
	}

	/* 响应式设计 */
	@media (max-width: 1200px) {
		.data-cards {
			grid-template-columns: repeat(2, 1fr);
		}

		.chart-and-table {
			grid-template-columns: 1fr;
		}

		.stats-container {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.main-container {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			flex-direction: row;
			flex-wrap: wrap;
		}

		.menu-header {
			width: 100%;
		}

		.menu-list {
			display: flex;
			flex-wrap: wrap;
			padding: 10px;
		}

		.menu-list li {
			flex: 1;
			min-width: 120px;
			justify-content: center;
		}

		.system-config {
			width: 100%;
			justify-content: center;
		}

		.data-cards {
			grid-template-columns: 1fr;
		}
	}
</style>