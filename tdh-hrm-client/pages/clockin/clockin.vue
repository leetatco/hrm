<template>
	<view class="clockin-page">
		<!-- 顶部日期卡片 -->
		<view class="date-header">
			<view class="date-header__inner">
				<u-icon name="calendar" size="36" color="#2d8cff"></u-icon>
				<text class="date-header__text">{{ today }}</text>
			</view>
		</view>

		<!-- 主内容区 -->
		<scroll-view scroll-y class="main-scroll" enhanced :show-scrollbar="false">
			<view class="hint-card" v-if="!is_range && !disableSubmit">
				<view class="hint-card__inner">
					<u-icon name="info-circle-fill" size="32" color="#ff9f43"></u-icon>
					<text class="hint-card__text">打卡前请确保 Wi-Fi 和手机定位已开启</text>
				</view>
			</view>
			<view class="card-list">
				<!-- 网络信息卡片 -->
				<view class="info-card">
					<view class="info-card__title">
						<u-icon name="wifi" size="32" color="#2d8cff"></u-icon>
						<text>网络信息</text>
					</view>
					<view class="info-row">
						<text class="info-row__label">Wi-Fi名称</text>
						<text class="info-row__value">{{ formData.setting_ssid || '未设置' }}</text>
					</view>
					<view class="info-row">
						<text class="info-row__label">Wi-Fi地址</text>
						<text class="info-row__value">{{ formData.setting_bssid || '未设置' }}</text>
					</view>
					<view class="info-row">
						<text class="info-row__label">当前连接</text>
						<text class="info-row__value">{{ bssid_current || '未连接' }}</text>
					</view>
					<view class="info-row">
						<text class="info-row__label">信号强度</text>
						<text class="info-row__value"
							:class="{ 'text-danger': requiredSignalStrength > 0 && signalStrength_current < requiredSignalStrength }">
							{{ signalStrength_current }}
							<span v-if="requiredSignalStrength > 0"> / 要求 {{ requiredSignalStrength }}</span>
						</text>
					</view>
					<view class="info-row">
						<text class="info-row__label">考勤组</text>
						<text class="info-row__value">{{ groupName || '未匹配' }}</text>
					</view>
				</view>

				<!-- 图片上传卡片 -->
				<view class="upload-card">
					<view class="upload-card__title">
						<u-icon name="camera" size="32" color="#2d8cff"></u-icon>
						<text>打卡凭证</text>
						<text class="upload-card__required" v-if="!is_range">* 出差打卡必填</text>
					</view>
					<view class="upload-card__area">
						<view v-if="!formData.img" class="upload-placeholder" @click="chooseAndUploadImage">
							<u-icon name="camera" size="48" color="#2979ff" />
							<text class="upload-placeholder__text">点击拍照</text>
							<text class="upload-placeholder__sub">出差打卡必须上传照片</text>
						</view>
						<view v-else class="upload-preview">
							<image :src="formData.img" mode="aspectFill" class="upload-preview__img"
								@click="previewImage" />
							<view class="upload-preview__delete" @click.stop="removeImage">
								<u-icon name="close" size="20" color="#fff" />
							</view>
							<view class="upload-preview__reupload" @click.stop="chooseAndUploadImage">
								<text>重新拍照</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 备注卡片 -->
				<view class="remark-card">
					<view class="remark-card__title">
						<u-icon name="compose" size="32" color="#2d8cff"></u-icon>
						<text>备注说明</text>
					</view>
					<input class="remark-card__input" type="text" v-model="formData.remark" placeholder="请输入备注（选填）"
						placeholder-class="remark-card__placeholder" />
				</view>

				<!-- 打卡状态卡片 -->
				<view class="status-card">
					<view class="status-card__icon">
						<u-icon type="location-filled" size="48" :color="is_range ? '#4caf50' : '#f44336'"></u-icon>
					</view>
					<view class="status-card__text">
						<text class="status-card__main" :class="is_range ? 'text-success' : 'text-danger'">
							{{ is_range_content }}
						</text>
						<text class="status-card__type">打卡类型：{{ formData.type || '未知' }}</text>
					</view>
				</view>

				<!-- 打卡按钮区域 -->
				<view class="clockin-action">
					<view class="clockin-btn" @click="submit" :class="{
							'clockin-btn--disabled': is_submit || disableSubmit,
							'clockin-btn--outrange': !is_range
						}">
						<view class="clockin-btn__ring">
							<view class="clockin-btn__time">{{ time }}</view>
							<view class="clockin-btn__text">{{ disableSubmit ? '不可打卡' : '打卡' }}</view>
						</view>
					</view>
					<text class="clockin-action__hint" v-if="is_submit">正在提交，请勿重复点击</text>
				</view>

				<view class="bottom-placeholder"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				formData: {
					employee_id: "",
					bssid: "",
					ssid: "",
					setting_bssid: "", // 新增：设定打卡点的 bssid
					setting_ssid: "", // 新增：设定打卡点的 ssid
					type: "",
					img: "",
					clockintime: "",
					remark: ""
				},
				is_submit: false,
				time: "00:00",
				bssid_current: "",
				ssid_current: "",
				signalStrength_current: 0,
				is_range: true,
				is_range_content: "正在检测打卡范围...",
				today: "",
				avatarDir: '/clockin',
				// 考勤组与打卡点
				groupName: "",
				attendanceGroupId: "",
				punchLocation: null,
				requiredSignalStrength: 0,
				canSubmitByWifi: false,
				disableSubmit: false,
				_signalModalShowing: false
			};
		},
		onShow() {
			this.loadData();
			this.getConnectedWifi();
		},
		onLoad() {
			uni.setNavigationBarTitle({
				title: "打卡"
			});
			this.initDateTime();
			this.startTimeUpdater();
		},
		methods: {
			//========== 拍照并上传 ==========
			chooseAndUploadImage() {
				const timestamp = Date.now();
				const random = Math.floor(Math.random() * 10000);

				vk.chooseAndUploadFile({
					type: 'image',
					count: 1,
					sourceType: ['camera'],
					sizeType: ['compressed'],
					title: '上传中...',
					onChooseFile: (res) => {
						let tempFiles = res.tempFiles.slice(0, 1);
						const file = tempFiles[0];
						const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
						tempFiles[0].cloudPath = `public${this.avatarDir}/${timestamp}_${random}.${ext}`;
						return {
							tempFilePaths: res.tempFilePaths.slice(0, 1),
							tempFiles
						};
					},
					success: (res) => {
						const file = res.tempFiles[0];
						this.formData.img = file.url;
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						});
					},
					fail: (err) => {
						if (err.errMsg && err.errMsg.includes('cancel')) {
							return;
						}
						console.error('上传失败:', err);
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
				});
			},

			//========== 预览图片 ==========
			previewImage() {
				if (!this.formData.img) return;
				uni.previewImage({
					urls: [this.formData.img],
					current: this.formData.img
				});
			},

			//========== 删除图片 ==========
			async removeImage() {
				if (!this.formData.img) return;
				try {
					await vk.myfn.deleteFile({
						url: this.formData.img
					});
				} catch (e) {
					console.warn('删除云文件失败:', e);
				}
				this.formData.img = '';
				uni.showToast({
					title: '已删除',
					icon: 'none'
				});
			},

			// 初始化日期与星期
			initDateTime() {
				const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
				const now = new Date();
				const dateStr = vk.pubfn.timeFormat(now, 'yyyy-MM-dd');
				this.today = `${dateStr} ${weeks[now.getDay()]}`;
			},

			// 启动时间更新器
			startTimeUpdater() {
				setInterval(() => {
					const date = new Date();
					const hour = date.getHours();
					const minute = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
					this.time = `${hour}:${minute}`;
				}, 1000);
			},

			// ========== 加载打卡点（通过公共云函数） ==========
			async loadData(callback) {
				const employeeId = vk.getVuex('$user.userInfo.username');
				if (!employeeId) {
					vk.alert("没有获取到工号");
					return;
				}
				this.formData.employee_id = employeeId;

				try {
					const res = await vk.callFunction({
						url: 'admin/hrm/clockin/pub/getClockinLocation',
						title: '加载打卡点...',
						data: {
							employee_id: employeeId
						}
					});

					if (res.code !== 0) {
						this.disableSubmit = true;
						this.is_range = false;
						this.is_range_content = res.msg || '打卡点加载失败';
						if (typeof callback === "function") callback();
						return;
					}

					const info = res.data || {};
					this.groupName = info.attendance_group_name || '';
					this.attendanceGroupId = info.attendance_group_id || '';

					if (!info.punch_location) {
						this.disableSubmit = true;
						this.is_range = false;
						this.is_range_content = '未匹配到打卡点，无法打卡';
						if (typeof callback === "function") callback();
						return;
					}

					this.punchLocation = info.punch_location;
					this.requiredSignalStrength = info.punch_location.signalStrength || 0;

					// 判断范围
					this.getCurrentAddress();

				} catch (e) {
					console.error('加载打卡点异常:', e);
					this.disableSubmit = true;
					this.is_range = false;
					this.is_range_content = '打卡点加载异常';
				}

				if (typeof callback === "function") callback();
			},

			// 下拉刷新
			onPullDownRefresh() {
				this.loadData(() => {
					uni.stopPullDownRefresh();
				});
			},

			// 获取当前连接的 Wi-Fi 及信号强度
			getConnectedWifi() {
				uni.startWifi({
					success: () => {
						uni.getConnectedWifi({
							success: res => {
								this.bssid_current = res.wifi.BSSID || '无';
								this.ssid_current = res.wifi.SSID || '';
								// 部分平台支持 signalStrength
								this.signalStrength_current = res.wifi.signalStrength || 0;
								this.getCurrentAddress();
							},
							fail: err => {
								console.error('获取当前Wi-Fi失败', err);
								this.bssid_current = '获取失败';
								this.ssid_current = '';
								this.signalStrength_current = 0;
								this.getCurrentAddress();
							}
						});
					},
					fail: (err) => {
						console.error('启动Wi-Fi模块失败', err);
						this.bssid_current = '无法获取';
						this.ssid_current = '';
						this.signalStrength_current = 0;
						this.getCurrentAddress();
					}
				});
			},

			// 判断打卡范围（Wi-Fi 匹配 + 信号强度判断）
			getCurrentAddress() {
				if (!this.punchLocation) {
					this.is_range = false;
					this.canSubmitByWifi = false;
					this.disableSubmit = true;
					this.is_range_content = '未匹配到打卡点';
					return;
				}

				// 设定打卡点信息（用于对比和展示）
				const settingBssid = this.punchLocation.bssid || '';
				const settingSsid = this.punchLocation.ssid || '';
				
				// 不管在不在范围，都记录设定打卡点
				this.formData.setting_ssid = settingSsid;
				this.formData.setting_bssid = settingBssid;

				// 当前连接的 Wi-Fi 信息
				const currentBssid = this.bssid_current || '';
				const currentSsid = this.ssid_current || '';				

				const matchWifi = currentBssid && currentBssid === settingBssid;
				const required = this.requiredSignalStrength || 0;

				if (!matchWifi) {
					// 未连接打卡点 Wi-Fi → 出差卡
					this.is_range = false;
					this.canSubmitByWifi = false;
					this.disableSubmit = false;
					this.formData.type = "出差卡";
					this.is_range_content = "⚠️ 您已超出打卡范围，将按出差卡记录（需拍照）";
					// 记录当前连接的 Wi-Fi（不是设定的）
					this.formData.ssid = currentSsid || "无法获取";
					this.formData.bssid = currentBssid || "无法获取";
					return;
				}

				// 已连接打卡点 Wi-Fi，判断信号强度
				if (required > 0 && this.signalStrength_current < required) {
					this.is_range = false;
					this.canSubmitByWifi = false;
					this.disableSubmit = false;
					this.formData.type = "出差卡";
					this.is_range_content = `⚠️ 信号强度不足（当前 ${this.signalStrength_current}，需要 ${required}）`;
					// ★ 关键修改：记录员工实际连接的 Wi-Fi
					this.formData.ssid = currentSsid;
					this.formData.bssid = currentBssid;
					// 弹出提示
					this.showSignalModal(required, this.signalStrength_current);
					return;
				}

				// Wi-Fi 与信号强度均满足
				this.is_range = true;
				this.canSubmitByWifi = true;
				this.disableSubmit = false;
				this.formData.type = "公司卡";
				this.is_range_content = "✅ 您已在打卡范围内，将按公司卡记录";
				// ★ 记录员工实际连接的 Wi-Fi
				this.formData.ssid = currentSsid;
				this.formData.bssid = currentBssid;
			},

			// 信号强度不达标弹窗
			showSignalModal(required, current) {
				if (this._signalModalShowing) return;
				this._signalModalShowing = true;
				uni.showModal({
					title: '信号强度不足',
					content: `当前信号强度：${current}\n设定信号强度：${required}\n\n请靠近 Wi-Fi 路由器后重试，或按出差卡拍照提交。`,
					showCancel: true,
					confirmText: '重新检测',
					cancelText: '知道了',
					success: (res) => {
						this._signalModalShowing = false;
						if (res.confirm) {
							this.getConnectedWifi();
						}
					},
					fail: () => {
						this._signalModalShowing = false;
					}
				});
			},

			// 跳回记录页
			toMain() {
				uni.navigateTo({
					url: "/pages/clockin/index"
				});
			},

			// 提交打卡
			submit() {
				this.formData.employee_id = vk.getVuex('$user.userInfo.username');
				if (!this.formData.employee_id) return vk.alert("没有人员工号");
				if (this.disableSubmit) return vk.alert("当前无法打卡");
				if (!this.formData.bssid) return vk.alert("请先设定打卡点");
				if (!this.is_range && !this.formData.img) return vk.alert("出差打卡必须拍照上传");
				if (this.is_submit) return;

				// 信号强度二次校验
				if (this.is_range && this.requiredSignalStrength > 0) {
					if (this.signalStrength_current < this.requiredSignalStrength) {
						return this.showSignalModal(this.requiredSignalStrength, this.signalStrength_current);
					}
				}

				this.is_submit = true;
				this.formData.clockintime = vk.pubfn.timeFormat(new Date(), 'yyyy-MM-dd hh:mm:ss');

				vk.callFunction({
					url: 'admin/hrm/clockin/sys/add',
					title: '提交中...',
					data: this.formData
				}).then(res => {
					this.is_submit = false;
					if (res.code === 0) {
						vk.alert('打卡成功', '提示', '确定', () => {
							this.toMain();
						});
					} else {
						vk.alert(res.msg);
					}
				}).catch(() => {
					this.is_submit = false;
					vk.alert("提交失败，请重试");
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	$theme-color: #2d8cff;
	$bg-gray: #f8f9fc;
	$card-white: #ffffff;
	$success-green: #4caf50;
	$danger-red: #f44336;
	$border-radius-card: 24rpx;
	$box-shadow-card: 0 8rpx 24rpx rgba(0, 0, 0, 0.04), 0 2rpx 4rpx rgba(0, 0, 0, 0.02);

	.clockin-page {
		min-height: 100vh;
		background: $bg-gray;
		display: flex;
		flex-direction: column;
	}

	.date-header {
		padding: 24rpx 30rpx 0;

		&__inner {
			background: $card-white;
			border-radius: 60rpx;
			padding: 20rpx 28rpx;
			display: inline-flex;
			align-items: center;
			gap: 12rpx;
			box-shadow: $box-shadow-card;
		}

		&__text {
			font-size: 28rpx;
			font-weight: 500;
			color: #1f2f3a;
		}
	}

	.main-scroll {
		flex: 1;
		padding: 20rpx 30rpx 0;
	}

	.card-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		padding-bottom: 40rpx;
	}

	.info-card,
	.upload-card,
	.remark-card,
	.status-card {
		background: $card-white;
		border-radius: $border-radius-card;
		padding: 28rpx;
		box-shadow: $box-shadow-card;
		transition: transform 0.2s;
	}

	.hint-card {
		margin-bottom: 24rpx;
		background: #fff9e6;
		border-radius: 20rpx;
		border-left: 8rpx solid #ff9f43;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

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

	.info-card__title,
	.upload-card__title,
	.remark-card__title {
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

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 16rpx 0;

		&:first-of-type {
			padding-top: 0;
		}

		&__label {
			font-size: 28rpx;
			color: #6c7a8a;
			width: 160rpx;
		}

		&__value {
			flex: 1;
			font-size: 28rpx;
			color: #1f2f3a;
			font-weight: 500;
			word-break: break-all;
			text-align: right;
		}
	}

	.upload-card__required {
		font-size: 24rpx;
		color: $danger-red;
		margin-left: auto;
	}

	.upload-card__area {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 0;
	}

	.upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 280rpx;
		background: #f8f9fa;
		border: 2rpx dashed #dcdfe6;
		border-radius: 16rpx;
		gap: 12rpx;

		&__text {
			font-size: 30rpx;
			color: #2979ff;
			font-weight: 500;
		}

		&__sub {
			font-size: 24rpx;
			color: #99a9bf;
		}

		&:active {
			background: #eef2f6;
		}
	}

	.upload-preview {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;

		&__img {
			width: 400rpx;
			height: 400rpx;
			border-radius: 16rpx;
			background: #f5f7fa;
		}

		&__delete {
			position: absolute;
			top: -12rpx;
			right: calc(50% - 200rpx - 12rpx);
			width: 48rpx;
			height: 48rpx;
			background: $danger-red;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4rpx 12rpx rgba(244, 67, 54, 0.3);
			z-index: 2;
		}

		&__reupload {
			font-size: 26rpx;
			color: $theme-color;
			padding: 8rpx 24rpx;
			background: rgba(45, 140, 255, 0.08);
			border-radius: 30rpx;
		}
	}

	.remark-card__input {
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

	.remark-card__placeholder {
		color: #99a9bf;
		font-size: 28rpx;
	}

	.status-card {
		display: flex;
		align-items: center;
		gap: 20rpx;
		background: #ffffff;
		border-left: 8rpx solid;

		&:has(.text-success) {
			border-left-color: $success-green;
		}

		&:has(.text-danger) {
			border-left-color: $danger-red;
		}
	}

	.status-card__icon {
		flex-shrink: 0;
	}

	.status-card__text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.status-card__main {
		font-size: 28rpx;
		font-weight: 500;
	}

	.status-card__type {
		font-size: 24rpx;
		color: #6c7a8a;
	}

	.text-success {
		color: $success-green;
	}

	.text-danger {
		color: $danger-red;
	}

	.clockin-action {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 20rpx;
	}

	.clockin-btn {
		width: 260rpx;
		height: 260rpx;
		border-radius: 50%;
		background: linear-gradient(145deg, #2d8cff, #1a6ad0);
		box-shadow: 0 12rpx 28rpx rgba(45, 140, 255, 0.35);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		cursor: pointer;

		&--outrange {
			background: linear-gradient(145deg, #ff9800, #f57c00);
			box-shadow: 0 12rpx 28rpx rgba(255, 152, 0, 0.4);
		}

		&--disabled {
			opacity: 0.7;
			transform: scale(0.96);
			pointer-events: none;
		}

		&:active {
			transform: scale(0.94);
		}
	}

	.clockin-btn__ring {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #ffffff;
	}

	.clockin-btn__time {
		font-size: 56rpx;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: 2rpx;
	}

	.clockin-btn__text {
		font-size: 32rpx;
		font-weight: 600;
		margin-top: 8rpx;
	}

	.clockin-action__hint {
		margin-top: 20rpx;
		font-size: 26rpx;
		color: #99a9bf;
	}

	.bottom-placeholder {
		height: calc(40rpx + env(safe-area-inset-bottom));
	}
</style>