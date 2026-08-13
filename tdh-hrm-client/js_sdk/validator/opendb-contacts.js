// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema



const validator = {
	"username": {
		"rules": [{
				"required": true
			},
			{
				"format": "string"
			}
		],
		"label": "姓名"
	},
	"nickname": {
		"rules": [{
				"required": true
			},
			{
				"format": "string"
			}
		],
		"label": "昵称"
	},
	"department_id": {
		"rules": [{
				"required": true
			},
			{
				"format": "array"
			}
		],
		"label": "部门"
	},
	"post": {
		"rules": [{
			"format": "string"
		}],
		"label": "职位"
	},
	"mobile": {
		"rules": [{
				"required": true
			},
			{
				"format": "string"
			},
			{
				"pattern": "^\\+?[0-9-]{3,20}$"
			}
		],
		"label": "电话"
	},
	"email": {
		"rules": [{
				"format": "string"
			},
			{
				"format": "email"
			}
		],
		"label": "邮箱"
	}
}

const enumConverter = {}

export {
	validator,
	enumConverter
}
