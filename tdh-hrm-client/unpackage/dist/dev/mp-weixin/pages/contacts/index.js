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
      // 完整字母表
      fullLetters: [
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
      // 所有已加载的联系人（分页累积）
      allContacts: [],
      // 部门列表（仅基本信息）
      departments: [],
      // 普通模式分页
      currentPage: 1,
      pageSize: 20,
      totalCount: 0,
      isLoadingMore: false,
      hasMore: true,
      // 搜索模式相关
      isSearchMode: false,
      searchResults: [],
      // 所有搜索到的联系人（分页累积）
      searchPage: 1,
      searchHasMore: true,
      searchTotal: 0,
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
    // 当前实际显示的联系人列表（根据模式决定）
    displayContacts() {
      if (this.isSearchMode) {
        return this.searchResults;
      }
      let list = [...this.allContacts];
      if (this.filterType === "recent") {
        list.sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact));
      }
      return list;
    },
    // 可用的字母索引（基于已加载的联系人）
    availableLetters() {
      const letters = /* @__PURE__ */ new Set();
      this.displayContacts.forEach((contact) => {
        let firstLetter = contact.pinyin ? contact.pinyin.charAt(0).toUpperCase() : contact.name ? contact.name.charAt(0).toUpperCase() : "#";
        if (!/^[A-Z]$/.test(firstLetter))
          firstLetter = "#";
        letters.add(firstLetter);
      });
      return Array.from(letters).sort();
    },
    // 按字母分组
    contactsByLetter() {
      const groups = {};
      this.displayContacts.forEach((contact) => {
        let firstLetter = contact.pinyin ? contact.pinyin.charAt(0).toUpperCase() : contact.name ? contact.name.charAt(0).toUpperCase() : "#";
        if (!/^[A-Z]$/.test(firstLetter))
          firstLetter = "#";
        if (!groups[firstLetter])
          groups[firstLetter] = [];
        groups[firstLetter].push(contact);
      });
      return groups;
    }
  },
  onLoad() {
    this.loadFirstPage();
  },
  onShow() {
    this.loadUnreadCount();
  },
  methods: {
    // 加载未读数量
    async loadUnreadCount() {
      try {
        const res = await this.vk.callFunction({
          url: "admin/bpmn/notification/pub/getUnreadCount",
          data: {
            userInfo: this.vk.getVuex("$user.userInfo")
          }
        });
        if (res.code === 0) {
          this.tabbar[1].count = res.data.count || 0;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/contacts/index.vue:307", "加载未读数量失败:", error);
      }
    },
    // 切换tab拦截
    beforeTabSwitch(index) {
      return true;
    },
    // 加载第一页联系人
    async loadFirstPage() {
      this.currentPage = 1;
      this.allContacts = [];
      this.hasMore = true;
      await this.loadContactsPage(1);
    },
    // 加载指定页码的联系人（普通模式）
    async loadContactsPage(page) {
      if (this.isLoadingMore)
        return;
      this.isLoadingMore = true;
      try {
        const res = await vk.callFunction({
          url: "admin/hrm/employees/sys/getPhoneList",
          title: "加载中...",
          data: {
            pageIndex: page,
            pageSize: this.pageSize
          }
        });
        if (res.code === 0) {
          const {
            contacts,
            departments,
            total
          } = this.processEmployeeData(res);
          if (page === 1) {
            this.allContacts = contacts;
            this.initDepartments(departments);
          } else {
            this.allContacts = [...this.allContacts, ...contacts];
          }
          this.totalCount = total;
          this.hasMore = this.allContacts.length < total;
          this.currentPage = page;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/contacts/index.vue:359", "加载联系人失败", e);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        this.isLoadingMore = false;
      }
    },
    // 加载更多（滚动触发）
    async loadMoreContacts() {
      if (this.isLoadingMore)
        return;
      if (this.isSearchMode) {
        if (!this.searchHasMore)
          return;
        await this.loadSearchPage(this.searchPage + 1);
      } else {
        if (!this.hasMore)
          return;
        await this.loadContactsPage(this.currentPage + 1);
      }
    },
    // 初始化部门列表（仅存储基本信息，成员懒加载）
    initDepartments(deptList) {
      this.departments = deptList.map((dept) => ({
        id: dept.id,
        name: dept.name,
        sort: dept.sort,
        parentId: dept.parentId,
        memberCount: dept.memberCount,
        members: [],
        membersLoaded: false,
        loading: false
      }));
    },
    // 部门展开时加载成员
    async onDepartmentOpen(panelId) {
      const dept = this.departments.find((d) => d.id === panelId);
      if (!dept || dept.membersLoaded || dept.loading)
        return;
      dept.loading = true;
      try {
        const res = await vk.callFunction({
          url: "admin/hrm/employees/sys/getPhoneList",
          data: {
            keyword: dept.name,
            pageIndex: 1,
            pageSize: 100
            // 部门成员通常不会太多，一次加载完
          }
        });
        if (res.code === 0) {
          const {
            contacts
          } = this.processEmployeeData(res);
          this.$set(dept, "members", contacts);
          this.$set(dept, "memberCount", res.total);
          dept.membersLoaded = true;
          this.$nextTick(() => {
            if (this.$refs.collapse && this.$refs.collapse.init) {
              this.$refs.collapse.init();
            }
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/contacts/index.vue:428", "加载部门成员失败", e);
      } finally {
        dept.loading = false;
      }
    },
    // 处理员工数据（转换格式、添加拼音等）
    processEmployeeData(response) {
      const result = {
        contacts: [],
        departments: []
      };
      if (!response || !response.rows || response.rows.length === 0) {
        return {
          ...result,
          total: response.total || 0
        };
      }
      const departmentMap = /* @__PURE__ */ new Map();
      const contactMap = /* @__PURE__ */ new Map();
      response.rows.forEach((employee) => {
        const employeeId = employee.employee_id;
        const department = employee.departments || {};
        const position = employee.positions || {};
        const contact = {
          id: employeeId,
          name: employee.employee_name || "未知姓名",
          pinyin: common_vendor.pinyin(employee.employee_name || ""),
          department: department.department_name || "未分配部门",
          position: position.position_name || "未知职位",
          phone: employee.mobile || "",
          departmentId: department.department_id || 0,
          positionId: position.position_id || 0,
          sex: employee.sex || "男",
          email: employee.email || "",
          extension: employee.extension || "",
          office: employee.office || "",
          jobNumber: employee.job_number || "",
          joinDate: employee.join_date || "",
          status: employee.status || 1,
          star: false,
          online: false,
          lastContact: /* @__PURE__ */ new Date()
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
            parentId: department.parent_id || 0,
            memberCount: 0
          });
        }
        departmentMap.get(deptId).memberCount++;
      });
      result.departments = Array.from(departmentMap.values());
      result.departments.sort((a, b) => {
        if (a.sort !== b.sort)
          return a.sort - b.sort;
        return a.name.localeCompare(b.name);
      });
      return {
        contacts: result.contacts,
        departments: result.departments,
        total: response.total || 0
      };
    },
    // 搜索处理
    async handleSearch(value) {
      if (!value.trim()) {
        this.handleClearSearch();
        return;
      }
      this.isSearchMode = true;
      this.searchKeyword = value;
      this.searchPage = 1;
      this.searchResults = [];
      this.searchHasMore = true;
      await this.loadSearchPage(1);
    },
    // 加载搜索结果的指定页
    async loadSearchPage(page) {
      if (this.isLoadingMore)
        return;
      this.isLoadingMore = true;
      try {
        const res = await vk.callFunction({
          url: "admin/hrm/employees/sys/getPhoneList",
          data: {
            keyword: this.searchKeyword,
            pageIndex: page,
            pageSize: this.pageSize
          }
        });
        if (res.code === 0) {
          const {
            contacts,
            departments,
            total
          } = this.processEmployeeData(res);
          if (page === 1) {
            this.searchResults = contacts;
            this.initDepartments(departments);
          } else {
            this.searchResults = [...this.searchResults, ...contacts];
            this.initDepartments(departments);
          }
          this.searchTotal = total;
          this.searchHasMore = this.searchResults.length < total;
          this.searchPage = page;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/contacts/index.vue:562", "搜索失败", e);
      } finally {
        this.isLoadingMore = false;
      }
    },
    // 清除搜索
    handleClearSearch() {
      this.searchKeyword = "";
      this.isSearchMode = false;
      this.searchResults = [];
      this.searchPage = 1;
      this.searchHasMore = false;
    },
    // 切换筛选类型
    changeFilter(type) {
      this.filterType = type;
      if (!this.isSearchMode) {
        if (this.allContacts.length === 0) {
          this.loadFirstPage();
        }
      }
    },
    // 滚动到指定字母
    scrollToLetter(letter) {
      this.currentLetter = letter;
      this.showLetterTip = true;
      setTimeout(() => {
        this.showLetterTip = false;
      }, 1e3);
    },
    handleScroll(e) {
    },
    viewContactDetail(contact) {
      common_vendor.index.__f__("log", "at pages/contacts/index.vue:604", "查看详情:", contact);
    },
    makeCall(phone) {
      if (!phone) {
        common_vendor.index.showToast({
          title: "暂无号码",
          icon: "none"
        });
        return;
      }
      if (phone.includes("*")) {
        common_vendor.index.showToast({
          title: "无权限拨打该号码",
          icon: "none"
        });
        return;
      }
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
              success: () => common_vendor.index.showToast({
                title: "号码已复制",
                icon: "success"
              })
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
  const _easycom_u_avatar2 = common_vendor.resolveComponent("u-avatar");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_loading2 = common_vendor.resolveComponent("u-loading");
  const _easycom_u_collapse_item2 = common_vendor.resolveComponent("u-collapse-item");
  const _easycom_u_collapse2 = common_vendor.resolveComponent("u-collapse");
  const _component_u_loading_icon = common_vendor.resolveComponent("u-loading-icon");
  const _easycom_u_tabbar2 = common_vendor.resolveComponent("u-tabbar");
  (_component_u_status_bar + _easycom_u_search2 + _easycom_u_avatar2 + _easycom_u_icon2 + _easycom_u_loading2 + _easycom_u_collapse_item2 + _easycom_u_collapse2 + _component_u_loading_icon + _easycom_u_tabbar2)();
}
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_avatar = () => "../../uni_modules/vk-uview-ui/components/u-avatar/u-avatar.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_loading = () => "../../uni_modules/vk-uview-ui/components/u-loading/u-loading.js";
const _easycom_u_collapse_item = () => "../../uni_modules/vk-uview-ui/components/u-collapse-item/u-collapse-item.js";
const _easycom_u_collapse = () => "../../uni_modules/vk-uview-ui/components/u-collapse/u-collapse.js";
const _easycom_u_tabbar = () => "../../uni_modules/vk-uview-ui/components/u-tabbar/u-tabbar.js";
if (!Math) {
  (_easycom_u_search + _easycom_u_avatar + _easycom_u_icon + _easycom_u_loading + _easycom_u_collapse_item + _easycom_u_collapse + _easycom_u_tabbar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      bgColor: "transparent"
    }),
    b: common_vendor.o($options.handleSearch, "cc"),
    c: common_vendor.o($options.handleClearSearch, "9b"),
    d: common_vendor.o(($event) => $data.searchKeyword = $event, "81"),
    e: common_vendor.p({
      placeholder: "搜索姓名、部门、职位...",
      shape: "round",
      showAction: false,
      height: "70",
      clearabled: true,
      modelValue: $data.searchKeyword
    }),
    f: $data.filterType === "all" ? 1 : "",
    g: common_vendor.o(($event) => $options.changeFilter("all"), "f0"),
    h: $data.filterType === "department" ? 1 : "",
    i: common_vendor.o(($event) => $options.changeFilter("department"), "8c"),
    j: $data.filterType === "letter" ? 1 : "",
    k: common_vendor.o(($event) => $options.changeFilter("letter"), "d0"),
    l: $data.filterType === "recent" ? 1 : "",
    m: common_vendor.o(($event) => $options.changeFilter("recent"), "dd"),
    n: $data.filterType === "letter"
  }, $data.filterType === "letter" ? common_vendor.e({
    o: Object.keys($options.contactsByLetter).length > 0
  }, Object.keys($options.contactsByLetter).length > 0 ? {
    p: common_vendor.f($options.availableLetters, (letter, k0, i0) => {
      return {
        a: common_vendor.t(letter),
        b: letter,
        c: common_vendor.n({
          active: $data.currentLetter === letter
        }),
        d: letter,
        e: common_vendor.o(($event) => $options.scrollToLetter(letter), letter)
      };
    }),
    q: $data.currentLetter
  } : {}, {
    r: common_vendor.f($options.contactsByLetter, (group, letter, i0) => {
      return {
        a: common_vendor.t(letter),
        b: common_vendor.t(group.length),
        c: common_vendor.f(group, (contact, k1, i1) => {
          return common_vendor.e({
            a: "822bb6ce-2-" + i0 + "-" + i1,
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
            g: "822bb6ce-3-" + i0 + "-" + i1,
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
            o: "822bb6ce-4-" + i0 + "-" + i1,
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
    s: $data.isLoadingMore
  }, $data.isLoadingMore ? {
    t: common_vendor.p({
      mode: "circle",
      size: "40",
      text: "加载中..."
    })
  } : !$data.hasMore && $data.totalCount > 0 ? {} : {}, {
    v: !$data.hasMore && $data.totalCount > 0,
    w: $data.currentLetter,
    x: common_vendor.o((...args) => $options.loadMoreContacts && $options.loadMoreContacts(...args), "6d"),
    y: common_vendor.o((...args) => $options.handleScroll && $options.handleScroll(...args), "f7")
  }) : $data.filterType === "department" ? {
    A: common_vendor.f($data.departments, (dept, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(dept.name),
        b: common_vendor.t(dept.memberCount),
        c: dept.membersLoaded
      }, dept.membersLoaded ? {
        d: common_vendor.f(dept.members, (member, k1, i1) => {
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
        })
      } : {
        e: "822bb6ce-10-" + i0 + "," + ("822bb6ce-7-" + i0),
        f: common_vendor.p({
          mode: "circle",
          size: "40",
          text: "加载成员中..."
        })
      }, {
        g: dept.id,
        h: "822bb6ce-7-" + i0 + ",822bb6ce-6",
        i: common_vendor.p({
          title: dept.name,
          name: dept.id
        })
      });
    }),
    B: common_vendor.sr("collapse", "822bb6ce-6"),
    C: common_vendor.o($options.onDepartmentOpen, "2f"),
    D: common_vendor.p({
      accordion: true,
      border: false
    })
  } : common_vendor.e({
    E: common_vendor.f($options.displayContacts, (contact, k0, i0) => {
      return common_vendor.e({
        a: "822bb6ce-11-" + i0,
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
        g: "822bb6ce-12-" + i0,
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
        l: "822bb6ce-13-" + i0,
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
    }),
    F: $data.isLoadingMore
  }, $data.isLoadingMore ? {
    G: common_vendor.p({
      mode: "circle",
      size: "40",
      text: "加载中..."
    })
  } : !$data.hasMore && $data.totalCount > 0 ? {} : {}, {
    H: !$data.hasMore && $data.totalCount > 0,
    I: common_vendor.o((...args) => $options.loadMoreContacts && $options.loadMoreContacts(...args), "a4")
  }), {
    z: $data.filterType === "department",
    J: $data.showLetterTip && $data.filterType === "letter"
  }, $data.showLetterTip && $data.filterType === "letter" ? {
    K: common_vendor.t($data.currentLetter)
  } : {}, {
    L: common_vendor.p({
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
