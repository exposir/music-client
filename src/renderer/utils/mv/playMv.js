'use-strict'

const ipc = require('electron').ipcRenderer;
import commonFuns from 'components/commonFuns/common.js'

export default {
    playMv(res) {
        let mvinfo = res.mv_info;
        let provider; //11爱奇艺 12音悦台 1自有视频
        let mvurl = "";
        if(mvinfo.provider){
            provider = mvinfo.provider;
        }else if(res.video_info.provider){
            provider = res.video_info.provider
        }
        if(provider == 12){
            let n = 0
            for(let i in res.files){
                if(n<1){
                    if(!res.files[i].source_path){
                        mvurl = res.files[i].file_link;
                    }else{
                        mvurl = res.files[i].source_path;
                    }
                    n++;
                }
            }
        }else if(provider == 11){
            commonFuns.createTips('爱奇艺资源暂时不能播放', 'warning')
            return false;
        }else if(provider == 1){
            if(res.files['41']){
                mvurl = res.files['41'].file_link; 
            }else{
                mvurl = res.files[res.max_definition].file_link; 
            }
            
            // let n = 0
            // for(let i in res.files){
            //     if(n<1){
            //         mvurl = res.files[i].file_link;
            //         n++;
            //     }
            // }
        }
        
        mvinfo['mvurl'] = mvurl;
        console.log(mvinfo['mvurl'])
        mvinfo['providerType'] = provider;//11爱奇艺 12音悦台 1自有视频
        mvinfo['new_mv_window'] = 'new_mv_window';
        ipc.send('asynchronous-message', mvinfo)
        // createMv.createMv(mvinfo)
    },

}