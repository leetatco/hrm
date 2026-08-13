module.exports = {
  /**
   * 获取当前配置中允许汇入的 OA 表单类型列表（用于下拉框）
   */
  main: async (event) => {
    let { util } = event;
    let { vk, db } = util;
    let res = { code: 0, msg: 'ok', rows: [] };

    // 1. 获取配置中的 import_codes
    const configRes = await vk.baseDao.selects({
      dbName: 'hrm-attendance-importconfig',
      whereJson: {},
      limit: 1,
      fieldJson: { import_codes: true }
    });

    let allowedCodes = [];
    if (configRes.rows.length > 0) {
      allowedCodes = configRes.rows[0].import_codes || [];
    }

    // 2. 如果没有配置任何类型，返回空数组
    if (allowedCodes.length === 0) {
      return res;
    }

    // 3. 根据 codes 查询表单类型名称
    const formTypeRes = await vk.baseDao.selects({
      dbName: 'bpmn-form-type',
      whereJson: {
        code: db.command.in(allowedCodes)
      },
      fieldJson: { code: true, name: true },
      sortArr: [{ name: 'code', type: 'asc' }]
    });

    res.rows = formTypeRes.rows;
    return res;
  }
};