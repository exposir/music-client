<template>
<ul class="dy-side-topic-list">
    <li v-for="(topic,index) in topicdata">
        <a href=""><img v-lazy="topic.pic_350x170" >
        <div class="dy-side-topic-info"><span class="dy-side-topic-title" v-html="">#{{topic.topic_title}}</span><span class="dy-side-topic-num">{{topic.nums}}人参加</span></div>
        </a>
    </li>
</ul>	
</template>
<script>
 export default{
     name : "dynamic-topic",
     props : {
         topicdata:Array         
     }
 }   
</script>