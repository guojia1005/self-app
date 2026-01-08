<script>
	import config from './config'
	import {
		getToken
	} from '@/utils/auth'

	export default {
		onLaunch: function() {
			
			this.initApp()
			
			// #ifdef H5
			// 延时确保页面初始化完成
			setTimeout(() => {
				this.checkLogin()
			}, 300)
			// #endif
		},
		onShow: function() {
			uni.hideTabBar()
		},
		globalData: {
			userRole: '',
			tabBar: {
				custom: true,
				list: [],
			},
		},
		methods: {
			initApp() {
				this.initConfig()
			},
			initConfig() {
				this.globalData.config = config
			},
			checkLogin() {
				const token = getToken()
				
				// 检查当前页面
				const pages = getCurrentPages()
				
				if (pages.length > 0) {
					const currentPage = pages[pages.length - 1]
				}
				
				if (!token) {
					// 直接跳转到登录页
					uni.reLaunch({
						url: '/pages/login',
					
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	@import '@/static/scss/index.scss'
</style>