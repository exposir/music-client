<template>
    <a class="bd-btn" :class="[classname,icon]" @click="handleAction">{{btnTxt}}</a>
</template>
<script>
    export default {
        name: 'button-item',
        props: {
            btnTxt: {
                default: ''
            },
            icon: {
                default: ''
            },
            classname: {
                type: String,
                default: ''
            },
            handleAction: {
                type: Function,
                default: function() {
                    return
                }
            }
        }
    }
</script>
<style scoped>
    .bd-btn {
        display: inline-block;
        width: 88px;
        height: 24px;
        text-align: center;
        line-height: 24px;
        border: solid 1px #e3e3e3;
        border-radius: 15px;
        cursor: pointer;
        font-size: 11px;
        /*font-weight: lighter;*/
    }
    
    .bd-btn:hover {
        border-color: #999999;
    }
    
    .bd-btn.vip-icon,
    .bd-btn.not-vip-icon {
        height: 22px;
        line-height: 22px;
        width: 21px;
        border: 1px solid transparent;
        margin-left: 9px;
        -webkit-app-region: no-drag;
    }
    
    .vip-icon::before {
        display: inline-block;
        content: "";
        width: 14px;
        height: 12px;
        background: url('~static/images/icon_vip2.svg') no-repeat;
        background-size: cover;
        vertical-align: -2px;
        margin-right: 7px;
    }
/*     
    .vip-icon:hover {
        background-color: #e13228;
        border-color: #e13228;
        color: #fff;
    } */
    
    .not-vip-big-icon {
        width: 150px;
        height: 22px;
        line-height: 22px;
    }
    
    .not-vip-big-icon:before,
    .not-vip-icon::before {
        display: inline-block;
        content: "";
        width: 14px;
        height: 12px;
        background: url('~static/images/not-vip-icon.svg') no-repeat;
        background-size: cover;
        vertical-align: -2px;
        margin-right: 7px;
    }
    .playall-icon {
        border: 1px solid #e13228;
        color: #ffffff;
        background: #e13228;
    }
    
    .playall-icon:hover {
        border: 1px solid #ca2d24;
        color: #ffffff;
        background: #ca2d24;
    }
    
    .playall-icon::before {
        display: inline-block;
        content: "";
        width: 14px;
        height: 12px;
        background: url('~static/images/buttonIcon/icon_play.svg') no-repeat;
        vertical-align: -2px;
        margin-right: 4px;
    }
    /* .playall-icon:hover::before {
        background: url('~static/images/buttonIcon/icon_play1.svg') no-repeat;
    } */
    .playall-icon-none {
        border: 1px solid #f9d6d4;
        color: #ffffff;
        background: #f9d6d4;
        border-color: #f9d6d4 !important;
        cursor: default !important;
    }
    .favour-icon,
    .favoured-icon {
        width: auto;
        padding: 0 10px 0 8px;
    }
    
    .favour-icon::before {
        display: inline-block;
        content: "";
        width: 15px;
        height: 13px;
        background: url('~static/images/buttonIcon/icon_unfavour.svg') no-repeat; 
        background-size: cover;
        vertical-align: -2px;
        margin-right: 7px;
    }
    
    .favoured-icon::before {
        display: inline-block;
        content: "";
        width: 15px;
        height: 13px;
        background: url('~static/images/buttonIcon/icon_favoured.svg') no-repeat;
        vertical-align: -2px;
        margin-right: 7px;
    }
    
    .download-icon {
        color: #333333;
    }
    
    .download-icon::before {
        display: inline-block;
        content: "";
        width: 12px;
        height: 12px;
        background: url('~static/images/buttonIcon/icon_download.svg') no-repeat;
        vertical-align: -2px;
        margin-right: 7px;
    }

    .delete-icon {
        color: #333333;
    }
    
    .delete-icon::before {
        display: inline-block;
        content: "";
        width: 12px;
        height: 12px;
        background: url('~static/images/buttonIcon/icon_delete.svg') no-repeat;
        vertical-align: -2px;
        margin-right: 7px;
    }
    
    .more-icon {
        width: 66px;
    }
    
    .more-icon::before {
        display: inline-block;
        content: "";
        width: 14px;
        height: 3px;
        background: url('~static/images/buttonIcon/icon_more.svg') no-repeat;
        margin-right: 7px;
        vertical-align: 2px;
    }
    
    .add-icon::before {
        display: inline-block;
        content: "";
        width: 12px;
        height: 12px;
        background: url('~static/images/buttonIcon/icon_add.svg') no-repeat;
        margin-right: 7px;
        vertical-align: -2px;
    }

    .import-icon::before {
        display: inline-block;
        content: "";
        width: 12px;
        height: 12px;
        background: url('~static/images/buttonIcon/icon_import.svg') no-repeat;
        margin-right: 7px;
        vertical-align: -2px;
    }

    .icon_mass_op::before {
        display: inline-block;
        content: "";
        width: 12px;
        height: 12px;
        background: url('~static/images/buttonIcon/icon_mass_op.svg') no-repeat;
        margin-right: 7px;
        vertical-align: -2px;
    }
    .icon_mass_op_none {
        color: #eeeeee;
        border-color: #eeeeee;
        cursor: default;
    }
    .icon_mass_op_none::before {
        display: inline-block;
        content: "";
        width: 12px;
        height: 12px;
        background: url('~static/images/buttonIcon/icon_mass_op_none.svg') no-repeat;
        margin-right: 7px;
        vertical-align: -2px;
    }
    .icon_mass_op_none:hover {
        border-color: #eeeeee !important;
    }

    .icon_exit_mass_op {
        width: 116px;
    }
    .icon_exit_mass_op::before {
        display: inline-block;
        content: "";
        width: 12px;
        height: 12px;
        background: url('~static/images/buttonIcon/icon_exit_mass_op.svg') no-repeat 100% 0;
        margin-right: 7px;
        vertical-align: -2px;
    }
    
    .disabled {
        background: #f2f2f2;
        color: #999;
        cursor: default;
    }
</style>