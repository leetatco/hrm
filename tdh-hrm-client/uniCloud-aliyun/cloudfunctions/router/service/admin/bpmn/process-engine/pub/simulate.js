// cloudfunctions/admin/bpmn/process-engine/sys/simulate.js
const HrmService = require('../../../../common/pub/class/hrm-service.js');
const {
	evaluateConditionRule,
	getValueFromData
} = require('../../condition-rule/pub/evaluate');

module.exports = {
	/**
	 * 流程试算 - 模拟流程走向
	 * @url admin/bpmn/process-engine/sys/simulate 前端调用的url参数地址
	 */
	main: async (event) => {
		let {
			data = {}, util, filterResponse, originalParam
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
			uid
		} = data;
		let res = {
			code: 0,
			msg: ''
		};

		const {
			form_type_code,
			form_data,
			calculated_values,
			process_definition_key,
			userInfo
		} = data;

		if (!form_type_code) {
			return {
				code: -1,
				msg: '表单类型编码不能为空'
			};
		}

		try {
			// 加入申请人详细个人信息
			const hrmService = new HrmService(vk, db);
			const employeeInfo = await hrmService.getEmployeeInfoByUsername(userInfo.username);
			form_data.employeeInfo = employeeInfo;

			const formType = await getFormType(form_type_code, db);
			if (!formType) {
				return {
					code: -1,
					msg: '表单类型不存在'
				};
			}

			const processDefinition = await determineProcessDefinition(
				form_type_code, form_data, calculated_values, process_definition_key, db
			);

			if (!processDefinition) {
				return {
					code: -1,
					msg: '未找到合适的流程定义'
				};
			}

			console.log('找到流程定义:', processDefinition.key, '节点数:', processDefinition.nodes.length);

			const simulationResult = await simulateProcess(
				processDefinition, form_data, calculated_values, userInfo, vk, db
			);

			res.data = {
				form_type: formType.name,
				process_definition: {
					key: processDefinition.key,
					name: processDefinition.name,
					version: processDefinition.version
				},
				...simulationResult
			};
			res.msg = '流程试算完成';
		} catch (error) {
			console.error('流程试算失败:', error);
			return {
				code: -1,
				msg: error.message || '流程试算失败'
			};
		}
		return res;
	}
};

/**
 * 获取表单类型
 */
async function getFormType(formTypeCode, db) {
	try {
		const res = await db.collection('bpmn-form-type')
			.where({
				code: formTypeCode,
				status: 'active'
			})
			.get();
		return res.data && res.data.length > 0 ? res.data[0] : null;
	} catch (error) {
		console.error('获取表单类型失败:', error);
		return null;
	}
}

/**
 * 确定流程定义
 */
async function determineProcessDefinition(formTypeCode, formData, calculatedValues, specifiedKey, db) {
	console.log("如果指定了流程定义KEY，直接使用:", specifiedKey);
	if (specifiedKey) {
		const definition = await getProcessDefinitionByKey(specifiedKey, db);
		if (definition) return definition;
	}
	return await routeToProcessDefinition(formTypeCode, formData, calculatedValues, db);
}

/**
 * 根据KEY获取流程定义
 */
async function getProcessDefinitionByKey(processKey, db) {
	try {
		const res = await db.collection('bpmn-definition')
			.where({
				key: processKey,
				status: 'active'
			})
			.orderBy('version', 'desc')
			.get();
		return res.data && res.data.length > 0 ? res.data[0] : null;
	} catch (error) {
		console.error('获取流程定义失败:', error);
		return null;
	}
}

/**
 * 路由到流程定义
 */
async function routeToProcessDefinition(formTypeCode, formData, calculatedValues, db) {
	try {
		const routeConfigRes = await db.collection('bpmn-process-route-config')
			.where({
				form_type_code: formTypeCode,
				status: 'active'
			})
			.orderBy('priority', 'asc')
			.get();

		console.log('路由配置查询结果:', routeConfigRes.data);

		if (routeConfigRes.data.length === 0) {
			const defaultProcess = await getProcessDefinitionByKey(`${formTypeCode}_DEFAULT`, db);
			return defaultProcess;
		}

		for (const config of routeConfigRes.data) {
			const matched = await evaluateConditionRule(config.condition_rule_code, formData, calculatedValues, db);
			console.log(`条件规则 ${config.condition_rule_code} 评估结果:`, matched);
			if (matched) {
				const processDefinition = await getProcessDefinitionByKey(config.process_definition_key, db);
				if (processDefinition) return processDefinition;
			}
		}

		const fallbackConfig = routeConfigRes.data.find(config => config.fallback);
		if (fallbackConfig) {
			const processDefinition = await getProcessDefinitionByKey(fallbackConfig.process_definition_key, db);
			if (processDefinition) return processDefinition;
		}
		return await getProcessDefinitionByKey(`${formTypeCode}_DEFAULT`, db);
	} catch (error) {
		console.error('流程路由失败:', error);
		return null;
	}
}

/**
 * 模拟流程执行
 */
async function simulateProcess(processDefinition, formData, calculatedValues, userInfo, vk, db) {
	const hrmService = new HrmService(vk, db);
	const employeeInfo = formData.employeeInfo;

	const simulation = {
		start_time: new Date().toISOString(),
		total_nodes: 0,
		estimated_duration: 0,
		nodes: [],
		path: [],
		variables: {
			...formData,
			...calculatedValues,
			applicant_id: employeeInfo.employee_id,
			applicant_name: employeeInfo.employee_name,
			applicant_department: employeeInfo.department_name || '',
			simulate_time: Date.now()
		}
	};

	console.log('开始模拟流程，变量:', simulation.variables);

	const startNode = processDefinition.nodes.find(node => node.node_type === 'start');
	if (!startNode) {
		throw new Error('流程定义中未找到开始节点');
	}

	console.log('找到开始节点:', startNode.node_key);

	await simulateNode(startNode, processDefinition, simulation, employeeInfo, vk, db);

	simulation.total_nodes = simulation.nodes.length;
	simulation.estimated_duration = calculateEstimatedDuration(simulation.nodes);

	console.log('模拟完成，总节点数:', simulation.total_nodes, '路径:', simulation.path);
	return simulation;
}

/**
 * 模拟节点执行 - 修复版本
 */
async function simulateNode(currentNode, processDefinition, simulation, employeeInfo, vk, db) {
	if (simulation.nodes.length > 20) {
		console.warn('流程节点过多，可能存在循环，停止模拟');
		return;
	}

	console.log(`模拟节点: ${currentNode.node_key} (${currentNode.node_name})`);

	const nodeInfo = {
		node_key: currentNode.node_key,
		node_name: currentNode.node_name,
		node_type: currentNode.node_type,
		estimated_assignee: null, // 向后兼容，保留第一个负责人
		estimated_assignees: [], // 所有可能负责人（角色/部门多选后）
		assignee_type: currentNode.assignee_type,
		assignee_value: currentNode.assignee_value,
		required_approvals: currentNode.required_approvals || 1,
		duration_estimate: currentNode.time_limit || 0,
		actions: currentNode.actions || [],
		candidate_users: currentNode.candidate_users || [],
		candidate_groups: currentNode.candidate_groups || [],
		conditions: [],
		next_node_keys: []
	};

	// 处理任务节点和通知节点
	if (currentNode.node_type === 'userTask' || currentNode.node_type === 'approval' || currentNode.node_type ===
		'review') {
		// 对于通知节点，负责人列表仍然需要解析（用于展示），但逻辑上会自动推进
		const assignees = await estimateAssignees(currentNode, simulation.variables, employeeInfo, vk, db);
		nodeInfo.estimated_assignees = assignees;
		// 第一个负责人作为旧版字段
		nodeInfo.estimated_assignee = assignees.length > 0 ? assignees[0] : null;

		// 通知节点特殊处理：试算时直接跳过，不模拟操作，直接进入下一节点
		if (currentNode.node_type === 'review') {
			console.log(`通知节点 ${currentNode.node_key}，试算自动确认并继续流转`);
			// 通知节点不评估条件，直接沿默认或无条件下一个节点流转
			const nextNodes = currentNode.next_nodes || [];
			if (nextNodes.length > 0) {
				const defaultPath = nextNodes.find(c => c.default_path);
				const nextNodeKey = defaultPath ? defaultPath.node_key : (nextNodes[0] ? nextNodes[0].node_key :
					null);
				if (nextNodeKey) {
					const nextNode = processDefinition.nodes.find(n => n.node_key === nextNodeKey);
					if (nextNode) {
						simulation.nodes.push(nodeInfo);
						simulation.path.push(currentNode.node_key);
						await simulateNode(nextNode, processDefinition, simulation, employeeInfo, vk, db);
						return;
					}
				}
			}
			// 如果没有下一节点，则结束
			nodeInfo.is_final = true;
			simulation.nodes.push(nodeInfo);
			simulation.path.push(currentNode.node_key);
			return;
		}
	}

	simulation.nodes.push(nodeInfo);
	simulation.path.push(currentNode.node_key);

	if (currentNode.node_type === 'end') {
		nodeInfo.is_final = true;
		console.log('到达结束节点，停止模拟');
		return;
	}

	const nextNodes = currentNode.next_nodes || [];
	console.log(`节点 ${currentNode.node_key} 的下一节点配置:`, nextNodes);

	if (nextNodes.length === 0) {
		console.warn('节点没有配置下一节点:', currentNode.node_key);
		return;
	}

	let nextNodeKey = null;
	const availablePaths = [];

	for (const nextConfig of nextNodes) {
		const conditionInfo = {
			target_node: nextConfig.node_key,
			condition_rule: nextConfig.condition_rule_code,
			is_default: nextConfig.default_path || false,
			matched: false
		};

		console.log(
			`评估下一节点 ${nextConfig.node_key}, 条件规则: ${nextConfig.condition_rule_code}, 默认路径: ${nextConfig.default_path}`
		);

		if (nextConfig.default_path) {
			conditionInfo.matched = true;
			availablePaths.push(nextConfig.node_key);
			console.log(`默认路径可用: ${nextConfig.node_key}`);
		} else if (nextConfig.condition_rule_code) {
			// 在试算中，假设审批操作都是同意的
			const tempVariables = {
				...simulation.variables,
				action: 'approve'
			};
			const matched = await evaluateConditionRule(nextConfig.condition_rule_code, tempVariables, {}, db);
			conditionInfo.matched = matched;
			if (matched) {
				availablePaths.push(nextConfig.node_key);
				console.log(`条件规则匹配: ${nextConfig.node_key}`);
			} else {
				console.log(`条件规则不匹配: ${nextConfig.node_key}`);
			}
		} else {
			conditionInfo.matched = true;
			availablePaths.push(nextConfig.node_key);
			console.log(`无条件路径可用: ${nextConfig.node_key}`);
		}

		nodeInfo.conditions.push(conditionInfo);
		nodeInfo.next_node_keys.push(nextConfig.node_key);
	}

	console.log(`可用路径: ${availablePaths.join(', ')}`);

	if (availablePaths.length > 0) {
		const nonDefaultPaths = nextNodes.filter(config =>
			!config.default_path && availablePaths.includes(config.node_key)
		);
		if (nonDefaultPaths.length > 0) {
			nextNodeKey = nonDefaultPaths[0].node_key;
			console.log(`选择非默认路径: ${nextNodeKey}`);
		} else {
			const defaultPath = nextNodes.find(config => config.default_path);
			if (defaultPath) {
				nextNodeKey = defaultPath.node_key;
				console.log(`使用默认路径: ${nextNodeKey}`);
			} else {
				nextNodeKey = availablePaths[0];
				console.log(`使用第一个可用路径: ${nextNodeKey}`);
			}
		}
	}

	if (!nextNodeKey) {
		console.error(`没有找到可用的下一节点: ${currentNode.node_key}, 可用路径: ${availablePaths.join(', ')}`);
		if (nextNodes.length > 0) {
			nextNodeKey = nextNodes[0].node_key;
			console.warn(`强制使用第一个配置节点继续模拟: ${nextNodeKey}`);
		} else {
			console.error('完全没有配置下一节点，停止模拟');
			return;
		}
	}

	const nextNode = processDefinition.nodes.find(node => node.node_key === nextNodeKey);
	if (!nextNode) {
		console.error('下一节点不存在:', nextNodeKey, '可用节点:', processDefinition.nodes.map(n => n.node_key));
		return;
	}

	await simulateNode(nextNode, processDefinition, simulation, employeeInfo, vk, db);
}

/**
 * 估算任务负责人列表（支持角色/部门多选，返回所有可能的负责人，已去重）
 */
async function estimateAssignees(node, variables, employeeInfo, vk, db) {
	const assigneeType = node.assignee_type;
	const assigneeValue = node.assignee_value;

	console.log('确定负责人列表，类型:', assigneeType, '值:', assigneeValue);

	let assignees = [];

	let values = [];
	if (Array.isArray(assigneeValue)) {
		values = assigneeValue;
	} else if (assigneeValue) {
		values = [assigneeValue];
	}

	try {
		for (const val of values) {
			switch (assigneeType) {
				case 'role':
					const roleUsers = await getUsersByRole(val, vk, db, employeeInfo.company_id);
					console.log(`角色 ${val} 用户数: ${roleUsers.length}`);
					for (const u of roleUsers) {
						assignees.push({
							id: u.username,
							name: u.nickname || u.username,
							type: 'role'
						});
					}
					break;
				case 'department':
					const deptMgr = await getDepartmentManagerForSimulate(val, employeeInfo, db);
					console.log(`部门 ${val} 负责人:`, deptMgr);
					if (deptMgr) {
						assignees.push({
							id: deptMgr.id,
							name: deptMgr.name,
							type: 'department'
						});
					}
					break;
				case 'variable':
					const rawValue = val;
					if (!rawValue) break;

					let resolvedValue = rawValue;
					const varRegex = /\$\{([^}]+)\}/g;
					let match;
					while ((match = varRegex.exec(rawValue)) !== null) {
						const varName = match[1].trim();
						const varValue = getValueFromData(varName, variables);
						if (varValue !== undefined && varValue !== null) {
							resolvedValue = resolvedValue.replace(match[0], varValue);
						} else {
							console.warn(`变量 ${varName} 不存在，保留原占位符`);
						}
					}

					console.log(`变量表达式解析后: ${resolvedValue}`);

					if (resolvedValue.startsWith('role_')) {
						const roleKey = resolvedValue.substring(5);
						const roleUsers = await getUsersByRole(roleKey, vk, db, employeeInfo.company_id);
						for (const u of roleUsers) {
							assignees.push({
								id: u.username,
								name: u.nickname || u.username,
								type: 'variable'
							});
						}
					} else if (resolvedValue.startsWith('user_')) {
						const userId = resolvedValue.substring(5);
						const hrmService = new HrmService(vk, db);
						const userInfo = await hrmService.getEmployeeInfoByUsername(userId);
						if (userInfo) {
							assignees.push({
								id: userInfo.employee_id,
								name: userInfo.employee_name,
								type: 'variable'
							});
						}
					} else {
						// 默认作为角色处理					
						const roleUsers = await getUsersByRole(resolvedValue, vk, db, employeeInfo.company_id);
						for (const u of roleUsers) {
							assignees.push({
								id: u.username,
								name: u.nickname || u.username,
								type: 'variable'
							});
						}
					}
					break;
				case 'previous':
					assignees.push({
						id: employeeInfo.employee_id,
						name: employeeInfo.employee_name,
						type: 'previous'
					});
					break;
			}
		}
	} catch (error) {
		// 捕获 getUsersByRole 抛出的“角色未加入审核人员”等错误
		throw new Error(`节点【${node.node_name}】分配异常：${error.message}`);
	}

	// 如果通过上述配置没找到任何人，尝试兜底给主管
	if (assignees.length === 0) {
		const managerId = employeeInfo.manager_id;
		if (managerId && managerId !== employeeInfo.employee_id) {
			assignees.push({
				id: managerId,
				name: employeeInfo.manager_name,
				type: 'default'
			});
		} else {
			throw new Error(`节点【${node.node_name}】未配置负责人，且找不到申请人主管作为兜底`);
		}
	}

	// === 核心：对结果进行去重 ===
	const unique = new Map();
	for (const a of assignees) {
		if (!unique.has(a.id)) {
			unique.set(a.id, a);
		}
	}

	const result = Array.from(unique.values());
	console.log('最终去重后的负责人列表:', result);
	return result;
}

/**
 * 根据角色和公司获取用户列表（支持跨表、跨公司高管、兜底）
 */
async function getUsersByRole(role, vk, db, company_id = null) {
	try {
		// 1. 先通过 hrm-employees 查出属于该公司的所有员工工号
		let employeeIds = [];
		if (company_id) {
			// 注意：如果用户的 company_id 是多选数组，这里用 eq 可能匹配不到，如果单值用 eq 没问题
			const empRes = await vk.baseDao.getTableData({
				dbName: "hrm-employees",
				whereJson: {
					company_id: company_id // 单一值直接匹配
				},
				pageSize: -1, // 取消分页，查全量
				fieldJson: {
					employee_id: true
				}
			});
			if (empRes.code === 0 && empRes.rows) {
				employeeIds = empRes.rows.map(item => item.employee_id);
			}
		}

		// 2. 查询 uni-id-users 表，过滤角色和工号
		let userWhereJson = {};
		if (employeeIds.length > 0) {
			// 找到了属于该公司的员工，按员工ID过滤
			userWhereJson = {
				username: db.command.in(employeeIds)
			};
		} else if (company_id) {
			// 传了公司ID，但是该公司下没有员工，直接返回空，触发兜底逻辑
			console.log(`公司 ${company_id} 下没有员工，跳过本公司角色查询`);
			employeeIds = null; // 标记一下
		}

		// 只有该公司有员工，或者没传公司ID时，才去查用户表
		if (employeeIds !== null) {
			if (employeeIds.length === 0 && !company_id) {
				// 没传公司ID，查全局
				userWhereJson = {};
			} else if (employeeIds.length > 0) {
				// 正常查询
				userWhereJson = {
					username: db.command.in(employeeIds)
				};
			}

			// 增加角色过滤
			userWhereJson.role = role; // 如果 role 是数组，这里可能需要 db.command.in 或 all

			const userRes = await vk.baseDao.getTableData({
				dbName: "uni-id-users",
				whereJson: userWhereJson,
				pageSize: -1, // 查全量
				// 关联 hrm-employees 表获取真实姓名等（可选，这里为了代码精简不展示副表，直接返回原始数据）
			});

			if (userRes.code === 0 && userRes.rows.length > 0) {
				// 找到了本公司匹配的角色，直接返回
				return userRes.rows;
			}
		}

		// === 兜底逻辑 1：如果本公司没找到（或者该公司没员工），尝试全局找该角色 ===
		console.log(`本公司未找到角色 ${role}，尝试全局兜底...`);
		const fallbackRes = await vk.baseDao.getTableData({
			dbName: "uni-id-users",
			whereJson: {
				role: role // 这里不要加 company 限制，直接查该角色
			},
			pageSize: 1 // 兜底只要 1 个人即可
		});

		if (fallbackRes.code === 0 && fallbackRes.rows.length > 0) {
			console.log(`全局找到角色 ${role}，提取第一个作为兜底审批人`);
			return [fallbackRes.rows[0]];
		}

		// === 兜底逻辑 2：如果全局依然没有该角色，抛出异常 ===
		throw new Error(`角色 [${role}] 未加入任何审核人员，请检查角色权限配置`);

	} catch (error) {
		console.error('根据角色获取用户失败:', error.message);
		throw error; // 向上抛出，让流程引擎捕获并提示用户
	}
}

/**
 * 根据部门ID获取部门负责人（用于试算）
 */
async function getDepartmentManagerForSimulate(departmentId, employeeInfo, db) {
	try {
		let deptRes = await vk.callFunction({
			url: 'admin/hrm/department/pub/getDeptManager',
			title: '请求中...',
			data: {
				department_id: departmentId
			},
		});

		if (deptRes.total > 0) {
			const dept = deptRes.rows[0];
			// 假设部门负责人字段存储的是 employee_id 和 employee_name
			if (dept.managers.employee_id) {
				let managerName = dept.managers.employee_name || '部门负责人';

				//如果是同一人，就返回申请人主管
				if (dept.managers.employee_id === employeeInfo.employee_id) {
					return {
						id: employeeInfo.manager_id,
						name: employeeInfo.manager_name
					}
				}
				return {
					id: dept.managers.employee_id,
					name: managerName
				}
			}
		}
		return null;
	} catch (error) {
		console.error('获取部门负责人失败:', error);
		return null;
	}
}

/**
 * 获取用户显示名称
 */
async function getUserDisplayName(userId, vk, db) {
	if (!userId) return '未知用户';
	try {
		const userRes = await db.collection('uni-id-users').where({
			username: userId
		}).get();
		if (userRes.data && userRes.data.length > 0) {
			return userRes.data[0].nickname || userRes.data[0].username || userId;
		}
		return userId;
	} catch (error) {
		return userId;
	}
}

/**
 * 计算预计时长
 */
function calculateEstimatedDuration(nodes) {
	let totalHours = 0;
	nodes.forEach(node => {
		if (node.node_type === 'userTask' || node.node_type === 'approval' || node.node_type === 'review') {
			totalHours += node.duration_estimate || 24;
		}
	});
	return {
		total_hours: totalHours,
		total_days: Math.ceil(totalHours / 24),
		formatted: formatDuration(totalHours)
	};
}

/**
 * 格式化时长
 */
function formatDuration(hours) {
	const days = Math.floor(hours / 24);
	const remainingHours = hours % 24;
	if (days > 0 && remainingHours > 0) {
		return `${days}天${remainingHours}小时`;
	} else if (days > 0) {
		return `${days}天`;
	} else {
		return `${hours}小时`;
	}
}