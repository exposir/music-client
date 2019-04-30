//该文件已经废弃
import songService from '../service/songService'
import dataBase from '../dataoperation/websql/sqlstorage'
import settings from '../dataoperation/settings/settings'
import settingKey from '../dataoperation/settings/settingsKey'
import underscore from 'underscore'
import * as muplayer from '../components/muplayer/muplayer.js'
function getSongLink(listid, songid){ 
    let songinfoStr = JSON.stringify({"listid":listid,"songid":songid});        
    console.log(songinfoStr)  
    settings.set_setting_value(settingKey.currentplay_song, songinfoStr);  

    dataBase.query_by_songid("", songid, function(listid, json_obj_array){
        let dbSonginfoJson = json_obj_array[0];                
        let is_get_file_link = underscore.has(dbSonginfoJson, "file_link");       
        if(is_get_file_link){
            let file_link = dbSonginfoJson.file_link;
            muplayer.playerObj.reset().add(file_link).play();  
            $('#playSongTitle').text(dbSonginfoJson.title);
            $('#playSongArtist').text(dbSonginfoJson.author); 
            $('#songSrc').attr('src',dbSonginfoJson.pic_huge);
        }else{
                songService.getSongLink({'songid':songid},function(res){ 
                    let songinfoJson = res.songinfo;
                    let songLinkUrlArray = res.songurl.url;
                    //存储单曲 url 、时长
                    let file_duration = songLinkUrlArray.file_duration;
                    songinfoJson.file_duration = file_duration;
                    

                    let songUrlLink320 = underscore.findWhere(songLinkUrlArray, {file_bitrate: 320});
                    let file_link = songUrlLink320.file_link;  
                    songinfoJson.file_link = file_link;
                    
                    muplayer.playerObj.reset().add(file_link).play();  
                    $('#playSongTitle').text(songinfoJson.title);
                    $('#playSongArtist').text(songinfoJson.author);      
                     $('#songSrc').attr('src',songinfoJson.pic_huge);                       
                    dataBase.update_by_songid(listid, songid, songinfoJson);
                    console.log('get song link res is: ' + JSON.stringify(songinfoJson));
                },function(err){

                })
        }

    });   
}
export default{ 
    bind:function(el, binding, vnode){   
        if(vnode.data.attrs && vnode.data.attrs.dbclick == 1){
            el.addEventListener("dblclick",function(){ 
                let songArray = [];
                songArray.push(binding.value);                   
                dataBase.insert_songinfo('', songArray);   

                let listid = binding.value.list_id ? binding.value.list_id : "";
                let songid = binding.value.song_id;             
                getSongLink(listid, songid);
            })   
        }else{
            el.addEventListener("click",function(){                         
                let songArray = [];
                songArray.push(binding.value);                   
                dataBase.insert_songinfo('', songArray);   

                let listid = binding.value.list_id ? binding.value.list_id : "";
                let songid = binding.value.song_id;
                getSongLink(listid, songid);
            })   
        }
         
    }
}

