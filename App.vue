<script>
	export default {
		onLaunch: function() {
			const token = uni.getStorageSync('token')
			uni.$u.http.setConfig((config) => {
				config.baseURL = 'http://101.42.32.192:80';
				config.responseType = 'json';
				config.sslVerify = false;
				config.header = {
					'x-access-token': token,
				}
				return config;
			})
			
			
		},
		onShow: function() {
		
		},
		onHide: function() {
			
		}
	}
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-ui/index.scss";
</style>