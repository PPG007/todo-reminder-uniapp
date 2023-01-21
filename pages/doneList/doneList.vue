<template>
	<view class="u-page">
		<u-toast ref="doneListToast"></u-toast>
		<u-list showScrollbar>
			<u-list-item v-for="item in doneRecords" :key="item.id">
				<u-cell :title="item.content" @click="onClickDoneRecord(item)" :label="renderLabel(item.doneAt, '完成于')" :value="renderRemindAt(item)">
					<u-button slot="icon" @click.native.stop="onUndo(item.id)" size="mini" type="primary" shape="circle">undo</u-button>
				</u-cell>
			</u-list-item>
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
			}
		},
		methods: {
			async onUndo(id) {
				try {
					await Request.undo(id);
					const resp = await Request.fetchRecords({
						hasBeenDone: true,
						listCondition: {
							orderBy: ['-_id'],
							page: 1,
							perPage: 100,
						}
					});
					console.log(resp);
					this.doneRecords = resp.data.items;
				} catch (e) {
					console.log(e);
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
			loadMore() {
				console.log('more');
			},
			onClickDoneRecord(record) {
				uni.navigateTo({
					url: `/pages/detail/detail?id=${record.id}&todoId=${record.todoId}`
				})
			},
			renderLabel(t, prefix) {
				let formattedString = '';
				if (moment().diff(t, 'years') === 0) {
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
				try {
					const resp = await Request.fetchRecords({
						hasBeenDone: true,
						listCondition: {
							orderBy: ['-_id'],
							page: 1,
							perPage: 100,
						}
					});
					this.doneRecords = resp.data.items;
				} catch (e) {
					this.showToast('未知错误', 'error')
					return
				}
			},
			showToast(message, type) {
				this.$refs.doneListToast.show({
					message: message,
					type: type,
					duration: 1000
				})
			}
		}
	}
</script>

<style>

</style>
