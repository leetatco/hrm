<template>
	<view class="file-uploader">
		<uni-file-picker 
			v-model="innerFileList"
			:file-mediatype="acceptTypes"
			:auto-upload="true" 
			:limit="limit"
			:action="action" 
			:response-format="responseFormat"
			@success="handleSuccess"
			@delete="handleDelete"
			@fail="handleFail"
		>
			<view class="custom-upload-btn">
				<u-icon name="plus" size="28" color="#2979ff" />
				<text class="btn-text">选择文件</text>
			</view>
		</uni-file-picker>

		<view class="file-list" v-if="innerFileList.length">
			<view class="file-item" v-for="(file, idx) in innerFileList" :key="file.uuid || idx">
				<view class="file-info" @click="previewFile(file)">
					<u-icon name="file-text" size="30" color="#2979ff" />
					<text class="file-name">{{ file.displayName || file.name || getFileNameFromUrl(file.url) }}</text>
				</view>
			</view>
		</view>

		<file-preview-dialog 
			:value="previewShow" 
			:file-data="previewData"
			@filePreviewClose="previewShow=false" 
			@download-file="downloadFile" 
		/>
	</view>
</template>

<script>
import FilePreviewDialog from '@/components/file-preview-dialog/file-preview-dialog.vue';

export default {
	name: 'FileUploader',
	components: { FilePreviewDialog },
	props: {
		value: { type: Array, default: () => [] },
		action: { type: String, default: vk.uploadUrl },
		limit: { type: Number, default: 9 },
		acceptTypes: { type: String, default: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.png' }
	},
	data() {
		return {
			innerFileList: [],
			previewShow: false,
			previewData: { url: '', name: '', type: '', size: 0 }
		};
	},
	watch: {
		value: {
			immediate: true,
			deep: true,
			handler(val) {
				// 将外部传入的数组（可能是字符串数组或对象数组）转换为内部列表格式
				let newList = [];
				if (val && Array.isArray(val)) {
					newList = val.map((item, index) => {
						let url = typeof item === 'string' ? item : item.url;
						let name = typeof item === 'string' ? this.getFileNameFromUrl(url) : (item.name || this.getFileNameFromUrl(url));
						return {
							url: url,
							name: name,
							displayName: this.beautifyFileName(name),
							uuid: item.uuid || index
						};
					});
				}
				// 避免重复更新
				if (JSON.stringify(this.innerFileList.map(f => f.url)) !== JSON.stringify(newList.map(f => f.url))) {
					this.innerFileList = newList;
				}
			}
		}
	},
	methods: {
		responseFormat(res) {
			if (res && res.url) return { url: res.url };
			return res;
		},
		handleSuccess(e) {
			const { tempFiles } = e;
			if (tempFiles) {
				tempFiles.forEach(tempFile => {
					const idx = this.innerFileList.findIndex(f => f.uuid === tempFile.uuid);
					if (idx !== -1) {
						this.innerFileList[idx].url = tempFile.url || tempFile.path;
						const rawName = tempFile.name || '';
						this.innerFileList[idx].name = this.beautifyFileName(rawName);
						this.innerFileList[idx].displayName = this.beautifyFileName(rawName);
					}
				});
			}
		},
		handleDelete(e) {
			const file = this.innerFileList[e.index];
			if (file?.url) {
				vk.callFunction({
					url: 'common/pub/deleteFile/index',
					data: { fileList: [file.url] }
				});
			}
			this.innerFileList.splice(e.index, 1);
			// 通知父组件更新
			this.$emit('input', this.innerFileList.map(f => f.url));
			this.$emit('change', this.innerFileList.map(f => f.url));
		},
		handleFail(err) {
			uni.showToast({ title: '上传失败', icon: 'none' });
			this.$emit('error', err);
		},
		previewFile(file) {
			if (!file?.url) return;
			this.previewData = {
				url: file.url,
				name: file.name || this.getFileNameFromUrl(file.url),
				type: this.getFileType(file),
				size: file.size || 0
			};
			this.previewShow = true;
		},
		downloadFile(file) {
			if (!file?.url) return;
			uni.downloadFile({
				url: file.url,
				success: (res) => {
					if (res.statusCode === 200) {
						uni.saveFile({
							tempFilePath: res.tempFilePath,
							success: () => uni.showToast({ title: '下载成功', icon: 'success' }),
							fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
						});
					}
				},
				fail: () => uni.showToast({ title: '下载失败', icon: 'none' })
			});
		},
		getFileNameFromUrl(url) {
			if (!url) return '未知文件';
			const clean = url.split(/[?#]/)[0];
			let fileName = clean.split('/').pop() || '未知文件';
			return this.beautifyFileName(fileName);
		},
		beautifyFileName(fileName) {
			if (!fileName) return '未知文件';
			const lastDotIndex = fileName.lastIndexOf('.');
			let nameWithoutExt = fileName;
			let ext = '';
			if (lastDotIndex > 0) {
				nameWithoutExt = fileName.substring(0, lastDotIndex);
				ext = fileName.substring(lastDotIndex);
			}
			if (nameWithoutExt.length > 20) {
				const start = nameWithoutExt.substring(0, 8);
				const end = nameWithoutExt.substring(nameWithoutExt.length - 8);
				nameWithoutExt = `${start}...${end}`;
			}
			return nameWithoutExt + ext;
		},
		getFileType(file) {
			const name = file.name || '';
			if (/\.(pdf)$/i.test(name)) return 'pdf';
			if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(name)) return 'office';
			if (/\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(name)) return 'image';
			return 'other';
		}
	}
};
</script>

<style scoped>
.file-uploader .custom-upload-btn {
	display: inline-flex;
	align-items: center;
	padding: 12rpx 24rpx;
	background: #f8f9fa;
	border: 1rpx dashed #dcdfe6;
	border-radius: 8rpx;
	margin-bottom: 20rpx;
}
.file-uploader .btn-text {
	margin-left: 8rpx;
	font-size: 28rpx;
	color: #606266;
}
.file-uploader .file-list {
	margin-top: 20rpx;
}
.file-uploader .file-item {
	display: flex;
	align-items: center;
	padding: 20rpx;
	margin-bottom: 16rpx;
	background: #f8f9fa;
	border-radius: 8rpx;
	border: 1rpx solid #e4e7ed;
}
.file-uploader .file-info {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
	overflow: hidden;
}
.file-uploader .file-name {
	flex: 1;
	min-width: 0;
	display: block;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	margin-left: 12rpx;
	font-size: 28rpx;
	color: #303133;
}
</style>