"use strict";
const common_vendor = require("../../../../../../common/vendor.js");
class CloudStorage {
  constructor() {
    this.counterNum = 0;
  }
  uploadFile(obj = {}) {
    let {
      filePath,
      fileType,
      suffix,
      name = "file",
      header = {
        "x-oss-forbid-overwrite": true
      },
      index = 0,
      file = {},
      cloudPathRemoveChinese = true,
      // 删除文件名中的中文
      cloudDirectory
    } = obj;
    let vk = common_vendor.index.vk;
    let fileNameObj = createFileName(obj);
    let cloudStorageConfig = getConfig();
    let fileName = fileNameObj.fileFullName;
    let formData = vk.pubfn.copyObject(cloudStorageConfig.uploadData);
    formData["key"] = fileName;
    if (filePath.indexOf(";base64,") > -1) {
      formData["file"] = dataURLtoBlob(filePath);
    } else {
      formData["name"] = filePath;
    }
    return new Promise((resolve, reject) => {
      let uploadTask = common_vendor.index.uploadFile({
        url: cloudStorageConfig.action,
        filePath,
        name,
        header,
        formData,
        success: (res) => {
          if (![200, 201].includes(res.statusCode)) {
            reject(res);
          } else {
            let fileURL = fileNameObj.url;
            res = {
              filePath,
              // 本地文件路径
              cloudPath: getCloudPath(fileURL),
              // 云端文件路径
              fileID: fileURL,
              // 云端文件ID
              fileURL,
              // 云端文件URL
              url: fileURL
              // 云端文件URL，与fileURL一致
            };
            resolve(res);
          }
        },
        fail: (err) => {
          reject(err);
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
  }
}
const aliyun = new CloudStorage();
function getConfig() {
  let vk = common_vendor.index.vk;
  let cloudStorageConfig = vk.getConfig("service.cloudStorage.aliyun") || vk.getConfig("service.cloudStorageConfig");
  let configData = {};
  if (cloudStorageConfig && cloudStorageConfig.uploadData && cloudStorageConfig.uploadData.OSSAccessKeyId) {
    try {
      if (cloudStorageConfig.groupUserId && typeof vk.getVuex === "function") {
        let userInfo = vk.getVuex("$user.userInfo");
        if (vk.pubfn.isNotNull(userInfo) && userInfo._id) {
          cloudStorageConfig.dirname += `/${userInfo._id}`;
        }
      }
    } catch (err) {
    }
    configData = {
      uploadData: {
        OSSAccessKeyId: cloudStorageConfig.uploadData.OSSAccessKeyId,
        policy: cloudStorageConfig.uploadData.policy,
        signature: cloudStorageConfig.uploadData.signature,
        success_action_status: 200,
        key: "test.png"
      },
      action: cloudStorageConfig.action,
      dirname: cloudStorageConfig.dirname,
      host: cloudStorageConfig.host
    };
  }
  return configData;
}
function createFileName(obj = {}) {
  let {
    filePath,
    fileType,
    suffix,
    index = 0,
    file = {},
    cloudPath,
    cloudPathRemoveChinese = true,
    // 删除文件名中的中文
    cloudDirectory
  } = obj;
  let vk = common_vendor.index.vk;
  let cloudStorageConfig = getConfig();
  let dirname = cloudStorageConfig.dirname;
  let host = cloudStorageConfig.host;
  let fileObj = {};
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
  }
  let fileNickName = dateTimeEnd8 + randomNumber + "-" + oldName;
  let fileRelativePath = servicePath + fileNickName;
  if (cloudPath) {
    fileRelativePath = cloudPath;
  }
  let fileFullName = dirname + "/" + fileRelativePath;
  let url = host + "/" + fileFullName;
  fileObj.url = url;
  fileObj.fileFullName = fileFullName;
  fileObj.fileNickName = fileNickName;
  return fileObj;
}
function dataURLtoBlob(dataurl) {
  let arr = dataurl.split(","), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
function getCloudPath(url) {
  let cloudPath = "";
  const match = url.match(/(?:https?:\/\/)?([^/]+)(\/.*)/);
  if (match && match[2]) {
    const extractedPath = match[2];
    if (extractedPath.indexOf("//") === 0) {
      cloudPath = extractedPath.substring(2);
    } else {
      cloudPath = extractedPath.substring(1);
    }
  }
  return cloudPath;
}
exports.aliyun = aliyun;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/cloud-storage/aliyun.js.map
