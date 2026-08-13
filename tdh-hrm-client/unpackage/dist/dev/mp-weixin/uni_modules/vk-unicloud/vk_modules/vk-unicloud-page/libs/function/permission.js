"use strict";
function $hasRole(...args) {
  const userRoles = this.$store.state.$user.userInfo.role || [];
  return args.some((arg) => {
    if (Array.isArray(arg)) {
      return arg.every((role) => userRoles.includes(role));
    } else {
      return userRoles.includes(arg);
    }
  });
}
function $hasPermission(...args) {
  const userPermission = this.$store.state.$user.permission || [];
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
exports.initPermission = initPermission;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/permission.js.map
