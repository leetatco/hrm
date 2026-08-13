<template>
	<!-- 全屏遮罩层，点击关闭（非 loading 状态） -->
	<cover-view v-if="show" class="toast-mask" @tap="closeMask">
		<!-- 核心提示容器：横屏模式下旋转 90 度，让文字“立起来” -->
		<cover-view class="toast-content" :class="{ horizontal: isHorizontal }" @tap.stop="noop">
			<!-- 加载状态 -->
			<cover-view v-if="type === 'loading'" class="loading-box">
				<cover-view class="toast-text">{{ text || '加载中...' }}</cover-view>
			</cover-view>
			<!-- 纯文字状态 -->
			<cover-view v-else-if="type === 'text'" class="text-box">
				<cover-view class="toast-text">{{ text }}</cover-view>
			</cover-view>			
		</cover-view>
	</cover-view>
</template>

<script>
	export default {
		data() {
			return {
				show: false,
				type: 'text', // 'loading', 'text', 'success', 'error'
				text: '',
				isHorizontal: true, // 是否启用横屏旋转（保持与签名界面方向一致）
				timer: null
			};
		},
		methods: {
			// 阻止冒泡的空函数
			noop() {},
			// 关闭遮罩（仅非 loading 状态可关闭）
			closeMask() {
				if (this.type === 'loading') return;
				this.hide();
			},
			// 显示加载（需手动关闭）
			showLoading(text = '加载中...') {
				this.show = true;
				this.type = 'loading';
				this.text = text;
				this.clearTimer();
			},
			// 显示文字提示（自动关闭）
			showToast(text, duration = 1500) {
				this.show = true;
				this.type = 'text';
				this.text = text;
				this.clearTimer();
				this.setTimer(duration);
			},			
			// 隐藏
			hide() {
				this.show = false;
				this.type = 'text';
				this.text = '';
				this.clearTimer();
			},
			clearTimer() {
				if (this.timer) {
					clearTimeout(this.timer);
					this.timer = null;
				}
			},
			setTimer(duration) {
				this.timer = setTimeout(() => {
					this.hide();
				}, duration);
			}
		}
	};
</script>

<style scoped>
	/* 全屏遮罩 */
	.toast-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: transparent;
		z-index: 9999;
	}

	.toast-content {
		display: flex;
		flex-direction: column;
		/* 关键：让文本块垂直排列居中 */
		align-items: center;
		justify-content: center;
		min-width: 200rpx;
		padding: 40rpx 40rpx;
		background-color: rgba(0, 0, 0, 0.75);
		border-radius: 12rpx;
		transform: rotate(90deg);
		white-space: nowrap;
	}

	.loading-box,
	.icon-box,
	.text-box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
	}

	.icon-text {
		font-size: 36rpx;
		color: #ffffff;
		font-weight: bold;
		display: block;
	}

	.toast-text {
		display: block;
		text-align: center;
		color: #ffffff;
		font-size: 33rpx;
		white-space: nowrap;
		/* 不要设置 line-height */
	}
</style>