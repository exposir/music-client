const defaults = {
    title: undefined,
    message: '',
    type: '',
    showInput: false,
    showClose: true,
    modalFade: true,
    lockScroll: true,
    closeOnClickModal: true,
    closeOnPressEscape: true,
    showConfirmButton: true,
    showCancelButton: false,
    confirmButtonPosition: 'right',
    confirmButtonHighlight: false,
    cancelButtonHighlight: false,
    confirmButtonText: '',
    cancelButtonText: '',
    confirmButtonClass: '',
    cancelButtonClass: '',
    customClass: '',
    beforeClose: null
}

import Vue from 'vue'
import { isVNode } from 'utils/vdom'


let currentMsg, MessageBoxConstructor, instance
let msgQueue = [];

const defaultCallback = action => {
    if (currentMsg) {
        let callback = currentMsg.callback;
        if (typeof callback === 'function') {
            if (instance.showInput) {
                callback(instance.inputValue, action);
            } else {
                callback(action);
            }
        }
        if (currentMsg.resolve) {
            let $type = currentMsg.options.$type;
            if ($type === 'confirm' || $type === 'prompt') {
                if (action === 'confirm') {
                    if (instance.showInput) {
                        currentMsg.resolve({ value: instance.inputValue, action });
                    } else {
                        currentMsg.resolve(action);
                    }
                } else if (action === 'cancel' && currentMsg.reject) {
                    currentMsg.reject(action);
                }
            } else {
                currentMsg.resolve(action);
            }
        }
    }
}

const initInstance = () => {
    instance = new MessageBoxConstructor({
        el: document.createElement('div')
    })
    instance.callback = defaultCallback
        // console.log(instance)
}

const showNextMsg = () => {
    if (!instance) {
        initInstance();
    }
    instance.action = ''

    if (!instance.visible || instance.closeTimer) {
        if (msgQueue.length > 0) {
            currentMsg = msgQueue.shift()
            let options = currentMsg.options

            for (let prop in options) {
                if (options.hasOwnProperty(prop)) {
                    instance[prop] = options[prop]
                }
            }

            if (options.callback === undefined) {
                instance.callback = defaultCallback
            }

            let oldCb = instance.callback;
            instance.callback = (action, instance) => {
                oldCb(action, instance)
                showNextMsg()
            }

            if (isVNode(instance.message)) {
                instance.$slots.default = [instance.message];
                instance.message = null;
            } else {
                delete instance.$slots.default;
            }
            ['modal', 'showClose', 'closeOnClickModal', 'closeOnPressEscape'].forEach(prop => {
                if (instance[prop] === undefined) {
                    instance[prop] = true
                }
            });
            document.body.appendChild(instance.$el)

            Vue.nextTick(() => {
                instance.visible = true;
            });
        }
    }
}

const MessageBox = function(options, callback) {
    if (Vue.prototype.$isServer) return;
    if (options.callback && !callback) {
        callback = options.callback
    }
    return new Promise((resolve, reject) => { // eslint-disable-line
        msgQueue.push({
            options: Object.assign({}, defaults, MessageBox.defaults, options),
            callback: callback,
            resolve: resolve,
            reject: reject
        })

        showNextMsg()
    });

}

MessageBox.setDefaults = defaults => {
    MessageBox.defaults = defaults
}

//付费阻断弹层
MessageBox.pay = (message, songInfoObj, options) => {
    MessageBoxConstructor = null
    instance = null
    import ('./pay.vue').then((messageBoxVue) => {
        let obj = messageBoxVue.default;
        if (!obj) {
            obj = messageBoxVue;
        }
        console.log(obj)

        MessageBoxConstructor = Vue.extend(obj)
        return MessageBox(Object.assign({
            songInfoObj: songInfoObj,
            message: message,
            $type: 'pay',
            closeOnPressEscape: false,
            closeOnClickModal: false
        }, options))
    })
}

//付费弹层包含 vip购买 单点付费购买
MessageBox.bdpay = (data) => {
    let type = data.type ? data.type : 'vip';
    let typeid = data.typeid ? data.typeid : '';

    let option = {
        type: type,
        typeid: typeid,
        from: 'web',
        deviceName: 'mac'
    };
    let bdPay = new BdPay(option);
    bdPay.show();

}

//下载弹层
MessageBox.download = (songArray, positionData, options) => {
    MessageBoxConstructor = null
    instance = null
    import ('./rateSelectContext.vue').then((messageBoxVue) => {
        let obj = messageBoxVue.default;
        if (!obj) {
            obj = messageBoxVue;
        }
        // console.log(obj)

        MessageBoxConstructor = Vue.extend(obj)
        return MessageBox(Object.assign({
            songArray: songArray,
            positionData: positionData
        }, options))
    })
}

//添加到弹层
MessageBox.addToSong = (songArray, listid, positionData, options) => {
    MessageBoxConstructor = null
    instance = null
    import ('./addToSongContext.vue').then((messageBoxVue) => {
        let obj = messageBoxVue.default;
        if (!obj) {
            obj = messageBoxVue;
        }

        MessageBoxConstructor = Vue.extend(obj)
        return MessageBox(Object.assign({
            songArray: songArray,
            listid: listid,
            positionData: positionData
        }, options))
    })
}

//tips提示：   买VIp弹窗等其他弹窗
MessageBox.tips = (title, message, options) => {
    MessageBoxConstructor = null
    instance = null
    import ('./tips.vue').then((messageBoxVue) => {
        let obj = messageBoxVue.default;
        if (!obj) {
            obj = messageBoxVue;
        }
        console.log(obj)

        MessageBoxConstructor = Vue.extend(obj)
        return MessageBox(Object.assign({
            title: title,
            message: message
        }, options))
    })
}

//右键菜单
MessageBox.context = (songArray, select_index_array, type, list_id, positionData, options) => {
    MessageBoxConstructor = null
    instance = null
    import ("./context.vue").then((messageBoxVue) => {
        // console.log(songArray);
        let obj = messageBoxVue.default;
        if (!obj) {
            obj = messageBoxVue;
        }
        console.log(obj)

        let params = Object.assign({
            songArray: songArray,
            select_index_array: select_index_array,
            type: type,
            list_id: list_id,
            positionData: positionData
        }, options)
        MessageBoxConstructor = Vue.extend(obj)
            // console.log(MessageBoxConstructor)
        return MessageBox(params)
    })
}

//leftBarContext右键菜单
MessageBox.leftBarContext = (type, list_id, list_title, positionData, options) => {
    MessageBoxConstructor = null
    instance = null
    import ('./leftBarContext.vue').then((messageBoxVue) => {
        // console.log(songArray);
        let obj = messageBoxVue.default;
        if (!obj) {
            obj = messageBoxVue;
        }
        console.log(obj)

        MessageBoxConstructor = Vue.extend(obj)
        return MessageBox(Object.assign({
            type: type,
            list_id: list_id,
            list_title: list_title,
            positionData: positionData
        }, options))
    })
}

MessageBox.downloadingContext = (positionData, options) => {
    MessageBoxConstructor = null
    instance = null
    import ('./downloadingContext.vue').then((messageBoxVue) => {
        // console.log(songArray);
        let obj = messageBoxVue.default;
        if (!obj) {
            obj = messageBoxVue;
        }
        console.log(obj)

        MessageBoxConstructor = Vue.extend(obj)
        return MessageBox(Object.assign({
            positionData: positionData
        }, options))
    })
}

MessageBox.close = () => {
    instance.visible = false
    msgQueue = []
    currentMsg = null
}

export default MessageBox