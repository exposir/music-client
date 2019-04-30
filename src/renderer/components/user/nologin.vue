<template>
    <div class="user-info-wrapper">
        <div class="user-info-box">
            <div class="avatar" @click="login()"><img src="static/images/user/person.svg" alt=""></div>
            <p class="user-login-link" @click="login()">立即登录</p>
            <!-- <p>同步你喜欢的音乐</p> -->
        </div>
    </div>
</template>
<script>
    export default {
        methods: {
            login() {　
                if (window.navigator.onLine == true) {　
                    this.$store.dispatch('TpassLogin')
                } else {　
                    this.commonFuns.createTips("网络似乎没连好，请检查连接", 'warning');
                }

            }
        }
    }
</script>
<style scoped>
    .user-info-wrapper {
        position: absolute;
        left: 16px;
    }
    
    .user-info-box {
        width: 92px;
        margin: 0 auto;
        display: flex;
        flex-flow: column wrap;
        justify-content: center;
        align-items: center;
        height: 27px;
        /* border-bottom: solid 1px #e3e3e3; */
    }
    
    .avatar {
        width: 27px;
        height: 27px;
        border-radius: 50%;
        cursor: pointer;
        -webkit-app-region: no-drag;
    }
    
    .avatar img {
        width: 27px;
        height: 27px;
        /* border: solid 1px #f2f2f2; */
        border-radius: 50%;
    }
    
    p {
        color: #999999;
    }
    
    p.user-login-link {
        /* padding: 10px 0 2px 0; */
        -webkit-app-region: no-drag;
        cursor: pointer;
        color: #333333;
    }
</style>