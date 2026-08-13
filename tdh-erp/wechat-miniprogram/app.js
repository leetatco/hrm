// app.js
App({
  onLaunch() {
    // 初始化vk-unicloud
    const vk = require('./utils/vk-unicloud-client/index.js');
    vk.init({
      provider: 'weixin',
      envList: {
        // 这里配置你的云开发环境ID
        default: 'your-cloud-env-id'
      }
    });
    this.globalData.vk = vk;
  },
  globalData: {
    userInfo: null,
    vk: null
  }
})