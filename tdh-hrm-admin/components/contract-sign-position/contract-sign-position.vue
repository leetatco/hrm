<template>
	<view class="sign-position-wrap">
		<!-- 状态提示与模式切换 -->
		<view class="tips-bar" style="display: flex; justify-content: space-between; align-items: center;">
			<div>
				<template v-if="!fileUrl">
					<span style="color: #f56c6c; font-size: 13px;">
						<i class="el-icon-warning-outline"></i> 请先在上方“模版文件”中上传PDF文件，上传后即可在此处定位
					</span>
				</template>
				<template v-else>
					<span style="color: #909399; font-size: 13px;">
						请拖拽画框，按住框可移动，拖拽四角可缩放
					</span>
				</template>
			</div>

			<!-- 画笔模式切换 -->
			<el-radio-group v-model="drawMode" size="mini" v-if="fileUrl">
				<el-radio-button label="sign">✍️ 画签名框</el-radio-button>
				<el-radio-button label="text">📝 画文本框</el-radio-button>
			</el-radio-group>
		</view>

		<!-- 页码选择 -->
		<view class="page-bar" v-if="totalPage > 0">
			<el-button size="mini" :disabled="currentPage <= 1" @click="changePage(-1)">上一页</el-button>
			<span style="margin: 0 10px;">
				第 {{ currentPage }} / {{ totalPage }} 页
			</span>
			<el-button size="mini" :disabled="currentPage >= totalPage" @click="changePage(1)">下一页</el-button>

			<el-button size="mini" type="success" style="margin-left: 10px;" @click="useLastPage">使用最后一页</el-button>
		</view>

		<!-- PDF 画布 + 交互层 -->
		<view v-if="pdfRenderUrl" class="canvas-wrap" ref="canvasWrap" @mousedown.prevent="onMouseDown" @mousemove="onMouseMove"
			@mouseup="onMouseUp" @mouseleave="onMouseUp">
			<canvas id="pdf-canvas" ref="pdfCanvas" :style="{ width: canvasW + 'px', height: canvasH + 'px' }"></canvas>

			<!-- 拖拽中的框（新建） -->
			<view v-if="drawingBox.show" class="drag-box" :class="drawMode === 'text' ? 'is-text' : 'is-sign'" :style="boxStyle(drawingBox)"></view>

			<!-- 已保存的签名框 -->
			<view v-for="(box, idx) in currentPageSignBoxes" :key="'sign-' + idx" class="confirm-box sign-box" :style="boxStyle(box)">
				<view class="box-tip">签名框</view>
			</view>

			<!-- 已保存的文本框 -->
			<view v-for="(box, idx) in currentPageTextBoxes" :key="'text-' + idx" class="confirm-box text-box" :style="boxStyle(box)">
				<view class="box-tip">{{ getFieldLabel(box.fieldKey) }}</view>
			</view>

			<!-- 当前操作中的框（支持移动和缩放） -->
			<view v-if="confirmBox.show" class="confirm-box pending" :class="pendingType === 'text' ? 'is-text' : 'is-sign'" :style="boxStyle(confirmBox)"
				@mousedown.prevent.stop="startAction('moving', $event, 'center')">
				
				<!-- 提示标签 -->
				<view class="box-tip">{{ confirmBox.ptW }} × {{ confirmBox.ptH }} pt</view>
				
				<!-- 四个角的缩放手柄 -->
				<view class="handle tl" @mousedown.prevent.stop="startAction('resizing', $event, 'tl')"></view>
				<view class="handle tr" @mousedown.prevent.stop="startAction('resizing', $event, 'tr')"></view>
				<view class="handle bl" @mousedown.prevent.stop="startAction('resizing', $event, 'bl')"></view>
				<view class="handle br" @mousedown.prevent.stop="startAction('resizing', $event, 'br')"></view>
			</view>
		</view>

		<!-- 待确认框操作 -->
		<view class="result" v-if="confirmBox.show">
			<el-alert :title="pendingType === 'sign' ? '当前签名框（pt）' : '当前文本框（pt）'" :type="pendingType === 'sign' ? 'success' : 'warning'" :closable="false">
				<p>页码（page）: {{ pendingResult.page }}（0=最后一页）</p>
				<p>X: {{ pendingResult.x }} pt，Y: {{ pendingResult.y }} pt</p>
				<p>宽度: {{ pendingResult.width }} pt，高度: {{ pendingResult.height }} pt</p>

				<!-- 如果是文本框，要求选择绑定的字段 -->
				<div v-if="pendingType === 'text'" style="margin-top: 10px; display: flex; align-items: center;">
					<span style="margin-right: 10px; font-weight: bold;">绑定员工字段：</span>
					<el-select v-model="pendingFieldKey" size="small" placeholder="请选择要填入的数据" style="width: 200px;">
						<el-option v-for="opt in fieldOptions" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
					</el-select>
				</div>
			</el-alert>

			<div style="margin-top: 10px;">
				<el-button size="mini" type="primary" @click="addCurrentBox">保存此框</el-button>
				<el-button size="mini" @click="clearPendingBox">取消</el-button>
			</div>
		</view>

		<!-- 已保存列表 (Tab切换展示) -->
		<view class="saved-list" style="margin-top: 20px;" v-if="signPositions.length > 0 || textPositions.length > 0">
			<el-tabs type="border-card">
				<el-tab-pane :label="`签名位置 (${signPositions.length})`">
					<el-table :data="signPositions" size="mini" border>
						<el-table-column label="#" type="index" width="50" />
						<el-table-column label="页码" width="80">
							<template slot-scope="scope">{{ scope.row.page === 0 ? '最后一页' : scope.row.page }}</template>
						</el-table-column>
						<el-table-column prop="x" label="X" width="70" />
						<el-table-column prop="y" label="Y" width="70" />
						<el-table-column prop="width" label="宽" width="70" />
						<el-table-column prop="height" label="高" width="70" />
						<el-table-column label="操作" width="120">
							<template slot-scope="scope">
								<el-button type="text" size="mini" @click="gotoPosition(scope.row)">定位</el-button>
								<el-button type="text" size="mini" style="color:#f56c6c" @click="removeSignPos(scope.$index)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
				
				<el-tab-pane :label="`文本填充位置 (${textPositions.length})`">
					<el-table :data="textPositions" size="mini" border>
						<el-table-column label="#" type="index" width="50" />
						<el-table-column label="页码" width="80">
							<template slot-scope="scope">{{ scope.row.page === 0 ? '最后一页' : scope.row.page }}</template>
						</el-table-column>
						<el-table-column label="填充内容" width="120">
							<template slot-scope="scope">{{ getFieldLabel(scope.row.fieldKey) }}</template>
						</el-table-column>
						<el-table-column prop="x" label="X" width="70" />
						<el-table-column prop="y" label="Y" width="70" />
						<el-table-column label="操作" width="120">
							<template slot-scope="scope">
								<el-button type="text" size="mini" @click="gotoPosition(scope.row)">定位</el-button>
								<el-button type="text" size="mini" style="color:#f56c6c" @click="removeTextPos(scope.$index)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
			</el-tabs>
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
			value: { type: Array, default: () => [] },
			textValue: { type: Array, default: () => [] },
			fileUrl: { type: String, default: "" }
		},
		data() {
			return {
				pdfRenderUrl: "",
				pdfDoc: null,
				totalPage: 0,
				currentPage: 1,

				canvasW: 0, canvasH: 0, pdfW: 0, pdfH: 0, scale: 1,
				renderTask: null, renderSeq: 0,

				drawMode: 'sign',
				actionType: 'none',
				activeHandle: '', 
				
				drawingBox: { show: false, left: 0, top: 0, width: 0, height: 0 },
				startX: 0, startY: 0,

				confirmBox: { show: false, left: 0, top: 0, width: 0, height: 0, ptW: 0, ptH: 0 },
				pendingType: 'sign',
				pendingResult: { page: null, x: 0, y: 0, width: 0, height: 0 },
				pendingFieldKey: "",

				moveStartX: 0, moveStartY: 0,
				boxStart: { left: 0, top: 0, width: 0, height: 0 },

				fieldOptions: [
					{ label: '员工姓名', value: 'employee_name' },
					{ label: '身份证号码', value: 'card' },	
					{ label: '手机号码', value: 'mobile' },				
					{ label: '户籍地址', value: 'card_location' },
					{ label: '现住地址', value: 'current_address' },
					{ label: '签名年', value: 'sign_year' },
					{ label: '签名月', value: 'sign_month' },
					{ label: '签名日', value: 'sign_day' }
				]
			};
		},
		computed: {
			signPositions() { return Array.isArray(this.value) ? this.value : []; },
			textPositions() { return Array.isArray(this.textValue) ? this.textValue : []; },
			
			currentPageSignBoxes() {
				if (!this.pdfDoc || !this.pdfW || !this.pdfH) return [];
				return this.signPositions
					.filter(p => (p.page === 0 ? this.totalPage : p.page) === this.currentPage)
					.map(p => this.formatBoxToCss(p));
			},
			currentPageTextBoxes() {
				if (!this.pdfDoc || !this.pdfW || !this.pdfH) return [];
				return this.textPositions
					.filter(p => (p.page === 0 ? this.totalPage : p.page) === this.currentPage)
					.map(p => this.formatBoxToCss(p));
			}
		},
		watch: {
			fileUrl: {
				immediate: true,
				handler(newVal) {
					if (newVal && newVal !== this.pdfRenderUrl) {
						this.loadPdfFromUrl(newVal);
					} else if (!newVal) {
						this.pdfRenderUrl = "";
						this.pdfDoc = null;
						this.totalPage = 0;
						this.clearPendingBox();
					}
				}
			}
		},
		methods: {
			formatBoxToCss(p) {
				return {
					...p,
					left: p.x * this.scale,
					top: (this.pdfH - p.y - p.height) * this.scale,
					width: p.width * this.scale,
					height: p.height * this.scale,
					ptW: p.width,
					ptH: p.height
				};
			},
			getFieldLabel(key) {
				const f = this.fieldOptions.find(i => i.value === key);
				return f ? f.label : key;
			},
			boxStyle(box) {
				return { left: box.left + 'px', top: box.top + 'px', width: box.width + 'px', height: box.height + 'px' };
			},

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

			// 【核心修复】不再读取组件的实时宽度，避免切换页时容器塌陷导致变小
			getContainerWidth() {
				// 强制读取父级容器宽度，因为外层是 vk-data-dialog，宽度通常是固定的
				let parent = this.$el ? this.$el.parentElement : null;
				if (parent && parent.clientWidth > 100) return parent.clientWidth;
				return 800; // 默认兜底
			},

			async loadPdfFromUrl(url) {
				if (this.renderTask) {
					try { this.renderTask.cancel(); } catch (e) {}
					this.renderTask = null;
				}
				if (this.pdfDoc) {
					try { this.pdfDoc.destroy(); } catch (e) {}
					this.pdfDoc = null;
				}
				this.pdfRenderUrl = url;
				this.clearPendingBox();
				try {
					this.pdfDoc = await pdfjsLib.getDocument(url).promise;
					this.totalPage = this.pdfDoc.numPages;
					this.currentPage = 1;
					await this.renderPage(this.currentPage);
				} catch (e) {
					this.$message && this.$message.error("加载PDF失败");
				}
			},

			async renderPage(pageNum) {
				if (!this.pdfDoc) return;
				const seq = ++this.renderSeq;

				// 取消上一次未完成的渲染
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

					// 修复：携带 page.rotate 属性，防止倒置
					const viewport = page.getViewport({ scale: 1, rotation: page.rotate });
					this.pdfW = viewport.width;
					this.pdfH = viewport.height;

					const containerWidth = this.getContainerWidth();
					const maxW = Math.max(containerWidth - 40, 600); // 留出一点 padding
					
					// 计算缩放比
					this.scale = maxW / this.pdfW;
					this.canvasW = this.pdfW * this.scale;
					this.canvasH = this.pdfH * this.scale;

					await this.$nextTick();
					if (seq !== this.renderSeq) return;

					const canvas = this.getRealCanvas();
					if (!canvas) return;

					// 清理画布，防止多个页面的内容重叠
					const ctx = canvas.getContext("2d", { willReadFrequently: true });
					const dpr = window.devicePixelRatio || 1;

					canvas.width = Math.round(this.canvasW * dpr);
					canvas.height = Math.round(this.canvasH * dpr);
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					const renderViewport = page.getViewport({ scale: this.scale * dpr, rotation: page.rotate });

					this.renderTask = page.render({
						canvasContext: ctx,
						viewport: renderViewport
					});

					await this.renderTask.promise;
					if (seq !== this.renderSeq) return;
				} catch (error) {
					if (error.name !== 'RenderingCancelledException' && seq === this.renderSeq) {
						console.error('渲染失败:', error);
					}
				} finally {
					if (seq === this.renderSeq) this.renderTask = null;
				}
			},

			changePage(delta) {
				const target = this.currentPage + delta;
				if (target < 1 || target > this.totalPage) return;
				this.currentPage = target;
				this.clearPendingBox();
				this.renderPage(target);
			},

			useLastPage() {
				if (this.currentPage === this.totalPage) return;
				this.currentPage = this.totalPage;
				this.clearPendingBox();
				this.renderPage(this.currentPage);
			},

			getCanvasRect() {
				const canvas = this.getRealCanvas();
				if (canvas) return canvas.getBoundingClientRect();
				const wrap = this.getWrapEl();
				return wrap ? wrap.getBoundingClientRect() : null;
			},

			// ======== 鼠标事件处理 ========
			onMouseDown(e) {
				if (!this.pdfDoc) return;
				const rect = this.getCanvasRect();
				if (!rect) return;

				let x = e.clientX - rect.left;
				let y = e.clientY - rect.top;
				x = Math.max(0, Math.min(x, this.canvasW));
				y = Math.max(0, Math.min(y, this.canvasH));

				this.actionType = 'drawing';
				this.startX = x;
				this.startY = y;

				this.drawingBox = { show: true, left: this.startX, top: this.startY, width: 0, height: 0 };
				this.confirmBox.show = false;
			},

			startAction(type, e, handleType) {
				this.actionType = type;
				this.activeHandle = handleType;
				this.moveStartX = e.clientX;
				this.moveStartY = e.clientY;
				this.boxStart = {
					left: this.confirmBox.left,
					top: this.confirmBox.top,
					width: this.confirmBox.width,
					height: this.confirmBox.height
				};
			},

			onMouseMove(e) {
				if (this.actionType === 'none') return;
				const rect = this.getCanvasRect();
				if (!rect) return;

				if (this.actionType === 'drawing') {
					let curX = e.clientX - rect.left;
					let curY = e.clientY - rect.top;

					curX = Math.max(0, Math.min(curX, this.canvasW));
					curY = Math.max(0, Math.min(curY, this.canvasH));

					this.drawingBox = {
						show: true,
						left: Math.min(this.startX, curX),
						top: Math.min(this.startY, curY),
						width: Math.abs(curX - this.startX),
						height: Math.abs(curY - this.startY)
					};
				} else if (this.actionType === 'moving') {
					let deltaX = e.clientX - this.moveStartX;
					let deltaY = e.clientY - this.moveStartY;

					let newLeft = this.boxStart.left + deltaX;
					let newTop = this.boxStart.top + deltaY;

					newLeft = Math.max(0, Math.min(newLeft, this.canvasW - this.confirmBox.width));
					newTop = Math.max(0, Math.min(newTop, this.canvasH - this.confirmBox.height));

					this.confirmBox.left = newLeft;
					this.confirmBox.top = newTop;
					this.updatePendingResult();
				} else if (this.actionType === 'resizing') {
					let deltaX = e.clientX - this.moveStartX;
					let deltaY = e.clientY - this.moveStartY;
					
					let newLeft = this.boxStart.left;
					let newTop = this.boxStart.top;
					let newWidth = this.boxStart.width;
					let newHeight = this.boxStart.height;

					const minSize = 20;

					if (this.activeHandle === 'br') {
						newWidth = Math.max(minSize, this.boxStart.width + deltaX);
						newHeight = Math.max(minSize, this.boxStart.height + deltaY);
					} else if (this.activeHandle === 'tl') {
						let possibleWidth = this.boxStart.width - deltaX;
						let possibleHeight = this.boxStart.height - deltaY;
						if (possibleWidth >= minSize) {
							newWidth = possibleWidth;
							newLeft = this.boxStart.left + deltaX;
						}
						if (possibleHeight >= minSize) {
							newHeight = possibleHeight;
							newTop = this.boxStart.top + deltaY;
						}
					} else if (this.activeHandle === 'tr') {
						newWidth = Math.max(minSize, this.boxStart.width + deltaX);
						let possibleHeight = this.boxStart.height - deltaY;
						if (possibleHeight >= minSize) {
							newHeight = possibleHeight;
							newTop = this.boxStart.top + deltaY;
						}
					} else if (this.activeHandle === 'bl') {
						newHeight = Math.max(minSize, this.boxStart.height + deltaY);
						let possibleWidth = this.boxStart.width - deltaX;
						if (possibleWidth >= minSize) {
							newWidth = possibleWidth;
							newLeft = this.boxStart.left + deltaX;
						}
					}

					newLeft = Math.max(0, Math.min(newLeft, this.canvasW - minSize));
					newTop = Math.max(0, Math.min(newTop, this.canvasH - minSize));
					newWidth = Math.min(newWidth, this.canvasW - newLeft);
					newHeight = Math.min(newHeight, this.canvasH - newTop);

					this.confirmBox.left = newLeft;
					this.confirmBox.top = newTop;
					this.confirmBox.width = newWidth;
					this.confirmBox.height = newHeight;

					this.updatePendingResult();
				}
			},

			onMouseUp() {
				if (this.actionType === 'drawing') {
					if (this.drawingBox.width < 5 || this.drawingBox.height < 5) {
						this.drawingBox.show = false;
						this.actionType = 'none';
						return;
					}

					this.confirmBox = {
						show: true,
						left: this.drawingBox.left,
						top: this.drawingBox.top,
						width: this.drawingBox.width,
						height: this.drawingBox.height,
						ptW: Math.round(this.drawingBox.width / this.scale),
						ptH: Math.round(this.drawingBox.height / this.scale)
					};
					this.pendingType = this.drawMode; 
					this.pendingFieldKey = "";
					this.updatePendingResult();
				} 
				
				if (this.actionType !== 'none') {
					this.drawingBox.show = false;
					this.actionType = 'none';
				}
			},

			updatePendingResult() {
				const ptX = Math.round(this.confirmBox.left / this.scale);
				const ptW = Math.round(this.confirmBox.width / this.scale);
				const ptH = Math.round(this.confirmBox.height / this.scale);
				const pdfLibY = Math.round(this.pdfH - (this.confirmBox.top / this.scale) - (this.confirmBox.height / this.scale));

				this.pendingResult = {
					page: this.currentPage,
					x: ptX,
					y: pdfLibY,
					width: ptW,
					height: ptH
				};
				this.confirmBox.ptW = ptW;
				this.confirmBox.ptH = ptH;
			},

			addCurrentBox() {
				if (!this.confirmBox.show) return;
				if (this.pendingType === 'text' && !this.pendingFieldKey) {
					return this.$message.error("请选择要绑定的员工字段");
				}

				const emitPage = this.pendingResult.page === this.totalPage ? 0 : this.pendingResult.page;
				const newPos = {
					page: emitPage,
					x: this.pendingResult.x,
					y: this.pendingResult.y,
					width: this.pendingResult.width,
					height: this.pendingResult.height
				};

				if (this.pendingType === 'sign') {
					const newList = [...this.signPositions, newPos];
					this.$emit("input", newList);
					this.$emit("change", newList);
				} else {
					newPos.fieldKey = this.pendingFieldKey;
					const newList = [...this.textPositions, newPos];
					this.$emit("text-change", newList);
				}
				
				this.clearPendingBox();
				this.$message && this.$message.success("已添加");
			},

			clearPendingBox() {
				this.drawingBox = { show: false, left: 0, top: 0, width: 0, height: 0 };
				this.confirmBox = { show: false, left: 0, top: 0, width: 0, height: 0, ptW: 0, ptH: 0 };
				this.pendingResult = { page: null, x: 0, y: 0, width: 0, height: 0 };
				this.actionType = 'none';
				this.pendingFieldKey = "";
			},

			removeSignPos(index) {
				const newList = this.signPositions.slice();
				newList.splice(index, 1);
				this.$emit("input", newList);
				this.$emit("change", newList);
			},
			
			removeTextPos(index) {
				const newList = this.textPositions.slice();
				newList.splice(index, 1);
				this.$emit("text-change", newList);
			},

			gotoPosition(pos) {
				const targetPage = pos.page === 0 ? this.totalPage : pos.page;
				if (targetPage !== this.currentPage) {
					this.currentPage = targetPage;
					this.clearPendingBox();
					this.renderPage(targetPage);
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.sign-position-wrap {
		position: relative;
		width: 100%; /* 确保容器宽度撑满 */

		.tips-bar {
			margin-bottom: 10px;
			line-height: 1.5;
		}
		
		.page-bar { 
			margin-bottom: 10px; 
			display: flex; 
			align-items: center; 
		}

		.canvas-wrap {
			position: relative;
			display: block; /* 改为 block */
			width: 100%; /* 撑满父容器 */
			border: 1px solid #dcdfe6;
			cursor: crosshair;
			user-select: none;
			overflow: hidden;
			touch-action: none;
			line-height: 0;
			background-color: #f5f7fa;
			padding: 10px; /* 内边距，避免贴边 */
			box-sizing: border-box;
			text-align: center; /* 居中画布 */
		}
		
		/* Canvas 居中显示 */
		canvas { 
			display: inline-block; 
			max-width: none; 
			box-shadow: 0 0 10px rgba(0,0,0,0.1);
		}

		.drag-box {
			position: absolute;
			border: 1px dashed #409eff;
			background: rgba(64, 158, 255, 0.1);
			pointer-events: none;
			box-sizing: border-box;
			
			&.is-text {
				border-color: #e6a23c;
				background: rgba(230, 162, 60, 0.1);
			}
		}

		.confirm-box {
			position: absolute;
			pointer-events: none;
			box-sizing: border-box;

			&.sign-box {
				border: 2px solid #67c23a;
				background: rgba(103, 194, 58, 0.1);
			}

			&.text-box {
				border: 2px dashed #e6a23c;
				background: rgba(230, 162, 60, 0.1);
			}

			&.pending {
				pointer-events: auto;
				cursor: move;
				border: 2px solid #409eff;
				background: rgba(64, 158, 255, 0.15);

				&.is-text {
					border-style: dashed;
					border-color: #e6a23c;
					background: rgba(230, 162, 60, 0.15);
				}
			}

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
				pointer-events: none;
			}
			
			&.text-box .box-tip,
			&.pending.is-text .box-tip {
				background: #e6a23c;
			}

			.handle {
				position: absolute;
				width: 10px;
				height: 10px;
				background: #fff;
				border: 2px solid #e6a23c;
				border-radius: 50%;
				z-index: 10;
			}
			.handle.tl { top: -6px; left: -6px; cursor: nwse-resize; }
			.handle.tr { top: -6px; right: -6px; cursor: nesw-resize; }
			.handle.bl { bottom: -6px; left: -6px; cursor: nesw-resize; }
			.handle.br { bottom: -6px; right: -6px; cursor: nwse-resize; }
		}

		.result { margin-top: 15px; max-width: 100%; }
	}
</style>