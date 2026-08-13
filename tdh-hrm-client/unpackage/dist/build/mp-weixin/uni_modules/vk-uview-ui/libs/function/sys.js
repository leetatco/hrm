"use strict";const t=require("./getSystemInfoSync.js");exports.os=function(){return t.getSystemInfoSync().platform},exports.sys=function(){return t.getSystemInfoSync()};
