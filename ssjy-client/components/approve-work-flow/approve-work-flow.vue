<template>
  <view class="approval-flow-container">
    <!-- 审批流程信息 -->
    <view class="detail-section" v-if="tasks && tasks.length > 0">
      <view class="section-header">
        <view class="section-title">
          <u-icon name="list-dot" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
          {{ title || '审批流程' }}
        </view>
        <view class="section-summary">
          <view class="summary-item">
            <text class="summary-label">环节总数:</text>
            <text class="summary-value">{{ tasks.length }}个</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">已完成:</text>
            <text class="summary-value completed">{{ completedTasksCount }}个</text>
          </view>
        </view>
      </view>
      
      <!-- 流程状态图例 -->
      <view class="process-legend">
        <view class="legend-item" v-for="item in legendList" :key="item.type">
          <view class="legend-dot" :class="item.type"></view>
          <text class="legend-text">{{ item.text }}</text>
        </view>
      </view>

      <!-- 横向流程步骤条 -->
      <view class="process-steps">
        <view class="process-steps-container">
          <view v-for="(task, index) in tasks" :key="task._id"
                :class="['process-step', getStepStatusClass(task)]">
            <!-- 步骤连接线 -->
            <view class="step-connector" v-if="index > 0">
              <view class="connector-line"
                    :class="getConnectorClass(tasks[index - 1], task)"></view>
            </view>
            
            <!-- 步骤圆圈 -->
            <view class="step-circle">
              <view class="step-icon-wrapper" :class="getStepStatusClass(task)">
                <u-icon :name="getStepIcon(task)" 
                        size="24" 
                        color="#ffffff"
                        :custom-style="{ lineHeight: '24px' }"></u-icon>
              </view>
              <text class="step-index">{{ index + 1 }}</text>
            </view>
            
            <!-- 步骤内容 -->
            <view class="step-content">
              <view class="step-header">
                <text class="step-name">{{ task.task_name || '审批环节' }}</text>
                <u-tag :text="getTaskStatusText(task.status)" 
                       :type="getTaskStatusType(task.status)"
                       size="mini"
                       shape="circle"></u-tag>
              </view>
              
              <view class="step-details">
                <view class="detail-item" v-if="task.assignee_name || task.assignee">
                  <u-icon name="account" size="20" color="#666"></u-icon>
                  <text class="detail-text">{{ task.assignee_name || task.assignee }}</text>
                </view>
                
                <view class="detail-item" v-if="task.complete_time">
                  <u-icon name="clock" size="20" color="#666"></u-icon>
                  <text class="detail-text">{{ formatDate(task.complete_time, 'MM-dd hh:mm') }}</text>
                </view>
                
                <view class="detail-item" v-if="task.comment">
                  <u-icon name="chat" size="20" color="#666"></u-icon>
                  <text class="detail-text">{{ task.comment }}</text>
                </view>
              </view>
              
              <!-- 操作标签 -->
              <view class="step-actions" v-if="task.actions && task.actions.length > 0">
                <view class="actions-tags">
                  <view v-for="action in task.actions" :key="action" class="action-tag">
                    <u-tag :text="getActionText(action)" 
                           :type="getActionTagType(action)"
                           size="mini"
                           shape="circle"></u-tag>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 审批记录 -->
    <view class="detail-section">
      <view class="section-header">
        <view class="section-title">
          <u-icon name="history" size="36" color="#2979ff" style="margin-right: 10rpx;"></u-icon>
          {{ historyTitle || '审批记录' }}
        </view>
      </view>
      
      <view class="approval-history">
        <!-- 时间线容器 -->
        <view class="timeline-container">
          <view v-for="(record, index) in history" :key="index"
                :class="['timeline-item', getHistoryItemClass(record)]">
            <!-- 时间线节点 -->
            <view class="timeline-node">
              <view class="node-icon" :class="getHistoryItemClass(record)">
                <u-icon :name="getHistoryIcon(record)" 
                        size="20" 
                        color="#ffffff"></u-icon>
              </view>
              <!-- 时间线连接线 -->
              <view class="timeline-connector" v-if="index < history.length - 1"></view>
            </view>
            
            <!-- 时间线内容 -->
            <view class="timeline-content">
              <view class="timeline-header">
                <view class="timeline-action">
                  <u-tag :text="getActionText(record.action)" 
                         :type="getActionType(record.action)"
                         size="mini"
                         shape="circle"></u-tag>
                </view>
                <text class="timeline-time">{{ formatDate(record.operation_time) }}</text>
              </view>
              
              <view class="timeline-body">
                <view class="timeline-row">
                  <u-icon name="account" size="20" color="#666" style="margin-right: 8rpx;"></u-icon>
                  <text class="timeline-text">操作人: {{ record.operator_name || '未知' }}</text>
                </view>
                
                <view class="timeline-row" v-if="record.task_name">
                  <u-icon name="list-dot" size="20" color="#666" style="margin-right: 8rpx;"></u-icon>
                  <text class="timeline-text">环节: {{ record.task_name }}</text>
                </view>
                
                <view class="timeline-row" v-if="record.comment">
                  <u-icon name="chat" size="20" color="#666" style="margin-right: 8rpx;"></u-icon>
                  <text class="timeline-text">意见: {{ record.comment }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 创建记录 -->
          <view class="timeline-item timeline-create" v-if="history.length === 0 && createRecord">
            <view class="timeline-node">
              <view class="node-icon timeline-create">
                <u-icon name="plus-circle" size="20" color="#ffffff"></u-icon>
              </view>
            </view>
            
            <view class="timeline-content">
              <view class="timeline-header">
                <view class="timeline-action">
                  <u-tag text="创建申请" type="info" size="mini" shape="circle"></u-tag>
                </view>
                <text class="timeline-time">{{ formatDate(createRecord.create_time) }}</text>
              </view>
              
              <view class="timeline-body">
                <view class="timeline-row">
                  <u-icon name="account" size="20" color="#666" style="margin-right: 8rpx;"></u-icon>
                  <text class="timeline-text">操作人: {{ createRecord.operator_name || '未知' }}</text>
                </view>
                
                <view class="timeline-row" v-if="createRecord.comment">
                  <u-icon name="chat" size="20" color="#666" style="margin-right: 8rpx;"></u-icon>
                  <text class="timeline-text">{{ createRecord.comment || '创建申请' }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view class="empty-state" v-if="history.length === 0 && !createRecord">
            <u-empty mode="list" icon="http://cdn.uviewui.com/uview/empty/list.png">
              <text slot="text">暂无审批记录</text>
            </u-empty>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ApproveWorkFlow',
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    history: {
      type: Array,
      default: () => []
    },
    createRecord: {
      type: Object,
      default: null
    },
    title: {
      type: String,
      default: '审批流程'
    },
    historyTitle: {
      type: String,
      default: '审批记录'
    },
    formatDateFn: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      legendList: [
        { type: 'completed', text: '已完成' },
        { type: 'current', text: '当前环节' },
        { type: 'waiting', text: '待处理' },
        { type: 'rejected', text: '已驳回' },
        { type: 'cancelled', text: '已取消' }
      ]
    };
  },
  computed: {
    completedTasksCount() {
      if (!this.tasks) return 0;
      return this.tasks.filter(task =>
        task.status === 'completed' && task.action !== 'reject'
      ).length;
    },
    pendingTasksCount() {
      if (!this.tasks) return 0;
      return this.tasks.filter(task => task.status === 'pending').length;
    },
    waitingTasksCount() {
      if (!this.tasks) return 0;
      return this.tasks.filter(task => task.status === 'waiting').length;
    }
  },
  methods: {
    formatDate(timestamp, formatStr) {
      if (this.formatDateFn) {
        return this.formatDateFn(timestamp, formatStr);
      }
      if (!timestamp) return '-';
      
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      if (formatStr === 'MM-dd hh:mm') {
        return `${month}-${day} ${hours}:${minutes}`;
      }
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    getStepStatusClass(task) {
      const status = task.status;
      const action = task.action;

      if (action === 'reject') {
        return 'step-rejected';
      }

      if (status === 'completed') {
        return 'step-completed';
      } else if (status === 'pending') {
        return 'step-current';
      } else if (status === 'waiting') {
        return 'step-waiting';
      } else if (status === 'cancelled') {
        return 'step-cancelled';
      }

      return 'step-waiting';
    },

    getStepIcon(task) {
      const status = task.status;
      const action = task.action;

      if (action === 'reject') {
        return 'close-circle';
      }

      if (status === 'completed') {
        return 'checkmark-circle';
      } else if (status === 'pending') {
        return 'clock';
      } else if (status === 'waiting') {
        return 'time';
      } else if (status === 'cancelled') {
        return 'close';
      }

      return 'time';
    },

    getConnectorClass(prevTask, currentTask) {
      const prevStatus = this.getStepStatusClass(prevTask);
      const currentStatus = this.getStepStatusClass(currentTask);

      if (prevStatus === 'step-completed' && currentStatus === 'step-completed') {
        return 'connector-completed';
      } else if (prevStatus === 'step-completed' && currentStatus !== 'step-completed') {
        return 'connector-partial';
      } else {
        return 'connector-waiting';
      }
    },

    getHistoryItemClass(record) {
      const action = record.action;
      if (action === 'approve') {
        return 'history-approve';
      } else if (action === 'reject') {
        return 'history-reject';
      } else if (action === 'return') {
        return 'history-return';
      } else if (action === 'create') {
        return 'history-create';
      }
      return 'history-default';
    },

    getHistoryIcon(record) {
      const action = record.action;
      if (action === 'approve') {
        return 'checkmark-circle';
      } else if (action === 'reject') {
        return 'close-circle';
      } else if (action === 'return') {
        return 'arrow-left';
      } else if (action === 'create') {
        return 'plus-circle';
      } else if (action === 'transfer') {
        return 'arrow-right';
      }
      return 'list-dot';
    },

    getTaskStatusType(status) {
      const typeMap = {
        'pending': 'warning',
        'completed': 'success',
        'cancelled': 'info',
        'transferred': 'info',
        'waiting': 'info'
      };
      return typeMap[status] || 'info';
    },

    getTaskStatusText(status) {
      const textMap = {
        'pending': '待处理',
        'completed': '已完成',
        'cancelled': '已取消',
        'transferred': '已转办',
        'waiting': '等待中'
      };
      return textMap[status] || status;
    },

    getActionType(action) {
      const typeMap = {
        'create': 'info',
        'approve': 'success',
        'reject': 'error',
        'return': 'warning',
        'transfer': 'info',
        'complete': 'success',
        'claim': 'warning',
        'withdraw': 'info'
      };
      return typeMap[action] || 'info';
    },

    getActionText(action) {
      const textMap = {
        'approve': '同意',
        'reject': '驳回',
        'return': '退回',
        'transfer': '转办',
        'delegate': '委托',
        'create': '创建',
        'complete': '完成',
        'claim': '认领',
        'withdraw': '撤回'
      };
      return textMap[action] || action;
    },

    getActionTagType(action) {
      const typeMap = {
        'approve': 'success',
        'reject': 'error',
        'return': 'warning',
        'transfer': 'info',
        'delegate': 'info',
        'create': 'info',
        'complete': 'success',
        'claim': 'warning',
        'withdraw': 'info'
      };
      return typeMap[action] || 'info';
    }
  }
};
</script>

<style lang="scss" scoped>
.approval-flow-container {
  width: 100%;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

/* 详情区块 */
.detail-section {
  padding: 40rpx;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

/* 区块标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    display: flex;
    align-items: center;
  }
  
  .section-summary {
    display: flex;
    gap: 20rpx;
    
    .summary-item {
      display: flex;
      align-items: center;
      
      .summary-label {
        font-size: 24rpx;
        color: #999999;
        margin-right: 8rpx;
      }
      
      .summary-value {
        font-size: 24rpx;
        color: #333333;
        font-weight: 500;
        
        &.completed {
          color: #19be6b;
        }
      }
    }
  }
}

/* 流程图例 */
.process-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 30rpx;
  margin-bottom: 40rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  
  .legend-item {
    display: flex;
    align-items: center;
    
    .legend-dot {
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
      margin-right: 12rpx;
      
      &.completed {
        background-color: #19be6b;
        box-shadow: 0 0 0 4rpx rgba(25, 190, 107, 0.2);
      }
      
      &.current {
        background-color: #2979ff;
        box-shadow: 0 0 0 4rpx rgba(41, 121, 255, 0.2);
        animation: pulse 2s infinite;
      }
      
      &.waiting {
        background-color: #e4e7ed;
        box-shadow: 0 0 0 4rpx rgba(228, 231, 237, 0.2);
      }
      
      &.rejected {
        background-color: #fa3534;
        box-shadow: 0 0 0 4rpx rgba(250, 53, 52, 0.2);
      }
      
      &.cancelled {
        background-color: #f0ad4e;
        box-shadow: 0 0 0 4rpx rgba(240, 173, 78, 0.2);
      }
    }
    
    .legend-text {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 流程步骤 */
.process-steps {
  overflow-x: auto;
  padding-bottom: 20rpx;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .process-steps-container {
    display: flex;
    min-width: max-content;
    padding: 20rpx 0;
  }
}

.process-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 280rpx;
  position: relative;
  flex-shrink: 0;
}

/* 步骤连接线 */
.step-connector {
  position: absolute;
  left: -140rpx;
  top: 50rpx;
  width: 280rpx;
  height: 4rpx;
  z-index: 1;
  
  .connector-line {
    width: 100%;
    height: 100%;
    border-radius: 2rpx;
    
    &.connector-completed {
      background: linear-gradient(90deg, #19be6b, #19be6b);
    }
    
    &.connector-partial {
      background: linear-gradient(90deg, #19be6b, #e4e7ed);
    }
    
    &.connector-waiting {
      background: #e4e7ed;
    }
  }
}

/* 步骤圆圈 */
.step-circle {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
  
  .step-icon-wrapper {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12rpx;
    
    &.step-completed {
      background-color: #19be6b;
      box-shadow: 0 8rpx 24rpx rgba(25, 190, 107, 0.3);
    }
    
    &.step-current {
      background-color: #2979ff;
      box-shadow: 0 8rpx 24rpx rgba(41, 121, 255, 0.3);
    }
    
    &.step-waiting {
      background-color: #e4e7ed;
      box-shadow: 0 8rpx 24rpx rgba(228, 231, 237, 0.3);
    }
    
    &.step-rejected {
      background-color: #fa3534;
      box-shadow: 0 8rpx 24rpx rgba(250, 53, 52, 0.3);
    }
    
    &.step-cancelled {
      background-color: #f0ad4e;
      box-shadow: 0 8rpx 24rpx rgba(240, 173, 78, 0.3);
    }
  }
  
  .step-index {
    font-size: 24rpx;
    color: #999999;
    font-weight: 500;
  }
}

/* 步骤内容 */
.step-content {
  width: 100%;
  padding: 24rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  text-align: center;
  
  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .step-name {
      font-size: 28rpx;
      font-weight: 500;
      color: #333333;
      flex: 1;
      text-align: left;
    }
  }
  
  .step-details {
    margin-bottom: 16rpx;
    
    .detail-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .detail-text {
        font-size: 24rpx;
        color: #666666;
        line-height: 1.4;
        margin-left: 12rpx;
        text-align: left;
        flex: 1;
        word-break: break-all;
      }
    }
  }
  
  .step-actions {
    .actions-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;
      justify-content: flex-start;
      
      .action-tag {
        ::v-deep .u-tag {
          font-size: 22rpx;
          padding: 4rpx 16rpx;
        }
      }
    }
  }
}

/* 审批记录时间线 */
.approval-history {
  .timeline-container {
    position: relative;
    padding-left: 60rpx;
  }
}

.timeline-item {
  display: flex;
  margin-bottom: 40rpx;
  position: relative;
  
  &:last-child {
    margin-bottom: 0;
  }
}

/* 时间线节点 */
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  left: -60rpx;
  
  .node-icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    
    &.history-approve {
      background-color: #19be6b;
      box-shadow: 0 8rpx 24rpx rgba(25, 190, 107, 0.3);
    }
    
    &.history-reject {
      background-color: #fa3534;
      box-shadow: 0 8rpx 24rpx rgba(250, 53, 52, 0.3);
    }
    
    &.history-return {
      background-color: #f0ad4e;
      box-shadow: 0 8rpx 24rpx rgba(240, 173, 78, 0.3);
    }
    
    &.history-create {
      background-color: #2979ff;
      box-shadow: 0 8rpx 24rpx rgba(41, 121, 255, 0.3);
    }
    
    &.history-default {
      background-color: #909399;
      box-shadow: 0 8rpx 24rpx rgba(144, 147, 153, 0.3);
    }
  }
  
  .timeline-connector {
    width: 4rpx;
    flex: 1;
    background-color: #e4e7ed;
    margin: 12rpx 0;
    min-height: 40rpx;
  }
}

/* 时间线内容 */
.timeline-content {
  flex: 1;
  padding: 32rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  
  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .timeline-action {
      ::v-deep .u-tag {
        font-size: 24rpx;
        padding: 4rpx 20rpx;
      }
    }
    
    .timeline-time {
      font-size: 24rpx;
      color: #999999;
    }
  }
  
  .timeline-body {
    .timeline-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .timeline-text {
        font-size: 26rpx;
        color: #666666;
        line-height: 1.5;
        flex: 1;
      }
    }
  }
}

/* 创建记录样式 */
.timeline-create {
  .timeline-content {
    background-color: #f0f9ff;
    border-left: 8rpx solid #2979ff;
  }
}

/* 空状态 */
.empty-state {
  padding: 60rpx 0;
  
  ::v-deep .u-empty {
    margin: 0;
  }
}

/* 响应式设计 */
@media (max-width: 750px) {
  .detail-section {
    padding: 30rpx 20rpx;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    
    .section-summary {
      margin-top: 20rpx;
    }
  }
  
  .process-legend {
    justify-content: space-between;
    gap: 20rpx;
    
    .legend-item {
      flex: 0 0 calc(50% - 20rpx);
    }
  }
  
  .process-step {
    min-width: 240rpx;
    
    .step-connector {
      left: -120rpx;
      width: 240rpx;
    }
  }
  
  .timeline-container {
    padding-left: 40rpx;
  }
  
  .timeline-node {
    left: -40rpx;
    
    .node-icon {
      width: 50rpx;
      height: 50rpx;
    }
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .approval-flow-container {
    background-color: #1a1a1a;
  }
  
  .detail-section {
    border-bottom-color: #333333;
  }
  
  .section-header .section-title {
    color: #ffffff;
  }
  
  .process-legend {
    background-color: #2a2a2a;
    
    .legend-text {
      color: #cccccc;
    }
  }
  
  .step-content {
    background-color: #2a2a2a;
    
    .step-name {
      color: #ffffff;
    }
    
    .detail-text {
      color: #cccccc;
    }
  }
  
  .timeline-content {
    background-color: #2a2a2a;
    
    .timeline-time {
      color: #999999;
    }
    
    .timeline-text {
      color: #cccccc;
    }
  }
}
</style>