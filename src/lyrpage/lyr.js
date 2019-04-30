// require('electron').ipcRenderer.send('component-ready', 'begining of main.js')
require('electron').webFrame.setVisualZoomLevelLimits(1, 1) //禁止双击触屏页面缩放

import Vue from 'vue'
import commonFuns from 'components/commonFuns/common.js'
//import store from './store/index'

if(!document.getElementById("lyrPage")) { 
    let div=document.createElement("div");
    div.id = "lyrPage";
    document.body.appendChild(div);
}

import Lyr from './Lyr.vue'
/* eslint-disable no-new */
new Vue({
    components: { Lyr },
   // store,
    template: '<Lyr/>'
}).$mount('#lyrPage')