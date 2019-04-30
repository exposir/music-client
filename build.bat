set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/
npm install
npm run packer
ftp_path="$ftpserver85/jenkins-$JOB_NAME-$BUILD_NUMBER"
echo $ftp_path>ftp.txt