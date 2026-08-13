
// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema



const validator = {
  "companyname": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "公司名称"
  },
  "telephone": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "联系电话"
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
  "address": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "公司地址"
  }
}

const enumConverter = {}

export { validator, enumConverter }
