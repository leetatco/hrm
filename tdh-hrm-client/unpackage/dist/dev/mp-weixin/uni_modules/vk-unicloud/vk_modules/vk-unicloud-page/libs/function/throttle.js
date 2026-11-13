"use strict";
let timeoutArr = /* @__PURE__ */ Object.create(null);
let flagArr = /* @__PURE__ */ Object.create(null);
function throttle(fn, time = 500, isImmediate = true, timeoutName = "default") {
  if (!timeoutArr[timeoutName])
    timeoutArr[timeoutName] = null;
  if (isImmediate) {
    if (!flagArr[timeoutName]) {
      flagArr[timeoutName] = true;
      try {
        if (typeof fn === "function")
          fn();
      } finally {
        timeoutArr[timeoutName] = setTimeout(() => {
          flagArr[timeoutName] = false;
        }, time);
      }
    }
  } else {
    if (!flagArr[timeoutName]) {
      flagArr[timeoutName] = true;
      timeoutArr[timeoutName] = setTimeout(() => {
        flagArr[timeoutName] = false;
        if (typeof fn === "function")
          fn();
      }, time);
    }
  }
}
exports.throttle = throttle;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/throttle.js.map
