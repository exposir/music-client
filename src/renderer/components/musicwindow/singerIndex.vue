<template>
    <div class="singerIndex">
        <div class="condition-table">
            <div class="trangle-box">
                <div class="trangle-bottomleft"></div>
                <div class="trangle-topright"></div>
            </div>
            <div class="area  cond">
                <span  v-for="(val,index) in areaArr" @click="changearea(val.areacode,index)"  :class="{'active':index === selected1}">
                    <router-link @click.native="commonFuns.crmStatistics('singer','areaClick')" :to="{path:'/singerlist',query:{area:val.areacode,sex:sex,abc:abc,offset:0}}">{{val.areaname}}</router-link>
                </span>
            </div>
            <div class="sex  cond">
                <span v-for="(val,index) in sexArr" @click="changesex(val.sexcode,index)"  :class="{'active':index === selected2}">
                    <router-link @click.native="commonFuns.crmStatistics('singer','sexClick')" :to="{path:'/singerlist',query:{area:area,sex:val.sexcode,abc:abc,offset:0}}">{{val.sexname}}</router-link>
                </span>
            </div>
            <div class="letter  cond">
                <span v-for="(val,index) in abcArr" @click="changeabc(val.abccode,index)"   :class="{'active':index === selected3}">
                    <router-link @click.native="commonFuns.crmStatistics('singer','firstClick')" :to="{path:'/singerlist',query:{area:area,sex:sex,abc:val.abccode,offset:0}}">{{val.abcname}}</router-link>
                </span>
            </div>
        </div>
        <router-view></router-view>
    </div>
</template>
<script>
    import reportService from 'service/reportService'
    export default {
        name: 'singerIndex',
        data() {
            return {
                areaArr: [{
                    areaname: '全部',
                    areacode: 0
                }, {
                    areaname: '华语',
                    areacode: 6
                }, {
                    areaname: '欧美',
                    areacode: 3
                }, {
                    areaname: '日本',
                    areacode: 60
                }, {
                    areaname: '韩国',
                    areacode: 7
                }, {
                    areaname: '其他',
                    areacode: 5
                }],
                sexArr: [{
                    sexname: '不限',
                    sexcode: 0
                }, {
                    sexname: '男歌手',
                    sexcode: 1
                }, {
                    sexname: '女歌手',
                    sexcode: 2
                }, {
                    sexname: '乐队组合',
                    sexcode: 3
                }],
                abcArr: [{
                    abcname: '热门',
                    abccode: ''
                }, {
                    abcname: 'A',
                    abccode: 'A'
                }, {
                    abcname: 'B',
                    abccode: 'B'
                }, {
                    abcname: 'C',
                    abccode: 'C'
                }, {
                    abcname: 'D',
                    abccode: 'D'
                }, {
                    abcname: 'E',
                    abccode: 'E'
                }, {
                    abcname: 'F',
                    abccode: 'F'
                }, {
                    abcname: 'G',
                    abccode: 'G'
                }, {
                    abcname: 'H',
                    abccode: 'H'
                }, {
                    abcname: 'I',
                    abccode: 'I'
                }, {
                    abcname: 'J',
                    abccode: 'J'
                }, {
                    abcname: 'K',
                    abccode: 'K'
                }, {
                    abcname: 'L',
                    abccode: 'L'
                }, {
                    abcname: 'M',
                    abccode: 'M'
                }, {
                    abcname: 'N',
                    abccode: 'N'
                }, {
                    abcname: 'O',
                    abccode: 'O'
                }, {
                    abcname: 'P',
                    abccode: 'P'
                }, {
                    abcname: 'Q',
                    abccode: 'Q'
                }, {
                    abcname: 'R',
                    abccode: 'R'
                }, {
                    abcname: 'S',
                    abccode: 'S'
                }, {
                    abcname: 'T',
                    abccode: 'T'
                }, {
                    abcname: 'U',
                    abccode: 'U'
                }, {
                    abcname: 'V',
                    abccode: 'V'
                }, {
                    abcname: 'W',
                    abccode: 'W'
                }, {
                    abcname: 'X',
                    abccode: 'X'
                }, {
                    abcname: 'Y',
                    abccode: 'Y'
                }, {
                    abcname: 'Z',
                    abccode: 'Z'
                }, {
                    abcname: '#',
                    abccode: 'other'
                }],
                area: 0,
                sex: 0,
                abc: 0,
                offset: 0,
                selected1: null,
                selected2: null,
                selected3: null
            }
        },
        created: function() {
            reportService.clickReport({
                'type': 'click',
                'page': 'musicwindow',
                'pos': 'geshou'
            });
            if (document.querySelector('.scrollBarBody')) {
                document.querySelector('.scrollBarBody').scrollTop = 0
            }
        },
        mounted(){
            this.locateCurChoose()
        },
        methods: {
            locateCurChoose() {
                let { area, sex, abc } = this.$route.query
                this.$router.replace({
                    path: "/singerlist",
                    query: {
                        area, sex, abc,
                        offset: 0
                    }
                })
                if ( area ) {
                    this.areaArr.forEach((item, index)=>{
                        if ( item.areacode == area ) {
                            this.selected1 = index
                        }
                    })
                }
                if ( sex ) {
                    this.sexArr.forEach((item, index)=>{
                        if ( item.sexcode == sex ) {
                            this.selected2 = index
                        }
                    })
                }
                if ( abc ) {
                    this.abcArr.forEach((item, index)=>{
                        if ( item.abccode == abc ) {
                            this.selected3 = index
                        }
                    })
                }
            },
            changearea(num, index) {
                this.area = num;
                this.selected1 = index;
            },
            changesex(num, index) {
                this.sex = num;
                this.selected2 = index;
            },
            changeabc(str, index) {
                this.abc = str;
                this.selected3 = index;
            }
        }
    }
</script>
<style scoped>
    .singerIndex {
        height: 100%;
    }
    
    .singerIndex a:hover {
        color: #e13228;
    }
    
    .condition-table {
        display: flex;
        flex-flow: column nowrap;
        height: 124px;
        padding: 18px 0 10px 30px;
        background-color: #fafafa;
        position: relative;
        font-size: 12px;
    }
    
    .condition-table div.cond {
        height: 34px;
        line-height: 34px;
    }
    
    .condition-table div.cond span {
        cursor: pointer;
    }
    
    .condition-table div.letter span:first-child {
        margin-right: 28px;
    }
    
    .condition-table div.letter span:first-child a {
        /*color: #ff5186;*/
    }
    
    .condition-table div.letter span:first-child,
    .condition-table div.sex span:first-child,
    .condition-table div.area span:first-child {
        font-size: 14px;
    }
    
    .area span {
        margin-right: 28px;
    }
    
    .area .all {
        font-weight: bold;
    }
    
    .sex span {
        margin-right: 28px;
    }
    
    .sex .all {
        font-weight: bold;
    }
    
    .letter {
        margin-right: -18px;
    }
    
    .letter span {
        margin-right: 17px;
    }
    
    .letter .hot {
        margin-right: 24px;
        /*color: #ff5186;*/
        /*font-weight: bold;*/
    }
    
    .condition-table .active {
        background: none;
    }
    
    .condition-table .active a {
        color: #e13228;
    }
</style>