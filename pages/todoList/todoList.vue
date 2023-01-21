<template>
	<view>
		<u-toast ref="todoListToast"></u-toast>
		<u-modal :show="showModal" title="注意" content="确定删除吗？" @confirm="doDeleteTodo"></u-modal>
		<view class="add-new-button">
			<u-button @click="onClickAddNew", type="primary" :plain="true">新增待办</u-button>
		</view>
		
		<u-divider text="分割线" :dot="true"></u-divider>
		<u-list showScrollbar class="content">
			<u-list-item v-for="item in todoList" :key="item.id">
				<u-cell :title="item.content" @click="onClickTodoItem(item)">
					<u-text slot="value" :type="getLabelType(item)" :text="renderLabel(item)"></u-text>
					<u-text slot="label" type="primary" :text="renderLabelText(item)"></u-text>
					<u-button slot="icon" @click.native.stop="onDone(item.id)" size="mini" type="primary" shape="circle">done</u-button>
					<u-icon name="close" slot="right-icon" @click.native.stop="onDeleteTodo(item)" label="删除" size="10px" labelSize="10px"></u-icon>
				</u-cell>
			</u-list-item>
		</u-list>
	</view>
</template>

<script>
	import moment from 'moment';
	import Request from '@/util/request.js';
	import Record from '@/util/record.js';
	export default {
		data() {
			return {
				todoList: [],
				showModal: false,
				toDeleteRecord: {}
			}
		},
		methods: {
			async onDone(id) {
				try {
					await Request.done(id);
					this.showToast('操作成功', 'success')
				} catch(e) {
					this.showToast('未知错误', 'error')
					return
				}
				
				try {
					const resp = await Request.fetchRecords({
						hasBeenDone: false,
						listCondition: {
							orderBy: ['-_id'],
							page: 1,
							perPage: 100,
						}
					});
					this.todoList = resp.data.items;
				} catch (e) {
					this.showToast('未知错误', 'error')
					return
				}
			},
			loadMore() {
				console.log('more');
			},
			onClickTodoItem(record) {
				uni.navigateTo({
					url: `/pages/detail/detail?id=${record.id}&todoId=${record.todoId}`
				})
			},
			renderValue(record) {
				if (!record.needRemind) {
					return '';
				}
				let formattedString = '';
				if (moment().diff(record.remindAt, 'years') === 0) {
					formattedString = moment(record.remindAt).format('MM-DD HH:mm');
				} else {
					formattedString = moment(record.remindAt).format('YYYY-MM-DD HH:mm');
				}
				return formattedString;
			},
			renderLabel(record) {
				if (!record.needRemind) {
					return '无提醒';
				}
				const str = this.renderValue(record);
				if (moment().isAfter(moment(record.remindAt))) {
					return `${str}(已过期)`
				} else {
					return str;
				}
			},
			renderLabelText(record) {
				if (!record.isRepeatable) {
					return '无重复';
				}
				const type = Record.formatRepeatType(record.repeatType);
				return `每 ${record.repeatDateOffset} ${type} 重复`;
			},
			getLabelType(record) {
				if (!record.needRemind) {
					return 'info';
				}
				if (moment().isAfter(moment(record.remindAt))) {
					return 'error'
				} else {
					return 'primary'
				}
			},
			onClickAddNew() {
				uni.navigateTo({
					url: `/pages/detail/detail`
				})
			},
			onDeleteTodo(record) {
				this.toDeleteRecord = record;
				this.showModal = true;
			},
			async doDeleteTodo() {
				this.showModal = false;
				try {
					await Request.deleteTodo(this.toDeleteRecord.todoId);
					const resp = await Request.fetchRecords({
						hasBeenDone: false,
						listCondition: {
							orderBy: ['-_id'],
							page: 1,
							perPage: 100,
						}
					});
					this.todoList = resp.data.items;
				} catch(e) {
					this.showToast('未知错误', 'error')
				}
				this.toDeleteRecord = {};
			},
			async onShow() {
				try {
					const resp = await Request.fetchRecords({
						hasBeenDone: false,
						listCondition: {
							orderBy: ['-_id'],
							page: 1,
							perPage: 100,
						}
					});
					this.todoList = resp.data.items;
				} catch (e) {
					this.showToast('未知错误', 'error')
					return
				}
			},
			showToast(message, type) {
				this.$refs.todoListToast.show({
					message: message,
					type: type,
					duration: 1000
				})
			}
		}
	}
</script>

<style>
.add-new-button {
	margin-top: 30rpx;
	margin-right: 100rpx;
	margin-left: 100rpx;
}
</style>
