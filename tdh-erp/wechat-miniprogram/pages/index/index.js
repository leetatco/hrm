// index.js
const vk = getApp().globalData.vk;

Page({
  data: {
    userInfo: null,
    cloudResult: null,
    dbResult: null
  },
  
  getUserInfo() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo
        });
      }
    });
  },
  
  callCloudFunction() {
    vk.callFunction({
      name: 'test',
      data: {
        message: 'Hello VK Unicloud'
      }
    }).then(res => {
      this.setData({
        cloudResult: JSON.stringify(res)
      });
    }).catch(err => {
      console.error('调用云函数失败:', err);
    });
  },
  
  queryDatabase() {
    vk.baseDao.select({
      dbName: 'test',
      where: {}
    }).then(res => {
      this.setData({
        dbResult: JSON.stringify(res)
      });
    }).catch(err => {
      console.error('查询数据库失败:', err);
    });
  }
})