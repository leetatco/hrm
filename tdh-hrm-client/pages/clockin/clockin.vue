<template>
	<view class="clockin-page">
		<!-- 顶部日期卡片 -->
		<view class="date-header">
			<view class="date-header__inner">
				<u-icon name="calendar" size="36" color="#2d8cff"></u-icon>
				<text class="date-header__text">{{ today }}</text>
			</view>
		</view>

		<!-- 主内容区（可滚动） -->
		<scroll-view scroll-y class="main-scroll" enhanced :show-scrollbar="false">
			<!-- Wi-Fi & 定位提示卡片 -->
			<view class="hint-card" v-if="!is_range">
				<view class="hint-card__inner">
					<u-icon name="info-circle-fill" size="32" color="#ff9f43"></u-icon>
					<text class="hint-card__text">打卡前请确保 Wi-Fi 和手机定位已开启</text>
				</view>
			</view>
			<view class="card-list">
				<!-- Wi-Fi 信息卡片 -->
				<view class="info-card">
					<view class="info-card__title">
						<u-icon name="wifi" size="32" color="#2d8cff"></u-icon>
						<text>网络信息</text>
					</view>
					<view class="info-row">
						<text class="info-row__label">Wi-Fi名称</text>
						<text class="info-row__value">{{ formData.ssid || '未设置' }}</text>
					</view>
					<view class="info-row">
						<text class="info-row__label">Wi-Fi地址</text>
						<text class="info-row__value">{{ formData.bssid || '未设置' }}</text>
					</view>
					<view class="info-row">
						<text class="info-row__label">当前连接</text>
						<text class="info-row__value">{{ bssid_current || '未连接' }}</text>
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
						<uni-file-picker v-model="avatarFileList" :auto-upload="true" :sourceType="sourceType"
							:limit="1" file-mediatype="image" @success="onAvatarSuccess" @delete="onAvatarRemove"
							@fail="onFileUploadFail" :dir="avatarDir">
							<view class="custom-upload-btn">
								<u-icon name="camera" size="28" color="#2979ff" />
								<text class="btn-text">点击拍照</text>
							</view>
						</uni-file-picker>
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
						<text class="status-card__type">打卡类型：{{ formData.type }}</text>
					</view>
				</view>

				<!-- 打卡按钮区域 -->
				<view class="clockin-action">
					<view class="clockin-btn" @click="submit" :class="{
							'clockin-btn--disabled': is_submit,
							'clockin-btn--outrange': !is_range
						}">
						<view class="clockin-btn__ring">
							<view class="clockin-btn__time">{{ time }}</view>
							<view class="clockin-btn__text">打卡</view>
						</view>
					</view>
					<text class="clockin-action__hint" v-if="is_submit">正在提交，请勿重复点击</text>
				</view>

				<!-- 底部占位（安全区） -->
				<view class="bottom-placeholder"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				sourceType: ['camera'],
				formData: {
					employee_id: "",
					bssid: "",
					type: "",
					img: "",
					clockintime: "",
					remark: "",
				},
				is_submit: false,
				time: "00:00",
				bssidKeys: new Set(),
				bssidMap: new Map(), // 修正变量名
				bssid_current: "", // 当前Wi-Fi MAC地址	
				ssid_current: "", // 当前Wi-Fi名称				
				is_range: true, // 是否在范围内
				is_range_content: "你已在打卡范围内，将按公司卡记录！",
				today: "",
				avatarDir: '/clockin',
				avatarFileList: []
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
			//========== 头像上传相关（uni-file-picker）==========
			onAvatarSuccess(e) {
				const {
					tempFiles
				} = e;
				if (tempFiles && tempFiles.length > 0) {
					const file = tempFiles[0];
					const url = file.url || file.path;
					this.formData.img = url;
					this.avatarFileList = [{
						url: url,
						name: file.name || 'avatar.jpg'
					}];
				}
			},
			onAvatarRemove(e) {
				const fileUrl = e.tempFile?.url;
				if (fileUrl) {
					vk.callFunction({
						url: 'common/pub/deleteFile/index',
						data: {
							fileList: [fileUrl]
						}
					});
				}
				this.formData.img = '';
				this.avatarFileList = [];
			},

			onFileUploadFail(err) {
				uni.showToast({
					title: '上传失败',
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
			// 加载打卡点配置
			async loadData(callback) {
				const res = await vk.callFunction({
					url: 'admin/hrm/clockin/sys/setting/getList',
					title: '加载中...',
					data: {
						pageSize: -1,
						pageIndex: 1
					}
				});
				if (res.code === 0) {
					if (res.total === 0) {
						vk.alert("请先设定打卡点");
						return;
					}
					this.ssidKeys = new Set(res.rows.map(item => item.ssid));
					this.bssidKeys = new Set(res.rows.map(item => item.bssid));

					res.rows.forEach(item => {
						this.bssidMap.set(item.bssid, item);
					});
					this.getCurrentAddress();
				}
				if (typeof callback === "function") callback();
			},
			// 下拉刷新
			onPullDownRefresh() {
				this.loadData(() => {
					uni.stopPullDownRefresh();
				});
			},
			// 图片上传成功
			imgUpload(e) {
				const {
					tempFiles
				} = e;
				if (tempFiles?.length) {
					this.imgFiles = tempFiles[0];
					this.formData.img = this.imgFiles.url || this.imgFiles.path;
					vk.alert('上传成功，' + this.formData.img);
				}
			},
			// 图片删除
			async imgDelete(e) {
				await vk.callFunction({
					url: 'common/sys/deleteFile/index',
					title: '删除中...',
					data: {
						fileList: [e.tempFile.fileID]
					}
				});
				this.imgFiles = [];
				this.formData.img = "";
			},
			// 获取当前连接的Wi-Fi
			getConnectedWifi() {
				uni.startWifi({
					success: () => {
						uni.getConnectedWifi({
							success: res => {
								this.bssid_current = res.wifi.BSSID || '无';
								this.ssid_current = res.wifi.SSID;
							},
							fail: err => {
								console.error('获取当前Wi-Fi失败', err);
								this.bssid_current = '获取失败';
							}
						});
					},
					fail: (err) => {
						console.error('启动Wi-Fi模块失败', err);
						this.bssid_current = '无法获取';
					}
				});
			},
			// 判断打卡范围
			getCurrentAddress() {
				if (this.bssidKeys.has(this.bssid_current)) {
					this.is_range = true;
					this.formData.type = "公司卡";
					this.is_range_content = "✅ 您已在打卡范围内，将按公司卡记录";
					this.formData.ssid = this.ssid_current;
					this.formData.bssid = this.bssid_current;
				} else {
					this.is_range = false;
					this.formData.type = "出差卡";
					this.is_range_content = "⚠️ 您已超出打卡范围，将按出差卡记录（需拍照）";
					this.formData.ssid = "无法获取";
					this.formData.bssid = "无法获取";
				}
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
				if (!this.formData.bssid) return vk.alert("请先设定打卡点");
				if (!this.is_range && !this.formData.img) return vk.alert("出差打卡必须拍照上传");
				if (this.is_submit) return;

				this.is_submit = true;
				// 补充打卡时间
				this.formData.clockintime = vk.pubfn.timeFormat(new Date(), 'yyyy-MM-dd hh:mm:ss');

				this.formData.img = this.avatarFileList.length ? this.avatarFileList[0].url : '';

				vk.callFunction({
					url: 'admin/hrm/clockin/sys/add',
					title: '提交中...',
					data: this.formData,
				}).then(res => {
					this.is_submit = false;
					if (res.code === 0) {
						this.toMain();
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

	/* 顶部日期 */
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

	/* 滚动区域 */
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

	/* 公用卡片 */
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

	/* 提示卡片 */
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

	/* 上传卡片 */
	.upload-card__required {
		font-size: 24rpx;
		color: $danger-red;
		margin-left: auto;
	}

	.upload-card__area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;

		::v-deep .uni-file-picker {
			width: 100%;

			.uni-file-picker__files {
				justify-content: center;
			}
		}
	}

	.upload-card__tip {
		font-size: 24rpx;
		color: $danger-red;
		background: rgba(244, 67, 54, 0.08);
		padding: 8rpx 20rpx;
		border-radius: 30rpx;
	}

	/* 备注卡片 */
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

	/* 状态卡片 */
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

	/* 打卡按钮区域 */
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

	/* 底部占位 */
	.bottom-placeholder {
		height: calc(40rpx + env(safe-area-inset-bottom));
	}
</style>