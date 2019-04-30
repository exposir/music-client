'use strict'

console.log((new Date()).toISOString(), 'begin of begin')

import {
    app,
    Tray,
    BrowserWindow,
    autoUpdater,
    crashReporter,
    Menu,
    MenuItem,
    globalShortcut,
    clipboard,
    session,
    powerSaveBlocker,
    screen,
    shell,
    net
} from 'electron'

import os from 'os'
import reportService from './module/reportService'
import cookies from './module/cookies'
import whitelist from './whiteList'
import log from 'electron-log'
import shortCut from './shortcut.js'
import path from 'path'
const fs = require('fs');
var url = require('url');
var http = require('http');
const spawn = require('child_process').spawn

// console.log(log)
log.transports.file.level = 'info';
log.transports.file.format = '{h}:{i}:{s}:{ms} {text}';
log.transports.file.maxSize = 5 * 1024 * 1024;

console.log((new Date()).toISOString(), 'before crashReporter.start')

crashReporter.start({
    productName: 'QianqianMusic',
    companyName: 'YinZhiBang',
    submitURL: 'https://report.qianqian.com/crash',
    uploadToServer: true
})
log.info('crashReporter start...........')

console.log((new Date()).toISOString(), 'before ipc')

let will_quit = false;
let will_leave_full_screen = false;
let mainWindow = null;
let mv_window = null;
let lyr_window = null;

//系统托盘
let trayMenu = null;
let menuTemplate = null;
let appTray = null;
let current_song_name = '千千音乐'
let current_song_list_length = 0
let current_playing_state = 0;
let lyric_window_show = false;

const ipcMain = require('electron').ipcMain;

ipcMain.on('asynchronous-message', (event, arg) => {
    if (typeof arg === 'object') {
        if (arg.hasOwnProperty('new_mv_window') && arg.new_mv_window === 'new_mv_window') {
            createMv(event, arg);
        } else if (arg.hasOwnProperty('desc')) {
            if (arg.desc == "shortcut_init") {
                shortCut.initShortcut(arg.data);
            } else if (arg.desc == "reset_shortcut") {
                shortCut.resetShortcut();
            } else if (arg.desc == "modify_shortcut") {
                console.log(arg.data);
                shortCut.modifyShortcut(arg.data)
            } else if (arg.desc == "unregister_shortcut") {
                shortCut.unregisterShortcut(arg.data)
            } else if (arg.desc == "traymenu_songname") {
                current_song_name = arg.data;
                // console.log('current playing song is: ' + current_song_name)
            } else if (arg.desc == "traymenu_listsize") {
                current_song_list_length = arg.data;
                // console.log('current playing list length is: ' + current_song_list_length)
            } else if (arg.desc == "traymenu_playstate") {
                current_playing_state = arg.data;
                // console.log('current playing state is: ' + current_playing_state)
            } else if (arg.desc == "update") {
                console.log(arg);
                log.info('new update avaliable...........')
                downloadUpate(arg.url, arg.detail, arg.version)
            }
        }

    } else if (arg === 'close_mv') {
        mv_window.close();
        if (mv_window != null) {
            mv_window = null
        }
    } else if (arg === 'minimize_mv_window') {
        if (mv_window != null) {
            mv_window.close();
        }
        event.sender.send('asynchronous-reply', 'minimize_mv');
    } else if (arg === 'close_mv_window') {
        if (mv_window != null) {
            mv_window.close();
        }
    } else if (arg === 'new_lyr_window') {
        lyric_window_show = true;
        createLyrWindow(event, arg);
    } else if (arg === 'close_lyr') {
        lyric_window_show = false;
        if (lyr_window != null) {
            lyr_window.close();
            lyr_window = null

        }
    } else if (arg === 'maximize_main_window') {
        mainWindow.maximize();
        event.sender.send('asynchronous-reply', 'maximize_main_window');
    } else if (arg === 're_maximize_main_window') {
        mainWindow.unmaximize();
        mainWindow.setSize(970, 670)
        mainWindow.center()
        event.sender.send('asynchronous-reply', 'unmaximize_main_window');
    } else if (arg === 'unmaximize_main_window') {
        mainWindow.setFullScreen(false);
        event.sender.send('asynchronous-reply', 'unmaximize_main_window');
    } else if (arg === 'minimize_main_window') {
        mainWindow.minimize();
    } else if (arg === 'close_to_tray') {
        mainWindow.hide();
    } else if (arg === 'close_main_window') {
        will_quit = true;
        if (lyr_window != null) {
            lyr_window.close();
            lyr_window = null
        }
        if (mv_window != null) {
            mv_window.close();
            mv_window = null;
        }
        mainWindow.close();
    } else if (arg === 'ismaximize_main_window') {
        let isFullScreen = mainWindow.isFullScreen();
        if (isFullScreen) {
            mainWindow.setFullScreen(false);
            event.sender.send('asynchronous-reply', 'unmaximize_main_window');
        }
    } else if (arg === 'can-goback') {
        let canGoback = mainWindow.webContents.canGoBack()
        if (!canGoback) {
            event.sender.send('asynchronous-reply', 'cannot-goback');
        }
    } else if (arg === 'can-goforward') {
        let canGoforward = mainWindow.webContents.canGoForward()
        if (!canGoforward) {
            event.sender.send('asynchronous-reply', 'cannot-goforward');
        }
    } else if (arg === 'mini-window') {
        mainWindow.setMinimumSize(320, 50)
        mainWindow.setAlwaysOnTop(true)
        mainWindow.setSize(320, 50)
        mainWindow.center()
        mainWindow.setResizable(false)

    } else if (arg === 'main-window') {
        mainWindow.setMinimumSize(970, 670)
        mainWindow.setResizable(true)
        mainWindow.setAlwaysOnTop(false)
        mainWindow.setSize(970, 670)
        mainWindow.center()
    } else if (arg === 'logout') {
        cookies.removeCookies('http://passport.taihe.com', 'BDUSS', function() {
            console.log('logout reply')
        })
        cookies.removeCookies('http://passport.qianqian.com', 'BDUSS', function() {
            console.log('logout reply')
        })
        cookies.removeCookies('http://passport.taihe.com', 'token_', function() {
            console.log('logout reply')
        })
        cookies.removeCookies('http://passport.qianqian.com', 'token_', function() {
            console.log('logout reply')
        })
        log.info('user log out')

    } else if (arg === 'notAutoLogin') {
        cookies.setCookies('autoLogin', 'no')
    }

})

function downloadUpate(file_url, desc, version) {
    let file_name = url.parse(file_url).pathname.split('/').pop();
    let folder = app.getPath('temp');
    folder = path.join(folder, 'qianqianMusic');
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
    let filePath = path.join(folder, file_name);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
    }

    let fileStream = fs.createWriteStream(filePath);
    const request = net.request(file_url);
    request.on('response', (response) => {
        // console.log(response)
        response.on('data', (data) => {
            fileStream.write(data);
        })
        response.on('end', () => {
            fileStream.end();

            let msg = '有新的版本(' + version + ')' + '需要安装'
            const options = {
                type: 'info',
                title: '自动更新',
                message: msg,
                cancelId: 1,
                detail: desc,
                buttons: ['安装', '忽略']
            }
            require('electron').dialog.showMessageBox(options, function(index) {
                if (index === 0) {
                    let ret = shell.openItem(filePath);
                    if (ret) {
                        will_quit = true;
                        if (lyr_window != null) {
                            lyr_window.close();
                            lyr_window = null
                        }
                        if (mv_window != null) {
                            mv_window.close();
                            mv_window = null;
                        }
                        mainWindow.close();
                    }
                } else {
                    console.log('user not permit update..................')
                }
            })
        })
    })
    request.end();
};

// function autoUpdate() {
//     console.log('auto update start!')
//     const platform = os.platform() + '_' + os.arch(); // usually returns darwin_64
//     const version = app.getVersion();
//     // const version = '1.0.5';

//     const arg = 'version=' + version + '&channel=' + 'passive';
//     // const feedUrl = 'http://api.qianqian.com/macupgrade/check?' + arg;
//     const feedUrl = 'http://api.qianqian.com/macupgrade/check?' + arg;
//     console.log(feedUrl);
//     autoUpdater.setFeedURL(feedUrl);
//     console.log('[updater] feedUrl', feedUrl);
//     autoUpdater.on('update-available', () => {
//         console.log('[updater] update avaiable');
//         log.info('new version checked')
//     });
//     autoUpdater.on('checking-for-update', () => { console.log('[updater] checking-for-update') })
//     autoUpdater.on('update-not-available', () => {
//         console.log('[updater] update-not-available');
//     })
//     autoUpdater.on('update-downloaded', () => {
//         console.log('[updater] quitAndInstall');
//         const options = {
//             type: 'info',
//             title: '升级安装',
//             message: '升级文件下载完毕，需要重启千千音乐',
//             buttons: ['安装并重启']
//         }
//         require('electron').dialog.showMessageBox(options, function(index) {
//             will_quit = true; //这个变量能控制是不是彻底退出
//             if (mainWindow !== null) {
//                 console.log('close mainwindow to update');
//                 mainWindow.close()
//             }
//             console.log('autoupdate start, electron quit!');
//             log.info('autoupdate start, electron quit!')
//             autoUpdater.quitAndInstall();
//         })
//     });

//     autoUpdater.on('error', (err) => {
//         console.log('[updater] error:', err);
//         log.info('update occurs error')
//     });

//     autoUpdater.checkForUpdates();
// }

const winURL = process.env.NODE_ENV === 'development' ?
    `http://musicmini2017.baidu.com:9080` :
    `file://${__dirname}/index.html`

function createWindow() {

    if (mainWindow != null) {
        return
    }
    /**
     * Initial window options
     */
    if (process.env.NODE_ENV === 'development') {
        mainWindow = new BrowserWindow({
            height: 670,
            width: 970,
            resizable: true,
            webPreferences: {
                webSecurity: false
            },
            frame: false,
            useContentSize: true
        })
        mainWindow.webContents.openDevTools({ mode: 'undocked' })
    } else {
        mainWindow = new BrowserWindow({
            frame: false,
            height: 670,
            width: 970,
            // minHeight: 670,
            // minWidth: 970,
            show: false,
            // titleBarStyle: 'hiddenInset',
        })

        // mainWindow.webContents.openDevTools({ mode: 'undocked' })
    }

    console.log((new Date()).toISOString(), 'createWindow')

    mainWindow.on('closed', () => {
        mainWindow = null
        lastCreatedWindow = null

    })

    mainWindow.on('enter-full-screen', (event) => {
        console.log("enter-full-screen")
            //主进程想渲染进程发送消息
        mainWindow.webContents.send('asynchronous-reply', 'maximize_main_window');
    })

    mainWindow.on('maximize', (event) => {
        mainWindow.webContents.send('asynchronous-reply', 'maximize_main_window');
    })

    mainWindow.on('leave-full-screen', (event) => {
        console.log("leave-full-screen")
            //主进程想渲染进程发送消息
        mainWindow.webContents.send('asynchronous-reply', 'unmaximize_main_window');
        if (will_leave_full_screen) {
            mainWindow.hide()
            will_leave_full_screen = false
        }
    })

    mainWindow.on('move', (event) => {
        mainWindow.webContents.send('asynchronous-reply', 'unmaximize_main_window');
    })

    mainWindow.on('unresponsive', function() {
        log.error('process unresponsive!')
        const platform = os.platform() + '_' + os.arch();
        reportService.clickReport({ 'type': 'main-unresponsive', 'system': platform });

        mainWindow.reload()
            // const options = {
            //     type: 'info',
            //     title: '无响应',
            //     message: '页面无响应',
            //     buttons: ['重新加载', '关闭']
            // }
            // require('electron').dialog.showMessageBox(options, function(index) {
            //     if (index === 0) {
            //         mainWindow.reload()
            //     } else {
            //         mainWindow.close()
            //     }
            // })
    })

    mainWindow.webContents.on('crashed', function() {
        log.error('webcontents crashed!')

        const platform = os.platform() + '_' + os.arch();
        reportService.clickReport({ 'type': 'render-crash', 'system': platform });

        mainWindow.reload()

        // const options = {
        //     type: 'info',
        //     title: '崩溃了',
        //     message: '页面出问题了，已重新加载',
        //     buttons: ['关闭']
        // }
        // require('electron').dialog.showMessageBox(options)
    })

    mainWindow.webContents.on('unresponsive', function() {
        log.error('webcontents unresponsive')

        const platform = os.platform() + '_' + os.arch();
        reportService.clickReport({ 'type': 'render-unresponsive', 'system': platform });

        mainWindow.reload()
    })

    mainWindow.webContents.on('plugin-crashed', function() {
        log.error('webcontents plugin crashed..........')

        const platform = os.platform() + '_' + os.arch();
        reportService.clickReport({ 'type': 'plugin-crashed', 'system': platform });

        mainWindow.reload()
    })

    mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        // console.log(`new-window url: ${url}`)
        // console.log(`new-window options: ${JSON.stringnify(options)}`)
        if (url.indexOf('file://') > -1) {
            event.preventDefault()
        } else {
            if (url.indexOf('http://passport.taihe.com/v2/api/auth_third?') > -1) {
                console.log('current new window is third login page........')
                options.frame = true
                options.show = false;
            } else {
                options.frame = false
            }
            options.titleBarStyle = 'default'
            options.parent = mainWindow
            options.webPreferences.nodeIntegration = false
        }
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('close', (event) => {
        console.log('window before close')
        if (!will_quit) {
            event.preventDefault()
            if (mainWindow.isFullScreen()) {
                will_leave_full_screen = true;
                mainWindow.setFullScreen(false)
            } else {
                mainWindow.hide()
            }
        }
    })

    mainWindow.once('ready-to-show', () => {
        log.info('window created and begin to show');
        mainWindow.show()
        console.log((new Date()).toISOString(), 'ready-to-show')
            // mainWindow.webContents.send('asynchronous-reply', 'application_start');
    })

    // eslint-disable-next-line no-console
    console.log((new Date()).toISOString(), 'mainWindow opened')
    log.info(process.argv)

}

// 创建mv窗口
function createMv(event, songinfo) {
    let local_window_html = '';
    let dataJson = JSON.stringify(songinfo);
    let is_mv_window_max = false;

    if (process.env.NODE_ENV === 'development') {
        local_window_html = 'http://musicmini2017.baidu.com:9080/mvpage';
    } else {
        local_window_html = `file://${__dirname}/mvpage.html`;
    }

    try {
        if (null != mv_window) {
            mv_window.close();
            mv_window = null;
        }
        mv_window = new BrowserWindow({
            width: 822,
            height: 556,
            minWidth: 822,
            minHeight: 556,
            show: false,
            maximizable: false,
            minimizable: true,
            resizable: false,
            frame: false, //无边框
            useContentSize: true,
            modal: false
        });
        mv_window.loadURL(local_window_html) //指定渲染的页面
        mv_window.on('close', function() { //关闭
            mv_window = null;
        });
        mv_window.once('ready-to-show', () => { //展示
            mv_window.show();
            let str = songinfo.title ? songinfo.title : 'MV';
            let author = songinfo.artist ? songinfo.artist : '未知';
            mv_window.setTitle(str + '--' + author);
        });
        mv_window.webContents.on('did-finish-load', function() { //加载完成--传递数据
            mv_window.webContents.send('transMvinfo', dataJson);
        });

        // mv_window.on('enter-full-screen', (event) => { //进入全屏---告知要将视频也全屏
        //     mv_window.webContents.send('asynchronous-reply-mv', 'maximize_mv_window');
        // });
        // mv_window.on('resize', ()=> { //
        //     let cur_val = mv_window.isFullScreen();
        //     if ((is_mv_window_max != cur_val) && (cur_val == true)) {
        //         mv_window.webContents.send('asynchronous-reply-mv', 'maximize_mv_window');
        //     } 
        //     is_mv_window_max = cur_val;
        // })

        mainWindow.webContents.send('asynchronous-reply', 'pause'); //打开视频需暂停播放歌曲
        // mv_window.webContents.openDevTools({ mode: 'undocked' }); //打包也打开调试模式
        return mv_window;
    } catch (e) {
        console.log(e);
    }


}
// 创建歌词窗口
function createLyrWindow(event, arg) {
    let local_window_html = '';
    if (process.env.NODE_ENV === 'development') {
        local_window_html = "http://musicmini2017.baidu.com:9080/lyrpage";
    } else {
        local_window_html = `file://${__dirname}/lyrpage.html`;
    }
    try {
        let lyr_x = screen.getPrimaryDisplay().workAreaSize.width / 2 - 300
        let lyr_y = screen.getPrimaryDisplay().workAreaSize.height - 150
        console.log(lyr_y);
        if (lyr_window == null) {
            lyr_window = new BrowserWindow({
                    width: 600,
                    height: 100,
                    x: lyr_x,
                    y: lyr_y,
                    frame: false,
                    title: 'lyr',
                    transparent: true,
                    resizable: false,
                    alwaysOnTop: true,
                    hasShadow: false,
                    focusable: false,
                    fullscreen: false,
                })
                // console.log(lyr_window)
            lyr_window.on('closed', function() {
                lyr_window = null;
                mainWindow.webContents.send('lyrShow', false)
                lyric_window_show = false;
                //ipcMain.send('lyrClose','close')
            })
            lyr_window.loadURL(local_window_html)
            lyr_window.once('ready-to-show', () => {
                lyr_window.show()
            })

            lyr_window.on('show', () => {
                mainWindow.webContents.send('lyrShow', true)
                lyric_window_show = true;
            })

            //event.sender.send('asynchronous-reply', 'new_window_finished');
            lyr_window.webContents.on('did-finish-load', function() {
                //lyr_window.webContents.send('transMvinfo','123');
                //歌词同步
                ipcMain.on('lyr-time', (event, arg) => {
                    // console.log(arg)
                    if (lyr_window != null) {
                        lyr_window.webContents.send('lyrTime', arg)
                    }

                })
                ipcMain.on('lyr-txt', (event, arg) => {
                    // console.log(arg)
                    if (lyr_window != null) {
                        lyr_window.webContents.send('lyrTxt', arg)
                    }

                })

            })

            // lyr_window.webContents.openDevTools({ mode: 'undocked' })
            return lyr_window;
        }


    } catch (e) {
        console.log(e);
    }

}
//自定义关闭
ipcMain.on('closeLyr', (event, arg) => {
    if (lyr_window != 'null') {
        lyr_window.close()
    }

    //lyr_window = null;               
})

app.on('ready', () => {
    // console.log((new Date()).toISOString(), process.env.NODE_ENV, 'on app ready')
    createWindow()
    loginWebRequest()
        // autoUpdate()
        // if (process.env.NODE_ENV !== 'development') {
        //     autoUpdate()
        // }
    log.info('app ready..........')
    app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required');

    let icon_path = path.join(__dirname, 'static/tray/tray.png');
    if (process.env.NODE_ENV === 'development') {
        icon_path = path.join(process.cwd(), 'static/tray/tray.png')
    }
    appTray = new Tray(icon_path);
    appTray.setToolTip('千千音乐')

    appTray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    })

    appTray.on('right-click', (event, bounds) => {
        console.log(bounds);
        buildTrayMenu();
        trayMenu = Menu.buildFromTemplate(menuTemplate);
        trayMenu.items[0].enabled = current_song_list_length > 0 ? true : false;
        trayMenu.items[2].enabled = current_song_list_length > 0 ? true : false;
        trayMenu.items[3].enabled = current_song_list_length > 0 ? true : false;

        if (current_playing_state == '1') {
            trayMenu.items[0].visible = false;
            trayMenu.items[1].visible = true;
        }

        if (lyric_window_show) {
            trayMenu.items[5].visible = false;
            trayMenu.items[6].visible = true;
        } else {
            trayMenu.items[5].visible = true;
            trayMenu.items[6].visible = false;
        }

        let song_name = cutString(current_song_name, 12);
        console.log(song_name)
        trayMenu.insert(0, new MenuItem({ label: song_name }));
        trayMenu.insert(1, new MenuItem({ type: 'separator' }));

        appTray.popUpContextMenu(trayMenu);
    })


    appTray.setIgnoreDoubleClickEvents(true);

    shortCut.setMainWindow(mainWindow);
})

//单进程
const gotTheLocak = app.requestSingleInstanceLock();
log.info('current process instance state is: ' + gotTheLocak)
if (!gotTheLocak) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        log.info('request single lock');
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}

app.on('before-quit', () => {
    will_quit = true;
    console.log('app before quit')
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    console.log((new Date()).toISOString(), 'on app activate')
    if (mainWindow != null) {
        log.info('mainwindow activate....')
        mainWindow.show()
    }
})

// app.on('web-contents-created', (event, webContents) => {
//     console.log('web-contents-created: ' + webContents.getURL())
// })

//用于第三方弹出窗口
let lastCreatedWindow = null;
let newlastCreatedWindow = null;
app.on('browser-window-created', (event, newwindow) => {
    if (!mainWindow) {
        return;
    }

    if (newwindow == mainWindow) {
        lastCreatedWindow = newwindow;
    } else {
        newlastCreatedWindow = newwindow;
        // if (mainWindow != null) {
        //     newlastCreatedWindow.setSize(0, 0);
        // }
    }

    if (newlastCreatedWindow != null) {
        let forceHide = true;
        newlastCreatedWindow.hide(); //调起京东第三方支付新窗口导致与主进程窗口逻辑混乱 先暂时隐藏窗

        newlastCreatedWindow.on('closed', () => {
            newlastCreatedWindow = null
        })

        newlastCreatedWindow.on('hide', () => {})

        newlastCreatedWindow.on('show', () => {
            if (mainWindow && forceHide) {
                forceHide = false;
                newlastCreatedWindow.hide();
            }

        })

        newlastCreatedWindow.webContents.on('did-finish-load', function(info) { //加载完成--传递数据
            let history = info.sender.history;
            let url = '';

            if (history.length > 0) {
                url = history[0];
            }
            console.log(url);

            let isIn = whitelist.isInWhitelist(url); //判断是外跳还是在内部新弹窗？
            if (isIn) {
                if (whitelist.isLoginUrl(url) && newlastCreatedWindow != null) {
                    console.log('third party login, need to hide menubar.............')
                    newlastCreatedWindow.setMenuBarVisibility(false)
                }
                forceHide = false;
                if (newlastCreatedWindow != null) {
                    newlastCreatedWindow.show();
                }
            } else {
                // newlastCreatedWindow.hide();
                shell.openExternal(url);
            }
        });

    }
    // console.log('browser-window-created: ' + newwindow.webContents.getURL())
})

function cutString(str, len) {
    let str_length = 0;
    let str_len = 0;
    let str_cut = new String();
    str_len = str.length;
    for (let i = 0; i < str_len; i++) {
        let a = str.charAt(i);
        str_length++;
        if (escape(a).length > 4) {
            //中文字符的长度经编码之后大于4
            str_length++;
        }
        str_cut = str_cut.concat(a);
        if (str_length >= len) {
            str_cut = str_cut.concat("...");
            return str_cut;
        }
    }
    //如果给定字符串小于指定长度，则返回源字符串；
    if (str_length < len) {
        return str;
    }
}

function buildTrayMenu() {
    let icon_folder = __dirname;
    if (process.env.NODE_ENV === 'development') {
        icon_folder = process.cwd();
    }

    const template = [{
            icon: path.join(icon_folder, 'static/tray/tray_play.png'),
            label: '播放',
            enabled: false,
            visible: true,
            click: function() {
                mainWindow.webContents.send('asynchronous-reply', 'traymenu_play')
            }
        },
        {
            icon: path.join(icon_folder, 'static/tray/tray_stop_play.png'),
            label: '暂停',
            enabled: true,
            visible: false,
            click: function() {
                mainWindow.webContents.send('asynchronous-reply', 'traymenu_stop')
            }
        },
        {
            icon: path.join(icon_folder, 'static/tray/tray_last_song.png'),
            label: '上一曲',
            enabled: false,
            click: function() {
                mainWindow.webContents.send('asynchronous-reply', 'traymenu_prev')
            }
        },
        {
            icon: path.join(icon_folder, 'static/tray/tray_nextsong.png'),
            label: '下一曲',
            enabled: false,
            click: function() {
                mainWindow.webContents.send('asynchronous-reply', 'traymenu_next')
            }
        },
        { type: 'separator' },
        {
            icon: path.join(icon_folder, 'static/tray/tray_desk_lyric.png'),
            label: '开启桌面歌词',
            visible: true,
            click: function() {
                mainWindow.webContents.send('asynchronous-reply', 'traymenu_desklyric')
            }
        },
        {
            icon: path.join(icon_folder, 'static/tray/tray_desk_lyric.png'),
            label: '关闭桌面歌词',
            visible: false,
            click: function() {
                mainWindow.webContents.send('asynchronous-reply', 'traymenu_desklyric')
            }
        },
        { type: 'separator' },
        {
            icon: path.join(icon_folder, 'static/tray/tray_setup.png'),
            label: '设置',
            click: function() {
                mainWindow.webContents.send('asynchronous-reply', 'traymenu_setup')
                if (!mainWindow.isVisible()) {
                    mainWindow.show();
                    app.focus();
                    mainWindow.focus();
                }
                if (mainWindow.isMinimized()) {
                    mainWindow.restore()
                    mainWindow.focus()
                }

            }
        },
        {
            icon: path.join(icon_folder, 'static/tray/tray_exit_app.png'),
            label: '退出千千音乐',
            click: function() {
                will_quit = true;
                if (lyr_window != null) {
                    lyr_window.close();
                    lyr_window = null
                }
                if (mv_window != null) {
                    mv_window.close();
                    mv_window = null;
                }
                mainWindow.close();
            }
        },
    ]

    menuTemplate = template;
}

function loginWebRequest() {
    session.defaultSession.webRequest.onBeforeRequest({
        urls: ['http://passport.taihe.com/v2/web/xd.html']
    }, (details, calunmaximize_main_windowlback) => {
        console.log('request passport taihe callback return');
        // 百度第三方登录
        session.defaultSession.cookies.get({ url: 'http://music.baidu.com/' }, (error, cookies) => {
            if (!error) {
                // console.log(JSON.stringify(cookies));
                cookies.forEach(function(item, index) {
                    if (item.name == 'BDUSS') {
                        console.log('get bduss success')
                        let bduss = item.value;
                        let expire_date = item.expirationDate;

                        let qianqian_cookie_set = false;
                        let taihe_cookie_set = false;
                        let login_close = false;
                        // let Days = 30;
                        // let exp = new Date();
                        // let date = Math.round(exp.getTime() / 970) + Days * 24 * 60 * 60;
                        const cookie_taihe = { url: 'http://passport.taihe.com', name: 'BDUSS', value: bduss, domain: '.taihe.com', expirationDate: expire_date };
                        session.defaultSession.cookies.set(cookie_taihe, (error) => {
                            if (!error) {
                                taihe_cookie_set = true;
                                if (qianqian_cookie_set && taihe_cookie_set && !login_close) {
                                    console.log('set baidu bduss successs');
                                    login_close = true;
                                    newlastCreatedWindow.close()
                                    mainWindow.webContents.send('asynchronous-reply', 'login-success');
                                }
                            } else {
                                console.log(error);
                            }
                        })

                        const cookie_qianqian = { url: 'http://passport.qianqian.com', name: 'BDUSS', value: bduss, domain: '.qianqian.com', expirationDate: expire_date };
                        session.defaultSession.cookies.set(cookie_qianqian, (error) => {
                            if (!error) {
                                qianqian_cookie_set = true;
                                if (qianqian_cookie_set && taihe_cookie_set && !login_close) {
                                    console.log('set baidu bduss successs');
                                    login_close = true;
                                    newlastCreatedWindow.close()
                                    mainWindow.webContents.send('asynchronous-reply', 'login-success');
                                }
                            } else {
                                console.log(error);
                            }
                        })
                    }
                })
            }
        })
    });
}