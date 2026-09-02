module.exports = {
	/**
	 * 数据删除
	 * @url common/sys/getUploadFileOptions/index 前端调用的url参数地址
	 * data 请求参数 说明
	 * res 返回参数说明
	 * @params {Number} code 错误码，0表示成功
	 * @params {String} msg 详细信息
	 */
	main: async (event) => {
		let {
			data = {}, userInfo, util, filterResponse, originalParam
		} = event;
		let {
			customUtil,
			uniID,
			config,
			pubFun,
			vk,
			db,
			_
		} = util;
		let {
			uid
		} = data;
		let res = {
			code: 0,
			msg: 'ok'
		};		
		// 业务逻辑开始-----------------------------------------------------------
		// 获取前端传过来的参数
		let {
			cloudPath
		} = data;
		// 参数验证开始
		if (vk.pubfn.isNull(cloudPath)) return {
			code: -1,
			msg: '存储路径不能为空'
		};
		// 参数验证结束				
		// 然后获取 extStorageManager 对象实例
		const extStorageManager = uniCloud.getExtStorageManager({
			provider: 'qiniu',
			domain: 'tdhstorage.cntdh.net', // 域名地址
		});

		// 最后调用 extStorageManager.getUploadFileOptions
		let uploadFileOptionsRes = extStorageManager.getUploadFileOptions({
			cloudPath: cloudPath,
			allowUpdate: true, // 是否允许覆盖更新
		});

		res.rows = uploadFileOptionsRes;
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}