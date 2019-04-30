'use-strict'
let spawn = require("child_process").spawn;
const treeKill = require('tree-kill')
const path = require('path')

exports.default = async function(param) {
    let execuetable = "sign.ps1 -path " + param.path;
    let signScript = path.join(__dirname, execuetable);

    let child = spawn("powershell.exe", [signScript], { stdio: 'inherit', cwd: process.cwd(), env: process.env, shell: true });
    child.on('error', function(err) {
        console.log(err);
    })
    child.on('close', function(code) {
        treeKill(child.pid);
    })
}