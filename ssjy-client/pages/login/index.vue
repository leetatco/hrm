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
					<u-input 
						v-model="form.username" 
						placeholder="请输入账号"
						clearable
						:border="false"
						:customStyle="{padding: '10rpx 0'}"
					>
						<u-icon slot="prefix" name="account" size="20" color="#2979ff" customStyle="margin-right: 10rpx"></u-icon>
					</u-input>
				</u-form-item>

				<u-form-item label="密码" prop="password" borderBottom>
					<u-input 
						v-model="form.password" 
						type="password"
						placeholder="请输入密码"
						clearable
						:border="false"
						:customStyle="{padding: '10rpx 0'}"
					>
						<u-icon slot="prefix" name="lock" size="20" color="#2979ff" customStyle="margin-right: 10rpx"></u-icon>
					</u-input>
				</u-form-item>			

				<!-- 登录按钮 -->
				<view class="btn-group">
					<u-button 
						type="primary" 
						shape="circle" 
						@click="handleLogin"
						:customStyle="{
							height: '90rpx',
							fontSize: '32rpx',
							marginTop: '80rpx'
						}"
					>
						登录
					</u-button>					
				</view>
			</u-form>
		</view>

		<!-- 分割线 -->
		<view class="divider" v-if="showThirdLogin">
			<view class="divider-line"></view>
			<text class="divider-text">快捷登录</text>
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
				// 是否显示第三方登录
				showThirdLogin: true,
				// 表单验证规则
				rules: {
					username: [
						{
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
					password: [
						{
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
				}
			}
		},
		onLoad() {
			// 初始化vk对象
			this.vk = uni.vk;
			// 加载记住的账号
			this.loadRememberedAccount();
		},
		onReady() {
			// 设置表单验证规则
			this.$refs.uForm.setRules(this.rules);
		},
		onShow() {
			// #ifdef MP-WEIXIN
			uni.hideHomeButton();
			// #endif
		},
		onHide() {
			// 保存记住的账号
			if (this.form.remember && this.form.username) {
				this.saveRememberedAccount();
			} else {
				this.clearRememberedAccount();
			}
		},
		methods: {
			// 加载记住的账号
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
			
			// 保存记住的账号
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
			
			// 清除记住的账号
			clearRememberedAccount() {
				try {
					uni.removeStorageSync('rememberedAccount');
				} catch (e) {
					console.error('清除记住的账号失败', e);
				}
			},
			
			// 登录处理
			handleLogin() {
				this.$refs.uForm.validate().then(valid => {
					if (valid) {
						this.doLogin();
					}
				}).catch(errors => {
					console.log('表单验证失败', errors);
				});
			},
			
			// 执行登录
			doLogin() {
				const { username, password } = this.form;
				
				this.vk.userCenter.login({
					data: {
						username,
						password
					},
					success: async (data) => {
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						});
						
						// 检查并绑定微信
						if (!data.userInfo.wx_openid) {
							await this.bindWeixin();
							await this.login_weixin();
						}
						
						// 跳转到首页
						setTimeout(() => {
							this.vk.navigateToHome();
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
			
			// 绑定微信
			async bindWeixin() {
				try {
					await this.vk.userCenter.bindWeixin();
				} catch (e) {
					console.log('绑定微信失败:', e);
				}
			},
			
			// 跳转到忘记密码页面
			toForget() {
				uni.navigateTo({
					url: '/pages/forget/forget'
				});
			},
			
			// 跳转到注册页面
			toRegister() {
				uni.navigateTo({
					url: '/pages/register/register'
				});
			},
			
			// 显示用户协议
			showAgreement() {
				uni.navigateTo({
					url: '/pages/agreement/agreement?type=user'
				});
			},
			
			// 显示隐私政策
			showPrivacy() {
				uni.navigateTo({
					url: '/pages/agreement/agreement?type=privacy'
				});
			},
			
			// 微信登录（保持原有逻辑）
			async login_weixin() {
				try {
					// 1. 获取微信登录凭证
					let codeRes = await this.vk.userCenter.code2SessionWeixin();
					if (!codeRes || !codeRes.openid) {
						uni.showToast({
							title: '微信登录失败',
							icon: 'none'
						});
						return;
					}

					// 2. 检查微信是否已被绑定
					let checkWxRes = await this.vk.callFunction({
						url: 'client/user/pub/isUser',
						title: '请求中...',
						data: {
							wx_openid: codeRes.openid
						}
					});

					// 微信已绑定其他账号
					if (checkWxRes.total > 0) {						
						// 直接使用微信登录
						let loginRes = await this.vk.userCenter.loginByWeixin();
						if (loginRes.code === 0) {
							vk.setVuex('$user.userInfo.employeeInfo', checkWxRes.rows[0].employeeInfo);						
							uni.showToast({
								title: '登录成功',
								icon: 'success'
							});
							this.vk.navigateToHome();
						}
						return;
					}

					// 3. 提示用户绑定已有账号
					uni.showModal({
						title: '提示',
						content: '检测到您未绑定微信，是否要绑定到现有账号？',
						success: async (res) => {
							if (res.confirm) {
								// 跳转到绑定页面或弹出输入框
								this.showBindDialog(codeRes);
							} else {
								// 用户取消，可以跳转到注册页面
								this.toRegister();
							}
						}
					});

				} catch (error) {
					console.error('微信登录失败:', error);
					uni.showToast({
						title: '微信登录失败，请重试',
						icon: 'none'
					});
				}
			},
			
			// 显示绑定对话框（保持原有逻辑）
			showBindDialog(codeRes) {
				uni.showModal({
					title: '绑定账号',
					editable: true,
					placeholderText: '请输入您的账号或手机号',
					success: async (res) => {
						if (res.confirm && res.content) {
							const account = res.content.trim();
							if (!account) {
								uni.showToast({
									title: '请输入账号',
									icon: 'none'
								});
								return;
							}

							// 验证用户是否存在
							let userRes = await this.vk.callFunction({
								url: 'client/user/pub/isUser',
								title: '验证中...',
								data: {
									mobile: account,
									username: account
								}
							});

							if (userRes.total == 0) {
								uni.showToast({
									title: '账号不存在',
									icon: 'none'
								});
								return;
							}

							// 绑定微信到用户		
							let wx_openid = {}
							wx_openid['mp-weixin'] = codeRes.openid;
							wx_openid[`mp-weixin_${codeRes.appid}`] = codeRes.openid;

							let bindRes = await this.vk.callFunction({
								url: 'client/user/pub/update',
								title: '绑定中...',
								data: {
									_id: userRes.rows[0]._id,
									wx_openid
								}
							});

							if (bindRes.code === 0) {
								uni.showToast({
									title: '绑定成功',
									icon: 'success'
								});

								// 绑定成功后自动登录
								let loginRes = await this.vk.userCenter.loginByWeixin();
								if (loginRes.code === 0) {
									this.vk.navigateToHome();
								}
							} else {
								uni.showToast({
									title: bindRes.msg || '绑定失败',
									icon: 'none'
								});
							}
						}
					}
				});
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