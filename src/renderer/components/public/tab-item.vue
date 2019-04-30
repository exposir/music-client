<template>
    <ul class="tab-box">
        <router-link to="/my/downloaded/" tag="li" @click="changeTab('downloaded')" :class="{'tab-active':tabname==='downloaded'}">已下载</router-link>
        <router-link to="/my/downloading/" tag="li" @click="changeTab('downloading')" :class="{'tab-active':tabname==='downloading'}">正在下载</router-link>
      </ul>
</template>
<script>
    export default {
        props: {

        }
    }
</script>