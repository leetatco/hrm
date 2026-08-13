<template>
	<view class="search-page">
		<!-- 顶部搜索栏 -->
		<view class="search-bar">
			<u-search v-model="keyword" placeholder="请输入企业名称" shape="round" :show-action="true" action-text="搜索"
				@search="doSearch" @custom="doSearch" />
		</view>

		<!-- 内容区域 -->
		<view class="list-container" v-if="!loading || list.length">
			<u-list v-if="list.length" @scrolltolower="loadMore" :lower-threshold="100">
				<u-list-item v-for="item in list" :key="item._id">
					<view class="list-item" @click="goDetail(item._id)">
						<view class="item-title">{{ item.company_name }}</view>
						<view class="item-info">
							<text class="info-text">{{ item.legal_person || '—' }}</text>
							<text class="info-split">|</text>
							<text class="info-text">{{ item.industry || '—' }}</text>
						</view>
						<view class="item-address">
							<u-icon name="map" size="28" color="#999" />
							<text class="address-text">{{ item.address || '暂无地址' }}</text>
						</view>
					</view>
				</u-list-item>
			</u-list>

			<!-- 加载更多 -->
			<u-loadmore v-if="list.length" :status="loadStatus" :load-text="loadText" />

			<!-- 空状态 -->
			<u-empty v-if="!loading && list.length === 0 && keyword" text="暂无数据" mode="data" />
		</view>

		<!-- 首次加载状态 -->
		<view class="loading-view" v-if="loading && list.length === 0">
			<u-loading mode="circle" />
			<text class="loading-text">加载中...</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '', // 搜索关键词
				list: [], // 企业列表
				loading: false, // 是否加载中
				pageNo: 1, // 当前页码
				pageSize: 15, // 每页数量
				total: 0, // 总记录数
				loadStatus: 'loadmore', // loadmore 组件状态：loadmore/loading/nomore
				loadText: {
					loadmore: '上拉加载更多',
					loading: '加载中...',
					nomore: '没有更多了'
				}
			};
		},
		methods: {
			/**
			 * 执行搜索（重置列表，从第一页开始）
			 */
			async doSearch() {
				if (!this.keyword.trim()) {
					uni.showToast({
						title: '请输入企业名称',
						icon: 'none'
					});
					return;
				}
				this.resetSearch();
				await this.fetchData();
			},

			/**
			 * 重置搜索状态
			 */
			resetSearch() {
				this.list = [];
				this.pageNo = 1;
				this.total = 0;
				this.loadStatus = 'loadmore';
			},

			/**
			 * 加载更多（上拉触底）
			 */
			async loadMore() {
				if (this.loadStatus === 'nomore' || this.loading) return;
				if (this.list.length >= this.total && this.total > 0) {
					this.loadStatus = 'nomore';
					return;
				}
				this.pageNo++;
				await this.fetchData(true);
			},

			/**
			 * 请求数据
			 * @param {Boolean} isAppend 是否追加到现有列表
			 */
			async fetchData(isAppend = false) {
				if (!isAppend) this.loading = true;
				else this.loadStatus = 'loading';

				try {
					const res = await vk.callFunction({
						url: 'client/customer/pub/list',
						title: '请求中...',
						data: {
							keyword: this.keyword.trim(),
							pageNo: this.pageNo,
							pageSize: this.pageSize
						}
					});

					if (res.code === 0) {
						const newList = res.rows || [];
						this.total = res.total || 0;
						if (isAppend) {
							this.list = [...this.list, ...newList];
						} else {
							this.list = newList;
						}
						// 更新加载状态
						if (this.list.length >= this.total && this.total > 0) {
							this.loadStatus = 'nomore';
						} else {
							this.loadStatus = 'loadmore';
						}
					} else {
						uni.showToast({
							title: res.msg || '查询失败',
							icon: 'none'
						});
						if (!isAppend) this.list = [];
					}
				} catch (err) {
					console.error(err);
					uni.showToast({
						title: '网络异常',
						icon: 'none'
					});
					if (!isAppend) this.list = [];
				} finally {
					if (!isAppend) this.loading = false;
					else if (this.loadStatus === 'loading') this.loadStatus = 'loadmore';
				}
			},

			goDetail() {
				vk.navigateTo({
					url: `/pages/customer/detail`,
					events: {
						// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
						update: (data) => {
							// 当B页面运行 eventChannel.emit('update', { a:1 }); 时，会运行这里的代码逻辑。
						},
					},
					success: (res) => {
						// 通过eventChannel向被打开页面传送数据
						res.eventChannel.emit('data', {
							customer: this.list[0] || {}
						});
					},
				});

			}
		}
	};
</script>

<style lang="scss" scoped>
	.search-page {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.search-bar {
		position: sticky;
		top: 0;
		z-index: 10;
		background-color: #fff;
		padding: 16rpx 24rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	.list-container {
		padding: 16rpx 24rpx;
	}

	.list-item {
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		transition: all 0.2s;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

		&:active {
			transform: scale(0.98);
			background-color: #fafafa;
		}
	}

	.item-title {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 12rpx;
		line-height: 1.4;
	}

	.item-info {
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #666;
		margin-bottom: 12rpx;

		.info-split {
			margin: 0 12rpx;
			color: #ccc;
		}
	}

	.item-address {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: #999;

		.address-text {
			margin-left: 8rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			flex: 1;
		}
	}

	.loading-view {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;

		.loading-text {
			margin-top: 20rpx;
			font-size: 28rpx;
			color: #999;
		}
	}
</style>