<template>
	<view class="sign-page">
		<!-- ============ 合约预览区域 ============ -->
		<view class="detail-container" v-if="!showSignBoard">
			<scroll-view class="detail-scroll" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing"
				@refresherrefresh="onRefresh">
				<u-refresh slot="refresher" :refresher-triggered="refreshing" @refresh="onRefresh"></u-refresh>

				<view class="contract-card" v-if="contractData">
					<!-- 头部标题 -->
					<view class="card-header">
						<view class="title">合约信息</view>
						<view class="status-tag" :class="contractData.status === 1 ? 'signed' : 'unsigned'">
							{{ contractData.status === 1 ? '已签署' : '未签署' }}
						</view>
					</view>

					<view class="info-row">
						<text class="label">合约名称</text>
						<text class="value">{{ contractData.contractInfo?.contract_sign_name || '-' }}</text>
					</view>
					<view class="info-row">
						<text class="label">签订日期</text>
						<text class="value">{{ formatDate(contractData.sign_date) || '-' }}</text>
					</view>
					<view class="info-row">
						<text class="label">到期日期</text>
						<text class="value">{{ formatDate(contractData.end_date) || '-' }}</text>
					</view>

					<!-- 合约文件预览按钮 -->
					<view class="file-box" v-if="contractData.contract_sign_file">
						<view class="file-icon">📄</view>
						<view class="file-info">
							<text class="file-title">合约电子版.pdf</text>
							<text class="file-tip">点击右侧按钮预览全文</text>
						</view>
						<button class="preview-btn" size="mini" @click="previewFile">预览</button>
					</view>
				</view>

				<view v-else class="loading-detail">加载合约中...</view>

				<!-- 底部提醒 -->
				<view class="reminder" v-if="contractData">
					<text class="reminder-icon">💡</text>
					<text>请仔细阅读合约内容，确认无误后签名。签名即表示您已阅读并同意本合约全部条款，具有同等法律效力。</text>
				</view>
			</scroll-view>

			<!-- 签名按钮 -->
			<view class="btn-sign-wrapper" v-if="contractData && contractData.status !== 1">
				<button class="btn-sign" @click="openSignBoard">立即签署</button>
			</view>
			<view class="btn-sign-wrapper" v-else-if="contractData && contractData.status === 1">
				<button class="btn-sign disabled" disabled>合约已签署</button>
			</view>
		</view>

		<!-- ============ 签名板区域（保持原有样式和功能） ============ -->
		<view class="sign-board-full" v-else>
			<view class="wrapper">
				<view class="handBtn">
					<!-- #ifdef MP-WEIXIN -->
					<image @click="selectColorEvent('black','#1A1A1A')"
						:src="selectColor === 'black' ? '/static/other/color_black_selected.png' : '/static/other/color_black.png'"
						class="black-select"></image>
					<image
						:src="selectColor === 'red' ? '/static/other/color_red_selected.png' : '/static/other/color_red.png'"
						class="red-select"></image>
					<!-- #endif -->

					<!-- #ifndef MP-WEIXIN -->
					<div class="color_pic" :style="{background:lineColor}" @click="showPickerColor=true"></div>
					<!-- #endif -->

					<button @click="clear" :disabled="lastSignatureUrl" class="delBtn">清空</button>
					<button @click="previewCanvasImg" :disabled="lastSignatureUrl" class="previewBtn">预览</button>
					<button @click="undo" :disabled="lastSignatureUrl" class="undoBtn">撤销</button>
					<button @click="closeSignBoard" class="closeBtn">关闭</button>
					<button @click="submitSign" class="subBtn">确认</button>
				</view>
				<view class="handCenter">
					<canvas class="handWriting" :disable-scroll="true" @touchstart="uploadScaleStart"
						@touchmove="uploadScaleMove" @touchend="uploadScaleEnd" canvas-id="handWriting"></canvas>
				</view>
				<view class="handRight">
					<view class="handTitle">请在此签名</view>
				</view>
			</view>
			<!-- 隐藏的用于旋转导出的 Canvas -->
			<canvas type="2d" id="rotateCanvas" style="position: absolute; left: -9999px; top: -9999px;"></canvas>
			<!-- 自定义颜色选择器 (原有依赖) -->
			<pickerColor v-if="showPickerColor" :isShow="showPickerColor" :bottom="0" @callback="getPickerColor" />
		</view>

		<!-- 自定义 Toast -->
		<custom-toast ref="toast" />
	</view>
</template>

<script>
	import pickerColor from "./pickerColor.vue"
	import customToast from "@/components/custom-toast/custom-toast.vue";

	export default {
		components: {
			pickerColor,
			customToast
		},
		data() {
			return {
				_id: '',
				contractData: null,
				showSignBoard: false,
				refreshing: false,
				loading: false,
				lastSignatureUrl: '',

				// ======== 签名板原有配置及状态 ========
				showPickerColor: false,
				ctx: '',
				canvasWidth: 0,
				canvasHeight: 0,
				selectColor: 'black',
				lineColor: '#1A1A1A',
				points: [],
				historyList: [],
				currentStrokePoints: [],
				pointQueue: [],
				rafId: null,
				isDrawing: false,
				isReplaying: false,
				canAddHistory: true,
				requestAnimationFrame: null, // 兼容函数
				cancelAnimationFrame: null, // 兼容函数
				toDataURL: void 0,

				// 签名板配置参数
				minSpeed: 1.5,
				minWidth: 3,
				maxWidth: 10,
				openSmooth: true,
				maxHistoryLength: 20,
				maxWidthDiffRate: 20,
				bgColor: '',
			};
		},
		onLoad(options) {
			this._id = options._id || '';
			if (!this._id) {
				this.$refs.toast.showToast('参数错误');
				return;
			}
			this.loadDetail();
			this.ctx = uni.createCanvasContext("handWriting");

			// ======== 兼容 requestAnimationFrame / cancelAnimationFrame ========
			this.requestAnimationFrame = (fn) => {
				if (typeof requestAnimationFrame === 'function') {
					return requestAnimationFrame(fn);
				} else if (typeof uni.requestAnimationFrame === 'function') {
					return uni.requestAnimationFrame(fn);
				} else {
					return setTimeout(fn, 16);
				}
			};
			this.cancelAnimationFrame = (id) => {
				if (typeof cancelAnimationFrame === 'function') {
					cancelAnimationFrame(id);
				} else if (typeof uni.cancelAnimationFrame === 'function') {
					uni.cancelAnimationFrame(id);
				} else {
					clearTimeout(id);
				}
			};
		},
		methods: {
			closeSignBoard() {
				this.showSignBoard = false;
			},

			/* ========== 加载合约详情 ========== */
			async loadDetail(fromRefresh = false) {
				if (this.loading) return;
				this.loading = true;
				if (fromRefresh) this.refreshing = true;

				try {
					const card = vk.getVuex('$user.employeeInfo.card') || '';
					const res = await vk.callFunction({
						url: 'admin/hrm/contract-sign/sys/getDetail',
						data: {
							_id: this._id,
							card
						}
					});

					if (res.code === 0) {
						this.contractData = res.rows[0] || {};
						this.lastSignatureUrl = res.extra?.lastSignatureUrl || '';
					} else {
						this.$refs.toast.showToast(res.msg || '获取合约失败');
					}
				} catch (e) {
					this.$refs.toast.showToast('网络异常');
				} finally {
					this.loading = false;
					if (fromRefresh) this.refreshing = false;
				}
			},

			onRefresh() {
				if (!this.loading) this.loadDetail(true);
			},

			previewFile() {
				const url = this.contractData.contract_sign_file;
				if (!url) return;
				uni.previewFile ? uni.previewFile({
					url
				}) : uni.downloadFile({
					url,
					success: r => uni.openDocument({
						filePath: r.tempFilePath
					})
				});
			},

			formatDate(val) {
				if (!val) return '';
				const d = new Date(val);
				return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
			},

			/* ========== 签名板逻辑 ========== */
			openSignBoard() {
				this.showSignBoard = true;
				this.$nextTick(() => this.getCanvasSize());
			},

			getCanvasSize() {
				uni.createSelectorQuery().select('.handCenter').boundingClientRect(rect => {
					if (rect?.width) {
						this.canvasWidth = rect.width;
						this.canvasHeight = rect.height;
						this.clear();
						if (this.lastSignatureUrl) {
							this.drawByImage(this.lastSignatureUrl);
						}
					} else {
						setTimeout(this.getCanvasSize, 100);
					}
				}).exec();
			},

			/* ========== 提交签名（自动触发PDF合成） ========== */
			async submitSign() {
				if (this.isEmpty()) {
					this.$refs.toast.showToast('请先签名');
					return;
				}

				try {
					let signatureUrl = this.lastSignatureUrl;

					// 如果没有历史签名，则新上传
					if (!signatureUrl) {
						this.$refs.toast.showLoading('正在生成签名...');

						const tempPath = await this.getTempFilePath();
						const imgInfo = await new Promise((res, rej) =>
							uni.getImageInfo({
								src: tempPath,
								success: res,
								fail: rej
							})
						);

						const {
							width,
							height
						} = imgInfo;

						const nodeInfo = await new Promise((res, rej) => {
							uni.createSelectorQuery().in(this)
								.select('#rotateCanvas').node().exec(r => {
									r[0] ? res(r[0]) : rej('canvas error');
								});
						});

						const canvas = nodeInfo.node;
						const ctx = canvas.getContext('2d');
						canvas.width = height;
						canvas.height = width;

						const img = canvas.createImage();
						img.src = tempPath;
						await new Promise(r => img.onload = r);

						ctx.translate(height / 2, width / 2);
						ctx.rotate(-90 * Math.PI / 180);
						ctx.drawImage(img, -width / 2, -height / 2);

						const rotatedPath = await new Promise((res, rej) =>
							uni.canvasToTempFilePath({
								canvas,
								fileType: 'png',
								success: res,
								fail: rej
							})
						);

						// 上传七牛云
						const cloudPath = `public/contract/signature/${this._id}_${Date.now()}.png`;

						const uploadOptionRes = await vk.callFunction({
							url: 'common/pub/getUploadFileOptions/index',
							data: {
								cloudPath
							}
						});

						if (uploadOptionRes.code !== 0) {
							throw new Error('获取上传参数失败');
						}

						await new Promise((res, rej) => {
							uni.uploadFile({
								...uploadOptionRes.rows.uploadFileOptions,
								filePath: rotatedPath.tempFilePath,
								success: res,
								fail: rej
							});
						});

						signatureUrl = `https://tdhstorage.cntdh.net/${cloudPath}`;
					}

					// 【核心修改】：调用专门处理 PDF 合成的云函数
					const needFillKeys = ['sign_year', 'sign_month', 'sign_day'];

					this.$refs.toast.showLoading('正在合成合约...');
					const signRes = await vk.callFunction({
						url: 'admin/hrm/contract-sign/sys/updatePdf',
						data: {
							_id: this._id,
							signature_url: signatureUrl,
							fieldKeys: needFillKeys
						}
					});

					this.$refs.toast.hide();

					if (signRes.code === 0) {
						this.$refs.toast.showToast('合约签署成功');
						setTimeout(() => uni.navigateBack(), 1500);
					} else {
						this.$refs.toast.showToast(signRes.msg || '签署失败');
					}

				} catch (e) {
					this.$refs.toast.hide();
					this.$refs.toast.showToast('签署失败');
					console.error(e);
				}
			},

			/* ========== 以下为原签名板完整绘制逻辑 ========== */
			getTempFilePath() {
				return new Promise((resolve, reject) => {
					uni.canvasToTempFilePath({
						canvasId: 'handWriting',
						fileType: 'png',
						quality: 1,
						success: res => resolve(res.tempFilePath),
						fail: reject
					});
				});
			},

			getPickerColor(color) {
				this.showPickerColor = false;
				if (color) {
					this.lineColor = color;
				}
			},

			uploadScaleStart(e) {
				this.isDrawing = true;
				this.currentStrokePoints = [];
				this.points = [];
				this.pointQueue = [];

				this.ctx.setStrokeStyle(this.lineColor);
				this.ctx.setLineCap("round");

				const touch = e.touches[0];
				this.pointQueue.push({
					x: touch.x,
					y: touch.y,
					t: Date.now()
				});

				this.startRenderLoop();
			},

			startRenderLoop() {
				const render = () => {
					if (!this.isDrawing) return;
					this.processQueue();
					this.rafId = this.requestAnimationFrame(render);
				};
				this.rafId = this.requestAnimationFrame(render);
			},

			uploadScaleMove(e) {
				if (!this.isDrawing) return;
				const touch = e.changedTouches[0];
				this.pointQueue.push({
					x: touch.x,
					y: touch.y,
					t: Date.now()
				});
			},

			uploadScaleEnd() {
				this.isDrawing = false;
				if (this.rafId) {
					this.cancelAnimationFrame(this.rafId);
					this.rafId = null;
				}
				this.processQueue();

				if (this.currentStrokePoints.length > 0) {
					this.historyList.push(this.currentStrokePoints.slice());
					this.historyList = this.historyList.slice(-this.maxHistoryLength);
				}
				this.currentStrokePoints = [];
				this.points = [];
			},

			processQueue() {
				if (!this.pointQueue.length) return;
				const queue = this.pointQueue;
				this.pointQueue = [];

				this.canAddHistory = false;

				queue.forEach(pointData => {
					this.initPoint(pointData.x, pointData.y);
					const point = this.points[this.points.length - 1];
					if (point && !this.currentStrokePoints.includes(point)) {
						this.currentStrokePoints.push(point);
					}
					if (this.points.length >= 2) {
						const prePoint = this.points[this.points.length - 2];
						const curPoint = this.points[this.points.length - 1];
						if (this.openSmooth) {
							this.drawSmoothLine(prePoint, curPoint);
						} else {
							this.drawNoSmoothLine(prePoint, curPoint);
						}
					}
				});

				this.ctx.draw && this.ctx.draw(true);
				this.canAddHistory = true;
			},

			initPoint(x, y) {
				var point = {
					x: x,
					y: y,
					t: Date.now()
				};
				var prePoint = this.points.slice(-1)[0];
				if (prePoint && (prePoint.t === point.t || prePoint.x === x && prePoint.y === y)) {
					return;
				}
				if (prePoint && this.openSmooth) {
					var prePoint2 = this.points.slice(-2, -1)[0];
					point.distance = Math.sqrt(Math.pow(point.x - prePoint.x, 2) + Math.pow(point.y - prePoint.y, 2));
					point.speed = point.distance / (point.t - prePoint.t || 0.1);
					point.lineWidth = this.getLineWidth(point.speed);
					if (prePoint2 && prePoint2.lineWidth && point.lineWidth) {
						var rate = (point.lineWidth - prePoint.lineWidth) / prePoint.lineWidth;
						var maxRate = this.maxWidthDiffRate / 100;
						maxRate = maxRate > 1 ? 1 : maxRate < 0.01 ? 0.01 : maxRate;
						if (Math.abs(rate) > maxRate) {
							var per = rate > 0 ? maxRate : -maxRate;
							point.lineWidth = prePoint.lineWidth * (1 + per);
						}
					}
				}
				this.points.push(point);
				this.points = this.points.slice(-3);
			},

			getLineWidth(speed) {
				var minSpeed = this.minSpeed > 10 ? 10 : this.minSpeed < 1 ? 1 : this.minSpeed;
				var addWidth = (this.maxWidth - this.minWidth) * speed / minSpeed;
				var lineWidth = Math.max(this.maxWidth - addWidth, this.minWidth);
				return Math.min(lineWidth, this.maxWidth);
			},

			drawSmoothLine(prePoint, point) {
				var dis_x = point.x - prePoint.x;
				var dis_y = point.y - prePoint.y;
				if (Math.abs(dis_x) + Math.abs(dis_y) <= 2) {
					point.lastX1 = point.lastX2 = prePoint.x + dis_x * 0.5;
					point.lastY1 = point.lastY2 = prePoint.y + dis_y * 0.5;
				} else {
					point.lastX1 = prePoint.x + dis_x * 0.3;
					point.lastY1 = prePoint.y + dis_y * 0.3;
					point.lastX2 = prePoint.x + dis_x * 0.7;
					point.lastY2 = prePoint.y + dis_y * 0.7;
				}
				point.perLineWidth = (prePoint.lineWidth + point.lineWidth) / 2;
				if (typeof prePoint.lastX1 === 'number') {
					this.drawCurveLine(prePoint.lastX2, prePoint.lastY2, prePoint.x, prePoint.y, point.lastX1, point
						.lastY1, point.perLineWidth);
					if (prePoint.isFirstPoint) return;
					if (prePoint.lastX1 === prePoint.lastX2 && prePoint.lastY1 === prePoint.lastY2) return;
					var data = this.getRadianData(prePoint.lastX1, prePoint.lastY1, prePoint.lastX2, prePoint.lastY2);
					var points1 = this.getRadianPoints(data, prePoint.lastX1, prePoint.lastY1, prePoint.perLineWidth / 2);
					var points2 = this.getRadianPoints(data, prePoint.lastX2, prePoint.lastY2, point.perLineWidth / 2);
					this.drawTrapezoid(points1[0], points2[0], points2[1], points1[1]);
				} else {
					point.isFirstPoint = true;
				}
			},

			drawNoSmoothLine(prePoint, point) {
				point.lastX = prePoint.x + (point.x - prePoint.x) * 0.5;
				point.lastY = prePoint.y + (point.y - prePoint.y) * 0.5;
				if (typeof prePoint.lastX === 'number') {
					this.drawCurveLine(prePoint.lastX, prePoint.lastY, prePoint.x, prePoint.y, point.lastX, point.lastY,
						this.maxWidth);
				}
			},

			drawCurveLine(x1, y1, x2, y2, x3, y3, lineWidth) {
				lineWidth = Number(lineWidth.toFixed(1));
				this.ctx.setLineWidth && this.ctx.setLineWidth(lineWidth);
				this.ctx.lineWidth = lineWidth;
				this.ctx.beginPath();
				this.ctx.moveTo(Number(x1.toFixed(1)), Number(y1.toFixed(1)));
				this.ctx.quadraticCurveTo(Number(x2.toFixed(1)), Number(y2.toFixed(1)), Number(x3.toFixed(1)), Number(y3
					.toFixed(1)));
				this.ctx.stroke();
			},

			drawTrapezoid(point1, point2, point3, point4) {
				this.ctx.beginPath();
				this.ctx.moveTo(Number(point1.x.toFixed(1)), Number(point1.y.toFixed(1)));
				this.ctx.lineTo(Number(point2.x.toFixed(1)), Number(point2.y.toFixed(1)));
				this.ctx.lineTo(Number(point3.x.toFixed(1)), Number(point3.y.toFixed(1)));
				this.ctx.lineTo(Number(point4.x.toFixed(1)), Number(point4.y.toFixed(1)));
				this.ctx.setFillStyle && this.ctx.setFillStyle(this.lineColor);
				this.ctx.fillStyle = this.lineColor;
				this.ctx.fill();
			},

			getRadianData(x1, y1, x2, y2) {
				var dis_x = x2 - x1;
				var dis_y = y2 - y1;
				if (dis_x === 0) return {
					val: 0,
					pos: -1
				};
				if (dis_y === 0) return {
					val: 0,
					pos: 1
				};
				var val = Math.abs(Math.atan(dis_y / dis_x));
				if (x2 > x1 && y2 < y1 || x2 < x1 && y2 > y1) {
					return {
						val: val,
						pos: 1
					};
				}
				return {
					val: val,
					pos: -1
				};
			},

			getRadianPoints(radianData, x, y, halfLineWidth) {
				if (radianData.val === 0) {
					if (radianData.pos === 1) {
						return [{
							x: x,
							y: y + halfLineWidth
						}, {
							x: x,
							y: y - halfLineWidth
						}];
					}
					return [{
						y: y,
						x: x + halfLineWidth
					}, {
						y: y,
						x: x - halfLineWidth
					}];
				}
				var dis_x = Math.sin(radianData.val) * halfLineWidth;
				var dis_y = Math.cos(radianData.val) * halfLineWidth;
				if (radianData.pos === 1) {
					return [{
						x: x + dis_x,
						y: y + dis_y
					}, {
						x: x - dis_x,
						y: y - dis_y
					}];
				}
				return [{
					x: x + dis_x,
					y: y - dis_y
				}, {
					x: x - dis_x,
					y: y + dis_y
				}];
			},

			drawByImage(url) {
				if (!this.canvasWidth || !this.canvasHeight) return;
				this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
				uni.getImageInfo({
					src: url,
					success: (res) => {
						const {
							width,
							height,
							path
						} = res;
						const isLandscape = width > height;
						if (isLandscape) {
							this.ctx.save();
							this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
							this.ctx.rotate(90 * Math.PI / 180);
							const scaleX = this.canvasHeight / width;
							const scaleY = this.canvasWidth / height;
							const scale = Math.min(scaleX, scaleY);
							const drawWidth = width * scale;
							const drawHeight = height * scale;
							this.ctx.drawImage(path, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
							this.ctx.restore();
						} else {
							this.ctx.drawImage(path, 0, 0, this.canvasWidth, this.canvasHeight);
						}
						this.ctx.draw(true);
					},
					fail: (err) => {
						console.error('加载历史签名失败', err);
					}
				});
			},

			clear() {
				if (!this.canvasWidth || !this.canvasHeight) return;
				const color = this.bgColor || '#ffffff';
				this.ctx.setFillStyle && this.ctx.setFillStyle(color);
				this.ctx.fillStyle = color;
				this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
				this.ctx.draw && this.ctx.draw(true);
				this.historyList = [];
				this.currentStrokePoints = [];
				this.points = [];
				this.pointQueue = [];
				if (this.rafId) {
					this.cancelAnimationFrame(this.rafId);
					this.rafId = null;
				}
				this.isDrawing = false;
			},

			clearCanvasOnly() {
				const color = this.bgColor || '#ffffff';
				this.ctx.setFillStyle && this.ctx.setFillStyle(color);
				this.ctx.fillStyle = color;
				this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
				this.ctx.draw && this.ctx.draw(true);
			},

			undo() {
				if (this.historyList.length === 0) {
					this.clear();
					return;
				}
				this.historyList.pop();
				this.clearCanvasOnly();
				if (this.lastSignatureUrl) {
					this.drawByImage(this.lastSignatureUrl);
				}
				this.isReplaying = true;
				this.historyList.forEach(strokePoints => {
					this.replayStroke(strokePoints);
				});
				this.isReplaying = false;
				if (this.historyList.length === 0 && !this.lastSignatureUrl) {
					this.clearCanvasOnly();
				}
			},

			replayStroke(pointsArray) {
				if (!pointsArray || pointsArray.length === 0) return;
				this.points = [];
				for (let i = 0; i < pointsArray.length; i++) {
					const point = pointsArray[i];
					this.points.push(point);
					if (this.points.length > 3) {
						this.points.shift();
					}
					if (this.points.length >= 2) {
						const prePoint = this.points[this.points.length - 2];
						const curPoint = this.points[this.points.length - 1];
						if (this.openSmooth) {
							this.drawSmoothLine(prePoint, curPoint);
						} else {
							this.drawNoSmoothLine(prePoint, curPoint);
						}
					}
				}
				this.ctx.draw(true);
			},

			isEmpty() {
				return this.historyList.length === 0 && !this.lastSignatureUrl;
			},

			selectColorEvent(str, color) {
				this.selectColor = str;
				this.lineColor = color;
				this.ctx.setStrokeStyle(this.lineColor)
			},

			previewCanvasImg() {
				uni.canvasToTempFilePath({
					canvasId: 'handWriting',
					fileType: 'png',
					quality: 1,
					success(res) {
						uni.previewImage({
							urls: [res.tempFilePath]
						});
					}
				});
			},
		}
	};
</script>

<style scoped>
	/* 全局基础 */
	page {
		height: 100%;
		overflow: hidden;
		background: #f5f6f8;
	}

	.sign-page {
		height: 100vh;
		background: #f5f6f8;
		display: flex;
		flex-direction: column;
	}

	/* ============ 合约卡片样式 ============ */
	.detail-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.detail-scroll {
		flex: 1;
		height: 0;
		padding: 24rpx;
		box-sizing: border-box;
	}

	.contract-card {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
		margin-bottom: 24rpx;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #eee;
	}

	.card-header .title {
		font-size: 34rpx;
		font-weight: bold;
		color: #333;
	}

	.status-tag {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 8rpx;
	}

	.status-tag.unsigned {
		background: #fff1f0;
		color: #f56c6c;
	}

	.status-tag.signed {
		background: #f0f9eb;
		color: #67c23a;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 18rpx 0;
		font-size: 28rpx;
	}

	.info-row .label {
		color: #888;
	}

	.info-row .value {
		color: #333;
		font-weight: 500;
	}

	/* 文件预览框 */
	.file-box {
		display: flex;
		align-items: center;
		background: #f8f9fb;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-top: 24rpx;
	}

	.file-icon {
		font-size: 40rpx;
		margin-right: 16rpx;
	}

	.file-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.file-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.file-tip {
		font-size: 22rpx;
		color: #999;
		margin-top: 4rpx;
	}

	.preview-btn {
		background: #008ef6;
		color: #fff;
		border-radius: 30rpx;
		font-size: 24rpx;
		padding: 0 24rpx;
		height: 56rpx;
		line-height: 56rpx;
		margin: 0;
	}

	/* 提醒样式 */
	.reminder {
		display: flex;
		padding: 24rpx;
		background: #fff8e1;
		border-radius: 16rpx;
		font-size: 24rpx;
		color: #b88230;
		line-height: 1.6;
	}

	.reminder-icon {
		margin-right: 12rpx;
		font-size: 32rpx;
	}

	/* 底部按钮 */
	.btn-sign-wrapper {
		padding: 20rpx 32rpx 40rpx;
		background: #f5f6f8;
	}

	.btn-sign {
		width: 100%;
		background: linear-gradient(90deg, #008ef6, #00b4ff);
		color: #fff;
		border-radius: 48rpx;
		height: 88rpx;
		line-height: 88rpx;
		font-size: 32rpx;
		font-weight: 500;
		border: none;
		box-shadow: 0 8rpx 16rpx rgba(0, 142, 246, 0.2);
	}

	.btn-sign.disabled {
		background: #ccc;
		box-shadow: none;
	}

	.loading-detail {
		text-align: center;
		padding: 100rpx 0;
		color: #999;
		font-size: 28rpx;
	}

	/* ================= 签名板原有样式（完全恢复） ================= */
	.sign-board-full {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #fbfbfb;
		z-index: 999;
	}

	.wrapper {
		width: 100%;
		height: 95vh;
		margin: 40rpx 0;
		overflow: hidden;
		display: flex;
		align-content: center;
		flex-direction: row;
		justify-content: center;
		font-size: 28rpx;
	}

	.handWriting {
		background: #fff;
		width: 100%;
		height: 95vh;
	}

	.handRight {
		display: inline-flex;
		align-items: center;
	}

	.handCenter {
		border: none;
		/* 去掉边框，如果需要视觉上的框，放在 canvas 外层或使用背景图 */
		flex: 5;
		overflow: hidden;
		box-sizing: border-box;
	}

	.handTitle {
		transform: rotate(90deg);
		flex: 1;
		color: #666;
	}

	.handBtn button {
		font-size: 28rpx;
	}

	.handBtn {
		height: 95vh;
		display: inline-flex;
		flex-direction: column;
		justify-content: space-between;
		align-content: space-between;
		flex: 1;
	}

	.delBtn {
		position: absolute;
		top: 250rpx;
		left: 0rpx;
		transform: rotate(90deg);
		color: #666;
	}

	.delBtn image {
		position: absolute;
		top: 13rpx;
		left: 25rpx;
	}

	.subBtn {
		position: absolute;
		bottom: 52rpx;
		left: -3rpx;
		display: inline-flex;
		transform: rotate(90deg);
		background: #008ef6;
		color: #fff;
		margin-bottom: 30rpx;
		text-align: center;
		justify-content: center;
	}

	.previewBtn {
		position: absolute;
		top: 375rpx;
		left: 0rpx;
		transform: rotate(90deg);
		color: #666;
	}

	.undoBtn {
		position: absolute;
		top: 500rpx;
		left: 0rpx;
		transform: rotate(90deg);
		color: #666;
	}

	.closeBtn {
		position: absolute;
		top: 625rpx;
		left: 0rpx;
		transform: rotate(90deg);
		color: #666;
	}

	.black-select {
		width: 60rpx;
		height: 60rpx;
		position: absolute;
		top: 30rpx;
		left: 25rpx;
	}

	.red-select {
		width: 60rpx;
		height: 60rpx;
		position: absolute;
		top: 140rpx;
		left: 25rpx;
	}

	.color_pic {
		width: 70rpx;
		height: 70rpx;
		border-radius: 25px;
		position: absolute;
		top: 60rpx;
		left: 18rpx;
		border: 1px solid #ddd;
	}
</style>