<template>
	<view>
		<u-toast ref="uToast"></u-toast>
		<u-loading-page :loading="loading"></u-loading-page>
		<u-form labelAlign="center" labelWidth="auto" labelPosition="top" class="login">
			<u-form-item label="账号" :required="true">
				<u-input v-model="userId" prefixIcon="account" placeholder="账号" :clearable="true"></u-input>
			</u-form-item>
			<u-form-item label="密码" :required="true">
				<u-input v-model="password" :password="true" prefixIcon="lock" placeholder="密码" :clearable="true"></u-input>
			</u-form-item>
			<u-form-item>
				<u-button type="primary" size="large" @click="onClickLogin">登录</u-button>
			</u-form-item>
			<u-form-item>
				<u-button type="primary" size="large" :throttleTime="2000" :plain="true" @click="onClickDefaultPassword">获取密码</u-button>
			</u-form-item>
		</u-form>
	</view>
</template>

<script>
	import Request from '@/util/request.js';
	export default {
		data() {
			return {
				userId: '',
				password: '',
				loading: false
			}
		},
		methods: {
			async onClickLogin() {
				if (this.userId.trim() === "") {
					this.showToast('账号不能为空', 'error')
					return
				}
				if (this.password.trim() === "") {
					this.showToast('密码不能为空', 'error')
					return
				}
				try {
					const resp = await Request.login({
						userId: this.userId,
						password: this.password
					});
					uni.setStorageSync('token', resp.data.token);
					uni.setStorageSync('userId', this.userId);
					uni.$u.http.setConfig((config) => {
						config.header = {
							'x-access-token': resp.data.token,
						}
						return config;
					})
				} catch(e) {
					this.showToast('账号或密码错误', 'error')
					return
				}
				this.showToast('登录成功', 'success')
				uni.switchTab({
					url: '../todoList/todoList'
				})
			},
			async onClickDefaultPassword() {
				if (this.userId.trim() === "") {
					this.showToast('账号不能为空', 'error')
					return
				}
				try {
					await Request.getPassword(this.userId);
				} catch(e) {
					this.showToast('账号不存在', 'error')
					return
				}
			},
			showToast(message, type) {
				this.$refs.uToast.show({
					message: message,
					type: type,
					duration: 1000
				})
			},
			async onReady() {
				this.loading = true;
				try {
					await Request.validToken();
				} catch(e) {
					this.loading = false
					this.showToast('请先登录', 'info');
					return;
				}
				this.loading = false;
				uni.switchTab({
					url: '../todoList/todoList'
				})
			}
		}
	}
</script>

<style scoped>
.login{
	margin-top: 200rpx;
	margin-left: 50rpx;
	margin-right: 50rpx;
}
.u-button{
	width: 500rpx;
}
</style>
