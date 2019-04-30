import {app,autoUpdater} from 'electron' 
import os from 'os'
export default{
    autoUpdate(){
        const platform = os.platform() + '_' + os.arch(); // usually returns darwin_64
        const version = app.getVersion();
        const feedUrl = 'http://update.qianqian.com/update/' + platform + '/' + version;
        autoUpdater.setFeedURL(feedUrl);
        console.log('[updater] feedUrl', feedUrl);
        autoUpdater.on('update-available', () => {
            console.log('[updater] update avaiable');
        });
        autoUpdater.on('checking-for-update', () => { console.log('[updater] checking-for-update') })
        autoUpdater.on('update-not-available', () => {
            console.log('[updater] update-not-available');
        })
        autoUpdater.on('update-downloading', () => { console.log('[updater] downloading') });
        autoUpdater.on('update-downloaded', () => {
            console.log('[updater] quitAndInstall');
            const options = {
                type: 'info',
                title: '升级安装',
                message: '升级文件下载完毕，需要重启千千音乐',
                buttons: ['安装并重启']
            }
            require('electron').dialog.showMessageBox(options, function(index) {
                if (mainWindow !== null) {
                    mainWindow.close()
                }
                autoUpdater.quitAndInstall();
            })
        });

        autoUpdater.on('error', (err) => {
            console.log('[updater] error:', err);
        });

        autoUpdater.checkForUpdates();
    }
}