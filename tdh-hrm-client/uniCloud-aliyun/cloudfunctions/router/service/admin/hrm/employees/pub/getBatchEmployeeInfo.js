module.exports = {
  /**
   * 批量查询员工信息
   * @url admin/hrm/employees/pub/getBatchEmployeeInfo
   * data 请求参数说明
   * @params {Array} cards 身份证号码数组
   * res 返回参数说明
   * @params {Number} code 错误码，0表示成功
   * @params {String} msg 详细信息
   * @params {Array} data 员工信息数组
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
      cards
    } = data;
    
    let res = {
      code: 0,
      msg: 'success',
      data: []
    };
    
    // 参数验证
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      res.code = -1;
      res.msg = 'cards参数必须是非空数组';
      return res;
    }
    
    // 去重
    const uniqueCards = [...new Set(cards)];
    
    // 业务逻辑开始
    let dbName = "hrm-employees";
    
    try {
      // 使用$in操作符批量查询
      const queryRes = await vk.baseDao.getTableData({
        dbName,
        data: {
          pageIndex: 1,
          pageSize: uniqueCards.length, // 确保获取所有数据
          sortArr: [{
            name: "_add_time",
            type: "desc"
          }]
        },
        whereJson: {
          card: { $in: uniqueCards }
        }
      });
      
      if (queryRes.code === 0) {
        // 建立身份证到最新员工记录的映射
        const cardMap = new Map();
        
        queryRes.rows.forEach(row => {
          // 只保留每个身份证的最新记录
          if (!cardMap.has(row.card) || 
              new Date(row._add_time) > new Date(cardMap.get(row.card)._add_time)) {
            cardMap.set(row.card, {
              employee_id: row.employee_id,
              card: row.card,
              name: row.name,
              _add_time: row._add_time
            });
          }
        });
        
        // 转换为数组返回
        res.data = Array.from(cardMap.values());
      } else {
        res.code = queryRes.code;
        res.msg = queryRes.msg;
      }
      
    } catch (error) {
      console.error('批量查询员工信息失败:', error);
      res.code = -2;
      res.msg = '查询失败: ' + error.message;
    }
    
    return res;
  }
};