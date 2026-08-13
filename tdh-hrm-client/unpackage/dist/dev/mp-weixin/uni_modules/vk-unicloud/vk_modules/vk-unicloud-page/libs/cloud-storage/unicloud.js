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
      runCloud,
      cloudPathAsRealPath = true
    } = obj;
    common_vendor.index.vk;
    if (!runCloud)
      runCloud = common_vendor.wr;
    if (!cloudPath)
      cloudPath = createFileName(obj);
    return new Promise((resolve, reject) => {
      runCloud.uploadFile({
        filePath,
        cloudPath,
        fileType,
        cloudPathAsRealPath,
        onUploadProgress: (progressEvent) => {
          let percentCompleted = Math.round(
            progressEvent.loaded * 100 / progressEvent.total
          );
          if (typeof obj.onUploadProgress == "function") {
            obj.onUploadProgress({
              total: progressEvent.total,
              loaded: progressEvent.loaded,
              progress: percentCompleted
            });
          }
        },
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject(err);
        }
      });
    }).then((res) => {
      return new Promise((resolve, reject) => {
        common_vendor.wr.getTempFileURL({
          fileList: [res.fileID],
          success: (data) => {
            let { fileID, tempFileURL } = data.fileList[0];
            res = {
              filePath,
              // 本地文件路径
              cloudPath: getCloudPath(tempFileURL),
              // 云端文件路径
              fileID,
              // 云端文件ID
              fileURL: tempFileURL,
              // 云端文件URL
              url: tempFileURL
              // 云端文件URL，与fileURL一致
            };
            resolve(res);
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    });
  }
}
const unicloud = new CloudStorage();
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
  let newFilePath = "";
  if (cloudDirectory) {
    if (cloudDirectory.lastIndexOf("/") !== cloudDirectory.length - 1) {
      cloudDirectory = cloudDirectory + "/";
    }
    newFilePath = cloudDirectory;
  } else {
    newFilePath = dateYYYYMMDD + "/";
  }
  let fileName = dateTimeEnd8 + "-" + randomNumber + "-" + oldName;
  let cloudPath = newFilePath + fileName;
  return cloudPath;
}
function getCloudPath(url = "") {
  url = url.split("?")[0];
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
exports.unicloud = unicloud;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/cloud-storage/unicloud.js.map
