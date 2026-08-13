<template>
	<view class="container">
		<!-- 温馨提示卡片 -->
		<view class="hint-card margin-sm">
			<view class="hint-card__inner">
				<uni-icons type="info-filled" size="32" color="#ff9f43"></uni-icons>
				<text class="hint-card__text">📢 设置前请确保 Wi-Fi 和手机定位已开启</text>
			</view>
		</view>

		<!-- 空白页 -->
		<u-empty v-if="empty" text="暂无打卡点，点击下方按钮添加" mode="list"></u-empty>

		<!-- 列表区 -->
		<view class="margin-sm" v-for="(item, index) in setDatas" :key="index">
			<view class="order-item bg-main border-radius">
				<view @click="toSetting({ id: item._id, type: 'edit' })" class="order-item__content">
					<view class="goods-area">
						<view class="w-full">
							<view class="info-row">
								<text class="info-label">位置描述：</text>
								<text class="info-value">{{ item.address || '未填写' }}</text>
							</view>
							<view class="info-row">
								<text class="info-label">Wi-Fi 名称：</text>
								<text class="info-value">{{ item.ssid || '未填写' }}</text>
							</view>
							<view class="info-row">
								<text class="info-label">MAC 地址：</text>
								<text class="info-value">{{ item.bssid }}</text>
							</view>
							<view class="info-row">
								<text class="info-label">信号强度：</text>
								<text class="info-value">{{ item.signalStrength || '未设置' }}</text>
							</view>
							<view class="info-row">
								<text class="info-label">更新日期：</text>
								<text class="info-value">{{
									vk.pubfn.timeFormat(new Date(item.update_date), "yyyy-MM-dd")
								}}</text>
							</view>
						</view>
						<view class="action-icons">
							<view class="icon-btn" @tap.stop="toSetting({ id: item._id, type: 'edit' })">
								<u-icon name="edit-pen" size="36" color="#2d8cff"></u-icon>
							</view>
							<view class="icon-btn" @tap.stop="deleteSetting(item._id)">
								<u-icon name="trash" size="36" color="#f44336"></u-icon>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 上拉加载更多 -->
		<use-loadmore :type="loadmoreType"></use-loadmore>

		<!-- 置顶按钮 -->
		<use-totop ref="usetop"></use-totop>

		<!-- 底部浮动添加按钮 -->
		<view class="fixed-btn">
			<view class="add-btn" @click="toSetting({ id: '', type: 'add' })">
				<u-icon name="plus" size="32" color="#ffffff"></u-icon>
				<text>添加打卡点</text>
			</view>
		</view>
	</view>
</template>

<script>
	import useTotop from '@/components/use-totop/use-totop.vue';
	import useLoadmore from '@/components/use-loadmore/use-loadmore.vue';
	export default {
		components: {
			useTotop,
			useLoadmore
		},
		data() {
			return {
				empty: false,
				headerPosition: "fixed",
				setDatas: [],
				loadmoreType: "more",
				reqdata: {
					pageIndex: 1,
					pageSize: 8,
				},
				scrollTop: 0,
				refreshing: false,    // 防止下拉刷新重复请求
			};
		},
		watch: {
			setDatas(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			},
		},
		onPageScroll(e) {
			if (e.scrollTop >= 0) {
				this.headerPosition = "fixed";
			} else {
				this.headerPosition = "absolute";
			}
			this.$refs.usetop.change(e.scrollTop);
		},
		// 下拉刷新
		onPullDownRefresh() {
			if (this.refreshing) {
				uni.stopPullDownRefresh();
				return;
			}
			this.refreshing = true;
			this.loadData("refresh").finally(() => {
				this.refreshing = false;
				uni.stopPullDownRefresh();
			});
		},
		// 上拉加载更多
		onReachBottom() {
			this.loadData("add");
		},
		async onLoad(options) {
			this.loadData();
		},
		methods: {
			// 删除打卡点
			deleteSetting(id) {
				let _this = this;
				uni.showModal({
					title: "提示",
					content: "确定删除该打卡点？",
					success: function(res) {
						if (res.confirm) {
							if (!id) return _this.loadData("refresh");
							vk.callFunction({
								url: 'admin/hrm/clockin/sys/setting/delete',
								title: '请求中...',
								data: { _id: id },
							}).then((res) => {
								if (res.code === 0) {
									_this.loadData("refresh");
								}
							});
						}
					},
				});
			},
			// 加载数据（支持刷新和加载更多）
			async loadData(type = "add", loading) {
				// 防止加载中重复触发
				if (this.loadmoreType === "loading" && type !== "refresh") {
					return;
				}
				// 刷新时重置页数、清空列表，并设置加载状态
				if (type === "refresh") {
					this.reqdata.pageIndex = 1;
					this.loadmoreType = "loading";
					this.setDatas = [];
				}
				if (loading == 1) {
					this.setDatas = [];
				}
				
				// 加载更多时判断是否还有更多
				if (type === "add") {
					if (this.loadmoreType === "nomore") return;
					this.loadmoreType = "loading";
				}

				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/clockin/sys/setting/getList',
						title: type === "refresh" ? '刷新中...' : '请求中...',
						data: this.reqdata
					});
					
					if (res.code === 0) {
						const rows = res.rows || [];
						if (type === "refresh") {
							this.setDatas = rows;
						} else {
							this.setDatas = [...this.setDatas, ...rows];
						}
						
						if (rows.length >= this.reqdata.pageSize) {
							this.reqdata.pageIndex++;
							this.loadmoreType = "more";
						} else {
							this.loadmoreType = "nomore";
						}
					} else {
						this.loadmoreType = "nomore";
					}
				} catch (e) {
					console.error(e);
					this.loadmoreType = "more";
				} finally {
					if (loading == 1 || type === "refresh") {
						uni.hideLoading();
					}
					if (this.setDatas.length === 0) {
						this.empty = true;
					} else {
						this.empty = false;
					}
				}
			},
			toSetting(options) {
				vk.navigateTo({
					url: `/pages/clockin/setting_edit?id=${options.id}&type=${options.type}`
				});
			},
		},
	};
</script>

<style lang="scss" scoped>
$theme-color: #2d8cff;
$bg-gray: #f8f9fc;
$card-white: #ffffff;
$border-radius-card: 24rpx;
$box-shadow-card: 0 8rpx 24rpx rgba(0, 0, 0, 0.04), 0 2rpx 4rpx rgba(0, 0, 0, 0.02);

page, .container {
	min-height: 100%;
	background: $bg-gray;
}

/* 提示卡片 */
.hint-card {
	margin-bottom: 24rpx;
	background: #fff9e6;
	border-radius: $border-radius-card;
	border-left: 8rpx solid #ff9f43;
	box-shadow: $box-shadow-card;
	
	&__inner {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 24rpx 28rpx;
	}
	
	&__text {
		flex: 1;
		font-size: 28rpx;
		font-weight: 500;
		color: #b95f00;
		line-height: 1.4;
	}
}

/* 打卡点卡片 */
.order-item {
	margin-bottom: 24rpx;
	background: $card-white;
	border-radius: $border-radius-card;
	overflow: hidden;
	transition: transform 0.2s;
	box-shadow: $box-shadow-card;
	
	&:active {
		transform: scale(0.99);
	}
	
	&__content {
		padding: 28rpx;
	}
}

.goods-area {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 20rpx;
}

.w-full {
	flex: 1;
}

.info-row {
	display: flex;
	margin-bottom: 20rpx;
	line-height: 1.5;
	
	&:last-child {
		margin-bottom: 0;
	}
}

.info-label {
	width: 160rpx;
	font-size: 28rpx;
	color: #6c7a8a;
	flex-shrink: 0;
}

.info-value {
	flex: 1;
	font-size: 28rpx;
	color: #1f2f3a;
	font-weight: 500;
	word-break: break-all;
}

/* 编辑/删除图标区 */
.action-icons {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	flex-shrink: 0;
}

.icon-btn {
	padding: 8rpx;
	border-radius: 40rpx;
	background: #f5f7fa;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
	
	&:active {
		background: #e8edf2;
		transform: scale(0.92);
	}
}

/* 底部浮动按钮 */
.fixed-btn {
	position: fixed;
	bottom: 40rpx;
	left: 50%;
	transform: translateX(-50%);
	z-index: 99;
}

.add-btn {
	background: linear-gradient(135deg, $theme-color, #1a6ad0);
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 20rpx 48rpx;
	border-radius: 60rpx;
	box-shadow: 0 8rpx 20rpx rgba(45, 140, 255, 0.3);
	transition: all 0.2s;
	
	&:active {
		transform: scale(0.96);
		box-shadow: 0 4rpx 12rpx rgba(45, 140, 255, 0.4);
	}
	
	text {
		font-size: 30rpx;
		font-weight: 600;
		color: #ffffff;
		letter-spacing: 2rpx;
	}
}

::v-deep .use-loadmore {
	margin: 30rpx 0 100rpx;
	color: #99a9bf;
}
</style>