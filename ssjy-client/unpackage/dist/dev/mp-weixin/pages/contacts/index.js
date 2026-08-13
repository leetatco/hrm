"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 搜索关键词
      searchKeyword: "",
      // 筛选类型
      filterType: "letter",
      // 当前选中的字母
      currentLetter: "A",
      // 是否显示字母提示
      showLetterTip: false,
      // 字母索引
      letters: [
        "#",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z"
      ],
      // 模拟的联系人数据
      contacts: [],
      // 部门数据
      departments: [],
      // 底部导航
      tabbar: [
        {
          iconPath: "/static/icon_home.png",
          selectedIconPath: "/static/icon_home_sel.png",
          pagePath: "/pages/index/index",
          text: "首页"
        },
        {
          iconPath: "/static/icon_msg.png",
          selectedIconPath: "/static/icon_msg_sel.png",
          pagePath: "/pages/notice/index",
          text: "消息"
        },
        {
          iconPath: "/static/icon_mailList.png",
          selectedIconPath: "/static/icon_mailList_sel.png",
          pagePath: "/pages/contacts/index",
          text: "通讯录"
        },
        {
          iconPath: "/static/icon_user.png",
          selectedIconPath: "/static/icon_user_sel.png",
          pagePath: "/pages/user/index",
          text: "我的"
        }
      ]
    };
  },
  computed: {
    // 按字母分组
    contactsByLetter() {
      const groups = {};
      this.letters.forEach((letter) => {
        groups[letter] = [];
      });
      const filtered = this.filteredContacts;
      filtered.forEach((contact) => {
        let firstLetter = contact.pinyin ? contact.pinyin.charAt(0).toUpperCase() : contact.name ? contact.name.charAt(0).toUpperCase() : "#";
        if (!/^[A-Z]$/.test(firstLetter)) {
          firstLetter = "#";
        }
        if (groups[firstLetter]) {
          groups[firstLetter].push(contact);
        } else {
          groups["#"].push(contact);
        }
      });
      Object.keys(groups).forEach((letter) => {
        if (groups[letter].length === 0) {
          delete groups[letter];
        }
      });
      return groups;
    },
    // 过滤后的联系人
    filteredContacts() {
      let contacts = [...this.contacts];
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        contacts = contacts.filter(
          (contact) => contact.name.toLowerCase().includes(keyword) || contact.department.toLowerCase().includes(keyword) || contact.position.toLowerCase().includes(keyword) || contact.phone && contact.phone.includes(keyword)
        );
      }
      switch (this.filterType) {
        case "recent":
          contacts = contacts.sort((a, b) => {
            return new Date(b.lastContact) - new Date(a.lastContact);
          });
          break;
        case "star":
          contacts = contacts.filter((contact) => contact.star);
          break;
      }
      return contacts;
    },
    // 总人数
    totalCount() {
      return this.contacts.length;
    }
  },
  onLoad() {
    this.loadContacts();
  },
  onShow() {
    this.refreshData();
  },
  methods: {
    // 切换tab前的拦截
    beforeTabSwitch(index) {
      return true;
    },
    // 加载联系人数据
    async loadContacts() {
      let data = await vk.callFunction({
        url: "client/employees/sys/getList",
        title: "请求中...",
        data: {}
      });
      if (data.code == 0) {
        const result = this.processEmployeeData(data);
        this.contacts = result.contacts;
        this.departments = result.departments;
      }
    },
    // 更健壮的数据处理函数
    processEmployeeData(data) {
      const result = {
        contacts: [],
        departments: []
      };
      if (!data || !data.rows || data.rows.length === 0) {
        return result;
      }
      const departmentMap = /* @__PURE__ */ new Map();
      const contactMap = /* @__PURE__ */ new Map();
      data.rows.forEach((employee) => {
        const employeeId = employee.employee_id;
        const department = employee.departments || {};
        const position = employee.positions || {};
        const contact = {
          id: employeeId,
          name: employee.employee_name || "未知姓名",
          pinyin: common_vendor.pinyin(employee.employee_name),
          department: department.department_name || "未分配部门",
          position: position.position_name || "未知职位",
          phone: employee.mobile || "",
          departmentId: department.department_id || 0,
          positionId: position.position_id || 0,
          // avatar: employee.avatar || this.getDefaultAvatar(employee.sex),
          sex: employee.sex || "男",
          email: employee.email || "",
          extension: employee.extension || "",
          // 分机号
          office: employee.office || "",
          // 办公室
          // 其他业务字段
          jobNumber: employee.job_number || "",
          // 工号
          joinDate: employee.join_date || "",
          // 入职日期
          status: employee.status || 1
          // 员工状态
        };
        if (!contactMap.has(employeeId)) {
          result.contacts.push(contact);
          contactMap.set(employeeId, true);
        }
        const deptId = department.department_id || 0;
        const deptName = department.department_name || "未分配部门";
        if (!departmentMap.has(deptId)) {
          departmentMap.set(deptId, {
            id: deptId,
            name: deptName,
            sort: department.sort || 0,
            // 部门排序字段
            parentId: department.parent_id || 0,
            // 上级部门ID
            memberCount: 0,
            members: []
          });
        }
        const deptData = departmentMap.get(deptId);
        deptData.members.push({
          id: employeeId,
          name: employee.employee_name,
          // avatar: employee.avatar || this.getDefaultAvatar(employee.sex),
          position: position.position_name,
          phone: employee.mobile,
          email: employee.email || "",
          jobNumber: employee.job_number || "",
          // 可以添加排序字段
          sort: employee.sort || 0
        });
      });
      departmentMap.forEach((department) => {
        department.memberCount = department.members.length;
        department.members.sort((a, b) => {
          const pinyinA = common_vendor.pinyin(a.name || "");
          const pinyinB = common_vendor.pinyin(b.name || "");
          return pinyinA.localeCompare(pinyinB);
        });
      });
      result.departments = Array.from(departmentMap.values());
      result.departments.sort((a, b) => {
        if (a.sort !== b.sort)
          return a.sort - b.sort;
        return a.name.localeCompare(b.name);
      });
      return result;
    },
    // 获取默认头像
    getDefaultAvatar(sex) {
      return sex === "女" ? "/static/female_avatar.png" : "/static/male_avatar.png";
    },
    // 刷新数据
    refreshData() {
      common_vendor.index.__f__("log", "at pages/contacts/index.vue:441", "刷新通讯录数据");
    },
    // 处理搜索
    handleSearch(value) {
      common_vendor.index.__f__("log", "at pages/contacts/index.vue:446", "搜索:", value);
    },
    // 清除搜索
    handleClearSearch() {
      this.searchKeyword = "";
    },
    // 切换筛选类型
    changeFilter(type) {
      this.filterType = type;
    },
    // 滚动到指定字母
    scrollToLetter(letter) {
      this.currentLetter = letter;
      this.showLetterTip = true;
      setTimeout(() => {
        this.showLetterTip = false;
      }, 1e3);
    },
    // 处理滚动
    handleScroll(e) {
    },
    // 查看联系人详情
    viewContactDetail(contact) {
    },
    // 拨打电话
    makeCall(phone) {
      common_vendor.index.showActionSheet({
        itemList: [`拨打 ${phone}`, "复制号码"],
        success: (res) => {
          if (res.tapIndex === 0) {
            common_vendor.index.makePhoneCall({
              phoneNumber: phone
            });
          } else if (res.tapIndex === 1) {
            common_vendor.index.setClipboardData({
              data: phone,
              success: () => {
                common_vendor.index.showToast({
                  title: "号码已复制",
                  icon: "success"
                });
              }
            });
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_u_status_bar = common_vendor.resolveComponent("u-status-bar");
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_avatar2 = common_vendor.resolveComponent("u-avatar");
  const _easycom_u_collapse_item2 = common_vendor.resolveComponent("u-collapse-item");
  const _easycom_u_collapse2 = common_vendor.resolveComponent("u-collapse");
  const _easycom_u_tabbar2 = common_vendor.resolveComponent("u-tabbar");
  (_component_u_status_bar + _easycom_u_search2 + _easycom_u_icon2 + _easycom_u_avatar2 + _easycom_u_collapse_item2 + _easycom_u_collapse2 + _easycom_u_tabbar2)();
}
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_avatar = () => "../../uni_modules/vk-uview-ui/components/u-avatar/u-avatar.js";
const _easycom_u_collapse_item = () => "../../uni_modules/vk-uview-ui/components/u-collapse-item/u-collapse-item.js";
const _easycom_u_collapse = () => "../../uni_modules/vk-uview-ui/components/u-collapse/u-collapse.js";
const _easycom_u_tabbar = () => "../../uni_modules/vk-uview-ui/components/u-tabbar/u-tabbar.js";
if (!Math) {
  (_easycom_u_search + _easycom_u_icon + _easycom_u_avatar + _easycom_u_collapse_item + _easycom_u_collapse + _easycom_u_tabbar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      bgColor: "transparent"
    }),
    b: common_vendor.o(($event) => $data.searchKeyword = $event, "2d"),
    c: common_vendor.p({
      placeholder: "搜索姓名、部门、职位...",
      shape: "round",
      showAction: false,
      height: "70",
      clearabled: true,
      modelValue: $data.searchKeyword
    }),
    d: $data.filterType === "all" ? 1 : "",
    e: common_vendor.o(($event) => $options.changeFilter("all"), "d3"),
    f: $data.filterType === "department" ? 1 : "",
    g: common_vendor.o(($event) => $options.changeFilter("department"), "e6"),
    h: $data.filterType === "letter" ? 1 : "",
    i: common_vendor.o(($event) => $options.changeFilter("letter"), "f1"),
    j: $data.filterType === "recent" ? 1 : "",
    k: common_vendor.o(($event) => $options.changeFilter("recent"), "fd"),
    l: common_vendor.p({
      name: "star",
      size: "24",
      color: "#ff9900"
    }),
    m: $data.filterType === "star" ? 1 : "",
    n: common_vendor.o(($event) => $options.changeFilter("star"), "e4"),
    o: $data.filterType === "letter"
  }, $data.filterType === "letter" ? {
    p: common_vendor.f($data.letters, (letter, index, i0) => {
      return {
        a: common_vendor.t(letter),
        b: index,
        c: common_vendor.n({
          active: $data.currentLetter === letter
        }),
        d: letter,
        e: common_vendor.o(($event) => $options.scrollToLetter(letter), index)
      };
    }),
    q: $data.currentLetter,
    r: common_vendor.f($options.contactsByLetter, (group, letter, i0) => {
      return {
        a: common_vendor.t(letter),
        b: common_vendor.t(group.length),
        c: common_vendor.f(group, (contact, k1, i1) => {
          return common_vendor.e({
            a: "822bb6ce-3-" + i0 + "-" + i1,
            b: common_vendor.p({
              src: contact.avatar,
              size: "80",
              mode: "aspectFill",
              sex: contact.sex,
              ["sex-icon"]: contact.sex === "男" ? "man" : "woman"
            }),
            c: contact.online
          }, contact.online ? {
            d: common_vendor.n(contact.online)
          } : {}, {
            e: common_vendor.t(contact.name),
            f: contact.star
          }, contact.star ? {
            g: "822bb6ce-4-" + i0 + "-" + i1,
            h: common_vendor.p({
              name: "star",
              size: "20",
              color: "#ff9900"
            })
          } : {}, {
            i: contact.position
          }, contact.position ? {
            j: common_vendor.t(contact.position)
          } : {}, {
            k: common_vendor.t(contact.department),
            l: contact.phone
          }, contact.phone ? {
            m: common_vendor.t(contact.phone)
          } : {}, {
            n: contact.phone
          }, contact.phone ? {
            o: "822bb6ce-5-" + i0 + "-" + i1,
            p: common_vendor.p({
              name: "phone",
              size: "28",
              color: "#2979ff"
            }),
            q: common_vendor.o(($event) => $options.makeCall(contact.phone), contact.id)
          } : {}, {
            r: contact.id,
            s: common_vendor.o(($event) => $options.viewContactDetail(contact), contact.id)
          });
        }),
        d: letter,
        e: letter
      };
    }),
    s: $data.currentLetter,
    t: common_vendor.o((...args) => $options.handleScroll && $options.handleScroll(...args), "f4")
  } : $data.filterType === "department" ? {
    w: common_vendor.f($data.departments, (dept, k0, i0) => {
      return {
        a: common_vendor.t(dept.name),
        b: common_vendor.t(dept.memberCount),
        c: common_vendor.f(dept.members, (member, k1, i1) => {
          return common_vendor.e({
            a: "822bb6ce-8-" + i0 + "-" + i1 + "," + ("822bb6ce-7-" + i0),
            b: common_vendor.p({
              src: member.avatar,
              size: "60",
              mode: "aspectFill"
            }),
            c: common_vendor.t(member.name),
            d: common_vendor.t(member.position),
            e: member.phone
          }, member.phone ? {
            f: "822bb6ce-9-" + i0 + "-" + i1 + "," + ("822bb6ce-7-" + i0),
            g: common_vendor.p({
              name: "phone",
              size: "24",
              color: "#2979ff"
            }),
            h: common_vendor.o(($event) => $options.makeCall(member.phone), member.id)
          } : {}, {
            i: member.id,
            j: common_vendor.o(($event) => $options.viewContactDetail(member), member.id)
          });
        }),
        d: dept.id,
        e: "822bb6ce-7-" + i0 + ",822bb6ce-6",
        f: common_vendor.p({
          title: dept.name,
          name: dept.id
        })
      };
    }),
    x: common_vendor.p({
      accordion: true,
      border: false
    })
  } : {
    y: common_vendor.f($options.filteredContacts, (contact, k0, i0) => {
      return common_vendor.e({
        a: "822bb6ce-10-" + i0,
        b: common_vendor.p({
          src: contact.avatar,
          size: "80",
          mode: "aspectFill"
        }),
        c: contact.online
      }, contact.online ? {
        d: common_vendor.n(contact.online)
      } : {}, {
        e: common_vendor.t(contact.name),
        f: contact.star
      }, contact.star ? {
        g: "822bb6ce-11-" + i0,
        h: common_vendor.p({
          name: "star",
          size: "20",
          color: "#ff9900"
        })
      } : {}, {
        i: common_vendor.t(contact.department),
        j: common_vendor.t(contact.position),
        k: contact.phone
      }, contact.phone ? {
        l: "822bb6ce-12-" + i0,
        m: common_vendor.p({
          name: "phone",
          size: "28",
          color: "#2979ff"
        }),
        n: common_vendor.o(($event) => $options.makeCall(contact.phone), contact.id)
      } : {}, {
        o: contact.id,
        p: common_vendor.o(($event) => $options.viewContactDetail(contact), contact.id)
      });
    })
  }, {
    v: $data.filterType === "department",
    z: $data.showLetterTip && $data.filterType === "letter"
  }, $data.showLetterTip && $data.filterType === "letter" ? {
    A: common_vendor.t($data.currentLetter)
  } : {}, {
    B: common_vendor.p({
      list: $data.tabbar,
      ["before-switch"]: $options.beforeTabSwitch,
      ["icon-size"]: "50",
      ["border-top"]: true,
      ["hide-tab-bar"]: true
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-822bb6ce"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/contacts/index.js.map
