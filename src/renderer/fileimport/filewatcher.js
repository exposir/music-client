'use-strict'

const chokidar = require('chokidar')

let watcher = null;

export default {
    startWatch(folders) {
        watcher = chokidar.watch(folder, {
            ignored: /(^|[\/\\])\../,
            persistent: true
        });

        watcher.on('add', (filePath) => {
                console.log('file added: ' + filePath)
            })
            .on('change', (filePath) => {
                console.log('file changed: ' + filePath)
            })
            .on('unlink', (filePath) => {
                console.log('file removed: ' + filePath)
            })
    },

    endWatch() {
        if (watcher) {
            watcher.close();
        }
    },

    addFolder(folders) {
        if (watcher) {
            watcher.add(folders);
        }
    },

    removeFolder(folders) {
        if (watcher) {
            watcher.unwatch(folders);
        }
    }
}