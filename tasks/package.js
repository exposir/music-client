'use strict'

const spawn = require('child_process').spawn
const treeKill = require('tree-kill')
const fs = require('fs')
const path = require('path')
const package_json = require('../package.json')
const http = require('http')
const archiver = require('archiver')


let channelArray = []
let isNeedSignExeFiles = true;

console.log("process.env.PACKER_ENV: ", process.env.PACKER_ENV);
let channel_url = "http://192.168.5.120:8001/channel/list?"
if (process.env.PACKER_ENV === "qa") {
    channel_url = "http://192.168.218.107:8001/channel/list?" //QA环境渠道号
}

let current_index = 0;
let packageHeader = 'QianqianMusic Setup ';
// let newpackageHeader = 'QianqianMusicSetup';
const version = package_json.version;

let ext_name = '.exe'
if (process.platform === 'darwin') {
    ext_name = '.dmg';
    packageHeader = 'QianqianMusic-';
    // newpackageHeader = 'QianqianMusic-';
}

let execute_file_name = packageHeader + version + ext_name;

function saveChannelToFileSync(channel) {
    const current_dir = process.cwd();
    let pack_path = path.join(current_dir, 'dist/config/config.json');
    if (fs.existsSync(pack_path)) {
        set_app_channel(pack_path, channel);
    }
}

function signAudioCoreFile() {
    let execuetable = "sign.ps1";
    let signScript = path.join(__dirname, execuetable);

    let child = spawn("powershell.exe", [signScript], { stdio: 'inherit', cwd: process.cwd(), env: process.env, shell: true });
    child.on('error', function(err) {
        console.log(err);
    })
    child.on('close', function(code) {
        console.log('sign audio file success.......................')
        treeKill(child.pid);
    })
}

function getChannel() {
    let url = channel_url + 'type=4';
    console.log('get channel url is: ' + url)
    let clientReq = http.get(url, function(res) {
        let json_data = '';
        res.on('data', function(data) {
            json_data += data;
        }).on('end', function() {
            console.log(json_data)
            let channel_json_array = JSON.parse(json_data);
            for (let i = 0; i < channel_json_array.length; i++) {
                let obj = channel_json_array[i];
                channelArray.push(obj.channel_no);
                console.log('get channel is: ' + channelArray[i]);
            }

            if (channelArray.indexOf('passive') === -1) {
                channelArray.push('passive');
            }
            if (channelArray.length > 0) {
                signAudioCoreFile();
                let current_channel = channelArray[current_index];
                saveChannelToFileSync(current_channel);
                run_build();
            } else {
                console.error('get channel failed, can not package');
            }
        }).on('error', function(error) {
            console.log('request channel failed, error is: ' + error);
        });
    });
    clientReq.on('error', function(err) {
        console.log('request channel failed, error is: ' + err.message);
    })
}

function run_build() {
    let child = spawn('npm run', ['buildjs'], { stdio: 'inherit', cwd: process.cwd(), env: process.env, shell: true });

    child.on('error', function(err) {
        console.log('run build occurs error, the error is: ' + err);
        treeKill(child.pid);
    })

    child.on('close', code => {
        if (code === 0) {
            console.log('build successfully!!!!!!!!');
            build_install();
        }
        treeKill(child.pid);
    })
}

function build_install() {
    let current_channel = channelArray[current_index];
    saveChannelToFileSync(current_channel);
    console.log('package installer start, the channel is: ' + current_channel);

    let child = spawn('npm run', ['buildInstall'], { stdio: 'inherit', cwd: process.cwd(), env: process.env, shell: true });
    const current_dir = process.cwd();

    child.on('error', function(err) {
        console.log('build installer failed, error is: ' + err);
        treeKill(child.pid);
    })

    child.on('close', code => {
        if (code === 0) {
            let cur_channel = channelArray[current_index];
            console.log('package installer successfully!!!!!!!!' + ' channel is: ' + cur_channel);
            let folder = path.join(current_dir, 'build');
            let old_file_path = path.join(folder, execute_file_name);
            if (isNeedSignExeFiles && current_index === 0) {
                isNeedSignExeFiles = false;
                signAllExeFiles();
            } else {
                let new_name = 'QianqianMusic-Setup-' + current_channel + '-' + version + ext_name;
                let new_file_path = path.join(folder, new_name);
                console.log('setup file is: ' + new_file_path)
                if (fs.existsSync(old_file_path)) {
                    fs.renameSync(old_file_path, new_file_path);
                }
                signInstallPackage(new_file_path)

                if (current_index < channelArray.length - 1) {
                    current_index++;
                    build_install();
                }
            }
        } else {
            console.error('build installer error, the error is: ' + code);
        }
        treeKill(child.pid);
    })
}

function set_app_channel(file_path, channel) {
    fs.readFile(file_path, (error, data) => {
        if (error) {
            console.log('read config file failed')
        } else {
            let obj = JSON.parse(data.toString());
            obj.channel = channel;
            let json_str = JSON.stringify(obj);
            fs.writeFile(file_path, json_str, (error) => {
                if (error) {
                    console.log('save config failed, error is: ' + error)
                }
            })
        }
    })
}

function signAllExeFiles() {
    let execuetable = "sign.ps1 -path " + "executablefiles";
    let signScript = path.join(__dirname, execuetable);

    let child = spawn("powershell.exe", [signScript], { stdio: 'inherit', cwd: process.cwd(), env: process.env, shell: true });
    child.on('error', function(err) {
        console.log(err);
    })
    child.on('close', function(code) {
        console.log('sign all exe files finished...................')
        treeKill(child.pid);
        build_install();
    })
}

function signInstallPackage(installfile) {
    let execuetable = "sign.ps1 -path " + installfile;
    console.log('exe file is: ' + execuetable)
    let signScript = path.join(__dirname, execuetable);

    let child = spawn("powershell.exe", [signScript], { stdio: 'inherit', cwd: process.cwd(), env: process.env, shell: true });
    child.on('error', function(err) {
        console.log(err);
    })
    child.on('close', function(code) {
        console.log('sign setup file success ' + installfile)
        treeKill(child.pid);
    })
}

getChannel();