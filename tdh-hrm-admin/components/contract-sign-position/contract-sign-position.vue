<template>
	<view class="sign-position-wrap">
		<!-- PDF 上传 -->
		<el-upload class="upload-btn" action="#" :show-file-list="false" accept=".pdf" :http-request="onUpload">
			<el-button size="small" type="primary" icon="el-icon-upload">上传PDF并选页</el-button>
		</el-upload>

		<span style="margin-left: 10px; color: #909399; font-size: 12px;">
			上传合同PDF后，在签名栏位置拖拽一个框即可
		</span>

		<!-- 页码选择 -->
		<view class="page-bar" v-if="totalPage > 0">
			<el-button size="mini" :disabled="currentPage <= 1" @click="changePage(-1)">上一页</el-button>
			<span style="margin: 0 10px;">
				第 {{ currentPage }} / {{ totalPage }} 页
			</span>
			<el-button size="mini" :disabled="currentPage >= totalPage" @click="changePage(1)">下一页</el-button>

			<el-button size="mini" type="success" style="margin-left: 10px;" @click="useLastPage">使用最后一页</el-button>
		</view>

		<!-- PDF 画布 + 拖拽层 -->
		<view v-if="pdfUrl" class="canvas-wrap" ref="canvasWrap" @mousedown.prevent="startDraw" @mousemove="drawing"
			@mouseup="stopDraw" @mouseleave="stopDraw">
			<canvas id="pdf-canvas" ref="pdfCanvas" :style="{ width: canvasW + 'px', height: canvasH + 'px' }"></canvas>

			<!-- 拖拽中的框 -->
			<view v-if="drawingBox.show" class="drag-box" :style="{
					left: drawingBox.left + 'px',
					top: drawingBox.top + 'px',
					width: drawingBox.width + 'px',
					height: drawingBox.height + 'px'
				}"></view>

			<!-- 已确认的框 -->
			<view v-if="confirmBox.show" class="confirm-box" :style="{
					left: confirmBox.left + 'px',
					top: confirmBox.top + 'px',
					width: confirmBox.width + 'px',
					height: confirmBox.height + 'px'
				}">
				<view class="box-tip">
					{{ confirmBox.ptW }} × {{ confirmBox.ptH }} pt
				</view>
			</view>
		</view>

		<!-- 坐标结果 -->
		<view class="result" v-if="result.page !== null">
			<el-alert title="签名位置（pt）" type="success" :closable="false">
				<p>页码（page）: {{ result.page }}（0=最后一页）</p>
				<p>X: {{ result.x }} pt</p>
				<p>Y: {{ result.y }} pt</p>
				<p>宽度: {{ result.width }} pt</p>
				<p>高度: {{ result.height }} pt</p>
			</el-alert>

			<el-button size="mini" type="primary" style="margin-top: 10px;" @click="confirmPosition">确认使用该位置</el-button>

			<el-button size="mini" style="margin-top: 10px; margin-left: 10px;" @click="clearSelection">清除重选</el-button>
		</view>
	</view>
</template>

<script>
	import * as pdfjsLib from "pdfjs-dist";
	import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

	pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

	export default {
		name: "contract-sign-position",
		props: {
			value: {
				type: Object,
				default: () => ({
					page: 0,
					x: 300,
					y: 180,
					width: 150,
					height: 60
				})
			}
		},
		data() {
			return {
				pdfUrl: "",
				pdfDoc: null,
				totalPage: 0,
				currentPage: 1,

				canvasW: 0,
				canvasH: 0,
				pdfW: 0,
				pdfH: 0,
				scale: 1,

				renderTask: null,
				renderSeq: 0,

				drawingBox: {
					show: false,
					left: 0,
					top: 0,
					width: 0,
					height: 0
				},

				confirmBox: {
					show: false,
					left: 0,
					top: 0,
					width: 0,
					height: 0,
					ptW: 0,
					ptH: 0
				},

				result: {
					page: null,
					x: 0,
					y: 0,
					width: 0,
					height: 0
				},

				startX: 0,
				startY: 0,
				dragging: false
			};
		},
		watch: {
			value: {
				deep: true,
				handler(val) {
					if (val && val.page !== undefined && this.pdfDoc) {
						this.restoreFromValue(val);
					}
				}
			}
		},
		beforeDestroy() {
			if (this.renderTask) {
				try {
					this.renderTask.cancel();
				} catch (e) {}
			}
			if (this.pdfDoc) {
				this.pdfDoc.destroy();
			}
		},
		methods: {
			getRealCanvas() {
				let el = document.getElementById('pdf-canvas');
				if (!el) return null;
				if (!(el instanceof HTMLCanvasElement)) {
					el = el.querySelector('canvas');
				}
				return el;
			},

			getWrapEl() {
				const ref = this.$refs.canvasWrap;
				return ref ? (ref.$el || ref) : null;
			},

			getContainerWidth() {
				const el = this.getWrapEl();
				if (el) {
					const w = el.clientWidth || el.parentElement?.clientWidth;
					if (w && w > 100) return w;
				}
				if (this.$el && this.$el.clientWidth > 100) {
					return this.$el.clientWidth;
				}
				return 800;
			},

			async onUpload({ file }) {
				if (this.renderTask) {
					try { this.renderTask.cancel(); } catch (e) {}
					this.renderTask = null;
				}
				if (this.pdfDoc) {
					try { this.pdfDoc.destroy(); } catch (e) {}
					this.pdfDoc = null;
				}
				this.pdfUrl = URL.createObjectURL(file);
				this.resetSelectionLocal();
				await this.loadPdf(this.pdfUrl);
			},

			async loadPdf(url) {
				const loadingTask = pdfjsLib.getDocument(url);
				this.pdfDoc = await loadingTask.promise;
				this.totalPage = this.pdfDoc.numPages;
				this.currentPage = 1;
				await this.renderPage(this.currentPage);
			},

			async renderPage(pageNum) {
				if (!this.pdfDoc) return;

				const seq = ++this.renderSeq;

				if (this.renderTask) {
					const oldTask = this.renderTask;
					this.renderTask = null;
					try {
						oldTask.cancel();
						await oldTask.promise;
					} catch (e) {}
					if (seq !== this.renderSeq) return;
				}

				try {
					const page = await this.pdfDoc.getPage(pageNum);
					if (seq !== this.renderSeq) return;

					const viewport = page.getViewport({ scale: 1 });
					this.pdfW = viewport.width;
					this.pdfH = viewport.height;

					const containerWidth = this.getContainerWidth();
					const maxW = Math.max(containerWidth - 20, 600);
					this.scale = maxW / this.pdfW;

					this.canvasW = this.pdfW * this.scale;
					this.canvasH = this.pdfH * this.scale;

					await this.$nextTick();
					if (seq !== this.renderSeq) return;

					const canvas = this.getRealCanvas();
					if (!canvas) return;

					const ctx = canvas.getContext("2d", { willReadFrequently: true });
					const dpr = window.devicePixelRatio || 1;

					canvas.width = Math.round(this.canvasW * dpr);
					canvas.height = Math.round(this.canvasH * dpr);
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					const renderViewport = page.getViewport({ scale: this.scale * dpr });

					this.renderTask = page.render({
						canvasContext: ctx,
						viewport: renderViewport
					});

					await this.renderTask.promise;
					if (seq !== this.renderSeq) return;

					this.restoreFromValue(this.value);
				} catch (error) {
					if (error.name !== 'RenderingCancelledException' && seq === this.renderSeq) {
						console.error('渲染失败:', error);
					}
				} finally {
					if (seq === this.renderSeq) {
						this.renderTask = null;
					}
				}
			},

			changePage(delta) {
				const target = this.currentPage + delta;
				if (target < 1 || target > this.totalPage) return;
				this.currentPage = target;
				this.resetSelectionLocal();
				this.renderPage(target);
			},

			useLastPage() {
				if (this.currentPage === this.totalPage) return;
				this.currentPage = this.totalPage;
				this.resetSelectionLocal();
				this.renderPage(this.currentPage);
			},

			// 【核心修复1】：精准获取基于原生 canvas 的真实 DOM 边界
			getCanvasRect() {
				const canvas = this.getRealCanvas();
				if (canvas) {
					return canvas.getBoundingClientRect();
				}
				const wrap = this.getWrapEl();
				return wrap ? wrap.getBoundingClientRect() : null;
			},

			startDraw(e) {
				if (!this.pdfDoc) return;
				const rect = this.getCanvasRect();
				if (!rect) return;

				// 【核心修复2】：基于原生 canvas 边界计算，十字星和画框完全对齐
				let x = e.clientX - rect.left;
				let y = e.clientY - rect.top;

				x = Math.max(0, Math.min(x, this.canvasW));
				y = Math.max(0, Math.min(y, this.canvasH));

				this.startX = x;
				this.startY = y;
				this.dragging = true;

				this.drawingBox = {
					show: true,
					left: this.startX,
					top: this.startY,
					width: 0,
					height: 0
				};

				this.confirmBox.show = false;
			},

			drawing(e) {
				if (!this.dragging) return;
				const rect = this.getCanvasRect();
				if (!rect) return;

				let curX = e.clientX - rect.left;
				let curY = e.clientY - rect.top;

				// 严格限制在 CSS 宽度和高度内
				curX = Math.max(0, Math.min(curX, this.canvasW));
				curY = Math.max(0, Math.min(curY, this.canvasH));

				this.drawingBox = {
					show: true,
					left: Math.min(this.startX, curX),
					top: Math.min(this.startY, curY),
					width: Math.abs(curX - this.startX),
					height: Math.abs(curY - this.startY)
				};
			},

			stopDraw() {
				if (!this.dragging) return;
				this.dragging = false;

				if (this.drawingBox.width < 5 || this.drawingBox.height < 5) {
					this.drawingBox.show = false;
					return;
				}

				const ptX = Math.round(this.drawingBox.left / this.scale);
				const ptY = Math.round(this.drawingBox.top / this.scale);
				const ptW = Math.round(this.drawingBox.width / this.scale);
				const ptH = Math.round(this.drawingBox.height / this.scale);

				const pdfLibY = Math.round(this.pdfH - (this.drawingBox.top / this.scale) - (this.drawingBox.height / this.scale));

				this.result = {
					page: this.currentPage,
					x: ptX,
					y: pdfLibY,
					width: ptW,
					height: ptH
				};

				this.confirmBox = {
					show: true,
					left: this.drawingBox.left,
					top: this.drawingBox.top,
					width: this.drawingBox.width,
					height: this.drawingBox.height,
					ptW,
					ptH
				};
			},

			confirmPosition() {
				const emitPage = this.result.page === this.totalPage ? 0 : this.result.page;

				let newValue = {
					...this.value,
					page: emitPage,
					x: this.result.x,
					y: this.result.y,
					width: this.result.width,
					height: this.result.height
				};

				this.$emit("input", newValue);
				this.$emit("change", newValue);

				this.$message && this.$message.success("签名位置已确认");
			},

			resetSelectionLocal() {
				this.drawingBox = { show: false, left: 0, top: 0, width: 0, height: 0 };
				this.confirmBox = { show: false, left: 0, top: 0, width: 0, height: 0, ptW: 0, ptH: 0 };
				this.result = { page: null, x: 0, y: 0, width: 0, height: 0 };
			},

			clearSelection() {
				this.resetSelectionLocal();
				let newValue = {
					...this.value,
					page: 0,
					x: 300,
					y: 180,
					width: 150,
					height: 60
				};
				this.$emit("input", newValue);
				this.$emit("change", newValue);
			},

			restoreFromValue(val) {
				if (!val || val.x === undefined || val.x === null) return;
				if (!this.pdfDoc || !this.pdfW || !this.pdfH) return;

				const targetPage = val.page === 0 ? this.totalPage : val.page;
				if (targetPage !== this.currentPage) return;

				const left = val.x * this.scale;
				const top = (this.pdfH - val.y - val.height) * this.scale;
				const width = val.width * this.scale;
				const height = val.height * this.scale;

				this.confirmBox = {
					show: true,
					left,
					top,
					width,
					height,
					ptW: val.width,
					ptH: val.height
				};

				this.result = {
					page: val.page === 0 ? this.totalPage : val.page,
					x: val.x,
					y: val.y,
					width: val.width,
					height: val.height
				};
			}
		}
	};
</script>

<style lang="scss" scoped>
	.sign-position-wrap {
		position: relative;

		.upload-btn {
			display: inline-block;
			margin-bottom: 10px;
		}

		.page-bar {
			margin-bottom: 10px;
			display: flex;
			align-items: center;
		}

		.canvas-wrap {
			position: relative;
			display: inline-block;
			border: 1px solid #dcdfe6;
			cursor: crosshair;
			user-select: none;
			overflow: hidden;
			touch-action: none;
			line-height: 0;
			/* 移除最大宽度限制，避免被外层样式挤压导致坐标系再次错乱 */
		}

		canvas {
			display: block;
			/* 确保 canvas 自身不会因为 max-width 被浏览器强行缩放 */
			max-width: none; 
		}

		.drag-box {
			position: absolute;
			border: 1px dashed #409eff;
			background: rgba(64, 158, 255, 0.1);
			pointer-events: none;
			box-sizing: border-box;
		}

		.confirm-box {
			position: absolute;
			border: 2px solid #67c23a;
			background: rgba(103, 194, 58, 0.1);
			pointer-events: none;
			box-sizing: border-box;

			.box-tip {
				position: absolute;
				top: -20px;
				left: 0;
				background: #67c23a;
				color: #fff;
				font-size: 12px;
				padding: 2px 6px;
				border-radius: 2px;
				white-space: nowrap;
			}
		}

		.result {
			margin-top: 15px;
			max-width: 100%;
		}
	}
</style>