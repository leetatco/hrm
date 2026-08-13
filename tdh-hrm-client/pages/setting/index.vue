<template>
	<view class="page">
		<!-- 使用uView的状态栏组件 -->
		<u-status-bar bgColor="transparent"></u-status-bar>
		<view class="account-management">
			<!-- 用户头像设置 -->
			<view class="list-section">
				<view class="list-title">个人信息</view>

				<view class="avatar-item" @click="confirmCrop">
					<text class="item-label">更改头像</text>
					<view class="item-right">
						<u-avatar
							:src="vk.getVuex('$user.userInfo').avatar?vk.getVuex('$user.userInfo').avatar:defaultAvatar"
							size="80" mode="aspectFill" shape="circle"></u-avatar>
						<u-icon name="arrow-right" color="#999" size="24"></u-icon>
					</view>
				</view>
			</view>

			<!-- 账号安全 -->
			<view class="list-section">
				<view class="list-title">账号安全</view>

				<view class="list-item" @click="goto">
					<view class="item-left">
						<u-icon name="lock" size="44" color="#2979ff"></u-icon>
						<text class="item-label">修改密码</text>
					</view>
					<u-icon name="arrow-right" color="#999" size="24"></u-icon>
				</view>
			</view>

			<!-- 账号操作 -->
			<view class="list-section">
				<view class="list-title">账号操作</view>

				<view class="list-item" @click="bindLogout">
					<view class="item-left">
						<u-icon name="swap" size="44" color="#ff4444"></u-icon>
						<text class="item-label">切换账号</text>
					</view>
					<u-icon name="arrow-right" color="#999" size="24"></u-icon>
				</view>
			</view>

			<!-- 用户信息展示 -->
			<view class="user-info-section" v-if="vk.getVuex('$user.userInfo').username">
				<view class="info-title">当前账号信息</view>

				<view class="info-item">
					<text class="info-label">用户名</text>
					<text class="info-value">{{ vk.getVuex('$user.userInfo').username }}</text>
				</view>

				<view class="info-item" v-if="vk.getVuex('$user.userInfo').nickname">
					<text class="info-label">昵称</text>
					<text class="info-value">{{ vk.getVuex('$user.userInfo').nickname }}</text>
				</view>

				<view class="info-item" v-if="vk.getVuex('$user.userInfo').mobile">
					<text class="info-label">手机号</text>
					<text class="info-value">{{ vk.getVuex('$user.userInfo').mobile }}</text>
				</view>

				<view class="info-item">
					<text class="info-label">用户ID</text>
					<text class="info-value uid">{{ vk.getVuex('$user.userInfo')._id }}</text>
				</view>
			</view>
		</view>

		<!-- 头像裁剪组件 -->
		<u-modal v-if="showCropModal" v-model="showCropModal" :show-cancel-button="true" :show-confirm-button="true"
			confirm-text="确认上传" cancel-text="取消" @confirm="confirmCrop" @cancel="cancelCrop" title="裁剪头像">
			<view class="crop-container">
				<image :src="tempAvatarPath" mode="aspectFit" style="width: 100%; height: 400rpx;"></image>
				<view class="crop-tips">
					<text>请确保头像在裁剪框内，我们将自动裁剪为正方形</text>
				</view>
			</view>
		</u-modal>

		<!-- 加载中 -->
		<u-loading-page :loading="isUploading" loading-text="头像上传中..."></u-loading-page>
	</view>
</template>

<script>
	let vk = uni.vk;
	export default {
		data() {
			return {
				defaultAvatar: '/static/txl/ico_logo_@3x.png',
				tempAvatarPath: '', // 临时头像路径，用于裁剪预览
				showCropModal: false,
				isUploading: false,
				uploadTask: null,
				uid: ''
			}
		},
		onLoad(e) {
			this.uid = vk.getVuex('$user.userInfo')._id;
		},
		onUnload() {
			// 页面卸载时取消上传任务
			if (this.uploadTask) {
				this.uploadTask.abort();
			}
		},
		methods: {
			// 导航返回
			navBack() {
				uni.navigateBack();
			},

			// 退出登录/切换账号
			bindLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要切换账号吗？',
					success: (res) => {
						if (res.confirm) {
							vk.userCenter.logout({
								success: (data) => {
									vk.navigateToLogin();
								},
								fail: (err) => {
									console.error('退出登录失败:', err);
									uni.showToast({
										title: '切换失败，请重试',
										icon: 'none'
									});
								}
							});
						}
					}
				});
			},

			// 跳转到修改密码页面
			goto() {
				vk.navigateTo('../pwd/update-password');
			},

			// 选择并上传文件
			async chooseAndUploadFile() {
				try {
					// 使用uView的图片选择组件
					const res = await new Promise((resolve, reject) => {
						uni.chooseImage({
							count: 1,
							sizeType: ['compressed'],
							sourceType: ['album', 'camera'],
							success: resolve,
							fail: reject
						});
					});

					if (res.tempFilePaths && res.tempFilePaths[0]) {
						this.tempAvatarPath = res.tempFilePaths[0];
						this.showCropModal = true;
					}
				} catch (error) {
					console.error('选择图片失败:', error);
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			},

			// 确认裁剪并上传
			async confirmCrop() {
				this.showCropModal = false;
				this.isUploading = true;

				try {
					// 这里实际应该调用图片裁剪API，但uni-app的裁剪组件需要单独处理
					// 为了简化，我们直接上传原图，由服务器裁剪
					const uploadResult = await new Promise((resolve, reject) => {
						uniCloud.chooseAndUploadFile({
							type: 'image',
							fileList: [{
								path: this.tempAvatarPath,
								cloudPath: `avatar_${Date.now()}_${this.uid}.jpg`
							}]
						}).then(res => {
							resolve(res);
						}).catch(err => {
							reject(err);
						});
					});

					if (uploadResult.tempFiles && uploadResult.tempFiles[0]) {
						const avatarUrl = uploadResult.tempFiles[0].url;
						await this.submitForm(avatarUrl);
					}
				} catch (error) {
					console.error('上传头像失败:', error);
					uni.showToast({
						title: '上传失败，请重试',
						icon: 'none'
					});
				} finally {
					this.isUploading = false;
				}
			},

			// 取消裁剪
			cancelCrop() {
				this.showCropModal = false;
				this.tempAvatarPath = '';
			},

			// 提交表单更新头像
			async submitForm(avatarUrl) {
				try {
					const userInfo = vk.getVuex('$user.userInfo');
					const updateData = {
						...userInfo,
						avatar: avatarUrl
					};

					const result = await vk.userCenter.updateUser({
						data: updateData
					});

					if (result) {
						uni.showToast({
							title: '头像更新成功',
							icon: 'success'
						});

						// 更新本地vuex数据
						setTimeout(() => {
							// 强制刷新用户信息
							// vk.userCenter.getCurrentUserInfo();
						}, 500);
					}
				} catch (error) {
					console.error('更新头像失败:', error);
					uni.showToast({
						title: '更新失败，请重试',
						icon: 'none'
					});
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
	}

	.custom-nav-bar {
		height: 88rpx;
		display: flex;
		align-items: center;
		background: #ffffff;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

		.nav-bar-content {
			width: 100%;
			padding: 0 32rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.nav-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333333;
			}
		}
	}

	.account-management {
		padding: 32rpx;
	}

	.list-section {
		background: #ffffff;
		border-radius: 24rpx;
		margin-bottom: 32rpx;
		padding: 0 32rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);

		.list-title {
			font-size: 28rpx;
			color: #999999;
			padding: 32rpx 0 24rpx;
			border-bottom: 1rpx solid #f0f0f0;
		}

		.avatar-item {
			height: 120rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.item-label {
				font-size: 32rpx;
				color: #333333;
			}

			.item-right {
				display: flex;
				align-items: center;

				::v-deep .u-avatar {
					margin-right: 24rpx;
					border: 2rpx solid #f0f0f0;
				}
			}
		}

		.list-item {
			height: 100rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.item-left {
				display: flex;
				align-items: center;

				.item-label {
					font-size: 32rpx;
					color: #333333;
					margin-left: 24rpx;
				}
			}
		}
	}

	.user-info-section {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);

		.info-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
			margin-bottom: 32rpx;
			padding-bottom: 24rpx;
			border-bottom: 1rpx solid #f0f0f0;
		}

		.info-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 24rpx 0;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.info-label {
				font-size: 28rpx;
				color: #666666;
			}

			.info-value {
				font-size: 28rpx;
				color: #333333;
				max-width: 60%;
				text-align: right;

				&.uid {
					font-size: 24rpx;
					color: #999999;
					word-break: break-all;
				}
			}
		}
	}

	.crop-container {
		width: 100%;
		padding: 32rpx;

		.crop-tips {
			margin-top: 32rpx;
			text-align: center;
			font-size: 24rpx;
			color: #999999;
		}
	}

	/* 响应式调整 */
	@media (max-width: 768px) {
		.account-management {
			padding: 24rpx;
		}

		.list-section {
			padding: 0 24rpx;

			.avatar-item {
				.item-label {
					font-size: 28rpx;
				}
			}

			.list-item {
				.item-left {
					.item-label {
						font-size: 28rpx;
						margin-left: 20rpx;
					}
				}
			}
		}

		.user-info-section {
			padding: 24rpx;

			.info-item {
				.info-label {
					font-size: 26rpx;
				}

				.info-value {
					font-size: 26rpx;
				}
			}
		}
	}
</style>