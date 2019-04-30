<template>
<div class="dy-piclist-box">
    <!--小图展示start-->
    <div class="dy-small-pics-box" v-show="isShowSmallPicFlag">
        <div class="dy-pic bigcursor" v-for="(pic,index) in picdata">        
        <img v-if="picdata.length == 3 || picdata.length == 5 || picdata.length == 6" class="square" @click="preview($event)" v-lazy="pic.pic_small" v-bind:bigpic="pic.master" v-bind:index="index"> 
        <img v-else-if="picdata.length == 2 || picdata.length == 4" class="rectangle" @click="preview($event)" v-lazy="pic.pic_middle" v-bind:bigpic="pic.master" v-bind:index="index">  
         <img v-else-if="picdata.length == 1" class="autoShape" @click="preview($event)" v-lazy="pic.pic_middle" v-bind:bigpic="pic.master" v-bind:index="index">                                              
        </div>          
    </div>
    <!--小图展示end-->
    <!--大图展示start--> 
    <div class="expand-media-wrap" v-show="isShowBigPicFlag">
        <div class="expand-media-box">
            <div class="tab-box clearfix"><a href="javascript:void(0);" class="up-tab"><i></i>收起</a><a class="down-tab" href="http://musicugc.cdn.qianqian.com/ugcdiy/pic/19b98f53e7eddaafbc9939a13545d2b6.jpg"><i></i>保存图片</a></div>
            <div class="media-view-wrap">
                <div class="media-show-box">
                    <ul class="piclist-ul clearfix">
                        <li :class="{'smallcursor':cursor.small,'rightcursor':cursor.right,'leftcursor':cursor.left}">
                            <img  v-show="!isLoadding" :index="index" :src="previewImg" :width="previewImgWidth" :height="previewImgHeight" v-on:mousemove="cursorChange" v-on:click="slide">
                            <img  v-show="isLoadding" :src="loaddingicon" :width="previewImgWidth" :height="previewImgHeight">
                        </li>
                    </ul>                    
                    <div class="media-dots-box" v-show="picdata.length>1">                             
                        <span v-for="(pic,i) in picdata" :class="{current:i == index}"></span>
                    </div>                                     
                </div>                   
            </div>
        </div>
    </div>
    <!--大图展示end-->
</div>
</template>
<style>
.dy-small-pics-box {
	display: flex;
	flex-wrap: wrap;
	align-content: space-around;
	margin-right: -10px;
}
.dy-small-pics-box .dy-pic{
	margin-right: 10px;
	margin-top:10px;
}
.dy-small-pics-box .dy-pic img.square{
	width:162px;
	height:162px;
	background-size: contain;
}
.dy-small-pics-box .dy-pic img.rectangle{
    width:248px;
    height:132px;    
}
.dy-small-pics-box .dy-pic img.autoShape{
    width:248px;
    max-height:500px;
}
.expand-media-wrap{
    width:100%;
    margin-top:12px;
    background-color: #f8f8f8;
}

.expand-media-wrap .tab-box{
    height:34px;
    line-height: 34px;
    padding-left:15px;
}
.expand-media-wrap .tab-box a.up-tab i {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: url(./images/icon1.png) no-repeat;
    margin-right: 10px;
}
.expand-media-wrap .tab-box a.down-tab i {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: url(./images/icon2.png) no-repeat;
    margin-right: 10px;
}
.expand-media-wrap .tab-box a{
    margin-right: 30px;
}
.media-view-wrap{
    width:100%;
    overflow: hidden;
}
.media-show-box{
    position: relative;
    overflow: hidden;

}
.expand-media-wrap  .piclist-ul{
    position: relative;
}
.expand-media-wrap .media-view-wrap .media-show-box li {
    text-align: center;
    background: #f8f8f8;
    padding: 0;
    margin-bottom: 0;
    position: relative;
}
.media-show-box li img{
    max-width: 508px;
}

.media-dots-box {
    width: 100%;
    position: absolute;
    bottom: 18px;
    text-align: center;
}
.media-dots-box span{
    display: inline-block;
    width:10px;
    height: 10px;
    background-color:rgba(255,255,255,.5);
    border-radius: 50%;
    margin-left:2px;
}
.media-dots-box span.current{
    background-color:rgba(255,255,255,1);
}
.expand-media-wrap .media-view-wrap .smallcursor {
    cursor: url(http://musicmini2014.baidu.com/2016/resources/js/ugc/plugins/imageZoom/images/small.cur), auto;
}
.expand-media-wrap .media-view-wrap .rightcursor {
    cursor: url(http://musicmini2014.baidu.com/2016/resources/js/ugc/plugins/imageZoom/images/pic_next.cur), auto;
}
.expand-media-wrap .media-view-wrap .leftcursor {
    cursor: url(http://musicmini2014.baidu.com/2016/resources/js/ugc/plugins/imageZoom/images/pic_prev.cur), auto;
}
.bigcursor {
    cursor: url(http://musicmini2014.baidu.com/2016/resources/js/ugc/plugins/imageZoom/images/big.cur), auto;
}


</style>
<script>
export default {
    name : "dynamic-piclist" ,
    props:{
        picdata:Array       
    }, 
    data(){
        return {
            indicator:[],
            index:0,
            picLen : this.picdata.length,
            loaddingicon:"./static/images/loadding.png",
            previewImg:"./static/images/loadding.png",
            previewImgWidth:500,
            previewImgHeight:"",
            cursor:{
                small:false,
                right:false,
                left:false
            },
            isShowSmallPicFlag:true,
            isShowBigPicFlag:false,
            isLoadding:false
        }
    },
    watch:{
        previewImgWidth:function(newValue, oldValue){
          
        },
        isLoadding:function(newValue, oldValue){     
                
            this.isLoadding = newValue;
        }
    },
    
    methods:{
       preview(e){      
           let img_src = e.target.getAttribute('bigpic');          
           this.updatePic(img_src);
           let index =  e.target.getAttribute('index');
           this.index = index;   
           this.isShowSmallPicFlag = false;
           this.isShowBigPicFlag = true;        
       },
       indicatorClick(index){
           this.index = index;
       },
       cursorChange(){
            //鼠标在图片上移动展示不同的小图标 向左、向右、居中
           let offsetX = event.offsetX;
           let per_width = this.previewImgWidth/3;          
           if(offsetX < per_width ){
               if(this.index == 0){
                   this.small();                   
               }else{
                    this.left();
               }             
           }else if(offsetX < per_width*2 && offsetX > per_width){            
               this.small();
           }else if(offsetX < per_width*3 && offsetX > per_width*2){                    
               if(parseInt(this.index) + 1== this.picLen){
                   this.small();  
               } else {
                   this.right();                    
               }  
           }
       },
       small(){
            this.cursor.small = true;
            this.cursor.left = false;
            this.cursor.right = false;  
       },
       left(){
            this.cursor.left = true;
            this.cursor.right = false;
            this.cursor.small = false;
       },
       right(){
            this.cursor.right = true;
            this.cursor.small = false;
            this.cursor.left = false;  
       },
 
       updatePic(img_src){
           this.previewImg = img_src;
           let imgObj = new Image();
           imgObj.src = img_src;           
           let timer =  setInterval(function(){             
             if(imgObj.complete){
               clearInterval(timer);
               this.previewImgWidth = imgObj.width > 500 ? 500 : imgObj.width;      
               this.isLoadding = false;                      
              } else {              
                this.isLoadding = true;   
              }           
           },50);         
       },
       nextPic(){           
            this.index++;    
            if(this.index == this.picLen){
                return false;
            }  
           let img_src = this.picdata[this.index].master;           
           this.updatePic(img_src);  
       },
       prevPic(){
           this.index--;
           if(this.index == -1){
               return false;
           }           
           let img_src = this.picdata[this.index].master;           
           this.updatePic(img_src); 
       },
       loaddingPic(){          
            // this.updatePic(his.loaddingicon); 
       },
       slide(){
           this.loaddingPic();
           if(this.cursor.right){
               this.nextPic();
           }else if(this.cursor.left){
               this.prevPic();
           }else if(this.cursor.small){
               this.isShowSmallPicFlag = true;
               this.isShowBigPicFlag = false;
           }
       }
    }
}
</script>

