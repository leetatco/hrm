<template>
	<view class="container">
		<!-- 状态栏 -->
		<u-status-bar bgColor="transparent"></u-status-bar>

		<!-- 搜索栏 -->
		<view class="search-box">
			<u-search placeholder="搜索姓名、部门、职位..." v-model="searchKeyword" shape="round" :showAction="false" height="70"
				:clearabled="true"></u-search>
		</view>

		<!-- 快速筛选 -->
		<view class="filter-section">
			<scroll-view class="filter-scroll" scroll-x="true" showsHorizontalScrollIndicator="false">
				<view class="filter-tags">
					<view class="filter-tag" :class="{ active: filterType === 'all' }" @click="changeFilter('all')">
						<text>全部</text>
					</view>
					<view class="filter-tag" :class="{ active: filterType === 'department' }"
						@click="changeFilter('department')">
						<text>按部门</text>
					</view>
					<view class="filter-tag" :class="{ active: filterType === 'letter' }"
						@click="changeFilter('letter')">
						<text>按字母</text>
					</view>
					<view class="filter-tag" :class="{ active: filterType === 'recent' }"
						@click="changeFilter('recent')">
						<text>最近联系</text>
					</view>
					<view class="filter-tag" :class="{ active: filterType === 'star' }" @click="changeFilter('star')">
						<u-icon name="star" size="24" color="#ff9900"></u-icon>
						<text>星标联系人</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 按字母排序视图 -->
		<view class="content" v-if="filterType === 'letter'">
			<!-- 字母索引 -->
			<view class="letter-index">
				<scroll-view class="index-scroll" scroll-y="true" :scroll-into-view="currentLetter">
					<view v-for="(letter, index) in letters" :key="index"
						:class="['index-item', { active: currentLetter === letter }]" :id="letter"
						@click="scrollToLetter(letter)">
						<text>{{ letter }}</text>
					</view>
				</scroll-view>
			</view>

			<!-- 联系人列表 -->
			<scroll-view class="contacts-list" scroll-y="true" :scroll-into-view="currentLetter" @scroll="handleScroll">
				<view v-for="(group, letter) in contactsByLetter" :key="letter" :id="letter">
					<view class="letter-header">
						<text class="letter-title">{{ letter }}</text>
						<text class="letter-count">{{ group.length }}人</text>
					</view>

					<view class="contacts-group">
						<view class="contact-item" v-for="contact in group" :key="contact.id"
							@click="viewContactDetail(contact)">
							<view class="contact-avatar">
								<u-avatar :src="contact.avatar" size="80" mode="aspectFill" :sex="contact.sex"
									:sex-icon="contact.sex === '男' ? 'man' : 'woman'"></u-avatar>
								<view class="online-status" v-if="contact.online" :class="contact.online"></view>
							</view>

							<view class="contact-info">
								<view class="contact-main">
									<text class="contact-name">{{ contact.name }}</text>
									<u-icon v-if="contact.star" name="star" size="20" color="#ff9900"
										class="star-icon"></u-icon>
									<text class="contact-position" v-if="contact.position">{{ contact.position }}</text>
								</view>
								<view class="contact-detail">
									<text class="contact-department">{{ contact.department }}</text>
									<text class="contact-phone" v-if="contact.phone">{{ contact.phone }}</text>
								</view>
							</view>

							<view class="contact-actions">
								<view class="action-btn phone" @click.stop="makeCall(contact.phone)"
									v-if="contact.phone">
									<u-icon name="phone" size="28" color="#2979ff"></u-icon>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 按部门视图 -->
		<view class="content" v-else-if="filterType === 'department'">
			<view class="department-list">
				<u-collapse :accordion="true" :border="false">
					<u-collapse-item v-for="dept in departments" :key="dept.id" :title="dept.name" :name="dept.id">
						<template #title>
							<view class="dept-title">
								<text class="dept-name">{{ dept.name }}</text>
								<text class="dept-count">{{ dept.memberCount }}人</text>
							</view>
						</template>

						<view class="dept-members">
							<view class="member-item" v-for="member in dept.members" :key="member.id"
								@click="viewContactDetail(member)">
								<view class="member-avatar">
									<u-avatar :src="member.avatar" size="60" mode="aspectFill"></u-avatar>
								</view>
								<view class="member-info">
									<text class="member-name">{{ member.name }}</text>
									<text class="member-position">{{ member.position }}</text>
								</view>
								<view class="member-actions">
									<view class="action-btn" @click.stop="makeCall(member.phone)" v-if="member.phone">
										<u-icon name="phone" size="24" color="#2979ff"></u-icon>
									</view>
								</view>
							</view>
						</view>
					</u-collapse-item>
				</u-collapse>
			</view>
		</view>

		<!-- 其他视图 -->
		<view class="content" v-else>
			<view class="contacts-list">
				<view class="contact-item" v-for="contact in filteredContacts" :key="contact.id"
					@click="viewContactDetail(contact)">
					<view class="contact-avatar">
						<u-avatar :src="contact.avatar" size="80" mode="aspectFill"></u-avatar>
						<view class="online-status" v-if="contact.online" :class="contact.online"></view>
					</view>

					<view class="contact-info">
						<view class="contact-main">
							<text class="contact-name">{{ contact.name }}</text>
							<u-icon v-if="contact.star" name="star" size="20" color="#ff9900"
								class="star-icon"></u-icon>
						</view>
						<view class="contact-detail">
							<text class="contact-department">{{ contact.department }}</text>
							<text class="contact-position">{{ contact.position }}</text>
						</view>
					</view>

					<view class="contact-actions">
						<view class="action-btn phone" @click.stop="makeCall(contact.phone)" v-if="contact.phone">
							<u-icon name="phone" size="28" color="#2979ff"></u-icon>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 右侧字母索引提示 -->
		<view class="letter-tip" v-if="showLetterTip && filterType === 'letter'">
			<text class="letter-tip-text">{{ currentLetter }}</text>
		</view>
		<!-- 底部导航栏 -->
		<u-tabbar :list="tabbar" :before-switch="beforeTabSwitch" icon-size="50" border-top hide-tab-bar></u-tabbar>
	</view>
</template>
<script>
	import {
		pinyin
	} from 'pinyin-pro';
	export default {
		data() {
			return {
				// 搜索关键词
				searchKeyword: '',
				// 筛选类型
				filterType: 'letter',
				// 当前选中的字母
				currentLetter: 'A',
				// 是否显示字母提示
				showLetterTip: false,
				// 字母索引
				letters: ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
					'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
				],
				// 模拟的联系人数据
				contacts: [],
				// 部门数据
				departments: [],
				// 底部导航
				tabbar: [{
						iconPath: "/static/icon_home.png",
						selectedIconPath: "/static/icon_home_sel.png",
						pagePath: "/pages/index/index",
						text: "首页"
					},
					{
						iconPath: "/static/icon_msg.png",
						selectedIconPath: "/static/icon_msg_sel.png",
						pagePath: "/pages/notice/index",
						text: "消息"
					},
					{
						iconPath: "/static/icon_mailList.png",
						selectedIconPath: "/static/icon_mailList_sel.png",
						pagePath: "/pages/contacts/index",
						text: "通讯录"
					},
					{
						iconPath: "/static/icon_user.png",
						selectedIconPath: "/static/icon_user_sel.png",
						pagePath: "/pages/user/index",
						text: "我的"
					}
				]
			}
		},
		computed: {
			// 按字母分组
			contactsByLetter() {
				const groups = {};

				// 初始化字母分组
				this.letters.forEach(letter => {
					groups[letter] = [];
				});

				// 过滤后的联系人
				const filtered = this.filteredContacts;

				// 按姓名首字母分组
				filtered.forEach(contact => {
					let firstLetter = contact.pinyin ? contact.pinyin.charAt(0).toUpperCase() :
						contact.name ? contact.name.charAt(0).toUpperCase() : '#';

					// 如果不是字母，则归到#组
					if (!/^[A-Z]$/.test(firstLetter)) {
						firstLetter = '#';
					}

					if (groups[firstLetter]) {
						groups[firstLetter].push(contact);
					} else {
						groups['#'].push(contact);
					}
				});

				// 移除空分组
				Object.keys(groups).forEach(letter => {
					if (groups[letter].length === 0) {
						delete groups[letter];
					}
				});

				return groups;
			},

			// 过滤后的联系人
			filteredContacts() {
				let contacts = [...this.contacts];

				// 搜索过滤
				if (this.searchKeyword) {
					const keyword = this.searchKeyword.toLowerCase();
					contacts = contacts.filter(contact =>
						contact.name.toLowerCase().includes(keyword) ||
						contact.department.toLowerCase().includes(keyword) ||
						contact.position.toLowerCase().includes(keyword) ||
						(contact.phone && contact.phone.includes(keyword))
					);
				}

				// 筛选类型过滤
				switch (this.filterType) {
					case 'recent':
						// 按最近联系时间排序
						contacts = contacts.sort((a, b) => {
							return new Date(b.lastContact) - new Date(a.lastContact);
						});
						break;
					case 'star':
						contacts = contacts.filter(contact => contact.star);
						break;
				}

				return contacts;
			},

			// 总人数
			totalCount() {
				return this.contacts.length;
			}
		},
		onLoad() {
			this.loadContacts();
		},
		onShow() {
			// 页面显示时刷新数据
			this.refreshData();
		},
		methods: {
			// 切换tab前的拦截
			beforeTabSwitch(index) {
				// 中间按钮处理
				// if (this.tabbarList[index].midButton) {
				// 	this.showCenterAction();
				// 	return false;
				// }
				return true;
			},
			// 加载联系人数据
			async loadContacts() {
				let data = await vk.callFunction({
					url: 'client/employees/sys/getList',
					title: '请求中...',
					data: {},
				});
				if (data.code == 0) {
					const result = this.processEmployeeData(data);
					this.contacts = result.contacts;
					this.departments = result.departments;
				}
			},

			// 更健壮的数据处理函数
			processEmployeeData(data) {
				// 用于存储处理后的数据
				const result = {
					contacts: [],
					departments: []
				};

				// 如果数据为空，直接返回
				if (!data || !data.rows || data.rows.length === 0) {
					return result;
				}

				// 创建部门和员工的映射
				const departmentMap = new Map();
				const contactMap = new Map(); // 用于去重

				data.rows.forEach(employee => {
					// 处理基本数据
					const employeeId = employee.employee_id;
					const department = employee.departments || {};
					const position = employee.positions || {};

					// 1. 处理联系人信息
					const contact = {
						id: employeeId,
						name: employee.employee_name || '未知姓名',
						pinyin: pinyin(employee.employee_name),
						department: department.department_name || '未分配部门',
						position: position.position_name || '未知职位',
						phone: employee.mobile || '',
						departmentId: department.department_id || 0,
						positionId: position.position_id || 0,
						// avatar: employee.avatar || this.getDefaultAvatar(employee.sex),
						sex: employee.sex || '男',
						email: employee.email || '',
						extension: employee.extension || '', // 分机号
						office: employee.office || '', // 办公室
						// 其他业务字段
						jobNumber: employee.job_number || '', // 工号
						joinDate: employee.join_date || '', // 入职日期
						status: employee.status || 1 // 员工状态
					};

					// 添加到联系人列表（去重）
					if (!contactMap.has(employeeId)) {
						result.contacts.push(contact);
						contactMap.set(employeeId, true);
					}

					// 2. 处理部门分组
					const deptId = department.department_id || 0;
					const deptName = department.department_name || '未分配部门';

					if (!departmentMap.has(deptId)) {
						departmentMap.set(deptId, {
							id: deptId,
							name: deptName,
							sort: department.sort || 0, // 部门排序字段
							parentId: department.parent_id || 0, // 上级部门ID
							memberCount: 0,
							members: []
						});
					}

					const deptData = departmentMap.get(deptId);

					// 添加到部门成员
					deptData.members.push({
						id: employeeId,
						name: employee.employee_name,
						// avatar: employee.avatar || this.getDefaultAvatar(employee.sex),
						position: position.position_name,
						phone: employee.mobile,
						email: employee.email || '',
						jobNumber: employee.job_number || '',
						// 可以添加排序字段
						sort: employee.sort || 0
					});
				});

				// 3. 计算部门人数并排序
				departmentMap.forEach(department => {
					department.memberCount = department.members.length;

					// 按职位或姓名对成员排序
					department.members.sort((a, b) => {
						// 先按职位排序（如果有职位排序字段）
						// 然后按姓名拼音排序
						const pinyinA = pinyin(a.name || '');
						const pinyinB = pinyin(b.name || '');
						return pinyinA.localeCompare(pinyinB);
					});
				});

				// 4. 转换为数组并排序
				result.departments = Array.from(departmentMap.values());

				// 按部门排序字段排序
				result.departments.sort((a, b) => {
					// 先按sort字段排序，然后按名称
					if (a.sort !== b.sort) return a.sort - b.sort;
					return a.name.localeCompare(b.name);
				});

				return result;
			},

			// 获取默认头像
			getDefaultAvatar(sex) {
				return sex === '女' ? '/static/female_avatar.png' : '/static/male_avatar.png';
			},

			// 刷新数据
			refreshData() {
				// 这里可以调用API刷新数据
				console.log('刷新通讯录数据');
			},

			// 处理搜索
			handleSearch(value) {
				console.log('搜索:', value);
				// 可以在这里添加搜索逻辑
			},

			// 清除搜索
			handleClearSearch() {
				this.searchKeyword = '';
			},

			// 切换筛选类型
			changeFilter(type) {
				this.filterType = type;
			},

			// 滚动到指定字母
			scrollToLetter(letter) {
				this.currentLetter = letter;
				this.showLetterTip = true;

				// 1秒后隐藏提示
				setTimeout(() => {
					this.showLetterTip = false;
				}, 1000);
			},

			// 处理滚动
			handleScroll(e) {
				// 这里可以添加滚动时更新当前字母的逻辑
				// 由于模拟数据较少，暂不实现
			},

			// 查看联系人详情
			viewContactDetail(contact) {
				// uni.navigateTo({
				// 	url: `/pages/contacts/detail?id=${contact.id}`
				// });
			},

			// 拨打电话
			makeCall(phone) {
				uni.showActionSheet({
					itemList: [`拨打 ${phone}`, '复制号码'],
					success: (res) => {
						if (res.tapIndex === 0) {
							uni.makePhoneCall({
								phoneNumber: phone
							});
						} else if (res.tapIndex === 1) {
							uni.setClipboardData({
								data: phone,
								success: () => {
									uni.showToast({
										title: '号码已复制',
										icon: 'success'
									});
								}
							});
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
		padding-bottom: 120rpx;
		box-sizing: border-box;
	}

	/* 隐藏滚动条 */
	scroll-view ::-webkit-scrollbar {
		display: none;
		width: 0;
		height: 0;
		background: transparent;
	}

	/* 确保滚动容器隐藏滚动条 */
	.filter-scroll,
	.contacts-list,
	.index-scroll {
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.search-box {
		padding: 0 40rpx 30rpx;
	}

	.filter-section {
		padding: 0 40rpx 30rpx;

		.filter-scroll {
			white-space: nowrap;

			.filter-tags {
				display: inline-flex;
				gap: 20rpx;

				.filter-tag {
					padding: 16rpx 32rpx;
					background-color: #f8f9fa;
					border-radius: 40rpx;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					gap: 8rpx;

					text {
						font-size: 26rpx;
						color: #666666;
						white-space: nowrap;
					}

					&.active {
						background: linear-gradient(135deg, #2979ff, #4dabff);

						text {
							color: #ffffff;
						}

						.u-icon {
							color: #ffffff !important;
						}
					}
				}
			}
		}
	}

	.content {
		display: flex;
		height: calc(100vh - 400rpx);
		padding: 0 40rpx;
		box-sizing: border-box;

		.letter-index {
			width: 60rpx;
			margin-right: 20rpx;

			.index-scroll {
				height: 100%;
				background: transparent;

				.index-item {
					height: 40rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 4rpx;

					text {
						font-size: 24rpx;
						color: #999999;
					}

					&.active {
						text {
							color: #2979ff;
							font-weight: bold;
						}
					}
				}
			}
		}

		.contacts-list {
			flex: 1;
			height: 100%;

			.letter-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx 0;
				background-color: #ffffff;
				position: sticky;
				top: 0;
				z-index: 10;

				.letter-title {
					font-size: 28rpx;
					font-weight: bold;
					color: #333333;
				}

				.letter-count {
					font-size: 24rpx;
					color: #999999;
				}
			}

			.contacts-group {
				.contact-item {
					display: flex;
					align-items: center;
					padding: 30rpx 0;
					border-bottom: 1rpx solid #f0f0f0;
					background-color: #ffffff;

					&:last-child {
						border-bottom: none;
					}

					.contact-avatar {
						position: relative;
						margin-right: 24rpx;

						.online-status {
							position: absolute;
							bottom: 0;
							right: 0;
							width: 16rpx;
							height: 16rpx;
							border-radius: 50%;
							border: 2rpx solid #ffffff;

							&.online {
								background-color: #19be6b;
							}
						}
					}

					.contact-info {
						flex: 1;
						min-width: 0;

						.contact-main {
							display: flex;
							align-items: center;
							margin-bottom: 8rpx;

							.contact-name {
								font-size: 32rpx;
								font-weight: 500;
								color: #333333;
								margin-right: 8rpx;
							}

							.star-icon {
								margin-right: 8rpx;
							}

							.contact-position {
								font-size: 24rpx;
								color: #999999;
							}
						}

						.contact-detail {
							display: flex;
							flex-direction: column;

							.contact-department {
								font-size: 26rpx;
								color: #666666;
								margin-bottom: 4rpx;
							}

							.contact-phone {
								font-size: 24rpx;
								color: #999999;
							}
						}
					}

					.contact-actions {
						display: flex;
						align-items: center;
						gap: 20rpx;

						.action-btn {
							width: 60rpx;
							height: 60rpx;
							border-radius: 50%;
							display: flex;
							align-items: center;
							justify-content: center;
							background-color: #f8f9fa;
							transition: all 0.3s;

							&:active {
								transform: scale(0.95);
							}

							&.phone {
								background-color: #f0f7ff;
							}
						}
					}
				}
			}
		}

		/* 部门视图 */
		.department-list {
			width: 100%;

			::v-deep .u-collapse {
				.u-collapse-item {
					margin-bottom: 20rpx;
					border-radius: 16rpx;
					overflow: hidden;
					box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

					.u-collapse-head {
						padding: 30rpx;
						background-color: #ffffff;

						.dept-title {
							display: flex;
							justify-content: space-between;
							align-items: center;
							width: 100%;

							.dept-name {
								font-size: 30rpx;
								font-weight: 500;
								color: #333333;
							}

							.dept-count {
								font-size: 26rpx;
								color: #999999;
							}
						}
					}

					.u-collapse-body {
						background-color: #fafbfc;

						.dept-members {
							.member-item {
								display: flex;
								align-items: center;
								padding: 24rpx 30rpx;
								border-bottom: 1rpx solid #f0f0f0;

								&:last-child {
									border-bottom: none;
								}

								.member-avatar {
									margin-right: 20rpx;
								}

								.member-info {
									flex: 1;
									display: flex;
									flex-direction: column;

									.member-name {
										font-size: 28rpx;
										color: #333333;
										margin-bottom: 4rpx;
									}

									.member-position {
										font-size: 24rpx;
										color: #999999;
									}
								}

								.member-actions {
									.action-btn {
										width: 50rpx;
										height: 50rpx;
										border-radius: 50%;
										display: flex;
										align-items: center;
										justify-content: center;
										background-color: #f0f7ff;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	/* 其他视图（全部、最近联系、星标联系人） */
	.content:not([v-if]) .contacts-list {
		.contact-item {
			display: flex;
			align-items: center;
			padding: 30rpx 0;
			border-bottom: 1rpx solid #f0f0f0;
			background-color: #ffffff;

			&:last-child {
				border-bottom: none;
			}

			.contact-avatar {
				position: relative;
				margin-right: 24rpx;

				.online-status {
					position: absolute;
					bottom: 0;
					right: 0;
					width: 16rpx;
					height: 16rpx;
					border-radius: 50%;
					border: 2rpx solid #ffffff;

					&.online {
						background-color: #19be6b;
					}
				}
			}

			.contact-info {
				flex: 1;
				min-width: 0;

				.contact-main {
					display: flex;
					align-items: center;
					margin-bottom: 8rpx;

					.contact-name {
						font-size: 32rpx;
						font-weight: 500;
						color: #333333;
						margin-right: 8rpx;
					}

					.star-icon {
						margin-right: 8rpx;
					}
				}

				.contact-detail {
					display: flex;
					flex-direction: column;

					.contact-department {
						font-size: 26rpx;
						color: #666666;
						margin-bottom: 4rpx;
					}

					.contact-position {
						font-size: 24rpx;
						color: #999999;
					}
				}
			}

			.contact-actions {
				display: flex;
				align-items: center;
				gap: 20rpx;

				.action-btn {
					width: 60rpx;
					height: 60rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: #f8f9fa;
					transition: all 0.3s;

					&:active {
						transform: scale(0.95);
					}

					&.phone {
						background-color: #f0f7ff;
					}
				}
			}
		}
	}

	.letter-tip {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;

		.letter-tip-text {
			font-size: 48rpx;
			font-weight: bold;
			color: #ffffff;
		}
	}

	/* 响应式调整 */
	@media (max-width: 750px) {
		.header {
			padding: 60rpx 30rpx 20rpx;

			.header-title {
				font-size: 40rpx;
			}
		}

		.search-box,
		.filter-section,
		.content {
			padding-left: 30rpx;
			padding-right: 30rpx;
		}

		.filter-section {
			.filter-scroll {
				.filter-tags {
					.filter-tag {
						padding: 14rpx 28rpx;

						text {
							font-size: 24rpx;
						}
					}
				}
			}
		}

		.content {
			height: calc(100vh - 380rpx);

			.letter-index {
				width: 50rpx;
				margin-right: 15rpx;
			}

			.contacts-list {
				.contacts-group {
					.contact-item {
						padding: 24rpx 0;

						.contact-info {
							.contact-main {
								.contact-name {
									font-size: 28rpx;
								}
							}

							.contact-detail {
								.contact-department {
									font-size: 24rpx;
								}
							}
						}

						.contact-actions {
							gap: 15rpx;

							.action-btn {
								width: 50rpx;
								height: 50rpx;
							}
						}
					}
				}
			}

			.department-list {
				::v-deep .u-collapse {
					.u-collapse-item {
						.u-collapse-head {
							padding: 24rpx;
						}

						.u-collapse-body {
							.dept-members {
								.member-item {
									padding: 20rpx 24rpx;
								}
							}
						}
					}
				}
			}
		}
	}
</style>