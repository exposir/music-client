import {BrowserWindow} from 'electron'
import reportService from '../reportService'
export default{
    createWindow() {
        let mainWindow = null;
        if (mainWindow != null) {
            return
        }
        /**
         * Initial window options
         */
        if (process.env.NODE_ENV === 'development') {
            mainWindow = new BrowserWindow({
                height: 660,
                width: 1000 + 300,
                resizable: true,
                webPreferences: {
                    webSecurity: false,
                    nodeIntegrationInWorker: true
                }
            })
        } else {
            mainWindow = new BrowserWindow({
                frame: false,
                height: 660,
                minHeight: 660,
                width: 1000,
                minWidth: 1000,
                backgroundColor: '#499bd4',
                show: false,
                titleBarStyle: 'hidden-inset',
                nodeIntegrationInWorker: true                
            })

            // mainWindow.webContents.openDevTools({ mode: 'undocked' })

            const platform = os.platform() + '_' + os.arch();
            // reportService.clickReport({ 'type': 8, 'system': platform });
        }

        console.log((new Date()).toISOString(), 'createWindow')

        mainWindow.on('closed', () => {
            mainWindow = null
        })

        mainWindow.on('enter-full-screen', (event) => {
            console.log("enter-full-screen")
                //主进程想渲染进程发送消息
            mainWindow.webContents.send('asynchronous-reply', 'maximize_main_window');
        })

        mainWindow.on('leave-full-screen', (event) => {
            console.log("leave-full-screen")
                //主进程想渲染进程发送消息
            mainWindow.webContents.send('asynchronous-reply', 'unmaximize_main_window');
        })

        mainWindow.on('unresponsive', function() {
            const platform = os.platform() + '_' + os.arch();
            reportService.clickReport({ 'type': 10, 'system': platform });

            const options = {
                type: 'info',
                title: '无响应',
                message: '页面无响应',
                buttons: ['重新加载', '关闭']
            }
            require('electron').dialog.showMessageBox(options, function(index) {
                if (index === 0) {
                    mainWindow.reload()
                } else {
                    mainWindow.close()
                }
            })
        })

        mainWindow.webContents.on('crashed', function() {
            const platform = os.platform() + '_' + os.arch();
            reportService.clickReport({ 'type': 9, 'system': platform });

            const options = {
                type: 'info',
                title: '崩溃了',
                message: '渲染进程崩溃',
                buttons: ['重新加载', '关闭']
            }
            require('electron').dialog.showMessageBox(options, function(index) {
                if (index === 0) {
                    mainWindow.reload()
                } else {
                    mainWindow.close()
                }
            })
        })

        const winURL = process.env.NODE_ENV === 'development' ?
        `http://musicmini2017.baidu.com:${require('../../../../config').port}` :
        `file://${__dirname}/index.html`

        mainWindow.loadURL(winURL)

        mainWindow.on('close', (event) => {
            console.log('window before close')
            if (!wil_quit) {
                event.preventDefault()
                mainWindow.hide()
            }
        })

        mainWindow.once('ready-to-show', () => {
            mainWindow.show()
            console.log((new Date()).toISOString(), 'ready-to-show')
        })

        // eslint-disable-next-line no-console
        console.log((new Date()).toISOString(), 'mainWindow opened')
        return mainWindow

    }
    
}