import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/global.css'
import request from './utils/request'
Vue.use(ElementUI, {size:"small"})
Vue.config.productionTip = false
Vue.prototype.request=request
new Vue({
  render: h => h(App),
  beforeCreate() {
		Vue.prototype.$bus = this //安装全局事件总线。让所有组件都能用$bus
	},
}).$mount('#app')