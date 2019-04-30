'use strict'

import { globalShortcut } from 'electron'
import log from 'electron-log'

let main_window = null;

let default_shortcut = [{ accelerator_key: 'Ctrl+shift+M', desc: 'shortcut_minimode' },
    { accelerator_key: 'Ctrl+Alt+W', desc: 'shortcut_minimize' },
    // { accelerator_key: 'CmdOrCtrl+Alt+E', desc: 'shortcut_desklyric' },
    { accelerator_key: 'Ctrl+shift+X', desc: 'shortcut_playpause' },
    { accelerator_key: 'Ctrl+shift+L', desc: 'shortcut_playprev' },
    { accelerator_key: 'Ctrl+shift+R', desc: 'shortcut_playnext' },
    { accelerator_key: 'Ctrl+shift+U', desc: 'shortcut_volume_up' },
    { accelerator_key: 'Ctrl+shift+D', desc: 'shortcut_volume_down' },
    { accelerator_key: 'Ctrl+Alt+S', desc: 'shortcut_volume' },
    { accelerator_key: 'Ctrl+Alt+F', desc: 'shortcut_fast_forward' },
    { accelerator_key: 'Ctrl+Alt+R', desc: 'shortcut_rewind' }
];
let current_shortcuts = [];

//切换mini模式
function shortcut_minimode(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        main_window.webContents.send('asynchronous-reply', 'shortcut_minimode');
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

//最小化/还原
function shortcut_minimize(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        if (main_window) {
            if (main_window.isMinimized()) {
                main_window.restore();
            } else {
                main_window.minimize();
            }
        }
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

//打开/关闭桌面歌词
function shortcut_desklyric(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        main_window.webContents.send('asynchronous-reply', 'shortcut_desklyric');
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

//播放/暂停
function shortcut_playpause(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        // console.log(main_window)
        main_window.webContents.send('asynchronous-reply', 'shortcut_playpause');
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

//播放上一首
function shortcut_playprev(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        main_window.webContents.send('asynchronous-reply', 'shortcut_playprev');
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

//播放下一首
function shortcut_playnext(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        main_window.webContents.send('asynchronous-reply', 'shortcut_playnext');
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

function shortcut_volume(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        main_window.webContents.send('asynchronous-reply', 'shortcut_volume');
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

function shortcut_volume_up(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        main_window.webContents.send('asynchronous-reply', 'shortcut_volume_up');
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

function shortcut_volume_down(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        main_window.webContents.send('asynchronous-reply', 'shortcut_volume_down');
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

function shortcut_fast_forward(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        main_window.webContents.send('asynchronous-reply', 'shortcut_fast_forward');
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

function shortcut_rewind(accelerator_key) {
    const ret = globalShortcut.register(accelerator_key, () => {
        main_window.webContents.send('asynchronous-reply', 'shortcut_rewind');
    })

    if (!ret) {
        console.log('register ' + accelerator_key + ' failed!');
    }
}

function register_shortcut(shortcut_item) {
    if (!shortcut_item || shortcut_item.accelerator_key.length < 1) {
        console.log('current short cut is valid, cannot register');
        return;
    }
    if (globalShortcut.isRegistered(shortcut_item.accelerator_key)) {
        console.log('accelerator: ' + accelerator_key + ' has been registered');
        return;
    }

    if (shortcut_item.desc == 'shortcut_minimode') {
        shortcut_minimode(shortcut_item.accelerator_key);
    } else if (shortcut_item.desc == 'shortcut_minimize') {
        shortcut_minimize(shortcut_item.accelerator_key);
    } else if (shortcut_item.desc == 'shortcut_desklyric') {
        shortcut_desklyric(shortcut_item.accelerator_key);
    } else if (shortcut_item.desc == 'shortcut_playpause') {
        shortcut_playpause(shortcut_item.accelerator_key);
    } else if (shortcut_item.desc == 'shortcut_playprev') {
        shortcut_playprev(shortcut_item.accelerator_key);
    } else if (shortcut_item.desc == 'shortcut_playnext') {
        shortcut_playnext(shortcut_item.accelerator_key);
    } else if (shortcut_item.desc == 'shortcut_volume_up') {
        shortcut_volume_up(shortcut_item.accelerator_key);
    } else if (shortcut_item.desc == 'shortcut_volume_down') {
        shortcut_volume_down(shortcut_item.accelerator_key);
    } else if (shortcut_item.desc == 'shortcut_volume') {
        shortcut_volume(shortcut_item.accelerator_key);
    } else if (shortcut_item.desc == 'shortcut_fast_forward') {
        shortcut_fast_forward(shortcut_item.accelerator_key);
    } else if (shortcut_item.desc == 'shortcut_rewind') {
        shortcut_rewind(shortcut_item.accelerator_key);
    }
}



export default {
    setMainWindow(window) {
        main_window = window;
        // console.log(main_window)
    },

    initShortcut(shortcuts) {
        globalShortcut.unregisterAll();
        current_shortcuts = shortcuts;
        for (let i = 0; i < shortcuts.length; i++) {
            let shortcut_item = shortcuts[i];
            if (shortcut_item && shortcut_item.accelerator_key && shortcut_item.accelerator_key != "") {
                register_shortcut(shortcut_item);
            }
        }
    },

    resetShortcut() {
        globalShortcut.unregisterAll();
        for (let i = 0; i < default_shortcut.length; i++) {
            let shortcut_item = default_shortcut[i];
            register_shortcut(shortcut_item)
        }
    },

    modifyShortcut(shortcut_item) {
        for (let i = 0; i < current_shortcuts.length; i++) {
            let item = current_shortcuts[i];
            if (item.desc == shortcut_item.desc) {
                console.log('modift shortcut is: ' + item.accelerator_key)
                if (item.accelerator_key && item.accelerator_key.length > 0) {
                    if (globalShortcut.isRegistered(item.accelerator_key)) {
                        globalShortcut.unregister(item.accelerator_key);
                    }

                }
                item.accelerator_key = shortcut_item.accelerator_key;
                break;
            }
        }
        register_shortcut(shortcut_item);
    },

    unregisterAll() {
        global.unregisterAll();
    },

    unregisterShortcut(shortcut_item) {
        globalShortcut.unregister(shortcut_item.accelerator_key);
    }
}