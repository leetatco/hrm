# VK Unicloud 微信小程序项目

## 项目结构

```
wechat-miniprogram/
├── pages/
│   └── index/           # 首页
│       ├── index.wxml   # 页面结构
│       ├── index.wxss   # 页面样式
│       └── index.js     # 页面逻辑
├── components/
│   └── vk-uview-ui/     # UI组件库
│       └── index.wxss   # 组件样式
├── utils/
│   └── vk-unicloud-client/  # VK Unicloud 客户端
│       └── index.js     # 客户端核心代码
├── app.json             # 小程序配置
├── app.js               # 小程序初始化
├── app.wxss             # 全局样式
└── sitemap.json         # 站点地图配置
```

## 配置步骤

1. **配置云开发环境**
   - 在 `app.js` 中修改云开发环境ID：
   ```javascript
   envList: {
     default: 'your-cloud-env-id'  // 替换为你的云开发环境ID
   }
   ```

2. **创建云函数**
   - 在微信开发者工具中，右键点击 `cloudfunctions` 目录，选择 "新建 Node.js 云函数"
   - 创建名为 `test` 的云函数，用于测试云函数调用

3. **创建数据库集合**
   - 在云开发控制台中，创建名为 `test` 的数据库集合，用于测试数据库操作

## 功能说明

1. **获取用户信息**
   - 点击 "获取用户信息" 按钮，获取当前用户的头像和昵称

2. **调用云函数**
   - 点击 "调用云函数" 按钮，调用 `test` 云函数并显示结果

3. **查询数据库**
   - 点击 "查询数据库" 按钮，查询 `test` 集合的数据并显示结果

## 运行项目

1. 打开微信开发者工具
2. 点击 "导入项目"
3. 选择 `wechat-miniprogram` 目录
4. 填写 AppID（如果没有，可以使用测试号）
5. 点击 "导入"
6. 点击 "编译" 按钮运行项目

## 技术栈

- **框架**：微信小程序原生框架
- **云服务**：微信云开发
- **UI库**：vk-uview-ui
- **云开发工具**：vk-unicloud-client

## 注意事项

- 确保已开通微信云开发服务
- 确保云函数和数据库集合已正确创建
- 确保云开发环境ID已正确配置
- 在真机测试时，需要在 "详情" -> "本地设置" 中勾选 "不校验合法域名"
