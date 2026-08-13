
// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema



const validator = {
  "my_invite_code": {
    "rules": [
      {
        "format": "string"
      }
    ]
  },
  "ali_openid": {
    "rules": [
      {
        "format": "string"
      }
    ]
  },
  "avatar": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "头像地址"
  },
  "comment": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "备注"
  },
  "department_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "部门"
  },
  "email": {
    "rules": [
      {
        "format": "string"
      },
      {
        "format": "email"
      }
    ],
    "label": "邮箱"
  },
  "email_confirmed": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
          {
            "text": "未验证",
            "value": 0
          },
          {
            "text": "已验证",
            "value": 1
          }
        ]
      }
    ],
    "defaultValue": 0,
    "label": "邮箱验证状态"
  },
  "gender": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
          {
            "text": "未知",
            "value": 0
          },
          {
            "text": "男",
            "value": 1
          },
          {
            "text": "女",
            "value": 2
          }
        ]
      }
    ],
    "defaultValue": 0,
    "label": "性别"
  },
  "inviter_uid": {
    "rules": [
      {
        "format": "array"
      }
    ]
  },
  "last_login_date": {
    "rules": [
      {
        "format": "timestamp"
      }
    ]
  },
  "last_login_ip": {
    "rules": [
      {
        "format": "string"
      }
    ]
  },
  "mobile": {
    "rules": [
		{
		  "required": true
		},
      {
        "format": "string"
      },
      {
        "pattern": "^\\+?[0-9-]{3,20}$"
      }
    ],
    "label": "手机号码"
  },
  "mobile_confirmed": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
          {
            "text": "未验证",
            "value": 0
          },
          {
            "text": "已验证",
            "value": 1
          }
        ]
      }
    ],
    "defaultValue": 0,
    "label": "手机号验证状态"
  },
  "apple_openid": {
    "rules": [
      {
        "format": "string"
      }
    ]
  },
  "nickname": {
    "rules": [
		{
		  "required": true
		},
      {
        "format": "string"
      }
    ],
    "label": "昵称"
  },
  "password_secret_version": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "label": "passwordSecret"
  },
  "realname_auth": {
    "rules": [
      {
        "format": "object"
      }
    ]
  },
  "status": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
          {
            "text": "正常",
            "value": 0
          },
          {
            "text": "禁用",
            "value": 1
          },
          {
            "text": "审核中",
            "value": 2
          },
          {
            "text": "审核拒绝",
            "value": 3
          }
        ]
      }
    ],
    "defaultValue": 0,
    "label": "用户状态"
  },
  "token": {
    "rules": [
      {
        "format": "array"
      }
    ]
  },
  "username": {
    "rules": [
		{
		  "required": true
		},
      {
        "format": "string"
      }
    ],
    "label": "用户名"
  },
  "wx_openid": {
    "rules": [
      {
        "format": "object"
      }
    ]
  },
  "wx_unionid": {
    "rules": [
      {
        "format": "string"
      }
    ]
  },"is_manager": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
          {
            "value": 0,
            "text": "是"
          },
          {
            "value": 1,
            "text": "否"
          }
        ]
      }
    ],
    "label": "是否主管",
    "defaultValue": 1
  },
}

const enumConverter = {
  "email_confirmed_valuetotext": {
    "0": "未验证",
    "1": "已验证"
  },
  "gender_valuetotext": {
    "0": "未知",
    "1": "男",
    "2": "女"
  },
  "mobile_confirmed_valuetotext": {
    "0": "未验证",
    "1": "已验证"
  },
  "status_valuetotext": {
    "0": "正常",
    "1": "禁用",
    "2": "审核中",
    "3": "审核拒绝"
  },"is_manager_valuetotext": {
    "0": "是",
    "1": "否"
  }
}

export { validator, enumConverter }
