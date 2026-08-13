<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="filter-section">
			<view class="filter-row">
				<view class="filter-item">					
					<u-search @search="handleSearch" placeholder="请输入手机号搜索" v-model="searchMobile" :focus="true" :show-action="false"></u-search>				
				</view>
				<u-button type="primary" shape="circle" @click="addEntry" :custom-style="buttonStyle.primary">
					<u-icon name="plus" size="20" color="#fff" />
					<text class="btn-text">新建</text>
				</u-button>
			</view>
		</view>

		<!-- 骨架屏 -->
		<view class="skeleton-section" v-if="loading && !list.length">
			<view class="skeleton-item" v-for="i in 3" :key="i">
				<view class="skeleton-header">
					<view class="skeleton-title" />
					<view class="skeleton-tag" />
				</view>
				<view class="skeleton-line" />
				<view class="skeleton-line" />
				<view class="skeleton-line short" />
			</view>
		</view>

		<!-- 列表 -->
		<view class="list-section" v-else>
			<scroll-view scroll-y class="list-scroll" :refresher-enabled="true" :refresher-triggered="refreshing"
				@refresherrefresh="onPullDownRefresh" @scrolltolower="loadMore">
				<view class="list-container">
					<view class="list-item" v-for="item in list" :key="item._id">
						<view class="item-header">
							<u-icon name="account" size="32" color="#2979ff" />
							<text class="item-title">{{ item.employee_name }}</text>
						</view>

						<view class="item-content">
							<view class="info-grid">
								<view class="info-item"><text class="info-label">手机号</text><text
										class="info-value">{{ item.mobile || '-' }}</text></view>
								<view class="info-item"><text class="info-label">身份证</text><text
										class="info-value">{{ maskIdCard(item.card) }}</text></view>
								<view class="info-item"><text class="info-label">性别</text><text
										class="info-value">{{ item.gender == 1 ? '男' : '女' }}</text></view>
								<view class="info-item"><text class="info-label">年龄</text><text
										class="info-value">{{ item.age }}岁</text></view>
							</view>
							<view class="item-footer" v-if="item._add_time">
								<u-icon name="clock" size="24" color="#c0c4cc" />
								<text>{{ formatDate(item._add_time, 'yyyy-MM-dd hh:mm') }}</text>
							</view>
						</view>

						<view class="item-actions">
							<u-button type="primary" size="medium" plain @click.stop="editEntry(item)">编辑</u-button>
							<!-- <u-button type="error" size="medium" plain @click.stop="deleteEntry(item)">删除</u-button> -->
						</view>
					</view>

					<view class="empty-wrapper" v-if="!loading && list.length === 0">
						<u-empty mode="data" text="暂无入职登记记录">
							<u-button type="primary" shape="circle" @click="addEntry"
								:custom-style="buttonStyle.primary">立即新建</u-button>
						</u-empty>
					</view>

					<u-loadmore v-if="hasMore && list.length > 0" :status="loadMoreStatus" :load-text="loadText"
						@loadmore="loadMore" />
				</view>
			</scroll-view>
		</view>

		<!-- 新增/编辑弹窗 -->
		<u-popup v-model="formDialog.show" mode="bottom" border-radius="20" height="90%" :closeable="true"
			@close="closeFormDialog">
			<view class="form-dialog">
				<view class="form-header">
					<text class="form-title">{{ formDialog.title }}</text>
				</view>
				<scroll-view scroll-y style="max-height: 70vh;">
					<u-form :model="formData" ref="entryForm" label-position="left" label-width="180rpx">
						<u-form-item label="员工姓名" prop="employee_name" required>
							<u-input v-model="formData.employee_name" placeholder="请输入" />
						</u-form-item>
						<u-form-item label="身份证号" prop="card" required>
							<u-input v-model="formData.card" placeholder="请输入" @blur="onCardBlur" />
						</u-form-item>
						<u-form-item label="手机号" prop="mobile" required>
							<u-input v-model="formData.mobile" placeholder="请输入" />
						</u-form-item>
						<u-form-item label="性别" prop="gender">
							<u-radio-group v-model="formData.gender" disabled >
								<u-radio :name="1">男</u-radio>
								<u-radio :name="2">女</u-radio>
							</u-radio-group>
						</u-form-item>
						<u-form-item label="出生日期" prop="birth_date">
							<u-input v-model="formData.birth_date" disabled placeholder="自动识别" />
						</u-form-item>
						<u-form-item label="年龄" prop="age">
							<u-input v-model="formData.age" disabled placeholder="自动识别" type="number" />
						</u-form-item>
						<u-form-item label="银行卡号" prop="bank_card">
							<u-input v-model="formData.bank_card" placeholder="请输入" @blur="validateBankCard" />
						</u-form-item>
						<u-form-item label="银行名称" prop="bank_id">
							<u-input v-model="formData.bank_id_label" disabled placeholder="自动识别" />
						</u-form-item>
						<u-form-item label="开户地" prop="location_id">
							<u-input-select v-model="formData.location_id" :options="locationOptions"
								placeholder="请选择开户地" panel-title="选择开户地" clearable />
						</u-form-item>
						<u-form-item label="民族" prop="nation_id" required>
							<u-input-select v-model="formData.nation_id" :options="nationOptions" placeholder="请选择民族"
								panel-title="选择民族" clearable />
						</u-form-item>
						<u-form-item label="学历" prop="educational_id" required>
							<u-select v-model="selectVisible.edu" :list="eduOptions"
								@confirm="(e) => onSelectConfirm(e, 'educational_id')" />
							<u-input v-model="formData.educational_id_label" type="select" placeholder="请选择学历"
								@click="selectVisible.edu = true" />
						</u-form-item>
						<u-form-item label="住宿" prop="stay" required>
							<u-radio-group v-model="formData.stay">
								<u-radio :name="1">是</u-radio>
								<u-radio :name="2">否</u-radio>
							</u-radio-group>
						</u-form-item>
						<u-form-item label="身份证有效期" prop="expiration_date" required>
							<u-input v-model="formData.expiration_date" placeholder="例如 2025-12-31" />
						</u-form-item>
						<u-form-item label="户口所在地" prop="card_location" required>
							<u-input v-model="formData.card_location" type="textarea" />
						</u-form-item>
						<u-form-item label="紧急联系人" prop="emergency_contact" required>
							<u-input v-model="formData.emergency_contact" />
						</u-form-item>
						<u-form-item label="联系人电话" prop="emergency_mobile" required>
							<u-input v-model="formData.emergency_mobile" />
						</u-form-item>
						<u-form-item label="婚姻状况" prop="marital_status" required>
							<u-radio-group v-model="formData.marital_status">
								<u-radio :name="1">已婚</u-radio>
								<u-radio :name="2">未婚</u-radio>
							</u-radio-group>
						</u-form-item>
						<u-form-item label="无犯罪证明" prop="no_crime" required>
							<u-radio-group v-model="formData.no_crime">
								<u-radio :name="1">有</u-radio>
								<u-radio :name="2">无</u-radio>
							</u-radio-group>
						</u-form-item>
						<u-form-item label="备注" prop="comment">
							<u-input v-model="formData.comment" type="textarea" />
						</u-form-item>

						<!-- 头像上传 - 替换为 uni-file-picker -->
						<u-form-item label="头像" prop="avatar">
							<uni-file-picker 
								v-model="avatarFileList" 
								:auto-upload="true" 								 
								:limit="1" 
								file-mediatype="image" 
								:max-size="1*1024*1024" 
								@success="onAvatarSuccess" 
								@delete="onAvatarRemove" 
								@fail="onFileUploadFail"
								:dir="avatarDir"
							>
								<view class="custom-upload-btn">
									<u-icon name="camera" size="28" color="#2979ff" />
									<text class="btn-text">上传头像</text>
								</view>
							</uni-file-picker>
						</u-form-item>

						<!-- 证明文件：使用 uni-file-picker 并集成 file-preview-dialog -->
						<u-form-item label="证明文件" prop="file_attachments">
							<view class="file-upload-container">
								<uni-file-picker v-model="attachFiles"
									file-mediatype=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" :auto-upload="true" :limit="9"
									:response-format="responseFormat" @success="onAttachSuccess" :dir="fileDir"
									@delete="onAttachRemove" @fail="onFileUploadFail">
									<view class="custom-upload-btn">
										<u-icon name="plus" size="28" color="#2979ff" />
										<text class="btn-text">选择文件</text>
									</view>
								</uni-file-picker>

								<view class="file-list" v-if="attachFiles.length">
									<view class="file-item" v-for="(file, index) in attachFiles"
										:key="file.uuid || index">
										<view class="file-info" @click="previewFile(file)">
											<u-icon name="file-text" size="30" color="#2979ff" />
											<text
												class="file-name">{{ file.name || getFileNameFromUrl(file.url) }}</text>
										</view>
									</view>
								</view>
							</view>
						</u-form-item>
					</u-form>
				</scroll-view>
				<view class="popup-btns">
					<u-button @click="closeFormDialog">取消</u-button>
					<u-button type="primary" @click="submitForm" :loading="submitting">保存</u-button>
				</view>
			</view>
		</u-popup>

		<!-- 文件预览弹窗 -->
		<file-preview-dialog :value="filePreview.show" :file-data="filePreview.data"
			@filePreviewClose="filePreviewClose" @download-file="downloadFile" />
	</view>
</template>

<script>
	import uInputSelectVue from '@/components/u-input-select/u-input-select.vue';
	import FilePreviewDialog from '@/components/file-preview-dialog/file-preview-dialog.vue';

	export default {
		components: {
			uInputSelectVue,
			FilePreviewDialog
		},
		data() {
			return {				
				buttonStyle: {
					primary: {
						height: '64rpx',
						padding: '0 24rpx'
					}
				},				
				searchMobile: '',
				list: [],
				loading: false,
				refreshing: false,
				pagination: {
					pageIndex: 1,
					pageSize: 10,
					total: 0
				},
				hasMore: true,
				loadMoreStatus: 'loadmore',
				loadText: {
					loadmore: '点击加载更多',
					loading: '正在加载...',
					nomore: '没有更多了'
				},
				avatarDir:'/entry-forms/avatar',
				fileDir:'/entry-forms/file',
				// 弹窗
				formDialog: {
					show: false,
					title: ''
				},
				formData: {
					stay: 1,
					marital_status: 2,
					no_crime: 2,
					employee_name: '',
					card: '',
					mobile: '',
					gender: 1,
					age: '',
					birth_date: '',
					birth_month: '',
					bank_card: '',
					bank_id: '',
					bank_id_label: '',
					location_id: '',
					nation_id: '',
					educational_id: '',
					educational_id_label: '',
					expiration_date: '',
					card_location: '',
					emergency_contact: '',
					emergency_mobile: '',
					comment: '',
					avatar: '',
					file_attachments: []
				},
				formRules: {
					employee_name: {
						required: true,
						message: '请输入员工姓名'
					},
					card: [{
							required: true,
							message: '请输入身份证号'
						},
						{
							validator: vk.pubfn.validator('card'),
							message: '身份证格式错误',
							trigger: 'blur'
						}
					],
					mobile: [{
							required: true,
							message: '请输入手机号'
						},
						{
							validator: vk.pubfn.validator('mobile'),
							message: '手机号格式错误',
							trigger: 'blur'
						}
					],
					nation_id: {
						required: true,
						message: '请选择民族'
					},
					educational_id: {
						required: true,
						message: '请选择学历'
					},
					stay: {
						required: true,
						message: '请选择住宿'
					},
					expiration_date: {
						required: true,
						message: '请输入身份证有效期'
					},
					card_location: {
						required: true,
						message: '请输入户口所在地'
					},
					emergency_contact: {
						required: true,
						message: '请输入紧急联系人'
					},
					emergency_mobile: [{
							required: true,
							message: '请输入紧急联系人电话'
						},
						{
							validator: vk.pubfn.validator('mobile'),
							message: '手机号格式错误',
							trigger: 'blur'
						}
					],
					marital_status: {
						required: true,
						message: '请选择婚姻状况'
					},
					no_crime: {
						required: true,
						message: '请选择无犯罪证明'
					}
				},
				submitting: false,
				avatarFileList: [],   // 头像文件列表（uni-file-picker 用）
				attachFiles: [],      // 证明文件列表
				selectVisible: {
					location: false,
					nation: false,
					edu: false
				},
				genderOptions: [{
					value: 1,
					label: '男'
				}, {
					value: 2,
					label: '女'
				}],
				bankOptions: [],
				locationOptions: [],
				nationOptions: [],
				eduOptions: [],
				// 文件预览相关
				filePreview: {
					show: false,
					data: {
						url: '',
						name: '',
						type: '',
						size: 0,
						createTime: null
					}
				}
			};
		},
		async onLoad() {
			await Promise.all([this.loadOptions(), this.loadList(true)])
		},
		onReady() {
			this.$refs.entryForm.setRules(this.formRules);
		},
		methods: {
			async loadOptions() {
				try {
					const [banks, locations, nations, edus] = await Promise.all([
						vk.callFunction({
							url: 'admin/hrm/bank/pub/getList',
							data: { pageSize: 1000 }
						}),
						vk.callFunction({
							url: 'admin/hrm/banklocation/pub/getList',
							data: { pageSize: 1000 }
						}),
						vk.callFunction({
							url: 'admin/hrm/nation/pub/getList',
							data: { pageSize: 1000 }
						}),
						vk.callFunction({
							url: 'admin/hrm/educational/pub/getList',
							data: { pageSize: 1000 }
						})
					]);

					if (banks.code === 0) this.bankOptions = banks.rows.map(v => ({
						value: v.bank_id,
						label: v.bank_name
					}));
					if (locations.code === 0) this.locationOptions = locations.rows.map(v => ({
						value: v.location_id,
						label: v.location_name
					}));
					if (nations.code === 0) this.nationOptions = nations.rows.map(v => ({
						value: v._id,
						label: v.name
					}));
					if (edus.code === 0) this.eduOptions = edus.rows.map(v => ({
						value: v.educational_id,
						label: v.educational_name
					}));
				} catch (err) {
					console.error('加载选项数据失败：', err);
				}
			},
			onSelectConfirm(e, fieldKey) {
				if (e && e[0]) {
					const selected = e[0];
					this.formData[fieldKey] = selected.value;
					this.formData[fieldKey + '_label'] = selected.label;
				}
				this.selectVisible[fieldKey] = false;
			},
			async loadList(reset = true) {
				if (reset) this.pagination.pageIndex = 1;
				if (reset && !this.loading) this.loading = true;
				if(vk.pubfn.isNull(this.searchMobile)) return;
				try {
					let res = await vk.callFunction({
						url: 'admin/hrm/entry-forms/pub/getList',
						title: '请求中...',
						data: {
							pageIndex: this.pagination.pageIndex,
							pageSize: this.pagination.pageSize,
							mobile: this.searchMobile || undefined
						}
					});
					this.loading = false;
					this.refreshing = false;
					if (res.code !== 0) return uni.showToast({
						title: res.message || '加载失败',
						icon: 'none'
					});
					const rows = res.rows || [];
					this.list = reset ? rows : [...this.list, ...rows];
					this.pagination.total = res.total || 0;
					this.hasMore = this.list.length < this.pagination.total;
					this.loadMoreStatus = this.hasMore ? 'loadmore' : 'nomore';
				} catch (err) {
					console.error(err);
					uni.showToast({ title: '网络错误', icon: 'none' });
					this.loading = false;
					this.refreshing = false;
				}
			},
			handleSearch() {
				this.loadList(true);
			},
			loadMore() {
				if (!this.hasMore || this.loadMoreStatus === 'loading' || this.loading) return;
				this.loadMoreStatus = 'loading';
				this.pagination.pageIndex++;
				this.loadList(false);
			},
			onPullDownRefresh() {
				this.refreshing = true;
				this.loadList(true);
			},
			maskIdCard(card) {
				if (!card) return '-';
				return card.substring(0, 6) + '********' + card.substring(card.length - 4);
			},
			formatDate(ts, fmt) {
				return vk.pubfn.timeFormat(ts, fmt);
			},
			onCardBlur() {
				const res = vk.myfn.test1(this.formData.card);
				if (res.code === 0) {
					this.formData.gender = res.data.sex;
					this.formData.age = res.data.age;
					this.formData.birth_month = res.data.month;
					this.formData.birth_date = res.data.birthday;
				}
			},
			async validateBankCard() {
				const cardNo = this.formData.bank_card;
				if (!cardNo) return;
				const res = await vk.request({
					method: 'get',
					url: 'https://ccdcapi.alipay.com/validateAndCacheCardInfo.json',
					data: { cardNo, cardBinCheck: true }
				});
				if (res.bank) {
					this.formData.bank_id = res.bank;
					const bank = this.bankOptions.find(b => b.value == res.bank);
					this.formData.bank_id_label = bank ? bank.label : res.bank;
				} else {
					uni.showToast({ title: '银行卡号不正确', icon: 'none' });
				}
			},
			addEntry() {
				this.formDialog.title = '新建入职登记';
				this.formData = {
					stay: 1,
					marital_status: 2,
					no_crime: 2,
					employee_name: '',
					card: '',
					mobile: '',
					gender: 1,
					age: '',
					birth_date: '',
					birth_month: '',
					bank_card: '',
					bank_id: '',
					bank_id_label: '',
					location_id: '',
					nation_id: '',
					educational_id: '',
					educational_id_label: '',
					expiration_date: '',
					card_location: '',
					emergency_contact: '',
					emergency_mobile: '',
					comment: '',
					avatar: '',
					file_attachments: []
				};
				this.avatarFileList = [];
				this.attachFiles = [];
				this.formDialog.show = true;
				this.$nextTick(() => {
					this.$refs.entryForm.setRules(this.formRules);
				});
			},
			editEntry(item) {
				this.formDialog.title = '编辑入职登记';
				this.formData = JSON.parse(JSON.stringify(item));
				const bank = this.bankOptions.find(b => b.value == this.formData.bank_id);
				this.formData.bank_id_label = bank ? bank.label : this.formData.bank_id;
				const edu = this.eduOptions.find(e => e.value == this.formData.educational_id);
				if (edu) this.formData.educational_id_label = edu.label;
				
				// 附件回显（证明文件）
				if (item.file_attachments && Array.isArray(item.file_attachments)) {
					this.attachFiles = item.file_attachments.map((url, index) => ({
						url,
						name: this.getFileNameFromUrl(url),
						uuid: index
					}));
				} else {
					this.attachFiles = [];
				}
				// 头像回显（uni-file-picker）
				if (this.formData.avatar) {
					this.avatarFileList = [{
						url: this.formData.avatar,
						name: this.getFileNameFromUrl(this.formData.avatar)
					}];
				} else {
					this.avatarFileList = [];
				}
				this.formDialog.show = true;
				this.$nextTick(() => {
					this.$refs.entryForm.setRules(this.formRules);
				});
			},
			async submitForm() {
				this.$refs.entryForm.validate(async valid => {
					if (!valid) return;
					this.submitting = true;
					const action = this.formData._id ? 'admin/hrm/entry-forms/pub/update' : 'admin/hrm/entry-forms/pub/add';
					const data = { ...this.formData };
					// 处理证明文件
					data.file_attachments = this.attachFiles.map(f => f.url);
					// 处理头像
					data.avatar = this.avatarFileList.length ? this.avatarFileList[0].url : '';
					// 删除不需要提交的字段
					delete data.bank_id_label;
					delete data.educational_id_label;
					delete data._add_time;
					delete data._update_time;
					const res = await vk.callFunction({ url: action, data });
					this.submitting = false;
					if (res.code === 0) {
						uni.showToast({ title: '保存成功', icon: 'success' });
						this.formDialog.show = false;
						this.loadList(true);
					} else {
						uni.showToast({ title: res.message || '保存失败', icon: 'none' });
					}
				});
			},
			deleteEntry(item) {
				uni.showModal({
					title: '提示',
					content: '确定删除该条记录吗？',
					success: async modal => {
						if (modal.confirm) {
							const res = await vk.callFunction({
								url: 'admin/hrm/entry-forms/pub/delete',
								data: { _id: item._id }
							});
							if (res.code === 0) {
								uni.showToast({ title: '删除成功' });
								this.loadList(true);
							} else {
								uni.showToast({ title: res.message, icon: 'none' });
							}
						}
					}
				});
			},
			closeFormDialog() {
				this.formDialog.show = false;
				this.$nextTick(() => {
					this.$refs.entryForm.setRules(this.formRules);
				});
			},

			// ========== 头像上传相关（uni-file-picker）==========
			onAvatarSuccess(e) {
				const { tempFiles } = e;
				if (tempFiles && tempFiles.length > 0) {
					const file = tempFiles[0];
					const url = file.url || file.path;
					this.formData.avatar = url;
					this.avatarFileList = [{
						url: url,
						name: file.name || 'avatar.jpg'
					}];
				}
			},
			onAvatarRemove(e) {
				const fileUrl = e.tempFile?.url;
				if (fileUrl) {
					vk.callFunction({
						url: 'common/pub/deleteFile/index',
						data: { fileList: [fileUrl] }
					});
				}
				this.formData.avatar = '';
				this.avatarFileList = [];
			},

			// ========== 证明文件上传相关 ==========
			responseFormat(res) {
				if (res && res.url) return { url: res.url };
				return res;
			},
			onAttachSuccess(e) {
				const { tempFiles } = e;
				if (tempFiles) {
					tempFiles.forEach(tempFile => {
						const idx = this.attachFiles.findIndex(f => f.uuid === tempFile.uuid);
						if (idx !== -1) {
							this.attachFiles[idx].url = tempFile.url || tempFile.path;
							// 美化文件名
							let rawName = tempFile.name || '';
							this.attachFiles[idx].name = this.beautifyFileName(rawName);
						}
					});
				}
			},
			onAttachRemove(e) {
				this.removeFile(e);
			},
			onFileUploadFail(err) {
				uni.showToast({ title: '上传失败', icon: 'none' });
			},
			removeFile(e) {
				const file = this.attachFiles[e.index];
				vk.myfn.deleteFile(file);
				this.attachFiles.splice(e.index, 1);
			},

			// ========== 文件预览 / 下载 ==========
			previewFile(file) {
				if (!file?.url) {
					uni.showToast({ title: '文件地址无效', icon: 'none' });
					return;
				}
				this.filePreview.data = {
					url: file.url,
					name: file.name || this.getFileNameFromUrl(file.url),
					type: this.getFileType(file),
					size: file.size || 0,
					createTime: null
				};
				this.filePreview.show = true;
			},
			downloadFile(file) {
				if (!file?.url) {
					uni.showToast({ title: '文件地址无效', icon: 'none' });
					return;
				}
				uni.downloadFile({
					url: file.url,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveFile({
								tempFilePath: res.tempFilePath,
								success: () => uni.showToast({ title: '下载成功', icon: 'success' }),
								fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
							});
						}
					},
					fail: () => uni.showToast({ title: '下载失败', icon: 'none' })
				});
			},
			filePreviewClose() {
				this.filePreview.show = false;
			},
			getFileType(file) {
				const name = file.name || '';
				if (/\.(pdf)$/i.test(name)) return 'pdf';
				if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(name)) return 'office';
				if (/\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(name)) return 'image';
				return 'other';
			},
			beautifyFileName(fileName) {
				if (!fileName) return '未知文件';
				const lastDotIndex = fileName.lastIndexOf('.');
				let nameWithoutExt = fileName;
				let ext = '';
				if (lastDotIndex > 0) {
					nameWithoutExt = fileName.substring(0, lastDotIndex);
					ext = fileName.substring(lastDotIndex);
				}
				if (nameWithoutExt.length > 20) {
					const start = nameWithoutExt.substring(0, 8);
					const end = nameWithoutExt.substring(nameWithoutExt.length - 8);
					nameWithoutExt = `${start}...${end}`;
				}
				return nameWithoutExt + ext;
			},
			getFileNameFromUrl(url) {
				if (!url) return '未知文件';
				const clean = url.split(/[?#]/)[0];
				let fileName = clean.split('/').pop() || '未知文件';
				return this.beautifyFileName(fileName);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background: #f5f7fa;
		padding-bottom: 20rpx;
	}

	.filter-section {
		background: #fff;
		padding: 24rpx 30rpx;
		margin-bottom: 16rpx;

		.filter-row {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.filter-item {
				flex: 1;
				margin-right: 20rpx;
			}
		}
	}

	.list-section {
		.list-scroll {
			height: calc(100vh - 120rpx);
		}

		.list-container {
			padding: 0 30rpx;

			.list-item {
				background: #fff;
				margin-bottom: 24rpx;
				padding: 30rpx 24rpx;
				border-radius: 24rpx;
				box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.02);

				.item-header {
					display: flex;
					align-items: center;
					margin-bottom: 20rpx;

					.item-title {
						font-size: 32rpx;
						font-weight: 600;
						margin-left: 12rpx;
					}
				}

				.item-content {
					.info-grid {
						display: flex;
						flex-wrap: wrap;

						.info-item {
							width: 50%;
							margin-bottom: 16rpx;
							display: flex;

							.info-label {
								font-size: 26rpx;
								color: #8e98a3;
								width: 120rpx;
							}

							.info-value {
								font-size: 28rpx;
								color: #1a1e25;
							}
						}
					}

					.item-footer {
						display: flex;
						justify-content: flex-end;
						align-items: center;
						gap: 6rpx;
						font-size: 24rpx;
						color: #a8b1bd;
					}
				}

				.item-actions {
					display: flex;
					justify-content: flex-end;
					margin-top: 24rpx;
					padding-top: 20rpx;
					border-top: 1rpx solid #f0f2f5;
					gap: 16rpx;
				}
			}
		}
	}

	.form-dialog {
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		padding: 0 30rpx;

		.form-header {
			padding: 36rpx 0 20rpx;
			text-align: center;
			border-bottom: 1rpx solid #f0f2f5;

			.form-title {
				font-size: 36rpx;
				font-weight: 700;
			}
		}

		::v-deep .u-form-item {
			margin-bottom: 30rpx;

			.u-form-item__body {
				flex-direction: row;
				align-items: flex-start;
			}

			.u-form-item__label {
				width: 160rpx;
				text-align: right;
				padding-right: 20rpx;
				box-sizing: border-box;
				font-size: 28rpx;
				color: #333;
				line-height: 1.4;
			}

			.u-form-item__content {
				flex: 1;
			}
		}

		::v-deep .u-radio-group {
			display: flex;
			flex-wrap: wrap;
			gap: 30rpx;
			align-items: center;

			.u-radio {
				margin-right: 0;
			}
		}

		.popup-btns {
			display: flex;
			gap: 30rpx;
			padding: 30rpx 0;
			justify-content: flex-end;
		}
	}

	/* 文件上传相关样式 - 修复文件名超出屏幕问题 */
	.file-upload-container {
		width: 100%;

		.custom-upload-btn {
			display: inline-flex;
			align-items: center;
			padding: 12rpx 24rpx;
			background: #f8f9fa;
			border: 1rpx dashed #dcdfe6;
			border-radius: 8rpx;
			margin-bottom: 20rpx;

			.btn-text {
				margin-left: 8rpx;
				font-size: 28rpx;
				color: #606266;
			}
		}

		.file-list {
			margin-top: 20rpx;

			.file-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx;
				margin-bottom: 16rpx;
				background: #f8f9fa;
				border-radius: 8rpx;
				border: 1rpx solid #e4e7ed;

				.file-info {
					display: flex;
					align-items: center;
					flex: 1;
					min-width: 0;
					overflow: hidden;

					.u-icon {
						flex-shrink: 0;
					}

					.file-name {
						flex: 1;
						min-width: 0;
						display: block;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						margin-left: 12rpx;
						font-size: 28rpx;
						color: #303133;
					}
				}
			}
		}
	}
</style>