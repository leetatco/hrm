<template>
	<view class="avatar-uploader">
		<uni-file-picker 
			v-model="fileList" 
			:auto-upload="true" 
			:action="action" 
			:limit="limit" 
			file-mediatype="image" 
			:max-size="maxSize" 
			@success="handleSuccess" 
			@delete="handleDelete" 
			@fail="handleFail"
			:mode="'grid'"
		>
			<view class="custom-upload-btn">
				<u-icon name="camera" size="28" color="#2979ff" />
				<text class="btn-text">上传头像</text>
			</view>
		</uni-file-picker>
	</view>
</template>

<script>
export default {
	name: 'AvatarUploader',
	props: {
		value: { type: String, default: '' },
		action: { type: String, default: vk.uploadUrl },
		maxSize: { type: Number, default: 1 * 1024 * 1024 },
		limit: { type: Number, default: 1 }
	},
	data() {
		return { fileList: [] };
	},
	watch: {
		value: {
			immediate: true,
			handler(val) {
				// 将字符串 URL 转换为 uni-file-picker 需要的数组格式
				if (val && typeof val === 'string' && val.trim()) {
					const newList = [{ url: val, name: this.getFileName(val) }];
					// 避免重复赋值导致死循环
					if (JSON.stringify(this.fileList) !== JSON.stringify(newList)) {
						this.fileList = newList;
					}
				} else {
					this.fileList = [];
				}
			}
		}
	},
	methods: {
		getFileName(url) {
			if (!url) return 'avatar.jpg';
			const parts = url.split('/');
			return parts.pop() || 'avatar.jpg';
		},
		handleSuccess(e) {
			const { tempFiles } = e;
			if (tempFiles && tempFiles.length) {
				const file = tempFiles[0];
				const url = file.url || file.path;
				this.$emit('input', url);
				this.$emit('change', { url, file });
			}
		},
		handleDelete(e) {
			const fileUrl = e.tempFile?.url;
			if (fileUrl) {
				vk.callFunction({
					url: 'common/pub/deleteFile/index',
					data: { fileList: [fileUrl] }
				});
			}
			this.$emit('input', '');
			this.$emit('change', null);
		},
		handleFail(err) {
			uni.showToast({ title: '上传失败', icon: 'none' });
			this.$emit('error', err);
		}
	}
};
</script>

<style scoped>
.avatar-uploader .custom-upload-btn {
	display: inline-flex;
	align-items: center;
	padding: 12rpx 24rpx;
	background: #f8f9fa;
	border: 1rpx dashed #dcdfe6;
	border-radius: 8rpx;
}
.avatar-uploader .btn-text {
	margin-left: 8rpx;
	font-size: 28rpx;
	color: #606266;
}
</style>