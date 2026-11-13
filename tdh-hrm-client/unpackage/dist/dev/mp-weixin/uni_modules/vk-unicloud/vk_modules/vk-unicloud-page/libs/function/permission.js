"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
function $hasRole(...args) {
  const vk = common_vendor.index.vk;
  const userRoles = vk.getVuex("$user.userInfo.role") || [];
  return args.some((arg) => {
    if (Array.isArray(arg)) {
      return arg.every((role) => userRoles.includes(role));
    } else {
      return userRoles.includes(arg);
    }
  });
}
function $hasPermission(...args) {
  const vk = common_vendor.index.vk;
  const userPermission = vk.getVuex("$user.permission") || [];
  return args.some((arg) => {
    if (Array.isArray(arg)) {
      return arg.every((permission) => userPermission.includes(permission));
    } else {
      return userPermission.includes(arg);
    }
  });
}
function initPermission(Vue) {
  Vue.config.globalProperties.$hasRole = $hasRole;
  Vue.config.globalProperties.$hasPermission = $hasPermission;
}
exports.$hasPermission = $hasPermission;
exports.$hasRole = $hasRole;
exports.initPermission = initPermission;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/permission.js.map
