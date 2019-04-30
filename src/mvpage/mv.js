// require('electron').ipcRenderer.send('component-ready', 'begining of main.js')
require('electron').webFrame.setVisualZoomLevelLimits(1, 1) //禁止双击触屏页面缩放

import Vue from 'vue'


if(!document.getElementById("mvcontent")) {
    let div=document.createElement("div");
    div.id = "mvcontent";
    document.body.appendChild(div);
}


import Mv from './Mv.vue'
/* eslint-disable no-new */
new Vue({
    components: { Mv },
    template: '<Mv/>'
}).$mount('#mvcontent')
