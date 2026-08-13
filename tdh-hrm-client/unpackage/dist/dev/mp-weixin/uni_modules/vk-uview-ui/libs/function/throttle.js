"use strict";
let timeoutArr = [];
let flagArr = [];
function throttle(fn, time = 500, isImmediate = true, timeoutName = "default") {
  if (!timeoutArr[timeoutName])
    timeoutArr[timeoutName] = null;
  if (isImmediate) {
    if (!flagArr[timeoutName]) {
      flagArr[timeoutName] = true;
      if (typeof fn === "function")
        fn();
      timeoutArr[timeoutName] = setTimeout(() => {
        flagArr[timeoutName] = false;
      }, time);
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
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/libs/function/throttle.js.map
