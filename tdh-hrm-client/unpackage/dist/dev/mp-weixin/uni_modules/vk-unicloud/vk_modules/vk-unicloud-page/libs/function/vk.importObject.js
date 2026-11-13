"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
let importObject = function(name, importObjectOptions = {}) {
  const newObj = new Proxy(importObject, {
    get: function(target, key, receiver) {
      if (key === "then")
        return void 0;
      const method = async function(options = {}) {
        if (importObjectOptions.easy) {
          options = {
            data: options
          };
        }
        if (importObjectOptions.data) {
          options = { ...options };
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
      return function(options = {}) {
        const promise = method(options);
        promise.catch(() => {
        });
        return promise;
      };
    }
    // set: function(target, key, value, receiver) {
    // 	uni.__f__('log','at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js:62',"set");
    // 	uni.__f__('log','at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js:63',"target",target);
    // 	uni.__f__('log','at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js:64',"key",key);
    // 	uni.__f__('log','at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js:65',"value",value);
    // 	uni.__f__('log','at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js:66',"receiver", receiver);
    // },
  });
  return newObj;
};
exports.importObject = importObject;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/vk.importObject.js.map
