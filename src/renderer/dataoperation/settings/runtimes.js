import WinReg from 'winreg'
import path from 'path'

let RUN_LOCATION = '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';

function getKey() {
    return new WinReg({
        hive: WinReg.HKCU, //CurrentUser,
        key: RUN_LOCATION
    });
}

function noop() {

}

export default {
    enableAutoStart() {
        let key = getKey();
        let exe_path = path.join(process.cwd(), 'QianqianMusic.exe')
        key.set('qianqianmusic', WinReg.REG_SZ, exe_path, noop);
    },

    disableAutoStart() {
        let key = getKey();
        key.remove('qianqianmusic', noop);
    },

    getAutoStartValue(callback) {
        let key = getKey();
        key.get('qianqianmusic', function(error, result) {
            if (result) {
                callback(result.value);
            } else {
                callback(null, error);
            }
        });
    }
}