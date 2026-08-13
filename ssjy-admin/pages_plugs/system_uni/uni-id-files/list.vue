<template>
	<div class="page-body">
		<!-- 页面内容开始 -->
		<div class="header">
			<div class="header-item" style="margin-left:0;">
				<el-dropdown split-button type="primary" size="small" trigger="hover" placement="bottom-start" :show-timeout="0" @click="uploadFile" @command="uploadCommand">
					<vk-data-icon name="el-icon-plus" :size="12"></vk-data-icon>
					<span style="margin-left: 5px;">上传</span>
				  <el-dropdown-menu slot="dropdown">
				    <el-dropdown-item command="local-file">上传本地文件</el-dropdown-item>
				    <el-dropdown-item command="remote-file" :disabled="queryForm1.formData.type === 'other'" divided>上传远程文件</el-dropdown-item>
				  </el-dropdown-menu>
				</el-dropdown>
			</div>
			<div class="header-item">
				<el-button type="success" :round="false" size="small" icon="el-icon-video-play" @click="startSlideshow" :disabled="data.content.rows.length === 0"> 幻灯片播放 </el-button>
			</div>
			<div class="header-item">
				<el-radio-group v-model="queryForm1.formData.type" size="small" @change="getList">
					<el-radio-button label="image">图片</el-radio-button>
					<el-radio-button label="video">视频</el-radio-button>
					<el-radio-button label="other">其他</el-radio-button>
				</el-radio-group>
			</div>
			<div class="header-item">
				<el-input class="search-input input-border-radius-4004" size="small" type="text" clearable placeholder="请输入名称搜索..." v-model="queryForm1.formData.display_name" @keyup.enter.native="getList" @clear="getList" />
				<el-button type="primary" :loading="loading.main" :round="false" size="small" icon="el-icon-search" @click.stop="getList" style="border-radius: 0 4px 4px 0;" ></el-button>
			</div>
			<div class="header-item">
				<el-input class="search-input input-border-radius-4004" size="small" type="text" clearable placeholder="请输入URL搜索..." v-model="queryForm1.formData.url" @keyup.enter.native="getList" @clear="getList" />
				<el-button type="primary" :loading="loading.main" :round="false" size="small" icon="el-icon-search" @click.stop="getList" style="border-radius: 0 4px 4px 0;" ></el-button>
			</div>
		</div>
		<div class="nav" v-loading="loading.nav">
			<div class="add-group" @click.stop="vk.pubfn.openForm('addCategory')">添加分组</div>
			<div
				class="nav-list"
				v-for="(item, index) of data.navList" :key="item._id"
				:class="queryForm1.formData.category_id == item._id ? 'selected-nav' : ''"
				@click.stop="queryByCategory(item._id)"
			>
				<span class="nav-name text-one">{{ item.name }}</span>
				<div class="nav-btn">
					<div v-if="index > 1" class="btn el-icon-edit" @click.stop="vk.pubfn.openForm('updateCategory', { item })" ></div>
					<el-popconfirm v-if="index > 1" title="确定删除该分组吗？（组内图片不会删除）" @confirm="deleteCategory(item._id, index)" >
						<div slot="reference" class="btn el-icon-delete" @click.stop="stop"></div>
					</el-popconfirm>
				</div>
			</div>

		</div>
		<div class="main" v-loading="loading.main">
			<!-- 内容详情 -->
			<div
				class="content-item"
				:class="[selectedIds.includes(item._id) ? 'choose-image' : '']"
				v-for="(item, index) in data.content.rows" :key="item._id"
				@click.stop="clickFile(item)"
			>
				<div class="item-file">
					<image :src="getFileUrl(item)" mode="aspectFit" v-if="item.type === 'image'" @error="imageLoadError(item)"></image>
					<div class="vk-contents" v-else-if="item.type === 'video'">
						<image :src="item | coverImageFilter" mode="aspectFit"></image>
						<div class="duration" v-if="item.duration">{{ item.duration | durationFilter }}</div>
						<div class="size">{{ item.size | sizeFilter(["B","KB","MB","GB"], 1024, 1, "MB") }}</div>
						<vk-data-icon :name="item.play ?'el-icon-video-pause':'el-icon-video-play'" size="40" color="#d9d9d9" class="video-play-btn" @click="preview(item)"></vk-data-icon>
					</div>

					<div :src="getFileUrl(item)" class="other-icon" v-else>
						<vk-data-icon name="el-icon-document" size="80" color="#d5d5de"></vk-data-icon>
						<div class="size">{{ item.size | sizeFilter(["B","KB","MB","GB"],1024,1) }}</div>
						<div class="suffix">{{ item.original_name | suffixFilter }}</div>
					</div>
				</div>
				<div class="tips">
					<span class="title">{{ item.display_name }}</span>
					<span class="operation" v-if="item.type === 'video'" @click="vk.pubfn.openForm('updateVideo', { item })">编辑</span>
					<span class="operation" v-else @click="vk.pubfn.openForm('updateFileName', { item })">改名</span>
					<el-dropdown class="operation" @command="handleCommand" trigger="hover" placement="bottom" :show-timeout="0">
						<span>链接</span>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item :command="{action: 'copy', item: item}">复制链接</el-dropdown-item>
							<el-dropdown-item :command="{action: 'preview', item: item}" v-if="queryForm1.formData.type !== 'other'">预览文件</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
					<span class="operation" @click="vk.pubfn.openForm('updateFileCategory', { item, list: data.navList })" > 分组 </span>
					<el-popconfirm title="确定删除吗？" @confirm="deleteFile(item._id)">
						<span slot="reference" class="operation" @click.stop="stop">删除</span>
					</el-popconfirm>
				</div>
			</div>
			<!-- 上传的按钮 -->
			<div class="update-img" @click.stop="uploadFile"></div>
		</div>
		<div class="footer" :class="selectedIds.length ? '' : 'no-selected'">
			<label :style="data.content.rows.length ? '' : 'pointer-events: none;'" class="footer-label" @click.stop="selectAll" >
				<checkbox style="transform: scale(0.6);" class="checkbox" :checked="selectedIds.length ? true : false" />
				<span>已选</span>
				<span class="num">{{ selectedIds.length }} / {{ data.content.rows.length }}</span>
				<span>项</span>
			</label>
			<span class="footer-item" @click.stop=" vk.pubfn.openForm('updateFileCategory', { item: { _id: selectedIds }, list: data.navList }) " >
				保存到组
			</span>
			<el-popconfirm title="确定删除吗？" @confirm="deleteFile(selectedIds)" >
				<span slot="reference" class="footer-item">删除</span>
			</el-popconfirm>
			<!-- 底部分页内容 -->
			<el-pagination
				class="paging"
				background
				:total="data.content.total"
				:current-page="queryForm1.pageIndex"
				:page-size="queryForm1.pageSize"
				:page-sizes="[50, 100]"
				:pager-count="5"
				layout="total, sizes, prev, pager, next, jumper"
				@size-change=" val => { queryForm1.pageSize = val; getList(); } "
				@current-change=" val => { queryForm1.pageIndex = val; getList(); } "
			></el-pagination>
		</div>
		<!-- 页面内容结束 -->

		<!-- 弹窗列表 -->
		<addCategory v-model="formDatas.addCategory" @success="getNavList"></addCategory>
		<updateCategory v-model="formDatas.updateCategory"></updateCategory>
		<updateFileCategory v-model="formDatas.updateFileCategory" @success="getList();selectedIds = [];"></updateFileCategory>
		<updateFileName v-model="formDatas.updateFileName"></updateFileName>
		<updateVideo v-model="formDatas.updateVideo"></updateVideo>
		<uploadProgress v-model="formDatas.uploadProgress" @success="getList();"></uploadProgress>
		<uploadRemoteFile v-model="formDatas.uploadRemoteFile" @success="getList();"></uploadRemoteFile>
		<slideShow v-model="formDatas.slideShow"></slideShow>

	</div>
</template>

<script>
	let that; // 当前页面对象
	let vk = uni.vk; // vk实例

	import addCategory from "./form/addCategory";
	import updateCategory from "./form/updateCategory";
	import updateFileCategory from "./form/updateFileCategory";
	import updateFileName from "./form/updateFileName";
	import updateVideo from "./form/updateVideo";
	import uploadProgress from "./form/uploadProgress";
	import uploadRemoteFile from "./form/uploadRemoteFile";
	import slideShow from "./form/slideShow";

	export default {
		components: {
			addCategory,
			updateCategory,
			updateFileCategory,
			updateFileName,
			updateVideo,
			uploadProgress,
			uploadRemoteFile,
			slideShow
		},
		data() {
			// 页面数据变量
			return {
				// 选中的
				selectedIds: [],
				// 页面是否请求中或加载中
				loading: {
					nav: false,
					main: false
				},
				// init请求返回的数据
				data: {
					// 分组列表
					navList: [],
					// 文件数据
					content: {
						rows: [],
						total: 0
					}
				},
				// 查询表单
				queryForm1: {
					pageIndex: 1,
					pageSize: 50,
					formData: {
						display_name: "",
						category_id: "",
						type: "image"
					},
					columns: [
						{ key: "display_name", title: "名称", type: "text", mode: "%%" },
						{ key: "url", title: "URL", type: "text", mode: "=" },
						{ key: "category_id", title: "分类id", type: "text", mode: "=" },
						{ key: "type", title: "文件类型", type: "text", mode: "=" }
					]
				},
				formDatas: {},
				fileMap: {},
				failedImageIds: [], // 收集失败的图片ID
				getTempFileURLTimer: null, // 防抖定时器
			};
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options = {}) {
			that = this;
			vk = that.vk;
			that.options = options;
			that.init(options);
		},
		// 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
		onReady() {},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {},
		// 函数
		methods: {
			// 页面数据初始化函数
			init(options) {
				that.getNavList();
				that.getList();
			},
			// 获取文件列表
			getList() {
				let { queryForm1, selectedIds } = that;
				vk.callFunction({
					url: "admin/system_uni/uni-id-files/files/kh/getList",
					loading: { that, name: "loading.main" },
					data: queryForm1,
					success: data => {
						that.data.content = data;
						selectedIds.length = 0;
					}
				});
			},
			// 获取分类列表
			getNavList() {
				vk.callFunction({
					url: "admin/system_uni/uni-id-files/categories/kh/getList",
					loading: { that, name: "loading.nav" },
					data: {
						pageIndex: 1,
						pageSize: 1000
					},
					success: data => {
						that.data.navList = [{ _id: "", name: "全部" }, { _id: "null", name: "未分组" }, ...data.rows];
					}
				});
			},
			// 查询指定分类下的文件列表
			queryByCategory(category_id) {
				if (that.queryForm1.formData.category_id != category_id) {
					that.queryForm1.formData.category_id = category_id;
					that.getList();
				}
			},
			// 删除分组
			deleteCategory(_id, index) {
				vk.callFunction({
					url: "admin/system_uni/uni-id-files/categories/sys/delete",
					loading: { that, name: "loading.nav" },
					data: {
						_id
					},
					success: data => {
						that.data.navList.splice(index, 1);
					}
				});
			},
			// 删除
			deleteFile(ids) {
				vk.callFunction({
					url: "admin/system_uni/uni-id-files/files/sys/delete",
					title: "请求中...",
					data: {
						_id: ids
					},
					success: data => {
						if (data.num > 0) {
							if (typeof ids !== "object") ids = [ids];
							ids.map(id => {
								let index = vk.pubfn.getListIndex(that.data.content.rows, "_id", id);
								if (index > -1) {
									that.data.content.rows.splice(index, 1);
								}
							});
							that.selectedIds = [];
						}
					}
				});
			},
			uploadCommand(name) {
				switch (name) {
					case "local-file":
						this.uploadFile();
						break;
					case "remote-file":
						// 检查当前分类是否支持远程文件
						if (this.queryForm1.formData.type === "other") {
							this.$message.warning("其他分类不支持远程文件上传");
							return;
						}
						this.openRemoteFileUpload();
						break;
					default:
						break;
				}
			},
			uploadFile() {
				let type = that.queryForm1.formData.type;
				let fileType;
				let extension = [];
				if (type === "image") {
					extension = ["jpg", "jpeg", "gif", "png", "svg", "webp", "jfif", "bmp", "dpg"];
					fileType = "image";
				} else if (type === "video") {
					extension = ["mp4", "mpg", "mpeg", "dat", "asf", "avi", "rm", "rmvb", "mov", "wmv", "flv", "mkv", "m3u8", "3gp", "mp3"];
					fileType = "video";
				} else if (type === "other") {
					extension = ["txt", "pdf", "xls", "xlsx", "ppt", "pptx", "doc", "docx", "rar", "zip"];
				}
				uni.chooseFile({
					extension,
					count: 100000,
					success: async res => {
						let item = {
							tempFilePaths: res.tempFilePaths,
							tempFiles: res.tempFiles,
							categoryId: that.queryForm1.formData.category_id,
							fileType
						};
						vk.pubfn.openForm("uploadProgress", { item });
					}
				});
			},
			// 复制文件的URL
			copyFileUrl(data) {
				uni.setClipboardData({
					data,
					success: res => {
						that.$message({
							message: "URL已复制",
							type: "success"
						});
					}
				});
			},
			// 预览
			preview(item) {
				let { type } = item;
				if (type === "image" || type === "video") {
					// 直接进入幻灯片模式，关闭自动播放
					this.startSlideshowFromItem(item, false);
				} else {
					vk.toast("暂不支持该类型文件的预览");
				}
			},
			// 处理下拉菜单命令
			handleCommand(command) {
				let { action, item } = command;
				if (action === 'copy') {
					this.copyFileUrl(this.getFileUrl(item));
				} else if (action === 'preview') {
					this.preview(item);
				}
			},
			// 点击了文件
			clickFile(item) {
				let index = that.selectedIds.indexOf(item._id);
				if (index > -1) {
					that.selectedIds.splice(index, 1);
				} else {
					that.selectedIds.push(item._id);
				}
			},
			// 全选
			selectAll() {
				if (that.selectedIds.length && that.data.content.rows.length == that.selectedIds.length) {
					that.selectedIds = [];
				} else {
					that.data.content.rows.forEach((value, index, arr) => {
						if (!that.selectedIds.includes(value._id)) {
							that.selectedIds.push(value._id);
						}
					});
				}
			},
			stop() {},
			getTempFileURL(ids) {
				let that = this;
				vk.callFunction({
					url: 'admin/system_uni/uni-id-files/files/sys/getTempFileURL',
					needAlert: false,
					data: {
						ids
					},
					success: (data) => {
						let { fileList = [] } = data;
						let fileMap = fileList.reduce((acc, item, index) => {
							acc[item.fileID] = item.tempFileURL;
							acc[ids[index]] = item.tempFileURL;
							return acc;
						}, {});
						that.fileMap = Object.assign({}, that.fileMap, fileMap);

						// 强制更新视图，让失败的图片重新加载
						that.$forceUpdate();
					}
				});
			},
			getFileUrl(id) {
				if (typeof id === "object" && id.file_id) {
					let url = this.fileMap[id.file_id] || this.fileMap[id.url] || id.url;
					return url;
				} else {
					let url = this.fileMap[id] || id;
					return url;
				}
			},
			imageLoadError(item) {
				if (item.tempFileURL) {
					this.$set(this.fileMap, item.file_id, item.tempFileURL);
					this.$set(this.fileMap, item.url, item.tempFileURL);
					return;
				}

				// 收集失败的图片ID
				if (!this.failedImageIds.includes(item.file_id)) {
					this.failedImageIds.push(item.file_id);
				}
				if (!this.failedImageIds.includes(item.url)) {
					this.failedImageIds.push(item.url);
				}

				// 使用防抖，延迟执行批量获取
				this.debouncedGetTempFileURL();
			},
			// 防抖方法，延迟执行批量获取
			debouncedGetTempFileURL() {
				if (this.getTempFileURLTimer) {
					clearTimeout(this.getTempFileURLTimer);
				}

				this.getTempFileURLTimer = setTimeout(() => {
					if (this.failedImageIds.length > 0) {
						this.getTempFileURL([...this.failedImageIds]);
						this.failedImageIds = []; // 清空已处理的ID
					}
				}, 50);
			},
			// 开始幻灯片播放
			startSlideshow() {
				// 过滤出图片和视频文件
				let mediaFiles = this.data.content.rows.filter(item => item.type === 'image' || item.type === 'video');
				if (mediaFiles.length === 0) {
					this.$message.warning('没有可播放的图片或视频文件');
					return;
				}

				// 如果有选中的文件，从选中的开始播放
				let startIndex = 0;
				if (this.selectedIds.length > 0) {
					let firstSelected = this.selectedIds[0];
					let selectedIndex = mediaFiles.findIndex(item => item._id === firstSelected);
					if (selectedIndex > -1) {
						startIndex = selectedIndex;
					}
				}

				// 为每个文件添加临时URL
				mediaFiles.forEach(item => {
					item.tempFileURL = this.getFileUrl(item);
				});
				vk.pubfn.openForm("slideShow", {
					fileList: mediaFiles,
					currentIndex: startIndex,
					autoPlay: true
				});
			},
			// 从指定文件开始幻灯片播放
			startSlideshowFromItem(item, autoPlay = true) {
				// 过滤出图片和视频文件
				let mediaFiles = this.data.content.rows.filter(file => file.type === 'image' || file.type === 'video');
				if (mediaFiles.length === 0) {
					this.$message.warning('没有可播放的图片或视频文件');
					return;
				}

				// 找到指定文件在媒体文件列表中的索引
				let startIndex = mediaFiles.findIndex(file => file._id === item._id);
				if (startIndex === -1) {
					// 如果指定文件不在当前列表中，从第一张开始
					startIndex = 0;
				}

				// 为每个文件添加临时URL
				mediaFiles.forEach(file => {
					file.tempFileURL = this.getFileUrl(file);
				});

				vk.pubfn.openForm("slideShow", {
					fileList: mediaFiles,
					currentIndex: startIndex,
					autoPlay: autoPlay
				});
			},

			// 打开远程文件上传弹窗
			openRemoteFileUpload() {
				// 获取当前分类名称
				let currentCategoryName = "全部";
				if (this.queryForm1.formData.category_id) {
					let category = this.data.navList.find(item => item._id === this.queryForm1.formData.category_id);
					if (category) {
						currentCategoryName = category.name;
					}
				} else if (this.queryForm1.formData.category_id === "null") {
					currentCategoryName = "未分组";
				}

				vk.pubfn.openForm("uploadRemoteFile", {
					item: {
						currentType: this.queryForm1.formData.type,
						currentCategory: this.queryForm1.formData.category_id,
						currentCategoryName: currentCategoryName
					}
				});
			}
		},
		watch: {},
		// 过滤器
		filters: {
			suffixFilter(name = "") {
				let arr = name.split(".");
				return arr[arr.length - 1];
			},
			coverImageFilter(item) {
				let src = "";
				let { cover_image, url, width = 0, height = 0 } = item;
				if (cover_image) {
					src = cover_image;
				} else {
					let aliyun = `x-oss-process=video/snapshot,t_1000,f_jpg,w_${width},h_${height},m_fast`;
					let qiniu = `vframe/jpg/offset/1/w/${width}/h/${height}`;
					src = url;
					src += src.indexOf("?") === -1 ? "?" : "&";
					src += `${aliyun}&${qiniu}`;
				}
				return src;
			},
			durationFilter(value) {
				let result = parseInt(value);
				let h = Math.floor(result / 3600) < 10 ? "0" + Math.floor(result / 3600) : Math.floor(result / 3600);
				let m = Math.floor((result / 60) % 60) < 10 ? "0" + Math.floor((result / 60) % 60) : Math.floor((result / 60) % 60);
				let s = Math.floor(result % 60) < 10 ? "0" + Math.floor(result % 60) : Math.floor(result % 60);
				return `${h}:${m}:${s}`;
			}
		},
		// 计算属性
		computed: {}
	};
</script>
<style lang="scss" scoped>
	page,
	.page-body {
		width: 100%;
		height: 100%;
	}

	// 页面主体内容区域
	.page-body {
		display: grid;
		grid-template-columns: 180px auto;
		grid-template-rows: 35px auto 40px;
		grid-gap: 8px 0px;
		position: relative;
	}

	.header {
		display: flex;
		align-items: center;
		grid-column: 1 / -1;
		font-size: 14px;
		user-select: none;

		.el-button {
			height: 32px;
		}
	}

	// 搜索
	.header-item {
		margin-left: 20px;
		height: 100%;
		display: flex;
		border-radius: 4px;
		overflow: hidden;

		.search-input {
			width: 200px;
		}

		.el-button {
			height: 32px;
		}
	}

	.nav {
		height: 100%;
		grid-row: 2 / -1;
		border: 1px solid #e4e2e2;
		display: grid;
		grid-template-rows: repeat(auto-fill, 40px);
		color: #59607b;
		font-size: 12px;
		overflow-y: auto;
		box-sizing: border-box;
		padding-bottom: 10px;
	}

	.nav-list {
		cursor: pointer;
		border-bottom: 1px solid #e4e2e2;
		box-sizing: border-box;
		height: 40px;
		overflow: hidden;
		transition: all 0.3s;
		background-color: #f6f4f4;
		padding-left: 10px;
		display: flex;
		align-items: center;

		>i {
			font-size: 13px;
			place-self: center;
		}

		&:hover {
			color: #108ee9;
		}

		.nav-name {
			flex: 1;
		}

		.nav-btn {
			width: 44px;
			display: flex;
			align-items: center;

			.btn {
				width: 22px;
				display: block;
			}
		}
	}

	// 选中的分栏
	.selected-nav {
		background-color: #ecf6fd !important;
		color: #108ee9 !important;
	}

	// 添加分组的按钮
	.add-group {
		width: 60%;
		margin: 5px auto;
		padding: 5px 0px;
		text-align: center;
		border: 1px dashed #108ee9;
		color: #108ee9;
		cursor: pointer;
	}

	.add-group:hover {
		background-color: #108ee9;
		color: #ffffff;
		opacity: 0.9;
	}

	.add-group:active {
		background-color: #108ee9;
		color: #ffffff;
	}

	// 内容详情
	.main {
		display: grid;
		grid-template-columns: repeat(auto-fill, 135px);
		grid-template-rows: repeat(auto-fill, 180px);
		grid-gap: 20px;
		place-content: start center;
		overflow-y: auto;
		min-width: 700px;
	}

	.update-img,
	.content-item {
		width: 135px;
		height: 180px;
		border: 1px solid #e4e2e2;
		cursor: pointer;
		background-color: transparent;
		transition: all 0.25s;
		position: relative;
		overflow: hidden;
	}

	// 被选中的
	.choose-image {
		background-color: #ecf6fd !important;
		border: 1px solid #daedff;

		.tips {
			background-color: #ecf6fd;
		}
	}

	.content-item:hover {
		background-color: #ecf6fd;
		border: 1px solid #daedff;
	}

	.item-file {
		width: 100%;
		height: 150px;
		position: relative;

		image {
			width: 100%;
			height: 100%;
		}

		.suffix {
			position: absolute;
			top: 2px;
			right: 6px;
			font-size: 12px;
			color: #a7a7a7;
		}

		.duration {
			position: absolute;
			bottom: 0px;
			left: 0px;
			font-size: 12px;
			color: #ffffff;
			background-color: #b2b2b2;
			padding: 0px 2px;
		}

		.size {
			position: absolute;
			bottom: 0px;
			right: 0px;
			font-size: 12px;
			color: #ffffff;
			background-color: #b2b2b2;
			padding: 0px 2px;
		}

		.video-play-btn {
			position: absolute;
			top: 54px;
			left: 47px;
			background-color: rgba(66, 66, 66, 0.6);
			border-radius: 50%;
		}

		.other-icon {
			display: flex;
			width: 100%;
			height: 100%;
			justify-content: center;
			align-items: center;
		}
	}

	.content-item:hover>.tips {
		transform: translateY(0%) !important;
	}

	// 上传按钮
	.update-img {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		color: #d5d5de;

		&::before {
			line-height: 1;
			font-size: 45px;
			content: "+";
		}

		&::after {
			content: "上传";
			font-size: 12px;
		}
	}

	.tips {
		position: absolute;
		height: 60px;
		right: 0px;
		bottom: 0px;
		left: 0px;
		background-color: #fff;
		transition: all 0.4s;
		transform: translateY(50%);
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(2, 1fr);
		grid-gap: 5px 0px;
		font-size: 13px;
		place-items: center;
	}

	.title {
		text-align: center;
		grid-column: 1 / -1;
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.operation {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			color: #108ee9;
		}
	}

	// 保存到组、删除、下载链接
	.footer {
		background-color: #f4faff;
		display: flex;
		align-items: center;
		font-size: 12px;
		color: #3091f2;
	}

	.paging {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.footer-item {
		padding: 2px 9px;
		border: 1px solid #3091f2;
		margin-left: 8px;
		cursor: pointer;
		background-color: #ffffff;
	}

	.no-selected {
		.footer-item {
			pointer-events: none;
			color: #ced0d5;
			background-color: #fff;
			border-color: #ebeef5 !important;
		}
	}

	.footer-label {
		display: flex;
		align-items: center;
		user-select: none;
		color: #59607b;

		.checkbox {
			margin: 0;
			padding: 0;
			outline: none;
		}
	}

	.num {
		min-width: 50px;
		text-align: center;
		margin: 0 10px;
		color: #3091f2;
	}

	::v-deep .input-border-radius-4004 .el-input__inner {
		border-radius: 4px 0px 0px 4px;
	}
</style>
