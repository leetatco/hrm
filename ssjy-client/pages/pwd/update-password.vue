<template>
	<view class="page">
		<!-- 使用uView的状态栏组件 -->
		<u-status-bar bgColor="transparent"></u-status-bar>	

		<view class="password-form">
			<!-- 表单卡片 -->
			<view class="form-card">				
				<u-form :model="password" :rules="rules" ref="form" label-position="top">
					<!-- 原密码 -->
					<u-form-item label="原密码" prop="oldPassword" border-bottom>
						<u-input 
							v-model="password.oldPassword" 
							:type="showOldPassword ? 'text' : 'password'" 
							placeholder="请输入原密码"
							:clearable="false"
							:border="false"
							class="custom-input"
						>
							<template slot="prefix">
								<u-icon name="lock" size="36" color="#2979ff"></u-icon>
							</template>
							<template slot="suffix">
								<u-icon 
									:name="showOldPassword ? 'eye-fill' : 'eye'" 
									size="36" 
									color="#909399"
									@click="showOldPassword = !showOldPassword"
								></u-icon>
							</template>
						</u-input>
					</u-form-item>
					
					<!-- 新密码 -->
					<u-form-item label="新密码" prop="newPassword" border-bottom>
						<u-input 
							v-model="password.newPassword" 
							:type="showNewPassword ? 'text' : 'password'" 
							placeholder="请输入新密码"
							:clearable="false"
							:border="false"
							class="custom-input"
						>
							<template slot="prefix">
								<u-icon name="lock-open" size="36" color="#2979ff"></u-icon>
							</template>
							<template slot="suffix">
								<u-icon 
									:name="showNewPassword ? 'eye-fill' : 'eye'" 
									size="36" 
									color="#909399"
									@click="showNewPassword = !showNewPassword"
								></u-icon>
							</template>
						</u-input>
					</u-form-item>
					
					<!-- 确认新密码 -->
					<u-form-item label="确认新密码" prop="passwordConfirmation" border-bottom>
						<u-input 
							v-model="password.passwordConfirmation" 
							:type="showConfirmPassword ? 'text' : 'password'" 
							placeholder="请再次输入新密码"
							:clearable="false"
							:border="false"
							class="custom-input"
							@confirm="submitForm"
						>
							<template slot="prefix">
								<u-icon name="checkmark-circle" size="36" color="#2979ff"></u-icon>
							</template>
							<template slot="suffix">
								<u-icon 
									:name="showConfirmPassword ? 'eye-fill' : 'eye'" 
									size="36" 
									color="#909399"
									@click="showConfirmPassword = !showConfirmPassword"
								></u-icon>
							</template>
						</u-input>
					</u-form-item>
				</u-form>
				
				<!-- 密码规则提示 -->
				<view class="password-rules">
					<view class="rule-title">密码规则：</view>
					<view class="rule-item">
						<u-icon name="checkmark" size="24" color="#19be6b" v-if="password.newPassword.length >= 6"></u-icon>
						<u-icon name="close" size="24" color="#fa3534" v-else></u-icon>
						<text class="rule-text">长度6-20位</text>
					</view>
					<view class="rule-item">
						<u-icon name="checkmark" size="24" color="#19be6b" v-if="/[a-zA-Z]/.test(password.newPassword)"></u-icon>
						<u-icon name="close" size="24" color="#fa3534" v-else></u-icon>
						<text class="rule-text">包含字母</text>
					</view>
					<view class="rule-item">
						<u-icon name="checkmark" size="24" color="#19be6b" v-if="/\d/.test(password.newPassword)"></u-icon>
						<u-icon name="close" size="24" color="#fa3534" v-else></u-icon>
						<text class="rule-text">包含数字</text>
					</view>
					<view class="rule-item">
						<u-icon name="checkmark" size="24" color="#19be6b" v-if="password.newPassword && password.passwordConfirmation && password.newPassword === password.passwordConfirmation"></u-icon>
						<u-icon name="close" size="24" color="#fa3534" v-else></u-icon>
						<text class="rule-text">两次输入一致</text>
					</view>
				</view>
				
				<!-- 提交按钮 -->
				<view class="submit-section">
					<u-button 
						type="primary" 
						shape="circle" 
						:disabled="!canSubmit" 
						@click="submitForm"
						:customStyle="{
							height: '88rpx',
							fontSize: '32rpx',
							fontWeight: '500'
						}"
					>
						确认修改
					</u-button>
					
					<view class="reset-section" @click="resetForm">
						<text class="reset-text">重置表单</text>
					</view>
				</view>
			</view>
			
			<!-- 安全提示 -->
			<view class="security-tips">
				<view class="tips-title">
					<u-icon name="info-circle" size="36" color="#2979ff"></u-icon>
					<text class="tips-title-text">安全提示</text>
				</view>
				<view class="tips-content">
					<text class="tip-item">1. 请不要使用过于简单的密码，如123456、password等</text>
					<text class="tip-item">2. 建议使用字母、数字和特殊字符的组合</text>
					<text class="tip-item">3. 定期更换密码可提高账户安全性</text>
					<text class="tip-item">4. 修改密码后需要重新登录</text>
				</view>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<u-loading-page :loading="isLoading" loading-text="修改中..."></u-loading-page>
	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				showOldPassword: false,
				showNewPassword: false,
				showConfirmPassword: false,
				isLoading: false,
				password: {
					oldPassword: '',
					newPassword: '',
					passwordConfirmation: ''
				},
				rules: {
					oldPassword: [{
						required: true,
						message: '请输入原密码',
						trigger: ['blur', 'change']
					}],
					newPassword: [{
							required: true,
							message: '请输入新密码',
							trigger: ['blur', 'change']
						},
						{
							min: 6,
							max: 20,
							message: '密码长度需在6-20位之间',
							trigger: ['blur', 'change']
						},
						{
							pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
							message: '密码需包含字母和数字',
							trigger: ['blur', 'change']
						}
					],
					passwordConfirmation: [{
							required: true,
							message: '请确认新密码',
							trigger: ['blur', 'change']
						},
						{
							validator: (rule, value, callback) => {
								if (value !== this.password.newPassword) {
									callback(new Error('两次输入的密码不一致'))
								} else {
									callback()
								}
							},
							trigger: ['blur', 'change']
						}
					]
				}
			}
		},
		computed: {
			canSubmit() {
				return this.password.oldPassword && 
					   this.password.newPassword && 
					   this.password.passwordConfirmation &&
					   this.password.newPassword.length >= 6 &&
					   this.password.newPassword.length <= 20 &&
					   /[a-zA-Z]/.test(this.password.newPassword) &&
					   /\d/.test(this.password.newPassword) &&
					   this.password.newPassword === this.password.passwordConfirmation;
			}
		},
		onLoad() {
			// 页面加载时设置标题
			uni.setNavigationBarTitle({
				title: '修改密码'
			});
		},
		methods: {
			...mapMutations(['logout']),
			
			// 导航返回
			navBack() {
				uni.navigateBack();
			},
			
			// 提交表单
			submitForm() {
				this.$refs.form.validate(valid => {
					if (valid) {
						this.save(this.password)
					}
				})
			},
			
			// 重置表单
			resetForm() {
				this.password = {
					oldPassword: '',
					newPassword: '',
					passwordConfirmation: ''
				};
				this.showOldPassword = false;
				this.showNewPassword = false;
				this.showConfirmPassword = false;
				this.$refs.form.resetFields();
			},
			
			// 保存修改
			async save(formData) {
				let that = this;
				this.isLoading = true;
				
				try {
					const res = await uniCloud.callFunction({
						name: 'user-center',
						data: {
							action: 'updatePwd',
							params: {
								...formData
							}
						}
					});
					
					if (res.result.code === 0) {
						uni.showModal({
							title: '修改成功',
							content: res.result.msg || '密码修改成功，请重新登录',
							showCancel: false,
							confirmText: '重新登录',
							success: (modalRes) => {
								if (modalRes.confirm) {
									// 执行退出登录
									that.logout();
									uni.removeStorageSync('uni_id_token');
									uni.removeStorageSync('username');
									
									// 跳转到登录页面
									setTimeout(() => {
										uni.reLaunch({
											url: '/pages/login/login'
										});
									}, 300);
								}
							}
						});
					} else {
						uni.showToast({
							title: res.result.msg || '修改失败',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (e) {
					console.error('修改密码失败:', e);
					uni.showToast({
						title: '网络错误，请稍后重试',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.isLoading = false;
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
	
	.password-form {
		padding: 32rpx;
	}
	
	.form-card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx 32rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
		
		.form-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333333;
			margin-bottom: 40rpx;
			text-align: center;
		}
		
		::v-deep .u-form-item {
			padding: 30rpx 0;
			margin: 0;
			
			&::after {
				border-color: #e4e7ed !important;
			}
			
			.u-form-item__body {
				align-items: center;
			}
			
			.u-form-item__body__label {
				font-size: 28rpx;
				color: #333333;
				font-weight: 500;
				margin-bottom: 20rpx;
				display: block;
			}
		}
		
		.custom-input {
			font-size: 32rpx;
			height: 80rpx;
			line-height: 80rpx;
			
			::v-deep .u-input__content {
				padding-left: 0;
			}
			
			::v-deep .u-input__content__prefix-icon {
				margin-right: 20rpx;
			}
			
			::v-deep .u-input__content__field-wrapper__field {
				padding: 0;
			}
			
			::v-deep .u-input__content__field-wrapper__placeholder {
				color: #c0c4cc;
				font-size: 32rpx;
			}
		}
	}
	
	.password-rules {
		margin: 40rpx 0;
		padding: 32rpx;
		background: #f8f9fa;
		border-radius: 16rpx;
		
		.rule-title {
			font-size: 28rpx;
			font-weight: bold;
			color: #333333;
			margin-bottom: 24rpx;
		}
		
		.rule-item {
			display: flex;
			align-items: center;
			margin-bottom: 16rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.rule-text {
				font-size: 24rpx;
				color: #666666;
				margin-left: 12rpx;
			}
		}
	}
	
	.submit-section {
		::v-deep .u-button {
			background: linear-gradient(135deg, #2979ff 0%, #4dabff 100%) !important;
			border: none !important;
		}
		
		::v-deep .u-button--disabled {
			background: #c0c4cc !important;
			opacity: 0.6;
		}
		
		.reset-section {
			display: flex;
			justify-content: center;
			margin-top: 32rpx;
			
			.reset-text {
				font-size: 28rpx;
				color: #2979ff;
				text-decoration: underline;
			}
		}
	}
	
	.security-tips {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 32rpx;
		margin-top: 40rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
		
		.tips-title {
			display: flex;
			align-items: center;
			margin-bottom: 24rpx;
			
			.tips-title-text {
				font-size: 28rpx;
				font-weight: bold;
				color: #333333;
				margin-left: 12rpx;
			}
		}
		
		.tips-content {
			.tip-item {
				display: block;
				font-size: 24rpx;
				color: #666666;
				line-height: 1.6;
				margin-bottom: 16rpx;
				
				&:last-child {
					margin-bottom: 0;
				}
				
				&::before {
					content: "• ";
					color: #2979ff;
					font-weight: bold;
				}
			}
		}
	}
	
	/* 响应式调整 */
	@media (max-width: 768px) {
		.password-form {
			padding: 24rpx;
		}
		
		.form-card {
			padding: 32rpx 24rpx;
			
			.form-title {
				font-size: 32rpx;
				margin-bottom: 32rpx;
			}
			
			::v-deep .u-form-item {
				padding: 24rpx 0;
				
				.u-form-item__body__label {
					font-size: 26rpx;
				}
			}
			
			.custom-input {
				font-size: 28rpx;
			}
		}
		
		.password-rules {
			padding: 24rpx;
			margin: 32rpx 0;
			
			.rule-title {
				font-size: 26rpx;
			}
			
			.rule-item {
				.rule-text {
					font-size: 22rpx;
				}
			}
		}
		
		.security-tips {
			padding: 24rpx;
			
			.tips-title {
				.tips-title-text {
					font-size: 26rpx;
				}
			}
			
			.tips-content {
				.tip-item {
					font-size: 22rpx;
				}
			}
		}
	}
</style>