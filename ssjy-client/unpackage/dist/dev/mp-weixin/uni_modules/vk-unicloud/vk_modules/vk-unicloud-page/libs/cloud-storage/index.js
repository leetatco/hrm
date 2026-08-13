"use strict";
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_cloudStorage_unicloud = require("./unicloud.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_cloudStorage_aliyun = require("./aliyun.js");
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_cloudStorage_extStorage = require("./extStorage.js");
const cloudStorage = {
  unicloud: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_cloudStorage_unicloud.unicloud,
  // 空间内置存储
  aliyun: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_cloudStorage_aliyun.aliyun,
  // 阿里云官方oss
  extStorage: uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_cloudStorage_extStorage.extStorage
  // 扩展存储
};
exports.cloudStorage = cloudStorage;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/cloud-storage/index.js.map
