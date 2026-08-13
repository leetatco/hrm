<template>
	<view class="account-close-page">
		<!-- 头部状态卡片 -->
		<view class="status-card">
			<view class="status-header">
				<view class="status-icon" :class="statusClass">
					<text class="icon">{{ statusIcon }}</text>
				</view>
				<view class="status-info">
					<text class="status-title">{{ statusTitle }}</text>
					<text class="status-desc">{{ statusDesc }}</text>
				</view>
			</view>

			<!-- 倒计时显示 -->
			<view v-if="isInCoolingPeriod" class="countdown-section">
				<view class="countdown-label">冷静期剩余时间</view>
				<view class="countdown-display">
					<text class="countdown-time">{{ formattedDuration }}</text>
				</view>
				<view class="progress-bar">
					<view class="progress-fill" :style="{ width: progressWidth + '%' }"></view>
				</view>
			</view>
		</view>

		<!-- 操作按钮区域 -->
		<view class="action-section" v-if="isLoad">
			<!-- 申请注销按钮 -->
			<button type="warn" v-if="!isInCoolingPeriod && !isAccountClosed" class="action-btn" :loading="loading.close" :disabled="loading.close" @click="applyCloseAccount">
				<text class="btn-text">申请注销账号</text>
			</button>

			<!-- 恢复账号按钮 -->
			<button v-if="isInCoolingPeriod" class="action-btn success-btn" :loading="loading.open" :disabled="loading.open" @click="openAccount">
				<text class="btn-text">恢复账号</text>
			</button>

			<!-- 确认注销按钮 -->
			<button v-if="isInCoolingPeriod" type="warn" class="action-btn" :loading="loading.confirm" :disabled="loading.open || loading.confirm || duration > 0"
				@click="confirmCloseAccount">
				<text class="btn-text">确认注销</text>
			</button>
		</view>

		<!-- 温馨提示 -->
		<view class="tips-section">
			<view class="tips-header">
				<text class="tips-icon">💡</text>
				<text class="tips-title">重要提示</text>
			</view>
			<view class="tips-content">
				<text class="tips-item">• 注销申请提交后有7天冷静期</text>
				<text class="tips-item">• 冷静期内可以随时恢复账号</text>
				<text class="tips-item">• 冷静期结束后需要确认才能完成注销</text>
				<text class="tips-item">• 账号确认注销后将无法恢复，请谨慎操作</text>
			</view>
		</view>

		<!-- 确认注销弹窗 -->
		<view v-if="showConfirmModal" class="modal-overlay" @click="closeModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">⚠ 确认注销账号</text>
					<text class="modal-close" @click="closeModal">×</text>
				</view>
				<view class="modal-body">
					<text class="modal-warning">此操作不可逆，请确认您真的要注销账号</text>
					<view class="input-section">
						<text class="input-label">请输入"确认注销"以继续：</text>
						<input class="confirm-input" v-model="confirmText" placeholder="请输入：确认注销" />
					</view>
				</view>
				<view class="modal-footer">
					<button class="modal-btn cancel-btn" @click="closeModal">取消</button>
					<button type="warn" class="modal-btn" @click="handleConfirmClose" :loading="loading.confirm" :disabled="loading.confirm || confirmText.trim() !== '确认注销'">
						确认注销
					</button>
				</view>
			</view>
		</view>

		<!-- 注销成功页面 -->
		<view v-if="showSuccessPage" class="success-overlay">
			<view class="success-content">
				<view class="success-icon">
					<text class="icon">✅</text>
				</view>
				<view class="success-title">账号注销成功</view>
				<view class="success-desc">
					<text class="desc-text">您的账号已成功注销</text>
					<text class="desc-text">感谢您的使用，期待再次为您服务</text>
				</view>
				<view class="success-actions">
					<button class="success-btn" @click="goToLogin">
						<text class="btn-text">返回登录页面</text>
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	let vk = uni.vk;
	export default {
		data() {
			return {
				isLoad: false,
				loading: {
					status: false,
					close: false,
					open: false,
					confirm: false
				},
				isLogin: null,
				confirmed: false, // 是否已确认过注销账号
				duration: 0, // 冷静期剩余时间（毫秒）
				accountStatus: 0, // 账号状态：0-正常，4-冷静期，5-已注销
				showConfirmModal: false, // 是否显示确认弹窗
				confirmText: '', // 确认输入文本
				countdownTimer: null, // 倒计时定时器
				totalCoolingTime: 7 * 24 * 60 * 60 * 1000, // 总冷静期时间（7天）
				showSuccessPage: false, // 是否显示注销成功页面
			}
		},
		onLoad(options) {
			vk = uni.vk;
			this.init();
		},
		onUnload() {
			// 页面卸载时清除定时器
			if (this.countdownTimer) {
				clearInterval(this.countdownTimer);
			}
		},
		methods: {
			init() {
				if (!vk.checkToken()) {
					vk.navigateToLogin();
					return;
				}
				this.isLogin = true;
				this.getCoolingStatus();
			},
			// 获取注销冷静期状态
			getCoolingStatus(obj = {}) {
				vk.userCenter.getCoolingStatus({
					loading: { that: this, name: "loading.status" },
					success: data => {
						if (!this.isLoad) this.isLoad = true;
						if (data.close_account) {
							this.confirmed = data.close_account.confirmed;
						}
						this.accountStatus = data.status || 0;
						if (data.status === 4) {
							this.duration = data.duration || 0; // 注销冷静期剩余时间，单位毫秒
							this.startCountdown();
						}
					},
					complete: res => {
						if (typeof obj.complete === "function") obj.complete(res);
					}
				});
			},

			// 开始倒计时
			startCountdown() {
				if (this.countdownTimer) {
					clearInterval(this.countdownTimer);
				}

				this.countdownTimer = setInterval(() => {
					if (this.duration > 0) {
						this.duration -= 1000; // 每秒减1秒
					} else {
						clearInterval(this.countdownTimer);
						this.countdownTimer = null;
					}
				}, 1000);
			},

			// 申请注销账号
			applyCloseAccount() {
				uni.showModal({
					title: '申请注销账号',
					content: '确定要申请注销账号吗？提交后将进入7天冷静期。',
					confirmText: '申请注销',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							this.closeAccount();
						}
					}
				});
			},

			// 注销账号
			closeAccount() {
				this.loading.close = true;
				vk.userCenter.closeAccount({
					loading: false,
					success: data => {
						this.getCoolingStatus({
							complete: res => {
								this.loading.close = false;
							}
						});
					},
					fail: err => {
						vk.alert(err.msg || "注销失败");
						this.loading.close = false;
					}
				});
			},

			// 恢复账号
			openAccount() {
				uni.showModal({
					title: '恢复账号',
					content: '确定要恢复账号吗？账号将恢复正常使用状态',
					confirmText: '确定',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							this.openAccount();
						}
					}
				});
			},

			// 执行恢复账号
			openAccount() {
				this.loading.open = true
				vk.userCenter.openAccount({
					loading: false,
					success: data => {
						if (this.countdownTimer) {
							clearInterval(this.countdownTimer);
							this.countdownTimer = null;
						}
						this.getCoolingStatus({
							complete: res => {
								this.loading.open = false;
							}
						});
					},
					fail: err => {
						vk.alert(err.msg || "恢复失败");
						this.loading.open = false;
					}
				});
			},

			// 确认注销账号
			confirmCloseAccount() {
				if (!this.canConfirmClose) {
					vk.toast('冷静期尚未结束');
					return;
				}
				this.showConfirmModal = true;
			},

			// 关闭确认弹窗
			closeModal() {
				this.showConfirmModal = false;
				this.confirmText = '';
			},

			// 处理确认注销
			handleConfirmClose() {
				if (this.confirmText.trim() !== '确认注销') {
					vk.toast('请输入"确认注销"');
					return;
				}
				this.loading.confirm = true;
				vk.userCenter.closeAccount({
					loading: false,
					success: data => {
						this.closeModal();
						vk.toast(data.msg);
						// 显示注销成功页面
						this.showSuccessPage = true;
					},
					fail: err => {
						vk.alert(err.msg || "注销失败");
						this.loading.confirm = false;
					}
				});
			},

			// 返回登录页面
			goToLogin() {
				vk.navigateToLogin({
					mode: "reLaunch"
				});
			}
		},
		computed: {
			// 是否在冷静期
			isInCoolingPeriod() {
				return this.accountStatus === 4 && !this.confirmed;
			},
			// 账号是否已注销
			isAccountClosed() {
				return this.accountStatus === 4 && this.confirmed;
			},
			// 是否可以确认注销（冷静期结束）
			canConfirmClose() {
				return this.isInCoolingPeriod && this.duration <= 0;
			},
			// 状态图标
			statusIcon() {
				if (this.isAccountClosed) return '❌';
				if (this.isInCoolingPeriod) return '⏰';
				return '✅';
			},
			// 状态样式类
			statusClass() {
				if (this.isAccountClosed) return 'status-closed';
				if (this.isInCoolingPeriod) return 'status-cooling';
				return 'status-normal';
			},
			// 状态标题
			statusTitle() {
				if (!this.isLoad) return '加载中...';
				if (this.isAccountClosed) return '账号已注销';
				if (this.isInCoolingPeriod) return '账号注销冷静期';
				return '账号状态正常';
			},
			// 状态描述
			statusDesc() {
				if (!this.isLoad) return '';
				if (this.isAccountClosed) return '您的账号已被注销，无法恢复';
				if (this.isInCoolingPeriod) return '您的账号正在冷静期中，可以随时恢复';
				return '您的账号运行正常';
			},
			// 格式化的倒计时时间
			formattedDuration() {
				if (this.duration <= 0) return '冷静期已结束';

				const days = Math.floor(this.duration / (24 * 60 * 60 * 1000));
				const hours = Math.floor((this.duration % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
				const minutes = Math.floor((this.duration % (60 * 60 * 1000)) / (60 * 1000));
				const seconds = Math.floor((this.duration % (60 * 1000)) / 1000);

				if (days > 0) {
					return `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
				} else if (hours > 0) {
					return `${hours}小时 ${minutes}分钟 ${seconds}秒`;
				} else if (minutes > 0) {
					return `${minutes}分钟 ${seconds}秒`;
				} else {
					return `${seconds} 秒`;
				}
			},
			// 进度条宽度
			progressWidth() {
				if (this.duration <= 0) return 100;
				return ((this.totalCoolingTime - this.duration) / this.totalCoolingTime) * 100;
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background: #F8F8F8;
	}

	.account-close-page {
		padding: 10px;
		box-sizing: border-box;
	}

	/* 状态卡片样式 */
	.status-card {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 15px;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		animation: slideInDown 0.6s ease-out;
	}

	.status-header {
		display: flex;
		align-items: center;
		margin-bottom: 15px;
	}

	.status-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 10px;
		animation: pulse 2s infinite;

		&.status-normal {
			background: linear-gradient(135deg, #4CAF50, #45a049);
		}

		&.status-cooling {
			background: linear-gradient(135deg, #FF9800, #F57C00);
		}

		&.status-closed {
			background: linear-gradient(135deg, #F44336, #D32F2F);
		}

		.icon {
			font-size: 20px;
			color: white;
		}
	}

	.status-info {
		flex: 1;
	}

	.status-title {
		font-size: 16px;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 5px;
	}

	.status-desc {
		font-size: 13px;
		color: #666;
		line-height: 1.4;
	}

	/* 倒计时样式 */
	.countdown-section {
		background: rgba(255, 152, 0, 0.1);
		border-radius: 7.5px;
		padding: 15px;
		border-left: 3px solid #FF9800;
	}

	.countdown-label {
		font-size: 12px;
		color: #FF9800;
		margin-bottom: 7.5px;
		font-weight: 500;
	}

	.countdown-display {
		text-align: center;
		margin-bottom: 10px;
	}

	.countdown-time {
		font-size: 18px;
		font-weight: bold;
		color: #FF9800;
		text-shadow: 0 1px 2px rgba(255, 152, 0, 0.3);
	}

	.progress-bar {
		height: 4px;
		background: rgba(255, 152, 0, 0.2);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #FF9800, #FFC107);
		border-radius: 2px;
		transition: width 0.3s ease;
		animation: progressGlow 2s ease-in-out infinite alternate;
	}

	/* 操作按钮区域 */
	.action-section {
		margin-bottom: 15px;
	}

	.action-btn {
		width: 100%;
		height: 50px;
		border-radius: 10px;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 10px;
		font-size: 15px;
		font-weight: bold;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);

		&:not(:disabled):active {
			transform: translateY(1px);
		}
	}

	.success-btn {
		background: #4CAF50;
		color: white;

		&:not(:disabled):hover {
			background: #388E3C;
		}

		&:disabled {
			background: #BDBDBD;
			color: #757575;
		}
	}

	.btn-text {
		font-size: 15px;
		color: inherit;
	}

	/* 温馨提示区域 */
	.tips-section {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 10px;
		padding: 15px;
		box-shadow: 0 4px 12.5px rgba(0, 0, 0, 0.08);
		animation: slideInUp 0.6s ease-out 0.2s both;
	}

	.tips-header {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}

	.tips-icon {
		font-size: 16px;
		margin-right: 7.5px;
	}

	.tips-title {
		font-size: 14px;
		font-weight: bold;
		color: #333;
	}

	.tips-content {
		.tips-item {
			display: block;
			font-size: 13px;
			color: #666;
			line-height: 1.6;
			margin-bottom: 5px;
			padding-left: 5px;
		}
	}

	/* 弹窗样式 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		animation: fadeIn 0.3s ease;
	}

	.modal-content {
		background: white;
		border-radius: 10px;
		width: 90%;
		max-width: 300px;
		max-height: 80%;
		overflow: hidden;
		animation: slideInScale 0.3s ease;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 15px 20px;
		border-bottom: 0.5px solid #eee;
		background: linear-gradient(135deg, #F44336, #D32F2F);
		color: white;
	}

	.modal-title {
		font-size: 16px;
		font-weight: bold;
	}

	.modal-close {
		font-size: 20px;
		cursor: pointer;
		opacity: 0.8;
		transition: opacity 0.2s ease;

		&:hover {
			opacity: 1;
		}
	}

	.modal-body {
		padding: 20px;
	}

	.modal-warning {
		font-size: 14px;
		color: #F44336;
		text-align: center;
		margin-bottom: 15px;
		line-height: 1.5;
	}

	.input-section {
		.input-label {
			display: block;
			font-size: 13px;
			color: #333;
			margin-bottom: 7.5px;
		}

		.confirm-input {
			width: 100%;
			height: 40px;
			border: 1px solid #ddd;
			border-radius: 5px;
			padding: 0 10px;
			font-size: 14px;
			box-sizing: border-box;
			transition: border-color 0.3s ease;

			&:focus {
				border-color: #F44336;
				outline: none;
			}
		}
	}

	.modal-footer {
		display: flex;
		padding: 15px 20px;
		gap: 10px;
		background: #f8f8f8;
	}

	.modal-btn {
		flex: 1;
		height: 40px;
		line-height: 40px;
		border-radius: 5px;
		border: none;
		font-size: 14px;
		font-weight: bold;
		transition: all 0.3s ease;
	}

	.cancel-btn {
		background: #f5f5f5;
		color: #666;

		&:not(:disabled):hover {
			background: #e0e0e0;
		}
	}

	/* 动画效果 */
	@keyframes slideInDown {
		from {
			opacity: 0;
			transform: translateY(-25px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(25px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@keyframes slideInScale {
		from {
			opacity: 0;
			transform: scale(0.8) translateY(-25px);
		}

		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes pulse {

		0%,
		100% {
			transform: scale(1);
		}

		50% {
			transform: scale(1.05);
		}
	}

	@keyframes progressGlow {
		0% {
			box-shadow: 0 0 2.5px rgba(255, 152, 0, 0.5);
		}

		100% {
			box-shadow: 0 0 10px rgba(255, 152, 0, 0.8);
		}
	}

	/* 注销成功页面样式 */
	.success-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(6px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		animation: fadeIn 0.5s ease;
	}

	.success-content {
		background: white;
		border-radius: 15px;
		width: 85%;
		max-width: 320px;
		padding: 40px 30px;
		text-align: center;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

		.success-icon {
			width: 80px;
			height: 80px;
			border-radius: 50%;
			background: linear-gradient(135deg, #4CAF50, #45a049);
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0 auto 25px;
			box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);

			.icon {
				font-size: 40px;
				color: white;
			}
		}

		.success-title {
			font-size: 22px;
			font-weight: bold;
			color: #333;
			margin-bottom: 15px;
			animation: fadeInUp 0.8s ease-out 0.2s both;
		}

		.success-desc {
			margin-bottom: 30px;
			animation: fadeInUp 0.8s ease-out 0.4s both;

			.desc-text {
				display: block;
				font-size: 15px;
				color: #666;
				line-height: 1.6;
				margin-bottom: 8px;
			}
		}

		.success-actions {
			animation: fadeInUp 0.8s ease-out 0.6s both;
		}

		.success-btn {
			width: 100%;
			height: 50px;
			background: linear-gradient(135deg, #4CAF50, #45a049);
			color: white;
			border: none;
			border-radius: 10px;
			font-size: 16px;
			font-weight: bold;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s ease;
			box-shadow: 0 6px 15px rgba(76, 175, 80, 0.3);
			position: relative;
			overflow: hidden;
			animation: successPulse 2s infinite;

			&:active {
				transform: translateY(1px);
				box-shadow: 0 4px 10px rgba(76, 175, 80, 0.4);
			}

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: -100%;
				width: 100%;
				height: 100%;
				background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
				transition: left 0.5s ease;
			}

			&:hover::before {
				left: 100%;
			}

			.btn-text {
				font-size: 16px;
				color: inherit;
			}
		}
	}



	/* 成功页面动画 */
	@keyframes successSlideIn {
		from {
			opacity: 0;
			transform: scale(0.7) translateY(-50px);
		}

		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes successPulse {

		0%,
		100% {
			transform: scale(1);
			box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
		}

		50% {
			transform: scale(1.02);
			box-shadow: 0 12px 25px rgba(76, 175, 80, 0.5);
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 响应式适配 */
	@media screen and (max-width: 375px) {
		.account-close-page {
			padding: 7.5px;
		}

		.status-card {
			padding: 15px;
		}

		.status-icon {
			width: 30px;
			height: 30px;

			.icon {
				font-size: 15px;
			}
		}

		.status-title {
			font-size: 14px;
		}

		.status-desc {
			font-size: 12px;
		}

		.action-btn {
			height: 45px;
			font-size: 14px;
		}

		.btn-text {
			font-size: 14px;
		}

		/* 成功页面响应式 */
		.success-content {
			width: 90%;
			padding: 30px 20px;
		}

		.success-icon {
			width: 60px;
			height: 60px;
			margin-bottom: 20px;

			.icon {
				font-size: 30px;
			}
		}

		.success-title {
			font-size: 18px;
			margin-bottom: 12px;
		}

		.success-desc {
			margin-bottom: 25px;

			.desc-text {
				font-size: 14px;
				margin-bottom: 6px;
			}
		}

		.success-btn {
			height: 45px;
			font-size: 15px;

			.btn-text {
				font-size: 15px;
			}
		}
	}
</style>