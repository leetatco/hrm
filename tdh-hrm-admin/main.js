import Vue from 'vue'
import App from './App'
import store from './store'
import config from '@/app.config.js'
import * as echarts from '@/common/theme/echarts.js'
import Print from 'vue-print-nb'

//引入打印模块
Vue.use(Print);

//引入excel
import './common/function/excel.js'
import {
	initExcel
} from "./common/function/excel.js"
//挂载到vue上面，这样在任何页面只要使用this.$iexcel就可以了
Vue.prototype.$iexcel = initExcel();

Vue.prototype.$echarts = echarts;

// 引入 elementUI
import elementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(elementUI);

// 引入 高性能表格UI 组件
import UmyUi from 'umy-ui'
import 'umy-ui/lib/theme-chalk/index.css';
Vue.use(UmyUi);

// 引入 vk 实例
import vk from 'uni_modules/vk-unicloud';
Vue.use(vk, config);

// 引入 vkAdminUI 组件
import vkAdminUI from 'vk-unicloud-admin-ui';
import 'vk-unicloud-admin-ui/theme/index.css';
Vue.use(vkAdminUI);

// 自动注册全局组件（必须加在Vue.use(vkAdminUI);的后面）
const modulesFiles = require.context('./components', true, /\.vue$/);
modulesFiles.keys().map((modulePath, index) => {
	const moduleNames = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1');
	const moduleSplit = moduleNames.split("/");
	const moduleName = moduleSplit[0];
	if (moduleSplit.length === 2 && moduleName === moduleSplit[1]) {
		const value = modulesFiles(modulePath);
		let moduleItem = value.default;
		Vue.component(moduleName, moduleItem);
	}
});

// 引入 自定义全局css 样式
import '@/common/css/app.scss';
// 以下为bpmn工作流绘图工具的样式
// 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

/*右侧详情*/
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()