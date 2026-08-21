module.exports = {
    main: async (event) => {
        let { data = {}, userInfo, util, filterResponse, originalParam } = event;
        let { customUtil, uniID, config, pubFun, vk, db, _ } = util;
        let { uid, items = [] } = data;
        let res = { code: 0, msg: '', items: [], errors: [] };

        const formatDate = (serial) => {
            let utcDate = new Date(Date.UTC(1900, 0, serial - 1));
            return utcDate.toISOString().slice(0, 10);
        };

        // 转换单个员工数据的函数（保持不变）
        const convertItem = async (item) => {
            // point_id: 分点代码
            let dbName = "hrm-point";
            let resPoint = await vk.baseDao.selects({
                dbName,
                data,
                getOne: true,
                whereJson: { point_name: new RegExp(item.point_id) }
            });
            if (!resPoint.rows) throw new Error(`分点不存在：${item.point_id}`);
            item.point_id = resPoint.rows.point_id;

            // bank_id: 银行代码
            if (vk.pubfn.isNotNull(item.bank_id)) {
                dbName = "hrm-bank";
                let resBank = await vk.baseDao.selects({
                    dbName,
                    data,
                    getOne: true,
                    whereJson: { bank_name: new RegExp(item.bank_id) }
                });
                if (!resBank.rows) throw new Error(`银行不存在：${item.bank_id}`);
                item.bank_id = resBank.rows.bank_id;

                // location_id: 开户地代码
                dbName = "hrm-banklocation";
                let resLocation = await vk.baseDao.selects({
                    dbName,
                    data,
                    getOne: true,
                    whereJson: { location_name: new RegExp(item.location_id) }
                });
                if (!resLocation.rows) throw new Error(`开户地不存在：${item.location_id}`);
                item.location_id = resLocation.rows.location_id;
            }

            // nation_id: 民族代码
            dbName = "opendb-nation-china";
            let resNation = await vk.baseDao.selects({
                dbName,
                data,
                getOne: true,
                whereJson: { name: new RegExp(item.nation_id) }
            });
            if (!resNation.rows) throw new Error(`民族不存在：${item.nation_id}`);
            item.nation_id = resNation.rows._id;

            // department_id: 所属部门代码
            dbName = "hrm-departments";
            let resDepartment = await vk.baseDao.selects({
                dbName,
                data,
                getOne: true,
                whereJson: { department_name: new RegExp(item.department_id) }
            });
            if (!resDepartment.rows) throw new Error(`部门不存在：${item.department_id}`);
            item.department_id = resDepartment.rows.department_id;

            // company_id: 所属公司代码
            dbName = "hrm-companys";
            let resCompany = await vk.baseDao.selects({
                dbName,
                data,
                getOne: true,
                whereJson: { company_name: new RegExp(item.company_id) }
            });
            if (!resCompany.rows) throw new Error(`公司不存在：${item.company_id}`);
            item.company_id = resCompany.rows.company_id;

            // position_id: 职位代码
            dbName = "hrm-positions";
            let resPosition = await vk.baseDao.selects({
                dbName,
                data,
                getOne: true,
                whereJson: { position_name: item.position_id }
            });
            if (!resPosition.rows) throw new Error(`职位不存在：${item.position_id}`);
            item.position_id = resPosition.rows.position_id;

            // educational_id: 学历代码
            dbName = "hrm-educational";
            let resEducational = await vk.baseDao.selects({
                dbName,
                data,
                getOne: true,
                whereJson: { educational_name: new RegExp(item.educational_id) }
            });
            if (!resEducational.rows) throw new Error(`学历不存在：${item.educational_id}`);
            item.educational_id = resEducational.rows.educational_id;

            // insurance_id: 保险代码
            dbName = "hrm-insurance";
            let resInsurance = await vk.baseDao.selects({
                dbName,
                data,
                getOne: true,
                whereJson: { insurance_name: new RegExp(item.insurance_id) }
            });
            if (!resInsurance.rows) throw new Error(`保险不存在：${item.insurance_id}`);
            item.insurance_id = resInsurance.rows.insurance_id;

            // contract_id: 合同是否签定代码
            dbName = "hrm-contract";
            let resContract = await vk.baseDao.selects({
                dbName,
                data,
                getOne: true,
                whereJson: { contract_name: new RegExp(item.contract_id) }
            });
            if (!resContract.rows) throw new Error(`合同状态不存在：${item.contract_id}`);
            item.contract_id = resContract.rows.contract_id;

            // 处理常量
            item.gender = item.gender == '男' ? 1 : 2;
            item.stay = item.stay == '是' ? 1 : 2;
            item.registration = item.registration == '是' ? 1 : 2;
            item.marital_status = item.marital_status == '已婚' ? 1 : 2;
            item.no_crime = item.no_crime == '有' ? 1 : 2;

            if (item.rest_type == '大小周') {
                item.rest_type = 3;
            } else if (item.rest_type == '双休') {
                item.rest_type = 2;
            } else if (item.rest_type == '单休') {
                item.rest_type = 1;
            } else {
                item.rest_type = '';
            }

            if (item.hire_date) item.hire_date = formatDate(item.hire_date);
            if (item.resign_date) item.resign_date = formatDate(item.resign_date);
            if (item.birth_date) item.birth_date = formatDate(item.birth_date);
            if (item.contract_date) item.contract_date = formatDate(item.contract_date);

            item.status = item.status == '在职' ? 1 : 2;

            return item;
        };

        // 使用 Promise.all 并发处理所有 items
        const convertPromises = items.map(async (item) => {
            try {
                const convertedItem = await convertItem(item);
                return { success: true, item: convertedItem };
            } catch (err) {
                return { success: false, item, error: err.message || err.stack };
            }
        });

        const results = await Promise.all(convertPromises);

        // 分离成功与失败
        results.forEach(result => {
            if (result.success) {
                res.items.push(result.item);
            } else {
                res.errors.push({
                    item: result.item,
                    error: result.error
                });
            }
        });

        // 设置状态码
        if (res.items.length === 0 && res.errors.length > 0) {
            res.code = -1;
            res.msg = '所有数据转换失败';
        } else if (res.errors.length > 0) {
            res.msg = `部分数据转换失败：${res.errors.length} 条`;
        }

        return res;
    }
};