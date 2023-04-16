<template>
	<view class="u-page">
		<u-toast ref="doneListToast"></u-toast>
		<u-list showScrollbar>
			<u-skeleton :rows="perPage" :loading="isLoading" :rowsHeight="40" :title="false"></u-skeleton>
			<u-list-item v-for="item in doneRecords" :key="item.id">
				<u-cell :title="formatContent(item.content)" @click="onClickDoneRecord(item)" :label="renderLabel(item.doneAt, '完成于')" :value="renderRemindAt(item)">
					<u-button slot="icon" @click.native.stop="onUndo(item.id)" size="mini" type="primary" shape="circle">undo</u-button>
				</u-cell>
			</u-list-item>
			<u-loadmore :status="loadStatus" :line="true" :nomoreText="noMoreText" :loadmoreText="loadMoreText" :loadingText="loadingText"  @loadmore="loadMore"/>
		</u-list>
	</view>
</template>

<script>
	import moment from 'moment';
	import Request from '@/util/request.js';
	export default {
		data() {
			return {
				doneRecords: [],
				total: 0,
				page: 1,
				perPage: 10,
				orderBy: ['-createdAt'],
				loadStatus: 'loadmore',
				loadMoreText: '点击加载更多',
				noMoreText: '没有更多了',
				loadingText: '加载中',
				isLoading: false,
			}
		},
		methods: {
			async onUndo(id) {
				try {
					await Request.undo(id);
					await this.init();
				} catch (e) {
					this.showToast('未知错误', 'error')
					return
				}
			},
			notifySuccess() {
				this.$refs.toast.show({
					type: 'success',
					message: '已完成',
					icon: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
					duration: 1000,
				})
			},
			async init() {
				this.page = 1;
				this.doneRecords = [];
				this.total = 0;
				this.isLoading = true;
				try {
					const resp = await Request.fetchRecords({
						hasBeenDone: true,
						listCondition: {
							orderBy: this.orderBy,
							page: this.page,
							perPage: this.perPage,
						}
					});
					this.doneRecords = resp.data.items;
					this.total = resp.data.total;
				} catch (e) {
					this.showToast('未知错误', 'error')
					return
				} finally {
					this.isLoading = false;
				}
			},
			async loadMore() {
				if (this.isLoading) {
					return;
				}
				this.loadStatus = 'loading';
				if (this.doneRecords.length >= this.total) {
					this.loadStatus = 'nomore';
					return;
				}
				try {
					const resp = await Request.fetchRecords({
						hasBeenDone: true,
						listCondition: {
							orderBy: this.orderBy,
							page: this.page+1,
							perPage: this.perPage,
						}
					});
					this.doneRecords.push(...resp.data.items);
					if (this.doneRecords.length >= this.total) {
						this.loadStatus = 'nomore';
					}
					this.page++;
				} catch (e) {
					this.showToast('未知错误', 'error')
					return
				} finally {
					this.loadStatus = 'loadmore';
				}
			},
			onClickDoneRecord(record) {
				uni.navigateTo({
					url: `/pages/detail/detail?id=${record.id}&todoId=${record.todoId}`
				})
			},
			renderLabel(t, prefix) {
				let formattedString = '';
				if (moment().year() == moment(t).year()) {
					formattedString = moment(t).format('MM-DD HH:mm');
				} else {
					formattedString = moment(t).format('YYYY-MM-DD HH:mm');
				}
				return `${prefix} ${formattedString}`
			},
			renderRemindAt(record) {
				if (!record.needRemind) {
					return '无提醒';
				}
				return this.renderLabel(record.remindAt, '')
			},
			async onShow() {
				await this.init();
			},
			showToast(message, type) {
				this.$refs.doneListToast.show({
					message: message,
					type: type,
					duration: 1000
				})
			},
			formatContent(content) {
				const sub = content.substr(0, 10);
				if (sub == content) {
					return sub;
				}
				return `${sub}...`;
			}
		}
	}
</script>

<style>

</style>
