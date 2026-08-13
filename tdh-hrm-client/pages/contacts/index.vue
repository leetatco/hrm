<template>
	<view class="container">
		<!-- 状态栏 -->
		<u-status-bar bgColor="transparent"></u-status-bar>

		<!-- 搜索栏 -->
		<view class="search-box">
			<u-search placeholder="搜索姓名、部门、职位..." v-model="searchKeyword" shape="round" :showAction="false" height="70"
				:clearabled="true" @search="handleSearch" @clear="handleClearSearch"></u-search>
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
				</view>
			</scroll-view>
		</view>

		<!-- 按字母排序视图 -->
		<view class="content" v-if="filterType === 'letter'">
			<!-- 字母索引（只显示已加载的字母） -->
			<view class="letter-index" v-if="Object.keys(contactsByLetter).length > 0">
				<scroll-view class="index-scroll" scroll-y="true" :scroll-into-view="currentLetter">
					<view v-for="letter in availableLetters" :key="letter"
						:class="['index-item', { active: currentLetter === letter }]" :id="letter"
						@click="scrollToLetter(letter)">
						<text>{{ letter }}</text>
					</view>
				</scroll-view>
			</view>

			<!-- 联系人列表 -->
			<scroll-view class="contacts-list" scroll-y="true" :scroll-into-view="currentLetter"
				@scrolltolower="loadMoreContacts" @scroll="handleScroll">
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

				<!-- 加载更多提示 -->
				<view class="load-more" v-if="isLoadingMore">
					<u-loading mode="circle" size="40" text="加载中..."></u-loading>
				</view>
				<view class="load-more" v-else-if="!hasMore && totalCount > 0">
					<text class="no-more">没有更多了</text>
				</view>
			</scroll-view>
		</view>

		<!-- 按部门视图（懒加载成员） -->
		<view class="content" v-else-if="filterType === 'department'">
			<view class="department-list">
				<u-collapse ref="collapse" :accordion="true" :border="false" @change="onDepartmentOpen">
					<u-collapse-item v-for="dept in departments" :key="dept.id" :title="dept.name" :name="dept.id">
						<template #title>
							<view class="dept-title">
								<text class="dept-name">{{ dept.name }}</text>
								<text class="dept-count">{{ dept.memberCount }}人</text>
							</view>
						</template>

						<view class="dept-members" v-if="dept.membersLoaded">
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
						<view class="dept-members-loading" v-else>
							<u-loading mode="circle" size="40" text="加载成员中..."></u-loading>
						</view>
					</u-collapse-item>
				</u-collapse>
			</view>
		</view>

		<!-- 其他视图（全部、最近联系） -->
		<view class="content" v-else>
			<scroll-view class="contacts-list" scroll-y="true" @scrolltolower="loadMoreContacts">
				<view class="contact-item" v-for="contact in displayContacts" :key="contact.id"
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

				<!-- 加载更多提示 -->
				<view class="load-more" v-if="isLoadingMore">
					<u-loading-icon mode="circle" size="40" text="加载中..."></u-loading-icon>
				</view>
				<view class="load-more" v-else-if="!hasMore && totalCount > 0">
					<text class="no-more">没有更多了</text>
				</view>
			</scroll-view>
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
				// 完整字母表
				fullLetters: ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
					'R',
					'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
				],
				// 所有已加载的联系人（分页累积）
				allContacts: [],
				// 部门列表（仅基本信息）
				departments: [],
				// 普通模式分页
				currentPage: 1,
				pageSize: 20,
				totalCount: 0,
				isLoadingMore: false,
				hasMore: true,
				// 搜索模式相关
				isSearchMode: false,
				searchResults: [], // 所有搜索到的联系人（分页累积）
				searchPage: 1,
				searchHasMore: true,
				searchTotal: 0,
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
			// 当前实际显示的联系人列表（根据模式决定）
			displayContacts() {
				if (this.isSearchMode) {
					return this.searchResults;
				}
				// 非搜索模式：按筛选类型处理
				let list = [...this.allContacts];
				if (this.filterType === 'recent') {
					list.sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact));
				}
				return list;
			},
			// 可用的字母索引（基于已加载的联系人）
			availableLetters() {
				const letters = new Set();
				this.displayContacts.forEach(contact => {
					let firstLetter = contact.pinyin ? contact.pinyin.charAt(0).toUpperCase() :
						contact.name ? contact.name.charAt(0).toUpperCase() : '#';
					if (!/^[A-Z]$/.test(firstLetter)) firstLetter = '#';
					letters.add(firstLetter);
				});
				return Array.from(letters).sort();
			},
			// 按字母分组
			contactsByLetter() {
				const groups = {};
				this.displayContacts.forEach(contact => {
					let firstLetter = contact.pinyin ? contact.pinyin.charAt(0).toUpperCase() :
						contact.name ? contact.name.charAt(0).toUpperCase() : '#';
					if (!/^[A-Z]$/.test(firstLetter)) firstLetter = '#';
					if (!groups[firstLetter]) groups[firstLetter] = [];
					groups[firstLetter].push(contact);
				});
				return groups;
			}
		},
		onLoad() {
			this.loadFirstPage();
		},
		onShow() {
			this.loadUnreadCount();
		},
		methods: {
			// 加载未读数量
			async loadUnreadCount() {
				try {
					const res = await this.vk.callFunction({
						url: 'admin/bpmn/notification/pub/getUnreadCount',
						data: {
							userInfo: this.vk.getVuex('$user.userInfo')
						}
					});

					if (res.code === 0) {
						this.tabbar[1].count = res.data.count || 0;
					}
				} catch (error) {
					console.error('加载未读数量失败:', error);
				}
			},
			// 切换tab拦截
			beforeTabSwitch(index) {
				return true;
			},

			// 加载第一页联系人
			async loadFirstPage() {
				this.currentPage = 1;
				this.allContacts = [];
				this.hasMore = true;
				await this.loadContactsPage(1);
			},

			// 加载指定页码的联系人（普通模式）
			async loadContactsPage(page) {
				if (this.isLoadingMore) return;
				this.isLoadingMore = true;

				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/employees/sys/getPhoneList',
						title: '加载中...',
						data: {
							pageIndex: page,
							pageSize: this.pageSize
						}
					});

					if (res.code === 0) {
						const {
							contacts,
							departments,
							total
						} = this.processEmployeeData(res);

						// 累积联系人
						if (page === 1) {
							this.allContacts = contacts;
							// 首次加载时初始化部门列表
							this.initDepartments(departments);
						} else {
							this.allContacts = [...this.allContacts, ...contacts];
						}

						this.totalCount = total;
						this.hasMore = this.allContacts.length < total;
						this.currentPage = page;
					}
				} catch (e) {
					console.error('加载联系人失败', e);
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});
				} finally {
					this.isLoadingMore = false;
				}
			},

			// 加载更多（滚动触发）
			async loadMoreContacts() {
				if (this.isLoadingMore) return;

				if (this.isSearchMode) {
					if (!this.searchHasMore) return;
					await this.loadSearchPage(this.searchPage + 1);
				} else {
					if (!this.hasMore) return;
					await this.loadContactsPage(this.currentPage + 1);
				}
			},

			// 初始化部门列表（仅存储基本信息，成员懒加载）
			initDepartments(deptList) {
				this.departments = deptList.map(dept => ({
					id: dept.id,
					name: dept.name,
					sort: dept.sort,
					parentId: dept.parentId,
					memberCount: dept.memberCount,
					members: [],
					membersLoaded: false,
					loading: false
				}));
			},

			// 部门展开时加载成员
			async onDepartmentOpen(panelId) {
				const dept = this.departments.find(d => d.id === panelId);
				if (!dept || dept.membersLoaded || dept.loading) return;
				dept.loading = true;
				try {
					// 请求该部门下的成员（第一页，可一次性加载全部）
					const res = await vk.callFunction({
						url: 'admin/hrm/employees/sys/getPhoneList',
						data: {
							keyword: dept.name,
							pageIndex: 1,
							pageSize: 100 // 部门成员通常不会太多，一次加载完
						}
					});
					if (res.code === 0) {
						const {
							contacts
						} = this.processEmployeeData(res);
						this.$set(dept, "members", contacts);
						this.$set(dept, "memberCount", res.total);
						dept.membersLoaded = true;

						// 等待 DOM 更新后重新计算 collapse 高度
						this.$nextTick(() => {
							if (this.$refs.collapse && this.$refs.collapse.init) {
								this.$refs.collapse.init();
							}
						});

					}
				} catch (e) {
					console.error('加载部门成员失败', e);
				} finally {
					dept.loading = false;
				}
			},

			// 处理员工数据（转换格式、添加拼音等）
			processEmployeeData(response) {
				const result = {
					contacts: [],
					departments: []
				};

				if (!response || !response.rows || response.rows.length === 0) {
					return {
						...result,
						total: response.total || 0
					};
				}

				const departmentMap = new Map();
				const contactMap = new Map();

				response.rows.forEach(employee => {
					const employeeId = employee.employee_id;
					const department = employee.departments || {};
					const position = employee.positions || {};

					const contact = {
						id: employeeId,
						name: employee.employee_name || '未知姓名',
						pinyin: pinyin(employee.employee_name || ''),
						department: department.department_name || '未分配部门',
						position: position.position_name || '未知职位',
						phone: employee.mobile || '',
						departmentId: department.department_id || 0,
						positionId: position.position_id || 0,
						sex: employee.sex || '男',
						email: employee.email || '',
						extension: employee.extension || '',
						office: employee.office || '',
						jobNumber: employee.job_number || '',
						joinDate: employee.join_date || '',
						status: employee.status || 1,
						star: false,
						online: false,
						lastContact: new Date()
					};

					if (!contactMap.has(employeeId)) {
						result.contacts.push(contact);
						contactMap.set(employeeId, true);
					}

					// 统计部门人数
					const deptId = department.department_id || 0;
					const deptName = department.department_name || '未分配部门';
					if (!departmentMap.has(deptId)) {
						departmentMap.set(deptId, {
							id: deptId,
							name: deptName,
							sort: department.sort || 0,
							parentId: department.parent_id || 0,
							memberCount: 0
						});
					}
					departmentMap.get(deptId).memberCount++;
				});

				result.departments = Array.from(departmentMap.values());
				result.departments.sort((a, b) => {
					if (a.sort !== b.sort) return a.sort - b.sort;
					return a.name.localeCompare(b.name);
				});

				return {
					contacts: result.contacts,
					departments: result.departments,
					total: response.total || 0
				};
			},

			// 搜索处理
			async handleSearch(value) {
				if (!value.trim()) {
					this.handleClearSearch();
					return;
				}

				this.isSearchMode = true;
				this.searchKeyword = value;
				this.searchPage = 1;
				this.searchResults = [];
				this.searchHasMore = true;

				await this.loadSearchPage(1);
			},

			// 加载搜索结果的指定页
			async loadSearchPage(page) {
				if (this.isLoadingMore) return;
				this.isLoadingMore = true;

				try {
					// 假设后端有专门的搜索接口，或者用同一个接口加 keyword 参数
					const res = await vk.callFunction({
						url: 'admin/hrm/employees/sys/getPhoneList',
						data: {
							keyword: this.searchKeyword,
							pageIndex: page,
							pageSize: this.pageSize
						}
					});

					if (res.code === 0) {
						const {
							contacts,
							departments,
							total
						} = this.processEmployeeData(res);

						if (page === 1) {
							this.searchResults = contacts;
							this.initDepartments(departments);
						} else {
							this.searchResults = [...this.searchResults, ...contacts];
							this.initDepartments(departments);
						}

						this.searchTotal = total;
						this.searchHasMore = this.searchResults.length < total;
						this.searchPage = page;
					}
				} catch (e) {
					console.error('搜索失败', e);
				} finally {
					this.isLoadingMore = false;
				}
			},

			// 清除搜索
			handleClearSearch() {
				this.searchKeyword = '';
				this.isSearchMode = false;
				this.searchResults = [];
				this.searchPage = 1;
				this.searchHasMore = false;
				// 恢复普通模式的分页状态（保留已加载的 allContacts）
			},

			// 切换筛选类型
			changeFilter(type) {
				this.filterType = type;
				// 非搜索模式下，切换视图不需要重新请求数据（数据已在 allContacts 中）
				if (!this.isSearchMode) {
					// 如果切换到全部或最近联系，确保至少有一页数据
					if (this.allContacts.length === 0) {
						this.loadFirstPage();
					}
				}
			},

			// 滚动到指定字母
			scrollToLetter(letter) {
				this.currentLetter = letter;
				this.showLetterTip = true;
				setTimeout(() => {
					this.showLetterTip = false;
				}, 1000);
			},

			handleScroll(e) {
				// 可添加滚动更新当前字母逻辑（可选）
			},

			viewContactDetail(contact) {
				console.log('查看详情:', contact);
				// uni.navigateTo({ url: `/pages/contacts/detail?id=${contact.id}` });
			},

			makeCall(phone) {
				if (!phone) {
					uni.showToast({
						title: '暂无号码',
						icon: 'none'
					});
					return;
				}
				if (phone.includes('*')) {
					uni.showToast({
						title: '无权限拨打该号码',
						icon: 'none'
					});
					return;
				}
				// 原有拨打逻辑保持不变
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
								success: () => uni.showToast({
									title: '号码已复制',
									icon: 'success'
								})
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

			.load-more {
				padding: 30rpx 0;
				text-align: center;

				.no-more {
					font-size: 24rpx;
					color: #999999;
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

						.dept-members-loading {
							padding: 40rpx;
							text-align: center;
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