"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
class CloudStorage {
  constructor() {
    this.counterNum = 0;
  }
  // 上传文件
  uploadFile(obj = {}) {
    let {
      filePath,
      fileType,
      suffix,
      index = 0,
      file = {},
      cloudPath,
      cloudPathRemoveChinese = true,
      // 删除文件名中的中文
      cloudDirectory,
      encrypt,
      runCloud
    } = obj;
    let vk = common_vendor.index.vk;
    if (!cloudPath)
      cloudPath = createFileName(obj);
    let cloudStorageConfig = getConfig();
    return new Promise((resolve, reject) => {
      vk.callFunction({
        url: cloudStorageConfig.authAction,
        debug: false,
        encrypt,
        uniCloud: runCloud,
        data: {
          cloudPath,
          provider: cloudStorageConfig.provider,
          domain: cloudStorageConfig.domain
        },
        success: (res) => {
          resolve(res);
        },
        fail: (res) => {
          reject(res);
        }
      });
    }).then((uploadFileOptionsRes) => {
      return new Promise((resolve, reject) => {
        let uploadTask = common_vendor.index.uploadFile({
          ...uploadFileOptionsRes.uploadFileOptions,
          filePath,
          // 本地文件路径
          success: (uploadFileRes) => {
            if (![200, 201].includes(uploadFileRes.statusCode)) {
              reject(uploadFileRes);
            } else {
              let extendInfo = {};
              try {
                if (cloudStorageConfig.provider === "qiniu") {
                  extendInfo = JSON.parse(uploadFileRes.data);
                  if (!isNaN(extendInfo.width))
                    extendInfo.width = Number(extendInfo.width);
                  if (!isNaN(extendInfo.height))
                    extendInfo.height = Number(extendInfo.height);
                  if (!isNaN(extendInfo.size))
                    extendInfo.size = Number(extendInfo.size);
                }
              } catch (err) {
                common_vendor.index.__f__("error", "at uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/cloud-storage/extStorage.js:64", "err: ", err);
              }
              const { cloudPath: cloudPath2, fileID, fileURL } = uploadFileOptionsRes;
              const res = {
                filePath,
                // 本地文件路径
                cloudPath: cloudPath2,
                // 文件云端路径
                fileID,
                // 文件ID
                fileURL,
                // 云端文件URL
                url: fileURL,
                // 云端文件URL，与fileURL一致
                extendInfo
              };
              resolve(res);
            }
          },
          fail: (res) => {
            reject(res);
          }
        });
        uploadTask.onProgressUpdate((res) => {
          if (res.progress > 0) {
            if (typeof obj.onUploadProgress === "function")
              obj.onUploadProgress({
                total: res.totalBytesExpectedToSend,
                loaded: res.totalBytesSent,
                progress: res.progress
              });
          }
        });
      });
    });
  }
}
const extStorage = new CloudStorage();
function getConfig() {
  return common_vendor.index.vk.getConfig("service.cloudStorage.extStorage");
}
function createFileName(obj = {}) {
  let {
    file,
    filePath,
    suffix,
    index = 0,
    cloudPathRemoveChinese = true,
    cloudDirectory
  } = obj;
  let vk = common_vendor.index.vk;
  let cloudStorageConfig = getConfig();
  let dirname = cloudStorageConfig.dirname;
  let oldName = index + "." + suffix;
  if (file && file.name) {
    let suffixName = file.name.substring(file.name.lastIndexOf(".") + 1);
    if (suffixName && suffixName.length < 5)
      oldName = file.name;
    if (cloudPathRemoveChinese) {
      oldName = oldName.replace(/[^a-zA-Z.-d]/g, "");
    }
    if (oldName.indexOf(".") == 0)
      oldName = "0" + oldName;
  }
  let date = /* @__PURE__ */ new Date();
  let dateYYYYMMDD = vk.pubfn.timeFormat(date, "yyyy/MM/dd");
  let dateTime = date.getTime().toString();
  let dateTimeEnd8 = dateTime.substring(dateTime.length - 8, dateTime.length);
  let randomNumber = vk.pubfn.random(8);
  let servicePath = "";
  if (cloudDirectory) {
    if (cloudDirectory.lastIndexOf("/") !== cloudDirectory.length - 1) {
      cloudDirectory = cloudDirectory + "/";
    }
    servicePath = cloudDirectory;
  } else {
    servicePath = dateYYYYMMDD + "/";
    try {
      if (cloudStorageConfig.groupUserId && typeof vk.getVuex === "function") {
        let userInfo = vk.getVuex("$user.userInfo");
        if (vk.pubfn.isNotNull(userInfo) && userInfo._id) {
          servicePath = `${userInfo._id}/${servicePath}`;
        }
      }
    } catch (err) {
    }
  }
  let fileName = dateTimeEnd8 + randomNumber + "-" + oldName;
  let fileRelativePath = servicePath + fileName;
  let cloudPath = dirname + "/" + fileRelativePath;
  return cloudPath;
}
exports.extStorage = extStorage;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/cloud-storage/extStorage.js.map
