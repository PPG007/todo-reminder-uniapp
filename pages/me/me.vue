<template>
	<view class="me">
		<view class="account">
			<u-avatar icon="account"></u-avatar>
			<u-text :text="userId" type="primary"></u-text>
		</view>
		
		<view class="logout">
			<u-button type="error" @click="onLogout">登出</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			onLogout() {
				try{
					uni.clearStorageSync();
				} catch (e) {
					
				}
				uni.reLaunch({
					url: '/pages/login/login'
				})
			}
		},
		computed: {
			userId: {
				get() {
					return '123';
				}
			}
		}
	}
</script>

<style scoped>
.me{
	margin-top: 300rpx;
}
.logout{
	margin-top: 200rpx;
	margin-right: 50rpx;
	margin-left: 50rpx;
}
.account{
	margin-right: 50rpx;
	margin-left: 50rpx;
	display: flex;
	flex-direction: row;
}
</style>
