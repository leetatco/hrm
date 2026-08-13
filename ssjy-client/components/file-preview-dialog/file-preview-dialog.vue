<template>
	<!-- 使用 u-modal 替代 vk-data-dialog -->
	<u-modal v-model="show" :title="title" :show-confirm-button="false" :show-cancel-button="false" width="800"
		:zoom="false" :mask-close-able="false" :border-radius="16">
		<view class="file-preview-dialog">
			<view class="preview-content" v-if="fileData.url">
				<!-- 图片预览 -->
				<view v-if="isImageType" class="image-preview">
					<u-image :src="fileData.url" mode="widthFix" width="100%" height="500rpx" :lazy-load="true"
						@click="previewImage">
						<template v-slot:loading>
							<view class="image-loading">
								<u-loading mode="circle" color="#2979ff" size="40"></u-loading>
								<text class="loading-text">图片加载中...</text>
							</view>
						</template>
						<template v-slot:error>
							<view class="image-error">
								<u-icon name="error-circle" size="60" color="#fa3534"></u-icon>
								<text class="error-text">图片加载失败</text>
							</view>
						</template>
					</u-image>

					<view class="image-info">
						<text class="info-text">{{ fileData.name }}</text>
						<text class="info-size" v-if="fileData.size">{{ formatFileSize(fileData.size) }}</text>
					</view>
				</view>

				<!-- PDF预览 -->
				<view v-else-if="isPdfType" class="pdf-preview">
					<view class="pdf-container">
						<view class="pdf-header">
							<u-icon name="file-text" size="40" color="#fa3534"></u-icon>
							<text class="pdf-title">{{ fileData.name }}</text>
						</view>

						<view class="pdf-content">
							<!-- H5环境下使用iframe预览PDF -->
							<!-- #ifdef H5 -->
							<iframe :src="fileData.url" width="100%" height="500px" frameborder="0"></iframe>
							<!-- #endif -->

							<!-- 非H5环境显示PDF预览提示 -->
							<!-- #ifndef H5 -->
							<view class="pdf-preview-tip">
								<u-icon name="info-circle" size="60" color="#2979ff"></u-icon>
								<text class="tip-text">当前环境不支持PDF在线预览</text>
								<text class="tip-desc">请在电脑浏览器中打开或直接下载文件</text>
							</view>
							<!-- #endif -->
						</view>

						<view class="pdf-info">
							<view class="info-item">
								<u-icon name="file-text" size="24" color="#666"></u-icon>
								<text class="info-label">文件类型：</text>
								<text class="info-value">PDF文档</text>
							</view>
							<view class="info-item" v-if="fileData.size">
								<u-icon name="info-circle" size="24" color="#666"></u-icon>
								<text class="info-label">文件大小：</text>
								<text class="info-value">{{ formatFileSize(fileData.size) }}</text>
							</view>
							<view class="info-item" v-if="fileData.createTime">
								<u-icon name="clock" size="24" color="#666"></u-icon>
								<text class="info-label">创建时间：</text>
								<text class="info-value">{{ formatDate(fileData.createTime) }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- Office文档预览 -->
				<view v-else-if="isOfficeType" class="office-preview">
					<view class="office-container">
						<view class="office-header">
							<u-icon name="file-text" size="40" color="#2979ff"></u-icon>
							<text class="office-title">{{ fileData.name }}</text>
						</view>

						<view class="office-content">
							<view class="office-icon">
								<u-icon :name="getOfficeIcon" size="100" color="#2979ff"></u-icon>
							</view>

							<view class="office-tip">
								<text class="tip-text">Office文档支持在线预览</text>
								<text class="tip-desc">您可以通过以下方式查看文档内容</text>
							</view>

							<view class="office-actions">
								<u-button type="primary" @click="handlePreviewOnline"
									:custom-style="{ height: '70rpx', fontSize: '28rpx', marginBottom: '20rpx' }">
									<u-icon name="eye" size="28" style="margin-right: 10rpx;"></u-icon>
									在线预览
								</u-button>
								<u-button type="success" @click="handleDownload"
									:custom-style="{ height: '70rpx', fontSize: '28rpx' }">
									<u-icon name="download" size="28" style="margin-right: 10rpx;"></u-icon>
									下载文件
								</u-button>
							</view>
						</view>

						<view class="office-info">
							<view class="info-item">
								<u-icon name="file-text" size="24" color="#666"></u-icon>
								<text class="info-label">文件类型：</text>
								<text class="info-value">{{ getOfficeTypeName }}</text>
							</view>
							<view class="info-item" v-if="fileData.size">
								<u-icon name="info-circle" size="24" color="#666"></u-icon>
								<text class="info-label">文件大小：</text>
								<text class="info-value">{{ formatFileSize(fileData.size) }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 其他文件类型 -->
				<view v-else class="unsupported-preview">
					<view class="unsupported-container">
						<view class="unsupported-icon">
							<u-icon name="file-text" size="100" color="#909399"></u-icon>
						</view>

						<view class="unsupported-info">
							<text class="info-title">不支持在线预览</text>
							<text class="info-desc">该文件类型暂不支持在线预览功能</text>
							<text class="info-suggestion">建议您下载文件后使用相应软件打开</text>
						</view>

						<view class="file-info">
							<view class="info-item">
								<u-icon name="file-text" size="24" color="#666"></u-icon>
								<text class="info-label">文件名：</text>
								<text class="info-value">{{ fileData.name }}</text>
							</view>
							<view class="info-item" v-if="fileData.size">
								<u-icon name="info-circle" size="24" color="#666"></u-icon>
								<text class="info-label">文件大小：</text>
								<text class="info-value">{{ formatFileSize(fileData.size) }}</text>
							</view>
							<view class="info-item" v-if="fileType">
								<u-icon name="tag" size="24" color="#666"></u-icon>
								<text class="info-label">文件类型：</text>
								<text class="info-value">{{ fileType }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 文件加载失败 -->
			<view v-else class="load-failed">
				<u-empty mode="error" icon="/static/empty-error.png">
					<text slot="text">文件加载失败</text>
					<text slot="result">请检查文件地址是否正确</text>
				</u-empty>
			</view>
			
			<!-- 底部操作按钮 - 移动到模态框内容内部 -->
			<view class="dialog-footer">
				<u-button type="default" @click="handleClose" :custom-style="{ 
					width: '200rpx', 
					height: '70rpx', 
					marginRight: '20rpx' 
				}">
					关闭
				</u-button>
				<u-button type="primary" @click="handleDownload" :custom-style="{ 
					width: '200rpx', 
					height: '70rpx' 
				}">
					<u-icon name="download" size="28" style="margin-right: 10rpx;"></u-icon>
					下载文件
				</u-button>
			</view>
		</view>
	</u-modal>
</template>

<script>
	export default {
		name: 'FilePreviewDialog',
		props: {
			value: {
				type: Boolean,
				default: false
			},
			fileData: {
				type: Object,
				default: () => ({
					url: '',
					name: '',
					type: '',
					size: 0,
					createTime: null
				})
			}
		},
		data() {
			return {
				// 支持的图片格式
				imageTypes: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
				// 支持的Office文档格式
				officeTypes: [{
						ext: 'doc',
						name: 'Word文档',
						icon: 'file-word'
					},
					{
						ext: 'docx',
						name: 'Word文档',
						icon: 'file-word'
					},
					{
						ext: 'xls',
						name: 'Excel文档',
						icon: 'file-excel'
					},
					{
						ext: 'xlsx',
						name: 'Excel文档',
						icon: 'file-excel'
					},
					{
						ext: 'ppt',
						name: 'PPT文档',
						icon: 'file-ppt'
					},
					{
						ext: 'pptx',
						name: 'PPT文档',
						icon: 'file-ppt'
					}
				]
			};
		},
		computed: {
			show: {
				get() {
					return this.value;
				},
				set(val) {
					this.$emit('input', val);
				}
			},
			title() {
				return `文件预览 - ${this.fileData.name || '文件'}`;
			},
			isImageType() {
				if (!this.fileData.url) return false;
				const extension = this.getFileExtension(this.fileData.url);
				return this.imageTypes.includes(extension.toLowerCase());
			},
			isPdfType() {
				if (!this.fileData.url) return false;
				const extension = this.getFileExtension(this.fileData.url);
				return extension.toLowerCase() === 'pdf';
			},
			isOfficeType() {
				if (!this.fileData.url) return false;
				const extension = this.getFileExtension(this.fileData.url);
				return this.officeTypes.some(item => item.ext === extension.toLowerCase());
			},
			fileType() {
				if (!this.fileData.url) return '';
				const extension = this.getFileExtension(this.fileData.url);
				return extension ? extension.toUpperCase() : '未知类型';
			},
			getOfficeIcon() {
				if (!this.fileData.url) return 'file-text';
				const extension = this.getFileExtension(this.fileData.url);
				const officeType = this.officeTypes.find(item => item.ext === extension.toLowerCase());
				return officeType ? officeType.icon : 'file-text';
			},
			getOfficeTypeName() {
				if (!this.fileData.url) return 'Office文档';
				const extension = this.getFileExtension(this.fileData.url);
				const officeType = this.officeTypes.find(item => item.ext === extension.toLowerCase());
				return officeType ? officeType.name : 'Office文档';
			}
		},
		methods: {
			// 获取文件扩展名
			getFileExtension(url) {
				if (!url) return '';
				// 移除查询参数和锚点
				const cleanUrl = url.split(/[?#]/)[0];
				const filename = cleanUrl.split('/').pop() || '';
				return filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
			},
			handleDownload() {
				if (!this.fileData.url) {
					uni.showToast({
						title: '无效的文件地址',
						icon: 'none'
					});
					return;
				}

				// 触发父组件的下载事件
				this.$emit('download', this.fileData);

				// 关闭预览窗口
				this.handleClose();
			},

			// 预览图片
			previewImage() {
				if (this.isImageType) {
					uni.previewImage({
						urls: [this.fileData.url],
						current: 0
					});
				}
			},

			// 在线预览Office文档
			handlePreviewOnline() {
				if (!this.isOfficeType || !this.fileData.url) return;

				// 使用腾讯文档在线预览 (兼容性更好)
				const onlineUrl = `https://docs.qq.com/doc/${encodeURIComponent(this.fileData.url)}`;

				// #ifdef H5
				window.open(onlineUrl, '_blank');
				// #endif

				// #ifndef H5
				uni.setClipboardData({
					data: onlineUrl,
					success: () => {
						uni.showToast({
							title: '预览链接已复制，请在浏览器中打开',
							icon: 'success',
							duration: 3000
						});
					}
				});
				// #endif
			},

			// 下载文件
			// handleDownload() {
			// 	this.$emit('download', this.fileData);
			// },

			// 关闭对话框
			handleClose() {				
				this.$emit('filePreviewClose', false);
			},

			// 格式化文件大小
			formatFileSize(bytes) {
				if (!bytes || bytes === 0) return '0 B';
				const k = 1024;
				const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
				const i = Math.floor(Math.log(bytes) / Math.log(k));
				return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
			},

			// 格式化日期
			formatDate(timestamp) {
				if (!timestamp) return '-';
				const date = new Date(timestamp);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				return `${year}-${month}-${day} ${hours}:${minutes}`;
			}
		}
	};
</script>

<style lang="scss" scoped>
	/* 添加文件名溢出处理 */
	.file-name {
		flex: 1;
		min-width: 0;
		/* 关键：允许内容收缩 */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-right: 16rpx;
	}

	.file-preview-dialog {
		padding: 20rpx;
		max-height: 80vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.preview-content {
		background-color: #ffffff;
		border-radius: 12rpx;
		overflow: hidden;
		flex: 1;
	}

	/* 图片预览样式 */
	.image-preview {
		.image-loading,
		.image-error {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 500rpx;
			background-color: #f8f9fa;

			.loading-text,
			.error-text {
				font-size: 28rpx;
				color: #666666;
				margin-top: 20rpx;
			}
		}

		.image-info {
			padding: 24rpx 30rpx;
			background-color: #f8f9fa;
			border-top: 1px solid #e4e7ed;

			.info-text {
				display: block;
				font-size: 28rpx;
				color: #333333;
				font-weight: 500;
				margin-bottom: 8rpx;
				word-break: break-all;
			}

			.info-size {
				font-size: 24rpx;
				color: #999999;
			}
		}
	}

	/* PDF预览样式 */
	.pdf-preview {
		.pdf-container {
			.pdf-header {
				display: flex;
				align-items: center;
				padding: 24rpx 30rpx;
				background-color: #f8f9fa;
				border-bottom: 1px solid #e4e7ed;

				.pdf-title {
					font-size: 30rpx;
					color: #333333;
					font-weight: bold;
					margin-left: 16rpx;
					flex: 1;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}

			.pdf-content {
				height: 600rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: #f0f2f5;

				.pdf-preview-tip {
					display: flex;
					flex-direction: column;
					align-items: center;

					.tip-text {
						font-size: 32rpx;
						color: #333333;
						font-weight: 500;
						margin-top: 24rpx;
						margin-bottom: 12rpx;
					}

					.tip-desc {
						font-size: 26rpx;
						color: #666666;
					}
				}

				::v-deep iframe {
					width: 100%;
					height: 100%;
					border: none;
				}
			}

			.pdf-info {
				padding: 24rpx 30rpx;
				background-color: #f8f9fa;
				border-top: 1px solid #e4e7ed;

				.info-item {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;

					&:last-child {
						margin-bottom: 0;
					}

					.info-label {
						font-size: 26rpx;
						color: #666666;
						margin-left: 12rpx;
						margin-right: 8rpx;
					}

					.info-value {
						font-size: 26rpx;
						color: #333333;
					}
				}
			}
		}
	}

	/* Office文档预览样式 */
	.office-preview {
		.office-container {
			.office-header {
				display: flex;
				align-items: center;
				padding: 24rpx 30rpx;
				background-color: #f8f9fa;
				border-bottom: 1px solid #e4e7ed;

				.office-title {
					font-size: 30rpx;
					color: #333333;
					font-weight: bold;
					margin-left: 16rpx;
					flex: 1;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}

			.office-content {
				padding: 60rpx 30rpx;
				text-align: center;
				background-color: #f8f9fa;

				.office-icon {
					margin-bottom: 40rpx;
				}

				.office-tip {
					margin-bottom: 40rpx;

					.tip-text {
						display: block;
						font-size: 32rpx;
						color: #333333;
						font-weight: 500;
						margin-bottom: 12rpx;
					}

					.tip-desc {
						font-size: 26rpx;
						color: #666666;
					}
				}

				.office-actions {
					display: flex;
					flex-direction: column;
					align-items: center;
				}
			}

			.office-info {
				padding: 24rpx 30rpx;
				background-color: #ffffff;
				border-top: 1px solid #e4e7ed;

				.info-item {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;

					&:last-child {
						margin-bottom: 0;
					}

					.info-label {
						font-size: 26rpx;
						color: #666666;
						margin-left: 12rpx;
						margin-right: 8rpx;
					}

					.info-value {
						font-size: 26rpx;
						color: #333333;
					}
				}
			}
		}
	}

	/* 不支持预览样式 */
	.unsupported-preview {
		.unsupported-container {
			.unsupported-icon {
				display: flex;
				justify-content: center;
				padding: 60rpx 30rpx 40rpx;
				background-color: #f8f9fa;
			}

			.unsupported-info {
				padding: 0 30rpx 40rpx;
				text-align: center;
				background-color: #f8f9fa;

				.info-title {
					display: block;
					font-size: 32rpx;
					color: #333333;
					font-weight: 500;
					margin-bottom: 12rpx;
				}

				.info-desc {
					display: block;
					font-size: 26rpx;
					color: #666666;
					margin-bottom: 8rpx;
				}

				.info-suggestion {
					font-size: 24rpx;
					color: #999999;
				}
			}

			.file-info {
				padding: 24rpx 30rpx;
				background-color: #ffffff;
				border-top: 1px solid #e4e7ed;

				.info-item {
					display: flex;
					align-items: flex-start;
					margin-bottom: 16rpx;

					&:last-child {
						margin-bottom: 0;
					}

					.info-label {
						font-size: 26rpx;
						color: #666666;
						margin-left: 12rpx;
						margin-right: 8rpx;
						white-space: nowrap;
					}

					.info-value {
						font-size: 26rpx;
						color: #333333;
						word-break: break-all;
					}
				}
			}
		}
	}

	/* 加载失败样式 */
	.load-failed {
		padding: 60rpx 30rpx;
		background-color: #ffffff;
		border-radius: 12rpx;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;

		::v-deep .u-empty {
			margin: 0;
		}
	}

	/* 底部操作按钮样式 */
	.dialog-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30rpx 0 0;
		background-color: #ffffff;
		border-top: 1px solid #e4e7ed;
		margin-top: 20rpx;

		::v-deep .u-button {
			font-size: 28rpx;
			border-radius: 8rpx;

			&--default {
				background-color: #f8f9fa;
				color: #333333;
			}

			&--primary {
				background-color: #2979ff;
				color: #ffffff;
			}
		}
	}

	/* 响应式设计 */
	@media (max-width: 750px) {
		.file-preview-dialog {
			padding: 10rpx;
		}

		.image-preview .image-info,
		.pdf-preview .pdf-container .pdf-header,
		.pdf-preview .pdf-container .pdf-info,
		.office-preview .office-container .office-header,
		.office-preview .office-container .office-info,
		.unsupported-preview .unsupported-container .file-info {
			padding: 20rpx;
		}

		.pdf-preview .pdf-container .pdf-content {
			height: 500rpx;
		}

		.dialog-footer {
			flex-direction: column;

			::v-deep .u-button {
				width: 100% !important;
				margin-bottom: 20rpx;
				margin-right: 0 !important;

				&:last-child {
					margin-bottom: 0;
				}
			}
		}
	}

	/* 滚动条样式 */
	.file-preview-dialog::-webkit-scrollbar {
		width: 6rpx;
	}

	.file-preview-dialog::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3rpx;
	}

	.file-preview-dialog::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 3rpx;
	}

	.file-preview-dialog::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>