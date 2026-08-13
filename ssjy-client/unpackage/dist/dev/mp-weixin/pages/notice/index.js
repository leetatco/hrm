"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      pageTitle: "系统通知",
      pageLoading: false,
      loading: false,
      refreshing: false,
      // 搜索和筛选
      searchKeyword: "",
      activeFilter: "unread",
      filterTags: [
        {
          label: "未读",
          value: "unread"
        },
        {
          label: "已读",
          value: "read"
        },
        {
          label: "全部",
          value: "all"
        }
      ],
      // 通知数据
      notices: [],
      unreadCount: 0,
      // 分页
      pagination: {
        pageIndex: 1,
        pageSize: 15,
        total: 0
      },
      hasMore: true,
      loadmoreStatus: "loadmore",
      // 错误信息
      errorMessage: "",
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
  onLoad(options) {
    if (options.filter) {
      this.activeFilter = options.filter;
    }
    if (this.activeFilter === "unread") {
      this.pageTitle = "未读通知";
    } else if (this.activeFilter === "read") {
      this.pageTitle = "已读通知";
    }
    this.initPage();
  },
  onShow() {
    this.refreshData();
  },
  onPullDownRefresh() {
    this.onRefresh();
  },
  methods: {
    // 初始化页面
    async initPage() {
      this.pageLoading = true;
      await this.loadUnreadCount();
      await this.loadNotices(true);
      this.pageLoading = false;
    },
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 切换tab前的拦截
    beforeTabSwitch(index) {
      return true;
    },
    // 显示更多操作
    showMoreAction() {
      this.showActionSheet = true;
    },
    // 跳转到设置
    goToSetting() {
      common_vendor.index.navigateTo({
        url: "/pages/setting/index"
      });
    },
    // 显示关于信息
    showAbout() {
      common_vendor.index.showModal({
        title: "关于",
        content: "通知中心 v1.0.0\n接收和管理系统通知消息",
        showCancel: false
      });
    },
    // 搜索
    handleSearch(value) {
      if (!value) {
        common_vendor.index.showToast({
          title: "请输入搜索内容",
          icon: "none"
        });
        return;
      }
      this.searchKeyword = value;
      this.refreshData();
    },
    // 清除搜索
    handleClearSearch() {
      this.searchKeyword = "";
      this.refreshData();
    },
    // 切换筛选
    changeFilter(filter) {
      if (this.activeFilter === filter)
        return;
      this.activeFilter = filter;
      this.pageTitle = this.getPageTitleByFilter(filter);
      this.refreshData();
    },
    // 根据筛选状态获取页面标题
    getPageTitleByFilter(filter) {
      const map = {
        "unread": "未读通知",
        "read": "已读通知",
        "all": "全部通知"
      };
      return map[filter] || "系统通知";
    },
    // 获取类型文本
    getTypeText(type) {
      const map = {
        "system": "系统",
        "approval": "审批",
        "remind": "提醒",
        "announce": "公告"
      };
      return map[type] || type;
    },
    // 获取短内容
    getShortContent(content) {
      if (!content)
        return "无内容";
      if (content.length > 60) {
        return content.substring(0, 60) + "...";
      }
      return content;
    },
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp)
        return "未知时间";
      try {
        const date = new Date(timestamp);
        const now = /* @__PURE__ */ new Date();
        const diff = now - date;
        const dayDiff = Math.floor(diff / (24 * 60 * 60 * 1e3));
        if (dayDiff === 0) {
          return date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
        } else if (dayDiff === 1) {
          return "昨天";
        } else if (dayDiff < 7) {
          return dayDiff + "天前";
        } else {
          return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
        }
      } catch (error) {
        return "时间错误";
      }
    },
    // 构建请求参数
    buildRequestParams(isRefresh = false) {
      const params = {
        pageIndex: isRefresh ? 1 : this.pagination.pageIndex,
        pageSize: this.pagination.pageSize,
        userInfo: this.vk.getVuex("$user.userInfo")
      };
      if (this.activeFilter !== "all") {
        params.status = this.activeFilter;
      }
      if (this.searchKeyword) {
        params.title = this.searchKeyword;
        params.content = this.searchKeyword;
      }
      return params;
    },
    // 加载通知列表
    async loadNotices(isRefresh = false) {
      if (this.loading && !isRefresh)
        return;
      this.loading = true;
      this.loadmoreStatus = "loading";
      try {
        const params = this.buildRequestParams(isRefresh);
        const res = await this.vk.callFunction({
          url: "admin/bpmn/notification/pub/getList",
          title: "加载中...",
          data: params
        });
        if (res.code === 0) {
          const data = res.data || {};
          const newNotices = data.rows || [];
          const total = data.total || 0;
          if (isRefresh) {
            this.notices = newNotices;
            this.pagination.pageIndex = 1;
          } else {
            this.notices = [...this.notices, ...newNotices];
          }
          this.pagination.total = total;
          this.hasMore = this.notices.length < total;
          this.loadmoreStatus = this.hasMore ? "loadmore" : "nomore";
          await this.loadUnreadCount();
        } else {
          common_vendor.index.showToast({
            title: res.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/notice/index.vue:423", "加载通知失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
        this.refreshing = false;
        common_vendor.index.stopPullDownRefresh();
      }
    },
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
          this.unreadCount = res.data.count || 0;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/notice/index.vue:449", "加载未读数量失败:", error);
      }
    },
    // 查看通知详情
    viewNoticeDetail(item) {
      if (item.status === "unread") {
        this.markAsRead(item);
      }
      if (item.data && item.data.application_id) {
        this.handleApplication(item.data.application_id);
        return;
      }
      common_vendor.index.showModal({
        title: item.title || "通知详情",
        content: item.content || "无内容",
        showCancel: false,
        confirmText: "知道了"
      });
    },
    // 标记为已读
    async markAsRead(item) {
      if (item.status === "read")
        return;
      try {
        const res = await this.vk.callFunction({
          url: "admin/bpmn/notification/pub/markAsRead",
          title: "处理中...",
          data: {
            notification_id: item._id,
            userInfo: this.vk.getVuex("$user.userInfo")
          }
        });
        if (res.code === 0) {
          item.status = "read";
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          common_vendor.index.showToast({
            title: "已标记为已读",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: res.msg || "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/notice/index.vue:505", "标记为已读失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    },
    // 全部标记为已读
    async markAllAsRead() {
      if (this.unreadCount === 0) {
        common_vendor.index.showToast({
          title: "暂无未读通知",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: `确定要将所有未读通知标记为已读吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await this.vk.callFunction({
                url: "admin/bpmn/notification/pub/markAllAsRead",
                title: "处理中...",
                data: {
                  userInfo: this.vk.getVuex("$user.userInfo")
                }
              });
              if (result.code === 0) {
                this.notices.forEach((item) => {
                  if (item.status === "unread") {
                    item.status = "read";
                  }
                });
                this.unreadCount = 0;
                common_vendor.index.showToast({
                  title: "全部标记为已读成功",
                  icon: "success"
                });
              } else {
                common_vendor.index.showToast({
                  title: result.msg || "操作失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/notice/index.vue:557", "全部标记为已读失败:", error);
              common_vendor.index.showToast({
                title: "操作失败",
                icon: "none"
              });
            }
          }
        }
      });
    },
    // 处理申请
    handleApplication(applicationId) {
      common_vendor.index.navigateTo({
        url: `/pages/bpmn/application-form/list`
      });
    },
    // 刷新数据
    refreshData() {
      this.refreshing = true;
      this.loadNotices(true);
    },
    // 下拉刷新
    onRefresh() {
      this.refreshData();
    },
    // 加载更多
    loadMore() {
      if (this.loading || !this.hasMore)
        return;
      this.pagination.pageIndex++;
      this.loadNotices();
    }
  }
};
if (!Array) {
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_tag2 = common_vendor.resolveComponent("u-tag");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_button2 = common_vendor.resolveComponent("u-button");
  const _component_u_refresh = common_vendor.resolveComponent("u-refresh");
  const _component_u_loading_icon = common_vendor.resolveComponent("u-loading-icon");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_loadmore2 = common_vendor.resolveComponent("u-loadmore");
  const _easycom_u_tabbar2 = common_vendor.resolveComponent("u-tabbar");
  const _easycom_u_loading_page2 = common_vendor.resolveComponent("u-loading-page");
  (_easycom_u_search2 + _easycom_u_tag2 + _easycom_u_icon2 + _easycom_u_button2 + _component_u_refresh + _component_u_loading_icon + _easycom_u_empty2 + _easycom_u_loadmore2 + _easycom_u_tabbar2 + _easycom_u_loading_page2)();
}
const _easycom_u_search = () => "../../uni_modules/vk-uview-ui/components/u-search/u-search.js";
const _easycom_u_tag = () => "../../uni_modules/vk-uview-ui/components/u-tag/u-tag.js";
const _easycom_u_icon = () => "../../uni_modules/vk-uview-ui/components/u-icon/u-icon.js";
const _easycom_u_button = () => "../../uni_modules/vk-uview-ui/components/u-button/u-button.js";
const _easycom_u_empty = () => "../../uni_modules/vk-uview-ui/components/u-empty/u-empty.js";
const _easycom_u_loadmore = () => "../../uni_modules/vk-uview-ui/components/u-loadmore/u-loadmore.js";
const _easycom_u_tabbar = () => "../../uni_modules/vk-uview-ui/components/u-tabbar/u-tabbar.js";
const _easycom_u_loading_page = () => "../../uni_modules/vk-uview-ui/components/u-loading-page/u-loading-page.js";
if (!Math) {
  (_easycom_u_search + _easycom_u_tag + _easycom_u_icon + _easycom_u_button + _easycom_u_empty + _easycom_u_loadmore + _easycom_u_tabbar + _easycom_u_loading_page)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.handleSearch, "bb"),
    b: common_vendor.o($options.handleClearSearch, "89"),
    c: common_vendor.o(($event) => $data.searchKeyword = $event, "40"),
    d: common_vendor.p({
      placeholder: "搜索通知标题或内容",
      shape: "round",
      showAction: false,
      height: "70",
      bgColor: "#f5f5f5",
      modelValue: $data.searchKeyword
    }),
    e: common_vendor.f($data.filterTags, (tag, k0, i0) => {
      return {
        a: tag.value,
        b: common_vendor.o(($event) => $options.changeFilter(tag.value), tag.value),
        c: "a41149ed-1-" + i0,
        d: common_vendor.p({
          text: tag.label,
          type: $data.activeFilter === tag.value ? "primary" : "info",
          size: "default",
          plain: $data.activeFilter !== tag.value
        })
      };
    }),
    f: common_vendor.p({
      name: "checkmark-circle",
      size: "16",
      color: "#ffffff"
    }),
    g: common_vendor.o($options.markAllAsRead, "5c"),
    h: common_vendor.p({
      type: "primary",
      size: "mini",
      shape: "circle",
      disabled: $data.unreadCount === 0
    }),
    i: common_vendor.o($options.onRefresh, "da"),
    j: common_vendor.p({
      ["refresher-triggered"]: $data.refreshing
    }),
    k: $data.loading && $data.notices.length === 0
  }, $data.loading && $data.notices.length === 0 ? {
    l: common_vendor.p({
      size: "36",
      text: "加载中..."
    })
  } : !$data.loading && $data.notices.length === 0 ? common_vendor.e({
    n: $data.activeFilter === "unread"
  }, $data.activeFilter === "unread" ? {} : {}, {
    o: common_vendor.p({
      mode: "data",
      icon: "http://cdn.uviewui.com/uview/empty/data.png",
      text: "暂无通知"
    })
  }) : {
    p: common_vendor.f($data.notices, (item, index, i0) => {
      return common_vendor.e({
        a: item.status === "unread"
      }, item.status === "unread" ? {} : {
        b: "a41149ed-7-" + i0,
        c: common_vendor.p({
          name: "checkmark-circle-fill",
          size: "20",
          color: "#19be6b"
        })
      }, {
        d: common_vendor.t(item.title || "无标题"),
        e: item.type
      }, item.type ? {
        f: "a41149ed-8-" + i0,
        g: common_vendor.p({
          text: $options.getTypeText(item.type),
          type: "info",
          size: "mini",
          shape: "circle",
          plain: true
        })
      } : {}, {
        h: item.priority === "high"
      }, item.priority === "high" ? {} : {}, {
        i: common_vendor.t($options.getShortContent(item.content)),
        j: "a41149ed-9-" + i0,
        k: common_vendor.t($options.formatTime(item.create_time)),
        l: item.sender
      }, item.sender ? {
        m: common_vendor.t(item.sender)
      } : {}, {
        n: item.status === "unread"
      }, item.status === "unread" ? common_vendor.e({
        o: common_vendor.o(($event) => $options.markAsRead(item), item._id || index),
        p: "a41149ed-10-" + i0,
        q: common_vendor.p({
          type: "primary",
          size: "mini",
          shape: "circle",
          plain: true
        }),
        r: item.data && item.data.application_id
      }, item.data && item.data.application_id ? {
        s: common_vendor.o(($event) => $options.handleApplication(item.data.application_id), item._id || index),
        t: "a41149ed-11-" + i0,
        v: common_vendor.p({
          type: "success",
          size: "mini",
          shape: "circle",
          plain: true
        })
      } : {}) : {}, {
        w: item._id || index,
        x: item.status === "unread" ? 1 : "",
        y: common_vendor.o(($event) => $options.viewNoticeDetail(item), item._id || index)
      });
    }),
    q: common_vendor.p({
      name: "clock",
      size: "12",
      color: "#999"
    })
  }, {
    m: !$data.loading && $data.notices.length === 0,
    r: $data.hasMore
  }, $data.hasMore ? {
    s: common_vendor.p({
      status: $data.loadmoreStatus
    })
  } : $data.notices.length > 0 ? {} : {}, {
    t: $data.notices.length > 0,
    v: $data.refreshing,
    w: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args), "3f"),
    x: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "35"),
    y: common_vendor.p({
      list: $data.tabbar,
      ["before-switch"]: $options.beforeTabSwitch,
      ["icon-size"]: "50",
      ["border-top"]: true
    }),
    z: common_vendor.p({
      loading: $data.pageLoading,
      bgColor: "#f5f5f5"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a41149ed"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notice/index.js.map
