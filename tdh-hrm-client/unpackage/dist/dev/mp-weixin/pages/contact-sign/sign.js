"use strict";
const common_vendor = require("../../common/vendor.js");
const pickerColor = () => "./pickerColor.js";
const customToast = () => "../../components/custom-toast/custom-toast.js";
const _sfc_main = {
  components: {
    pickerColor,
    customToast
  },
  data() {
    return {
      _id: "",
      contractData: null,
      showSignBoard: false,
      refreshing: false,
      loading: false,
      lastSignatureUrl: "",
      // ======== 签名板原有配置及状态 ========
      showPickerColor: false,
      ctx: "",
      canvasWidth: 0,
      canvasHeight: 0,
      selectColor: "black",
      lineColor: "#1A1A1A",
      points: [],
      historyList: [],
      currentStrokePoints: [],
      pointQueue: [],
      rafId: null,
      isDrawing: false,
      isReplaying: false,
      canAddHistory: true,
      requestAnimationFrame: null,
      // 兼容函数
      cancelAnimationFrame: null,
      // 兼容函数
      toDataURL: void 0,
      // 签名板配置参数
      minSpeed: 1.5,
      minWidth: 3,
      maxWidth: 10,
      openSmooth: true,
      maxHistoryLength: 20,
      maxWidthDiffRate: 20,
      bgColor: ""
    };
  },
  onLoad(options) {
    this._id = options._id || "";
    if (!this._id) {
      this.$refs.toast.showToast("参数错误");
      return;
    }
    this.loadDetail();
    this.ctx = common_vendor.index.createCanvasContext("handWriting");
    this.requestAnimationFrame = (fn) => {
      if (typeof requestAnimationFrame === "function") {
        return requestAnimationFrame(fn);
      } else if (typeof common_vendor.index.requestAnimationFrame === "function") {
        return common_vendor.index.requestAnimationFrame(fn);
      } else {
        return setTimeout(fn, 16);
      }
    };
    this.cancelAnimationFrame = (id) => {
      if (typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(id);
      } else if (typeof common_vendor.index.cancelAnimationFrame === "function") {
        common_vendor.index.cancelAnimationFrame(id);
      } else {
        clearTimeout(id);
      }
    };
  },
  methods: {
    closeSignBoard() {
      this.showSignBoard = false;
    },
    /* ========== 加载合同详情 ========== */
    async loadDetail(fromRefresh = false) {
      var _a;
      if (this.loading)
        return;
      this.loading = true;
      if (fromRefresh)
        this.refreshing = true;
      try {
        const card = vk.getVuex("$user.employeeInfo.card") || "";
        const res = await vk.callFunction({
          url: "admin/hrm/contract-sign/sys/getDetail",
          data: {
            _id: this._id,
            card
          }
        });
        if (res.code === 0) {
          this.contractData = res.rows[0] || {};
          this.lastSignatureUrl = ((_a = res.extra) == null ? void 0 : _a.lastSignatureUrl) || "";
        } else {
          this.$refs.toast.showToast(res.msg || "获取合同失败");
        }
      } catch (e) {
        this.$refs.toast.showToast("网络异常");
      } finally {
        this.loading = false;
        if (fromRefresh)
          this.refreshing = false;
      }
    },
    onRefresh() {
      if (!this.loading)
        this.loadDetail(true);
    },
    previewFile() {
      const url = this.contractData.contract_sign_file;
      if (!url)
        return;
      common_vendor.index.previewFile ? common_vendor.index.previewFile({ url }) : common_vendor.index.downloadFile({
        url,
        success: (r) => common_vendor.index.openDocument({ filePath: r.tempFilePath })
      });
    },
    formatDate(val) {
      if (!val)
        return "";
      const d = new Date(val);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    /* ========== 签名板逻辑 ========== */
    openSignBoard() {
      this.showSignBoard = true;
      this.$nextTick(() => this.getCanvasSize());
    },
    getCanvasSize() {
      common_vendor.index.createSelectorQuery().select(".handCenter").boundingClientRect((rect) => {
        if (rect == null ? void 0 : rect.width) {
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
        this.$refs.toast.showToast("请先签名");
        return;
      }
      try {
        let signatureUrl = this.lastSignatureUrl;
        if (!signatureUrl) {
          this.$refs.toast.showLoading("正在生成签名...");
          const tempPath = await this.getTempFilePath();
          const imgInfo = await new Promise(
            (res, rej) => common_vendor.index.getImageInfo({ src: tempPath, success: res, fail: rej })
          );
          const { width, height } = imgInfo;
          const nodeInfo = await new Promise((res, rej) => {
            common_vendor.index.createSelectorQuery().in(this).select("#rotateCanvas").node().exec((r) => {
              r[0] ? res(r[0]) : rej("canvas error");
            });
          });
          const canvas = nodeInfo.node;
          const ctx = canvas.getContext("2d");
          canvas.width = height;
          canvas.height = width;
          const img = canvas.createImage();
          img.src = tempPath;
          await new Promise((r) => img.onload = r);
          ctx.translate(height / 2, width / 2);
          ctx.rotate(-90 * Math.PI / 180);
          ctx.drawImage(img, -width / 2, -height / 2);
          const rotatedPath = await new Promise(
            (res, rej) => common_vendor.index.canvasToTempFilePath({ canvas, fileType: "png", success: res, fail: rej })
          );
          const cloudPath = `public/contract/signature/${this._id}_${Date.now()}.png`;
          const uploadOptionRes = await vk.callFunction({
            url: "common/pub/getUploadFileOptions/index",
            data: { cloudPath }
          });
          if (uploadOptionRes.code !== 0) {
            throw new Error("获取上传参数失败");
          }
          await new Promise((res, rej) => {
            common_vendor.index.uploadFile({
              ...uploadOptionRes.rows.uploadFileOptions,
              filePath: rotatedPath.tempFilePath,
              success: res,
              fail: rej
            });
          });
          signatureUrl = `https://tdhstorage.cntdh.net/${cloudPath}`;
        }
        this.$refs.toast.showLoading("正在合成合同...");
        const signRes = await vk.callFunction({
          url: "admin/hrm/contract-sign/sys/updatePdf",
          data: {
            _id: this._id,
            signature_url: signatureUrl
          }
        });
        this.$refs.toast.hide();
        if (signRes.code === 0) {
          this.$refs.toast.showToast("合同签署成功");
          setTimeout(() => common_vendor.index.navigateBack(), 1500);
        } else {
          this.$refs.toast.showToast(signRes.msg || "签署失败");
        }
      } catch (e) {
        this.$refs.toast.hide();
        this.$refs.toast.showToast("签署失败");
        common_vendor.index.__f__("error", "at pages/contact-sign/sign.vue:344", e);
      }
    },
    /* ========== 以下为原签名板完整绘制逻辑 ========== */
    getTempFilePath() {
      return new Promise((resolve, reject) => {
        common_vendor.index.canvasToTempFilePath({
          canvasId: "handWriting",
          fileType: "png",
          quality: 1,
          success: (res) => resolve(res.tempFilePath),
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
      this.pointQueue.push({ x: touch.x, y: touch.y, t: Date.now() });
      this.startRenderLoop();
    },
    startRenderLoop() {
      const render = () => {
        if (!this.isDrawing)
          return;
        this.processQueue();
        this.rafId = this.requestAnimationFrame(render);
      };
      this.rafId = this.requestAnimationFrame(render);
    },
    uploadScaleMove(e) {
      if (!this.isDrawing)
        return;
      const touch = e.changedTouches[0];
      this.pointQueue.push({ x: touch.x, y: touch.y, t: Date.now() });
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
      if (!this.pointQueue.length)
        return;
      const queue = this.pointQueue;
      this.pointQueue = [];
      this.canAddHistory = false;
      queue.forEach((pointData) => {
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
      var point = { x, y, t: Date.now() };
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
      if (typeof prePoint.lastX1 === "number") {
        this.drawCurveLine(prePoint.lastX2, prePoint.lastY2, prePoint.x, prePoint.y, point.lastX1, point.lastY1, point.perLineWidth);
        if (prePoint.isFirstPoint)
          return;
        if (prePoint.lastX1 === prePoint.lastX2 && prePoint.lastY1 === prePoint.lastY2)
          return;
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
      if (typeof prePoint.lastX === "number") {
        this.drawCurveLine(prePoint.lastX, prePoint.lastY, prePoint.x, prePoint.y, point.lastX, point.lastY, this.maxWidth);
      }
    },
    drawCurveLine(x1, y1, x2, y2, x3, y3, lineWidth) {
      lineWidth = Number(lineWidth.toFixed(1));
      this.ctx.setLineWidth && this.ctx.setLineWidth(lineWidth);
      this.ctx.lineWidth = lineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(Number(x1.toFixed(1)), Number(y1.toFixed(1)));
      this.ctx.quadraticCurveTo(Number(x2.toFixed(1)), Number(y2.toFixed(1)), Number(x3.toFixed(1)), Number(y3.toFixed(1)));
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
      if (dis_x === 0)
        return { val: 0, pos: -1 };
      if (dis_y === 0)
        return { val: 0, pos: 1 };
      var val = Math.abs(Math.atan(dis_y / dis_x));
      if (x2 > x1 && y2 < y1 || x2 < x1 && y2 > y1) {
        return { val, pos: 1 };
      }
      return { val, pos: -1 };
    },
    getRadianPoints(radianData, x, y, halfLineWidth) {
      if (radianData.val === 0) {
        if (radianData.pos === 1) {
          return [{ x, y: y + halfLineWidth }, { x, y: y - halfLineWidth }];
        }
        return [{ y, x: x + halfLineWidth }, { y, x: x - halfLineWidth }];
      }
      var dis_x = Math.sin(radianData.val) * halfLineWidth;
      var dis_y = Math.cos(radianData.val) * halfLineWidth;
      if (radianData.pos === 1) {
        return [{ x: x + dis_x, y: y + dis_y }, { x: x - dis_x, y: y - dis_y }];
      }
      return [{ x: x + dis_x, y: y - dis_y }, { x: x - dis_x, y: y + dis_y }];
    },
    drawByImage(url) {
      if (!this.canvasWidth || !this.canvasHeight)
        return;
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      common_vendor.index.getImageInfo({
        src: url,
        success: (res) => {
          const { width, height, path } = res;
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
          common_vendor.index.__f__("error", "at pages/contact-sign/sign.vue:581", "加载历史签名失败", err);
        }
      });
    },
    clear() {
      if (!this.canvasWidth || !this.canvasHeight)
        return;
      const color = this.bgColor || "#ffffff";
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
      const color = this.bgColor || "#ffffff";
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
      this.historyList.forEach((strokePoints) => {
        this.replayStroke(strokePoints);
      });
      this.isReplaying = false;
      if (this.historyList.length === 0 && !this.lastSignatureUrl) {
        this.clearCanvasOnly();
      }
    },
    replayStroke(pointsArray) {
      if (!pointsArray || pointsArray.length === 0)
        return;
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
      this.ctx.setStrokeStyle(this.lineColor);
    },
    previewCanvasImg() {
      common_vendor.index.canvasToTempFilePath({
        canvasId: "handWriting",
        fileType: "png",
        quality: 1,
        success(res) {
          common_vendor.index.previewImage({
            urls: [res.tempFilePath]
          });
        }
      });
    }
  }
};
if (!Array) {
  const _component_u_refresh = common_vendor.resolveComponent("u-refresh");
  const _component_pickerColor = common_vendor.resolveComponent("pickerColor");
  const _easycom_custom_toast2 = common_vendor.resolveComponent("custom-toast");
  (_component_u_refresh + _component_pickerColor + _easycom_custom_toast2)();
}
const _easycom_custom_toast = () => "../../components/custom-toast/custom-toast.js";
if (!Math) {
  _easycom_custom_toast();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return common_vendor.e({
    a: !$data.showSignBoard
  }, !$data.showSignBoard ? common_vendor.e({
    b: common_vendor.o($options.onRefresh, "e1"),
    c: common_vendor.p({
      ["refresher-triggered"]: $data.refreshing
    }),
    d: $data.contractData
  }, $data.contractData ? common_vendor.e({
    e: common_vendor.t($data.contractData.status === 1 ? "已签署" : "未签署"),
    f: common_vendor.n($data.contractData.status === 1 ? "signed" : "unsigned"),
    g: common_vendor.t(((_a = $data.contractData.contractInfo) == null ? void 0 : _a.contract_sign_name) || "-"),
    h: common_vendor.t($options.formatDate($data.contractData.sign_date) || "-"),
    i: common_vendor.t($options.formatDate($data.contractData.end_date) || "-"),
    j: $data.contractData.contract_sign_file
  }, $data.contractData.contract_sign_file ? {
    k: common_vendor.o((...args) => $options.previewFile && $options.previewFile(...args), "c7")
  } : {}) : {}, {
    l: $data.contractData
  }, $data.contractData ? {} : {}, {
    m: $data.refreshing,
    n: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args), "7f"),
    o: $data.contractData && $data.contractData.status !== 1
  }, $data.contractData && $data.contractData.status !== 1 ? {
    p: common_vendor.o((...args) => $options.openSignBoard && $options.openSignBoard(...args), "6d")
  } : $data.contractData && $data.contractData.status === 1 ? {} : {}, {
    q: $data.contractData && $data.contractData.status === 1
  }) : common_vendor.e({
    r: common_vendor.o(($event) => $options.selectColorEvent("black", "#1A1A1A"), "38"),
    s: $data.selectColor === "black" ? "/static/other/color_black_selected.png" : "/static/other/color_black.png",
    t: $data.selectColor === "red" ? "/static/other/color_red_selected.png" : "/static/other/color_red.png",
    v: common_vendor.o((...args) => $options.clear && $options.clear(...args), "9c"),
    w: $data.lastSignatureUrl,
    x: common_vendor.o((...args) => $options.previewCanvasImg && $options.previewCanvasImg(...args), "d5"),
    y: $data.lastSignatureUrl,
    z: common_vendor.o((...args) => $options.undo && $options.undo(...args), "a9"),
    A: $data.lastSignatureUrl,
    B: common_vendor.o((...args) => $options.closeSignBoard && $options.closeSignBoard(...args), "3c"),
    C: common_vendor.o((...args) => $options.submitSign && $options.submitSign(...args), "5a"),
    D: common_vendor.o((...args) => $options.uploadScaleStart && $options.uploadScaleStart(...args), "d1"),
    E: common_vendor.o((...args) => $options.uploadScaleMove && $options.uploadScaleMove(...args), "7b"),
    F: common_vendor.o((...args) => $options.uploadScaleEnd && $options.uploadScaleEnd(...args), "05"),
    G: $data.showPickerColor
  }, $data.showPickerColor ? {
    H: common_vendor.o($options.getPickerColor, "c3"),
    I: common_vendor.p({
      isShow: $data.showPickerColor,
      bottom: 0
    })
  } : {}), {
    J: common_vendor.sr("toast", "8ed2ed6a-2")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8ed2ed6a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/contact-sign/sign.js.map
