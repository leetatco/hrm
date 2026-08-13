<template>
	<view class="settings-page">
		<!-- 未连接Wi-Fi时的友好提示 -->
		<view class="hint-card" v-if="isEmpty">
			<view class="hint-card__inner">
				<u-icon name="error-circle" size="32" color="#ff9f43"></u-icon>
				<text class="hint-card__text">未检测到Wi-Fi连接。设置前请确保 Wi-Fi 和手机定位已开启，Wi-Fi并连接后，点击「读入Wi-Fi信息」自动填写。</text>
			</view>
		</view>

		<!-- Wi-Fi信息卡片 -->
		<view class="info-card">
			<view class="info-card__title">
				<u-icon name="wifi" size="32" color="#2d8cff"></u-icon>
				<text>Wi-Fi 设置</text>
				<text class="info-card__required">* 必填</text>
			</view>
			<view class="info-row">
				<text class="info-row__label">位置描述</text>
				<input class="info-row__input" type="text" v-model="formData.address" placeholder="请输入位置描述"
					placeholder-class="placeholder-text" />
			</view>
			<view class="info-row">
				<text class="info-row__label">Wi-Fi名称 (SSID)</text>
				<input class="info-row__input" type="text" v-model="formData.ssid" placeholder="请点击「读入Wi-Fi信息」自动填写"
					placeholder-class="placeholder-text" />
			</view>

			<view class="info-row">
				<text class="info-row__label">Wi-Fi MAC地址</text>
				<input class="info-row__input" type="text" v-model="formData.bssid" placeholder="自动获取"
					placeholder-class="placeholder-text" />
			</view>

			<view class="info-row">
				<text class="info-row__label">信号强度 (0~100)</text>
				<input class="info-row__input" type="number" v-model="formData.signalStrength" placeholder="请输入信号强度"
					placeholder-class="placeholder-text" />
				<text class="info-row__unit">dBm</text>
			</view>
		</view>

		<!-- 说明提示卡片 -->
		<view class="tips-card">
			<view class="tips-card__inner">
				<u-icon name="pushpin" size="32" color="#2d8cff"></u-icon>
				<text class="tips-card__text">设定的Wi-Fi为公司打卡地点的网络，打卡时将校验当前连接的Wi-Fi是否匹配。</text>
			</view>
		</view>

		<!-- 底部操作按钮 -->
		<view class="action-bar">
			<view class="action-bar__inner">
				<view class="action-btn action-btn--read" @click="getConnectedWifi">
					<u-icon name="scan" size="28" color="#ffffff"></u-icon>
					<text>读入Wi-Fi信息</text>
				</view>
				<view class="action-btn action-btn--submit" :class="{ 'action-btn--disabled': submitting }"
					@click="submit">
					<u-icon name="checkmark" size="28" color="#ffffff"></u-icon>
					<text>{{ submitting ? '提交中...' : '提交' }}</text>
				</view>
			</view>
		</view>

		<!-- 底部安全区占位 -->
		<view class="bottom-placeholder"></view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isEmpty: true, // 是否未连接Wi-Fi（用于显示提示）
				formData: {
					_id: "",
					address:"",
					bssid: "",
					ssid: "",
					signalStrength: 0,
				},
				type: "add", // add / edit
				submitting: false,
			};
		},
		onShow() {
			this.getConnectedWifi(); // 每次显示时尝试读取当前Wi-Fi
		},
		onLoad(options) {
			let title = "打卡点设置";
			this.type = options.type || "add";
			if (this.type === "edit") {
				title = "编辑打卡点";
				this.loadDetail(options.id);
			}
			uni.setNavigationBarTitle({
				title
			});
		},
		methods: {
			// 获取当前连接的Wi-Fi信息
			getConnectedWifi() {
				uni.startWifi({
					success: () => {
						uni.getConnectedWifi({
							success: (res) => {
								this.formData.bssid = res.wifi.BSSID || "";
								this.formData.ssid = res.wifi.SSID || "";
								// 信号强度通常为负数，此处存储原始值，提交时再校验
								this.formData.signalStrength = res.wifi.signalStrength || 0;
								this.isEmpty = false;
								uni.showToast({
									title: '已获取当前Wi-Fi信息',
									icon: 'success'
								});
							},
							fail: (err) => {
								console.error('获取已连接的Wi-Fi失败', err);
								this.isEmpty = true;
								uni.showToast({
									title: '未检测到Wi-Fi连接',
									icon: 'none'
								});
							}
						});
					},
					fail: (err) => {
						console.error('启动Wi-Fi模块失败', err);
						this.isEmpty = true;
						uni.showToast({
							title: '请手动开启Wi-Fi',
							icon: 'none'
						});
					}
				});
			},
			// 加载编辑详情
			loadDetail(id) {
				vk.callFunction({
					url: 'admin/hrm/clockin/sys/setting/getList',
					title: '加载中...',
					data: {
						_id: id
					}
				}).then((res) => {
					if (res.code === 0) {
						const detail = res.rows[0];
						for (let key in this.formData) {
							if (detail[key] !== undefined) this.formData[key] = detail[key];
						}
						this.isEmpty = false;
					} else {
						vk.alert('未找到该记录');
					}
				});
			},
			// 返回列表页
			toSetting() {
				uni.navigateBack();
			},
			// 提交表单
			async submit() {
				if (this.submitting) return;

				// 校验
				if (!this.formData.address) {
					vk.alert("请输入位置描述");
					return;
				}
				if (!this.formData.bssid || !this.formData.ssid) {
					vk.alert("请先点击「读入Wi-Fi信息」获取当前Wi-Fi");
					return;
				}
				const signal = parseInt(this.formData.signalStrength);
				if (isNaN(signal) || signal > 100 || signal <= 50) {
					vk.alert("信号强度必须为 50 ～ 100 之间的整数（例如 60）");
					return;
				}
				this.formData.signalStrength = signal;

				this.submitting = true;
				const url = this.type === "add" ?
					'admin/hrm/clockin/sys/setting/add' :
					'admin/hrm/clockin/sys/setting/update';
				const data = {
					...this.formData
				};
				if (this.type === "add") delete data._id;

				try {
					const res = await vk.callFunction({
						url,
						title: '提交中...',
						data
					});
					if (res.code === 0 || res.errCode === 0) {
						vk.alert(this.type === "add" ? "添加成功" : "编辑成功");
						setTimeout(() => this.toSetting(), 1500);
					} else {
						vk.alert(res.msg);
					}
				} catch (e) {
					vk.alert("操作失败，请重试");
				} finally {
					this.submitting = false;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	$theme-color: #2d8cff;
	$bg-gray: #f8f9fc;
	$card-white: #ffffff;
	$border-radius-card: 24rpx;
	$box-shadow-card: 0 8rpx 24rpx rgba(0, 0, 0, 0.04), 0 2rpx 4rpx rgba(0, 0, 0, 0.02);

	.settings-page {
		min-height: 100vh;
		background: $bg-gray;
		padding: 20rpx 30rpx;
		display: flex;
		flex-direction: column;
	}

	/* 提示卡片 */
	.hint-card {
		margin-bottom: 24rpx;
		background: #fff9e6;
		border-radius: 20rpx;
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
			font-size: 26rpx;
			color: #b95f00;
			line-height: 1.4;
		}
	}

	/* 主要信息卡片 */
	.info-card {
		background: $card-white;
		border-radius: $border-radius-card;
		padding: 28rpx;
		box-shadow: $box-shadow-card;
		margin-bottom: 24rpx;

		&__title {
			display: flex;
			align-items: center;
			gap: 12rpx;
			font-size: 30rpx;
			font-weight: 600;
			color: #1f2f3a;
			margin-bottom: 24rpx;
			padding-bottom: 16rpx;
			border-bottom: 1rpx solid #eef2f6;
		}

		&__required {
			font-size: 24rpx;
			color: #f44336;
			margin-left: auto;
		}
	}

	.info-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 24rpx;

		&:last-child {
			margin-bottom: 0;
		}

		&__label {
			width: 200rpx;
			font-size: 28rpx;
			color: #6c7a8a;
			flex-shrink: 0;
		}

		&__input {
			flex: 1;
			background: #f5f7fa;
			border-radius: 16rpx;
			padding: 20rpx 24rpx;
			font-size: 28rpx;
			color: #1f2f3a;
			border: 1rpx solid #eef2f6;
			transition: all 0.2s;

			&:focus {
				border-color: $theme-color;
				background: $card-white;
			}
		}

		&__unit {
			margin-left: 16rpx;
			font-size: 26rpx;
			color: #99a9bf;
		}
	}

	.placeholder-text {
		color: #99a9bf;
		font-size: 28rpx;
	}

	/* 提示卡片 */
	.tips-card {
		background: #e8f4ff;
		border-radius: 20rpx;
		margin-bottom: 40rpx;

		&__inner {
			display: flex;
			align-items: center;
			gap: 16rpx;
			padding: 24rpx 28rpx;
		}

		&__text {
			flex: 1;
			font-size: 26rpx;
			color: #0066cc;
			line-height: 1.4;
		}
	}

	/* 底部按钮区域 */
	.action-bar {
		margin-top: auto;
		margin-bottom: 20rpx;

		&__inner {
			display: flex;
			gap: 24rpx;
		}
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		padding: 28rpx 0;
		border-radius: 60rpx;
		font-size: 30rpx;
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 6rpx 14rpx rgba(0, 0, 0, 0.1);

		&:active {
			transform: scale(0.96);
		}

		&--read {
			background: linear-gradient(145deg, #5b8cff, #2d6ef0);
			color: #ffffff;
		}

		&--submit {
			background: linear-gradient(145deg, #2d8cff, #1a6ad0);
			color: #ffffff;
		}

		&--disabled {
			opacity: 0.6;
			transform: none;
			pointer-events: none;
		}
	}

	.bottom-placeholder {
		height: calc(30rpx + env(safe-area-inset-bottom));
	}
</style>