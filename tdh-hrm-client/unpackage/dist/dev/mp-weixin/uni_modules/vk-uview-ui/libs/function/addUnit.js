"use strict";
const uni_modules_vkUviewUi_libs_function_test = require("./test.js");
const addUnit = function(value = "auto", unit = "rpx") {
  value = String(value);
  return uni_modules_vkUviewUi_libs_function_test.test.number(value) ? `${value}${unit}` : value;
};
exports.addUnit = addUnit;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/libs/function/addUnit.js.map
