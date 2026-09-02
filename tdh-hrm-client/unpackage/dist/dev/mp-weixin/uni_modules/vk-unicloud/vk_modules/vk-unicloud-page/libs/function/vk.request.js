"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
const requestUtil = {};
requestUtil.config = {
  // 请求配置
  request: {
    // 公共请求参数(每次请求都会带上的参数)
    dataParam: {}
  },
  requestGlobalParamKeyName: "vk_url_request_global_param",
  debug: true,
  // 日志风格
  logger: {
    colorArr: ["#0095ff", "#67C23A"]
  }
};
let counterNum = 0;
requestUtil.request = function(obj = {}) {
  let vk = common_vendor.index.vk;
  if (typeof obj.data === "object") {
    obj.data = vk.pubfn.copyObject(obj.data);
  }
  let config = requestUtil.config;
  let globalParam = common_vendor.index.getStorageSync(config.requestGlobalParamKeyName) || {};
  for (let i in globalParam) {
    let customDate2 = globalParam[i];
    if (customDate2.regExp) {
      if (typeof customDate2.regExp === "object") {
        for (let i2 = 0; i2 < customDate2.regExp.length; i2++) {
          let regExp = new RegExp(customDate2.regExp[i2]);
          if (regExp.test(obj.url)) {
            obj.data = Object.assign(customDate2.data, obj.data);
            break;
          }
        }
      } else {
        let regExp = new RegExp(customDate2.regExp);
        if (regExp.test(obj.url)) {
          obj.data = Object.assign(customDate2.data, obj.data);
        }
      }
    }
  }
  let customDate = requestUtil.getRequestGlobalParam(obj.globalParamName);
  if (customDate && JSON.stringify(customDate) !== "{}") {
    if (customDate.regExp) {
      obj.data = Object.assign(customDate.data, obj.data);
    } else {
      obj.data = Object.assign(customDate, obj.data);
    }
  }
  if (!obj.method)
    obj.method = "POST";
  if (typeof obj.dataType === "undefined")
    obj.dataType = "json";
  if (obj.dataType == "default" || obj.dataType == "buffer" || obj.dataType === "")
    delete obj.dataType;
  if (typeof obj.header === "undefined" && typeof obj.headers !== "undefined") {
    obj.header = obj.headers;
  }
  if (obj.encrypt) {
    obj.uniIdToken = true;
    if (!obj.clientInfo)
      obj.clientInfo = true;
  }
  if (typeof vk.getToken === "function" && obj.uniIdToken) {
    let uni_id_token;
    if (obj.uniIdToken === true) {
      uni_id_token = vk.getToken();
    } else if (typeof obj.uniIdToken === "string") {
      uni_id_token = obj.uniIdToken;
    }
    if (uni_id_token) {
      if (!obj.header)
        obj.header = {};
      obj.header["uni-id-token"] = uni_id_token;
    }
  }
  if (obj.clientInfo) {
    let clientInfo;
    if (obj.clientInfo === true) {
      clientInfo = common_vendor.index.getSystemInfoSync();
    } else if (typeof obj.clientInfo === "object") {
      clientInfo = obj.clientInfo;
    }
    if (vk.pubfn.isNotNull(clientInfo)) {
      if (!obj.header)
        obj.header = {};
      clientInfo.uniIdToken = obj.uniIdToken;
      const {
        uniIdToken,
        appId: vkAppid,
        uniPlatform: vkPlatform,
        appLanguage: vkLocale,
        deviceId: vkDeviceId,
        osName: vkOsName,
        appName: vkAppName,
        appVersion: vkAppVersion,
        appVersionCode: vkAppVersionCode,
        browserName: vkBrowserName,
        browserVersion: vkBrowserVersion
      } = clientInfo;
      const vkHeader = {
        "uni-id-token": uniIdToken,
        "vk-encrypt": obj.encrypt ? "true" : void 0,
        "vk-appid": vkAppid,
        "vk-platform": vkPlatform,
        "vk-locale": vkLocale,
        "vk-device-id": vkDeviceId,
        "vk-os": vkOsName,
        "vk-app-name": vkAppName ? encodeURIComponent(vkAppName) : void 0,
        "vk-app-version": vkAppVersion,
        "vk-app-version-code": vkAppVersionCode,
        "vk-browser-name": vkBrowserName ? encodeURIComponent(vkBrowserName) : void 0,
        "vk-browser-version": vkBrowserVersion
      };
      obj.header = vk.pubfn.copyObject(Object.assign(vkHeader, obj.header));
    }
  }
  let interceptor = obj.interceptor;
  delete obj.interceptor;
  if (interceptor && typeof interceptor.invoke === "function") {
    let interceptorRes = interceptor.invoke(obj);
    if (interceptorRes === false) {
      return;
    }
  }
  if (typeof obj.timeout === "undefined")
    obj.timeout = 6e4;
  let Logger = {};
  if (config.debug) {
    Logger.params = typeof obj.data == "object" ? vk.pubfn.copyObject(obj.data) : obj.data;
    Logger.startTime = (/* @__PURE__ */ new Date()).getTime();
    let url = obj.url;
    let path = obj.url.split("?")[0];
    if (path.indexOf("://") > -1) {
      path = path.substring(path.indexOf("://") + 3);
      Logger.domainName = path.substring(0, path.indexOf("/"));
    } else {
      Logger.domainName = "";
    }
    Logger.action = path.substring(path.indexOf("/") + 1);
    Logger.url = url;
  }
  if (obj.title)
    vk.showLoading(obj.title);
  if (obj.loading)
    Logger.loading = vk.setLoading(true, obj.loading);
  let decryptFn;
  if (obj.encrypt) {
    let encryptRes = vk.crypto.encryptCallFunction(obj, "request");
    obj.data = encryptRes.data;
    decryptFn = encryptRes.decrypt;
    Logger.encrypt = obj.encrypt;
    delete obj.encrypt;
  }
  let promiseAction = new Promise(function(resolve, reject) {
    common_vendor.index.request({
      ...obj,
      success: (res) => {
        if (decryptFn)
          res.data = decryptFn(res.data);
        if (interceptor && typeof interceptor.success === "function") {
          let interceptorRes = interceptor.success(res);
          if (interceptorRes === false) {
            return;
          }
        }
        requestSuccess({
          res,
          params: obj,
          Logger,
          resolve,
          reject
        });
      },
      fail: (res) => {
        if (interceptor && typeof interceptor.fail === "function") {
          let interceptorRes = interceptor.fail(res);
          if (interceptorRes === false) {
            return;
          }
        }
        requestFail({
          res,
          params: obj,
          Logger,
          reject
        });
      },
      complete: (res) => {
        if (interceptor && typeof interceptor.complete === "function") {
          let interceptorRes = interceptor.complete(res);
          if (interceptorRes === false) {
            return;
          }
        }
        requestComplete({
          res,
          params: obj,
          Logger
        });
      }
    });
  });
  promiseAction.catch((error) => {
  });
  return promiseAction;
};
function requestSuccess(obj = {}) {
  let vk = common_vendor.index.vk;
  let config = requestUtil.config;
  let { res = {}, params, Logger, resolve, reject } = obj;
  let { title, needOriginalRes, dataType, errorCodeName, errorMsgName, success, loading, responseType } = params;
  let data = res.data || {};
  if (responseType !== "arraybuffer") {
    if (vk.pubfn.isNotNullAll(errorCodeName, data[errorCodeName])) {
      data.code = data[errorCodeName];
      delete data[errorCodeName];
    }
    if (vk.pubfn.isNotNullAll(errorMsgName, data[errorMsgName])) {
      data.msg = data[errorMsgName];
      if (typeof data[errorMsgName] === "string") {
        delete data[errorMsgName];
      }
    }
    if (config.debug)
      Logger.result = typeof data == "object" ? vk.pubfn.copyObject(data) : data;
    if ([1301, 1302, 30201, 30202, 30203, 30204].indexOf(data.code) > -1 && data.msg.indexOf("token") > -1) {
      let { interceptor = {} } = vk.callFunctionUtil;
      if (typeof interceptor.login === "function") {
        interceptor.login({
          res: data,
          params,
          vk
        });
      }
      reject(data);
      return;
    } else if (res.statusCode >= 400 || data.code && data.code != 200) {
      requestFail({
        res: data,
        params,
        Logger,
        reject
      });
      return;
    }
    if (needOriginalRes)
      data.originalRes = res;
    if (data.vk_uni_token)
      vk.callFunctionUtil.saveToken(data.vk_uni_token);
    if (data.userInfo && data.needUpdateUserInfo)
      vk.callFunctionUtil.updateUserInfo(data);
  }
  if (title)
    vk.hideLoading();
  if (loading) {
    vk.setLoading(false, Logger.loading);
    Logger.loading = null;
  }
  if (typeof success === "function")
    success(data);
  if (typeof resolve === "function")
    resolve(data);
}
function requestFail(obj = {}) {
  let vk = common_vendor.index.vk;
  let config = requestUtil.config;
  let { res = {}, params, Logger, reject } = obj;
  let { title, needAlert, fail, loading } = params;
  if (typeof needAlert === "undefined") {
    needAlert = typeof fail === "function" ? false : true;
  }
  let errMsg = "";
  let sysErr = false;
  if (typeof res.code !== "undefined") {
    errMsg = res.msg;
  } else {
    sysErr = true;
    errMsg = JSON.stringify(res);
  }
  if (errMsg.indexOf("fail timeout") > -1) {
    sysErr = true;
    errMsg = "请求超时，请重试！";
  }
  if (config.debug)
    Logger.error = res;
  if (title)
    vk.hideLoading();
  if (loading) {
    vk.setLoading(false, Logger.loading);
    Logger.loading = null;
  }
  let runKey = true;
  let { interceptor = {} } = vk.callFunctionUtil.getConfig();
  if (interceptor.request && typeof interceptor.request.fail == "function") {
    runKey = interceptor.request.fail({
      vk,
      res,
      params
    });
    if (runKey === void 0)
      runKey = true;
  }
  if (runKey) {
    if (needAlert && vk.pubfn.isNotNull(errMsg)) {
      if (sysErr) {
        vk.toast("网络开小差了！", "none");
        common_vendor.index.__f__("error", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:350", errMsg);
      } else {
        vk.alert(errMsg);
      }
    }
    if (typeof fail === "function")
      fail(res);
    if (typeof reject === "function")
      reject(res);
  }
}
function requestComplete(obj = {}) {
  let vk = common_vendor.index.vk;
  let config = requestUtil.config;
  let { res = {}, params, Logger } = obj;
  let { title, needOriginalRes, complete } = params;
  if (config.debug) {
    Logger.endTime = (/* @__PURE__ */ new Date()).getTime();
    Logger.runTime = Logger.endTime - Logger.startTime;
    let colorArr = config.logger.colorArr;
    let colorStr = colorArr[counterNum % colorArr.length];
    counterNum++;
    let functionType = Logger.encrypt ? "服务器加密请求" : "服务器请求";
    common_vendor.index.__f__("log", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:373", "%c--------【开始】【" + functionType + "】【" + Logger.action + "】--------", "color: " + colorStr + ";font-size: 12px;font-weight: bold;");
    common_vendor.index.__f__("log", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:374", "【请求地址】: ", Logger.url);
    common_vendor.index.__f__("log", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:375", "【请求参数】: ", Logger.params);
    common_vendor.index.__f__("log", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:376", "【返回数据】: ", Logger.result);
    common_vendor.index.__f__("log", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:377", "【请求状态】: ", res.statusCode, "【http状态码】");
    common_vendor.index.__f__("log", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:378", "【总体耗时】: ", Logger.runTime, "毫秒【含页面渲染】");
    common_vendor.index.__f__("log", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:379", "【请求时间】: ", vk.pubfn.timeFormat(Logger.startTime, "yyyy-MM-dd hh:mm:ss"));
    if (Logger.error) {
      let errorLog = console.warn || console.error;
      if (Logger.error.err && Logger.error.err.stack) {
        common_vendor.index.__f__("error", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:383", "【Error】: ", Logger.error);
        common_vendor.index.__f__("error", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:384", "【Stack】: ", Logger.error.err.stack);
      } else {
        errorLog("【Error】: ", Logger.error);
      }
    }
    common_vendor.index.__f__("log", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js:389", "%c--------【结束】【" + functionType + "】【" + Logger.action + "】--------", "color: " + colorStr + ";font-size: 12px;font-weight: bold;");
  }
  let data = res.data;
  if (needOriginalRes)
    data.originalRes = vk.pubfn.copyObject(res);
  if (typeof complete === "function")
    complete(data);
  Logger = null;
}
requestUtil.updateRequestGlobalParam = (data = {}, setKey) => {
  let vk = common_vendor.index.vk;
  let config = requestUtil.config;
  if (setKey) {
    config.request.dataParam = data;
  } else {
    config.request.dataParam = Object.assign(config.request.dataParam, data);
  }
  vk.setStorageSync(config.requestGlobalParamKeyName, config.request.dataParam);
};
requestUtil.getRequestGlobalParam = (globalParamName = "*") => {
  common_vendor.index.vk;
  let config = requestUtil.config;
  let data = config.request.dataParam;
  if (!data || JSON.stringify(data) === "{}") {
    data = common_vendor.index.getStorageSync(config.requestGlobalParamKeyName) || {};
    config.request.dataParam = data;
  }
  let param = data[globalParamName] || {};
  return JSON.parse(JSON.stringify(param));
};
requestUtil.deleteRequestGlobalParam = (globalParamName) => {
  let vk = common_vendor.index.vk;
  let config = requestUtil.config;
  let globalParam = common_vendor.index.getStorageSync(config.requestGlobalParamKeyName) || {};
  if (globalParamName) {
    delete globalParam[globalParamName];
  } else {
    globalParam = {};
  }
  config.request.dataParam = globalParam;
  vk.setStorageSync(config.requestGlobalParamKeyName, globalParam);
};
exports.requestUtil = requestUtil;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.request.js.map
