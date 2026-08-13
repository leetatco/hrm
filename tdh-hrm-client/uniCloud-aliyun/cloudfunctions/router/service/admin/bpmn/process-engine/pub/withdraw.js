// cloudfunctions/admin/bpmn/process-engine/sys/withdraw.js
module.exports = {
	/**
	 * 撤销流程
	 * @url admin/bpmn/process-engine/sys/withdraw 前端调用的url参数地址
	 * data 请求参数 说明
	 * @params {String} application_id 申请ID
	 * res 返回参数说明
	 * @params {Number} code 错误码，0表示成功
	 * @params {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, userInfo, util, filterResponse, originalParam } = event;
		let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
		let { uid } = data;
		let res = { code: 0, msg: '' };
		
		// 业务逻辑开始-----------------------------------------------------------
		const { application_id } = data;
		
		if (!application_id) {
			return { code: -1, msg: '申请ID不能为空' };
		}
		
		try {
			// 查询申请信息
			const applicationRes = await db.collection('bpmn-application-form').doc(application_id).get();
			if (!applicationRes.data) {
				return { code: -1, msg: '申请不存在' };
			}
			
			const application = applicationRes.data;
			
			// 权限检查：只有申请人可以撤销
			if (application.applicant_id !== uid) {
				return { code: -1, msg: '只能撤销自己的申请' };
			}
			
			// 状态检查：只有审批中的申请可以撤销
			if (application.status !== 'pending') {
				return { code: -1, msg: '只能撤销审批中的申请' };
			}
			
			// 查询流程实例
			const instanceRes = await db.collection('bpmn-instance')
				.where({
					application_id: application_id,
					status: 'active'
				})
				.get();
			
			if (instanceRes.data.length === 0) {
				return { code: -1, msg: '未找到活跃的流程实例' };
			}
			
			const instance = instanceRes.data[0];
			
			// 更新实例状态
			await vk.baseDao.updateById({
				dbName: "bpmn-instance",
				id: instance._id,
				data: {
					status: 'terminated',
					end_time: Date.now()
				}
			});
			
			// 更新申请状态
			await vk.baseDao.updateById({
				dbName: "bpmn-application-form",
				id: application_id,
				data: {
					status: 'withdrawn'
				}
			});
			
			// 取消相关任务
			await db.collection('bpmn-task')
				.where({
					instance_id: instance._id,
					status: 'pending'
				})
				.update({
					status: 'cancelled',
					complete_time: Date.now()
				});
			
			res.msg = '申请撤销成功';
			
		} catch (error) {
			return { code: -1, msg: error.message };
		}
		
		// 业务逻辑结束-----------------------------------------------------------
		return res;
	}
}