<template>
	<view class="notice-list-container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<u-search v-model="keyword" placeholder="请输入公告标题" @search="handleSearch" @clear="handleClear" shape="round"
				bg-color="#f5f5f5" height="70" :showAction="false"></u-search>				
		</view>

		<!-- 公告列表 -->
		<u-cell-group>
			<u-cell-item v-for="item in noticeList" :key="item._id" :title="item.title"
				:value="formatDate(item.publish_date)" is-link @click="showDetail(item)"></u-cell-item>
		</u-cell-group>
		
		<!-- 空状态 -->
		<u-empty v-if="!loading && noticeList.length === 0" text="暂无公告" mode="list"></u-empty>

		<!-- 加载更多 -->
		<u-loadmore v-if="noticeList.length > 0" :status="loadStatus" :icon-type="loadIconType" @loadmore="loadMore" />

		<!-- 公告详情弹窗 -->
		<u-popup v-model="showDetailPopup" mode="bottom" :closeable="true" :mask-close-able="true" width="100%"
			height="80%" border-radius="16">
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
					// 调用 admin 云函数，路由为 opendb-notice/sys/getList					
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
	.notice-list-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 20rpx;

		.search-bar {
			padding: 20rpx 30rpx;
			background-color: #ffffff;
			margin-bottom: 20rpx;
		}

		.detail-popup {
			height: 100%;
			display: flex;
			flex-direction: column;

			.detail-scroll {
				flex: 1;
				padding: 30rpx;
			}

			.detail-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333333;
				margin-bottom: 20rpx;
				line-height: 1.4;
			}

			.detail-meta {
				font-size: 24rpx;
				color: #999999;
				margin-bottom: 30rpx;
				display: flex;
				gap: 20rpx;
			}

			.detail-content {
				font-size: 28rpx;
				color: #444444;
				line-height: 1.6;
				// margin-right: 60rpx;
			}
		}
	}
</style>