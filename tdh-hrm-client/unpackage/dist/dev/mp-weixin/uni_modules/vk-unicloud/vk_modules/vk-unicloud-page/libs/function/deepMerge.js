"use strict";
function deepMerge(target = {}, source = {}) {
  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const isPlainObject = (value) => {
    if (value === null || typeof value !== "object")
      return false;
    const prototype = Object.getPrototypeOf(value);
    if (prototype === null)
      return true;
    return hasOwn(prototype, "constructor") && typeof prototype.constructor === "function" && Function.prototype.toString.call(prototype.constructor) === Function.prototype.toString.call(Object);
  };
  const setValue = (obj, key, value) => {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  };
  const cloneValue = (value) => {
    if (Array.isArray(value) || isPlainObject(value)) {
      const result = Array.isArray(value) ? new Array(value.length) : {};
      for (const key of Object.keys(value)) {
        setValue(result, key, cloneValue(value[key]));
      }
      return result;
    }
    const type = Object.prototype.toString.call(value);
    if (type === "[object Date]")
      return new Date(value.getTime());
    if (type === "[object RegExp]") {
      return Object.assign(new RegExp(value.source, value.flags), { lastIndex: value.lastIndex });
    }
    return value;
  };
  const merge = (defaultValue, customValue) => {
    if (!isPlainObject(defaultValue) || !isPlainObject(customValue))
      return cloneValue(customValue);
    const result = {};
    for (const key of Object.keys(defaultValue)) {
      if (!hasOwn(customValue, key))
        setValue(result, key, cloneValue(defaultValue[key]));
    }
    for (const key of Object.keys(customValue)) {
      const value = hasOwn(defaultValue, key) ? merge(defaultValue[key], customValue[key]) : cloneValue(customValue[key]);
      setValue(result, key, value);
    }
    return result;
  };
  return merge(target, source);
}
exports.deepMerge = deepMerge;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/deepMerge.js.map
