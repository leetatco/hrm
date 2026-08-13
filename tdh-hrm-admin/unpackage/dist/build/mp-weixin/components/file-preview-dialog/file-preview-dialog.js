(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/file-preview-dialog/file-preview-dialog"],{"056b8":function(t,e,n){"use strict";n.r(e);var i=n("a59b"),a=n.n(i);for(var u in i)["default"].indexOf(u)<0&&function(t){n.d(e,t,(function(){return i[t]}))}(u);e["default"]=a.a},"06ec":function(t,e,n){"use strict";n.r(e);var i=n("6c37"),a=n("056b8");for(var u in a)["default"].indexOf(u)<0&&function(t){n.d(e,t,(function(){return a[t]}))}(u);n("d161");var o=n("828b"),c=Object(o["a"])(a["default"],i["b"],i["c"],!1,null,"7bc0f1ce",null,!1,i["a"],void 0);e["default"]=c.exports},"6c37":function(t,e,n){"use strict";n.d(e,"b",(function(){return i})),n.d(e,"c",(function(){return a})),n.d(e,"a",(function(){}));var i=function(){var t=this.$createElement;this._self._c},a=[]},a59b:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var i={name:"FilePreviewDialog",props:{value:{type:Boolean,default:!1},fileData:{type:Object,default:function(){return{url:"",name:"",type:""}}}},computed:{show:{get:function(){return this.value},set:function(t){this.$emit("input",t)}},title:function(){return"文件预览 - ".concat(this.fileData.name||"文件")}},methods:{handleClose:function(){this.show=!1},handleDownload:function(){this.$emit("download",this.fileData)}}};e.default=i},d161:function(t,e,n){"use strict";var i=n("df57"),a=n.n(i);a.a},df57:function(t,e,n){}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/file-preview-dialog/file-preview-dialog-create-component',
    {
        'components/file-preview-dialog/file-preview-dialog-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('df3c')['createComponent'](__webpack_require__("06ec"))
        })
    },
    [['components/file-preview-dialog/file-preview-dialog-create-component']]
]);
