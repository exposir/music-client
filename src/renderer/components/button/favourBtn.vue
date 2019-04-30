<template>
<button-item :btnTxt="iconText" :classname="showdata.favourClassname"  :icon="iconName" :handleAction="handleAction"></button-item>
</template>
<script>
    import buttonItem from 'components/button/button-item.vue'
    import { mapGetters } from "vuex";
    export default {
        namr: 'favour-btn',
        props: {
            data: Object,
            showdata: Object
        },
        computed: {
            ...mapGetters({
                loginStatus: "loginStatus"
            })
        },
        data() {
            return {
                iconName: 'favour-icon',
                iconText: ''
            }
        },
        watch: {
            showdata() {
                if (this.showdata.iscollect == 1) {
                    this.iconName = 'favoured-icon'
                    this.iconText = '已收藏'
                } else {
                    this.iconName = 'favour-icon'
                    this.iconText = '收藏'
                    
                }
                this.showdata.nums = this.showdata.nums > 0 ? this.showdata.nums : '收藏'
            }
        },
        created() {
            if (this.showdata.iscollect == 1) {
                this.iconName = 'favoured-icon'
                this.iconText = '已收藏'
            } else {
                this.iconName = 'favour-icon'
                this.iconText = '收藏'
            }
            this.showdata.nums = this.showdata.nums > 0 ? this.showdata.nums : '收藏'
        },
        components: {
            buttonItem
        },
        methods: {
            handleAction() {
                if (this.showdata.favourClassname != 'disabled') {
                    let data = this.data
               
                    if (!this.loginStatus) {
                        this.$store.dispatch('TpassLogin');
                    } else {
                        if (this.showdata.iscollect == 1) {
                            let isJump = this.showdata.pagetype == 'favour' ? true : false
                            console.log(isJump)
                            this.$store.dispatch('deleteFavorite', {'paramsJson':data,'isJump':isJump})
                            this.iconName = 'favour-icon'
                            this.iconText = '收藏'
                            this.showdata.iscollect = 0
                            this.showdata.nums--
                        } else {
                            this.$store.dispatch('addFavorite', data).then((res)=>{
                                this.iconName = 'favoured-icon'
                                this.iconText = '已收藏'
                                this.showdata.iscollect = 1
                                if (this.showdata.nums == '收藏') {
                                    this.showdata.nums = 0
                                }
                                this.showdata.nums++
                            },(res)=>{

                            })
                        }
                    }
                }

            }
        }
    }
</script>
<style>
    .favour-btn-box {
        display: flex;
        width: 60px;
        height: 30px;
        justify-content: center;
        align-items: center;
        background: #499bd4;
        border-radius: 10px;
        color: #fff;
        cursor: pointer;
    }
</style>