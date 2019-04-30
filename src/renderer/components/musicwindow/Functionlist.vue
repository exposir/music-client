<template>
    <div id="functionlist" class="functionlist cf">
      <left-nav-bar v-bind:isrecommend="isrecommend" :isLocal="isLocal" :isMvList="isMvList" :isCollection="isCollection" :isPrivateRadio="isPrivateRadio"></left-nav-bar>
        <div class="show" :class="{'subpage':!isMainPage}" id="mainContent">
            <router-view></router-view>
      </div>
    <user-info-pop></user-info-pop>
    <transition v-on:enter="enter">
     <div class="add-music-animation" v-show="isShowAddMusicIcon"><i class="add-music-animation-icon"></i></div>
    </transition>
    </div>
  </template>
  
  <script>
      import leftNavBar from 'components/musicwindow/leftNavBar.vue'
      import userInfoPop from 'components/user/userInfoPop.vue'
      import Velocity from 'velocity-animate'
      import log from 'electron-log'
      import {
          mapGetters,
          mapActions
      } from 'vuex'
      export default {
          name: 'functionlist',
          data() {
              return {
                  isrecommend: false,
                  isMainPage: false,
                  isShowAddMusicIcon: false,
                  isLocal: true,
                  isMvList: false,
                  isCollection: false,
                  isPrivateRadio: false
              }
          },
          created: function() {
              let paths = this.$route.path;
              this.setCurrentPageStatus(paths)
  
              eventBus.$on('isShowAddMusicIcon', (val) => {
                  this.isShowAddMusicIcon = val
              })
  
              eventBus.$on('goBack', (val) => {
                  this.$router.go(-1)
              })
  
              eventBus.$on('goPage', (url) => {
                  this.$router.push(url)
              })
          },
          mounted() {
              require('electron').ipcRenderer.send('component-ready', 'Functionlist.vue is ready')
  
          },
          methods: {
              setCurrentPageStatus(paths) {
                //   console.log(paths);
                  if (paths) {
                      if (paths.indexOf('recommend') > -1 ||
                          paths.indexOf('muwindow') > -1 || 
                          paths.indexOf('bangdanIndex') > -1 || 
                          paths.indexOf('gedanIndex') > -1 || 
                          paths.indexOf('radioIndex') > -1 || 
                          paths.indexOf('singerlist') > -1 ||
                          paths.indexOf('newSongIndex') > -1) {
                          this.isrecommend = true;
                          this.isMainPage = true
                    //   } else if (paths.indexOf('/my/') > -1 || paths.indexOf('favour') > -1) {
                      } else if (paths.indexOf('/my/') > -1 || paths.indexOf('/setup') > -1) {
                          this.isrecommend = false
                          this.isMainPage = true
                      } else {
                          this.isrecommend = false;
                          this.isMainPage = false
                      }
  
                      if (paths.indexOf('/my/local') > -1 || paths.indexOf('/my/downloaded') > -1 ) { 
                          this.isLocal = true;
                      } else {
                          this.isLocal = false;
                      }
  
                      if (paths.indexOf('mvRecommend') > -1 || paths.indexOf('mvBigman') > -1 || paths.indexOf('mvReplay') > -1 || paths.indexOf('mvList') > -1 || paths.indexOf('muwindow') > -1 ) {
                          this.isMvList = true
                      } else {
                          this.isMvList = false
                      }

                      if (paths.indexOf('favour') > -1) {
                          this.isCollection = true
                      } else {
                          this.isCollection = false
                      }

                      if ( paths.indexOf('privateRadio') > -1 ) {
                          this.isPrivateRadio = true
                      } else {
                          this.isPrivateRadio = false
                      }
                  }
              },
              enter(el) {
                  let me = this
                  Velocity(el, {
                      bottom: -108,
                      opacity:0.6
                  }, {
                      duration: 1300,
                      easing: "easeInSine",
                      begin: function() {
                          el.style.bottom = '60px'
                          el.style.opacity = 1;
                      },
                      complete: function(elements) {
                          me.isShowAddMusicIcon = false
  
  
                      }
                  })
              }
          },
          watch: {
              '$route' (to, from) {
                  
                  let routeinfo = 'to: ' + to.path + '-from: ' + from.path;
                  log.info(routeinfo)
                  eventBus.$emit('isMass', false);
                  let paths = to.path;
                  this.setCurrentPageStatus(paths)
  
                  if (to.path === '/muwindow') {
                      this.$router.push('/recommend');
                  }
              }
          },
          components: {
              leftNavBar,
              userInfoPop
          }
  
      }
  </script>
  <style scoped>
      .functionlist {
          height: 100%;
          position: absolute;
          top: 0;
          width: 100%;
          box-sizing: border-box;
          border-top: 56px solid transparent;
          border-bottom: 70px solid transparent;
      }
      
      .show {
          margin-left: 161px;
          height: 100%;
          background: #fff;
          position: relative;
          padding-top: 1px;
      }
      .show > div{
          max-width: 1100px;
          margin: 0 auto;
      }

      .scrollBarBody,
      .subpage {
          overflow-x: hidden;
          overflow-y: auto;
          /*padding: 0 30px;*/
      }
      
      .add-music-animation {
          position: absolute;
          bottom: 60px;
          right: 20px;
          width: 40px;
          height: 100px;
      }
      
      .add-music-animation-icon {
          display: inline-block;
          width: 36px;
          height: 40px;
          background: url('~static/images/add_music_animation_icon.svg') no-repeat;
      }
  </style>