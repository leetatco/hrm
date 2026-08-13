<template>
	<div class="morning-check-system">
		<!-- 顶部蓝色栏 -->
		<header class="system-header">
			<div class="header-content">
				<h1 class="system-title">食堂人员多功能晨检系统</h1>
				<div class="check-rate">
					<span>今日晨检率</span>
					<span class="rate-value">{{ checkRate }}%</span>
				</div>
			</div>
		</header>

		<!-- 主内容区 -->
		<main class="system-main">
			<!-- 菜单栏 -->
			<nav class="system-menu">
				<ul class="menu-list">
					<li v-for="menu in menus" :key="menu.id" :class="{ active: activeMenu === menu.id }"
						@click="switchMenu(menu.id)">
						{{ menu.name }}
						<span v-if="menu.id === 'today'" class="date-badge">({{ todayDate }})</span>
					</li>
				</ul>
			</nav>

			<!-- 今日晨检统计 -->
			<section class="statistics-section" v-show="activeMenu === 'today'">
				<h2 class="section-title">今日晨检统计</h2>
				<div class="stats-cards">
					<div class="stat-card total">
						<div class="stat-label">应检人数</div>
						<div class="stat-value">{{ statistics.total }}</div>
					</div>
					<div class="stat-card checked">
						<div class="stat-label">已检人数</div>
						<div class="stat-value">{{ statistics.checked }}</div>
					</div>
					<div class="stat-card abnormal">
						<div class="stat-label">异常人数</div>
						<div class="stat-value">{{ statistics.abnormal }}</div>
					</div>
					<div class="stat-card unchecked">
						<div class="stat-label">未检人数</div>
						<div class="stat-value">{{ statistics.unchecked }}</div>
					</div>
				</div>
			</section>

			<!-- 扫描晨检界面 -->
			<section class="scan-section" v-show="activeMenu === 'scan'">
				<h2 class="section-title">扫码晨检</h2>
				<div class="scan-container">
					<div class="scan-area">
						<div class="scan-placeholder">
							<div class="scan-icon">📷</div>
							<p>请将员工工牌二维码置于框内</p>
							<p class="scan-tip">系统将自动识别并记录晨检信息</p>
						</div>
					</div>
					<div class="scan-instruction">
						<h3>晨检操作指引：</h3>
						<ol>
							<li>员工出示个人工牌二维码</li>
							<li>将二维码对准扫描区域</li>
							<li>系统自动记录晨检时间</li>
							<li>员工自行测量体温并输入</li>
							<li>系统自动判断健康状态</li>
						</ol>
						<button class="manual-btn" @click="showManualCheck = true">手动录入</button>
					</div>
				</div>
			</section>

			<!-- 晨检记录表格 -->
			<section class="record-section" v-show="activeMenu === 'today' || activeMenu === 'history'">
				<h2 class="section-title">
					{{ activeMenu === 'history' ? '历史晨检记录' : '今日晨检记录' }}
					<span class="date-badge" v-if="activeMenu === 'today'">({{ todayDate }})</span>
				</h2>

				<div class="filter-bar" v-if="activeMenu === 'today' || activeMenu === 'history'">
					<div class="filter-options">
						<label>健康状态：</label>
						<select v-model="filterStatus">
							<option value="all">全部</option>
							<option value="normal">正常</option>
							<option value="high_temp">体温偏高</option>
							<option value="forbidden">禁止上岗</option>
							<option value="unchecked">未检</option>
						</select>
					</div>
					<div class="record-info">共{{ filteredRecords.length }}条记录，显示{{ displayRange }}</div>
				</div>

				<div class="table-container">
					<table class="check-table">
						<thead>
							<tr>
								<th v-for="col in tableColumns" :key="col.key">{{ col.title }}</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="record in paginatedRecords" :key="record.id">
								<td>{{ record.id }}</td>
								<td>{{ record.name }}</td>
								<td>{{ record.empId }}</td>
								<td>{{ record.position }}</td>
								<td :class="{ 'no-check': !record.checkTime }">{{ record.checkTime || '-' }}</td>
								<td>{{ record.temperature || '-' }}</td>
								<td>
									<span :class="['status-badge', getStatusClass(record.status)]">
										{{ getStatusText(record.status) }}
									</span>
								</td>
								<td>{{ record.remark || '-' }}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- 分页 -->
				<div class="pagination" v-if="activeMenu === 'today' || activeMenu === 'history'">
					<button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
						上一页
					</button>

					<span v-for="page in visiblePages" :key="page" class="page-number"
						:class="{ active: page === currentPage }" @click="currentPage = page">
						{{ page }}
					</span>

					<button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
						下一页
					</button>

					<div class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</div>
				</div>
			</section>

			<!-- 历史记录界面 -->
			<section class="history-section" v-show="activeMenu === 'history'">
				<div class="history-filter">
					<div class="filter-group">
						<label>选择日期：</label>
						<input type="date" v-model="historyDate" />
					</div>
					<button class="query-btn" @click="loadHistoryData">查询</button>
				</div>
				<div class="history-hint" v-if="activeMenu === 'history' && historyDate">
					<p>显示 {{ formatDate(historyDate) }} 的晨检记录，共 {{ historyRecords.length }} 条记录</p>
				</div>
			</section>

			<!-- 报表统计界面 -->
			<section class="report-section" v-show="activeMenu === 'report'">
				<h2 class="section-title">晨检数据报表统计</h2>

				<!-- 统计时间选择 -->
				<div class="report-controls">
					<div class="time-range-selector">
						<button v-for="range in timeRanges" :key="range.id"
							:class="{ active: activeTimeRange === range.id }" @click="switchTimeRange(range.id)">
							{{ range.name }}
						</button>
					</div>
					<div class="date-picker">
						<label>选择时间：</label>
						<input type="date" v-model="reportDate" />
					</div>
				</div>

				<!-- 统计概览 -->
				<div class="report-overview">
					<div class="overview-card">
						<h3>晨检率趋势</h3>
						<div class="trend-chart">
							<div class="chart-container">
								<div v-for="item in rateTrendData" :key="item.date" class="chart-bar-container">
									<div class="chart-bar-label">{{ item.date }}</div>
									<div class="chart-bar-bg">
										<div class="chart-bar" :style="{ height: item.rate + '%' }"
											:class="{ 'high-rate': item.rate >= 95 }"></div>
									</div>
									<div class="chart-bar-value">{{ item.rate }}%</div>
								</div>
							</div>
						</div>
					</div>

					<div class="overview-side">
						<div class="overview-card small">
							<h3>异常类型分布</h3>
							<div class="pie-chart-placeholder">
								<div class="pie-chart">
									<div class="pie-slice high-temp">
										<div class="slice-label">体温偏高</div>
										<div class="slice-value">65%</div>
									</div>
									<div class="pie-slice forbidden">
										<div class="slice-label">禁止上岗</div>
										<div class="slice-value">25%</div>
									</div>
									<div class="pie-slice other">
										<div class="slice-label">其他异常</div>
										<div class="slice-value">10%</div>
									</div>
								</div>
								<div class="pie-legend">
									<div class="legend-item">
										<span class="legend-color high-temp"></span>
										<span>体温偏高 ({{ abnormalDistribution.highTemp }})</span>
									</div>
									<div class="legend-item">
										<span class="legend-color forbidden"></span>
										<span>禁止上岗 ({{ abnormalDistribution.forbidden }})</span>
									</div>
									<div class="legend-item">
										<span class="legend-color other"></span>
										<span>其他异常 ({{ abnormalDistribution.other }})</span>
									</div>
								</div>
							</div>
						</div>

						<div class="overview-card small">
							<h3>月度晨检统计</h3>
							<div class="month-stats">
								<div class="month-stat">
									<div class="stat-title">平均晨检率</div>
									<div class="stat-number">{{ monthStats.avgRate }}%</div>
								</div>
								<div class="month-stat">
									<div class="stat-title">总异常人数</div>
									<div class="stat-number">{{ monthStats.totalAbnormal }}</div>
								</div>
								<div class="month-stat">
									<div class="stat-title">异常率</div>
									<div class="stat-number">{{ monthStats.abnormalRate }}%</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 详细报表表格 -->
				<div class="report-detail">
					<h3 class="detail-title">详细数据报表</h3>
					<div class="table-container">
						<table class="report-table">
							<thead>
								<tr>
									<th>日期</th>
									<th>应检人数</th>
									<th>已检人数</th>
									<th>晨检率</th>
									<th>正常人数</th>
									<th>体温偏高</th>
									<th>禁止上岗</th>
									<th>异常率</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="row in reportDetailData" :key="row.date">
									<td>{{ row.date }}</td>
									<td>{{ row.total }}</td>
									<td>{{ row.checked }}</td>
									<td>
										<span :class="{ 'high-rate': row.rate >= 95 }">{{ row.rate }}%</span>
									</td>
									<td>{{ row.normal }}</td>
									<td>{{ row.highTemp }}</td>
									<td>{{ row.forbidden }}</td>
									<td>{{ row.abnormalRate }}%</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- 导出功能 -->
				<div class="export-section">
					<button class="export-btn" @click="exportReport">
						<span class="export-icon">📊</span>
						导出报表数据
					</button>
				</div>
			</section>

			<!-- 系统设置界面 -->
			<section class="settings-section" v-show="activeMenu === 'config'">
				<h2 class="section-title">系统设置</h2>

				<div class="settings-container">
					<!-- 基础设置 -->
					<div class="settings-card">
						<h3 class="settings-card-title">
							<span class="settings-icon">⚙️</span>
							基础设置
						</h3>
						<div class="settings-form">
							<div class="form-group">
								<label class="form-label">晨检时间范围</label>
								<div class="form-control">
									<input type="time" v-model="systemSettings.checkStartTime" />
									<span class="time-separator">至</span>
									<input type="time" v-model="systemSettings.checkEndTime" />
								</div>
							</div>

							<div class="form-group">
								<label class="form-label">正常体温范围</label>
								<div class="form-control">
									<input type="number" v-model.number="systemSettings.normalTempMin" step="0.1" />
									<span class="temp-separator">~</span>
									<input type="number" v-model.number="systemSettings.normalTempMax" step="0.1" />
									<span class="temp-unit">℃</span>
								</div>
							</div>

							<div class="form-group">
								<label class="form-label">体温偏高阈值</label>
								<div class="form-control">
									<input type="number" v-model.number="systemSettings.highTempThreshold" step="0.1" />
									<span class="temp-unit">℃</span>
								</div>
							</div>

							<div class="form-group">
								<label class="form-label">禁止上岗阈值</label>
								<div class="form-control">
									<input type="number" v-model.number="systemSettings.forbiddenTempThreshold"
										step="0.1" />
									<span class="temp-unit">℃</span>
								</div>
							</div>

							<div class="form-group">
								<label class="form-label">数据保留期限</label>
								<div class="form-control">
									<input type="number" v-model.number="systemSettings.dataRetentionDays" />
									<span class="unit-text">天</span>
								</div>
							</div>
						</div>
					</div>

					<!-- 通知设置 -->
					<div class="settings-card">
						<h3 class="settings-card-title">
							<span class="settings-icon">🔔</span>
							通知设置
						</h3>
						<div class="settings-form">
							<div class="form-group checkbox-group">
								<label class="checkbox-label">
									<input type="checkbox" :checked="systemSettings.notifyAdmin"
										@change="systemSettings.notifyAdmin = $event.target.checked" />
									<span class="checkbox-text">异常时通知管理员</span>
								</label>
							</div>

							<div class="form-group checkbox-group">
								<label class="checkbox-label">
									<input type="checkbox" :checked="systemSettings.notifyDepartmentHead"
										@change="systemSettings.notifyDepartmentHead = $event.target.checked" />
									<span class="checkbox-text">异常时通知部门负责人</span>
								</label>
							</div>

							<div class="form-group checkbox-group">
								<label class="checkbox-label">
									<input type="checkbox" :checked="systemSettings.dailyReport"
										@change="systemSettings.dailyReport = $event.target.checked" />
									<span class="checkbox-text">每日晨检报告</span>
								</label>
							</div>

							<div class="form-group checkbox-group">
								<label class="checkbox-label">
									<input type="checkbox" :checked="systemSettings.weeklyReport"
										@change="systemSettings.weeklyReport = $event.target.checked" />
									<span class="checkbox-text">每周汇总报告</span>
								</label>
							</div>

							<div class="form-group">
								<label class="form-label">通知邮箱</label>
								<div class="form-control">
									<input type="text" v-model="systemSettings.notifyEmail"
										placeholder="请输入接收通知的邮箱地址" />
								</div>
							</div>
						</div>
					</div>

					<!-- 用户管理 -->
					<div class="settings-card">
						<h3 class="settings-card-title">
							<span class="settings-icon">👥</span>
							用户管理
						</h3>
						<div class="user-management">
							<div class="user-search">
								<input type="text" v-model="userSearchKeyword" placeholder="搜索用户姓名或工号"
									@input="filterUsers" />
								<button class="add-user-btn" @click="showAddUserModal = true">+ 添加用户</button>
							</div>

							<div class="table-container">
								<table class="user-table">
									<thead>
										<tr>
											<th>姓名</th>
											<th>工号</th>
											<th>岗位</th>
											<th>部门</th>
											<th>权限</th>
											<th>操作</th>
										</tr>
									</thead>
									<tbody>
										<tr v-for="user in filteredUserList" :key="user.id">
											<td>{{ user.name }}</td>
											<td>{{ user.empId }}</td>
											<td>{{ user.position }}</td>
											<td>{{ user.department }}</td>
											<td>
												<span
													:class="['permission-badge', user.permission === 'admin' ? 'admin' : 'normal']">
													{{ user.permission === 'admin' ? '管理员' : '普通用户' }}
												</span>
											</td>
											<td>
												<button class="action-btn edit" @click="editUser(user)">编辑</button>
												<button class="action-btn delete"
													@click="deleteUser(user.id)">删除</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							<div class="user-count">
								共 {{ filteredUserList.length }} 名用户
							</div>
						</div>
					</div>

					<!-- 保存设置按钮 -->
					<div class="settings-actions">
						<button class="save-btn" @click="saveSettings">保存设置</button>
						<button class="reset-btn" @click="resetSettings">恢复默认</button>
					</div>
				</div>
			</section>

			<!-- 晨检异常提醒 -->
			<section class="alert-section" v-show="activeMenu === 'today'">
				<h2 class="section-title">晨检异常提醒</h2>
				<div class="alert-list">
					<div v-for="alert in abnormalAlerts" :key="alert.id" :class="['alert-item', alert.type]">
						<div class="alert-header">
							<span class="alert-title">{{ alert.name }}({{ alert.empId }}) - {{ alert.issue }}</span>
						</div>
						<div class="alert-content">
							<p>{{ alert.description }}</p>
							<p v-if="alert.record" class="alert-record">{{ alert.record }}</p>
						</div>
					</div>
				</div>
			</section>

			<!-- 手动录入对话框 -->
			<div class="modal-overlay" v-if="showManualCheck">
				<div class="modal-dialog">
					<div class="modal-header">
						<h3>手动晨检录入</h3>
						<button class="close-btn" @click="showManualCheck = false">×</button>
					</div>
					<div class="modal-body">
						<div class="form-group">
							<label>员工工号：</label>
							<input type="text" v-model="manualData.empId" placeholder="请输入员工工号" />
						</div>
						<div class="form-group">
							<label>体温：</label>
							<input type="text" v-model="manualData.temperature" placeholder="请输入体温(℃)" />
						</div>
						<div class="form-group">
							<label>健康状态：</label>
							<select v-model="manualData.status">
								<option value="normal">正常</option>
								<option value="high_temp">体温偏高</option>
								<option value="forbidden">禁止上岗</option>
							</select>
						</div>
						<div class="form-group">
							<label>备注：</label>
							<textarea v-model="manualData.remark" placeholder="请输入备注信息"></textarea>
						</div>
					</div>
					<div class="modal-footer">
						<button class="cancel-btn" @click="showManualCheck = false">取消</button>
						<button class="submit-btn" @click="submitManualCheck">提交</button>
					</div>
				</div>
			</div>

			<!-- 添加用户对话框 -->
			<div class="modal-overlay" v-if="showAddUserModal">
				<div class="modal-dialog user-modal">
					<div class="modal-header">
						<h3>{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
						<button class="close-btn" @click="closeUserModal">×</button>
					</div>
					<div class="modal-body">
						<div class="form-group">
							<label>姓名：</label>
							<input type="text" v-model="userForm.name" placeholder="请输入姓名" />
						</div>
						<div class="form-group">
							<label>工号：</label>
							<input type="text" v-model="userForm.empId" placeholder="请输入工号" />
						</div>
						<div class="form-group">
							<label>岗位：</label>
							<input type="text" v-model="userForm.position" placeholder="请输入岗位" />
						</div>
						<div class="form-group">
							<label>部门：</label>
							<select v-model="userForm.department">
								<option value="后厨">后厨</option>
								<option value="前厅">前厅</option>
								<option value="保洁">保洁</option>
								<option value="管理">管理</option>
								<option value="采购">采购</option>
							</select>
						</div>
						<div class="form-group">
							<label>权限：</label>
							<select v-model="userForm.permission">
								<option value="normal">普通用户</option>
								<option value="admin">管理员</option>
							</select>
						</div>
					</div>
					<div class="modal-footer">
						<button class="cancel-btn" @click="closeUserModal">取消</button>
						<button class="submit-btn" @click="saveUser">{{ editingUser ? '更新' : '添加' }}</button>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script>
	export default {
		name: 'MorningCheckSystem',
		data() {
			return {
				// 当前激活菜单
				activeMenu: 'today',

				// 菜单列表
				menus: [{
						id: 'today',
						name: '今日晨检记录'
					},
					{
						id: 'scan',
						name: '扫码晨检'
					},
					{
						id: 'history',
						name: '历史记录'
					},
					{
						id: 'report',
						name: '报表统计'
					},
					{
						id: 'config',
						name: '系统设置'
					}
				],

				// 今日日期
				todayDate: vk.pubfn.timeFormat(new Date(), 'yyyy-MM-dd'),

				// 统计数字
				statistics: {
					total: 128,
					checked: 125,
					abnormal: 2,
					unchecked: 3
				},

				// 表格列定义
				tableColumns: [{
						key: 'id',
						title: '序号'
					},
					{
						key: 'name',
						title: '姓名'
					},
					{
						key: 'empId',
						title: '工号'
					},
					{
						key: 'position',
						title: '岗位'
					},
					{
						key: 'checkTime',
						title: '晨检时间'
					},
					{
						key: 'temperature',
						title: '体温'
					},
					{
						key: 'status',
						title: '健康状态'
					},
					{
						key: 'remark',
						title: '备注'
					}
				],

				// 晨检记录数据
				checkRecords: [{
						id: 1,
						name: '王建军',
						empId: 'ST001',
						position: '后厨厨师',
						checkTime: '08:05:23',
						temperature: '36.5℃',
						status: 'normal',
						remark: '-'
					},
					{
						id: 2,
						name: '刘芳',
						empId: 'ST002',
						position: '前厅服务',
						checkTime: '08:10:15',
						temperature: '37.1℃',
						status: 'high_temp',
						remark: '建议休息观察'
					},
					{
						id: 3,
						name: '李秀英',
						empId: 'ST003',
						position: '保洁员',
						checkTime: '08:15:40',
						temperature: '36.8℃',
						status: 'normal',
						remark: '-'
					},
					{
						id: 4,
						name: '张明华',
						empId: 'ST004',
						position: '面点师',
						checkTime: '08:20:18',
						temperature: '37.5℃',
						status: 'forbidden',
						remark: '发热，已安排就医'
					},
					{
						id: 5,
						name: '陈刚',
						empId: 'ST005',
						position: '管理员',
						checkTime: null,
						temperature: null,
						status: 'unchecked',
						remark: '请假未到岗'
					},
					{
						id: 6,
						name: '赵强',
						empId: 'ST006',
						position: '后厨助手',
						checkTime: '08:25:33',
						temperature: '36.7℃',
						status: 'normal',
						remark: '-'
					},
					{
						id: 7,
						name: '周敏',
						empId: 'ST007',
						position: '前厅服务',
						checkTime: '08:30:12',
						temperature: '36.9℃',
						status: 'normal',
						remark: '-'
					},
					{
						id: 8,
						name: '吴伟',
						empId: 'ST008',
						position: '采购员',
						checkTime: '08:35:45',
						temperature: '37.0℃',
						status: 'normal',
						remark: '-'
					},
					{
						id: 9,
						name: '郑芳',
						empId: 'ST009',
						position: '面点师',
						checkTime: '08:40:20',
						temperature: '36.6℃',
						status: 'normal',
						remark: '-'
					},
					{
						id: 10,
						name: '孙建国',
						empId: 'ST010',
						position: '后厨厨师',
						checkTime: '08:45:15',
						temperature: '36.8℃',
						status: 'normal',
						remark: '-'
					}
				],

				// 分页相关
				currentPage: 1,
				pageSize: 5,

				// 筛选状态
				filterStatus: 'all',

				// 异常提醒数据
				abnormalAlerts: [{
						id: 1,
						name: '刘芳',
						empId: 'ST002',
						issue: '体温偏高',
						type: 'warning',
						description: '体温37.1℃，超出正常范围(36.0-37.0℃)，建议暂时休息观察，每小时复测一次',
						record: '复测记录：09:15复测36.9℃，10:15复测36.8℃'
					},
					{
						id: 2,
						name: '张明华',
						empId: 'ST004',
						issue: '发热禁止上岗',
						type: 'danger',
						description: '体温37.5℃，达到禁止上岗标准，已通知其立即离岗就医，待康复后持健康证明返岗',
						record: '已联系本人，目前在家休息，体温38.2℃'
					}
				],

				// 手动录入对话框
				showManualCheck: false,
				manualData: {
					empId: '',
					temperature: '',
					status: 'normal',
					remark: ''
				},

				// 历史记录相关
				historyDate: vk.pubfn.timeFormat(new Date(), 'yyyy-MM-dd'),
				historyRecords: [],

				// =============== 报表统计数据 ===============
				activeTimeRange: 'week', // 当前选中的时间范围: day, week, month
				reportDate: vk.pubfn.timeFormat(new Date(), 'yyyy-MM-dd'),
				timeRanges: [{
						id: 'day',
						name: '日报'
					},
					{
						id: 'week',
						name: '周报'
					},
					{
						id: 'month',
						name: '月报'
					}
				],

				// 晨检率趋势数据
				// rateTrendData: [{
				// 		date: '02-01',
				// 		rate: 97.2
				// 	},
				// 	{
				// 		date: '02-02',
				// 		rate: 96.8
				// 	},
				// 	{
				// 		date: '02-03',
				// 		rate: 98.1
				// 	},
				// 	{
				// 		date: '02-04',
				// 		rate: 97.5
				// 	},
				// 	{
				// 		date: '02-05',
				// 		rate: 96.3
				// 	},
				// 	{
				// 		date: '02-06',
				// 		rate: 97.9
				// 	},
				// 	{
				// 		date: '02-07',
				// 		rate: 98.5
				// 	},
				// 	{
				// 		date: '02-08',
				// 		rate: 97.0
				// 	}
				// ],

				// 异常类型分布
				abnormalDistribution: {
					highTemp: 13,
					forbidden: 5,
					other: 2
				},

				// 月度统计
				monthStats: {
					avgRate: 97.4,
					totalAbnormal: 20,
					abnormalRate: 1.5
				},

				// 详细报表数据
				// reportDetailData: [{
				// 		date: '2026-02-01',
				// 		total: 128,
				// 		checked: 125,
				// 		rate: 97.7,
				// 		normal: 123,
				// 		highTemp: 2,
				// 		forbidden: 0,
				// 		abnormalRate: 1.6
				// 	},
				// 	{
				// 		date: '2026-02-02',
				// 		total: 128,
				// 		checked: 124,
				// 		rate: 96.9,
				// 		normal: 121,
				// 		highTemp: 3,
				// 		forbidden: 0,
				// 		abnormalRate: 2.4
				// 	},
				// 	{
				// 		date: '2026-02-03',
				// 		total: 130,
				// 		checked: 128,
				// 		rate: 98.5,
				// 		normal: 126,
				// 		highTemp: 2,
				// 		forbidden: 0,
				// 		abnormalRate: 1.6
				// 	},
				// 	{
				// 		date: '2026-02-04',
				// 		total: 128,
				// 		checked: 125,
				// 		rate: 97.7,
				// 		normal: 122,
				// 		highTemp: 2,
				// 		forbidden: 1,
				// 		abnormalRate: 2.3
				// 	},
				// 	{
				// 		date: '2026-02-05',
				// 		total: 128,
				// 		checked: 123,
				// 		rate: 96.1,
				// 		normal: 119,
				// 		highTemp: 3,
				// 		forbidden: 1,
				// 		abnormalRate: 3.1
				// 	},
				// 	{
				// 		date: '2026-02-06',
				// 		total: 128,
				// 		checked: 126,
				// 		rate: 98.4,
				// 		normal: 124,
				// 		highTemp: 2,
				// 		forbidden: 0,
				// 		abnormalRate: 1.6
				// 	},
				// 	{
				// 		date: '2026-02-07',
				// 		total: 130,
				// 		checked: 128,
				// 		rate: 98.5,
				// 		normal: 126,
				// 		highTemp: 1,
				// 		forbidden: 1,
				// 		abnormalRate: 1.5
				// 	},
				// 	{
				// 		date: '2026-02-08',
				// 		total: 128,
				// 		checked: 124,
				// 		rate: 96.9,
				// 		normal: 121,
				// 		highTemp: 2,
				// 		forbidden: 1,
				// 		abnormalRate: 2.3
				// 	}
				// ],

				// =============== 系统设置数据 ===============
				systemSettings: {
					checkStartTime: '07:30',
					checkEndTime: '09:00',
					normalTempMin: 36.0,
					normalTempMax: 37.0,
					highTempThreshold: 37.3,
					forbiddenTempThreshold: 37.5,
					dataRetentionDays: 365,
					notifyAdmin: true,
					notifyDepartmentHead: true,
					dailyReport: true,
					weeklyReport: true,
					notifyEmail: 'admin@cafeteria.com'
				},

				// 用户管理数据
				userList: [{
						id: 1,
						name: '管理员',
						empId: 'AD001',
						position: '系统管理员',
						department: '管理',
						permission: 'admin'
					},
					{
						id: 2,
						name: '王建军',
						empId: 'ST001',
						position: '后厨厨师',
						department: '后厨',
						permission: 'normal'
					},
					{
						id: 3,
						name: '刘芳',
						empId: 'ST002',
						position: '前厅服务',
						department: '前厅',
						permission: 'normal'
					},
					{
						id: 4,
						name: '李秀英',
						empId: 'ST003',
						position: '保洁员',
						department: '保洁',
						permission: 'normal'
					},
					{
						id: 5,
						name: '张明华',
						empId: 'ST004',
						position: '面点师',
						department: '后厨',
						permission: 'normal'
					},
					{
						id: 6,
						name: '陈刚',
						empId: 'ST005',
						position: '管理员',
						department: '管理',
						permission: 'admin'
					},
					{
						id: 7,
						name: '赵强',
						empId: 'ST006',
						position: '后厨助手',
						department: '后厨',
						permission: 'normal'
					},
					{
						id: 8,
						name: '周敏',
						empId: 'ST007',
						position: '前厅服务',
						department: '前厅',
						permission: 'normal'
					},
					{
						id: 9,
						name: '吴伟',
						empId: 'ST008',
						position: '采购员',
						department: '采购',
						permission: 'normal'
					},
					{
						id: 10,
						name: '郑芳',
						empId: 'ST009',
						position: '面点师',
						department: '后厨',
						permission: 'normal'
					}
				],

				// 用户搜索
				userSearchKeyword: '',

				// 用户编辑
				showAddUserModal: false,
				editingUser: null,
				userForm: {
					name: '',
					empId: '',
					position: '',
					department: '后厨',
					permission: 'normal'
				},

				// 默认设置（用于重置）
				defaultSettings: {}
			};
		},
		computed: {
			rateTrendData() {
				const baseData = [{
						rate: 97.2
					},
					{
						rate: 96.8
					},
					{
						rate: 98.1
					},
					{
						rate: 97.5
					},
					{
						rate: 96.3
					},
					{
						rate: 97.9
					},
					{
						rate: 98.5
					},
					{
						rate: 97.0
					}
				]

				// 生成最近8天的日期（格式 YYYY-MM-DD）
				const daysCount = baseData.length;
				const dates = [];
				const today = new Date();
				for (let i = daysCount - 1; i >= 0; i--) {
					const date = new Date(today);
					date.setDate(today.getDate() - i);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					dates.push(`${year}-${month}-${day}`);
				}

				// 合并日期与数据
				return baseData.map((item, index) => ({
					date: dates[index],
					...item
				}));
			},

			reportDetailData() {
				// 定义数据模板（保留除日期外的字段值）				
				const baseData = [{
						total: 128,
						checked: 125,
						rate: 97.7,
						normal: 123,
						highTemp: 2,
						forbidden: 0,
						abnormalRate: 1.6
					},
					{
						total: 128,
						checked: 124,
						rate: 96.9,
						normal: 121,
						highTemp: 3,
						forbidden: 0,
						abnormalRate: 2.4
					},
					{
						total: 130,
						checked: 128,
						rate: 98.5,
						normal: 126,
						highTemp: 2,
						forbidden: 0,
						abnormalRate: 1.6
					},
					{
						total: 128,
						checked: 125,
						rate: 97.7,
						normal: 122,
						highTemp: 2,
						forbidden: 1,
						abnormalRate: 2.3
					},
					{
						total: 128,
						checked: 123,
						rate: 96.1,
						normal: 119,
						highTemp: 3,
						forbidden: 1,
						abnormalRate: 3.1
					},
					{
						total: 128,
						checked: 126,
						rate: 98.4,
						normal: 124,
						highTemp: 2,
						forbidden: 0,
						abnormalRate: 1.6
					},
					{
						total: 130,
						checked: 128,
						rate: 98.5,
						normal: 126,
						highTemp: 1,
						forbidden: 1,
						abnormalRate: 1.5
					},
					{
						total: 128,
						checked: 124,
						rate: 96.9,
						normal: 121,
						highTemp: 2,
						forbidden: 1,
						abnormalRate: 2.3
					}
				];

				// 生成最近8天的日期（格式 YYYY-MM-DD）
				const daysCount = baseData.length;
				const dates = [];
				const today = new Date();
				for (let i = daysCount - 1; i >= 0; i--) {
					const date = new Date(today);
					date.setDate(today.getDate() - i);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					dates.push(`${year}-${month}-${day}`);
				}

				// 合并日期与数据
				return baseData.map((item, index) => ({
					date: dates[index],
					...item
				}));
			},

			// 计算晨检率
			checkRate() {
				return ((this.statistics.checked / this.statistics.total) * 100).toFixed(1);
			},

			// 根据筛选条件过滤记录
			filteredRecords() {
				if (this.filterStatus === 'all') {
					return this.checkRecords;
				}
				return this.checkRecords.filter(record => record.status === this.filterStatus);
			},

			// 计算总页数
			totalPages() {
				return Math.ceil(this.filteredRecords.length / this.pageSize);
			},

			// 获取当前页的记录
			paginatedRecords() {
				const start = (this.currentPage - 1) * this.pageSize;
				const end = start + this.pageSize;
				return this.filteredRecords.slice(start, end);
			},

			// 显示的页码范围
			visiblePages() {
				const pages = [];
				const start = Math.max(1, this.currentPage - 1);
				const end = Math.min(this.totalPages, this.currentPage + 1);

				for (let i = start; i <= end; i++) {
					pages.push(i);
				}
				return pages;
			},

			// 显示记录范围
			displayRange() {
				const start = (this.currentPage - 1) * this.pageSize + 1;
				const end = Math.min(this.currentPage * this.pageSize, this.filteredRecords.length);
				return `${start}-${end}条`;
			},

			// 过滤用户列表
			filteredUserList() {
				if (!this.userSearchKeyword) {
					return this.userList;
				}
				const keyword = this.userSearchKeyword.toLowerCase();
				return this.userList.filter(user =>
					user.name.toLowerCase().includes(keyword) ||
					user.empId.toLowerCase().includes(keyword)
				);
			}
		},
		created() {
			// 保存默认设置用于重置
			this.defaultSettings = JSON.parse(JSON.stringify(this.systemSettings));
		},
		methods: {
			// 切换菜单
			switchMenu(menuId) {
				this.activeMenu = menuId;
				this.currentPage = 1; // 切换菜单时重置分页
			},

			// 获取状态对应的CSS类
			getStatusClass(status) {
				const statusMap = {
					normal: 'status-normal',
					high_temp: 'status-warning',
					forbidden: 'status-danger',
					unchecked: 'status-unchecked'
				};
				return statusMap[status] || '';
			},

			// 获取状态文本
			getStatusText(status) {
				const statusTextMap = {
					normal: '√正常',
					high_temp: '！体温偏高',
					forbidden: '×禁止上岗',
					unchecked: '未检'
				};
				return statusTextMap[status] || status;
			},

			// 格式化日期显示
			formatDate(dateString) {
				if (!dateString) return '';
				const date = new Date(dateString);
				return `${date.getMonth() + 1}月${date.getDate()}日`;
			},

			// 加载历史记录数据
			loadHistoryData() {
				// 模拟加载历史数据
				this.historyRecords = [{
						id: 1,
						name: '王建军',
						empId: 'ST001',
						position: '后厨厨师',
						checkTime: '08:05:10',
						temperature: '36.4℃',
						status: 'normal',
						remark: '-'
					},
					{
						id: 2,
						name: '刘芳',
						empId: 'ST002',
						position: '前厅服务',
						checkTime: '08:12:25',
						temperature: '36.7℃',
						status: 'normal',
						remark: '-'
					},
					{
						id: 3,
						name: '张明华',
						empId: 'ST004',
						position: '面点师',
						checkTime: '08:18:33',
						temperature: '36.5℃',
						status: 'normal',
						remark: '-'
					}
				];

				// 更新表格数据以显示历史记录
				this.checkRecords = this.historyRecords;
			},

			// 提交手动晨检
			submitManualCheck() {
				if (!this.manualData.empId || !this.manualData.temperature) {
					alert('请填写完整信息');
					return;
				}

				// 模拟添加新记录
				const newRecord = {
					id: this.checkRecords.length + 1,
					name: '新员工', // 实际系统中这里应该根据工号查询员工姓名
					empId: this.manualData.empId,
					position: '未知岗位',
					checkTime: new Date().toLocaleTimeString('zh-CN', {
						hour12: false
					}),
					temperature: this.manualData.temperature + '℃',
					status: this.manualData.status,
					remark: this.manualData.remark || '-'
				};

				this.checkRecords.unshift(newRecord);
				this.showManualCheck = false;
				this.manualData = {
					empId: '',
					temperature: '',
					status: 'normal',
					remark: ''
				};

				// 更新统计数字
				this.statistics.checked++;
				this.statistics.unchecked--;

				if (this.manualData.status !== 'normal') {
					this.statistics.abnormal++;

					// 添加异常提醒
					const alertType = this.manualData.status === 'high_temp' ? 'warning' : 'danger';
					const issue = this.manualData.status === 'high_temp' ? '体温偏高' : '禁止上岗';
					this.abnormalAlerts.push({
						id: this.abnormalAlerts.length + 1,
						name: '新员工',
						empId: this.manualData.empId,
						issue: issue,
						type: alertType,
						description: `体温${this.manualData.temperature}℃，${this.manualData.status === 'high_temp' ? '超出正常范围' : '达到禁止上岗标准'}`,
						record: '手动录入'
					});
				}

				alert('晨检记录添加成功！');
			},

			// =============== 报表统计方法 ===============
			// 切换时间范围
			switchTimeRange(rangeId) {
				this.activeTimeRange = rangeId;
				// 模拟加载不同时间范围的数据
				this.loadReportData(rangeId);
			},

			// 加载报表数据
			loadReportData(rangeId) {
				// 模拟根据时间范围加载数据
				console.log(`加载${rangeId}报表数据`);
				// 在实际应用中，这里会调用API获取对应时间范围的数据
			},

			// 导出报表
			exportReport() {
				alert('报表数据导出成功！');
				// 在实际应用中，这里会生成并下载报表文件
			},

			// =============== 系统设置方法 ===============
			// 过滤用户
			filterUsers() {
				// 计算属性已经处理过滤
			},

			// 编辑用户
			editUser(user) {
				this.editingUser = user;
				this.userForm = {
					...user
				};
				this.showAddUserModal = true;
			},

			// 删除用户
			deleteUser(userId) {
				if (confirm('确定要删除此用户吗？')) {
					this.userList = this.userList.filter(user => user.id !== userId);
				}
			},

			// 保存用户
			saveUser() {
				if (!this.userForm.name || !this.userForm.empId || !this.userForm.position) {
					alert('请填写完整信息');
					return;
				}

				if (this.editingUser) {
					// 更新用户
					const index = this.userList.findIndex(user => user.id === this.editingUser.id);
					if (index !== -1) {
						this.userList[index] = {
							...this.editingUser,
							...this.userForm
						};
					}
				} else {
					// 添加新用户
					const newUser = {
						id: this.userList.length + 1,
						...this.userForm
					};
					this.userList.push(newUser);
				}

				this.closeUserModal();
			},

			// 关闭用户对话框
			closeUserModal() {
				this.showAddUserModal = false;
				this.editingUser = null;
				this.userForm = {
					name: '',
					empId: '',
					position: '',
					department: '后厨',
					permission: 'normal'
				};
			},

			// 保存系统设置
			saveSettings() {
				// 在实际应用中，这里会调用API保存设置
				alert('系统设置已保存！');
			},

			// 重置系统设置
			resetSettings() {
				this.systemSettings = JSON.parse(JSON.stringify(this.defaultSettings));
				alert('系统设置已恢复为默认值！');
			}
		},
		watch: {
			// 筛选状态改变时重置到第一页
			filterStatus() {
				this.currentPage = 1;
			},

			// 切换菜单时，如果切换到今日记录，恢复原始数据
			activeMenu(newMenu) {
				if (newMenu === 'today') {
					// 恢复今日数据
					this.checkRecords = [{
							id: 1,
							name: '王建军',
							empId: 'ST001',
							position: '后厨厨师',
							checkTime: '08:05:23',
							temperature: '36.5℃',
							status: 'normal',
							remark: '-'
						},
						{
							id: 2,
							name: '刘芳',
							empId: 'ST002',
							position: '前厅服务',
							checkTime: '08:10:15',
							temperature: '37.1℃',
							status: 'high_temp',
							remark: '建议休息观察'
						},
						{
							id: 3,
							name: '李秀英',
							empId: 'ST003',
							position: '保洁员',
							checkTime: '08:15:40',
							temperature: '36.8℃',
							status: 'normal',
							remark: '-'
						},
						{
							id: 4,
							name: '张明华',
							empId: 'ST004',
							position: '面点师',
							checkTime: '08:20:18',
							temperature: '37.5℃',
							status: 'forbidden',
							remark: '发热，已安排就医'
						},
						{
							id: 5,
							name: '陈刚',
							empId: 'ST005',
							position: '管理员',
							checkTime: null,
							temperature: null,
							status: 'unchecked',
							remark: '请假未到岗'
						},
						{
							id: 6,
							name: '赵强',
							empId: 'ST006',
							position: '后厨助手',
							checkTime: '08:25:33',
							temperature: '36.7℃',
							status: 'normal',
							remark: '-'
						},
						{
							id: 7,
							name: '周敏',
							empId: 'ST007',
							position: '前厅服务',
							checkTime: '08:30:12',
							temperature: '36.9℃',
							status: 'normal',
							remark: '-'
						},
						{
							id: 8,
							name: '吴伟',
							empId: 'ST008',
							position: '采购员',
							checkTime: '08:35:45',
							temperature: '37.0℃',
							status: 'normal',
							remark: '-'
						},
						{
							id: 9,
							name: '郑芳',
							empId: 'ST009',
							position: '面点师',
							checkTime: '08:40:20',
							temperature: '36.6℃',
							status: 'normal',
							remark: '-'
						},
						{
							id: 10,
							name: '孙建国',
							empId: 'ST010',
							position: '后厨厨师',
							checkTime: '08:45:15',
							temperature: '36.8℃',
							status: 'normal',
							remark: '-'
						}
					];
				} else if (newMenu === 'history') {
					// 清空历史记录，等待用户选择日期
					this.checkRecords = [];
				}
			}
		}
	};
</script>

<style scoped>
	/* 样式部分与之前相同，保持不变 */
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
	}

	.morning-check-system {
		width: 100%;
		min-height: 100vh;
		background-color: #f5f7fa;
		color: #333;
	}

	/* 顶部蓝色栏 */
	.system-header {
		background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
		color: white;
		padding: 16px 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
	}

	.system-title {
		font-size: 22px;
		font-weight: 600;
	}

	.check-rate {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: rgba(255, 255, 255, 0.2);
		padding: 8px 16px;
		border-radius: 8px;
	}

	.rate-value {
		font-size: 24px;
		font-weight: bold;
		margin-top: 4px;
	}

	/* 菜单栏 */
	.system-menu {
		background-color: white;
		border-bottom: 1px solid #e8e8e8;
		padding: 0 24px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.menu-list {
		display: flex;
		list-style: none;
	}

	.menu-list li {
		padding: 16px 24px;
		cursor: pointer;
		font-size: 16px;
		color: #666;
		border-bottom: 3px solid transparent;
		transition: all 0.3s;
		position: relative;
	}

	.menu-list li:hover {
		color: #1890ff;
	}

	.menu-list li.active {
		color: #1890ff;
		border-bottom-color: #1890ff;
		font-weight: 600;
	}

	.date-badge {
		background-color: #f0f0f0;
		color: #666;
		font-size: 12px;
		padding: 2px 6px;
		border-radius: 4px;
		margin-left: 6px;
		font-weight: normal;
	}

	/* 主内容区 */
	.system-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 24px;
	}

	/* 统计卡片 */
	.statistics-section {
		margin-bottom: 24px;
	}

	.section-title {
		font-size: 18px;
		color: #333;
		margin-bottom: 16px;
		font-weight: 600;
		display: flex;
		align-items: center;
	}

	.stats-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		margin-bottom: 24px;
	}

	.stat-card {
		background-color: white;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		text-align: center;
		border-top: 4px solid #1890ff;
	}

	.stat-card.total {
		border-top-color: #1890ff;
	}

	.stat-card.checked {
		border-top-color: #52c41a;
	}

	.stat-card.abnormal {
		border-top-color: #faad14;
	}

	.stat-card.unchecked {
		border-top-color: #f5222d;
	}

	.stat-label {
		font-size: 14px;
		color: #666;
		margin-bottom: 8px;
	}

	.stat-value {
		font-size: 32px;
		font-weight: bold;
		color: #333;
	}

	/* 扫描晨检区域 */
	.scan-section {
		margin-bottom: 24px;
	}

	.scan-container {
		display: flex;
		gap: 24px;
	}

	.scan-area {
		flex: 2;
		background-color: white;
		border-radius: 8px;
		padding: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 300px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		border: 2px dashed #d9d9d9;
	}

	.scan-placeholder {
		text-align: center;
		color: #999;
	}

	.scan-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	.scan-tip {
		font-size: 14px;
		margin-top: 8px;
		color: #666;
	}

	.scan-instruction {
		flex: 1;
		background-color: white;
		border-radius: 8px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.scan-instruction h3 {
		margin-bottom: 16px;
		color: #333;
	}

	.scan-instruction ol {
		padding-left: 20px;
		margin-bottom: 24px;
		color: #666;
		line-height: 1.6;
	}

	.scan-instruction li {
		margin-bottom: 8px;
	}

	.manual-btn {
		background-color: #1890ff;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
		width: 100%;
		transition: background-color 0.3s;
	}

	.manual-btn:hover {
		background-color: #40a9ff;
	}

	/* 表格区域 */
	.record-section {
		margin-bottom: 24px;
	}

	.filter-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		background-color: white;
		padding: 12px 16px;
		border-radius: 8px 8px 0 0;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.filter-options {
		display: flex;
		align-items: center;
	}

	.filter-options label {
		margin-right: 8px;
		color: #666;
	}

	.filter-options select {
		padding: 6px 12px;
		border: 1px solid #d9d9d9;
		border-radius: 4px;
		background-color: white;
		color: #333;
	}

	.record-info {
		color: #666;
		font-size: 14px;
	}

	.table-container {
		background-color: white;
		border-radius: 0 0 8px 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		margin-bottom: 16px;
	}

	.check-table {
		width: 100%;
		border-collapse: collapse;
	}

	.check-table th {
		background-color: #fafafa;
		color: #333;
		font-weight: 600;
		text-align: left;
		padding: 16px;
		border-bottom: 1px solid #e8e8e8;
	}

	.check-table td {
		padding: 16px;
		border-bottom: 1px solid #f0f0f0;
		color: #333;
	}

	.check-table tbody tr:hover {
		background-color: #fafafa;
	}

	.no-check {
		color: #999;
	}

	.status-badge {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
	}

	.status-normal {
		background-color: #f6ffed;
		color: #52c41a;
		border: 1px solid #b7eb8f;
	}

	.status-warning {
		background-color: #fff7e6;
		color: #fa8c16;
		border: 1px solid #ffd591;
	}

	.status-danger {
		background-color: #fff2f0;
		color: #f5222d;
		border: 1px solid #ffccc7;
	}

	.status-unchecked {
		background-color: #fafafa;
		color: #8c8c8c;
		border: 1px solid #d9d9d9;
	}

	/* 分页 */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		margin-top: 20px;
	}

	.page-btn {
		background-color: white;
		border: 1px solid #d9d9d9;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		color: #333;
		transition: all 0.3s;
	}

	.page-btn:hover:not(:disabled) {
		border-color: #1890ff;
		color: #1890ff;
	}

	.page-btn:disabled {
		color: #d9d9d9;
		cursor: not-allowed;
	}

	.page-number {
		padding: 8px 12px;
		border: 1px solid #d9d9d9;
		border-radius: 4px;
		cursor: pointer;
		color: #333;
		transition: all 0.3s;
	}

	.page-number:hover {
		border-color: #1890ff;
		color: #1890ff;
	}

	.page-number.active {
		background-color: #1890ff;
		color: white;
		border-color: #1890ff;
	}

	.page-info {
		margin-left: 16px;
		color: #666;
		font-size: 14px;
	}

	/* 历史记录筛选 */
	.history-section {
		margin-bottom: 24px;
	}

	.history-filter {
		display: flex;
		align-items: center;
		gap: 16px;
		background-color: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		margin-bottom: 16px;
	}

	.filter-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.filter-group label {
		color: #666;
	}

	.filter-group input {
		padding: 8px 12px;
		border: 1px solid #d9d9d9;
		border-radius: 4px;
		height: 40px;
		width: 180px;
	}

	.query-btn {
		background-color: #1890ff;
		color: white;
		border: none;
		padding: 8px 20px;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.query-btn:hover {
		background-color: #40a9ff;
	}

	.history-hint {
		background-color: #e6f7ff;
		border: 1px solid #91d5ff;
		border-radius: 4px;
		padding: 12px 16px;
		color: #0066cc;
		margin-bottom: 20px;
	}

	/* 报表统计样式 */
	.report-section {
		margin-bottom: 24px;
	}

	.report-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		background-color: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.time-range-selector {
		display: flex;
		gap: 8px;
	}

	.time-range-selector button {
		padding: 8px 16px;
		border: 1px solid #d9d9d9;
		background-color: white;
		border-radius: 4px;
		cursor: pointer;
		color: #666;
		transition: all 0.3s;
	}

	.time-range-selector button:hover {
		border-color: #1890ff;
		color: #1890ff;
	}

	.time-range-selector button.active {
		background-color: #1890ff;
		color: white;
		border-color: #1890ff;
	}

	.date-picker {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.date-picker label {
		color: #666;
	}

	.date-picker input {
		padding: 8px 12px;
		border: 1px solid #d9d9d9;
		height: 40px;
		border-radius: 4px;
	}

	.report-overview {
		display: flex;
		gap: 24px;
		margin-bottom: 24px;
	}

	.overview-card {
		background-color: white;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		flex: 2;
	}

	.overview-card h3 {
		font-size: 16px;
		color: #333;
		margin-bottom: 16px;
		font-weight: 600;
	}

	.overview-card.small {
		flex: 1;
	}

	.trend-chart {
		height: 200px;
	}

	.chart-container {
		display: flex;
		height: 100%;
		align-items: flex-end;
		justify-content: space-around;
		padding: 20px 0;
	}


	.chart-bar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		justify-content: flex-end;
	}

	.chart-bar-label {
		font-size: 12px;
		color: #666;
		margin-bottom: 8px;
	}

	.chart-bar-bg {
		width: 40px;
		height: 120px;
		background-color: #f5f5f5;
		border-radius: 4px;
		position: relative;
		overflow: hidden;
	}

	.chart-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: #1890ff;
		border-radius: 4px 4px 0 0;
		transition: height 0.5s ease;
	}

	.chart-bar.high-rate {
		background-color: #52c41a;
	}

	.chart-bar-value {
		font-size: 12px;
		color: #333;
		margin-top: 8px;
		font-weight: 500;
	}

	.pie-chart-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.pie-chart {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		background: conic-gradient(#ffa940 0% 65%,
				#f5222d 65% 90%,
				#8c8c8c 90% 100%);
		margin-bottom: 16px;
		position: relative;
	}

	.pie-slice {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: white;
		text-align: center;
	}

	.pie-slice.high-temp {
		clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%);
	}

	.pie-slice.forbidden {
		clip-path: polygon(50% 50%, 0% 50%, 0% 0%, 100% 0%, 100% 100%, 0% 100%);
	}

	.slice-label {
		font-size: 12px;
		font-weight: 500;
	}

	.slice-value {
		font-size: 16px;
		font-weight: bold;
	}

	.pie-legend {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: #333;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
	}

	.legend-color.high-temp {
		background-color: #ffa940;
	}

	.legend-color.forbidden {
		background-color: #f5222d;
	}

	.legend-color.other {
		background-color: #8c8c8c;
	}

	.month-stats {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.month-stat {
		text-align: center;
	}

	.stat-title {
		font-size: 14px;
		color: #666;
		margin-bottom: 4px;
	}

	.stat-number {
		font-size: 28px;
		font-weight: bold;
		color: #1890ff;
	}

	.report-detail {
		background-color: white;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		margin-bottom: 24px;
	}

	.detail-title {
		font-size: 16px;
		color: #333;
		margin-bottom: 16px;
		font-weight: 600;
	}

	.report-table {
		width: 100%;
		border-collapse: collapse;
	}

	.report-table th {
		background-color: #fafafa;
		color: #333;
		font-weight: 600;
		text-align: center;
		padding: 12px 16px;
		border-bottom: 1px solid #e8e8e8;
	}

	.report-table td {
		padding: 12px 16px;
		border-bottom: 1px solid #f0f0f0;
		color: #333;
		text-align: center;
	}

	.report-table tbody tr:hover {
		background-color: #fafafa;
	}

	.high-rate {
		color: #52c41a;
		font-weight: 500;
	}

	.export-section {
		text-align: center;
	}

	.export-btn {
		background-color: #1890ff;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		transition: background-color 0.3s;
	}

	.export-btn:hover {
		background-color: #40a9ff;
	}

	/* 系统设置样式 */
	.settings-section {
		margin-bottom: 24px;
	}

	.settings-container {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.settings-card {
		background-color: white;
		border-radius: 8px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.settings-card-title {
		font-size: 18px;
		color: #333;
		margin-bottom: 20px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.settings-form {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-label {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}

	.form-control {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.form-control input {
		padding: 8px 12px;
		border: 1px solid #d9d9d9;
		border-radius: 4px;
		box-sizing: border-box;
		height: 40px;
		flex: 1;
	}

	.time-separator,
	.temp-separator {
		color: #666;
	}

	.temp-unit,
	.unit-text {
		color: #666;
		min-width: 30px;
	}

	.checkbox-group {
		flex-direction: row;
		align-items: center;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.checkbox-text {
		color: #333;
	}

	.user-management {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.user-search {
		display: flex;
		gap: 12px;
	}

	.user-search input {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #d9d9d9;
		box-sizing: border-box;
		height: 40px;
		border-radius: 4px;
	}

	.add-user-btn {
		background-color: #52c41a;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.add-user-btn:hover {
		background-color: #73d13d;
	}

	.user-table {
		width: 100%;
		border-collapse: collapse;
	}

	.user-table th {
		background-color: #fafafa;
		color: #333;
		font-weight: 600;
		text-align: left;
		padding: 12px 16px;
		border-bottom: 1px solid #e8e8e8;
	}

	.user-table td {
		padding: 12px 16px;
		border-bottom: 1px solid #f0f0f0;
		color: #333;
	}

	.permission-badge {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
	}

	.permission-badge.admin {
		background-color: #f6ffed;
		color: #52c41a;
		border: 1px solid #b7eb8f;
	}

	.permission-badge.normal {
		background-color: #f0f0f0;
		color: #666;
		border: 1px solid #d9d9d9;
	}

	.action-btn {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		border: none;
		cursor: pointer;
		margin-right: 8px;
	}

	.action-btn.edit {
		background-color: #1890ff;
		color: white;
	}

	.action-btn.edit:hover {
		background-color: #40a9ff;
	}

	.action-btn.delete {
		background-color: #ff4d4f;
		color: white;
	}

	.action-btn.delete:hover {
		background-color: #ff7875;
	}

	.user-count {
		text-align: right;
		font-size: 14px;
		color: #666;
	}

	.settings-actions {
		display: flex;
		justify-content: flex-end;
		gap: 16px;
		padding-top: 20px;
		border-top: 1px solid #f0f0f0;
	}

	.save-btn {
		background-color: #1890ff;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
		transition: background-color 0.3s;
	}

	.save-btn:hover {
		background-color: #40a9ff;
	}

	.reset-btn {
		background-color: white;
		color: #666;
		border: 1px solid #d9d9d9;
		padding: 12px 24px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
		transition: all 0.3s;
	}

	.reset-btn:hover {
		border-color: #1890ff;
		color: #1890ff;
	}

	/* 其他现有样式保持不变 */
	/* ... 其他样式与之前相同 ... */

	/* 响应式调整 */
	@media (max-width: 768px) {
		.stats-cards {
			grid-template-columns: repeat(2, 1fr);
		}

		.scan-container {
			flex-direction: column;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.check-rate {
			margin-top: 12px;
		}

		.menu-list {
			overflow-x: auto;
		}

		.menu-list li {
			padding: 12px 16px;
			white-space: nowrap;
		}

		.report-overview {
			flex-direction: column;
		}

		.settings-form {
			grid-template-columns: 1fr;
		}
	}
</style>