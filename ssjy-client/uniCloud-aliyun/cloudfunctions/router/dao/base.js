const Tables = require('./config.js');

/**
 * 数据库访问基类
 * 提供基础的CRUD操作和聚合查询功能
 * @class BaseDao
 */
class BaseDao {

  constructor(util) {
    const { vk, db } = util;
    this.dao = vk.baseDao;
    this.db = db;
    this._ = db.command;
    this.$ = db.command.aggregate;
    this.tableName = ""; // 表名
    this._getUtil = () => {
      return util;
    }
  }

  get util() {
    return this._getUtil();
  }

  get vk() {
    return this._getUtil().vk;
  }

  /**
   * 获取集合引用（一般用于复杂操作时使用）
   * @returns {Object} 集合引用
   */
  collection(tableName) {
    if (!tableName) tableName = this.tableName;
    if (!tableName) {
      throw new Error('tableName is required');
    }
    return this.db.collection(tableName);
  }

  /**
   * 查 - 根据ID获取单条记录
   * @param {String|Object} condition - 记录ID或包含db、id、fieldJson的对象
   * @param {Object} [fieldJson] - 字段显示规则
   * @returns {Promise<Object>} 查询结果（表记录对象）
   * @example
   * // 简易版（不支持事务）
   * let info = await this.findById(_id);
   * // 完整版（支持事务）
   * let info = await this.findById({
   *   db, // 指定db对象
   *   id: _id,
   *   fieldJson: { name: 1 }
   * });
   */
  async findById(condition, fieldJson) {
    let res = {};
    if (typeof condition === "object") {
      // 支持事务和指定db对象
      res = await this.dao.findById({
        ...condition,
        dbName: this.tableName,
      });
    } else {
      // 不支持事务
      res = await this.dao.findById({
        dbName: this.tableName,
        id: condition,
        fieldJson
      });
    }
    return res;
  }

  /**
   * 查 - 根据whereJson获取单条记录
   * @param {Object} condition - 条件对象或包含db、whereJson、fieldJson的对象
   * @param {Object} [fieldJson] - 字段显示规则
   * @returns {Promise<Object>} 查询结果
   * @example
   * // 简易版
   * let info = await this.findByWhereJson({ status: 1 });
   * // 完整版（支持事务）
   * let info = await this.findByWhereJson({
   *   db, // 指定db对象
   *   whereJson: { status: 1 },
   *   fieldJson: { name: 1 }
   * });
   */
  async findByWhereJson(condition, fieldJson) {
    let res = {};
    if (condition && typeof condition.whereJson === "object") {
      // 支持指定db对象
      res = await this.dao.findByWhereJson({
        ...condition,
        dbName: this.tableName
      });
    } else {
      res = await this.dao.findByWhereJson({
        dbName: this.tableName,
        whereJson: condition,
        fieldJson
      });
    }
    return res;
  }

  /**
   * 增 - 添加一条记录
   * @param {Object} condition - 添加的数据或包含db、dataJson的对象
   * @param {Object} [db] - 指定数据库实例
   * @returns {Promise<Object>} 添加结果
   * @example
   * // 简易版
   * await this.add({ name: 'test' });
   * // 简易版（支持事务）
   * await this.add({ name: 'test' }, db);
   * // 完整版（支持事务）
   * await this.add({
   *   db, // 指定db对象
   *   dataJson: { name: 'test' }
   * });
   */
  async add(condition, db) {
    let res = {};
    if (condition && condition.dataJson) {
      // 支持事务
      res = await this.dao.add({
        ...condition,
        dbName: this.tableName,
      });
    } else {
      // 支持事务
      res = await this.dao.add({
        db,
        dbName: this.tableName,
        dataJson: condition
      });
    }
    return res;
  }

  /**
   * 增 - 添加多条记录
   * @param {Object|Array} condition - 添加的数据数组或包含db、dataJson的对象
   * @param {Object} [db] - 指定数据库实例
   * @returns {Promise<Object>} 添加结果
   * @example
   * // 简易版
   * await this.adds([{ name: 'test1' }, { name: 'test2' }]);
   * // 完整版（支持事务）
   * await this.adds({
   *   db, // 指定db对象
   *   dataJson: [{ name: 'test1' }, { name: 'test2' }]
   * });
   */
  async adds(condition, db) {
    let res = {};
    if (condition && condition.dataJson) {
      res = await this.dao.adds({
        ...condition,
        dbName: this.tableName,
      });
    } else {
      res = await this.dao.adds({
        db,
        dbName: this.tableName,
        dataJson: condition
      });
    }
    return res;
  }

  /**
   * 删 - 删除多条记录
   * @param {Object} whereJson - 删除条件
   * @param {Object} [db] - 指定数据库实例
   * @returns {Promise<Object>} 删除结果
   * @example
   * // 简易版
   * await this.del({ status: 0 });
   * // 支持事务
   * await this.del(whereJson, db);
   */
  async del(whereJson, db) {
    let res = {};
    res = await this.dao.del({
      db,
      dbName: this.tableName,
      whereJson
    });
    return res;
  }

  /**
   * 删 - 根据ID删除单条数据
   * @param {String} _id - 记录ID
   * @param {Object} [db] - 指定数据库实例
   * @returns {Promise<Object>} 删除结果
   * @example
   * // 简易版
   * await this.deleteById(_id);
   * // 支持事务
   * await this.deleteById(_id, db);
   */
  async deleteById(_id, db) {
    let res = {};
    res = await this.dao.deleteById({
      db,
      dbName: this.tableName,
      id: _id
    });
    return res;
  }

  /**
   * 改 - 批量修改
   * @param {Object} obj - 包含whereJson、dataJson、db的对象
   * @param {Object} obj.whereJson - 修改条件
   * @param {Object} obj.dataJson - 修改的数据
   * @param {Object} [obj.db] - 指定数据库实例
   * @returns {Promise<Object>} 修改结果
   * @example
   * await this.update({
   *   whereJson: { status: 0 },
   *   dataJson: { status: 1 }
   * });
   */
  async update(obj = {}) {
    let res = {};
    res = await this.dao.update({
      ...obj,
      dbName: this.tableName,
    });
    return res;
  }

  /**
   * 改 - 根据ID修改数据
   * @param {Object} obj - 包含id、dataJson、db的对象
   * @param {String} obj.id - 记录ID
   * @param {Object} obj.dataJson - 修改的数据
   * @param {Object} [obj.db] - 指定数据库实例
   * @returns {Promise<Object>} 修改结果
   * @example
   * await this.updateById({
   *   id: _id,
   *   dataJson: { name: 'new name' }
   * });
   */
  async updateById(obj = {}) {
    let res = {};
    res = await this.dao.updateById({
      ...obj,
      dbName: this.tableName
    });
    return res;
  }

  /**
   * 改 - 更新并返回更新后的数据
   * 无论条件匹配到多少条记录，只会修改第一条记录，同时返回修改后的数据
   * @param {Object} obj - 包含whereJson、dataJson、db的对象
   * @param {Object} obj.whereJson - 修改条件
   * @param {Object} obj.dataJson - 修改的数据
   * @param {Object} [obj.db] - 指定数据库实例
   * @returns {Promise<Object>} 修改后的数据
   * @example
   * await this.updateAndReturn({
   *   whereJson: { status: 0 },
   *   dataJson: { status: 1 }
   * });
   */
  async updateAndReturn(obj = {}) {
    let res = {};
    res = await this.dao.updateAndReturn({
      ...obj,
      dbName: this.tableName
    });
    return res;
  }

  /**
   * 根据ID判断存在则修改，不存在则添加
   * @param {Object} obj - 包含id、dataJson、db的对象
   * @param {String} [obj.id] - 记录ID，如果传了id参数，则会与dataJson中的_id判断是否一致，不一致会报错
   * @param {Object} obj.dataJson - 修改的数据
   * @param {Object} [obj.db] - 指定数据库实例
   * @returns {Promise<Object>} 操作结果
   * @example
   * await this.setById({
   *   dataJson: { _id: 'xxx', name: 'test' }
   * });
   */
  async setById(obj = {}) {
    let res = {};
    res = await this.dao.setById({
      ...obj,
      dbName: this.tableName
    });
    return res;
  }

  /**
   * 查 - 获取记录总条数
   * @param {Object} whereJson - 查询条件
   * @param {Object} [db] - 指定数据库实例
   * @returns {Promise<Number>} 记录总数
   * @example
   * // 简易版
   * let count = await this.count({ status: 1 });
   * // 支持事务
   * let count = await this.count(whereJson, db);
   * // 先分组再count
   * let count = await this.count({
   *   whereJson: {},
   *   groupJson: {}
   * });
   */
  async count(condition, db) {
    let res = {};
    if (condition && condition.whereJson && (condition.groupJson || condition.db)) {
      res = await this.dao.count({
        db,
        ...condition,
        dbName: this.tableName,
      });
    } else {
      res = await this.dao.count({
        db,
        dbName: this.tableName,
        whereJson: condition
      });
    }
    return res;
  }

  /**
   * 查 - 求和
   * @param {Object} obj - 包含fieldName、whereJson、db的对象
   * @param {String} obj.fieldName - 需要求和的字段名
   * @param {Object} [obj.whereJson] - 筛选条件
   * @param {Object} [obj.db] - 指定数据库实例
   * @returns {Promise<Number>} 求和结果
   * @example
   * let sum = await this.sum({
   *   fieldName: "amount",
   *   whereJson: { status: 1 }
   * });
   */
  async sum(obj) {
    let res = {};
    res = await this.dao.sum({
      ...obj,
      dbName: this.tableName,
    });
    return res;
  }

  /**
   * 查 - 求最大值
   * @param {Object} obj - 包含fieldName、whereJson、db的对象
   * @param {String} obj.fieldName - 需要求最大值的字段名
   * @param {Object} [obj.whereJson] - 筛选条件
   * @param {Object} [obj.db] - 指定数据库实例
   * @returns {Promise<Number>} 最大值
   * @example
   * let max = await this.max({
   *   fieldName: "price",
   *   whereJson: { status: 1 }
   * });
   */
  async max(obj) {
    let res = {};
    res = await this.dao.max({
      ...obj,
      dbName: this.tableName,
    });
    return res;
  }

  /**
   * 查 - 求最小值
   * @param {Object} obj - 包含fieldName、whereJson、db的对象
   * @param {String} obj.fieldName - 需要求最小值的字段名
   * @param {Object} [obj.whereJson] - 筛选条件
   * @param {Object} [obj.db] - 指定数据库实例
   * @returns {Promise<Number>} 最小值
   * @example
   * let min = await this.min({
   *   fieldName: "price",
   *   whereJson: { status: 1 }
   * });
   */
  async min(obj) {
    let res = {};
    res = await this.dao.min({
      ...obj,
      dbName: this.tableName,
    });
    return res;
  }

  /**
   * 查 - 求平均值
   * @param {Object} obj - 包含fieldName、whereJson、db的对象
   * @param {String} obj.fieldName - 需要求平均值的字段名
   * @param {Object} [obj.whereJson] - 筛选条件
   * @param {Object} [obj.db] - 指定数据库实例
   * @returns {Promise<Number>} 平均值
   * @example
   * let avg = await this.avg({
   *   fieldName: "score",
   *   whereJson: { status: 1 }
   * });
   */
  async avg(obj) {
    let res = {};
    res = await this.dao.avg({
      ...obj,
      dbName: this.tableName,
    });
    return res;
  }

  /**
   * 查 - 获取数据列表
   * @param {Object} obj - 查询参数对象
   * @param {Number} [obj.pageIndex=1] - 第几页，默认 1
   * @param {Number} [obj.pageSize=10] - 每页显示数量，默认 10
   * @param {Boolean} [obj.getCount=false] - 是否返回满足条件的记录总数，默认 false
   * @param {Boolean} [obj.hasMore=false] - 是否返回精确的是否还有下一页，默认 false（若已设置 getCount 为 true，则无需设置此参数）
   * @param {Boolean} [obj.getMain=false] - 是否只返回rows数组，默认 false
   * @param {Boolean} [obj.getOne=false] - 是否只返回第一条数据，默认 false
   * @param {Object} [obj.whereJson] - where 条件
   * @param {Object} [obj.fieldJson] - 字段显示规则（用来控制只显示哪些字段或不显示哪些字段）
   * @param {Array} [obj.sortArr] - 排序规则
   * @param {Object} [obj.db] - 指定数据库实例
   * @param {Boolean} [obj.debug=false] - 是否返回调试需要的参数，目前设置为true会返回数据库执行耗时，默认 false
   * @returns {Promise<Object>} 查询结果
   * @returns {Number} returns.code - 状态码，0为成功，非0为失败
   * @returns {String} returns.msg - 错误信息
   * @returns {Array} returns.rows - 数据列表，没有数据时返回空数组
   * @returns {Number} returns.total - 满足条件的记录总数（如果getCount为false，则 total = (pageIndex - 1) * pageSize + rows.length）
   * @returns {Boolean} returns.hasMore - 分页参数，true 还有下一页 false 没有下一页
   * @returns {Object} returns.pagination - 当前分页参数 { pageIndex, pageSize }
   * @returns {Boolean} returns.getCount - 是否有执行过getCount，true：有，false：无
   * @example
   * let res = await this.select({
   *   pageIndex: 1,
   *   pageSize: 20,
   *   getCount: true,
   *   hasMore: true,
   *   whereJson: { status: 1 },
   *   fieldJson: { name: 1, age: 1 },
   *   sortArr: [{ "name": "_id", "type": "desc" }]
   * });
   * // res.rows: 数据列表
   * // res.total: 总记录数
   * // res.hasMore: 是否还有下一页
   * // res.pagination: { pageIndex: 1, pageSize: 20 }
   */
  async select(obj = {}) {
    let res = {};
    res = await this.dao.select({
      ...obj,
      dbName: this.tableName
    });
    return res;
  }

  /**
   * 查 - 获取数据列表（支持联表查询）
   * @param {Object} obj - 查询参数对象
   * @param {Object} [obj.whereJson] - 主表 where 条件
   * @param {Number} [obj.pageIndex=1] - 第几页，默认 1
   * @param {Number} [obj.pageSize=10] - 每页显示数量，默认 10
   * @param {Boolean} [obj.getOne=false] - 是否只返回第一条数据，默认 false
   * @param {Boolean} [obj.getMain=false] - 是否只返回rows数组，默认 false
   * @param {Boolean} [obj.getCount=false] - 是否返回满足条件的记录总数，默认 false
   * @param {Boolean} [obj.hasMore=false] - 是否返回精确的是否还有下一页，默认 false（若已设置 getCount 为 true，则无需设置此参数）
   * @param {Object} [obj.groupJson] - 主表分组规则（副表不支持分组）
   * @param {Array} [obj.sortArr] - 主表排序规则
   * @param {Array<Object>} [obj.foreignDB] - 连表规则数组
   * @param {String} obj.foreignDB[].dbName - 副表表名
   * @param {String} obj.foreignDB[].localKey - 主表外键名
   * @param {String} obj.foreignDB[].foreignKey - 副表外键名
   * @param {String} obj.foreignDB[].as - 副表连表结果的别名
   * @param {String} [obj.foreignDB[].localKeyType] - 主表外键类型，可选值：array（代表主表外键是数组类型）
   * @param {String} [obj.foreignDB[].foreignKeyType] - 副表外键类型，可选值：array（代表副表外键是数组类型）
   * @param {String} [obj.foreignDB[].localKeyIndex] - 当 localKeyType 为 array 时有效，输出副表记录在主表外键数组字段中索引的字段名
   * @param {Object} [obj.foreignDB[].whereJson] - 副表 where 条件
   * @param {Array} [obj.foreignDB[].sortArr] - 副表排序规则
   * @param {Number} [obj.foreignDB[].limit] - 副表限制取多少条数据，当 limit = 1 时以对象形式返回，否则以数组形式返回
   * @param {Array<Object>} [obj.foreignDB[].foreignDB] - 副表的连表规则（支持多级嵌套，最多15层）
   * @param {Object} [obj.foreignDB[].addFields] - 副表添加自定义字段规则
   * @param {Object} [obj.foreignDB[].fieldJson] - 副表字段显示规则
   * @param {Object} [obj.lastWhereJson] - 连表后的查询条件，有性能问题，慎用
   * @param {Array} [obj.lastSortArr] - 连表后的排序条件，有性能问题，慎用
   * @param {Object} [obj.addFields] - 添加自定义字段规则（用来添加虚拟字段）
   * @param {Object} [obj.fieldJson] - 字段显示规则（用来控制只显示哪些字段或不显示哪些字段）
   * @param {Object} [obj.db] - 指定数据库实例
   * @param {Boolean} [obj.debug=false] - 是否返回调试需要的参数，目前设置为true会返回数据库执行耗时，默认 false
   * @returns {Promise<Object>} 查询结果
   * @returns {Array} returns.rows - 数据列表，没有数据时返回空数组
   * @returns {Number} returns.total - 满足条件的记录总数（如果getCount为false，则 total = (pageIndex - 1) * pageSize + rows.length）
   * @returns {Boolean} returns.hasMore - 分页参数，true 还有下一页 false 没有下一页
   * @returns {Object} returns.pagination - 当前分页参数 { pageIndex, pageSize }
   * @returns {Boolean} returns.getCount - 是否有执行过getCount，true：有，false：无
   * @example
   * let res = await this.selects({
   *   pageIndex: 1,
   *   pageSize: 20,
   *   getCount: true,
   *   whereJson: { status: 1 },
   *   fieldJson: { name: 1 },
   *   sortArr: [{ "name": "_id", "type": "desc" }],
   *   foreignDB: [{
   *     dbName: "副表表名",
   *     localKey: "主表外键名",
   *     foreignKey: "副表外键名",
   *     as: "副表as字段",
   *     limit: 1,
   *     whereJson: { deleted: false },
   *     fieldJson: { name: 1, age: 1 }
   *   }]
   * });
   */
  async selects(obj = {}) {
    let res = {};
    res = await this.dao.selects({
      ...obj,
      dbName: this.tableName
    });
    return res;
  }

  /**
   * 查 - 获取表格数据（参数与selects一致，默认 getCount 为 true）
   * @param {Object} obj - 查询参数对象
   * @param {Object} obj.data - 表格查询参数（vk-admin万能表格传过来的数据）
   * @param {Object} [obj.whereJson] - 主表 where 条件
   * @param {Number} [obj.pageIndex=1] - 第几页，默认 1
   * @param {Number} [obj.pageSize=10] - 每页显示数量，默认 10
   * @param {Boolean} [obj.getOne=false] - 是否只返回第一条数据，默认 false
   * @param {Boolean} [obj.getMain=false] - 是否只返回rows数组，默认 false
   * @param {Boolean} [obj.getCount=true] - 是否返回满足条件的记录总数，默认 true
   * @param {Boolean} [obj.hasMore=false] - 是否返回精确的是否还有下一页，默认 false
   * @param {Object} [obj.groupJson] - 主表分组规则（副表不支持分组）
   * @param {Array} [obj.sortArr] - 主表排序规则
   * @param {Array<Object>} [obj.foreignDB] - 连表规则数组
   * @param {String} obj.foreignDB[].dbName - 副表表名
   * @param {String} obj.foreignDB[].localKey - 主表外键名
   * @param {String} obj.foreignDB[].foreignKey - 副表外键名
   * @param {String} obj.foreignDB[].as - 副表连表结果的别名
   * @param {String} [obj.foreignDB[].localKeyType] - 主表外键类型，可选值：array（代表主表外键是数组类型）
   * @param {String} [obj.foreignDB[].foreignKeyType] - 副表外键类型，可选值：array（代表副表外键是数组类型）
   * @param {String} [obj.foreignDB[].localKeyIndex] - 当 localKeyType 为 array 时有效，输出副表记录在主表外键数组字段中索引的字段名
   * @param {Object} [obj.foreignDB[].whereJson] - 副表 where 条件
   * @param {Array} [obj.foreignDB[].sortArr] - 副表排序规则
   * @param {Number} [obj.foreignDB[].limit] - 副表限制取多少条数据，当 limit = 1 时以对象形式返回，否则以数组形式返回
   * @param {Array<Object>} [obj.foreignDB[].foreignDB] - 副表的连表规则（支持多级嵌套，最多15层）
   * @param {Object} [obj.foreignDB[].addFields] - 副表添加自定义字段规则
   * @param {Object} [obj.foreignDB[].fieldJson] - 副表字段显示规则
   * @param {Object} [obj.lastWhereJson] - 连表后的查询条件，有性能问题，慎用
   * @param {Array} [obj.lastSortArr] - 连表后的排序条件，有性能问题，慎用
   * @param {Object} [obj.addFields] - 添加自定义字段规则
   * @param {Object} [obj.fieldJson] - 字段显示规则
   * @param {Object} [obj.db] - 指定数据库实例
   * @param {Boolean} [obj.debug=false] - 是否返回调试需要的参数，默认 false
   * @returns {Promise<Object>} 查询结果
   * @returns {Array} returns.rows - 数据列表，没有数据时返回空数组
   * @returns {Number} returns.total - 满足条件的记录总数
   * @returns {Boolean} returns.hasMore - 分页参数，true 还有下一页 false 没有下一页
   * @returns {Object} returns.pagination - 当前分页参数 { pageIndex, pageSize }
   * @returns {Boolean} returns.getCount - 是否有执行过getCount
   * @example
   * let res = await this.getTableData({
   *   data
   * });
   */
  async getTableData(obj = {}) {
    let res = {};
    res = await this.dao.getTableData({
      ...obj,
      dbName: this.tableName
    });
    return res;
  }

}

module.exports = {
  BaseDao,
  Tables
};
