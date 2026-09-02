// util/class/hrm-service.js
class HrmService {
	constructor(vk, db) {
		this.vk = vk;
		this.db = db;
	}

	/**
	 * 根据用户名、手机号码获取完整的员工信息
	 */
	async getEmployeeInfoByUsername(username) {
		try {
			const dbCmd = this.db.command
			const employee = await this.vk.baseDao.selects({
				dbName: 'hrm-employees',
				getOne: true,
				getMain: true,
				whereJson: dbCmd.or([{
					employee_id: username ? username : 'null'
				}, {
					mobile: username ? username : 'null'
				}]),
				// 副表
				foreignDB: [{
						dbName: "hrm-bank",
						localKey: "bank_id",
						foreignKey: "bank_id",
						as: "bank_info",
						limit: 1
					},
					{
						dbName: "hrm-banklocation",
						localKey: "location_id",
						foreignKey: "location_id",
						as: "location_info",
						limit: 1
					},
					{
						dbName: "hrm-center",
						localKey: "center_id",
						foreignKey: "center_id",
						as: "center_info",
						limit: 1
					},
					{
						dbName: "hrm-point",
						localKey: "point_id",
						foreignKey: "point_id",
						as: "point_info",
						limit: 1
					},
					{
						dbName: "opendb-nation-china",
						localKey: "nation_id",
						foreignKey: "_id",
						as: "nation_info",
						limit: 1
					},
					{
						dbName: "hrm-contract",
						localKey: "contract_id",
						foreignKey: "contract_id",
						as: "contract_info",
						limit: 1
					},
					{
						dbName: "hrm-educational",
						localKey: "educational_id",
						foreignKey: "educational_id",
						as: "educational_info",
						limit: 1
					},
					{
						dbName: "hrm-insurance",
						localKey: "insurance_id",
						foreignKey: "insurance_id",
						as: "insurance_info",
						limit: 1
					},
					{
						dbName: "hrm-employees",
						localKey: "internal_id",
						foreignKey: "employee_id",
						as: "internal_info",
						limit: 1
					},
					{
						dbName: "hrm-positions",
						localKey: "position_id",
						foreignKey: "position_id",
						as: "position_info",
						limit: 1
					},
					{
						dbName: "hrm-resigntypes",
						localKey: "type_id",
						foreignKey: "type_id",
						as: "resigntype_info",
						limit: 1
					},
					{
						dbName: "hrm-companys",
						localKey: "company_id",
						foreignKey: "company_id",
						as: "company_info",
						limit: 1
					},
					{
						dbName: "hrm-departments",
						localKey: "department_id",
						foreignKey: "department_id",
						as: "department_info",
						limit: 1,
						foreignDB: [{
							dbName: "hrm-employees",
							localKey: "department_manager_id",
							foreignKey: "employee_id",
							as: "deptmanager_info",
							limit: 1
						}]
					},
					{
						dbName: "hrm-employees",
						localKey: "manager_id",
						foreignKey: "employee_id",
						as: "manager_info",
						limit: 1
					},
					{
						dbName: "uni-id-users",
						localKey: "update_id",
						foreignKey: "_id",
						as: "users",
						limit: 1
					}
				]
			});

			if (!employee) {
				throw new Error(`员工信息不存在: ${username},请联系人事部档案管理人员！`);
			}
			return this.formatEmployeeInfo(employee);
		} catch (error) {
			console.error('获取员工信息失败:', error);
			throw error;
		}
	}

	/**
	 * 格式化员工信息
	 */
	formatEmployeeInfo(employee) {
		return {
			// 员工基本信息
			employee_id: employee.employee_id,
			employee_name: employee.employee_name,
			gender: employee.gender,
			avatar: employee.avatar,
			card: employee.card,
			mobile: employee.mobile,
			status: employee.status,
			manager_id: employee.manager_info?.employee_id || '',
			manager_name: employee.manager_info?.employee_name || '',

			// 部门信息
			department_id: employee.department_id,
			department_name: employee.department_info?.department_name || '',
			department_manager_id: employee.department_info.deptmanager_info?.employee_id || '',
			department_manager_name: employee.department_info.deptmanager_info?.employee_name || '',

			// 职位信息
			position_id: employee.position_id,
			position_name: employee.position_info?.position_name || '',
			position_level: employee.position_info?.job_level || '',

			// 公司信息
			company_id: employee.company_id,
			company_name: employee.company_info?.company_name || '',

			// 分点信息
			point_id: employee.point_id,
			point_name: employee.point_info?.point_name || '',
		};
	}

	/**
	 * 根据部门ID获取部门主管信息
	 */
	async getDepartmentSupervisor(employeeInfo) {
		try {
			if (vk.pubfn.isNull(employeeInfo.department_manager_id)) {
				throw new Error(`部门主管信息不存在: ${employeeInfo.department_id}`);
			}

			return {
				employee_id: employeeInfo.department_manager_id,
				employee_name: employeeInfo.department_manager_name,
			};
		} catch (error) {
			console.error('获取部门主管失败:', error);
			throw error;
		}
	}

	/**
	 * 获取部门经理信息
	 */
	async getDepartmentManager(departmentId) {
		try {
			// 查找职位名称包含"经理"的员工
			const manager = await this.vk.baseDao.selects({
				dbName: 'hrm-employees',
				getOne: true,
				whereJson: {
					department_id: departmentId,
					status: 1
				},
				foreignDB: [{
					dbName: 'hrm-positions',
					localKey: 'position_id',
					foreignKey: 'position_id',
					as: 'position_info'
				}],
				whereJson: {
					'position_info.position_name': {
						'$regex': '经理',
						'$options': 'i'
					}
				}
			});

			if (!manager) {
				// 如果没有经理，返回部门主管
				return await this.getDepartmentSupervisor(departmentId);
			}

			return {
				employee_id: manager.employee_id,
				employee_name: manager.employee_name,
				position_name: manager.position_info?.position_name || '',
				position_level: manager.position_info?.position_level || ''
			};
		} catch (error) {
			console.error('获取部门经理失败:', error);
			throw error;
		}
	}

	/**
	 * 获取总经理信息
	 */
	async getGeneralManager() {
		try {
			const generalManager = await this.vk.baseDao.selects({
				dbName: 'hrm-employees',
				getOne: true,
				where: {
					estatus: 1
				},
				foreignDB: [{
					dbName: 'hrm-positions',
					localKey: 'position_id',
					foreignKey: 'position_id',
					as: 'position_info'
				}],
				whereJson: {
					'position_info.position_name': {
						'$regex': '总经理|总裁|CEO',
						'$options': 'i'
					}
				}
			});

			if (!generalManager) {
				throw new Error('总经理信息不存在');
			}

			return {
				employee_id: generalManager.employee_id,
				employee_name: generalManager.employee_name,
				position_name: generalManager.position_info?.position_name || '',
				position_level: generalManager.position_info?.position_level || ''
			};
		} catch (error) {
			console.error('获取总经理失败:', error);
			throw error;
		}
	}

	/**
	 * 获取紧急审批人（通常是行政主管或指定人员）
	 */
	async getUrgentApprover() {
		try {
			const urgentApprover = await this.vk.baseDao.selects({
				dbName: 'hrm-employees',
				getOne: true,
				where: {
					status: 1
				},
				foreignDB: [{
					dbName: 'hrm-positions',
					localKey: 'position_id',
					foreignKey: 'position_id',
					as: 'position_info'
				}],
				whereJson: {
					'position_info.position_name': {
						'$regex': '行政主管|行政经理|办公室主任',
						'$options': 'i'
					}
				}
			});

			if (!urgentApprover) {
				// 如果没有行政主管，返回总经理
				return await this.getGeneralManager();
			}

			return {
				employee_id: urgentApprover.employee_id,
				employee_name: urgentApprover.employee_name,
				position_name: urgentApprover.position_info?.position_name || '',
				position_level: urgentApprover.position_info?.position_level || ''
			};
		} catch (error) {
			console.error('获取紧急审批人失败:', error);
			throw error;
		}
	}
}

module.exports = HrmService;