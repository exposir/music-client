// require('electron').ipcRenderer.send('component-ready', 'begining of main.js')
require('electron').webFrame.setVisualZoomLevelLimits(1, 1) //禁止双击触屏页面缩放

import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import VueLazyload from 'vue-lazyload'
import 'element-ui/lib/theme-default/index.css'
import routerConfig from './router.config.js'
import clientConfigs from 'components/commonFuns/clientConfigs.js'
import VueAreaLinkage from 'vue-area-linkage';
import 'vue-area-linkage/dist/index.css'

import store from './store/index'
import commonFuns from 'components/commonFuns/common.js'
import MessageBox from 'components/messageBox/main.js'
import domAction from 'utils/domAction.js'


// require('electron').ipcRenderer.send('component-ready', 'before all start')

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(VueLazyload, {
    loading: 'static/images/default_pic.svg',
    error: 'static/images/default_pic.svg',
    try: 3
})
Vue.use(VueAreaLinkage)

Vue.prototype.commonFuns = commonFuns;
Vue.prototype.MessageBox = MessageBox
Vue.prototype.domAction = domAction
Vue.prototype.clientConfigs = clientConfigs

window.eventBus = new Vue({})
    // console.log(window.eventBus);
window.clientConfigs = clientConfigs
const router = new VueRouter(routerConfig)

router.beforeEach((to, from, next) => {
    if (to.path) {
        _hmt.push(['_trackPageview', '/#' + to.fullPath]);
    }
    next();
});

import App from './App'

/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    store,
    template: '<App/>'
}).$mount('#app')

window.vueStore = store;
// console.log(window.vueStore)