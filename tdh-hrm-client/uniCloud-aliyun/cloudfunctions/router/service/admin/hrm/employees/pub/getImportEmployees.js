module.exports = {
    main: async (event) => {
        let { data = {}, util } = event;
        let { vk } = util;
        let { items = [] } = data;

        const res = { code: 0, msg: '', items: [], errors: [] };
        if (!items.length) return res;

        /* ==================== 1. 缓存层 ==================== */
        const cache = new Map();
        const cachedQuery = async (dbName, whereJson, errorMsg) => {
            // 生成稳定缓存 key（兼容 RegExp）
            const keyParts = [dbName];
            for (const [k, v] of Object.entries(whereJson)) {
                keyParts.push(`${k}=${v instanceof RegExp ? v.source : v}`);
            }
            const cacheKey = keyParts.join('::');
            if (cache.has(cacheKey)) return cache.get(cacheKey);

            const result = await vk.baseDao.selects({ dbName, data, getOne: true, whereJson });
            if (!result.rows) throw new Error(errorMsg);
            cache.set(cacheKey, result.rows);
            return result.rows;
        };

        /* ==================== 2. 工具函数 ==================== */
        const formatDate = (serial) => {
            const utcDate = new Date(Date.UTC(1900, 0, serial - 1));
            return utcDate.toISOString().slice(0, 10);
        };

        const MAPS = {
            gender: { '男': 1, '女': 2 },
            yesNo: { '是': 1, '否': 2 },
            crime: { '有': 1, '无': 2 },
            rest: { '大小周': 3, '双休': 2, '单休': 1 },
            status: { '在职': 1, '离职': 2 }
        };

        /* ==================== 3. 单条转换 ==================== */
        const convertItem = async (raw) => {
            const item = { ...raw }; // 不污染原数据

            // 3.1 并发查询 8 个独立字典（有缓存秒回）
            const [point, nation, dept, company, position, edu, insurance, contract] = await Promise.all([
                cachedQuery('hrm-point', { point_name: new RegExp(item.point_id) }, `分点不存在：${item.point_id}`),
                cachedQuery('opendb-nation-china', { name: new RegExp(item.nation_id) }, `民族不存在：${item.nation_id}`),
                cachedQuery('hrm-departments', { department_name: new RegExp(item.department_id) }, `部门不存在：${item.department_id}`),
                cachedQuery('hrm-companys', { company_name: new RegExp(item.company_id) }, `公司不存在：${item.company_id}`),
                cachedQuery('hrm-positions', { position_name: item.position_id }, `职位不存在：${item.position_id}`),
                cachedQuery('hrm-educational', { educational_name: new RegExp(item.educational_id) }, `学历不存在：${item.educational_id}`),
                cachedQuery('hrm-insurance', { insurance_name: new RegExp(item.insurance_id) }, `保险不存在：${item.insurance_id}`),
                cachedQuery('hrm-contract', { contract_name: new RegExp(item.contract_id) }, `合同状态不存在：${item.contract_id}`)
            ]);

            item.point_id = point.point_id;
            item.nation_id = nation._id;
            item.department_id = dept.department_id;
            item.company_id = company.company_id;
            item.position_id = position.position_id;
            item.educational_id = edu.educational_id;
            item.insurance_id = insurance.insurance_id;
            item.contract_id = contract.contract_id;

            // 3.2 有条件并发：bank + location
            if (vk.pubfn.isNotNull(item.bank_id)) {
                const [bank, location] = await Promise.all([
                    cachedQuery('hrm-bank', { bank_name: new RegExp(item.bank_id) }, `银行不存在：${item.bank_id}`),
                    cachedQuery('hrm-banklocation', { location_name: new RegExp(item.location_id) }, `开户地不存在：${item.location_id}`)
                ]);
                item.bank_id = bank.bank_id;
                item.location_id = location.location_id;
            }

            // 3.3 常量映射（纯内存，零 IO）
            item.gender = MAPS.gender[item.gender] || 2;
            item.stay = MAPS.yesNo[item.stay] || 2;
            item.registration = MAPS.yesNo[item.registration] || 2;
            item.marital_status = item.marital_status === '已婚' ? 1 : 2;
            item.no_crime = MAPS.crime[item.no_crime] || 2;
            item.rest_type = MAPS.rest[item.rest_type] ?? '';
            item.status = MAPS.status[item.status] || 2;

            // 3.4 日期转换
            for (const key of ['hire_date', 'resign_date', 'birth_date', 'contract_date']) {
                if (item[key]) item[key] = formatDate(item[key]);
            }

            return item;
        };

        /* ==================== 4. 批量处理（限流防压垮 DB） ==================== */
        const CONCURRENCY = 5; // 同时处理 5 条，可根据 DB 压力调整

        for (let i = 0; i < items.length; i += CONCURRENCY) {
            const batch = items.slice(i, i + CONCURRENCY);
            const batchResults = await Promise.allSettled(batch.map(convertItem));

            batchResults.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                    res.items.push(result.value);
                } else {
                    res.errors.push({
                        item: batch[idx],
                        error: result.reason?.message || String(result.reason)
                    });
                }
            });
        }

        /* ==================== 5. 返回状态 ==================== */
        const total = items.length;
        const ok = res.items.length;
        const fail = res.errors.length;

        if (ok === 0 && fail > 0) {
            res.code = -1;
            res.msg = `全部失败，共 ${fail} 条`;
        } else if (fail > 0) {
            res.msg = `成功 ${ok} 条，失败 ${fail} 条`;
        } else {
            res.msg = `成功 ${ok} 条`;
        }

        return res;
    }
};