module.exports = {
    /**
     * 发布流程定义 - 版本管理
     * @url admin/bpmn/definition/sys/publish
     */
    main: async (event) => {
        let { data = {}, userInfo, util } = event;
        let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
        let { uid } = data;
        let res = { code: 0, msg: '' };
        const { _id } = data;

        if (!_id) return { code: -1, msg: '流程定义ID不能为空' };

        try {
            // 获取待发布的流程
            const def = await vk.baseDao.findById({ dbName: "bpmn-definition", id: _id });
            if (!def) return { code: -1, msg: '流程定义不存在' };
            if (def.status !== 'draft') return { code: -1, msg: '只能发布草稿状态的流程' };

            // 校验流程定义完整性（至少包含开始和结束节点等）
            const validation = validateProcessDefinition(def);
            if (!validation.valid) return { code: -1, msg: validation.message };

            // 将所有同 key 的旧活跃版本设为 inactive
            await db.collection('bpmn-definition')
                .where({ key: def.key, status: 'active' })
                .update({ status: 'inactive', is_latest_version: false, update_date: Date.now() });

            // 计算新版本号
            const maxVersionRes = await db.collection('bpmn-definition')
                .where({ key: def.key })
                .orderBy('version', 'desc')
                .limit(1)
                .get();
            const newVersion = (maxVersionRes.data.length > 0 ? maxVersionRes.data[0].version : 0) + 1;

            // 更新当前版本为 active，并设置 is_latest_version
            await vk.baseDao.updateById({
                dbName: "bpmn-definition",
                id: _id,
                dataJson: {
                    status: 'active',
                    version: newVersion,
                    is_latest_version: true,
                    update_date: Date.now(),
                    update_id: uid
                }
            });

            res.msg = '发布成功';
            res.data = { version: newVersion };
        } catch (error) {
            return { code: -1, msg: error.message };
        }
        return res;
    }
};

/**
 * 基本验证
 */
function validateProcessDefinition(def) {
    const nodes = def.nodes || [];
    const hasStart = nodes.some(n => n.node_type === 'start');
    const hasEnd = nodes.some(n => n.node_type === 'end');
    if (!hasStart || !hasEnd) return { valid: false, message: '流程必须包含开始节点和结束节点' };
    // 可以增加更多业务校验
    return { valid: true };
}