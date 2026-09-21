// admin/hrm/attendance/pub/expireCarryForward
module.exports = {
  main: async (event) => {
    const { util } = event;
    const { vk, db } = util;
    const now = Date.now();

    // 查询所有过期的结转额度
    const expiredRes = await vk.baseDao.selects({
      dbName: 'hrm-attendance-leavebalance',
      whereJson: {
        carry_forward_minutes: db.command.gt(0),
        carry_expire_date: db.command.lte(now),
        status: true
      },
      limit: 500
    });

    let count = 0;
    for (const balance of expiredRes.rows) {
      const carryMinutes = balance.carry_forward_minutes || 0;
      // 从总额度中扣除结转部分
      const newTotal = Math.max(0, (balance.total_minutes || 0) - carryMinutes);
      await vk.baseDao.updateById({
        dbName: 'hrm-attendance-leavebalance',
        id: balance._id,
        dataJson: {
          total_minutes: newTotal,
          carry_forward_minutes: 0,
          carry_expire_date: null,
          adjust_reason: '上年结转额度已过期清零',
          update_date: now
        }
      });
      count++;
    }

    return { code: 0, msg: `已处理 ${count} 条过期结转额度` };
  }
};