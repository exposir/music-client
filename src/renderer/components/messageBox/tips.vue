<template>
  <transition name="msgbox-fade">
    <div class="el-message-box__wrapper" v-show="visible" ondragstart="return false">
      <div class="el-message-box" :class="customClass">
         <div class="el-message-box__header" v-if="title !== undefined">
          <div class="el-message-box__title">{{ title }}</div>
          <i class="el-message-box__close" @click="closeMsgBox()" v-if="showClose"></i>
        </div>
        <div class="el-message-box__content" v-if="message !== ''">
          <div class="el-message-box__message">
            <slot>
                <input v-if="showInput" :value="message" @keyup.stop="validateTitleLength($event)" id="modifyGedanNameInput" @keyup.enter="handleAction('confirm')"  class="input" autofocus="autofocus" maxlength="20">
                <p class="el-message-box__message_txt" v-else><i class="warning"></i>{{ message }}</p>
            </slot>
          </div>
        </div>
        <div class="message-btn-box">
            <el-button :class="cancelButtonClass" 
            :loading="cancelButtonLoading"
            v-show="showCancelButton"
            @click="closeMsgBox">
            {{ cancelButtonText}}
          </el-button>
          <el-button
            :class="confirmButtonClass"
            :loading="confirmButtonLoading"
            v-show="showConfirmButton"
            @click="handleAction('confirm')">
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
            },
            validateTitleLength() {
                let title = document.getElementById('modifyGedanNameInput').value
                console.log(title)
                console.log(this.message)
                let isTitleValidate = this.commonFuns.getStringLength(title, 20)

                if (!isTitleValidate) {
                    this.commonFuns.createTips('歌单名称不能超过20个字符', 'warning')
                    return false
                }
            },
        },
        data() {
            return {
                title: '',
                message: '',
                type: '',
                customClass: '',
                showInput: false,
                inputValue: null,
                inputPlaceholder: '',
                showConfirmButton: true,
                showCancelButton: true,
                action: '',
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                confirmButtonLoading: false,
                cancelButtonLoading: false,
                confirmButtonClass: '',
                confirmButtonDisabled: false,
                cancelButtonClass: '',
                editorErrorMessage: null,
                callback: null,
                beforeClose: null
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
        display: flex;
        height: 30px;
        align-items: center;
        justify-content: center;
        padding: 0;
        background: #e13228;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        position: relative;
    }
    
    .el-message-box__title {
        color: #fff;
        font-size: 14px;
        font-weight: normal;
    }
    
    .el-message-box__content {
        display: flex;
        flex-flow: column wrap;
        justify-content: center;
        padding: 30px;
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
        line-height: 30px;
        font-size: 14px;
        color: #333333;
    }
    
    .message-btn-box {
        display: flex;
        justify-content: space-between;
        padding: 0 30px 30px 30px;
    }
    
    .el-button--primary {
        width: 140px;
        height: 36px;
        background: #e13228;
        border-color: #e13228;
        color: #fff;
        font-weight: normal;
    }
    
    .el-message-box__message_title {
        margin-top: 10px;
    }
    
    .el-message-box__message_txt {
        margin-top: 12px;
        padding: 0 32px;
    }
    
    .el-message-box__close {
        position: absolute;
        width: 15px;
        height: 15px;
        background: url('~static/images/topBar/icon_close_white.svg') no-repeat;
        right: 8px;
        top: 8px;
        z-index: 3000;
        opacity: 0.7;
    }
    
    .el-message-box__close:hover {
        opacity: 1;
        cursor: pointer;
    }
    
    .el-message-box-bg {
        width: 100%;
        height: 90px;
        filter: blur(10px);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 100;
    }
    /*.confirm-btn {
        height: 30px;
        line-height: 30px;
        border: solid 1px #22c5bd;
        border-radius: 15px;
        background: #22c5bd;
        color: #fff;
        padding: 0;
        font-weight: normal;
    }*/
    
    .buy-vip-btn {
        width: 134px;
    }
    
    .buy-vip-btn::before {
        display: inline-block;
        content: "";
        width: 14px;
        height: 12px;
        background: url('/images/not-vip-icon.svg') no-repeat;
        background-size: cover;
        vertical-align: -1px;
        margin-right: 7px;
    }
    
    .buy-vip-btn:hover,
    .noraml-btn:hover {
        background-color: #d11c11;
    }
    
    .noraml-btn {
        width: 116px;
        height: 30px;
        line-height: 30px;
        border: solid 1px #e13228;
        border-radius: 15px;
        color: #fff;
        background: #e13228;
        padding: 0;
    }
    
    .cancel-small-btn {
        width: 94px;
        height: 30px;
        line-height: 30px;
        border: solid 1px #e13228;
        border-radius: 15px;
        color: #e13228;
        padding: 0;
    }
    
    .cancel-big-btn {
        width: 116px;
        height: 30px;
        line-height: 30px;
        border: solid 1px #e13228;
        border-radius: 15px;
        color: #e13228;
        padding: 0;
    }
    
    .cancel-small-btn:hover,
    .cancel-big-btn:hover {
        background-color: #F9C5C5;
    }
    
    .input {
        width: 100%;
        height: 32px;
        border: solid 1px #d4d4d4;
        font-size: 12px;
        padding-left: 2px;
    }
    
    i.warning {
        display: inline-block;
        width: 26px;
        height: 26px;
        position: relative;
        top: 9px;
        margin-right: 10px;
        background: url(../../common/images/tips_icon.png) no-repeat;
        background-size: auto 100%;
        background-position: -26px 0;
    }
    
    input.el-input__inner:focus {
        border-color: #e13228;
    }

    .el-message-box.hasPay {
        width: 320px;
    }
    .el-message-box.hasPay p {
        padding: 0 15px;
        line-height: 25px;
    }
</style>