<template>
	<view class="sign-page">
		<!-- ================= 工资明细区域（不含按钮，滚动内容） ================= -->
		<view class="detail-container" v-if="!showSignBoard">
			<!-- 可滚动区域 -->
			<scroll-view class="detail-scroll" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing"
				@refresherrefresh="onRefresh">
				<u-refresh slot="refresher" :refresher-triggered="refreshing" @refresh="onRefresh"></u-refresh>

				<!-- 薪资卡片 -->
				<view class="detail-card" v-if="salaryData">
				  <view class="detail-header">
				    <text class="name">{{ salaryData.department_name }}</text>
				    <text class="ym">{{ formatDate(salaryData.attendance_ym) }}</text>
				  </view>
				
				  <!-- 第一块：应发工资 -->
				  <view class="group">
				    <!-- <view class="group-title">应发工资</view> -->
				    <view class="detail-body" v-for="key in group1" :key="key">
				      <!-- 加粗应发工资行 -->
				      <view class="row" v-if="salaryData[key]" :class="{ 'gross-row': key === 'gross_salary' }">
				        <text class="label">{{ fieldLabels[key] }}</text>
				        <text class="value">{{ salaryData[key] }}</text>
				      </view>
				    </view>
				  </view>
				
				  <!-- 第二块：应扣项 -->
				  <view class="group">
				    <view class="group-title">应扣项</view>
				    <view class="detail-body" v-for="key in group2" :key="key">
				      <view class="row" v-if="salaryData[key]">
				        <text class="label">{{ fieldLabels[key] }}</text>
				        <text class="value">{{ salaryData[key] }}</text>
				      </view>
				    </view>
				  </view>
				
				  <!-- 第三块：实发工资（加粗加大） -->
				  <view class="row real-salary-row" v-if="salaryData.real_salary">
				    <text class="real-salary-label">实发工资</text>
				    <text class="real-salary-value">{{ salaryData.real_salary }}</text>
				  </view>		  
				
				  <!-- 第四块：其他 
				  <view class="group">
				    <view class="group-title" >其他</view>
				    <view class="detail-body" v-for="key in group4" :key="key">
				      <view class="row" v-if="salaryData[key]">
				        <text class="label">{{ fieldLabels[key] }}</text>
				        <text class="value">{{ salaryData[key] }}</text>
				      </view>
				    </view>
				  </view>-->
				</view>
				<view v-else class="loading-detail">加载明细中...</view>
				<!-- 温馨提醒 -->
				<view class="reminder" v-if="salaryData">
				  <text>温馨提醒：请尊重薪酬隐私，不打听不泄露；核对工资后签名，有疑问请3日内联系人事，逾期未签名将视同无异议。</text>
				</view>
			</scroll-view>

			<!-- ====== 签名按钮（固定在底部） ====== -->
			<view class="btn-sign-wrapper">
				<button class="btn-sign" @click="openSignBoard">签 名</button>
			</view>
		</view>

		<!-- ================= 原始签名板区域（不变） ================= -->
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
					<view class="handTitle">请签名</view>
				</view>
			</view>
			<!-- 隐藏的用于旋转导出的 Canvas -->
			<canvas type="2d" id="rotateCanvas" style="position: absolute; left: -9999px; top: -9999px;"></canvas>
			<pickerColor :isShow="showPickerColor" :bottom="0" @callback='getPickerColor' />
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
				attendance_ym: '',
				salaryData: null,
				showSignBoard: false,
				refreshing: false,
				loading: false,
				lastSignatureUrl: '', // 新增：历史签名图片URL
				fieldLabels: {
					base_salary: '基本工资',
					performance_salary: '绩效工资',
					overtime_fee: '固定加班',
					penalty_fund: "社保补偿金",
					housing_fund: "公积补偿金",
					annual_allowance: "年度补偿金",
					floating_bonus: "浮动奖励",
					confidentiality_fee: "保密费",
					work_days: "应勤天数",
					real_days: "实际出勤",
					gross_salary: '应发工资',
					overtime_cost: "加班费",
					free_cost: "放假补助",
					grant: "补助",
					agency_fee: "介绍费",
					other_cost: "其它",
					we_cost: '水电',
					clothes_cost: "工衣",
					earlytime_cost: "迟到早退",
					missed_cost: "未打卡",
					loan_cost: '借款',
					this_month_sb: "本月社保",
					this_month_dk: "本月代扣部份",
					dkgs: "代扣个税",
					real_salary: '实发工资',
					company_sb: "公司部份社保",
					company_gjj: "公司部份公积金",
					last_month_sb: "下月社保",
					last_month_gjj: "下月公积金"
				},
				group1: [
					'base_salary', 'performance_salary', 'overtime_fee',
					'penalty_fund', 'housing_fund', 'annual_allowance',
					'floating_bonus', 'confidentiality_fee', 'work_days',
					'real_days', 'gross_salary', 'overtime_cost',
					'free_cost', 'grant', 'agency_fee', 'other_cost'
				],
				group2: [
					'we_cost', 'clothes_cost', 'earlytime_cost',
					'missed_cost', 'loan_cost', 'this_month_sb',
					'this_month_dk', 'dkgs'
				],
				group3: ['real_salary'],
				group4: [
					'company_sb', 'company_gjj',
					'last_month_sb', 'last_month_gjj'
				],
				showPickerColor: false,
				ctx: '',
				canvasWidth: 0,
				canvasHeight: 0,
				selectColor: 'black',
				lineColor: '#1A1A1A',
				points: [],
				historyList: [],
				canAddHistory: true,
				getImagePath: () => {
					return new Promise((resolve) => {
						uni.canvasToTempFilePath({
							canvasId: 'handWriting',
							fileType: 'png',
							quality: 1,
							success: res => resolve(res.tempFilePath),
						})
					})
				},
				toDataURL: void 0,
				requestAnimationFrame: void 0,
			};
		},
		props: {
			minSpeed: {
				type: Number,
				default: 1.5
			},
			minWidth: {
				type: Number,
				default: 3
			},
			maxWidth: {
				type: Number,
				default: 10
			},
			openSmooth: {
				type: Boolean,
				default: true
			},
			maxHistoryLength: {
				type: Number,
				default: 20
			},
			maxWidthDiffRate: {
				type: Number,
				default: 20
			},
			bgColor: {
				type: String,
				default: ''
			},
		},
		onLoad(options) {
			this._id = options._id || '';
			this.attendance_ym = options.attendance_ym || '';
			this.loadDetail();
			this.ctx = uni.createCanvasContext("handWriting");
		},
		methods: {
			closeSignBoard() {
				this.showSignBoard = false;
			},

			// ================= 加载明细（支持下拉刷新） =================
			async loadDetail(fromRefresh = false) {
				if (this.loading) return;
				this.loading = true;
				if (fromRefresh) {
					this.refreshing = true;
				}
				const card = vk.getVuex('$user.employeeInfo.card') || '';
				try {
					if (!this._id && !this.attendance_ym) {
						this.$refs.toast.showToast('参数错误');
						return;
					}
					const res = await vk.callFunction({
						url: 'admin/hrm/salary/sys/payslip/getDetail',
						data: {
							_id: this._id,
							card
						}
					});
					if (res.code === 0) {
						this.salaryData = res.rows[0] || {};
						const extra = res.extra;
						// 新增：如果当前工资条已有签名，则保存为历史签名
						if (extra.lastSignatureUrl) {
							this.lastSignatureUrl = extra.lastSignatureUrl;
						} else {
							this.lastSignatureUrl = ''; // 无历史签名
						}
					} else {
						this.$refs.toast.showToast(res.msg || '获取薪资失败');
					}
				} catch (e) {
					this.$refs.toast.showToast('网络异常');
					console.error(e);
				} finally {
					this.loading = false;
					if (fromRefresh) {
						this.refreshing = false;
					}
				}
			},

			// 下拉刷新处理
			onRefresh() {
				if (this.loading) return;
				this.loadDetail(true);
			},

			formatDate(val) {
				if (!val) return '';
				const d = new Date(val);
				return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月`;
			},
			openSignBoard() {
				this.showSignBoard = true;
				this.$nextTick(() => {
					this.getCanvasSize();
				});
			},
			// 修改 getCanvasSize，加载历史签名
			getCanvasSize() {
				uni.createSelectorQuery().select('.handCenter').boundingClientRect(rect => {
					if (rect && rect.width) {
						this.canvasWidth = rect.width;
						this.canvasHeight = rect.height;
						this.clear(); // 清空并重置历史列表
						if (this.lastSignatureUrl) {
							this.historyList.push(this.lastSignatureUrl); // 加入历史，支持撤销
							this.drawByImage(this.lastSignatureUrl);
						}
					} else {
						setTimeout(this.getCanvasSize, 100);
					}
				}).exec();
			},
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
			// ================= 提交签名（横屏导出） =================
			async submitSign() {
				if (this.isEmpty()) {
					this.$refs.toast.showToast('请先签名');
					return;
				}

				try {
					this.$refs.toast.showLoading('正在生成并提交...');

					// 1. 拿到原始的竖屏临时路径
					const tempPath = await this.getTempFilePath();

					// 2. 获取图片的宽高
					const imgInfo = await new Promise((resolve, reject) => {
						uni.getImageInfo({
							src: tempPath,
							success: resolve,
							fail: reject
						});
					});
					const {
						width,
						height
					} = imgInfo;

					// 3. 查找到隐藏的 type="2d" Canvas 节点
					const nodeInfo = await new Promise((resolve, reject) => {
						const query = uni.createSelectorQuery().in(this);
						query.select('#rotateCanvas').node().exec((res) => {
							if (res && res[0]) {
								resolve(res[0]);
							} else {
								reject(new Error('获取 Canvas 节点失败'));
							}
						});
					});

					const canvas = nodeInfo.node;
					const ctx = canvas.getContext('2d');

					// 4. 交换宽高，让画布变成横屏的大小
					canvas.width = height;
					canvas.height = width;

					// 创建图片对象，并将原图载入
					const img = canvas.createImage();
					img.src = tempPath;
					await new Promise((resolve, reject) => {
						img.onload = resolve;
						img.onerror = reject;
					});

					// 5. 旋转画布 90 度，并居中绘制
					ctx.translate(height / 2, width / 2);
					ctx.rotate(-90 * Math.PI / 180);
					ctx.drawImage(img, -width / 2, -height / 2);

					// 6. 从这个旋转后的横屏 Canvas 中导出最终的图片
					const rotatedFilePath = await new Promise((resolve, reject) => {
						uni.canvasToTempFilePath({
							canvas: canvas,
							fileType: 'png',
							quality: 1,
							success: (res) => resolve(res.tempFilePath),
							fail: reject
						});
					});

					// 7. 上传旋转后的横屏图片
					const uploadRes = await uniCloud.uploadFile({
						filePath: rotatedFilePath,
						cloudPathAsRealPath: true,
						cloudPath: `signature/${this.attendance_ym}_${Date.now()}.png`,
					});
					const fileID = uploadRes.fileID;

					const saveRes = await vk.callFunction({
						url: 'admin/hrm/salary/sys/payslip/update',
						data: {
							_id: this._id,
							signature_url: fileID,
							status: 1
						},
					});

					this.$refs.toast.hide();
					if (saveRes.code === 0) {
						this.$refs.toast.showToast('签名成功');
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					} else {
						this.$refs.toast.showToast(saveRes.msg || '提交失败');
					}
				} catch (e) {
					this.$refs.toast.hide();
					this.$refs.toast.showToast('操作失败');
					console.error(e);
				}
			},
			getPickerColor(color) {
				this.showPickerColor = false;
				if (color) {
					this.lineColor = color;
				}
			},
			uploadScaleStart(e) {
				this.canAddHistory = true
				this.ctx.setStrokeStyle(this.lineColor)
				this.ctx.setLineCap("round")
			},
			uploadScaleMove(e) {
				let temX = e.changedTouches[0].x
				let temY = e.changedTouches[0].y
				this.initPoint(temX, temY)
				this.onDraw()
			},
			uploadScaleEnd() {
				this.canAddHistory = true;
				this.points = [];
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
					if (prePoint2 && prePoint2.lineWidth && prePoint.lineWidth) {
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
			onDraw() {
				if (this.points.length < 2) return;
				this.addHistory();
				var point = this.points.slice(-1)[0];
				var prePoint = this.points.slice(-2, -1)[0];
				let that = this
				var onDraw = function onDraw() {
					if (that.openSmooth) {
						that.drawSmoothLine(prePoint, point);
					} else {
						that.drawNoSmoothLine(prePoint, point);
					}
				};
				if (typeof this.requestAnimationFrame === 'function') {
					this.requestAnimationFrame(function() {
						return onDraw();
					});
				} else {
					onDraw();
				}
			},
			addHistory() {
				if (!this.maxHistoryLength || !this.canAddHistory) return;
				this.canAddHistory = false;
				if (!this.getImagePath) {
					this.historyList.length++;
					return;
				}
				let that = this
				that.getImagePath().then(function(url) {
					if (url) {
						that.historyList.push(url)
						that.historyList = that.historyList.slice(-that.maxHistoryLength);
					}
				});
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
				this.ctx.draw && this.ctx.draw(true);
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
				this.ctx.draw && this.ctx.draw(true);
			},
			getRadianData(x1, y1, x2, y2) {
				var dis_x = x2 - x1;
				var dis_y = y2 - y1;
				if (dis_x === 0) {
					return {
						val: 0,
						pos: -1
					};
				}
				if (dis_y === 0) {
					return {
						val: 0,
						pos: 1
					};
				}
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
			drawBgColor() {
				if (!this.bgColor || !this.canvasWidth || !this.canvasHeight) return;
				this.ctx.setFillStyle && this.ctx.setFillStyle(this.bgColor);
				this.ctx.fillStyle = this.bgColor;
				this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
				this.ctx.draw && this.ctx.draw(true);
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
							// 横屏图片 -> 顺时针旋转90度，并居中缩放显示
							this.ctx.save();
							this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
							this.ctx.rotate(90 * Math.PI / 180); // 顺时针 90°
							// 计算缩放比例，使图片完全显示在画布内（等比例）
							const scaleX = this.canvasHeight / width;
							const scaleY = this.canvasWidth / height;
							const scale = Math.min(scaleX, scaleY);
							const drawWidth = width * scale;
							const drawHeight = height * scale;
							this.ctx.drawImage(path, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
							this.ctx.restore();
						} else {
							// 竖屏图片直接拉伸填满
							this.ctx.drawImage(path, 0, 0, this.canvasWidth, this.canvasHeight);
						}
						this.ctx.draw(true);
					},
					fail: (err) => {
						console.error('加载历史签名失败', err);
						this.historyList.length = 0;
					}
				});
			},
			clear() {
				if (!this.canvasWidth || !this.canvasHeight) {
					return;
				}
				const color = this.bgColor || '#ffffff';
				this.ctx.setFillStyle && this.ctx.setFillStyle(color);
				this.ctx.fillStyle = color;
				this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
				this.ctx.draw && this.ctx.draw(true);
				this.historyList.length = 0;
			},
			undo() {
				if (!this.getImagePath || !this.historyList.length) return;
				var pngURL = this.historyList.splice(-1)[0];
				this.drawByImage(pngURL);
				if (this.historyList.length === 0) {
					this.clear();
				}
			},
			isEmpty() {
				return this.historyList.length === 0;
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

<style>
	/* 全局基础 */
	page {
		height: 100%;
		overflow: hidden;
		background: #fbfbfb;
	}

	.sign-page {
		height: 100vh;
		background: #fbfbfb;
		display: flex;
		flex-direction: column;
	}
	
	/* 分组容器，添加分割线 */
	.group {
	  border-bottom: 1rpx solid #f0f0f0;
	  padding: 10rpx 0;
	}
	.group:last-child {
	  border-bottom: none;
	}
	
	/* 分组标题 */
	.group-title {
	  font-size: 30rpx;
	  font-weight: bold;
	  color: #333;
	  padding: 10rpx 0 6rpx 0;
	}
	
	/* 应发工资行加粗 */
	.gross-row .label,
	.gross-row .value {
	  font-weight: bold;
	  font-size: 30rpx; /* 稍大于普通行（28rpx） */
	}
	
	.real-salary-row {
	  display: flex;
	  justify-content: space-between;
	  font-size: 30rpx;        /* 与 detail-header 一致 */
	  font-weight: bold;       /* 加粗 */
	  padding: 20rpx 0;
	  border-bottom: 1rpx solid #eee; /* 与 detail-header 下边框一致 */
	}
	.real-salary-label,
	.real-salary-value {
	  color: #333;             /* 与 detail-header 文字颜色一致 */
	}
	
	.reminder {
	  padding: 20rpx 24rpx;
	  margin-top: 20rpx;
	  background: #f9f9f9;
	  border-radius: 12rpx;
	  font-size: 24rpx;
	  color: #999;
	  line-height: 1.8;
	  text-align: justify;
	  border-left: 6rpx solid #f56c6c;
	}
	
	/* 原有 .row 样式保持不变，但可微调 */
	.detail-body .row {
	  display: flex;
	  justify-content: space-between;
	  padding: 14rpx 0;
	  font-size: 28rpx;
	  border-bottom: 1rpx solid #f6f6f6;
	}
	.detail-body .row:last-child {
	  border-bottom: none;
	}

	/* ================= 明细容器（Flex 列，填满剩余空间） ================= */
	.detail-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		/* 防止内容撑大，允许 flex 收缩 */
		overflow: hidden;
		background: #fbfbfb;
	}

	/* 滚动区域：flex:1 + height:0 撑满剩余高度，启用内部滚动 */
	.detail-scroll {
		flex: 1;
		height: 0;
		/* 配合 flex:1 正确计算高度 */
		min-height: 0;
		overflow: hidden;
		/* 避免外部溢出 */
		padding: 20rpx 20rpx 0 20rpx;
		box-sizing: border-box;
	}

	/* 薪资卡片样式（保持不变） */
	.detail-card {
		background: #fff;
		padding: 20rpx;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
	}

	.detail-header {
		display: flex;
		justify-content: space-between;
		font-size: 32rpx;
		font-weight: bold;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #eee;
	}

	.detail-body .row {
		display: flex;
		justify-content: space-between;
		padding: 14rpx 0;
		border-bottom: 1rpx solid #f6f6f6;
		font-size: 28rpx;
	}

	.detail-body .row:last-child {
		border-bottom: 1rpx solid #f6f6f6;
	}

	.loading-detail {
		text-align: center;
		padding: 80rpx 0;
		color: #999;
	}

	/* 签名按钮包装器：固定底部，不压缩 */
	.btn-sign-wrapper {
		flex-shrink: 0;
		padding: 20rpx 20rpx 30rpx;
		background: #fbfbfb;
		display: flex;
		justify-content: center;
	}

	.btn-sign {
		width: 80%;
		background: #008ef6;
		color: #fff;
		border-radius: 50rpx;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 36rpx;
		border: none;
		outline: none;
	}

	/* ================= 签名板样式（未改动） ================= */
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
		border: 4rpx dashed #e9e9e9;
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