"use strict";
const uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_deepClone = require("./deepClone.js");
const util = {};
util.treeToArray = function(treeData, treeProps) {
  let newTreeData = uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_deepClone.deepClone(treeData);
  return util.treeToArrayFn(newTreeData, treeProps);
};
util.treeToArrayFn = function(treeData, treeProps = {}, arr = [], current_parent_id) {
  let { id = "_id", parent_id = "parent_id", children = "children", deleteChildren = true } = treeProps;
  for (let i in treeData) {
    let item = treeData[i];
    if (current_parent_id)
      item[parent_id] = current_parent_id;
    arr.push(item);
    if (item[children] && item[children].length > 0) {
      arr = util.treeToArrayFn(item[children], treeProps, arr, item[id]);
    }
    if (deleteChildren) {
      delete item[children];
    }
  }
  return arr;
};
util.arrayToTree = function(originalArrayData, treeProps) {
  let arrayData = uni_modules_vkUnicloud_vk_modules_vkUnicloudPage_libs_function_deepClone.deepClone(originalArrayData);
  let {
    id = "_id",
    parent_id = "parent_id",
    children = "children",
    deleteParentId = false,
    need_field
  } = treeProps;
  let result = [];
  let temp = {};
  for (let i = 0; i < arrayData.length; i++) {
    temp[arrayData[i][id]] = arrayData[i];
  }
  for (let j = 0; j < arrayData.length; j++) {
    let currentElement = arrayData[j];
    if (need_field) {
      need_field = uniqueArr(need_field.concat([id, parent_id, children]));
      for (let keyName in currentElement) {
        if (need_field.indexOf(keyName) === -1) {
          delete currentElement[keyName];
        }
      }
    }
    let tempCurrentElementParent = temp[currentElement[parent_id]];
    if (tempCurrentElementParent) {
      if (!tempCurrentElementParent[children]) {
        tempCurrentElementParent[children] = [];
      }
      if (deleteParentId) {
        delete currentElement[parent_id];
      }
      tempCurrentElementParent[children].push(currentElement);
    } else {
      result.push(currentElement);
    }
  }
  return result;
};
function uniqueArr(array) {
  let n = [];
  for (let i = 0; i < array.length; i++) {
    if (n.indexOf(array[i]) == -1)
      n.push(array[i]);
  }
  return n;
}
exports.util = util;
//# sourceMappingURL=../../../../../../../.sourcemap/mp-weixin/uni_modules/vk-unicloud/vk_modules/vk-unicloud-page/libs/function/treeUtil.js.map
