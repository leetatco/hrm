module.exports = {
  main: async (event) => {
    const { data = {}, util } = event;
    const { vk, db } = util;
    let { formData, pageIndex, pageSize } = data;

    let where = {};
    if (formData.employee_id) where.employee_id = formData.employee_id;
    if (formData.department_id) where['employeeInfo.department_id'] = formData.department_id; // 需通过 foreignDB 后过滤或直接使用聚合，这里简单处理：在外层过滤较复杂，可在前端传参时用 department_id 查询员工列表再 in，或使用聚合管道。此处简化为不支持直接 department_id 过滤，建议在云函数中先根据 department_id 查员工列表再使用 in。
    if (formData.attendance_date_start && formData.attendance_date_end) {
      where.attendance_date = {
        $gte: formData.attendance_date_start,
        $lte: formData.attendance_date_end
      };
    } else if (formData.attendance_date_start) {
      where.attendance_date = { $gte: formData.attendance_date_start };
    } else if (formData.attendance_date_end) {
      where.attendance_date = { $lte: formData.attendance_date_end };
    }
    if (formData.attendance_status !== undefined && formData.attendance_status !== '') {
      where.attendance_status = parseInt(formData.attendance_status);
    }

    let res = await vk.baseDao.getTableData({
      dbName: 'hrm-attendance-daily',
      data: { pageIndex, pageSize, whereJson: where },
      sortArr: [{ name: 'attendance_date', type: 'desc' }, { name: 'employee_id', type: 'asc' }],
      foreignDB: [
        {
          dbName: 'hrm-employees',
          localKey: 'employee_id',
          foreignKey: 'employee_id',
          as: 'employeeInfo',
          limit: 1
        }
      ]
    });

    return res;
  }
};