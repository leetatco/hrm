<template>
  <vk-data-dialog v-model="show" :title="title" width="80%">
    <view v-if="fileData.url" class="file-preview-content">
      <!-- PDF预览 -->
      <iframe v-if="fileData.type === 'pdf'" :src="fileData.url" width="100%" height="600px"
        frameborder="0">
      </iframe>

      <!-- 图片预览 -->
      <el-image v-else-if="fileData.type === 'image'" :src="fileData.url"
        :preview-src-list="[fileData.url]" fit="contain" style="width: 100%; max-height: 600px;">
      </el-image>

      <!-- 其他文件类型 -->
      <div v-else class="unsupported-preview">
        <i class="el-icon-document" style="font-size: 48px; color: #909399;"></i>
        <p>该文件类型不支持在线预览</p>
        <el-button type="primary" @click="handleDownload">
          下载文件
        </el-button>
      </div>
    </view>
    <template v-slot:footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleDownload">下载</el-button>
    </template>
  </vk-data-dialog>
</template>

<script>
export default {
  name: 'FilePreviewDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    fileData: {
      type: Object,
      default: () => ({
        url: '',
        name: '',
        type: ''
      })
    }
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
    title() {
      return `文件预览 - ${this.fileData.name || '文件'}`;
    }
  },
  methods: {
    handleClose() {
      this.show = false;
    },
    
    handleDownload() {
      this.$emit('download', this.fileData);
    }
  }
};
</script>

<style lang="scss" scoped>
.file-preview-content {
  text-align: center;

  .unsupported-preview {
    padding: 40px 0;

    p {
      margin: 16px 0;
      color: #606266;
    }
  }
}
</style>