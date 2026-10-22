(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/file-preview-dialog/file-preview-dialog"],{"3ce1":function(t,e,n){},"5d53":function(t,e,n){"use strict";n.r(e);var i=n("89eb"),a=n("a43f");for(var u in a)["default"].indexOf(u)<0&&function(t){n.d(e,t,(function(){return a[t]}))}(u);n("8ba1");var o=n("828b"),c=Object(o["a"])(a["default"],i["b"],i["c"],!1,null,"7bc0f1ce",null,!1,i["a"],void 0);e["default"]=c.exports},"89eb":function(t,e,n){"use strict";n.d(e,"b",(function(){return i})),n.d(e,"c",(function(){return a})),n.d(e,"a",(function(){}));var i=function(){var t=this.$createElement;this._self._c},a=[]},"8ba1":function(t,e,n){"use strict";var i=n("3ce1"),a=n.n(i);a.a},a43f:function(t,e,n){"use strict";n.r(e);var i=n("c0a0"),a=n.n(i);for(var u in i)["default"].indexOf(u)<0&&function(t){n.d(e,t,(function(){return i[t]}))}(u);e["default"]=a.a},c0a0:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var i={name:"FilePreviewDialog",props:{value:{type:Boolean,default:!1},fileData:{type:Object,default:function(){return{url:"",name:"",type:""}}}},computed:{show:{get:function(){return this.value},set:function(t){this.$emit("input",t)}},title:function(){return"文件预览 - ".concat(this.fileData.name||"文件")}},methods:{handleClose:function(){this.show=!1},handleDownload:function(){this.$emit("download",this.fileData)}}};e.default=i}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/file-preview-dialog/file-preview-dialog-create-component',
    {
        'components/file-preview-dialog/file-preview-dialog-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('df3c')['createComponent'](__webpack_require__("5d53"))
        })
    },
    [['components/file-preview-dialog/file-preview-dialog-create-component']]
]);
