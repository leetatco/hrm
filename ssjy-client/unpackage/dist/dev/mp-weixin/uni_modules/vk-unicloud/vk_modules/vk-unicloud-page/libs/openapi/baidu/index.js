"use strict";
const baidu = {};
let vk = {};
let baiduOpenApiAccessTokenCacheName = "vk_openapi_baidu_open_token";
baidu.init = function(util = {}) {
  vk = util.vk;
};
baidu.open = {};
baidu.open.ocr = {};
baidu.open.ocr.business_license = function(obj = {}) {
  obj.action = "ocr/v1/business_license";
  let file = obj.data.file;
  if (file) {
    vk.pubfn.fileToBase64({ file }).then((base64) => {
      obj.data.image = base64;
      delete obj.data.file;
      baidu.request(obj);
    });
  } else {
    baidu.request(obj);
  }
};
baidu.open.ocr.idcard = function(obj = {}) {
  obj.action = "ocr/v1/idcard";
  let file = obj.data.file;
  if (!obj.data.id_card_side)
    obj.data.id_card_side = "front";
  if (file) {
    vk.pubfn.fileToBase64({ file }).then((base64) => {
      obj.data.image = base64;
      delete obj.data.file;
      baidu.request(obj);
    });
  } else {
    baidu.request(obj);
  }
};
baidu.request = function(obj = {}) {
  let {
    title
  } = obj;
  if (title)
    vk.showLoading(title);
  let baiduApiAccessToken = vk.getStorageSync(baiduOpenApiAccessTokenCacheName);
  if (baiduApiAccessToken && baiduApiAccessToken.expTime > (/* @__PURE__ */ new Date()).getTime()) {
    obj.accessToken = baiduApiAccessToken.accessToken;
    request(obj);
  } else {
    vk.callFunction({
      url: "plugs/baidu/client/pub/getAccessToken",
      success: function(tokenRes) {
        vk.setStorageSync(baiduOpenApiAccessTokenCacheName, {
          accessToken: tokenRes.access_token,
          expTime: 259e7 + (/* @__PURE__ */ new Date()).getTime()
        });
        obj.accessToken = tokenRes.access_token;
        request(obj);
      },
      fail: function(res) {
        if (title)
          vk.hideLoading();
        if (typeof obj.fail === "function")
          obj.fail(res);
        if (typeof obj.complete === "function")
          obj.complete(res);
      }
    });
  }
};
function request(obj = {}) {
  let {
    action,
    actionVersion = "2.0",
    accessToken,
    header = { "content-type": "application/x-www-form-urlencoded" },
    data,
    title
  } = obj;
  vk.request({
    url: `https://aip.baidubce.com/rest/${actionVersion}/${action}?access_token=${accessToken}`,
    method: "POST",
    header: {
      "content-type": "application/x-www-form-urlencoded"
    },
    errorCodeName: "error_code",
    errorMsgName: "error_msg",
    data,
    needAlert: true,
    success: function(data2) {
      if (title)
        vk.hideLoading();
      if (data2.code) {
        if (typeof obj.fail === "function")
          obj.fail(data2);
      } else {
        if (typeof obj.success === "function")
          obj.success(data2);
      }
    },
    fail: function(data2) {
      if (title)
        vk.hideLoading();
      if (data2 && data2.code === 110)
        vk.removeStorageSync(baiduOpenApiAccessTokenCacheName);
      if (typeof obj.fail === "function")
        obj.fail(data2);
    },
    complete: function(data2) {
      if (typeof obj.complete === "function")
        obj.complete(data2);
    }
  });
}
exports.baidu = baidu;
//# sourceMappingURL=../../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/openapi/baidu/index.js.map
