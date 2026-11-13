"use strict";
const eventManager = /* @__PURE__ */ function() {
  const eventStatus = /* @__PURE__ */ Object.create(null);
  return {
    /**
     * 执行并通知 awaitEventReady 的回调函数执行
     * @param {string} eventName - 事件名称
     * @param {any} data - 传递给回调函数的数据
     */
    notifyEventReady(eventName, data) {
      if (!eventStatus[eventName]) {
        eventStatus[eventName] = {
          executed: false,
          data: null,
          callbacks: []
        };
      }
      eventStatus[eventName].executed = true;
      eventStatus[eventName].data = data;
      const callbacks = eventStatus[eventName].callbacks;
      eventStatus[eventName].callbacks = [];
      callbacks.forEach((callback) => {
        callback(data);
      });
    },
    /**
     * 注册回调函数，并在 notifyEventReady 后执行回调函数
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数，接收传递的数据参数
     */
    awaitEventReady(eventName, callback) {
      return new Promise((resolve, reject) => {
        const runCallback = (data) => {
          try {
            if (typeof callback === "function") {
              callback(data);
            }
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        if (eventStatus[eventName] && eventStatus[eventName].executed) {
          runCallback(eventStatus[eventName].data);
        } else {
          if (!eventStatus[eventName]) {
            eventStatus[eventName] = {
              executed: false,
              data: null,
              callbacks: []
            };
          }
          eventStatus[eventName].callbacks.push(runCallback);
        }
      });
    },
    /**
     * 检查事件是否已准备就绪
     * @param {string} eventName - 事件名称
     */
    checkEventReady(eventName) {
      return eventStatus[eventName] && eventStatus[eventName].executed ? true : false;
    },
    /**
     * 获取事件准备就绪时的参数，如果事件未准备就绪，则返回null
     * @param {string} eventName - 事件名称
     */
    getEventReadyData(eventName) {
      if (eventStatus[eventName] && eventStatus[eventName].executed) {
        return eventStatus[eventName].data;
      } else {
        return null;
      }
    }
  };
}();
exports.eventManager = eventManager;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.eventManager.js.map
