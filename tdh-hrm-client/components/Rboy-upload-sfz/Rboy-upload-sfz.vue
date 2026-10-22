<template>
	<div>
		<view class="Rboy-box">
			<view class="Rboy-obverse">
				<image class="obverseimg" :src="obverseUrl ? obverseUrl : obverse" @click="obverse_btn" mode="widthFix">
				</image>
				<!-- ===== 改动：del 用 u-icon ===== -->
				<view class="del_btn" v-if="obverseUrl" @click.stop="del_btn('obverse')">
					<u-icon name="close" color="#ffffff" size="26"></u-icon>
				</view>
				<view class="bottom">
					<text>身份证正面照</text>
				</view>
			</view>
			<view class="Rboy-reverse">
				<image class="reverseimg" :src="reverseUrl ? reverseUrl : reverse" @click="reverse_btn" mode="widthFix">
				</image>
				<!-- ===== 改动：del 用 u-icon ===== -->
				<view class="del_btn" v-if="reverseUrl" @click.stop="del_btn('reverse')">
					<u-icon name="close" color="#ffffff" size="26"></u-icon>
				</view>
				<view class="bottom">
					<text>身份证反面照</text>
				</view>
			</view>
		</view>
	</div>
</template>

<script>
	import obverse from "./images/idcard-front.png";
	import reverse from "./images/idcard-back.png";

	export default {
		name: "Rboy-upload-sfz",
		props: {
			// 正面
			obverseUrl: {
				type: String,
				default: ""
			},
			// 反面
			reverseUrl: {
				type: String,
				default: ""
			},
			// album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
			sourceType: {
				type: Array || Object,
				default: () => {
					return ['album', 'camera']
				}
			}
		},
		data() {
			return {
				obverse,
				reverse
				// ===== 改动：删掉 del 字段，不再需要 base64 =====
			}
		},
		created() {

		},
		methods: {
			obverse_btn() {
				if (this.obverseUrl) {
					// 预览
					this.previewImage(this.obverseUrl)
				} else {
					// 上传
					this.select_change("obverse")
				}
			},
			reverse_btn() {
				if (this.reverseUrl) {
					// 预览
					this.previewImage(this.reverseUrl)
				} else {
					// 上传
					this.select_change("reverse")
				}
			},
			// 上传
			select_change(name) {
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: this.sourceType, // 从相册选择
					success: (res) => {
						this.$emit("selectChange", {
							msg: `${name}Image:ok`,
							name,
							tempFilePath: res.tempFilePaths[0],
							tempFile: res.tempFiles[0]
						})
					}
				});
			},
			// 预览
			previewImage(current = 0) {
				uni.previewImage({
					current,
					urls: [this.obverseUrl, this.reverseUrl],
				});
			},
			// 删除
			del_btn(name) {
				console.log(name)
				this.$emit("del", {
					name,
				})
			}
		}
	}
</script>

<style scoped lang="less">
	@imgWidth: 100%;
	@imgheight: 250rpx;
	@boxheight: 310rpx;

	.Rboy-box {
		display: flex;
		// justify-content: space-between;
		align-items: center;

		.Rboy-obverse {
			border-radius: 10rpx;
			width: @imgWidth;
			height: @boxheight;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			position: relative;

			.obverseimg {
				width: @imgWidth;
				height: @imgheight;
			}

			.bottom {
				text-align: center;
				height: calc(@boxheight - @imgheight);
				background-color: #B7D7FF;
				color: #3B5FD2;
				font-size: 28rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			/* ===== 改动：del_btn 改成 flex 容器，居中 u-icon ===== */
			.del_btn {
				position: absolute;
				top: 5rpx;
				right: 5rpx;
				width: 44rpx;
				height: 44rpx;
				border-radius: 50%;
				z-index: 20;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: rgba(0, 0, 0, 0.7);
			}
		}

		.Rboy-reverse {
			border-radius: 10rpx;
			width: @imgWidth;
			height: @boxheight;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			position: relative;

			.reverseimg {
				width: @imgWidth;
				height: @imgheight;
			}

			.bottom {
				text-align: center;
				height: calc(@boxheight - @imgheight);
				background-color: #B7D7FF;
				color: #3B5FD2;
				font-size: 28rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			/* ===== 改动：del_btn 改成 flex 容器，居中 u-icon ===== */
			.del_btn {
				position: absolute;
				top: 5rpx;
				right: 5rpx;
				width: 44rpx;
				height: 44rpx;
				border-radius: 50%;
				z-index: 20;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: rgba(0, 0, 0, 0.7);
			}
		}
	}
</style>