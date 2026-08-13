// cloudfunctions/admin/bpmn/condition-rule/pub/evaluate.js
/**
 * 条件规则评估模块 - 公共复用 (支持表达式)
 */

async function evaluateConditionRule(conditionRuleCode, formData, calculatedValues, db) {
    if (!conditionRuleCode) return true;

    try {
        const ruleRes = await db.collection('bpmn-condition-rule')
            .where({ code: conditionRuleCode, status: 'active' })
            .get();

        if (!ruleRes.data || ruleRes.data.length === 0) {
            console.warn('条件规则不存在:', conditionRuleCode);
            return false;
        }

        const rule = ruleRes.data[0];
        return await evaluateRuleExpression(rule.rule_expression, formData, calculatedValues);
    } catch (error) {
        console.error('评估条件规则失败:', error);
        return false;
    }
}

async function evaluateRuleExpression(ruleExpression, formData, calculatedValues) {
    if (!ruleExpression) return true;

    const { type, conditions, logic } = ruleExpression;
    if (!conditions || conditions.length === 0) return true;

    // 评估每个条件
    const results = await Promise.all(conditions.map(async (condition) => {
        const { field, operator, value, value_type } = condition;
        let actualValue = getValueFromData(field, formData, calculatedValues);
        let compareValue = value;

        if (value_type === 'variable') {
            compareValue = getValueFromData(value, formData, calculatedValues);
        } else if (value_type === 'expression') {
            compareValue = await evaluateExpressionValue(value, formData, calculatedValues);
        }

        return compareValues(actualValue, operator, compareValue);
    }));

    return logic === 'or' ? results.some(r => r) : results.every(r => r);
}

/**
 * 安全执行表达式 (value_type = 'expression')
 */
async function evaluateExpressionValue(expression, formData, calculatedValues) {
    if (!expression || typeof expression !== 'string') return undefined;

    try {
        const context = { ...formData, ...calculatedValues };
        // 使用 Function 构造器创建沙箱，只允许访问上下文变量
        const func = new Function(...Object.keys(context), `"use strict"; return (${expression});`);
        const result = func(...Object.values(context));
        console.log('表达式执行成功:', expression, '结果:', result);
        return result;
    } catch (error) {
        console.error('表达式执行失败:', expression, error);
        return undefined;
    }
}

function getValueFromData(field, formData, calculatedValues) {
    if (!field) return undefined;
    const fields = field.split('.');
    let value = { ...formData, ...calculatedValues };
    for (const f of fields) {
        if (value && typeof value === 'object' && f in value) {
            value = value[f];
        } else {
            return undefined;
        }
    }
    return value;
}

function compareValues(actualValue, operator, compareValue) {
    if (actualValue === undefined || actualValue === null) return false;

    switch (operator) {
        case 'eq': return actualValue == compareValue;
        case 'ne': return actualValue != compareValue;
        case 'gt': return Number(actualValue) > Number(compareValue);
        case 'gte': return Number(actualValue) >= Number(compareValue);
        case 'lt': return Number(actualValue) < Number(compareValue);
        case 'lte': return Number(actualValue) <= Number(compareValue);
        case 'in': return Array.isArray(compareValue) ? compareValue.includes(actualValue) : false;
        case 'not_in': return Array.isArray(compareValue) ? !compareValue.includes(actualValue) : true;
        case 'contains': return String(actualValue).includes(String(compareValue));
        case 'regex':
            try {
                const regex = new RegExp(compareValue);
                return regex.test(String(actualValue));
            } catch { return false; }
        default:
            console.warn('未知的操作符:', operator);
            return false;
    }
}

module.exports = { evaluateConditionRule, evaluateRuleExpression, getValueFromData, compareValues };