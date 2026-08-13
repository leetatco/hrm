"use strict";
function random(min, max) {
  if (min >= 0 && max > 0 && max >= min) {
    let gab = max - min + 1;
    return Math.floor(Math.random() * gab + min);
  } else {
    return 0;
  }
}
exports.random = random;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/libs/function/random.js.map
