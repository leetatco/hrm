"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
const WebSocketPool = {
  connections: [],
  // 根据url获取连接
  getConnection(obj = {}) {
    let { url, channel } = obj;
    return this.connections.find((item) => (item.url === url || item.wsUrl === url) && item.channel === channel);
  },
  getCloudObjectUrl(url) {
    let urlObj = vk.pubfn.queryStringToJson(url.split("?")[1]);
    if (urlObj && urlObj.url) {
      return urlObj.url;
    }
    throw new Error("WebSocket连接地址错误");
  },
  // 预添加连接
  preAddConnection(obj = {}) {
    let { url, channel } = obj;
    let resolveFun;
    let rejectFun;
    const awaitConnect = new Promise((resolve, reject) => {
      resolveFun = resolve;
      rejectFun = reject;
    });
    this.connections.push({
      url,
      channel,
      awaitConnect,
      resolve: resolveFun,
      reject: rejectFun
    });
  },
  // 添加连接
  addConnection(connection = {}) {
    const index = this.connections.findIndex((item) => item.url === connection.wsUrl && item.channel === connection.channel);
    this.connections.push(connection);
    if (index > -1) {
      const { resolve } = this.connections[index];
      resolve(connection);
      this.connections.splice(index, 1);
    }
  },
  // 移除连接
  removeConnection(obj = {}) {
    let { url, channel } = obj;
    const index = this.connections.findIndex((item) => item.url === url && item.channel === channel);
    if (index > -1) {
      this.connections.splice(index, 1);
    }
  }
};
async function connectWebSocket(obj = {}) {
  const vk2 = common_vendor.index.vk;
  let {
    name,
    url,
    data,
    title,
    encrypt,
    channel = "default",
    // 渠道\频道，用于连接同一个云对象时，标识不同的 WebSocket 连接
    cache = true
    // 如果传入cache为true，则相同的channel会缓存连接，避免重复创建
  } = obj;
  if (!name) {
    name = vk2.getConfig("functionName");
  }
  if (!url) {
    throw new Error("请传入 WebSocket 的 url 参数");
  }
  if (cache) {
    let connection = WebSocketPool.getConnection({ url, channel });
    if (connection) {
      await connection.awaitConnect;
      connection = WebSocketPool.getConnection({ url, channel });
      return connection;
    }
    WebSocketPool.preAddConnection({ url, channel });
  }
  let wsUrl = url;
  let webSocket;
  if (title)
    vk2.showLoading(title);
  if (url.indexOf("wss://") === 0 || url.indexOf("ws://") === 0) {
    webSocket = common_vendor.index.connectSocket({
      url,
      header: {
        "content-type": "application/json"
      },
      complete: () => {
      }
    });
    url = WebSocketPool.getCloudObjectUrl(url);
  } else {
    if (typeof common_vendor.wr.connectWebSocket === "undefined") {
      if (title)
        vk2.hideLoading();
      let errMsg = "当前环境不支持WebSocket";
      vk2.toast(errMsg);
      throw new Error(errMsg + `（仅支付宝云支持）`);
    }
    webSocket = await common_vendor.wr.connectWebSocket({
      name,
      query: {
        url
      }
    });
  }
  const vkWebSocket = new WebSocketService({
    webSocket,
    wsUrl,
    url,
    data,
    title,
    encrypt,
    channel
  });
  if (cache) {
    WebSocketPool.addConnection(vkWebSocket);
  }
  return vkWebSocket;
}
class WebSocketService {
  constructor(obj = {}) {
    let { webSocket, wsUrl, url, data, title, encrypt, channel } = obj;
    this.webSocket = webSocket;
    this.wsUrl = wsUrl;
    this.url = url;
    this.data = data;
    this.encrypt = encrypt;
    this.channel = channel;
    this.cid = "";
    this.isLoading = title ? true : false;
    this.status = 0;
    this.awaitConnect = new Promise((resolve, reject) => {
      this.success = resolve;
      this.fail = reject;
    });
    this.encryptMode = "aes-256-ecb";
    this.callbackStack = {
      onOpen: [],
      onMessage: [],
      onClose: [],
      onError: [],
      onVkMessage: []
    };
    this.init();
  }
  // 初始化
  init() {
    const vk2 = common_vendor.index.vk;
    this.webSocket.onOpen(() => {
      this.status = 1;
      this.send({
        data: {
          vkWebSocket: {
            type: "connect",
            data: this.data
          }
        }
      });
    });
    this.webSocket.onMessage((event) => {
      let data = event.data;
      try {
        data = JSON.parse(data);
      } catch (err) {
      }
      if (data.encrypt) {
        data = vk2.crypto.aes.decrypt({
          mode: this.encryptMode,
          data: data.data,
          key: vk2.crypto.md5(data.timeStamp)
        });
      }
      if (data.vkWebSocket) {
        if (this.isLoading) {
          vk2.hideLoading();
          this.isLoading = false;
        }
        if (data.vkWebSocket.type === "error") {
          let err = data.vkWebSocket.data;
          if ([1301, 1302, 30201, 30202, 30203, 30204].indexOf(err.code) > -1 && err.msg.indexOf("token") > -1) {
            common_vendor.index.__f__("warn", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.connectWebSocket.js:202", "【WebSocketInvalidToken】: ", err);
            this.emitEvent("onVkMessage", {
              type: "invalidToken",
              err
            });
            return;
          }
          if (err && err.stack) {
            common_vendor.index.__f__("error", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.connectWebSocket.js:211", "【WebSocketError】: ", err);
            common_vendor.index.__f__("error", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.connectWebSocket.js:212", "【WebSocketStack】: ", err.stack);
          } else {
            common_vendor.index.__f__("warn", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.connectWebSocket.js:215", "【WebSocketError】: ", err);
          }
          this.emitEvent("onVkMessage", {
            type: "error",
            err
          });
          return;
        } else if (data.vkWebSocket.type === "connect") {
          this.status = 2;
          this.success();
          this.cid = data.vkWebSocket.data.cid;
          this.emitEvent("onOpen", data.vkWebSocket.data);
          return;
        } else if (data.vkWebSocket.type === "forceLogout") {
          this.emitEvent("onVkMessage", {
            type: "forceLogout",
            data: data.vkWebSocket.data
          });
          return;
        }
      }
      this.emitEvent("onMessage", data);
    });
    this.webSocket.onClose((event) => {
      this.emitEvent("onClose", event);
      this.close();
    });
    this.webSocket.onError((event) => {
      this.emitEvent("onError", event);
    });
  }
  // 监听连接建立事件
  onOpen(callback) {
    if (this.status === 2) {
      callback({
        cid: this.cid
      });
    } else {
      this.onEvent("onOpen", callback);
    }
  }
  // 监听消息事件
  onMessage(callback) {
    this.onEvent("onMessage", callback);
  }
  // 监听连接关闭事件
  onClose(callback) {
    this.onEvent("onClose", callback);
  }
  // 监听连接错误事件
  onError(callback) {
    this.onEvent("onError", callback);
  }
  // 监听vk框架事件
  onVkMessage(callback) {
    this.onEvent("onVkMessage", callback);
  }
  // 监听事件
  onEvent(name, callback) {
    this.callbackStack[name].push(callback);
  }
  // 触发事件
  emitEvent(name, data) {
    this.callbackStack[name].forEach((callback) => {
      callback(data);
    });
  }
  // 关闭连接
  close(obj = {}) {
    WebSocketPool.removeConnection(this);
    if (this.webSocket) {
      this.webSocket.close(obj);
    }
    this.webSocket = null;
    this.url = null;
    this.data = null;
    this.encrypt = null;
    this.cid = null;
    this.isLoading = null;
    this.status = null;
    this.awaitConnect = null;
    this.encryptMode = null;
    this.success = null;
    this.fail = null;
    for (let i in this.callbackStack) {
      this.callbackStack[i] = [];
    }
  }
  // 发送消息
  async send(obj = {}) {
    let { data } = obj;
    if (!this.status) {
      await this.awaitConnect;
    }
    const vk2 = common_vendor.index.vk;
    const uniIdToken = vk2.getToken();
    const sysInfo = common_vendor.index.getSystemInfoSync();
    const clientInfo = {
      appid: sysInfo.appId,
      platform: sysInfo.uniPlatform,
      locale: sysInfo.language,
      os: sysInfo.osName,
      deviceId: sysInfo.deviceId,
      userAgent: sysInfo.ua
    };
    let clientData = {
      url: this.url,
      channel: this.channel,
      uniIdToken,
      clientInfo,
      data
    };
    let sendData = {
      data: clientData,
      deviceId: sysInfo.deviceId
    };
    let encrypt = this.encrypt;
    if (encrypt) {
      clientData.timeStamp = Date.now();
      clientData = vk2.crypto.aes.encrypt({
        mode: this.encryptMode,
        data: clientData,
        key: vk2.crypto.md5(sysInfo.deviceId)
      });
      sendData.encrypt = true;
    }
    sendData.deviceId = sysInfo.deviceId;
    sendData.data = clientData;
    return this.webSocket.send({
      ...obj,
      data: JSON.stringify(sendData)
    });
  }
}
exports.connectWebSocket = connectWebSocket;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.connectWebSocket.js.map
