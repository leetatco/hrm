"use strict";
function $parent(name = void 0) {
  let parent = this.$parent;
  while (parent) {
    if (parent.$options && parent.$options.name !== name) {
      parent = parent.$parent;
    } else {
      return parent;
    }
  }
  return false;
}
exports.$parent = $parent;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/vk-uview-ui/libs/function/_parent.js.map
