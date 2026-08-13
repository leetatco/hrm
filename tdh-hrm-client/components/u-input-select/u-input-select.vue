<template>
	<view class="u-input-select">
		<u-input type="select" v-model="inputValue" :placeholder="placeholder" :disabled="disabled" :clearable="false"
			@click="openSelector">
			<template #suffix>
				<u-icon v-if="clearable && inputValue" name="close-circle-fill" size="18" color="#c0c4cc"
					@click.stop="clearInput" :custom-style="{ marginRight: '6rpx' }" />
				<u-icon name="arrow-down" size="14" color="#c0c4cc"
					:custom-style="{ transition: 'transform 0.3s', transform: popupShow ? 'rotate(180deg)' : '' }" />
			</template>
		</u-input>

		<u-popup v-model="popupShow" mode="bottom" border-radius="20" :closeable="true" safe-area-inset-bottom
			@close="onPopupClose">
			<view class="select-panel">
				<view class="panel-header">
					<text class="panel-title">{{ panelTitle }}</text>					
				</view>

				<!-- 独立搜索框，v-model 自动更新 searchText，无需手动监听 -->
				<view class="search-box" v-if="filterable">					
					<u-search placeholder="搜索..." v-model="searchText" :focus="true" :show-action="false"></u-search>
				</view>

				<!-- 使用计算属性 filteredOptions 自动过滤 -->
				<scroll-view scroll-y class="options-list">
					<view v-if="filteredOptions.length === 0" class="empty-wrapper">
						<u-empty text="暂无匹配项" mode="list" />
					</view>
					<view v-for="(item, index) in filteredOptions" :key="index" class="option-item"
						:class="{ 'option-item--selected': isSelected(item.value) }" @click="selectItem(item)">
						<text class="option-label">{{ item.label }}</text>
						<u-icon v-if="isSelected(item.value)" name="checkmark-circle" size="20" color="#2979ff" />
					</view>
				</scroll-view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		name: 'u-input-select',
		props: {
			options: {
				type: Array,
				default: () => []
			},
			placeholder: {
				type: String,
				default: '请选择'
			},
			label: {
				type: String,
				default: ''
			},
			labelWidth: {
				type: String,
				default: 'auto'
			},
			value: {
				type: [String, Number],
				default: ''
			},
			modelValue: {
				type: [String, Number],
				default: ''
			},
			clearable: {
				type: Boolean,
				default: true
			},
			disabled: {
				type: Boolean,
				default: false
			},
			filterable: {
				type: Boolean,
				default: true
			},
			panelTitle: {
				type: String,
				default: '请选择'
			}
		},
		emits: ['input', 'update:modelValue', 'change'],
		data() {
			return {
				inputValue: '',
				popupShow: false,
				selectedItem: null,
				isUpdating: false,
				searchText: '' // 只保留搜索文本，不手动维护过滤数组
			};
		},
		computed: {
			actualValue() {
				return this.modelValue !== '' ? this.modelValue : this.value;
			},
			// 计算过滤后的选项，当 searchText 或 options 变化时自动更新
			filteredOptions() {
				if (!this.filterable || !this.searchText.trim()) {
					return this.options;
				}
				const keyword = this.searchText.toLowerCase().trim();
				return this.options.filter(item =>
					item.label.toLowerCase().includes(keyword)
				);
			}
		},
		watch: {
			actualValue: {
				handler(newVal) {
					this.syncFromValue(newVal);
				},
				immediate: true
			},
			options: {
				handler() {
					// 选项变化时强制重新匹配显示文本（修复异步加载回显）
					this.syncFromValue(this.actualValue);
				},
				immediate: true,
				deep: true
			}
		},
		methods: {
			syncFromValue(val) {
				if (this.isUpdating) return;
				if (!val && val !== 0) {
					this.inputValue = '';
					this.selectedItem = null;
					return;
				}
				const valStr = String(val);
				const matched = this.options.find(item => String(item.value) === valStr);
				if (matched) {
					this.selectedItem = matched;
					this.inputValue = matched.label;
				} else {
					this.selectedItem = null;
					this.inputValue = '';
				}
			},

			openSelector() {
				if (this.disabled) return;
				// 打开弹窗时清空搜索文本，计算属性会立即显示全部选项
				this.searchText = '';
				this.popupShow = true;
			},

			// 弹窗关闭时清空搜索文本（包括点击遮罩关闭）
			onPopupClose() {
				this.searchText = '';
				this.popupShow = false;
			},

			isSelected(value) {
				return this.selectedItem && String(this.selectedItem.value) === String(value);
			},

			selectItem(item) {
				this.isUpdating = true;
				this.selectedItem = item;
				this.inputValue = item.label;
				this.popupShow = false;

				// 关闭后清空搜索文本
				this.searchText = '';

				this.$emit('input', item.value);
				this.$emit('update:modelValue', item.value);
				this.$emit('change', item);

				this.$nextTick(() => {
					this.isUpdating = false;
				});
			},

			clearInput() {
				this.isUpdating = true;
				this.inputValue = '';
				this.selectedItem = null;
				this.popupShow = false;
				this.searchText = '';

				this.$emit('input', '');
				this.$emit('update:modelValue', '');

				this.$nextTick(() => {
					this.isUpdating = false;
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	/* 样式保持不变，同之前提供的完整代码 */
	.u-input-select {
		width: 100%;
	}

	.select-panel {
		background: #fff;
		border-radius: 20rpx 20rpx 0 0;
		padding: 30rpx;

		.panel-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;

			.panel-title {
				font-size: 34rpx;
				font-weight: 600;
				color: #333;
			}
		}

		.search-box {
			margin-bottom: 20rpx;
		}

		.options-list {
			max-height: 60vh;

			.option-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 24rpx 0;
				border-bottom: 1rpx solid #f5f5f5;

				.option-label {
					font-size: 30rpx;
					color: #333;
				}

				&--selected .option-label {
					color: #2979ff;
					font-weight: 500;
				}

				&:active {
					background-color: #f9f9f9;
				}
			}
		}
	}
</style>