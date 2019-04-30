<template>
  <transition name="msgbox-fade">
    <div class="el-message-box__wrapper" v-show="visible" @click="handleWrapperClick" ondragstart="return false">
      <div class="el-message-box" :class="customClass">
        <div class="el-message-box__header">
          <i class="el-message-box__close" @click="closeMsgBox()" v-if="showClose"></i>
        </div>
        <div class="el-message-box__content" v-if="message !== ''">
          <div  v-if="type==='sale'">
              <img  class="el-message-box-bg" v-if="songInfoObj.resource_type_ext==4" :src="songInfoObj.album_pic">
              <img  class="el-message-box-bg" v-else-if="songInfoObj.resource_type_ext==3" :src="songInfoObj.song_pic">
         </div>
          <div  v-else-if="type==='vip'"><img  class="el-message-box-bg" v-if="songInfoObj.pic_small" :src="songInfoObj.pic_small"></div>
        <div class="el-message-box__pic">
            <slot v-if="type==='sale'">
                <img  v-if="songInfoObj.resource_type_ext==4" :src="songInfoObj.album_pic">
                <img  v-if="songInfoObj.resource_type_ext==3" :src="songInfoObj.song_pic">
            </slot>
             <slot v-else-if="type==='vip'">
                <img  v-if="songInfoObj.pic_small" :src="songInfoObj.pic_small">
                <img  v-else-if="songInfoObj.pic_premium" :src="songInfoObj.pic_premium">
                <img  v-else-if="songInfoObj.pic_big" :src="songInfoObj.pic_big">
                <img  v-else-if="songInfoObj.pic_huge" :src="songInfoObj.pic_huge">
            </slot>
          </div>
          <div class="el-message-box__message">
            <div  v-if="type==='sale'">
                <p v-if="songInfoObj.resource_type_ext==4" class="el-message-box__message_title">《{{songInfoObj.album_title}}》</p>
                <p class="el-message-box__message_title" v-else>《{{songInfoObj.song_title}}》</p>
            </div>
            <div  v-if="type==='vip'">
                 <p class="el-message-box__message_title">《{{songInfoObj.title}}》</p>
            </div>
            <slot><p class="el-message-box__message_txt">{{ message }}</p></slot>
          </div>
        </div>
        <div class="el-message-box__btns">
          <el-button
            :loading="confirmButtonLoading"
            ref="confirm"
            type="primary"
            v-show="showConfirmButton"
            @click.native="handleAction('confirm')">
            {{ confirmButtonText}}
          </el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
    import Popup from 'utils/popup'
    export default {
        mixins: [Popup],
        props: {
            modal: {
                default: true
            },
            showClose: {
                type: Boolean,
                default: true
            },
            closeOnClickModal: {
                default: true
            },
            closeOnPressEscape: {
                default: true
            }
        },
        methods: {
            getSafeClose() {
                const currentId = this.uid;
                return () => {
                    this.$nextTick(() => {
                        if (currentId === this.uid) this.doClose();
                    });
                };
            },
            doClose() {
                if (!this.visible) return;
                this.visible = false;
                this._closing = true;

                this.onClose && this.onClose();

                this.opened = false;

                if (!this.transition) {
                    this.doAfterClose();
                }
                if (this.action) this.callback(this.action, this);
            },

            handleWrapperClick() {
                if (this.closeOnClickModal) {
                    this.handleAction('cancel');
                }
            },

            handleAction(action) {
                this.action = action;
                if (typeof this.beforeClose === 'function') {
                    this.close = this.getSafeClose();
                    this.beforeClose(action, this, this.close);
                } else {
                    this.doClose();
                }
            },
            closeMsgBox() {
                this.doClose();
            }
        },
        data() {
            return {
                uid: 1,
                title: undefined,
                songInfoObj: null,
                message: '',
                type: '',
                customClass: '',
                showConfirmButton: true,
                action: '',
                confirmButtonText: '',
                confirmButtonLoading: false,
                confirmButtonDisabled: false,
                callback: null
            };
        }
    };
</script>
<style scoped>
    .el-message-box {
        width: 304px;
        box-shadow: 0 0 15px 0 rgba(0, 0, 0, .2);
        user-select: none;
        border-radius: 6px;
    }
    
    .el-message-box__header {
        padding: 0;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
    }
    
    .el-message-box__content {
        display: flex;
        flex-flow: column wrap;
        justify-content: center;
    }
    
    .el-message-box__pic {
        text-align: center;
        position: relative;
        z-index: 3000;
    }
    
    .el-message-box__pic img {
        width: 90px;
        height: 90px;
        border: solid 1px #e3e3e3;
    }
    
    .el-message-box__message p {
        text-align: center;
        line-height: 20px;
        font-size: 14px;
        color: #333333;
    }
    
    .el-message-box__btns {
        padding: 0 20px 32px;
        display: flex;
        justify-content: center;
    }
    
    .el-button--primary {
        width: 140px;
        height: 36px;
        background: #e13228;
        border-color: #e13228;
        color: #fff;
        font-weight: normal;
        border-radius: 20px;
    }
    
    .el-button--primary:hover {
        background-color: #d11c11;
    }
    
    .el-message-box__message_title {
        margin-top: 10px;
    }
    
    .el-message-box__message_txt {
        margin-top: 12px;
    }
    
    .el-message-box__close {
        display: inline-block;
        width: 13px;
        height: 13px;
        background: url(../../common/images/mac-icon.png) no-repeat 0 0;
        left: 8px;
        top: 8px;
        z-index: 3000;
        margin-left: 5px;
        margin-top: 5px;
    }
    
    .el-message-box__close:hover {
        background-position: 0 -31px;
    }
    
    .el-message-box-bg {
        width: 100%;
        height: 90px;
        filter: blur(10px);
        position: absolute;
        top: 12px;
        left: 0;
        z-index: 100;
        border-radius: 6px;
    }
</style>