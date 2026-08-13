<template>
  <view class="page-body">
    <!-- 操作按钮 -->
    <view class="btn-group">
      <el-row>
        <el-button type="primary" size="small" icon="el-icon-check"
          @click="saveConfig" :loading="saving">保存配置</el-button>
      </el-row>
    </view>

    <!-- 表单类型选择区 -->
    <el-card class="config-card">
      <div slot="header" class="clearfix">
        <span>选择需要汇入考勤系统的 OA 表单类型</span>
      </div>
      <el-checkbox-group v-model="selectedCodes" v-loading="loading">
        <el-checkbox v-for="item in allFormTypes" :key="item.code" :label="item.code">
          {{ item.name }}
        </el-checkbox>
      </el-checkbox-group>
    </el-card>
  </view>
</template>

<script>
let vk = uni.vk;
export default {
  data() {
    return {
      allFormTypes: [],       // 所有可用的OA表单类型
      selectedCodes: [],      // 当前选中的code列表
      loading: false,
      saving: false
    };
  },
  async mounted() {
    await this.loadFormTypes();
    await this.loadCurrentConfig();
  },
  methods: {
    // 获取所有OA表单类型
    async loadFormTypes() {
      this.loading = true;
      const res = await vk.callFunction({
        url: 'admin/bpmn/form-type/sys/getList',
        data: { pageSize: 1000 }
      });
      if (res.code === 0) {
        this.allFormTypes = res.rows || [];
      } else {
        vk.toast('获取表单类型失败');
      }
      this.loading = false;
    },
    // 获取当前配置
    async loadCurrentConfig() {
      const res = await vk.callFunction({
        url: 'admin/hrm/attendance/sys/oaimportconfig/getList',
        data: { pageSize: 1 }
      });
      if (res.code === 0 && res.rows && res.rows.length > 0) {
        this.selectedCodes = res.rows[0].import_codes || [];
      }
    },
    // 保存配置
    async saveConfig() {
      this.saving = true;
      try {
        // 检查是否已有配置
        const listRes = await vk.callFunction({
          url: 'admin/hrm/attendance/sys/oaimportconfig/getList',
          data: { pageSize: 1 }
        });
        const existing = listRes.rows && listRes.rows[0];
        let result;
        if (existing) {
          result = await vk.callFunction({
            url: 'admin/hrm/attendance/sys/oaimportconfig/update',
            data: {
              _id: existing._id,
              import_codes: this.selectedCodes
            }
          });
        } else {
          result = await vk.callFunction({
            url: 'admin/hrm/attendance/sys/oaimportconfig/add',
            data: { import_codes: this.selectedCodes }
          });
        }
        if (result.code === 0) {
          vk.toast('保存成功');
        } else {
          vk.toast(result.msg || '保存失败');
        }
      } catch (e) {
        vk.toast('请求异常');
      }
      this.saving = false;
    }
  }
};
</script>

<style scoped>
.page-body { padding: 20rpx; }
.btn-group { margin-bottom: 20rpx; }
.config-card { margin-top: 20rpx; }
.el-checkbox { margin-right: 30rpx; margin-bottom: 15rpx; }
</style>