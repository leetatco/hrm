<template>
	<view class="container">
		<!-- 状态栏占位（适配胶囊按钮） -->
		<view class="status-placeholder" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 返回主页按钮（与微信胶囊同行） -->
		<view class="back-home-btn" :style="{ top: backHomeTop + 6 +'px' }" @click="goHome">
			<u-icon name="home" size="45"></u-icon>
		</view>

		<!-- 头部logo区域（位于胶囊下方） -->
		<view class="logo-box" :style="{ marginTop: logoMarginTop + 'rpx' }">
			<view class="logo-wrapper">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			</view>
			<text class="app-name">欢迎回来</text>
		</view>

		<!-- 登录表单 -->
		<view class="form-box">
			<u-form :model="form" ref="uForm" labelPosition="top">
				<u-form-item label="账号" prop="username" borderBottom>
					<u-input v-model="form.username" placeholder="请输入账号" clearable :border="false"
						:customStyle="{padding: '10rpx 0'}" disabled>
						<u-icon slot="prefix" name="account" size="20" color="#6c8cff"
							:customStyle="{ marginRight: '10rpx' }"></u-icon>
					</u-input>
				</u-form-item>

				<u-form-item label="密码" prop="password" borderBottom>
					<u-input v-model="form.password" type="password" placeholder="请输入密码" clearable :border="false"
						:customStyle="{padding: '10rpx 0'}" disabled>
						<u-icon slot="prefix" name="lock" size="20" color="#6c8cff"
							:customStyle="{ marginRight: '10rpx' }"></u-icon>
					</u-input>
				</u-form-item>

				<!-- 登录按钮 -->
				<view class="btn-group">
					<u-button type="primary" shape="circle" @click="handleLogin" :customStyle="{
              height: '90rpx',
              fontSize: '32rpx',
              marginTop: '70rpx',
              background: 'linear-gradient(135deg, #6c8cff, #a78bfa)',
              boxShadow: '0 12rpx 36rpx rgba(108, 140, 255, 0.35)',
              border: 'none'
            }">
						登 录
					</u-button>

					<view class="register-link">
						<text class="tip-text">还没有账号？点手机号快捷登录</text>
					</view>
				</view>
			</u-form>
		</view>

		<!-- 分割线 -->
		<view class="divider" v-if="showThirdLogin">
			<view class="divider-line"></view>
			<text class="divider-text">其他登录方式</text>
			<view class="divider-line"></view>
		</view>

		<!-- 第三方登录 -->
		<view class="third-login" v-if="showThirdLogin">
			<!-- #ifdef MP-WEIXIN -->
			<view class="third-item" @click="login_weixin">
				<view class="third-icon wechat">
					<u-icon name="moments-circel-fill" size="52" color="#ffffff"></u-icon>
				</view>
				<text class="third-text">手机号快捷登录</text>
			</view>
			<!-- #endif -->

			<!-- #ifdef APP-PLUS -->
			<view class="third-item" @click="login_weixin">
				<view class="third-icon wechat">
					<u-icon name="moments-circel-fill" size="52" color="#ffffff"></u-icon>
				</view>
				<text class="third-text">手机号快捷登录</text>
			</view>
			<!-- #endif -->
			<!-- 移除了返回主页项，已移至左上角 -->
		</view>

		<!-- 协议声明（复选框 + 链接） -->
		<view class="agreement">
			<view class="agreement-checkbox" @click="toggleAgreement">
				<view class="checkbox-icon" :class="{ checked: agreementChecked }">
					<u-icon v-if="agreementChecked" name="checkmark" size="16" color="#ffffff"></u-icon>
				</view>
				<text class="agreement-text">我已阅读并同意</text>
				<text class="agreement-link" @click.stop="showAgreementPopup">《用户协议》</text>
				<text class="agreement-text">和</text>
				<text class="agreement-link" @click.stop="showPrivacyPopup">《隐私政策》</text>
			</view>
		</view>

		<!-- ========== 协议弹窗 ========== -->
		<u-popup v-model="agreementPopupVisible" :mode="'bottom'" :closeable="true" :mask-close-able="true"
			:height="'85%'" :border-radius="20">
			<view class="agreement-popup">
				<view class="popup-header">
					<text class="popup-title">{{ agreementTitle }}</text>
				</view>
				<scroll-view scroll-y class="popup-scroll">
					<view class="popup-content" v-html="agreementContent"></view>
				</scroll-view>
			</view>
		</u-popup>

		<!-- ========== 【修改】绑定账号弹窗：直接弹出，不再经过中间提示 ========== -->
		<u-popup v-model="inputModalVisible" :mode="'bottom'" :closeable="true" :mask-close-able="false"
			:height="'auto'" :border-radius="20" @close="onInputPopupClose">
			<view class="bind-popup">
				<view class="bind-popup-header">
					<text class="bind-popup-title">绑定账号</text>
					<text class="bind-popup-desc">请绑定您的手机号以完成登录</text>					
				</view>
				<view class="bind-popup-body">
					<button class="wechat-phone-btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
						<u-icon name="phone-fill" size="30" color="#07c160"
							:customStyle="{ marginRight: '12rpx' }"></u-icon>
						获取本机号码
					</button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusBarHeight: 20,
				logoMarginTop: 0,
				backHomeTop: 30, // 返回按钮的 top 值，动态计算
				form: {
					username: '',
					password: '',
					remember: false
				},
				showThirdLogin: true,
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
				inputModalVisible: false,
				bindAccountInput: '',
				currentCodeRes: null,
				agreementPopupVisible: false,
				agreementTitle: '用户协议',
				agreementContent: '',
				privacyContent: '',
				agreementChecked: false,
				encryptedKey: '',
				wxOpenid: ''
			}
		},
		onLoad() {
			this.loadRememberedAccount();
			this.initLayout();
			this.loadAgreementContent();
			this.prepareEncryptedKey();
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
			// 返回主页
			goHome() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			},
			// 预先获取 encryptedKey
			async prepareEncryptedKey() {
				try {
					const res = await vk.userCenter.code2SessionWeixin({
						data: {
							needCache: true
						}
					});
					if (res && res.encryptedKey) {
						this.encryptedKey = res.encryptedKey;
					}
				} catch (e) {
					console.log('获取 encryptedKey 失败', e);
				}
			},

			// 获取微信手机号
			getPhoneNumber(e) {
				const {
					encryptedData,
					iv
				} = e.detail;
				if (!encryptedData || !iv) {
					uni.showToast({
						title: '授权失败，请手动输入',
						icon: 'none'
					});
					return;
				}
				if (!this.encryptedKey) {
					uni.showToast({
						title: '加密密钥未准备好，请重试',
						icon: 'none'
					});
					return;
				}
				vk.userCenter.getPhoneNumber({
					data: {
						encryptedData,
						iv,
						encryptedKey: this.encryptedKey
					},
					success: (data) => {
						if (data.mobile) {
							this.bindAccountInput = data.mobile;
							this.confirmInputBind();
						} else {
							uni.showToast({
								title: '未能获取手机号，请手动输入',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('获取手机号失败', err);
						uni.showToast({
							title: err.msg || '获取失败，请手动输入',
							icon: 'none'
						});
					}
				});
			},

			toggleAgreement() {
				this.agreementChecked = !this.agreementChecked;
			},

			loadAgreementContent() {
				this.agreementContent = `
					<h2>用户协议</h2>
					<p>欢迎您使用本应用！请您仔细阅读以下条款：</p>
					
					<h3>一、服务内容</h3>
					<p>1. 本应用提供企业办公管理服务，包括但不限于考勤、审批、通知等功能。</p>
					<p>2. 我们保留随时变更、中断或终止部分或全部服务的权利。</p>
					
					<h3>二、用户账户</h3>
					<p>1. 您需提供真实、准确、完整的注册信息。</p>
					<p>2. 您应妥善保管您的账号和密码，因您保管不善导致的损失由您自行承担。</p>
					<p>3. 您应对您账号下的所有行为负责。</p>
					
					<h3>三、使用规范</h3>
					<p>1. 您不得利用本应用从事违法违规活动。</p>
					<p>2. 您不得干扰或破坏本应用的正常运行。</p>
					<p>3. 您不得发布虚假信息或侵犯他人合法权益的内容。</p>
					
					<h3>四、隐私保护</h3>
					<p>1. 我们重视您的隐私，具体请查阅《隐私政策》。</p>
					<p>2. 我们不会在未经您同意的情况下向第三方提供您的个人信息。</p>
					
					<h3>五、免责声明</h3>
					<p>1. 本应用按"现状"提供服务，不提供任何明示或暗示的担保。</p>
					<p>2. 我们不保证服务不会中断或完全无错误。</p>
					
					<h3>六、协议修改</h3>
					<p>我们有权随时修改本协议，修改后的协议将在应用内公示。</p>
					
					<h3>七、联系我们</h3>
					<p>如有任何疑问，请通过应用内的客服功能联系我们。</p>
				`;

				this.privacyContent = `
					<h2>隐私政策</h2>
					<p>本应用非常重视您的隐私保护。本隐私政策将说明我们如何收集、使用和保护您的个人信息。</p>
					
					<h3>一、信息收集</h3>
					<p>1. <strong>账户信息</strong>：当您注册时，我们会收集您的用户名、手机号等信息。</p>
					<p>2. <strong>使用信息</strong>：我们可能会收集您使用应用的行为数据，以优化服务体验。</p>
					<p>3. <strong>设备信息</strong>：为保障服务安全，我们可能收集设备型号、操作系统等信息。</p>
					
					<h3>二、信息使用</h3>
					<p>1. 我们使用您的信息来提供、维护和改进服务。</p>
					<p>2. 我们可能使用您的信息进行身份验证和安全防护。</p>
					<p>3. 我们不会将您的个人信息出售给第三方。</p>
					
					<h3>三、信息存储</h3>
					<p>1. 您的信息将存储在安全的服务器上。</p>
					<p>2. 我们采取合理的技术措施保护您的信息安全。</p>
					<p>3. 您有权查询、更正或删除您的个人信息。</p>
					
					<h3>四、信息共享</h3>
					<p>1. 未经您的明确同意，我们不会与第三方共享您的个人信息。</p>
					<p>2. 法律法规要求或政府机关依法要求时，我们可能需要披露相关信息。</p>
					
					<h3>五、Cookie使用</h3>
					<p>我们可能使用Cookie来提升您的使用体验，您可以选择禁用Cookie。</p>
					
					<h3>六、隐私政策更新</h3>
					<p>我们可能会适时更新本隐私政策，更新后的政策将在应用内公示。</p>
					
					<h3>七、联系我们</h3>
					<p>如果您对隐私政策有任何疑问，请通过客服功能联系我们。</p>
				`;
			},

			showAgreementPopup() {
				this.agreementTitle = '用户协议';
				this.agreementContent = this.agreementContent;
				this.agreementPopupVisible = true;
			},

			showPrivacyPopup() {
				this.agreementTitle = '隐私政策';
				this.agreementContent = this.privacyContent;
				this.agreementPopupVisible = true;
			},

			initLayout() {
				try {
					const sysInfo = uni.getSystemInfoSync();
					this.statusBarHeight = sysInfo.statusBarHeight || 20;

					// #ifdef MP-WEIXIN
					const menuRect = uni.getMenuButtonBoundingClientRect();
					const capsuleBottom = menuRect.top + menuRect.height;
					const pxToRpx = 750 / sysInfo.windowWidth;
					this.logoMarginTop = (capsuleBottom + 10) * pxToRpx;
					// 计算返回按钮的 top：胶囊垂直居中位置 (top + height/2)
					this.backHomeTop = menuRect.top + menuRect.height / 2 - 22; // 22为图标高度一半（44/2）
					// #endif

					// #ifndef MP-WEIXIN
					this.logoMarginTop = 20;
					this.backHomeTop = this.statusBarHeight + 20;
					// #endif
				} catch (e) {
					console.error('获取布局信息失败:', e);
					this.logoMarginTop = 40;
					this.backHomeTop = 40;
				}
			},
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
				if (!this.agreementChecked) {
					uni.showToast({
						title: '请先阅读并同意用户协议和隐私政策',
						icon: 'none'
					});
					return;
				}
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
			async login_weixin() {
				try {
					if (!this.agreementChecked) {
						uni.showToast({
							title: '请先阅读并同意用户协议和隐私政策',
							icon: 'none'
						});
						return;
					}

					let codeRes = await vk.userCenter.code2SessionWeixin();
					if (!codeRes || !codeRes.openid) {
						uni.showToast({
							title: '微信登录失败',
							icon: 'none'
						});
						return;
					}
					if (codeRes.encryptedKey) {
						this.encryptedKey = codeRes.encryptedKey;
					}

					this.wxOpenid = codeRes.openid || '';

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
					this.currentCodeRes = codeRes;
					this.bindAccountInput = '';
					this.inputModalVisible = true;
				} catch (error) {
					console.error('微信登录失败:', error);
					uni.showToast({
						title: '微信登录失败，请重试',
						icon: 'none'
					});
				}
			},

			onInputPopupClose() {
				// 可在此重置一些状态
			},

			async confirmInputBind() {
				const account = this.bindAccountInput.trim();
				if (!account) {
					uni.showToast({
						title: '请先输入手机号或点击获取本机号码',
						icon: 'none'
					});
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
				let userRes = await vk.callFunction({
					url: 'client/user/pub/isAddUser',
					title: '验证中...',
					data: {
						mobile: account,
						username: account,
						wx_openid: this.wxOpenid
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
				const userInfo = userRes.rows[0];
				vk.setVuex('$user.employeeInfo', userInfo.employeeInfo);
				if (userInfo.employeeInfo.status == 2) {
					uni.showToast({
						title: '该员工已离职',
						icon: 'none'
					});
					this.inputModalVisible = false;
					return;
				}
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
	/* ============================================================
	   小清新风格 - 柔和的马卡龙色系
	   ============================================================ */
	.container {
		min-height: 100vh;
		background: linear-gradient(150deg, #e8f0fe 0%, #f5e8fd 40%, #fce4ec 100%);
		padding: 0 50rpx 40rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.status-placeholder {
		width: 100%;
		flex-shrink: 0;
	}

	/* 返回主页按钮 - 固定定位，与胶囊水平对齐 */
	.back-home-btn {
		position: fixed;
		left: 20rpx;
		z-index: 999;
		width: 44rpx;
		height: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		// background: rgba(255, 255, 255, 0.8);
		border-radius: 50%;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		transition: all 0.2s;

		&:active {
			transform: scale(0.92);
			background: rgba(255, 255, 255, 0.95);
		}
	}

	.logo-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		margin-bottom: 40rpx;

		.logo-wrapper {
			width: 140rpx;
			height: 140rpx;
			border-radius: 40rpx;
			background: linear-gradient(135deg, #ffffff, #f8faff);
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 16rpx 48rpx rgba(108, 140, 255, 0.12);
			margin-bottom: 24rpx;

			.logo {
				width: 100rpx;
				height: 100rpx;
				border-radius: 24rpx;
			}
		}

		.app-name {
			font-size: 40rpx;
			font-weight: 600;
			color: #4a4a6a;
			letter-spacing: 2rpx;
			margin-bottom: 8rpx;
		}

		.app-desc {
			font-size: 26rpx;
			color: #a8b5d9;
			letter-spacing: 1rpx;
		}
	}

	.form-box {
		width: 100%;
		max-width: 600rpx;
		background: rgba(255, 255, 255, 0.82);
		backdrop-filter: blur(20rpx);
		-webkit-backdrop-filter: blur(20rpx);
		border-radius: 36rpx;
		padding: 56rpx 44rpx 48rpx;
		box-shadow: 0 24rpx 64rpx rgba(108, 140, 255, 0.10),
			inset 0 1rpx 0 rgba(255, 255, 255, 0.6);

		::v-deep .u-form-item {
			padding: 6rpx 0;

			.u-form-item__body {
				padding: 6rpx 0 !important;
			}

			.u-form-item__body__left {
				padding: 0 !important;
			}
		}

		::v-deep .u-input {
			padding: 16rpx 0 !important;
			font-size: 30rpx;
			color: #4a4a6a;

			.u-input__input {
				color: #4a4a6a;
			}
		}

		::v-deep .u-form-item .u-form-item__body .u-form-item__body__left {
			width: auto !important;
			flex: none !important;
		}

		.btn-group {
			margin-top: 10rpx;

			::v-deep .u-button {
				border: none !important;
				font-weight: 500;
				letter-spacing: 4rpx;
				transition: all 0.3s;

				&:active {
					transform: scale(0.97);
					box-shadow: 0 6rpx 20rpx rgba(108, 140, 255, 0.25) !important;
				}
			}

			.register-link {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-top: 32rpx;

				.tip-text {
					font-size: 26rpx;
					color: #b0bcdb;
				}
			}
		}
	}

	.divider {
		display: flex;
		align-items: center;
		width: 100%;
		max-width: 600rpx;
		margin: 60rpx 0 48rpx;

		.divider-line {
			flex: 1;
			height: 1rpx;
			background: linear-gradient(to right, transparent, rgba(160, 180, 210, 0.3), transparent);
		}

		.divider-text {
			padding: 0 28rpx;
			font-size: 24rpx;
			color: #b8c5e0;
			white-space: nowrap;
			font-weight: 400;
			letter-spacing: 2rpx;
		}
	}

	.third-login {
		display: flex;
		justify-content: center;
		gap: 72rpx;
		width: 100%;
		max-width: 600rpx;

		.third-item {
			display: flex;
			flex-direction: column;
			align-items: center;

			.third-icon {
				width: 88rpx;
				height: 88rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 14rpx;
				box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.20);
				transition: transform 0.2s, box-shadow 0.2s;

				&.wechat {
					background: linear-gradient(135deg, #07c160, #0dd06a);
				}

				&:active {
					transform: scale(0.92);
					box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.15);
				}
			}

			.third-text {
				font-size: 24rpx;
				color: #b0bcdb;
				font-weight: 400;
			}
		}
	}

	.agreement {
		position: fixed;
		bottom: 48rpx;
		left: 0;
		right: 0;
		text-align: center;
		padding: 0 32rpx;
		display: flex;
		justify-content: center;

		.agreement-checkbox {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-wrap: wrap;
			gap: 4rpx;
			cursor: pointer;
			user-select: none;

			.checkbox-icon {
				width: 36rpx;
				height: 36rpx;
				border-radius: 6rpx;
				border: 2rpx solid #c5d0e8;
				background: #ffffff;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 10rpx;
				transition: all 0.2s;
				flex-shrink: 0;

				&.checked {
					background: #6c8cff;
					border-color: #6c8cff;
				}
			}

			.agreement-text {
				font-size: 24rpx;
				color: #c5d0e8;
			}

			.agreement-link {
				font-size: 24rpx;
				color: #8aa4e8;
				font-weight: 500;
				padding: 4rpx 6rpx;
				border-radius: 12rpx;
				transition: background 0.2s;

				&:active {
					background: rgba(138, 164, 232, 0.15);
				}
			}
		}
	}

	.agreement-popup {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #ffffff;
		border-radius: 20rpx 20rpx 0 0;
		overflow: hidden;

		.popup-header {
			padding: 32rpx 40rpx 20rpx;
			border-bottom: 1rpx solid #f0f2f5;
			flex-shrink: 0;
			display: flex;
			align-items: center;
			justify-content: center;

			.popup-title {
				font-size: 34rpx;
				font-weight: 600;
				color: #4a4a6a;
				letter-spacing: 1rpx;
			}
		}

		.popup-scroll {
			flex: 1;
			padding: 0 40rpx 40rpx;
		}

		.popup-content {
			font-size: 28rpx;
			color: #4a4a6a;
			line-height: 1.8;

			h2 {
				font-size: 34rpx;
				font-weight: 600;
				color: #4a4a6a;
				text-align: center;
				margin: 30rpx 0 20rpx;
				padding-bottom: 16rpx;
				border-bottom: 2rpx solid #f0f2f5;
			}

			h3 {
				font-size: 30rpx;
				font-weight: 600;
				color: #6c8cff;
				margin: 28rpx 0 12rpx;
			}

			p {
				font-size: 27rpx;
				color: #666;
				margin-bottom: 10rpx;
				text-indent: 2em;
			}

			strong {
				color: #4a4a6a;
				font-weight: 600;
			}
		}
	}

	/* 绑定弹窗样式 */
	.bind-popup {
		background: #ffffff;
		border-radius: 20rpx 20rpx 0 0;
		padding: 40rpx 36rpx 48rpx;
		display: flex;
		flex-direction: column;
		align-items: stretch;

		.bind-popup-header {
			text-align: center;
			margin-bottom: 32rpx;

			.bind-popup-title {
				font-size: 36rpx;
				font-weight: 600;
				color: #4a4a6a;
				display: block;
				margin-bottom: 8rpx;
			}

			.bind-popup-desc {
				font-size: 26rpx;
				color: #b0bcdb;
			}
		}

		.bind-popup-body {
			display: flex;
			flex-direction: column;
			gap: 24rpx;
		}

		.wechat-phone-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f0f7ff;
			border: 2rpx solid #d4e3ff;
			border-radius: 50rpx;
			padding: 18rpx 0;
			font-size: 30rpx;
			color: #07c160;
			font-weight: 500;
			transition: all 0.2s;
			background-color: transparent;
			background: none;
			border: none;
			box-shadow: none;
			outline: none;

			&::after {
				border: none;
			}

			&:active {
				background: rgba(7, 193, 96, 0.08);
				transform: scale(0.97);
			}

			&[type="default"] {
				background: #f0f7ff;
				border: 2rpx solid #d4e3ff;
				border-radius: 50rpx;
				padding: 18rpx 0;
				font-size: 28rpx;
				color: #07c160;
				font-weight: 500;
				line-height: 1;
			}
		}

		.bind-popup-actions {
			display: flex;
			justify-content: space-around;
			margin-top: 16rpx;

			.u-button {
				height: 76rpx;
				font-size: 28rpx;
			}
		}
	}

	/* 响应式适配 */
	@media (max-width: 750px) {
		.container {
			padding: 0 36rpx 32rpx;
		}

		.logo-box {
			margin-bottom: 32rpx;

			.logo-wrapper {
				width: 120rpx;
				height: 120rpx;

				.logo {
					width: 80rpx;
					height: 80rpx;
				}
			}

			.app-name {
				font-size: 36rpx;
			}

			.app-desc {
				font-size: 24rpx;
			}
		}

		.form-box {
			padding: 44rpx 32rpx 40rpx;
			border-radius: 32rpx;
		}

		.third-login {
			gap: 56rpx;

			.third-item {
				.third-icon {
					width: 76rpx;
					height: 76rpx;
				}
			}
		}

		.divider {
			margin: 48rpx 0 40rpx;
		}

		.agreement {
			bottom: 32rpx;

			.agreement-checkbox {
				.checkbox-icon {
					width: 32rpx;
					height: 32rpx;
					margin-right: 6rpx;
				}

				.agreement-text,
				.agreement-link {
					font-size: 22rpx;
				}
			}
		}

		.agreement-popup {
			.popup-header {
				padding: 28rpx 32rpx 16rpx;

				.popup-title {
					font-size: 30rpx;
				}
			}

			.popup-scroll {
				padding: 0 32rpx 32rpx;
			}

			.popup-content {
				font-size: 26rpx;

				h2 {
					font-size: 30rpx;
				}

				h3 {
					font-size: 28rpx;
				}

				p {
					font-size: 25rpx;
				}
			}
		}

		.bind-popup {
			padding: 32rpx 24rpx 40rpx;

			.bind-popup-header {
				margin-bottom: 24rpx;

				.bind-popup-title {
					font-size: 32rpx;
				}

				.bind-popup-desc {
					font-size: 24rpx;
				}
			}

			.wechat-phone-btn {
				font-size: 26rpx;
				padding: 14rpx 0;
			}

			.bind-popup-actions {
				.u-button {
					height: 68rpx;
					font-size: 26rpx;
				}
			}
		}
	}

	@media (max-width: 400px) {
		.container {
			padding: 0 24rpx 28rpx;
		}

		.form-box {
			padding: 36rpx 24rpx 32rpx;
			border-radius: 28rpx;
		}

		.logo-box .logo-wrapper {
			width: 100rpx;
			height: 100rpx;
		}
	}
</style>