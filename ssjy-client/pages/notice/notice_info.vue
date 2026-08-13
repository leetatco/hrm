<template>
	<view class="bg">
		<view class="info">
			<view class="info_title">{{info.title}}</view>
			<view class="info_content" v-html="info.content"></view>
			<view class="info_date">{{info.publish_date}}</view>
		</view>
		<view class="tip">已显示全部</view>
	</view>
</template>

<script>
	import { timeFormat } from '@/utils/dateUtils.js';
	export default {
		data() {
			return {
				info:{}
				}
			},
			onLoad: function (option) { 
				this.getNoticeInfo(option.id)
			},
			methods:{
				getNoticeInfo(id){
					uni.showLoading({
						title:'请稍等...'
					})
					uniCloud.callFunction({
							name: 'get',
							data: {
								name: 'noticeInfoGet',
								data: id
							}
						}).then((res) => {
							this.info=res.result.data[0]
							this.info.publish_date=timeFormat(res.result.data[0].publish_date, "yyyy-MM-dd hh:mm:ss")
							uni.hideLoading()
					})
				}
			}
		}
</script>

<style>
	.bg{
		background-color: #FAFAFA;
		width: 100%;
	}
	.info{
		background-color: #fff;
	}
	.info_title{
		font-size: 17px;
		font-weight: bold;
		color: #333;
		padding: 17px 0;
		margin: 0 14px;
		border-bottom: 1px solid #e3e4e5;
	}
	.info_content{
		padding:  14px;
		font-size: 15px;
		color: #666;
	}
	.info_date{
		color: #999999;
		font-size: 13px;
		padding: 25px 14px 22px;
	}

</style>
