

## RboyUploadSfz 身份证正反面上传

> **组件名：Rboy-upload-sfz**
> 代码块： `Rboy-upload-sfz`


## 属性
- obverse-url 身份证正面图片地址
- reverse-url 身份证反面图片地址
- source-type 控制相机和相册（album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项）
- @selectChange 身份证图片上传成功事件
- @del 身份证图片删除事件



## 使用方法
1. 引入
```js
import RboyUploadSfz from "@/components/Rboy-upload-sfz/Rboy-upload-sfz.vue"
```

2. 注册组件
```js
components: {
	RboyUploadSfz,
},
```

3. 应用
```html
<Rboy-upload-sfz :obverse-url="formData.obverseUrl" :reverse-url="formData.reverseUrl" @selectChange="sfz_chagne" @del="del_btn"></Rboy-upload-sfz>
```
```js
// 表单
formData: {
	// 正面
	obverseUrl: "",
	// 反面
	reverseUrl: "",
},
methods: {
	// 身份证
	// 上传
	sfz_chagne(e) {
		if (e.name == "obverse") {
			this.formData.obverseUrl = e.tempFilePath
		} else if (e.name == "reverse") {
			this.formData.reverseUrl = e.tempFilePath
		}
	},
	// 删除
	del_btn(e) {
		if (e.name == "obverse") {
			this.formData.obverseUrl = ""
		} else if (e.name == "reverse") {
			this.formData.reverseUrl = ""
		}
	},
}
```


