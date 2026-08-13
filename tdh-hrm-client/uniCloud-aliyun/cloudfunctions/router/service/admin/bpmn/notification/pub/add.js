module.exports = {
	/**
	 * 发送通知
	 * @url admin/bpmn/notification/pub/add 前端调用的url参数地址
	 */
	main: async (event) => {
		let { data = {}, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let { uid } = data;
		let res = { code: 0, msg: '' };

		const { type, title, content, recipients, data: notificationData } = data;

		try {
			
			let dbName = "bpmn-notification"; // 表名
			
			// 确保recipients是数组
			const recipientList = Array.isArray(recipients) ? recipients : [recipients];
			
			// 为每个接收人生成初始阅读状态
			const initialReadStatus = recipientList.map(userId => ({
				user_id: userId,
				status: 'unread',
				read_time: null
			}));

			// 创建通知记录
			const notificationRecord = {
				type: type || 'system',
				title: title || '系统通知',
				content: content || '',
				recipients: recipientList,
				read_status: initialReadStatus,
				data: notificationData || {},
				create_time: Date.now(),
				create_uid: uid
			};

			// 保存到通知记录表
			await vk.baseDao.add({
				dbName,
				dataJson: notificationRecord
			});

			console.log(`通知发送成功: ${title}, 接收人: ${recipientList.join(', ')}`);
			
			res.msg = '通知发送成功';

		} catch (error) {
			console.error('发送通知失败:', error);
			// 通知失败不影响主流程
			res.msg = '通知记录保存失败，但不影响主流程';
		}

		return res;
	}
}