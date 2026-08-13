"use strict";
const common_vendor = require("../common/vendor.js");
const store_modules_$app = require("./modules/_app.js");
const store_modules_$user = require("./modules/_user.js");
let notSaveStateKeys = ["$error"];
const modulesTemp = {};
let lifeData = common_vendor.index.getStorageSync("lifeData") || {};
const modulesFiles = /* @__PURE__ */ Object.assign({ "./modules/$app.js": store_modules_$app.__vite_glob_0_0, "./modules/$user.js": store_modules_$user.__vite_glob_0_1 });
for (const modulePath in modulesFiles) {
  const moduleName = modulePath.replace(/^\.\/modules\/(.*)\.\w+$/, "$1");
  modulesTemp[moduleName] = modulesFiles[modulePath].default;
}
const modules = {};
for (let moduleName in modulesTemp) {
  const moduleItem = modulesTemp[moduleName];
  if (moduleItem && moduleItem.namespaced) {
    let moduleNameArr = moduleName.split("/");
    let lastName = moduleNameArr[moduleNameArr.length - 1];
    if (lastName === "index") {
      moduleName = moduleName.replace(/\/index$/, "");
    }
    modules[moduleName] = moduleItem;
  }
}
for (let moduleName in modules) {
  if (notSaveStateKeys.indexOf(moduleName) === -1) {
    if (!lifeData[moduleName])
      lifeData[moduleName] = {};
  }
}
common_vendor.index.setStorageSync("lifeData", lifeData);
const saveLifeData = function(key, value) {
  if (notSaveStateKeys.indexOf(key) === -1) {
    let tmp = common_vendor.index.getStorageSync("lifeData");
    tmp = tmp ? tmp : {};
    tmp[key] = value;
    common_vendor.index.setStorageSync("lifeData", tmp);
  }
};
const store = common_vendor.createStore({
  modules,
  // 如果是开发环境,则开启严格模式
  strict: true,
  // 公共 mutations
  mutations: {
    updateStore(state, payload) {
      if (typeof payload.value === "undefined")
        payload.value = "";
      let nameArr = payload.name.split(".");
      let saveKey = "";
      let len = nameArr.length;
      if (len >= 2) {
        let obj = state[nameArr[0]];
        for (let i = 1; i < len - 1; i++) {
          let keyName = nameArr[i];
          if (typeof obj[keyName] !== "object")
            obj[keyName] = {};
          obj = obj[keyName];
        }
        obj[nameArr[len - 1]] = JSON.parse(JSON.stringify(payload.value));
        saveKey = nameArr[0];
      } else {
        state[payload.name] = JSON.parse(JSON.stringify(payload.value));
        saveKey = payload.name;
      }
      saveLifeData(saveKey, state[saveKey]);
    }
  }
});
exports.store = store;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/index.js.map
