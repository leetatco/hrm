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
      attendance_ym: "",
      salaryData: null,
      showSignBoard: false,
      refreshing: false,
      loading: false,
      lastSignatureUrl: "",
      // 历史签名图片URL
      fieldLabels: {
        base_salary: "基本工资",
        performance_salary: "绩效工资",
        overtime_fee: "固定加班",
        penalty_fund: "社保补偿金",
        housing_fund: "公积补偿金",
        annual_allowance: "年度补偿金",
        floating_bonus: "浮动奖励",
        confidentiality_fee: "保密费",
        work_days: "应勤天数",
        real_days: "实际出勤",
        gross_salary: "应发工资",
        overtime_cost: "加班费",
        free_cost: "放假补助",
        grant: "补助",
        agency_fee: "介绍费",
        other_cost: "其它",
        we_cost: "水电",
        clothes_cost: "工衣",
        earlytime_cost: "迟到早退",
        missed_cost: "未打卡",
        loan_cost: "借款",
        this_month_sb: "本月社保",
        this_month_dk: "本月代扣部份",
        dkgs: "代扣个税",
        real_salary: "实发工资",
        company_sb: "公司部份社保",
        company_gjj: "公司部份公积金",
        last_month_sb: "下月社保",
        last_month_gjj: "下月公积金"
      },
      group1: [
        "base_salary",
        "performance_salary",
        "overtime_fee",
        "penalty_fund",
        "housing_fund",
        "annual_allowance",
        "floating_bonus",
        "confidentiality_fee",
        "work_days",
        "real_days",
        "gross_salary",
        "overtime_cost",
        "free_cost",
        "grant",
        "agency_fee",
        "other_cost"
      ],
      group2: [
        "we_cost",
        "clothes_cost",
        "earlytime_cost",
        "missed_cost",
        "loan_cost",
        "this_month_sb",
        "this_month_dk",
        "dkgs"
      ],
      group3: ["real_salary"],
      group4: [
        "company_sb",
        "company_gjj",
        "last_month_sb",
        "last_month_gjj"
      ],
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
      getImagePath: () => {
        return new Promise((resolve) => {
          common_vendor.index.canvasToTempFilePath({
            canvasId: "handWriting",
            fileType: "png",
            quality: 1,
            success: (res) => resolve(res.tempFilePath)
          });
        });
      },
      toDataURL: void 0
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
      default: ""
    }
  },
  onLoad(options) {
    this._id = options._id || "";
    this.attendance_ym = options.attendance_ym || "";
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
    // ================= 加载明细（支持下拉刷新） =================
    async loadDetail(fromRefresh = false) {
      if (this.loading)
        return;
      this.loading = true;
      if (fromRefresh) {
        this.refreshing = true;
      }
      const card = vk.getVuex("$user.employeeInfo.card") || "";
      try {
        if (!this._id && !this.attendance_ym) {
          this.$refs.toast.showToast("参数错误");
          return;
        }
        const res = await vk.callFunction({
          url: "admin/hrm/salary/sys/payslip/getDetail",
          data: {
            _id: this._id,
            card
          }
        });
        if (res.code === 0) {
          this.salaryData = res.rows[0] || {};
          const extra = res.extra;
          if (extra.lastSignatureUrl) {
            this.lastSignatureUrl = extra.lastSignatureUrl;
          } else {
            this.lastSignatureUrl = "";
          }
        } else {
          this.$refs.toast.showToast(res.msg || "获取薪资失败");
        }
      } catch (e) {
        this.$refs.toast.showToast("网络异常");
        common_vendor.index.__f__("error", "at pages/payslip/sign.vue:297", e);
      } finally {
        this.loading = false;
        if (fromRefresh) {
          this.refreshing = false;
        }
      }
    },
    onRefresh() {
      if (this.loading)
        return;
      this.loadDetail(true);
    },
    formatDate(val) {
      if (!val)
        return "";
      const d = new Date(val);
      return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, "0")}月`;
    },
    openSignBoard() {
      this.showSignBoard = true;
      this.$nextTick(() => {
        this.getCanvasSize();
      });
    },
    // 获取画布尺寸并初始化
    getCanvasSize() {
      common_vendor.index.createSelectorQuery().select(".handCenter").boundingClientRect((rect) => {
        if (rect && rect.width) {
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
    // ================= 提交签名（横屏导出） =================			
    async submitSign() {
      if (this.isEmpty()) {
        this.$refs.toast.showToast("请先签名");
        return;
      }
      try {
        this.$refs.toast.showLoading("正在生成并提交...");
        const tempPath = await this.getTempFilePath();
        const imgInfo = await new Promise((resolve, reject) => {
          common_vendor.index.getImageInfo({
            src: tempPath,
            success: resolve,
            fail: reject
          });
        });
        const {
          width,
          height
        } = imgInfo;
        const nodeInfo = await new Promise((resolve, reject) => {
          const query = common_vendor.index.createSelectorQuery().in(this);
          query.select("#rotateCanvas").node().exec((res) => {
            if (res && res[0]) {
              resolve(res[0]);
            } else {
              reject(new Error("获取 Canvas 节点失败"));
            }
          });
        });
        const canvas = nodeInfo.node;
        const ctx = canvas.getContext("2d");
        canvas.width = height;
        canvas.height = width;
        const img = canvas.createImage();
        img.src = tempPath;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        ctx.translate(height / 2, width / 2);
        ctx.rotate(-90 * Math.PI / 180);
        ctx.drawImage(img, -width / 2, -height / 2);
        const rotatedFilePath = await new Promise((resolve, reject) => {
          common_vendor.index.canvasToTempFilePath({
            canvas,
            fileType: "png",
            quality: 1,
            success: (res) => resolve(res.tempFilePath),
            fail: reject
          });
        });
        const cloudPath = `public/signature/${this.attendance_ym}_${Date.now()}.png`;
        const uploadOptionsRes = await vk.callFunction({
          url: "common/pub/getUploadFileOptions/index",
          // 根据你的云函数路径调整
          data: {
            cloudPath
          }
        });
        if (uploadOptionsRes.code !== 0) {
          throw new Error(uploadOptionsRes.msg || "获取上传参数失败");
        }
        const uploadOptions = uploadOptionsRes.rows;
        const uploadResult = await new Promise((resolve, reject) => {
          common_vendor.index.uploadFile({
            ...uploadOptions.uploadFileOptions,
            filePath: rotatedFilePath,
            success: (res) => {
              if (res.statusCode === 200) {
                resolve(res);
              } else {
                reject(new Error(`上传失败: ${res.statusCode}`));
              }
            },
            fail: reject
          });
        });
        const fileUrl = `https://tdhstorage.cntdh.net/${cloudPath}`;
        const fileID = cloudPath;
        const saveRes = await vk.callFunction({
          url: "admin/hrm/salary/sys/payslip/update",
          data: {
            _id: this._id,
            signature_url: fileUrl,
            // 存储完整的访问URL
            file_id: fileID,
            // 存储文件路径标识
            status: 1
          }
        });
        this.$refs.toast.hide();
        if (saveRes.code === 0) {
          this.$refs.toast.showToast("签名成功");
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          this.$refs.toast.showToast(saveRes.msg || "提交失败");
        }
      } catch (e) {
        this.$refs.toast.hide();
        this.$refs.toast.showToast("操作失败");
        common_vendor.index.__f__("error", "at pages/payslip/sign.vue:476", e);
      }
    },
    getPickerColor(color) {
      this.showPickerColor = false;
      if (color) {
        this.lineColor = color;
      }
    },
    // ================= 触摸事件（优化后，支持 rAF 节流） =================
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
    // 处理队列中的点，执行绘制
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
    // ================= 原有点计算与绘制逻辑（已移除内部 draw） =================
    initPoint(x, y) {
      var point = {
        x,
        y,
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
        this.drawCurveLine(
          prePoint.lastX,
          prePoint.lastY,
          prePoint.x,
          prePoint.y,
          point.lastX,
          point.lastY,
          this.maxWidth
        );
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
          val,
          pos: 1
        };
      }
      return {
        val,
        pos: -1
      };
    },
    getRadianPoints(radianData, x, y, halfLineWidth) {
      if (radianData.val === 0) {
        if (radianData.pos === 1) {
          return [{
            x,
            y: y + halfLineWidth
          }, {
            x,
            y: y - halfLineWidth
          }];
        }
        return [{
          y,
          x: x + halfLineWidth
        }, {
          y,
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
      if (!this.bgColor || !this.canvasWidth || !this.canvasHeight)
        return;
      this.ctx.setFillStyle && this.ctx.setFillStyle(this.bgColor);
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.draw && this.ctx.draw(true);
    },
    drawByImage(url) {
      if (!this.canvasWidth || !this.canvasHeight)
        return;
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      common_vendor.index.getImageInfo({
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
          common_vendor.index.__f__("error", "at pages/payslip/sign.vue:771", "加载历史签名失败", err);
        }
      });
    },
    // 清空画布并重置所有状态
    clear() {
      if (!this.canvasWidth || !this.canvasHeight) {
        return;
      }
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
    // 仅清空画布内容，不重置历史记录（用于撤销重放）
    clearCanvasOnly() {
      const color = this.bgColor || "#ffffff";
      this.ctx.setFillStyle && this.ctx.setFillStyle(color);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.draw && this.ctx.draw(true);
    },
    // 撤销：移除最后一笔，重放剩余笔画
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
    // 重放一个笔画（点数组）
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
  return common_vendor.e({
    a: !$data.showSignBoard
  }, !$data.showSignBoard ? common_vendor.e({
    b: common_vendor.o($options.onRefresh, "7a"),
    c: common_vendor.p({
      ["refresher-triggered"]: $data.refreshing
    }),
    d: $data.salaryData
  }, $data.salaryData ? common_vendor.e({
    e: common_vendor.t($options.formatDate($data.salaryData.attendance_ym_key)),
    f: common_vendor.f($data.group1, (key, k0, i0) => {
      return common_vendor.e({
        a: $data.salaryData[key]
      }, $data.salaryData[key] ? {
        b: common_vendor.t($data.fieldLabels[key]),
        c: common_vendor.t($data.salaryData[key]),
        d: key === "gross_salary" ? 1 : ""
      } : {}, {
        e: key
      });
    }),
    g: common_vendor.f($data.group2, (key, k0, i0) => {
      return common_vendor.e({
        a: $data.salaryData[key]
      }, $data.salaryData[key] ? {
        b: common_vendor.t($data.fieldLabels[key]),
        c: common_vendor.t($data.salaryData[key])
      } : {}, {
        d: key
      });
    }),
    h: $data.salaryData.real_salary
  }, $data.salaryData.real_salary ? {
    i: common_vendor.t($data.salaryData.real_salary)
  } : {}) : {}, {
    j: $data.salaryData
  }, $data.salaryData ? {} : {}, {
    k: $data.refreshing,
    l: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args), "22"),
    m: common_vendor.o((...args) => $options.openSignBoard && $options.openSignBoard(...args), "49")
  }) : {
    n: common_vendor.o(($event) => $options.selectColorEvent("black", "#1A1A1A"), "50"),
    o: $data.selectColor === "black" ? "/static/other/color_black_selected.png" : "/static/other/color_black.png",
    p: $data.selectColor === "red" ? "/static/other/color_red_selected.png" : "/static/other/color_red.png",
    q: common_vendor.o((...args) => $options.clear && $options.clear(...args), "93"),
    r: $data.lastSignatureUrl,
    s: common_vendor.o((...args) => $options.previewCanvasImg && $options.previewCanvasImg(...args), "1b"),
    t: $data.lastSignatureUrl,
    v: common_vendor.o((...args) => $options.undo && $options.undo(...args), "93"),
    w: $data.lastSignatureUrl,
    x: common_vendor.o((...args) => $options.closeSignBoard && $options.closeSignBoard(...args), "7f"),
    y: common_vendor.o((...args) => $options.submitSign && $options.submitSign(...args), "fc"),
    z: common_vendor.o((...args) => $options.uploadScaleStart && $options.uploadScaleStart(...args), "cf"),
    A: common_vendor.o((...args) => $options.uploadScaleMove && $options.uploadScaleMove(...args), "95"),
    B: common_vendor.o((...args) => $options.uploadScaleEnd && $options.uploadScaleEnd(...args), "1f"),
    C: common_vendor.o($options.getPickerColor, "66"),
    D: common_vendor.p({
      isShow: $data.showPickerColor,
      bottom: 0
    })
  }, {
    E: common_vendor.sr("toast", "9ee76dc8-2")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/payslip/sign.js.map
