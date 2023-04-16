<template>
	<view>
		<u-toast ref="todoListToast"></u-toast>
		<u-modal :show="showModal" title="注意" content="确定删除吗？" @confirm="doDeleteTodo"></u-modal>
		<u-sticky bgColor="#ffffff">
			<view class="add-new-button">
				<u-button @click="onClickAddNew", type="primary" :plain="true">新增待办</u-button>
			</view>
			<u-divider text="分割线" :dot="true"></u-divider>
		</u-sticky>
		
		<u-list showScrollbar class="content">
			<u-skeleton :rows="perPage" :loading="isLoading" :rowsHeight="40" :title="false"></u-skeleton>
			<u-list-item v-for="item in todoList" :key="item.id">
				<u-cell :title="formatContent(item.content)" @click="onClickTodoItem(item)">
					<u-text slot="value" :type="getLabelType(item)" :text="renderLabel(item)"></u-text>
					<u-text slot="label" type="primary" :text="renderLabelText(item)"></u-text>
					<u-button slot="icon" @click.native.stop="onDone(item.id)" size="mini" type="primary" shape="circle">done</u-button>
					<u-icon name="close" slot="right-icon" @click.native.stop="onDeleteTodo(item)" label="删除" size="10px" labelSize="10px"></u-icon>
				</u-cell>
			</u-list-item>
			<u-loadmore :status="loadStatus" :line="true" :nomoreText="noMoreText" :loadmoreText="loadMoreText" :loadingText="loadingText"  @loadmore="loadMore"/>
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
				toDeleteRecord: {},
				page: 1, 
				perPage: 10,
				orderBy: ['-createdAt'],
				loadStatus: 'loadmore',
				loadMoreText: '点击加载更多',
				noMoreText: '没有更多了',
				loadingText: '加载中',
				isLoading: false,
				total: 0,
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
							orderBy: this.orderBy,
							page: this.page,
							perPage: this.perPage,
						}
					});
					this.todoList = resp.data.items;
				} catch (e) {
					this.showToast('未知错误', 'error')
					return
				}
			},
			async loadMore() {
				if (this.isLoading) {
					return;
				}
				this.loadStatus = 'loading';
				if (this.todoList.length >= this.total) {
					this.loadStatus = 'nomore';
					return;
				}
				try {
					const resp = await Request.fetchRecords({
						listCondition: {
							orderBy: this.orderBy,
							page: this.page+1,
							perPage: this.perPage,
						}
					});
					this.todoList.push(...resp.data.items);
					if (this.todoList.length >= this.total) {
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
				if (moment().year() == moment(record.remindAt).year()) {
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
					await this.init();
				} catch(e) {
					this.showToast('未知错误', 'error')
				}
				this.toDeleteRecord = {};
			},
			async onShow() {
				await this.init();
			},
			showToast(message, type) {
				this.$refs.todoListToast.show({
					message: message,
					type: type,
					duration: 1000
				})
			},
			async init() {
				this.isLoading = true;
				this.page = 1;
				this.todoList = [];
				try {
					const resp = await Request.fetchRecords({
						hasBeenDone: false,
						listCondition: {
							orderBy: this.orderBy,
							page: this.page,
							perPage: this.perPage,
						}
					});
					this.todoList = resp.data.items;
					this.total = resp.data.total;
				} catch (e) {
					this.showToast('未知错误', 'error')
					return
				} finally {
					this.isLoading = false;
				}
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
.add-new-button {
	margin-top: 30rpx;
	margin-right: 100rpx;
	margin-left: 100rpx;
}
</style>
