'use-strict'
const fs = require('fs')
const path = require('path')

exports.default = async function(context) {
    const current_dir = process.cwd();
    let pack_path = path.join(current_dir, 'dist/config/config.json');
    if (fs.existsSync(pack_path)) {
        fs.writeFileSync('build/win-ia32-unpacked/config.json', fs.readFileSync(pack_path));
        console.log('update channel finished..................')
    }
}