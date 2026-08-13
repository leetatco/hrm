<template>
  <vk-data-dialog v-model="show" :title="title" width="900px">
    <!-- 使用 approve-header-detail 组件 -->
    <approve-header-detail
      :detail-data="application"
      :form-schema="formSchema"
      :process-info="processInfo"
      :status-history="statusHistory"
      :current-tasks="currentTasks"
      :return-info="returnInfo"
      :show-basic-info="true"
      :show-return-info="true"
      :show-approval-flow="true"
      :show-current-task="false"
      :show-handle-form="true"
      :show-edit-prompt="true"
      :basic-info-title="'基本信息'"
      :form-info-title="'申请信息'"
      :handle-form-title="'处理方式'"
      :handle-form="handleForm"
      :handle-form-rules="handleFormRules"
      :field-value-formatter="fieldValueFormatter"
      :form-type-configs="formTypeConfigs"
      @preview-file="handlePreviewFile"
      @download-file="handleDownloadFile"
      @edit-application="handleEditApplication"
      @handle-action-change="onHandleActionChange"
      ref="applicationDetail"
    >
      <!-- 自定义处理表单插槽 -->
      <template v-slot:handle-form>
        <el-form :model="handleForm" :rules="handleFormRules" ref="handleFormRef" label-width="100px">
          <el-form-item label="处理方式" prop="action" required>
            <el-radio-group v-model="handleForm.action" @change="onHandleActionChange">
              <el-radio label="resubmit">重新提交</el-radio>
              <el-radio label="withdraw">撤回申请</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="修改说明" prop="modify_comment" v-if="handleForm.action === 'resubmit'" required>
            <el-input v-model="handleForm.modify_comment" type="textarea" :rows="3" placeholder="请说明修改的内容" maxlength="500" show-word-limit />
          </el-form-item>

          <el-form-item label="撤回原因" prop="withdraw_reason" v-if="handleForm.action === 'withdraw'" required>
            <el-input v-model="handleForm.withdraw_reason" type="textarea" :rows="3" placeholder="请说明撤回申请的原因" maxlength="500" show-word-limit />
          </el-form-item>
        </el-form>
      </template>
    </approve-header-detail>

    <template v-slot:footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
    </template>
  </vk-data-dialog>
</template>

<script>
import ApproveHeaderDetail from '@/components/approve-header-detail/approve-header-detail.vue';

export default {
  name: 'ReturnHandleDialog',
  components: {
    ApproveHeaderDetail
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '退回处理'
    },
    // 数据相关
    task: {
      type: Object,
      default: null
    },
    application: {
      type: Object,
      default: null
    },
    formSchema: {
      type: Object,
      default: null
    },
    processInfo: {
      type: Object,
      default: () => ({
        tasks: [],
        instance: null
      })
    },
    statusHistory: {
      type: Array,
      default: () => []
    },
    currentTasks: {
      type: Array,
      default: () => []
    },
    formTypeConfigs: {
      type: Object,
      default: () => ({})
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      handleForm: {
        action: 'resubmit',
        modify_comment: '',
        withdraw_reason: ''
      },
      handleFormRules: {
        action: [{
          required: true,
          message: "请选择处理方式",
          trigger: ['blur', 'change']
        }],
        modify_comment: [{
          validator: (rule, value, callback) => {
            if (this.handleForm.action === 'resubmit' && !value) {
              callback(new Error("请填写修改说明"));
            } else {
              callback();
            }
          },
          trigger: ['blur', 'change']
        }],
        withdraw_reason: [{
          validator: (rule, value, callback) => {
            if (this.handleForm.action === 'withdraw' && !value) {
              callback(new Error("请填写撤回原因"));
            } else {
              callback();
            }
          },
          trigger: ['blur', 'change']
        }]
      }
    };
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    },
    returnInfo() {
      if (!this.task) return null;
      
      return {
        returnReason: this.task.task_data ? this.task.task_data.return_reason || '未指定原因' : '未指定原因',
        returnedFrom: this.task.task_data ? this.task.task_data.returned_from || '未知环节' : '未知环节',
        returnTime: this.task.create_time,
        task: this.task
      };
    }
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.resetForm();
      }
    }
  },
  methods: {
    handleClose() {
      this.show = false;
    },
    
    handlePreviewFile(file) {
      this.$emit('preview-file', file);
    },
    
    handleDownloadFile(file) {
      this.$emit('download-file', file);
    },
    
    handleEditApplication() {
      this.$emit('edit-application');
    },
    
    onHandleActionChange(action) {
      this.$emit('handle-action-change', action);
    },
    
    async handleSubmit() {
      try {
        // 验证表单
        await this.$refs.handleFormRef.validate();
        
        const submitData = {
          task_id: this.task._id,
          action: this.handleForm.action,
          modify_comment: this.handleForm.modify_comment,
          withdraw_reason: this.handleForm.withdraw_reason
        };
        
        this.$emit('submit', submitData);
      } catch (error) {
        console.error('表单验证失败:', error);
      }
    },
    
    resetForm() {
      this.handleForm = {
        action: 'resubmit',
        modify_comment: '',
        withdraw_reason: ''
      };
      
      if (this.$refs.handleFormRef) {
        this.$refs.handleFormRef.clearValidate();
      }
    },
    
    // 字段值格式化函数
    fieldValueFormatter(fieldName, value, field) {
      // 特殊字段格式化
      if (fieldName === 'copies' && value !== null && value !== undefined) {
        return `${value} 份`;
      }
      
      // 日期字段格式化
      if ((fieldName === 'expected_date' || fieldName.includes('date')) && value) {
        return this.formatDate(value, 'yyyy-MM-dd');
      }
      
      return undefined; // 返回 undefined 让组件使用默认格式化
    },
    
    formatDate(timestamp, formatStr) {
      if (!timestamp) return '-';
      const vk = uni.vk;
      return vk.pubfn.timeFormat(timestamp, formatStr || 'yyyy-MM-dd hh:mm:ss');
    }
  }
};
</script>

<style lang="scss" scoped>
// 样式继承自 application-detail-dialog
</style>