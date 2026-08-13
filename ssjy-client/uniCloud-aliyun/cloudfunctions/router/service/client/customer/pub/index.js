// service/customer/index.js
const vk = require('vk-unicloud');

module.exports = {
  /**
   * 模糊搜索企业列表
   * @param {String} keyword - 企业名称关键词
   * @param {Number} pageIndex - 页码，默认1
   * @param {Number} pageSize - 每页数量，默认20
   */
  async search({ keyword, pageIndex = 1, pageSize = 20 }) {
    if (!keyword) throw new Error('请输入企业名称');

    const db = vk.baseDao;
    const where = {
      company_name: db.RegExp({
        regexp: keyword,
        options: 'i'       // 不区分大小写
      })
    };

    const { data, total } = await db.select({
      collection: 'customers',
      where,
      getCount: true,
      skip: (pageIndex - 1) * pageSize,
      limit: pageSize,
      field: {             // 列表页只返回必要字段，减少数据传输
        _id: true,
        company_name: true,
        industry: true,
        legal_person: true,
        address: true,
        update_date: true
      }
    });

    return { data, total };
  },

  /**
   * 获取企业详情（含所有关联信息）
   * @param {String} id - customers 的 _id
   */
  async detail({ id }) {
    if (!id) throw new Error('缺少企业ID');

    // 使用万能连表查询
    const result = await vk.baseDao.selects({
      main: {
        collection: 'customers',
        where: { _id: id },
        field: {}          // 不限制字段，返回全部
      },
      // 定义需要关联的子表
      relations: [
        {
          name: 'bank_flows',
          collection: 'bank_flows',
          fk: 'customer_id',
          type: 'hasMany'
        },
        {
          name: 'shareholders',
          collection: 'shareholders',
          fk: 'customer_id',
          type: 'hasMany'
        },
        {
          name: 'tax_records',
          collection: 'tax_records',
          fk: 'customer_id',
          type: 'hasMany'
        },
        {
          name: 'loans',
          collection: 'loans',
          fk: 'customer_id',
          type: 'hasMany'
        },
        {
          name: 'investments',
          collection: 'investments',
          fk: 'customer_id',
          type: 'hasMany'
        },
        {
          name: 'properties',
          collection: 'properties',
          fk: 'customer_id',
          type: 'hasMany'
        },
        {
          name: 'lawsuits',
          collection: 'lawsuits',
          fk: 'customer_id',
          type: 'hasMany'
        },
        {
          name: 'business_performance',
          collection: 'business_performance',
          fk: 'customer_id',
          type: 'hasMany'
        },
        {
          name: 'subsidies',
          collection: 'subsidies',
          fk: 'customer_id',
          type: 'hasMany'
        }
      ]
    });

    if (!result || result.length === 0) throw new Error('企业不存在');
    // 返回主记录及其关联数据（selects 返回数组，取第一条）
    return result[0];
  }
};