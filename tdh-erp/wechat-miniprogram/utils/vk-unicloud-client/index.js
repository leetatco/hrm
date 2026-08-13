// vk-unicloud-client/index.js
const vk = {
  config: {
    provider: 'weixin',
    envList: {
      default: 'your-cloud-env-id'
    }
  },
  
  init(options) {
    this.config = Object.assign(this.config, options);
    // 初始化云开发环境
    wx.cloud.init({
      env: this.config.envList.default,
      traceUser: true
    });
  },
  
  // 调用云函数
  callFunction(options) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: options.name,
        data: options.data || {},
        success: resolve,
        fail: reject
      });
    });
  },
  
  // 数据库操作
  baseDao: {
    select(options) {
      const db = wx.cloud.database();
      let query = db.collection(options.dbName);
      
      if (options.where) {
        query = query.where(options.where);
      }
      
      return new Promise((resolve, reject) => {
        query.get({
          success: resolve,
          fail: reject
        });
      });
    },
    
    insert(options) {
      const db = wx.cloud.database();
      return new Promise((resolve, reject) => {
        db.collection(options.dbName).add({
          data: options.data,
          success: resolve,
          fail: reject
        });
      });
    },
    
    update(options) {
      const db = wx.cloud.database();
      return new Promise((resolve, reject) => {
        db.collection(options.dbName).doc(options.id).update({
          data: options.data,
          success: resolve,
          fail: reject
        });
      });
    },
    
    delete(options) {
      const db = wx.cloud.database();
      return new Promise((resolve, reject) => {
        db.collection(options.dbName).doc(options.id).remove({
          success: resolve,
          fail: reject
        });
      });
    }
  }
};

module.exports = vk;