"use strict";
const common_vendor = require("../vendor.js");
let myfn = {};
myfn.test1 = function(obj = {}) {
  common_vendor.index.vk;
  common_vendor.index.__f__("log", "at common/function/myPubFunction.js:11", "执行了自定义公共函数test1");
  return obj;
};
exports.myfn = myfn;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/function/myPubFunction.js.map
