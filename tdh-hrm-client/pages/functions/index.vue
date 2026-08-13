<!-- pages/functions/index.vue -->
<template>
	<view class="functions-container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<u-search 
				v-model="keyword" 
				placeholder="搜索功能名称" 
				@search="handleSearch" 
				@clear="handleClear" 
				shape="round" 
				bg-color="#f5f5f5" 
				height="70" 
				:showAction="false"
			></u-search>
		</view>

		<!-- 功能网格 -->
		<view class="function-grid" v-if="functionList.length > 0">
			<u-grid :col="4" :border="false" :gap="10">
				<u-grid-item v-for="(item, index) in functionList" :key="item._id" @click="goToPage(item)">
					<view class="grid-item">
						<view class="icon-wrapper">
							<!-- 图片图标 -->
							<image 
								class="func-icon" 
								:src="item.imgUrl || ''" 
								mode="aspectFill"
								v-if="item.imgUrl && item._imgLoaded !== false"
								@error="onIconError(item)"
							></image>
							<!-- 占位图标（首字母） -->
							<view class="icon-placeholder" :style="{ background: getColor(index) }" v-else>
								<text class="placeholder-text">{{ item.name.charAt(0) }}</text>
							</view>
						</view>
						<text class="func-name">{{ item.name }}</text>
						<u-badge v-if="item.badge" :value="item.badge" :offset="[-5, -5]" size="mini"></u-badge>
					</view>
				</u-grid-item>
			</u-grid>
		</view>

		<!-- 空状态 -->
		<u-empty v-if="!loading && functionList.length === 0" text="暂无功能" mode="list"></u-empty>

		<!-- 加载更多 -->
		<u-loadmore 
			v-if="functionList.length > 0" 
			:status="loadStatus" 
			:icon-type="loadIconType" 
			@loadmore="loadMore" 
		/>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				menuSort: [666],
				keyword: '',          // 搜索关键词
				functionList: [],     // 功能列表
				pageIndex: 1,         // 当前页码
				pageSize: 20,         // 每页数量（功能数量一般不多，设大一点）
				total: 0,             // 总条数
				loading: false,       // 是否加载中
				loadStatus: 'loadmore', // loadmore状态
				// 颜色池（用于占位图标）
				colorPool: ['#2979ff', '#19be6b', '#ff9900', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22', '#3498db']
			}
		},
		computed: {
			loadIconType() {
				return this.loadStatus === 'loading' ? 'flower' : 'arrow-down'
			},
			// 判断是否登录
			hasLogin() {
				return !!vk.getVuex('$user.userInfo.username')
			}
		},
		onLoad() {
			this.getFunctionList(true)
		},
		// 上拉加载更多
		onReachBottom() {
			if (this.loadStatus === 'loadmore' && this.functionList.length < this.total) {
				this.loadMore()
			}
		},
		methods: {
			// -------- 获取功能列表 --------
			async getFunctionList(reset = false) {
				if (reset) {
					this.pageIndex = 1
					this.functionList = []
					this.total = 0
					this.loadStatus = 'loadmore'
				}
				if (this.loading) return
				this.loading = true
				this.loadStatus = 'loading'

				try {
					// 根据登录状态选择不同的数据源
					const url ='admin/common-functions/sys/getList';						
					
					const res = await vk.callFunction({
						url: url,
						title: '加载中...',
						data: {
							status: 'enabled',          // 只获取启用的功能
							sort: this.menuSort,
							name: this.keyword || '',   // 按名称模糊搜索
							pageIndex: this.pageIndex,
							pageSize: this.pageSize
						}
					})

					if (res.code === 0) {
						const { rows, total } = res
						// 初始化图片加载状态
						const processedRows = rows.map(item => ({
							...item,
							_imgLoaded: true
						}))
						if (this.pageIndex === 1) {
							this.functionList = processedRows
						} else {
							this.functionList = [...this.functionList, ...processedRows]
						}
						this.total = total
						// 更新加载更多状态
						if (this.functionList.length >= total) {
							this.loadStatus = 'nomore'
						} else {
							this.loadStatus = 'loadmore'
						}
					} else {
						uni.showToast({
							title: res.message || '查询失败',
							icon: 'none'
						})
						this.loadStatus = 'loadmore'
					}
				} catch (e) {
					console.error('获取功能列表失败', e)
					uni.showToast({
						title: '网络错误，请稍后重试',
						icon: 'none'
					})
					this.loadStatus = 'loadmore'
				} finally {
					this.loading = false
				}
			},

			// -------- 搜索和清空 --------
			handleSearch() {
				this.getFunctionList(true)
			},
			handleClear() {
				this.keyword = ''
				this.getFunctionList(true)
			},

			// -------- 加载更多 --------
			loadMore() {
				if (this.loadStatus === 'nomore' || this.loading) return
				this.pageIndex++
				this.getFunctionList(false)
			},

			// -------- 图标颜色（占位用） --------
			getColor(index) {
				return this.colorPool[index % this.colorPool.length]
			},

			// -------- 图标加载失败处理 --------
			onIconError(item) {
				item._imgLoaded = false
				this.$forceUpdate()
			},

			// -------- 点击功能项跳转 --------
			goToPage(item) {
				if (!item.route) {
					uni.showToast({
						title: '功能开发中',
						icon: 'none'
					})
					return
				}
				// 如果有徽标，点击后清除（可选）
				if (item.badge > 0) {
					item.badge = 0
				}
				uni.navigateTo({
					url: item.route
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.functions-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 30rpx;

		.search-bar {
			padding: 20rpx 20rpx;
			background-color: #ffffff;
			margin-bottom: 20rpx;
		}

		.function-grid {
			background-color: #ffffff;
			margin: 0 20rpx;
			border-radius: 20rpx;
			padding: 20rpx 0 10rpx;
			box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);

			.grid-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 10rpx 0;
				position: relative;

				.icon-wrapper {
					width: 90rpx;
					height: 90rpx;
					border-radius: 18rpx;
					overflow: hidden;
					margin-bottom: 12rpx;
					flex-shrink: 0;

					.func-icon {
						width: 100%;
						height: 100%;
						display: block;
					}

					.icon-placeholder {
						width: 100%;
						height: 100%;
						display: flex;
						align-items: center;
						justify-content: center;
						border-radius: 18rpx;

						.placeholder-text {
							font-size: 36rpx;
							font-weight: 600;
							color: #ffffff;
						}
					}
				}

				.func-name {
					font-size: 24rpx;
					color: #333;
					text-align: center;
					line-height: 1.2;
					max-width: 100rpx;
					word-break: break-all;
				}

				&:active .icon-wrapper {
					transform: scale(0.94);
					transition: transform 0.15s;
				}
			}

			::v-deep .u-grid-item {
				&::after {
					display: none;
				}
			}
		}

		// 空状态间距
		.u-empty {
			margin-top: 120rpx;
		}
	}
</style>