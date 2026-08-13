<template>
	<view class="container">
		<!-- 头部logo -->
		<view class="logo-box">
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
		</view>

		<!-- 登录表单 -->
		<view class="form-box">
			<u-form :model="form" ref="uForm" labelPosition="top">
				<u-form-item label="账号" prop="username" borderBottom>
					<u-input v-model="form.username" placeholder="请输入账号" clearable :border="false"
						:customStyle="{padding: '10rpx 0'}">
						<u-icon slot="prefix" name="account" size="20" color="#2979ff"
							:customStyle="{ marginRight: '10rpx' }"></u-icon>
					</u-input>
				</u-form-item>

				<u-form-item label="密码" prop="password" borderBottom>
					<u-input v-model="form.password" type="password" placeholder="请输入密码" clearable :border="false"
						:customStyle="{padding: '10rpx 0'}">
						<u-icon slot="prefix" name="lock" size="20" color="#2979ff"
							:customStyle="{ marginRight: '10rpx' }"></u-icon>
					</u-input>
				</u-form-item>

				<!-- 登录按钮 -->
				<view class="btn-group">
					<u-button type="primary" shape="circle" @click="handleLogin" :customStyle="{
              height: '90rpx',
              fontSize: '32rpx',
              marginTop: '80rpx'
            }">
						登录
					</u-button>
				</view>
			</u-form>
		</view>

		<!-- 分割线 -->
		<view class="divider" v-if="showThirdLogin">
			<view class="divider-line"></view>
			<!-- <text class="divider-text">快捷登录</text> -->
			<view class="divider-line"></view>
		</view>

		<!-- 第三方登录 -->
		<view class="third-login" v-if="showThirdLogin">
			<!-- #ifdef MP-WEIXIN -->
			<view class="third-item" @click="login_weixin">
				<view class="third-icon wechat">
					<u-icon name="weixin-fill" size="60" color="#ffffff"></u-icon>
				</view>
				<text class="third-text">微信登录</text>
			</view>
			<!-- #endif -->

			<!-- #ifdef APP-PLUS -->
			<view class="third-item" @click="login_weixin">
				<view class="third-icon wechat">
					<u-icon name="weixin-fill" size="60" color="#ffffff"></u-icon>
				</view>
				<text class="third-text">微信登录</text>
			</view>
			<!-- #endif -->
		</view>

		<!-- 协议声明 -->
		<view class="agreement">
			<text class="agreement-text">登录即代表您已同意</text>
			<text class="agreement-link" @click="showAgreement">《用户协议》</text>
			<text class="agreement-text">和</text>
			<text class="agreement-link" @click="showPrivacy">《隐私政策》</text>
		</view>

		<!-- 替换 uni.showModal 1：绑定提示 -->
		<u-modal v-model="bindModalVisible" title="提示" content="检测到您未绑定微信，是否要绑定到现有账号？" showCancelButton
			@confirm="confirmBind" @cancel="bindModalVisible = false"></u-modal>

		<!-- 替换 uni.showModal 2：绑定账号输入 -->
		<u-modal v-model="inputModalVisible" title="绑定账号" showCancelButton @confirm="confirmInputBind"
			@cancel="inputModalVisible = false">
			<view class="modal-input-wrap" v-if="inputModalVisible">
				<u-input v-model="bindAccountInput" placeholder="请输入您的手机号" type="text" border focus />
			</view>
			
		</u-modal>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 表单数据
				form: {
					username: '',
					password: '',
					remember: false
				},
				showThirdLogin: true,
				// 表单验证规则
				rules: {
					username: [{
							required: true,
							message: '请输入账号',
							trigger: ['blur', 'change']
						},
						{
							min: 3,
							max: 20,
							message: '账号长度在3-20个字符',
							trigger: ['blur', 'change']
						}
					],
					password: [{
							required: true,
							message: '请输入密码',
							trigger: ['blur', 'change']
						},
						{
							min: 6,
							max: 20,
							message: '密码长度在6-20个字符',
							trigger: ['blur', 'change']
						}
					]
				},
				// u-modal 控制变量
				bindModalVisible: false, // 是否绑定提示
				inputModalVisible: false, // 绑定账号输入框
				bindAccountInput: '', // 输入的账号
				currentCodeRes: null // 暂存 codeRes
			}
		},
		onLoad() {
			this.loadRememberedAccount();
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		},
		onShow() {
			// #ifdef MP-WEIXIN
			uni.hideHomeButton();
			// #endif
		},
		onHide() {
			if (this.form.remember && this.form.username) {
				this.saveRememberedAccount();
			} else {
				this.clearRememberedAccount();
			}
		},
		methods: {
			loadRememberedAccount() {
				try {
					const remembered = uni.getStorageSync('rememberedAccount');
					if (remembered) {
						this.form.username = remembered.username || '';
						this.form.password = remembered.password || '';
						this.form.remember = true;
					}
				} catch (e) {
					console.error('读取记住的账号失败', e);
				}
			},
			saveRememberedAccount() {
				try {
					uni.setStorageSync('rememberedAccount', {
						username: this.form.username,
						password: this.form.password
					});
				} catch (e) {
					console.error('保存记住的账号失败', e);
				}
			},
			clearRememberedAccount() {
				try {
					uni.removeStorageSync('rememberedAccount');
				} catch (e) {
					console.error('清除记住的账号失败', e);
				}
			},
			async is_resigned(username) {
				let res = await vk.callFunction({
					url: 'client/user/pub/getList',
					title: '请求中...',
					data: {
						otherWhereJson: {
							employee_id: username,
							status: 2
						}
					},
				});
				return res && res.total > 0;
			},
			handleLogin() {
				this.$refs.uForm.validate().then(valid => {
					if (valid) {
						this.doLogin();
					}
				}).catch(errors => {
					console.log('表单验证失败', errors);
				});
			},
			async doLogin() {
				const {
					username,
					password
				} = this.form;
				const isResigned = await this.is_resigned(username);
				if (isResigned) {
					return vk.alert("此账号已是离职状态！", "登录失败");
				}
				vk.userCenter.login({
					data: {
						username,
						password
					},
					success: async (data) => {
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						});
						if (!data.userInfo.wx_openid) {
							await this.bindWeixin();
							await this.login_weixin();
						}
						setTimeout(() => {
							vk.navigateToHome();
						}, 1500);
					},
					fail: (err) => {
						uni.showToast({
							title: err.msg || '登录失败',
							icon: 'none'
						});
					}
				});
			},
			async bindWeixin() {
				try {
					await vk.userCenter.bindWeixin();
				} catch (e) {
					console.log('绑定微信失败:', e);
				}
			},
			toForget() {
				uni.navigateTo({
					url: '/pages/forget/forget'
				});
			},
			toRegister() {
				uni.navigateTo({
					url: '/pages/register/register'
				});
			},
			showAgreement() {
				uni.navigateTo({
					url: '/pages/agreement/agreement?type=user'
				});
			},
			showPrivacy() {
				uni.navigateTo({
					url: '/pages/agreement/agreement?type=privacy'
				});
			},

			// ========== 微信登录相关 ==========
			async login_weixin() {
				try {
					let codeRes = await vk.userCenter.code2SessionWeixin();
					if (!codeRes || !codeRes.openid) {
						uni.showToast({
							title: '微信登录失败',
							icon: 'none'
						});
						return;
					}

					let checkWxRes = await vk.callFunction({
						url: 'client/user/pub/isUser',
						title: '请求中...',
						data: {
							wx_openid: codeRes.openid
						}
					});

					if (checkWxRes.total > 0) {
						vk.setVuex('$user.employeeInfo', checkWxRes.rows[0].employeeInfo);
						let loginRes = await vk.userCenter.loginByWeixin();
						if (loginRes.code === 0) {
							const isResigned = checkWxRes.rows[0].employeeInfo.status == 2 ? true : false;
							if (isResigned) {
								await vk.userCenter.unbindWeixin();
								uni.clearStorageSync();
								return vk.alert("此账号已是离职状态！", "登录失败");
							}
							vk.navigateToHome();
						}
						return;
					}

					// 未绑定：打开 u-modal 提示是否绑定
					this.currentCodeRes = codeRes;
					this.bindModalVisible = true;

				} catch (error) {
					console.error('微信登录失败:', error);
					uni.showToast({
						title: '微信登录失败，请重试',
						icon: 'none'
					});
				}
			},

			// 用户确认绑定，打开输入框模态
			confirmBind() {
				this.bindModalVisible = false;
				this.bindAccountInput = ''; // 清空输入
				this.inputModalVisible = true;
			},

			// 输入账号后确认绑定
			async confirmInputBind() {
				const account = this.bindAccountInput.trim();
				if (!account) {
					uni.showToast({
						title: '请输入账号',
						icon: 'none'
					});
					this.inputModalVisible = true;
					return;
				}

				const codeRes = this.currentCodeRes;
				if (!codeRes) {
					uni.showToast({
						title: '微信登录信息失效，请重试',
						icon: 'none'
					});
					this.inputModalVisible = false;
					return;
				}

				// 调用 isAddUser 验证账号是否存在人事系统
				let userRes = await vk.callFunction({
					url: 'client/user/pub/isAddUser',
					title: '验证中...',
					data: {
						mobile: account, // 同时传递，云函数按优先级处理
						username: account
					}
				});

				if (userRes.code !== 0) {
					uni.showToast({
						title: userRes.msg || '验证失败',
						icon: 'none'
					});
					this.inputModalVisible = true;
					return;
				}

				if (userRes.total === 0) {
					uni.showToast({
						title: '账号不存在或未在人事系统建立',
						icon: 'none'
					});
					this.inputModalVisible = true;
					return;
				}

				// 员工信息存入 Vuex（供后续使用）
				const userInfo = userRes.rows[0];
				vk.setVuex('$user.employeeInfo', userInfo.employeeInfo);

				// 检查是否离职（可选）
				if (userInfo.employeeInfo.status == 2) {
					uni.showToast({
						title: '该员工已离职',
						icon: 'none'
					});
					this.inputModalVisible = false;
					return;
				}

				// 绑定微信
				let wx_openid = {};
				wx_openid['mp-weixin'] = codeRes.openid;
				wx_openid[`mp-weixin_${codeRes.appid}`] = codeRes.openid;

				let bindRes = await vk.callFunction({
					url: 'client/user/pub/update',
					title: '绑定中...',
					data: {
						_id: userInfo._id,
						wx_openid
					}
				});

				if (bindRes.code === 0) {
					uni.showToast({
						title: '绑定成功',
						icon: 'success'
					});
					this.inputModalVisible = false;
					this.bindAccountInput = '';
					// 自动登录
					let loginRes = await vk.userCenter.loginByWeixin();
					if (loginRes.code === 0) {
						vk.navigateToHome();
					} else {
						uni.showToast({
							title: loginRes.msg || '登录失败',
							icon: 'none'
						});
					}
				} else {
					uni.showToast({
						title: bindRes.msg || '绑定失败',
						icon: 'none'
					});
					this.inputModalVisible = true;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
		padding: 80rpx 60rpx 40rpx;
		box-sizing: border-box;
	}

	.modal-input-wrap {
		padding: 40rpx;
	}

	.logo-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 100rpx;

		.logo {
			width: 150rpx;
			height: 150rpx;
			border-radius: 30rpx;
			box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
			margin-bottom: 30rpx;
		}

		.app-name {
			font-size: 48rpx;
			font-weight: bold;
			color: #333;
			letter-spacing: 4rpx;
		}
	}

	.form-box {
		background-color: #ffffff;
		border-radius: 30rpx;
		padding: 60rpx 50rpx;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.08);

		.form-tools {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 40rpx;

			.remember {
				::v-deep .u-checkbox__label {
					font-size: 28rpx;
					color: #666;
				}
			}

			.forget {
				.forget-text {
					font-size: 28rpx;
					color: #2979ff;
				}
			}
		}

		.btn-group {
			margin-top: 60rpx;

			::v-deep .u-button {
				background: linear-gradient(135deg, #2979ff, #4dabff);
				box-shadow: 0 10rpx 30rpx rgba(41, 121, 255, 0.3);
			}

			.register-link {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-top: 40rpx;

				.tip-text {
					font-size: 28rpx;
					color: #666;
				}

				.register-btn {
					font-size: 28rpx;
					color: #2979ff;
					margin-left: 20rpx;
					font-weight: 500;
				}
			}
		}
	}

	.divider {
		display: flex;
		align-items: center;
		margin: 80rpx 0 60rpx;

		.divider-line {
			flex: 1;
			height: 1px;
			background: linear-gradient(to right, transparent, #ddd, transparent);
		}

		.divider-text {
			padding: 0 30rpx;
			font-size: 26rpx;
			color: #999;
			white-space: nowrap;
		}
	}

	.third-login {
		display: flex;
		justify-content: center;
		gap: 80rpx;

		.third-item {
			display: flex;
			flex-direction: column;
			align-items: center;

			.third-icon {
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 20rpx;

				&.wechat {
					background-color: #07c160;
				}
			}

			.third-text {
				font-size: 26rpx;
				color: #666;
			}
		}
	}

	.agreement {
		position: fixed;
		bottom: 40rpx;
		left: 0;
		right: 0;
		text-align: center;

		.agreement-text {
			font-size: 24rpx;
			color: #999;
		}

		.agreement-link {
			font-size: 24rpx;
			color: #2979ff;
		}
	}

	/* 响应式调整 */
	@media (max-width: 750px) {
		.container {
			padding: 60rpx 40rpx 30rpx;
		}

		.logo-box {
			margin-bottom: 80rpx;

			.logo {
				width: 120rpx;
				height: 120rpx;
			}

			.app-name {
				font-size: 40rpx;
			}
		}

		.form-box {
			padding: 50rpx 40rpx;
		}

		.third-login {
			gap: 60rpx;

			.third-item {
				.third-icon {
					width: 80rpx;
					height: 80rpx;
				}
			}
		}
	}
</style>