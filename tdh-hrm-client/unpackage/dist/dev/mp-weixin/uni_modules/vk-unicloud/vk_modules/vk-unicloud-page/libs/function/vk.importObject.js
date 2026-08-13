"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
let importObject = function(name, importObjectOptions = {}) {
  const newObj = new Proxy(importObject, {
    get: function(target, key, receiver) {
      return async function(options = {}) {
        if (importObjectOptions.easy) {
          options = {
            data: options
          };
        }
        if (importObjectOptions.data) {
          if (typeof importObjectOptions.data === "function") {
            options.data = Object.assign({}, importObjectOptions.data(), options.data);
          } else {
            options.data = Object.assign({}, importObjectOptions.data, options.data);
          }
        }
        return common_vendor.index.vk.callFunction({
          ...importObjectOptions,
          ...options,
          url: `${name}.${key}`
        });
      };
    }
    // set: function(target, key, value, receiver) {
    // 	uni.__f__('log','at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js:53',"set");
    // 	uni.__f__('log','at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js:54',"target",target);
    // 	uni.__f__('log','at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js:55',"key",key);
    // 	uni.__f__('log','at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js:56',"value",value);
    // 	uni.__f__('log','at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js:57',"receiver", receiver);
    // },
  });
  return newObj;
};
exports.importObject = importObject;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js.map
