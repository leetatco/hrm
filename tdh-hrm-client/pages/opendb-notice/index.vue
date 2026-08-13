<template>
	<view class="notice-list-container">
		<!-- 搜索栏（小清新表头） -->
		<view class="filter-section">
			<view class="search-bar">
				<u-search v-model="keyword" placeholder="请输入公告标题" @search="handleSearch" @clear="handleClear"
					shape="round" bg-color="#ffffff" height="70" :showAction="false"></u-search>
			</view>
		</view>

		<!-- 公告列表（卡片式） -->
		<view class="notice-list" v-if="noticeList.length > 0">
			<view v-for="item in noticeList" :key="item._id" class="notice-card" @click="showDetail(item)">
				<view class="notice-card-title">
					<text class="title-text">{{ item.title }}</text>
					<u-icon name="arrow-right" size="16" color="#b0b7c3"></u-icon>
				</view>
				<view class="notice-card-meta">
					<text class="meta-date">{{ formatDate(item.publish_date) }}</text>
					<text v-if="item.publisher_name" class="meta-publisher">发布人：{{ item.publisher_name }}</text>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<u-empty v-if="!loading && noticeList.length === 0" text="暂无公告" mode="list"></u-empty>

		<!-- 加载更多 -->
		<u-loadmore v-if="noticeList.length > 0" :status="loadStatus" :icon-type="loadIconType" @loadmore="loadMore"
			class="load-more" />

		<!-- 公告详情弹窗 -->
		<u-popup v-model="showDetailPopup" mode="bottom" :closeable="true" :mask-close-able="true" width="100%"
			height="90%" border-radius="16">
			<view class="detail-popup">
				<scroll-view scroll-y class="detail-scroll">
					<view class="detail-title">{{ currentNotice.title }}</view>
					<view class="detail-meta">
						<text>发布时间：{{ formatDate(currentNotice.publish_date) }}</text>
						<text v-if="currentNotice.publisher_name"> 发布人：{{ currentNotice.publisher_name }}</text>
					</view>
					<view class="detail-content">
						<!-- 使用 u-parse 组件展示富文本内容 -->
						<u-parse :html="currentNotice.content" />
					</view>
				</scroll-view>
			</view>
		</u-popup>
		<!-- 回到主页悬浮按钮 -->
		<view class="back-home-btn" @click="goHome">
		    <u-icon name="home" size="24" color="#ffffff"></u-icon>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '', // 搜索关键词
				noticeList: [], // 公告列表数据
				pageIndex: 1, // 当前页码
				pageSize: 10, // 每页数量
				total: 0, // 总条数
				loading: false, // 是否加载中
				loadStatus: 'loadmore', // loadmore状态: loadmore, loading, nomore
				showDetailPopup: false, // 详情弹窗显示状态
				currentNotice: { // 当前查看的公告详情
					title: '',
					publish_date: null,
					content: '',
					publisher_name: ''
				}
			}
		},
		computed: {
			loadIconType() {
				return this.loadStatus === 'loading' ? 'flower' : 'arrow-down'
			}
		},
		onLoad() {
			this.getNoticeList(true)
		},
		// 上拉加载更多
		onReachBottom() {
			if (this.loadStatus === 'loadmore' && this.noticeList.length < this.total) {
				this.loadMore()
			}
		},
		methods: {
			// 回到主页
			goHome() {
			    uni.switchTab({
			        url: '/pages/index/index'
			    });
			},
			// 格式化日期
			formatDate(date) {
				if (!date) return '未知时间'
				const d = new Date(date)
				const year = d.getFullYear()
				const month = (d.getMonth() + 1).toString().padStart(2, '0')
				const day = d.getDate().toString().padStart(2, '0')
				return `${year}-${month}-${day}`
			},
			// 获取公告列表（支持分页和模糊搜索）
			async getNoticeList(reset = false) {
				if (reset) {
					this.pageIndex = 1
					this.noticeList = []
					this.total = 0
					this.loadStatus = 'loadmore'
				}
				if (this.loading) return
				this.loading = true
				this.loadStatus = 'loading'

				try {
					let res = await vk.callFunction({
						url: 'admin/opendb-notice/pub/getListIndex',
						title: '请求中...',
						data: {
							title: this.keyword || '',
							pageIndex: this.pageIndex,
							pageSize: this.pageSize
						},
					});

					if (res.code === 0) {
						const {
							rows,
							total
						} = res
						if (this.pageIndex === 1) {
							this.noticeList = rows
						} else {
							this.noticeList = [...this.noticeList, ...rows]
						}
						this.total = total
						// 更新加载更多状态
						if (this.noticeList.length >= total) {
							this.loadStatus = 'nomore'
						} else {
							this.loadStatus = 'loadmore'
						}

					} else {
						uni.showToast({
							title: res.result?.message || '查询失败',
							icon: 'none'
						})
					}
				} catch (e) {
					console.error('获取公告列表失败', e)
					uni.showToast({
						title: '网络错误，请稍后重试',
						icon: 'none'
					})
					this.loadStatus = 'loadmore'
				} finally {
					this.loading = false
				}
			},
			// 搜索
			handleSearch() {
				this.getNoticeList(true)
			},
			// 清空搜索
			handleClear() {
				this.keyword = ''
				this.getNoticeList(true)
			},
			// 加载更多
			loadMore() {
				if (this.loadStatus === 'nomore' || this.loading) return
				this.pageIndex++
				this.getNoticeList(false)
			},
			// 显示公告详情弹窗
			showDetail(item) {
				this.currentNotice = {
					...item
				}
				this.showDetailPopup = true
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* 回到主页悬浮按钮 */
	.back-home-btn {
	    position: fixed;
	    right: 30rpx;
	    bottom: 50rpx;
	    width: 80rpx;
	    height: 80rpx;
	    border-radius: 50%;
	    background: #2979ff;
	    display: flex;
	    align-items: center;
	    justify-content: center;
	    box-shadow: 0 8rpx 20rpx rgba(41, 121, 255, 0.3);
	    z-index: 999;
	    transition: all 0.2s;
	
	    &:active {
	        transform: scale(0.9);
	        box-shadow: 0 4rpx 12rpx rgba(41, 121, 255, 0.4);
	    }
	}
	.notice-list-container {
		min-height: 100vh;
		background: linear-gradient(180deg, #f5f9ff 0%, #f0f4fa 100%);
		padding-bottom: 40rpx;
		box-sizing: border-box;
	}

	/* ========== 筛选区域（小清新表头） ========== */
	.filter-section {
		position: relative;
		overflow: hidden;
		padding: 24rpx 30rpx;
		background: 
			radial-gradient(circle at 15% 30%, rgba(255, 255, 255, 0.7) 0%, transparent 30%),
			radial-gradient(circle at 85% 70%, rgba(255, 255, 255, 0.5) 0%, transparent 25%),
			radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 40%),
			linear-gradient(160deg, #ffffff 0%, #eaf6ff 30%, #fff0f6 60%, #f0fdf4 100%);
		box-shadow: 0 6rpx 30rpx rgba(180, 210, 240, 0.15);
		margin-bottom: 20rpx;
		border-bottom-left-radius: 24rpx;
		border-bottom-right-radius: 24rpx;
	}

	/* 装饰光晕 1（左上角，天空蓝） */
	.filter-section::before {
		content: '';
		position: absolute;
		top: -80rpx;
		right: -60rpx;
		width: 280rpx;
		height: 280rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(135, 206, 250, 0.3) 0%, rgba(135, 206, 250, 0.1) 40%, transparent 70%);
		pointer-events: none;
		z-index: 0;
		animation: floatGlow 6s ease-in-out infinite;
	}

	/* 装饰光晕 2（右下角，薄荷绿） */
	.filter-section::after {
		content: '';
		position: absolute;
		bottom: -60rpx;
		left: -40rpx;
		width: 220rpx;
		height: 220rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(144, 238, 144, 0.3) 0%, rgba(144, 238, 144, 0.1) 45%, transparent 70%);
		pointer-events: none;
		z-index: 0;
		animation: floatGlow 8s ease-in-out infinite reverse;
	}

	/* 光晕浮动动画 */
	@keyframes floatGlow {
		0%, 100% {
			transform: translate(0, 0) scale(1);
			opacity: 0.8;
		}
		50% {
			transform: translate(8rpx, -12rpx) scale(1.03);
			opacity: 1;
		}
	}

	/* 搜索栏 */
	.search-bar {
		margin-top: 150rpx;
		position: relative;
		z-index: 1;

		::v-deep .u-search {
			background: rgba(255, 255, 255, 0.85) !important;
			border-radius: 40rpx !important;
			box-shadow: 0 4rpx 16rpx rgba(180, 210, 240, 0.2);
			backdrop-filter: blur(10rpx);
			-webkit-backdrop-filter: blur(10rpx);

			.u-search__content {
				background: transparent !important;
			}

			.u-search__content__input {
				font-size: 28rpx;
				color: #333;
			}

			.u-search__content__icon {
				color: #999;
			}
		}
	}

	/* ========== 公告卡片列表 ========== */
	.notice-list {
		padding: 0 30rpx;
	}

	.notice-card {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 26rpx 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(180, 210, 240, 0.12);
		transition: all 0.2s;
		position: relative;
		overflow: hidden;

		&:active {
			background: #fafcff;
			transform: translateY(2rpx);
			box-shadow: 0 2rpx 8rpx rgba(180, 210, 240, 0.15);
		}

		/* 左侧装饰条 */
		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			width: 6rpx;
			background: linear-gradient(180deg, #5a9cff, #2979ff);
			border-radius: 6rpx 0 0 6rpx;
		}

		.notice-card-title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12rpx;

			.title-text {
				flex: 1;
				font-size: 30rpx;
				font-weight: 500;
				color: #2a3441;
				line-height: 1.4;
				margin-right: 16rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.notice-card-meta {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 24rpx;
			color: #a0b0c0;

			.meta-publisher {
				margin-left: 20rpx;
			}
		}
	}

	/* 空状态 */
	.u-empty {
		margin-top: 100rpx;
	}

	/* 加载更多 */
	.load-more {
		margin-top: 20rpx;
	}

	/* ========== 详情弹窗 ========== */
	.detail-popup {
		height: 100%;
		display: flex;
		flex-direction: column;

		.detail-scroll {
			flex: 1;
			padding: 30rpx 32rpx 40rpx;
		}

		.detail-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #2a3441;
			margin-bottom: 20rpx;
			line-height: 1.4;
		}

		.detail-meta {
			font-size: 24rpx;
			color: #a0b0c0;
			margin-bottom: 30rpx;
			display: flex;
			gap: 24rpx;
		}

		.detail-content {
			font-size: 28rpx;
			color: #5a6b7d;
			line-height: 1.6;
		}
	}

	/* ========== 响应式调整 ========== */
	@media (max-width: 750px) {
		.filter-section {
			padding: 20rpx 24rpx;
		}

		.notice-list {
			padding: 0 24rpx;
		}

		.notice-card {
			padding: 22rpx 20rpx;
		}
	}
</style>